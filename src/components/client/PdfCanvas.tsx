"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, WifiOff, CheckCircle2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

const IDB_DB    = "amar-split-cache";
const IDB_STORE = "pdf-blobs";
const IDB_KEY   = "amarx-split-v2"; // bumped key to force re-fetch after upgrade

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, 2);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(IDB_STORE)) {
        req.result.createObjectStore(IDB_STORE);
      }
    };
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
      r.onsuccess = () => {
        const v = r.result;
        res(v instanceof ArrayBuffer && v.byteLength > 0 ? v : null);
      };
      r.onerror = () => rej(r.error);
    });
  } catch { return null; }
}

async function saveToCache(buf: ArrayBuffer): Promise<void> {
  try {
    const db = await openIDB();
    await new Promise<void>((res, rej) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(buf.slice(0), IDB_KEY);
      tx.oncomplete = () => res();
      tx.onerror    = () => rej(tx.error);
    });
  } catch { /* silent */ }
}

interface Props {
  isArabic: boolean;
}

export default function PdfCanvas({ isArabic }: Props) {
  const viewerRef   = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfRef      = useRef<any>(null);
  const canvasRefs  = useRef<(HTMLCanvasElement | null)[]>([]);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTasks = useRef<{ [key: number]: any }>({});
  const resizeTimer = useRef<NodeJS.Timeout | null>(null);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errMsg, setErrMsg] = useState("");
  const [numPages, setNumPages] = useState(0);
  const [isOfflineCached, setIsOfflineCached] = useState(false);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);

  // Render a single page with annotation links
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderPage = useCallback(async (pageNum: number, containerWidth: number, zoom: number) => {
    const pdf = pdfRef.current;
    if (!pdf) return;

    const pageIndex = pageNum - 1;
    const canvas = canvasRefs.current[pageIndex];
    const overlay = overlayRefs.current[pageIndex];
    if (!canvas || !overlay) return;

    // Cancel existing render task
    if (renderTasks.current[pageIndex]) {
      try { renderTasks.current[pageIndex].cancel(); } catch { /* ignore */ }
      renderTasks.current[pageIndex] = null;
    }

    try {
      const page = await pdf.getPage(pageNum);
      const baseViewport = page.getViewport({ scale: 1 });

      const targetWidth = Math.max((containerWidth - 32) * zoom, 280);
      const computedScale = targetWidth / baseViewport.width;
      const viewport = page.getViewport({ scale: computedScale });
      const dpr = Math.min(window.devicePixelRatio || 2, 2.5);

      // Set canvas dimensions
      canvas.width  = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width  = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      // Match overlay to canvas
      overlay.style.width  = `${Math.floor(viewport.width)}px`;
      overlay.style.height = `${Math.floor(viewport.height)}px`;
      overlay.innerHTML = "";

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const task = page.render({
        canvasContext: ctx,
        viewport,
        intent: "display",
      });

      renderTasks.current[pageIndex] = task;
      await task.promise;
      renderTasks.current[pageIndex] = null;

      // Build annotation (link) overlay
      const annotations = await page.getAnnotations();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      annotations.forEach((anno: any) => {
        if (anno.subtype !== "Link" || !anno.rect) return;

        const rect = viewport.convertToViewportRectangle(anno.rect);
        const x = Math.min(rect[0], rect[2]);
        const y = Math.min(rect[1], rect[3]);
        const w = Math.abs(rect[2] - rect[0]);
        const h = Math.abs(rect[3] - rect[1]);

        const a = document.createElement("a");
        a.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;cursor:pointer;`;

        if (anno.url) {
          a.href = anno.url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        } else if (anno.dest) {
          a.href = "#";
          a.addEventListener("click", async (e) => {
            e.preventDefault();
            try {
              let dest = anno.dest;
              if (typeof dest === "string") dest = await pdfRef.current.getDestination(dest);
              if (dest) {
                const idx = await pdfRef.current.getPageIndex(dest[0]);
                document.getElementById(`pdf-page-${idx + 1}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            } catch { /* ignore */ }
          });
        }
        overlay.appendChild(a);
      });

    } catch (err: unknown) {
      if (err && typeof err === "object" && "name" in err && (err as { name: string }).name === "RenderingCancelledException") return;
      console.warn(`[PdfCanvas] Page ${pageNum} render issue:`, err);
    }
  }, []);

  const renderAll = useCallback(async () => {
    if (!pdfRef.current || !viewerRef.current) return;
    const containerW = viewerRef.current.clientWidth;
    for (let i = 1; i <= pdfRef.current.numPages; i++) {
      await renderPage(i, containerW, scaleMultiplier);
    }
  }, [renderPage, scaleMultiplier]);

  // Load PDF document (pdfjs v4)
  const loadDocument = useCallback(async () => {
    setStatus("loading");
    setErrMsg("");

    try {
      const pdfjsLib = await import("pdfjs-dist");
      // pdfjs v4 uses .mjs worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

      let buf = await getCached();
      if (buf) {
        setIsOfflineCached(true);
      } else {
        const res = await fetch("/api/split", { cache: "no-store" });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        buf = await res.arrayBuffer();
        await saveToCache(buf);
        setIsOfflineCached(true);
      }

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buf.slice(0)),
        cMapUrl: "/pdfjs/cmaps/",
        cMapPacked: true,
        standardFontDataUrl: "/pdfjs/standard_fonts/",
        enableXfa: true,
        disableFontFace: false,
      });

      const pdf = await loadingTask.promise;
      pdfRef.current = pdf;
      setNumPages(pdf.numPages);
      setStatus("ready");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[PdfCanvas]", msg);
      setErrMsg(msg);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadDocument();
    return () => {
      Object.values(renderTasks.current).forEach((t) => { try { t?.cancel(); } catch { /* */ } });
    };
  }, [loadDocument]);

  useEffect(() => {
    if (status === "ready" && numPages > 0) {
      const t = setTimeout(() => renderAll(), 60);
      return () => clearTimeout(t);
    }
  }, [status, numPages, renderAll]);

  // Debounced resize
  useEffect(() => {
    if (!viewerRef.current) return;
    let lastW = viewerRef.current.clientWidth;
    const ro = new ResizeObserver(() => {
      if (status !== "ready" || !viewerRef.current) return;
      const w = viewerRef.current.clientWidth;
      if (Math.abs(w - lastW) < 10) return;
      lastW = w;
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
      resizeTimer.current = setTimeout(() => renderAll(), 250);
    });
    ro.observe(viewerRef.current);
    return () => { ro.disconnect(); if (resizeTimer.current) clearTimeout(resizeTimer.current); };
  }, [status, renderAll]);

  const handleZoom = (d: number) => setScaleMultiplier((p) => Math.min(Math.max(+(p + d).toFixed(2), 0.7), 2.0));

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 relative">
      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-[var(--border)] bg-[#0b0f17] flex items-center justify-between text-xs shrink-0 z-20 select-none">
        <div className="flex items-center gap-2">
          {isOfflineCached && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <CheckCircle2 size={13} />
              {isArabic ? "متاح بدون إنترنت" : "Offline Ready"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-sm border border-white/10">
          <button onClick={() => handleZoom(-0.15)} className="p-1 hover:bg-white/10 rounded-sm text-[var(--text-muted)] hover:text-white transition-colors">
            <ZoomOut size={14} />
          </button>
          <span className="text-[10px] font-mono text-[var(--text-muted)] w-9 text-center">{Math.round(scaleMultiplier * 100)}%</span>
          <button onClick={() => handleZoom(0.15)} className="p-1 hover:bg-white/10 rounded-sm text-[var(--text-muted)] hover:text-white transition-colors">
            <ZoomIn size={14} />
          </button>
          {scaleMultiplier !== 1 && (
            <button onClick={() => setScaleMultiplier(1)} className="p-1 hover:bg-white/10 rounded-sm text-blue-400 transition-colors ml-1">
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Print block */}
      <style dangerouslySetInnerHTML={{ __html: `@media print { .no-print-pdf { display: none !important; } }` }} />

      {/* Viewer */}
      <div
        ref={viewerRef}
        className="no-print-pdf flex-1 w-full overflow-y-auto bg-[#070a0f] flex flex-col items-center gap-5 p-4 relative"
        onContextMenu={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
      >
        {status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#070a0f] z-10">
            <Loader2 size={36} className="animate-spin text-[var(--accent)]" />
            <p className="text-sm font-semibold text-[var(--text-muted)]">
              {isArabic ? "جاري تحميل الجدول..." : "Loading split..."}
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#070a0f] z-10 px-6">
            <WifiOff size={36} className="text-red-400" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {isArabic ? "تعذر تحميل الجدول" : "Failed to load"}
            </p>
            <button onClick={loadDocument} className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-black rounded-sm">
              {isArabic ? "إعادة المحاولة" : "Retry"}
            </button>
          </div>
        )}

        {status === "ready" && Array.from({ length: numPages }, (_, i) => (
          <div key={i} id={`pdf-page-${i + 1}`} className="relative rounded-sm overflow-hidden shadow-2xl bg-white max-w-full border border-white/5">
            <canvas ref={(el) => { canvasRefs.current[i] = el; }} style={{ display: "block", maxWidth: "100%" }} />
            <div ref={(el) => { overlayRefs.current[i] = el; }} className="absolute inset-0 z-10" />
          </div>
        ))}
      </div>
    </div>
  );
}