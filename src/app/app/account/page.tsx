"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { RefreshCw, CheckCircle2, Clock, Bell, BellOff } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/use-settings";
import { usePush } from "@/lib/use-push";
import {
  getCachedPwaUser,
  saveCachedEntitlements,
  getCachedEntitlements,
  saveCachedOrders,
  getCachedOrders,
} from "@/lib/split-cache";
import {
  RealisticUserIcon,
  RealisticOrdersIcon,
  RealisticMembershipIcon,
  RealisticWhatsAppIcon,
} from "@/components/client/PwaIcons";

type Order = {
  id: string;
  orderRef: string;
  status: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  hasProof?: boolean;
  createdAt?: string;
  confirmedAt: string | null;
  isRenewal: boolean;
  product: { name: string; type: string };
};
type Entitlement = {
  id: string;
  status: string;
  startDate: string;
  expiresAt: string | null;
  isExpired: boolean;
  daysLeft: number | null;
  product: { name: string; type: string };
};

export default function AccountPage() {
  const session = useSession()?.data;
  const cachedUser = typeof window !== "undefined" ? getCachedPwaUser() : null;
  const user = (session?.user || cachedUser) as { name?: string; email?: string } | undefined;

  const { lang, isArabic } = useLanguage();
  const getSetting = useSettings();
  const push = usePush(lang === "ar" ? "ar" : "en");
  const wa = getSetting("whatsapp_number").replace(/[^0-9]/g, "");
  const T = (ar: string, en: string) => (isArabic ? ar : en);
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(isArabic ? "ar-EG" : "en-GB", { day: "numeric", month: "short", year: "numeric" });

  const [entitlements, setEntitlements] = useState<Entitlement[]>(() =>
    typeof window === "undefined" ? [] : getCachedEntitlements()
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    typeof window === "undefined" ? [] : getCachedOrders()
  );

  useEffect(() => {
    fetch("/api/customer/entitlements")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.entitlements)) {
          setEntitlements(d.entitlements);
          saveCachedEntitlements(d.entitlements);
        }
      })
      .catch(() => { /* offline — the cached copy stays on screen */ });

    fetch("/api/customer/orders")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.orders)) {
          setOrders(d.orders);
          saveCachedOrders(d.orders);
        }
      })
      .catch(() => { /* offline — the cached copy stays on screen */ });
  }, []);

  const activePlans = entitlements.filter((e) => e.status === "ACTIVE" && !e.isExpired);
  const expiring = activePlans.filter((e) => e.daysLeft !== null && e.daysLeft <= 14);

  const statusMeta: Record<string, { label: string; tone: string; note: string }> = {
    CONFIRMED: {
      label: T("مؤكد ومفعّل", "Confirmed & active"),
      tone: "text-emerald-400 bg-emerald-500/12 border-emerald-400/30",
      note: T("الجدول متاح على حسابك.", "Your plan is live on this account."),
    },
    AWAITING_CONFIRMATION: {
      label: T("بانتظار التأكيد", "Awaiting confirmation"),
      tone: "text-amber-400 bg-amber-500/12 border-amber-400/30",
      note: T(
        "بنراجع التحويل — عادةً خلال ساعتين، والطلبات اللي بالليل بتتفعّل الصبح.",
        "We're checking your transfer — usually within 2 hours; overnight orders are activated in the morning."
      ),
    },
    PENDING: {
      label: T("قيد التنفيذ", "Pending"),
      tone: "text-amber-400 bg-amber-500/12 border-amber-400/30",
      note: T("الطلب لسه محتاج إتمام الدفع.", "This order still needs payment completed."),
    },
    FAILED: {
      label: T("ملغي", "Cancelled"),
      tone: "text-red-400 bg-red-500/12 border-red-400/30",
      note: T("لو ده غلط، كلّمنا على واتساب برقم الطلب.", "If that's wrong, message us on WhatsApp with the order number."),
    },
    REFUNDED: {
      label: T("مسترجع", "Refunded"),
      tone: "text-slate-400 bg-white/[0.05] border-white/12",
      note: "",
    },
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-20">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          {T("حسابي والاشتراكات", "Account & Membership")}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {T("بيانات حسابك، طلباتك، وحالة كل طلب", "Your account, your orders, and where each one stands")}
        </p>
      </div>

      {/* Who this account is — the email that access is tied to. */}
      <div className="ios-card p-5">
        <div className="flex items-center gap-3.5">
          <div className="ios-tile ios-tile-blue w-12 h-12 !rounded-[17px]">
            <RealisticUserIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white truncate">
              {user?.name || T("متدرب كوتش عمار", "Coach Amar Athlete")}
            </p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-blue-300/90 bg-blue-500/8 border border-blue-400/20 rounded-[14px] px-3.5 py-2.5">
          {T(
            "التفعيل بيتم على الإيميل ده. لازم يكون نفس الإيميل اللي كتبته في فورم الدفع.",
            "Access is activated on this email. It must be the same one you entered at checkout."
          )}
        </p>
      </div>

      {/* Training reminders — only meaningful with a plan to train from. */}
      {activePlans.length > 0 && push.supported && push.configured && (
        <div className="ios-card p-5 flex items-center gap-3.5">
          <div className={`ios-tile w-11 h-11 ${push.subscribed ? "ios-tile-blue" : "ios-tile-slate"}`}>
            {push.subscribed ? <Bell size={18} className="text-blue-200" /> : <BellOff size={18} className="text-slate-300" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white tracking-tight">
              {T("تذكير التمرين", "Training reminders")}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              {push.subscribed
                ? T("هيوصلك تنبيه مرتين في اليوم يفكرك بتمرينك.", "You'll get a nudge twice a day about your training.")
                : T("فعّلها عشان يوصلك تنبيه يفكرك بالتمرين.", "Turn them on to get a nudge about your training.")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => (push.subscribed ? void push.unsubscribe() : void push.subscribe())}
            disabled={push.busy}
            className={`shrink-0 text-xs font-bold px-4 py-2.5 rounded-[14px] border transition-colors disabled:opacity-50 ${
              push.subscribed
                ? "border-white/12 text-slate-300 hover:bg-white/8"
                : "border-blue-400/40 text-blue-300 hover:bg-blue-500/12"
            }`}
          >
            {push.subscribed ? T("إيقاف", "Turn off") : T("تفعيل", "Turn on")}
          </button>
        </div>
      )}

      {/* Renewal warning */}
      {expiring.map((e) => (
        <div key={e.id} className="ios-card p-4 flex items-center gap-3 !border-amber-400/30">
          <Clock size={17} className="text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">
              {e.product.name} {T(`ينتهي خلال ${e.daysLeft} يوم`, `expires in ${e.daysLeft} days`)}
            </p>
            <p className="text-xs text-slate-400">
              {T("جدد دلوقتي عشان المتابعة ما تتقطعش.", "Renew now to keep access without interruption.")}
            </p>
          </div>
          <Link href="/#split" className="ios-btn-blue py-2 px-3.5 shrink-0 !text-xs">
            <RefreshCw size={12} /> {T("تجديد", "Renew")}
          </Link>
        </div>
      ))}

      {/* Active plans */}
      <section className="ios-card overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/8">
          <RealisticMembershipIcon className="w-5 h-5" />
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {T("الخطط النشطة", "Active plans")}
          </p>
        </div>
        {activePlans.length === 0 ? (
          <div className="px-5 py-7 text-center space-y-3">
            <p className="text-sm text-slate-400">
              {T("لسه مفيش خطة مفعّلة على حسابك.", "No active plan on this account yet.")}
            </p>
            <Link href="/#split" className="ios-btn-blue inline-flex px-5 py-2.5 !text-xs">
              {T("شوف الباقات", "See the packages")}
            </Link>
          </div>
        ) : (
          activePlans.map((e) => (
            <div key={e.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-white/6 last:border-0">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{e.product.name}</p>
                <p className="text-xs text-slate-400">{T("مفعّل ومتاح للتصفح", "Active & unlocked")}</p>
              </div>
              <span className="text-xs text-blue-400 font-bold shrink-0">
                {e.expiresAt
                  ? T(`متبقي ${e.daysLeft} يوم`, `${e.daysLeft} days left`)
                  : T("مدى الحياة", "Lifetime")}
              </span>
            </div>
          ))
        )}
      </section>

      {/* Orders — the number, the state, and what happens next. */}
      <section className="ios-card overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/8">
          <RealisticOrdersIcon className="w-5 h-5" />
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {T("طلباتي", "My orders")}
          </p>
        </div>
        {orders.length === 0 ? (
          <div className="px-5 py-7 text-center text-sm text-slate-400">
            {T("لا توجد طلبات مسجلة.", "No orders yet.")}
          </div>
        ) : (
          orders.map((o) => {
            const meta = statusMeta[o.status] ?? {
              label: o.status,
              tone: "text-slate-400 bg-white/[0.05] border-white/12",
              note: "",
            };
            return (
              <div key={o.id} className="px-5 py-4 border-b border-white/6 last:border-0 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{o.product.name}</p>
                    <p className="text-[13px] font-black tabular-nums text-blue-400 mt-0.5 select-all">
                      {o.orderRef}
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border ${meta.tone}`}>
                      {meta.label}
                    </span>
                    <p className="text-xs text-slate-400 mt-1.5 tabular-nums">
                      {(o.amount / 100).toLocaleString("en-US")} {o.currency ?? "EGP"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 tabular-nums">
                  {o.createdAt && (
                    <span>{T("تاريخ الطلب", "Ordered")}: {fmtDate(o.createdAt)}</span>
                  )}
                  {o.confirmedAt && (
                    <span className="text-emerald-400/80">{T("تاريخ التفعيل", "Activated")}: {fmtDate(o.confirmedAt)}</span>
                  )}
                </div>

                {meta.note && <p className="text-[11px] text-slate-500 leading-relaxed">{meta.note}</p>}

                {o.status === "AWAITING_CONFIRMATION" && wa && (
                  <a
                    href={`https://wa.me/${wa}?text=${encodeURIComponent(
                      isArabic
                        ? `مرحباً كوتش عمار، بستفسر عن طلب رقم ${o.orderRef}`
                        : `Hi Coach Amar, checking on order ${o.orderRef}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ios-btn-ghost w-full py-2.5 !text-xs !border-emerald-400/25 hover:!bg-emerald-500/10"
                  >
                    <RealisticWhatsAppIcon className="w-4 h-4" />
                    {T("اسأل عن الطلب ده على واتساب", "Ask about this order on WhatsApp")}
                  </a>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
