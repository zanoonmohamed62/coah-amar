"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { forgetOfflineSplit } from "@/lib/split-cache";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import {
  RealisticDashboardIcon,
  RealisticOrdersIcon,
  RealisticUserIcon,
  RealisticProductsIcon,
  RealisticCmsIcon,
  RealisticSettingsIcon,
  RealisticTeamIcon,
  RealisticSparklesIcon,
  RealisticLogOutIcon,
  RealisticCoachAvatar
} from "@/components/client/PwaIcons";
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
    { href: "/admin", label: t.overview, icon: RealisticDashboardIcon, exact: true },
    { href: "/admin/orders", label: t.orders, icon: RealisticOrdersIcon, badgeKey: "orders" },
    { href: "/admin/customers", label: t.customers, icon: RealisticUserIcon },
    { href: "/admin/products", label: t.products, icon: RealisticProductsIcon },
    { href: "/admin/cms", label: t.cms, icon: RealisticCmsIcon },
    { href: "/admin/settings", label: t.settings, icon: RealisticSettingsIcon },
    ...(isSuperAdminEmail(session?.user?.email)
      ? [{ href: "/admin/team", label: t.team, icon: RealisticTeamIcon }]
      : []),
  ];

  // Every payment method is confirmed by hand, so this badge is the queue the
  // admin actually works from. Refreshing it only on navigation meant an order
  // that arrived while /admin sat open stayed invisible until something else
  // was clicked — so poll, and refresh on tab focus for the common case of
  // coming back to an already-open admin tab.
  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetch("/api/admin/orders?status=AWAITING_CONFIRMATION")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!cancelled && d) setPendingOrders(d.orders?.length || 0);
        })
        .catch(() => {});
    };

    load();
    const id = setInterval(load, 60_000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
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
      <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3 group" onClick={closeMobile}>
          <RealisticCoachAvatar size="sm" />
          <div>
            <span className="text-base font-black tracking-tight text-[var(--text-primary)] block leading-tight">
              COACH <span className="text-blue-400">AMAR</span>
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] mt-0.5">
              {t.brandSub}
            </span>
          </div>
        </Link>
        <button onClick={closeMobile} className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <p className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
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
              className={`flex items-center justify-between px-3 py-2.5 rounded-[14px] text-sm font-medium transition-all ${
                active
                  ? "bg-blue-500/15 text-blue-400 border border-blue-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-[9px] flex items-center justify-center shrink-0 ${active ? "bg-blue-500/20" : ""}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span>{label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {showBadge && (
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-black shadow-sm">
                    {pendingOrders}
                  </span>
                )}
                {active && <ArrowIcon size={13} className="text-blue-400" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Account */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-base)]/50 space-y-1.5">
        <Link
          href="/app"
          target="_blank"
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-[14px] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-colors border border-transparent"
        >
          <span className="flex items-center gap-2.5">
            <RealisticSparklesIcon className="w-4 h-4" /> {t.clientApp}
          </span>
          <ArrowIcon size={12} className="text-[var(--text-muted)]" />
        </Link>

        <button
          onClick={async () => { await forgetOfflineSplit(); signOut({ callbackUrl: "/login" }); }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <RealisticLogOutIcon className="w-4 h-4" /> {t.signOut}
        </button>
      </div>
      </aside>
    </>
  );
}
