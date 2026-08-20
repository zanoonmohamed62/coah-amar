"use client";

import Link from "next/link";
import {
  FileText,
  Download,
  MessageCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Dumbbell,
  Flame,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const WA = process.env.NEXT_PUBLIC_COACH_WHATSAPP?.replace("+", "") || "34610354255";

export default function MySplitPage() {
  const { isArabic } = useLanguage();
  const ArrowIcon = isArabic ? ChevronRight : ChevronLeft;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-2 transition-colors"
          >
            <ArrowIcon size={14} />
            <span>{isArabic ? "العودة للرئيسية" : "Back to Dashboard"}</span>
          </Link>
          <h1 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <span className="text-[var(--accent)]">THE AMMAR</span> &ldquo;X SPLIT&rdquo;
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {isArabic
              ? "الجدول التدريبي الرسمي — مخصص لك شخصياً"
              : "Your official personal training split by Coach Amar"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-sm text-blue-400 text-[11px] font-semibold">
            <ShieldCheck size={12} />
            <span>{isArabic ? "أوفلاين جاهز" : "Offline Ready"}</span>
          </div>
          
          <a href="/assets/AMARX-SPLIT.pdf" download="AMARX-SPLIT.pdf"
            className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black text-xs font-black rounded-sm transition-colors flex items-center gap-1.5">
            <Download size={14} />
            <span>{isArabic ? "تحميل" : "Download"}</span>
          </a>
          <a href={`https://wa.me/${WA}?text=${encodeURIComponent(isArabic ? "مرحباً كوتش عمار، لدي استفسار" : "Hi Coach Amar, I have a question about the X Split")}`}
            target="_blank" rel="noopener noreferrer"
            className="px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold rounded-sm transition-colors flex items-center gap-1.5">
            <MessageCircle size={13} />
            <span>{isArabic ? "واتساب الكوتش" : "Ask Coach"}</span>
          </a>
        </div>
      </div>

      {/* Program highlights */}
      <div className="p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-sm grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {[
          { icon: <Dumbbell size={16} />, color: "blue", label: isArabic ? "نوع النظام" : "Split Type", value: "Push / Pull / Legs" },
          { icon: <Sparkles size={16} />, color: "emerald", label: isArabic ? "المدة" : "Duration", value: isArabic ? "12 أسبوع" : "12 Weeks" },
          { icon: <Flame size={16} />, color: "purple", label: isArabic ? "الهدف" : "Target", value: isArabic ? "بناء عضلي وحرق" : "Hypertrophy & Recomp" },
          { icon: <CheckCircle2 size={16} />, color: "amber", label: isArabic ? "الوصول" : "Access", value: isArabic ? "مدى الحياة" : "Lifetime" },
        ].map(({ icon, color, label, value }) => (
          <div key={label} className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-sm bg-${color}-500/10 text-${color}-400 flex items-center justify-center`}>
              {icon}
            </div>
            <div>
              <span className="text-[10px] text-[var(--text-muted)] uppercase block">{label}</span>
              <span className="font-bold text-[var(--text-primary)]">{value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Native PDF Embed */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-sm overflow-hidden shadow-2xl h-[80vh] min-h-[600px] flex flex-col">
        {/* Viewer header */}
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-[var(--accent)]" />
            <span className="text-xs font-black text-[var(--text-primary)] tracking-wide">AMARX SPLIT</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full border font-semibold text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
              {isArabic ? "● مباشر" : "● Live"}
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">
            {isArabic ? "العرض الأصلي" : "Native Viewer"}
          </span>
        </div>

        {/* Embedded PDF */}
        <iframe
          src="/assets/AMARX-SPLIT.pdf"
          className="w-full h-full flex-1 border-none bg-white"
          title="AMARX SPLIT"
        />
      </div>
    </div>
  );
}
