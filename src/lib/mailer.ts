import { Resend } from "resend";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { redis } from "@/lib/redis";

// ─────────────────────────────────────────────────────────────
// Hybrid mail dispatch: Resend is primary. Once today's Resend send
// count reaches RESEND_DAILY_LIMIT (default 90 — a safety margin under
// Resend's free-plan 100/day cap), remaining sends for the day fail over
// to Amazon SES automatically. SES only activates once AWS_* env vars are
// set (see isSESConfigured) — until then, sends beyond the limit are
// logged and skipped rather than crashing the caller.
// ─────────────────────────────────────────────────────────────

const resend = new Resend(process.env.RESEND_API_KEY);
const RESEND_DAILY_LIMIT = Number(process.env.RESEND_DAILY_LIMIT) || 90;

export function isSESConfigured(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_SES_REGION &&
    process.env.AWS_SES_FROM
  );
}

function todayCountKey(): string {
  const today = new Date().toISOString().slice(0, 10); // UTC YYYY-MM-DD
  return `email:resend:count:${today}`;
}

async function getResendCountToday(): Promise<number> {
  try {
    const raw = await redis.get(todayCountKey());
    return raw ? Number(raw) : 0;
  } catch (err) {
    console.error("[mailer] Redis read failed, assuming 0 sent today:", err);
    return 0; // fail open — prefer trying Resend over blocking mail entirely
  }
}

async function incrementResendCountToday(): Promise<void> {
  try {
    const key = todayCountKey();
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 172800); // 2 days — cleanup only, key name itself resets daily
  } catch (err) {
    console.error("[mailer] Redis increment failed (non-fatal):", err);
  }
}

async function sendViaResend({ from, to, subject, html }: MailArgs) {
  const result = await resend.emails.send({ from, to, subject, html });
  if (result.error) throw new Error(`Resend error: ${result.error.message}`);
  await incrementResendCountToday();
  return { provider: "resend" as const };
}

async function sendViaSES({ from, to, subject, html }: MailArgs) {
  const client = new SESv2Client({
    region: process.env.AWS_SES_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  await client.send(
    new SendEmailCommand({
      FromEmailAddress: process.env.AWS_SES_FROM || from,
      Destination: { ToAddresses: [to] },
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: { Html: { Data: html, Charset: "UTF-8" } },
        },
      },
    })
  );
  return { provider: "ses" as const };
}

type MailArgs = { from: string; to: string; subject: string; html: string };

export async function sendMail(args: MailArgs): Promise<{ provider: "resend" | "ses" }> {
  const sentToday = await getResendCountToday();

  if (sentToday < RESEND_DAILY_LIMIT) {
    try {
      return await sendViaResend(args);
    } catch (err) {
      console.error("[mailer] Resend send failed, trying SES fallback:", err);
    }
  } else {
    console.warn(`[mailer] Resend daily limit reached (${sentToday}/${RESEND_DAILY_LIMIT}) — routing to SES`);
  }

  if (isSESConfigured()) {
    return await sendViaSES(args);
  }

  throw new Error(
    "Resend limit reached (or Resend failed) and SES is not configured — email not sent. " +
      "Set AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_SES_REGION / AWS_SES_FROM to enable fallback."
  );
}
