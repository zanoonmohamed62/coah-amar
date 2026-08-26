"use client";

import { motion } from "framer-motion";
import { MessageSquarePlus, Star } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function TestimonialsSection() {
  const { isArabic } = useLanguage();

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
            {isArabic ? "نتائج حقيقية" : "Real Results"}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
            {isArabic ? "تقييمات عملاء" : "Client Results"}
            <br />
            <span className="text-blue-400">{isArabic ? "حقيقية" : "Coming Soon"}</span>
          </h2>
          <p className="text-slate-400 mt-4 max-w-md mx-auto leading-relaxed mb-12">
            {isArabic
              ? "التقييمات الحقيقية قادمة. كن أول من يشارك نتيجته."
              : "Real client testimonials are on their way. Be the first to share your results."}
          </p>

          {/* Placeholder cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#0b0f19] border border-slate-800 border-dashed rounded-sm p-6 flex flex-col items-center justify-center gap-3 min-h-[160px]"
              >
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14} className="text-slate-700" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm">
                  {isArabic ? "قيد الانتظار..." : "Awaiting results..."}
                </p>
              </motion.div>
            ))}
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
