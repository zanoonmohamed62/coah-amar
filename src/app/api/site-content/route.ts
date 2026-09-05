import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fetchWithCache } from "@/lib/redis";

type ContentMap = Record<string, Record<string, string>>;

async function loadSiteContent(lang: string): Promise<ContentMap> {
  return fetchWithCache(
    `site-content:${lang}`,
    async () => {
      const content = await db.siteContent.findMany({
        where: { lang },
        select: { sectionId: true, fieldId: true, value: true },
      });

      const map: ContentMap = {};
      for (const row of content) {
        if (!map[row.sectionId]) map[row.sectionId] = {};
        map[row.sectionId][row.fieldId] = row.value;
      }
      return map;
    },
    300 // 5 minute cache — matches other public-facing cached reads in this app
  );
}

// Public endpoint — reads published site content for homepage (supports ?lang=en or ?lang=ar)
export async function GET(req: NextRequest) {
  try {
    const lang = req.nextUrl.searchParams.get("lang") || "en";
    const content = await loadSiteContent(lang);

    return NextResponse.json(
      { content, lang },
      { headers: { "Cache-Control": "no-cache, no-store, must-revalidate" } }
    );
  } catch {
    return NextResponse.json({ content: {}, lang: "en" });
  }
}
