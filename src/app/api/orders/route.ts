import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createOrderSchema } from "@/lib/validations";
import { OrderStatus, PaymentMethod, EntitlementStatus, Role, ProductType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: 5 orders per minute per IP
  const ip = getClientIp(req);
  const { allowed, remaining, reset } = await rateLimit(`orders:${ip}`, 5, 60);
  if (!allowed) return rateLimitResponse(reset);

  const parsed = createOrderSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { productId, name, email, phone, paymentMethod, goal, level, notes, isRenewal, orderRef } = parsed.data;

  // Validate product exists and is active
  const product = await db.product.findUnique({ where: { id: productId, isActive: true } });
  if (!product) return NextResponse.json({ error: "Product not found or inactive" }, { status: 404 });

  // Idempotency: check if order already exists
  const existing = await db.order.findUnique({ where: { orderRef } });
  if (existing) return NextResponse.json({ order: existing }, { status: 200 });

  const isInstapay = paymentMethod === "INSTAPAY";
  const initialStatus = isInstapay ? OrderStatus.AWAITING_CONFIRMATION : OrderStatus.CONFIRMED;

  // Find existing user by email
  const existingUser = await db.user.findUnique({ where: { email: email.toLowerCase() } });

  let tempPassword: string | null = null;

  const order = await db.$transaction(async (tx: any) => {
    const newOrder = await tx.order.create({
      data: {
        userId: existingUser?.id ?? null,
        productId,
        orderRef,
        amount: product.price,
        currency: product.currency,
        paymentMethod: paymentMethod as PaymentMethod,
        status: initialStatus,
        confirmedAt: isInstapay ? null : new Date(),
        isRenewal,
        customerName: name,
        customerEmail: email.toLowerCase(),
        customerPhone: phone,
        customerGoal: goal,
        customerNotes: notes,
        customerLevel: level,
      },
    });

    // Auto-activate for PayPal / Telda — create account + entitlement immediately
    if (!isInstapay) {
      let activeUserId: string;

      if (!existingUser) {
        tempPassword = Math.random().toString(36).slice(-8) + "!A1";
        const newUser = await tx.user.create({
          data: {
            email: email.toLowerCase(),
            passwordHash: await bcrypt.hash(tempPassword, 12),
            name,
            phone,
            role: Role.CUSTOMER,
          },
        });
        activeUserId = newUser.id;
        await tx.order.update({ where: { orderRef }, data: { userId: newUser.id } });
      } else {
        activeUserId = existingUser.id;
        if (!existingUser.passwordHash) {
          tempPassword = Math.random().toString(36).slice(-8) + "!A1";
          await tx.user.update({ where: { id: existingUser.id }, data: { passwordHash: await bcrypt.hash(tempPassword, 12) } });
        }
      }

      const isCoaching = product.type === ProductType.PERSONAL_COACHING;
      const expiresAt = isCoaching ? new Date(Date.now() + 90 * 86400000) : null;
      const existingEnt = await tx.entitlement.findFirst({ where: { userId: activeUserId, productId } });
      if (!existingEnt) {
        await tx.entitlement.create({
          data: {
            userId: activeUserId,
            productId,
            orderId: newOrder.id,
            status: EntitlementStatus.ACTIVE,
            startDate: new Date(),
            expiresAt,
          },
        });
      }
    }

    return newOrder;
  });

  // Invalidate admin stats cache since a new order was placed
  try {
    const { redis } = await import("@/lib/redis");
    await redis.del("admin:stats");
  } catch {}

  // Send emails
  try {
    const { sendOrderConfirmationEmail, sendAccessGrantedEmail } = await import("@/lib/email");

    if (isInstapay) {
      await sendOrderConfirmationEmail({
        to: email, name, orderRef,
        productName: product.name,
        amount: String(product.price / 100),
        paymentMethod,
      });
    } else if (tempPassword) {
      await sendAccessGrantedEmail({
        to: email, name, email: email, tempPassword,
        productName: product.name,
        isCoaching: product.type === ProductType.PERSONAL_COACHING,
      });
    } else {
      await sendOrderConfirmationEmail({
        to: email, name, orderRef,
        productName: product.name,
        amount: String(product.price / 100),
        paymentMethod,
      });
    }
  } catch {}

  return NextResponse.json(
    { order, product },
    {
      status: 201,
      headers: { "X-RateLimit-Remaining": String(remaining) },
    }
  );
}
