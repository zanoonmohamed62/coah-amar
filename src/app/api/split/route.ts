import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth-guard";
import { getSetting } from "@/lib/settings";

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

async function readActivePdf(): Promise<Buffer> {
  const activeMediaId = await getSetting("active_split_media_id");

  if (activeMediaId) {
    const asset = await db.mediaAsset.findUnique({ where: { id: activeMediaId } });
    if (asset) {
      const filePath = path.join(process.cwd(), "private_media", asset.storageKey);
      return fs.readFileSync(filePath);
    }
  }

  // Legacy fallback: the original hand-placed file, kept for backward compatibility
  // until an admin uploads a replacement through the UI.
  const filePath = path.join(process.cwd(), "private-assets", "AMARX-SPLIT.pdf");
  return fs.readFileSync(filePath);
}

export async function GET() {
  const { error, session } = await requireCustomer();
  if (error) return error;

  const userId = session!.user!.id!;
  const role = (session!.user as unknown as { role: string }).role;

  if (role !== "ADMIN") {
    const allowed = await hasSplitAccess(userId);
    if (!allowed) return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const fileBuffer = await readActivePdf();

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "private, no-store",
        "Content-Disposition": "inline",
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch {
    return new NextResponse("Error loading PDF", { status: 500 });
  }
}
