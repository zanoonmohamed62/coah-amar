"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSiteContent } from "@/lib/use-site-content";

export function CoachSection() {
  const { t, isArabic } = useLanguage();
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;
  const get = useSiteContent();

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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={get("coach", "portraitImage", "/assets/coach-about-new.jpg")}
              alt="Coach Amar"
              className="object-cover object-center w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-transparent opacity-60" />
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
            {t.coach.badge}
          </span>

          <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-2">
            {t.coach.titleLine1} {t.coach.titleLine2}
          </h2>

          <div className="space-y-1 my-4">
            <p className="text-xl font-bold text-white">
              {get("coach", "name", t.coach.name)}
            </p>
            <p className="text-xs text-slate-400 font-medium">
              {get("coach", "sub", t.coach.sub)}
            </p>
            <a
              href={get("coach", "igUrl", "https://www.instagram.com/amar.el.7ewety/")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors mt-1 font-semibold"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              amar.el.7ewety@
            </a>
          </div>

          <div className="w-12 h-0.5 bg-blue-500/50 my-6" />

          <p className="text-slate-300 leading-relaxed mb-6 text-sm">
            {get("coach", "bio", t.coach.bio)}
          </p>

          <ul className="space-y-3 mb-8">
            {[get("coach", "point1", t.coach.points[0]), get("coach", "point2", t.coach.points[1]), get("coach", "point3", t.coach.points[2])].filter(Boolean).map((pt, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="text-blue-400 font-bold">•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/checkout?plan=coaching" className="btn-primary flex items-center gap-2 group py-3 px-6">
              <span>{get("coach", "btn", t.coach.btn)}</span>
              <ArrowIcon size={14} className={`${isArabic ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
            </Link>
            <a
              href={get("coach", "igUrl", "https://www.instagram.com/amar.el.7ewety/")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center gap-2 py-3 px-6"
            >
              <span>{t.coach.igBtn}</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
