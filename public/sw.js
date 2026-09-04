// ═══════════════════════════════════════════════════════
//  AMMAR X — Service Worker
//  Strategy: App shell cache-first, PDF network-first
// ═══════════════════════════════════════════════════════

const CACHE_VERSION = "v4";
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
// Each URL is cached independently: /app and /app/my-split redirect to /login
// when signed out, and a single failure inside cache.addAll() would reject the
// whole install and leave the worker permanently broken.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.all(
        SHELL_URLS.map((url) => cache.add(url).catch(() => {}))
      )
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

  // Only ever handle same-origin GETs. Anything else (POST/PUT, cross-origin
  // fonts/CDN, etc.) must fall through untouched — calling respondWith() on
  // those re-issues the request and loses the original semantics, which breaks
  // navigations outright.
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;

  // pdfjs static assets (worker, cmaps, fonts) — cache-first.
  // These were pre-cached during install but the old handler never served them.
  if (url.pathname.startsWith("/pdfjs/")) {
    event.respondWith(handleShellFetch(event.request));
    return;
  }

  // Next.js build assets (/_next/static/) — immutable, content-hashed.
  // Cache-first is safe; includes pdfjs-dist chunks needed for offline PDF.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(handleStaticFetch(event.request));
    return;
  }

  // App shell pages — cache-first with network fallback. API routes under
  // /api are never cached: they are auth/entitlement gated and must always
  // hit the network (see the note on SHELL_URLS above re: /api/split).
  if (url.pathname.startsWith("/app") && !url.pathname.startsWith("/api")) {
    event.respondWith(handleShellFetch(event.request));
    return;
  }

  // Everything else — do not intercept; let the browser handle it natively.
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

// ── Static assets: Cache-first (immutable, content-hashed) ───
async function handleStaticFetch(request) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

// ── Message handler (from page) ──────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
