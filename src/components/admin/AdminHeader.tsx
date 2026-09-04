"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Shield, Globe, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { adminTranslations } from "@/lib/admin-translations";
import { useAdminSidebar } from "./AdminSidebarContext";

export function AdminHeader() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const { lang, isArabic, toggleLang } = useLanguage();
  const t = adminTranslations[lang].header;
  const { toggleMobile } = useAdminSidebar();

  const routes = t.routes as Record<string, { title: string; subtitle: string }>;
  const matched = Object.entries(routes).find(([route]) =>
    route === pathname || (route !== "/admin" && pathname.startsWith(route))
  );

  const info = matched ? matched[1] : { title: "Admin Portal", subtitle: "Coach Amar Management Suite" };

  useEffect(() => {
    fetch("/api/admin/orders?status=AWAITING_CONFIRMATION")
      .then((r) => r.json())
      .then((d) => setPendingCount(d.orders?.length || 0))
      .catch(() => {});
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-8 py-4 bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-[var(--border)]">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleMobile}
          className="md:hidden shrink-0 p-1.5 -ml-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-black tracking-tight text-[var(--text-primary)] truncate">
            {info.title}
          </h1>
          <p className="hidden sm:block text-xs text-[var(--text-muted)] mt-0.5">{info.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Language Switcher */}
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-sm border border-[var(--border)] bg-[var(--bg-elevated)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--border-accent)] transition-all cursor-pointer"
          title={isArabic ? "Switch to English" : "التحويل إلى العربية"}
        >
          <Globe size={13} className="text-[var(--accent)]" />
          <span className="hidden sm:inline">{isArabic ? "English" : "العربية"}</span>
        </button>

        {pendingCount > 0 && (
          <Link
            href="/admin/orders?status=AWAITING_CONFIRMATION"
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors animate-pulse whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
            <span className="hidden sm:inline">{t.pendingOrders(pendingCount)}</span>
            <span className="sm:hidden">{pendingCount}</span>
          </Link>
        )}

        <Link
          href="/"
          target="_blank"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[var(--border)] bg-[var(--bg-elevated)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-accent)] transition-colors"
        >
          <ExternalLink size={13} />
          <span>{t.liveSite}</span>
        </Link>

        <div className={`hidden sm:flex items-center gap-2 ${isArabic ? "pr-3 border-r" : "pl-3 border-l"} border-[var(--border)]`}>
          <div className="w-8 h-8 rounded-sm bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] font-bold text-xs">
            CA
          </div>
          <div className="hidden lg:block text-start">
            <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">Coach Amar</p>
            <p className="text-[10px] text-[var(--text-muted)] leading-tight flex items-center gap-1">
              <Shield size={9} className="text-emerald-400" /> {t.superAdmin}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
