import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth-guard";

type Params = { params: Promise<{ programId: string; dayId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { error, session } = await requireCustomer();
  if (error) return error;
  const { programId, dayId } = await params;
  const userId = session!.user!.id!;

  if (programId.startsWith("dev-") || dayId.startsWith("dev-")) {
    const mockDay = {
      id: dayId,
      name: "Day 1 — Push (Dev Preview)",
      dayLabel: "Monday",
      focus: "Chest, Shoulders, Triceps",
      notes: "Focus on controlled eccentrics and full range of motion.",
      exercises: [
        { id: "dev-ex-1", name: "Barbell Bench Press", sets: 4, reps: "6-8", rest: "120 sec", instructions: "Lower bar smoothly to mid-chest. Drive feet into the floor.", notes: "Keep shoulders retracted throughout the movement.", imageId: null, videoId: null },
        { id: "dev-ex-2", name: "Incline Dumbbell Press", sets: 3, reps: "8-10", rest: "90 sec", instructions: "Set bench to 30 degrees. Press vertically over shoulders.", notes: null, imageId: null, videoId: null },
        { id: "dev-ex-3", name: "Standing Lateral Raises", sets: 4, reps: "12-15", rest: "60 sec", instructions: "Lead with elbows. Slight forward lean.", notes: "Avoid excessive swinging.", imageId: null, videoId: null },
        { id: "dev-ex-4", name: "Tricep Cable Pushdown", sets: 3, reps: "10-12", rest: "60 sec", instructions: "Lock elbows at sides. Full lockout at bottom.", notes: null, imageId: null, videoId: null },
      ]
    };
    return NextResponse.json({ day: mockDay });
  }

  // Entitlement check
  const program = await db.trainingProgram.findUnique({ where: { id: programId }, select: { productId: true, isPublished: true } });
  if (!program?.productId || !program.isPublished) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const entitlement = await db.entitlement.findFirst({
    where: { userId, productId: program.productId, status: "ACTIVE", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
  });
  if (!entitlement) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  const day = await db.trainingDay.findFirst({
    where: { id: dayId, programId },
    include: {
      exercises: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, sets: true, reps: true, rest: true, instructions: true, notes: true, sortOrder: true, imageId: true, videoId: true },
      },
    },
  });

  if (!day) return NextResponse.json({ error: "Day not found" }, { status: 404 });
  return NextResponse.json({ day });
}
