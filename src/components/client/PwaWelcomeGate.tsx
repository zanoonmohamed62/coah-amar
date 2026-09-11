"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { RealisticDumbbellIcon, RealisticOfflineGymIcon, RealisticWhatsAppIcon } from "@/components/client/PwaIcons";

// The very first card of the installed app: "مرحباً", then the login page.
//
// Only in the installed app (display-mode: standalone), and only once per
// device — someone signing in from a browser tab came from the website and has
// already been welcomed there, and someone who signs out and back in has already
// seen it. After login, PwaOnboardingModal takes over with the cards that depend
// on whether the account is activated.

const SEEN_KEY = "amar-pwa-prelogin-welcome";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari's own flag for a home-screen launch.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function PwaWelcomeGate() {
  const { isArabic } = useLanguage();
  const [open, setOpen] = useState(false);
  const Arrow = isArabic ? ArrowLeft : ArrowRight;
  const T = (ar: string, en: string) => (isArabic ? ar : en);

  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(SEEN_KEY) === "1"; } catch { /* show it */ }
    // Display mode is only knowable in the browser, so this cannot be a
    // useState initializer on a prerendered page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!seen && isStandalone()) setOpen(true);
  }, []);

  if (!open) return null;

  const close = () => {
    try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* ignore */ }
    setOpen(false);
  };

  const items = [
    { Icon: RealisticDumbbellIcon, title: T("جدولك التدريبي", "Your training split"), desc: T("عربي وإنجليزي في مكان واحد.", "Arabic and English in one place.") },
    { Icon: RealisticOfflineGymIcon, title: T("من غير نت", "Works offline"), desc: T("بيفتح جوه الجيم حتى من غير إنترنت.", "Opens in the gym with no connection.") },
    { Icon: RealisticWhatsAppIcon, title: T("الكوتش معاك", "The coach is with you"), desc: T("أي سؤال على الواتساب مباشرة.", "Any question, straight on WhatsApp.") },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-[#07090e]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.18),transparent_65%)]" />
      <div className="relative w-full max-w-md ios-card !rounded-[32px] p-7 text-white">
        <div className="flex flex-col items-center text-center">
          <div className="w-[76px] h-[76px] rounded-[23px] overflow-hidden border border-white/20 shadow-[0_12px_32px_rgba(37,99,235,0.35),inset_0_1px_1px_rgba(255,255,255,0.35)] mb-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/logo-amar.png" alt="Coach Amar" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-[28px] font-black tracking-tight leading-tight">
            {T("مرحباً بيك في", "Welcome to")} <span className="text-blue-400">AMAR X</span>
          </h1>
          <p className="text-sm text-slate-300 mt-2 max-w-xs leading-relaxed">
            {T("سجّل دخولك بالجيميل اللي اشتركت بيه عشان تلاقي جدولك.", "Sign in with the Gmail you subscribed with to find your plan.")}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {items.map((it) => (
            <div key={it.title} className="flex items-start gap-3.5 p-3 rounded-[20px] bg-white/[0.03] border border-white/[0.06]">
              <div className="ios-tile ios-tile-blue w-11 h-11 !rounded-[15px]">
                <it.Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold tracking-tight">{it.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{it.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={close} className="ios-btn-blue w-full h-12 mt-7">
          {T("تسجيل الدخول", "Sign in")}
          <Arrow size={16} />
        </button>
      </div>
    </div>
  );
}
