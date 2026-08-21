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
  RefreshCw,
  PanelLeftClose,
  PanelRightClose
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useState } from "react";

interface AppSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (col: boolean) => void;
}

export function AppSidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }: AppSidebarProps) {
  const pathname = usePathname();
  const { isArabic, toggleLang } = useLanguage();
  const ArrowIcon = isArabic ? ChevronLeft : ChevronRight;
  const CollapseIcon = isArabic ? PanelRightClose : PanelLeftClose;
  const ExpandIcon = isArabic ? PanelLeftClose : PanelRightClose;
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleUpdate = async () => {
    setIsUpdating(true);
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.update();
      }
    }
    if ("caches" in window) {
      const cacheKeys = await caches.keys();
      for (const key of cacheKeys) {
        await caches.delete(key);
      }
    }
    try {
      const req = indexedDB.deleteDatabase("amar-split-cache");
      await new Promise((resolve, reject) => {
        req.onsuccess = resolve;
        req.onerror = reject;
      });
    } catch {}
    window.location.reload();
  };

  return (
    <aside
      className={`fixed top-0 ${isArabic ? "right-0 border-l" : "left-0 border-r"} h-full flex flex-col bg-[var(--bg-card)] border-[var(--border)] z-50 py-6 transition-all duration-300 md:translate-x-0 ${
        isOpen
          ? "translate-x-0"
          : isArabic
          ? "translate-x-full"
          : "-translate-x-full"
      } ${isCollapsed ? "w-64 md:w-20" : "w-64"}`}
    >
      {/* Brand */}
      <div className={`px-5 mb-6 flex items-center ${isCollapsed ? "justify-center md:flex-col gap-4" : "justify-between"}`}>
        {!isCollapsed && (
          <div className="md:block">
            <span className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">
              COACH <span className="text-[var(--accent)]">AMAR</span>
            </span>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] mt-0.5">
              {isArabic ? "بوابة المتدرب الرياضي" : "Member Portal"}
            </p>
          </div>
        )}
        {isCollapsed && (
          <div className="hidden md:flex font-extrabold text-sm text-[var(--text-primary)]">
            <span className="text-[var(--accent)]">A</span>X
          </div>
        )}

        <div className={`flex items-center gap-2 ${isCollapsed ? "md:flex-col" : ""}`}>
          <button
            onClick={toggleLang}
            className="p-1.5 rounded-sm border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors text-xs font-bold"
            title={isArabic ? "Switch to English" : "التحويل إلى العربية"}
          >
            <Globe size={13} />
          </button>
          
          {/* Desktop Collapse Toggle */}
          {setIsCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 rounded-sm border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
              title={isCollapsed ? (isArabic ? "توسيع" : "Expand") : (isArabic ? "طي القائمة" : "Collapse")}
            >
              {isCollapsed ? <ExpandIcon size={14} /> : <CollapseIcon size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Nav links */}
      <nav className={`flex-1 overflow-y-auto custom-scrollbar space-y-1 ${isCollapsed ? "px-2" : "px-3"}`}>
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              title={isCollapsed ? label : undefined}
              className={`flex items-center gap-3 py-2.5 rounded-sm text-sm font-medium transition-all ${isCollapsed ? "px-0 justify-center md:px-0" : "px-3"} ${
                active
                  ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent"
              }`}
            >
              <Icon size={18} className={active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"} />
              {!isCollapsed && <span>{label}</span>}
              {!isCollapsed && active && <ArrowIcon size={12} className={isArabic ? "mr-auto text-[var(--accent)]" : "ml-auto text-[var(--accent)]"} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className={`pt-4 border-t border-[var(--border)] space-y-1 ${isCollapsed ? "px-2 md:px-2" : "px-3"}`}>
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          title={isCollapsed ? (isArabic ? "تحديث" : "Update") : undefined}
          className={`w-full flex items-center gap-3 py-2.5 rounded-sm text-xs font-bold text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer disabled:opacity-50 ${isCollapsed ? "justify-center px-0" : "px-3"}`}
        >
          <RefreshCw size={16} className={isUpdating ? "animate-spin" : ""} /> 
          {!isCollapsed && (isArabic ? (isUpdating ? "جاري التحديث..." : "تحديث التطبيق") : (isUpdating ? "Updating..." : "Check for Updates"))}
        </button>

        <a
          href={`https://wa.me/${WA}?text=${encodeURIComponent(
            isArabic ? "مرحباً كوتش عمار، لدي استفسار بخصوص جدول التمرين" : "Hi Coach Amar, I have a question about my training split"
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          title={isCollapsed ? (isArabic ? "واتساب الكوتش" : "WhatsApp Coach") : undefined}
          className={`flex items-center gap-3 py-2.5 rounded-sm text-xs font-bold text-blue-400 hover:bg-blue-500/10 transition-colors ${isCollapsed ? "justify-center px-0" : "px-3"}`}
        >
          <MessageCircle size={16} /> 
          {!isCollapsed && (isArabic ? "واتساب الكوتش" : "WhatsApp Coach")}
        </a>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={isCollapsed ? (isArabic ? "تسجيل الخروج" : "Sign Out") : undefined}
          className={`w-full flex items-center gap-3 py-2.5 rounded-sm text-xs font-bold text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer ${isCollapsed ? "justify-center px-0" : "px-3"}`}
        >
          <LogOut size={16} /> 
          {!isCollapsed && (isArabic ? "تسجيل الخروج" : "Sign Out")}
        </button>
      </div>
    </aside>
  );
}
