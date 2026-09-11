import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth-guard";
import { activeSplitMediaId, parseLang, SPLIT_FILES, type SplitLang } from "@/lib/split-file";

async function hasSplitAccess(userId: string): Promise<boolean> {
  const now = new Date();
  const entitlement = await db.entitlement.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      product: { type: { in: ["TRAINING_PLAN", "PERSONAL_COACHING"] } },
    },
  });
  return !!entitlement;
}

async function readActivePdf(lang: SplitLang): Promise<Buffer> {
  const activeMediaId = await activeSplitMediaId(lang);

  if (activeMediaId) {
    try {
      const asset = await db.mediaAsset.findUnique({ where: { id: activeMediaId } });
      if (asset) {
        const filePath = path.join(process.cwd(), "private_media", asset.storageKey);
        return fs.readFileSync(filePath);
      }
    } catch {
      // Media asset missing or unreadable — fall through to language files
    }
  }

  // Language-specific files in private-assets/
  const filePath = path.join(process.cwd(), "private-assets", SPLIT_FILES[lang]);
  return fs.readFileSync(filePath);
}

// The plan is only ever read by the in-app viewer, which fetches it with
// fetch() and draws it to canvas. Opening this URL directly in the browser
// would hand an entitled customer the raw PDF in the browser's own viewer —
// complete with its download and share buttons — so refuse anything that is a
// page navigation or an embed rather than a script fetch.
//
// Modern browsers label every request with Sec-Fetch-Mode/Dest, which a page
// cannot forge: a typed URL or link is "navigate"/"document", an <iframe> or
// <embed> says so too, and fetch() is "empty". Browsers too old to send those
// headers must instead carry x-amar-viewer, which only our own fetch() adds.
//
// This closes the one-click download. It is not DRM: anyone determined can
// still pull the bytes out of devtools, and nothing stops a screenshot — the
// per-viewer watermark is what makes a leaked copy traceable.
function isViewerFetch(req: NextRequest): boolean {
  const mode = req.headers.get("sec-fetch-mode");
  const dest = req.headers.get("sec-fetch-dest");
  if (mode === "navigate") return false;
  if (dest && ["document", "iframe", "frame", "embed", "object"].includes(dest)) return false;
  if (!dest && req.headers.get("x-amar-viewer") !== "1") return false;
  return true;
}

export async function GET(req: NextRequest) {
  if (!isViewerFetch(req)) {
    return NextResponse.json(
      { error: "The plan can only be opened inside the app." },
      { status: 403 }
    );
  }

  const { error, session } = await requireCustomer();
  if (error) return error;

  const userId = session!.user!.id!;
  const role = (session!.user as unknown as { role: string }).role;

  if (role !== "ADMIN") {
    const allowed = await hasSplitAccess(userId);
    if (!allowed) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const lang = parseLang(req.nextUrl.searchParams.get("lang"));
    const fileBuffer = await readActivePdf(lang);

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "private, no-store",
        "Content-Disposition": "inline",
        "X-Frame-Options": "SAMEORIGIN",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Error loading PDF", { status: 500 });
  }
}
