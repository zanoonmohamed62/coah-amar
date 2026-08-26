import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { fetchWithCache } from "@/lib/redis";

export async function GET(_req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const data = await fetchWithCache("admin:stats", async () => {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [
      totalCustomers,
      activeEntitlements,
      pendingOrders,
      confirmedOrdersThisMonth,
      totalRevenueAllTime,
      recentOrders,
      products,
      instapayOrders,
      paypalOrders,
      teldaOrders,
    ] = await Promise.all([
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.entitlement.count({ where: { status: "ACTIVE" } }),
      db.order.count({ where: { status: "AWAITING_CONFIRMATION" } }),
      db.order.aggregate({
        where: { status: "CONFIRMED", confirmedAt: { gte: startOfMonth } },
        _sum: { amount: true },
        _count: { id: true },
      }),
      db.order.aggregate({
        where: { status: "CONFIRMED" },
        _sum: { amount: true },
        _count: { id: true },
      }),
      db.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { name: true, type: true } },
          user: { select: { name: true, email: true } },
        },
      }),
      db.product.findMany({
        where: { isActive: true },
        select: { id: true, name: true, type: true, price: true, currency: true },
        orderBy: { sortOrder: "asc" },
      }),
      db.order.count({ where: { paymentMethod: "INSTAPAY", status: "CONFIRMED" } }),
      db.order.count({ where: { paymentMethod: "PAYPAL", status: "CONFIRMED" } }),
      db.order.count({ where: { paymentMethod: "TELDA", status: "CONFIRMED" } }),
    ]);

    return {
      totalCustomers,
      activeEntitlements,
      pendingOrders,
      monthlyRevenue: Math.round((confirmedOrdersThisMonth._sum.amount ?? 0) / 100),
      monthlyOrdersCount: confirmedOrdersThisMonth._count.id ?? 0,
      totalRevenue: Math.round((totalRevenueAllTime._sum.amount ?? 0) / 100),
      totalOrdersCount: totalRevenueAllTime._count.id ?? 0,
      paymentMethods: {
        instapay: instapayOrders,
        paypal: paypalOrders,
        telda: teldaOrders,
      },
      recentOrders,
      products,
    };
  }, 60); // 60 second cache — admin panel stays fast

  return NextResponse.json(data);
}
