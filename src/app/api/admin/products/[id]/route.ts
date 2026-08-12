import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { updateProductSchema } from "@/lib/validations";
import { ProductType } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id }, include: { programs: true, _count: { select: { orders: true, entitlements: true } } } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const parsed = updateProductSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;
  const product = await db.product.update({ where: { id }, data: { ...data, ...(data.type ? { type: data.type as ProductType } : {}) } });
  return NextResponse.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  await db.product.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
