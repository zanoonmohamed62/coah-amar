"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/use-settings";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const reason = searchParams.get("reason") || "";
  const { isArabic } = useLanguage();
  const getSetting = useSettings();
  const waNumber = getSetting("whatsapp_number").replace(/[^0-9]/g, "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: callbackUrl || "/app" });
    } catch {
      setLoading(false);
      setError(
        isArabic
          ? "تعذر تسجيل الدخول، يرجى المحاولة لاحقاً"
          : "Failed to sign in. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#07090e] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(37,99,235,0.15)_0%,rgba(37,99,235,0.05)_40%,transparent_70%)]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo & Branding */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6">
            <div className="w-20 h-20 mx-auto rounded-[24px] overflow-hidden border-2 border-blue-500/30 shadow-[0_0_40px_rgba(37,99,235,0.2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/icon-192.png"
                alt="Coach Amar"
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
          <h1
            className="text-2xl font-black text-white tracking-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            {isArabic ? "كوتش عمار" : "Coach Amar"}
          </h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed max-w-[260px] mx-auto">
            {isArabic
              ? "سجّل دخولك لعرض جدول التدريب والتغذية الخاص بك"
              : "Sign in to access your training plan and dashboard"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0b0f19] border border-slate-800/80 rounded-[24px] p-6 sm:p-8 shadow-2xl shadow-blue-950/20">
          {/* Admin unauthorized banner */}
          {reason === "unauthorized" && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-[18px] px-4 py-3 text-xs sm:text-sm text-amber-400 flex items-start gap-2.5 mb-6">
              <ShieldCheck size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-bold mb-0.5">
                  {isArabic
                    ? "صفحة مخصصة للأدمن فقط"
                    : "Admin Access Required"}
                </p>
                <p className="opacity-80">
                  {isArabic
                    ? "هذه الصفحة للمديرين فقط. سجل الدخول بحساب الأدمن."
                    : "This page is for admins only. Please sign in with your admin account."}
                </p>
              </div>
            </div>
          )}

          {/* Session timeout banner */}
          {reason === "timeout" && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-[18px] px-4 py-3 text-xs sm:text-sm text-blue-400 flex items-center gap-2.5 mb-6">
              <ShieldCheck size={16} className="shrink-0" />
              <p>
                {isArabic
                  ? "انتهت الجلسة — سجّل دخولك مرة أخرى"
                  : "Session expired — please sign in again"}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-[18px] px-4 py-3 text-xs sm:text-sm text-red-400 mb-6">
              {error}
            </div>
          )}

          {/* Google Sign-In — primary and only auth method */}
          <button
            id="login-google"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full px-4 py-3.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 rounded-[18px] text-sm font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-60 shadow-lg shadow-white/5 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
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
            )}
            <span>
              {loading
                ? isArabic
                  ? "جاري تسجيل الدخول..."
                  : "Signing in..."
                : isArabic
                  ? "تسجيل الدخول عبر Google"
                  : "Continue with Google"}
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-800/80" />
            <span className="text-[11px] text-slate-600 font-medium uppercase tracking-wider">
              {isArabic ? "الدعم" : "Help"}
            </span>
            <div className="flex-1 h-px bg-slate-800/80" />
          </div>

          {/* WhatsApp help */}
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-[18px] border border-slate-800/80 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-800/50 text-slate-400 hover:text-slate-300 text-sm font-medium transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>
              {isArabic
                ? "تواصل مع كوتش عمار"
                : "Contact Coach Amar"}
            </span>
          </a>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-600 mt-6">
          {isArabic
            ? "بتسجيل الدخول أنت توافق على سياسة الاستخدام"
            : "By signing in you agree to the terms of use"}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
