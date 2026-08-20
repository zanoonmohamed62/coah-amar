"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSiteContent } from "@/lib/use-site-content";

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border-b border-[var(--border)]"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left rtl:text-right gap-4 group cursor-pointer"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-relaxed">
          {q}
        </span>
        <ChevronDown
          size={16}
          className={`text-[var(--text-muted)] flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-[var(--accent)]" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed pb-5 pr-4 rtl:pr-0 rtl:pl-4">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  const { t } = useLanguage();
  const get = useSiteContent();

  // Build FAQ items: use CMS first, fall back to translations array
  const faqItems = [
    { q: get("faq", "q1", t.faq.items[0]?.q || ""), a: get("faq", "a1", t.faq.items[0]?.a || "") },
    { q: get("faq", "q2", t.faq.items[1]?.q || ""), a: get("faq", "a2", t.faq.items[1]?.a || "") },
    { q: get("faq", "q3", t.faq.items[2]?.q || ""), a: get("faq", "a3", t.faq.items[2]?.a || "") },
    { q: get("faq", "q4", t.faq.items[3]?.q || ""), a: get("faq", "a4", t.faq.items[3]?.a || "") },
    { q: get("faq", "q5", t.faq.items[4]?.q || ""), a: get("faq", "a5", t.faq.items[4]?.a || "") },
  ].filter((item) => item.q);

  return (
    <section id="faq" className="section-padding px-6 border-t border-[var(--border)]">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="label-badge mb-4 inline-block">{t.faq.badge}</span>
          <h2
            className="text-3xl md:text-5xl font-bold text-gradient-white leading-tight"
          >
            {t.faq.title}
          </h2>
          <p className="text-[var(--text-secondary)] mt-4 max-w-md mx-auto leading-relaxed">
            {t.faq.subtitle}
          </p>
        </motion.div>

        <div>
          {faqItems.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
