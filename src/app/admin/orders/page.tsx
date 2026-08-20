"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  ExternalLink,
  MessageSquare,
  Eye,
  Filter,
  X,
  CreditCard,
  User,
  Sparkles,
  ArrowUpDown,
} from "lucide-react";

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
  product: { id: string; name: string; type: string };
  user: { id: string; name: string; email: string } | null;
};

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  CONFIRMED: { label: "Confirmed", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  AWAITING_CONFIRMATION: { label: "Awaiting Confirmation", bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/40" },
  PENDING: { label: "Pending Payment", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
  FAILED: { label: "Failed / Rejected", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
  REFUNDED: { label: "Refunded", bg: "bg-zinc-500/10", text: "text-zinc-400", border: "border-zinc-500/30" },
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

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (methodFilter !== "all") params.set("method", methodFilter);
    if (searchQuery) params.set("q", searchQuery);

    fetch(`/api/admin/orders?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(fetchOrders, 200);
    return () => clearTimeout(timer);
  }, [statusFilter, methodFilter, searchQuery]);

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

  const openWhatsApp = (order: Order) => {
    let cleanPhone = order.customerPhone.replace(/[^0-9+]/g, "");
    if (!cleanPhone.startsWith("+") && cleanPhone.startsWith("0")) {
      cleanPhone = "+2" + cleanPhone; // Egypt default prefix if local
    }
    const msg = encodeURIComponent(
      `Hi ${order.customerName}! Coach Amar team here regarding your order ${order.orderRef} for ${order.product.name}.`
    );
    window.open(`https://wa.me/${cleanPhone.replace("+", "")}?text=${msg}`, "_blank");
  };

  const tabs = [
    { key: "all", label: "All Orders" },
    { key: "AWAITING_CONFIRMATION", label: "Pending Approvals" },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "FAILED", label: "Failed" },
    { key: "REFUNDED", label: "Refunded" },
  ];

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-sm">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-all ${
                statusFilter === key
                  ? "bg-[var(--accent)] text-black shadow-sm"
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
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ref, name, email, phone..."
              className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-sm pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-accent)]"
            />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-sm px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
          >
            <option value="all">All Methods</option>
            <option value="INSTAPAY">InstaPay</option>
            <option value="PAYPAL">PayPal</option>
            <option value="TELDA">Telda</option>
          </select>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-elevated)] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] font-bold">
              <tr>
                <th className="px-5 py-3.5">Reference</th>
                <th className="px-5 py-3.5">Athlete</th>
                <th className="px-5 py-3.5">Package</th>
                <th className="px-5 py-3.5">Method</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
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
                    <p className="text-sm font-semibold">No orders matching your filter criteria</p>
                    <p className="text-xs mt-1">Try resetting your search query or filters.</p>
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
                          className="hover:text-[var(--accent)] hover:underline text-left"
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
                        {(order.amount / 100).toLocaleString()} EGP
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${conf.bg} ${conf.text} ${conf.border}`}
                        >
                          {conf.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[var(--text-muted)]">
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.status === "AWAITING_CONFIRMATION" && (
                            <>
                              <button
                                onClick={() => handleOrderAction(order.orderRef, "confirm")}
                                disabled={acting === order.orderRef}
                                className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25 font-bold text-[11px] rounded-sm transition-colors disabled:opacity-50"
                              >
                                {acting === order.orderRef ? "…" : "Confirm"}
                              </button>
                              <button
                                onClick={() => handleOrderAction(order.orderRef, "reject")}
                                disabled={acting === order.orderRef}
                                className="px-2.5 py-1 bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25 font-bold text-[11px] rounded-sm transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] transition-colors"
                            title="View Full Details"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => openWhatsApp(order)}
                            className="p-1.5 rounded-sm text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            title="WhatsApp Customer"
                          >
                            <MessageSquare size={15} />
                          </button>
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

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-accent)] rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
                  Order Details
                </span>
                <h3 className="text-base font-black text-[var(--text-primary)] font-mono">
                  {selectedOrder.orderRef}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Customer Profile Card */}
              <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                    <User size={14} className="text-[var(--accent)]" /> Athlete Information
                  </h4>
                  <button
                    onClick={() => openWhatsApp(selectedOrder)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-sm hover:bg-emerald-500/25 transition-colors"
                  >
                    <MessageSquare size={13} /> Chat on WhatsApp
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase">Name</span>
                    <span className="font-bold text-[var(--text-primary)]">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase">Email</span>
                    <span className="font-medium text-[var(--text-primary)]">{selectedOrder.customerEmail}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase">Phone / WA</span>
                    <span className="font-mono text-[var(--text-primary)]">{selectedOrder.customerPhone || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase">Experience Level</span>
                    <span className="text-[var(--text-primary)]">{selectedOrder.customerLevel || "Standard"}</span>
                  </div>
                </div>

                {selectedOrder.customerGoal && (
                  <div className="pt-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)] block text-[10px] uppercase">Fitness Goal</span>
                    <p className="text-xs text-[var(--text-primary)] font-medium mt-0.5">
                      {selectedOrder.customerGoal}
                    </p>
                  </div>
                )}
              </div>

              {/* Transaction & Plan Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                    <Sparkles size={14} className="text-[var(--accent)]" /> Package
                  </h4>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{selectedOrder.product.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {selectedOrder.product.type === "TRAINING_PLAN"
                      ? "Lifetime access to workout split"
                      : "Personal coaching cohort access"}
                  </p>
                </div>

                <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                    <CreditCard size={14} className="text-[var(--accent)]" /> Payment
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)]">Method:</span>
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      {selectedOrder.paymentMethod}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)]">Total:</span>
                    <span className="text-sm font-black text-[var(--accent)]">
                      {(selectedOrder.amount / 100).toLocaleString()} {selectedOrder.currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="p-4 bg-[var(--bg-base)] border border-[var(--border)] rounded-sm space-y-3">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Management Actions
                </span>

                <div className="flex flex-wrap gap-2">
                  {selectedOrder.status !== "CONFIRMED" && (
                    <button
                      onClick={() => handleOrderAction(selectedOrder.orderRef, "confirm")}
                      disabled={acting === selectedOrder.orderRef}
                      className="flex-1 py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 size={15} /> Confirm & Grant Access
                    </button>
                  )}

                  {selectedOrder.status === "AWAITING_CONFIRMATION" && (
                    <button
                      onClick={() => handleOrderAction(selectedOrder.orderRef, "reject")}
                      disabled={acting === selectedOrder.orderRef}
                      className="py-2 px-4 bg-red-500/15 border border-red-500/40 hover:bg-red-500/25 text-red-400 font-bold text-xs rounded-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <XCircle size={15} /> Reject Order
                    </button>
                  )}

                  {selectedOrder.status === "CONFIRMED" && (
                    <button
                      onClick={() => handleOrderAction(selectedOrder.orderRef, "refund")}
                      disabled={acting === selectedOrder.orderRef}
                      className="py-2 px-4 bg-zinc-700/30 border border-zinc-600 hover:bg-zinc-700/50 text-zinc-300 font-bold text-xs rounded-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <RotateCcw size={15} /> Mark Refunded
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
