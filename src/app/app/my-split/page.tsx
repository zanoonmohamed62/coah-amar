"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Maximize2, Minimize2, ChevronLeft, ChevronRight, MessageCircle, Loader2, WifiOff, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const WA = process.env.NEXT_PUBLIC_COACH_WHATSAPP?.replace("+", "") || "34610354255";

// ── IndexedDB helpers ────────────────────────────────────────────────────────
const IDB_DB = "amar-split-cache";
const IDB_STORE = "pdf-blobs";
const IDB_KEY = "amarx-split";

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function getCached(): Promise<ArrayBuffer | null> {
  try {
    const db = await openIDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const r = tx.objectStore(IDB_STORE).get(IDB_KEY);
      r.onsuccess = () => res(r.result ?? null);
      r.onerror = () => rej(r.error);
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
      tx.onerror = () => rej(tx.error);
    });
  } catch { /* silent */ }
}

// ── PDF Canvas Page Renderer ─────────────────────────────────────────────────
function PdfCanvasPage({ pdfDoc, pageNum, scale }: { pdfDoc: any; pageNum: number; scale: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [links, setLinks] = useState<Array<{ url: string; x: number; y: number; width: number; height: number }>>([]);

  useEffect(() => {
    let cancelled = false;
    pdfDoc.getPage(pageNum).then((page: any) => {
      if (cancelled || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d")!;
      const dpr = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale });
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = viewport.width + "px";
      canvas.style.height = viewport.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      page.render({ canvasContext: ctx, viewport });

      // Extract clickable links
      page.getAnnotations().then((annData: any[]) => {
        if (cancelled) return;
        const linkNodes = annData
          .filter((a) => a.subtype === "Link" && a.url)
          .map((a) => {
            const rect = viewport.convertToViewportRectangle(a.rect);
            const [x1, y1, x2, y2] = rect;
            return {
              url: a.url,
              x: Math.min(x1, x2),
              y: Math.min(y1, y2),
              width: Math.abs(x1 - x2),
              height: Math.abs(y1 - y2),
            };
          });
        setLinks(linkNodes);
      });
    });
    return () => { cancelled = true; };
  }, [pdfDoc, pageNum, scale]);

  return (
    <div className="relative select-none overflow-hidden flex justify-center bg-white" style={{ userSelect: "none" }}>
      <canvas
        ref={canvasRef}
        style={{ pointerEvents: "none", display: "block", maxWidth: "100%", height: "auto" }}
      />
      {/* Anti-screenshot overlay — blocks context menu & drag */}
      <div
        className="absolute inset-0 z-10"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
      {/* Invisible Link Overlays */}
      <div className="absolute inset-0 z-20" style={{ pointerEvents: "none" }}>
        {links.map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute cursor-pointer hover:bg-blue-500/10 transition-colors"
            style={{
              left: `${link.x}px`,
              top: `${link.y}px`,
              width: `${link.width}px`,
              height: `${link.height}px`,
              pointerEvents: "auto",
            }}
            title={link.url}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function MySplitPage() {
  const { isArabic } = useLanguage();
  const ArrowIcon = isArabic ? ChevronRight : ChevronLeft;

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const scale = 1.3; // Fixed scale for good readability on mobile/desktop
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const loadPdf = useCallback(async () => {
    setStatus("loading");
    setPdfDoc(null);

    // Dynamically import pdfjs-dist
    const pdfjsLib = await import("pdfjs-dist");
    // @ts-ignore
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

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
      const loadingTask = pdfjsLib.getDocument({ data: buf });
      const doc = await loadingTask.promise;
      setPdfDoc(doc);
      setNumPages(doc.numPages);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => { loadPdf(); }, [loadPdf]);

  // Block keyboard shortcuts for saving/printing globally on this page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "p")) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <Link href="/app" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-2 transition-colors">
            <ArrowIcon size={14} />
            <span>{isArabic ? "العودة للرئيسية" : "Back to Dashboard"}</span>
          </Link>
          <h1 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <span className="text-[var(--accent)]">THE AMMAR</span> &ldquo;X SPLIT&rdquo;
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {isArabic ? "الجدول التدريبي الرسمي — مخصص لك شخصياً" : "Your official personal training split by Coach Amar"}
          </p>
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

      {/* PDF Canvas Viewer Container */}
      <div 
        ref={containerRef} 
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-sm overflow-hidden shadow-2xl flex flex-col relative select-none"
        style={{ height: isFullscreen ? "100vh" : "80vh", minHeight: "600px" }}
      >
        
        {/* Simple Viewer Header */}
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-400" />
              <span className="text-xs font-black text-[var(--text-primary)] tracking-wide">
                {isArabic ? "عرض آمن" : "Secure View"}
              </span>
            </div>
            {numPages > 0 && (
              <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-base)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                {numPages} {isArabic ? "صفحة" : "pages"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[var(--text-muted)] opacity-60 hidden sm:inline-block">
              {isArabic ? "لا يمكن النسخ أو التحميل" : "Cannot copy or download"}
            </span>
            <button 
              onClick={toggleFullscreen}
              className="p-1.5 hover:bg-white/5 rounded-sm text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-1.5"
              title={isFullscreen ? (isArabic ? "تصغير" : "Exit Fullscreen") : (isArabic ? "ملء الشاشة" : "Fullscreen")}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>

        {/* Custom Canvas Container */}
        <div className="flex-1 overflow-y-auto bg-[#0d121c] p-4 sm:p-8 space-y-6 custom-scrollbar" onContextMenu={(e) => e.preventDefault()}>
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--text-muted)]">
              <Loader2 size={36} className="animate-spin text-[var(--accent)]" />
              <div className="text-center">
                <p className="text-sm font-semibold">{isArabic ? "جار التحميل الآمن..." : "Securely loading..."}</p>
                <p className="text-xs opacity-60 mt-1">{isArabic ? "يتم حماية المحتوى وتشفيره" : "Content is being protected"}</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--text-muted)]">
              <WifiOff size={36} className="text-red-400" />
              <div className="text-center">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{isArabic ? "لا يوجد اتصال" : "No connection"}</p>
                <p className="text-xs opacity-60 mt-1">{isArabic ? "تأكد من اتصالك بالانترنت أول مرة" : "Connect to the internet first time"}</p>
              </div>
              <button onClick={() => loadPdf()} className="px-4 py-2 bg-[var(--accent)] text-black text-xs font-black rounded-sm">
                {isArabic ? "إعادة المحاولة" : "Retry"}
              </button>
            </div>
          )}

          {pdfDoc && Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <div key={pageNum} className="shadow-2xl rounded-sm overflow-hidden mx-auto border border-white/5 bg-white relative" style={{ maxWidth: "max-content" }}>
              <PdfCanvasPage pdfDoc={pdfDoc} pageNum={pageNum} scale={scale} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
