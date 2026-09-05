"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, Loader2, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/use-settings";

type Phase = "cancelled" | "capturing" | "confirming" | "confirmed" | "timeout" | "error";

function ReturnContent() {
  const searchParams = useSearchParams();
  const { isArabic } = useLanguage();
  const getSetting = useSettings();
  const waNumber = getSetting("whatsapp_number").replace(/[^0-9]/g, "");

  const orderRef = searchParams.get("orderRef") || "";
  const token = searchParams.get("token") || "";
  const cancelled = searchParams.get("cancelled") === "1";

  const [phase, setPhase] = useState<Phase>(cancelled ? "cancelled" : "capturing");

  useEffect(() => {
    if (cancelled || !orderRef || !token) return;

    let cancelledEffect = false;

    (async () => {
      try {
        const res = await fetch("/api/paypal/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!data.success) {
          if (!cancelledEffect) setPhase("error");
          return;
        }
      } catch {
        if (!cancelledEffect) setPhase("error");
        return;
      }

      if (!cancelledEffect) setPhase("confirming");

      // The capture triggers PayPal's webhook asynchronously; poll briefly for it to land.
      for (let i = 0; i < 15; i++) {
        if (cancelledEffect) return;
        await new Promise((r) => setTimeout(r, 2000));
        try {
          const res = await fetch(`/api/orders?orderRef=${encodeURIComponent(orderRef)}`);
          const data = await res.json();
          if (data.order?.status === "CONFIRMED") {
            if (!cancelledEffect) setPhase("confirmed");
            return;
          }
        } catch {}
      }
      if (!cancelledEffect) setPhase("timeout");
    })();

    return () => {
      cancelledEffect = true;
    };
  }, [cancelled, orderRef, token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#07090e]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-6 bg-[#0b0f19] border border-slate-800 p-8 rounded-[var(--radius-xl)] shadow-2xl"
      >
        {(phase === "capturing" || phase === "confirming") && (
          <>
            <Loader2 size={32} className="text-blue-400 animate-spin mx-auto" />
            <h1 className="text-xl font-extrabold text-white">
              {isArabic ? "جاري تأكيد الدفع..." : "Confirming your payment..."}
            </h1>
            <p className="text-slate-400 text-sm">
              {isArabic ? "برجاء الانتظار، لا تغلق هذه الصفحة." : "Please wait, don't close this page."}
            </p>
          </>
        )}

        {phase === "confirmed" && (
          <>
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto">
              <Check size={28} className="text-green-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">
              {isArabic ? "تم الدفع بنجاح!" : "Payment Confirmed!"}
            </h1>
            <p className="text-slate-400 text-sm">
              {isArabic
                ? "تم تفعيل حسابك. تحقق من بريدك الإلكتروني لبيانات الدخول."
                : "Your account is now active. Check your email for login details."}
            </p>
            <Link href="/login" className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
              {isArabic ? "تسجيل الدخول" : "Go to Login"}
            </Link>
          </>
        )}

        {(phase === "timeout" || phase === "error") && (
          <>
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto">
              <MessageCircle size={28} className="text-amber-400" />
            </div>
            <h1 className="text-xl font-extrabold text-white">
              {isArabic ? "الدفع قيد المعالجة" : "Payment Still Processing"}
            </h1>
            <p className="text-slate-400 text-sm">
              {isArabic
                ? "استغرق التأكيد وقتاً أطول من المعتاد. تواصل معنا على الواتساب برقم الطلب وسنفعّل حسابك يدوياً."
                : "Confirmation is taking longer than usual. Message us on WhatsApp with your order reference and we'll activate your account manually."}
            </p>
            {orderRef && (
              <p className="text-xs text-slate-500 font-mono">{orderRef}</p>
            )}
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                (isArabic ? "مرحباً، دفعت عن طريق PayPal ولم يتم تفعيل حسابي. رقم الطلب: " : "Hi, I paid via PayPal but my account wasn't activated. Order ref: ") + orderRef
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
            >
              <MessageCircle size={16} />
              <span>{isArabic ? "تواصل عبر الواتساب" : "Contact on WhatsApp"}</span>
            </a>
          </>
        )}

        {phase === "cancelled" && (
          <>
            <div className="w-16 h-16 bg-slate-500/10 border border-slate-500/30 rounded-full flex items-center justify-center mx-auto">
              <X size={28} className="text-slate-400" />
            </div>
            <h1 className="text-xl font-extrabold text-white">
              {isArabic ? "تم إلغاء الدفع" : "Payment Cancelled"}
            </h1>
            <p className="text-slate-400 text-sm">
              {isArabic ? "لم يتم خصم أي مبلغ. يمكنك المحاولة مرة أخرى." : "No charge was made. You can try again anytime."}
            </p>
          </>
        )}

        <Link href="/" className="block text-sm text-slate-500 hover:text-slate-300 transition-colors">
          {isArabic ? "العودة للرئيسية" : "Back to Home"}
        </Link>
      </motion.div>
    </div>
  );
}

export default function CheckoutReturnPage() {
  return (
    <Suspense>
      <ReturnContent />
    </Suspense>
  );
}
