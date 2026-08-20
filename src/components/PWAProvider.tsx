"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, RefreshCw, X, Wifi, Plus } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAProvider() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // ── Register Service Worker ───────────────────────────
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/app" })
      .then((reg) => {
        // Check for updates every time page focuses
        const checkUpdate = () => reg.update();
        window.addEventListener("focus", checkUpdate);
        return () => window.removeEventListener("focus", checkUpdate);
      })
      .catch(console.error);

    // Listen for messages from SW
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "PDF_UPDATED") {
        setShowUpdateBanner(true);
      }
    });
  }, []);

  // ── Install prompt capture ────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Delay showing banner by 3s so user can see the app first
      setTimeout(() => setShowInstallBanner(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // ── Online/Offline tracking ───────────────────────────
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // ── Handlers ─────────────────────────────────────────
  const handleInstall = useCallback(async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
      setShowInstallBanner(false);
    }
  }, [installPrompt]);

  const handleRefreshForUpdate = useCallback(() => {
    // Tell SW to clear PDF cache, then reload
    navigator.serviceWorker.controller?.postMessage({ type: "CLEAR_PDF_CACHE" });
    setShowUpdateBanner(false);
    window.location.reload();
  }, []);

  return (
    <>
      {/* ── Offline indicator ── */}
      {!isOnline && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-[#1a1f2e] border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-full shadow-2xl shadow-blue-500/10 backdrop-blur-md">
          <Wifi size={13} className="opacity-50" />
          <span>وضع أوفلاين — الجدول محفوظ محلياً</span>
        </div>
      )}

      {/* ── PDF Update banner ── */}
      {showUpdateBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-[#0d1117] border border-[#c4ff00]/30 rounded-sm shadow-2xl shadow-[#c4ff00]/5 backdrop-blur-md max-w-sm w-full mx-4">
          <div className="w-8 h-8 rounded-sm bg-[#c4ff00]/10 text-[#c4ff00] flex items-center justify-center flex-shrink-0">
            <Download size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white">تحديث جديد متاح</p>
            <p className="text-[11px] text-gray-400 mt-0.5">الكوتش عمّر الجدول بتاعك</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRefreshForUpdate}
              className="px-3 py-1.5 bg-[#c4ff00] text-black text-[11px] font-black rounded-sm hover:bg-[#c4ff00]/90 transition-colors flex items-center gap-1"
            >
              <RefreshCw size={11} />
              <span>تحديث</span>
            </button>
            <button
              onClick={() => setShowUpdateBanner(false)}
              className="p-1.5 text-gray-500 hover:text-white transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ── Install PWA banner ── */}
      {showInstallBanner && installPrompt && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm mx-4 px-4 py-4 bg-[#0d1117] border border-blue-500/30 rounded-sm shadow-2xl shadow-black/50 backdrop-blur-md">
          <button
            onClick={() => setShowInstallBanner(false)}
            className="absolute top-2 right-2 p-1 text-gray-600 hover:text-white transition-colors"
          >
            <X size={12} />
          </button>
          <div className="flex items-start gap-3">
            {/* Blue App Icon */}
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-blue-500/20 shadow-md shadow-blue-500/10">
              <img src="/icons/icon-192.png" alt="AMMAR X" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-black text-white">ضيف الأبليكيشن على هاتفك</p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                وصول سريع للجدول حتى بدون نت — زي أبليكيشن عادي
              </p>
            </div>
          </div>
          <button
            onClick={handleInstall}
            className="mt-3 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Plus size={14} />
            <span>إضافة للشاشة الرئيسية</span>
          </button>
        </div>
      )}
    </>
  );
}
