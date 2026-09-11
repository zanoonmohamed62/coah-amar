import { getSetting } from "@/lib/settings";
import { sendMail } from "@/lib/mailer";

const FROM = process.env.EMAIL_FROM || "Coach Amar <noreply@coachair.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://coachair.com";

// ─────────────────────────────────────────────────────────────
// ORDER CONFIRMATION — sent immediately after checkout
// ─────────────────────────────────────────────────────────────
export async function sendOrderConfirmationEmail({
  to, name, orderRef, accessToken, productName, amount, paymentMethod,
}: {
  to: string; name: string; orderRef: string; accessToken: string;
  productName: string; amount: string; paymentMethod: string;
}) {
  const methodLabel: Record<string, string> = {
    INSTAPAY: "InstaPay",
    PAYPAL: "PayPal",
    TELDA: "Telda",
  };
  const coachWA = await getSetting("whatsapp_number");
  const wa = coachWA.replace(/[^0-9]/g, "");
  const waText = encodeURIComponent(`مرحباً كوتش عمار! رقم طلبي: ${orderRef}`);

  // An order now only exists once the screenshot is uploaded, so this email no
  // longer asks for one — it confirms receipt, gives the order number to quote,
  // and says plainly which email access will land on.
  try {
    return await sendMail({
      from: FROM, to,
      subject: `Order ${orderRef} received — طلبك ${orderRef} وصلنا`,
      html: `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#07090e;color:#f1f5f9;max-width:560px;margin:0 auto;padding:24px;">
  <div style="border:1px solid rgba(59,130,246,0.3);border-radius:18px;padding:32px;">
    <h1 style="color:#3b82f6;font-size:22px;margin:0 0 8px;">Order received</h1>
    <p style="margin:0 0 4px;">Hi ${esc(name)}, we have your order and your transfer screenshot.</p>
    <p style="margin:0 0 4px;direction:rtl;text-align:right;">أهلاً ${esc(name)}، طلبك وصورة التحويل وصلونا.</p>

    <div style="background:#131b2a;border-radius:14px;padding:20px;margin:20px 0;text-align:center;">
      <p style="margin:0;color:#93c5fd;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Order number · رقم الطلب</p>
      <p style="margin:6px 0 0;font-size:30px;font-weight:bold;color:#fff;letter-spacing:1px;">${esc(orderRef)}</p>
    </div>

    <div style="background:#131b2a;border-radius:14px;padding:16px 20px;margin:0 0 20px;font-size:13px;">
      <p style="margin:4px 0;"><strong>Product:</strong> ${esc(productName)}</p>
      <p style="margin:4px 0;"><strong>Amount:</strong> ${esc(amount)} EGP</p>
      <p style="margin:4px 0;"><strong>Payment:</strong> ${esc(methodLabel[paymentMethod] || paymentMethod)}</p>
    </div>

    <p style="font-size:13px;margin:0 0 6px;">We check every transfer by hand — usually within 2 hours; overnight orders are activated in the morning.</p>
    <p style="font-size:13px;margin:0 0 16px;">Your access will be activated on <strong>${esc(to)}</strong>. Sign in with this same Google account in the app or on the site to open your plan.</p>
    <p style="font-size:13px;margin:0 0 16px;direction:rtl;text-align:right;">التفعيل هيتم على <strong>${esc(to)}</strong> — سجّل دخولك بنفس الجيميل ده في التطبيق أو الموقع عشان تفتح الجدول.</p>

    <a href="https://wa.me/${wa}?text=${waText}" style="display:inline-block;background:#10b981;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;margin:0 8px 12px 0;">
      Send order number on WhatsApp
    </a>
    <a href="${APP_URL}/checkout/upload-proof?orderRef=${encodeURIComponent(orderRef)}&token=${encodeURIComponent(accessToken)}" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;margin-bottom:12px;">
      Track this order
    </a>
  </div>
</body></html>`.trim(),
    });
  } catch (err) {
    console.error("sendOrderConfirmationEmail failed:", err);
    throw err;
  }
}

// Customer-supplied values (their name, the file name they uploaded) are
// dropped into HTML email bodies. Unescaped, a name like `<a href=…>` renders
// as a live link inside a message sent from this site's domain.
function esc(v: string): string {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─────────────────────────────────────────────────────────────
// ACCESS GRANTED — sent after payment confirmed + account created
// ─────────────────────────────────────────────────────────────
export async function sendAccessGrantedEmail({
  to, name, email, tempPassword, productName, isCoaching,
}: {
  to: string; name: string; email: string; tempPassword: string;
  productName: string; isCoaching: boolean;
}) {
  const coachWA = await getSetting("whatsapp_number");

  try {
    return await sendMail({
      from: FROM, to,
      subject: `Access Granted — Your ${productName} is ready`,
      html: `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#07090e;color:#f1f5f9;max-width:560px;margin:0 auto;padding:24px;">
  <div style="border:1px solid rgba(59,130,246,0.3);border-radius:4px;padding:32px;">
    <h1 style="color:#3b82f6;font-size:22px;margin-bottom:8px;">Welcome, ${esc(name)}!</h1>
    <p>Your <strong>${esc(productName)}</strong> is now active. Here are your login credentials:</p>
    <div style="background:#131b2a;border-radius:4px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 4px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:2px;">LOGIN CREDENTIALS</p>
      <p style="margin:4px 0;"><strong>Email:</strong> ${email}</p>
      <p style="margin:4px 0;"><strong>Password:</strong> <code style="background:#0d121c;padding:2px 8px;border-radius:2px;">${tempPassword}</code></p>
    </div>
    <a href="${APP_URL}/login" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 28px;border-radius:2px;text-decoration:none;font-weight:bold;margin-bottom:20px;">
      Access My Split →
    </a>
    <p style="color:#64748b;font-size:12px;">Please change your password after first login.</p>
    ${isCoaching
      ? `<p style="color:#94a3b8;font-size:13px;margin-top:16px;">For personal coaching, Coach Amar will reach out on WhatsApp at ${coachWA}.</p>`
      : ""
    }
  </div>
</body></html>`.trim(),
    });
  } catch (err) {
    console.error("sendAccessGrantedEmail failed:", err);
    throw err;
  }
}
