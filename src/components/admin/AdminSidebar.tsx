"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  Dumbbell,
  Image,
  FileText,
  Monitor,
  Settings,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders & Payments", icon: ShoppingBag, badgeKey: "orders" },
  { href: "/admin/customers", label: "Athletes / Clients", icon: Users },
  { href: "/admin/products", label: "Products & Pricing", icon: Package },
  { href: "/admin/programs", label: "Training Builder", icon: Dumbbell },
  { href: "/admin/media", label: "Media Library", icon: Image },
  { href: "/admin/cms", label: "Website CMS", icon: FileText },
  { href: "/admin/preview", label: "Live Preview", icon: Monitor },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    fetch("/api/admin/orders?status=AWAITING_CONFIRMATION")
      .then((r) => r.json())
      .then((d) => setPendingOrders(d.orders?.length || 0))
      .catch(() => {});
  }, [pathname]);

  return (
    <aside className="fixed top-0 left-0 h-full w-64 flex flex-col bg-[var(--bg-card)] border-r border-[var(--border)] z-40">
      {/* Brand Header */}
      <div className="p-6 border-b border-[var(--border)]">
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-sm bg-[var(--accent)] flex items-center justify-center font-black text-black text-sm tracking-wider group-hover:scale-105 transition-transform">
            AM
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-[var(--text-primary)]">
              THE <span className="text-[var(--accent)]">AMMAR</span>
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)]">
              Operations Suite
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
          Management
        </p>

        {links.map(({ href, label, icon: Icon, exact, badgeKey }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          const showBadge = badgeKey === "orders" && pendingOrders > 0;

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-sm text-sm font-medium transition-all ${
                active
                  ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 shadow-[0_0_15px_rgba(202,240,43,0.1)] font-semibold"
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
                {active && <ChevronRight size={13} className="text-[var(--accent)]" />}
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
          className="w-full flex items-center justify-between px-3 py-2 rounded-sm text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors border border-transparent"
        >
          <span className="flex items-center gap-2">
            <Sparkles size={13} className="text-[var(--accent)]" /> Client App View
          </span>
          <ChevronRight size={12} className="text-[var(--text-muted)]" />
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-semibold text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={14} /> Sign Out Admin
        </button>
      </div>
    </aside>
  );
}
