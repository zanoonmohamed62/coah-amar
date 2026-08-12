import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth-guard";

type Params = { params: Promise<{ programId: string }> };

async function checkEntitlement(userId: string, programId: string) {
  const program = await db.trainingProgram.findUnique({ where: { id: programId }, select: { productId: true, isPublished: true } });
  if (!program || !program.isPublished) return false;
  if (!program.productId) return false;

  const now = new Date();
  const entitlement = await db.entitlement.findFirst({
    where: {
      userId,
      productId: program.productId,
      status: "ACTIVE",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
  });
  return !!entitlement;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { error, session } = await requireCustomer();
  if (error) return error;
  const { programId } = await params;
  const userId = session!.user!.id!;

  const hasAccess = await checkEntitlement(userId, programId);
  if (!hasAccess) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  const program = await db.trainingProgram.findUnique({
    where: { id: programId },
    include: { days: { orderBy: { sortOrder: "asc" }, select: { id: true, name: true, dayLabel: true, focus: true, isRestDay: true, sortOrder: true, _count: { select: { exercises: true } } } } },
  });

  return NextResponse.json({ program });
}
