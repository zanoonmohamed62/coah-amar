import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(_req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const assets = await db.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ assets });
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
