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

  const expandedUpdates: { sectionId: string; fieldId: string; lang: "en" | "ar"; value: string }[] = [];

  for (const item of updates) {
    const isImage =
      item.value.startsWith("/uploads/") ||
      item.value.startsWith("http") ||
      /\.(jpg|jpeg|png|webp|svg|gif|avif)$/i.test(item.value) ||
      item.fieldId.toLowerCase().includes("image") ||
      item.fieldId.toLowerCase().includes("img");

    if (isImage) {
      expandedUpdates.push({ ...item, lang: "en" });
      expandedUpdates.push({ ...item, lang: "ar" });
    } else {
      expandedUpdates.push(item);
    }
  }

  await Promise.all(
    expandedUpdates.map(({ sectionId, fieldId, lang, value }) =>
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

  // Invalidate Redis cache for both languages so changes are immediately visible
  await Promise.all([
    redis.del("site-content:en").catch(() => {}),
    redis.del("site-content:ar").catch(() => {}),
  ]);

  return NextResponse.json({ ok: true, count: updates.length });
}
