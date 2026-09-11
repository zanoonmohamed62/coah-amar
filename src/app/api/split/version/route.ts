import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth-guard";
import { activeSplitMediaId, parseLang, resolveSplitFilePath } from "@/lib/split-file";

export const dynamic = "force-dynamic";

// Cheap "may I read the split, and which one is current?" probe.
//
// It enforces the SAME entitlement rule as GET /api/split, deliberately: the
// viewer calls this before it will display a PDF it already has in IndexedDB,
// so this is the check that decides whether a locally cached copy may still be
// shown. Returning 403 here is what revokes access on a device that already
// downloaded the file.
export async function GET(req: NextRequest) {
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

  const lang = parseLang(req.nextUrl.searchParams.get("lang"));
  const activeMediaId = await activeSplitMediaId(lang);

  // The version is ALWAYS language-prefixed, including the uploaded-asset case.
  // It used to be the bare asset id, which is the same string for both
  // languages — so the viewer compared the Arabic tab's cached version against
  // the English one, decided the Arabic copy was current when it wasn't (and
  // vice versa), and the two tabs fought over one cache slot.
  let version = activeMediaId ? `${lang}-${activeMediaId}` : `${lang}-legacy`;
  if (!activeMediaId) {
    try {
      const filePath = resolveSplitFilePath(lang);
      const stat = fs.statSync(filePath);
      version = `${lang}-${stat.size}-${Math.round(stat.mtimeMs)}`;
    } catch {
      version = `${lang}-legacy`;
    }
  }

  return NextResponse.json(
    { version, userId },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      },
    }
  );
}
