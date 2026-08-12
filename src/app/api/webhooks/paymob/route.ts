import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { OrderStatus, EntitlementStatus, Role, ProductType } from "@prisma/client";
import crypto from "crypto";
import bcrypt from "bcryptjs";

function verify(body: Record<string, unknown>, hmac: string): boolean {
  const secret = process.env.PAYMOB_HMAC_SECRET;
  if (!secret) return false;
  const fields = ["amount_cents","created_at","currency","error_occured","has_parent_transaction","id","integration_id","is_3d_secure","is_auth","is_capture","is_refunded","is_standalone_payment","is_voided","order","owner","pending","source_data.pan","source_data.sub_type","source_data.type","success"];
  const obj = body as Record<string, unknown>;
  const str = fields.map(f => f.includes(".") ? String((obj[f.split(".")[0]] as Record<string,unknown>)?.[f.split(".")[1]] ?? "") : String(obj[f] ?? "")).join("");
  return crypto.createHmac("sha512", secret).update(str).digest("hex") === hmac;
}

async function activateOrder(orderRef: string, gatewayRef: string, gatewayData: unknown) {
  const order = await db.order.findUnique({ where: { orderRef }, include: { product: true } });
  if (!order) return;
  // Idempotency guard
  if (order.status === OrderStatus.CONFIRMED) return;

  let userId = order.userId;
  let tempPassword: string | null = null;

  await db.$transaction(async (tx: any) => {
    await tx.order.update({ where: { orderRef }, data: { status: OrderStatus.CONFIRMED, confirmedAt: new Date(), gatewayRef, gatewayData: gatewayData as never } });

    // Create/find user
    let user = userId ? await tx.user.findUnique({ where: { id: userId } }) : await tx.user.findUnique({ where: { email: order.customerEmail } });
    if (!user) {
      tempPassword = Math.random().toString(36).slice(-8) + "!A1";
      const passwordHash = await bcrypt.hash(tempPassword, 12);
      user = await tx.user.create({ data: { email: order.customerEmail, passwordHash, name: order.customerName, phone: order.customerPhone, role: Role.CUSTOMER } });
      await tx.order.update({ where: { orderRef }, data: { userId: user.id } });
    } else if (!user.passwordHash) {
      tempPassword = Math.random().toString(36).slice(-8) + "!A1";
      await tx.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(tempPassword, 12) } });
    }
    userId = user.id;

    // Grant/extend entitlement
    const isCoaching = order.product.type === ProductType.PERSONAL_COACHING;
    const expiresAt = isCoaching ? new Date(Date.now() + 90 * 86400000) : null;

    const existingEnt = await tx.entitlement.findFirst({ where: { userId: user.id, productId: order.productId, status: EntitlementStatus.ACTIVE } });
    if (existingEnt && order.isRenewal) {
      const base = existingEnt.expiresAt && existingEnt.expiresAt > new Date() ? existingEnt.expiresAt : new Date();
      await tx.entitlement.update({ where: { id: existingEnt.id }, data: { expiresAt: new Date(base.getTime() + 90 * 86400000) } });
    } else {
      await tx.entitlement.create({ data: { userId: user.id, productId: order.productId, orderId: order.id, status: EntitlementStatus.ACTIVE, startDate: new Date(), expiresAt } });
    }
  });

  if (tempPassword && userId) {
    try {
      const { sendAccessGrantedEmail } = await import("@/lib/email");
      await sendAccessGrantedEmail({ to: order.customerEmail, name: order.customerName, email: order.customerEmail, tempPassword, productName: order.product.name, isCoaching: order.product.type === ProductType.PERSONAL_COACHING });
    } catch {}
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const hmac = req.nextUrl.searchParams.get("hmac") || body.hmac;
  if (process.env.NODE_ENV === "production" && !verify(body.obj || body, hmac)) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const txn = body.obj || body;
  const success = txn.success === true || txn.success === "true";
  const orderRef: string = txn.order?.merchant_order_id || txn.merchant_order_id || "";

  if (success && orderRef) await activateOrder(orderRef, String(txn.id || ""), txn);
  else if (orderRef) await db.order.update({ where: { orderRef }, data: { status: OrderStatus.FAILED } }).catch(() => {});

  return NextResponse.json({ received: true });
}
