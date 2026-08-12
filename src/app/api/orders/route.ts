import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createOrderSchema } from "@/lib/validations";
import { OrderStatus, PaymentMethod } from "@prisma/client";

export async function POST(req: NextRequest) {
  const parsed = createOrderSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { productId, name, email, phone, paymentMethod, goal, level, notes, isRenewal, orderRef } = parsed.data;

  // Validate product exists and is active
  const product = await db.product.findUnique({ where: { id: productId, isActive: true } });
  if (!product) return NextResponse.json({ error: "Product not found or inactive" }, { status: 404 });

  // Idempotency: check if order already exists
  const existing = await db.order.findUnique({ where: { orderRef } });
  if (existing) return NextResponse.json({ order: existing }, { status: 200 });

  // Find existing user by email (could be renewal)
  const existingUser = await db.user.findUnique({ where: { email: email.toLowerCase() } });

  const order = await db.order.create({
    data: {
      userId: existingUser?.id ?? null,
      productId,
      orderRef,
      amount: product.price,
      currency: product.currency,
      paymentMethod: paymentMethod as PaymentMethod,
      status: paymentMethod === "INSTAPAY" ? OrderStatus.AWAITING_CONFIRMATION : OrderStatus.PENDING,
      isRenewal,
      customerName: name,
      customerEmail: email.toLowerCase(),
      customerPhone: phone,
      customerGoal: goal,
      customerNotes: notes,
      customerLevel: level,
    },
  });

  // Send order confirmation email
  try {
    const { sendOrderConfirmationEmail } = await import("@/lib/email");
    await sendOrderConfirmationEmail({
      to: email, name, orderRef,
      productName: product.name,
      amount: String(product.price / 100),
      paymentMethod,
    });
  } catch {}

  return NextResponse.json({ order, product }, { status: 201 });
}
