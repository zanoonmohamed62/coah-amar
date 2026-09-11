"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, X, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/use-settings";

// Amar Support — the in-app help desk.
//
// Every reply is scripted: the customer taps a question, gets the answer, and
// moves on. Nothing is generated and nothing is sent anywhere, so it answers
// instantly and works with no connection at all — which matters, because the
// people most likely to need it are standing in a gym on bad signal.
//
// Anything the script does not cover ends in one place: the coach on WhatsApp.
// That is the deliberate escape hatch, not a failure state.
//
// Blue and white only, iOS geometry (see iphone-ios.md): continuous squircles,
// a specular rim, multi-stop lighting. No emoji, no generated iconography.

type Node = {
  id: string;
  /** What the customer taps to get here. */
  label: { ar: string; en: string };
  /** What Amar Support answers. */
  answer: { ar: string; en: string };
  /** Follow-up options; empty means "back to the start". */
  next?: string[];
  /** Renders the WhatsApp hand-off under the answer. */
  escalate?: boolean;
  /** An in-app link shown under the answer. */
  link?: { href: string; label: { ar: string; en: string } };
};

const ROOT = ["access", "offline", "order", "coaching", "lang", "other"];

const NODES: Record<string, Node> = {
  access: {
    id: "access",
    label: { ar: "الجدول مش ظاهر عندي", en: "I can't see my plan" },
    answer: {
      ar: "الجدول بيظهر بس بعد ما الأدمن يأكد تحويلك ويفعّل الحساب. لو دفعت بالفعل، غالبًا الطلب لسه بيتراجع — بيتفعّل عادةً خلال ساعتين، والطلبات اللي بالليل بتتفعّل الصبح.\n\nأهم حاجة: التفعيل بيتم على الإيميل اللي كتبته في فورم الدفع بالظبط. لو سجّلت دخول بإيميل تاني مش هتلاقي الجدول.",
      en: "Your plan appears only after an admin confirms your transfer and activates the account. If you've already paid, it's most likely still being reviewed — usually within 2 hours, and orders placed overnight are activated in the morning.\n\nOne thing that matters: activation happens on exactly the email you entered at checkout. Signing in with a different email won't show the plan.",
    },
    next: ["email", "order"],
    escalate: true,
  },
  email: {
    id: "email",
    label: { ar: "سجّلت بإيميل غير اللي في الفورم", en: "I signed in with a different email" },
    answer: {
      ar: "سجّل خروج، وبعدين ادخل تاني بنفس الجيميل اللي كتبته في فورم الدفع — ده الحساب اللي التفعيل عليه.\n\nلو الإيميل اللي كتبته في الفورم فيه غلطة، ابعتلنا رقم الطلب والإيميل الصح على واتساب ونصلّحه على طول.",
      en: "Sign out, then sign back in with the same Google account you entered at checkout — that's the account access sits on.\n\nIf you mistyped the email at checkout, send us your order number and the correct email on WhatsApp and we'll move it straight away.",
    },
    escalate: true,
  },
  offline: {
    id: "offline",
    label: { ar: "التصفح من غير نت", en: "Using it offline" },
    answer: {
      ar: "افتح الجدول مرة واحدة وإنت متصل بالنت — التطبيق بيحفظه كامل على جهازك (العربي والإنجليزي).\n\nبعد كده بيفتح فورًا حتى لو:\n• قفلت التطبيق أو عملت ريستارت للتليفون\n• خرجت من التاب ورجعت\n• مفيش نت خالص جوه الجيم\n\nعشان ميتمسحش، ضيف التطبيق على الشاشة الرئيسية وافتحه من هناك.",
      en: "Open your plan once while online — the app saves the whole thing on your device, both Arabic and English.\n\nAfter that it opens instantly even if you:\n• close the app or restart your phone\n• leave the tab and come back\n• have no signal at all in the gym\n\nTo make sure it's never cleared, add the app to your home screen and open it from there.",
    },
    link: { href: "/app/my-split", label: { ar: "افتح الجدول دلوقتي", en: "Open my plan now" } },
  },
  order: {
    id: "order",
    label: { ar: "أتابع طلبي إزاي؟", en: "How do I track my order?" },
    answer: {
      ar: "كل طلب ليه رقم خاص بيه بيظهرلك أول ما تضغط تأكيد (زي SP-00012 للجدول، أو CO-00007 للمتابعة).\n\nابعت الرقم ده للكوتش على واتساب وهيعرف طلبك فورًا. وتقدر كمان تشوف حالة كل طلباتك من صفحة «حسابي».",
      en: "Every order gets its own number the moment you press Confirm — SP-00012 for the split, CO-00007 for coaching.\n\nSend that number to the coach on WhatsApp and he'll find your order immediately. You can also see the status of all your orders on the Account page.",
    },
    link: { href: "/app/account", label: { ar: "شوف طلباتي", en: "See my orders" } },
    escalate: true,
  },
  coaching: {
    id: "coaching",
    label: { ar: "المتابعة الشخصية بتتم إزاي؟", en: "How does coaching work?" },
    answer: {
      ar: "المتابعة الشخصية كلها بتتم على الواتساب مباشرة مع كوتش عمار — مراجعة تكنيك، تعديل الأوزان، والماكروز.\n\nالتطبيق هنا مخصص لحاجة واحدة: إنك تتصفح الجدول بتاعك بسهولة وبسرعة، أونلاين وأوفلاين.",
      en: "Coaching itself runs entirely over WhatsApp, directly with Coach Amar — form checks, weight progression and macros.\n\nThis app is for one thing: reading your plan comfortably and quickly, online and offline.",
    },
    escalate: true,
  },
  lang: {
    id: "lang",
    label: { ar: "أغيّر لغة الجدول", en: "Switch the plan's language" },
    answer: {
      ar: "فوق الجدول هتلاقي تابين: English و عربي. اضغط اللي إنت عايزه وهو بيفتح على طول — النسختين محفوظتين على جهازك، فالتبديل بينهم مش بيحمّل من الأول.",
      en: "Above the plan there are two tabs: English and عربي. Tap the one you want and it opens immediately — both versions are stored on your device, so switching never re-downloads anything.",
    },
    link: { href: "/app/my-split", label: { ar: "افتح الجدول", en: "Open my plan" } },
  },
  other: {
    id: "other",
    label: { ar: "حاجة تانية", en: "Something else" },
    answer: {
      ar: "لو سؤالك مش موجود فوق، ابعتلنا على الواتساب على طول — وياريت تبعت رقم الطلب لو عندك واحد، عشان الرد يبقى أسرع.",
      en: "If your question isn't listed above, message us on WhatsApp — include your order number if you have one so we can answer faster.",
    },
    escalate: true,
  },
};

type Turn = { role: "bot" | "user"; text: string; node?: Node };

export function AmarSupport() {
  const { isArabic } = useLanguage();
  const getSetting = useSettings();
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [options, setOptions] = useState<string[]>(ROOT);
  const scrollRef = useRef<HTMLDivElement>(null);
  const Chevron = isArabic ? ChevronLeft : ChevronRight;

  const wa = getSetting("whatsapp_number").replace(/[^0-9]/g, "");
  const T = useCallback((ar: string, en: string) => (isArabic ? ar : en), [isArabic]);

  const greeting = useMemo(
    () =>
      T(
        "أهلاً! أنا Amar Support. اختار اللي محتاجه من التحت وهجاوبك على طول.",
        "Hi — I'm Amar Support. Pick what you need below and I'll answer right away.",
      ),
    [T],
  );

  // The greeting is rendered from the current language every time rather than
  // stored in the transcript, so switching language never leaves a stale
  // first bubble behind — and there is no effect needed to "reset" it.
  const reset = useCallback(() => {
    setTurns([]);
    setOptions(ROOT);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [turns, options]);

  const pick = (id: string) => {
    const node = NODES[id];
    if (!node) return;
    setTurns((prev) => [
      ...prev,
      { role: "user", text: isArabic ? node.label.ar : node.label.en },
      { role: "bot", text: isArabic ? node.answer.ar : node.answer.en, node },
    ]);
    setOptions(node.next && node.next.length > 0 ? node.next : ROOT);
  };

  return (
    <>
      {/* Launcher — sits above the mobile dock so it never covers navigation. */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={T("مساعدة", "Support")}
          className="fixed z-40 top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 md:ltr:right-5 md:rtl:left-5 ios-btn-blue w-12 h-12 md:w-14 md:h-14 !rounded-[18px] md:!rounded-[20px] shadow-[0_14px_36px_-8px_rgba(37,99,235,0.75)]"
        >
          <MessageCircle size={23} strokeWidth={2.2} />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-black/60 backdrop-blur-xl">
          <div className="ios-card w-full sm:max-w-md h-[85vh] sm:h-[620px] !rounded-t-[28px] sm:!rounded-[28px] flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 shrink-0">
              <div className="ios-tile ios-tile-blue w-10 h-10">
                <MessageCircle size={19} className="text-white" strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-white tracking-tight">Amar Support</h3>
                <p className="text-[11px] text-blue-300/80">
                  {T("رد فوري · شغال من غير نت", "Instant answers · works offline")}
                </p>
              </div>
              <button
                type="button"
                onClick={reset}
                aria-label={T("ابدأ من الأول", "Start over")}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={T("إغلاق", "Close")}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Transcript */}
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
              <div className="flex justify-start">
                <div className="max-w-[86%] rounded-[18px] rounded-es-[6px] px-4 py-3 text-sm leading-relaxed text-slate-100 bg-white/[0.055] border border-white/10">
                  {greeting}
                </div>
              </div>
              {turns.map((turn, i) => (
                <div key={i} className={turn.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div className="max-w-[86%] space-y-2.5">
                    <div
                      className={
                        turn.role === "user"
                          ? "rounded-[18px] rounded-ee-[6px] px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-b from-blue-500 to-blue-600 border border-blue-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
                          : "rounded-[18px] rounded-es-[6px] px-4 py-3 text-sm leading-relaxed text-slate-100 bg-white/[0.055] border border-white/10 whitespace-pre-line"
                      }
                    >
                      {turn.text}
                    </div>

                    {turn.node?.link && (
                      <Link
                        href={turn.node.link.href}
                        onClick={() => setOpen(false)}
                        className="ios-btn-blue w-full py-2.5 !text-[13px]"
                      >
                        {isArabic ? turn.node.link.label.ar : turn.node.link.label.en}
                        <Chevron size={15} />
                      </Link>
                    )}

                    {turn.node?.escalate && wa && (
                      <a
                        href={`https://wa.me/${wa}?text=${encodeURIComponent(
                          isArabic
                            ? `مرحباً كوتش عمار، محتاج مساعدة بخصوص: ${turn.node.label.ar}`
                            : `Hi Coach Amar, I need help with: ${turn.node.label.en}`,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ios-btn-ghost w-full py-2.5 !text-[13px] !text-white !border-blue-400/35 hover:!bg-blue-500/12"
                      >
                        <MessageCircle size={15} className="text-blue-300" />
                        {T("كلّم الكوتش على واتساب", "Message the coach on WhatsApp")}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Options — the only input; there is nothing to type. */}
            <div className="shrink-0 border-t border-white/8 px-4 py-3.5 space-y-2 max-h-[42%] overflow-y-auto">
              {options.map((id) => {
                const node = NODES[id];
                if (!node) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => pick(id)}
                    className="w-full flex items-center justify-between gap-3 text-start rounded-[16px] border border-blue-400/22 bg-blue-500/[0.07] hover:bg-blue-500/[0.14] hover:border-blue-400/40 px-4 py-3 transition-colors active:scale-[0.985]"
                  >
                    <span className="text-[13px] font-semibold text-slate-100">
                      {isArabic ? node.label.ar : node.label.en}
                    </span>
                    <Chevron size={15} className="text-blue-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
