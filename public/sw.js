// ═══════════════════════════════════════════════════════
//  AMMAR X — Service Worker
//  Strategy: Full PWA offline — cache-first statics,
//  network-first pages with offline fallback
// ═══════════════════════════════════════════════════════

const CACHE_VERSION = "v7";
const SHELL_CACHE = `amar-shell-${CACHE_VERSION}`;
const PDF_CACHE = `amar-pdf-${CACHE_VERSION}`;

// App shell routes to pre-cache on install.
// The landing page ("/") is included so that users coming from Instagram/TikTok
// links get a working page even when they have no connection.
// /api/split is NOT cached here — it's auth-gated and cached via IndexedDB.
const SHELL_URLS = [
  "/",
  "/pdfjs/pdf.worker.min.mjs",
  "/offline",
];

// ── Install: pre-cache static assets ──────────────────
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

  // Only handle same-origin GETs.
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;

  // API routes — never cache, always network.
  if (url.pathname.startsWith("/api/")) return;

  // pdfjs static assets — cache-first.
  if (url.pathname.startsWith("/pdfjs/")) {
    event.respondWith(handleCacheFirst(event.request));
    return;
  }

  // Next.js build assets (/_next/static/) — immutable, content-hashed.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(handleCacheFirst(event.request));
    return;
  }

  // Static assets in /assets/, /icons/, /uploads/, images etc — cache-first.
  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/uploads/") ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|eot|css|js)$/)
  ) {
    event.respondWith(handleCacheFirst(event.request));
    return;
  }

  // RSC payloads must never be served from HTML cache.
  if (url.searchParams.has("_rsc")) return;

  // All HTML pages — network-first with offline fallback.
  // This covers: landing ("/"), /app/*, /admin/*, /checkout/*, /login, etc.
  if (event.request.headers.get("accept")?.includes("text/html") || event.request.mode === "navigate") {
    event.respondWith(handlePageFetch(event.request));
    return;
  }

  // Remaining requests (fonts, misc) — stale-while-revalidate.
  event.respondWith(handleCacheFirst(event.request));
});

// ── Cache-first (for immutable/static assets) ────────
async function handleCacheFirst(request) {
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

// ── Network-first for pages, with offline fallback ───
async function handlePageFetch(request) {
  const cache = await caches.open(SHELL_CACHE);

  try {
    const response = await fetch(request);
    // Only cache real, final HTML — not redirects to /login.
    if (response.ok && response.type !== "opaqueredirect" && !response.redirected) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline: try exact match, then ignore query, then landing page, then offline page.
    const url = new URL(request.url);
    const cached =
      (await cache.match(request)) ||
      (await cache.match(request, { ignoreSearch: true }));
    if (cached) return cached;

    // For /app pages, try /app root
    if (url.pathname.startsWith("/app")) {
      const appRoot = await cache.match("/app");
      if (appRoot) return appRoot;
    }

    // Try landing page
    const landing = await cache.match("/");
    if (landing) return landing;

    // Final fallback: offline page
    const offlinePage = await cache.match("/offline");
    if (offlinePage) return offlinePage;

    return new Response(OFFLINE_HTML, {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}

// Inline offline fallback when nothing is cached at all.
const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#07090e">
<title>Offline — Coach Amar</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#07090e;color:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:24px}
.card{max-width:380px}
.icon{width:64px;height:64px;margin:0 auto 24px;border-radius:16px;background:rgba(59,130,246,0.15);display:flex;align-items:center;justify-content:center}
.icon svg{width:32px;height:32px;color:#3b82f6}
h1{font-size:1.5rem;font-weight:800;margin-bottom:8px}
p{font-size:0.875rem;color:#94a3b8;line-height:1.6;margin-bottom:24px}
button{background:#2563eb;color:#fff;border:none;padding:12px 32px;border-radius:12px;font-size:0.875rem;font-weight:700;cursor:pointer;transition:background 0.2s}
button:hover{background:#1d4ed8}
.ar{direction:rtl;margin-top:8px;font-size:0.8rem;color:#64748b}
</style>
</head>
<body>
<div class="card">
<div class="icon"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12h.01"/></svg></div>
<h1>You're Offline</h1>
<p>Check your internet connection and try again. Your training plan is still saved on your device.</p>
<button onclick="location.reload()">Try Again</button>
<p class="ar">أنت غير متصل بالإنترنت — الجدول محفوظ على جهازك</p>
</div>
</body>
</html>`;

// ── Push notifications ───────────────────────────────
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "THE AMAR";
  const options = {
    body: payload.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: payload.tag || "amar",
    renotify: Boolean(payload.tag),
    dir: "auto",
    data: { url: payload.url || "/app" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Tapping a notification focuses an existing window.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/app";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          if ("navigate" in client) client.navigate(target).catch(() => {});
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});

// ── Message handler (from page) ──────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
