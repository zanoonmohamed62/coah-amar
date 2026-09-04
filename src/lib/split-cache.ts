"use client";

// Shared IndexedDB cache for the split PDF bytes.
//
// Both the viewer (PdfCanvas) and the background prefetcher (SplitPrefetcher)
// read and write through here, so the file downloaded ahead of time is exactly
// the one the viewer picks up — including offline. Keeping the keys in one
// place is what stops the two from silently drifting apart.

const IDB_DB = "amar-split-cache";
const IDB_STORE = "pdf-blobs";
const IDB_KEY = "amarx-split-v2";
const IDB_VER_KEY = "amarx-split-version";

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

export async function getCachedPdf(): Promise<ArrayBuffer | null> {
  try {
    const db = await openIDB();
    return await new Promise((res, rej) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const r = tx.objectStore(IDB_STORE).get(IDB_KEY);
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

export async function getCachedVersion(): Promise<string | null> {
  try {
    const db = await openIDB();
    return await new Promise((res, rej) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const r = tx.objectStore(IDB_STORE).get(IDB_VER_KEY);
      r.onsuccess = () => res(typeof r.result === "string" ? r.result : null);
      r.onerror = () => rej(r.error);
    });
  } catch {
    return null;
  }
}

export async function savePdfToCache(buf: ArrayBuffer, version: string): Promise<void> {
  try {
    const db = await openIDB();
    await new Promise<void>((res, rej) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(buf.slice(0), IDB_KEY);
      tx.objectStore(IDB_STORE).put(version, IDB_VER_KEY);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch {
    /* silent — caching is best-effort, never block the viewer */
  }
}

export async function fetchCurrentVersion(): Promise<string | null> {
  try {
    const res = await fetch("/api/split/version", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.version ?? null;
  } catch {
    return null;
  }
}
