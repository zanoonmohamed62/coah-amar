"use client";

import Link from "next/link";
import { FileText, MessageCircle, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/use-settings";

export default function AppHome() {
  const { isArabic } = useLanguage();
  const getSetting = useSettings();
  const WA_NUMBER = getSetting("whatsapp_number").replace(/[^0-9]/g, "");

  // The split PDF is cached for offline use silently by SplitPrefetcher —
  // deliberately with no progress UI, so the customer never has to think
  // about downloads.

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-2xl mx-auto text-center space-y-10">
      <div className="space-y-4">
        {/* Blue Account Verified Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <CheckCircle2 size={14} className="drop-shadow-md" /> {isArabic ? "الحساب مفعل ومكتمل" : "Account Active & Verified"}
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black text-[var(--text-primary)]">
          {isArabic ? "مرحباً بك في بوابتك التدريبية" : "Welcome to Your Portal"}
        </h1>
        <p className="text-[var(--text-muted)] text-base md:text-lg max-w-lg mx-auto">
          {isArabic
            ? "بوابتك الخاصة للوصول إلى خطة التدريب الخاصة بك ومتابعة تقدمك."
            : "Your personal portal to access your training plan and track your progress."}
        </p>
      </div>

      <div className="w-full flex flex-col gap-4 mt-6">
        {/* Premium Split Button */}
        <Link
          href="/app/my-split"
          className="group relative w-full py-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-lg rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-3 shadow-[0_8px_30px_rgb(59,130,246,0.3)] hover:shadow-[0_8px_40px_rgb(59,130,246,0.5)] border border-blue-400/20 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_3s_infinite] pointer-events-none" />
          <FileText size={32} className="drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
          <span className="tracking-wide drop-shadow-md">{isArabic ? "فتح جدول التمرين" : "Open My Split"}</span>
        </Link>

        {/* Premium WhatsApp Button */}
        <a
          href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
            isArabic
              ? "مرحباً كوتش عمار، لدي استفسار"
              : "Hi Coach Amar, I have a question"
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group w-full py-4 bg-[#0d121c] border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/5 text-[var(--text-primary)] font-bold text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg"
        >
          <div className="p-1.5 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
            <MessageCircle size={18} className="text-blue-400 drop-shadow-md" />
          </div>
          {isArabic ? "تواصل مع الكوتش (واتساب)" : "Contact Coach (WhatsApp)"}
        </a>
      </div>
    </div>
  );
}
