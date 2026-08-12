"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

type Product = { id: string; name: string; slug: string; type: string; price: number; currency: string; isActive: boolean; _count: { orders: number; entitlements: number } };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", type: "TRAINING_PLAN", price: 399, currency: "EGP", description: "", features: "" });
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => fetch("/api/admin/products").then(r => r.json()).then(d => { setProducts(d.products || []); setLoading(false); });
  useEffect(() => { fetchProducts(); }, []);

  async function save() {
    setSaving(true);
    await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, price: Math.round(form.price * 100), features: form.features.split("\n").filter(Boolean) }) });
    setSaving(false); setShowForm(false); fetchProducts();
  }

  async function toggle(id: string, isActive: boolean) {
    await fetch(`/api/admin/products/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !isActive }) });
    fetchProducts();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Products</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"><Plus size={15} /> New Product</button>
      </div>

      {showForm && (
        <div className="glass border border-[var(--border-accent)] rounded-sm p-6 mb-6">
          <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4">New Product</h2>
          <div className="grid grid-cols-2 gap-4">
            {[["Name","name","text"],["Slug","slug","text"],["Price (EGP)","price","number"]].map(([l,k,t]) => (
              <div key={k}>
                <label className="text-xs text-[var(--text-muted)] block mb-1">{l}</label>
                <input type={t} value={(form as Record<string,unknown>)[k] as string} onChange={e => setForm(f => ({ ...f, [k]: t === "number" ? +e.target.value : e.target.value }))}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]" />
              </div>
            ))}
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none">
                <option value="TRAINING_PLAN">Training Plan</option>
                <option value="PERSONAL_COACHING">Personal Coaching</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-[var(--text-muted)] block mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)] resize-none" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-[var(--text-muted)] block mb-1">Features (one per line)</label>
              <textarea value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} rows={4}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)] resize-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving} className="btn-primary px-4 py-2 text-sm disabled:opacity-50">{saving ? "Saving…" : "Save Product"}</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {loading ? Array.from({ length: 2 }).map((_, i) => <div key={i} className="glass border border-[var(--border)] rounded-sm h-24 animate-pulse" />) :
          products.map(p => (
            <div key={p.id} className={`glass border ${p.isActive ? "border-[var(--border)]" : "border-[var(--border)] opacity-60"} rounded-sm p-5 flex items-center gap-4`}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-[var(--text-primary)]">{p.name}</p>
                  <span className="text-xs text-[var(--accent)] bg-[var(--accent-glow)] px-2 py-0.5 rounded-sm">{p.type === "TRAINING_PLAN" ? "Training Plan" : "Coaching"}</span>
                  {!p.isActive && <span className="text-xs text-red-400">Inactive</span>}
                </div>
                <p className="text-sm text-[var(--text-muted)] mt-1">{(p.price / 100).toFixed(0)} {p.currency} · {p._count.orders} orders · {p._count.entitlements} active</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggle(p.id, p.isActive)} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  {p.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <Link href={`/admin/products/${p.id}`} className="p-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"><Edit2 size={15} /></Link>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
