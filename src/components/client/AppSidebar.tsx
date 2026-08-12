"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Dumbbell, User, LogOut, MessageCircle, ChevronRight } from "lucide-react";

const links = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/app/my-split", label: "My Split", icon: Dumbbell },
  { href: "/app/account", label: "Account", icon: User },
];
const WA = process.env.NEXT_PUBLIC_COACH_WHATSAPP?.replace("+","") || "34610354255";

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed top-0 left-0 h-full w-64 flex flex-col glass border-r border-[var(--border)] z-40 py-6">
      <div className="px-5 mb-8">
        <span className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">COACH <span className="text-[var(--accent)]">AMAR</span></span>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Member Portal</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
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

      <div className="px-3 pt-4 border-t border-[var(--border)] space-y-1">
        <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-emerald-400 hover:bg-emerald-500/10 transition-colors">
          <MessageCircle size={16} /> WhatsApp Coach
        </a>
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
