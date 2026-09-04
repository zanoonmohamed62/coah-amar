"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Eye,
  EyeOff,
  ShoppingBag,
  Sparkles,
  DollarSign,
  X,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { adminTranslations } from "@/lib/admin-translations";

// Prisma returns `features` as a Json column, which arrives over the wire as
// either a real array or a JSON-encoded string depending on how it was written.
// Treating a string as "no features" silently wiped them on every product save.
function parseFeatures(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((f): f is string => typeof f === "string");
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((f): f is string => typeof f === "string");
    } catch { /* fall through */ }
  }
  return [];
}

type Product = {
  id: string;
  name: string;
  slug: string;
  type: "TRAINING_PLAN" | "PERSONAL_COACHING";
  price: number;
  currency: string;
  description: string | null;
  features: string[] | string | null;
  isActive: boolean;
  originalPrice: number;
  discountPercent: number;
  promoCounterBase: number;
  promoCounterLimit: number;
  _count: { orders: number; entitlements: number };
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { lang, isArabic } = useLanguage();
  const t = adminTranslations[lang].products;
  const tCommon = adminTranslations[lang].common;

  const [form, setForm] = useState({
    name: "",
    slug: "",
    type: "TRAINING_PLAN",
    price: 499,
    currency: "EGP",
    description: "",
    features: "",
    originalPrice: 499,
    discountPercent: 0,
    promoCounterBase: 0,
    promoCounterLimit: 100,
  });

  const [saving, setSaving] = useState(false);

  // Mirrors the rounding in GET /api/products so the admin preview and the
  // public price can't disagree.
  const previewPrice = form.discountPercent > 0
    ? Math.round(form.originalPrice * (1 - form.discountPercent / 100))
    : form.originalPrice;

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
      price: 499,
      currency: "EGP",
      description: "",
      features: isArabic
        ? "جدول تدريب كامل 12 أسبوع\nشرح تكنيك التمارين والبدائل\nنظام تتبع الأوزان والزيادة التدريجية\nدخول دائم للبوابة"
        : "Complete 12-Week Split Breakdown\nExercise Execution & Technique Guidance\nProgressive Overload Tracking\nLifetime Dashboard Access",
      originalPrice: 499,
      discountPercent: 0,
      promoCounterBase: 0,
      promoCounterLimit: 100,
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
      features: parseFeatures(p.features).join("\n"),
      originalPrice: Math.round((p.originalPrice || p.price) / 100),
      discountPercent: p.discountPercent || 0,
      promoCounterBase: p.promoCounterBase || 0,
      promoCounterLimit: p.promoCounterLimit || 100,
    });
    setShowModal(true);
  };

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.slug) return;
    setSaving(true);

    const originalPricePiastres = Math.round(form.originalPrice * 100);
    const livePrice = form.discountPercent > 0
      ? Math.round((originalPricePiastres * (1 - form.discountPercent / 100)) / 100) * 100
      : originalPricePiastres;

    const payload = {
      ...form,
      price: livePrice,
      originalPrice: originalPricePiastres,
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
          <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{t.title}</h2>
          <p className="text-xs text-[var(--text-muted)]">{t.subtitle}</p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black text-xs font-black rounded-sm transition-colors cursor-pointer shadow-sm"
        >
          <Plus size={14} /> {t.addBtn}
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-64 bg-[var(--bg-card)] border border-[var(--border)] rounded-sm animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((p) => {
            const features = parseFeatures(p.features);

            return (
              <div
                key={p.id}
                className={`bg-[var(--bg-card)] border rounded-sm p-6 flex flex-col justify-between transition-all ${
                  p.isActive ? "border-[var(--border)] hover:border-[var(--border-accent)]" : "border-zinc-800 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-sm border ${
                        p.type === "TRAINING_PLAN"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                      }`}
                    >
                      {p.type === "TRAINING_PLAN" ? t.trainingPlanType : t.coachingType}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(p.id, p.isActive)}
                        className={`p-1.5 rounded-sm border transition-colors ${
                          p.isActive
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                        }`}
                        title={p.isActive ? "Deactivate Offer" : "Activate Offer"}
                      >
                        {p.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>

                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-sm border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-accent)] transition-colors"
                        title={t.editBtn}
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-[var(--text-primary)] tracking-tight mb-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mb-4">{p.description || "—"}</p>

                  <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm mb-4">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-0.5">
                      {t.priceLabel}
                    </span>
                    <p className="text-2xl font-black text-[var(--accent)] tracking-tight">
                      {(p.price / 100).toLocaleString()}{" "}
                      <span className="text-sm font-bold text-[var(--text-secondary)]">{p.currency}</span>
                    </p>
                    {p.discountPercent > 0 && p.originalPrice > p.price && (
                      <p className="text-[11px] text-[var(--text-muted)] mt-1">
                        {isArabic ? "بدلاً من" : "was"}{" "}
                        <span className="line-through">{(p.originalPrice / 100).toLocaleString()} {p.currency}</span>
                        {" · "}
                        {isArabic
                          ? `العداد: ${p.promoCounterBase}/${p.promoCounterLimit}`
                          : `counter: ${p.promoCounterBase}/${p.promoCounterLimit}`}
                      </p>
                    )}
                  </div>

                  {features.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block">
                        {t.featuresTitle}
                      </span>
                      <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                        {features.map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 size={12} className="text-[var(--accent)] shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-5 border-t border-[var(--border)] mt-6 flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>
                    <strong>{p._count?.orders || 0}</strong> {isArabic ? "طلب مؤكد" : "orders"}
                  </span>
                  <span>
                    <strong>{p._count?.entitlements || 0}</strong> {isArabic ? "مشترك نشط" : "active athletes"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-sm w-full max-w-lg shadow-2xl">
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-elevated)]">
              <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles size={15} className="text-[var(--accent)]" />{" "}
                {editingId ? t.editBtn : t.addBtn}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                  {isArabic ? "اسم الباقة / الخطة" : "Product / Plan Name"}
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => {
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                      slug: editingId ? f.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                    }));
                  }}
                  placeholder="e.g. Training Split"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                    {isArabic ? "نوع الباقة" : "Product Type"}
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                  >
                    <option value="TRAINING_PLAN">{t.trainingPlanType}</option>
                    <option value="PERSONAL_COACHING">{t.coachingType}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                    {isArabic ? "السعر الأصلي (قبل الخصم)" : "Original Price (before discount)"}
                  </label>
                  <input
                    required
                    type="number"
                    value={form.originalPrice}
                    onChange={(e) => setForm((f) => ({ ...f, originalPrice: Number(e.target.value), price: Number(e.target.value) }))}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)] font-bold"
                  />
                </div>
              </div>

              <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block">
                  {isArabic ? "عرض الإطلاق (خصم أول مشتركين)" : "Launch Promo (early-buyer discount)"}
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-[var(--text-muted)] block mb-1">
                      {isArabic ? "نسبة الخصم %" : "Discount %"}
                    </label>
                    <input
                      type="number" min={0} max={100}
                      value={form.discountPercent}
                      onChange={(e) => setForm((f) => ({ ...f, discountPercent: Number(e.target.value) }))}
                      className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[var(--text-muted)] block mb-1">
                      {isArabic ? "بداية العداد" : "Counter Starts At"}
                    </label>
                    <input
                      type="number" min={0}
                      value={form.promoCounterBase}
                      onChange={(e) => setForm((f) => ({ ...f, promoCounterBase: Number(e.target.value) }))}
                      className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[var(--text-muted)] block mb-1">
                      {isArabic ? "الحد الأقصى" : "Ends At"}
                    </label>
                    <input
                      type="number" min={1}
                      value={form.promoCounterLimit}
                      onChange={(e) => setForm((f) => ({ ...f, promoCounterLimit: Number(e.target.value) }))}
                      className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  {isArabic
                    ? `السعر الحالي المعروض للعملاء: ${previewPrice} ${form.currency}. الخصم بيتوقف تلقائيًا لما العداد يوصل للحد الأقصى.`
                    : `Live price shown to customers right now: ${previewPrice} ${form.currency}. The discount turns off automatically once the counter reaches the limit.`}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                  {isArabic ? "الوصف المختصر" : "Short Description"}
                </label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief summary of the offer..."
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                  {t.featuresTitle} {isArabic ? "(ميزة واحدة بكل سطر)" : "(One per line)"}
                </label>
                <textarea
                  rows={4}
                  value={form.features}
                  onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)] resize-y"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black font-black text-xs rounded-sm transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving…" : t.saveChanges}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-[var(--border)] text-xs font-bold rounded-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                >
                  {tCommon.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
