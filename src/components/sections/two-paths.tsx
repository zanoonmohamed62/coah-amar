"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Flame, Users } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

// Counters: how many spots taken out of 100
const SPLIT_TAKEN = 56;
const COACHING_TAKEN = 16;
const TOTAL_SPOTS = 100;

function SpotCounter({ taken, total, accentColor }: { taken: number; total: number; accentColor: string }) {
  const remaining = total - taken;
  const pct = Math.round((taken / total) * 100);
  return (
    <div className="mt-4 space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-orange-400 font-bold">
          <Flame size={12} />
          {remaining} spots left at this price
        </span>
        <span className="text-slate-500">{taken}/{total} claimed</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={`h-full rounded-full ${accentColor}`}
        />
      </div>
    </div>
  );
}

export function TwoPathsSection() {
  const { t, isArabic } = useLanguage();
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  // Discounted prices (40% off)
  const splitOriginalEGP = Math.round(497 / 0.6);
  const splitOriginalEUR = Math.round(19 / 0.6);
  const coachingOriginalEGP = Math.round(2497 / 0.6);
  const coachingOriginalEUR = Math.round(119 / 0.6);

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
          <span className="label-badge mb-4 inline-block">{t.twoPaths.badge}</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            {t.twoPaths.title}
          </h2>
          <p className="text-slate-400 mt-4 max-w-xl mx-auto leading-relaxed">
            {t.twoPaths.subtitle}
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
                    {t.twoPaths.offer1.title}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">{t.twoPaths.offer1.sub}</p>
                </div>
                <div className="text-right">
                  {/* Crossed-out original price */}
                  <p className="text-sm text-slate-500 line-through mb-0.5">
                    {splitOriginalEGP} EGP / {splitOriginalEUR} €
                  </p>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="bg-orange-500/20 text-orange-400 text-[0.65rem] font-extrabold px-2 py-0.5 rounded-sm">-40%</span>
                    <p className="text-3xl font-extrabold text-white">
                      {t.twoPaths.offer1.price}
                      <span className="text-sm font-normal text-slate-400 mx-1">{t.twoPaths.offer1.currency}</span>
                    </p>
                  </div>
                  <span className="text-[0.65rem] font-semibold tracking-wider uppercase text-slate-400 border border-slate-700/80 px-2 py-0.5 rounded-sm inline-block mt-1">
                    {t.twoPaths.offer1.type}
                  </span>
                </div>
              </div>

              {/* Spot counter */}
              <SpotCounter taken={SPLIT_TAKEN} total={TOTAL_SPOTS} accentColor="bg-gradient-to-r from-orange-500 to-orange-400" />

              <div className="h-px bg-slate-800 my-6" />

              <ul className="space-y-3 mb-8">
                {t.twoPaths.offer1.features.map((f, i) => (
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
                <span>{t.twoPaths.offer1.btn}</span>
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
            className="bg-[#0f1626] border-2 border-blue-500/40 rounded-sm p-8 flex flex-col justify-between relative"
          >
            {/* Top badge */}
            <div className={`absolute -top-3 ${isArabic ? "left-6" : "right-6"} bg-blue-600 text-white text-[0.65rem] font-extrabold tracking-wider uppercase px-3 py-1 rounded-sm shadow-md`}>
              {isArabic ? "الأكثر طلباً" : "MOST POPULAR"}
            </div>

            <div>
              <div className="flex items-start justify-between mb-6 pt-2">
                <div>
                  <span className="text-[0.65rem] font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-sm inline-block mb-3">
                    Offer 02
                  </span>
                  <h3 className="text-2xl font-bold text-white leading-tight">
                    {t.twoPaths.offer2.title}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">{t.twoPaths.offer2.sub}</p>
                </div>
                <div className="text-right">
                  {/* Crossed-out original price */}
                  <p className="text-sm text-slate-500 line-through mb-0.5">
                    {coachingOriginalEGP} EGP / {coachingOriginalEUR} €
                  </p>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="bg-orange-500/20 text-orange-400 text-[0.65rem] font-extrabold px-2 py-0.5 rounded-sm">-40%</span>
                    <p className="text-3xl font-extrabold text-blue-400">
                      {t.twoPaths.offer2.price}
                      <span className="text-sm font-normal text-slate-400 mx-1">{t.twoPaths.offer2.currency}</span>
                    </p>
                  </div>
                  <span className="text-[0.65rem] font-semibold tracking-wider uppercase text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-sm inline-block mt-1">
                    {t.twoPaths.offer2.type}
                  </span>
                </div>
              </div>

              {/* Spot counter */}
              <SpotCounter taken={COACHING_TAKEN} total={TOTAL_SPOTS} accentColor="bg-gradient-to-r from-blue-600 to-blue-400" />

              <div className="h-px bg-slate-800 my-6" />

              <ul className="space-y-3 mb-8">
                {t.twoPaths.offer2.features.map((f, i) => (
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
                <span>{t.twoPaths.offer2.btn}</span>
                <ArrowIcon size={14} className={`${isArabic ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
              </Link>
              <p className="text-center text-xs text-slate-400 mt-2.5">
                {t.twoPaths.offer2.renewal}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
