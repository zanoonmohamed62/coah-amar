// ═══════════════════════════════════════════════════════
//  AMMAR X — Service Worker
//  Strategy: App shell cache-first, PDF network-first
// ═══════════════════════════════════════════════════════

const CACHE_VERSION = "v2";
const SHELL_CACHE = `amar-shell-${CACHE_VERSION}`;
const PDF_CACHE = `amar-pdf-${CACHE_VERSION}`;

// App shell routes to pre-cache.
// NOTE: /api/split is deliberately NOT cached here — it's an auth+entitlement
// gated endpoint, and a Service Worker cache-first response would bypass that
// check on every request after the first (regardless of the page's own fetch
// cache options, since the SW intercepts before those apply). The PDF's real
// offline caching lives in PdfCanvas.tsx via IndexedDB, which only stores the
// bytes after a successful authenticated fetch.
const SHELL_URLS = [
  "/app",
  "/app/my-split",
  "/pdfjs/pdf.worker.min.mjs"
];

// ── Install: pre-cache app shell ──────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      cache.addAll(SHELL_URLS)
    ).then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== PDF_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: route-based strategies ────────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // App shell pages — Cache-first with network fallback.
  // /api/split is intentionally excluded — see the note on SHELL_URLS above.
  if (url.pathname.startsWith("/app")) {
    event.respondWith(handleShellFetch(event.request));
    return;
  }

  // Everything else — pass through
  event.respondWith(fetch(event.request));
});

// ── Shell: Cache-first, network fallback ─────────────
async function handleShellFetch(request) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    // Serve from cache, update in background
    fetch(request).then((r) => {
      if (r.ok) cache.put(request, r);
    }).catch(() => {});
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    // If everything fails, return the cached /app shell
    return cache.match("/app") || new Response("Offline", { status: 503 });
  }
}

// ── Message handler (from page) ──────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
