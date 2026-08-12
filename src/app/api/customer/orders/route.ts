import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth-guard";

export async function GET(_req: NextRequest) {
  const { error, session } = await requireCustomer();
  if (error) return error;
  const userId = session!.user!.id!;
  const orders = await db.order.findMany({
    where: { userId },
    include: { product: { select: { name: true, type: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}
