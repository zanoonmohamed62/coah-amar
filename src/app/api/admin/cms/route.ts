import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { updateContentSchema, publishContentSchema } from "@/lib/validations";

export async function GET(_req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const content = await db.siteContent.findMany({ orderBy: [{ sectionId: "asc" }, { fieldId: "asc" }] });
  return NextResponse.json({ content });
}

export async function PUT(req: NextRequest) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const parsed = updateContentSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { sectionId, fieldId, lang, value, draft } = parsed.data;

  const record = await db.siteContent.upsert({
    where: { sectionId_fieldId_lang: { sectionId, fieldId, lang } },
    create: {
      sectionId, fieldId, lang,
      value: draft ? "" : value,
      draftValue: draft ? value : null,
      status: draft ? "DRAFT" : "PUBLISHED",
      updatedBy: session!.user!.id!,
    },
    update: {
      ...(draft ? { draftValue: value, status: "DRAFT" } : { value, draftValue: null, status: "PUBLISHED", publishedAt: new Date() }),
      updatedBy: session!.user!.id!,
    },
  });

  return NextResponse.json({ record });
}
