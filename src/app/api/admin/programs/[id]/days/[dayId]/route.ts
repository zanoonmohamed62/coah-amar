import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { updateDaySchema, createExerciseSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string; dayId: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { dayId } = await params;
  const parsed = updateDaySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const day = await db.trainingDay.update({ where: { id: dayId }, data: parsed.data });
  return NextResponse.json({ day });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { dayId } = await params;
  await db.trainingDay.delete({ where: { id: dayId } });
  return NextResponse.json({ success: true });
}
