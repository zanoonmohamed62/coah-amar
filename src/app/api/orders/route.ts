import { NextRequest, NextResponse } from "next/server";
import { randomBytes, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { createOrderSchema } from "@/lib/validations";
import { OrderStatus, PaymentMethod } from "@prisma/client";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { nextOrderRef } from "@/lib/order-ref";
import { publishEvent } from "@/lib/realtime";
import { notifyAdmins } from "@/lib/push";
import { pricedProduct, invalidatePricing } from "@/lib/pricing";

const FIELD_LABELS: Record<string, string> = {
  name: "الاسم",
  email: "البريد الإلكتروني",
  phone: "رقم الواتساب",
  productId: "المنتج",
  paymentMethod: "طريقة الدفع",
  proofAssetId: "صورة التحويل",
  proofClaimToken: "صورة التحويل",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRealtime(order: any, productName: string) {
  return {
    orderRef: order.orderRef,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    productName,
    amount: order.amount,
    currency: order.currency,
    paymentMethod: order.paymentMethod,
    status: order.status,
    createdAt: new Date(order.createdAt ?? Date.now()).toISOString(),
  };
}

function timingSafeEqualStr(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// Creating an order means the customer has paid and pressed Confirm.
//
// It used to mean they had clicked "Get the Split" — so every visitor who was
// merely curious landed in the admin's confirmation queue, and the real payers
// were buried among them. The screenshot is now uploaded first
// (POST /api/checkout/proof) and its claim token presented here; without one
// there is no order.
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
    // Only prefix the field name when the message does not already name it,
    // otherwise it reads as "رقم الواتساب: رقم الواتساب غير صحيح".
    const message = label && !raw.includes(label) ? `${label}: ${raw}` : raw;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const {
    productId, name, email, phone, paymentMethod,
    goal, level, notes, isRenewal,
    proofAssetId, proofClaimToken,
  } = parsed.data;

  // Validate product exists and is active, and get the price it sells at RIGHT
  // NOW — computed fresh, not from the display cache. `product.price` in the
  // database is the discounted figure; recording that directly is what would
  // have kept charging the launch price after the counter reached its limit.
  const product = await db.product.findUnique({ where: { id: productId, isActive: true } });
  if (!product) return NextResponse.json({ error: "Product not found or inactive" }, { status: 404 });
  const live = await pricedProduct(productId);
  if (!live) return NextResponse.json({ error: "Product not found or inactive" }, { status: 404 });

  // The screenshot has to be a real, unclaimed upload that this browser made.
  const proof = await db.mediaAsset.findUnique({ where: { id: proofAssetId } });
  if (!proof || !proof.claimToken || !timingSafeEqualStr(proofClaimToken, proof.claimToken)) {
    return NextResponse.json(
      { error: "صورة التحويل غير صالحة — ارفعها مرة تانية من فضلك." },
      { status: 400 }
    );
  }
  if (proof.claimedAt) {
    return NextResponse.json(
      { error: "صورة التحويل دي متسجلة على طلب تاني بالفعل — ارفع صورة جديدة." },
      { status: 400 }
    );
  }

  // Same customer, same product, still waiting to be confirmed → hand back the
  // order they already have instead of creating a second one. A customer who
  // pays, gets their number, then comes back through the browser Back button
  // and confirms again would otherwise land a duplicate in the admin queue for
  // the same payment. Scoped to 24h so a genuine repurchase later is never
  // blocked.
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
    // Their newest screenshot still wins — they may be re-uploading precisely
    // because the first one was wrong.
    const claimed = await db.$transaction(async (tx) => {
      const won = await tx.mediaAsset.updateMany({
        where: { id: proof.id, claimedAt: null },
        data: { claimedAt: new Date(), claimToken: null },
      });
      if (won.count !== 1) return false;
      await tx.order.update({ where: { id: openOrder.id }, data: { paymentProofId: proof.id } });
      return true;
    });
    if (!claimed) {
      return NextResponse.json(
        { error: "صورة التحويل دي متسجلة على طلب بالفعل — ارفع صورة جديدة." },
        { status: 400 }
      );
    }
    try {
      publishEvent({ type: "order.proof", order: toRealtime(openOrder, product.name) });
    } catch { /* an admin notification must never fail a customer order */ }
    return NextResponse.json({ order: openOrder, reused: true }, { status: 200 });
  }

  // The customer-facing order pages are reachable without a session, so their
  // access check is this token — not orderRef, which is a short human number
  // printed in emails and read out over WhatsApp.
  const accessToken = randomBytes(32).toString("base64url");

  // All three payment methods are manual: the customer transfers, uploads a
  // screenshot, and an admin confirms. There is no automated verification path
  // for any of them — InstaPay and Telda have no merchant API for a personal
  // handle, and PayPal was deliberately moved onto the same manual flow so
  // there is exactly one process to operate and reason about.

  // Find existing user by email
  const existingUser = await db.user.findUnique({ where: { email: email.toLowerCase() } });

  // The counter increment and the order live in one transaction, so a failed
  // insert does not burn an order number and leave a gap in the admin list.
  //
  // The screenshot is claimed FIRST, with a conditional update that only one
  // request can win. Checking `claimedAt` above is not enough on its own: a
  // double-tap on Confirm sends two requests that both pass that check before
  // either writes, and would otherwise create two orders for one payment.
  let order;
  try {
    order = await db.$transaction(async (tx) => {
    const won = await tx.mediaAsset.updateMany({
      where: { id: proof.id, claimedAt: null },
      data: { claimedAt: new Date(), claimToken: null, uploadedBy: existingUser?.id ?? null },
    });
    if (won.count !== 1) throw new Error("PROOF_ALREADY_CLAIMED");

    const orderRef = await nextOrderRef(product.type, tx);
    const created = await tx.order.create({
      data: {
        userId: existingUser?.id ?? null,
        productId,
        orderRef,
        accessToken,
        amount: live.price,
        currency: live.currency,
        paymentMethod: paymentMethod as PaymentMethod,
        status: OrderStatus.AWAITING_CONFIRMATION,
        isRenewal,
        customerName: name,
        customerEmail: email.toLowerCase(),
        customerPhone: phone,
        customerGoal: goal,
        customerNotes: notes,
        customerLevel: level,
        paymentProofId: proof.id,
      },
    });
    return created;
    });
  } catch (err) {
    if (err instanceof Error && err.message === "PROOF_ALREADY_CLAIMED") {
      return NextResponse.json(
        { error: "صورة التحويل دي متسجلة على طلب بالفعل — ارفع صورة جديدة." },
        { status: 400 }
      );
    }
    throw err;
  }

  // Invalidate admin stats cache since a new order was placed, and the pricing
  // cache — this order moved the promo counter, and the 100th one ends the
  // discount for everyone after it.
  try {
    const { redis } = await import("@/lib/redis");
    await redis.del("admin:stats");
  } catch {}
  await invalidatePricing();

  // Real-time: the order appears in an open admin panel immediately, and the
  // admin installed app buzzes. Neither is allowed to fail the request.
  try {
    publishEvent({ type: "order.created", order: toRealtime(order, product.name) });
  } catch {}
  void notifyAdmins({
    title: `طلب جديد · ${order.orderRef}`,
    body: `${name} — ${product.name} — ${(live.price / 100).toLocaleString("en-US")} ${live.currency}`,
    url: `/admin/orders?q=${encodeURIComponent(order.orderRef)}`,
    tag: `order-${order.orderRef}`,
  });

  // Every method is manual, so every order gets the same email: their order
  // number and a link back to its own page, where the status lives.
  try {
    const { sendOrderConfirmationEmail } = await import("@/lib/email");
    await sendOrderConfirmationEmail({
      to: email, name, orderRef: order.orderRef, accessToken,
      productName: product.name,
      amount: String(live.price / 100),
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

// Status poll for the customer's own order page. Requires the order accessToken:
// orderRef is a short human number that shows up in emails and screenshots, so
// on its own it cannot gate customer details.
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
  // Same 404 whether the order is missing or the token is wrong, so this cannot
  // be used to enumerate order refs.
  if (!order || !token || !timingSafeEqualStr(token, order.accessToken)) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { accessToken: _accessToken, ...safe } = order;
  return NextResponse.json({ order: safe });
}
