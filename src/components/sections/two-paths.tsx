"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSiteContent } from "@/lib/use-site-content";

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
            {isArabic ? "دفعة الخصم (أول 100 مشترك)" : "Discount Batch (First 100)"}
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
            ? `متبقي ${remaining} مقعد فقط بهذا السعر`
            : `${remaining} spots remaining at this price`}
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
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  // Base undiscounted prices
  const splitOriginalEGP = 499;
  const splitOriginalEUR = 19;
  const coachingOriginalEGP = "2,499";
  const coachingOriginalEUR = 119;

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
          <span className="label-badge mb-4 inline-block">{get("pricing", "badge", t.twoPaths.badge)}</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight whitespace-pre-wrap">
            {get("pricing", "title", t.twoPaths.title)}
          </h2>
          <p className="text-slate-400 mt-4 max-w-xl mx-auto leading-relaxed whitespace-pre-wrap">
            {get("pricing", "subtitle", t.twoPaths.subtitle)}
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
                    {get("pricing", "offer1_title", t.twoPaths.offer1.title)}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">{get("pricing", "offer1_sub", t.twoPaths.offer1.sub)}</p>
                </div>
                <div className="text-right">
                  {/* Crossed-out original price (499 EGP) */}
                  <div className="flex items-center justify-end gap-1.5 text-sm text-slate-500 line-through mb-0.5 font-medium">
                    <span dir="ltr">{splitOriginalEGP} EGP</span>
                    <span>/</span>
                    <span dir="ltr">{splitOriginalEUR} €</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[0.65rem] font-black px-2 py-0.5 rounded-sm">
                      -40%
                    </span>
                    <p className="text-3xl font-extrabold text-white">
                      {get("pricing", "offer1_price", t.twoPaths.offer1.price)}
                      <span className="text-sm font-normal text-slate-400 mx-1">{get("pricing", "offer1_currency", t.twoPaths.offer1.currency)}</span>
                    </p>
                  </div>
                  <span className="text-[0.65rem] font-semibold tracking-wider uppercase text-slate-400 border border-slate-700/80 px-2 py-0.5 rounded-sm inline-block mt-1">
                    {t.twoPaths.offer1.type}
                  </span>
                </div>
              </div>

              {/* Spot counter (56 / 100) */}
              <SpotCounter taken={SPLIT_TAKEN} total={TOTAL_SPOTS} isArabic={isArabic} />

              <div className="h-px bg-slate-800 my-6" />

              <ul className="space-y-3 mb-8">
                {get("pricing", "offer1_features", t.twoPaths.offer1.features.join("\n")).split("\n").map(s => s.trim()).filter(Boolean).map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <Check size={15} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/60">
              <Link
                href="/checkout/split"
                className="btn-secondary w-full flex items-center justify-center gap-2 text-center group py-3"
              >
                <span>{get("pricing", "offer1_btn", t.twoPaths.offer1.btn)}</span>
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
                    {get("pricing", "offer2_title", t.twoPaths.offer2.title)}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">{get("pricing", "offer2_sub", t.twoPaths.offer2.sub)}</p>
                </div>
                <div className="text-right">
                  {/* Crossed-out original price (2,499 EGP) */}
                  <div className="flex items-center justify-end gap-1.5 text-sm text-slate-500 line-through mb-0.5 font-medium">
                    <span dir="ltr">{coachingOriginalEGP} EGP</span>
                    <span>/</span>
                    <span dir="ltr">{coachingOriginalEUR} €</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[0.65rem] font-black px-2 py-0.5 rounded-sm">
                      -40%
                    </span>
                    <p className="text-3xl font-extrabold text-blue-400">
                      {get("pricing", "offer2_price", t.twoPaths.offer2.price)}
                      <span className="text-sm font-normal text-slate-400 mx-1">{get("pricing", "offer2_currency", t.twoPaths.offer2.currency)}</span>
                    </p>
                  </div>
                  <span className="text-[0.65rem] font-semibold tracking-wider uppercase text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-sm inline-block mt-1">
                    {t.twoPaths.offer2.type}
                  </span>
                </div>
              </div>

              {/* Spot counter (16 / 100) */}
              <SpotCounter taken={COACHING_TAKEN} total={TOTAL_SPOTS} isArabic={isArabic} />

              <div className="h-px bg-slate-800 my-6" />

              <ul className="space-y-3 mb-8">
                {get("pricing", "offer2_features", t.twoPaths.offer2.features.join("\n")).split("\n").map(s => s.trim()).filter(Boolean).map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-200 font-medium">
                    <Check size={15} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/60">
              <Link
                href="/checkout/coaching"
                className="btn-primary w-full flex items-center justify-center gap-2 group py-3"
              >
                <span>{get("pricing", "offer2_btn", t.twoPaths.offer2.btn)}</span>
                <ArrowIcon size={14} className={`${isArabic ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
              </Link>
              <p className="text-center text-xs text-slate-400 mt-2.5">
                {get("pricing", "offer2_renewal", t.twoPaths.offer2.renewal)}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

