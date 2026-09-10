"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAInstallContextValue {
  canInstall: boolean;
  triggerInstall: () => Promise<void>;
}

const PWAInstallContext = createContext<PWAInstallContextValue>({
  canInstall: false,
  triggerInstall: async () => {},
});

export function PWAInstallProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    // Also listen for appinstalled to clear the prompt
    const installed = () => setDeferredPrompt(null);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) {
      const isAr = typeof document !== "undefined" && (document.documentElement.lang === "ar" || document.documentElement.dir === "rtl");
      alert(
        isAr
          ? "لتثبيت التطبيق على هاتفك:\nاضغط على زر المشاركة (Share ⎋) أو قائمة المتصفح (⋮)، ثم اختر 'إضافة إلى الشاشة الرئيسية' (Add to Home Screen)."
          : "To install the app on your phone:\nTap the Share button (⎋) or browser menu (⋮), and select 'Add to Home Screen'."
      );
      return;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
  }, [deferredPrompt]);

  return (
    <PWAInstallContext.Provider value={{ canInstall: !!deferredPrompt, triggerInstall }}>
      {children}
    </PWAInstallContext.Provider>
  );
}

export const usePWAInstall = () => useContext(PWAInstallContext);
