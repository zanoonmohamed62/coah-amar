"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { 
  RealisticDumbbellIcon, 
  RealisticWhatsAppIcon, 
  RealisticMembershipIcon, 
  RealisticNutritionIcon, 
  RealisticOfflineGymIcon,
  RealisticDocumentIcon,
  RealisticShieldIcon,
  RealisticActivityIcon
} from "@/components/client/PwaIcons";
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
  const router = useRouter();

  // The installed app always starts at /app (manifest start_url). For the
  // admin, that meant opening the app from a new-order notification's home
  // screen icon and landing in the customer portal. In the installed app only,
  // an admin goes straight to the panel; in a browser tab they can still
  // preview the portal as customers see it.
  const role = (session?.user as { role?: string } | undefined)?.role;
  useEffect(() => {
    if (role !== "ADMIN") return;
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) router.replace("/admin");
  }, [role, router]);
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
  // Only a real, current entitlement counts. The fallback to `entitlements[0]`
  // used to surface an expired or revoked plan as if it were the active one.
  const activePlan = entitlements.find((e) => e.status === "ACTIVE" && !e.isExpired);
  const isActivated = Boolean(activePlan);

  const quickActions = [
    {
      title: isArabic ? "جدول التمرين" : "My Split",
      subtitle: isArabic ? "التمارين والمجموعات" : "Workout & sets",
      href: "/app/my-split",
      icon: RealisticDumbbellIcon,
      tileGradient: "from-blue-600/30 to-blue-700/10",
      tileBorder: "border-blue-400/35",
      tileShadow: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_10px_24px_-4px_rgba(37,99,235,0.35)]",
      iconColor: "text-blue-400",
    },
    {
      title: isArabic ? "واتساب الكوتش" : "Coach WhatsApp",
      subtitle: isArabic ? "تواصل مباشر" : "1-on-1 direct",
      href: `https://wa.me/${waNumber}?text=${encodeURIComponent(
        isArabic ? "مرحباً كوتش عمار، لدي استفسار" : "Hi Coach Amar, I have a question"
      )}`,
      icon: RealisticWhatsAppIcon,
      tileGradient: "from-emerald-600/30 to-teal-700/10",
      tileBorder: "border-emerald-400/35",
      tileShadow: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_10px_24px_-4px_rgba(16,185,129,0.3)]",
      iconColor: "text-emerald-400",
      external: true,
    },
    {
      title: isArabic ? "الاشتراكات" : "Membership",
      subtitle: isArabic ? "الفواتير والتجديد" : "Billing & status",
      href: "/app/account",
      icon: RealisticMembershipIcon,
      tileGradient: "from-indigo-600/30 to-blue-700/10",
      tileBorder: "border-indigo-400/35",
      tileShadow: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_10px_24px_-4px_rgba(99,102,241,0.3)]",
      iconColor: "text-indigo-400",
    },
    {
      title: isArabic ? "التغذية والماكروز" : "Nutrition Guide",
      subtitle: isArabic ? "استفسار السعرات" : "Macros inquiry",
      href: `https://wa.me/${waNumber}?text=${encodeURIComponent(
        isArabic ? "مرحباً كوتش عمار، أود الاستفسار عن خطة التغذية الخاصة بي" : "Hi Coach Amar, I'd like to ask about my nutrition plan"
      )}`,
      icon: RealisticNutritionIcon,
      tileGradient: "from-amber-600/30 to-orange-700/10",
      tileBorder: "border-amber-400/35",
      tileShadow: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_10px_24px_-4px_rgba(245,158,11,0.3)]",
      iconColor: "text-amber-400",
      external: true,
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* ──────── TOP BAR & GREETING ──────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-[18px] bg-gradient-to-b from-blue-500 to-blue-600 p-0.5 shadow-[0_6px_20px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] border border-white/20">
            <div className="w-full h-full bg-[#090d16] rounded-[16px] flex items-center justify-center font-black text-blue-400 text-lg">
              {athleteName.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {isArabic ? `أهلاً، ${athleteName}` : `Hello, ${athleteName}`}
              </h1>
              {/* "Active" only for an account an admin has actually activated —
                  this badge used to be hard-coded, so anyone who had merely
                  signed in with Google was told their account was active. */}
              {isActivated ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 text-[10px] font-bold">
                  <CheckCircle2 size={11} /> {isArabic ? "مفعل" : "Active"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/12 border border-amber-400/30 text-amber-400 text-[10px] font-bold">
                  {isArabic ? "غير مفعل" : "Not activated"}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isArabic
                ? "بوابتك الرياضية المخصصة وجدول تمرينك"
                : "Your personal training portal & split"}
            </p>
          </div>
        </div>
      </div>

      {/* ──────── SECTION 1: FEATURED ACTIVE SPLIT SHOWCASE (28px card) ──────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <RealisticActivityIcon className="w-5 h-5" />
            <span>{isArabic ? "جدولك التدريبي النشط" : "Your Active Split"}</span>
          </h2>
          <span className="text-xs text-blue-400 font-semibold">
            {activePlan
              ? (activePlan.daysLeft !== null ? `${activePlan.daysLeft} ${isArabic ? "يوم متبقي" : "days left"}` : (isArabic ? "متاح دائماً" : "Lifetime Access"))
              : (isArabic ? "لسه مش مفعّل" : "Not activated yet")}
          </span>
        </div>

        <div className="relative rounded-[28px] bg-gradient-to-b from-[#0f172a]/90 via-[#0b111e]/95 to-[#070b14] backdrop-blur-2xl border border-white/12 p-6 sm:p-8 shadow-[0_16px_48px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden">
          {/* Subtle Ambient Background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                <RealisticShieldIcon className="w-4 h-4 shrink-0" />
                <span>{activePlan?.product.name || (isArabic ? "جدول التدريب المعتمد" : "Custom Training Split")}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isArabic
                  ? "خطة التمارين ومجموعات التدريب الشاملة"
                  : "Comprehensive Training Split & Progression"}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                {isActivated
                  ? (isArabic
                    ? "جدولك مصمم بتقنية الهايبرد تريننج لضمان التطور العضلي والقوة، ومحمي بعلامتك المائية، ويعمل بدون اتصال بالإنترنت (Offline Mode)."
                    : "Built with scientific hybrid training progression, watermarked for your account, and fully cached for instant offline gym access.")
                  : (isArabic
                    ? "الجدول لسه مش متاح على حسابك. اشترك، حوّل، وارفع صورة التحويل — وأول ما نأكد الطلب هيتفعّل على نفس الإيميل اللي كتبته في الفورم."
                    : "The plan isn't on your account yet. Subscribe, transfer and upload your screenshot — once we confirm the order it's activated on the same email you entered at checkout.")}
              </p>
            </div>

            {/* CTA Pill Buttons with Realistic iOS 3D Glass Styling */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              <Link
                href={isActivated ? "/app/my-split" : "/#split"}
                className="relative group h-12 px-6 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-sm rounded-[18px] transition-all duration-200 flex items-center justify-center gap-2.5 shadow-[0_8px_24px_rgba(37,99,235,0.45),inset_0_1px_1px_rgba(255,255,255,0.35)] active:scale-[0.98] border border-blue-300/30 overflow-hidden"
              >
                {/* Specular gloss top reflection */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
                <RealisticDocumentIcon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                <span>
                  {isActivated
                    ? (isArabic ? "فتح جدول التمرين" : "Open My Split")
                    : (isArabic ? "اشترك واحصل على الجدول" : "Get the split")}
                </span>
                <ArrowIcon size={16} />
              </Link>

              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                  isArabic ? "مرحباً كوتش عمار، أحتاج لتعديل في جدول تمريني" : "Hi Coach Amar, I need an adjustment to my split"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group h-12 px-6 bg-[#0f172a]/90 hover:bg-[#1e293b]/90 border border-emerald-500/35 hover:border-emerald-400/50 text-white font-semibold text-sm rounded-[18px] transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-[0.98] backdrop-blur-md shadow-[0_4px_16px_rgba(16,185,129,0.15),inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden"
              >
                {/* Specular gloss top reflection */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                <RealisticWhatsAppIcon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                <span>{isArabic ? "استشارة الكوتش" : "Ask Coach"}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ──────── SECTION 2: REALISTIC IOS SQUIRCLE QUICK ACTIONS ROW ──────── */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
          {isArabic ? "الوصول السريع" : "Quick Actions"}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            const content = (
              <div className="h-full p-4 rounded-[24px] bg-[#0c121e]/85 backdrop-blur-xl border border-white/[0.08] hover:border-blue-500/40 hover:bg-white/[0.03] transition-all duration-200 flex flex-col items-center text-center gap-3 group shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
                {/* iOS Squircle Glass Icon Tile */}
                <div className={`w-13 h-13 rounded-[18px] bg-gradient-to-b ${action.tileGradient} border ${action.tileBorder} ${action.tileShadow} ${action.iconColor} flex items-center justify-center group-hover:scale-105 transition-transform duration-200 backdrop-blur-md relative overflow-hidden`}>
                  <div className="absolute top-0 inset-x-2 h-px bg-white/40 pointer-events-none" />
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white leading-tight block">
                    {action.title}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {action.subtitle}
                  </span>
                </div>
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

      {/* ──────── SECTION 3: KEY BENTO MODULES (iOS Frosted Glass) ──────── */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
          {isArabic ? "نظرة عامة على برنامجك" : "Program Highlights"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Offline & Watermark Security */}
          <div className="rounded-[24px] bg-[#0c121e]/85 backdrop-blur-xl border border-white/[0.08] p-5 flex flex-col justify-between space-y-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:border-white/15 transition-all">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-[14px] bg-gradient-to-b from-blue-500/25 to-blue-600/10 border border-blue-400/30 text-blue-400 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                <RealisticOfflineGymIcon className="w-5 h-5" />
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
          <div className="rounded-[24px] bg-[#0c121e]/85 backdrop-blur-xl border border-white/[0.08] p-5 flex flex-col justify-between space-y-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:border-white/15 transition-all">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-[14px] bg-gradient-to-b from-emerald-500/25 to-teal-600/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                <RealisticWhatsAppIcon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">
                  {isArabic ? "متابعة مباشرة عبر واتساب" : "Direct WhatsApp Access"}
                </h4>
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
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>{isArabic ? "إرسال رسالة" : "Message Coach"}</span>
              <ArrowIcon size={14} />
            </a>
          </div>

          {/* Card 3: Account & Membership details */}
          <div className="rounded-[24px] bg-[#0c121e]/85 backdrop-blur-xl border border-white/[0.08] p-5 flex flex-col justify-between space-y-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:border-white/15 transition-all">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-[14px] bg-gradient-to-b from-indigo-500/25 to-blue-600/10 border border-indigo-400/30 text-indigo-400 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                <RealisticShieldIcon className="w-5 h-5" />
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
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
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
