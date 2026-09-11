import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth-guard";
import { getSetting } from "@/lib/settings";

type SplitLang = "en" | "ar";

const SPLIT_FILES: Record<SplitLang, string> = {
  en: "AMAR.X.SPLIT.ENGLISH.pdf",
  ar: "AMAR.X.SPLIT.ARABIC.pdf",
};

function parseLang(raw: string | null): SplitLang {
  return raw === "ar" ? "ar" : "en";
}

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
  const activeMediaId = await getSetting("active_split_media_id");

  // When a media asset is configured, use its id as the version.
  // Otherwise derive a version from the file's modification time so a replaced
  // file on disk busts the client cache.
  let version = activeMediaId || "legacy";
  if (!activeMediaId) {
    try {
      const filePath = path.join(process.cwd(), "private-assets", SPLIT_FILES[lang]);
      const stat = fs.statSync(filePath);
      version = `${lang}-${stat.mtimeMs}`;
    } catch {
      version = `${lang}-legacy`;
    }
  }

  return NextResponse.json({ version, userId });
}
