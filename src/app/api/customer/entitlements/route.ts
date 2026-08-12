import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth-guard";
import { EntitlementStatus } from "@prisma/client";

export async function GET(_req: NextRequest) {
  const { error, session } = await requireCustomer();
  if (error) return error;

  const userId = session!.user!.id!;
  let entitlements = [];
  try {
    entitlements = await db.entitlement.findMany({
      where: { userId },
      include: {
        product: { select: { id: true, name: true, type: true, slug: true } },
        order: { select: { orderRef: true, confirmedAt: true, isRenewal: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {}

  // Fallback for dev mode preview
  if (entitlements.length === 0 && (userId === "dev-customer-id" || userId === "dev-admin-id")) {
    entitlements = [{
      id: "dev-ent-1",
      status: "ACTIVE",
      startDate: new Date().toISOString(),
      expiresAt: null,
      product: { id: "dev-prod-1", name: "Push / Pull / Legs Split", type: "TRAINING_PLAN", slug: "training-split" },
      order: { orderRef: "AMAR-DEV-PREVIEW", confirmedAt: new Date().toISOString(), isRenewal: false },
    }] as any;
  }

  const now = new Date();
  const enriched = entitlements.map((e: any) => ({
    ...e,
    isExpired: e.expiresAt ? new Date(e.expiresAt) < now : false,
    daysLeft: e.expiresAt ? Math.max(0, Math.ceil((new Date(e.expiresAt).getTime() - now.getTime()) / 86400000)) : null,
  }));

  return NextResponse.json({ entitlements: enriched });
}
