import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { createReadStream, statSync, existsSync } from "fs";
import path from "path";

type Params = { params: Promise<{ assetId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { error, session } = await requireAuth();
  if (error) return error;
  const { assetId } = await params;

  const asset = await db.mediaAsset.findUnique({ where: { id: assetId } });
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Protected assets require entitlement
  if (asset.isProtected) {
    const role = (session!.user as { role?: string }).role;
    if (role !== "ADMIN") {
      // Find any active entitlement for this user
      const userId = session!.user!.id!;
      const hasEntitlement = await db.entitlement.findFirst({
        where: { userId, status: "ACTIVE", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      });
      if (!hasEntitlement) return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
  }

  // Serve file from local storage
  const filePath = path.join(process.cwd(), "private_media", asset.storageKey);
  if (!existsSync(filePath)) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const stat = statSync(filePath);
  const headers = new Headers({
    "Content-Type": asset.mimeType,
    "Content-Length": String(stat.size),
    "Cache-Control": "private, no-store",
    "Content-Disposition": `inline; filename="${asset.originalName}"`,
  });

  // Stream file
  const stream = createReadStream(filePath);
  return new NextResponse(stream as unknown as ReadableStream, { headers });
}
