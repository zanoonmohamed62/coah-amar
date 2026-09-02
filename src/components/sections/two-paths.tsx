"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Sparkles, Zap, ShieldCheck, Flame } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSiteContent } from "@/lib/use-site-content";
import { useCmsEditMode } from "@/components/cms/CmsEditModeProvider";
import { EditableText } from "@/components/cms/EditableText";

type ProductPrice = { slug: string; price: number; currency: string; spotsTaken?: number; totalSpots?: number };

function useProductPrices() {
  const [prices, setPrices] = useState<Record<string, ProductPrice>>({});

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        const map: Record<string, ProductPrice> = {};
        for (const p of d.products || []) map[p.slug] = p;
        setPrices(map);
      })
      .catch(() => {});
  }, []);

  return prices;
}

const SPLIT_TAKEN = 56;
const COACHING_TAKEN = 16;
const TOTAL_SPOTS = 100;

function SpotCounter({
  taken,
  total = 100,
  isArabic = false,
  fieldPrefix,
  get,
}: {
  taken: number;
  total?: number;
  isArabic?: boolean;
  fieldPrefix: string;
  get: (sectionId: string, fieldId: string, fallback: string) => string;
}) {
  const remaining = Math.max(0, total - taken);
  const pct = Math.round((taken / total) * 100);
  const badgeLabel = get("pricing", `${fieldPrefix}_spotBadge`, isArabic ? "دفعة الخصم (أول 100 مشترك)" : "Discount Batch (First 100)");
  const claimedLabel = get("pricing", `${fieldPrefix}_spotClaimed`, isArabic ? "مشترك" : "claimed");
  const filledLabel = get("pricing", `${fieldPrefix}_spotFilled`, isArabic ? "مكتمل" : "completed");

  return (
    <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800/90 shadow-inner backdrop-blur-sm">
      {/* Top row: Pulse indicator & Claimed Counter */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          <span className="text-[11px] font-bold tracking-wider text-blue-300">
            <EditableText sectionId="pricing" fieldId={`${fieldPrefix}_spotBadge`} value={badgeLabel} />
          </span>
        </div>
        <div className="text-right flex items-center gap-1">
          <span className="text-xs font-black text-white tracking-wide font-mono">
            {taken}/{total}
          </span>
          <span className="text-[11px] text-slate-400 font-semibold">
            <EditableText sectionId="pricing" fieldId={`${fieldPrefix}_spotClaimed`} value={claimedLabel} />
          </span>
        </div>
      </div>

      {/* Sleek Gradient Progress Bar */}
      <div className="h-2 bg-slate-950 rounded-full p-[1px] border border-slate-800/80 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-300 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
        />
      </div>

      {/* Bottom Info: Remaining count & percent badge */}
      <div className="flex items-center justify-between mt-2.5 text-[11px]">
        <span className="font-semibold text-slate-300">
          {isArabic
            ? `متبقي ${remaining} مقعد فقط بهذا السعر`
            : `Only ${remaining} spots left at this price`}
        </span>
        <span className="text-blue-400 font-bold text-[10px] bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
          {pct}% <EditableText as="span" sectionId="pricing" fieldId={`${fieldPrefix}_spotFilled`} value={filledLabel} />
        </span>
      </div>
    </div>
  );
}

export function TwoPathsSection() {
  const { t, isArabic } = useLanguage();
  const get = useSiteContent();
  const { active: cmsEditing } = useCmsEditMode();
  const prices = useProductPrices();
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  const offer1Price = prices["training-split"];
  const offer2Price = prices["personal-coaching"];
  const splitTaken = offer1Price?.spotsTaken ?? SPLIT_TAKEN;
  const coachingTaken = offer2Price?.spotsTaken ?? COACHING_TAKEN;

  const splitPriceEGP = offer1Price ? Math.round(offer1Price.price / 100) : 299;
  const coachingPriceEGP = offer2Price ? Math.round(offer2Price.price / 100) : 1499;

  return (
    <section id="plans" className="relative py-24 px-6 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Zap size={13} className="text-blue-400" />
            <EditableText sectionId="pricing" fieldId="badge" value={get("pricing", "badge", t.twoPaths.badge)} />
          </span>

          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight whitespace-pre-wrap">
            <EditableText sectionId="pricing" fieldId="title" value={get("pricing", "title", t.twoPaths.title)} />
          </h2>

          <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-normal">
            <EditableText multiline sectionId="pricing" fieldId="subtitle" value={get("pricing", "subtitle", t.twoPaths.subtitle)} />
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          
          {/* ── OFFER 01: AMAR X SPLIT ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="group relative bg-[#090d16]/90 hover:bg-[#0c121e]/95 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-7 sm:p-9 flex flex-col justify-between transition-all duration-300 shadow-2xl hover:shadow-[0_8px_35px_rgba(30,58,138,0.15)]"
          >
            {/* Top gradient highlight */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent group-hover:via-blue-500/60 transition-colors duration-300 rounded-t-2xl" />

            <div>
              {/* Header Badge & Title */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <span className="text-[0.7rem] font-extrabold tracking-widest text-slate-300 uppercase bg-slate-800/80 border border-slate-700/60 px-3 py-1 rounded-md inline-block mb-3">
                    <EditableText sectionId="pricing" fieldId="offer1_badge" value={get("pricing", "offer1_badge", t.twoPaths.offer1.badge)} />
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    <EditableText sectionId="pricing" fieldId="offer1_title" value={get("pricing", "offer1_title", t.twoPaths.offer1.title)} />
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                    <EditableText sectionId="pricing" fieldId="offer1_sub" value={get("pricing", "offer1_sub", t.twoPaths.offer1.sub)} />
                  </p>
                </div>

                {/* Price block */}
                <div className={`text-left ${isArabic ? "sm:text-left" : "sm:text-right"} shrink-0`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-500 line-through font-semibold">
                      {isArabic ? "19€ / 499 EGP" : "499 EGP / 19 €"}
                    </span>
                    <span className="text-[10px] font-black bg-blue-500/15 border border-blue-500/30 text-blue-400 px-2 py-0.5 rounded-md">
                      -40%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
                      {isArabic ? `${splitPriceEGP.toLocaleString("ar-EG")} ج.م` : `${splitPriceEGP.toLocaleString("en-US")} EGP`}
                    </p>
                    <span className="text-sm font-semibold text-slate-400">/ 11 €</span>
                  </div>
                  <span className="text-[0.65rem] font-bold tracking-wider uppercase text-slate-400 border border-slate-800 bg-slate-900/60 px-2.5 py-0.5 rounded-full inline-block mt-1.5">
                    <EditableText sectionId="pricing" fieldId="offer1_type" value={get("pricing", "offer1_type", t.twoPaths.offer1.type)} />
                  </span>
                </div>
              </div>

              {/* Dynamic Spot Counter */}
              <SpotCounter taken={splitTaken} total={TOTAL_SPOTS} isArabic={isArabic} fieldPrefix="offer1" get={get} />

              <div className="h-px bg-slate-800/80 my-7" />

              {/* Features List */}
              {cmsEditing ? (
                <ul className="space-y-3.5 mb-8">
                  <li className="text-sm text-slate-300">
                    <EditableText
                      multiline
                      sectionId="pricing"
                      fieldId="offer1_features"
                      value={get("pricing", "offer1_features", t.twoPaths.offer1.features.join("\n"))}
                    />
                  </li>
                </ul>
              ) : (
                <ul className="space-y-3.5 mb-8">
                  {get("pricing", "offer1_features", t.twoPaths.offer1.features.join("\n"))
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300 leading-relaxed group/item">
                        <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-blue-500/20 transition-colors">
                          <Check size={12} className="text-blue-400" />
                        </div>
                        <span>{f}</span>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            {/* CTA Area */}
            <div className="pt-6 border-t border-slate-800/80 mt-auto">
              <Link
                href="/checkout/split"
                className="w-full py-4 px-6 rounded-xl bg-slate-800/80 hover:bg-blue-600 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-200 border border-slate-700 hover:border-blue-500 group/btn shadow-lg hover:shadow-blue-600/20"
              >
                <EditableText as="span" sectionId="pricing" fieldId="offer1_btn" value={get("pricing", "offer1_btn", t.twoPaths.offer1.btn)} />
                <ArrowIcon size={16} className={`${isArabic ? "group-hover/btn:-translate-x-1" : "group-hover/btn:translate-x-1"} transition-transform`} />
              </Link>
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-400 font-medium">
                <ShieldCheck size={14} className="text-blue-400" />
                <span>
                  <EditableText sectionId="pricing" fieldId="offer1_delivery" value={get("pricing", "offer1_delivery", t.twoPaths.offer1.delivery)} />
                </span>
              </div>
            </div>
          </motion.div>

          {/* ── OFFER 02: PERSONAL COACHING (VIP TRANSFORM) ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="group relative bg-gradient-to-b from-[#0e172a] via-[#090e1c] to-[#070a14] border-2 border-blue-500/50 hover:border-blue-400 rounded-2xl p-7 sm:p-9 flex flex-col justify-between transition-all duration-300 shadow-[0_0_40px_rgba(37,99,235,0.18)] hover:shadow-[0_0_55px_rgba(37,99,235,0.28)]"
          >
            {/* Ambient inner glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12)_0%,transparent_60%)] pointer-events-none rounded-2xl" />

            {/* Floating "Most Popular" Ribbon */}
            <div className={`absolute -top-3.5 ${isArabic ? "left-6 sm:left-8" : "right-6 sm:right-8"} bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white text-[0.68rem] font-black tracking-wider uppercase px-3.5 py-1.5 rounded-full shadow-[0_4px_15px_rgba(37,99,235,0.4)] flex items-center gap-1.5 z-20`}>
              <Sparkles size={13} className="text-yellow-300 fill-yellow-300" />
              <EditableText as="span" sectionId="pricing" fieldId="offer2_mostPopular" value={get("pricing", "offer2_mostPopular", isArabic ? "الأكثر طلباً" : "MOST POPULAR")} />
            </div>

            <div>
              {/* Header Badge & Title */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 pt-1">
                <div>
                  <span className="text-[0.7rem] font-extrabold tracking-widest text-blue-300 uppercase bg-blue-500/15 border border-blue-500/30 px-3 py-1 rounded-md inline-block mb-3">
                    <EditableText sectionId="pricing" fieldId="offer2_badge" value={get("pricing", "offer2_badge", t.twoPaths.offer2.badge)} />
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    <EditableText sectionId="pricing" fieldId="offer2_title" value={get("pricing", "offer2_title", t.twoPaths.offer2.title)} />
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
                    <EditableText sectionId="pricing" fieldId="offer2_sub" value={get("pricing", "offer2_sub", t.twoPaths.offer2.sub)} />
                  </p>
                </div>

                {/* Price block */}
                <div className={`text-left ${isArabic ? "sm:text-left" : "sm:text-right"} shrink-0`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-400 line-through font-semibold">
                      {isArabic ? "119€ / 2,499 EGP" : "2,499 EGP / 119 €"}
                    </span>
                    <span className="text-[10px] font-black bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 px-2 py-0.5 rounded-md">
                      -40%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-3xl sm:text-4xl font-black text-blue-400 tracking-tight font-mono">
                      {isArabic ? `${coachingPriceEGP.toLocaleString("ar-EG")} ج.م` : `${coachingPriceEGP.toLocaleString("en-US")} EGP`}
                    </p>
                    <span className="text-sm font-semibold text-slate-300">/ 71 €</span>
                  </div>
                  <span className="text-[0.65rem] font-bold tracking-wider uppercase text-blue-400 border border-blue-500/30 bg-blue-950/60 px-2.5 py-0.5 rounded-full inline-block mt-1.5">
                    <EditableText sectionId="pricing" fieldId="offer2_type" value={get("pricing", "offer2_type", t.twoPaths.offer2.type)} />
                  </span>
                </div>
              </div>

              {/* Dynamic Spot Counter */}
              <SpotCounter taken={coachingTaken} total={TOTAL_SPOTS} isArabic={isArabic} fieldPrefix="offer2" get={get} />

              <div className="h-px bg-slate-800/80 my-7" />

              {/* Features List */}
              {cmsEditing ? (
                <ul className="space-y-3.5 mb-8">
                  <li className="text-sm text-slate-200 font-medium">
                    <EditableText
                      multiline
                      sectionId="pricing"
                      fieldId="offer2_features"
                      value={get("pricing", "offer2_features", t.twoPaths.offer2.features.join("\n"))}
                    />
                  </li>
                </ul>
              ) : (
                <ul className="space-y-3.5 mb-8">
                  {get("pricing", "offer2_features", t.twoPaths.offer2.features.join("\n"))
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200 font-medium leading-relaxed group/item">
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-blue-500/30 transition-colors">
                          <Check size={12} className="text-blue-300 font-bold" />
                        </div>
                        <span>{f}</span>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            {/* CTA Area */}
            <div className="pt-6 border-t border-slate-800/80 mt-auto">
              <Link
                href="/checkout/coaching"
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-200 shadow-xl shadow-blue-600/30 hover:shadow-blue-600/45 group/btn"
              >
                <EditableText as="span" sectionId="pricing" fieldId="offer2_btn" value={get("pricing", "offer2_btn", t.twoPaths.offer2.btn)} />
                <ArrowIcon size={16} className={`${isArabic ? "group-hover/btn:-translate-x-1" : "group-hover/btn:translate-x-1"} transition-transform`} />
              </Link>
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-300 font-medium text-center">
                <Flame size={14} className="text-orange-400 shrink-0" />
                <span>
                  <EditableText sectionId="pricing" fieldId="offer2_renewal" value={get("pricing", "offer2_renewal", t.twoPaths.offer2.renewal)} />
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
