"use client";

import { motion, type Variants } from "framer-motion";
import { X, Check, Dumbbell, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSiteContent } from "@/lib/use-site-content";
import { useCmsEditMode } from "@/components/cms/CmsEditModeProvider";
import { EditableText } from "@/components/cms/EditableText";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
  }),
};

export function ProblemSection() {
  const { t, isArabic } = useLanguage();
  const get = useSiteContent();
  const { active: cmsEditing } = useCmsEditMode();

  const genericPointsStr = get("problem", "leftPoints", t.problem.genericPoints.join("\n"));
  const genericPoints = genericPointsStr.split("\n").map(s => s.trim()).filter(Boolean);

  const coachingPointsStr = get("problem", "rightPoints", t.problem.coachingPoints.join("\n"));
  const coachingPoints = coachingPointsStr.split("\n").map(s => s.trim()).filter(Boolean);

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
          <span className="label-badge mb-4 inline-block"><EditableText sectionId="problem" fieldId="badge" value={get("problem", "badge", t.problem.badge)} /></span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight whitespace-pre-wrap">
            <EditableText as="span" className="text-slate-400" sectionId="problem" fieldId="titleLine1" value={get("problem", "titleLine1", t.problem.title.split('\n')[0] || '')} />
            <br />
            <EditableText as="span" sectionId="problem" fieldId="titleLine2" value={get("problem", "titleLine2", t.problem.title.split('\n')[1] || '')} />
          </h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto leading-relaxed text-sm md:text-base whitespace-pre-wrap">
            <EditableText multiline sectionId="problem" fieldId="subtitle" value={get("problem", "subtitle", t.problem.subtitle)} />
          </p>
        </motion.div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {/* Left: Random Workouts (The Problem) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="athletic-card p-7 sm:p-8 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.07]">
                <div className="w-10 h-10 rounded-sm bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <X size={18} className="text-red-400" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-bold tracking-widest uppercase mb-0.5">
                    <EditableText sectionId="problem" fieldId="leftTitle" value={get("problem", "leftTitle", t.problem.genericTitleBadge)} />
                  </p>
                  <p className="text-lg font-bold text-slate-200">
                    <EditableText sectionId="problem" fieldId="leftHeading" value={get("problem", "leftHeading", t.problem.genericHeading)} />
                  </p>
                </div>
              </div>

              {cmsEditing ? (
                <ul className="space-y-3.5">
                  <li className="text-xs md:text-sm text-slate-400 leading-relaxed">
                    <EditableText multiline sectionId="problem" fieldId="leftPoints" value={genericPointsStr} />
                  </li>
                </ul>
              ) : (
                <ul className="space-y-3.5">
                  {genericPoints.map((item, i) => (
                    <motion.li
                      key={i}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      className="flex items-start gap-3 text-xs md:text-sm text-slate-400 leading-relaxed"
                    >
                      <div className="w-4 h-4 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X size={11} className="text-red-400/80" />
                      </div>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>

          {/* Right: The Amar Performance System (The Solution) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="athletic-card-featured p-7 sm:p-8 relative overflow-hidden flex flex-col justify-between"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-blue-500/20">
                <div className="w-10 h-10 rounded-sm bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-[11px] text-blue-400 font-bold tracking-widest uppercase mb-0.5">
                    <EditableText sectionId="problem" fieldId="rightTitle" value={get("problem", "rightTitle", t.problem.coachingTitleBadge)} />
                  </p>
                  <p className="text-lg font-bold text-white">
                    <EditableText sectionId="problem" fieldId="rightHeading" value={get("problem", "rightHeading", t.problem.coachingHeading)} />
                  </p>
                </div>
              </div>

              {cmsEditing ? (
                <ul className="space-y-3.5">
                  <li className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed">
                    <EditableText multiline sectionId="problem" fieldId="rightPoints" value={coachingPointsStr} />
                  </li>
                </ul>
              ) : (
                <ul className="space-y-3.5">
                  {coachingPoints.map((item, i) => (
                    <motion.li
                      key={i}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      className="flex items-start gap-3 text-xs md:text-sm text-slate-200 font-medium leading-relaxed"
                    >
                      <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-500/30">
                        <Check size={11} className="text-blue-400" />
                      </div>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

