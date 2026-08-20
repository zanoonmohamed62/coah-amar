"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function HeroSection() {
  const { t, isArabic } = useLanguage();
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-28 pb-16 bg-[#07090e]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12 items-center w-full">
        {/* Content Column */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-[0.7rem] uppercase tracking-wider rounded-sm mb-6"
          >
            {t.hero.badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.15] tracking-tight mb-6 text-white"
          >
            <span className="block">{t.hero.titleLine1}</span>
            <span className="text-blue-500 block">{t.hero.titleLine2}</span>
            {t.hero.titleLine3 && <span className="block text-slate-200">{t.hero.titleLine3}</span>}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-base sm:text-lg text-slate-300 mb-8 max-w-lg leading-relaxed font-normal"
          >
            {t.hero.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12"
          >
            <Link href="#plans" className="btn-primary flex items-center justify-center gap-2 group py-3.5 px-6">
              <span>{t.hero.startBtn}</span>
              <ArrowIcon size={15} className={`${isArabic ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
            </Link>
            <a
              href="https://wa.me/34610354255"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center justify-center py-3.5 px-6 hover:border-blue-500/40 transition-colors"
            >
              {t.hero.meetBtn}
            </a>
          </motion.div>

          {/* Social proof strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center gap-8 pt-6 border-t border-slate-800/80"
          >
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">
                {t.hero.stat1Value}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{t.hero.stat1Label}</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">
                {t.hero.stat2Value}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{t.hero.stat2Label}</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <p className="text-2xl font-bold text-blue-400 tracking-tight">
                {t.hero.stat3Value}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{t.hero.stat3Label}</p>
            </div>
          </motion.div>
        </div>

        {/* Visual Card */}
        <div className="relative flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative w-full max-w-md mx-auto"
          >
            <div className="relative rounded-sm overflow-hidden border border-slate-800 bg-[#0d121c] aspect-[3/4] w-full shadow-2xl">
              <Image
                src="/assets/coach-header-new.jpg"
                alt="Coach Amar"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 450px"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-transparent opacity-80" />

              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[0.65rem] font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-sm inline-block mb-1.5">
                  {t.hero.cardBadge}
                </span>
                <p className="text-white text-lg font-bold leading-tight">
                  {t.hero.cardTitle}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
