import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth-guard";
import { getSetting } from "@/lib/settings";

// Cheap "may I read the split, and which one is current?" probe.
//
// It enforces the SAME entitlement rule as GET /api/split, deliberately: the
// viewer calls this before it will display a PDF it already has in IndexedDB,
// so this is the check that decides whether a locally cached copy may still be
// shown. Returning 403 here is what revokes access on a device that already
// downloaded the file.
export async function GET() {
  const { error, session } = await requireCustomer();
  if (error) return error;

  const userId = session!.user!.id!;
  const role = (session!.user as unknown as { role: string }).role;

  if (role !== "ADMIN") {
    const now = new Date();
    const entitlement = await db.entitlement.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        product: { type: { in: ["TRAINING_PLAN", "PERSONAL_COACHING"] } },
      },
      select: { id: true },
    });
    if (!entitlement) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
  }

  const version = (await getSetting("active_split_media_id")) || "legacy";
  return NextResponse.json({ version, userId });
}
