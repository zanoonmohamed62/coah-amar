"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Dumbbell,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  MessageSquare,
  Shield,
  Sparkles,
} from "lucide-react";

type Entitlement = {
  id: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  startDate: string;
  expiresAt: string | null;
  product: { id: string; name: string; type: string };
  order: { orderRef: string; confirmedAt: string | null; amount: number };
};

type Order = {
  id: string;
  orderRef: string;
  status: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  createdAt: string;
  product: { id: string; name: string; type: string; price: number };
};

type CustomerData = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  orders: Order[];
  entitlements: Entitlement[];
};

type Product = {
  id: string;
  name: string;
  type: string;
  price: number;
};

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [granting, setGranting] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [durationDays, setDurationDays] = useState(90);
  const [saving, setSaving] = useState(false);

  const fetchCustomer = () => {
    fetch(`/api/admin/customers/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setCustomer(d.customer);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomer();
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products || []);
        if (d.products?.length > 0) setSelectedProductId(d.products[0].id);
      })
      .catch(() => {});
  }, [id]);

  const grantAccess = async () => {
    if (!selectedProductId) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grant_entitlement",
          productId: selectedProductId,
          durationDays,
        }),
      });
      setGranting(false);
      fetchCustomer();
    } catch {}
    setSaving(false);
  };

  const updateEntitlement = async (entitlementId: string, status?: string, extendDays?: number) => {
    try {
      await fetch(`/api/admin/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_entitlement",
          entitlementId,
          status,
          extendDays,
        }),
      });
      fetchCustomer();
    } catch {}
  };

  const openWhatsApp = () => {
    if (!customer?.phone) return;
    let clean = customer.phone.replace(/[^0-9+]/g, "");
    if (!clean.startsWith("+") && clean.startsWith("0")) clean = "+2" + clean;
    window.open(`https://wa.me/${clean.replace("+", "")}`, "_blank");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-[var(--bg-card)] rounded animate-pulse" />
        <div className="h-44 bg-[var(--bg-card)] rounded-sm animate-pulse" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-16">
        <p className="text-base text-[var(--text-muted)]">Customer not found</p>
        <Link href="/admin/customers" className="text-xs text-[var(--accent)] hover:underline mt-2 inline-block">
          Return to Customer Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] font-semibold transition-colors"
      >
        <ArrowLeft size={14} /> Back to Athletes
      </Link>

      {/* Customer Header Card */}
      <div className="p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-sm bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-center font-black text-xl">
            {customer.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{customer.name}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30">
                {customer.role}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] mt-1.5">
              <span className="flex items-center gap-1">
                <Mail size={12} /> {customer.email}
              </span>
              {customer.phone && (
                <span className="flex items-center gap-1 font-mono">
                  <Phone size={12} /> {customer.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={12} /> Joined {new Date(customer.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {customer.phone && (
            <button
              onClick={openWhatsApp}
              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-sm hover:bg-emerald-500/25 transition-colors"
            >
              <MessageSquare size={14} /> WhatsApp
            </button>
          )}

          <button
            onClick={() => setGranting(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black text-xs font-black rounded-sm transition-colors"
          >
            <Plus size={14} /> Grant Access
          </button>
        </div>
      </div>

      {/* Entitlements Section */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell size={16} className="text-[var(--accent)]" />
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">
              Assigned Programs & Access
            </h3>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            {customer.entitlements.length} entitlement{customer.entitlements.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="p-6">
          {customer.entitlements.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)]">
              <p className="text-sm">No active training plans or coaching access assigned.</p>
              <button
                onClick={() => setGranting(true)}
                className="mt-3 text-xs text-[var(--accent)] font-bold hover:underline"
              >
                + Grant program access now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {customer.entitlements.map((ent) => (
                <div
                  key={ent.id}
                  className="p-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[var(--text-primary)]">{ent.product.name}</p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ent.status === "ACTIVE"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/15 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {ent.status}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1 space-x-3">
                      <span>Started: {new Date(ent.startDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>
                        Expires:{" "}
                        {ent.expiresAt ? new Date(ent.expiresAt).toLocaleDateString() : "Lifetime Access"}
                      </span>
                      <span>•</span>
                      <span className="font-mono">{ent.order.orderRef}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {ent.status === "ACTIVE" ? (
                      <>
                        {ent.expiresAt && (
                          <button
                            onClick={() => updateEntitlement(ent.id, undefined, 30)}
                            className="px-3 py-1 bg-[var(--bg-base)] border border-[var(--border)] hover:border-[var(--border-accent)] text-xs text-[var(--text-primary)] rounded-sm transition-colors"
                          >
                            +30 Days
                          </button>
                        )}
                        <button
                          onClick={() => updateEntitlement(ent.id, "REVOKED")}
                          className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs rounded-sm transition-colors"
                        >
                          Revoke
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => updateEntitlement(ent.id, "ACTIVE")}
                        className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs rounded-sm transition-colors"
                      >
                        Re-activate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order History */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} className="text-[var(--accent)]" />
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">
              Purchase History
            </h3>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            {customer.orders.length} order{customer.orders.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-base)] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] font-bold">
              <tr>
                <th className="px-6 py-3">Order Ref</th>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Payment Method</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {customer.orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-[var(--text-muted)]">
                    No orders recorded for this athlete.
                  </td>
                </tr>
              ) : (
                customer.orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[var(--bg-elevated)] transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-[var(--text-primary)]">
                      {o.orderRef}
                    </td>
                    <td className="px-6 py-3.5 text-[var(--text-primary)] font-semibold">
                      {o.product.name}
                    </td>
                    <td className="px-6 py-3.5 text-[var(--text-muted)]">{o.paymentMethod}</td>
                    <td className="px-6 py-3.5 font-bold text-[var(--text-primary)]">
                      {(o.amount / 100).toLocaleString()} {o.currency}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-[var(--text-muted)]">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grant Access Modal */}
      {granting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-accent)] rounded-sm shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-extrabold text-[var(--text-primary)]">Grant Program Access</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Manually assign a workout split or coaching tier to {customer.name}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">Product / Plan</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type === "TRAINING_PLAN" ? "Training Split" : "Coaching"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1 font-semibold">
                  Access Duration (Days)
                </label>
                <input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(+e.target.value)}
                  placeholder="90"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                />
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  Leave default 90 days for coaching or specify custom timeframe.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                onClick={grantAccess}
                disabled={saving}
                className="flex-1 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black text-xs font-black rounded-sm transition-colors disabled:opacity-50"
              >
                {saving ? "Granting…" : "Confirm Grant"}
              </button>
              <button
                onClick={() => setGranting(false)}
                className="px-4 py-2 border border-[var(--border)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
