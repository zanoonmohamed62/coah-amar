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
  FileText,
  BarChart3,
  Clock,
  TrendingUp,
  BookOpen,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";

const SPLIT_TAKEN = 56;
const TOTAL_SPOTS = 100;
const SPLIT_PRICE_EGP = 497;
const SPLIT_PRICE_EUR = 19;
const ORIGINAL_EGP = Math.round(SPLIT_PRICE_EGP / 0.6);
const ORIGINAL_EUR = Math.round(SPLIT_PRICE_EUR / 0.6);

const features = [
  { icon: Dumbbell, text: "Complete 7-day training structure" },
  { icon: BarChart3, text: "Sets & reps ranges for every exercise" },
  { icon: Zap, text: "Weak points & priority system" },
  { icon: Clock, text: "Rest time rules" },
  { icon: TrendingUp, text: "Progressive overload rule" },
  { icon: BookOpen, text: "Training log & progress tracking" },
];

export default function SplitCheckoutPage() {
  const { isArabic } = useLanguage();
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight;

  const [paymentMethod, setPaymentMethod] = useState<"instapay" | "paypal" | "telda">("instapay");
  const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderRef, setOrderRef] = useState("");
  const [error, setError] = useState("");
  const [productId, setProductId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: { products?: { id: string; slug: string }[] }) => {
        const p = (data.products || []).find((p) => p.slug === "training-plan" || p.slug === "ammar-x-split");
        if (p) setProductId(p.id);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) { setError("Product not found. Please try again."); return; }
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

    setIsSubmitting(false);
    if (!res.ok) { setError("Something went wrong. Please try again."); return; }
    setOrderRef(ref);
    setIsSuccess(true);
  };

  if (isSuccess) {
    const waMsg = encodeURIComponent(
      `Hi Coach Amar! I purchased the Ammar X Split.\nOrder: ${orderRef}\nName: ${formData.name}\nPayment: ${paymentMethod.toUpperCase()}\nPlease confirm my payment.`
    );
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#07090e]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto">
            <Check size={28} className="text-green-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Order Received!</h1>
          <p className="text-slate-400">
            Your order <span className="text-blue-400 font-bold">{orderRef}</span> has been placed.
            {paymentMethod === "instapay" && " Send your payment screenshot on WhatsApp to confirm."}
          </p>
          <a
            href={`https://wa.me/34610354255?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
          >
            <span>Confirm on WhatsApp</span>
            <ArrowIcon size={15} />
          </a>
          <Link href="/" className="block text-sm text-slate-500 hover:text-slate-300 transition-colors">
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-[0.7rem] uppercase tracking-wider rounded-sm mb-4">
            Offer 01 — Limited Spots
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
            AMMAR X SPLIT
          </h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">
            The complete 7-day training structure built with old school principles and modern progression science.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left: What you get */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>

            {/* Discount badge */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-sm p-4 mb-6 flex items-center gap-3">
              <Flame size={20} className="text-orange-400 flex-shrink-0" />
              <div>
                <p className="text-orange-400 font-bold text-sm">40% OFF — First 100 buyers</p>
                <p className="text-slate-400 text-xs">{TOTAL_SPOTS - SPLIT_TAKEN} spots remaining at this price</p>
              </div>
            </div>

            {/* Spot progress bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>{SPLIT_TAKEN}/{TOTAL_SPOTS} claimed</span>
                <span>{TOTAL_SPOTS - SPLIT_TAKEN} left</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(SPLIT_TAKEN / TOTAL_SPOTS) * 100}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                />
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-4">What&apos;s Inside</h2>
            <ul className="space-y-3 mb-8">
              {features.map(({ icon: Icon, text }, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                  className="flex items-center gap-3 text-slate-300 text-sm"
                >
                  <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-sm flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-blue-400" />
                  </div>
                  <span>{text}</span>
                </motion.li>
              ))}
            </ul>

            {/* Price display */}
            <div className="bg-[#0b0f19] border border-slate-800 rounded-sm p-5">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-slate-500 line-through text-lg">{ORIGINAL_EGP} EGP</span>
                <span className="bg-orange-500/20 text-orange-400 text-xs font-extrabold px-2 py-0.5 rounded-sm">-40%</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white">{SPLIT_PRICE_EGP}</span>
                <span className="text-slate-400">EGP</span>
                <span className="text-slate-500 mx-1">/</span>
                <span className="text-2xl font-bold text-blue-400">{SPLIT_PRICE_EUR} €</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">One-time payment · Instant digital delivery</p>
            </div>

            {/* Guarantee */}
            <div className="flex items-center gap-2.5 mt-4 text-xs text-slate-500">
              <ShieldCheck size={14} className="text-blue-400" />
              <span>Secured payment · Your data is safe</span>
            </div>
          </motion.div>

          {/* Right: Order form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-[#0b0f19] border border-slate-800 rounded-sm p-6">
              <h2 className="text-lg font-bold text-white mb-6">Complete Your Order</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-sm px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full bg-[#07090e] border border-slate-800 rounded-sm px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full bg-[#07090e] border border-slate-800 rounded-sm px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+20 or +34..."
                    className="w-full bg-[#07090e] border border-slate-800 rounded-sm px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["instapay", "paypal", "telda"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`py-2.5 rounded-sm text-xs font-bold border transition-all uppercase ${
                          paymentMethod === m
                            ? "border-blue-500 bg-blue-500/10 text-blue-400"
                            : "border-slate-800 text-slate-500 hover:border-slate-700"
                        }`}
                      >
                        {m === "instapay" ? "InstaPay" : m === "paypal" ? "PayPal" : "Telda"}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {paymentMethod === "instapay" && "📱 Send to: amar.fitness@instapay — then confirm on WhatsApp"}
                    {paymentMethod === "paypal" && "🌐 PayPal.me/amar.fitness — then confirm on WhatsApp"}
                    {paymentMethod === "telda" && "💳 @amar.fitness on Telda — then confirm on WhatsApp"}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 group disabled:opacity-70"
                >
                  <span>{isSubmitting ? "Processing..." : `Get The Split — ${SPLIT_PRICE_EGP} EGP`}</span>
                  {!isSubmitting && <ArrowIcon size={15} className="group-hover:translate-x-1 transition-transform" />}
                </button>

                <p className="text-center text-xs text-slate-500">
                  After payment, confirm via WhatsApp to activate your access instantly.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
