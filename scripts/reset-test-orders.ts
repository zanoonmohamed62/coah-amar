/**
 * One-off cleanup for the accessToken rollout.
 *
 * Orders created before accessToken existed have no unguessable key, so their
 * payment pages can't be opened under the new token-scoped routes. The orders
 * in the database at rollout time were test data, so this clears them (and the
 * entitlements/proof records that hang off them) rather than backfilling keys
 * for orders nobody is waiting on.
 *
 * Run once, manually:  npx tsx scripts/reset-test-orders.ts
 * Not wired into deploy — it must never run against real orders.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const orders = await db.order.findMany({
    select: { id: true, orderRef: true, customerEmail: true, status: true },
  });

  if (orders.length === 0) {
    console.log("No orders found — nothing to clean up.");
    return;
  }

  console.log(`Deleting ${orders.length} order(s):`);
  for (const o of orders) {
    console.log(`  ${o.orderRef}  ${o.status}  ${o.customerEmail}`);
  }

  // Entitlements reference orders, so they go first.
  const { count: entitlementCount } = await db.entitlement.deleteMany({});
  const { count: orderCount } = await db.order.deleteMany({});

  console.log(`\nDeleted ${orderCount} order(s) and ${entitlementCount} entitlement(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
