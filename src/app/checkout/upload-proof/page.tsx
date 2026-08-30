"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PaymentProofUpload } from "@/components/checkout/PaymentProofUpload";
import { useLanguage } from "@/lib/language-context";

function UploadProofInner() {
  const { isArabic } = useLanguage();
  const searchParams = useSearchParams();
  const orderRef = searchParams.get("orderRef") || "";

  if (!orderRef) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#07090e] text-center">
        <p className="text-slate-400 text-sm">
          {isArabic ? "لينك غير صالح — رقم الطلب مفقود." : "Invalid link — missing order reference."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#07090e]">
      <div className="max-w-md w-full space-y-6 bg-[#0b0f19] border border-slate-800 p-8 rounded-sm shadow-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-white mb-2">
            {isArabic ? "ارفع صورة التحويل" : "Upload Your Payment Proof"}
          </h1>
          <p className="text-slate-400 text-sm">
            {isArabic ? "رقم طلبك: " : "Your order: "}
            <span className="text-blue-400 font-bold">{orderRef}</span>
          </p>
        </div>
        <PaymentProofUpload orderRef={orderRef} />
        <Link href="/" className="block text-center text-sm text-slate-500 hover:text-slate-300 transition-colors">
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
