"use client";

import { ReactNode, useState } from "react";
import { AppSidebar } from "@/components/client/AppSidebar";
import { useLanguage } from "@/lib/language-context";
import { PWAProvider } from "@/components/PWAProvider";
import { SplitPrefetcher } from "@/components/client/SplitPrefetcher";
import { Menu, X } from "lucide-react";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isArabic, dir } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // Auto sign-out after 15 minutes of inactivity
  useSessionTimeout();

  // Screenshot/keyboard blocking was removed here too. A browser cannot stop an
  // OS-level capture, so it never prevented a leak — it only disabled
  // right-click, text selection and Ctrl+S for paying customers, and blocked
  // ordinary phone gestures. The per-viewer watermark on every rendered page is
  // what actually makes a leaked copy traceable.

  return (
    <>
      <PWAProvider />
      <SplitPrefetcher />


      <div
        dir={dir}
        className={`app-shell min-h-screen flex flex-col md:flex-row bg-[var(--bg-base)] text-[var(--text-primary)] ${isArabic ? "font-cairo" : ""}`}
      >
        {/* Mobile Header — sits below the drawer (z-50) and its scrim (z-40)
            so an open sidebar covers it instead of bleeding through. */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[var(--bg-card)] border-b border-[var(--border)] z-30">
          <div className="font-extrabold tracking-tight text-[var(--text-primary)]">
            COACH <span className="text-[var(--accent)]">AMAR</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isArabic ? "القائمة" : "Menu"}
            className="min-w-11 min-h-11 flex items-center justify-center bg-[var(--bg-elevated)] rounded-[var(--radius-md)] text-[var(--text-primary)] active:opacity-80"
          >
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
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
          className={`flex-1 p-4 md:p-8 w-full max-w-full transition-all duration-300 mt-0
          ${isDesktopCollapsed ? (isArabic ? 'md:mr-20 md:max-w-[calc(100%-5rem)]' : 'md:ml-20 md:max-w-[calc(100%-5rem)]') 
                             : (isArabic ? 'md:mr-64 md:max-w-[calc(100%-16rem)]' : 'md:ml-64 md:max-w-[calc(100%-16rem)]')}`}
        >
          {children}
        </main>
      </div>
    </>
  );
}
