"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Dumbbell, Apple, Pill, Heart,
  BarChart3, Calendar, MessageCircle, User, LogOut, Menu, X
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/training", icon: Dumbbell, label: "My Training" },
  { href: "/dashboard/nutrition", icon: Apple, label: "Nutrition" },
  { href: "/dashboard/supplements", icon: Pill, label: "Supplements" },
  { href: "/dashboard/cardio", icon: Heart, label: "Cardio" },
  { href: "/dashboard/progress", icon: BarChart3, label: "Progress" },
  { href: "/dashboard/check-ins", icon: Calendar, label: "Check-ins" },
  { href: "/dashboard/messages", icon: MessageCircle, label: "Messages" },
  { href: "/dashboard/account", icon: User, label: "Account" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-7 h-7 border border-[var(--accent)] flex items-center justify-center flex-shrink-0">
            <span className="text-[var(--accent)] font-bold text-xs" style={{ fontFamily: "var(--font-outfit)" }}>A</span>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[var(--text-primary)]" style={{ fontFamily: "var(--font-outfit)" }}>
              Coach Amar
            </p>
            <p className="text-[0.6rem] text-[var(--text-muted)]">Client Portal</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all duration-200 ${
                active
                  ? "bg-[var(--accent-glow)] border border-[var(--border-accent)] text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass)]"
              }`}
            >
              <item.icon size={15} className="flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
              {item.label === "Messages" && (
                <span className="ml-auto w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[0.55rem] font-bold flex items-center justify-center">
                  2
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-[var(--accent-glow)] border border-[var(--border-accent)] flex items-center justify-center text-xs font-bold text-[var(--accent)]">
            A
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[var(--text-primary)] truncate">Ahmed Mohamed</p>
            <p className="text-[0.6rem] text-[var(--text-muted)]">Personal Coaching</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 w-full text-xs text-[var(--text-muted)] hover:text-red-400 transition-colors rounded-sm hover:bg-red-400/5">
          <LogOut size={13} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 h-screen fixed left-0 top-0 bg-[var(--bg-secondary)] border-r border-[var(--border)] z-30">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center justify-between px-4 z-30">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 border border-[var(--accent)] flex items-center justify-center">
            <span className="text-[var(--accent)] font-bold text-xs">A</span>
          </div>
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "var(--font-outfit)" }}>Coach Amar</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[var(--text-muted)]">
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[var(--bg-secondary)] flex flex-col pt-14">
          <SidebarContent />
        </div>
      )}
    </>
  );
}
