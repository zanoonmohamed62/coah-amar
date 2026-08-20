"use client";

import { useEffect, useState } from "react";

type ContentMap = Record<string, Record<string, string>>;

// Cache content at module level to avoid redundant fetches during same session
let cachedContent: ContentMap | null = null;
let fetchPromise: Promise<ContentMap> | null = null;

async function fetchSiteContent(): Promise<ContentMap> {
  if (cachedContent) return cachedContent;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch("/api/site-content")
    .then((r) => r.json())
    .then((d) => {
      cachedContent = d.content || {};
      return cachedContent!;
    })
    .catch(() => {
      fetchPromise = null;
      return {} as ContentMap;
    });

  return fetchPromise;
}

/**
 * useSiteContent — returns a function `get(sectionId, fieldId, fallback)` that
 * first checks the DB CMS content, then falls back to the translations default.
 *
 * Usage:
 *   const get = useSiteContent();
 *   const headline = get("hero", "titleLine1", t.hero.titleLine1);
 */
export function useSiteContent() {
  const [content, setContent] = useState<ContentMap>(cachedContent || {});

  useEffect(() => {
    fetchSiteContent().then(setContent);
  }, []);

  function get(sectionId: string, fieldId: string, fallback: string): string {
    return content[sectionId]?.[fieldId] || fallback;
  }

  return get;
}
