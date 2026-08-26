import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth-guard";
import { fetchWithCache } from "@/lib/redis";

export async function GET(_req: NextRequest) {
  const { error, session } = await requireCustomer();
  if (error) return error;

  const userId = session!.user!.id!;

  const entitlements = await fetchWithCache(
    `customer:entitlements:${userId}`,
    async () => {
      const rows = await db.entitlement.findMany({
        where: { userId },
        include: {
          product: { select: { id: true, name: true, type: true, slug: true } },
          order: { select: { orderRef: true, confirmedAt: true, isRenewal: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return rows;
    },
    300 // 5 minute cache
  );

  const now = new Date();
  const enriched = (entitlements as any[]).map((e) => ({
    ...e,
    isExpired: e.expiresAt ? new Date(e.expiresAt) < now : false,
    daysLeft: e.expiresAt
      ? Math.max(0, Math.ceil((new Date(e.expiresAt).getTime() - now.getTime()) / 86400000))
      : null,
  }));

  return NextResponse.json({ entitlements: enriched });
}
