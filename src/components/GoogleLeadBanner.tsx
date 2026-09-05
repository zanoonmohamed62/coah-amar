"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const DISMISS_KEY = "amarx-lead-banner-dismissed-at";
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function GoogleLeadBanner() {
  const session = useSession();
  const status = session?.status;
  const { isArabic } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status !== "unauthenticated") return;

    let dismissedAt = 0;
    try {
      dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    } catch {}
    if (Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) return;

    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, [status]);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
  };

  const handleSignIn = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    signIn("google", { callbackUrl: window.location.href });
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 ltr:left-6 rtl:right-6 z-50 w-[calc(100%-3rem)] max-w-sm px-4 py-4 bg-[#0d1117] border border-blue-500/30 rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] backdrop-blur-md">
      <button
        onClick={dismiss}
        className="absolute top-2 ltr:right-2 rtl:left-2 p-1 text-gray-600 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-[var(--radius-pill)] bg-white flex items-center justify-center flex-shrink-0 border border-blue-500/20 shadow-[var(--shadow-button)]">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.89c2.28-2.1 3.56-5.18 3.56-8.82z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.89-3.01c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.94H1.27v3.1C3.25 21.3 7.31 24 12 24z" />
            <path fill="#FBBC05" d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.27a12 12 0 0 0 0 10.78z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.61l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-black text-white">
            {isArabic ? "خصم 15% في انتظارك" : "15% off is waiting for you"}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
            {isArabic
              ? "سجّل دخولك بجوجل عشان تاخد كود الخصم وتوصلك عروضنا أول بأول"
              : "Sign in with Google to grab your discount code and hear about new offers first"}
          </p>
        </div>
      </div>

      <button
        onClick={handleSignIn}
        className="mt-3 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-[var(--radius-lg)] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
      >
        <span>{isArabic ? "الدخول عبر جوجل" : "Sign in with Google"}</span>
      </button>
    </div>
  );
}
