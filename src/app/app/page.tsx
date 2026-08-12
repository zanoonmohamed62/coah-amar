"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dumbbell, ChevronRight, MessageCircle, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

type Entitlement = {
  id: string; status: string; startDate: string; expiresAt: string | null;
  isExpired: boolean; daysLeft: number | null;
  product: { id: string; name: string; type: string; slug: string };
  order: { orderRef: string; confirmedAt: string };
};

const WA_NUMBER = process.env.NEXT_PUBLIC_COACH_WHATSAPP?.replace("+", "") || "34610354255";

export default function AppHome() {
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customer/entitlements").then(r => r.json()).then(d => { setEntitlements(d.entitlements || []); setLoading(false); });
  }, []);

  const active = entitlements.filter(e => e.status === "ACTIVE" && !e.isExpired);
  const expired = entitlements.filter(e => e.isExpired || e.status !== "ACTIVE");
  const hasCoaching = active.some(e => e.product.type === "PERSONAL_COACHING");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">My Dashboard</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Your active products and training access</p>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2].map(i => <div key={i} className="glass border border-[var(--border)] rounded-sm h-32 animate-pulse" />)}
        </div>
      ) : active.length === 0 && expired.length === 0 ? (
        <div className="glass border border-[var(--border)] rounded-sm p-10 text-center">
          <Dumbbell className="mx-auto mb-3 text-[var(--text-muted)]" size={36} />
          <p className="text-[var(--text-secondary)] font-semibold">No active products</p>
          <p className="text-[var(--text-muted)] text-sm mt-1">Visit the homepage to purchase a training plan.</p>
          <Link href="/" className="btn-primary inline-block mt-4 px-5 py-2 text-sm">View Plans →</Link>
        </div>
      ) : (
        <>
          {active.map(e => (
            <div key={e.id} className="glass-accent border border-[var(--border-accent)] rounded-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--accent-glow)] border border-[var(--border-accent)] rounded-sm flex items-center justify-center">
                    <Dumbbell size={18} className="text-[var(--accent)]" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--text-primary)]">{e.product.name}</p>
                    <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 size={11} /> Active</span>
                  </div>
                </div>
                {e.daysLeft !== null && (
                  <div className="text-right">
                    <p className="text-xs text-[var(--text-muted)]">Expires in</p>
                    <p className={`text-lg font-extrabold ${e.daysLeft < 14 ? "text-yellow-400" : "text-[var(--text-primary)]"}`}>{e.daysLeft}d</p>
                  </div>
                )}
                {e.daysLeft === null && <span className="text-xs text-[var(--accent)] font-bold px-2 py-1 bg-[var(--accent-glow)] rounded-sm">Lifetime</span>}
              </div>
              <div className="mt-4 flex gap-3">
                <Link href="/app/my-split" className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                  <Dumbbell size={14} /> View My Split <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}

          {hasCoaching && (
            <a href={`https://wa.me/${WA_NUMBER}?text=Hi+Coach+Amar!`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 glass border border-emerald-500/30 rounded-sm p-4 hover:bg-emerald-500/5 transition-colors group">
              <MessageCircle size={20} className="text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-[var(--text-primary)] text-sm">Message Coach Amar</p>
                <p className="text-xs text-[var(--text-muted)]">Personal coaching communication via WhatsApp</p>
              </div>
              <ChevronRight size={16} className="ml-auto text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}

          {expired.length > 0 && (
            <div className="glass border border-[var(--border)] rounded-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Expired / Past Plans</p>
              </div>
              {expired.map(e => (
                <div key={e.id} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0">
                  <XCircle size={16} className="text-red-400 shrink-0" />
                  <span className="text-sm text-[var(--text-secondary)]">{e.product.name}</span>
                  <span className="ml-auto text-xs text-[var(--text-muted)]">
                    {e.order.confirmedAt ? new Date(e.order.confirmedAt).toLocaleDateString() : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
