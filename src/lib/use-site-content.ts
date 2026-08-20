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
      const res = await fetch(`/api/site-content?lang=${encodeURIComponent(lang)}`);
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
    return content[sectionId]?.[fieldId] || fallback;
  }

  return get;
}
