"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Dumbbell,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
  CheckCircle2,
  FileText,
  Download,
  ExternalLink,
  Sparkles,
  Flame,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const PDF_PATH = "/assets/AMARX-SPLIT.pdf";
const WA_NUMBER = process.env.NEXT_PUBLIC_COACH_WHATSAPP?.replace("+", "") || "34610354255";

export default function AppHome() {
  const { lang, isArabic } = useLanguage();
  const ArrowIcon = isArabic ? ChevronLeft : ChevronRight;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-2">
          <CheckCircle2 size={12} /> {isArabic ? "الحساب مفعل ومكتمل" : "Account Active & Verified"}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
          {isArabic ? "مرحباً بك في بوابتك التدريبية" : "Welcome to Your Training Portal"}
        </h1>
        <p className="text-[var(--text-muted)] text-xs sm:text-sm mt-1">
          {isArabic
            ? "خطة التمرين الرسمية وجداول التكنيك والزيادة التدريجية متاحة في حسابك"
            : "Access your official workout split, exercise guides, and coaching materials"}
        </p>
      </div>

      {/* Featured Primary Card: THE AMMAR X SPLIT */}
      <div className="bg-[var(--bg-card)] border-2 border-[var(--border-accent)] rounded-sm p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-sm bg-[var(--accent)] text-black font-black text-[10px] uppercase tracking-wider">
                {isArabic ? "الجدول الرسمي المعتمد" : "Official Training Plan"}
              </span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                ● {isArabic ? "متاح مدى الحياة" : "Lifetime Access"}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
              THE AMMAR <span className="text-[var(--accent)]">&ldquo;X SPLIT&rdquo;</span>
            </h2>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {isArabic
                ? "ملف الـ PDF التدريبي الشامل: تقسيم Push / Pull / Legs، تفاصيل التكنيك، المجموعات والتكرارات، فترات الراحة، ونظام الزيادة التدريجية المتواصلة."
                : "The complete 12-week hypertrophy & recomposition system. Full Push / Pull / Legs breakdown, exercise execution cues, sets, reps, rest intervals, and progression guidelines."}
            </p>

            <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-[var(--text-muted)] font-semibold">
              <span className="px-2 py-0.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm">
                📄 PDF · 2.8 MB
              </span>
              <span className="px-2 py-0.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm">
                🏋️ Push · Pull · Legs
              </span>
              <span className="px-2 py-0.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm">
                🔥 12 {isArabic ? "أسبوع تطور" : "Weeks"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 shrink-0 sm:w-60">
            <Link
              href="/app/my-split"
              className="py-3 px-5 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black font-black text-xs rounded-sm transition-all flex items-center justify-center gap-2 shadow-lg text-center"
            >
              <FileText size={16} />
              <span>{isArabic ? "عرض الجدول التدريبي (PDF)" : "View Training Split"}</span>
              <ArrowIcon size={14} />
            </Link>

            <a
              href={PDF_PATH}
              download="AMARX-SPLIT.pdf"
              className="py-2.5 px-4 bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--border-accent)] text-[var(--text-primary)] hover:text-[var(--accent)] font-bold text-xs rounded-sm transition-colors flex items-center justify-center gap-2 text-center"
            >
              <Download size={14} />
              <span>{isArabic ? "تحميل ملف الـ PDF" : "Download PDF File"}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Quick Access Support & WhatsApp Coach */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
            isArabic
              ? "مرحباً كوتش عمار، لدي استفسار بخصوص جدول التمرين والمتابعة"
              : "Hi Coach Amar, I have a question about my training program"
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 bg-[var(--bg-card)] border border-emerald-500/30 rounded-sm hover:bg-emerald-500/5 transition-all flex items-center gap-4 group"
        >
          <div className="w-10 h-10 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <MessageCircle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[var(--text-primary)]">
              {isArabic ? "تواصل مع كوتش عمار" : "Chat with Coach Amar"}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              {isArabic ? "متابعة واستفسارات التدريب والتغذية عبر واتساب" : "Direct questions regarding execution and training via WhatsApp"}
            </p>
          </div>
          <ArrowIcon size={14} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
        </a>

        <Link
          href="/app/account"
          className="p-5 bg-[var(--bg-card)] border border-[var(--border)] rounded-sm hover:border-[var(--border-accent)] hover:bg-[var(--bg-elevated)] transition-all flex items-center gap-4 group"
        >
          <div className="w-10 h-10 rounded-sm bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[var(--text-primary)]">
              {isArabic ? "تفاصيل الحساب والاشتراك" : "Membership Details"}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              {isArabic ? "مراجعة الاشتراكات وسجل الفواتير والدخول" : "Manage account details and view billing history"}
            </p>
          </div>
          <ArrowIcon size={14} className="text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
