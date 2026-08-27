"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Apple, Heart, BarChart3 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSiteContent } from "@/lib/use-site-content";

export function CoachingExperienceSection() {
  const [activeWeek, setActiveWeek] = useState(0);
  const { t, isArabic } = useLanguage();
  const get = useSiteContent();
  const weeks = t.experience.weeks;
  const week = weeks[activeWeek] || weeks[0];

  return (
    <section className="section-padding px-6 border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="label-badge mb-4 inline-block">{get("experience", "badge", t.experience.badge)}</span>
          <h2
            className="text-3xl md:text-5xl font-bold text-gradient-white leading-tight"
          >
            {get("experience", "titleLine1", t.experience.titleLine1)}
            <br />
            <span className="text-gradient">{get("experience", "titleLine2", t.experience.titleLine2)}</span>
          </h2>
          <p className="text-[var(--text-secondary)] mt-4 max-w-md mx-auto leading-relaxed whitespace-pre-wrap">
            {get("experience", "subtitle", t.experience.subtitle)}
          </p>
        </motion.div>

        {/* Week selector */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {weeks.map((w, i) => (
            <button
              key={i}
              onClick={() => setActiveWeek(i)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-sm text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                activeWeek === i
                  ? "bg-[var(--accent)] text-white shadow-lg shadow-blue-500/20"
                  : "glass border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-accent)] hover:text-[var(--accent)]"
              }`}
            >
              {w.week}
            </button>
          ))}
        </div>

        {/* Dashboard preview */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeWeek}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="glass-accent border border-[var(--border-accent)] rounded-sm p-6 md:p-8 shadow-xl"
          >
            {/* Week header */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-[var(--border)]">
              <div>
                <p className="text-xs text-[var(--accent)] tracking-wider uppercase mb-1">{week.week}</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">
                  {week.label}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[var(--text-muted)] mb-1">{get("experience", "metricsProgress", t.experience.metricsProgress)}</p>
                <p className="text-sm text-[var(--accent)] font-semibold">{week.progress}</p>
              </div>
            </div>

            {/* Data cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Training */}
              <div className="glass border border-[var(--border)] rounded-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Dumbbell size={15} className="text-[var(--accent)]" />
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{get("experience", "metricsTraining", t.experience.metricsTraining)}</span>
                </div>
                <div className="flex gap-1 mb-2">
                  {Array(week.training.total).fill(0).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1.5 rounded-full ${
                        i < week.training.completed
                          ? "bg-[var(--accent)]"
                          : "bg-[var(--border)]"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-lg font-bold text-gradient" style={{ fontFamily: isArabic ? "var(--font-alexandria)" : "var(--font-outfit)" }}>
                  {week.training.completed}/{week.training.total}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{week.training.label}</p>
              </div>

              {/* Nutrition */}
              <div className="glass border border-[var(--border)] rounded-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Apple size={15} className="text-[var(--accent)]" />
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{get("experience", "metricsNutrition", t.experience.metricsNutrition)}</span>
                </div>
                <p className="text-lg font-bold text-gradient mb-0.5" style={{ fontFamily: isArabic ? "var(--font-alexandria)" : "var(--font-outfit)" }}>
                  {week.nutrition.value}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{week.nutrition.label}</p>
              </div>

              {/* Cardio */}
              <div className="glass border border-[var(--border)] rounded-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Heart size={15} className="text-[var(--accent)]" />
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{get("experience", "metricsCardio", t.experience.metricsCardio)}</span>
                </div>
                <p className="text-lg font-bold text-gradient mb-0.5" style={{ fontFamily: isArabic ? "var(--font-alexandria)" : "var(--font-outfit)" }}>
                  {week.cardio.value}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{week.cardio.label}</p>
              </div>

              {/* Check-in */}
              <div className="glass border border-[var(--border)] rounded-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 size={15} className="text-[var(--accent)]" />
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{get("experience", "metricsCheckIn", t.experience.metricsCheckIn)}</span>
                </div>
                <p className="text-sm font-semibold text-[var(--text-secondary)] leading-snug">{week.checkin}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
