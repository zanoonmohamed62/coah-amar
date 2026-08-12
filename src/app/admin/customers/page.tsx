"use client";

import { useEffect, useState } from "react";
import { Search, ChevronRight, CheckCircle2, XCircle, Clock } from "lucide-react";
import Link from "next/link";

type Customer = { id: string; name: string; email: string; phone: string | null; createdAt: string; orders: { id: string; status: string; product: { name: string } }[]; entitlements: { id: string; status: string; expiresAt: string | null; product: { name: string; type: string } }[] };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/customers?q=${q}`).then(r => r.json()).then(d => { setCustomers(d.customers || []); setLoading(false); });
  }, [q]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Customers</h1>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or email…"
            className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm pl-9 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-accent)] w-64" />
        </div>
      </div>

      <div className="glass border border-[var(--border)] rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-elevated)] border-b border-[var(--border)]">
            <tr>{["Customer","Email","Product","Access","Joined"].map(h => <th key={h} className="text-left px-5 py-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{h}</th>)}<th /></tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-4 bg-[var(--bg-elevated)] rounded animate-pulse" /></td></tr>) :
              customers.length === 0 ? <tr><td colSpan={6} className="px-5 py-8 text-center text-[var(--text-muted)]">No customers found</td></tr> :
              customers.map(c => {
                const active = c.entitlements.find(e => e.status === "ACTIVE");
                const lastOrder = c.orders[0];
                return (
                  <tr key={c.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-elevated)] transition-colors">
                    <td className="px-5 py-3 font-semibold text-[var(--text-primary)]">{c.name}</td>
                    <td className="px-5 py-3 text-[var(--text-muted)]">{c.email}</td>
                    <td className="px-5 py-3 text-[var(--text-secondary)]">{lastOrder?.product.name || "—"}</td>
                    <td className="px-5 py-3">
                      {active ? <span className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle2 size={12} /> Active</span>
                        : <span className="flex items-center gap-1 text-[var(--text-muted)] text-xs"><XCircle size={12} /> None</span>}
                    </td>
                    <td className="px-5 py-3 text-[var(--text-muted)]">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3"><Link href={`/admin/customers/${c.id}`}><ChevronRight size={16} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]" /></Link></td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
