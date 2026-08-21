"use client";

import Link from "next/link";
import { FileText, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const WA_NUMBER = process.env.NEXT_PUBLIC_COACH_WHATSAPP?.replace("+", "") || "34610354255";

export default function AppHome() {
  const { isArabic } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-2xl mx-auto text-center space-y-10">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-5xl font-black text-[var(--text-primary)]">
          {isArabic ? "مرحباً بك في بوابتك التدريبية" : "Welcome to Your Portal"}
        </h1>
        <p className="text-[var(--text-muted)] text-base md:text-lg max-w-lg mx-auto">
          {isArabic
            ? "بوابتك الخاصة للوصول إلى خطة التدريب الخاصة بك ومتابعة تقدمك."
            : "Your personal portal to access your training plan and track your progress."}
        </p>
      </div>

      <div className="w-full flex flex-col gap-4">
        <Link
          href="/app/my-split"
          className="w-full py-6 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black font-black text-lg rounded-md transition-all flex flex-col items-center justify-center gap-3 shadow-xl"
        >
          <FileText size={32} />
          <span>{isArabic ? "فتح جدول التمرين (PDF)" : "Open My Split (PDF)"}</span>
        </Link>
        
        <a
          href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
            isArabic
              ? "مرحباً كوتش عمار، لدي استفسار"
              : "Hi Coach Amar, I have a question"
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 bg-[var(--bg-card)] border border-[var(--border)] hover:border-emerald-500/50 text-[var(--text-primary)] font-bold text-sm rounded-md transition-all flex items-center justify-center gap-2"
        >
          <MessageCircle size={20} className="text-emerald-400" />
          {isArabic ? "تواصل مع الكوتش (واتساب)" : "Contact Coach (WhatsApp)"}
        </a>
      </div>
    </div>
  );
}
