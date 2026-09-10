"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, User, MessageCircle, Sparkles } from "lucide-react";
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
      <div className="pointer-events-auto flex items-center justify-between gap-1 px-4 py-2 bg-[#090d16]/95 backdrop-blur-2xl border border-blue-500/20 rounded-[28px] shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_20px_rgba(37,99,235,0.12)] max-w-sm w-full">
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
                className="relative -top-2 flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white flex items-center justify-center shadow-[0_6px_20px_rgba(37,99,235,0.5)] border-2 border-[#090d16] active:scale-95 transition-transform">
                  <Icon size={20} />
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
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
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
