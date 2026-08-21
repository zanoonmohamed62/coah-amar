"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Maximize2, Minimize2, ChevronLeft, ChevronRight,
  MessageCircle, ShieldCheck, Loader2,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const WA = process.env.NEXT_PUBLIC_COACH_WHATSAPP?.replace("+", "") || "34610354255";

// Load the heavy pdfjs canvas viewer only on the client — never on the server
const PdfCanvas = dynamic(() => import("@/components/client/PdfCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#0d121c]">
      <Loader2 size={36} className="animate-spin text-[var(--accent)]" />
    </div>
  ),
});

export default function MySplitPage() {
  const { isArabic }   = useLanguage();
  const ArrowIcon      = isArabic ? ChevronRight : ChevronLeft;
  const containerRef   = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

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
            <span>{isArabic ? "?????? ????????" : "Back to Dashboard"}</span>
          </Link>
          <h1 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <span className="text-[var(--accent)]">THE AMMAR</span> &ldquo;X SPLIT&rdquo;
          </h1>
        </div>

        <a
          href={`https://wa.me/${WA}?text=${encodeURIComponent(
            isArabic ? "?????? ???? ????? ??? ???????" : "Hi Coach Amar, I have a question about the X Split"
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs font-bold rounded-sm transition-colors flex items-center gap-1.5"
        >
          <MessageCircle size={13} />
          <span>{isArabic ? "?????? ??????" : "Ask Coach"}</span>
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
              {isArabic ? "?????? ??????" : "Official Split"}
            </span>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-white/5 rounded-sm text-[var(--text-primary)] hover:text-white transition-colors flex items-center gap-2"
          >
            <span className="text-xs font-bold">
              {isFullscreen
                ? (isArabic ? "?????"       : "Exit Fullscreen")
                : (isArabic ? "????? ??????" : "Fullscreen")}
            </span>
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        {/* Canvas rendered only on the browser */}
        <PdfCanvas isArabic={isArabic} />
      </div>
    </div>
  );
}
