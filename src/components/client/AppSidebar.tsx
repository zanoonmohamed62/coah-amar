"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { forgetOfflineSplit } from "@/lib/split-cache";
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
  PanelRightClose,
  X,
  ExternalLink
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/use-settings";
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
  const getSetting = useSettings();

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

  const WA = getSetting("whatsapp_number").replace(/[^0-9]/g, "");

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
      className={`fixed top-0 ${isArabic ? "right-0 border-l" : "left-0 border-r"} h-full flex flex-col bg-[#0b101b]/95 backdrop-blur-2xl border-white/10 shadow-2xl z-50 py-6 pt-16 md:pt-6 transition-all duration-300 md:translate-x-0 ${
        isOpen
          ? "translate-x-0"
          : isArabic
          ? "translate-x-full"
          : "-translate-x-full"
      } ${isCollapsed ? "w-64 md:w-20" : "w-64"}`}
    >
      {/* Mobile close button */}
      <button
        onClick={() => setIsOpen(false)}
        aria-label={isArabic ? "إغلاق القائمة" : "Close menu"}
        className={`md:hidden absolute top-4 ${isArabic ? "left-4" : "right-4"} w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 flex items-center justify-center text-slate-300 active:scale-95 transition-all`}
      >
        <X size={16} />
      </button>

      {/* Brand */}
      <div className={`px-5 mb-6 flex items-center ${isCollapsed ? "justify-center md:flex-col gap-4" : "justify-between"}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] overflow-hidden border border-white/15 shadow-[0_2px_8px_rgba(37,99,235,0.3)] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/logo-amar.png" alt="Coach Amar" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white leading-none block">
                COACH <span className="text-blue-400">AMAR</span>
              </span>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">
                {isArabic ? "بوابة المتدرب الرياضي" : "Member Portal"}
              </p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="hidden md:flex flex-col items-center justify-center leading-none">
            <div className="w-8 h-8 rounded-[10px] overflow-hidden border border-white/15 shadow-[0_2px_8px_rgba(37,99,235,0.3)] mb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/logo-amar.png" alt="Coach Amar" className="w-full h-full object-cover" />
            </div>
            <span className="text-[7px] font-black tracking-widest text-white mt-0.5">SPLIT</span>
          </div>
        )}

        <div className={`flex items-center gap-2 ${isCollapsed ? "md:flex-col" : ""}`}>
          <button
            onClick={toggleLang}
            className="w-8 h-8 rounded-[10px] border border-white/10 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
            title={isArabic ? "Switch to English" : "التحويل إلى العربية"}
          >
            <Globe size={14} />
          </button>

          {/* Desktop Collapse Toggle */}
          {setIsCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex w-8 h-8 rounded-[10px] border border-white/10 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white items-center justify-center transition-colors text-xs font-bold"
              title={isCollapsed ? (isArabic ? "توسيع" : "Expand") : (isArabic ? "طي" : "Collapse")}
            >
              {isCollapsed ? <ExpandIcon size={14} /> : <CollapseIcon size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Nav links */}
      <nav className={`flex-1 overflow-y-auto custom-scrollbar space-y-1.5 ${isCollapsed ? "px-2" : "px-3"}`}>
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              title={isCollapsed ? label : undefined}
              className={`flex items-center gap-3 py-2.5 rounded-[14px] text-sm font-medium transition-all ${isCollapsed ? "px-0 justify-center md:px-0" : "px-3"} ${
                active
                  ? "bg-blue-500/15 text-blue-400 border border-blue-400/30 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <div className={`w-7 h-7 rounded-[9px] flex items-center justify-center ${active ? "bg-blue-500/20 text-blue-400" : "text-slate-400"}`}>
                <Icon size={16} />
              </div>
              {!isCollapsed && <span>{label}</span>}
              {!isCollapsed && active && <ArrowIcon size={12} className={isArabic ? "mr-auto text-blue-400" : "ml-auto text-blue-400"} />}
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
          className={`w-full flex items-center gap-3 py-2.5 rounded-[var(--radius-sm)] text-xs font-bold text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer disabled:opacity-50 ${isCollapsed ? "justify-center px-0" : "px-3"}`}
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
          className={`flex items-center gap-3 py-2.5 rounded-[var(--radius-sm)] text-xs font-bold text-blue-400 hover:bg-blue-500/10 transition-colors ${isCollapsed ? "justify-center px-0" : "px-3"}`}
        >
          <MessageCircle size={16} />
          {!isCollapsed && (isArabic ? "واتساب الكوتش" : "WhatsApp Coach")}
        </a>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title={isCollapsed ? (isArabic ? "الموقع الرسمي" : "Visit Website") : undefined}
          className={`flex items-center gap-3 py-2.5 rounded-[var(--radius-sm)] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors ${isCollapsed ? "justify-center px-0" : "px-3"}`}
        >
          <ExternalLink size={16} />
          {!isCollapsed && (isArabic ? "الموقع الرسمي" : "Visit Website")}
        </a>

        <button
          onClick={async () => { await forgetOfflineSplit(); signOut({ callbackUrl: "/login" }); }}
          title={isCollapsed ? (isArabic ? "تسجيل الخروج" : "Sign Out") : undefined}
          className={`w-full flex items-center gap-3 py-2.5 rounded-[var(--radius-sm)] text-xs font-bold text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer ${isCollapsed ? "justify-center px-0" : "px-3"}`}
        >
          <LogOut size={16} /> 
          {!isCollapsed && (isArabic ? "تسجيل الخروج" : "Sign Out")}
        </button>
      </div>
    </aside>
  );
}
