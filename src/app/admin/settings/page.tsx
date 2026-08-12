"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, Phone, DollarSign, Palette, Globe, RefreshCw } from "lucide-react";

type Setting = { key: string; value: string };

const SETTING_SECTIONS = [
  {
    label: "Contact & WhatsApp",
    icon: Phone,
    items: [
      { key: "whatsapp_number", label: "WhatsApp Number", hint: "+34610354255" },
      { key: "whatsapp_message_en", label: "WA Pre-fill Message (EN)", hint: "Hi Coach, I want to join..." },
      { key: "whatsapp_message_ar", label: "WA Pre-fill Message (AR)", hint: "مرحباً كوتش..." },
    ],
  },
  {
    label: "Pricing & Currency",
    icon: DollarSign,
    items: [
      { key: "currency", label: "Currency Symbol", hint: "EGP / $" },
      { key: "training_plan_price", label: "Training Plan Price (EGP)", hint: "399" },
      { key: "coaching_price", label: "Personal Coaching Price (EGP)", hint: "1399" },
      { key: "coaching_renewal_price", label: "Renewal Price (EGP)", hint: "999" },
    ],
  },
  {
    label: "Platform Identity",
    icon: Palette,
    items: [
      { key: "site_name", label: "Brand Name", hint: "Coach Amar" },
      { key: "support_email", label: "Support Email", hint: "support@coachair.com" },
    ],
  },
];

export default function AdminSettingsPage() {
  const [data, setData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      const items = json.settings || [];
      const map: Record<string, string> = {};
      for (const s of items) {
        map[s.key] = s.value;
      }
      setData(map);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const save = async (key: string, value: string) => {
    setSaving(key);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    setSaving(null);
    setMsg({ text: res.ok ? "Saved ✓" : "Error saving", ok: res.ok });
    setTimeout(() => setMsg(null), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Settings</h1>
          <p className="text-[var(--text-muted)] text-sm">Platform parameters, contact numbers, and pricing</p>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className={`text-sm font-semibold ${msg.ok ? "text-emerald-400" : "text-red-400"}`}>{msg.text}</span>}
          <button onClick={fetchSettings} className="px-3 py-1.5 border border-[var(--border)] rounded-sm text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1.5">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass border border-[var(--border)] rounded-sm h-36 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {SETTING_SECTIONS.map(({ label, icon: Icon, items }) => (
            <div key={label} className="glass border border-[var(--border)] rounded-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                <div className="w-7 h-7 bg-[var(--accent-glow)] border border-[var(--border-accent)] rounded-sm flex items-center justify-center">
                  <Icon size={14} className="text-[var(--accent)]" />
                </div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">{label}</h2>
              </div>

              <div className="p-5 space-y-4">
                {items.map(({ key, label: itemLabel, hint }) => {
                  const isSaving = saving === key;
                  const val = data[key] ?? "";

                  return (
                    <div key={key} className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">{itemLabel}</label>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => setData((prev) => ({ ...prev, [key]: e.target.value }))}
                          placeholder={hint}
                          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                        />
                      </div>
                      <button
                        onClick={() => save(key, data[key] ?? "")}
                        disabled={isSaving}
                        className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
                      >
                        <Save size={12} /> {isSaving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
