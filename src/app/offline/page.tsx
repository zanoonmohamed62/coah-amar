import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline — Coach Amar",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-6">
      <div className="max-w-sm text-center">
        {/* Wifi-off icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-500/15 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12h.01"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-white mb-2">You&apos;re Offline</h1>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">
          Check your internet connection and try again. Your training plan is
          still saved on your device.
        </p>

        <button
          onClick={() => typeof window !== "undefined" && window.location.reload()}
          className="ios-btn-blue px-8 py-3 text-sm font-bold !rounded-xl"
        >
          Try Again
        </button>

        <p className="mt-4 text-xs text-[var(--text-muted)]/60" dir="rtl">
          أنت غير متصل بالإنترنت — الجدول محفوظ على جهازك
        </p>
      </div>
    </div>
  );
}
