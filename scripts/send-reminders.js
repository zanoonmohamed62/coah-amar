#!/usr/bin/env node
// Fires the twice-daily training reminder.
//
// Run by PM2 on a cron schedule (see the "amar-reminders" app in
// ecosystem.config.js) — PM2 starts this script at 10:00 and 19:00 Cairo time,
// it makes one request to the running site, and exits. It holds nothing open
// between runs.
//
// Reads CRON_SECRET from the site's own .env.local, so there is one place to
// set it. PM2 does not load that file for a separate app on its own.
const path = require("path");
try {
  require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
} catch {
  /* dotenv missing — fall back to whatever PM2 put in the environment */
}

// Cairo is UTC+2/+3; PM2's cron runs on server time, so decide the slot from
// the hour in Cairo rather than the VPS clock.
const cairoHour = Number(
  new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Africa/Cairo" }).format(new Date())
);

// PM2 also launches a cron app once, immediately, whenever it is (re)registered
// — which the deploy does on every push. Without this guard each deploy would
// send every customer a "did you train today?" at a random hour. Only the two
// scheduled hours actually send.
const SEND_HOURS = [10, 19];
if (!SEND_HOURS.includes(cairoHour)) {
  console.log(`[reminders] launched at ${cairoHour}:00 Cairo, outside ${SEND_HOURS.join("/")} — not sending.`);
  process.exit(0);
}

const slot = cairoHour < 14 ? "morning" : "evening";
const base = process.env.REMINDER_BASE_URL || "http://127.0.0.1:3000";
const secret = process.env.CRON_SECRET;

if (!secret) {
  console.error("[reminders] CRON_SECRET is not set — skipping.");
  process.exit(0);
}

fetch(`${base}/api/cron/reminders?slot=${slot}`, {
  method: "POST",
  headers: { "x-cron-secret": secret },
})
  .then(async (res) => {
    const body = await res.text();
    console.log(`[reminders] ${slot}: HTTP ${res.status} ${body}`);
    process.exit(res.ok ? 0 : 1);
  })
  .catch((err) => {
    console.error("[reminders] request failed:", err.message);
    process.exit(1);
  });
