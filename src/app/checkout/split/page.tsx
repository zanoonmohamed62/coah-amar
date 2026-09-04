"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Flame,
  Dumbbell,
  ListChecks,
  Timer,
  TrendingUp,
  Lock,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/use-settings";
import { useSiteContent } from "@/lib/use-site-content";
import { EditableText } from "@/components/cms/EditableText";
import { PaymentProofUpload } from "@/components/checkout/PaymentProofUpload";

const SPLIT_PRICE_EUR = 11;

const highlightIcons = [Dumbbell, ListChecks, Timer, TrendingUp];

export default function SplitCheckoutPage() {
  const { t, isArabic } = useLanguage();
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;
  const getSetting = useSettings();
  const waNumber = getSetting("whatsapp_number").replace(/[^0-9]/g, "");
  const get = useSiteContent();

  const [paymentMethod, setPaymentMethod] = useState<"instapay" | "paypal" | "telda">("instapay");
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderRef, setOrderRef] = useState("");
  const [error, setError] = useState("");
  const [productId, setProductId] = useState<string | null>(null);
  const [priceEGP, setPriceEGP] = useState<number | null>(null);
  const [spotsTaken, setSpotsTaken] = useState(0);
  const [totalSpots, setTotalSpots] = useState(100);
  const [promoActive, setPromoActive] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: { products?: { id: string; slug: string; price: number; spotsTaken?: number; totalSpots?: number; promoActive?: boolean }[] }) => {
        const p = (data.products || []).find((p) => p.slug === "training-split" || p.slug === "training-plan" || p.slug === "ammar-x-split" || p.slug === "amar-x-split");
        if (p) {
          setProductId(p.id);
          setPriceEGP(p.price / 100);
          setSpotsTaken(p.spotsTaken ?? 0);
          setTotalSpots(p.totalSpots ?? 100);
          setPromoActive(p.promoActive ?? false);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) { setError(isArabic ? "لم يتم العثور على المنتج. حاول مرة أخرى." : "Product not found. Please try again."); return; }
    setIsSubmitting(true);
    setError("");

    const ref = `SPLIT-${Date.now()}-${Math.random().toString(36).slice(-4).toUpperCase()}`;

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        paymentMethod: paymentMethod.toUpperCase(),
        goal: "Build muscle",
        level: "Intermediate",
        notes: "",
        isRenewal: false,
        orderRef: ref,
      }),
    });

    if (!res.ok) {
      setIsSubmitting(false);
      const data = await res.json().catch(() => null);
      setError(data?.error || (isArabic ? "حدث خطأ ما. يرجى المحاولة مرة أخرى." : "Something went wrong. Please try again."));
      return;
    }

    const data = await res.json();
    if (data.approvalUrl) {
      window.location.href = data.approvalUrl;
      return;
    }

    setIsSubmitting(false);
    setOrderRef(ref);
    setIsSuccess(true);
  };

  if (isSuccess) {
    const waMsg = encodeURIComponent(
      isArabic
        ? `مرحباً كوتش عمار! قمت بطلب خطة Amar X Split.\nرقم الطلب: ${orderRef}\nالاسم: ${formData.name}\nطريقة الدفع: ${paymentMethod.toUpperCase()}\nيرجى تأكيد الدفع وتفعيل الوصول.`
        : `Hi Coach Amar! I purchased the Amar X Split.\nOrder: ${orderRef}\nName: ${formData.name}\nPayment: ${paymentMethod.toUpperCase()}\nPlease confirm my payment.`
    );
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#07090e]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-6 bg-[#0b0f19] border border-slate-800 p-8 rounded-sm shadow-2xl"
        >
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto">
            <Check size={28} className="text-green-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            {isArabic ? "تم استلام طلبك بنجاح!" : "Order Received!"}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            {isArabic ? "رقم طلبك هو " : "Your order "}
            <span className="text-blue-400 font-bold">{orderRef}</span>
            {isArabic
              ? ". الخطوة الأخيرة: ارفع صورة التحويل تحت لتفعيل وصولك للجدول."
              : ". Last step: upload your payment screenshot below to activate your plan."}
          </p>
          <PaymentProofUpload orderRef={orderRef} />
          <a
            href={`https://wa.me/${waNumber}?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors py-2"
          >
            <span>{isArabic ? "محتاج مساعدة؟ تواصل عبر واتساب" : "Need help? Contact us on WhatsApp"}</span>
            <ArrowIcon size={13} />
          </a>
          <Link href="/" className="block text-sm text-slate-500 hover:text-slate-300 transition-colors">
            {isArabic ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors"
          >
            <ArrowIcon size={14} className={isArabic ? "rotate-180" : ""} />
            <span>{isArabic ? "العودة للرئيسية" : "Back to Home"}</span>
          </Link>
        </div>

        {/* ── SECTION 1: THE TRAINING PLAN EXPLANATION & BREAKDOWN ── */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & 4 Feature Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7"
            >
              <span className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-[0.7rem] uppercase tracking-wider rounded-sm mb-4">
                <EditableText sectionId="trainingDetail" fieldId="badge" value={get("trainingDetail", "badge", t.trainingDetail.badge)} />
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
                {isArabic ? "نظام التدريب المتقدم" : "THE TRAINING PLAN"}
                <br />
                <span className="text-blue-500">“AMAR X SPLIT”</span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
                <EditableText multiline sectionId="trainingDetail" fieldId="desc" value={get("trainingDetail", "desc", t.trainingDetail.desc)} />
              </p>

              {/* 4 Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {t.trainingDetail.highlights.map((item, i) => {
                  const IconComponent = highlightIcons[i] || Dumbbell;
                  return (
                    <div
                      key={i}
                      className="bg-[#0b0f19] border border-slate-800 rounded-sm p-4 hover:border-blue-500/30 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-sm bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
                        <IconComponent size={16} className="text-blue-400" />
                      </div>
                      <p className="text-sm font-bold text-white mb-1">
                        <EditableText sectionId="trainingDetail" fieldId={`highlight${i + 1}_title`} value={get("trainingDetail", `highlight${i + 1}_title`, item.title)} />
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <EditableText multiline sectionId="trainingDetail" fieldId={`highlight${i + 1}_desc`} value={get("trainingDetail", `highlight${i + 1}_desc`, item.desc)} />
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Right Column: Visual Athletic Card with Promo details */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5"
            >
              <div className="relative rounded-sm overflow-hidden border border-blue-500/30 bg-[#0b0f19] shadow-2xl p-6 sm:p-8 flex flex-col justify-between aspect-[4/3] min-h-[360px]">
                {/* Background glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12)_0%,transparent_70%)] pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />

                {/* Simulated PDF Header */}
                <div className="flex justify-between items-center opacity-60">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500/80" />
                    <div className="w-2 h-2 rounded-full bg-amber-500/80" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="text-[10px] font-mono tracking-widest text-blue-400">AMARX_SPLIT.PDF</div>
                </div>

                {/* Center Athletic Typography */}
                <div className="text-center my-auto py-4">
                  <h3 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tighter" style={{ fontFamily: "var(--font-outfit)" }}>
                    AMAR
                  </h3>
                  <div className="flex items-center justify-center gap-3 my-2">
                    <div className="h-px bg-white/20 w-12" />
                    <span className="text-3xl font-black text-blue-400 leading-none italic">X</span>
                    <div className="h-px bg-white/20 w-12" />
                  </div>
                  <h3 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tighter" style={{ fontFamily: "var(--font-outfit)" }}>
                    SPLIT
                  </h3>
                </div>

                {/* Price tag bar */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">
                      {isArabic ? "دفع مرة واحدة" : "ONE-TIME"}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-white">{priceEGP ?? 299}</span>
                      <span className="text-xs text-slate-400">LE / {SPLIT_PRICE_EUR} €</span>
                    </div>
                  </div>
                  <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-sm">
                    {isArabic ? "تفعيل فوري" : "Instant Access"}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── SECTION 2: CHECKOUT & PAYMENT FORM ── */}
        <div className="border-t border-slate-800 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Spots & Pricing summary */}
            <div className="lg:col-span-5 space-y-6">
              {/* Discount Offer Banner — only shown while the launch promo is still active */}
              {promoActive && (
                <div className="bg-gradient-to-b from-[#0e1726]/90 to-[#070b14]/90 border border-blue-500/30 rounded-sm p-5 shadow-inner">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-sm bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                      <Sparkles size={16} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">
                        {isArabic ? `دفعة محدودة — أول ${totalSpots} مشترك` : `Limited Batch — First ${totalSpots} buyers`}
                      </p>
                      <p className="text-slate-300 text-xs mt-1">
                        {isArabic
                          ? `متبقي ${totalSpots - spotsTaken} مقعداً فقط في هذه الدفعة`
                          : `${totalSpots - spotsTaken} spots remaining in this batch`}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1.5 font-semibold">
                      <span>{spotsTaken}/{totalSpots} {isArabic ? "مشترك" : "claimed"}</span>
                      <span className="text-blue-400">{totalSpots - spotsTaken} {isArabic ? "متبقي" : "left"}</span>
                    </div>
                    <div className="h-2 bg-slate-900 rounded-full p-[1px] border border-slate-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(spotsTaken / totalSpots) * 100}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-300 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Order Summary Box */}
              <div className="bg-[#0b0f19] border border-slate-800 rounded-sm p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-400" />
                  <span>{isArabic ? "ملخص الطلب" : "Order Summary"}</span>
                </h3>

                <div className="flex items-center justify-between py-2 border-b border-slate-800 text-sm">
                  <span className="text-slate-300 font-medium">Amar X Split (7-Day Program)</span>
                  <div className="text-right">
                    <span className="text-white font-bold">{priceEGP ?? 299} LE</span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-2">
                  <span className="text-slate-400 text-xs">{isArabic ? "الإجمالي المطلوب" : "Total Amount"}</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-blue-400">{priceEGP ?? 299} LE</span>
                    <span className="text-xs text-slate-400 ml-1.5">({SPLIT_PRICE_EUR} €)</span>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-3 text-xs text-slate-400 px-1">
                <ShieldCheck size={16} className="text-blue-400 shrink-0" />
                <span>
                  {isArabic
                    ? "دفع آمن 100% — تفعيل فوري ومباشر على حسابك أو الواتساب"
                    : "100% Secure Checkout · Instant Delivery & Direct WhatsApp Support"}
                </span>
              </div>
            </div>

            {/* Right: Payment & Customer Form */}
            <div className="lg:col-span-7">
              <div className="bg-[#0b0f19] border border-slate-800 rounded-sm p-6 sm:p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Lock size={18} className="text-blue-400" />
                  <span>{isArabic ? "بيانات المشترك والدفع" : "Customer & Payment Details"}</span>
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-sm px-4 py-3 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isArabic ? "الاسم بالكامل *" : "Full Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={isArabic ? "اسمك بالكامل" : "Your full name"}
                      className="w-full bg-[#07090e] border border-slate-800 rounded-sm px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {isArabic ? "البريد الإلكتروني *" : "Email Address *"}
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full bg-[#07090e] border border-slate-800 rounded-sm px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {isArabic ? "رقم الواتساب للتفعيل *" : "WhatsApp Phone *"}
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+20 or +34..."
                        className="w-full bg-[#07090e] border border-slate-800 rounded-sm px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      {isArabic ? "اختر طريقة الدفع" : "Select Payment Method"}
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {(["instapay", "paypal", "telda"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`py-3 rounded-sm text-xs font-bold border transition-all uppercase ${
                            paymentMethod === m
                              ? "border-blue-500 bg-blue-500/15 text-blue-400 shadow-md shadow-blue-500/10"
                              : "border-slate-800 text-slate-400 hover:border-slate-700 bg-[#07090e]"
                          }`}
                        >
                          {m === "instapay" ? "InstaPay" : m === "paypal" ? "PayPal" : "Telda"}
                        </button>
                      ))}
                    </div>

                    {/* Payment instructions */}
                    <div className="bg-[#07090e] border border-slate-800/80 rounded-sm p-3.5 mt-3 text-xs text-slate-400 leading-relaxed">
                      {paymentMethod === "instapay" && (
                        <p>
                          📱 <strong className="text-white">InstaPay:</strong> التحويل على عنوان:{" "}
                          <span className="text-blue-400 font-mono font-bold select-all">{getSetting("instapay_handle")}</span>
                        </p>
                      )}
                      {paymentMethod === "paypal" && (
                        <p>
                          🌐 <strong className="text-white">PayPal:</strong> التحويل عبر الرابط:{" "}
                          <span className="text-blue-400 font-mono font-bold select-all">{getSetting("paypal_link").replace(/^https?:\/\//, "")}</span>
                        </p>
                      )}
                      {paymentMethod === "telda" && (
                        <div>
                          <p>
                            💳 <strong className="text-white">Telda:</strong> التحويل على يوزر:{" "}
                            <span className="text-blue-400 font-mono font-bold select-all">{getSetting("telda_handle")}</span>
                          </p>
                          {getSetting("telda_qr_url") && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={getSetting("telda_qr_url")}
                              alt="Telda QR"
                              className="w-32 h-32 object-contain bg-white rounded-sm mt-3"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full py-4 flex items-center justify-center gap-2 group disabled:opacity-70 text-base font-bold shadow-lg shadow-blue-600/20"
                  >
                    <span>
                      {isSubmitting
                        ? isArabic ? "جاري تسجيل الطلب..." : "Processing..."
                        : isArabic
                        ? `احصل على الـ Split الآن — ${priceEGP ?? 299} ج.م`
                        : `Get The Split Now — ${priceEGP ?? 299} EGP`}
                    </span>
                    {!isSubmitting && (
                      <ArrowIcon
                        size={16}
                        className={`${isArabic ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`}
                      />
                    )}
                  </button>

                  <p className="text-center text-xs text-slate-500">
                    {isArabic
                      ? "بعد الضغط سيتم تحويلك للواتساب لإرسال صورة التحويل واستلام ملفاتك فوراً."
                      : "After payment, you will confirm via WhatsApp to activate instant access."}
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
