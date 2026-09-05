"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { adminTranslations } from "@/lib/admin-translations";
import { useAdminSidebar } from "./AdminSidebarContext";
import { isSuperAdminEmail } from "@/lib/super-admin";

export function AdminSidebar() {
  const pathname = usePathname();
  const [pendingOrders, setPendingOrders] = useState(0);
  const { lang, isArabic } = useLanguage();
  const { data: session } = useSession();
  const t = adminTranslations[lang].sidebar;
  const { mobileOpen, closeMobile } = useAdminSidebar();

  const links = [
    { href: "/admin", label: t.overview, icon: LayoutDashboard, exact: true },
    { href: "/admin/orders", label: t.orders, icon: ShoppingBag, badgeKey: "orders" },
    { href: "/admin/customers", label: t.customers, icon: Users },
    { href: "/admin/products", label: t.products, icon: Package },
    { href: "/admin/cms", label: t.cms, icon: FileText },
    { href: "/admin/settings", label: t.settings, icon: Settings },
    ...(isSuperAdminEmail(session?.user?.email)
      ? [{ href: "/admin/team", label: t.team, icon: ShieldCheck }]
      : []),
  ];

  useEffect(() => {
    fetch("/api/admin/orders?status=AWAITING_CONFIRMATION")
      .then((r) => r.json())
      .then((d) => setPendingOrders(d.orders?.length || 0))
      .catch(() => {});
  }, [pathname]);

  const ArrowIcon = isArabic ? ChevronLeft : ChevronRight;

  return (
    <>
      {/* Mobile scrim, tap to close */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 ${
          isArabic ? "right-0 border-l" : "left-0 border-r"
        } h-full w-64 flex flex-col bg-[var(--bg-card)] border-[var(--border)] z-50 transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : isArabic ? "translate-x-full" : "-translate-x-full"
        }`}
      >
      {/* Brand Header */}
      <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5 group" onClick={closeMobile}>
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--accent)] flex items-center justify-center font-black text-black text-sm tracking-wider group-hover:scale-105 transition-transform">
            AM
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-[var(--text-primary)]">
              THE <span className="text-[var(--accent)]">AMAR</span>
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)]">
              {t.brandSub}
            </span>
          </div>
        </Link>
        <button onClick={closeMobile} className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
          {t.management}
        </p>

        {links.map(({ href, label, icon: Icon, exact, badgeKey }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          const showBadge = badgeKey === "orders" && pendingOrders > 0;

          return (
            <Link
              key={href}
              href={href}
              onClick={closeMobile}
              className={`flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-all ${
                active
                  ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 shadow-[0_0_15px_var(--accent-glow)] font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className={active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"} />
                <span>{label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {showBadge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-black">
                    {pendingOrders}
                  </span>
                )}
                {active && <ArrowIcon size={13} className="text-[var(--accent)]" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Account */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-base)]/50 space-y-2">
        <Link
          href="/app"
          target="_blank"
          className="w-full flex items-center justify-between px-3 py-2 rounded-[var(--radius-sm)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors border border-transparent"
        >
          <span className="flex items-center gap-2">
            <Sparkles size={13} className="text-[var(--accent)]" /> {t.clientApp}
          </span>
          <ArrowIcon size={12} className="text-[var(--text-muted)]" />
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] text-xs font-semibold text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={14} /> {t.signOut}
        </button>
      </div>
      </aside>
    </>
  );
}
