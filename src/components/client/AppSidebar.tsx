"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  Globe,
  Download,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function AppSidebar() {
  const pathname = usePathname();
  const { lang, isArabic, toggleLang } = useLanguage();
  const ArrowIcon = isArabic ? ChevronLeft : ChevronRight;

  const links = [
    {
      href: "/app",
      label: isArabic ? "لوحة التحكم" : "Dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/app/my-split",
      label: isArabic ? "جدول التمرين (PDF)" : "My Split (PDF)",
      icon: FileText,
    },
    {
      href: "/app/account",
      label: isArabic ? "حسابي والاشتراكات" : "Account",
      icon: User,
    },
  ];

  const WA = process.env.NEXT_PUBLIC_COACH_WHATSAPP?.replace("+", "") || "34610354255";

  return (
    <aside
      className={`fixed top-0 ${
        isArabic ? "right-0 border-l" : "left-0 border-r"
      } h-full w-64 flex flex-col bg-[var(--bg-card)] border-[var(--border)] z-40 py-6`}
    >
      {/* Brand */}
      <div className="px-5 mb-6 flex items-center justify-between">
        <div>
          <span className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">
            COACH <span className="text-[var(--accent)]">AMAR</span>
          </span>
          <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] mt-0.5">
            {isArabic ? "بوابة المتدرب الرياضي" : "Member Portal"}
          </p>
        </div>

        <button
          onClick={toggleLang}
          className="p-1.5 rounded-sm border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-xs font-bold"
          title={isArabic ? "Switch to English" : "التحويل إلى العربية"}
        >
          <Globe size={13} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all ${
                active
                  ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent"
              }`}
            >
              <Icon size={16} className={active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"} />
              <span>{label}</span>
              {active && <ArrowIcon size={12} className={isArabic ? "mr-auto text-[var(--accent)]" : "ml-auto text-[var(--accent)]"} />}
            </Link>
          );
        })}

        <div className="pt-3 border-t border-[var(--border)] mt-3">
          <a
            href="/assets/AMARX-SPLIT.pdf"
            download="AMARX-SPLIT.pdf"
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors border border-[var(--accent)]/20"
          >
            <Download size={14} />
            <span>{isArabic ? "تحميل ملف الجدول PDF" : "Download Split PDF"}</span>
          </a>
        </div>
      </nav>

      {/* Bottom WhatsApp & Sign out */}
      <div className="px-3 pt-4 border-t border-[var(--border)] space-y-1">
        <a
          href={`https://wa.me/${WA}?text=${encodeURIComponent(
            isArabic ? "مرحباً كوتش عمار، لدي استفسار بخصوص جدول التمرين" : "Hi Coach Amar, I have a question about my training split"
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors"
        >
          <MessageCircle size={15} /> {isArabic ? "واتساب الكوتش" : "WhatsApp Coach"}
        </a>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-bold text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <LogOut size={15} /> {isArabic ? "تسجيل الخروج" : "Sign Out"}
        </button>
      </div>
    </aside>
  );
}
