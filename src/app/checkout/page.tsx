"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  Send,
  MessageCircle,
  Clock,
  Sparkles,
  Wallet,
  Globe,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, isArabic, lang } = useLanguage();
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  const planParam = searchParams.get("plan");
  const [selectedPlan, setSelectedPlan] = useState<"training" | "coaching">(
    planParam === "training" ? "training" : "coaching"
  );

  const [paymentMethod, setPaymentMethod] = useState<"instapay" | "paypal" | "telda">("instapay");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    goal: t.checkout.goalOptions[0],
    level: t.checkout.levelOptions[0],
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [products, setProducts] = useState<{ training?: string; coaching?: string }>({});

  // Fetch product IDs on mount
  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then((data: { products?: { id: string; slug: string }[] }) => {
        const map: { training?: string; coaching?: string } = {};
        (data.products || []).forEach((p) => {
          if (p.slug === "training-plan") map.training = p.id;
          if (p.slug === "personal-coaching") map.coaching = p.id;
        });
        setProducts(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (planParam === "training") {
      setSelectedPlan("training");
    } else if (planParam === "coaching") {
      setSelectedPlan("coaching");
    }
  }, [planParam]);

  const price = selectedPlan === "training" ? "499" : "2,499";
  const currency = isArabic ? "ج.م" : "LE";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    const generatedId = "AMAR-" + Math.floor(100000 + Math.random() * 900000);
    const productId = selectedPlan === "training" ? products.training : products.coaching;

    const paymentMethodMap: Record<string, string> = {
      instapay: "INSTAPAY",
      paypal: "PAYPAL",
      telda: "TELDA",
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: productId || "",
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          paymentMethod: paymentMethodMap[paymentMethod],
          goal: formData.goal,
          level: formData.level,
          notes: formData.notes,
          isRenewal: false,
          orderRef: generatedId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Something went wrong");
      }

      const data = await res.json();
      setOrderNumber(data.order?.orderRef || generatedId);
      setIsSuccess(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    isArabic
      ? `مرحباً كوتش عمار، أنا سجلت طلب اشتراك جديد رقم: ${orderNumber || "AMAR-ORDER"}\nالاسم: ${formData.name || "متدرب"}\nالباقة: ${selectedPlan === "training" ? "خطة التدريب (٤٩٩ ج.م / 19 €)" : "التدريب الشخصي والمتابعة (٢,٤٩٩ ج.م / 119 €)"}\nطريقة الدفع: ${paymentMethod === "instapay" ? "إنستاباي (InstaPay)" : paymentMethod === "paypal" ? "PayPal" : "تيلدا (Telda)"}\nأرجو تأكيد الاشتراك وتفعيل الحساب.`
      : `Hello Coach Amar, I just placed a new order ${orderNumber || "AMAR-ORDER"}\nName: ${formData.name || "Client"}\nPlan: ${selectedPlan === "training" ? "Training Plan (499 LE / 19 €)" : "Personal Coaching (2,499 LE / 119 €)"}\nPayment: ${paymentMethod.toUpperCase()}\nPlease confirm my registration.`
  );

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.06)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="label-badge mb-3 inline-block">{t.checkout.badge}</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gradient-white leading-tight">
            {t.checkout.heading}
          </h1>
          <p className="text-[var(--text-secondary)] mt-3 max-w-lg mx-auto text-sm sm:text-base">
            {t.checkout.subheading}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.form
              key="checkout-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Plan selection, info & payment */}
              <div className="lg:col-span-7 space-y-8">
                {/* 1. Plan Selector */}
                <div className="glass border border-[var(--border)] rounded-sm p-6">
                  <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-[var(--accent)]" />
                    <span>{t.checkout.planSelectorTitle}</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Training Plan Card */}
                    <div
                      onClick={() => setSelectedPlan("training")}
                      className={`cursor-pointer rounded-sm p-4 border transition-all relative ${
                        selectedPlan === "training"
                          ? "border-[var(--accent)] bg-[var(--accent-glow)] shadow-md"
                          : "border-[var(--border)] glass hover:border-[var(--border-accent)]"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-bold text-[var(--text-primary)]">{t.checkout.plan1Title}</p>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selectedPlan === "training"
                              ? "border-[var(--accent)] bg-[var(--accent)]"
                              : "border-[var(--border)]"
                          }`}
                        >
                          {selectedPlan === "training" && <Check size={10} className="text-white" />}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-gradient mb-2">{t.checkout.plan1Price}</p>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">{t.checkout.plan1Desc}</p>
                    </div>

                    {/* Coaching Plan Card */}
                    <div
                      onClick={() => setSelectedPlan("coaching")}
                      className={`cursor-pointer rounded-sm p-4 border transition-all relative ${
                        selectedPlan === "coaching"
                          ? "border-[var(--accent)] bg-[var(--accent-glow)] shadow-md shadow-blue-500/10"
                          : "border-[var(--border)] glass hover:border-[var(--border-accent)]"
                      }`}
                    >
                      <span className={`absolute -top-2.5 ${isArabic ? "left-3" : "right-3"} bg-[var(--accent)] text-white text-[0.6rem] font-bold tracking-wider px-2 py-0.5 rounded-sm`}>
                        {t.checkout.plan2Badge}
                      </span>
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-bold text-[var(--text-primary)]">{t.checkout.plan2Title}</p>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            selectedPlan === "coaching"
                              ? "border-[var(--accent)] bg-[var(--accent)]"
                              : "border-[var(--border)]"
                          }`}
                        >
                          {selectedPlan === "coaching" && <Check size={10} className="text-white" />}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-gradient mb-2">{t.checkout.plan2Price}</p>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">{t.checkout.plan2Desc}</p>
                    </div>
                  </div>
                </div>

                {/* 2. Client Details */}
                <div className="glass border border-[var(--border)] rounded-sm p-6">
                  <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                    {t.checkout.clientDetailsTitle}
                  </h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                          {t.checkout.nameLabel} *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={t.checkout.namePlaceholder}
                          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                          {t.checkout.phoneLabel} *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder={t.checkout.phonePlaceholder}
                          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                          {t.checkout.emailLabel} *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder={t.checkout.emailPlaceholder}
                          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                          {t.checkout.goalLabel}
                        </label>
                        <select
                          value={formData.goal}
                          onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                        >
                          {t.checkout.goalOptions.map((opt, i) => (
                            <option key={i} value={opt} className="bg-[var(--bg-elevated)] text-[var(--text-primary)]">
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        {t.checkout.notesLabel}
                      </label>
                      <textarea
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder={t.checkout.notesPlaceholder}
                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-sm px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Payment Method */}
                <div className="glass border border-[var(--border)] rounded-sm p-6">
                  <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Wallet size={18} className="text-[var(--accent)]" />
                    <span>{t.checkout.paymentTitle}</span>
                  </h2>

                  <div className="space-y-3">
                    {/* InstaPay */}
                    <div
                      onClick={() => setPaymentMethod("instapay")}
                      className={`cursor-pointer rounded-sm p-4 border transition-all flex items-start gap-3.5 ${
                        paymentMethod === "instapay"
                          ? "border-[var(--accent)] bg-[var(--accent-glow)] shadow-md"
                          : "border-[var(--border)] glass"
                      }`}
                    >
                      <Send size={20} className="text-[var(--accent)] mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[var(--text-primary)]">{t.checkout.instaPay}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{t.checkout.instaPayInfo}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 ${
                          paymentMethod === "instapay" ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--border)]"
                        }`}
                      >
                        {paymentMethod === "instapay" && <Check size={10} className="text-white" />}
                      </div>
                    </div>

                    {/* PayPal */}
                    <div
                      onClick={() => setPaymentMethod("paypal")}
                      className={`cursor-pointer rounded-sm p-4 border transition-all flex items-start gap-3.5 ${
                        paymentMethod === "paypal"
                          ? "border-[var(--accent)] bg-[var(--accent-glow)] shadow-md"
                          : "border-[var(--border)] glass"
                      }`}
                    >
                      <Globe size={20} className="text-[var(--accent)] mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[var(--text-primary)]">{t.checkout.payPal}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{t.checkout.payPalInfo}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 ${
                          paymentMethod === "paypal" ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--border)]"
                        }`}
                      >
                        {paymentMethod === "paypal" && <Check size={10} className="text-white" />}
                      </div>
                    </div>

                    {/* Telda */}
                    <div
                      onClick={() => setPaymentMethod("telda")}
                      className={`cursor-pointer rounded-sm p-4 border transition-all flex items-start gap-3.5 ${
                        paymentMethod === "telda"
                          ? "border-[var(--accent)] bg-[var(--accent-glow)] shadow-md"
                          : "border-[var(--border)] glass"
                      }`}
                    >
                      <Wallet size={20} className="text-[var(--accent)] mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[var(--text-primary)]">{t.checkout.telda}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{t.checkout.teldaInfo}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 ${
                          paymentMethod === "telda" ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--border)]"
                        }`}
                      >
                        {paymentMethod === "telda" && <Check size={10} className="text-white" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary & Action */}
              <div className="lg:col-span-5">
                <div className="sticky top-28 glass-accent border border-[var(--border-accent)] rounded-sm p-6 shadow-2xl">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 pb-3 border-b border-[var(--border)]">
                    {t.checkout.summaryTitle}
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-start text-sm">
                      <div>
                        <p className="font-bold text-[var(--text-primary)]">
                          {selectedPlan === "training" ? t.checkout.plan1Title : t.checkout.plan2Title}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          {selectedPlan === "training" ? (isArabic ? "دفع لمرة واحدة" : "One-time digital delivery") : (isArabic ? "متابعة ٣ شهور كاملة" : "3-Month Complete System")}
                        </p>
                      </div>
                      <span className="font-bold text-[var(--text-primary)]">
                        {price} {currency}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-[var(--text-muted)]">
                      <span>{t.checkout.subtotal}</span>
                      <span>{price} {currency}</span>
                    </div>

                    <div className="flex justify-between text-xs text-[var(--text-muted)]">
                      <span>{t.checkout.taxes}</span>
                      <span className="text-[var(--accent)]">{t.checkout.freeTax}</span>
                    </div>

                    <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center">
                      <span className="text-base font-bold text-[var(--text-primary)]">{t.checkout.total}</span>
                      <span className="text-3xl font-extrabold text-gradient" style={{ fontFamily: isArabic ? "var(--font-alexandria)" : "var(--font-outfit)" }}>
                        {price} <span className="text-sm font-normal text-[var(--text-muted)]">{currency}</span>
                      </span>
                    </div>
                  </div>

                  {submitError && (
                    <div className="mb-3 rounded-sm bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full py-3.5 text-center flex items-center justify-center gap-2 relative z-10 group cursor-pointer disabled:opacity-75"
                  >
                    <span>{isSubmitting ? t.checkout.submittingBtn : t.checkout.submitBtn}</span>
                    {!isSubmitting && (
                      <ArrowIcon size={16} className={`${isArabic ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} transition-transform`} />
                    )}
                  </button>

                  <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center gap-2.5 text-xs text-[var(--text-muted)]">
                    <ShieldCheck size={16} className="text-[var(--accent)] flex-shrink-0" />
                    <span>{t.checkout.guarantee}</span>
                  </div>
                </div>
              </div>
            </motion.form>
          ) : (
            /* Success State */
            <motion.div
              key="checkout-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto glass-accent border border-[var(--border-accent)] rounded-sm p-8 text-center shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-[var(--accent-glow)] border border-[var(--border-accent)] flex items-center justify-center mx-auto mb-6">
                <Sparkles size={32} className="text-[var(--accent)]" />
              </div>

              <span className="label-badge mb-3 inline-block">Order Ref: {orderNumber}</span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-gradient-white mb-4">
                {t.checkout.successTitle}
              </h2>

              <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto">
                {t.checkout.successMessage}
              </p>

              <div className="glass border border-[var(--border)] rounded-sm p-4 text-left rtl:text-right max-w-md mx-auto mb-8 space-y-2 text-xs text-[var(--text-muted)]">
                <div className="flex justify-between">
                  <span>{isArabic ? "الاسم:" : "Name:"}</span>
                  <span className="text-[var(--text-primary)] font-semibold">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isArabic ? "الباقة:" : "Selected Plan:"}</span>
                  <span className="text-[var(--accent)] font-semibold">
                    {selectedPlan === "training" ? t.checkout.plan1Title : t.checkout.plan2Title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{isArabic ? "المبلغ الإجمالي:" : "Total Paid:"}</span>
                  <span className="text-[var(--text-primary)] font-semibold">{price} {currency}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={`https://wa.me/34610354255?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center justify-center gap-2 py-3 px-6"
                >
                  <MessageCircle size={18} />
                  <span>{t.checkout.whatsappBtn}</span>
                </a>

                <Link
                  href="/"
                  className="btn-secondary flex items-center justify-center py-3 px-6"
                >
                  {t.checkout.backHome}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center text-[var(--text-muted)]">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
