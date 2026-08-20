"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Save,
  RefreshCw,
  CreditCard,
  MessageSquare,
  Share2,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { adminTranslations } from "@/lib/admin-translations";

export default function AdminSettingsPage() {
  const [data, setData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const { lang, isArabic } = useLanguage();
  const t = adminTranslations[lang].settings;
  const tCommon = adminTranslations[lang].common;

  const SETTING_SECTIONS = [
    {
      label: isArabic ? "بيانات الدفع والتحويل المباشر" : "Payment Gateways & Direct Transfer",
      icon: CreditCard,
      description: isArabic ? "بيانات الحسابات المعروضة للعملاء عند الدفع" : "Account details shown to customers during checkout",
      items: [
        {
          key: "instapay_handle",
          label: isArabic ? "عنوان / معرف انستاباي (InstaPay IPA)" : "InstaPay Handle / Address",
          hint: "e.g. amar.fitness@instapay",
          defaultValue: "amar.fitness@instapay",
        },
        {
          key: "paypal_link",
          label: isArabic ? "رابط باي بال (PayPal.Me)" : "PayPal Payment Link",
          hint: "e.g. https://paypal.me/amarfitness",
          defaultValue: "https://paypal.me/amarfitness",
        },
        {
          key: "telda_handle",
          label: isArabic ? "حساب تيلدا (Telda Handle)" : "Telda Username",
          hint: "e.g. @amar.fitness",
          defaultValue: "@amar.fitness",
        },
      ],
    },
    {
      label: isArabic ? "واتساب وقنوات التواصل" : "WhatsApp & Customer Support",
      icon: MessageSquare,
      description: isArabic ? "رقم التواصل المباشر مع الكوتش والرسائل التلقائية" : "Automated pre-filled messages and direct coaching contact",
      items: [
        {
          key: "whatsapp_number",
          label: isArabic ? "رقم الواتساب الرسمي" : "WhatsApp Phone Number",
          hint: "e.g. +34610354255",
          defaultValue: "+34610354255",
        },
        {
          key: "whatsapp_message_en",
          label: isArabic ? "نص رسالة الواتساب التلقائية (بالإنجليزي)" : "WhatsApp Default Text (English)",
          hint: "Hi Coach Amar, I want to inquire about...",
          defaultValue: "Hi Coach Amar, I am interested in joining your program.",
        },
        {
          key: "whatsapp_message_ar",
          label: isArabic ? "نص رسالة الواتساب التلقائية (بالعربي)" : "WhatsApp Default Text (Arabic)",
          hint: "مرحباً كوتش عمار، أود الاستفسار عن...",
          defaultValue: "مرحباً كوتش عمار، أود الاستفسار عن برامج التدريب والمتابعة.",
        },
        {
          key: "support_email",
          label: isArabic ? "البريد الإلكتروني للدعم" : "Support Email",
          hint: "support@amarfitness.com",
          defaultValue: "support@amarfitness.com",
        },
      ],
    },
    {
      label: isArabic ? "هوية البراند والتواصل الاجتماعي" : "Brand & Socials",
      icon: Share2,
      description: isArabic ? "اسم الموقع وروابط حسابات السوشيال ميديا" : "Public identity and social media channels",
      items: [
        {
          key: "site_name",
          label: isArabic ? "اسم الموقع / الكوتش" : "Brand / Coach Name",
          hint: "THE AMMAR",
          defaultValue: "THE AMMAR",
        },
        {
          key: "instagram_url",
          label: isArabic ? "رابط حساب انستجرام" : "Instagram Profile URL",
          hint: "https://instagram.com/amar.fitness",
          defaultValue: "https://instagram.com/amar.fitness",
        },
      ],
    },
  ];

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

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSetting = async (key: string, value: string) => {
    setSavingKey(key);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      setMsg({ text: res.ok ? t.savedSuccess : "Failed to save", ok: res.ok });
    } catch {
      setMsg({ text: "Error saving setting", ok: false });
    }
    setSavingKey(null);
    setTimeout(() => setMsg(null), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--text-primary)]">{t.title}</h2>
          <p className="text-xs text-[var(--text-muted)]">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {msg && (
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-sm border ${
                msg.ok
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {msg.text}
            </span>
          )}
          <button
            onClick={fetchSettings}
            className="px-3 py-1.5 border border-[var(--border)] bg-[var(--bg-card)] rounded-sm text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw size={13} /> {isArabic ? "تحديث" : "Refresh"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 bg-[var(--bg-card)] border border-[var(--border)] rounded-sm animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {SETTING_SECTIONS.map(({ label, icon: Icon, description, items }) => (
            <div
              key={label}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-sm overflow-hidden"
            >
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                <div className="w-8 h-8 rounded-sm bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)]">
                  <Icon size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)]">{label}</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">{description}</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {items.map(({ key, label: fieldLabel, hint, defaultValue }) => {
                  const currentValue = data[key] ?? defaultValue;
                  const isSaving = savingKey === key;

                  return (
                    <div
                      key={key}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 first:pt-0 border-t border-[var(--border)] first:border-0"
                    >
                      <div className="sm:w-1/3">
                        <label className="text-xs font-bold text-[var(--text-primary)] block">
                          {fieldLabel}
                        </label>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">{key}</span>
                      </div>

                      <div className="flex-1 flex items-center gap-2">
                        <input
                          dir={key.includes("ar") ? "rtl" : "ltr"}
                          value={currentValue}
                          onChange={(e) =>
                            setData((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          placeholder={hint}
                          className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                        />

                        <button
                          onClick={() => saveSetting(key, currentValue)}
                          disabled={isSaving}
                          className="px-3.5 py-2 bg-[var(--bg-base)] border border-[var(--border)] hover:border-[var(--border-accent)] text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent)] rounded-sm transition-colors flex items-center gap-1 shrink-0 disabled:opacity-50 cursor-pointer"
                        >
                          <Save size={13} />
                          <span>{isSaving ? "Saving…" : isArabic ? "حفظ" : "Save"}</span>
                        </button>
                      </div>
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
