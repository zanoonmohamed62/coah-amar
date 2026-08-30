"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSiteContent } from "@/lib/use-site-content";
import { useSettings } from "@/lib/use-settings";
import { EditableText } from "@/components/cms/EditableText";
import { EditableImage } from "@/components/cms/EditableImage";

export function CoachSection() {
  const { t, isArabic } = useLanguage();
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;
  const get = useSiteContent();
  const getSetting = useSettings();

  return (
    <section id="coach" className="section-padding px-6 border-t border-slate-800/80 bg-[#07090e] relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Visual Column */}
        <motion.div
          initial={{ opacity: 0, x: isArabic ? 30 : -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Main portrait */}
          <div className="relative aspect-[3/4] rounded-sm overflow-hidden border border-slate-800 shadow-2xl bg-[#0b0f19]">
            <EditableImage
              sectionId="coach"
              fieldId="portraitImage"
              value={get("coach", "portraitImage", "/assets/coach-about-new.jpg")}
              alt="Coach Amar"
              className="object-cover object-center w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-transparent opacity-60 pointer-events-none" />
          </div>

          {/* Decorative corner accent */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-500/60" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-500/60" />
        </motion.div>

        {/* Content Column */}
        <motion.div
          initial={{ opacity: 0, x: isArabic ? -30 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="text-[0.65rem] font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-sm inline-block mb-4">
            <EditableText sectionId="coach" fieldId="badge" value={get("coach", "badge", t.coach.badge)} />
          </span>

          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-2">
            <EditableText as="span" sectionId="coach" fieldId="titleLine1" value={get("coach", "titleLine1", t.coach.titleLine1)} />{" "}
            <EditableText as="span" sectionId="coach" fieldId="titleLine2" value={get("coach", "titleLine2", t.coach.titleLine2)} />
          </h2>

          <div className="space-y-1 my-4">
            <p className="text-xl font-bold text-white">
              <EditableText sectionId="coach" fieldId="name" value={get("coach", "name", t.coach.name)} />
            </p>
            <p className="text-xs text-slate-400 font-medium">
              <EditableText sectionId="coach" fieldId="sub" value={get("coach", "sub", t.coach.sub)} />
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <a
                href={getSetting("instagram_url")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-semibold"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                amar.el.7ewety@
              </a>
              <a
                href={getSetting("youtube_url")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors font-semibold"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                amar.el.7ewety@
              </a>
            </div>
          </div>

          <div className="w-12 h-0.5 bg-blue-500/50 my-6" />

          <p className="text-slate-300 leading-relaxed mb-6 text-sm">
            <EditableText multiline sectionId="coach" fieldId="bio" value={get("coach", "bio", t.coach.bio)} />
          </p>

          <ul className="space-y-3 mb-8">
            {(["point1", "point2", "point3"] as const).map((fieldId, i) => {
              const val = get("coach", fieldId, t.coach.points[i]);
              if (!val) return null;
              return (
                <li key={fieldId} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <span className="text-blue-400 font-bold">•</span>
                  <EditableText as="span" sectionId="coach" fieldId={fieldId} value={val} />
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/checkout/coaching" className="btn-primary flex items-center gap-2 group py-3 px-6">
              <EditableText as="span" sectionId="coach" fieldId="btn" value={get("coach", "btn", t.coach.btn)} />
              <ArrowIcon size={14} className={`${isArabic ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
            </Link>
            <a
              href={getSetting("instagram_url")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center gap-2 py-3 px-5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              <span>{t.coach.igBtn}</span>
            </a>
            <a
              href={getSetting("youtube_url")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center gap-2 py-3 px-5 hover:border-red-500/40 hover:text-red-400 transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              <EditableText as="span" sectionId="coach" fieldId="ytBtn" value={get("coach", "ytBtn", t.coach.ytBtn || (isArabic ? "قناة اليوتيوب" : "YouTube"))} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
