import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(_req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const [totalCustomers, activeEntitlements, pendingOrders, confirmedOrdersThisMonth, recentOrders, products] = await Promise.all([
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.entitlement.count({ where: { status: "ACTIVE" } }),
    db.order.count({ where: { status: "AWAITING_CONFIRMATION" } }),
    db.order.aggregate({
      where: { status: "CONFIRMED", confirmedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
      _sum: { amount: true },
    }),
    db.order.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { product: { select: { name: true } }, user: { select: { name: true, email: true } } } }),
    db.product.findMany({ where: { isActive: true }, select: { id: true, name: true, type: true, price: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return NextResponse.json({
    totalCustomers,
    activeEntitlements,
    pendingOrders,
    monthlyRevenue: Math.round((confirmedOrdersThisMonth._sum.amount ?? 0) / 100),
    recentOrders,
    products,
  });
}
