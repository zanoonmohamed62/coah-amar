"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, User, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/use-settings";

export function AppDock() {
  const pathname = usePathname();
  const { isArabic } = useLanguage();
  const getSetting = useSettings();
  const waNumber = getSetting("whatsapp_number").replace(/[^0-9]/g, "");

  const navItems = [
    {
      href: "/app",
      label: isArabic ? "الرئيسية" : "Home",
      icon: Home,
      exact: true,
    },
    {
      href: "/app/my-split",
      label: isArabic ? "جدولي" : "My Split",
      icon: FileText,
    },
    {
      href: `https://wa.me/${waNumber}?text=${encodeURIComponent(
        isArabic ? "مرحباً كوتش عمار، لدي استفسار بخصوص تدريبي" : "Hi Coach Amar, I have a question about my training"
      )}`,
      label: isArabic ? "الكوتش" : "Coach",
      icon: MessageCircle,
      isExternal: true,
      isCenter: true,
    },
    {
      href: "/app/account",
      label: isArabic ? "حسابي" : "Account",
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-4 inset-x-4 z-40 flex items-center justify-center pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center justify-between gap-1 px-4 py-2 bg-[#0c121e]/85 backdrop-blur-3xl border border-white/12 rounded-[32px] shadow-[0_16px_40px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)] max-w-sm w-full relative">
        <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : !item.isExternal && pathname.startsWith(item.href);

          if (item.isCenter) {
            return (
              <a
                key={index}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative -top-2.5 flex flex-col items-center justify-center group"
              >
                <div className="w-12 h-12 rounded-[17px] bg-gradient-to-b from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-[0_8px_24px_rgba(37,99,235,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/20 active:scale-95 transition-all duration-150 relative overflow-hidden">
                  <div className="absolute top-0 inset-x-1.5 h-px bg-white/50 pointer-events-none" />
                  <Icon size={21} strokeWidth={2.3} />
                </div>
                <span className="text-[10px] font-bold text-blue-400 mt-0.5">
                  {item.label}
                </span>
              </a>
            );
          }

          if (item.isExternal) {
            return (
              <a
                key={index}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center py-1 px-3 text-slate-400 hover:text-white transition-colors"
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              </a>
            );
          }

          return (
            <Link
              key={index}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
                isActive
                  ? "text-blue-400 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                )}
              </div>
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
