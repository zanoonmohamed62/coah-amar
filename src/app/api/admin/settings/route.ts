import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { redis } from "@/lib/redis";

export async function GET(_req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const settings = await db.setting.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const entries: { key: string; value: string }[] = Array.isArray(body) ? body : [body];

  const updated = await Promise.all(
    entries.map(({ key, value }) =>
      db.setting.upsert({
        where: { key },
        create: { key, value, updatedBy: session!.user!.id! },
        update: { value, updatedBy: session!.user!.id! },
      })
    )
  );

  await redis.del("settings:all").catch(() => {});

  return NextResponse.json({ settings: updated });
}
