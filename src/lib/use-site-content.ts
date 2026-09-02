"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-context";

type ContentMap = Record<string, Record<string, string>>;

// Cache content at module level by language to avoid redundant fetches
const cacheByLang = new Map<string, ContentMap>();
const promisesByLang = new Map<string, Promise<ContentMap>>();

async function fetchSiteContent(lang: string): Promise<ContentMap> {
  const cached = cacheByLang.get(lang);
  if (cached) return cached;

  const inFlight = promisesByLang.get(lang);
  if (inFlight) return inFlight;

  const promise = (async () => {
    try {
      const res = await fetch(`/api/site-content?lang=${encodeURIComponent(lang)}&t=${Date.now()}`);
      const data = await res.json();
      const result: ContentMap = data.content || {};
      cacheByLang.set(lang, result);
      return result;
    } catch {
      promisesByLang.delete(lang);
      return {} as ContentMap;
    }
  })();

  promisesByLang.set(lang, promise);
  return promise;
}

/** Call this after saving CMS content to invalidate the module-level cache */
export function clearSiteContentCache(lang?: string) {
  if (lang) {
    cacheByLang.delete(lang);
    promisesByLang.delete(lang);
  } else {
    cacheByLang.clear();
    promisesByLang.clear();
  }
}

/**
 * useSiteContent — returns a function `get(sectionId, fieldId, fallback)` that
 * first checks the DB CMS content for the current language, then falls back to the translations default.
 *
 * Usage:
 *   const get = useSiteContent();
 *   const headline = get("hero", "titleLine1", t.hero.titleLine1);
 */
export function useSiteContent() {
  const { lang } = useLanguage();
  const [content, setContent] = useState<ContentMap>(cacheByLang.get(lang) || {});

  useEffect(() => {
    fetchSiteContent(lang).then(setContent);
  }, [lang]);

  function get(sectionId: string, fieldId: string, fallback: string): string {
    const val = content[sectionId]?.[fieldId];
    if (typeof val === "string" && val.trim().length > 0) {
      return val;
    }
    return fallback;
  }

  return get;
}
