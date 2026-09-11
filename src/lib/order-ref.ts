import { db } from "@/lib/db";
import { ProductType } from "@prisma/client";

// Human order numbers.
//
// The admin's whole workflow is "customer sends me a number on WhatsApp, I find
// the order and activate them", so the number has to be short, speakable and
// say which product it is at a glance. The two products count on separate
// sequences deliberately — SP-00001 and CO-00001 both exist:
//
//   SP-00001  Training Split (the PDF)
//   CO-00001  Personal Coaching (PDF + 3 months of WhatsApp coaching)
//
// The counter row is incremented atomically by Postgres, so two customers
// pressing Confirm in the same millisecond cannot be handed the same number.

export const SERIAL_PREFIX: Record<ProductType, string> = {
  TRAINING_PLAN: "SP",
  PERSONAL_COACHING: "CO",
};

const COUNTER_KEY: Record<ProductType, string> = {
  TRAINING_PLAN: "order-serial:split",
  PERSONAL_COACHING: "order-serial:coaching",
};

/**
 * Next order number for a product type. Pass the transaction client when
 * called inside one, so a rolled-back order doesn't burn a number.
 */
export async function nextOrderRef(
  type: ProductType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any = db
): Promise<string> {
  const key = COUNTER_KEY[type] ?? COUNTER_KEY.TRAINING_PLAN;
  const prefix = SERIAL_PREFIX[type] ?? SERIAL_PREFIX.TRAINING_PLAN;

  // upsert + increment is one statement per branch and row-level atomic, so
  // concurrent checkouts serialise on the counter row rather than colliding.
  const row = await client.counter.upsert({
    where: { key },
    update: { value: { increment: 1 } },
    create: { key, value: 1 },
  });

  return `${prefix}-${String(row.value).padStart(5, "0")}`;
}
