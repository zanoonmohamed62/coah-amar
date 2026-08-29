"use client";

import { useEffect, useState, useCallback } from "react";
import { Wifi, X, Plus } from "lucide-react";
import { usePWAInstall } from "@/lib/pwa-install-context";

export function PWAProvider() {
  const { canInstall, triggerInstall } = usePWAInstall();
  const [showInstallBanner, setShowInstallBanner] = useState(false);
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
  }, []);

  // ── Install prompt capture (shared with the Hero "Install App" button
  // via PWAInstallProvider — one source of truth for canInstall) ─────
  useEffect(() => {
    if (!canInstall) return;
    // Delay showing banner by 3s so user can see the app first
    const timer = setTimeout(() => setShowInstallBanner(true), 3000);
    return () => clearTimeout(timer);
  }, [canInstall]);

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
    await triggerInstall();
    setShowInstallBanner(false);
  }, [triggerInstall]);

  return (
    <>
      {/* ── Offline indicator ── */}
      {!isOnline && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-[#1a1f2e] border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-full shadow-2xl shadow-blue-500/10 backdrop-blur-md">
          <Wifi size={13} className="opacity-50" />
          <span>وضع أوفلاين — الجدول محفوظ محلياً</span>
        </div>
      )}

      {/* ── Install PWA banner ── */}
      {showInstallBanner && canInstall && (
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
              <img src="/icons/icon-192.png" alt="AMAR X" className="w-full h-full object-cover" />
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
