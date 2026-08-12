import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { OrderStatus, EntitlementStatus, Role, ProductType } from "@prisma/client";
import bcrypt from "bcryptjs";

// Redirect old /api/admin/payments → now handled by /api/admin/orders
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const orders = await db.order.findMany({
    where: { paymentMethod: "INSTAPAY" },
    include: { product: { select: { name: true, type: true } }, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}
