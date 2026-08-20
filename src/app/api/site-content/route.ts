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

    return NextResponse.json({ content: map, lang });
  } catch {
    return NextResponse.json({ content: {}, lang: "en" });
  }
}
