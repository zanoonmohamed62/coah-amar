"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Dumbbell, Lock, Mail, ArrowRight, ShieldCheck, User } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const { isArabic } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
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

      // Fetch active session to check role
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;

      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/app");
      }
      router.refresh();
    } catch {
      setLoading(false);
      setError(isArabic ? "تعذر تسجيل الدخول، يرجى المحاولة لاحقاً" : "Failed to sign in. Please try again.");
    }
  };

  const fillCredentials = (type: "admin" | "client") => {
    setError("");
    if (type === "admin") {
      setEmail("admin@coachair.com");
      setPassword("CoachAmar2025!");
    } else {
      setEmail("client@amar.fitness");
      setPassword("Client2025!");
    }
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

          {/* 1-Click Quick Login Presets */}
          <div className="pt-4 border-t border-slate-800/80">
            <p className="text-[11px] font-semibold text-slate-400 mb-2.5 text-center">
              {isArabic ? "تسجيل سريع بنقرة واحدة (تجريبي):" : "Quick 1-Click Access:"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials("admin")}
                className="px-3 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 rounded-sm text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldCheck size={14} />
                <span>Coach Admin</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("client")}
                className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 rounded-sm text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <User size={14} />
                <span>Client Athlete</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 pt-2">
            {isArabic ? "نسيت كلمة المرور؟ تواصل مع الكوتش على " : "Need help? Contact Coach Amar on "}
            <a href="https://wa.me/34610354255" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
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
