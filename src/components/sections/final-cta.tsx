"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSiteContent } from "@/lib/use-site-content";

export function FinalCTASection() {
  const { t, isArabic } = useLanguage();
  const get = useSiteContent();
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <section className="relative py-32 px-6 overflow-hidden border-t border-[var(--border)]">
      {/* Cinematic background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.14)_0%,transparent_70%)]" />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Accent line top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-[var(--accent)] to-transparent" />

      <div className="max-w-4xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          <span className="label-badge mb-8 inline-block">{get("finalCta", "badge", t.finalCta.badge)}</span>

          <h2
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-8"
          >
            <span className="text-gradient-white block">{get("finalCta", "titleLine1", t.finalCta.titleLine1)}</span>
            <span className="text-gradient block">{get("finalCta", "titleLine2", t.finalCta.titleLine2)}</span>
            <span className="text-gradient-white block">{get("finalCta", "titleLine3", t.finalCta.titleLine3)}</span>
          </h2>

          <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed mb-12 max-w-xl mx-auto whitespace-pre-wrap">
            {get("finalCta", "subtitle", t.finalCta.subtitle)}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/checkout/split" className="btn-secondary flex items-center justify-center gap-2">
              {get("finalCta", "planBtn", t.finalCta.planBtn)}
            </Link>
            <Link href="/checkout/coaching" className="btn-primary flex items-center justify-center gap-2 group">
              <span>{get("finalCta", "coachingBtn", t.finalCta.coachingBtn)}</span>
              <ArrowIcon size={14} className={`${isArabic ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
            </Link>
          </div>

          <p className="text-xs text-[var(--text-muted)] mt-8 tracking-wide">
            {get("finalCta", "footerTag", t.finalCta.footerTag)}
          </p>
        </motion.div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-t from-[var(--accent)] to-transparent" />
    </section>
  );
}
