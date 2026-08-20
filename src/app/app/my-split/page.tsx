"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  MessageCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Dumbbell,
  Flame,
  WifiOff,
  Loader2,
  ShieldCheck,
  RefreshCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
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
async function clearCache(): Promise<void> {
  try {
    const db = await openIDB();
    await new Promise<void>((res) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete(IDB_KEY);
      tx.oncomplete = () => res();
    });
  } catch { /* silent */ }
}

// ── PDF Canvas Page Renderer ─────────────────────────────────────────────────
function PdfCanvasPage({
  pdfDoc,
  pageNum,
  scale,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdfDoc: any;
  pageNum: number;
  scale: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    pdfDoc.getPage(pageNum).then((page: any) => {
      if (cancelled || !canvasRef.current) return;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d")!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      page.render({ canvasContext: ctx, viewport });
    });
    return () => { cancelled = true; };
  }, [pdfDoc, pageNum, scale]);

  return (
    <div className="relative select-none" style={{ userSelect: "none" }}>
      <canvas
        ref={canvasRef}
        className="w-full block"
        style={{ pointerEvents: "none", display: "block" }}
      />
      {/* Anti-screenshot overlay — transparent, blocks drag-to-save */}
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
  const [scale, setScale] = useState(1.2);
  const [status, setStatus] = useState<"loading" | "ready" | "cached" | "error">("loading");
  const [isCached, setIsCached] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // ── Load PDF (from network or IDB cache) ────────────────────
  const loadPdf = useCallback(async (forceRefresh = false) => {
    setStatus("loading");
    setPdfDoc(null);

    // Dynamically import pdfjs-dist (code-split, only loaded on this page)
    const pdfjsLib = await import("pdfjs-dist");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    let buf: ArrayBuffer | null = null;

    // 1. Check IDB cache first (offline-first)
    if (!forceRefresh) {
      buf = await getCached();
      if (buf) {
        setIsCached(true);
        setStatus("cached");
      }
    }

    // 2. Try network in background (or foreground if no cache)
    const fetchNetwork = async () => {
      try {
        const res = await fetch("/api/split", { cache: "no-store" });
        if (!res.ok) return null;
        return await res.arrayBuffer();
      } catch { return null; }
    };

    if (!buf) {
      // No cache — must fetch from network
      buf = await fetchNetwork();
      if (!buf) { setStatus("error"); return; }
      await saveToCache(buf);
      setIsCached(true);
      setStatus("ready");
    } else {
      // Had cache — fetch network silently to check for updates
      fetchNetwork().then(async (fresh) => {
        if (!fresh) return;
        // Simple size diff check as update signal
        const cachedBuf = await getCached();
        if (cachedBuf && fresh.byteLength !== cachedBuf.byteLength) {
          setUpdateAvailable(true);
        }
      });
    }

    // 3. Load into pdf.js
    const loadingTask = pdfjsLib.getDocument({ data: buf });
    const doc = await loadingTask.promise;
    setPdfDoc(doc);
    setNumPages(doc.numPages);
  }, []);

  useEffect(() => { loadPdf(); }, [loadPdf]);

  // Listen for SW update signal
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "PDF_UPDATED") setUpdateAvailable(true);
    };
    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, []);

  const handleRefresh = async () => {
    setUpdateAvailable(false);
    await clearCache();
    setIsCached(false);
    navigator.serviceWorker.controller?.postMessage({ type: "CLEAR_PDF_CACHE" });
    loadPdf(true);
  };

  const handleDownload = async () => {
    const buf = await getCached();
    if (!buf) return;
    const blob = new Blob([buf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "AMARX-SPLIT.pdf";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Update banner */}
      {updateAvailable && (
        <div className="p-3 bg-[#c4ff00]/10 border border-[#c4ff00]/30 rounded-sm flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-[#c4ff00]">
            🔄 {isArabic ? "الكوتش عمّر جدولك! تحديث جديد متاح." : "Coach updated your split! New version available."}
          </p>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 bg-[#c4ff00] text-black text-[11px] font-black rounded-sm flex items-center gap-1"
          >
            <RefreshCw size={11} />
            <span>{isArabic ? "تحديث" : "Update"}</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
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
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {isArabic
              ? "الجدول التدريبي الرسمي — مخصص لك شخصياً"
              : "Your official personal training split by Coach Amar"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-sm text-emerald-400 text-[11px] font-semibold">
            <ShieldCheck size={12} />
            <span>{isArabic ? "محمي" : "Protected"}</span>
          </div>
          {isCached && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-sm text-blue-400 text-[11px] font-semibold">
              <WifiOff size={12} />
              <span>{isArabic ? "أوفلاين جاهز" : "Offline Ready"}</span>
            </div>
          )}
          <button onClick={() => setScale((s) => Math.min(s + 0.2, 2.5))}
            className="p-2 border border-[var(--border)] rounded-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
            <ZoomIn size={14} />
          </button>
          <button onClick={() => setScale((s) => Math.max(s - 0.2, 0.6))}
            className="p-2 border border-[var(--border)] rounded-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
            <ZoomOut size={14} />
          </button>
          <button onClick={handleRefresh} disabled={status === "loading"}
            className="p-2 border border-[var(--border)] rounded-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            title={isArabic ? "تحديث" : "Refresh"}>
            <RefreshCw size={14} className={status === "loading" ? "animate-spin" : ""} />
          </button>
          <button onClick={handleDownload} disabled={!isCached}
            className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black text-xs font-black rounded-sm transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
            <Download size={14} />
            <span>{isArabic ? "تحميل" : "Download"}</span>
          </button>
          <a href={`https://wa.me/${WA}?text=${encodeURIComponent(isArabic ? "مرحباً كوتش عمار، لدي استفسار" : "Hi Coach Amar, I have a question about the X Split")}`}
            target="_blank" rel="noopener noreferrer"
            className="px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold rounded-sm transition-colors flex items-center gap-1.5">
            <MessageCircle size={13} />
            <span>{isArabic ? "واتساب الكوتش" : "Ask Coach"}</span>
          </a>
        </div>
      </div>

      {/* Program highlights */}
      <div className="p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-sm grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {[
          { icon: <Dumbbell size={16} />, color: "blue", label: isArabic ? "نوع النظام" : "Split Type", value: "Push / Pull / Legs" },
          { icon: <Sparkles size={16} />, color: "emerald", label: isArabic ? "المدة" : "Duration", value: isArabic ? "12 أسبوع" : "12 Weeks" },
          { icon: <Flame size={16} />, color: "purple", label: isArabic ? "الهدف" : "Target", value: isArabic ? "بناء عضلي وحرق" : "Hypertrophy & Recomp" },
          { icon: <CheckCircle2 size={16} />, color: "amber", label: isArabic ? "الوصول" : "Access", value: isArabic ? "مدى الحياة" : "Lifetime" },
        ].map(({ icon, color, label, value }) => (
          <div key={label} className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-sm bg-${color}-500/10 text-${color}-400 flex items-center justify-center`}>
              {icon}
            </div>
            <div>
              <span className="text-[10px] text-[var(--text-muted)] uppercase block">{label}</span>
              <span className="font-bold text-[var(--text-primary)]">{value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* PDF Canvas Viewer */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-sm overflow-hidden shadow-2xl">
        {/* Viewer header */}
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-[var(--accent)]" />
            <span className="text-xs font-black text-[var(--text-primary)] tracking-wide">AMARX SPLIT</span>
            {numPages > 0 && (
              <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-base)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                {numPages} {isArabic ? "صفحة" : "pages"}
              </span>
            )}
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
              status === "ready" || status === "cached" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
              status === "loading" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
              "text-red-400 bg-red-500/10 border-red-500/20"
            }`}>
              {status === "loading" ? (isArabic ? "● جار التحميل" : "● Loading") :
               status === "cached" ? (isArabic ? "● أوفلاين" : "● Offline") :
               status === "ready" ? (isArabic ? "● مباشر" : "● Live") :
               (isArabic ? "● خطأ" : "● Error")}
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">
            🔒 {isArabic ? "عرض محمي — لا يمكن نسخ الرابط" : "Protected view — URL cannot be shared"}
          </span>
        </div>

        {/* Canvas rendering area */}
        <div
          className="overflow-y-auto bg-[#111] p-4 space-y-4"
          style={{ maxHeight: "800px" }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-[var(--text-muted)]">
              <Loader2 size={36} className="animate-spin text-[var(--accent)]" />
              <div className="text-center">
                <p className="text-sm font-semibold">{isArabic ? "جار التحميل الآمن..." : "Securely loading..."}</p>
                <p className="text-xs opacity-60 mt-1">{isArabic ? "يتم حماية المحتوى وتشفيره" : "Content is being protected"}</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-[var(--text-muted)]">
              <WifiOff size={36} className="text-red-400" />
              <div className="text-center">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {isArabic ? "لا يوجد اتصال" : "No connection"}
                </p>
                <p className="text-xs opacity-60 mt-1">
                  {isArabic
                    ? "اتصل بالنت مرة واحدة لتفعيل وضع الأوفلاين"
                    : "Connect once to enable offline access"}
                </p>
              </div>
              <button onClick={() => loadPdf()}
                className="px-4 py-2 bg-[var(--accent)] text-black text-xs font-black rounded-sm">
                {isArabic ? "إعادة المحاولة" : "Retry"}
              </button>
            </div>
          )}

          {pdfDoc && Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <div key={pageNum} className="shadow-lg rounded-sm overflow-hidden">
              <PdfCanvasPage pdfDoc={pdfDoc} pageNum={pageNum} scale={scale} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>
            🔒 {isArabic
              ? "هذا المحتوى محمي — مخصص لك شخصياً"
              : "Protected content — personal to you"}
          </span>
          {isCached && (
            <span className="text-emerald-400 text-[11px] font-semibold">
              ✓ {isArabic ? "محفوظ أوفلاين" : "Saved offline"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
