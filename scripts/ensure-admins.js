#!/usr/bin/env node
/**
 * Guarantees the configured admin accounts exist with role ADMIN.
 *
 * This is the same operation `POST /api/admin/team` performs, but runnable on
 * the server without being signed in as the super admin. It exists because a
 * new admin otherwise cannot be added until someone is already signed in as
 * the super admin on a device that can reach /admin/team.
 *
 * Safety rules, mirroring scripts/ensure-products.js:
 *   1. It only ever promotes TO admin. It never demotes, never deletes, and
 *      never touches a row's password, name, or any other field on an
 *      account that already exists as ADMIN.
 *   2. It creates a shell row when no user exists for that email yet. The
 *      Google sign-in flow in src/lib/auth.ts does not overwrite the role of
 *      an existing row, so the ADMIN role survives their first real login.
 *   3. It is idempotent — a no-op once applied, safe on every deploy.
 *
 * Emails come from ADMIN_EMAILS (comma-separated) when set, else the built-in
 * list below.
 */

const { PrismaClient } = require("@prisma/client");

const DEFAULT_ADMINS = [
  "zanoon.bis@gmail.com",   // super admin — see src/lib/super-admin.ts
  "amar.fofa@gmail.com",    // coach Amar
];

async function main() {
  const prisma = new PrismaClient();
  try {
    const emails = (process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(",")
      : DEFAULT_ADMINS
    )
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e && e.includes("@"));

    if (emails.length === 0) {
      console.log("  no admin emails configured — nothing to do");
      return;
    }

    let created = 0;
    let promoted = 0;
    let unchanged = 0;

    for (const email of emails) {
      const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true, role: true },
      });

      if (!existing) {
        await prisma.user.create({
          data: { email, name: email.split("@")[0], role: "ADMIN" },
        });
        created++;
        console.log(`  + ${email}: created as ADMIN`);
      } else if (existing.role !== "ADMIN") {
        await prisma.user.update({
          where: { email },
          data: { role: "ADMIN" },
        });
        promoted++;
        console.log(`  ↑ ${email}: promoted to ADMIN`);
      } else {
        unchanged++;
        console.log(`  · ${email}: already ADMIN — unchanged`);
      }
    }

    console.log(
      `  admins ensured: ${emails.length} (created ${created}, promoted ${promoted}, unchanged ${unchanged})`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  // Never fail the deploy over this: the site serves fine, an admin just
  // has to be added from /admin/team instead.
  console.error("  ensure-admins failed (continuing):", err?.message || err);
  process.exit(0);
});
