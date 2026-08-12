import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { updateProgramSchema, createDaySchema, createExerciseSchema, updateExerciseSchema, updateDaySchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const program = await db.trainingProgram.findUnique({
    where: { id },
    include: { product: { select: { name: true } }, days: { orderBy: { sortOrder: "asc" }, include: { exercises: { orderBy: { sortOrder: "asc" }, include: { image: true, video: true } } } } },
  });
  if (!program) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ program });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const body = await req.json();
  const parsed = updateProgramSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = { ...parsed.data };
  if (data.isPublished && !await db.trainingProgram.findFirst({ where: { id, publishedAt: { not: null } } })) {
    (data as Record<string, unknown>).publishedAt = new Date();
  }
  const program = await db.trainingProgram.update({ where: { id }, data });
  return NextResponse.json({ program });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  await db.trainingProgram.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
