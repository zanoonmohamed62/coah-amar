import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public endpoint — no auth needed, read published site content for the homepage
export async function GET() {
  try {
    const content = await db.siteContent.findMany({
      where: { lang: "en" },
      select: { sectionId: true, fieldId: true, value: true },
    });

    // Reshape into { [sectionId]: { [fieldId]: value } }
    const map: Record<string, Record<string, string>> = {};
    for (const row of content) {
      if (!map[row.sectionId]) map[row.sectionId] = {};
      map[row.sectionId][row.fieldId] = row.value;
    }

    return NextResponse.json({ content: map });
  } catch {
    return NextResponse.json({ content: {} });
  }
}
