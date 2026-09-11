"use client";

import { ReactNode, useState } from "react";
import { AppSidebar } from "@/components/client/AppSidebar";
import { useLanguage } from "@/lib/language-context";
import { PWAProvider } from "@/components/PWAProvider";
import { SplitPrefetcher } from "@/components/client/SplitPrefetcher";
import { PwaOnboardingModal } from "@/components/client/PwaOnboardingModal";
import { AppDock } from "@/components/client/AppDock";
import { Menu, X } from "lucide-react";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isArabic, dir } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // Auto sign-out after 15 minutes of inactivity
  useSessionTimeout();

  return (
    <>
      <PWAProvider />
      <SplitPrefetcher />
      <PwaOnboardingModal />

      <div
        dir={dir}
        className={`app-shell min-h-screen flex flex-col md:flex-row bg-[var(--bg-base)] text-[var(--text-primary)] ${isArabic ? "font-cairo" : ""}`}
      >
        {/* Mobile Header (iOS Navigation Bar) */}
        <header className="md:hidden sticky top-0 flex items-center justify-between px-4 py-3 bg-[#090d16]/85 backdrop-blur-2xl border-b border-white/10 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[11px] overflow-hidden border border-white/15 shadow-[0_2px_8px_rgba(37,99,235,0.3)] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/logo-amar.png" alt="Coach Amar" className="w-full h-full object-cover" />
            </div>
            <div className="font-extrabold tracking-tight text-white text-sm">
              COACH <span className="text-blue-400">AMAR</span>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isArabic ? "القائمة" : "Menu"}
            className="w-10 h-10 flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded-[14px] text-white active:scale-95 transition-all"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Sidebar Overlay with iOS Blur */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <AppSidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
          isCollapsed={isDesktopCollapsed}
          setIsCollapsed={setIsDesktopCollapsed}
        />
        
        <main 
          className={`flex-1 p-4 md:p-8 pb-28 md:pb-8 w-full max-w-full transition-all duration-300 mt-0
          ${isDesktopCollapsed ? (isArabic ? 'md:mr-20 md:max-w-[calc(100%-5rem)]' : 'md:ml-20 md:max-w-[calc(100%-5rem)]') 
                             : (isArabic ? 'md:mr-64 md:max-w-[calc(100%-16rem)]' : 'md:ml-64 md:max-w-[calc(100%-16rem)]')}`}
        >
          {children}
        </main>

        {/* Floating Mobile Dock */}
        <AppDock />
      </div>
    </>
  );
}
