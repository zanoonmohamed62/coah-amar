import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth-guard";

export async function GET(_req: NextRequest) {
  const { error, session } = await requireCustomer();
  if (error) return error;
  const userId = session!.user!.id!;

  let entitlement = null;
  try {
    const now = new Date();
    entitlement = await db.entitlement.findFirst({
      where: { userId, status: "ACTIVE", OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
      include: { product: { include: { programs: { where: { isPublished: true }, take: 1 } } } },
      orderBy: { createdAt: "desc" },
    });
  } catch {}

  const program = entitlement?.product?.programs[0];
  if (!program) {
    // Return dev mock program
    const mockProgram = {
      id: "dev-program-1",
      title: "Push / Pull / Legs Split (Dev Preview)",
      description: "Sample hypertrophy split for developer preview mode.",
      split: "Push / Pull / Legs",
      totalWeeks: 12,
      days: [
        { id: "dev-day-1", name: "Day 1 — Push", dayLabel: "Monday", focus: "Chest, Shoulders, Triceps", isRestDay: false, sortOrder: 1, _count: { exercises: 4 } },
        { id: "dev-day-2", name: "Day 2 — Pull", dayLabel: "Tuesday", focus: "Back, Rear Delts, Biceps", isRestDay: false, sortOrder: 2, _count: { exercises: 4 } },
        { id: "dev-day-3", name: "Day 3 — Rest", dayLabel: "Wednesday", focus: "Recovery", isRestDay: true, sortOrder: 3, _count: { exercises: 0 } },
        { id: "dev-day-4", name: "Day 4 — Legs", dayLabel: "Thursday", focus: "Quads, Hamstrings, Calves", isRestDay: false, sortOrder: 4, _count: { exercises: 5 } },
      ]
    };
    return NextResponse.json({ program: mockProgram, programId: "dev-program-1" });
  }

  const fullProgram = await db.trainingProgram.findUnique({
    where: { id: program.id },
    include: { days: { orderBy: { sortOrder: "asc" }, select: { id: true, name: true, dayLabel: true, focus: true, isRestDay: true, sortOrder: true, _count: { select: { exercises: true } } } } },
  });

  return NextResponse.json({ program: fullProgram, programId: program.id });
}
