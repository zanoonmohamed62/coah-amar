"use client";

import { ReactNode, useEffect, useState } from "react";
import { AppSidebar } from "@/components/client/AppSidebar";
import { useLanguage } from "@/lib/language-context";
import { PWAProvider } from "@/components/PWAProvider";
import { Menu, X } from "lucide-react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isArabic, dir } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // ── Anti-screenshot / anti-share hardening ──────────────────────────────
  useEffect(() => {
    const blockKeys = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase();
      if (
        key === "printscreen" ||
        (e.ctrlKey && key === "p") ||
        (e.ctrlKey && key === "s") ||
        (e.metaKey && key === "s") ||
        (e.ctrlKey && e.shiftKey && key === "s") ||
        (e.metaKey && e.shiftKey && key === "3") ||
        (e.metaKey && e.shiftKey && key === "4") ||
        (e.metaKey && e.shiftKey && key === "5")
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const blockContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener("keydown", blockKeys, { capture: true });
    document.addEventListener("contextmenu", blockContextMenu);

    return () => {
      document.removeEventListener("keydown", blockKeys, { capture: true });
      document.removeEventListener("contextmenu", blockContextMenu);
    };
  }, []);

  return (
    <>
      <PWAProvider />

      <style>{`
        .app-shell * {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
        }
        @media print {
          .app-shell { display: none !important; }
          body::after {
            content: "هذا المحتوى محمي ولا يمكن طباعته.";
            display: block;
            text-align: center;
            padding: 4rem;
            font-size: 1.5rem;
          }
        }
      `}</style>

      <div
        dir={dir}
        className={`app-shell min-h-screen flex flex-col md:flex-row bg-[var(--bg-base)] text-[var(--text-primary)] ${isArabic ? "font-cairo" : ""}`}
      >
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[var(--bg-card)] border-b border-[var(--border)] z-50">
          <div className="font-extrabold tracking-tight text-[var(--text-primary)]">
            COACH <span className="text-[var(--accent)]">AMAR</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-[var(--bg-elevated)] rounded-sm text-[var(--text-primary)]"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
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
