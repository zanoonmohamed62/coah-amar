import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { publishContentSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const parsed = publishContentSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { sectionId, fieldId, lang } = parsed.data;

  const where = {
    ...(sectionId ? { sectionId } : {}),
    ...(fieldId ? { fieldId } : {}),
    ...(lang ? { lang } : {}),
    status: "DRAFT" as const,
    draftValue: { not: null as unknown as string },
  };

  const drafts = await db.siteContent.findMany({ where });

  await db.$transaction(drafts.map((d: any) =>
    db.siteContent.update({
      where: { id: d.id },
      data: {
        value: d.draftValue!,
        draftValue: null,
        status: "PUBLISHED",
        publishedAt: new Date(),
        updatedBy: session!.user!.id!,
        revisions: { create: { value: d.draftValue!, publishedAt: new Date(), publishedBy: session!.user!.id! } },
      },
    })
  ));

  return NextResponse.json({ published: drafts.length });
}
