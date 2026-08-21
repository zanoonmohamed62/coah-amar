"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Maximize2, Minimize2, ChevronLeft, ChevronRight,
  MessageCircle, Loader2, WifiOff, ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const WA = process.env.NEXT_PUBLIC_COACH_WHATSAPP?.replace("+", "") || "34610354255";

// ── IndexedDB helpers ─────────────────────────────────────────────────────────
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

// ── Canvas renderer for one page ──────────────────────────────────────────────
function renderPage(
  pdf: import("pdfjs-dist").PDFDocumentProxy,
  pageNum: number,
  canvas: HTMLCanvasElement,
  containerWidth: number,
): Promise<void> {
  return pdf.getPage(pageNum).then((page) => {
    const dpr      = typeof window !== "undefined" ? (window.devicePixelRatio || 2) : 2;
    const viewport = page.getViewport({ scale: 1 });
    const scale    = containerWidth / viewport.width;
    const scaled   = page.getViewport({ scale });

    canvas.style.width  = `${scaled.width}px`;
    canvas.style.height = `${scaled.height}px`;
    canvas.width        = Math.floor(scaled.width  * dpr);
    canvas.height       = Math.floor(scaled.height * dpr);

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    return page.render({ canvasContext: ctx, viewport: scaled }).promise;
  });
}

export default function MySplitPage() {
  const { isArabic }  = useLanguage();
  const ArrowIcon     = isArabic ? ChevronRight : ChevronLeft;

  const containerRef  = useRef<HTMLDivElement>(null);
  const viewerRef     = useRef<HTMLDivElement>(null);
  const [status,       setStatus]      = useState<"loading" | "ready" | "error">("loading");
  const [numPages,     setNumPages]    = useState(0);
  const [isFullscreen, setIsFullscreen]= useState(false);
  const pdfRef        = useRef<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const canvasRefs    = useRef<(HTMLCanvasElement | null)[]>([]);

  // ── Load & render PDF ──────────────────────────────────────────────────────
  const loadAndRender = useCallback(async () => {
    setStatus("loading");

    // Dynamically import pdfjs-dist (avoids SSR issues)
    const pdfjs = (await import("pdfjs-dist")).default ?? (await import("pdfjs-dist"));
    pdfjs.GlobalWorkerOptions.workerSrc =
      `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    let buf = await getCached();
    if (!buf) {
      try {
        const res = await fetch("/api/split", { cache: "no-store" });
        if (!res.ok) throw new Error();
        buf = await res.arrayBuffer();
        await saveToCache(buf);
      } catch {
        setStatus("error");
        return;
      }
    }

    try {
      const pdf = await pdfjs.getDocument({ data: buf }).promise;
      pdfRef.current = pdf;
      setNumPages(pdf.numPages);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  // ── Render canvases when pages mount ──────────────────────────────────────
  const renderAll = useCallback(() => {
    const pdf = pdfRef.current;
    if (!pdf || !viewerRef.current) return;
    const containerW = viewerRef.current.clientWidth - 32;
    canvasRefs.current.forEach((canvas, i) => {
      if (canvas) renderPage(pdf, i + 1, canvas, containerW);
    });
  }, []);

  useEffect(() => { loadAndRender(); }, [loadAndRender]);

  // Re-render on resize
  useEffect(() => {
    const observer = new ResizeObserver(() => renderAll());
    if (viewerRef.current) observer.observe(viewerRef.current);
    return () => observer.disconnect();
  }, [renderAll]);

  // Render after pages state is set
  useEffect(() => {
    if (status === "ready") setTimeout(renderAll, 50);
  }, [status, numPages, renderAll]);

  // ── Fullscreen ─────────────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };
  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(renderAll, 100);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [renderAll]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shrink-0">
        <div>
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-2 transition-colors"
          >
            <ArrowIcon size={14} />
            <span>{isArabic ? "العودة للرئيسية" : "Back to Dashboard"}</span>
          </Link>
          <h1 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <span className="text-[var(--accent)]">THE AMMAR</span> &ldquo;X SPLIT&rdquo;
          </h1>
        </div>

        <a
          href={`https://wa.me/${WA}?text=${encodeURIComponent(
            isArabic ? "مرحباً كوتش عمار، لدي استفسار" : "Hi Coach Amar, I have a question about the X Split"
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs font-bold rounded-sm transition-colors flex items-center gap-1.5"
        >
          <MessageCircle size={13} />
          <span>{isArabic ? "واتساب الكوتش" : "Ask Coach"}</span>
        </a>
      </div>

      {/* PDF Viewer */}
      <div
        ref={containerRef}
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-sm overflow-hidden shadow-2xl flex flex-col flex-1"
        style={{ minHeight: "75vh" }}
      >
        {/* Toolbar */}
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-blue-400" />
            <span className="text-xs font-black text-[var(--text-primary)] tracking-wide">
              {isArabic ? "الجدول الرسمي" : "Official Split"}
            </span>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-white/5 rounded-sm text-[var(--text-primary)] hover:text-white transition-colors flex items-center gap-2"
          >
            <span className="text-xs font-bold">
              {isFullscreen
                ? (isArabic ? "تصغير"       : "Exit Fullscreen")
                : (isArabic ? "تكبير الشاشة" : "Fullscreen")}
            </span>
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        {/* Canvas area */}
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
                {isArabic ? "جار التحميل..." : "Loading..."}
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0d121c] z-10">
              <WifiOff size={36} className="text-red-400" />
              <div className="text-center">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {isArabic ? "تعذر تحميل الجدول" : "Failed to load"}
                </p>
                <p className="text-xs opacity-60 mt-1">
                  {isArabic ? "تأكد من الاتصال وأعد المحاولة" : "Check connection and retry"}
                </p>
              </div>
              <button
                onClick={loadAndRender}
                className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-black rounded-sm"
              >
                {isArabic ? "إعادة المحاولة" : "Retry"}
              </button>
            </div>
          )}

          {status === "ready" &&
            Array.from({ length: numPages }, (_, i) => (
              <div
                key={i}
                className="rounded-sm overflow-hidden shadow-2xl max-w-full"
              >
                <canvas
                  ref={(el) => { canvasRefs.current[i] = el; }}
                  style={{ display: "block", maxWidth: "100%" }}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

const WA = process.env.NEXT_PUBLIC_COACH_WHATSAPP?.replace("+", "") || "34610354255";

export default function MySplitPage() {
  const { isArabic } = useLanguage();
  const ArrowIcon = isArabic ? ChevronRight : ChevronLeft;

  const [numPages, setNumPages] = useState<number>();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [devicePixelRatio, setDevicePixelRatio] = useState(2); // Default high-res

  useEffect(() => {
    setDevicePixelRatio(window.devicePixelRatio || 2);
    
    // Auto scale based on container width
    const updateScale = () => {
      if (viewerRef.current) {
        // PDF default width is around 600-800 usually. We want to fit it to the container.
        const width = viewerRef.current.clientWidth;
        // Assume PDF width ~800px for scaling factor calculation, adjust to fit width
        setScale((width - 32) / 800); 
      }
    };
    
    window.addEventListener('resize', updateScale);
    updateScale();
    // delay a bit to let layout settle
    setTimeout(updateScale, 100);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Let scale update after layout changes
      setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setStatus("ready");
  }

  function onDocumentLoadError() {
    setStatus("error");
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shrink-0">
        <div>
          <Link href="/app" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-2 transition-colors">
            <ArrowIcon size={14} />
            <span>{isArabic ? "العودة للرئيسية" : "Back to Dashboard"}</span>
          </Link>
          <h1 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <span className="text-[var(--accent)]">THE AMMAR</span> &ldquo;X SPLIT&rdquo;
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a href={`https://wa.me/${WA}?text=${encodeURIComponent(isArabic ? "مرحباً كوتش عمار، لدي استفسار" : "Hi Coach Amar, I have a question about the X Split")}`}
            target="_blank" rel="noopener noreferrer"
            className="px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold rounded-sm transition-colors flex items-center gap-1.5">
            <MessageCircle size={13} />
            <span>{isArabic ? "واتساب الكوتش" : "Ask Coach"}</span>
          </a>
        </div>
      </div>

      {/* PDF Viewer Container */}
      <div 
        ref={containerRef} 
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-sm overflow-hidden shadow-2xl flex flex-col flex-1"
        style={{ minHeight: "75vh" }}
      >
        {/* Simple Viewer Header */}
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-400" />
              <span className="text-xs font-black text-[var(--text-primary)] tracking-wide">
                {isArabic ? "الجدول الرسمي" : "Official Split"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleFullscreen}
              className="p-1.5 hover:bg-white/5 rounded-sm text-[var(--text-primary)] hover:text-white transition-colors flex items-center gap-2"
              title={isFullscreen ? (isArabic ? "تصغير" : "Exit Fullscreen") : (isArabic ? "ملء الشاشة" : "Fullscreen")}
            >
              <span className="text-xs font-bold">{isFullscreen ? (isArabic ? "تصغير" : "Exit Fullscreen") : (isArabic ? "تكبير الشاشة" : "Fullscreen")}</span>
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        {/* Secure PDF Container */}
        <div 
          ref={viewerRef}
          className="flex-1 w-full h-full bg-[#0d121c] relative overflow-y-auto custom-scrollbar flex flex-col items-center py-4 select-none"
          onContextMenu={(e) => e.preventDefault()}
        >
          {status === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-[var(--text-muted)] z-10 bg-[#0d121c]">
              <Loader2 size={36} className="animate-spin text-[var(--accent)]" />
              <div className="text-center">
                <p className="text-sm font-semibold">{isArabic ? "جار التحميل..." : "Loading..."}</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-[var(--text-muted)] z-10 bg-[#0d121c]">
              <WifiOff size={36} className="text-red-400" />
              <div className="text-center">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{isArabic ? "تعذر تحميل الجدول" : "Failed to load"}</p>
                <p className="text-xs opacity-60 mt-1">{isArabic ? "يرجى التحقق من اتصالك وإعادة المحاولة" : "Please check your connection and try again"}</p>
              </div>
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[var(--accent)] text-black text-xs font-black rounded-sm">
                {isArabic ? "إعادة المحاولة" : "Retry"}
              </button>
            </div>
          )}

          <Document
            file="/api/split"
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null} // Handled custom loading above
            error={null}
            className="flex flex-col gap-4 max-w-full"
          >
            {Array.from(new Array(numPages), (el, index) => (
              <div key={`page_${index + 1}`} className="shadow-2xl mx-auto rounded-sm overflow-hidden bg-white max-w-full">
                <Page
                  pageNumber={index + 1}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  devicePixelRatio={Math.max(2, devicePixelRatio)}
                  width={viewerRef.current ? Math.min(viewerRef.current.clientWidth - 32, 1200) : 800}
                  loading={
                    <div className="w-[800px] max-w-full aspect-[1/1.414] bg-white/5 animate-pulse flex items-center justify-center" />
                  }
                />
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}
