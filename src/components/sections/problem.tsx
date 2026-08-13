"use client";

import { motion, type Variants } from "framer-motion";
import { X, Check } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
  }),
};

export function ProblemSection() {
  const { t } = useLanguage();

  return (
    <section className="section-padding px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="label-badge mb-4 inline-block">{t.problem.badge}</span>
          <h2
            className="text-3xl md:text-5xl font-bold text-gradient-white leading-tight"
          >
            {t.problem.title}
          </h2>
          <p className="text-[var(--text-secondary)] mt-4 max-w-lg mx-auto leading-relaxed">
            {t.problem.subtitle}
          </p>
        </motion.div>

        {/* Split comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Generic plan */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="glass border border-[var(--border)] rounded-sm p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-sm bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <X size={16} className="text-red-400" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] tracking-wider uppercase mb-0.5">{t.problem.genericTitleBadge}</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">
                  {t.problem.genericHeading}
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {t.problem.genericPoints.map((item, i) => (
                <motion.li
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex items-start gap-3 text-sm text-[var(--text-muted)]"
                >
                  <X size={15} className="text-red-400/70 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Personal coaching */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="bg-[#0f1522] border border-blue-500/30 rounded-sm p-8 relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-sm bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                <Check size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-blue-400 tracking-wider uppercase mb-0.5">{t.problem.coachingTitleBadge}</p>
                <p className="text-lg font-bold text-white">
                  {t.problem.coachingHeading}
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {t.problem.coachingPoints.map((item, i) => (
                <motion.li
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex items-start gap-3 text-sm text-slate-300"
                >
                  <Check size={15} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
