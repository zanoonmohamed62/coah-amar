// ═══════════════════════════════════════════════════════
//  AMMAR X — Service Worker
//  Strategy: App shell cache-first, PDF network-first
// ═══════════════════════════════════════════════════════

const CACHE_VERSION = "v1";
const SHELL_CACHE = `amar-shell-${CACHE_VERSION}`;
const PDF_CACHE = `amar-pdf-${CACHE_VERSION}`;

// App shell routes to pre-cache
const SHELL_URLS = [
  "/app",
  "/app/my-split",
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

  // PDF API — Network-first with cache fallback + update signal
  if (url.pathname === "/api/split") {
    event.respondWith(handlePdfFetch(event.request));
    return;
  }

  // App shell pages — Cache-first with network fallback
  if (url.pathname.startsWith("/app")) {
    event.respondWith(handleShellFetch(event.request));
    return;
  }

  // Everything else — pass through
  event.respondWith(fetch(event.request));
});

// ── PDF: Network-first, cache fallback ───────────────
async function handlePdfFetch(request) {
  const cache = await caches.open(PDF_CACHE);

  try {
    const networkResponse = await fetch(request.clone());

    if (networkResponse.ok) {
      // Check if PDF has been updated via ETag
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        const cachedEtag = cachedResponse.headers.get("etag");
        const networkEtag = networkResponse.headers.get("etag");
        if (cachedEtag && networkEtag && cachedEtag !== networkEtag) {
          // New version available — notify all clients
          broadcastUpdate("PDF_UPDATED");
        }
      }

      // Store fresh copy
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    throw new Error("Network response not ok");
  } catch {
    // Offline or error — serve from cache
    const cached = await cache.match(request);
    if (cached) return cached;

    // No cache either
    return new Response(JSON.stringify({ error: "Offline — no cached split" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

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

// ── Broadcast to all open clients ────────────────────
function broadcastUpdate(type) {
  self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) =>
      client.postMessage({ type, timestamp: Date.now() })
    );
  });
}

// ── Message handler (from page) ──────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data?.type === "CLEAR_PDF_CACHE") {
    caches.open(PDF_CACHE).then((c) => c.delete("/api/split"));
  }
});
