"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  MessageSquare,
  Sparkles,
  Dumbbell,
  X,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { adminTranslations } from "@/lib/admin-translations";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  orders: {
    id: string;
    orderRef: string;
    status: string;
    amount: number;
    confirmedAt: string | null;
    customerEmail: string;
    product: { name: string };
  }[];
  entitlements: {
    id: string;
    status: string;
    startDate: string;
    expiresAt: string | null;
    product: { name: string; type: string };
  }[];
};

type Product = {
  id: string;
  name: string;
  type: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [loading, setLoading] = useState(true);

  // New Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdInfo, setCreatedInfo] = useState<{ email: string; pass: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const { lang, isArabic } = useLanguage();
  const t = adminTranslations[lang].customers;
  const tCommon = adminTranslations[lang].common;

  const fetchCustomers = () => {
    setLoading(true);
    fetch(`/api/admin/customers?q=${encodeURIComponent(searchQuery)}`)
      .then((r) => r.json())
      .then((d) => {
        setCustomers(d.customers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {});
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    setCreating(true);

    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          phone: newPhone,
          productId: selectedProductId || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedInfo({ email: newEmail, pass: data.tempPassword });
        fetchCustomers();
      } else {
        alert(data.error || "Failed to create customer");
      }
    } catch {
      alert("An error occurred");
    }
    setCreating(false);
  };

  const filteredCustomers = customers.filter((c) => {
    if (filter === "active") return c.entitlements.length > 0;
    if (filter === "inactive") return c.entitlements.length === 0;
    return true;
  });

  const openWhatsApp = (phone: string, name: string) => {
    let clean = phone.replace(/[^0-9+]/g, "");
    if (!clean.startsWith("+") && clean.startsWith("0")) clean = "+2" + clean;
    const msg = encodeURIComponent(`Hi ${name}, welcome to Coach Amar training portal!`);
    window.open(`https://wa.me/${clean.replace("+", "")}?text=${msg}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Filter Pills */}
        <div className="flex gap-2">
          {[
            { key: "all", label: `${tCommon.all} (${customers.length})` },
            { key: "active", label: tCommon.active },
            { key: "inactive", label: tCommon.inactive },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm border transition-all ${
                filter === key
                  ? "bg-[var(--accent)] text-black border-[var(--accent)]"
                  : "bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search & Add Athlete Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className={`absolute ${isArabic ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-[var(--text-muted)]`} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-sm ${
                isArabic ? "pr-9 pl-3" : "pl-9 pr-3"
              } py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-accent)]`}
            />
          </div>

          <button
            onClick={() => {
              setCreatedInfo(null);
              setNewName("");
              setNewEmail("");
              setNewPhone("");
              setSelectedProductId("");
              setShowAddModal(true);
            }}
            className="px-3.5 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black font-black text-xs rounded-sm transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm cursor-pointer"
          >
            <Plus size={14} /> {t.addAthleteBtn}
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[var(--bg-elevated)] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] font-bold">
              <tr>
                <th className="px-5 py-3.5">{t.colAthlete}</th>
                <th className="px-5 py-3.5">{t.colContact}</th>
                <th className="px-5 py-3.5">{t.colEnrolledPlans}</th>
                <th className="px-5 py-3.5">{t.colJoinedDate}</th>
                <th className="px-5 py-3.5 text-end">{t.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-5 py-4">
                      <div className="h-4 bg-[var(--bg-elevated)] rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[var(--text-muted)]">
                    <p className="text-sm font-semibold">{t.noAthletes}</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-[var(--bg-elevated)] transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-sm bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold text-xs">
                          {cust.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--text-primary)]">{cust.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)] font-mono">{cust.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-[var(--text-primary)] font-medium">{cust.email}</p>
                      {cust.phone && <p className="text-[11px] text-[var(--text-muted)] font-mono">{cust.phone}</p>}
                      {(() => {
                        const mismatched = [...new Set(
                          cust.orders
                            .map((o) => o.customerEmail?.toLowerCase())
                            .filter((e) => e && e !== cust.email.toLowerCase())
                        )];
                        if (mismatched.length === 0) return null;
                        return (
                          <p
                            className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-400"
                            title={isArabic
                              ? `الطلب اتعمل بإيميل مختلف: ${mismatched.join(", ")}`
                              : `Order was placed with a different email: ${mismatched.join(", ")}`}
                          >
                            <AlertTriangle size={10} />
                            {isArabic ? "إيميل الطلب مختلف" : "Order email mismatch"}
                          </p>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-3.5">
                      {cust.entitlements.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {cust.entitlements.map((e) => (
                            <span
                              key={e.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                            >
                              <Dumbbell size={10} /> {e.product.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-muted)]">
                      {new Date(cust.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-end">
                      <div className="flex items-center justify-end gap-2">
                        {cust.phone && (
                          <button
                            onClick={() => openWhatsApp(cust.phone!, cust.name)}
                            className="p-1.5 rounded-sm border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                            title="WhatsApp"
                          >
                            <MessageSquare size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-sm w-full max-w-md shadow-2xl">
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-elevated)]">
              <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles size={15} className="text-[var(--accent)]" /> {t.modalTitle}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={16} />
              </button>
            </div>

            {createdInfo ? (
              <div className="p-6 space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-sm space-y-2">
                  <p className="text-xs font-bold text-emerald-400">Athlete account created successfully!</p>
                  <p className="text-xs text-[var(--text-secondary)]">Provide the credentials below to the athlete:</p>
                  <div className="p-2.5 bg-[var(--bg-base)] border border-[var(--border)] rounded font-mono text-xs space-y-1">
                    <p className="text-[var(--text-primary)]">Email: <strong>{createdInfo.email}</strong></p>
                    <p className="text-[var(--text-primary)]">Password: <strong>{createdInfo.pass}</strong></p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`Email: ${createdInfo.email}\nPassword: ${createdInfo.pass}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex-1 py-2 bg-[var(--accent)] text-black font-bold text-xs rounded-sm flex items-center justify-center gap-1.5"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy Credentials"}
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-[var(--border)] text-xs font-bold rounded-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                  >
                    {tCommon.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">{t.nameLabel}</label>
                  <input
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Mostafa Ali"
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">{t.emailLabel}</label>
                  <input
                    required
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="athlete@example.com"
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">{t.phoneLabel}</label>
                  <input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+20 100 000 0000"
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">{t.planLabel}</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                  >
                    <option value="">-- No plan assigned --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black font-black text-xs rounded-sm transition-colors disabled:opacity-50"
                  >
                    {creating ? "Creating…" : t.createBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-[var(--border)] text-xs font-bold rounded-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                  >
                    {t.cancelBtn}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
