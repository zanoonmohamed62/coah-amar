"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Maximize2, Minimize2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { RealisticWhatsAppIcon, RealisticShieldIcon } from "@/components/client/PwaIcons";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/use-settings";
import type { SplitLang } from "@/lib/split-cache";

const PdfCanvas = dynamic(() => import("@/components/client/PdfCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#0d121c]">
      <Loader2 size={36} className="animate-spin text-[var(--accent)]" />
    </div>
  ),
});

const TAB_KEY = "amar-split-tab";

export default function MySplitPage() {
  const { isArabic } = useLanguage();
  const getSetting = useSettings();
  const WA = getSetting("whatsapp_number").replace(/[^0-9]/g, "");
  const ArrowIcon = isArabic ? ChevronRight : ChevronLeft;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Default tab matches the user's language
  const [activeTab, setActiveTab] = useState<SplitLang>(() => {
    try {
      const saved = localStorage.getItem(TAB_KEY);
      if (saved === "en" || saved === "ar") return saved;
    } catch { /* ignore */ }
    return isArabic ? "ar" : "en";
  });

  const switchTab = (tab: SplitLang) => {
    setActiveTab(tab);
    try { localStorage.setItem(TAB_KEY, tab); } catch { /* ignore */ }
  };

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

  // The reader gets an explicit height: from where it starts down to the bottom
  // of the screen. It used to have only a min-height, so it grew to the full
  // length of the plan and the whole page scrolled instead of the viewer. The
  // viewer then never saw a scroll, never knew which page was on screen, and
  // pages past the first few were never drawn — they sat white.
  const [readerHeight, setReaderHeight] = useState<number | null>(null);
  // iPhone Safari has no element fullscreen, so the button would do nothing.
  const [canFullscreen, setCanFullscreen] = useState(false);
  useEffect(() => {
    const measure = () => {
      const el = containerRef.current;
      if (!el || document.fullscreenElement) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      // Desktop keeps the portal's 32px bottom padding; on mobile the reader
      // runs to the screen edge (it cancels the padding with -mb-4).
      const bottomGap = window.innerWidth >= 768 ? 32 : 0;
      // The installed app pads the shell by the home-indicator inset.
      const shell = el.closest(".app-shell");
      const inset = shell ? parseFloat(getComputedStyle(shell).paddingBottom) || 0 : 0;
      setReaderHeight(Math.max(320, Math.floor(window.innerHeight - top - bottomGap - inset)));
    };
    const raf = requestAnimationFrame(() => {
      measure();
      setCanFullscreen(!!document.fullscreenEnabled);
    });
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div className="flex flex-col gap-3 md:gap-6">
      <div className="flex gap-4 justify-between items-center shrink-0">
        <div className="min-w-0">
          <Link href="/app" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] md:mb-2 transition-colors">
            <ArrowIcon size={14} />
            <span>{isArabic ? "العودة للرئيسية" : "Back to Dashboard"}</span>
          </Link>
          <h1 className="hidden md:flex text-2xl font-black text-[var(--text-primary)] items-center gap-2.5">
            <span className="text-[var(--accent)]">THE AMAR</span> &ldquo;X SPLIT&rdquo;
          </h1>
        </div>
        <a
          href={`https://wa.me/${WA}?text=${encodeURIComponent(isArabic ? "مرحباً كوتش عمار، لدي استفسار" : "Hi Coach Amar, I have a question about the X Split")}`}
          target="_blank" rel="noopener noreferrer"
          className="relative group h-9 px-4 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/35 text-emerald-400 hover:text-emerald-300 text-xs font-bold rounded-[14px] transition-all flex items-center gap-2 shadow-[0_2px_10px_rgba(16,185,129,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)] active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          <RealisticWhatsAppIcon className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
          <span>{isArabic ? "واتساب الكوتش" : "Ask Coach"}</span>
        </a>
      </div>

      {/* Edge-to-edge on a phone: the rounded card, border and shadow are kept
          for the desktop layout but dropped on mobile, where they only shrink
          the readable width of the plan. -mx-4/-mb-4 cancel the portal's own
          page padding so the pages reach the screen edges. */}
      <div
        ref={containerRef}
        className="bg-[var(--bg-card)] flex flex-col overflow-hidden -mx-4 -mb-4 md:mx-0 md:mb-0 md:border md:border-[var(--border)] md:rounded-[var(--radius-xl)] md:shadow-[var(--shadow-card)]"
        style={{ height: readerHeight ? `${readerHeight}px` : "75vh" }}
      >
        {/* Top bar: language tabs + controls */}
        <div className="px-4 md:px-5 py-2 md:py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] bg-blue-500/10 border border-blue-400/25 text-blue-300 text-xs font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
              <RealisticShieldIcon className="w-4 h-4 shrink-0 text-blue-400" />
              <span>{isArabic ? "الجدول الرسمي" : "Official Split"}</span>
            </div>
            {/* Language tabs */}
            <div className="flex bg-white/5 rounded-[var(--radius-md)] p-0.5">
              <button
                onClick={() => switchTab("en")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-[var(--radius-sm)] transition-all duration-200 ${
                  activeTab === "en"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5"
                }`}
              >
                English
              </button>
              <button
                onClick={() => switchTab("ar")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-[var(--radius-sm)] transition-all duration-200 ${
                  activeTab === "ar"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5"
                }`}
              >
                عربي
              </button>
            </div>
          </div>
          {canFullscreen && (
          <button onClick={toggleFullscreen} className="min-h-9 px-2 hover:bg-white/5 rounded-[var(--radius-sm)] text-[var(--text-primary)] hover:text-white transition-colors flex items-center gap-2">
            <span className="text-xs font-bold">
              {isFullscreen ? (isArabic ? "تصغير" : "Exit Fullscreen") : (isArabic ? "تكبير الشاشة" : "Fullscreen")}
            </span>
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          )}
        </div>
        {/* Only the active tab's PdfCanvas is mounted to save memory */}
        {activeTab === "en" && <PdfCanvas isArabic={isArabic} lang="en" />}
        {activeTab === "ar" && <PdfCanvas isArabic={isArabic} lang="ar" />}
      </div>
    </div>
  );
}