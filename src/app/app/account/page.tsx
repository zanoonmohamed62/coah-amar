"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { User, Calendar, RefreshCw, ShoppingBag, CheckCircle2, Clock, XCircle } from "lucide-react";

type Order = { id: string; orderRef: string; status: string; amount: number; confirmedAt: string | null; isRenewal: boolean; product: { name: string; type: string } };
type Entitlement = { id: string; status: string; startDate: string; expiresAt: string | null; isExpired: boolean; daysLeft: number | null; product: { name: string; type: string } };

const statusColors: Record<string, string> = { CONFIRMED: "text-emerald-400", PENDING: "text-yellow-400", AWAITING_CONFIRMATION: "text-yellow-400", FAILED: "text-red-400", REFUNDED: "text-[var(--text-muted)]" };
const statusLabels: Record<string, string> = { CONFIRMED: "Confirmed", PENDING: "Pending", AWAITING_CONFIRMATION: "Awaiting Confirmation", FAILED: "Failed", REFUNDED: "Refunded" };

export const dynamic = "force-dynamic";

export default function AccountPage() {
  const session = useSession()?.data;
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/customer/entitlements").then(r => r.json()).then(d => setEntitlements(d.entitlements || []));
    fetch("/api/customer/orders").then(r => r.json()).then(d => setOrders(d.orders || []));
  }, []);

  const user = session?.user as { name?: string; email?: string };
  const expiringEntitlements = entitlements.filter(e => e.daysLeft !== null && e.daysLeft <= 14 && !e.isExpired);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Account</h1>
        <p className="text-[var(--text-muted)] text-sm">Your subscription and order history</p>
      </div>

      {/* Profile */}
      <div className="glass border border-[var(--border)] rounded-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[var(--accent-glow)] border border-[var(--border-accent)] rounded-sm flex items-center justify-center"><User size={18} className="text-[var(--accent)]" /></div>
          <div>
            <p className="font-bold text-[var(--text-primary)]">{user?.name || "—"}</p>
            <p className="text-xs text-[var(--text-muted)]">{user?.email || "—"}</p>
          </div>
        </div>
      </div>

      {/* Renewal warning */}
      {expiringEntitlements.map(e => (
        <div key={e.id} className="glass border border-yellow-500/30 rounded-sm p-4 flex items-center gap-3">
          <Clock size={16} className="text-yellow-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{e.product.name} expires in {e.daysLeft} days</p>
            <p className="text-xs text-[var(--text-muted)]">Renew now to keep access without interruption.</p>
          </div>
          <Link href="/#pricing" className="btn-primary py-1.5 px-3 text-xs shrink-0 flex items-center gap-1.5"><RefreshCw size={12} /> Renew</Link>
        </div>
      ))}

      {/* Active entitlements */}
      <div className="glass border border-[var(--border)] rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Active Plans</p>
        </div>
        {entitlements.filter(e => !e.isExpired && e.status === "ACTIVE").length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm p-5">No active plans.</p>
        ) : entitlements.filter(e => !e.isExpired && e.status === "ACTIVE").map(e => (
          <div key={e.id} className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border)] last:border-0">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{e.product.name}</p>
              <p className="text-xs text-[var(--text-muted)]">Started {new Date(e.startDate).toLocaleDateString()}</p>
            </div>
            <span className="text-xs text-[var(--text-secondary)]">{e.expiresAt ? `Expires ${new Date(e.expiresAt).toLocaleDateString()}` : "Lifetime"}</span>
          </div>
        ))}
      </div>

      {/* Order history */}
      <div className="glass border border-[var(--border)] rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center gap-2">
          <ShoppingBag size={14} className="text-[var(--text-muted)]" />
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Order History</p>
        </div>
        {orders.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm p-5">No orders yet.</p>
        ) : orders.map(o => (
          <div key={o.id} className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border)] last:border-0">
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{o.product.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{o.orderRef}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-xs font-semibold ${statusColors[o.status] || "text-[var(--text-muted)]"}`}>{statusLabels[o.status] || o.status}</p>
              <p className="text-xs text-[var(--text-muted)]">{(o.amount / 100).toFixed(0)} EGP</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
