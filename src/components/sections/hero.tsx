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
import { EditableText } from "@/components/cms/EditableText";
import { EditableImage } from "@/components/cms/EditableImage";

export function HeroSection() {
  const { t, isArabic } = useLanguage();
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;
  const get = useSiteContent();
  const getSetting = useSettings();
  const waNumber = getSetting("whatsapp_number").replace(/[^0-9]/g, "");
  const { canInstall, triggerInstall } = usePWAInstall();

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden pt-28 pb-16 bg-[#07090e]">
      {/* Subtle Hardware-Accelerated Ambient Light (Zero CPU cost) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(37,99,235,0.14),transparent)] pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center w-full relative z-10">
        {/* Content Column (7 cols) */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold text-[0.72rem] uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(37,99,235,0.15)] mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <EditableText sectionId="hero" fieldId="badge" value={get("hero", "badge", t.hero.badge)} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight mb-6 text-white"
          >
            <EditableText as="span" className="block text-white" sectionId="hero" fieldId="titleLine1" value={get("hero", "titleLine1", t.hero.titleLine1)} />
            <EditableText as="span" className="text-blue-500 block drop-shadow-[0_0_25px_rgba(59,130,246,0.3)]" sectionId="hero" fieldId="titleLine2" value={get("hero", "titleLine2", t.hero.titleLine2)} />
            {get("hero", "titleLine3", t.hero.titleLine3 || "") && (
              <EditableText as="span" className="block text-slate-100 tracking-tight" sectionId="hero" fieldId="titleLine3" value={get("hero", "titleLine3", t.hero.titleLine3 || "")} />
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="text-base sm:text-lg text-slate-300 mb-9 max-w-xl leading-relaxed font-normal"
          >
            <EditableText multiline sectionId="hero" fieldId="description" value={get("hero", "description", t.hero.description)} />
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3.5 mb-12"
          >
            <Link href="#plans" className="btn-primary group py-3.5 px-7">
              <EditableText as="span" sectionId="hero" fieldId="startBtn" value={get("hero", "startBtn", t.hero.startBtn)} />
              <ArrowIcon size={14} className={`${isArabic ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
            </Link>

            {canInstall ? (
              <button
                onClick={triggerInstall}
                className="px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-[var(--radius-lg)] transition-all flex items-center justify-center gap-2.5 text-sm font-bold shadow-[0_4px_16px_rgba(37,99,235,0.35)] group cursor-pointer border border-blue-400/30"
              >
                <Smartphone size={16} />
                <span>{get("hero", "appBtn", t.hero.appBtn || (isArabic ? "ثبّت التطبيق" : "Install App"))}</span>
              </button>
            ) : (
              <Link
                href="/app"
                className="px-5 py-3.5 bg-[#0e1626] border border-blue-500/30 text-blue-300 hover:text-white hover:bg-blue-600/20 hover:border-blue-400/60 rounded-[var(--radius-lg)] transition-all flex items-center justify-center gap-2.5 text-sm font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] group"
              >
                <div className="w-5 h-5 rounded-[var(--radius-sm)] overflow-hidden flex-shrink-0 border border-blue-400/40 shadow-sm">
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
              className="btn-secondary py-3.5 px-5 text-sm hover:border-blue-500/40"
            >
              <EditableText sectionId="hero" fieldId="meetBtn" value={get("hero", "meetBtn", t.hero.meetBtn)} />
            </a>
          </motion.div>

          {/* Social proof strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex items-center gap-6 sm:gap-8 pt-6 border-t border-slate-800/80 max-w-xl"
          >
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                <EditableText sectionId="hero" fieldId="stat1Value" value={get("hero", "stat1Value", t.hero.stat1Value)} />
              </p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium"><EditableText sectionId="hero" fieldId="stat1Label" value={get("hero", "stat1Label", t.hero.stat1Label)} /></p>
            </div>
            <div className="w-px h-9 bg-slate-800" />
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                <EditableText sectionId="hero" fieldId="stat2Value" value={get("hero", "stat2Value", t.hero.stat2Value)} />
              </p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium"><EditableText sectionId="hero" fieldId="stat2Label" value={get("hero", "stat2Label", t.hero.stat2Label)} /></p>
            </div>
            <div className="w-px h-9 bg-slate-800" />
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 tracking-tight">
                <EditableText sectionId="hero" fieldId="stat3Value" value={get("hero", "stat3Value", t.hero.stat3Value)} />
              </p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium"><EditableText sectionId="hero" fieldId="stat3Label" value={get("hero", "stat3Label", t.hero.stat3Label)} /></p>
            </div>
          </motion.div>
        </div>

        {/* Visual Card Column (5 cols) */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="relative w-full max-w-md mx-auto"
          >
            {/* Ambient Backglow */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-blue-600/20 via-blue-500/10 to-transparent rounded-[var(--radius-xl)] filter blur-xl opacity-70 pointer-events-none" />

            <div className="relative rounded-[var(--radius-xl)] overflow-hidden border border-slate-800/90 bg-[#0d121c] aspect-[3/4] w-full shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] group">
              <EditableImage
                sectionId="hero"
                fieldId="heroImage"
                value={get("hero", "heroImage", "/assets/coach-header-new.jpg")}
                alt="Coach Amar"
                className="object-cover object-center w-full h-full"
              />

              {/* Realistic dark gradient vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/20 to-transparent opacity-85 pointer-events-none" />

              {/* Top registration badge */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <span className="text-[10px] font-mono tracking-widest text-slate-400/80 bg-[#07090e]/80 backdrop-blur-md px-2.5 py-1 rounded-[var(--radius-sm)] border border-white/10">
                  COACH AMAR · OFFICIAL
                </span>
                <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#3b82f6]" />
              </div>

              {/* Bottom Card Content */}
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[0.65rem] font-bold tracking-widest text-blue-300 uppercase bg-blue-500/15 border border-blue-500/30 px-2.5 py-1 rounded-[var(--radius-pill)] inline-block mb-2 backdrop-blur-sm">
                  <EditableText sectionId="hero" fieldId="cardBadge" value={get("hero", "cardBadge", t.hero.cardBadge)} />
                </span>
                <p className="text-white text-lg sm:text-xl font-extrabold leading-tight">
                  <EditableText sectionId="hero" fieldId="cardTitle" value={get("hero", "cardTitle", t.hero.cardTitle)} />
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
