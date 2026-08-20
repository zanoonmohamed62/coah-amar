"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Eye,
  EyeOff,
  Package,
  ShoppingBag,
  Dumbbell,
  Sparkles,
  DollarSign,
  X,
  CheckCircle2,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  slug: string;
  type: "TRAINING_PLAN" | "PERSONAL_COACHING";
  price: number;
  currency: string;
  description: string | null;
  features: string[] | null;
  isActive: boolean;
  _count: { orders: number; entitlements: number };
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    type: "TRAINING_PLAN",
    price: 399,
    currency: "EGP",
    description: "",
    features: "",
  });

  const [saving, setSaving] = useState(false);

  const fetchProducts = () => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openNewModal = () => {
    setEditingId(null);
    setForm({
      name: "",
      slug: "",
      type: "TRAINING_PLAN",
      price: 399,
      currency: "EGP",
      description: "",
      features: "Complete 12-Week Split Breakdown\nExercise Execution & Technique Guidance\nProgressive Overload Tracking\nLifetime Dashboard Access",
    });
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      slug: p.slug,
      type: p.type,
      price: Math.round(p.price / 100),
      currency: p.currency,
      description: p.description || "",
      features: Array.isArray(p.features) ? p.features.join("\n") : "",
    });
    setShowModal(true);
  };

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.slug) return;
    setSaving(true);

    const payload = {
      ...form,
      price: Math.round(form.price * 100),
      features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        await fetch(`/api/admin/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      fetchProducts();
    } catch {}
    setSaving(false);
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchProducts();
    } catch {}
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--text-primary)]">Packages & Offerings</h2>
          <p className="text-xs text-[var(--text-muted)]">Configure training plans, personal coaching tiers, and pricing</p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black text-xs font-black rounded-sm transition-colors"
        >
          <Plus size={14} /> New Product
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-56 bg-[var(--bg-card)] border border-[var(--border)] rounded-sm animate-pulse" />
          ))
        ) : products.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-[var(--text-muted)]">
            <Package size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">No products found</p>
          </div>
        ) : (
          products.map((p) => {
            const isCoaching = p.type === "PERSONAL_COACHING";

            return (
              <div
                key={p.id}
                className={`bg-[var(--bg-card)] border rounded-sm p-6 flex flex-col justify-between transition-all ${
                  p.isActive
                    ? "border-[var(--border)] hover:border-[var(--border-accent)]"
                    : "border-[var(--border)] opacity-60 bg-[var(--bg-base)]"
                }`}
              >
                <div>
                  {/* Plan Top Meta */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-[var(--text-primary)]">{p.name}</h3>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isCoaching
                              ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                              : "bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30"
                          }`}
                        >
                          {isCoaching ? "1-on-1 Coaching" : "Training Plan"}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">slug: /{p.slug}</span>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-black text-[var(--accent)]">
                        {(p.price / 100).toLocaleString()} {p.currency}
                      </p>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {isCoaching ? "per 3 months" : "one-time"}
                      </span>
                    </div>
                  </div>

                  {p.description && (
                    <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed line-clamp-2">
                      {p.description}
                    </p>
                  )}

                  {/* Feature Highlights */}
                  {Array.isArray(p.features) && p.features.length > 0 && (
                    <div className="space-y-1.5 mb-6 pt-3 border-t border-[var(--border)]">
                      {p.features.slice(0, 4).map((f, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                          <CheckCircle2 size={12} className="text-[var(--accent)] shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Metrics & Actions */}
                <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                    <span>
                      <strong className="text-[var(--text-primary)]">{p._count.orders}</strong> Sales
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-emerald-400">{p._count.entitlements}</strong> Active
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(p.id, p.isActive)}
                      className={`p-2 rounded-sm border transition-colors ${
                        p.isActive
                          ? "border-[var(--border)] text-[var(--text-muted)] hover:text-amber-400 hover:border-amber-400/30"
                          : "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                      }`}
                      title={p.isActive ? "Deactivate" : "Activate"}
                    >
                      {p.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>

                    <button
                      onClick={() => openEditModal(p)}
                      className="px-3 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--border-accent)] text-xs font-bold text-[var(--text-primary)] rounded-sm flex items-center gap-1.5 transition-colors"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-accent)] rounded-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                {editingId ? "Edit Product" : "Create New Product"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[var(--text-muted)] block mb-1 font-semibold">Product Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. THE AMMAR 'X SPLIT'"
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                  />
                </div>

                <div>
                  <label className="text-[var(--text-muted)] block mb-1 font-semibold">URL Slug *</label>
                  <input
                    required
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="e.g. x-split"
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[var(--text-muted)] block mb-1 font-semibold">Product Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="TRAINING_PLAN">Training Plan (Lifetime)</option>
                    <option value="PERSONAL_COACHING">Personal Coaching (3 Months)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[var(--text-muted)] block mb-1 font-semibold">Price (EGP) *</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: +e.target.value }))}
                    placeholder="399"
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[var(--text-muted)] block mb-1 font-semibold">Short Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Summary of what the client gets..."
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-[var(--text-primary)] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-[var(--text-muted)] block mb-1 font-semibold">
                  Features Bullets (One per line)
                </label>
                <textarea
                  rows={4}
                  value={form.features}
                  onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                  placeholder="Bullet feature 1&#10;Bullet feature 2&#10;Bullet feature 3"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-[var(--text-primary)] focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black text-xs font-black rounded-sm transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving…" : editingId ? "Update Product" : "Create Product"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
