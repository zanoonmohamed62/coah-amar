"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle, ChevronDown } from "lucide-react";

type Order = { id: string; orderRef: string; status: string; paymentMethod: string; amount: number; confirmedAt: string | null; isRenewal: boolean; customerName: string; customerEmail: string; customerPhone: string; product: { name: string; type: string }; user: { name: string; email: string } | null };

const statusColors: Record<string, string> = { CONFIRMED: "text-emerald-400", PENDING: "text-yellow-400", AWAITING_CONFIRMATION: "text-yellow-400", FAILED: "text-red-400", REFUNDED: "text-[var(--text-muted)]" };
const methodLabels: Record<string, string> = { INSTAPAY: "InstaPay", VISA_CARD: "Visa", PAYPAL: "PayPal" };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [acting, setActing] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    const status = filter === "all" ? "" : filter;
    fetch(`/api/admin/orders?status=${status}`).then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(false); });
  };

  useEffect(fetchOrders, [filter]);

  async function confirm(orderRef: string, action: "confirm" | "reject") {
    setActing(orderRef);
    await fetch("/api/admin/orders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderRef, action }) });
    setActing(null);
    fetchOrders();
  }

  const tabs = [["all","All"], ["AWAITING_CONFIRMATION","Pending"], ["CONFIRMED","Confirmed"], ["FAILED","Failed"]];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-6">Orders</h1>
      <div className="flex gap-2 mb-6">
        {tabs.map(([v, l]) => <button key={v} onClick={() => setFilter(v)} className={`px-4 py-1.5 text-sm rounded-sm border transition-colors ${filter === v ? "bg-[var(--accent-glow)] border-[var(--border-accent)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}>{l}</button>)}
      </div>

      <div className="glass border border-[var(--border)] rounded-sm overflow-hidden">
        {loading ? <div className="p-10 text-center text-[var(--text-muted)] animate-pulse">Loading...</div> :
          orders.length === 0 ? <div className="p-10 text-center text-[var(--text-muted)]">No orders</div> :
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-elevated)] border-b border-[var(--border)]">
              <tr>{["Ref","Customer","Product","Method","Amount","Status","Actions"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-elevated)] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">{o.orderRef}</td>
                  <td className="px-4 py-3"><p className="font-semibold text-[var(--text-primary)] text-sm">{o.customerName}</p><p className="text-xs text-[var(--text-muted)]">{o.customerEmail}</p></td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] text-sm">{o.product.name}{o.isRenewal ? " (Renewal)" : ""}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] text-xs">{methodLabels[o.paymentMethod] || o.paymentMethod}</td>
                  <td className="px-4 py-3 text-[var(--text-primary)] text-sm font-semibold">{(o.amount / 100).toFixed(0)} EGP</td>
                  <td className="px-4 py-3"><span className={`text-xs font-bold ${statusColors[o.status] || "text-[var(--text-muted)]"}`}>{o.status.replace(/_/g," ")}</span></td>
                  <td className="px-4 py-3">
                    {o.status === "AWAITING_CONFIRMATION" && (
                      <div className="flex gap-2">
                        <button onClick={() => confirm(o.orderRef, "confirm")} disabled={acting === o.orderRef}
                          className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-sm hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
                          {acting === o.orderRef ? "…" : "Confirm"}
                        </button>
                        <button onClick={() => confirm(o.orderRef, "reject")} disabled={acting === o.orderRef}
                          className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-sm hover:bg-red-500/20 transition-colors disabled:opacity-50">
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </div>
  );
}
