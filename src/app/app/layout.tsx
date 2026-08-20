"use client";

import { ReactNode, useEffect } from "react";
import { AppSidebar } from "@/components/client/AppSidebar";
import { useLanguage } from "@/lib/language-context";
import { PWAProvider } from "@/components/PWAProvider";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isArabic, dir } = useLanguage();

  // ── Anti-screenshot / anti-share hardening ──────────────────────────────
  useEffect(() => {
    // Block keyboard shortcuts used for screenshots & saving
    const blockKeys = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase();
      // Block: PrtSc, Ctrl+P (print), Ctrl+S (save), Win+Shift+S, Ctrl+Shift+S
      if (
        key === "printscreen" ||
        (e.ctrlKey && key === "p") ||
        (e.ctrlKey && key === "s") ||
        (e.metaKey && key === "s") ||
        (e.ctrlKey && e.shiftKey && key === "s") ||
        (e.metaKey && e.shiftKey && key === "3") || // Mac CMD+Shift+3
        (e.metaKey && e.shiftKey && key === "4") || // Mac CMD+Shift+4
        (e.metaKey && e.shiftKey && key === "5")    // Mac CMD+Shift+5
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Block right-click context menu (prevents "Save image as")
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
      {/* PWA: SW registration, install prompt, update notifications */}
      <PWAProvider />

      {/*
        Anti-screenshot CSS layer:
        - user-select: none → prevents text selection & copy
        - -webkit-touch-callout: none → disables iOS long-press share sheet
        - pointer-events on the overlay prevent drag-to-save images
      */}
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
        className={`app-shell min-h-screen flex bg-[var(--bg-base)] text-[var(--text-primary)] ${isArabic ? "font-cairo" : ""}`}
      >
        <AppSidebar />
        <main className={`flex-1 ${isArabic ? "mr-64" : "ml-64"} p-6 sm:p-8 max-w-5xl transition-all`}>
          {children}
        </main>
      </div>
    </>
  );
}
