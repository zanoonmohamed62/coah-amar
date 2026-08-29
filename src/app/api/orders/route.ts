import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createOrderSchema } from "@/lib/validations";
import { OrderStatus, PaymentMethod } from "@prisma/client";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { createPayPalOrder, isPayPalConfigured } from "@/lib/paypal";

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

  const isPaypal = paymentMethod === "PAYPAL";

  // PayPal is verified-payment only — no order is created until we know PayPal can
  // actually take the customer to checkout. InstaPay and Telda are both manual
  // (screenshot + admin review), same as each other.
  if (isPaypal && !isPayPalConfigured()) {
    return NextResponse.json({ error: "PayPal is not available right now. Please choose InstaPay or Telda." }, { status: 503 });
  }

  // Find existing user by email
  const existingUser = await db.user.findUnique({ where: { email: email.toLowerCase() } });

  const order = await db.order.create({
    data: {
      userId: existingUser?.id ?? null,
      productId,
      orderRef,
      amount: product.price,
      currency: product.currency,
      paymentMethod: paymentMethod as PaymentMethod,
      status: isPaypal ? OrderStatus.PENDING : OrderStatus.AWAITING_CONFIRMATION,
      isRenewal,
      customerName: name,
      customerEmail: email.toLowerCase(),
      customerPhone: phone,
      customerGoal: goal,
      customerNotes: notes,
      customerLevel: level,
    },
  });

  // Invalidate admin stats cache since a new order was placed
  try {
    const { redis } = await import("@/lib/redis");
    await redis.del("admin:stats");
  } catch {}

  let approvalUrl: string | undefined;

  if (isPaypal) {
    try {
      const { NEXT_PUBLIC_APP_URL } = process.env;
      const appUrl = NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
      const result = await createPayPalOrder({
        orderRef,
        productType: product.type,
        productName: product.name,
        returnUrl: `${appUrl}/checkout/return?orderRef=${orderRef}`,
        cancelUrl: `${appUrl}/checkout/return?orderRef=${orderRef}&cancelled=1`,
      });
      approvalUrl = result.approvalUrl;
    } catch (err) {
      console.error("createPayPalOrder failed:", err);
      await db.order.update({ where: { orderRef }, data: { status: OrderStatus.FAILED } });
      return NextResponse.json({ error: "Could not start PayPal checkout. Please try again." }, { status: 502 });
    }
  } else {
    // InstaPay / Telda — manual: ask the customer to confirm payment on WhatsApp.
    try {
      const { sendOrderConfirmationEmail } = await import("@/lib/email");
      await sendOrderConfirmationEmail({
        to: email, name, orderRef,
        productName: product.name,
        amount: String(product.price / 100),
        paymentMethod,
      });
    } catch (err) {
      console.error("sendOrderConfirmationEmail failed:", err);
    }
  }

  return NextResponse.json(
    { order, product, approvalUrl },
    {
      status: 201,
      headers: { "X-RateLimit-Remaining": String(remaining) },
    }
  );
}

export async function GET(req: NextRequest) {
  const orderRef = req.nextUrl.searchParams.get("orderRef");
  if (!orderRef) return NextResponse.json({ error: "orderRef is required" }, { status: 400 });

  const order = await db.order.findUnique({
    where: { orderRef },
    select: { orderRef: true, status: true, confirmedAt: true, product: { select: { name: true, type: true } } },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  return NextResponse.json({ order });
}
