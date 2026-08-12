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
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.12)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.08)_0%,transparent_50%)]" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full">
        {/* Content Column */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="label-badge mb-6 inline-block"
          >
            {t.hero.badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6"
          >
            <span className="text-gradient-white block">{t.hero.titleLine1}</span>
            <span className="text-gradient block">{t.hero.titleLine2}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] mb-8 max-w-lg leading-relaxed font-normal"
          >
            {t.hero.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12"
          >
            <Link href="#plans" className="btn-primary flex items-center justify-center gap-2 group">
              <span>{t.hero.startBtn}</span>
              <ArrowIcon size={15} className={`${isArabic ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
            </Link>
            <Link href="#coach" className="btn-secondary flex items-center justify-center">
              {t.hero.meetBtn}
            </Link>
          </motion.div>

          {/* Social proof strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex items-center gap-6 pt-6 border-t border-[var(--border)]"
          >
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {t.hero.stat1Value}
              </p>
              <p className="text-xs text-[var(--text-muted)]">{t.hero.stat1Label}</p>
            </div>
            <div className="w-px h-8 bg-[var(--border)]" />
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {t.hero.stat2Value}
              </p>
              <p className="text-xs text-[var(--text-muted)]">{t.hero.stat2Label}</p>
            </div>
            <div className="w-px h-8 bg-[var(--border)]" />
            <div>
              <p className="text-2xl font-bold text-[var(--accent)]">
                {t.hero.stat3Value}
              </p>
              <p className="text-xs text-[var(--text-muted)]">{t.hero.stat3Label}</p>
            </div>
          </motion.div>
        </div>

        {/* Visual Card */}
        <div className="relative flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-md mx-auto"
          >
            {/* Main image card */}
            <div className="relative rounded-sm overflow-hidden border border-[var(--border-accent)] glass-accent aspect-[3/4] w-full shadow-2xl">
              <Image
                src="/assets/coach-header.png"
                alt="Coach Amar"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 450px"
              />

              {/* Subtle bottom gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent opacity-70" />

              {/* Bottom tag */}
              <div className="absolute bottom-6 left-6 right-6">
                <span className="label-badge text-[0.65rem] mb-1.5 inline-block">{t.hero.cardBadge}</span>
                <p className="text-white text-lg font-bold leading-tight">
                  {t.hero.cardTitle}
                </p>
              </div>
            </div>

            {/* Decorative glow */}
            <div className="absolute -inset-4 bg-[radial-gradient(ellipse,rgba(59,130,246,0.18)_0%,transparent_70%)] pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
