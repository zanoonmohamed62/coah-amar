import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const customers = await db.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}),
    },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true, orderRef: true, status: true, amount: true, confirmedAt: true, product: { select: { name: true } } } },
      entitlements: { where: { status: "ACTIVE" }, select: { id: true, status: true, startDate: true, expiresAt: true, product: { select: { name: true, type: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ customers });
}
