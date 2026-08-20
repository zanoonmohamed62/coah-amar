"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MessageCircle, Loader2, WifiOff, ShieldCheck } from "lucide-react";
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

  useEffect(() => {
    let cancelled = false;
    pdfDoc.getPage(pageNum).then((page: any) => {
      if (cancelled || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d")!;
      const dpr = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale });
      // Set physical pixel size (multiplied by DPR for crisp rendering)
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      // Set CSS display size to the logical viewport size (no stretching)
      canvas.style.width = viewport.width + "px";
      canvas.style.height = viewport.height + "px";
      // Scale context so pdf.js draws at logical coords but renders at physical resolution
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      page.render({ canvasContext: ctx, viewport });
    });
    return () => { cancelled = true; };
  }, [pdfDoc, pageNum, scale]);

  return (
    <div className="relative select-none overflow-x-auto flex justify-center bg-white" style={{ userSelect: "none" }}>
      <canvas
        ref={canvasRef}
        style={{ pointerEvents: "none", display: "block", maxWidth: "100%", height: "auto" }}
      />
      {/* Anti-screenshot overlay — transparent, blocks context menu & drag */}
      <div
        className="absolute inset-0"
        style={{ pointerEvents: "auto", userSelect: "none" }}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
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
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-sm overflow-hidden shadow-2xl h-[80vh] min-h-[600px] flex flex-col relative select-none">
        
        {/* Simple Viewer Header */}
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-emerald-400" />
            <span className="text-xs font-black text-[var(--text-primary)] tracking-wide">
              {isArabic ? "عرض آمن" : "Secure View"}
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] opacity-60">
            {isArabic ? "لا يمكن النسخ أو التحميل" : "Cannot copy or download"}
          </span>
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
