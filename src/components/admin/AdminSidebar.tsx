"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Users, ShoppingBag, Package, Dumbbell, Image, FileText, Monitor, Settings, LogOut, ChevronRight } from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/programs", label: "Training Builder", icon: Dumbbell },
  { href: "/admin/media", label: "Media Library", icon: Image },
  { href: "/admin/cms", label: "Website CMS", icon: FileText },
  { href: "/admin/preview", label: "Live Preview", icon: Monitor },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed top-0 left-0 h-full w-64 flex flex-col glass border-r border-[var(--border)] z-40 py-6">
      <div className="px-5 mb-8">
        <span className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">COACH <span className="text-[var(--accent)]">AMAR</span></span>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all ${active ? "bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--border-accent)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"}`}>
              <Icon size={16} />
              {label}
              {active && <ChevronRight size={12} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pt-4 border-t border-[var(--border)]">
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
