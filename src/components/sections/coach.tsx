"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Award, Users, Target } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function CoachSection() {
  const { t, isArabic } = useLanguage();
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <section id="coach" className="section-padding px-6 border-t border-[var(--border)] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(59,130,246,0.08)_0%,transparent_60%)]" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Visual Column */}
        <motion.div
          initial={{ opacity: 0, x: isArabic ? 30 : -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Main portrait / video */}
          <div className="relative aspect-[3/4] rounded-sm overflow-hidden border border-[var(--border-accent)] shadow-2xl">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/assets/coach-portrait.png"
              className="absolute inset-0 w-full h-full object-cover transform-gpu"
            >
              <source src="/assets/coach-video-hero.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[rgba(7,9,14,0.2)] to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[rgba(7,9,14,0.3)]" />
          </div>

          {/* Decorative corner accent */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--accent)] opacity-60" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--accent)] opacity-60" />
        </motion.div>

        {/* Content Column */}
        <motion.div
          initial={{ opacity: 0, x: isArabic ? -30 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="label-badge mb-4 inline-block">{t.coach.badge}</span>

          <h2
            className="text-4xl md:text-5xl font-bold text-gradient-white leading-tight mb-1"
          >
            {t.coach.titleLine1}
          </h2>
          <h2
            className="text-4xl md:text-5xl font-bold text-gradient leading-tight mb-6"
          >
            {t.coach.titleLine2}
          </h2>

          <div className="space-y-1 mb-2">
            <p className="text-xl font-bold text-[var(--text-primary)]">
              {t.coach.name}
            </p>
            <p className="text-xs text-[var(--text-muted)] font-medium">
              {t.coach.sub}
            </p>
            <a
              href="https://www.instagram.com/amar.el.7ewety/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--accent)] hover:text-[var(--accent-light)] transition-colors mt-1"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              @amar.el.7ewety
            </a>
          </div>

          <div className="divider my-6" />

          <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
            {t.coach.bio}
          </p>

          <ul className="space-y-3 mb-8">
            {t.coach.points.map((pt, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--accent)] font-bold">·</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/checkout?plan=coaching" className="btn-primary flex items-center gap-2 relative z-10 group">
              <span>{t.coach.btn}</span>
              <ArrowIcon size={14} className={`${isArabic ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
            </Link>
            <a
              href="https://www.instagram.com/amar.el.7ewety/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center gap-2"
            >
              <span>{t.coach.igBtn}</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
