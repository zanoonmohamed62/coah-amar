import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { createDaySchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const parsed = createDaySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const day = await db.trainingDay.create({ data: { programId: id, ...parsed.data } });
  return NextResponse.json({ day }, { status: 201 });
}
