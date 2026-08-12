import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { unlink } from "fs/promises";
import path from "path";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const asset = await db.mediaAsset.findUnique({ where: { id } });
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Remove file from disk
  try { await unlink(path.join(process.cwd(), "private_media", asset.storageKey)); } catch {}

  await db.mediaAsset.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
