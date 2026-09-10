"use client";

import { useEffect, useState, useCallback } from "react";
import { signIn, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Zap, ArrowRight, ArrowLeft, Tag, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const DISMISS_KEY = "amarx-lead-banner-dismissed-at";
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function GoogleLeadBanner() {
  const session = useSession();
  const status = session?.status;
  const { isArabic } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Online Coaching live counter state (defaults to 16/100 until API resolves)
  const [spotsTaken, setSpotsTaken] = useState(16);
  const [totalSpots, setTotalSpots] = useState(100);
  const [promoActive, setPromoActive] = useState(true);

  useEffect(() => {
    // Fetch live product data for personal-coaching
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        const coaching = d.products?.find((p: any) => p.slug === "personal-coaching");
        if (coaching) {
          if (typeof coaching.spotsTaken === "number") setSpotsTaken(coaching.spotsTaken);
          if (typeof coaching.totalSpots === "number") setTotalSpots(coaching.totalSpots);
          if (typeof coaching.promoActive === "boolean") setPromoActive(coaching.promoActive);
        }
      })
      .catch(() => {});
  }, []);

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
  const isSoldOut = !promoActive || spotsTaken >= totalSpots;
  const pct = Math.min(100, Math.round((spotsTaken / totalSpots) * 100));
  const remaining = Math.max(0, totalSpots - spotsTaken);

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

          {/* Centered Modal Card — 24px container radius, clinical blueprint aesthetic */}
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
            className="relative w-full max-w-lg bg-[#090d16] border border-blue-500/20 rounded-[24px] shadow-[0_24px_80px_rgba(0,0,0,0.9),0_0_40px_rgba(37,99,235,0.15)] overflow-hidden text-white my-auto p-6 sm:p-8 space-y-6"
            style={{
              fontFamily: isArabic ? "var(--font-cairo), sans-serif" : "var(--font-inter), sans-serif",
            }}
          >
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close button (18px pill) */}
            <button
              onClick={dismiss}
              className="absolute top-5 ltr:right-5 rtl:left-5 z-30 w-9 h-9 rounded-[18px] bg-white/[0.05] hover:bg-white/[0.12] text-slate-400 hover:text-white border border-white/10 flex items-center justify-center transition-all duration-150 backdrop-blur-sm cursor-pointer group"
              aria-label={isArabic ? "إغلاق النافذة" : "Close window"}
            >
              <X size={17} className="transition-transform group-hover:scale-110" />
            </button>

            {/* Header: Brand and Badge */}
            <div className="relative z-10 flex items-center justify-between pt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-[14px] bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-sm shadow-[0_0_12px_rgba(37,99,235,0.2)]">
                  AMAR
                </div>
                <div>
                  <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
                    COACH AMAR
                  </span>
                  <p className="text-[11px] text-blue-400 font-medium">
                    {isArabic ? "التدريب الأونلاين المخصص" : "Online Coaching"}
                  </p>
                </div>
              </div>

              {!isSoldOut ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[18px] bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[11px] font-bold tracking-wide">
                  <Sparkles size={12} className="text-blue-400" />
                  {isArabic ? "خصم 40% محدود" : "40% OFF LIMITED"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[18px] bg-slate-800 border border-slate-700 text-slate-400 text-[11px] font-bold tracking-wide">
                  {isArabic ? "المقاعد مكتملة (100%)" : "SPOTS FILLED (100%)"}
                </span>
              )}
            </div>

            {/* Live Counter Progress Box */}
            <div className="relative z-10 p-4 rounded-[18px] bg-[#0c121e] border border-blue-500/20 shadow-inner space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSoldOut ? "bg-slate-500 opacity-50" : "bg-blue-400 opacity-75"}`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isSoldOut ? "bg-slate-500" : "bg-blue-500"}`} />
                  </span>
                  <span className="font-semibold text-slate-200">
                    {isSoldOut
                      ? (isArabic ? "اكتملت جميع مقاعد الدفعة الحالية" : "Batch spots fully claimed")
                      : (isArabic ? `تم حجز ${spotsTaken} من ${totalSpots} مقعد` : `Claimed: ${spotsTaken} of ${totalSpots} spots`)}
                  </span>
                </div>
                <span className="font-black text-blue-400 text-xs tracking-wider">
                  {pct}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-[#060a12] rounded-full border border-white/[0.08] overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={`h-full rounded-full ${
                    isSoldOut
                      ? "bg-slate-600"
                      : "bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {isSoldOut
                    ? (isArabic ? "انتهى العرض لهذه الدفعة" : "Promotion closed for this batch")
                    : (isArabic ? `متبقي ${remaining} مقعد فقط بالسعر المخفض` : `Only ${remaining} spots left at this price`)}
                </span>
                <span className="font-medium text-slate-300">
                  {isArabic ? "تحديث مباشر" : "Live synced"}
                </span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="relative z-10 space-y-2">
              <h3
                id="promo-modal-title"
                className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug"
              >
                {!isSoldOut
                  ? (isArabic
                      ? "خصم 40% لأول 100 مشترك في التدريب الأونلاين!"
                      : "40% OFF For The First 100 Coaching Members!")
                  : (isArabic
                      ? "سجّل دخولك الآن للوصول إلى خطتك التدريبية"
                      : "Sign In To Access Your Training Portal")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {!isSoldOut
                  ? (isArabic
                      ? "سجّل دخولك بضغطة واحدة عبر Google للحصول فوراً على كود خصم 40%، وتفعيله مباشرة على برنامج التدريب والمتابعة الخاصة مع كوتش عمار."
                      : "Sign in with Google in 1 tap to claim your instant 40% discount, valid on Coach Amar's personalized online coaching program.")
                  : (isArabic
                      ? "سجّل دخولك بحساب Google لمتابعة جدول تمرينك المخصص والتواصل المباشر مع الكوتش."
                      : "Sign in with Google to access your personalized workout splits, nutrition logs, and direct coach communication.")}
              </p>
            </div>

            {/* Value Proposition Points — clean 18px pills */}
            <div className="relative z-10 grid grid-cols-1 gap-2">
              {!isSoldOut && (
                <div className="flex items-center gap-3 p-3 rounded-[18px] bg-white/[0.03] border border-white/[0.06]">
                  <div className="w-8 h-8 rounded-[12px] bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-400">
                    <Tag size={15} />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-white">
                      {isArabic ? "خصم 40% فوري ومباشر" : "Instant 40% Discount Applied"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isArabic ? "يُطبّق تلقائياً عند الاشتراك بدون خطوات إضافية" : "Ready to use immediately upon checkout"}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-[18px] bg-white/[0.03] border border-white/[0.06]">
                <div className="w-8 h-8 rounded-[12px] bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-400">
                  <Zap size={15} />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">
                    {isArabic ? "تسجيل فوري بنقرة واحدة عبر Google" : "1-Tap Instant Google Sign-In"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isArabic ? "بدون كلمات مرور أو استمارات طويلة" : "No passwords or lengthy sign-up forms"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-[18px] bg-white/[0.03] border border-white/[0.06]">
                <div className="w-8 h-8 rounded-[12px] bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-400">
                  <ShieldCheck size={15} />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">
                    {isArabic ? "تفعيل فوري لجدول تمرينك وبوابتك الخاصة" : "Instant Training Portal Access"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isArabic ? "وصول كامل للجداول والتمارين والمتابعة" : "Full access to splits and coach updates"}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions: Primary 18px Pill Button + Skip */}
            <div className="relative z-10 space-y-3 pt-1">
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="w-full h-12 px-5 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-950 font-bold text-sm sm:text-base rounded-[18px] transition-all duration-200 flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(255,255,255,0.18)] hover:shadow-[0_6px_28px_rgba(255,255,255,0.26)] active:scale-[0.99] cursor-pointer group disabled:opacity-75 disabled:cursor-wait"
              >
                {isSigningIn ? (
                  <Loader2 size={19} className="animate-spin text-slate-900" />
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
                    : (!isSoldOut
                        ? (isArabic ? "المتابعة عبر Google وتفعيل خصم 40%" : "Continue with Google & Claim 40% Off")
                        : (isArabic ? "المتابعة عبر Google" : "Continue with Google"))}
                </span>
                {!isSigningIn && (
                  <ArrowIcon size={16} className="text-slate-700 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                )}
              </button>

              {/* Dismiss / Skip */}
              <div className="flex items-center justify-between pt-1 px-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-blue-400" />
                  {isArabic
                    ? "تسجيل دخول آمن وسريع"
                    : "100% secure • Fast sign in"}
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
