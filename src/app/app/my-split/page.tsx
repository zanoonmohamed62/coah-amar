"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Maximize2, Minimize2, ChevronLeft, ChevronRight, MessageCircle, Loader2, WifiOff, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
