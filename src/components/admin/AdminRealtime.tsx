"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, BellOff, X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { usePush } from "@/lib/use-push";

// The admin's live layer: visitors online right now, and a notification the
// moment an order lands — both pushed over the SSE stream at
// /api/admin/realtime, never polled.
//
// Design follows iphone-ios.md: continuous squircles, a specular rim highlight,
// multi-stop lighting, blue and white only. No emoji and no generated icons.

type RealtimeOrder = {
  orderRef: string;
  customerName: string;
  productName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
};

type Incoming =
  | { type: "order.created"; order: RealtimeOrder }
  | { type: "order.proof"; order: RealtimeOrder }
  | { type: "order.updated"; order: RealtimeOrder }
  | { type: "presence"; online: number };

type Toast = { id: string; order: RealtimeOrder; kind: "created" | "proof" };

const TOAST_MS = 9000;
const MAX_TOASTS = 3;

export function AdminRealtime() {
  const { isArabic, lang } = useLanguage();
  const [online, setOnline] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = usePush(lang === "ar" ? "ar" : "en");
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const addToast = useCallback((order: RealtimeOrder, kind: "created" | "proof") => {
    const id = `${order.orderRef}-${kind}-${Date.now()}`;
    setToasts((prev) => [{ id, order, kind }, ...prev].slice(0, MAX_TOASTS));
    timers.current.set(id, setTimeout(() => dismiss(id), TOAST_MS));
  }, [dismiss]);

  useEffect(() => {
    // EventSource reconnects on its own after a drop, with the `retry` interval
    // the server sends — so a flaky connection heals without any code here.
    const es = new EventSource("/api/admin/realtime");

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.onmessage = (e) => {
      let data: Incoming;
      try {
        data = JSON.parse(e.data);
      } catch {
        return;
      }
      if (data.type === "presence") {
        setOnline(data.online);
        setConnected(true);
        return;
      }
      if (data.type === "order.created") addToast(data.order, "created");
      else if (data.type === "order.proof") addToast(data.order, "proof");
    };

    const snapshot = timers.current;
    return () => {
      es.close();
      snapshot.forEach((t) => clearTimeout(t));
      snapshot.clear();
    };
  }, [addToast]);

  const T = (ar: string, en: string) => (isArabic ? ar : en);

  return (
    <>
      {/* Visitors online + the notification switch, side by side in the header. */}
      <div className="flex items-center gap-2">
        <div
          className="ios-card flex items-center gap-2 !rounded-[14px] px-2.5 sm:px-3 py-1.5"
          title={T("زوار متواجدين على الموقع دلوقتي", "Visitors on the site right now")}
        >
          <span className="relative flex w-2 h-2 shrink-0">
            <span
              className={`absolute inline-flex h-full w-full rounded-full ${
                connected ? "bg-emerald-400/60 animate-ping" : "bg-slate-500/40"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                connected ? "bg-emerald-400" : "bg-slate-500"
              }`}
            />
          </span>
          <span className="text-sm font-black tabular-nums text-white leading-none">
            {online === null ? "—" : online}
          </span>
          <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">
            {T("زائر الآن", "online")}
          </span>
        </div>

        {push.supported && push.configured && (
          <button
            type="button"
            onClick={() => (push.subscribed ? void push.unsubscribe() : void push.subscribe())}
            disabled={push.busy}
            title={
              push.subscribed
                ? T("إيقاف إشعارات الطلبات على الجهاز ده", "Turn off order notifications on this device")
                : T("تفعيل إشعارات الطلبات على الجهاز ده", "Turn on order notifications on this device")
            }
            className={`ios-tile w-9 h-9 !rounded-[13px] transition-colors disabled:opacity-50 ${
              push.subscribed ? "ios-tile-blue" : "ios-tile-slate"
            }`}
          >
            {push.subscribed ? (
              <Bell size={16} className="text-blue-200" />
            ) : (
              <BellOff size={16} className="text-slate-300" />
            )}
          </button>
        )}
      </div>

      {/* Order toasts — above the dock on a phone, top-end on a desktop. */}
      {toasts.length > 0 && (
        <div className="fixed z-[60] inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-auto sm:top-20 sm:end-6 sm:w-[360px] flex flex-col gap-2.5 pointer-events-none">
          {toasts.map((t) => (
            <Link
              key={t.id}
              href={`/admin/orders?q=${encodeURIComponent(t.order.orderRef)}`}
              onClick={() => dismiss(t.id)}
              className="ios-card pointer-events-auto flex items-start gap-3 p-3.5 hover:brightness-110 transition-[filter]"
            >
              <div className="ios-tile ios-tile-blue w-11 h-11 mt-0.5">
                <span className="text-[11px] font-black text-white tracking-tight">
                  {t.order.orderRef.slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                    {t.kind === "created" ? T("طلب جديد", "New order") : T("صورة تحويل جديدة", "New screenshot")}
                  </span>
                  <span className="text-[10px] font-mono tabular-nums text-slate-500 shrink-0">
                    {t.order.orderRef}
                  </span>
                </div>
                <p className="mt-0.5 text-sm font-bold text-white truncate">{t.order.customerName}</p>
                <p className="text-xs text-slate-400 truncate">
                  {t.order.productName} · {(t.order.amount / 100).toLocaleString("en-US")} {t.order.currency}
                </p>
              </div>
              <button
                type="button"
                aria-label={T("إغلاق", "Dismiss")}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); dismiss(t.id); }}
                className="shrink-0 w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X size={13} />
              </button>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
