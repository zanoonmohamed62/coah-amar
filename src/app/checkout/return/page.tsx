"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

/**
 * Legacy PayPal return page.
 *
 * PayPal used to send the customer back here to capture the payment and poll
 * for the webhook. All payment methods are manual now, so there is nothing to
 * capture — this page only exists so links already sitting in customers' inboxes
 * and browser history still land somewhere useful.
 *
 * It forwards to the order's own payment page when the link carries the order
 * ref and access token (`at`, the parameter the old PayPal URLs used), and
 * otherwise sends the customer home.
 */
function ReturnRedirect() {
  const router = useRouter();
  const params = useSearchParams();
  const { isArabic } = useLanguage();

  const orderRef = params.get("orderRef") || "";
  const token = params.get("at") || params.get("token") || "";

  useEffect(() => {
    if (orderRef && token) {
      router.replace(
        `/checkout/upload-proof?orderRef=${encodeURIComponent(
          orderRef
        )}&token=${encodeURIComponent(token)}`
      );
    } else {
      router.replace("/");
    }
  }, [orderRef, token, router]);

  return (
    <div className="min-h-screen bg-[#07090e] flex items-center justify-center px-6">
      <div className="text-center space-y-4">
        <Loader2 size={28} className="text-blue-400 animate-spin mx-auto" />
        <p className="text-sm text-slate-400">
          {isArabic ? "جاري تحويلك لصفحة طلبك…" : "Taking you to your order…"}
        </p>
        <Link href="/" className="block text-xs text-slate-500 hover:text-slate-300">
          {isArabic ? "العودة للرئيسية" : "Back to Home"}
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutReturnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07090e]" />}>
      <ReturnRedirect />
    </Suspense>
  );
}
