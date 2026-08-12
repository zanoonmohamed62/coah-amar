"use client";

import { motion } from "framer-motion";
import { ShoppingCart, User, Zap, MessageCircle, TrendingUp, RotateCcw } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const planIcons = [ShoppingCart, User, Zap];
const coachingIcons = [ShoppingCart, User, Zap, MessageCircle, TrendingUp, RotateCcw];

function StepCard({ step, icon: Icon, title, desc, delay }: {
  step: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex items-start gap-4"
    >
      <div className="flex-shrink-0 relative">
        <div className="w-10 h-10 rounded-sm glass-accent border border-[var(--border-accent)] flex items-center justify-center">
          <Icon size={16} className="text-[var(--accent)]" />
        </div>
        <span className="absolute -top-2 -right-2 text-[0.6rem] font-bold text-[var(--accent)] bg-[var(--bg-primary)] px-1 rounded border border-[var(--border-accent)]">
          {step}
        </span>
      </div>
      <div>
        <p className="text-sm font-bold text-[var(--text-primary)] mb-0.5">
          {title}
        </p>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

export function HowItWorksSection() {
  const { t, isArabic } = useLanguage();

  return (
    <section className="section-padding px-6 border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="label-badge mb-4 inline-block">{t.howItWorks.badge}</span>
          <h2
            className="text-3xl md:text-5xl font-bold text-gradient-white leading-tight"
          >
            {t.howItWorks.title}
          </h2>
          <p className="text-[var(--text-secondary)] mt-4 max-w-md mx-auto leading-relaxed">
            {t.howItWorks.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Training Plan track */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="label-badge">{t.howItWorks.planTrack}</span>
            </div>
            <div className="space-y-6 relative">
              {/* Connecting line */}
              <div className={`absolute ${isArabic ? "right-5" : "left-5"} top-10 bottom-0 w-px bg-gradient-to-b from-[var(--border-accent)] to-transparent`} />
              {t.howItWorks.planSteps.map((s, i) => {
                const Icon = planIcons[i] || Zap;
                return (
                  <StepCard key={i} step={s.step} icon={Icon} title={s.title} desc={s.desc} delay={i * 0.12} />
                );
              })}
            </div>
          </div>

          {/* Coaching track */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="label-badge">{t.howItWorks.coachingTrack}</span>
            </div>
            <div className="space-y-6 relative">
              <div className={`absolute ${isArabic ? "right-5" : "left-5"} top-10 bottom-0 w-px bg-gradient-to-b from-[var(--border-accent)] to-transparent`} />
              {t.howItWorks.coachingSteps.map((s, i) => {
                const Icon = coachingIcons[i] || Zap;
                return (
                  <StepCard key={i} step={s.step} icon={Icon} title={s.title} desc={s.desc} delay={i * 0.1} />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
