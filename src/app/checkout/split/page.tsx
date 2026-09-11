"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSiteContent } from "@/lib/use-site-content";
import { EditableText } from "@/components/cms/EditableText";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import {
  RealisticDumbbellIcon,
  RealisticDocumentIcon,
  RealisticShieldIcon,
  RealisticOfflineGymIcon,
} from "@/components/client/PwaIcons";

// Offer 01 — the training split on its own.
//
// The page is now marketing on the left, the checkout engine on the right. All
// order logic lives in CheckoutFlow: no order is created until the customer has
// transferred, uploaded the screenshot and pressed Confirm, and a refresh at any
// point restores exactly where they were.

const HIGHLIGHT_ICONS = [
  RealisticDumbbellIcon,
  RealisticDocumentIcon,
  RealisticShieldIcon,
  RealisticOfflineGymIcon,
];

export default function SplitCheckoutPage() {
  const { t, isArabic } = useLanguage();
  const get = useSiteContent();
  const Back = isArabic ? ChevronRight : ChevronLeft;

  return (
    <div className="min-h-screen bg-[#07090e] pt-24 pb-20 px-5 sm:px-6">
      {/* Ambient backlight, the way an iOS sheet sits on a lit ground. */}
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
          {/* ── Left: what it is ── */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/12 border border-blue-400/28 text-blue-300 text-[11px] font-bold uppercase tracking-[0.14em] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                <EditableText sectionId="trainingDetail" fieldId="badge" value={get("trainingDetail", "badge", t.trainingDetail.badge)} />
              </span>

              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.08] tracking-tight">
                {isArabic ? "نظام التدريب المتقدم" : "THE TRAINING PLAN"}
                <br />
                <span className="text-blue-500">&ldquo;AMAR X SPLIT&rdquo;</span>
              </h1>

              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                <EditableText multiline sectionId="trainingDetail" fieldId="desc" value={get("trainingDetail", "desc", t.trainingDetail.desc)} />
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {t.trainingDetail.highlights.map((item, i) => {
                const Icon = HIGHLIGHT_ICONS[i] ?? RealisticDumbbellIcon;
                return (
                  <div key={i} className="ios-card p-4">
                    <div className="ios-tile ios-tile-blue w-10 h-10 mb-3">
                      <Icon className="w-5.5 h-5.5" />
                    </div>
                    <p className="text-sm font-bold text-white tracking-tight">
                      <EditableText sectionId="trainingDetail" fieldId={`highlight${i + 1}_title`} value={get("trainingDetail", `highlight${i + 1}_title`, item.title)} />
                    </p>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                      <EditableText multiline sectionId="trainingDetail" fieldId={`highlight${i + 1}_desc`} value={get("trainingDetail", `highlight${i + 1}_desc`, item.desc)} />
                    </p>
                  </div>
                );
              })}
            </div>

            {/* The plan, as an object. Typography only — no generated artwork. */}
            <div className="ios-card p-7 sm:p-9">
              <div className="flex items-center justify-between opacity-50 mb-6">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500/80" />
                  <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[10px] font-mono tracking-[0.2em] text-blue-400">AMARX_SPLIT.PDF</span>
              </div>
              <div className="text-center py-4">
                <h3 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tighter">AMAR</h3>
                <div className="flex items-center justify-center gap-3 my-2">
                  <span className="h-px bg-white/18 w-12" />
                  <span className="text-3xl font-black text-blue-400 leading-none italic">X</span>
                  <span className="h-px bg-white/18 w-12" />
                </div>
                <h3 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tighter">SPLIT</h3>
              </div>
            </div>
          </div>

          {/* ── Right: the actual checkout ── */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <CheckoutFlow
              slugs={["training-split", "training-plan", "ammar-x-split", "amar-x-split"]}
              draftKey="split"
              productLabel={{ ar: "الجدول التدريبي — AMAR X SPLIT", en: "Training Split — AMAR X SPLIT" }}
              deliveryNote={{
                ar: "بعد التفعيل هتلاقي الجدول جوه التطبيق بالعربي والإنجليزي، ويشتغل من غير نت.",
                en: "Once activated, your plan is inside the app in both Arabic and English, and works offline.",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
