"use client";

import { useLanguage } from "@/lib/language-context";
import { Dumbbell, ShieldCheck, Flame, MessageCircle } from "lucide-react";

export function TrustStrip() {
  const { isArabic } = useLanguage();

  const pillars = [
    { title: isArabic ? "هايبرد تريننج" : "Hybrid Training", sub: isArabic ? "أسلوب تقليدي بتطور علمي حديث" : "Old school training Modern progression.", icon: Dumbbell },
    { title: isArabic ? "تغذية دقيقة بدون حرمان" : "Precision Nutrition", sub: isArabic ? "حساب السعرات والماكروز" : "Targeted macro calibration", icon: Flame },
    { title: isArabic ? "متابعة مباشرة عبر واتساب" : "Direct WhatsApp Support", sub: isArabic ? "تواصل مع الكوتش شخصياً" : "Direct 1-on-1 coach access", icon: MessageCircle },
    { title: isArabic ? "ضمان تطور مستمر" : "Progressive Results", sub: isArabic ? "تعديلات أسبوعية دقيقة" : "Weekly data adjustments", icon: ShieldCheck },
  ];

  return (
    <section className="py-12 border-y border-[var(--border)] bg-[#0a0e17]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">{p.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{p.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
