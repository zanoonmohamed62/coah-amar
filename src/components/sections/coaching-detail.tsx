"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Dumbbell, Apple, Pill, Heart, BarChart3, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const pillarIcons = [Dumbbell, Apple, Pill, Heart];

export function CoachingDetailSection() {
  const { t, isArabic } = useLanguage();
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <section className="section-padding px-6 border-t border-[var(--border)] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="label-badge mb-4 inline-block">{t.coachingDetail.badge}</span>
          <h2
            className="text-3xl md:text-5xl font-bold text-gradient-white leading-tight mb-4"
          >
            {t.coachingDetail.titleLine1}
            <br />
            <span className="text-gradient">{t.coachingDetail.titleLine2}</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed">
            {t.coachingDetail.desc}
          </p>
        </motion.div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {t.coachingDetail.pillars.map((pillar, i) => {
            const IconComp = pillarIcons[i] || Dumbbell;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="glass-accent border border-[var(--border-accent)] rounded-sm p-6 card-hover"
              >
                <div className="w-10 h-10 rounded-sm bg-[var(--accent-glow)] flex items-center justify-center mb-4">
                  <IconComp size={18} className="text-[var(--accent)]" />
                </div>
                <h3
                  className="text-lg font-bold text-[var(--text-primary)] mb-4"
                >
                  {pillar.title}
                </h3>
                <ul className="space-y-2">
                  {pillar.items.map((item, j) => (
                    <li key={j} className="text-xs text-[var(--text-muted)] flex items-start gap-2">
                      <span className="text-[var(--accent)] mt-0.5">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Large visual + CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: isArabic ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-sm overflow-hidden border border-[var(--border-accent)] aspect-video shadow-2xl group card-hover"
          >
            <Image
              src="/assets/split-cover.png"
              alt="Amar X Split"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

            {/* Stats overlay */}
            <div className={`absolute bottom-6 ${isArabic ? "right-6" : "left-6"} flex gap-4 z-10`}>
              {t.coachingDetail.clientStats.map((s) => (
                <div key={s.label} className="glass border border-[var(--border)] rounded-sm px-3.5 py-2">
                  <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
                  <p className="text-lg font-bold text-gradient" style={{ fontFamily: isArabic ? "var(--font-alexandria)" : "var(--font-outfit)" }}>{s.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: isArabic ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h3
              className="text-3xl font-bold text-gradient-white mb-4 leading-tight"
            >
              {t.coachingDetail.visualTitle}
            </h3>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
              {t.coachingDetail.visualDesc}
            </p>

            <div className="space-y-3 mb-8">
              {[
                { icon: BarChart3, text: t.coachingDetail.feature1 },
                { icon: MessageCircle, text: t.coachingDetail.feature2 },
                { icon: Heart, text: t.coachingDetail.feature3 },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-sm bg-[var(--accent-glow)] flex items-center justify-center flex-shrink-0">
                    <item.icon size={15} className="text-[var(--accent)]" />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Link href="/checkout?plan=coaching" className="btn-primary flex items-center gap-2 relative z-10 group">
                <span>{t.coachingDetail.btn}</span>
                <ArrowIcon size={14} className={`${isArabic ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
