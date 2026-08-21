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
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useState } from "react";

interface AppSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function AppSidebar({ isOpen, setIsOpen }: AppSidebarProps) {
  const pathname = usePathname();
  const { isArabic, toggleLang } = useLanguage();
  const ArrowIcon = isArabic ? ChevronLeft : ChevronRight;
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
    // Clear caches to force fresh fetch
    if ("caches" in window) {
      const cacheKeys = await caches.keys();
      for (const key of cacheKeys) {
        await caches.delete(key);
      }
    }
    
    // Clear IndexedDB for PDF
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
      className={`fixed top-0 ${isArabic ? "right-0" : "left-0"} h-full w-64 flex flex-col bg-[var(--bg-card)] border-[var(--border)] z-50 py-6 transition-transform duration-300 md:translate-x-0 ${
        isOpen
          ? "translate-x-0"
          : isArabic
          ? "translate-x-full"
          : "-translate-x-full"
      } ${isArabic ? "border-l" : "border-r"}`}
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
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
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

      </nav>

      {/* Bottom WhatsApp & Sign out */}
      <div className="px-3 pt-4 border-t border-[var(--border)] space-y-1">
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-bold text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={15} className={isUpdating ? "animate-spin" : ""} /> 
          {isArabic ? (isUpdating ? "جاري التحديث..." : "تحديث التطبيق") : (isUpdating ? "Updating..." : "Check for Updates")}
        </button>

        <a
          href={`https://wa.me/${WA}?text=${encodeURIComponent(
            isArabic ? "مرحباً كوتش عمار، لدي استفسار بخصوص جدول التمرين" : "Hi Coach Amar, I have a question about my training split"
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-bold text-blue-400 hover:bg-blue-500/10 transition-colors"
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
