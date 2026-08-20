import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { OrderStatus, EntitlementStatus, Role, ProductType } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const method = searchParams.get("method");

  const orders = await db.order.findMany({
    where: {
      ...(status ? { status: status as OrderStatus } : {}),
      ...(method ? { paymentMethod: method as "INSTAPAY" | "PAYPAL" | "TELDA" } : {}),
    },
    include: { product: { select: { name: true, type: true } }, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { orderRef, action } = await req.json();
  if (!orderRef || !["confirm", "reject"].includes(action)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const order = await db.order.findUnique({ where: { orderRef }, include: { product: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (action === "reject") {
    await db.order.update({ where: { orderRef }, data: { status: OrderStatus.FAILED } });
    return NextResponse.json({ success: true });
  }

  if (order.status === OrderStatus.CONFIRMED) return NextResponse.json({ success: true, note: "Already confirmed" });

  let tempPassword: string | null = null;

  await db.$transaction(async (tx: any) => {
    await tx.order.update({ where: { orderRef }, data: { status: OrderStatus.CONFIRMED, confirmedAt: new Date() } });

    let user = await tx.user.findUnique({ where: { email: order.customerEmail } });
    if (!user) {
      tempPassword = Math.random().toString(36).slice(-8) + "!A1";
      user = await tx.user.create({ data: { email: order.customerEmail, passwordHash: await bcrypt.hash(tempPassword, 12), name: order.customerName, phone: order.customerPhone, role: Role.CUSTOMER } });
      await tx.order.update({ where: { orderRef }, data: { userId: user.id } });
    } else if (!user.passwordHash) {
      tempPassword = Math.random().toString(36).slice(-8) + "!A1";
      await tx.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(tempPassword, 12) } });
    }

    const isCoaching = order.product.type === ProductType.PERSONAL_COACHING;
    const expiresAt = isCoaching ? new Date(Date.now() + 90 * 86400000) : null;
    const existing = await tx.entitlement.findFirst({ where: { userId: user.id, productId: order.productId } });
    if (!existing) {
      await tx.entitlement.create({ data: { userId: user.id, productId: order.productId, orderId: order.id, status: EntitlementStatus.ACTIVE, startDate: new Date(), expiresAt } });
    }
  });

  if (tempPassword) {
    try {
      const { sendAccessGrantedEmail } = await import("@/lib/email");
      await sendAccessGrantedEmail({ to: order.customerEmail, name: order.customerName, email: order.customerEmail, tempPassword, productName: order.product.name, isCoaching: order.product.type === ProductType.PERSONAL_COACHING });
    } catch {}
  }

  return NextResponse.json({ success: true });
}
