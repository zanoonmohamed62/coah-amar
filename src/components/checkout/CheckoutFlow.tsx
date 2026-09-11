"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy, Loader2, ExternalLink, AlertTriangle, Image as ImageIcon, Upload, ShieldCheck, ChevronRight, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/use-settings";
import { toErrorMessage } from "@/lib/error-message";
import { RealisticWhatsAppIcon, RealisticShieldIcon, RealisticDocumentIcon, RealisticCreditCardIcon } from "@/components/client/PwaIcons";

// The checkout engine shared by both packages.
//
// Two things it is built around:
//
// 1. No order exists until the customer has uploaded their transfer and pressed
//    Confirm. Clicking "Get the Split" used to create one immediately, so the
//    admin queue filled with people who were only looking.
//
// 2. A refresh must cost nothing. Every keystroke, the chosen payment method,
//    the step they are on and the uploaded screenshot are mirrored into
//    localStorage under a per-product key, and restored on mount — so reloading
//    mid-payment (or coming back an hour later) drops the customer exactly where
//    they were instead of at an empty form.

export type ExtraField = {
  name: "goal" | "level" | "notes";
  label: { en: string; ar: string };
  placeholder?: { en: string; ar: string };
  type?: "text" | "textarea" | "select";
  options?: { value: string; label: { en: string; ar: string } }[];
  required?: boolean;
};

type Method = "instapay" | "paypal" | "telda";
type Step = "details" | "pay" | "done";

type Saved = {
  form: Record<string, string>;
  method: Method;
  step: Step;
  proof: { assetId: string; claimToken: string; name: string } | null;
  orderRef?: string;
  accessToken?: string;
};

const EMPTY: Saved = {
  form: { name: "", email: "", phone: "", goal: "", level: "", notes: "" },
  method: "instapay",
  step: "details",
  proof: null,
};

function loadSaved(key: string): Saved {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return EMPTY;
    const v = JSON.parse(raw) as Partial<Saved>;
    return {
      form: { ...EMPTY.form, ...(v.form ?? {}) },
      method: (["instapay", "paypal", "telda"] as Method[]).includes(v.method as Method) ? (v.method as Method) : "instapay",
      step: (["details", "pay", "done"] as Step[]).includes(v.step as Step) ? (v.step as Step) : "details",
      proof: v.proof && typeof v.proof.assetId === "string" ? v.proof : null,
      orderRef: typeof v.orderRef === "string" ? v.orderRef : undefined,
      accessToken: typeof v.accessToken === "string" ? v.accessToken : undefined,
    };
  } catch {
    return EMPTY;
  }
}

interface Props {
  /** Product slugs to try, in order, against GET /api/products. */
  slugs: string[];
  /** Storage key suffix — keeps the two packages' drafts apart. */
  draftKey: string;
  productLabel: { en: string; ar: string };
  extraFields?: ExtraField[];
  /** Shown on the success card: what actually happens after activation. */
  deliveryNote: { en: string; ar: string };
}

export function CheckoutFlow({ slugs, draftKey, productLabel, extraFields = [], deliveryNote }: Props) {
  const { isArabic } = useLanguage();
  const getSetting = useSettings();
  const Arrow = isArabic ? ChevronLeft : ChevronRight;
  const storageKey = `amar-checkout-draft:${draftKey}`;

  // ── Restored draft ────────────────────────────────────────────────────────
  // Nothing is rendered until the draft has been read (see `hydrated`), so the
  // customer never sees an empty form flash before their saved one appears.
  const [hydrated, setHydrated] = useState(false);
  const [form, setForm] = useState<Record<string, string>>(EMPTY.form);
  const [method, setMethod] = useState<Method>("instapay");
  const [step, setStep] = useState<Step>("details");
  const [proof, setProof] = useState<Saved["proof"]>(null);
  const [placed, setPlaced] = useState<{ orderRef: string; accessToken: string } | null>(null);

  // Restored after hydration, not during render: this page is prerendered on
  // the server, where localStorage does not exist, so reading it in a useState
  // initializer would render one thing on the server and another in the
  // browser. Syncing from an external store on mount is the case effects exist
  // for.
  useEffect(() => {
    const s = loadSaved(storageKey);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(s.form);
    setMethod(s.method);
    setProof(s.proof);
    if (s.step === "done" && s.orderRef && s.accessToken) {
      setPlaced({ orderRef: s.orderRef, accessToken: s.accessToken });
      setStep("done");
    } else {
      setStep(s.step === "done" ? "details" : s.step);
    }
    setHydrated(true);
  }, [storageKey]);

  // Mirror every change back out. Skipped until hydration so the initial empty
  // state can't overwrite a real draft.
  useEffect(() => {
    if (!hydrated) return;
    try {
      const payload: Saved = {
        form, method, step, proof,
        orderRef: placed?.orderRef,
        accessToken: placed?.accessToken,
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch { /* private mode — the draft is a convenience, not a requirement */ }
  }, [hydrated, form, method, step, proof, placed, storageKey]);

  // ── Product + live price ──────────────────────────────────────────────────
  const [productId, setProductId] = useState<string | null>(null);
  const [priceEGP, setPriceEGP] = useState<number | null>(null);
  const [originalPriceEGP, setOriginalPriceEGP] = useState<number | null>(null);
  const [currency, setCurrency] = useState("EGP");
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState(false);
  const [spotsTaken, setSpotsTaken] = useState(0);
  const [totalSpots, setTotalSpots] = useState(100);
  const [promoActive, setPromoActive] = useState(false);

  // Keyed on the joined string, not the array: callers pass a literal, which is
  // a new array on every render, and depending on it directly re-ran this fetch
  // after every state update — an endless loop of /api/products requests.
  const slugKey = slugs.join(",");
  useEffect(() => {
    const wanted = slugKey.split(",");
    let cancelled = false;
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: { products?: Array<Record<string, unknown>> }) => {
        if (cancelled) return;
        const p = (data.products || []).find((x) => wanted.includes(String(x.slug)));
        if (!p) { setProductError(true); return; }
        setProductId(String(p.id));
        setPriceEGP(Number(p.price) / 100);
        setOriginalPriceEGP(p.originalPrice ? Number(p.originalPrice) / 100 : null);
        setCurrency(String(p.currency ?? "EGP"));
        setSpotsTaken(Number(p.spotsTaken ?? 0));
        setTotalSpots(Number(p.totalSpots ?? 100));
        setPromoActive(Boolean(p.promoActive));
      })
      .catch(() => { if (!cancelled) setProductError(true); })
      .finally(() => { if (!cancelled) setProductLoading(false); });
    return () => { cancelled = true; };
  }, [slugKey]);

  // The promo turns itself off once the counter reaches its limit — see
  // GET /api/products. Nothing here needs to know when that happens; it simply
  // stops being true and the struck-through price and badge disappear.
  const discountPct =
    promoActive && originalPriceEGP && priceEGP && originalPriceEGP > priceEGP
      ? Math.round((1 - priceEGP / originalPriceEGP) * 100)
      : 0;

  // ── Payment details for the chosen method ─────────────────────────────────
  const payMeta = useMemo(() => ({
    instapay: {
      name: "InstaPay",
      value: getSetting("instapay_handle"),
      hint: {
        ar: "افتح إنستاباي أو تطبيق البنك، اختار «تحويل»، والصق الرقم ده.",
        en: "Open InstaPay or your bank app, choose Transfer, and paste this number.",
      },
    },
    telda: {
      name: "Telda",
      value: getSetting("telda_handle"),
      hint: {
        ar: "افتح تطبيق تيلدا، اختار Send، والصق اليوزر ده — أو امسح الكود.",
        en: "Open Telda, choose Send, and paste this username — or scan the code.",
      },
    },
    paypal: {
      name: "PayPal",
      value: getSetting("paypal_link"),
      hint: {
        ar: "هيفتحلك باي بال في صفحة جديدة — ادفع وبعدين ارجع هنا وارفع الإيصال.",
        en: "PayPal opens in a new tab — pay there, then come back and upload the receipt.",
      },
    },
  } as const), [getSetting]);

  // ── Upload ────────────────────────────────────────────────────────────────
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setUploading(true);
    setUploadErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/checkout/proof", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUploadErr(toErrorMessage(data?.error, isArabic ? "فشل رفع الصورة" : "Upload failed"));
        return;
      }
      setProof({ assetId: data.assetId, claimToken: data.claimToken, name: file.name });
    } catch {
      setUploadErr(isArabic ? "حصل خطأ، حاول تاني" : "Something went wrong, please try again");
    } finally {
      setUploading(false);
    }
  }, [isArabic]);

  // ── Confirm ───────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const confirmOrder = useCallback(async () => {
    if (!productId || !proof) return;
    setSubmitting(true);
    setError("");
    const fallback = isArabic ? "حدث خطأ ما. يرجى المحاولة مرة أخرى." : "Something went wrong. Please try again.";
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          name: form.name,
          email: form.email,
          phone: form.phone,
          paymentMethod: method.toUpperCase(),
          goal: form.goal || undefined,
          level: form.level || undefined,
          notes: form.notes || undefined,
          isRenewal: false,
          proofAssetId: proof.assetId,
          proofClaimToken: proof.claimToken,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(toErrorMessage(data?.error, fallback));
        // A rejected screenshot has to be re-uploaded; keep everything else.
        if (res.status === 400 && String(data?.error ?? "").includes("صورة التحويل")) setProof(null);
        return;
      }
      setPlaced({ orderRef: data.order.orderRef, accessToken: data.order.accessToken });
      setStep("done");
    } catch {
      setError(fallback);
    } finally {
      setSubmitting(false);
    }
  }, [productId, proof, form, method, isArabic]);

  const detailsValid =
    form.name.trim().length >= 2 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim()) &&
    form.phone.trim().length >= 7 &&
    extraFields.every((f) => !f.required || (form[f.name] ?? "").trim().length > 0);

  const amountText = priceEGP != null ? priceEGP.toLocaleString("en-US") : "—";
  const waNumber = getSetting("whatsapp_number").replace(/[^0-9]/g, "");
  const T = (ar: string, en: string) => (isArabic ? ar : en);

  // ══════════════════════════════════════════════════════════════════════════
  if (!hydrated) {
    return (
      <div className="ios-card p-10 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-blue-400" />
      </div>
    );
  }

  // ── Step 3: placed ────────────────────────────────────────────────────────
  if (step === "done" && placed) {
    const waMsg = encodeURIComponent(
      isArabic
        ? `مرحباً كوتش عمار!\nرقم الطلب: ${placed.orderRef}\nالاسم: ${form.name}\nالإيميل: ${form.email}\nحوّلت المبلغ ورفعت صورة التحويل.`
        : `Hi Coach Amar!\nOrder number: ${placed.orderRef}\nName: ${form.name}\nEmail: ${form.email}\nI have sent the transfer and uploaded the screenshot.`
    );
    return (
      <div className="space-y-4">
        <div className="ios-card p-7 sm:p-9 text-center">
          <div className="ios-tile ios-tile-emerald w-16 h-16 mx-auto mb-5">
            <Check size={30} strokeWidth={2.6} className="text-emerald-300" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {T("تم استلام طلبك", "Your order is in")}
          </h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed max-w-sm mx-auto">
            {T(
              "بنراجع التحويل يدويًا وبنفعّل حسابك — عادةً خلال ساعتين، والطلبات اللي بالليل بتتفعّل الصبح.",
              "We check every transfer by hand and activate your access — usually within 2 hours; orders placed overnight are activated in the morning."
            )}
          </p>

          {/* The order number — the thing the customer quotes on WhatsApp and
              the admin searches by in the panel. */}
          <div className="mt-6 rounded-[22px] border border-blue-400/30 bg-gradient-to-b from-blue-500/12 to-blue-600/5 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
            <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-blue-300/80">
              {T("رقم الطلب", "Order number")}
            </span>
            <span className="block mt-1.5 text-3xl sm:text-4xl font-black tabular-nums text-white tracking-tight select-all">
              {placed.orderRef}
            </span>
            <CopyInline value={placed.orderRef} />
          </div>

          <ActivationEmailNotice email={form.email} />

          <p className="text-xs text-slate-400 mt-5 leading-relaxed">{isArabic ? deliveryNote.ar : deliveryNote.en}</p>
        </div>

        <a
          href={`https://wa.me/${waNumber}?text=${waMsg}`}
          target="_blank" rel="noopener noreferrer"
          className="ios-btn-emerald w-full h-13 py-3.5"
        >
          <RealisticWhatsAppIcon className="w-5 h-5" />
          <span>{T("ابعت رقم الطلب للكوتش على واتساب", "Send your order number on WhatsApp")}</span>
        </a>

        <Link
          href={`/checkout/upload-proof?orderRef=${encodeURIComponent(placed.orderRef)}&token=${encodeURIComponent(placed.accessToken)}`}
          className="ios-btn-ghost w-full py-3.5"
        >
          {T("تابع حالة الطلب", "Track this order")}
          <Arrow size={15} />
        </Link>

        <button
          type="button"
          onClick={() => {
            try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
            setPlaced(null); setProof(null); setStep("details"); setForm(EMPTY.form);
          }}
          className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors py-2"
        >
          {T("ابدأ طلب جديد", "Start a new order")}
        </button>
      </div>
    );
  }

  // ── Step 2: pay + upload + confirm ────────────────────────────────────────
  if (step === "pay") {
    const meta = payMeta[method];
    return (
      <div className="space-y-4">
        <StepRail step={2} isArabic={isArabic} />

        <div className="ios-card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="ios-tile ios-tile-blue w-11 h-11">
              <RealisticCreditCardIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white tracking-tight">
                {T(`حوّل ${amountText} ${currency}`, `Send ${amountText} ${currency}`)}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{T(`عن طريق ${meta.name}`, `via ${meta.name}`)}</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">{isArabic ? meta.hint.ar : meta.hint.en}</p>

          {method === "paypal" ? (
            <a href={meta.value} target="_blank" rel="noopener noreferrer" className="ios-btn-blue w-full py-3.5">
              {T("ادفع عبر باي بال", "Pay with PayPal")}
              <ExternalLink size={15} />
            </a>
          ) : (
            <CopyField label={T(`حوّل على ${meta.name}`, `${meta.name} — transfer to`)} value={meta.value} />
          )}

          {method === "telda" && getSetting("telda_qr_url") && (
            <div className="text-center pt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getSetting("telda_qr_url")} alt={T("كود تيلدا", "Telda QR code")} className="w-36 h-36 object-contain bg-white rounded-[18px] mx-auto" />
            </div>
          )}

          <p className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-400/25 rounded-[16px] px-3.5 py-3 leading-relaxed">
            {T(
              `حوّل المبلغ بالظبط: ${amountText} ${currency}. أي مبلغ مختلف هيأخّر التفعيل.`,
              `Send exactly ${amountText} ${currency}. A different amount will delay activation.`
            )}
          </p>
        </div>

        {/* Upload */}
        <div className="ios-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`ios-tile w-11 h-11 ${proof ? "ios-tile-emerald" : "ios-tile-blue"}`}>
              {proof ? <Check size={22} strokeWidth={2.6} className="text-emerald-300" /> : <ImageIcon size={20} className="text-blue-300" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white tracking-tight">
                {T("ارفع صورة التحويل", "Upload your transfer screenshot")}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {T("من غيرها مش هيتسجل طلب", "No screenshot, no order")}
              </p>
            </div>
          </div>

          {proof ? (
            <div className="flex items-center gap-3 rounded-[18px] border border-emerald-400/30 bg-emerald-500/10 px-4 py-3.5">
              <Check size={17} className="text-emerald-400 shrink-0" />
              <span className="flex-1 min-w-0 text-xs font-semibold text-emerald-200 truncate">{proof.name}</span>
              <button
                type="button"
                onClick={() => { setProof(null); setUploadErr(""); }}
                className="shrink-0 text-[11px] font-bold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-[10px] border border-white/12 hover:bg-white/8 transition-colors"
              >
                {T("تغيير", "Change")}
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) void handleFile(f); }}
              onClick={() => !uploading && fileRef.current?.click()}
              className={`flex flex-col items-center gap-2.5 px-6 py-8 border-2 border-dashed rounded-[20px] cursor-pointer transition-colors ${
                dragOver ? "border-blue-400 bg-blue-500/10" : "border-white/12 hover:border-blue-400/50 bg-white/[0.02]"
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 size={24} className="text-blue-400 animate-spin" />
                  <p className="text-sm font-semibold text-slate-300">{T("جاري الرفع...", "Uploading…")}</p>
                </>
              ) : (
                <>
                  <Upload size={22} className="text-blue-300" />
                  <p className="text-sm font-bold text-white">{T("اختر صورة التحويل", "Choose your screenshot")}</p>
                  <p className="text-[11px] text-slate-500">{T("JPG أو PNG · حتى 5 ميجا", "JPG or PNG · up to 5MB")}</p>
                </>
              )}
            </div>
          )}
          {uploadErr && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <AlertTriangle size={13} /> {uploadErr}
            </p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ""; }}
          />
        </div>

        {error && (
          <div className="rounded-[16px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
        )}

        <ActivationEmailNotice email={form.email} compact />

        <button
          type="button"
          onClick={() => void confirmOrder()}
          disabled={!proof || submitting || !productId}
          className="ios-btn-blue w-full py-4 text-base disabled:opacity-45 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              {T("جاري تأكيد الطلب...", "Confirming…")}
            </>
          ) : (
            <>
              <ShieldCheck size={17} />
              {T("تأكيد الدفع وإنشاء الطلب", "Confirm payment & place order")}
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-slate-500 leading-relaxed px-4">
          {T(
            "أول ما تأكد هيظهرلك رقم الطلب، وتقدر تبعته للكوتش على واتساب في أي وقت.",
            "As soon as you confirm you get your order number, which you can send to the coach on WhatsApp any time."
          )}
        </p>

        <button
          type="button"
          onClick={() => setStep("details")}
          className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors py-2"
        >
          {T("رجوع لتعديل بياناتك", "Back to edit your details")}
        </button>
      </div>
    );
  }

  // ── Step 1: details ───────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <StepRail step={1} isArabic={isArabic} />

      <div className="ios-card p-6 sm:p-7 space-y-5">
        <div className="flex items-center gap-3">
          <div className="ios-tile ios-tile-blue w-11 h-11">
            <RealisticDocumentIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {T("بياناتك", "Your details")}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{isArabic ? productLabel.ar : productLabel.en}</p>
          </div>
        </div>

        {productError && (
          <div className="rounded-[16px] border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            {T("تعذّر تحميل بيانات المنتج. حدّث الصفحة.", "Could not load product data. Please refresh.")}
          </div>
        )}

        <Field
          label={T("الاسم بالكامل", "Full name")}
          required
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          placeholder={T("اسمك بالكامل", "Your full name")}
        />

        <div>
          <Field
            label={T("الإيميل (جيميل)", "Email (Gmail)")}
            required
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            placeholder="your@gmail.com"
          />
          {/* The single most common support question: which account gets access. */}
          <p className="mt-2 text-[11px] leading-relaxed text-blue-300/90 bg-blue-500/8 border border-blue-400/20 rounded-[14px] px-3.5 py-2.5">
            {T(
              "التفعيل هيتم على الإيميل ده بالظبط. سجّل دخولك بنفس الجيميل في التطبيق أو الموقع عشان تلاقي الجدول.",
              "Access is activated on exactly this email. Sign in with the same Google account in the app or on the site to find your plan."
            )}
          </p>
        </div>

        <Field
          label={T("رقم الواتساب", "WhatsApp number")}
          required
          type="tel"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
          placeholder="+20 / +34 …"
        />

        {extraFields.map((f) => (
          <Field
            key={f.name}
            label={isArabic ? f.label.ar : f.label.en}
            required={f.required}
            type={f.type === "textarea" ? "textarea" : f.type === "select" ? "select" : "text"}
            options={f.options?.map((o) => ({ value: o.value, label: isArabic ? o.label.ar : o.label.en }))}
            value={form[f.name] ?? ""}
            onChange={(v) => setForm({ ...form, [f.name]: v })}
            placeholder={f.placeholder ? (isArabic ? f.placeholder.ar : f.placeholder.en) : undefined}
          />
        ))}

        {/* Payment method */}
        <div>
          <span className="block text-xs font-bold text-slate-300 mb-2.5">{T("طريقة الدفع", "Payment method")}</span>
          <div className="grid grid-cols-3 gap-2.5">
            {(["instapay", "telda", "paypal"] as Method[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`h-12 rounded-[16px] text-xs font-bold border transition-all ${
                  method === m
                    ? "border-blue-400/60 bg-gradient-to-b from-blue-500/22 to-blue-600/8 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_6px_18px_-6px_rgba(37,99,235,0.55)]"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:border-white/20"
                }`}
              >
                {payMeta[m].name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="ios-card p-6 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300 font-medium">{isArabic ? productLabel.ar : productLabel.en}</span>
          <div className="text-end">
            {discountPct > 0 && (
              <span className="block text-[11px] text-slate-500 line-through tabular-nums">
                {originalPriceEGP?.toLocaleString("en-US")} {currency}
              </span>
            )}
            <span className="text-white font-bold tabular-nums">{amountText} {currency}</span>
          </div>
        </div>
        {promoActive && (
          <div className="pt-3 border-t border-white/8">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
              <span>{spotsTaken}/{totalSpots} {T("مشترك", "claimed")}</span>
              <span className="text-blue-400">{Math.max(0, totalSpots - spotsTaken)} {T("متبقي", "left")}</span>
            </div>
            <div className="h-1.5 rounded-full bg-black/50 border border-white/8 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-300 transition-[width] duration-700"
                style={{ width: `${Math.min(100, (spotsTaken / Math.max(1, totalSpots)) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-[10.5px] text-slate-500 leading-relaxed">
              {T(
                `الخصم بينتهي أوتوماتيك أول ما العدد يوصل ${totalSpots}، وبعدها السعر يرجع ${originalPriceEGP?.toLocaleString("en-US") ?? ""} ${currency}.`,
                `The discount ends automatically at ${totalSpots}, after which the price returns to ${originalPriceEGP?.toLocaleString("en-US") ?? ""} ${currency}.`
              )}
            </p>
          </div>
        )}
        <div className="flex items-baseline justify-between pt-3 border-t border-white/8">
          <span className="text-xs text-slate-400">{T("الإجمالي", "Total")}</span>
          <span className="text-2xl font-black text-blue-400 tabular-nums">{amountText} {currency}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setStep("pay")}
        disabled={!detailsValid || productLoading || productError || !productId}
        className="ios-btn-blue w-full py-4 text-base disabled:opacity-45 disabled:cursor-not-allowed"
      >
        {productLoading ? <Loader2 size={17} className="animate-spin" /> : <RealisticShieldIcon className="w-5 h-5" />}
        {T("اكمل للدفع", "Continue to payment")}
        <Arrow size={16} />
      </button>

      <p className="text-center text-[11px] text-slate-500 leading-relaxed px-4">
        {T(
          "مفيش أي طلب بيتسجل دلوقتي — الطلب بيتسجل بعد ما تحوّل وترفع صورة التحويل وتضغط تأكيد.",
          "Nothing is ordered yet — your order is placed after you transfer, upload the screenshot and press Confirm."
        )}
      </p>
    </div>
  );
}

// ── Pieces ──────────────────────────────────────────────────────────────────

function StepRail({ step, isArabic }: { step: 1 | 2; isArabic: boolean }) {
  const labels = isArabic ? ["بياناتك", "الدفع والتأكيد"] : ["Your details", "Pay & confirm"];
  return (
    <div className="flex items-center gap-2.5 px-1">
      {labels.map((label, i) => {
        const n = (i + 1) as 1 | 2;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className="flex items-center gap-2.5 flex-1">
            <span
              className={`w-7 h-7 shrink-0 rounded-[10px] text-[11px] font-black flex items-center justify-center border transition-colors ${
                done
                  ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-300"
                  : active
                  ? "bg-blue-500/18 border-blue-400/45 text-blue-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                  : "bg-white/[0.03] border-white/10 text-slate-500"
              }`}
            >
              {done ? <Check size={13} strokeWidth={3} /> : n}
            </span>
            <span className={`text-[11px] font-bold truncate ${active ? "text-white" : "text-slate-500"}`}>{label}</span>
            {i === 0 && <span className="flex-1 h-px bg-white/8" />}
          </div>
        );
      })}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text", required, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "textarea" | "select";
  required?: boolean;
  options?: { value: string; label: string }[];
}) {
  const cls =
    "w-full bg-black/35 border border-white/10 rounded-[16px] px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-400/60 focus:bg-black/50 transition-colors";
  return (
    <div>
      <label className="block text-xs font-bold text-slate-300 mb-2">
        {label} {required && <span className="text-blue-400">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${cls} resize-none`} />
      ) : type === "select" ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={cls}>
          <option value="">{placeholder ?? "—"}</option>
          {(options ?? []).map((o) => (
            <option key={o.value} value={o.value} className="bg-[#0b0f19]">{o.label}</option>
          ))}
        </select>
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}

function CopyInline({ value }: { value: string }) {
  const { isArabic } = useLanguage();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* selectable on screen anyway */ }
      }}
      className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-300 hover:text-white px-3 py-1.5 rounded-[10px] border border-blue-400/30 hover:bg-blue-500/12 transition-colors"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? (isArabic ? "تم النسخ" : "Copied") : isArabic ? "نسخ الرقم" : "Copy number"}
    </button>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const { isArabic } = useLanguage();
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">{label}</span>
      <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-[16px] p-3">
        <span className="flex-1 font-mono text-sm font-bold text-blue-300 break-all select-all">{value}</span>
        <button
          type="button"
          onClick={async () => {
            try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* selectable on screen anyway */ }
          }}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-[12px] border text-[11px] font-bold transition-colors ${
            copied ? "border-emerald-400/45 text-emerald-300 bg-emerald-500/10" : "border-blue-400/35 text-blue-300 hover:text-white hover:bg-blue-500/12"
          }`}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? (isArabic ? "تم" : "Copied") : isArabic ? "نسخ" : "Copy"}
        </button>
      </div>
    </div>
  );
}

/** States, in both places it matters, which account actually gets access. */
function ActivationEmailNotice({ email, compact }: { email: string; compact?: boolean }) {
  const { isArabic } = useLanguage();
  if (!email) return null;
  return (
    <div className={`rounded-[18px] border border-blue-400/25 bg-blue-500/8 px-4 py-3.5 text-start ${compact ? "" : "mt-5"}`}>
      <span className="block text-[11px] font-bold text-blue-300 mb-1">
        {isArabic ? "التفعيل هيتم على" : "Access will be activated on"}
      </span>
      <span className="block text-sm font-bold text-white break-all">{email}</span>
      <span className="block text-[11px] text-slate-400 mt-1.5 leading-relaxed">
        {isArabic
          ? "سجّل دخول بنفس الجيميل ده في التطبيق أو الموقع عشان تفتح الجدول."
          : "Sign in with this same Google account in the app or on the site to open your plan."}
      </span>
    </div>
  );
}
