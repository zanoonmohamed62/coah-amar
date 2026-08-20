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
          <a href={`https://wa.me/${WA}?text=${encodeURIComponent(isArabic ? "مرحباً كوتش عمار، لدي استفسار" : "Hi Coach Amar, I have a question about the X Split")}`}
            target="_blank" rel="noopener noreferrer"
            className="px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold rounded-sm transition-colors flex items-center gap-1.5">
            <MessageCircle size={13} />
            <span>{isArabic ? "واتساب الكوتش" : "Ask Coach"}</span>
          </a>
        </div>
      </div>


      {/* Native PDF Embed */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-sm overflow-hidden shadow-2xl h-[80vh] min-h-[600px] flex flex-col">


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
