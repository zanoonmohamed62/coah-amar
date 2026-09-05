"use client";

import { useEffect, useState, useCallback } from "react";
import { signIn, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Zap, ArrowRight, ArrowLeft, Tag, Flame, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const DISMISS_KEY = "amarx-lead-banner-dismissed-at";
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function GoogleLeadBanner() {
  const session = useSession();
  const status = session?.status;
  const { isArabic } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    // Only show to unauthenticated visitors
    if (status !== "unauthenticated") return;

    let dismissedAt = 0;
    try {
      dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    } catch {}
    if (Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) return;

    // Show quickly (600ms) upon entering the site
    const timer = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(timer);
  }, [status]);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, dismiss]);

  const handleSignIn = () => {
    setIsSigningIn(true);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    signIn("google", { callbackUrl: window.location.href });
  };

  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop overlay with heavy blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={dismiss}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl"
            aria-hidden="true"
          />

          {/* Centered Modal Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="promo-modal-title"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 340,
              duration: 0.35,
            }}
            className="relative w-full max-w-lg bg-[#080b12] border border-slate-700/60 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.9),0_0_40px_rgba(37,99,235,0.18)] overflow-hidden text-white my-auto"
            style={{
              fontFamily: isArabic ? "var(--font-cairo), sans-serif" : "var(--font-outfit), var(--font-inter), sans-serif",
            }}
          >
            {/* Close button */}
            <button
              onClick={dismiss}
              className="absolute top-4 ltr:right-4 rtl:left-4 z-30 w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white border border-white/10 flex items-center justify-center transition-all duration-150 backdrop-blur-sm group cursor-pointer"
              aria-label={isArabic ? "إغلاق النافذة" : "Close window"}
            >
              <X size={18} className="transition-transform group-hover:scale-110" />
            </button>

            {/* ── Graphic Header Banner ── */}
            <div className="relative h-48 sm:h-52 w-full bg-gradient-to-b from-[#0c1424] via-[#090e1a] to-[#080b12] p-6 flex flex-col justify-between overflow-hidden border-b border-white/[0.08]">
              {/* Subtle ambient lighting */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* High-end athletic grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                  backgroundSize: "28px 28px",
                }}
              />

              {/* Top row: Brand & 40% OFF Limited badge */}
              <div className="relative z-10 flex items-center justify-between w-full pt-1">
                {/* Brand element */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#05070e] border border-blue-500/30 p-1.5 shadow-[0_0_16px_rgba(37,99,235,0.25)] flex items-center justify-center flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/icons/icon.svg"
                      alt="Amar X-Split"
                      className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(56,189,248,0.4)]"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black tracking-wider text-white uppercase">
                        X-SPLIT
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        PRO
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {isArabic ? "كوتش عمار • نخبة التدريب" : "Coach Amar • Elite Training"}
                    </p>
                  </div>
                </div>

                {/* 40% OFF Badge */}
                <div className="flex flex-col items-center justify-center px-4 py-2 rounded-2xl bg-gradient-to-br from-blue-600/25 via-blue-500/15 to-cyan-500/20 border border-blue-400/40 shadow-[0_0_24px_rgba(37,99,235,0.25)] backdrop-blur-md">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-200 to-white tracking-tight">
                      40%
                    </span>
                    <span className="text-xs font-black text-cyan-300 uppercase">
                      {isArabic ? "خصم" : "OFF"}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-cyan-200/90 tracking-wider uppercase">
                    {isArabic ? "أول 100 مشترك" : "FIRST 100 ONLY"}
                  </span>
                </div>
              </div>

              {/* Scarcity Bar */}
              <div className="relative z-10 w-full space-y-1.5 mt-2">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="flex items-center gap-1.5 font-semibold text-cyan-300">
                    <Flame size={13} className="text-amber-400 fill-amber-400 animate-pulse" />
                    {isArabic ? "الحق العرض: تم حجز 73 من 100 مقعد" : "Claim offer: 73 of 100 spots taken"}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {isArabic ? "متبقي 27 فقط" : "27 spots left"}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400 rounded-full"
                    style={{ width: "73%" }}
                  />
                </div>
              </div>
            </div>

            {/* ── Main Modal Content ── */}
            <div className="p-6 sm:p-7 space-y-5">
              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3
                  id="promo-modal-title"
                  className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug"
                >
                  {isArabic
                    ? "خصم 40% لأول 100 مشترك في انتظارك!"
                    : "40% OFF For The First 100 Members!"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {isArabic
                    ? "سجّل دخولك الآن بضغطة واحدة عبر Google للحصول فوراً على كود خصم 40%، وتطبيقه على جميع باقات وبرامج التدريب الخاصة بكوتش عمار."
                    : "Sign in with Google in 1 tap to claim your instant 40% discount code, valid across all Coach Amar personalized workout and nutrition programs."}
                </p>
              </div>

              {/* Value proposition perks */}
              <div className="grid grid-cols-1 gap-2.5">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-400">
                    <Tag size={16} />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-white">
                      {isArabic ? "خصم 40% فوري ومباشر" : "Instant 40% Discount Code"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isArabic
                        ? "يُطبّق على الفور عند إتمام الاشتراك في أي برنامج تدريبي"
                        : "Ready to use immediately upon checkout on any program"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 text-cyan-400">
                    <Zap size={16} />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-white">
                      {isArabic ? "تسجيل سريع بنقرة واحدة عبر Google" : "1-Tap Instant Google Sign-In"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isArabic
                        ? "بدون الحاجة لكتابة كلمات مرور أو ملء استمارات طويلة"
                        : "No password friction or lengthy sign-up forms required"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-white">
                      {isArabic ? "وصول مباشر لخطتك وحسابك التدريبي" : "Instant Access to Your Training Hub"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isArabic
                        ? "متابعة جداول التمارين والتغذية وتحديثات كوتش عمار الخاصة"
                        : "Access workout schedules, nutrition logs, and private coach updates"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-1">
                {/* Google Sign-in Button */}
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="w-full py-3.5 px-5 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-950 font-black text-sm sm:text-base rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-[0_4px_25px_rgba(255,255,255,0.18)] hover:shadow-[0_6px_30px_rgba(255,255,255,0.28)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer group disabled:opacity-75 disabled:cursor-wait"
                >
                  {isSigningIn ? (
                    <Loader2 size={20} className="animate-spin text-slate-900" />
                  ) : (
                    <div className="w-5 h-5 flex-shrink-0">
                      <svg viewBox="0 0 24 24" className="w-full h-full" aria-hidden="true">
                        <path
                          fill="#4285F4"
                          d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.89c2.28-2.1 3.56-5.18 3.56-8.82z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.89-3.01c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.94H1.27v3.1C3.25 21.3 7.31 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.27a12 12 0 0 0 0 10.78z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.61l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75z"
                        />
                      </svg>
                    </div>
                  )}
                  <span>
                    {isSigningIn
                      ? (isArabic ? "جاري الاتصال بـ Google..." : "Connecting to Google...")
                      : (isArabic ? "المتابعة عبر Google وتفعيل خصم 40%" : "Continue with Google & Claim 40% Off")}
                  </span>
                  {!isSigningIn && (
                    <ArrowIcon size={16} className="text-slate-700 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  )}
                </button>

                {/* Skip / Dismiss button */}
                <div className="flex items-center justify-between pt-1 px-1">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-emerald-400" />
                    {isArabic
                      ? "تسجيل دخول آمن 100% • لن ننشر أي شيء"
                      : "100% secure • No spam ever"}
                  </span>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="text-[11px] text-slate-400 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    {isArabic ? "تخطي ومتابعة التصفح" : "Skip for now"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
