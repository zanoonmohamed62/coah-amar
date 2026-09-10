"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { User, RefreshCw, ShoppingBag, CheckCircle2, Clock } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { 
  getCachedPwaUser, 
  saveCachedEntitlements, 
  getCachedEntitlements, 
  saveCachedOrders, 
  getCachedOrders 
} from "@/lib/split-cache";

type Order = { id: string; orderRef: string; status: string; amount: number; confirmedAt: string | null; isRenewal: boolean; product: { name: string; type: string } };
type Entitlement = { id: string; status: string; startDate: string; expiresAt: string | null; isExpired: boolean; daysLeft: number | null; product: { name: string; type: string } };

export default function AccountPage() {
  const session = useSession()?.data;
  const cachedUser = typeof window !== "undefined" ? getCachedPwaUser() : null;
  const user = (session?.user || cachedUser) as { name?: string; email?: string } | undefined;

  const [entitlements, setEntitlements] = useState<Entitlement[]>(() => {
    if (typeof window === "undefined") return [];
    return getCachedEntitlements();
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window === "undefined") return [];
    return getCachedOrders();
  });
  const { lang, isArabic } = useLanguage();

  useEffect(() => {
    fetch("/api/customer/entitlements")
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d.entitlements)) {
          setEntitlements(d.entitlements);
          saveCachedEntitlements(d.entitlements);
        }
      })
      .catch(() => {});

    fetch("/api/customer/orders")
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d.orders)) {
          setOrders(d.orders);
          saveCachedOrders(d.orders);
        }
      })
      .catch(() => {});
  }, []);
  const expiringEntitlements = entitlements.filter(e => e.daysLeft !== null && e.daysLeft <= 14 && !e.isExpired);

  const statusLabels: Record<string, string> = {
    CONFIRMED: isArabic ? "مؤكد" : "Confirmed",
    PENDING: isArabic ? "قيد التنفيذ" : "Pending",
    AWAITING_CONFIRMATION: isArabic ? "بانتظار التأكيد" : "Awaiting Confirmation",
    FAILED: isArabic ? "ملغي" : "Failed",
    REFUNDED: isArabic ? "مسترجع" : "Refunded",
  };

  const statusColors: Record<string, string> = {
    CONFIRMED: "text-emerald-400",
    PENDING: "text-yellow-400",
    AWAITING_CONFIRMATION: "text-yellow-400",
    FAILED: "text-red-400",
    REFUNDED: "text-[var(--text-muted)]",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
          {isArabic ? "حسابي والاشتراكات" : "Account & Membership"}
        </h1>
        <p className="text-[var(--text-muted)] text-sm">
          {isArabic ? "بيانات الحساب وسجل الطلبات والاشتراكات النشطة" : "Your subscription and order history"}
        </p>
      </div>

      {/* Profile */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--accent-glow)] border border-[var(--border-accent)] rounded-[var(--radius-md)] flex items-center justify-center">
            <User size={16} className="text-[var(--accent)]" />
          </div>
          <div>
            <p className="font-bold text-[var(--text-primary)]">{user?.name || (isArabic ? "متدرب كوتش عمار" : "Coach Amar Athlete")}</p>
            <p className="text-xs text-[var(--text-muted)]">{user?.email || "athlete@coachamar.com"}</p>
          </div>
        </div>
      </div>

      {/* Renewal warning */}
      {expiringEntitlements.map(e => (
        <div key={e.id} className="bg-[var(--bg-card)] border border-yellow-500/30 rounded-[var(--radius-xl)] p-4 flex items-center gap-3">
          <Clock size={16} className="text-yellow-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {e.product.name} {isArabic ? `ينتهي خلال ${e.daysLeft} يوم` : `expires in ${e.daysLeft} days`}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {isArabic ? "جدد الآن لمتابعة التدريب دون انقطاع." : "Renew now to keep access without interruption."}
            </p>
          </div>
          <Link href="/#plans" className="btn-primary py-1.5 px-3 text-xs shrink-0 flex items-center gap-1.5">
            <RefreshCw size={12} /> {isArabic ? "تجديد الاشتراك" : "Renew"}
          </Link>
        </div>
      ))}

      {/* Active entitlements */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
            {isArabic ? "الخطط والبرامج النشطة" : "Active Plans"}
          </p>
        </div>
        {entitlements.filter(e => e.status === "ACTIVE" && !e.isExpired).length === 0 ? (
          <div className="p-5 text-center text-xs text-[var(--text-muted)]">
            {isArabic ? "لا توجد خطط نشطة حالياً." : "No active plans yet."}
          </div>
        ) : (
          entitlements
            .filter(e => e.status === "ACTIVE" && !e.isExpired)
            .map(e => (
              <div key={e.id} className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border)] last:border-0">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{e.product.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{isArabic ? "مفعل ومتاح للتصفح" : "Active & unlocked"}</p>
                </div>
                <span className="text-xs text-[var(--accent)] font-bold">
                  {e.expiresAt ? (isArabic ? `متبقي ${e.daysLeft} يوم` : `${e.daysLeft} days left`) : (isArabic ? "مدى الحياة" : "Lifetime")}
                </span>
              </div>
            ))
        )}
      </div>

      {/* Order history */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center gap-2">
          <ShoppingBag size={14} className="text-[var(--text-muted)]" />
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
            {isArabic ? "سجل الطلبات" : "Order History"}
          </p>
        </div>
        {orders.length === 0 ? (
          <div className="p-5 text-center text-xs text-[var(--text-muted)]">
            {isArabic ? "لا توجد طلبات سابقة مسجلة." : "No orders yet."}
          </div>
        ) : (
          orders.map(o => (
            <div key={o.id} className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border)] last:border-0 text-xs">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--text-primary)]">{o.product.name}</p>
                <p className="text-[11px] text-[var(--text-muted)] font-mono">{o.orderRef}</p>
              </div>
              <div className="text-end shrink-0">
                <p className={`font-semibold ${statusColors[o.status] || "text-[var(--text-muted)]"}`}>
                  {statusLabels[o.status] || o.status}
                </p>
                <p className="text-[var(--text-muted)]">{(o.amount / 100).toFixed(0)} EGP</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
