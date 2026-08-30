"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSiteContent } from "@/lib/use-site-content";
import { useCmsEditMode } from "@/components/cms/CmsEditModeProvider";
import { EditableText } from "@/components/cms/EditableText";

type ProductPrice = { slug: string; price: number; currency: string };

// Prices are the real source of truth (Product.price in the DB, edited from
// /admin/products) — the CMS only controls surrounding copy (badge, features,
// button text), never the number itself, so the two can't drift apart anymore.
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

// Spot counters out of 100 total spots
const SPLIT_TAKEN = 56;
const COACHING_TAKEN = 16;
const TOTAL_SPOTS = 100;

function SpotCounter({
  taken,
  total = 100,
  isArabic = false,
}: {
  taken: number;
  total?: number;
  isArabic?: boolean;
}) {
  const remaining = total - taken;
  const pct = Math.round((taken / total) * 100);

  return (
    <div className="mt-5 p-3.5 rounded-sm bg-gradient-to-b from-[#0e1726]/90 to-[#070b14]/90 border border-blue-500/20 shadow-inner">
      {/* Top row: Pulse indicator & Claimed Counter */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-[11px] font-bold tracking-wider uppercase text-blue-300">
            {isArabic ? "دفعة محدودة (أول 100 مشترك)" : "Limited Batch (First 100)"}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-white tracking-wide">
            {taken}/{total}
          </span>
          <span className="text-[10px] text-slate-400 ml-1 font-semibold">
            {isArabic ? "مشترك" : "claimed"}
          </span>
        </div>
      </div>

      {/* Sleek Gradient Progress Bar */}
      <div className="h-2 bg-slate-900/90 rounded-full p-[1px] border border-slate-800/80 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-300 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
        />
      </div>

      {/* Bottom Info: Remaining count & percent badge */}
      <div className="flex items-center justify-between mt-2 text-[11px]">
        <span className="font-semibold text-slate-200">
          {isArabic
            ? `متبقي ${remaining} مقعد فقط في هذه الدفعة`
            : `${remaining} spots remaining in this batch`}
        </span>
        <span className="text-blue-400 font-bold text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
          {pct}% {isArabic ? "مكتمل" : "filled"}
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

  return (
    <section id="plans" className="section-padding px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="label-badge mb-4 inline-block"><EditableText sectionId="pricing" fieldId="badge" value={get("pricing", "badge", t.twoPaths.badge)} /></span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight whitespace-pre-wrap">
            <EditableText sectionId="pricing" fieldId="title" value={get("pricing", "title", t.twoPaths.title)} />
          </h2>
          <p className="text-slate-400 mt-4 max-w-xl mx-auto leading-relaxed whitespace-pre-wrap">
            <EditableText multiline sectionId="pricing" fieldId="subtitle" value={get("pricing", "subtitle", t.twoPaths.subtitle)} />
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* OFFER 01 — Ammar X Split */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-[#0b0f19] border border-slate-800 rounded-sm p-8 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-[0.65rem] font-bold tracking-widest text-slate-400 uppercase bg-slate-800/80 px-2.5 py-1 rounded-sm inline-block mb-3">
                    {t.twoPaths.offer1.badge}
                  </span>
                  <h3 className="text-2xl font-bold text-white leading-tight">
                    <EditableText sectionId="pricing" fieldId="offer1_title" value={get("pricing", "offer1_title", t.twoPaths.offer1.title)} />
                  </h3>
                  <p className="text-slate-400 text-sm mt-1"><EditableText sectionId="pricing" fieldId="offer1_sub" value={get("pricing", "offer1_sub", t.twoPaths.offer1.sub)} /></p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <p className="text-3xl font-extrabold text-white">
                      {offer1Price ? (offer1Price.price / 100).toLocaleString() : "…"}
                      <span className="text-sm font-normal text-slate-400 mx-1">{offer1Price?.currency || "EGP"}</span>
                    </p>
                  </div>
                  {cmsEditing && (
                    <p className="text-[10px] text-blue-400 mt-1 max-w-[140px] leading-tight">
                      Price comes from Products — edit it in /admin/products
                    </p>
                  )}
                  <span className="text-[0.65rem] font-semibold tracking-wider uppercase text-slate-400 border border-slate-700/80 px-2 py-0.5 rounded-sm inline-block mt-1">
                    {t.twoPaths.offer1.type}
                  </span>
                </div>
              </div>

              {/* Spot counter (56 / 100) */}
              <SpotCounter taken={SPLIT_TAKEN} total={TOTAL_SPOTS} isArabic={isArabic} />

              <div className="h-px bg-slate-800 my-6" />

              {cmsEditing ? (
                <ul className="space-y-3 mb-8">
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
                <ul className="space-y-3 mb-8">
                  {get("pricing", "offer1_features", t.twoPaths.offer1.features.join("\n")).split("\n").map(s => s.trim()).filter(Boolean).map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <Check size={15} className="text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/60">
              <Link
                href="/checkout/split"
                className="btn-secondary w-full flex items-center justify-center gap-2 text-center group py-3"
              >
                <EditableText as="span" sectionId="pricing" fieldId="offer1_btn" value={get("pricing", "offer1_btn", t.twoPaths.offer1.btn)} />
                <ArrowIcon size={14} className={`${isArabic ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
              </Link>
              <p className="text-center text-xs text-slate-400 mt-2.5">
                {t.twoPaths.offer1.delivery}
              </p>
            </div>
          </motion.div>

          {/* OFFER 02 — Personal Coaching */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="bg-[#0f1626] border-2 border-blue-500/40 rounded-sm p-8 flex flex-col justify-between relative shadow-xl shadow-blue-950/30"
          >
            {/* Top badge */}
            <div className={`absolute -top-3 ${isArabic ? "left-6" : "right-6"} bg-blue-600 text-white text-[0.65rem] font-extrabold tracking-wider uppercase px-3 py-1 rounded-sm shadow-md flex items-center gap-1`}>
              <Sparkles size={11} />
              <span>{isArabic ? "الأكثر طلباً" : "MOST POPULAR"}</span>
            </div>

            <div>
              <div className="flex items-start justify-between mb-6 pt-2">
                <div>
                  <span className="text-[0.65rem] font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-sm inline-block mb-3">
                    {t.twoPaths.offer2.badge}
                  </span>
                  <h3 className="text-2xl font-bold text-white leading-tight">
                    <EditableText sectionId="pricing" fieldId="offer2_title" value={get("pricing", "offer2_title", t.twoPaths.offer2.title)} />
                  </h3>
                  <p className="text-slate-400 text-sm mt-1"><EditableText sectionId="pricing" fieldId="offer2_sub" value={get("pricing", "offer2_sub", t.twoPaths.offer2.sub)} /></p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <p className="text-3xl font-extrabold text-blue-400">
                      {offer2Price ? (offer2Price.price / 100).toLocaleString() : "…"}
                      <span className="text-sm font-normal text-slate-400 mx-1">{offer2Price?.currency || "EGP"}</span>
                    </p>
                  </div>
                  {cmsEditing && (
                    <p className="text-[10px] text-blue-400 mt-1 max-w-[140px] leading-tight">
                      Price comes from Products — edit it in /admin/products
                    </p>
                  )}
                  <span className="text-[0.65rem] font-semibold tracking-wider uppercase text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-sm inline-block mt-1">
                    {t.twoPaths.offer2.type}
                  </span>
                </div>
              </div>

              {/* Spot counter (16 / 100) */}
              <SpotCounter taken={COACHING_TAKEN} total={TOTAL_SPOTS} isArabic={isArabic} />

              <div className="h-px bg-slate-800 my-6" />

              {cmsEditing ? (
                <ul className="space-y-3 mb-8">
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
                <ul className="space-y-3 mb-8">
                  {get("pricing", "offer2_features", t.twoPaths.offer2.features.join("\n")).split("\n").map(s => s.trim()).filter(Boolean).map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-200 font-medium">
                      <Check size={15} className="text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/60">
              <Link
                href="/checkout/coaching"
                className="btn-primary w-full flex items-center justify-center gap-2 group py-3"
              >
                <EditableText as="span" sectionId="pricing" fieldId="offer2_btn" value={get("pricing", "offer2_btn", t.twoPaths.offer2.btn)} />
                <ArrowIcon size={14} className={`${isArabic ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
              </Link>
              <p className="text-center text-xs text-slate-400 mt-2.5">
                <EditableText sectionId="pricing" fieldId="offer2_renewal" value={get("pricing", "offer2_renewal", t.twoPaths.offer2.renewal)} />
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

