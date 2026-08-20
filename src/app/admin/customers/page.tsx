"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Plus,
  MessageSquare,
  User,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  Dumbbell,
  X,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";

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
            { key: "all", label: `All Athletes (${customers.length})` },
            { key: "active", label: "Active Access" },
            { key: "inactive", label: "No Active Plan" },
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

        {/* Search & Add Athlete */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search athlete, email, phone..."
              className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-sm pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-accent)]"
            />
          </div>

          <button
            onClick={() => {
              setShowAddModal(true);
              setCreatedInfo(null);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black text-xs font-black rounded-sm transition-colors"
          >
            <Plus size={14} /> Add Athlete
          </button>
        </div>
      </div>

      {/* Athletes Directory Table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-elevated)] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] font-bold">
              <tr>
                <th className="px-6 py-3.5">Athlete</th>
                <th className="px-6 py-3.5">Active Program / Split</th>
                <th className="px-6 py-3.5">Access Status</th>
                <th className="px-6 py-3.5">Latest Order</th>
                <th className="px-6 py-3.5">Joined Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-[var(--bg-elevated)] rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-muted)]">
                    <p className="text-sm font-semibold">No athletes found</p>
                    <p className="text-xs mt-1">Try adjusting your search query or add a new athlete.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const activeEnt = c.entitlements[0];
                  const lastOrder = c.orders[0];

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-[var(--bg-elevated)] transition-colors group"
                    >
                      <td className="px-6 py-3.5">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="font-bold text-[var(--text-primary)] hover:text-[var(--accent)] flex items-center gap-2"
                        >
                          <div className="w-7 h-7 rounded-sm bg-[var(--accent)]/10 text-[var(--accent)] font-bold text-[11px] flex items-center justify-center">
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{c.name}</span>
                        </Link>
                        <p className="text-[11px] text-[var(--text-muted)] pl-9">{c.email}</p>
                        {c.phone && (
                          <p className="text-[10px] text-[var(--text-muted)] font-mono pl-9">{c.phone}</p>
                        )}
                      </td>

                      <td className="px-6 py-3.5">
                        {activeEnt ? (
                          <div>
                            <span className="font-bold text-[var(--text-primary)]">
                              {activeEnt.product.name}
                            </span>
                            <span className="block text-[10px] text-[var(--text-muted)]">
                              {activeEnt.expiresAt
                                ? `Expires ${new Date(activeEnt.expiresAt).toLocaleDateString()}`
                                : "Lifetime Access"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[var(--text-muted)] italic">None assigned</span>
                        )}
                      </td>

                      <td className="px-6 py-3.5">
                        {activeEnt ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px]">
                            <CheckCircle2 size={11} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[var(--text-muted)] bg-zinc-500/10 border border-zinc-500/30 px-2 py-0.5 rounded-full text-[10px]">
                            <XCircle size={11} /> No Access
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-3.5">
                        {lastOrder ? (
                          <div>
                            <span className="font-medium text-[var(--text-primary)]">
                              {lastOrder.product.name}
                            </span>
                            <span className="block font-mono text-[10px] text-[var(--text-muted)]">
                              {lastOrder.orderRef}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[var(--text-muted)]">—</span>
                        )}
                      </td>

                      <td className="px-6 py-3.5 text-[var(--text-muted)]">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {c.phone && (
                            <button
                              onClick={() => openWhatsApp(c.phone!, c.name)}
                              className="p-1.5 rounded-sm text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare size={15} />
                            </button>
                          )}

                          <Link
                            href={`/admin/customers/${c.id}`}
                            className="p-1.5 rounded-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] transition-colors flex items-center gap-1 text-xs font-semibold"
                          >
                            <span>Profile</span>
                            <ChevronRight size={14} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Athlete Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-accent)] rounded-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[var(--text-primary)]">Onboard New Athlete</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={18} />
              </button>
            </div>

            {createdInfo ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-sm space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 size={16} /> Athlete Onboarded Successfully!
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Provide these credentials to the client for login access:
                </p>
                <div className="p-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-sm text-xs space-y-1 font-mono">
                  <p>
                    <span className="text-[var(--text-muted)]">Email:</span> {createdInfo.email}
                  </p>
                  <p>
                    <span className="text-[var(--text-muted)]">Password:</span> {createdInfo.pass}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Coach Amar Portal Login:\nEmail: ${createdInfo.email}\nPassword: ${createdInfo.pass}\nURL: https://coah-amar.vercel.app/login`
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="w-full py-2 bg-emerald-500 text-black text-xs font-black rounded-sm flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied to Clipboard!" : "Copy Login Credentials"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
                <div>
                  <label className="text-[var(--text-muted)] block mb-1 font-semibold">Full Name *</label>
                  <input
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Mohamed Ali"
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                  />
                </div>

                <div>
                  <label className="text-[var(--text-muted)] block mb-1 font-semibold">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                  />
                </div>

                <div>
                  <label className="text-[var(--text-muted)] block mb-1 font-semibold">Phone / WhatsApp</label>
                  <input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+20 100 000 0000"
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                  />
                </div>

                <div>
                  <label className="text-[var(--text-muted)] block mb-1 font-semibold">Initial Program / Access</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                  >
                    <option value="">No initial program (grant later)</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.type === "TRAINING_PLAN" ? "Training Split" : "Coaching"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black text-xs font-black rounded-sm transition-colors disabled:opacity-50"
                  >
                    {creating ? "Creating…" : "Create & Grant Access"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-sm"
                  >
                    Cancel
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
