"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Maximize2, Minimize2, ChevronLeft, ChevronRight, MessageCircle, ShieldCheck, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/use-settings";

const PdfCanvas = dynamic(() => import("@/components/client/PdfCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#0d121c]">
      <Loader2 size={36} className="animate-spin text-[var(--accent)]" />
    </div>
  ),
});

export default function MySplitPage() {
  const { isArabic } = useLanguage();
  const getSetting = useSettings();
  const WA = getSetting("whatsapp_number").replace(/[^0-9]/g, "");
  const ArrowIcon = isArabic ? ChevronRight : ChevronLeft;
  const containerRef = useRef<HTMLDivElement>(null);
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center shrink-0">
        <div>
          <Link href="/app" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-2 transition-colors">
            <ArrowIcon size={14} />
            <span>{isArabic ? "\u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0644\u0631\u0626\u064a\u0633\u064a\u0629" : "Back to Dashboard"}</span>
          </Link>
          <h1 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <span className="text-[var(--accent)]">THE AMAR</span> &ldquo;X SPLIT&rdquo;
          </h1>
        </div>
        <a
          href={`https://wa.me/${WA}?text=${encodeURIComponent(isArabic ? "\u0645\u0631\u062d\u0628\u0627\u064b \u0643\u0648\u062a\u0634 \u0639\u0645\u0627\u0631\u060c \u0644\u062f\u064a \u0627\u0633\u062a\u0641\u0633\u0627\u0631" : "Hi Coach Amar, I have a question about the X Split")}`}
          target="_blank" rel="noopener noreferrer"
          className="px-3.5 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs font-bold rounded-[var(--radius-md)] transition-colors flex items-center gap-1.5"
        >
          <MessageCircle size={14} />
          <span>{isArabic ? "\u0648\u0627\u062a\u0633\u0627\u0628 \u0627\u0644\u0643\u0648\u062a\u0634" : "Ask Coach"}</span>
        </a>
      </div>

      <div ref={containerRef} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-card)] flex flex-col flex-1" style={{ minHeight: "75vh" }}>
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-400" />
            <span className="text-xs font-black text-[var(--text-primary)] tracking-wide">
              {isArabic ? "\u0627\u0644\u062c\u062f\u0648\u0644 \u0627\u0644\u0631\u0633\u0645\u064a" : "Official Split"}
            </span>
          </div>
          <button onClick={toggleFullscreen} className="p-1.5 hover:bg-white/5 rounded-[var(--radius-sm)] text-[var(--text-primary)] hover:text-white transition-colors flex items-center gap-2">
            <span className="text-xs font-bold">
              {isFullscreen ? (isArabic ? "\u062a\u0635\u063a\u064a\u0631" : "Exit Fullscreen") : (isArabic ? "\u062a\u0643\u0628\u064a\u0631 \u0627\u0644\u0634\u0627\u0634\u0629" : "Fullscreen")}
            </span>
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
        <PdfCanvas isArabic={isArabic} />
      </div>
    </div>
  );
}