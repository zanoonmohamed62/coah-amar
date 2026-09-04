"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  getCachedPdf,
  getCachedVersion,
  fetchCurrentVersion,
  savePdfToCache,
} from "@/lib/split-cache";

// Downloads the split PDF into IndexedDB in the background as soon as an
// entitled customer opens the portal — so an installed PWA carries the plan
// with it and works offline without the customer ever having had to open the
// viewer while online first.
//
// Access is NOT decided here. This only *asks*; `GET /api/split` still enforces
// requireCustomer() + an ACTIVE, non-expired Entitlement server-side, so a
// signed-in visitor with no purchase gets a 403 and nothing is ever cached.
// The entitlement check below is purely to avoid firing a request we know will
// be refused (and to keep a non-buyer's device from downloading 2.8MB for
// nothing) — it is a courtesy, not the security boundary.
export function SplitPrefetcher() {
  const { status } = useSession();
  const startedRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || startedRef.current) return;
    startedRef.current = true;

    // Never block first paint — let the portal render, then fetch quietly.
    const timer = setTimeout(() => {
      void prefetch();
    }, 2500);

    return () => clearTimeout(timer);
  }, [status]);

  return null;
}

async function prefetch() {
  try {
    // 1. Only proceed for a customer who actually has active access.
    const entRes = await fetch("/api/customer/entitlements", { cache: "no-store" });
    if (!entRes.ok) return;
    const { entitlements } = await entRes.json();
    const hasActive =
      Array.isArray(entitlements) &&
      entitlements.some(
        (e: { status?: string; isExpired?: boolean }) =>
          e?.status === "ACTIVE" && !e?.isExpired
      );
    if (!hasActive) return;

    // 2. Skip the download when the cached copy is already current.
    const [cached, cachedVersion, currentVersion] = await Promise.all([
      getCachedPdf(),
      getCachedVersion(),
      fetchCurrentVersion(),
    ]);
    const isStale =
      currentVersion !== null && cachedVersion !== null && currentVersion !== cachedVersion;
    if (cached && !isStale) return;

    // 3. Fetch and store. A 403 here (entitlement revoked between the two
    //    calls, say) simply means nothing gets cached.
    const res = await fetch("/api/split", { cache: "no-store" });
    if (!res.ok) return;
    const buf = await res.arrayBuffer();
    if (buf.byteLength === 0) return;

    await savePdfToCache(buf, currentVersion ?? "legacy");
  } catch {
    /* Offline, revoked access, quota exceeded — all non-fatal. The viewer
       falls back to its own fetch-on-open path exactly as before. */
  }
}
