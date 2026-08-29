"use client";

import { useEffect } from "react";

/**
 * Self-healing cleanup for stale service workers.
 *
 * An earlier deployed sw.js registered at root scope with a catch-all
 * `event.respondWith(fetch(request))` in its fetch handler. Re-issuing a
 * navigation request that way loses its original semantics, so those clients
 * render a blank "This page couldn't load" error on every page — including in
 * Incognito, since a fresh window installs the worker on first visit.
 *
 * A newer worker scoped to /app cannot replace a root-scoped registration, so
 * affected browsers cannot recover on their own. This unregisters any worker
 * controlling a scope outside /app and drops its caches, then reloads once so
 * the page is served normally. It is a no-op for everyone else.
 */
export function SWKillSwitch() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;

    (async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        const stale = registrations.filter((reg) => {
          const scopePath = new URL(reg.scope).pathname;
          return !scopePath.startsWith("/app");
        });

        if (stale.length === 0) return;

        await Promise.all(stale.map((reg) => reg.unregister().catch(() => false)));

        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k).catch(() => false)));
        }

        // Reload once so this load is served without the removed worker.
        // sessionStorage guards against a reload loop if anything above fails.
        if (cancelled) return;
        const RELOAD_GUARD = "amarx-sw-cleanup-reloaded";
        let alreadyReloaded = false;
        try {
          alreadyReloaded = sessionStorage.getItem(RELOAD_GUARD) === "1";
          sessionStorage.setItem(RELOAD_GUARD, "1");
        } catch {}

        if (!alreadyReloaded) window.location.reload();
      } catch {
        // Never let cleanup break the page.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
