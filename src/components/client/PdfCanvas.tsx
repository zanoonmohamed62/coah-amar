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
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTasks = useRef<{ [key: number]: any }>({});
  const resizeTimer = useRef<NodeJS.Timeout | null>(null);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errMsg, setErrMsg] = useState("");
  const [numPages, setNumPages] = useState(0);
  const [isOfflineCached, setIsOfflineCached] = useState(false);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);
  
  // Anti-screenshot state
  const [isBlurred, setIsBlurred] = useState(false);

  // 1. Anti-Screenshot & Copy Protection logic
  useEffect(() => {
    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);
    const handleVisibility = () => {
      if (document.hidden) setIsBlurred(true);
      else setIsBlurred(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block PrintScreen, Ctrl+P, Ctrl+S, CMD+Shift+3, CMD+Shift+4
      if (e.key === "PrintScreen" || 
         (e.ctrlKey && (e.key === "p" || e.key === "s" || e.key === "c")) ||
         (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5" || e.key === "s"))) {
        e.preventDefault();
        setIsBlurred(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        navigator.clipboard.writeText(""); // Clear clipboard to ruin print screen
        setTimeout(() => setIsBlurred(false), 2000); // Keep it blurred a bit
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // 2. Render a single page safely, with annotation layer (links)
  const renderPage = useCallback(async (pageNum: number, containerWidth: number, zoom: number) => {
    const pdf = pdfRef.current;
    if (!pdf) return;

    const pageIndex = pageNum - 1;
    const canvas = canvasRefs.current[pageIndex];
    const overlay = overlayRefs.current[pageIndex];
    if (!canvas || !overlay) return;

    // Cancel existing render task on this canvas if any
    if (renderTasks.current[pageIndex]) {
      try {
        renderTasks.current[pageIndex].cancel();
      } catch { /* Ignore */ }
      renderTasks.current[pageIndex] = null;
    }

    try {
      const page = await pdf.getPage(pageNum);
      const unscaledViewport = page.getViewport({ scale: 1 });
      
      const targetWidth = Math.max((containerWidth - 32) * zoom, 280);
      const computedScale = targetWidth / unscaledViewport.width;
      const viewport = page.getViewport({ scale: computedScale });
      const dpr = Math.min(window.devicePixelRatio || 2, 2.5);

      // Canvas dimensions (high res)
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      // Overlay dimensions (CSS pixels to match layout)
      overlay.style.width = `${Math.floor(viewport.width)}px`;
      overlay.style.height = `${Math.floor(viewport.height)}px`;
      overlay.innerHTML = ""; // Clear old links

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

      // Extract and render Annotations (Links)
      const annotations = await page.getAnnotations();
      annotations.forEach((anno: any) => {
        if (anno.subtype !== "Link" || !anno.rect) return;

        const rect = viewport.convertToViewportRectangle(anno.rect);
        // rect is [x1, y1, x2, y2]
        const x = Math.min(rect[0], rect[2]);
        const y = Math.min(rect[1], rect[3]);
        const w = Math.abs(rect[2] - rect[0]);
        const h = Math.abs(rect[3] - rect[1]);

        const a = document.createElement("a");
        a.className = "absolute cursor-pointer transition-colors hover:bg-blue-500/10";
        a.style.left = `${x}px`;
        a.style.top = `${y}px`;
        a.style.width = `${w}px`;
        a.style.height = `${h}px`;

        if (anno.url) {
          a.href = anno.url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        } else if (anno.dest) {
          a.href = "#";
          a.onclick = async (e) => {
            e.preventDefault();
            try {
              let dest = anno.dest;
              if (typeof dest === "string") {
                dest = await pdfRef.current.getDestination(dest);
              }
              if (dest) {
                const targetPageIndex = await pdfRef.current.getPageIndex(dest[0]);
                const targetPageDiv = document.getElementById(`pdf-page-${targetPageIndex + 1}`);
                if (targetPageDiv) {
                  targetPageDiv.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }
            } catch (err) {
              console.warn("Could not jump to destination", err);
            }
          };
        }
        overlay.appendChild(a);
      });

    } catch (err: unknown) {
      if (err && typeof err === "object" && "name" in err && err.name === "RenderingCancelledException") {
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

      // Configure PDF.js with local offline CMaps and standard fonts for crisp text
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buf.slice(0)),
        cMapUrl: "/pdfjs/cmaps/",
        cMapPacked: true,
        standardFontDataUrl: "/pdfjs/standard_fonts/",
        enableXfa: true,
        disableFontFace: false,
        fontExtraProperties: true,
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
    let lastWidth = viewerRef.current.clientWidth;
    
    const ro = new ResizeObserver(() => {
      if (status !== "ready" || !viewerRef.current) return;
      const newWidth = viewerRef.current.clientWidth;
      
      // Ignore tiny changes to prevent infinite resize loops
      if (Math.abs(newWidth - lastWidth) < 10) return;
      lastWidth = newWidth;
      
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
      resizeTimer.current = setTimeout(() => {
        renderAll();
      }, 250);
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

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 relative">
      {/* Top Toolbar: Offline indicator & Zoom controls */}
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
          <button
            onClick={() => handleZoom(-0.15)}
            className="p-1 hover:bg-white/10 rounded-sm text-[var(--text-muted)] hover:text-white transition-colors"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-[10px] font-mono text-[var(--text-muted)] w-9 text-center">
            {Math.round(scaleMultiplier * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.15)}
            className="p-1 hover:bg-white/10 rounded-sm text-[var(--text-muted)] hover:text-white transition-colors"
          >
            <ZoomIn size={14} />
          </button>
          {scaleMultiplier !== 1 && (
            <button
              onClick={() => setScaleMultiplier(1)}
              className="p-1 hover:bg-white/10 rounded-sm text-blue-400 transition-colors ml-1"
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Viewer Area */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print-pdf { display: none !important; }
        }
      `}} />
      <div
        ref={viewerRef}
        className="no-print-pdf flex-1 w-full overflow-y-auto bg-[#070a0f] flex flex-col items-center gap-5 p-4 relative"
        onContextMenu={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          filter: isBlurred ? "blur(15px) grayscale(100%)" : "none",
          transition: "filter 0.2s ease-out"
        }}
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
            <div className="text-center">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {isArabic ? "تعذر تحميل الجدول" : "Failed to load"}
              </p>
            </div>
            <button
              onClick={loadDocument}
              className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-black rounded-sm"
            >
              {isArabic ? "إعادة المحاولة" : "Retry"}
            </button>
          </div>
        )}

        {status === "ready" && Array.from({ length: numPages }, (_, i) => (
          <div
            key={i}
            id={`pdf-page-${i + 1}`}
            className="relative rounded-sm overflow-hidden shadow-2xl bg-white max-w-full border border-white/5"
          >
            {/* Base Canvas */}
            <canvas
              ref={(el) => { canvasRefs.current[i] = el; }}
              style={{ display: "block", maxWidth: "100%" }}
            />
            
            {/* Interactive Links Overlay */}
            <div 
              ref={(el) => { overlayRefs.current[i] = el; }}
              className="absolute inset-0 z-10 pointer-events-auto"
            />
          </div>
        ))}
      </div>
    </div>
  );
}