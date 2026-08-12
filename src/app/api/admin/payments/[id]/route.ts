import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { OrderStatus, EntitlementStatus, Role, ProductType } from "@prisma/client";
import bcrypt from "bcryptjs";

type Params = { params: Promise<{ id: string }> };

// Legacy endpoint — kept for compatibility, now delegates to order confirm
export async function PUT(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  // id here is an order id
  const order = await db.order.findUnique({ where: { id }, include: { product: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const body = await req.json();
  const action = body.action || "confirm";

  if (action === "reject") {
    await db.order.update({ where: { id }, data: { status: OrderStatus.FAILED } });
    return NextResponse.json({ success: true });
  }

  if (order.status === OrderStatus.CONFIRMED) return NextResponse.json({ success: true });

  let tempPassword: string | null = null;

  await db.$transaction(async tx => {
    await tx.order.update({ where: { id }, data: { status: OrderStatus.CONFIRMED, confirmedAt: new Date() } });

    let user = await tx.user.findUnique({ where: { email: order.customerEmail } });
    if (!user) {
      tempPassword = Math.random().toString(36).slice(-8) + "!A1";
      user = await tx.user.create({ data: { email: order.customerEmail, passwordHash: await bcrypt.hash(tempPassword, 12), name: order.customerName, phone: order.customerPhone, role: Role.CUSTOMER } });
      await tx.order.update({ where: { id }, data: { userId: user.id } });
    }

    const isCoaching = order.product.type === ProductType.PERSONAL_COACHING;
    const expiresAt = isCoaching ? new Date(Date.now() + 90 * 86400000) : null;
    await tx.entitlement.create({ data: { userId: user.id, productId: order.productId, orderId: order.id, status: EntitlementStatus.ACTIVE, startDate: new Date(), expiresAt } });
  });

  if (tempPassword) {
    try {
      const { sendAccessGrantedEmail } = await import("@/lib/email");
      await sendAccessGrantedEmail({ to: order.customerEmail, name: order.customerName, email: order.customerEmail, tempPassword, productName: order.product.name, isCoaching: order.product.type === ProductType.PERSONAL_COACHING });
    } catch {}
  }

  return NextResponse.json({ success: true });
}
