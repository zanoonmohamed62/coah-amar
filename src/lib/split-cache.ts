"use client";

// Shared IndexedDB cache for the split PDF bytes.
//
// Both the viewer (PdfCanvas) and the background prefetcher (SplitPrefetcher)
// read and write through here, so the file downloaded ahead of time is exactly
// the one the viewer picks up — including offline. Keeping the keys in one
// place is what stops the two from silently drifting apart.
//
// Since the split now ships as two PDFs (English + Arabic), every key is
// scoped by a lang code ("en" | "ar") in addition to the user id.

export type SplitLang = "en" | "ar";

const IDB_DB = "amar-split-cache";
const IDB_STORE = "pdf-blobs";

// Cache keys are scoped per user id.
//
// They used to be two fixed strings shared by every account on the device. A
// browser that had cached the PDF for an entitled customer would then hand
// those same bytes to the next account signed in on it — so signing in with a
// Google account that had never bought anything opened the split. The server
// was never fooled (GET /api/split still refused it); the viewer simply never
// asked, because it already had a copy.
//
// Scoping by user keeps one account's download unreadable by another, and
// `clearOtherUsersCache` drops the rest so the device doesn't hoard copies.
const KEY_PREFIX = "amarx-split-v5:";
const VER_PREFIX = "amarx-split-version-v5:";

function pdfKey(userId: string, lang: SplitLang) {
  return `${KEY_PREFIX}${userId}:${lang}`;
}
function versionKey(userId: string, lang: SplitLang) {
  return `${VER_PREFIX}${userId}:${lang}`;
}

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, 2);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(IDB_STORE)) {
        req.result.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getCachedPdf(userId: string, lang: SplitLang = "en"): Promise<ArrayBuffer | null> {
  if (!userId) return null;
  try {
    const db = await openIDB();
    return await new Promise((res, rej) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const r = tx.objectStore(IDB_STORE).get(pdfKey(userId, lang));
      r.onsuccess = () => {
        const v = r.result;
        res(v instanceof ArrayBuffer && v.byteLength > 0 ? v : null);
      };
      r.onerror = () => rej(r.error);
    });
  } catch {
    return null;
  }
}

export async function getCachedVersion(userId: string, lang: SplitLang = "en"): Promise<string | null> {
  if (!userId) return null;
  try {
    const db = await openIDB();
    return await new Promise((res, rej) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const r = tx.objectStore(IDB_STORE).get(versionKey(userId, lang));
      r.onsuccess = () => res(typeof r.result === "string" ? r.result : null);
      r.onerror = () => rej(r.error);
    });
  } catch {
    return null;
  }
}

export async function savePdfToCache(userId: string, buf: ArrayBuffer, version: string, lang: SplitLang = "en"): Promise<void> {
  if (!userId) return;
  try {
    const db = await openIDB();
    await new Promise<void>((res, rej) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(buf.slice(0), pdfKey(userId, lang));
      tx.objectStore(IDB_STORE).put(version, versionKey(userId, lang));
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch {
    /* silent — caching is best-effort, never block the viewer */
  }
}

/**
 * Result of asking the server whether this session may read the split.
 *
 * "denied" and "offline" must stay distinguishable: a denial has to hide a
 * cached PDF, while being offline has to keep showing it — that is the whole
 * point of caching it. Collapsing both into null (as this used to) makes one of
 * those two behaviours impossible.
 */
export type VersionProbe =
  | { state: "ok"; version: string }
  | { state: "denied" }
  | { state: "offline" };

export async function probeSplitAccess(lang: SplitLang = "en"): Promise<VersionProbe> {
  try {
    const res = await fetch(`/api/split/version?lang=${lang}`, { cache: "no-store" });
    if (res.status === 403 || res.status === 401) return { state: "denied" };
    if (!res.ok) return { state: "offline" };
    const data = await res.json();
    return { state: "ok", version: data.version ?? "legacy" };
  } catch {
    // Network failure — genuinely offline, not a refusal.
    return { state: "offline" };
  }
}

/** Back-compat helper: the version string, or null when unavailable. */
export async function fetchCurrentVersion(lang: SplitLang = "en"): Promise<string | null> {
  const probe = await probeSplitAccess(lang);
  return probe.state === "ok" ? probe.version : null;
}

/**
 * Drops every cached copy that does not belong to `userId`, including the two
 * legacy global keys ("amarx-split-v2" / "amarx-split-version") written before
 * the cache was scoped per user — those are exactly the entries that let one
 * account read another's download, so they must not survive an upgrade.
 *
 * Best-effort: a failure here must never stop the viewer from working.
 */
export async function clearOtherUsersCache(userId: string): Promise<void> {
  try {
    const db = await openIDB();
    await new Promise<void>((res) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      const store = tx.objectStore(IDB_STORE);
      const keysReq = store.getAllKeys();
      keysReq.onsuccess = () => {
        const mine = new Set([
          pdfKey(userId, "en"), versionKey(userId, "en"),
          pdfKey(userId, "ar"), versionKey(userId, "ar"),
        ]);
        // This user's rendered page images stay too. With an empty userId the
        // prefix matches nothing (real ids are never empty), so everything goes.
        const myPages = `${PAGE_PREFIX}${userId}:`;
        for (const k of keysReq.result) {
          if (typeof k !== "string" || mine.has(k)) continue;
          if (userId && k.startsWith(myPages)) continue;
          store.delete(k);
        }
      };
      tx.oncomplete = () => res();
      tx.onerror = () => res();
    });
  } catch {
    /* best-effort */
  }
}


// ── Rendered page images ────────────────────────────────────────────────────
//
// The PDF itself is not what the viewer shows. Drawing a page with pdf.js is
// slow on a phone (hundreds of ms per page, on the main thread), so redrawing
// pages as they scrolled in and out is what made the plan lag and flash. Each
// page is now rasterised once, stored here as a JPEG, and displayed as a plain
// <img> from then on — native, smooth scrolling with no pdf.js work at all.
//
// Keyed by user, LANGUAGE, PDF version and raster width: a new upload or a very
// different screen width simply produces new images, and prunePageImages drops
// the old set.
//
// The language is part of the key for a reason. It used to be absent, and the
// version string differs per language ("en-<mtime>" vs "ar-<mtime>") — so
// pruning after opening the English tab deleted every Arabic page as "an old
// version", and opening Arabic deleted every English one. Switching tabs
// therefore re-rendered the whole plan from scratch every single time, which is
// exactly the "it loads again from zero each time I open it" the viewer was
// reported for. Pruning is now confined to one language's own images.
const PAGE_PREFIX = "amarx-split-page-v3:";

function langPrefix(userId: string, lang: SplitLang) {
  return `${PAGE_PREFIX}${userId}:${lang}:`;
}

function pageKey(userId: string, lang: SplitLang, version: string, width: number, page: number) {
  return `${langPrefix(userId, lang)}${version}:${width}:${page}`;
}

// What the viewer needs to lay the document out before pdf.js has parsed
// anything: how many pages there are and their shape. With this cached, a
// reopened plan paints its stored images immediately and pdf.js loads quietly
// afterwards for links and zoom — instead of every open waiting on a 1.4 MB
// parse first.
export type DocMeta = { numPages: number; aspect: number };

function metaKey(userId: string, lang: SplitLang, version: string) {
  return `${langPrefix(userId, lang)}meta:${version}`;
}

export async function saveDocMeta(userId: string, lang: SplitLang, version: string, meta: DocMeta): Promise<void> {
  if (!userId) return;
  try {
    const db = await openIDB();
    await new Promise<void>((res) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(meta, metaKey(userId, lang, version));
      tx.oncomplete = () => res();
      tx.onerror = () => res();
    });
  } catch {
    /* best-effort */
  }
}

export async function getDocMeta(userId: string, lang: SplitLang, version: string): Promise<DocMeta | null> {
  if (!userId) return null;
  try {
    const db = await openIDB();
    return await new Promise((res) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const r = tx.objectStore(IDB_STORE).get(metaKey(userId, lang, version));
      r.onsuccess = () => {
        const v = r.result as DocMeta | undefined;
        res(v && typeof v.numPages === "number" && v.numPages > 0 ? v : null);
      };
      r.onerror = () => res(null);
    });
  } catch {
    return null;
  }
}

type StoredImage = { type: string; data: ArrayBuffer };

/** One read transaction for every page; null where a page is not cached yet. */
export async function getPageImages(
  userId: string, lang: SplitLang, version: string, width: number, count: number
): Promise<(Blob | null)[]> {
  const out: (Blob | null)[] = new Array(count).fill(null);
  if (!userId || count <= 0) return out;
  try {
    const db = await openIDB();
    await new Promise<void>((res) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const store = tx.objectStore(IDB_STORE);
      for (let i = 0; i < count; i++) {
        const r = store.get(pageKey(userId, lang, version, width, i + 1));
        r.onsuccess = () => {
          const v = r.result as StoredImage | undefined;
          if (v && v.data instanceof ArrayBuffer && v.data.byteLength > 0) {
            out[i] = new Blob([v.data], { type: v.type || "image/jpeg" });
          }
        };
      }
      tx.oncomplete = () => res();
      tx.onerror = () => res();
    });
  } catch {
    /* best-effort: missing pages are simply rendered again */
  }
  return out;
}

export async function savePageImage(
  userId: string, lang: SplitLang, version: string, width: number, page: number, blob: Blob
): Promise<void> {
  if (!userId) return;
  try {
    // Stored as bytes + type rather than a Blob: Blobs in IndexedDB have been
    // unreliable on older iOS Safari, which is exactly where this has to work.
    const data = await blob.arrayBuffer();
    const db = await openIDB();
    await new Promise<void>((res) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      const value: StoredImage = { type: blob.type || "image/jpeg", data };
      tx.objectStore(IDB_STORE).put(value, pageKey(userId, lang, version, width, page));
      tx.oncomplete = () => res();
      tx.onerror = () => res();
    });
  } catch {
    /* best-effort */
  }
}

/**
 * Drop this user's images for THIS language from any other version or width.
 *
 * Scoped to one language on purpose — see the note on PAGE_PREFIX above. The
 * other language's cached pages are none of this call's business.
 */
export async function prunePageImages(userId: string, lang: SplitLang, version: string, width: number): Promise<void> {
  if (!userId) return;
  try {
    const db = await openIDB();
    const mine = langPrefix(userId, lang);
    const keep = `${mine}${version}:${width}:`;
    const keepMeta = `${mine}meta:${version}`;
    await new Promise<void>((res) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      const store = tx.objectStore(IDB_STORE);
      const keysReq = store.getAllKeys();
      keysReq.onsuccess = () => {
        for (const k of keysReq.result) {
          if (typeof k !== "string" || !k.startsWith(mine)) continue;
          if (k.startsWith(keep) || k === keepMeta) continue;
          store.delete(k);
        }
      };
      tx.oncomplete = () => res();
      tx.onerror = () => res();
    });
  } catch {
    /* best-effort */
  }
}

// ── Keeping the download on the device ──────────────────────────────────────
//
// Without this, both iOS and Android treat the whole IndexedDB store as
// "best-effort" and are free to evict it under storage pressure or after a
// stretch of not opening the app — which reads to the customer as the plan
// having to download itself again. Granted silently for an installed PWA on
// Chrome/Android and for a home-screen app on iOS; a plain browser tab may be
// refused, in which case the cache still works, it is simply evictable.
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

// ── Offline identity ────────────────────────────────────────────────────────
//
// Offline, the session request fails, next-auth reports "unauthenticated", and
// the viewer has no user id to find the cached plan by — so the offline copy
// could never be opened, and a failed session refresh on returning to the app
// would pull the plan off screen. The last signed-in id is remembered here and
// used only when the session cannot be reached at all. A confirmed sign-out
// (the server answering "no session") or signing out through the app forgets
// it and the cached plan.
const LAST_USER_KEY = "amar-split-last-user";
const CACHED_USER_KEY = "amar-pwa-cached-user";
const CACHED_ENTITLEMENTS_KEY = "amar-pwa-cached-entitlements";
const CACHED_ORDERS_KEY = "amar-pwa-cached-orders";

export type RememberedUser = { id: string; label: string };
export type CachedPwaUser = { id: string; name?: string; email?: string; role?: string };

/** `label` is the watermark text (email), so an offline copy is still marked. */
export function rememberSplitUser(userId: string, label: string) {
  try { localStorage.setItem(LAST_USER_KEY, JSON.stringify({ id: userId, label })); } catch { /* ignore */ }
}

export function getRememberedSplitUser(): RememberedUser | null {
  try {
    const raw = localStorage.getItem(LAST_USER_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<RememberedUser>;
    return typeof v.id === "string" && v.id ? { id: v.id, label: typeof v.label === "string" ? v.label : "" } : null;
  } catch {
    return null;
  }
}

export function savePwaUser(user: CachedPwaUser) {
  try {
    localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
    if (user.id) {
      rememberSplitUser(user.id, user.email || user.name || "");
    }
  } catch { /* ignore */ }
}

export function getCachedPwaUser(): CachedPwaUser | null {
  try {
    const raw = localStorage.getItem(CACHED_USER_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as CachedPwaUser;
    return typeof v.id === "string" && v.id ? v : null;
  } catch {
    return null;
  }
}

export function saveCachedEntitlements(entitlements: unknown[]) {
  try {
    localStorage.setItem(CACHED_ENTITLEMENTS_KEY, JSON.stringify(entitlements));
  } catch { /* ignore */ }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCachedEntitlements(): any[] {
  try {
    const raw = localStorage.getItem(CACHED_ENTITLEMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCachedOrders(orders: unknown[]) {
  try {
    localStorage.setItem(CACHED_ORDERS_KEY, JSON.stringify(orders));
  } catch { /* ignore */ }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCachedOrders(): any[] {
  try {
    const raw = localStorage.getItem(CACHED_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Call on sign-out: nothing of the plan should stay readable on the device. */
export async function forgetOfflineSplit(): Promise<void> {
  try {
    localStorage.removeItem(LAST_USER_KEY);
    localStorage.removeItem(CACHED_USER_KEY);
    localStorage.removeItem(CACHED_ENTITLEMENTS_KEY);
    localStorage.removeItem(CACHED_ORDERS_KEY);
  } catch { /* ignore */ }
  await clearOtherUsersCache("");
}
