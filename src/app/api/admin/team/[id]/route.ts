import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { Role } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

// Demotes an admin back to CUSTOMER. Guarded so an admin can't remove their
// own access (would lock them out of /admin immediately) or remove the last
// remaining admin (would lock everyone out with no in-app way back in short
// of editing ADMIN_EMAILS and redeploying).
export async function PUT(req: NextRequest, { params }: Params) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  if (id === session!.user!.id!) {
    return NextResponse.json({ error: "You can't remove your own admin access." }, { status: 400 });
  }

  const target = await db.user.findUnique({ where: { id } });
  if (!target || target.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  const adminCount = await db.user.count({ where: { role: Role.ADMIN } });
  if (adminCount <= 1) {
    return NextResponse.json({ error: "Can't remove the last remaining admin." }, { status: 400 });
  }

  await db.user.update({ where: { id }, data: { role: Role.CUSTOMER } });
  return NextResponse.json({ ok: true });
}
