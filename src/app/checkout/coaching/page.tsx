"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Flame,
  Dumbbell,
  Apple,
  Pill,
  Heart,
  BarChart3,
  MessageCircle,
  Lock,
  Sparkles,
  Send,
  Globe,
  Wallet,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/use-settings";

const COACHING_TAKEN = 16;
const TOTAL_SPOTS = 100;
const COACHING_PRICE_EUR = 119;

const pillarIcons = [Dumbbell, Apple, Pill, Heart];

export default function CoachingCheckoutPage() {
  const { t, isArabic } = useLanguage();
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;
  const getSetting = useSettings();
  const waNumber = getSetting("whatsapp_number").replace(/[^0-9]/g, "");

  const [paymentMethod, setPaymentMethod] = useState<"instapay" | "paypal" | "telda">("instapay");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    goal: t.checkout?.goalOptions?.[0] || (isArabic ? "حرق الدهون والتنشيف" : "Fat loss & shredding"),
    level: t.checkout?.levelOptions?.[0] || (isArabic ? "مبتدئ (أقل من سنة)" : "Beginner (< 1 year)"),
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderRef, setOrderRef] = useState("");
  const [error, setError] = useState("");
  const [productId, setProductId] = useState<string | null>(null);
  const [priceEGP, setPriceEGP] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: { products?: { id: string; slug: string; price: number }[] }) => {
        const p = (data.products || []).find((p) => p.slug === "personal-coaching" || p.slug === "coaching-3months" || p.slug === "coaching");
        if (p) {
          setProductId(p.id);
          setPriceEGP(p.price / 100);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      setError(isArabic ? "لم يتم العثور على الباقة. يرجى المحاولة مرة أخرى." : "Product not found. Please try again.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    const ref = `COACH-${Date.now()}-${Math.random().toString(36).slice(-4).toUpperCase()}`;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          paymentMethod: paymentMethod.toUpperCase(),
          goal: formData.goal,
          level: formData.level,
          notes: formData.notes,
          isRenewal: false,
          orderRef: ref,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || (isArabic ? "حدث خطأ أثناء تسجيل الطلب." : "Failed to place order."));
      }

      const data = await res.json();
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
        return;
      }

      setOrderRef(ref);
      setIsSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (isArabic ? "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً." : "An error occurred."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    const paymentLabel = paymentMethod === "instapay" ? "InstaPay" : paymentMethod === "paypal" ? "PayPal" : "Telda";
    const waMsg = encodeURIComponent(
      isArabic
        ? `مرحباً كوتش عمار! قمت بطلب اشتراك التدريب والمتابعة الشخصية (٣ شهور).\nرقم الطلب: ${orderRef}\nالاسم: ${formData.name}\nالهدف: ${formData.goal}\nطريقة الدفع: ${paymentLabel}\nيرجى تأكيد الدفع وتفعيل المتابعة وبدء التقييم.`
        : `Hi Coach Amar! I purchased the 3-Month Personal Coaching.\nOrder: ${orderRef}\nName: ${formData.name}\nGoal: ${formData.goal}\nPayment: ${paymentLabel}\nPlease confirm payment and start onboarding.`
    );

    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#07090e] pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center space-y-6 bg-[#0b0f19] border border-blue-500/30 p-8 rounded-sm shadow-2xl"
        >
          <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto">
            <Sparkles size={28} className="text-blue-400" />
          </div>

          <span className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-[0.7rem] uppercase tracking-wider rounded-sm">
            Order Ref: {orderRef}
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {isArabic ? "تم تسجيل طلب التدريب بنجاح!" : "Coaching Order Received!"}
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            {isArabic
              ? "شكراً لاشتراكك مع كوتش عمار. الخطوة الأخيرة: أرسل صورة التحويل عبر الواتساب لتأكيد الدفع واستلام استمارة التقييم والبدء فوراً."
              : "Thank you for joining. Final step: send your payment receipt on WhatsApp to confirm and receive your onboarding assessment."}
          </p>

          {/* Details summary */}
          <div className="bg-[#07090e] border border-slate-800 rounded-sm p-4 text-xs space-y-2 text-slate-400 text-left rtl:text-right">
            <div className="flex justify-between">
              <span>{isArabic ? "الاسم:" : "Name:"}</span>
              <span className="text-white font-semibold">{formData.name}</span>
            </div>
            <div className="flex justify-between">
              <span>{isArabic ? "الباقة:" : "Package:"}</span>
              <span className="text-blue-400 font-semibold">{isArabic ? "متابعة ٣ شهور (نظام متكامل)" : "3-Month Coaching"}</span>
            </div>
            <div className="flex justify-between">
              <span>{isArabic ? "المبلغ:" : "Amount:"}</span>
              <span className="text-white font-semibold">{priceEGP ?? 2499} LE / {COACHING_PRICE_EUR} €</span>
            </div>
          </div>

          <a
            href={`https://wa.me/${waNumber}?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base font-bold shadow-lg shadow-blue-600/30"
          >
            <MessageCircle size={18} />
            <span>{isArabic ? "تأكيد الاشتراك عبر الواتساب" : "Confirm on WhatsApp"}</span>
          </a>

          <Link href="/" className="block text-sm text-slate-500 hover:text-slate-300 transition-colors">
            {isArabic ? "العودة للصفحة الرئيسية" : "Back to Home"}
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

        {/* ── SECTION 1: THE COACHING PROGRAM EXPLANATION & BREAKDOWN ── */}
        <div className="mb-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-[0.7rem] uppercase tracking-wider rounded-sm mb-4">
              {t.coachingDetail.badge}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              {t.coachingDetail.titleLine1}{" "}
              <span className="text-blue-500">{t.coachingDetail.titleLine2}</span>
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
              {t.coachingDetail.desc}
            </p>
          </motion.div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {t.coachingDetail.pillars.map((pillar, i) => {
              const IconComp = pillarIcons[i] || Dumbbell;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-[#0b0f19] border border-slate-800 rounded-sm p-6 hover:border-blue-500/40 transition-colors shadow-lg"
                >
                  <div className="w-10 h-10 rounded-sm bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                    <IconComp size={18} className="text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-4">
                    {pillar.title}
                  </h3>
                  <ul className="space-y-2">
                    {pillar.items.map((item, j) => (
                      <li key={j} className="text-xs text-slate-400 flex items-start gap-2">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          {/* Large visual + Highlights banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-[#0b0f19] border border-slate-800 rounded-sm p-6 sm:p-8">
            <motion.div
              initial={{ opacity: 0, x: isArabic ? 20 : -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 relative rounded-sm overflow-hidden border border-blue-500/30 aspect-video shadow-2xl group"
            >
              <Image
                src="/assets/split-cover.png"
                alt="Amar Coaching System"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-transparent opacity-80" />

              {/* Stats overlay */}
              <div className={`absolute bottom-4 ${isArabic ? "right-4" : "left-4"} flex gap-3 z-10`}>
                {t.coachingDetail.clientStats.map((s) => (
                  <div key={s.label} className="bg-[#07090e]/90 border border-slate-700/80 rounded-sm px-3 py-1.5 backdrop-blur-sm">
                    <p className="text-[10px] text-slate-400">{s.label}</p>
                    <p className="text-sm font-bold text-blue-400">{s.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: isArabic ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-6 space-y-4"
            >
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {t.coachingDetail.visualTitle}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {t.coachingDetail.visualDesc}
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { icon: BarChart3, text: t.coachingDetail.feature1 },
                  { icon: MessageCircle, text: t.coachingDetail.feature2 },
                  { icon: Heart, text: t.coachingDetail.feature3 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-sm bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <item.icon size={14} className="text-blue-400" />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── SECTION 2: CHECKOUT & PAYMENT FORM ── */}
        <div className="border-t border-slate-800 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Spots & Pricing summary */}
            <div className="lg:col-span-5 space-y-6">
              {/* Discount Offer Banner */}
              <div className="bg-gradient-to-b from-[#0e1726]/90 to-[#070b14]/90 border border-blue-500/30 rounded-sm p-5 shadow-inner">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-sm bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <Sparkles size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">
                      {isArabic ? "دفعة محدودة — الأكثر طلباً" : "Limited Batch — Most Popular"}
                    </p>
                    <p className="text-slate-300 text-xs mt-1">
                      {isArabic
                        ? `متبقي ${TOTAL_SPOTS - COACHING_TAKEN} مقعداً فقط في هذه الدفعة`
                        : `${TOTAL_SPOTS - COACHING_TAKEN} spots remaining in this batch`}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1.5 font-semibold">
                    <span>{COACHING_TAKEN}/{TOTAL_SPOTS} {isArabic ? "مشترك" : "claimed"}</span>
                    <span className="text-blue-400">{TOTAL_SPOTS - COACHING_TAKEN} {isArabic ? "متبقي" : "left"}</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full p-[1px] border border-slate-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(COACHING_TAKEN / TOTAL_SPOTS) * 100}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-300 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="bg-[#0b0f19] border border-slate-800 rounded-sm p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-400" />
                  <span>{isArabic ? "ملخص باقة المتابعة" : "Coaching Package Summary"}</span>
                </h3>

                <div className="flex items-center justify-between py-2 border-b border-slate-800 text-sm">
                  <div>
                    <p className="text-white font-bold">{isArabic ? "التدريب والمتابعة الشخصية" : "Personal Coaching"}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{isArabic ? "نظام متكامل لمدة ٣ شهور كاملة" : "3-Month Full Transformation System"}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-blue-400 font-bold">{priceEGP ?? 2499} LE</span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-2">
                  <span className="text-slate-400 text-xs">{isArabic ? "الإجمالي المطلوب" : "Total Amount"}</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white">{priceEGP ?? 2499} LE</span>
                    <span className="text-xs text-slate-400 ml-1.5">({COACHING_PRICE_EUR} €)</span>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-3 text-xs text-slate-400 px-1">
                <ShieldCheck size={16} className="text-blue-400 shrink-0" />
                <span>
                  {isArabic
                    ? "دفع آمن 100% — تواصل مباشر وفوري عبر الواتساب لبدء التقييم وتصميم خطتك"
                    : "100% Secure Checkout · Direct WhatsApp Communication & Fast Onboarding"}
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
                        {isArabic ? "رقم الواتساب للتواصل والتقييم *" : "WhatsApp Phone *"}
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {isArabic ? "هدفك الأساسي" : "Primary Goal"}
                      </label>
                      <select
                        value={formData.goal}
                        onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                        className="w-full bg-[#07090e] border border-slate-800 rounded-sm px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors"
                      >
                        {(t.checkout?.goalOptions || [
                          isArabic ? "حرق الدهون والتنشيف" : "Fat Loss",
                          isArabic ? "بناء العضلات والضخامة" : "Muscle Gain",
                          isArabic ? "إعادة تشكيل الجسم" : "Body Recomposition",
                          isArabic ? "زيادة القوة واللياقة" : "Strength & Fitness",
                        ]).map((opt, idx) => (
                          <option key={idx} value={opt} className="bg-[#0b0f19] text-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {isArabic ? "مستواك الحالي في التمرين" : "Fitness Level"}
                      </label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full bg-[#07090e] border border-slate-800 rounded-sm px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors"
                      >
                        {(t.checkout?.levelOptions || [
                          isArabic ? "مبتدئ (أقل من سنة)" : "Beginner",
                          isArabic ? "متوسط (من سنة إلى ٣ سنوات)" : "Intermediate",
                          isArabic ? "متقدم (أكثر من ٣ سنوات)" : "Advanced",
                        ]).map((opt, idx) => (
                          <option key={idx} value={opt} className="bg-[#0b0f19] text-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isArabic ? "أي إصابات أو تفضيلات غذائية (اختياري)" : "Injuries or Dietary Notes (Optional)"}
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder={isArabic ? "مثال: حساسية ألبان، إصابة سابقة في الركبة، مواعيد خاصة..." : "e.g. food allergies, past injuries, schedule constraints..."}
                      className="w-full bg-[#07090e] border border-slate-800 rounded-sm px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors"
                    />
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
                          className={`py-3 rounded-sm text-xs font-bold border transition-all uppercase flex items-center justify-center gap-1.5 ${
                            paymentMethod === m
                              ? "border-blue-500 bg-blue-500/15 text-blue-400 shadow-md shadow-blue-500/10"
                              : "border-slate-800 text-slate-400 hover:border-slate-700 bg-[#07090e]"
                          }`}
                        >
                          {m === "instapay" && <Send size={13} />}
                          {m === "paypal" && <Globe size={13} />}
                          {m === "telda" && <Wallet size={13} />}
                          <span>{m === "instapay" ? "InstaPay" : m === "paypal" ? "PayPal" : "Telda"}</span>
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
                        <p>
                          💳 <strong className="text-white">Telda:</strong> التحويل على يوزر:{" "}
                          <span className="text-blue-400 font-mono font-bold select-all">{getSetting("telda_handle")}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full py-4 flex items-center justify-center gap-2 group disabled:opacity-70 text-base font-bold shadow-lg shadow-blue-600/30"
                  >
                    <span>
                      {isSubmitting
                        ? isArabic ? "جاري تسجيل الطلب..." : "Processing..."
                        : isArabic
                        ? `اشترك في التدريب الشخصي الآن — ${(priceEGP ?? 2499).toLocaleString()} ج.م`
                        : `Start Personal Coaching — ${(priceEGP ?? 2499).toLocaleString()} EGP`}
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
                      ? "بعد الضغط سيتم تحويلك للواتساب لإرسال صورة التحويل والبدء في استمارة التقييم فوراً."
                      : "After submission, you will confirm via WhatsApp to complete onboarding."}
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
