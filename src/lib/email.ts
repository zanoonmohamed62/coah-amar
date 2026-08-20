import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "Coach Amar <noreply@coachair.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://coachair.com";
const COACH_WA = process.env.NEXT_PUBLIC_COACH_WHATSAPP || "+34610354255";

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
  const isInstapay = paymentMethod === "INSTAPAY";

  return resend.emails.send({
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
    ${isInstapay
      ? `<p style="color:#f59e0b;font-size:13px;">⚠️ To complete your order, send your InstaPay transfer screenshot to Coach Amar on WhatsApp: <a href="https://wa.me/${COACH_WA.replace("+","")}" style="color:#3b82f6;">${COACH_WA}</a></p>`
      : `<p style="color:#94a3b8;font-size:13px;">Your account will be activated automatically once payment is confirmed. You'll receive login access by email.</p>`
    }
  </div>
</body></html>`.trim(),
  });
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
  return resend.emails.send({
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
      ? `<p style="color:#94a3b8;font-size:13px;margin-top:16px;">For personal coaching, Coach Amar will reach out on WhatsApp at ${COACH_WA}.</p>`
      : ""
    }
  </div>
</body></html>`.trim(),
  });
}

// ─────────────────────────────────────────────────────────────
// RENEWAL REMINDER — sent 7 days before coaching expires
// ─────────────────────────────────────────────────────────────
export async function sendRenewalReminderEmail({
  to, name, daysLeft, expiresAt,
}: {
  to: string; name: string; daysLeft: number; expiresAt: string;
}) {
  return resend.emails.send({
    from: FROM, to,
    subject: `Your coaching expires in ${daysLeft} days — Renew to continue`,
    html: `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#07090e;color:#f1f5f9;max-width:560px;margin:0 auto;padding:24px;">
  <div style="border:1px solid rgba(59,130,246,0.3);border-radius:4px;padding:32px;">
    <h2 style="color:#3b82f6;">Your coaching expires in ${daysLeft} days</h2>
    <p>Hi ${name}, your current Personal Coaching period ends on <strong>${expiresAt}</strong>.</p>
    <p style="color:#94a3b8;">Renew now to continue your progress without interruption.</p>
    <a href="${APP_URL}/app/account" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 28px;border-radius:2px;text-decoration:none;font-weight:bold;">
      Renew Coaching →
    </a>
  </div>
</body></html>`.trim(),
  });
}

// ─────────────────────────────────────────────────────────────
// INSTAPAY CONFIRMED (admin manually confirmed) — now account created
// ─────────────────────────────────────────────────────────────
export async function sendInstapayConfirmedEmail({
  to, name, email, tempPassword, productName,
}: {
  to: string; name: string; email: string; tempPassword: string; productName: string;
}) {
  return sendAccessGrantedEmail({ to, name, email, tempPassword, productName, isCoaching: productName.toLowerCase().includes("coaching") });
}
