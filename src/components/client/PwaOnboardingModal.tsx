"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, X, CheckCircle2, Loader2, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { usePush } from "@/lib/use-push";
import { getCachedEntitlements, saveCachedEntitlements } from "@/lib/split-cache";
import {
  RealisticDumbbellIcon,
  RealisticWhatsAppIcon,
  RealisticOfflineGymIcon,
  RealisticShieldIcon,
  RealisticDocumentIcon,
  RealisticUserIcon,
} from "@/components/client/PwaIcons";

// The cards a customer sees after signing in to the app.
//
// The full sequence, as the owner specified it:
//
//   (before login)  مرحباً → the login page                — PwaWelcomeGate, on /login
//   activated:      تم تفعيل حسابك → الحساب مربوط بنجاح → تصفّح الجدول
//   not activated:  مرحباً / إكمال إعداد حسابك → الجدول لسه مش متاح، اشترك
//
// "Activated" means an ACTIVE entitlement — granted only by an admin confirming
// a payment. The activation card used to be shown to anyone who signed in,
// including someone who had just made a Google account and bought nothing.
//
// What has been seen is remembered per account as "pending" or "active", not as
// a plain yes/no. A customer who signs in before paying sees the not-activated
// cards; once the admin activates them, the NEXT time they open the app they get
// the activation cards — instead of never seeing them because "already welcomed".

type Entitlement = { status?: string; isExpired?: boolean };
type Seen = "pending" | "active" | null;

type Card = {
  key: string;
  badge: string;
  badgeTone: "blue" | "emerald" | "amber";
  title: string;
  subtitle: string;
  // Lucide icons and the project's own SVG icons have different signatures;
  // both only ever need a className here.
  items: { Icon: ComponentType<{ className?: string }>; title: string; desc: string }[];
  cta: string;
  /** Where the primary button goes on the last card. */
  href?: string;
};

function hasActive(list: Entitlement[]): boolean {
  return list.some((e) => e?.status === "ACTIVE" && !e?.isExpired);
}

function readSeen(key: string): Seen {
  try {
    const v = localStorage.getItem(key);
    return v === "pending" || v === "active" ? v : null;
  } catch {
    return null;
  }
}

/** Show when never seen, or when seen while pending and now activated. */
function shouldShow(seen: Seen, active: boolean): boolean {
  if (seen === null) return true;
  return seen === "pending" && active;
}

export function PwaOnboardingModal() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isArabic, lang } = useLanguage();
  const push = usePush(lang === "ar" ? "ar" : "en");

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [active, setActive] = useState<boolean | null>(null);

  const userId = (session?.user as { id?: string } | undefined)?.id || session?.user?.email || "";
  const storageKey = userId ? `pwa_onboarding_v3_${userId}` : "";

  useEffect(() => {
    // Signed out: nothing to do — the render below returns null on its own.
    if (status !== "authenticated" || !session?.user || !storageKey) return;

    const seen = readSeen(storageKey);
    if (seen === "active") return; // the full activated sequence has been shown

    let cancelled = false;
    const decide = (isActive: boolean) => {
      if (cancelled) return;
      setActive(isActive);
      setStep(0);
      setIsOpen(shouldShow(seen, isActive));
    };

    // Offline or slow: decide from the cached entitlements the portal keeps.
    const cached = getCachedEntitlements() as Entitlement[];

    fetch("/api/customer/entitlements")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) throw new Error("no data");
        const list = Array.isArray(d.entitlements) ? (d.entitlements as Entitlement[]) : [];
        saveCachedEntitlements(list);
        decide(hasActive(list));
      })
      .catch(() => {
        // Without a server answer, never claim an activation the cache can't show.
        decide(cached.length > 0 ? hasActive(cached) : false);
      });

    return () => { cancelled = true; };
  }, [status, session, storageKey]);

  const cards = useMemo<Card[]>(() => {
    const T = (ar: string, en: string) => (isArabic ? ar : en);
    const name = session?.user?.name || T("بطل", "Athlete");
    const email = session?.user?.email ?? "";

    if (active !== true) {
      return [
        {
          key: "welcome",
          badge: T("الحساب متصل بنجاح", "Account connected"),
          badgeTone: "blue",
          title: T(`مرحباً، ${name}`, `Welcome, ${name}`),
          subtitle: T("خلّينا نكمّل إعداد حسابك.", "Let's finish setting up your account."),
          items: [
            {
              Icon: RealisticUserIcon,
              title: T("حسابك جاهز", "Your account is ready"),
              desc: T(`سجّلت دخول بـ ${email}`, `Signed in as ${email}`),
            },
            {
              Icon: RealisticDumbbellIcon,
              title: T("الجدول بيتفتح هنا", "Your plan opens here"),
              desc: T("بالعربي والإنجليزي، ومن غير نت جوه الجيم.", "Arabic and English, and offline inside the gym."),
            },
            {
              Icon: RealisticWhatsAppIcon,
              title: T("الكوتش على واتساب", "The coach on WhatsApp"),
              desc: T("المتابعة كلها بتتم على الواتساب مع عمار.", "All follow-up happens with Amar on WhatsApp."),
            },
          ],
          cta: T("متابعة", "Continue"),
        },
        {
          key: "locked",
          badge: T("الحساب لسه مش مفعّل", "Not activated yet"),
          badgeTone: "amber",
          title: T("الجدول لسه مش متاح", "Your plan isn't available yet"),
          subtitle: T(
            "بيتفعّل على حسابك بعد الاشتراك وتأكيد التحويل.",
            "It's activated on your account once you subscribe and your transfer is confirmed.",
          ),
          items: [
            {
              Icon: ShoppingBag,
              title: T("اشترك في الجدول أو المتابعة", "Get the split or coaching"),
              desc: T("اختار الباقة، حوّل، وارفع صورة التحويل.", "Pick a package, transfer, and upload your screenshot."),
            },
            {
              Icon: RealisticShieldIcon,
              title: T("التفعيل على نفس الإيميل", "Activated on the same email"),
              desc: T(
                `اكتب ${email || "نفس الإيميل ده"} في فورم الدفع عشان التفعيل ينزل على الحساب ده.`,
                `Enter ${email || "this same email"} at checkout so access lands on this account.`,
              ),
            },
            {
              Icon: RealisticWhatsAppIcon,
              title: T("لو دفعت بالفعل", "Already paid?"),
              desc: T("ابعتلنا رقم طلبك على الواتساب ونراجعه فورًا.", "Send us your order number on WhatsApp and we'll check it right away."),
            },
          ],
          cta: T("شوف الباقات", "See the packages"),
          href: "/#split",
        },
      ];
    }

    return [
      {
        key: "activated",
        badge: T("تم تفعيل حسابك", "Account activated"),
        badgeTone: "emerald",
        title: T(`مبروك يا ${name}`, `You're in, ${name}`),
        subtitle: T("اشتراكك اتأكد، والجدول بقى متاح على حسابك.", "Your subscription is confirmed and your plan is now on your account."),
        items: [
          {
            Icon: RealisticShieldIcon,
            title: T("الاشتراك مفعّل", "Subscription active"),
            desc: T("الأدمن أكد التحويل وفعّل حسابك.", "The admin confirmed your transfer and activated you."),
          },
          {
            Icon: RealisticDocumentIcon,
            title: T("نسختين من الجدول", "Two versions of the plan"),
            desc: T("عربي وإنجليزي، والاتنين متاحين دلوقتي.", "Arabic and English, both available now."),
          },
        ],
        cta: T("متابعة", "Continue"),
      },
      {
        key: "linked",
        badge: T("الحساب مربوط بنجاح", "Account linked"),
        badgeTone: "blue",
        title: T("حسابك اتربط بنجاح", "Your account is linked"),
        subtitle: T(
          `الجدول مربوط بـ ${email} — على الموبايل وعلى الويب.`,
          `Your plan is linked to ${email} — on your phone and on the web.`,
        ),
        items: [
          {
            Icon: RealisticUserIcon,
            title: T("نفس الجيميل في كل مكان", "Same Gmail everywhere"),
            desc: T("سجّل بنفس الحساب ده على أي جهاز وهتلاقي الجدول.", "Sign in with this account on any device and your plan is there."),
          },
          {
            Icon: RealisticDocumentIcon,
            title: T("نسختك أنت", "Your own copy"),
            desc: T("كل صفحة عليها علامة مائية باسم حسابك.", "Every page carries a watermark tied to your account."),
          },
        ],
        cta: T("متابعة", "Continue"),
      },
      {
        key: "browse",
        badge: T("جاهز", "Ready"),
        badgeTone: "blue",
        title: T("تصفّح الجدول", "Open your plan"),
        subtitle: T(
          "افتحه مرة وإنت متصل، وبعدها بيفتح فورًا حتى من غير نت.",
          "Open it once online, and from then on it opens instantly — even offline.",
        ),
        items: [
          {
            Icon: RealisticOfflineGymIcon,
            title: T("محفوظ على جهازك", "Saved on your device"),
            desc: T("حتى لو قفلت التطبيق أو عملت ريستارت للموبايل.", "Even after closing the app or restarting your phone."),
          },
          {
            Icon: RealisticDumbbellIcon,
            title: T("كبّر بإصبعين", "Pinch to zoom"),
            desc: T("أو اضغط مرتين على أي جزء عشان تكبّره.", "Or double-tap any part of a page to zoom in."),
          },
        ],
        cta: T("افتح الجدول", "Open my plan"),
        href: "/app/my-split",
      },
    ];
  }, [active, isArabic, session]);

  const dismiss = (destination?: string) => {
    try {
      if (storageKey) localStorage.setItem(storageKey, active === true ? "active" : "pending");
    } catch { /* ignore */ }
    setIsOpen(false);
    if (destination) router.push(destination);
  };

  if (!isOpen || status !== "authenticated") return null;

  const card = cards[Math.min(step, cards.length - 1)];
  const last = step >= cards.length - 1;
  const Arrow = isArabic ? ArrowLeft : ArrowRight;

  const toneClass =
    card.badgeTone === "emerald"
      ? "bg-emerald-500/14 border-emerald-400/32 text-emerald-300"
      : card.badgeTone === "amber"
      ? "bg-amber-500/14 border-amber-400/32 text-amber-300"
      : "bg-blue-500/14 border-blue-400/32 text-blue-300";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-2xl overflow-y-auto">
        <motion.div
          key={card.key}
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md my-auto ios-card !rounded-[32px] p-6 sm:p-8 text-white flex flex-col"
        >
          <button
            onClick={() => dismiss()}
            aria-label={isArabic ? "إغلاق" : "Close"}
            className="absolute top-5 ltr:right-5 rtl:left-5 z-20 w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <X size={16} strokeWidth={2.5} />
          </button>

          <div className="flex flex-col items-center text-center pt-2">
            <div className="w-[72px] h-[72px] rounded-[22px] bg-gradient-to-b from-[#1b263b] to-[#0b101b] p-0.5 shadow-[0_12px_32px_rgba(37,99,235,0.35),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-white/20 flex items-center justify-center mb-4 overflow-hidden">
              <div className="w-full h-full rounded-[20px] overflow-hidden flex items-center justify-center bg-[#070b14] relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/logo-amar.png" alt="Coach Amar" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none" />
              </div>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold mb-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] ${toneClass}`}>
              {active === null ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={13} />}
              <span>{card.badge}</span>
            </div>

            <h2 className="text-2xl sm:text-[27px] font-black tracking-tight text-white leading-tight">{card.title}</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-xs leading-relaxed">{card.subtitle}</p>
          </div>

          <div className="mt-6 space-y-3">
            {card.items.map((item) => (
              <div key={item.title} className="flex items-start gap-3.5 p-3 rounded-[20px] bg-white/[0.03] border border-white/[0.06]">
                <div className="ios-tile ios-tile-blue w-11 h-11 !rounded-[15px]">
                  <item.Icon className="w-6 h-6 text-blue-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white tracking-tight">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed break-words">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Only on the activated flow's last card: a training reminder is
              worth nothing to someone with no plan to train from. */}
          {last && active === true && push.supported && push.configured && !push.subscribed && (
            <button
              type="button"
              onClick={() => void push.subscribe()}
              disabled={push.busy}
              className="mt-4 w-full text-xs font-semibold text-blue-300 hover:text-white border border-blue-400/25 hover:bg-blue-500/10 rounded-[16px] py-3 transition-colors disabled:opacity-50"
            >
              {isArabic ? "فعّل تذكير التمرين على الموبايل" : "Turn on training reminders on this phone"}
            </button>
          )}

          <div className="mt-6 space-y-2.5">
            <button
              onClick={() => (last ? dismiss(card.href) : setStep(step + 1))}
              className="ios-btn-blue w-full h-12"
            >
              <span>{card.cta}</span>
              <Arrow size={16} />
            </button>

            <button onClick={() => dismiss()} className="ios-btn-ghost w-full h-11 text-xs">
              {isArabic ? "تخطي والدخول للرئيسية" : "Skip to the dashboard"}
            </button>
          </div>

          {cards.length > 1 && (
            <div className="mt-5 flex items-center justify-center gap-1.5">
              {cards.map((c, i) => (
                <span
                  key={c.key}
                  className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-blue-400" : "w-1.5 bg-white/20"}`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
