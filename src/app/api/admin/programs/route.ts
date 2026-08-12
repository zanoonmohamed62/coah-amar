import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { createProgramSchema, updateProgramSchema } from "@/lib/validations";

export async function GET(_req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const programs = await db.trainingProgram.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true } }, _count: { select: { days: true } } },
  });
  return NextResponse.json({ programs });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const parsed = createProgramSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const program = await db.trainingProgram.create({ data: parsed.data });
  return NextResponse.json({ program }, { status: 201 });
}
