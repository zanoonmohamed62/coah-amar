"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function PwaOnboardingModal() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isArabic } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    // Check if user already finished onboarding
    const completed = localStorage.getItem("pwa_onboarded_v1");
    if (!completed) {
      setIsOpen(true);
    }
  }, []);

  const handleFinish = (destination?: string) => {
    localStorage.setItem("pwa_onboarded_v1", "true");
    setIsOpen(false);
    if (destination) {
      router.push(destination);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn("google", { callbackUrl: "/app" });
    } catch {
      setIsSigningIn(false);
    }
  };

  if (!isOpen) return null;

  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-md my-auto bg-[#090d16] border border-blue-500/20 rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(37,99,235,0.15)] overflow-hidden text-white flex flex-col justify-between min-h-[520px]">
        {/* Subtle background ambient glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Step progress pills */}
        <div className="relative z-10 px-6 pt-6 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === s
                    ? "w-8 bg-blue-500"
                    : step > s
                    ? "w-3 bg-blue-400/50"
                    : "w-3 bg-white/10"
                }`}
              />
            ))}
          </div>

          <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2.5 py-1 rounded-[18px] border border-blue-500/20">
            {isArabic ? `الخطوة ${step} من 3` : `Step ${step} of 3`}
          </span>
        </div>

        {/* Dynamic Step Content */}
        <div className="relative z-10 p-6 sm:p-8 flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {/* ──────── STEP 1: WELCOME SCREEN ──────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="w-14 h-14 rounded-[18px] bg-blue-600/10 border border-blue-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                  <Dumbbell size={28} className="text-blue-400" />
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                    {isArabic ? "مرحباً بك في" : "welcome to"}
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-white">
                      COACH AMAR
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {isArabic
                      ? "رفيقك التدريبي الرياضي المتكامل. تتبع تمارينك، افتح جدولك المخصص بدقة، وحقق أعلى نتائجك البدنية مع متابعة الكوتش المستمرة."
                      : "your new favorite workout companion. access your customized split, track high-performance sessions, and stay locked in with direct coach guidance."}
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="w-full h-12 bg-white hover:bg-slate-100 text-[#090d16] font-bold text-base rounded-[18px] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,255,255,0.2)] active:scale-[0.98]"
                  >
                    <span>{isArabic ? "يلا نبدأ (let's go)" : "let's go"}</span>
                    <ArrowIcon size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ──────── STEP 2: LET'S COMPLETE (LOGIN / CONNECT) ──────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="w-14 h-14 rounded-[18px] bg-blue-600/10 border border-blue-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                  <Sparkles size={28} className="text-blue-400" />
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                    {isArabic ? "إكمال إعداد حسابك" : "let's complete setup"}
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {isArabic
                      ? "قم بربط حسابك عبر Google للوصول الفوري إلى جدول تمارينك المخصص ومزامنة بياناتك مع الموقع."
                      : "connect your account to unlock your personalized training split and sync seamlessly with the member portal."}
                  </p>
                </div>

                {status === "authenticated" && session?.user ? (
                  <div className="p-4 rounded-[18px] bg-white/[0.03] border border-blue-500/30 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[14px] bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      <CheckCircle2 size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">
                        {isArabic ? "الحساب متصل بنجاح" : "Account Connected"}
                      </p>
                      <p className="text-sm font-semibold text-white truncate">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isSigningIn}
                      className="w-full h-12 bg-white hover:bg-slate-100 text-[#090d16] font-bold text-sm rounded-[18px] transition-all duration-200 flex items-center justify-center gap-3 shadow-[0_4px_16px_rgba(255,255,255,0.15)] active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSigningIn ? (
                        <Loader2 size={18} className="animate-spin text-blue-600" />
                      ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      )}
                      <span>
                        {isArabic
                          ? "تسجيل الدخول بحساب Google"
                          : "Continue with Google"}
                      </span>
                    </button>

                    <button
                      onClick={() => router.push("/login?callbackUrl=/app")}
                      className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors text-center"
                    >
                      {isArabic
                        ? "أو تسجيل الدخول بالبريد الإلكتروني وكلمة المرور"
                        : "or sign in with email and password"}
                    </button>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => setStep(3)}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-[18px] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,99,235,0.3)]"
                  >
                    <span>{isArabic ? "متابعة" : "Continue"}</span>
                    <ArrowIcon size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ──────── STEP 3: SETUP COMPLETE SCREEN ──────── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="w-14 h-14 rounded-[18px] bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 size={28} className="text-emerald-400" />
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                    {isArabic ? "تم الإعداد بنجاح" : "setup complete"}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {isArabic
                      ? "جاهز للانطلاق الآن، ابدأ بتمرينك الأول وتعرف على جدولك الرياضي المخصص."
                      : "let's get into action by starting your first workout."}
                  </p>
                </div>

                {/* Pill Action Buttons (Matching user screenshot) */}
                <div className="pt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleFinish()}
                    className="h-12 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-[18px] transition-all duration-200 flex items-center justify-center active:scale-[0.98]"
                  >
                    {isArabic ? "لاحقاً" : "later"}
                  </button>

                  <button
                    onClick={() => handleFinish("/app/my-split")}
                    className="h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-[18px] transition-all duration-200 flex items-center justify-center gap-1.5 shadow-[0_4px_20px_rgba(37,99,235,0.4)] active:scale-[0.98]"
                  >
                    <span>{isArabic ? "ابدأ التمرين" : "start workout"}</span>
                    <ArrowIcon size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
