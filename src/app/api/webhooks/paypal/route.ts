import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OrderStatus, EntitlementStatus, Role, ProductType } from "@prisma/client";
import bcrypt from "bcryptjs";

async function verifyPayPal(req: NextRequest, body: string): Promise<boolean> {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_CLIENT_SECRET;
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!clientId || !secret || !webhookId) return false;
    const tokenRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials" });
    const { access_token } = await tokenRes.json();
    const verifyRes = await fetch("https://api-m.paypal.com/v1/notifications/verify-webhook-signature", { method: "POST", headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ auth_algo: req.headers.get("paypal-auth-algo"), cert_url: req.headers.get("paypal-cert-url"), transmission_id: req.headers.get("paypal-transmission-id"), transmission_sig: req.headers.get("paypal-transmission-sig"), transmission_time: req.headers.get("paypal-transmission-time"), webhook_id: webhookId, webhook_event: JSON.parse(body) }) });
    const { verification_status } = await verifyRes.json();
    return verification_status === "SUCCESS";
  } catch { return false; }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  if (process.env.NODE_ENV === "production" && !await verifyPayPal(req, rawBody)) return NextResponse.json({ error: "Invalid" }, { status: 401 });

  const event = JSON.parse(rawBody);
  if (event.event_type !== "PAYMENT.CAPTURE.COMPLETED") return NextResponse.json({ received: true });

  const capture = event.resource;
  const orderRef: string = capture.custom_id || capture.invoice_id || "";
  if (!orderRef) return NextResponse.json({ received: true });

  const order = await db.order.findUnique({ where: { orderRef }, include: { product: true } });
  if (!order || order.status === OrderStatus.CONFIRMED) return NextResponse.json({ received: true });

  let tempPassword: string | null = null;
  let userEmail = order.customerEmail;

  await db.$transaction(async tx => {
    await tx.order.update({ where: { orderRef }, data: { status: OrderStatus.CONFIRMED, confirmedAt: new Date(), gatewayRef: capture.id } });

    let user = await tx.user.findUnique({ where: { email: order.customerEmail } });
    if (!user) {
      tempPassword = Math.random().toString(36).slice(-8) + "!A1";
      user = await tx.user.create({ data: { email: order.customerEmail, passwordHash: await bcrypt.hash(tempPassword, 12), name: order.customerName, phone: order.customerPhone, role: Role.CUSTOMER } });
      await tx.order.update({ where: { orderRef }, data: { userId: user.id } });
    } else if (!user.passwordHash) {
      tempPassword = Math.random().toString(36).slice(-8) + "!A1";
      await tx.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(tempPassword, 12) } });
    }
    userEmail = user.email;

    const isCoaching = order.product.type === ProductType.PERSONAL_COACHING;
    const expiresAt = isCoaching ? new Date(Date.now() + 90 * 86400000) : null;
    await tx.entitlement.create({ data: { userId: user.id, productId: order.productId, orderId: order.id, status: EntitlementStatus.ACTIVE, startDate: new Date(), expiresAt } });
  });

  if (tempPassword) {
    try {
      const { sendAccessGrantedEmail } = await import("@/lib/email");
      await sendAccessGrantedEmail({ to: userEmail, name: order.customerName, email: userEmail, tempPassword, productName: order.product.name, isCoaching: order.product.type === ProductType.PERSONAL_COACHING });
    } catch {}
  }

  return NextResponse.json({ received: true });
}
