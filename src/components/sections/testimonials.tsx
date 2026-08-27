"use client";

import { motion } from "framer-motion";
import { MessageSquarePlus, Star } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSiteContent } from "@/lib/use-site-content";

export function TestimonialsSection() {
  const { t, isArabic } = useLanguage();
  const get = useSiteContent();

  const reviews = [
    {
      name: get("testimonials", "t1_name"),
      duration: get("testimonials", "t1_duration"),
      result: get("testimonials", "t1_result"),
      text: get("testimonials", "t1_text"),
    },
    {
      name: get("testimonials", "t2_name"),
      duration: get("testimonials", "t2_duration"),
      result: get("testimonials", "t2_result"),
      text: get("testimonials", "t2_text"),
    },
  ].filter(r => r.name && r.text);

  return (
    <section id="results" className="section-padding px-6 border-t border-[var(--border)]">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="label-badge mb-4 inline-block">
            {get("testimonials", "badge", t.testimonials.badge)}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
            {get("testimonials", "titleLine1", t.testimonials.titleLine1)}
            <br />
            <span className="text-blue-400">{get("testimonials", "titleLine2", t.testimonials.titleLine2)}</span>
          </h2>
          <p className="text-slate-400 mt-4 max-w-md mx-auto leading-relaxed mb-12 whitespace-pre-wrap">
            {get("testimonials", "subtitle", t.testimonials.subtitle)}
          </p>

          {/* Placeholder cards */}
          <div className={`grid grid-cols-1 md:grid-cols-${reviews.length > 0 ? reviews.length : 3} gap-6 mb-12`}>
            {reviews.length > 0 ? (
              reviews.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#0b0f19] border border-slate-800 rounded-sm p-6 flex flex-col gap-4 text-left"
                  style={{ textAlign: isArabic ? 'right' : 'left' }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-bold">{r.name}</p>
                      <p className="text-xs text-slate-400">{r.duration}</p>
                    </div>
                    <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                      {r.result}
                    </span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className="text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    "{r.text}"
                  </p>
                </motion.div>
              ))
            ) : (
              [1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#0b0f19] border border-slate-800 border-dashed rounded-sm p-6 flex flex-col items-center justify-center gap-3 min-h-[160px]"
                >
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className="text-slate-700" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm">
                    {isArabic ? "قيد الانتظار..." : "Awaiting results..."}
                  </p>
                </motion.div>
              ))
            )}
          </div>

          {/* CTA */}
          <a
            href={`https://wa.me/34610354255?text=${encodeURIComponent(isArabic ? "مرحباً كوتش عمار، أريد مشاركة نتيجتي" : "Hi Coach Amar, I want to share my results")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-blue-600/15 border border-blue-500/30 hover:border-blue-400 hover:bg-blue-600/25 text-blue-300 hover:text-white rounded-sm transition-all font-semibold text-sm"
          >
            <MessageSquarePlus size={16} />
            {isArabic ? "شارك نتيجتك" : "Share Your Result"}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
