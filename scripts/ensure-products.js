#!/usr/bin/env node
/**
 * Guarantees the two sellable products exist and are active.
 *
 * Checkout is dead without them: `GET /api/products` returns `{"products":[]}`,
 * both checkout pages fail to resolve a productId, and the customer gets
 * "Product not loaded. Please refresh the page." with no way forward — the
 * button never submits. That is exactly what production hit after the products
 * table came back empty, while CMS content and settings survived.
 *
 * This is deliberately NOT `prisma/seed.ts`. That seed also upserts the admin
 * user and **resets its password** from COACH_PASSWORD on every run, which is
 * not something a deploy should do silently. This script touches products only.
 *
 * Safety rules, in order of importance:
 *   1. It never overwrites prices. If a product row already exists, the only
 *      thing it may change is flipping isActive back to true — pricing is the
 *      admin's to set in /admin/products, and clobbering it on every deploy
 *      would silently undo their work.
 *   2. It only creates a product when that slug is missing entirely.
 *   3. It is idempotent: on a healthy database it reports and changes nothing.
 */

const { Client } = require("pg");

try {
  const dotenv = require("dotenv");
  dotenv.config({ path: ".env.local" });
  dotenv.config({ path: ".env" });
} catch {
  // Fine when DATABASE_URL is already exported (CI).
}

// Values match prisma/seed.ts. Used only when a row has to be created from
// scratch; an existing row's prices are left exactly as the admin set them.
const PRODUCTS = [
  {
    slug: "training-split",
    name: "Amar X Split",
    type: "TRAINING_PLAN",
    price: 29900,
    originalPrice: 49900,
    discountPercent: 40,
    promoCounterBase: 56,
    promoCounterLimit: 100,
    description: "Your complete 7-day structured training split.",
    features: [
      "Complete 7-day training structure",
      "Sets & rep ranges",
      "Weak-point priority system",
      "Rest time rules",
      "Progressive overload rule",
      "Training log & progress tracking",
    ],
    sortOrder: 1,
  },
  {
    slug: "personal-coaching",
    name: "Personal Coaching",
    type: "PERSONAL_COACHING",
    price: 149900,
    originalPrice: 249900,
    discountPercent: 40,
    promoCounterBase: 16,
    promoCounterLimit: 100,
    description: "3 months of personal coaching + training split.",
    features: [
      "Everything in Amar X Split",
      "WhatsApp coaching access",
      "3-month access period",
      "Renewal available",
    ],
    sortOrder: 2,
  },
];

function cuid() {
  // The products table's id has no database-side default (Prisma generates it),
  // so a raw INSERT has to supply one. Shape matches Prisma's cuid closely
  // enough for a primary key; uniqueness is what matters here.
  return (
    "c" +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 6)
  );
}

async function ensureProduct(client, p) {
  const { rows } = await client.query(
    'SELECT id, "isActive" FROM products WHERE slug = $1',
    [p.slug]
  );

  if (rows.length > 0) {
    const row = rows[0];
    if (row.isActive) {
      console.log(`  · ${p.slug}: present and active — unchanged`);
      return { created: 0, reactivated: 0 };
    }
    // Reactivating is the one edit worth making automatically: an inactive
    // product is invisible to checkout, which is the outage this script exists
    // to prevent. Prices are still left untouched.
    await client.query('UPDATE products SET "isActive" = true WHERE id = $1', [
      row.id,
    ]);
    console.log(`  · ${p.slug}: was inactive — reactivated (prices untouched)`);
    return { created: 0, reactivated: 1 };
  }

  await client.query(
    `INSERT INTO products
       (id, name, slug, type, price, currency, description, features,
        "isActive", "sortOrder", "originalPrice", "discountPercent",
        "promoCounterBase", "promoCounterLimit", "createdAt", "updatedAt")
     VALUES ($1,$2,$3,$4::"ProductType",$5,'EGP',$6,$7,true,$8,$9,$10,$11,$12,NOW(),NOW())`,
    [
      cuid(),
      p.name,
      p.slug,
      p.type,
      p.price,
      p.description,
      JSON.stringify(p.features),
      p.sortOrder,
      p.originalPrice,
      p.discountPercent,
      p.promoCounterBase,
      p.promoCounterLimit,
    ]
  );
  console.log(`  · ${p.slug}: MISSING — created`);
  return { created: 1, reactivated: 0 };
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set — cannot verify products.");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();
  try {
    const { rows } = await client.query("SELECT to_regclass('public.products') AS t");
    if (!rows[0] || !rows[0].t) {
      console.log("  products table does not exist yet — skipping");
      return;
    }

    let created = 0;
    let reactivated = 0;
    for (const p of PRODUCTS) {
      const r = await ensureProduct(client, p);
      created += r.created;
      reactivated += r.reactivated;
    }

    const { rows: active } = await client.query(
      'SELECT COUNT(*)::int AS n FROM products WHERE "isActive" = true'
    );
    console.log(
      `  active products: ${active[0].n} (created ${created}, reactivated ${reactivated})`
    );

    // Checkout cannot work without at least one active product, so treat this
    // as a deploy-blocking failure rather than shipping a dead buy button.
    if (active[0].n === 0) {
      console.error("No active products after check — checkout would be broken.");
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Product check failed:", err.message);
  process.exit(1);
});
