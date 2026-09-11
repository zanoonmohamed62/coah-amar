"use client";

import { useEffect, useState } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  MessageSquare,
  Eye,
  X,
  CreditCard,
  User,
  Sparkles,
  Trash2,
  AlertTriangle,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/lib/language-context";
import { adminTranslations } from "@/lib/admin-translations";
import { isSuperAdminEmail } from "@/lib/super-admin";

type Order = {
  id: string;
  orderRef: string;
  status: "PENDING" | "AWAITING_CONFIRMATION" | "CONFIRMED" | "FAILED" | "REFUNDED";
  paymentMethod: "INSTAPAY" | "PAYPAL" | "TELDA";
  amount: number;
  currency: string;
  confirmedAt: string | null;
  createdAt: string;
  isRenewal: boolean;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerGoal?: string | null;
  customerLevel?: string | null;
  customerNotes?: string | null;
  paymentProofId?: string | null;
  product: { id: string; name: string; type: string };
  user: { id: string; name: string; email: string } | null;
};

const methodConfig: Record<string, { label: string; color: string }> = {
  INSTAPAY: { label: "InstaPay", color: "text-emerald-400" },
  PAYPAL: { label: "PayPal", color: "text-blue-400" },
  TELDA: { label: "Telda", color: "text-purple-400" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  // The list route is paged now — loading every order at once was the query
  // that stops returning once this table is real.
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 25;

  const { data: session } = useSession();
  // Deleting an order destroys a payment record, so it is limited to the owner
  // — the same restriction customer deletion already uses.
  const canDelete = isSuperAdminEmail(session?.user?.email);

  const { lang, isArabic } = useLanguage();
  const t = adminTranslations[lang].orders;
  const tCommon = adminTranslations[lang].common;

  const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
    CONFIRMED: { label: t.confirmed, bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
    AWAITING_CONFIRMATION: { label: t.pendingReview, bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/40" },
    PENDING: { label: t.initiated, bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
    FAILED: { label: t.failed, bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
    REFUNDED: { label: t.refunded, bg: "bg-zinc-500/10", text: "text-zinc-400", border: "border-zinc-500/30" },
  };

  const fetchOrders = (targetPage = page) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (methodFilter !== "all") params.set("method", methodFilter);
    if (searchQuery) params.set("q", searchQuery);
    params.set("page", String(targetPage));
    params.set("pageSize", String(PAGE_SIZE));

    fetch(`/api/admin/orders?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.orders || []);
        setTotal(typeof d.total === "number" ? d.total : 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // Changing a filter or the search has to go back to page 1 — staying on
  // page 4 of a result set that now has one page shows an empty table.
  useEffect(() => {
    setPage(1);
  }, [statusFilter, methodFilter, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => fetchOrders(page), 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, methodFilter, searchQuery, page]);

  // A new order arriving is pushed over SSE (see AdminRealtime) — refresh the
  // list underneath the toast so the row is there when the admin looks.
  useEffect(() => {
    const es = new EventSource("/api/admin/realtime");
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data?.type?.startsWith("order.")) fetchOrders(page);
      } catch { /* ignore malformed frames */ }
    };
    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, methodFilter, searchQuery]);

  async function handleOrderAction(orderRef: string, action: "confirm" | "reject" | "refund") {
    setActing(orderRef);
    try {
      await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderRef, action }),
      });
      fetchOrders();
      if (selectedOrder && selectedOrder.orderRef === orderRef) {
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                status: action === "confirm" ? "CONFIRMED" : action === "reject" ? "FAILED" : "REFUNDED",
              }
            : null
        );
      }
    } catch {}
    setActing(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(
        `/api/admin/orders?orderRef=${encodeURIComponent(deleteTarget.orderRef)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setDeleteError(
          typeof data?.error === "string"
            ? data.error
            : isArabic
            ? "تعذّر حذف الطلب."
            : "Could not delete the order."
        );
        setDeleting(false);
        return;
      }
      setDeleteTarget(null);
      if (selectedOrder?.orderRef === deleteTarget.orderRef) setSelectedOrder(null);
      fetchOrders();
    } catch {
      setDeleteError(isArabic ? "حصل خطأ، حاول تاني." : "Something went wrong, please try again.");
    }
    setDeleting(false);
  }

  const openWhatsApp = (order: Order) => {
    let cleanPhone = order.customerPhone.replace(/[^0-9+]/g, "");
    if (!cleanPhone.startsWith("+") && cleanPhone.startsWith("0")) {
      cleanPhone = "+2" + cleanPhone;
    }
    const msg = encodeURIComponent(
      `Hi ${order.customerName}! Coach Amar team here regarding your order ${order.orderRef} for ${order.product.name}.`
    );
    window.open(`https://wa.me/${cleanPhone.replace("+", "")}?text=${msg}`, "_blank");
  };

  const tabs = [
    { key: "all", label: t.filterAllStatus },
    { key: "AWAITING_CONFIRMATION", label: t.pendingReview },
    { key: "CONFIRMED", label: t.confirmed },
    { key: "FAILED", label: t.failed },
    { key: "REFUNDED", label: t.refunded },
  ];

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)]">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-[var(--radius-sm)] transition-all ${
                statusFilter === key
                  ? "bg-[var(--accent)] text-black shadow-[var(--shadow-button)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search & Method Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className={`absolute ${isArabic ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-[var(--text-muted)]`} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] ${
                isArabic ? "pr-9 pl-3" : "pl-9 pr-3"
              } py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-accent)]`}
            />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
          >
            <option value="all">{t.filterAllMethods}</option>
            <option value="INSTAPAY">InstaPay</option>
            <option value="PAYPAL">PayPal</option>
            <option value="TELDA">Telda</option>
          </select>

          {/* Full table as CSV — the panel pages, the export does not. */}
          <a
            href="/api/admin/export?type=orders"
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] text-xs font-bold text-[var(--text-secondary)] hover:text-white hover:border-[var(--border-accent)] transition-colors"
            title={isArabic ? "تحميل كل الطلبات كملف Excel" : "Download every order as a spreadsheet"}
          >
            <Download size={13} className="text-blue-400" />
            <span className="hidden sm:inline">{isArabic ? "تصدير" : "Export"}</span>
          </a>
        </div>
      </div>

      {/* ── Mobile: card list ──────────────────────────────────────────────
          The table below has nine columns; on a phone that means pinching and
          scrolling sideways to reach the Confirm button — on the screen used to
          confirm every payment. Same data, stacked, with full-width actions. */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4"
            >
              <div className="h-4 bg-[var(--bg-elevated)] rounded animate-pulse mb-2" />
              <div className="h-3 w-2/3 bg-[var(--bg-elevated)] rounded animate-pulse" />
            </div>
          ))
        ) : orders.length === 0 ? (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-8 text-center">
            <p className="text-sm font-semibold text-[var(--text-muted)]">{t.noOrdersFound}</p>
          </div>
        ) : (
          orders.map((order) => {
            const conf = statusConfig[order.status] || {
              label: order.status,
              bg: "bg-zinc-500/10",
              text: "text-zinc-400",
              border: "border-zinc-500/30",
            };
            const meth = methodConfig[order.paymentMethod] || {
              label: order.paymentMethod,
              color: "text-[var(--text-primary)]",
            };

            return (
              <div
                key={order.id}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="font-mono text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent)] text-start break-all"
                  >
                    {order.orderRef}
                  </button>
                  <span
                    className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-[var(--radius-pill)] text-[10px] font-bold border ${conf.bg} ${conf.text} ${conf.border}`}
                  >
                    {conf.label}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{order.customerName}</p>
                  <p className="text-[11px] text-[var(--text-muted)] break-all">{order.customerEmail}</p>
                  {order.customerPhone && (
                    <p className="text-[11px] text-[var(--text-muted)] font-mono">{order.customerPhone}</p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 text-xs pt-2 border-t border-[var(--border)]">
                  <span className="text-[var(--text-secondary)]">{order.product.name}</span>
                  <span className="font-bold text-[var(--text-primary)] tabular-nums">
                    {(order.amount / 100).toLocaleString()} {order.currency}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-[11px] text-[var(--text-muted)]">
                  <span className={`font-bold ${meth.color}`}>{meth.label}</span>
                  <span>
                    {new Date(order.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>

                {/* min-h-11 ≈ 44px, the smallest reliably tappable target. */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 min-h-11 rounded-[var(--radius-md)] border border-[var(--border)] text-[var(--text-secondary)] text-xs font-bold flex items-center justify-center gap-1.5 active:bg-[var(--bg-elevated)]"
                  >
                    <Eye size={14} /> {t.viewDetails}
                  </button>

                  {order.customerPhone && (
                    <button
                      onClick={() => openWhatsApp(order)}
                      aria-label="WhatsApp"
                      className="min-h-11 px-4 rounded-[var(--radius-md)] border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 flex items-center justify-center active:bg-emerald-500/20"
                    >
                      <MessageSquare size={16} />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => {
                        setDeleteTarget(order);
                        setDeleteError("");
                      }}
                      aria-label={isArabic ? "حذف الطلب" : "Delete order"}
                      className="min-h-11 px-4 rounded-[var(--radius-md)] border border-red-500/30 text-red-400 bg-red-500/10 flex items-center justify-center active:bg-red-500/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {order.status === "AWAITING_CONFIRMATION" && (
                  <button
                    onClick={() => handleOrderAction(order.orderRef, "confirm")}
                    disabled={acting === order.orderRef}
                    className="w-full min-h-11 bg-emerald-400 active:bg-emerald-300 text-black font-black text-sm rounded-[var(--radius-md)] disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={16} /> {t.approveBtn}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Orders Table Container — desktop only; the cards above cover mobile */}
      <div className="hidden md:block bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[var(--bg-elevated)] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] font-bold">
              <tr>
                <th className="px-5 py-3.5">{t.colOrderRef}</th>
                <th className="px-5 py-3.5">{t.colCustomer}</th>
                <th className="px-5 py-3.5">{t.colPlan}</th>
                <th className="px-5 py-3.5">{t.colMethod}</th>
                <th className="px-5 py-3.5">{t.colAmount}</th>
                <th className="px-5 py-3.5">{t.colStatus}</th>
                <th className="px-5 py-3.5">{t.colDate}</th>
                <th className="px-5 py-3.5 text-end">{t.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-5 py-4">
                      <div className="h-4 bg-[var(--bg-elevated)] rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[var(--text-muted)]">
                    <p className="text-sm font-semibold">{t.noOrdersFound}</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const conf = statusConfig[order.status] || {
                    label: order.status,
                    bg: "bg-zinc-500/10",
                    text: "text-zinc-400",
                    border: "border-zinc-500/30",
                  };
                  const meth = methodConfig[order.paymentMethod] || {
                    label: order.paymentMethod,
                    color: "text-[var(--text-primary)]",
                  };

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[var(--bg-elevated)] transition-colors group"
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-[var(--text-primary)]">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="hover:text-[var(--accent)] hover:underline text-start"
                        >
                          {order.orderRef}
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-[var(--text-primary)]">{order.customerName}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">{order.customerEmail}</p>
                        {order.customerPhone && (
                          <p className="text-[10px] text-[var(--text-muted)] font-mono">{order.customerPhone}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-[var(--text-primary)]">{order.product.name}</p>
                        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                          {order.product.type === "TRAINING_PLAN" ? "Training Split" : "Coaching"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`font-bold ${meth.color}`}>{meth.label}</span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-[var(--text-primary)]">
                        {(order.amount / 100).toLocaleString()} {order.currency}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-[var(--radius-pill)] text-[10px] font-bold border ${conf.bg} ${conf.text} ${conf.border}`}
                        >
                          {conf.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[var(--text-muted)]">
                        {new Date(order.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-accent)] transition-colors"
                            title={t.viewDetails}
                          >
                            <Eye size={14} />
                          </button>

                          {order.customerPhone && (
                            <button
                              onClick={() => openWhatsApp(order)}
                              className="p-1.5 rounded-[var(--radius-sm)] border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                              title="WhatsApp"
                            >
                              <MessageSquare size={14} />
                            </button>
                          )}

                          {order.status === "AWAITING_CONFIRMATION" && (
                            <button
                              onClick={() => handleOrderAction(order.orderRef, "confirm")}
                              disabled={acting === order.orderRef}
                              className="px-2.5 py-1 bg-emerald-400 hover:bg-emerald-300 text-black font-black text-[11px] rounded-[var(--radius-sm)] transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              <CheckCircle2 size={12} /> {t.approveBtn}
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => {
                                setDeleteTarget(order);
                                setDeleteError("");
                              }}
                              className="p-1.5 rounded-[var(--radius-sm)] border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                              title={isArabic ? "حذف الطلب" : "Delete order"}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pager — shown on both layouts, since both are paged. */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-3 px-1">
          <span className="text-xs text-[var(--text-muted)] tabular-nums">
            {isArabic
              ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} من ${total}`
              : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="min-h-9 px-3 flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] text-xs font-bold text-[var(--text-secondary)] hover:text-white hover:border-[var(--border-accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isArabic ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              {isArabic ? "السابق" : "Prev"}
            </button>
            <span className="text-xs font-bold text-[var(--text-primary)] tabular-nums px-1">
              {page} / {Math.max(1, Math.ceil(total / PAGE_SIZE))}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * PAGE_SIZE >= total || loading}
              className="min-h-9 px-3 flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] text-xs font-bold text-[var(--text-secondary)] hover:text-white hover:border-[var(--border-accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isArabic ? "التالي" : "Next"}
              {isArabic ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Order Detail Modal / Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-[var(--shadow-card)]">
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-elevated)]">
              <div>
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block">
                  {t.orderDrawerTitle}
                </span>
                <h3 className="text-base font-black text-[var(--text-primary)] font-mono">
                  {selectedOrder.orderRef}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info Card */}
              <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-md)] space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                  <User size={14} className="text-[var(--accent)]" /> {t.customerInfo}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase">{tCommon.name}</span>
                    <span className="font-bold text-[var(--text-primary)]">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase">{tCommon.email}</span>
                    <span className="font-medium text-[var(--text-primary)]">{selectedOrder.customerEmail}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase">{tCommon.phone}</span>
                    <span className="font-mono text-[var(--text-primary)]">{selectedOrder.customerPhone || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase">Level</span>
                    <span className="text-[var(--text-primary)]">{selectedOrder.customerLevel || "Standard"}</span>
                  </div>
                </div>

                {selectedOrder.customerGoal && (
                  <div className="pt-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase">
                      {isArabic ? "الهدف" : "Goal"}
                    </span>
                    <p className="text-xs text-[var(--text-primary)] font-medium mt-0.5">
                      {selectedOrder.customerGoal}
                    </p>
                  </div>
                )}

                {selectedOrder.customerNotes && (
                  <div className="pt-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase">
                      {isArabic ? "إصابات / ملاحظات غذائية" : "Injuries / dietary notes"}
                    </span>
                    <p className="text-xs text-[var(--text-primary)] font-medium mt-0.5 whitespace-pre-line leading-relaxed">
                      {selectedOrder.customerNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Transaction & Plan Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-md)] space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                    <Sparkles size={14} className="text-[var(--accent)]" /> {t.colPlan}
                  </h4>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{selectedOrder.product.name}</p>
                </div>

                <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-md)] space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                    <CreditCard size={14} className="text-[var(--accent)]" /> {t.paymentProof}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)]">{t.colMethod}:</span>
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {selectedOrder.paymentMethod}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)]">{t.colAmount}:</span>
                    <span className="text-sm font-black text-[var(--accent)]">
                      {(selectedOrder.amount / 100).toLocaleString()} {selectedOrder.currency}
                    </span>
                  </div>
                  {selectedOrder.paymentProofId ? (
                    <a
                      href={`/api/media/${selectedOrder.paymentProofId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-2 rounded-[var(--radius-md)] overflow-hidden border border-[var(--border)] hover:border-[var(--border-accent)] transition-colors"
                      title={isArabic ? "اضغط لتكبير الصورة" : "Click to enlarge"}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/media/${selectedOrder.paymentProofId}`}
                        alt={isArabic ? "صورة إثبات الدفع" : "Payment proof"}
                        className="w-full max-h-56 object-contain bg-[var(--bg-base)]"
                      />
                    </a>
                  ) : selectedOrder.paymentMethod !== "PAYPAL" ? (
                    <p className="text-xs text-[var(--text-muted)] italic mt-1">
                      {isArabic ? "العميل لسه ما رفعش صورة التحويل" : "Customer hasn't uploaded a proof screenshot yet"}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="p-4 bg-[var(--bg-base)] border border-[var(--border)] rounded-[var(--radius-md)] space-y-3">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  {t.colActions}
                </span>

                <div className="flex flex-wrap gap-2">
                  {selectedOrder.status !== "CONFIRMED" && (
                    <button
                      onClick={() => handleOrderAction(selectedOrder.orderRef, "confirm")}
                      disabled={acting === selectedOrder.orderRef}
                      className="flex-1 py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-[var(--radius-lg)] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 size={16} /> {t.approveBtn}
                    </button>
                  )}

                  {selectedOrder.status === "AWAITING_CONFIRMATION" && (
                    <button
                      onClick={() => handleOrderAction(selectedOrder.orderRef, "reject")}
                      disabled={acting === selectedOrder.orderRef}
                      className="py-2 px-4 bg-red-500/15 border border-red-500/40 hover:bg-red-500/25 text-red-400 font-bold text-xs rounded-[var(--radius-lg)] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <XCircle size={16} /> {t.rejectBtn}
                    </button>
                  )}

                  {selectedOrder.status === "CONFIRMED" && (
                    <button
                      onClick={() => handleOrderAction(selectedOrder.orderRef, "refund")}
                      disabled={acting === selectedOrder.orderRef}
                      className="py-2 px-4 bg-zinc-700/30 border border-zinc-600 hover:bg-zinc-700/50 text-zinc-300 font-bold text-xs rounded-[var(--radius-lg)] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <RotateCcw size={16} /> {t.refundBtn}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation. Deleting an order is irreversible and also revokes
          the entitlement it created, so the customer loses access to what they
          bought — it names the order and says that plainly before proceeding. */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] border border-red-500/30 rounded-[var(--radius-xl)] w-full max-w-md shadow-[var(--shadow-card)]">
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-red-500/5">
              <h3 className="text-sm font-black uppercase tracking-wider text-red-400 flex items-center gap-2">
                <AlertTriangle size={16} />
                {isArabic ? "حذف الطلب" : "Delete order"}
              </h3>
              <button
                onClick={() => setDeleteTarget(null)}
                aria-label={isArabic ? "إغلاق" : "Close"}
                className="min-w-9 min-h-9 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {isArabic
                  ? "هيتم حذف الطلب ده نهائياً، ومعاه صلاحية الوصول اللي اتعملت منه — يعني العميل هيفقد الوصول للمنتج. مش ممكن التراجع."
                  : "This permanently deletes the order and the access it granted — the customer will lose access to what they bought. This cannot be undone."}
              </p>

              <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-md)] p-3 space-y-1">
                <p className="font-mono text-xs font-bold text-[var(--text-primary)] break-all">
                  {deleteTarget.orderRef}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">{deleteTarget.customerName}</p>
                <p className="text-[11px] text-[var(--text-muted)] break-all">
                  {deleteTarget.customerEmail}
                </p>
                <p className="text-xs font-bold text-[var(--text-primary)] pt-1">
                  {(deleteTarget.amount / 100).toLocaleString()} {deleteTarget.currency}
                </p>
              </div>

              {deleteError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-[var(--radius-md)] px-3 py-2">
                  {deleteError}
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 min-h-11 rounded-[var(--radius-md)] border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  {tCommon.cancel ?? (isArabic ? "إلغاء" : "Cancel")}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 min-h-11 rounded-[var(--radius-md)] bg-red-500 hover:bg-red-400 text-white text-xs font-black disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={14} />
                  {deleting
                    ? isArabic ? "جاري الحذف…" : "Deleting…"
                    : isArabic ? "حذف نهائي" : "Delete permanently"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
