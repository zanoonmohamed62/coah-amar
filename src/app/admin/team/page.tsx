"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, ShieldCheck, X, UserMinus, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

type Admin = { id: string; name: string; email: string; createdAt: string };

export default function TeamPage() {
  const { isArabic } = useLanguage();
  const { data: session } = useSession();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchAdmins = () => {
    setLoading(true);
    fetch("/api/admin/team")
      .then((r) => r.json())
      .then((d) => setAdmins(d.admins || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAdmins(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setShowModal(false);
      setEmail("");
      fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add admin");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm(isArabic ? "متأكد إنك عايز تشيل صلاحية الأدمن ده؟" : "Remove this admin's access?")) return;
    setRemovingId(id);
    try {
      const res = await fetch(`/api/admin/team/${id}`, { method: "PUT" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to remove admin");
        return;
      }
      fetchAdmins();
    } finally {
      setRemovingId(null);
    }
  }

  const currentUserId = (session?.user as { id?: string } | undefined)?.id;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
            {isArabic ? "إدارة الأدمن" : "Manage Admins"}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            {isArabic
              ? "أي إيميل هنا هيدخل مباشرة كأدمن أول ما يسجل دخول بالجيميل — مفيش حاجة إضافية مطلوبة."
              : "Anyone listed here gets full admin access the moment they sign in with that Google email — nothing else needed."}
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(""); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black text-xs font-black rounded-[var(--radius-lg)] transition-colors shadow-[var(--shadow-button)]"
        >
          <Plus size={14} /> {isArabic ? "إضافة أدمن" : "Add Admin"}
        </button>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[var(--bg-elevated)] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] font-bold">
              <tr>
                <th className="px-5 py-3.5">{isArabic ? "الاسم" : "Name"}</th>
                <th className="px-5 py-3.5">{isArabic ? "الإيميل" : "Email"}</th>
                <th className="px-5 py-3.5">{isArabic ? "تاريخ الإضافة" : "Added"}</th>
                <th className="px-5 py-3.5 text-end">{isArabic ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-5 py-4">
                      <div className="h-4 bg-[var(--bg-elevated)] rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : (
                admins.map((a) => {
                  const isSelf = a.id === currentUserId;
                  return (
                    <tr key={a.id} className="hover:bg-[var(--bg-elevated)] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                            <ShieldCheck size={14} />
                          </div>
                          <span className="font-bold text-[var(--text-primary)]">
                            {a.name}
                            {isSelf && (
                              <span className="ml-2 text-[10px] font-bold text-[var(--accent)]">
                                {isArabic ? "(إنت)" : "(you)"}
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[var(--text-primary)] font-medium">{a.email}</td>
                      <td className="px-5 py-3.5 text-[var(--text-muted)]">
                        {new Date(a.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5 text-end">
                        {!isSelf && (
                          <button
                            onClick={() => handleRemove(a.id)}
                            disabled={removingId === a.id}
                            className="p-1.5 rounded-[var(--radius-sm)] border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            title={isArabic ? "إزالة صلاحية الأدمن" : "Remove admin access"}
                          >
                            <UserMinus size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] w-full max-w-md shadow-[var(--shadow-card)]">
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-elevated)]">
              <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles size={16} className="text-[var(--accent)]" /> {isArabic ? "إضافة أدمن" : "Add Admin"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">
                  {isArabic ? "الإيميل (جيميل)" : "Email (Gmail)"}
                </label>
                <input
                  required
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                />
                {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black font-black text-xs rounded-[var(--radius-lg)] transition-colors disabled:opacity-50"
                >
                  {saving ? (isArabic ? "جاري الإضافة..." : "Adding…") : (isArabic ? "إضافة" : "Add")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-[var(--border)] text-xs font-bold rounded-[var(--radius-lg)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                >
                  {isArabic ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
