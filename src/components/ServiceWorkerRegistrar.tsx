"use client";

import { useEffect } from "react";

// Registers the service worker at the ROOT scope, and retires the old
// /app-scoped registration.
//
// It used to be registered with `{ scope: "/app" }`, which meant it only
// controlled the customer portal. Push notifications run through the service
// worker, so the admin panel at /admin had no worker to subscribe with — the
// order alert could never reach the admin's phone. Root scope covers both, and
// the fetch handler still only intercepts /app, /_next/static and /pdfjs, so
// nothing else changes about how pages load.
//
// Mounted in the portal and the admin panel only. Public marketing pages
// deliberately do not install a worker: a casual visitor should not be made to
// download and cache the PDF worker just for reading the homepage.
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
