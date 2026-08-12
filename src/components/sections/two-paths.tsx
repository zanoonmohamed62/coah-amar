"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Star } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function TwoPathsSection() {
  const { t, isArabic } = useLanguage();
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

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
          <h2
            className="text-3xl md:text-5xl font-bold text-gradient-white leading-tight"
          >
            {t.twoPaths.title}
          </h2>
          <p className="text-[var(--text-secondary)] mt-4 max-w-xl mx-auto leading-relaxed">
            {t.twoPaths.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* OFFER 01 — Training Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="glass border border-[var(--border)] rounded-sm p-8 card-hover relative overflow-hidden flex flex-col justify-between h-full"
          >
            <div className="absolute inset-0 pointer-events-none">
              <Image
                src="/assets/training-dashboard.png"
                alt="Training Plan"
                fill
                className="object-cover opacity-[0.06] scale-105"
              />
            </div>
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="label-badge mb-3 inline-block">{t.twoPaths.offer1.badge}</span>
                  <h3
                    className="text-2xl font-bold text-[var(--text-primary)] leading-tight"
                  >
                    {t.twoPaths.offer1.title}
                  </h3>
                  <p className="text-[var(--text-muted)] text-sm mt-1">{t.twoPaths.offer1.sub}</p>
                </div>
                <div className="text-right">
                  <p
                    className="text-3xl font-bold text-gradient"
                    style={{ fontFamily: isArabic ? "var(--font-alexandria)" : "var(--font-outfit)" }}
                  >
                    {t.twoPaths.offer1.price}
                    <span className="text-sm font-normal text-[var(--text-muted)] mx-1">{t.twoPaths.offer1.currency}</span>
                  </p>
                  <span className="text-[0.65rem] font-semibold tracking-wider uppercase text-[var(--text-muted)] border border-[var(--border)] px-2 py-0.5 rounded-sm inline-block mt-1">
                    {t.twoPaths.offer1.type}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {t.twoPaths.offer1.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                    <Check size={15} className="text-[var(--accent)] mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mt-4">
              <Link
                href="/checkout?plan=training"
                className="btn-secondary w-full flex items-center justify-center gap-2 text-center group"
              >
                <span>{t.twoPaths.offer1.btn}</span>
                <ArrowIcon size={14} className={`${isArabic ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
              </Link>
              <p className="text-center text-xs text-[var(--text-muted)] mt-2">
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
            className="glass-accent border border-[var(--border-accent)] rounded-sm p-8 card-hover relative overflow-hidden flex flex-col justify-between h-full"
          >
            {/* Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle,rgba(59,130,246,0.22)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute inset-0 pointer-events-none">
              <Image
                src="/assets/coaching-dashboard.png"
                alt="Personal Coaching"
                fill
                className="object-cover opacity-[0.08] scale-105"
              />
            </div>

            {/* Most popular badge */}
            <div className={`absolute top-0 ${isArabic ? "left-6" : "right-6"} bg-[var(--accent)] text-white text-[0.65rem] font-bold tracking-wider uppercase px-3 py-1 rounded-b-sm`}>
              {isArabic ? "الأكثر طلباً" : "MOST POPULAR"}
            </div>

            <div className="relative">
              <div className="flex items-start justify-between mb-6 pt-4">
                <div>
                  <span className="label-badge mb-3 inline-block">Offer 02</span>
                  <h3
                    className="text-2xl font-bold text-[var(--text-primary)] leading-tight"
                  >
                    {t.twoPaths.offer2.title}
                  </h3>
                  <p className="text-[var(--text-muted)] text-sm mt-1">{t.twoPaths.offer2.sub}</p>
                </div>
                <div className="text-right">
                  <p
                    className="text-3xl font-bold text-gradient"
                    style={{ fontFamily: isArabic ? "var(--font-alexandria)" : "var(--font-outfit)" }}
                  >
                    {t.twoPaths.offer2.price}
                    <span className="text-sm font-normal text-[var(--text-muted)] mx-1">{t.twoPaths.offer2.currency}</span>
                  </p>
                  <span className="text-[0.65rem] font-semibold tracking-wider uppercase text-[var(--accent)] border border-[var(--border-accent)] px-2 py-0.5 rounded-sm inline-block mt-1">
                    {t.twoPaths.offer2.type}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {t.twoPaths.offer2.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                    <Check size={15} className="text-[var(--accent)] mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* Stars */}
              <div className="flex items-center gap-1 mb-6">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} size={13} className="text-[var(--accent)]" fill="currentColor" />
                ))}
                <span className="text-xs text-[var(--text-muted)] mx-2">
                  {isArabic ? "تجربة احترافية متكاملة" : "Premium 1-on-1 Experience"}
                </span>
              </div>
            </div>

            <div className="relative">
              <Link
                href="/checkout?plan=coaching"
                className="btn-primary w-full flex items-center justify-center gap-2 relative z-10 group"
              >
                <span>{t.twoPaths.offer2.btn}</span>
                <ArrowIcon size={14} className={`${isArabic ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
              </Link>

              <p className="text-center text-xs text-[var(--text-muted)] mt-2">
                {t.twoPaths.offer2.renewal}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
