"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, WifiOff } from "lucide-react";

const IDB_DB    = "amar-split-cache";
const IDB_STORE = "pdf-blobs";
const IDB_KEY   = "amarx-split";

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}
async function getCached(): Promise<ArrayBuffer | null> {
  try {
    const db = await openIDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const r  = tx.objectStore(IDB_STORE).get(IDB_KEY);
      r.onsuccess = () => res(r.result ?? null);
      r.onerror   = () => rej(r.error);
    });
  } catch { return null; }
}
async function saveToCache(buf: ArrayBuffer): Promise<void> {
  try {
    const db = await openIDB();
    await new Promise<void>((res, rej) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(buf, IDB_KEY);
      tx.oncomplete = () => res();
      tx.onerror    = () => rej(tx.error);
    });
  } catch { /* silent */ }
}

interface Props { isArabic: boolean; }

export default function PdfCanvas({ isArabic }: Props) {
  const viewerRef  = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfRef     = useRef<any>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [status,   setStatus]   = useState<"loading" | "ready" | "error">("loading");
  const [numPages, setNumPages] = useState(0);

  const renderAll = useCallback(async () => {
    const pdf = pdfRef.current;
    if (!pdf || !viewerRef.current) return;
    const containerW = viewerRef.current.clientWidth - 32;
    const dpr = window.devicePixelRatio || 2;
    for (let i = 0; i < pdf.numPages; i++) {
      const canvas = canvasRefs.current[i];
      if (!canvas) continue;
      const page   = await pdf.getPage(i + 1);
      const vp     = page.getViewport({ scale: 1 });
      const scaled = page.getViewport({ scale: containerW / vp.width });
      canvas.style.width  = `${scaled.width}px`;
      canvas.style.height = `${scaled.height}px`;
      canvas.width        = Math.floor(scaled.width  * dpr);
      canvas.height       = Math.floor(scaled.height * dpr);
      const ctx = canvas.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      await page.render({ canvasContext: ctx, viewport: scaled }).promise;
    }
  }, []);

  const loadAndRender = useCallback(async () => {
    setStatus("loading");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      // Use the worker file served from /public (same origin, no CORS issues)
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

      let buf = await getCached();
      if (!buf) {
        const res = await fetch("/api/split", { cache: "no-store" });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        buf = await res.arrayBuffer();
        await saveToCache(buf);
      }

      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
      pdfRef.current = pdf;
      setNumPages(pdf.numPages);
      setStatus("ready");
    } catch (err) {
      console.error("[PdfCanvas] load failed:", err);
      setStatus("error");
    }
  }, []);

  useEffect(() => { loadAndRender(); }, [loadAndRender]);
  useEffect(() => { if (status === "ready") setTimeout(renderAll, 60); }, [status, numPages, renderAll]);
  useEffect(() => {
    const ro = new ResizeObserver(() => renderAll());
    if (viewerRef.current) ro.observe(viewerRef.current);
    return () => ro.disconnect();
  }, [renderAll]);

  return (
    <div
      ref={viewerRef}
      className="flex-1 w-full overflow-y-auto bg-[#0d121c] flex flex-col items-center gap-4 py-4 relative select-none"
      onContextMenu={(e) => e.preventDefault()}
      style={{ minHeight: 0 }}
    >
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0d121c] z-10">
          <Loader2 size={36} className="animate-spin text-[var(--accent)]" />
          <p className="text-sm font-semibold text-[var(--text-muted)]">
            {isArabic ? "\u062c\u0627\u0631 \u0627\u0644\u062a\u062d\u0645\u064a\u0644..." : "Loading..."}
          </p>
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0d121c] z-10">
          <WifiOff size={36} className="text-red-400" />
          <div className="text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {isArabic ? "\u062a\u0639\u0630\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u062c\u062f\u0648\u0644" : "Failed to load"}
            </p>
            <p className="text-xs opacity-60 mt-1">
              {isArabic ? "\u062a\u0623\u0643\u062f \u0645\u0646 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0648\u0623\u0639\u062f \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629" : "Check connection and retry"}
            </p>
          </div>
          <button onClick={loadAndRender} className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-black rounded-sm">
            {isArabic ? "\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629" : "Retry"}
          </button>
        </div>
      )}
      {status === "ready" && Array.from({ length: numPages }, (_, i) => (
        <div key={i} className="rounded-sm overflow-hidden shadow-2xl max-w-full">
          <canvas ref={(el) => { canvasRefs.current[i] = el; }} style={{ display: "block", maxWidth: "100%" }} />
        </div>
      ))}
    </div>
  );
}