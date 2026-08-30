import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { Role } from "@prisma/client";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const admins = await db.user.findMany({
    where: { role: Role.ADMIN },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ admins });
}

// Adds (or promotes) a user to ADMIN by email. If no User row exists yet for
// that email, a shell row is created with role: ADMIN — the existing Google
// sign-in flow (src/lib/auth.ts) never overwrites the role of an existing row
// for a non-allowlisted email (its update branch touches nothing), so this
// pre-provisioned ADMIN role survives their first real login untouched. No
// changes to auth.ts were needed for this to work.
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { email } = await req.json().catch(() => ({}));
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  const normalized = email.trim().toLowerCase();

  const admin = await db.user.upsert({
    where: { email: normalized },
    create: { email: normalized, name: normalized.split("@")[0], role: Role.ADMIN },
    update: { role: Role.ADMIN },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return NextResponse.json({ admin }, { status: 201 });
}
