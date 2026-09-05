import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { redis } from "@/lib/redis";

type Update = {
  sectionId: string;
  fieldId: string;
  lang: "en" | "ar";
  value: string;
};

export async function PUT(req: NextRequest) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  let body: { updates: Update[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { updates } = body;
  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const userId = session!.user!.id!;

  await Promise.all(
    updates.map(({ sectionId, fieldId, lang, value }) =>
      db.siteContent.upsert({
        where: { sectionId_fieldId_lang: { sectionId, fieldId, lang } },
        create: {
          sectionId,
          fieldId,
          lang,
          value,
          draftValue: null,
          status: "PUBLISHED",
          updatedBy: userId,
        },
        update: {
          value,
          draftValue: null,
          status: "PUBLISHED",
          publishedAt: new Date(),
          updatedBy: userId,
        },
      })
    )
  );

  const langs = new Set(updates.map((u) => u.lang));
  await Promise.all([...langs].map((lang) => redis.del(`site-content:${lang}`).catch(() => {})));

  return NextResponse.json({ ok: true, count: updates.length });
}
