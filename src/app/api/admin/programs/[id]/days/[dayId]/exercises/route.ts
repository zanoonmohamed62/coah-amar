import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { createExerciseSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string; dayId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { dayId } = await params;
  const parsed = createExerciseSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const exercise = await db.exercise.create({ data: { dayId, ...parsed.data } });
  return NextResponse.json({ exercise }, { status: 201 });
}
