"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Save,
  RefreshCw,
  CreditCard,
  MessageSquare,
  Share2,
  FileText,
  Upload,
  QrCode,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { adminTranslations } from "@/lib/admin-translations";

type MediaAsset = { id: string; originalName: string; size: number; createdAt: string };

function TeldaQrSection({ isArabic }: { isArabic: boolean }) {
  const [qrUrl, setQrUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const settingsRes = await fetch("/api/admin/settings").then(r => r.json()).catch(() => null);
    const url = (settingsRes?.settings || []).find((s: { key: string }) => s.key === "telda_qr_url")?.value || "";
    setQrUrl(url);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      // Reuses the same public-upload path the Site Editor uses for homepage
      // images — a payment QR needs to be visible to logged-out checkout
      // visitors, unlike the protected media library.
      const uploadRes = await fetch("/api/admin/cms/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) throw new Error();

      const settingRes = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "telda_qr_url", value: uploadData.url }),
      });
      if (!settingRes.ok) throw new Error();

      setQrUrl(uploadData.url);
      setMsg({ text: isArabic ? "تم تحديث صورة الـQR" : "QR image updated", ok: true });
    } catch {
      setMsg({ text: isArabic ? "فشل رفع الصورة" : "Upload failed", ok: false });
    }
    setUploading(false);
    setTimeout(() => setMsg(null), 3000);
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)]">
          <QrCode size={16} />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
            {isArabic ? "صورة QR لتيلدا" : "Telda QR Code"}
          </h3>
          <p className="text-[11px] text-[var(--text-muted)]">
            {isArabic ? "الصورة اللي بيشوفها العميل ويمسحها عند اختيار الدفع بتيلدا" : "Shown to customers when they choose Telda at checkout"}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {qrUrl ? (
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="Telda QR" className="w-28 h-28 object-contain bg-white rounded-[var(--radius-md)] border border-[var(--border)]" />
            <p className="text-xs text-[var(--text-muted)]">
              {isArabic ? "الصورة الحالية — ارفع صورة تانية لاستبدالها" : "Current image — upload another to replace it"}
            </p>
          </div>
        ) : (
          <p className="text-xs text-[var(--text-muted)]">
            {isArabic ? "لسه مفيش صورة QR مرفوعة — خطوة الدفع بتيلدا هتعرض الاسم بس." : "No QR uploaded yet — the Telda checkout step will show only the handle."}
          </p>
        )}
        {msg && <p className={`text-xs font-bold ${msg.ok ? "text-emerald-400" : "text-red-400"}`}>{msg.text}</p>}

        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-[var(--bg-base)] border border-[var(--border)] hover:border-[var(--border-accent)] text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent)] rounded-[var(--radius-lg)] transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Upload size={14} />
          <span>{uploading ? (isArabic ? "جاري الرفع..." : "Uploading…") : (isArabic ? "رفع صورة QR" : "Upload QR Image")}</span>
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e.target.files)} />
      </div>
    </div>
  );
}

function SplitPdfSection({ isArabic }: { isArabic: boolean }) {
  const [activeId, setActiveId] = useState<string>("");
  const [asset, setAsset] = useState<MediaAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const settingsRes = await fetch("/api/admin/settings").then(r => r.json()).catch(() => null);
    const id = (settingsRes?.settings || []).find((s: { key: string }) => s.key === "active_split_media_id")?.value || "";
    setActiveId(id);
    if (id) {
      const mediaRes = await fetch("/api/admin/media").then(r => r.json()).catch(() => null);
      const found = (mediaRes?.assets || []).find((a: MediaAsset) => a.id === id);
      setAsset(found || null);
    } else {
      setAsset(null);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setMsg({ text: isArabic ? "الملف لازم يكون PDF" : "File must be a PDF", ok: false });
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("isProtected", "true");
      const uploadRes = await fetch("/api/admin/media", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.asset?.id) throw new Error();

      const settingRes = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "active_split_media_id", value: uploadData.asset.id }),
      });
      if (!settingRes.ok) throw new Error();

      setMsg({ text: isArabic ? "تم تحديث الملف بنجاح" : "File updated successfully", ok: true });
      await load();
    } catch {
      setMsg({ text: isArabic ? "فشل رفع الملف" : "Upload failed", ok: false });
    }
    setUploading(false);
    setTimeout(() => setMsg(null), 3000);
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)]">
          <FileText size={16} />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
            {isArabic ? "ملف خطة التدريب (PDF)" : "Training Plan File (PDF)"}
          </h3>
          <p className="text-[11px] text-[var(--text-muted)]">
            {isArabic ? "الملف اللي بيشوفه العميل في لوحة التحكم" : "The file customers see in their portal"}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="text-xs text-[var(--text-muted)]">
          {activeId && asset ? (
            <p>
              {isArabic ? "الملف الحالي: " : "Current file: "}
              <span className="text-[var(--text-primary)] font-semibold">{asset.originalName}</span>
              {" "}({(asset.size / 1024 / 1024).toFixed(1)} MB)
            </p>
          ) : (
            <p>{isArabic ? "لسه مفيش ملف مرفوع — الموقع بيستخدم الملف الأساسي الحالي." : "No file uploaded yet — the site is using the original default file."}</p>
          )}
          {msg && (
            <p className={`mt-2 font-bold ${msg.ok ? "text-emerald-400" : "text-red-400"}`}>{msg.text}</p>
          )}
        </div>

        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-[var(--bg-base)] border border-[var(--border)] hover:border-[var(--border-accent)] text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent)] rounded-[var(--radius-lg)] transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Upload size={14} />
          <span>{uploading ? (isArabic ? "جاري الرفع..." : "Uploading…") : (isArabic ? "رفع ملف جديد" : "Upload New File")}</span>
        </button>
        <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={e => handleUpload(e.target.files)} />
      </div>
    </div>
  );
}

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
          label: isArabic ? "رقم انستاباي (InstaPay)" : "InstaPay Number",
          hint: "e.g. 01108610434",
          defaultValue: "01108610434",
        },
        {
          key: "paypal_link",
          label: isArabic ? "رابط باي بال (PayPal.Me)" : "PayPal Payment Link",
          hint: "e.g. https://www.paypal.me/yourname",
          defaultValue: "https://www.paypal.me/amarel7ewety111",
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
          hint: "THE AMAR",
          defaultValue: "THE AMAR",
        },
        {
          key: "instagram_url",
          label: isArabic ? "رابط حساب انستجرام" : "Instagram Profile URL",
          hint: "https://instagram.com/amar.fitness",
          defaultValue: "https://instagram.com/amar.fitness",
        },
        {
          key: "youtube_url",
          label: isArabic ? "رابط قناة يوتيوب" : "YouTube Channel URL",
          hint: "https://youtube.com/@amar.el.7ewety?si=crwo5B3iAO_C1ufW",
          defaultValue: "https://youtube.com/@amar.el.7ewety?si=crwo5B3iAO_C1ufW",
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
              className={`text-xs font-bold px-2.5 py-1 rounded-[var(--radius-sm)] border ${
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
            className="px-3 py-1.5 border border-[var(--border)] bg-[var(--bg-card)] rounded-[var(--radius-md)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} /> {isArabic ? "تحديث" : "Refresh"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <SplitPdfSection isArabic={isArabic} />
          <TeldaQrSection isArabic={isArabic} />
          {SETTING_SECTIONS.map(({ label, icon: Icon, description, items }) => (
            <div
              key={label}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden"
            >
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)]">
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
                          className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-accent)]"
                        />

                        <button
                          onClick={() => saveSetting(key, currentValue)}
                          disabled={isSaving}
                          className="px-3.5 py-2 bg-[var(--bg-base)] border border-[var(--border)] hover:border-[var(--border-accent)] text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent)] rounded-[var(--radius-lg)] transition-colors flex items-center gap-1 shrink-0 disabled:opacity-50 cursor-pointer"
                        >
                          <Save size={14} />
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
