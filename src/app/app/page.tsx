"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  FileText, 
  MessageCircle, 
  CheckCircle2, 
  Dumbbell, 
  Flame, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  ExternalLink,
  RotateCcw,
  Zap,
  Activity
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/use-settings";
import { 
  savePwaUser, 
  getCachedPwaUser, 
  saveCachedEntitlements, 
  getCachedEntitlements 
} from "@/lib/split-cache";

type Entitlement = {
  id: string;
  status: string;
  startDate: string;
  expiresAt: string | null;
  isExpired: boolean;
  daysLeft: number | null;
  product: { id: string; name: string; type: string; slug: string };
};

export default function AppHome() {
  const { data: session } = useSession();
  const { isArabic } = useLanguage();
  const getSetting = useSettings();
  const waNumber = getSetting("whatsapp_number").replace(/[^0-9]/g, "");

  const cachedUser = typeof window !== "undefined" ? getCachedPwaUser() : null;
  const user = session?.user || cachedUser;
  const athleteName = user?.name || (isArabic ? "بطل كوتش عمار" : "Coach Amar Athlete");

  const [entitlements, setEntitlements] = useState<Entitlement[]>(() => {
    if (typeof window === "undefined") return [];
    return getCachedEntitlements();
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      savePwaUser({
        id: (session.user as { id?: string }).id || "",
        name: session.user.name || undefined,
        email: session.user.email || undefined,
      });
    }

    fetch("/api/customer/entitlements")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.entitlements)) {
          setEntitlements(d.entitlements);
          saveCachedEntitlements(d.entitlements);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  const ArrowIcon = isArabic ? ChevronLeft : ChevronRight;
  const activePlan = entitlements.find((e) => !e.isExpired) || entitlements[0];

  const quickActions = [
    {
      title: isArabic ? "جدول التمرين" : "My Split",
      href: "/app/my-split",
      icon: Dumbbell,
      color: "from-blue-600 to-blue-500",
    },
    {
      title: isArabic ? "واتساب الكوتش" : "Coach WhatsApp",
      href: `https://wa.me/${waNumber}?text=${encodeURIComponent(
        isArabic ? "مرحباً كوتش عمار، لدي استفسار" : "Hi Coach Amar, I have a question"
      )}`,
      icon: MessageCircle,
      color: "from-blue-500 to-cyan-500",
      external: true,
    },
    {
      title: isArabic ? "الاشتراكات" : "Membership",
      href: "/app/account",
      icon: ShieldCheck,
      color: "from-indigo-600 to-blue-500",
    },
    {
      title: isArabic ? "التغذية والماكروز" : "Nutrition Guide",
      href: `https://wa.me/${waNumber}?text=${encodeURIComponent(
        isArabic ? "مرحباً كوتش عمار، أود الاستفسار عن خطة التغذية الخاصة بي" : "Hi Coach Amar, I'd like to ask about my nutrition plan"
      )}`,
      icon: Flame,
      color: "from-blue-700 to-blue-500",
      external: true,
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* ──────── TOP BAR & GREETING ──────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-[18px] bg-gradient-to-tr from-blue-600 to-blue-400 p-0.5 shadow-[0_4px_16px_rgba(37,99,235,0.3)]">
            <div className="w-full h-full bg-[#090d16] rounded-[16px] flex items-center justify-center font-black text-blue-400 text-lg">
              {athleteName.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {isArabic ? `أهلاً، ${athleteName}` : `Hello, ${athleteName}`}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[18px] bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold">
                <CheckCircle2 size={11} /> {isArabic ? "مفعل" : "Active"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isArabic
                ? "بوابتك الرياضية المخصصة وجدول تمرينك"
                : "Your personal training portal & split"}
            </p>
          </div>
        </div>

        {/* Replay Onboarding button */}
        <button
          onClick={() => {
            localStorage.removeItem("pwa_onboarded_v1");
            window.location.reload();
          }}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[18px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 transition-colors"
        >
          <RotateCcw size={13} className="text-blue-400" />
          <span>{isArabic ? "عرض البداية" : "Onboarding"}</span>
        </button>
      </div>

      {/* ──────── SECTION 1: FEATURED ACTIVE SPLIT SHOWCASE (24px card) ──────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Activity size={16} className="text-blue-400" />
            <span>{isArabic ? "جدولك التدريبي النشط" : "Your Active Split"}</span>
          </h2>
          <span className="text-xs text-blue-400 font-semibold">
            {activePlan ? (activePlan.daysLeft !== null ? `${activePlan.daysLeft} ${isArabic ? "يوم متبقي" : "days left"}` : (isArabic ? "متاح دائماً" : "Lifetime Access")) : (isArabic ? "جاهز للاستخدام" : "Ready")}
          </span>
        </div>

        <div className="relative rounded-[24px] bg-gradient-to-b from-[#0e1626] to-[#080d18] border border-blue-500/25 p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_24px_rgba(37,99,235,0.12)] overflow-hidden">
          {/* Subtle Ambient Background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[18px] bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                <Dumbbell size={13} />
                <span>{activePlan?.product.name || (isArabic ? "جدول التدريب المعتمد" : "Custom Training Split")}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isArabic
                  ? "خطة التمارين ومجموعات التدريب الشاملة"
                  : "Comprehensive Training Split & Progression"}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                {isArabic
                  ? "جدولك مصمم بتقنية الهايبرد تريننج لضمان التطور العضلي والقوة، ومحمي بعلامتك المائية، ويعمل بدون اتصال بالإنترنت (Offline Mode)."
                  : "Built with scientific hybrid training progression, watermarked for your account, and fully cached for instant offline gym access."}
              </p>
            </div>

            {/* CTA Pill Buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              <Link
                href="/app/my-split"
                className="h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-[18px] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_6px_24px_rgba(37,99,235,0.4)] active:scale-[0.98]"
              >
                <FileText size={17} />
                <span>{isArabic ? "فتح جدول التمرين" : "Open My Split"}</span>
                <ArrowIcon size={16} />
              </Link>

              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                  isArabic ? "مرحباً كوتش عمار، أحتاج لتعديل في جدول تمريني" : "Hi Coach Amar, I need an adjustment to my split"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 px-6 bg-white/[0.04] hover:bg-white/[0.08] border border-blue-500/20 text-white font-semibold text-sm rounded-[18px] transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <MessageCircle size={17} className="text-blue-400" />
                <span>{isArabic ? "استشارة الكوتش" : "Ask Coach"}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── SECTION 2: CIRCULAR QUICK ACTIONS ROW (Inspired by reference) ──────── */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
          {isArabic ? "الوصول السريع" : "Quick Actions"}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            const content = (
              <div className="h-full p-4 rounded-[24px] bg-[#0c111c] border border-white/[0.06] hover:border-blue-500/40 hover:bg-white/[0.02] transition-all duration-200 flex flex-col items-center text-center gap-2.5 group">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${action.color} text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs font-bold text-white leading-tight">
                  {action.title}
                </span>
              </div>
            );

            if (action.external) {
              return (
                <a
                  key={i}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full"
                >
                  {content}
                </a>
              );
            }

            return (
              <Link key={i} href={action.href} className="block h-full">
                {content}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ──────── SECTION 3: KEY BENTO MODULES (24px cards) ──────── */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
          {isArabic ? "نظرة عامة على برنامجك" : "Program Highlights"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Offline & Watermark Security */}
          <div className="rounded-[24px] bg-[#0c111c] border border-white/[0.06] p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-[14px] bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Zap size={18} />
              </div>
              <h4 className="text-sm font-bold text-white">
                {isArabic ? "ميزة الجيم بدون نت (Offline)" : "Offline Gym Mode"}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isArabic
                  ? "جدول تمرينك يتم تخزينه تلقائياً في جهازك ليعمل داخل الجيم حتى في حال انقطاع الشبكة."
                  : "Your training split is stored locally so you can view all sets and reps inside the gym without an internet connection."}
              </p>
            </div>
            <Link
              href="/app/my-split"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>{isArabic ? "عرض الملف" : "View Split"}</span>
              <ArrowIcon size={14} />
            </Link>
          </div>

          {/* Card 2: 1-on-1 Direct WhatsApp Line */}
          <div className="rounded-[24px] bg-[#0c111c] border border-white/[0.06] p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-[14px] bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <MessageCircle size={18} />
              </div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">
                  {isArabic ? "متابعة مباشرة عبر واتساب" : "Direct WhatsApp Access"}
                </h4>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isArabic
                  ? "تواصل مباشر مع كوتش عمار لتعديل الأوزان، مراجعة تكنيك التمارين، واستفسارات الماكروز."
                  : "Direct 1-on-1 channel with Coach Amar for form checks, weight progressions, and macro adjustments."}
              </p>
            </div>
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                isArabic ? "مرحباً كوتش عمار، أود مراجعة تكنيك تمريني" : "Hi Coach Amar, I have a form check video"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>{isArabic ? "إرسال رسالة" : "Message Coach"}</span>
              <ArrowIcon size={14} />
            </a>
          </div>

          {/* Card 3: Account & Membership details */}
          <div className="rounded-[24px] bg-[#0c111c] border border-white/[0.06] p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-[14px] bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <h4 className="text-sm font-bold text-white">
                {isArabic ? "حالة الاشتراك والتجديد" : "Membership Status"}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isArabic
                  ? "تابع فترة اشتراكك الحالية، وسجل الطلبات وإيصالات الدفع المؤكدة من مكان واحد."
                  : "Track active membership cycles, order invoices, and renewal options from your account center."}
              </p>
            </div>
            <Link
              href="/app/account"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>{isArabic ? "إدارة الحساب" : "Manage Account"}</span>
              <ArrowIcon size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
