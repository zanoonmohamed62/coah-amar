"use client";

import { useEffect } from "react";

/**
 * Self-healing cleanup for stale service workers.
 *
 * The current worker lives at root scope ("/"). Older deploys registered a
 * worker at "/app" scope — those are stale and must be removed so they don't
 * shadow the root worker on portal pages. This component unregisters any
 * non-root worker and reloads once so the current root worker can take over.
 */
export function SWKillSwitch() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;

    (async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        // Only remove workers with a scope OTHER than root — the root one
        // is the current, correct worker.
        const stale = registrations.filter((reg) => {
          const scopePath = new URL(reg.scope).pathname;
          return scopePath !== "/" && scopePath.startsWith("/app");
        });

        if (stale.length === 0) return;

        await Promise.all(stale.map((reg) => reg.unregister().catch(() => false)));

        if (cancelled) return;
        const RELOAD_GUARD = "amarx-sw-cleanup-reloaded";
        let alreadyReloaded = false;
        try {
          alreadyReloaded = sessionStorage.getItem(RELOAD_GUARD) === "1";
          sessionStorage.setItem(RELOAD_GUARD, "1");
        } catch {}

        if (!alreadyReloaded) window.location.reload();
      } catch {
        /* Never let cleanup break the page. */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
