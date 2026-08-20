"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Dumbbell, ListChecks, Timer, TrendingUp } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const icons = [Dumbbell, ListChecks, Timer, TrendingUp];

export function TrainingPlanSection() {
  const { t, isArabic } = useLanguage();
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <section className="section-padding px-6 border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: isArabic ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="label-badge mb-4 inline-block">{t.trainingDetail.badge}</span>
            <h2
              className="text-4xl md:text-5xl font-bold text-gradient-white leading-tight mb-4"
            >
              {t.trainingDetail.titleLine1}
              <br />
              <span className="text-gradient">{t.trainingDetail.titleLine2}</span>
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-8 max-w-md">
              {t.trainingDetail.desc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {t.trainingDetail.highlights.map((item, i) => {
                const IconComponent = icons[i] || Dumbbell;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="glass border border-[var(--border)] rounded-sm p-4"
                  >
                    <IconComponent size={18} className="text-[var(--accent)] mb-2" />
                    <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">{item.title}</p>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link href="/checkout?plan=training" className="btn-primary flex items-center gap-2 relative z-10 group">
                <span>{t.trainingDetail.btn}</span>
                <ArrowIcon size={14} className={`${isArabic ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
              </Link>
              <p className="text-xs text-[var(--text-muted)] whitespace-pre-line leading-relaxed">
                {t.trainingDetail.paymentInfo}
              </p>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: isArabic ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-sm overflow-hidden border border-[var(--border-accent)] bg-[#07090e] aspect-[4/3] shadow-2xl group flex flex-col items-center justify-center card-hover">
              {/* Abstract decorative elements */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_60%)] pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50" />
              
              {/* Simulated PDF Header */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center opacity-40">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500/80" />
                  <div className="w-2 h-2 rounded-full bg-amber-500/80" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
                </div>
                <div className="text-[8px] sm:text-[10px] font-mono tracking-widest text-[var(--accent)]">AMARX_SPLIT.PDF</div>
              </div>

              {/* Main Typography */}
              <div className="text-center z-10 relative mt-4 transform group-hover:scale-105 transition-transform duration-500">
                <h3 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-none tracking-tighter" style={{ fontFamily: "var(--font-outfit)" }}>
                  AMAR
                </h3>
                <div className="flex items-center justify-center gap-3 my-2">
                  <div className="h-px bg-white/20 w-12 sm:w-16" />
                  <span className="text-4xl sm:text-5xl font-black text-[var(--accent)] leading-none italic">X</span>
                  <div className="h-px bg-white/20 w-12 sm:w-16" />
                </div>
                <h3 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-none tracking-tighter" style={{ fontFamily: "var(--font-outfit)" }}>
                  SPLIT
                </h3>
              </div>

              {/* Simulated Footer Grid */}
              <div className="absolute bottom-6 w-[80%] grid grid-cols-3 gap-3 opacity-60">
                <div className="h-12 border border-[var(--border)] rounded-sm bg-[var(--bg-elevated)] flex flex-col justify-center px-3 group-hover:border-[var(--border-accent)] transition-colors delay-75">
                  <div className="w-6 h-1 bg-[var(--accent)] mb-1.5 rounded-sm" />
                  <div className="w-12 h-1 bg-white/20 rounded-sm" />
                </div>
                <div className="h-12 border border-[var(--border)] rounded-sm bg-[var(--bg-elevated)] flex flex-col justify-center px-3 group-hover:border-[var(--border-accent)] transition-colors delay-100">
                  <div className="w-8 h-1 bg-[var(--accent)] mb-1.5 rounded-sm" />
                  <div className="w-14 h-1 bg-white/20 rounded-sm" />
                </div>
                <div className="h-12 border border-[var(--border)] rounded-sm bg-[var(--bg-elevated)] flex flex-col justify-center px-3 group-hover:border-[var(--border-accent)] transition-colors delay-150">
                  <div className="w-5 h-1 bg-[var(--accent)] mb-1.5 rounded-sm" />
                  <div className="w-10 h-1 bg-white/20 rounded-sm" />
                </div>
              </div>
            </div>

            {/* Price tag overlay */}
            <div className={`absolute -bottom-4 ${isArabic ? "-left-4" : "-right-4"} glass-accent border border-[var(--border-accent)] rounded-sm px-6 py-4 text-center shadow-xl`}>
              <p className="text-xs text-[var(--accent)] tracking-wider uppercase mb-1">{t.trainingDetail.cardBadge}</p>
              <p className="text-3xl font-bold text-gradient" style={{ fontFamily: isArabic ? "var(--font-alexandria)" : "var(--font-outfit)" }}>
                {t.trainingDetail.cardPrice} <span className="text-sm font-normal text-[var(--text-muted)]">{t.trainingDetail.cardCurrency}</span>
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{t.trainingDetail.cardSub}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
