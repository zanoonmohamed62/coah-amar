"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  ExternalLink,
  MessageCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  CheckCircle2,
  Dumbbell,
  Flame,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const PDF_PATH = "/assets/AMARX-SPLIT.pdf";
const WA = process.env.NEXT_PUBLIC_COACH_WHATSAPP?.replace("+", "") || "34610354255";

export default function MySplitPage() {
  const { lang, isArabic } = useLanguage();
  const [fullscreen, setFullscreen] = useState(false);

  const ArrowIcon = isArabic ? ChevronRight : ChevronLeft;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
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
              ? "الجدول التدريبي الرسمي وخطة التكنيك والزيادة التدريجية المعتمدة من كوتش عمار"
              : "Official 12-Week Hypertrophy & Recomposition Split by Coach Amar"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={PDF_PATH}
            download="AMARX-SPLIT.pdf"
            className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black text-xs font-black rounded-sm transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Download size={14} />
            <span>{isArabic ? "تحميل الجدول PDF" : "Download PDF"}</span>
          </a>

          <a
            href={PDF_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-accent)] text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent)] rounded-sm transition-colors flex items-center gap-1.5"
          >
            <ExternalLink size={13} />
            <span>{isArabic ? "فتح في نافذة كاملة" : "Open Full View"}</span>
          </a>

          <a
            href={`https://wa.me/${WA}?text=${encodeURIComponent(
              isArabic ? "مرحباً كوتش عمار، لدي استفسار عن جدول الـ X Split" : "Hi Coach Amar, I have a question about the X Split workout"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold rounded-sm transition-colors flex items-center gap-1.5"
          >
            <MessageCircle size={13} />
            <span>{isArabic ? "واتساب الكوتش" : "Ask Coach"}</span>
          </a>
        </div>
      </div>

      {/* Program Highlights Banner */}
      <div className="p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-sm grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Dumbbell size={16} />
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-muted)] uppercase block">{isArabic ? "نوع النظام" : "Split Type"}</span>
            <span className="font-bold text-[var(--text-primary)]">Push / Pull / Legs</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-muted)] uppercase block">{isArabic ? "المدة" : "Duration"}</span>
            <span className="font-bold text-[var(--text-primary)]">{isArabic ? "12 أسبوع تطور" : "12 Weeks Period"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Flame size={16} />
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-muted)] uppercase block">{isArabic ? "الهدف" : "Target"}</span>
            <span className="font-bold text-[var(--text-primary)]">{isArabic ? "بناء عضلي وحرق دهون" : "Hypertrophy & Recomp"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-muted)] uppercase block">{isArabic ? "الوصول" : "Access"}</span>
            <span className="font-bold text-emerald-400">{isArabic ? "مفعل مدى الحياة" : "Lifetime Unlocked"}</span>
          </div>
        </div>
      </div>

      {/* Embedded PDF Viewer Container */}
      <div
        className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-sm overflow-hidden shadow-2xl transition-all ${
          fullscreen ? "fixed inset-4 z-50 flex flex-col bg-[#07090e]" : ""
        }`}
      >
        {/* Viewer Header Bar */}
        <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-[var(--accent)]" />
            <span className="text-xs font-black text-[var(--text-primary)] tracking-wide">
              AMARX SPLIT.pdf
            </span>
            <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-base)] border border-[var(--border)] px-2 py-0.5 rounded-full">
              2.8 MB
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="p-1.5 rounded-sm border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-accent)] transition-colors cursor-pointer text-xs flex items-center gap-1"
              title={fullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            >
              <Maximize2 size={13} />
              <span className="hidden sm:inline">{fullscreen ? (isArabic ? "تصغير" : "Exit Fullscreen") : (isArabic ? "تكبير الشاشة" : "Fullscreen")}</span>
            </button>

            <a
              href={PDF_PATH}
              download="AMARX-SPLIT.pdf"
              className="p-1.5 rounded-sm border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--border-accent)] transition-colors text-xs flex items-center gap-1"
              title="Download file"
            >
              <Download size={13} />
            </a>
          </div>
        </div>

        {/* PDF Iframe Element */}
        <div className="relative w-full bg-[#111] overflow-hidden" style={{ height: fullscreen ? "calc(100vh - 6rem)" : "780px" }}>
          <iframe
            src={`${PDF_PATH}#toolbar=1&navpanes=0`}
            className="w-full h-full border-0"
            title="THE AMMAR X SPLIT PDF"
          />
        </div>

        {/* Viewer Footer */}
        <div className="px-5 py-2.5 border-t border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>
            💡 {isArabic ? "يمكنك تصفح الصفحات وتكبير النصوص مباشرة أو تحميل الملف على هاتفك." : "You can scroll, zoom, and navigate the workout pages directly or download to your phone."}
          </span>
          <a
            href={PDF_PATH}
            download="AMARX-SPLIT.pdf"
            className="text-[var(--accent)] hover:underline font-bold text-[11px]"
          >
            {isArabic ? "تحميل نسخة أوفلاين ↓" : "Download Offline Copy ↓"}
          </a>
        </div>
      </div>
    </div>
  );
}
