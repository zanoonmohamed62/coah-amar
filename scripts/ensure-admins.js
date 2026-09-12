#!/usr/bin/env node
/**
 * Guarantees the configured admin accounts exist with role ADMIN.
 *
 * This is the same operation `POST /api/admin/team` performs, but runnable on
 * the server without being signed in as the super admin. It exists because a
 * new admin otherwise cannot be added until someone is already signed in as
 * the super admin on a device that can reach /admin/team.
 *
 * Raw `pg` rather than Prisma, matching scripts/ensure-products.js: Prisma 7
 * needs a driver adapter to connect, which a standalone deploy script has no
 * reason to construct.
 *
 * Safety rules, mirroring ensure-products.js:
 *   1. It only ever promotes TO admin. It never demotes, never deletes, and
 *      never touches the password, name, or any other field of an account
 *      that already exists.
 *   2. It creates a shell row when no user exists for that email yet. The
 *      Google sign-in flow in src/lib/auth.ts does not overwrite the role of
 *      an existing row, so the ADMIN role survives their first real login.
 *   3. It is idempotent — a no-op once applied, safe on every deploy.
 *
 * Emails come from ADMIN_EMAILS (comma-separated) when set, else the list
 * below.
 */

const { Client } = require("pg");

try {
  const dotenv = require("dotenv");
  dotenv.config({ path: ".env.local" });
  dotenv.config({ path: ".env" });
} catch {
  // Fine when DATABASE_URL is already exported (CI).
}

const DEFAULT_ADMINS = [
  "zanoon.bis@gmail.com", // super admin — see src/lib/super-admin.ts
  "amar.fofa@gmail.com",  // coach Amar
];

function cuid() {
  // users.id has no database-side default (Prisma generates it), so a raw
  // INSERT has to supply one. Same approach as ensure-products.js.
  return (
    "c" +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 6)
  );
}

async function ensureAdmin(client, email) {
  const { rows } = await client.query(
    "SELECT id, role FROM users WHERE email = $1",
    [email]
  );

  if (rows.length > 0) {
    if (rows[0].role === "ADMIN") {
      console.log(`  · ${email}: already ADMIN — unchanged`);
      return { created: 0, promoted: 0 };
    }
    await client.query(
      'UPDATE users SET role = $1::"Role", "updatedAt" = NOW() WHERE id = $2',
      ["ADMIN", rows[0].id]
    );
    console.log(`  · ${email}: promoted to ADMIN`);
    return { created: 0, promoted: 1 };
  }

  await client.query(
    `INSERT INTO users (id, email, name, role, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4::"Role", NOW(), NOW())`,
    [cuid(), email, email.split("@")[0], "ADMIN"]
  );
  console.log(`  · ${email}: MISSING — created as ADMIN`);
  return { created: 1, promoted: 0 };
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log("  DATABASE_URL is not set — skipping admin check.");
    return;
  }

  const emails = (
    process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",") : DEFAULT_ADMINS
  )
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e && e.includes("@"));

  if (emails.length === 0) {
    console.log("  no admin emails configured — nothing to do");
    return;
  }

  const client = new Client({ connectionString });
  await client.connect();
  try {
    let created = 0;
    let promoted = 0;
    for (const email of emails) {
      const r = await ensureAdmin(client, email);
      created += r.created;
      promoted += r.promoted;
    }
    console.log(
      `  admins ensured: ${emails.length} (created ${created}, promoted ${promoted})`
    );
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  // Never fail the deploy over this: the site serves fine, and an admin can
  // still be added from /admin/team.
  console.error("  ensure-admins failed (continuing):", err?.message || err);
  process.exit(0);
});
