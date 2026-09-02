import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public endpoint — reads published site content for homepage (supports ?lang=en or ?lang=ar)
export async function GET(req: NextRequest) {
  try {
    const lang = req.nextUrl.searchParams.get("lang") || "en";

    const content = await db.siteContent.findMany({
      where: { lang },
      select: { sectionId: true, fieldId: true, value: true },
    });

    // Reshape into { [sectionId]: { [fieldId]: value } }
    const map: Record<string, Record<string, string>> = {};
    for (const row of content) {
      if (!map[row.sectionId]) map[row.sectionId] = {};
      map[row.sectionId][row.fieldId] = row.value;
    }

    const arHeroDesc = "مش مجرد ملف PDF عادي. نظام تدريب وتغذية متكامل مصمم خصيصاً لجسمك، جدول يومك، وأهدافك الرياضية.";
    const enHeroDesc = "Not a generic PDF. A personalized coaching system built around your body, schedule, and goals.";

    if (lang === "ar") {
      const current = map.hero?.description?.trim();
      if (!current || /^[A-Za-z]/.test(current)) {
        if (!map.hero) map.hero = {};
        map.hero.description = arHeroDesc;
        db.siteContent.upsert({
          where: { sectionId_fieldId_lang: { sectionId: "hero", fieldId: "description", lang: "ar" } },
          create: { sectionId: "hero", fieldId: "description", lang: "ar", value: arHeroDesc },
          update: { value: arHeroDesc },
        }).catch(() => {});
      }
    } else if (lang === "en") {
      const current = map.hero?.description?.trim();
      if (!current || current !== enHeroDesc) {
        if (!map.hero) map.hero = {};
        map.hero.description = enHeroDesc;
        db.siteContent.upsert({
          where: { sectionId_fieldId_lang: { sectionId: "hero", fieldId: "description", lang: "en" } },
          create: { sectionId: "hero", fieldId: "description", lang: "en", value: enHeroDesc },
          update: { value: enHeroDesc },
        }).catch(() => {});
      }
    }

    return NextResponse.json({ content: map, lang });
  } catch {
    return NextResponse.json({ content: {}, lang: "en" });
  }
}
