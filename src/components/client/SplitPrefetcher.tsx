"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  getCachedPdf,
  getCachedVersion,
  fetchCurrentVersion,
  savePdfToCache,
  savePwaUser,
  saveCachedEntitlements,
} from "@/lib/split-cache";
import type { SplitLang } from "@/lib/split-cache";

// Downloads both split PDFs (English + Arabic) into IndexedDB in the background
// as soon as an entitled customer opens the portal — so an installed PWA carries
// both plans and works offline without the customer ever having had to open the
// viewer while online first.
//
// Access is NOT decided here. This only *asks*; `GET /api/split` still enforces
// requireCustomer() + an ACTIVE, non-expired Entitlement server-side, so a
// signed-in visitor with no purchase gets a 403 and nothing is ever cached.
export function SplitPrefetcher() {
  const { data: session, status } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id ?? "";
  const startedRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !userId) return;

    // Cache user identity immediately for offline mode
    savePwaUser({
      id: userId,
      name: session?.user?.name || undefined,
      email: session?.user?.email || undefined,
    });

    if (startedRef.current) return;
    // The viewer downloads and caches the plan itself. Prefetching while it is
    // on screen just competes with it for bandwidth and CPU on the one screen
    // where responsiveness matters most.
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/app/my-split")) return;
    startedRef.current = true;

    // Never block first paint — let the portal render, then fetch quietly.
    const timer = setTimeout(() => {
      void prefetch(userId);
    }, 2500);

    return () => clearTimeout(timer);
  }, [status, userId, session]);

  return null;
}

async function prefetch(userId: string) {
  try {
    // 1. Only proceed for a customer who actually has active access.
    const entRes = await fetch("/api/customer/entitlements", { cache: "no-store" });
    if (!entRes.ok) return;
    const { entitlements } = await entRes.json();
    if (Array.isArray(entitlements)) {
      saveCachedEntitlements(entitlements);
    }

    const hasActive =
      Array.isArray(entitlements) &&
      entitlements.some(
        (e: { status?: string; isExpired?: boolean }) =>
          e?.status === "ACTIVE" && !e?.isExpired
      );
    if (!hasActive) {
      console.log("[SplitPrefetcher] No active entitlement found. Statuses:",
        entitlements?.map((e: { status?: string; isExpired?: boolean }) => `${e?.status}(expired:${e?.isExpired})`)
      );
      return;
    }

    // 2. Prefetch both language versions sequentially (en first, then ar).
    //    Sequential rather than parallel to avoid hammering the server.
    for (const lang of ["en", "ar"] as SplitLang[]) {
      await prefetchLang(userId, lang);
    }
  } catch (err) {
    console.error("[SplitPrefetcher] Error:", err);
  }
}

async function prefetchLang(userId: string, lang: SplitLang) {
  try {
    // Skip the download when the cached copy is already current.
    const [cached, cachedVersion, currentVersion] = await Promise.all([
      getCachedPdf(userId, lang),
      getCachedVersion(userId, lang),
      fetchCurrentVersion(lang),
    ]);
    const isStale =
      currentVersion !== null && cachedVersion !== null && currentVersion !== cachedVersion;

    if (cached && !isStale) return;

    // Fetch and store. A 403 here simply means nothing gets cached.
    const res = await fetch(`/api/split?lang=${lang}`, { cache: "no-store", headers: { "x-amar-viewer": "1" } });
    if (!res.ok) return;
    const buf = await res.arrayBuffer();
    if (buf.byteLength === 0) return;

    await savePdfToCache(userId, buf, currentVersion ?? "legacy", lang);
  } catch (err) {
    console.error(`[SplitPrefetcher] Error prefetching ${lang}:`, err);
  }
}
