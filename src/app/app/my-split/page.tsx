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

export default function MySplitPage() {
  const { isArabic } = useLanguage();
  const ArrowIcon = isArabic ? ChevronRight : ChevronLeft;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
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
      const blob = new Blob([buf], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => { 
    loadPdf(); 
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [loadPdf]);

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

        {/* Native iframe Container */}
        <div className="flex-1 w-full h-full bg-[#0d121c] relative">
          {status === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-[var(--text-muted)] z-10">
              <Loader2 size={36} className="animate-spin text-[var(--accent)]" />
              <div className="text-center">
                <p className="text-sm font-semibold">{isArabic ? "جار التحميل..." : "Loading..."}</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-[var(--text-muted)] z-10">
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

          {status === "ready" && pdfUrl && (
            <iframe 
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-full border-none"
              title="Training Split"
            />
          )}
        </div>
      </div>
    </div>
  );
}
