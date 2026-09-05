"use client";

import { useLanguage } from "@/lib/language-context";
import { useSiteContent } from "@/lib/use-site-content";
import { Dumbbell, ShieldCheck, Flame, MessageCircle } from "lucide-react";
import { EditableText } from "@/components/cms/EditableText";

export function TrustStrip() {
  const { isArabic } = useLanguage();

  const get = useSiteContent();

  const pillars = [
    {
      titleField: "value1_title",
      title: get("trustStrip", "value1_title", isArabic ? "هايبرد تريننج" : "Hybrid Training"),
      subField: "value1_sub",
      sub: get("trustStrip", "value1_sub", isArabic ? "أسلوب تقليدي بتطور علمي حديث" : "Old school training Modern progression."),
      icon: Dumbbell
    },
    {
      titleField: "value2_title",
      title: get("trustStrip", "value2_title", isArabic ? "تغذية دقيقة بدون حرمان" : "Precision Nutrition"),
      subField: "value2_sub",
      sub: get("trustStrip", "value2_sub", isArabic ? "حساب السعرات والماكروز" : "Targeted macro calibration"),
      icon: Flame
    },
    {
      titleField: "value3_title",
      title: get("trustStrip", "value3_title", isArabic ? "متابعة مباشرة عبر واتساب" : "Direct WhatsApp Support"),
      subField: "value3_sub",
      sub: get("trustStrip", "value3_sub", isArabic ? "تواصل مع الكوتش شخصياً" : "Direct 1-on-1 coach access"),
      icon: MessageCircle
    },
    {
      titleField: "value4_title",
      title: get("trustStrip", "value4_title", isArabic ? "ضمان تطور مستمر" : "Progressive Results"),
      subField: "value4_sub",
      sub: get("trustStrip", "value4_sub", isArabic ? "تعديلات أسبوعية دقيقة" : "Weekly data adjustments"),
      icon: ShieldCheck
    },
  ];

  return (
    <section className="py-10 border-y border-white/[0.07] bg-gradient-to-r from-[#07090e] via-[#0b101c] to-[#07090e]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="p-3.5 rounded-[var(--radius-md)] bg-white/[0.02] border border-white/[0.05] hover:border-blue-500/30 hover:bg-white/[0.04] transition-all flex items-start gap-2.5 group">
                <Icon size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">
                    <EditableText sectionId="trustStrip" fieldId={p.titleField} value={p.title} />
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 font-normal">
                    <EditableText sectionId="trustStrip" fieldId={p.subField} value={p.sub} />
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
