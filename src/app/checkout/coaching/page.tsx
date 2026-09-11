"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSiteContent } from "@/lib/use-site-content";
import { EditableText } from "@/components/cms/EditableText";
import { EditableImage } from "@/components/cms/EditableImage";
import { CheckoutFlow, type ExtraField } from "@/components/checkout/CheckoutFlow";
import {
  RealisticWhatsAppIcon,
  RealisticNutritionIcon,
  RealisticActivityIcon,
  RealisticDumbbellIcon,
} from "@/components/client/PwaIcons";

// Offer 02 — coaching (the plan plus three months of WhatsApp follow-up).
//
// Everything the customer fills in here — goal, experience level, injuries and
// diet notes — is stored on the Order and shown in full on the admin's order
// detail, alongside their transfer screenshot. Order logic lives in
// CheckoutFlow, shared with the split page.

const PILLAR_ICONS = [
  RealisticActivityIcon,
  RealisticNutritionIcon,
  RealisticWhatsAppIcon,
  RealisticDumbbellIcon,
];

export default function CoachingCheckoutPage() {
  const { t, isArabic } = useLanguage();
  const get = useSiteContent();
  const Back = isArabic ? ChevronRight : ChevronLeft;

  const goalOptionsAr = [
    "حرق الدهون والتنشيف",
    "بناء العضلات والضخامة",
    "إعادة تشكيل الجسم (خسارة دهون وبناء عضل)",
    "زيادة القوة واللياقة البدنية العامة",
  ];
  const goalOptionsEn = [
    "Fat Loss & Definition",
    "Muscle Building & Bulking",
    "Body Recomposition",
    "Strength & Athletic Performance",
  ];
  const levelOptionsAr = ["مبتدئ (أقل من سنة)", "متوسط (سنة - 3 سنوات)", "متقدم (أكتر من 3 سنوات)"];
  const levelOptionsEn = ["Beginner (< 1 year)", "Intermediate (1 - 3 years)", "Advanced (3+ years)"];

  const extraFields: ExtraField[] = [
    {
      name: "goal",
      required: true,
      type: "select",
      label: { ar: "هدفك من المتابعة", en: "Your goal" },
      placeholder: { ar: "اختر هدفك", en: "Choose your goal" },
      options: goalOptionsAr.map((ar, i) => ({ value: goalOptionsEn[i], label: { ar, en: goalOptionsEn[i] } })),
    },
    {
      name: "level",
      required: true,
      type: "select",
      label: { ar: "مستواك الحالي", en: "Training experience" },
      placeholder: { ar: "اختر مستواك", en: "Choose your level" },
      options: levelOptionsAr.map((ar, i) => ({ value: levelOptionsEn[i], label: { ar, en: levelOptionsEn[i] } })),
    },
    {
      name: "notes",
      type: "textarea",
      label: { ar: "إصابات أو ملاحظات غذائية (اختياري)", en: "Injuries or dietary notes (optional)" },
      placeholder: {
        ar: "مثلاً: مشاكل في الركبة، حساسية لاكتوز، مواعيد تمرين معينة...",
        en: "e.g. knee issues, lactose intolerance, a fixed training schedule…",
      },
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] pt-24 pb-20 px-5 sm:px-6">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.14),transparent_65%)]" />

      <div className="relative max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors mb-8"
        >
          <Back size={15} />
          <span>{isArabic ? "العودة للرئيسية" : "Back to Home"}</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ── Left: what coaching actually is ── */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/12 border border-blue-400/28 text-blue-300 text-[11px] font-bold uppercase tracking-[0.14em] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                <EditableText sectionId="coachingDetail" fieldId="badge" value={get("coachingDetail", "badge", t.coachingDetail.badge)} />
              </span>

              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.08] tracking-tight">
                <EditableText sectionId="coachingDetail" fieldId="titleLine1" value={get("coachingDetail", "titleLine1", t.coachingDetail.titleLine1)} />{" "}
                <span className="text-blue-500">
                  <EditableText sectionId="coachingDetail" fieldId="titleLine2" value={get("coachingDetail", "titleLine2", t.coachingDetail.titleLine2)} />
                </span>
              </h1>

              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                <EditableText multiline sectionId="coachingDetail" fieldId="desc" value={get("coachingDetail", "desc", t.coachingDetail.desc)} />
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {t.coachingDetail.pillars.map((pillar, i) => {
                const Icon = PILLAR_ICONS[i] ?? RealisticActivityIcon;
                return (
                  <div key={i} className="ios-card p-4">
                    <div className="ios-tile ios-tile-blue w-10 h-10 mb-3">
                      <Icon className="w-5.5 h-5.5" />
                    </div>
                    <p className="text-sm font-bold text-white tracking-tight">
                      <EditableText sectionId="coachingDetail" fieldId={`pillar${i + 1}_title`} value={get("coachingDetail", `pillar${i + 1}_title`, pillar.title)} />
                    </p>
                    <ul className="mt-1.5 space-y-1">
                      {pillar.items.map((line, k) => (
                        <li key={k} className="flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-400/70 shrink-0" />
                          <EditableText sectionId="coachingDetail" fieldId={`pillar${i + 1}_item${k + 1}`} value={get("coachingDetail", `pillar${i + 1}_item${k + 1}`, line)} />
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="ios-card overflow-hidden">
              <div className="relative aspect-[4/3]">
                <EditableImage
                  sectionId="coachingDetail"
                  fieldId="visualImage"
                  value={get("coachingDetail", "visualImage", "/assets/coach-amar.jpg")}
                  alt={t.coachingDetail.visualTitle}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/20 to-transparent pointer-events-none" />
              </div>
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-extrabold text-white leading-tight tracking-tight">
                  <EditableText sectionId="coachingDetail" fieldId="visualTitle" value={get("coachingDetail", "visualTitle", t.coachingDetail.visualTitle)} />
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  <EditableText multiline sectionId="coachingDetail" fieldId="visualDesc" value={get("coachingDetail", "visualDesc", t.coachingDetail.visualDesc)} />
                </p>
                <div className="space-y-2.5 pt-1">
                  {["feature1", "feature2", "feature3"].map((key, i) => (
                    <div key={key} className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                      <p className="text-xs sm:text-sm text-slate-300">
                        <EditableText
                          sectionId="coachingDetail"
                          fieldId={key}
                          value={get("coachingDetail", key, [t.coachingDetail.feature1, t.coachingDetail.feature2, t.coachingDetail.feature3][i])}
                        />
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: the actual checkout ── */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <CheckoutFlow
              slugs={["personal-coaching", "coaching", "online-coaching"]}
              draftKey="coaching"
              productLabel={{ ar: "المتابعة الشخصية + الجدول", en: "Personal Coaching + Split" }}
              extraFields={extraFields}
              deliveryNote={{
                ar: "المتابعة بتتم بالكامل على الواتساب مع الكوتش. التطبيق بيديك الجدول بالعربي والإنجليزي ويشتغل من غير نت.",
                en: "Coaching itself runs entirely over WhatsApp with the coach. The app gives you the plan in Arabic and English, and works offline.",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
