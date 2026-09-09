"use client";

// Shared IndexedDB cache for the split PDF bytes.
//
// Both the viewer (PdfCanvas) and the background prefetcher (SplitPrefetcher)
// read and write through here, so the file downloaded ahead of time is exactly
// the one the viewer picks up — including offline. Keeping the keys in one
// place is what stops the two from silently drifting apart.

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
const KEY_PREFIX = "amarx-split-v3:";
const VER_PREFIX = "amarx-split-version-v3:";

function pdfKey(userId: string) {
  return `${KEY_PREFIX}${userId}`;
}
function versionKey(userId: string) {
  return `${VER_PREFIX}${userId}`;
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

export async function getCachedPdf(userId: string): Promise<ArrayBuffer | null> {
  if (!userId) return null;
  try {
    const db = await openIDB();
    return await new Promise((res, rej) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const r = tx.objectStore(IDB_STORE).get(pdfKey(userId));
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

export async function getCachedVersion(userId: string): Promise<string | null> {
  if (!userId) return null;
  try {
    const db = await openIDB();
    return await new Promise((res, rej) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const r = tx.objectStore(IDB_STORE).get(versionKey(userId));
      r.onsuccess = () => res(typeof r.result === "string" ? r.result : null);
      r.onerror = () => rej(r.error);
    });
  } catch {
    return null;
  }
}

export async function savePdfToCache(userId: string, buf: ArrayBuffer, version: string): Promise<void> {
  if (!userId) return;
  try {
    const db = await openIDB();
    await new Promise<void>((res, rej) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(buf.slice(0), pdfKey(userId));
      tx.objectStore(IDB_STORE).put(version, versionKey(userId));
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

export async function probeSplitAccess(): Promise<VersionProbe> {
  try {
    const res = await fetch("/api/split/version", { cache: "no-store" });
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
export async function fetchCurrentVersion(): Promise<string | null> {
  const probe = await probeSplitAccess();
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
        const mine = new Set([pdfKey(userId), versionKey(userId)]);
        for (const k of keysReq.result) {
          if (typeof k === "string" && !mine.has(k)) store.delete(k);
        }
      };
      tx.oncomplete = () => res();
      tx.onerror = () => res();
    });
  } catch {
    /* best-effort */
  }
}
