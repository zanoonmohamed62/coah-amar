"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Check,
  Copy,
  Loader2,
  ExternalLink,
  MessageCircle,
  Clock,
  AlertTriangle,
  Smartphone,
  CreditCard,
  Globe,
} from "lucide-react";
import { PaymentProofUpload } from "@/components/checkout/PaymentProofUpload";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/use-settings";

type Order = {
  orderRef: string;
  status: string;
  amount: number;
  currency: string;
  paymentMethod: "INSTAPAY" | "PAYPAL" | "TELDA";
  customerName: string;
  customerEmail: string;
  confirmedAt: string | null;
  hasProof: boolean;
  product: { name: string; type: string };
};

function CopyField({ label, value, hint }: { label: string; value: string; hint?: string }) {
  const { isArabic } = useLanguage();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked (insecure context / permissions) — the value is
         selectable on screen, so there's nothing useful to report here */
    }
  };

  return (
    <div>
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
        {label}
      </span>
      <div className="flex items-center gap-2 bg-[#07090e] border border-slate-800 rounded-[var(--radius-md)] p-3">
        <span className="flex-1 font-mono text-sm font-bold text-blue-400 break-all select-all">
          {value}
        </span>
        <button
          type="button"
          onClick={copy}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-sm)] border text-[11px] font-bold transition-colors ${
            copied
              ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
              : "border-blue-500/40 text-blue-300 hover:text-white hover:bg-blue-500/10"
          }`}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? (isArabic ? "تم النسخ" : "Copied") : isArabic ? "نسخ" : "Copy"}
        </button>
      </div>
      {hint && <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  );
}

/** One numbered step heading, so the page reads as 1 → 2 → 3 on every method. */
function StepHead({ n, title, done }: { n: number; title: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`w-6 h-6 rounded-[var(--radius-pill)] text-xs font-black flex items-center justify-center shrink-0 border ${
          done
            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
            : "bg-blue-500/15 border-blue-500/30 text-blue-400"
        }`}
      >
        {done ? <Check size={13} /> : n}
      </span>
      <h2 className="text-sm font-bold text-white">{title}</h2>
    </div>
  );
}

function UploadProofInner() {
  const { isArabic } = useLanguage();
  const getSetting = useSettings();
  const searchParams = useSearchParams();
  const orderRef = searchParams.get("orderRef") || "";
  const token = searchParams.get("token") || "";

  // A link missing either half isn't worth a request — treat it as invalid
  // during render rather than setting state from an effect.
  const hasLink = Boolean(orderRef && token);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(hasLink);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!hasLink) return;
    let cancelled = false;

    fetch(`/api/orders/${encodeURIComponent(orderRef)}?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setOrder(d.order);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hasLink, orderRef, token]);

  const notFound = !hasLink || failed;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090e]">
        <Loader2 size={28} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#07090e]">
        <div className="max-w-sm w-full text-center space-y-4">
          <AlertTriangle size={32} className="text-amber-400 mx-auto" />
          <h1 className="text-lg font-bold text-white">
            {isArabic ? "الرابط ده مش شغال" : "This link isn't valid"}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            {isArabic
              ? "افتح الرابط من إيميل تأكيد الطلب، أو كلّمنا على واتساب ونساعدك."
              : "Open the link from your order confirmation email, or message us on WhatsApp and we'll help."}
          </p>
          <a
            href={`https://wa.me/${getSetting("whatsapp_number").replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300"
          >
            <MessageCircle size={15} />
            {isArabic ? "تواصل معنا" : "Contact us"}
          </a>
        </div>
      </div>
    );
  }

  const isConfirmed = order.status === "CONFIRMED";
  const amount = (order.amount / 100).toLocaleString();
  const waNumber = getSetting("whatsapp_number").replace(/[^0-9]/g, "");
  const waMsg = encodeURIComponent(
    isArabic
      ? `مرحباً كوتش عمار! رقم طلبي: ${order.orderRef}\nالاسم: ${order.customerName}\nطريقة الدفع: ${order.paymentMethod}\nحوّلت المبلغ وعايز أأكد الطلب.`
      : `Hi Coach Amar! Order: ${order.orderRef}\nName: ${order.customerName}\nPayment: ${order.paymentMethod}\nI've sent the transfer and want to confirm.`
  );

  // Per-method labels, so step 1 always tells the customer exactly which app to
  // open and exactly what to paste into it.
  const methodMeta = {
    INSTAPAY: {
      icon: Smartphone,
      name: "InstaPay",
      appHint: isArabic
        ? "افتح تطبيق إنستاباي أو تطبيق البنك واختار «تحويل»، والصق الرقم ده."
        : "Open InstaPay (or your bank app), choose Transfer, and paste this number.",
      fieldLabel: isArabic ? "حوّل على رقم إنستاباي" : "InstaPay — transfer to",
      value: getSetting("instapay_handle"),
    },
    TELDA: {
      icon: CreditCard,
      name: "Telda",
      appHint: isArabic
        ? "افتح تطبيق تيلدا واختار «Send»، والصق اليوزر ده — أو امسح الكود تحت."
        : "Open Telda, choose Send, and paste this username — or scan the code below.",
      fieldLabel: isArabic ? "حوّل على يوزر تيلدا" : "Telda — send to",
      value: getSetting("telda_handle"),
    },
    PAYPAL: {
      icon: Globe,
      name: "PayPal",
      appHint: isArabic
        ? "هيفتحلك باي بال في صفحة جديدة — ادفع المبلغ وبعدين ارجع هنا وارفع صورة الإيصال."
        : "PayPal opens in a new tab — pay there, then come back here and upload the receipt.",
      fieldLabel: isArabic ? "ادفع عبر باي بال" : "Pay with PayPal",
      value: getSetting("paypal_link"),
    },
  }[order.paymentMethod];

  const MethodIcon = methodMeta.icon;

  return (
    <div className="min-h-screen bg-[#07090e] px-5 py-10 sm:py-16">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Order summary — the anchor that survives a reload */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-[var(--radius-xl)] p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="min-w-0">
              <h1 className="text-lg font-extrabold text-white leading-tight">
                {order.product.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-mono">{order.orderRef}</p>
            </div>
            <span
              className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-[var(--radius-pill)] border ${
                isConfirmed
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              }`}
            >
              {isConfirmed
                ? isArabic
                  ? "مؤكد"
                  : "Confirmed"
                : isArabic
                ? "في انتظار التأكيد"
                : "Awaiting confirmation"}
            </span>
          </div>
          <div className="flex items-baseline gap-2 pt-4 border-t border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {isArabic ? "المبلغ" : "Amount"}
            </span>
            <span className="text-2xl font-black text-white tabular-nums">
              {amount} <span className="text-sm text-slate-400">{order.currency}</span>
            </span>
            <span className="ms-auto inline-flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <MethodIcon size={14} className="text-blue-400" />
              {methodMeta.name}
            </span>
          </div>
        </div>

        {isConfirmed ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-[var(--radius-xl)] p-6 text-center space-y-3">
            <Check size={28} className="text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-emerald-300">
              {isArabic ? "تم تأكيد الدفع وتفعيل حسابك!" : "Payment confirmed — your access is active!"}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isArabic
                ? "بيانات الدخول اتبعتت على إيميلك. لو مالقيتهاش، بصّ في الـ Spam."
                : "Your login details were emailed to you — check Spam if you can't find them."}
            </p>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-[var(--radius-lg)] transition-colors"
            >
              {isArabic ? "افتح الجدول" : "Open your plan"}
              <ExternalLink size={13} />
            </Link>
          </div>
        ) : (
          <>
            {/* Step 1 — where to send the money */}
            <div className="bg-[#0b0f19] border border-slate-800 rounded-[var(--radius-xl)] p-6 space-y-4">
              <StepHead
                n={1}
                title={
                  isArabic
                    ? `حوّل ${amount} ${order.currency} عبر ${methodMeta.name}`
                    : `Send ${amount} ${order.currency} via ${methodMeta.name}`
                }
              />

              <p className="text-xs text-slate-400 leading-relaxed">{methodMeta.appHint}</p>

              {order.paymentMethod === "PAYPAL" ? (
                <a
                  href={methodMeta.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-[var(--radius-lg)] transition-colors"
                >
                  {isArabic ? "ادفع عبر باي بال" : "Pay with PayPal"}
                  <ExternalLink size={14} />
                </a>
              ) : (
                <CopyField label={methodMeta.fieldLabel} value={methodMeta.value} />
              )}

              {order.paymentMethod === "TELDA" && getSetting("telda_qr_url") && (
                <div className="text-center pt-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getSetting("telda_qr_url")}
                    alt={isArabic ? "كود تيلدا" : "Telda QR code"}
                    className="w-36 h-36 object-contain bg-white rounded-[var(--radius-md)] mx-auto"
                  />
                  <p className="text-[11px] text-slate-500 mt-2">
                    {isArabic ? "امسح الكود من تطبيق تيلدا" : "Scan this in the Telda app"}
                  </p>
                </div>
              )}

              <p className="text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/25 rounded-[var(--radius-md)] px-3 py-2.5 leading-relaxed">
                {isArabic
                  ? `⚠️ حوّل المبلغ بالظبط: ${amount} ${order.currency}. أي مبلغ مختلف هيأخّر التفعيل.`
                  : `⚠️ Send exactly ${amount} ${order.currency}. A different amount will delay activation.`}
              </p>
            </div>

            {/* Step 2 — prove it */}
            <div className="bg-[#0b0f19] border border-slate-800 rounded-[var(--radius-xl)] p-6 space-y-4">
              <StepHead
                n={2}
                done={order.hasProof}
                title={isArabic ? "ارفع صورة التحويل" : "Upload your transfer screenshot"}
              />
              <PaymentProofUpload
                orderRef={order.orderRef}
                token={token}
                initialUploaded={order.hasProof}
              />
            </div>

            {/* Step 3 — what happens next, so the wait is never a mystery */}
            <div className="bg-[#0b0f19] border border-slate-800 rounded-[var(--radius-xl)] p-6 space-y-3">
              <StepHead n={3} title={isArabic ? "استنى التفعيل" : "We activate your access"} />
              <p className="text-xs text-slate-400 leading-relaxed flex items-start gap-2">
                <Clock size={14} className="shrink-0 mt-0.5 text-blue-400" />
                {isArabic
                  ? "بنراجع التحويل يدويًا وبنفعّل حسابك — عادةً خلال ساعتين، والطلبات اللي بالليل بتتفعّل الصبح. هيوصلك إيميل ببيانات الدخول أول ما يتأكد."
                  : "We check every transfer by hand and activate your access — usually within 2 hours; orders placed overnight are activated in the morning. You'll get an email with your login details as soon as it's confirmed."}
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isArabic
                  ? "تقدر تقفل الصفحة دي وترجعلها في أي وقت من نفس اللينك — الحالة بتتحدث لوحدها."
                  : "You can close this page and return to the same link any time — the status updates itself."}
              </p>
            </div>
          </>
        )}

        <a
          href={`https://wa.me/${waNumber}?text=${waMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 border border-slate-800 hover:border-blue-500/40 text-sm font-semibold text-slate-300 hover:text-white rounded-[var(--radius-lg)] transition-colors"
        >
          <MessageCircle size={15} />
          {isArabic ? "محتاج مساعدة؟ كلّمنا على واتساب" : "Need help? Message us on WhatsApp"}
        </a>

        <Link
          href="/"
          className="block text-center text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          {isArabic ? "العودة للرئيسية" : "Back to Home"}
        </Link>
      </div>
    </div>
  );
}

export default function UploadProofPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07090e]" />}>
      <UploadProofInner />
    </Suspense>
  );
}
