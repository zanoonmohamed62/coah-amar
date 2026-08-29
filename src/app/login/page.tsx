"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Dumbbell, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/use-settings";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const reason = searchParams.get("reason") || "";
  const { isArabic } = useLanguage();
  const getSetting = useSettings();
  const waNumber = getSetting("whatsapp_number").replace(/[^0-9]/g, "");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password: password,
        redirect: false,
      });

      if (res?.error) {
        setLoading(false);
        setError(isArabic ? "البريد الإلكتروني أو كلمة المرور غير صحيحة" : "Invalid email or password");
        return;
      }

      // Fetch active session from server explicitly to bypass cache
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;

      if (callbackUrl) {
        window.location.href = callbackUrl;
      } else if (role === "ADMIN") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/app";
      }
    } catch {
      setLoading(false);
      setError(isArabic ? "تعذر تسجيل الدخول، يرجى المحاولة لاحقاً" : "Failed to sign in. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    await signIn("google", { callbackUrl: callbackUrl || "/app" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#07090e]">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header / Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 border border-blue-500/30 bg-blue-500/10 flex items-center justify-center rounded-sm shadow-lg shadow-blue-500/10">
              <Dumbbell size={24} className="text-blue-400" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Coach Amar</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {isArabic ? "تسجيل الدخول إلى لوحة التحكم والتطبيق" : "Sign in to access your portal"}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-sm p-6 sm:p-8 space-y-6 shadow-2xl">
          {reason === "unauthorized" && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-sm px-4 py-3 text-xs sm:text-sm text-amber-400 flex items-start gap-2">
              <ShieldCheck size={15} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-bold mb-0.5">
                  {isArabic ? "صفحة مخصصة للأدمن فقط" : "Admin Access Required"}
                </p>
                <p className="opacity-80">
                  {isArabic
                    ? "هذه الصفحة للمديرين فقط. استخدم بيانات Coach Admin للدخول."
                    : "This page is for admins only. Please sign in with your Coach Admin credentials."}
                </p>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-sm px-4 py-3 text-xs sm:text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isArabic ? "البريد الإلكتروني" : "Email Address"}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isArabic ? "admin@coachair.com أو بريدك" : "admin@coachair.com or your email"}
                  className="w-full bg-[#07090e] border border-slate-800 rounded-sm pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isArabic ? "كلمة المرور" : "Password"}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#07090e] border border-slate-800 rounded-sm pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 group disabled:opacity-75 font-bold text-sm shadow-lg shadow-blue-600/20"
            >
              <span>
                {loading
                  ? isArabic ? "جاري تسجيل الدخول..." : "Signing in..."
                  : isArabic ? "تسجيل الدخول" : "Sign In"}
              </span>
              {!loading && <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Google sign-in */}
          <div className="pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full px-3 py-2.5 bg-white/95 hover:bg-white text-slate-800 rounded-sm text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-75"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.89c2.28-2.1 3.56-5.18 3.56-8.82z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.89-3.01c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.94H1.27v3.1C3.25 21.3 7.31 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.27a12 12 0 0 0 0 10.78z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.61l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75z" />
              </svg>
              <span>{isArabic ? "الدخول عبر جوجل" : "Sign in with Google"}</span>
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 pt-2">
            {isArabic ? "نسيت كلمة المرور؟ تواصل مع الكوتش على " : "Need help? Contact Coach Amar on "}
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              WhatsApp
            </a>
          </p>
        </div>
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
