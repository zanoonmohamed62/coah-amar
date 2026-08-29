import { getSetting } from "@/lib/settings";
import { sendMail } from "@/lib/mailer";

const FROM = process.env.EMAIL_FROM || "Coach Amar <noreply@coachair.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://coachair.com";

// ─────────────────────────────────────────────────────────────
// ORDER CONFIRMATION — sent immediately after checkout
// ─────────────────────────────────────────────────────────────
export async function sendOrderConfirmationEmail({
  to, name, orderRef, productName, amount, paymentMethod,
}: {
  to: string; name: string; orderRef: string;
  productName: string; amount: string; paymentMethod: string;
}) {
  const methodLabel: Record<string, string> = {
    INSTAPAY: "InstaPay",
    PAYPAL: "PayPal",
    TELDA: "Telda",
  };
  const coachWA = await getSetting("whatsapp_number");

  try {
    return await sendMail({
      from: FROM, to,
      subject: `Order Received — ${orderRef}`,
      html: `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#07090e;color:#f1f5f9;max-width:560px;margin:0 auto;padding:24px;">
  <div style="border:1px solid rgba(59,130,246,0.3);border-radius:4px;padding:32px;">
    <h1 style="color:#3b82f6;font-size:22px;margin-bottom:8px;">Order Received ✓</h1>
    <p>Hi ${name}, thank you for your order.</p>
    <div style="background:#131b2a;border-radius:4px;padding:20px;margin:20px 0;font-size:13px;">
      <p style="margin:4px 0;"><strong>Order:</strong> ${orderRef}</p>
      <p style="margin:4px 0;"><strong>Product:</strong> ${productName}</p>
      <p style="margin:4px 0;"><strong>Amount:</strong> ${amount} EGP</p>
      <p style="margin:4px 0;"><strong>Payment:</strong> ${methodLabel[paymentMethod] || paymentMethod}</p>
    </div>
    <p style="color:#f59e0b;font-size:13px;">⚠️ To complete your order, send your ${methodLabel[paymentMethod] || paymentMethod} transfer screenshot to Coach Amar on WhatsApp: <a href="https://wa.me/${coachWA.replace("+","")}" style="color:#3b82f6;">${coachWA}</a></p>
  </div>
</body></html>`.trim(),
    });
  } catch (err) {
    console.error("sendOrderConfirmationEmail failed:", err);
    throw err;
  }
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
    <h1 style="color:#3b82f6;font-size:22px;margin-bottom:8px;">Welcome, ${name}!</h1>
    <p>Your <strong>${productName}</strong> is now active. Here are your login credentials:</p>
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
