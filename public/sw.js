// ═══════════════════════════════════════════════════════
//  AMMAR X — Service Worker
//  Strategy: App shell cache-first, PDF network-first
// ═══════════════════════════════════════════════════════

const CACHE_VERSION = "v5";
const SHELL_CACHE = `amar-shell-${CACHE_VERSION}`;
const PDF_CACHE = `amar-pdf-${CACHE_VERSION}`;

// App shell routes to pre-cache.
// NOTE: /api/split is deliberately NOT cached here — it's an auth+entitlement
// gated endpoint, and a Service Worker cache-first response would bypass that
// check on every request after the first (regardless of the page's own fetch
// cache options, since the SW intercepts before those apply). The PDF's real
// offline caching lives in PdfCanvas.tsx via IndexedDB, which only stores the
// bytes after a successful authenticated fetch.
// Only genuinely static, auth-independent assets are pre-cached here.
// The /app pages are deliberately NOT in this list: when the worker installs
// for a signed-out visitor they answer with a redirect to /login, and cache.add
// follows it and stores the login page under the /app key — poisoning the
// offline shell. They get cached on first authenticated visit instead
// (see handleShellFetch).
const SHELL_URLS = [
  "/pdfjs/pdf.worker.min.mjs"
];

// ── Install: pre-cache static assets ──────────────────
// Each URL is cached independently so one failure can't reject the whole
// install and leave the worker permanently broken.
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

  // React Server Component payloads (?_rsc=...) must never be answered from
  // the HTML shell cache: the client router expects an RSC stream, and handing
  // it a full HTML document breaks the navigation outright. Let these hit the
  // network and fail honestly when offline — Next.js then falls back to a full
  // page load, which the navigation branch below can serve from cache.
  if (url.searchParams.has("_rsc")) return;

  // App shell pages — network-first so a fresh deploy is picked up immediately
  // (stale HTML referencing deleted build chunks is what produced the
  // "Failed to find Server Action" errors), with the cache as the offline
  // fallback. API routes under /api are never cached: they are auth/entitlement
  // gated and must always hit the network (see SHELL_URLS above re: /api/split).
  if (url.pathname.startsWith("/app") && !url.pathname.startsWith("/api")) {
    event.respondWith(handleShellFetch(event.request));
    return;
  }

  // Everything else — do not intercept; let the browser handle it natively.
});

// ── Shell: Network-first, cache fallback ─────────────
async function handleShellFetch(request) {
  const cache = await caches.open(SHELL_CACHE);

  try {
    const response = await fetch(request);
    // Only cache real, final HTML — a 302 to /login would otherwise be stored
    // and replayed to signed-in users.
    if (response.ok && response.type !== "opaqueredirect" && !response.redirected) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline: exact match first, then ignore the query string, then the
    // portal root as a last resort so the app still opens.
    const cached =
      (await cache.match(request)) ||
      (await cache.match(request, { ignoreSearch: true })) ||
      (await cache.match("/app"));
    if (cached) return cached;
    return new Response("Offline", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
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
