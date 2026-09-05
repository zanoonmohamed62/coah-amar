"use client";

import { useEffect, useState } from "react";
import {
  Users,
  ShoppingBag,
  Dumbbell,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Plus,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { adminTranslations } from "@/lib/admin-translations";

type RecentOrder = {
  id: string;
  orderRef: string;
  status: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  amount: number;
  confirmedAt: string | null;
  createdAt: string;
  product: { name: string; type: string };
};

type Product = {
  id: string;
  name: string;
  type: string;
  price: number;
  currency: string;
};

type Stats = {
  totalCustomers: number;
  activeEntitlements: number;
  pendingOrders: number;
  monthlyRevenue: number;
  monthlyOrdersCount: number;
  totalRevenue: number;
  totalOrdersCount: number;
  paymentMethods: {
    instapay: number;
    paypal: number;
    telda: number;
  };
  recentOrders: RecentOrder[];
  products: Product[];
};

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { lang, isArabic } = useLanguage();
  const t = adminTranslations[lang].overview;
  const tOrders = adminTranslations[lang].orders;

  const statusBadges: Record<string, { label: string; className: string }> = {
    CONFIRMED: { label: tOrders.confirmed, className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    AWAITING_CONFIRMATION: { label: tOrders.pendingReview, className: "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse" },
    PENDING: { label: tOrders.initiated, className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    FAILED: { label: tOrders.failed, className: "bg-red-500/15 text-red-400 border-red-500/30" },
    REFUNDED: { label: tOrders.refunded, className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" },
  };

  const loadData = () => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalPaymentCount =
    (stats?.paymentMethods.instapay || 0) +
    (stats?.paymentMethods.paypal || 0) +
    (stats?.paymentMethods.telda || 0) || 1;

  const ArrowIcon = isArabic ? ChevronLeft : ChevronRight;
  const ArrowActionIcon = isArabic ? ArrowDownLeft : ArrowUpRight;

  return (
    <div className="space-y-8">
      {/* Pending Orders Banner */}
      {stats && stats.pendingOrders > 0 && (
        <div className="p-4 rounded-[var(--radius-xl)] bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-300">
                {t.pendingBannerTitle(stats.pendingOrders)}
              </p>
              <p className="text-xs text-amber-400/80">
                {t.pendingBannerDesc}
              </p>
            </div>
          </div>
          <Link
            href="/admin/orders?status=AWAITING_CONFIRMATION"
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded-[var(--radius-lg)] transition-colors flex items-center gap-1.5"
          >
            {t.reviewNow} <ArrowActionIcon size={14} />
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] animate-pulse" />
          ))
        ) : (
          <>
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 relative overflow-hidden hover:border-[var(--accent)]/40 transition-colors">
              <div className="flex items-center gap-1.5 mb-3 text-[var(--text-muted)]">
                <TrendingUp size={13} className="text-[var(--accent)]" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {t.monthlyRevenue}
                </span>
              </div>
              <p className="text-2xl lg:text-3xl font-black text-[var(--text-primary)] tracking-tight tabular-nums">
                {stats?.monthlyRevenue.toLocaleString()}{" "}
                <span className="text-sm font-bold text-[var(--accent)]">{t.egp}</span>
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-2 flex items-center gap-1">
                <span className="text-emerald-400 font-semibold">{stats?.monthlyOrdersCount} {t.salesThisMonth}</span>
              </p>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 relative overflow-hidden hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center gap-1.5 mb-3 text-[var(--text-muted)]">
                <Dumbbell size={13} className="text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {t.activeAthletes}
                </span>
              </div>
              <p className="text-2xl lg:text-3xl font-black text-[var(--text-primary)] tracking-tight tabular-nums">
                {stats?.activeEntitlements}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                {t.activeAthletesDesc}
              </p>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 relative overflow-hidden hover:border-[var(--border-accent)] transition-colors">
              <div className="flex items-center gap-1.5 mb-3 text-[var(--text-muted)]">
                <Users size={13} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {t.totalClients}
                </span>
              </div>
              <p className="text-2xl lg:text-3xl font-black text-[var(--text-primary)] tracking-tight tabular-nums">
                {stats?.totalCustomers}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-2">{t.totalClientsDesc}</p>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-5 relative overflow-hidden hover:border-purple-500/40 transition-colors">
              <div className="flex items-center gap-1.5 mb-3 text-[var(--text-muted)]">
                <ShoppingBag size={13} className="text-purple-400" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {t.allTimeSales}
                </span>
              </div>
              <p className="text-2xl lg:text-3xl font-black text-[var(--text-primary)] tracking-tight tabular-nums">
                {stats?.totalRevenue.toLocaleString()}{" "}
                <span className="text-sm font-bold text-purple-400">{t.egp}</span>
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                {stats?.totalOrdersCount} {t.confirmedTransactions}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Mid Section: Quick Actions & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Action Station */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--text-primary)] mb-1 flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--accent)]" /> {t.quickActions}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-5">
              {t.quickActionsDesc}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/admin/orders"
                className="p-3 border-b-2 border-transparent hover:border-[var(--accent)] bg-[var(--bg-elevated)] rounded-[var(--radius-md)] transition-colors text-start"
              >
                <p className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <ShoppingBag size={13} className="text-[var(--text-muted)]" /> {t.manageOrders}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">{t.manageOrdersDesc}</p>
              </Link>

              <Link
                href="/admin/customers"
                className="p-3 border-b-2 border-transparent hover:border-[var(--accent)] bg-[var(--bg-elevated)] rounded-[var(--radius-md)] transition-colors text-start"
              >
                <p className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Users size={13} className="text-[var(--text-muted)]" /> {t.athletesList}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">{t.athletesListDesc}</p>
              </Link>

              <Link
                href="/admin/cms"
                className="p-3 border-b-2 border-transparent hover:border-[var(--accent)] bg-[var(--bg-elevated)] rounded-[var(--radius-md)] transition-colors text-start"
              >
                <p className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <FileText size={13} className="text-[var(--text-muted)]" /> {t.websiteCms}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">{t.websiteCmsDesc}</p>
              </Link>

              <Link
                href="/admin/settings"
                className="p-3 border-b-2 border-transparent hover:border-[var(--accent)] bg-[var(--bg-elevated)] rounded-[var(--radius-md)] transition-colors text-start"
              >
                <p className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <CreditCard size={13} className="text-[var(--text-muted)]" /> {t.paymentConfig}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">{t.paymentConfigDesc}</p>
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)] mt-4 flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">{t.liveCustomerApp}</span>
            <Link href="/app" target="_blank" className="text-[var(--accent)] hover:underline flex items-center gap-1 font-semibold">
              {t.openPortal} <ExternalLink size={12} />
            </Link>
          </div>
        </div>

        {/* Payment Channels Breakdown */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--text-primary)] mb-1 flex items-center gap-2">
            <CreditCard size={16} className="text-[var(--accent)]" /> {t.paymentChannels}
          </h3>
          <p className="text-xs text-[var(--text-muted)] mb-5">
            {t.paymentChannelsDesc}
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[var(--text-primary)] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-[var(--radius-pill)] bg-emerald-400"></span> {t.instaPayTransfer}
                </span>
                <span className="text-[var(--text-muted)]">
                  {t.ordersCount(
                    stats?.paymentMethods.instapay || 0,
                    Math.round(((stats?.paymentMethods.instapay || 0) / totalPaymentCount) * 100)
                  )}
                </span>
              </div>
              <div className="w-full bg-[var(--bg-elevated)] h-2 rounded-[var(--radius-pill)] overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-[var(--radius-pill)] transition-all duration-500"
                  style={{
                    width: `${((stats?.paymentMethods.instapay || 0) / totalPaymentCount) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[var(--text-primary)] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-[var(--radius-pill)] bg-blue-400"></span> {t.payPalGateway}
                </span>
                <span className="text-[var(--text-muted)]">
                  {t.ordersCount(
                    stats?.paymentMethods.paypal || 0,
                    Math.round(((stats?.paymentMethods.paypal || 0) / totalPaymentCount) * 100)
                  )}
                </span>
              </div>
              <div className="w-full bg-[var(--bg-elevated)] h-2 rounded-[var(--radius-pill)] overflow-hidden">
                <div
                  className="bg-blue-400 h-full rounded-[var(--radius-pill)] transition-all duration-500"
                  style={{
                    width: `${((stats?.paymentMethods.paypal || 0) / totalPaymentCount) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[var(--text-primary)] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-[var(--radius-pill)] bg-purple-400"></span> {t.teldaDirect}
                </span>
                <span className="text-[var(--text-muted)]">
                  {t.ordersCount(
                    stats?.paymentMethods.telda || 0,
                    Math.round(((stats?.paymentMethods.telda || 0) / totalPaymentCount) * 100)
                  )}
                </span>
              </div>
              <div className="w-full bg-[var(--bg-elevated)] h-2 rounded-[var(--radius-pill)] overflow-hidden">
                <div
                  className="bg-purple-400 h-full rounded-[var(--radius-pill)] transition-all duration-500"
                  style={{
                    width: `${((stats?.paymentMethods.telda || 0) / totalPaymentCount) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-md)] mt-5">
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              💡 {t.instaPayTip}
            </p>
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <ShoppingBag size={16} className="text-[var(--accent)]" /> {t.activePackages}
              </h3>
              <Link href="/admin/products" className="text-xs text-[var(--accent)] hover:underline font-semibold">
                {t.manage}
              </Link>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              {t.activePackagesDesc}
            </p>

            <div className="space-y-3">
              {stats?.products.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-md)] flex items-center justify-between hover:border-[var(--border-accent)] transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">{p.name}</p>
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                      {p.type === "TRAINING_PLAN" ? t.trainingSplit : t.coachingCohort}
                    </span>
                  </div>
                  <div className="text-end">
                    <p className="text-xs font-black text-[var(--accent)]">
                      {(p.price / 100).toLocaleString()} {p.currency}
                    </p>
                    <span className="text-[10px] text-emerald-400 font-semibold">{t.activeStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/admin/products"
            className="w-full mt-4 py-2 border border-dashed border-[var(--border)] hover:border-[var(--border-accent)] rounded-[var(--radius-md)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus size={14} /> {t.addNewPlan}
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-card)]">
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">
              {t.recentOrders}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">{t.recentOrdersDesc}</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
          >
            {t.viewAllOrders} <ArrowIcon size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[var(--bg-base)] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] font-bold">
              <tr>
                <th className="px-6 py-3">{t.colOrderRef}</th>
                <th className="px-6 py-3">{t.colAthlete}</th>
                <th className="px-6 py-3">{t.colPackage}</th>
                <th className="px-6 py-3">{t.colPayment}</th>
                <th className="px-6 py-3">{t.colAmount}</th>
                <th className="px-6 py-3">{t.colStatus}</th>
                <th className="px-6 py-3 text-end">{t.colDate}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-4 bg-[var(--bg-elevated)] rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => {
                  const badge = statusBadges[order.status] || {
                    label: order.status,
                    className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
                  };
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[var(--bg-elevated)] transition-colors group"
                    >
                      <td className="px-6 py-3.5 font-mono font-bold text-[var(--text-primary)]">
                        {order.orderRef}
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="font-bold text-[var(--text-primary)]">{order.customerName}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">{order.customerEmail}</p>
                      </td>
                      <td className="px-6 py-3.5 text-[var(--text-secondary)] font-medium">
                        {order.product.name}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-semibold text-[var(--text-primary)]">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-bold text-[var(--text-primary)]">
                        {(order.amount / 100).toLocaleString()} {t.egp}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-[var(--radius-pill)] text-[10px] font-bold border ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-end text-[var(--text-muted)]">
                        {new Date(order.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[var(--text-muted)]">
                    {t.noOrders}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
