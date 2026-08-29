"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSiteContent } from "@/lib/use-site-content";
import { useSettings } from "@/lib/use-settings";
import { usePWAInstall } from "@/lib/pwa-install-context";
import { Smartphone } from "lucide-react";

export function HeroSection() {
  const { t, isArabic } = useLanguage();
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;
  const get = useSiteContent();
  const getSetting = useSettings();
  const waNumber = getSetting("whatsapp_number").replace(/[^0-9]/g, "");
  const { canInstall, triggerInstall } = usePWAInstall();

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
            {get("hero", "badge", t.hero.badge)}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.15] tracking-tight mb-6 text-white"
          >
            <span className="block">{get("hero", "titleLine1", t.hero.titleLine1)}</span>
            <span className="text-blue-500 block">{get("hero", "titleLine2", t.hero.titleLine2)}</span>
            {get("hero", "titleLine3", t.hero.titleLine3 || "") && <span className="block text-slate-200">{get("hero", "titleLine3", t.hero.titleLine3 || "")}</span>}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-base sm:text-lg text-slate-300 mb-8 max-w-lg leading-relaxed font-normal"
          >
            {get("hero", "description", t.hero.description)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3.5 mb-12"
          >
            <Link href="#plans" className="btn-primary flex items-center justify-center gap-2 group py-3.5 px-6">
              <span>{get("hero", "startBtn", t.hero.startBtn)}</span>
              <ArrowIcon size={15} className={`${isArabic ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
            </Link>

            {canInstall ? (
              <button
                onClick={triggerInstall}
                className="px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-sm transition-all flex items-center justify-center gap-2.5 text-sm font-bold shadow-lg shadow-blue-600/30 group"
              >
                <Smartphone size={16} />
                <span>{get("hero", "appBtn", t.hero.appBtn || (isArabic ? "ثبّت التطبيق" : "Install App"))}</span>
              </button>
            ) : (
              <Link
                href="/app"
                className="px-5 py-3.5 bg-blue-600/15 border border-blue-500/40 text-blue-300 hover:text-white hover:bg-blue-600/25 hover:border-blue-400 rounded-sm transition-all flex items-center justify-center gap-2.5 text-sm font-bold shadow-lg shadow-blue-600/10 group"
              >
                <div className="w-5 h-5 rounded-md overflow-hidden flex-shrink-0 border border-blue-400/40 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/icon-192.png" alt="X" className="w-full h-full object-cover" />
                </div>
                <span>{get("hero", "appBtn", t.hero.appBtn || (isArabic ? "تطبيق المتدربين X App" : "Customer X App"))}</span>
              </Link>
            )}

            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center justify-center py-3.5 px-5 hover:border-blue-500/40 transition-colors text-sm"
            >
              {get("hero", "meetBtn", t.hero.meetBtn)}
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
                {get("hero", "stat1Value", t.hero.stat1Value)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{get("hero", "stat1Label", t.hero.stat1Label)}</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">
                {get("hero", "stat2Value", t.hero.stat2Value)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{get("hero", "stat2Label", t.hero.stat2Label)}</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <p className="text-2xl font-bold text-blue-400 tracking-tight">
                {get("hero", "stat3Value", t.hero.stat3Value)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{get("hero", "stat3Label", t.hero.stat3Label)}</p>
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={get("hero", "heroImage", "/assets/coach-header-new.jpg")}
                alt="Coach Amar"
                className="object-cover object-center w-full h-full"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-transparent opacity-80" />

              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[0.65rem] font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-sm inline-block mb-1.5">
                  {get("hero", "cardBadge", t.hero.cardBadge)}
                </span>
                <p className="text-white text-lg font-bold leading-tight">
                  {get("hero", "cardTitle", t.hero.cardTitle)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
