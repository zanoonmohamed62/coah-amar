import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Paged, and without payment screenshots.
//
// Every order now carries a transfer screenshot stored as a MediaAsset, so this
// table grows with sales. Returning all of it on every visit to the library —
// and to the settings page, which only needed one row — was the same
// load-everything pattern the orders and customers lists were moved off.
// Screenshots belong with their order (the order drawer shows them), not in the
// library of files the admin uploads, so they are left out here.
//   ?id=<assetId>          → that one asset (used by /admin/settings)
//   ?page=&pageSize=       → one page of the library
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const asset = await db.mediaAsset.findUnique({ where: { id } });
    return NextResponse.json({ assets: asset ? [asset] : [] });
  }

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(200, Math.max(1, parseInt(searchParams.get("pageSize") || "48", 10) || 48));
  const where = { NOT: { storageKey: { startsWith: "proof-" } } };

  const [assets, total] = await Promise.all([
    db.mediaAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.mediaAsset.count({ where }),
  ]);
  return NextResponse.json({ assets, total, page, pageSize, hasMore: page * pageSize < total });
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const isProtected = form.get("isProtected") !== "false";

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name);
  const storageKey = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const dir = path.join(process.cwd(), "private_media");

  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, storageKey), buffer);

  const asset = await db.mediaAsset.create({
    data: { filename: storageKey, originalName: file.name, mimeType: file.type, size: buffer.length, storageKey, isProtected, uploadedBy: session!.user!.id! },
  });

  return NextResponse.json({ asset }, { status: 201 });
}
