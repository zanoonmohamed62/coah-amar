"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function TestimonialsSection() {
  const { t, isArabic } = useLanguage();

  return (
    <section id="results" className="section-padding px-6 border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="label-badge mb-4 inline-block">{t.testimonials.badge}</span>
          <h2
            className="text-3xl md:text-5xl font-bold text-gradient-white leading-tight"
          >
            {t.testimonials.titleLine1}
            <br />
            <span className="text-gradient">{t.testimonials.titleLine2}</span>
          </h2>
          <p className="text-[var(--text-secondary)] mt-4 max-w-md mx-auto leading-relaxed">
            {t.testimonials.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {t.testimonials.list.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass border border-[var(--border)] rounded-sm p-6 card-hover relative flex flex-col justify-between"
            >
              <Quote size={32} className={`text-[var(--accent)] opacity-20 absolute top-6 ${isArabic ? "left-6" : "right-6"}`} />

              <div>
                <div className="flex items-center gap-1 mb-4">
                  {Array(5).fill(0).map((_, j) => (
                    <Star key={j} size={13} className="text-[var(--accent)]" fill="currentColor" />
                  ))}
                </div>

                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 italic">
                  &ldquo;{item.text}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{item.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{item.duration}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-[var(--accent)]">{item.result}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social proof numbers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-3 gap-4 mt-8 glass border border-[var(--border)] rounded-sm p-6"
        >
          {[
            { value: t.hero.stat1Value, label: t.hero.stat1Label },
            { value: t.hero.stat2Value, label: t.hero.stat2Label },
            { value: t.hero.stat3Value, label: t.hero.stat3Label },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                className="text-3xl font-bold text-gradient mb-1"
                style={{ fontFamily: isArabic ? "var(--font-alexandria)" : "var(--font-outfit)" }}
              >
                {stat.value}
              </p>
              <p className="text-xs text-[var(--text-muted)] tracking-wide">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
