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
            <div className="relative rounded-sm overflow-hidden border border-blue-500/30 bg-[#07090e] aspect-[4/3] shadow-2xl group">
              <Image
                src="/assets/training-plan-real.png"
                alt="AMAR X SPLIT Real Training Guide"
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090e]/70 via-transparent to-transparent pointer-events-none" />
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
