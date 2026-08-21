"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, WifiOff, CheckCircle2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

const IDB_DB    = "amar-split-cache";
const IDB_STORE = "pdf-blobs";
const IDB_KEY   = "amarx-split";

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, 1);
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTasks = useRef<{ [key: number]: any }>({});
  const resizeTimer = useRef<NodeJS.Timeout | null>(null);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errMsg, setErrMsg] = useState("");
  const [numPages, setNumPages] = useState(0);
  const [isOfflineCached, setIsOfflineCached] = useState(false);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);

  // Render a single page safely
  const renderPage = useCallback(async (pageNum: number, containerWidth: number, zoom: number) => {
    const pdf = pdfRef.current;
    if (!pdf) return;

    const pageIndex = pageNum - 1;
    const canvas = canvasRefs.current[pageIndex];
    if (!canvas) return;

    // Cancel existing render task on this canvas if any
    if (renderTasks.current[pageIndex]) {
      try {
        renderTasks.current[pageIndex].cancel();
      } catch {
        // Ignore cancel errors
      }
      renderTasks.current[pageIndex] = null;
    }

    try {
      const page = await pdf.getPage(pageNum);
      const unscaledViewport = page.getViewport({ scale: 1 });
      
      const targetWidth = Math.max((containerWidth - 32) * zoom, 280);
      const computedScale = targetWidth / unscaledViewport.width;
      const viewport = page.getViewport({ scale: computedScale });
      const dpr = Math.min(window.devicePixelRatio || 2, 2.5);

      canvas.style.width  = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      canvas.width        = Math.floor(viewport.width * dpr);
      canvas.height       = Math.floor(viewport.height * dpr);

      const ctx = canvas.getContext("2d", { alpha: false });
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
    } catch (err: unknown) {
      if (err && typeof err === "object" && "name" in err && err.name === "RenderingCancelledException") {
        // Normal cancellation, do nothing
        return;
      }
      console.warn(`[PdfCanvas] Page ${pageNum} render issue:`, err);
    }
  }, []);

  // Render all pages in sequence
  const renderAll = useCallback(async () => {
    if (!pdfRef.current || !viewerRef.current) return;
    const containerW = viewerRef.current.clientWidth;
    for (let i = 1; i <= pdfRef.current.numPages; i++) {
      await renderPage(i, containerW, scaleMultiplier);
    }
  }, [renderPage, scaleMultiplier]);

  // Load PDF document
  const loadDocument = useCallback(async () => {
    setStatus("loading");
    setErrMsg("");

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

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

      // Configure PDF.js with local offline CMaps and standard fonts for crisp Arabic text
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
      console.error("[PdfCanvas] Error loading PDF:", msg);
      setErrMsg(msg);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadDocument();
    return () => {
      // Cleanup running tasks on unmount
      Object.values(renderTasks.current).forEach((task) => {
        try { task?.cancel(); } catch { /* noop */ }
      });
    };
  }, [loadDocument]);

  useEffect(() => {
    if (status === "ready" && numPages > 0) {
      const timer = setTimeout(() => {
        renderAll();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [status, numPages, renderAll]);

  // Debounced resize observer to eliminate blinking
  useEffect(() => {
    if (!viewerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (status !== "ready") return;
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
      resizeTimer.current = setTimeout(() => {
        renderAll();
      }, 150);
    });

    ro.observe(viewerRef.current);
    return () => {
      ro.disconnect();
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
    };
  }, [status, renderAll]);

  const handleZoom = (delta: number) => {
    setScaleMultiplier((prev) => Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.7), 2.0));
  };

  const handleResetZoom = () => {
    setScaleMultiplier(1);
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 relative select-none">
      {/* Top Toolbar: Offline indicator & Zoom controls */}
      <div className="px-4 py-2 border-b border-[var(--border)] bg-[#0b0f17] flex items-center justify-between text-xs shrink-0 z-20">
        <div className="flex items-center gap-2">
          {isOfflineCached && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <CheckCircle2 size={13} />
              {isArabic ? "متاح بدون إنترنت" : "Offline Ready"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-sm border border-white/10">
          <button
            onClick={() => handleZoom(-0.15)}
            className="p-1 hover:bg-white/10 rounded-sm text-[var(--text-muted)] hover:text-white transition-colors"
            title={isArabic ? "تصغير" : "Zoom Out"}
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-[10px] font-mono text-[var(--text-muted)] w-9 text-center">
            {Math.round(scaleMultiplier * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.15)}
            className="p-1 hover:bg-white/10 rounded-sm text-[var(--text-muted)] hover:text-white transition-colors"
            title={isArabic ? "تكبير" : "Zoom In"}
          >
            <ZoomIn size={14} />
          </button>
          {scaleMultiplier !== 1 && (
            <button
              onClick={handleResetZoom}
              className="p-1 hover:bg-white/10 rounded-sm text-blue-400 transition-colors ml-1"
              title={isArabic ? "إعادة الضبط" : "Reset Zoom"}
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Viewer Area */}
      <div
        ref={viewerRef}
        className="flex-1 w-full overflow-y-auto bg-[#070a0f] flex flex-col items-center gap-5 p-4 relative"
        onContextMenu={(e) => e.preventDefault()}
      >
        {status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#070a0f] z-10">
            <Loader2 size={36} className="animate-spin text-[var(--accent)]" />
            <p className="text-sm font-semibold text-[var(--text-muted)]">
              {isArabic ? "جاري تحميل الجدول بأعلى دقة..." : "Loading split with high quality..."}
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#070a0f] z-10 px-6">
            <WifiOff size={36} className="text-red-400" />
            <div className="text-center">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {isArabic ? "تعذر تحميل الجدول" : "Failed to load"}
              </p>
              {errMsg && (
                <p className="text-[11px] font-mono mt-2 text-red-400/80 break-all max-w-xs">{errMsg}</p>
              )}
            </div>
            <button
              onClick={loadDocument}
              className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-black rounded-sm hover:opacity-90 transition-opacity"
            >
              {isArabic ? "إعادة المحاولة" : "Retry"}
            </button>
          </div>
        )}

        {status === "ready" && Array.from({ length: numPages }, (_, i) => (
          <div
            key={i}
            className="rounded-sm overflow-hidden shadow-2xl bg-white max-w-full transition-shadow duration-200 border border-white/5"
          >
            <canvas
              ref={(el) => { canvasRefs.current[i] = el; }}
              style={{ display: "block", maxWidth: "100%" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}