"use client";

import { motion } from "framer-motion";
import { ShoppingCart, User, Zap, MessageCircle, TrendingUp, RotateCcw } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSiteContent } from "@/lib/use-site-content";
import { EditableText } from "@/components/cms/EditableText";

const planIcons = [ShoppingCart, User, Zap];
const coachingIcons = [ShoppingCart, User, Zap, MessageCircle, TrendingUp, RotateCcw];

function StepCard({ step, icon: Icon, sectionId, titleFieldId, title, descFieldId, desc, delay }: {
  step: string;
  icon: React.ElementType;
  sectionId: string;
  titleFieldId: string;
  title: string;
  descFieldId: string;
  desc: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="p-4 rounded-[var(--radius-md)] bg-[#0b0f19] border border-white/[0.06] hover:border-blue-500/30 hover:bg-white/[0.03] transition-all flex items-start gap-4 group"
    >
      <div className="flex-shrink-0 relative">
        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.15)] group-hover:scale-105 transition-transform">
          <Icon size={18} />
        </div>
        <span className="absolute -top-1.5 -right-1.5 text-[0.6rem] font-black text-blue-300 bg-[#07090e] px-1.5 py-0.5 rounded-[var(--radius-sm)] border border-blue-500/30">
          {step}
        </span>
      </div>
      <div>
        <p className="text-sm font-bold text-white mb-1">
          <EditableText sectionId={sectionId} fieldId={titleFieldId} value={title} />
        </p>
        <p className="text-xs text-slate-400 leading-relaxed font-normal">
          <EditableText multiline sectionId={sectionId} fieldId={descFieldId} value={desc} />
        </p>
      </div>
    </motion.div>
  );
}

export function HowItWorksSection() {
  const { t, isArabic } = useLanguage();
  const get = useSiteContent();

  const planSteps = t.howItWorks.planSteps.map((step, i) => ({
    step: step.step,
    titleFieldId: `plan_step${i + 1}_title`,
    title: get("howItWorks", `plan_step${i + 1}_title`, step.title),
    descFieldId: `plan_step${i + 1}_desc`,
    desc: get("howItWorks", `plan_step${i + 1}_desc`, step.desc),
  }));

  const coachingSteps = t.howItWorks.coachingSteps.map((step, i) => ({
    step: step.step,
    titleFieldId: `coach_step${i + 1}_title`,
    title: get("howItWorks", `coach_step${i + 1}_title`, step.title),
    descFieldId: `coach_step${i + 1}_desc`,
    desc: get("howItWorks", `coach_step${i + 1}_desc`, step.desc),
  }));

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
          <span className="label-badge mb-4 inline-block">
            <EditableText sectionId="howItWorks" fieldId="badge" value={get("howItWorks", "badge", t.howItWorks.badge)} />
          </span>
          <h2
            className="text-3xl md:text-5xl font-bold text-gradient-white leading-tight"
          >
            <EditableText sectionId="howItWorks" fieldId="title" value={get("howItWorks", "title", t.howItWorks.title)} />
          </h2>
          <p className="text-[var(--text-secondary)] mt-4 max-w-md mx-auto leading-relaxed whitespace-pre-wrap">
            <EditableText multiline sectionId="howItWorks" fieldId="subtitle" value={get("howItWorks", "subtitle", t.howItWorks.subtitle)} />
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Training Plan track */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="label-badge">
                <EditableText sectionId="howItWorks" fieldId="planTrack" value={get("howItWorks", "planTrack", t.howItWorks.planTrack)} />
              </span>
            </div>
            <div className="space-y-6 relative">
              {/* Connecting line */}
              <div className={`absolute ${isArabic ? "right-5" : "left-5"} top-10 bottom-0 w-px bg-gradient-to-b from-[var(--border-accent)] to-transparent`} />
              {planSteps.map((s, i) => {
                const Icon = planIcons[i] || Zap;
                return (
                  <StepCard
                    key={i}
                    step={s.step}
                    icon={Icon}
                    sectionId="howItWorks"
                    titleFieldId={s.titleFieldId}
                    title={s.title}
                    descFieldId={s.descFieldId}
                    desc={s.desc}
                    delay={i * 0.12}
                  />
                );
              })}
            </div>
          </div>

          {/* Coaching track */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="label-badge">
                <EditableText sectionId="howItWorks" fieldId="coachingTrack" value={get("howItWorks", "coachingTrack", t.howItWorks.coachingTrack)} />
              </span>
            </div>
            <div className="space-y-6 relative">
              <div className={`absolute ${isArabic ? "right-5" : "left-5"} top-10 bottom-0 w-px bg-gradient-to-b from-[var(--border-accent)] to-transparent`} />
              {coachingSteps.map((s, i) => {
                const Icon = coachingIcons[i] || Zap;
                return (
                  <StepCard
                    key={i}
                    step={s.step}
                    icon={Icon}
                    sectionId="howItWorks"
                    titleFieldId={s.titleFieldId}
                    title={s.title}
                    descFieldId={s.descFieldId}
                    desc={s.desc}
                    delay={i * 0.1}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
