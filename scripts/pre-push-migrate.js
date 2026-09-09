#!/usr/bin/env node
/**
 * Pre-`db push` migration guard.
 *
 * `prisma db push` cannot add a UNIQUE NOT NULL column to a table that already
 * has rows. Prisma's `@default(cuid())` is generated in application code, not by
 * Postgres, so the new column arrives NULL for every existing row and the
 * constraint fails immediately.
 *
 * That is exactly what broke deployment from 2026-09-05 onward: `orders.
 * accessToken` (`String @unique @default(cuid())`) was added to the schema, and
 * every subsequent deploy died here in ~25s under `set -e` — before npm install
 * or the build mattered — leaving the VPS serving the old bundle while GitHub
 * showed a red run.
 *
 * This script brings such columns to their target state *before* `db push` runs,
 * so `db push` finds nothing left to change. Every statement is idempotent
 * (IF NOT EXISTS / WHERE IS NULL), so on an already-migrated database the whole
 * thing is a no-op and safe to run on every deploy.
 *
 * It deliberately uses `pg` directly rather than Prisma Client: the client is
 * generated from the *new* schema and would refuse to query a table whose shape
 * hasn't caught up yet.
 */

const { Client } = require("pg");

/**
 * Each entry: add the column if missing, fill existing rows, then enforce the
 * constraints. `fillExpr` must be valid SQL that produces a distinct value per
 * row when the column is unique.
 */
const COLUMN_MIGRATIONS = [
  {
    table: "orders",
    column: "accessToken",
    type: "TEXT",
    // gen_random_bytes needs pgcrypto; fall back to a random UUID (built in on
    // PG 13+) when the extension isn't installed. Both are unguessable, and the
    // application overwrites this on every new order anyway — this value only
    // has to exist and be unique for rows created before the column did.
    fillExpr: "encode(gen_random_bytes(32), 'base64')",
    fallbackFillExpr: "gen_random_uuid()::text",
    notNull: true,
    uniqueIndex: "orders_accessToken_key",
  },
];

async function tableExists(client, table) {
  const { rows } = await client.query("SELECT to_regclass($1) AS t", [
    `public.${table}`,
  ]);
  return Boolean(rows[0] && rows[0].t);
}

async function migrateColumn(client, m) {
  const { table, column, type, fillExpr, fallbackFillExpr, notNull, uniqueIndex } = m;

  if (!(await tableExists(client, table))) {
    console.log(`  · ${table}: table does not exist yet — nothing to migrate`);
    return;
  }

  await client.query(
    `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${column}" ${type}`
  );

  // Try the preferred fill inside a savepoint. Without one, a failed statement
  // (e.g. pgcrypto's gen_random_bytes not installed) poisons the surrounding
  // transaction, so the fallback UPDATE would itself fail with "current
  // transaction is aborted" — turning a recoverable case into a hard stop.
  let filled;
  await client.query("SAVEPOINT fill_attempt");
  try {
    filled = await client.query(
      `UPDATE "${table}" SET "${column}" = ${fillExpr} WHERE "${column}" IS NULL`
    );
    await client.query("RELEASE SAVEPOINT fill_attempt");
  } catch (err) {
    await client.query("ROLLBACK TO SAVEPOINT fill_attempt");
    if (!fallbackFillExpr) throw err;
    console.log(`  · ${table}.${column}: primary fill failed (${err.message}); using fallback`);
    filled = await client.query(
      `UPDATE "${table}" SET "${column}" = ${fallbackFillExpr} WHERE "${column}" IS NULL`
    );
  }

  if (uniqueIndex) {
    await client.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "${uniqueIndex}" ON "${table}"("${column}")`
    );
  }
  if (notNull) {
    await client.query(
      `ALTER TABLE "${table}" ALTER COLUMN "${column}" SET NOT NULL`
    );
  }

  console.log(
    `  · ${table}.${column}: ready (${filled.rowCount} row(s) backfilled)`
  );
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set — cannot run pre-push migration.");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();
  try {
    // One transaction for the whole run: either the schema reaches its target
    // state or the database is left exactly as it was. Also gives the per-column
    // SAVEPOINTs a transaction to live in.
    await client.query("BEGIN");
    try {
      for (const m of COLUMN_MIGRATIONS) {
        await migrateColumn(client, m);
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      throw err;
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Pre-push migration failed:", err.message);
  process.exit(1);
});
