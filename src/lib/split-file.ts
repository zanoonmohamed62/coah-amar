import fs from "fs";
import path from "path";
import { getSetting } from "@/lib/settings";

// Where the split PDF comes from, for both the bytes route and the version
// probe. Server-only (pulls in settings → db/redis) — never import from a
// client component.
//
// Lives here rather than in either route because a Next.js `route.ts` may only
// export HTTP method handlers; exporting a helper from one fails the build.

export type SplitLang = "en" | "ar";

export const SPLIT_FILES: Record<SplitLang, string> = {
  en: "AMAR.X.SPLIT.ENGLISH.pdf",
  ar: "AMAR.X.SPLIT.ARABIC.pdf",
};

export function parseLang(raw: string | null): SplitLang {
  return raw === "ar" ? "ar" : "en";
}

export function resolveSplitFilePath(lang: SplitLang): string {
  const privatePath = path.join(process.cwd(), "private-assets", SPLIT_FILES[lang]);
  if (fs.existsSync(privatePath)) return privatePath;
  const assetsPath = path.join(process.cwd(), "assets", SPLIT_FILES[lang]);
  if (fs.existsSync(assetsPath)) return assetsPath;
  return privatePath;
}

/**
 * Which uploaded MediaAsset (if any) is the active file for this language.
 *
 * Each language has its own slot. `active_split_media_id` without a suffix is
 * the original single-slot setting and is still read as the English one, so an
 * upload made before the split became two files keeps working. Uploading one
 * file used to replace BOTH languages — an Arabic customer opening the Arabic
 * tab got handed the English plan.
 */
export async function activeSplitMediaId(lang: SplitLang): Promise<string> {
  const scoped = await getSetting(lang === "ar" ? "active_split_media_id_ar" : "active_split_media_id_en");
  if (scoped) return scoped;
  if (lang === "en") return (await getSetting("active_split_media_id")) || "";
  return "";
}
