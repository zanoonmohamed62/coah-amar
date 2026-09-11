"use client";

import { useEffect } from "react";

// Registers the service worker at the ROOT scope so every page on the site
// (landing, customer portal, admin) is covered for offline use and push.
//
// Previously only mounted in /app and /admin. Now mounted in the root layout
// so visitors from Instagram/TikTok who install the PWA get full offline
// support from their first visit — the landing page, checkout, and the
// customer portal all cache for offline.
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        // A registration's scope is part of its identity: registering at "/"
        // does not replace the "/app" one, it adds a second. On a portal page
        // the narrower scope would keep winning, so the old one has to go
        // explicitly or the two shadow each other indefinitely.
        const existing = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          existing
            .filter((r) => new URL(r.scope).pathname !== "/")
            .map((r) => r.unregister().catch(() => false))
        );

        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

        // Pick up a new deploy when the app is brought back to the foreground.
        const checkUpdate = () => { void reg.update().catch(() => {}); };
        window.addEventListener("focus", checkUpdate);
        cleanup = () => window.removeEventListener("focus", checkUpdate);
      } catch {
        /* An unavailable worker costs offline support, never the page itself. */
      }
    })();

    return () => cleanup?.();
  }, []);

  return null;
}
