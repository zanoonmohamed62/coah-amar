"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSiteContent } from "@/lib/use-site-content";
import { EditableText } from "@/components/cms/EditableText";

function FAQItem({ sectionId, qFieldId, q, aFieldId, a, index }: {
  sectionId: string;
  qFieldId: string;
  q: string;
  aFieldId: string;
  a: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="mb-3 rounded-[var(--radius-lg)] bg-[#0b0f19] border border-white/[0.07] overflow-hidden hover:border-blue-500/30 transition-colors"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left rtl:text-right gap-4 group cursor-pointer"
        aria-expanded={open}
      >
        <span className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors leading-relaxed">
          <EditableText sectionId={sectionId} fieldId={qFieldId} value={q} />
        </span>
        <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
          <ChevronDown
            size={14}
            className={`text-slate-400 transition-transform duration-250 ${open ? "rotate-180 text-blue-400" : ""}`}
          />
        </div>
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
              <EditableText multiline sectionId={sectionId} fieldId={aFieldId} value={a} />
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
    { qField: "q1", q: get("faq", "q1", t.faq.items[0]?.q || ""), aField: "a1", a: get("faq", "a1", t.faq.items[0]?.a || "") },
    { qField: "q2", q: get("faq", "q2", t.faq.items[1]?.q || ""), aField: "a2", a: get("faq", "a2", t.faq.items[1]?.a || "") },
    { qField: "q3", q: get("faq", "q3", t.faq.items[2]?.q || ""), aField: "a3", a: get("faq", "a3", t.faq.items[2]?.a || "") },
    { qField: "q4", q: get("faq", "q4", t.faq.items[3]?.q || ""), aField: "a4", a: get("faq", "a4", t.faq.items[3]?.a || "") },
    { qField: "q5", q: get("faq", "q5", t.faq.items[4]?.q || ""), aField: "a5", a: get("faq", "a5", t.faq.items[4]?.a || "") },
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
          <span className="label-badge mb-4 inline-block">
            <EditableText sectionId="faq" fieldId="badge" value={get("faq", "badge", t.faq.badge)} />
          </span>
          <h2
            className="text-3xl md:text-5xl font-bold text-gradient-white leading-tight"
          >
            <EditableText sectionId="faq" fieldId="titleLine1" value={get("faq", "titleLine1", t.faq.title)} />
          </h2>
          <p className="text-[var(--text-secondary)] mt-4 max-w-md mx-auto leading-relaxed">
            <EditableText multiline sectionId="faq" fieldId="subtitle" value={get("faq", "subtitle", t.faq.subtitle)} />
          </p>
        </motion.div>

        <div>
          {faqItems.map((faq, i) => (
            <FAQItem key={i} sectionId="faq" qFieldId={faq.qField} q={faq.q} aFieldId={faq.aField} a={faq.a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
