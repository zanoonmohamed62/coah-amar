import { NextRequest, NextResponse } from "next/server";
import { randomBytes, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { createOrderSchema } from "@/lib/validations";
import { OrderStatus, PaymentMethod } from "@prisma/client";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const FIELD_LABELS: Record<string, string> = {
  name: "الاسم",
  email: "البريد الإلكتروني",
  phone: "رقم الواتساب",
  productId: "المنتج",
  paymentMethod: "طريقة الدفع",
};

export async function POST(req: NextRequest) {
  // Rate limit: 5 orders per minute per IP
  const ip = getClientIp(req);
  const { allowed, remaining, reset } = await rateLimit(`orders:${ip}`, 5, 60);
  if (!allowed) return rateLimitResponse(reset);

  const parsed = createOrderSchema.safeParse(await req.json());
  if (!parsed.success) {
    // Return a plain string, never a Zod error object: the checkout pages render
    // `error` straight into JSX, and handing them an object crashes React —
    // which surfaced to customers as a blank "this page couldn't load" screen
    // instead of "check your phone number".
    const issue = parsed.error.issues[0];
    const field = typeof issue?.path?.[0] === "string" ? (issue.path[0] as string) : "";
    const raw = issue?.message ?? "البيانات المدخلة غير صحيحة";
    const label = FIELD_LABELS[field];
    // Only prefix the field name when the message doesn't already name it,
    // otherwise it reads as "رقم الواتساب: رقم الواتساب غير صحيح".
    const message = label && !raw.includes(label) ? `${label}: ${raw}` : raw;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { productId, name, email, phone, paymentMethod, goal, level, notes, isRenewal, orderRef } = parsed.data;

  // Validate product exists and is active
  const product = await db.product.findUnique({ where: { id: productId, isActive: true } });
  if (!product) return NextResponse.json({ error: "Product not found or inactive" }, { status: 404 });

  // Idempotency: check if order already exists
  const existing = await db.order.findUnique({ where: { orderRef } });
  if (existing) return NextResponse.json({ order: existing }, { status: 200 });

  // Same customer, same product, still waiting to be confirmed → hand back the
  // order they already have instead of creating a second one. orderRef alone
  // can't catch this: the checkout page mints a fresh one on every page load,
  // so a customer who leaves to pay and comes back with the browser's Back
  // button (rather than their order link) submits a brand-new ref and would
  // otherwise land a duplicate in the admin queue for the same payment.
  // Scoped to 24h so a genuine repurchase later is never blocked.
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const openOrder = await db.order.findFirst({
    where: {
      customerEmail: email.toLowerCase(),
      productId,
      status: { in: [OrderStatus.PENDING, OrderStatus.AWAITING_CONFIRMATION] },
      createdAt: { gt: dayAgo },
    },
    orderBy: { createdAt: "desc" },
  });
  if (openOrder) {
    return NextResponse.json({ order: openOrder, reused: true }, { status: 200 });
  }

  // The customer-facing order pages are reachable without a session, so their
  // access check is this token — not orderRef, which the browser generates from
  // a timestamp plus 4 characters and is therefore guessable.
  const accessToken = randomBytes(32).toString("base64url");

  // All three payment methods are manual: the customer transfers, uploads a
  // screenshot, and an admin confirms. There is no automated verification path
  // for any of them — InstaPay and Telda have no merchant API for a personal
  // handle, and PayPal was deliberately moved onto the same manual flow so
  // there is exactly one process to operate and reason about.

  // Find existing user by email
  const existingUser = await db.user.findUnique({ where: { email: email.toLowerCase() } });

  const order = await db.order.create({
    data: {
      userId: existingUser?.id ?? null,
      productId,
      orderRef,
      accessToken,
      amount: product.price,
      currency: product.currency,
      paymentMethod: paymentMethod as PaymentMethod,
      status: OrderStatus.AWAITING_CONFIRMATION,
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

  // Every method is manual, so every order gets the same email: a link back to
  // its own payment page, which is where the transfer details and the proof
  // upload live.
  try {
    const { sendOrderConfirmationEmail } = await import("@/lib/email");
    await sendOrderConfirmationEmail({
      to: email, name, orderRef, accessToken,
      productName: product.name,
      amount: String(product.price / 100),
      paymentMethod,
    });
  } catch (err) {
    console.error("sendOrderConfirmationEmail failed:", err);
  }

  return NextResponse.json(
    { order, product },
    {
      status: 201,
      headers: { "X-RateLimit-Remaining": String(remaining) },
    }
  );
}

// Status poll for the customer's own order page. Requires the order's
// accessToken: orderRef is short, client-generated and shows up in emails and
// screenshots, so on its own it can't gate customer details.
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, reset } = await rateLimit(`order-status:${ip}`, 30, 60);
  if (!allowed) return rateLimitResponse(reset);

  const orderRef = req.nextUrl.searchParams.get("orderRef");
  const token = req.nextUrl.searchParams.get("token");
  if (!orderRef) return NextResponse.json({ error: "orderRef is required" }, { status: 400 });

  const order = await db.order.findUnique({
    where: { orderRef },
    select: {
      orderRef: true,
      accessToken: true,
      status: true,
      confirmedAt: true,
      product: { select: { name: true, type: true } },
    },
  });
  // Same 404 whether the order is missing or the token is wrong, so this can't
  // be used to enumerate order refs.
  if (!order || !token || !timingSafeEqualStr(token, order.accessToken)) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { accessToken: _accessToken, ...safe } = order;
  return NextResponse.json({ order: safe });
}

function timingSafeEqualStr(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
