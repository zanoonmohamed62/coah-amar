"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

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
          {t.faq.items.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
