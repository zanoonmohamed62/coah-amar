"use client";

import { useEffect, useState } from "react";
import { Users, ShoppingBag, Dumbbell, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

type Stats = { totalCustomers: number; activeEntitlements: number; pendingOrders: number; monthlyRevenue: number; recentOrders: { id: string; orderRef: string; status: string; customerName: string; confirmedAt: string | null; product: { name: string } }[]; products: { id: string; name: string; type: string; price: number }[] };

const statusColors: Record<string, string> = { CONFIRMED: "text-emerald-400", PENDING: "text-yellow-400", AWAITING_CONFIRMATION: "text-yellow-400", FAILED: "text-red-400" };

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => { fetch("/api/admin/stats").then(r => r.json()).then(setStats); }, []);

  const cards = stats ? [
    { label: "Total Customers", value: stats.totalCustomers, icon: Users, color: "text-blue-400" },
    { label: "Active Entitlements", value: stats.activeEntitlements, icon: Dumbbell, color: "text-emerald-400" },
    { label: "Pending Payments", value: stats.pendingOrders, icon: Clock, color: "text-yellow-400", href: "/admin/orders?status=AWAITING_CONFIRMATION" },
    { label: "Revenue This Month", value: `${stats.monthlyRevenue.toLocaleString()} EGP`, icon: TrendingUp, color: "text-[var(--accent)]" },
  ] : [];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-8">Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {!stats ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass border border-[var(--border)] rounded-sm h-24 animate-pulse" />) :
          cards.map(({ label, value, icon: Icon, color, href }) => (
            <div key={label} className={`glass border border-[var(--border)] rounded-sm p-5 ${href ? "hover:border-[var(--border-accent)] transition-colors cursor-pointer" : ""}`}
              onClick={() => href && (window.location.href = href)}>
              <Icon size={18} className={`${color} mb-3`} />
              <p className="text-2xl font-extrabold text-[var(--text-primary)]">{value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{label}</p>
            </div>
          ))
        }
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Recent Orders */}
        <div className="col-span-3 glass border border-[var(--border)] rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between">
            <p className="text-sm font-bold text-[var(--text-primary)]">Recent Orders</p>
            <Link href="/admin/orders" className="text-xs text-[var(--accent)] hover:underline">View all</Link>
          </div>
          {!stats ? <div className="p-5 animate-pulse h-40" /> :
            stats.recentOrders.map(o => (
              <div key={o.id} className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-elevated)] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{o.customerName}</p>
                  <p className="text-xs text-[var(--text-muted)]">{o.product.name} · {o.orderRef}</p>
                </div>
                <span className={`text-xs font-bold ${statusColors[o.status] || "text-[var(--text-muted)]"}`}>{o.status.replace(/_/g, " ")}</span>
              </div>
            ))
          }
        </div>

        {/* Products */}
        <div className="col-span-2 glass border border-[var(--border)] rounded-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-between">
            <p className="text-sm font-bold text-[var(--text-primary)]">Products</p>
            <Link href="/admin/products" className="text-xs text-[var(--accent)] hover:underline">Manage</Link>
          </div>
          {!stats ? <div className="p-5 animate-pulse h-40" /> :
            stats.products.map(p => (
              <div key={p.id} className="px-5 py-3 border-b border-[var(--border)] last:border-0">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{p.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{(p.price / 100).toFixed(0)} EGP</p>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
