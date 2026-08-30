"use client";

import { useRef, useState } from "react";
import { Upload, CheckCircle2, AlertTriangle, Loader2, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

type Props = {
  orderRef: string;
};

/**
 * Drag-and-drop / click-to-upload box for a manual-transfer payment screenshot
 * (InstaPay/Telda only — PayPal confirms automatically via webhook and never
 * renders this). Posts straight to /api/orders/[orderRef]/proof, which is
 * public but order-ref-scoped, since the customer usually has no session yet
 * at this point in checkout. Used both on the checkout success screen and on
 * the standalone /checkout/upload-proof page (the link sent in the order
 * confirmation email, for customers who close the tab before uploading).
 */
export function PaymentProofUpload({ orderRef }: Props) {
  const { isArabic } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/orders/${encodeURIComponent(orderRef)}/proof`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setUploaded(true);
      } else {
        setError(data.error || (isArabic ? "فشل رفع الصورة" : "Upload failed"));
      }
    } catch {
      setError(isArabic ? "حصل خطأ، حاول تاني" : "Something went wrong, please try again");
    } finally {
      setUploading(false);
    }
  }

  if (uploaded) {
    return (
      <div className="flex flex-col items-center gap-3 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-sm text-center">
        <CheckCircle2 size={28} className="text-emerald-400" />
        <p className="text-sm font-bold text-emerald-300">
          {isArabic ? "تم استلام صورة التحويل!" : "Payment proof received!"}
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          {isArabic
            ? "هنراجعها ونفعّل حسابك قريبًا — هتوصلك رسالة على الإيميل أول ما يتفعل."
            : "We'll review it and activate your account shortly — you'll get an email as soon as it's confirmed."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`flex flex-col items-center gap-2.5 p-6 border-2 border-dashed rounded-sm cursor-pointer transition-colors ${
          dragOver ? "border-blue-400 bg-blue-500/10" : "border-slate-700 hover:border-blue-500/50 bg-[#0b0f19]"
        }`}
      >
        {uploading ? (
          <>
            <Loader2 size={26} className="text-blue-400 animate-spin" />
            <p className="text-sm font-semibold text-slate-300">{isArabic ? "جاري الرفع..." : "Uploading…"}</p>
          </>
        ) : (
          <>
            {error ? <AlertTriangle size={26} className="text-red-400" /> : <ImageIcon size={26} className="text-blue-400" />}
            <p className="text-sm font-bold text-white">
              {isArabic ? "ارفع صورة التحويل" : "Upload your payment screenshot"}
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Upload size={12} />
              {isArabic ? "اسحب الصورة هنا أو اضغط للاختيار" : "Drag & drop, or click to choose a file"}
            </p>
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-400 mt-2 text-center">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
