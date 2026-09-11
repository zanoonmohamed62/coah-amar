"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  ArrowLeft, 
  X,
  FileText,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { 
  RealisticDumbbellIcon, 
  RealisticWhatsAppIcon, 
  RealisticOfflineGymIcon 
} from "@/components/client/PwaIcons";

export function PwaOnboardingModal() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isArabic } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only trigger for authenticated users on their first login
    if (status !== "authenticated" || !session?.user) {
      setIsOpen(false);
      return;
    }

    const userId = (session.user as { id?: string }).id || session.user.email || "user";
    const storageKey = `pwa_welcomed_${userId}`;
    const alreadyWelcomed = localStorage.getItem(storageKey);

    if (!alreadyWelcomed) {
      setIsOpen(true);
    }
  }, [status, session]);

  const handleDismiss = (destination?: string) => {
    if (session?.user) {
      const userId = (session.user as { id?: string }).id || session.user.email || "user";
      localStorage.setItem(`pwa_welcomed_${userId}`, "true");
      // Also set legacy key to avoid old triggers
      localStorage.setItem("pwa_onboarded_v1", "true");
    }
    setIsOpen(false);
    if (destination) {
      router.push(destination);
    }
  };

  if (!isOpen || status !== "authenticated") return null;

  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;
  const userName = session?.user?.name || (isArabic ? "بطل كوتش عمار" : "Athlete");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-2xl overflow-y-auto">
        {/* iOS-Style System Sheet Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md my-auto bg-[#0d1322]/90 backdrop-blur-3xl border border-white/15 rounded-[32px] shadow-[0_30px_90px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.2)] overflow-hidden text-white flex flex-col p-6 sm:p-8"
        >
          {/* Ambient specular highlight on top border */}
          <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          {/* Close button (iOS circular blurred icon) */}
          <button
            onClick={() => handleDismiss()}
            aria-label="Close"
            className="absolute top-5 ltr:right-5 rtl:left-5 z-20 w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <X size={16} strokeWidth={2.5} />
          </button>

          {/* App Emblem (iOS Continuous Squircle with Realistic Glass Bevel) */}
          <div className="flex flex-col items-center text-center pt-2">
            <div className="w-18 h-18 rounded-[22px] bg-gradient-to-b from-[#1b263b] to-[#0b101b] p-0.5 shadow-[0_12px_32px_rgba(37,99,235,0.35),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-white/20 flex items-center justify-center mb-4 relative overflow-hidden">
              <div className="w-full h-full rounded-[20px] overflow-hidden flex items-center justify-center bg-[#070b14] relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/logo-amar.png"
                  alt="Coach Amar"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none" />
              </div>
            </div>

            {/* Header Greeting */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-bold mb-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              <CheckCircle2 size={13} className="text-blue-400" />
              <span>{isArabic ? "تم تفعيل حسابك بنجاح" : "Account Verified"}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              {isArabic ? `أهلاً بك، ${userName}` : `Welcome, ${userName}`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xs leading-relaxed">
              {isArabic
                ? "بوابتك الرياضية المخصصة أصبحت جاهزة. تعرف على ميزات التطبيق للانطلاق بقوة:"
                : "Your dedicated athletic portal is ready. Here is what you can do:"}
            </p>
          </div>

          {/* iOS Features List (Apple HIG Style with Realistic Graphic Design Icons) */}
          <div className="mt-6 space-y-3.5">
            {/* Item 1 */}
            <div className="flex items-start gap-3.5 p-3 rounded-[20px] bg-white/[0.03] border border-white/[0.06]">
              <div className="w-11 h-11 rounded-[15px] bg-gradient-to-b from-blue-500/30 to-blue-600/15 border border-blue-400/35 text-blue-400 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                <RealisticDumbbellIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white tracking-tight">
                  {isArabic ? "جدولك التدريبي المخصص (PDF)" : "Custom Training Split"}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  {isArabic
                    ? "تصفح تمارينك ومجموعاتك التدريبية حتى بدون إنترنت (Offline Mode) داخل الجيم."
                    : "Access all your exercises, sets, and progressions offline inside the gym."}
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-start gap-3.5 p-3 rounded-[20px] bg-white/[0.03] border border-white/[0.06]">
              <div className="w-11 h-11 rounded-[15px] bg-gradient-to-b from-emerald-500/30 to-teal-600/15 border border-emerald-400/35 text-emerald-400 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                <RealisticWhatsAppIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white tracking-tight">
                  {isArabic ? "متابعة مباشرة مع الكوتش" : "1-on-1 Direct WhatsApp Line"}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  {isArabic
                    ? "تواصل فوري لمراجعة تكنيك التمارين، وتعديل الأوزان وخطة الماكروز أسبوعياً."
                    : "Instant channel for form check reviews, progressive overload, and macro adjustments."}
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-start gap-3.5 p-3 rounded-[20px] bg-white/[0.03] border border-white/[0.06]">
              <div className="w-11 h-11 rounded-[15px] bg-gradient-to-b from-indigo-500/30 to-blue-600/15 border border-indigo-400/35 text-indigo-300 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                <RealisticOfflineGymIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white tracking-tight">
                  {isArabic ? "تطبيق مثبت وسريع (PWA)" : "Fast Offline PWA"}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  {isArabic
                    ? "تطبيق خفيف مثبت على هاتفك، يعمل بلمسة واحدة بدون استهلاك بيانات."
                    : "Lightweight home-screen app that opens instantly with zero lag."}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons (iOS Pill Geometry) */}
          <div className="mt-6 pt-2 space-y-2.5">
            <button
              onClick={() => handleDismiss("/app/my-split")}
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-[18px] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(37,99,235,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] active:scale-[0.98]"
            >
              <FileText size={17} />
              <span>{isArabic ? "فتح جدول التمرين الآن" : "Open My Split"}</span>
              <ArrowIcon size={16} />
            </button>

            <button
              onClick={() => handleDismiss()}
              className="w-full h-11 bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white font-semibold text-xs rounded-[18px] transition-all duration-200 flex items-center justify-center active:scale-[0.98]"
            >
              {isArabic ? "الانتقال إلى الرئيسية (الداشبورد)" : "Continue to Dashboard"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
