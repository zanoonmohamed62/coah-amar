import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  console.log("🌱 Seeding...");

  // Admin account
  const email = process.env.COACH_EMAIL || "admin@coachair.com";
  const password = process.env.COACH_PASSWORD || "CoachAmar2025!";
  const admin = await db.user.upsert({
    where: { email },
    create: { email, passwordHash: await bcrypt.hash(password, 12), name: "Coach Amar", role: "ADMIN" },
    update: { passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log(`✅ Admin: ${email} / ${password}`);

  // Products — price is the live checkout price, derived by GET /api/products
  // from originalPrice/discountPercent/promoCounterBase/promoCounterLimit.
  // Current launch promo: 40% off the first 100 buyers of each product.
  const trainingPlan = await db.product.upsert({
    where: { slug: "training-split" },
    create: { name: "Amar X Split", slug: "training-split", type: "TRAINING_PLAN", price: 29900, originalPrice: 49900, discountPercent: 40, promoCounterBase: 56, promoCounterLimit: 100, currency: "EGP", description: "Your complete 7-day structured training split.", features: JSON.stringify(["Complete 7-day training structure", "Sets & rep ranges", "Weak-point priority system", "Rest time rules", "Progressive overload rule", "Training log & progress tracking"]), isActive: true, sortOrder: 1 },
    update: { name: "Amar X Split", price: 29900, originalPrice: 49900, discountPercent: 40, promoCounterBase: 56, promoCounterLimit: 100 },
  });
  const coaching = await db.product.upsert({
    where: { slug: "personal-coaching" },
    create: { name: "Personal Coaching", slug: "personal-coaching", type: "PERSONAL_COACHING", price: 149900, originalPrice: 249900, discountPercent: 40, promoCounterBase: 16, promoCounterLimit: 100, currency: "EGP", description: "3 months of personal coaching + training split.", features: JSON.stringify(["Everything in Amar X Split", "WhatsApp coaching access", "3-month access period", "Renewal available"]), isActive: true, sortOrder: 2 },
    update: { price: 149900, originalPrice: 249900, discountPercent: 40, promoCounterBase: 16, promoCounterLimit: 100 },
  });
  console.log("✅ Products seeded");

  // Demo training program
  const program = await db.trainingProgram.upsert({
    where: { id: "demo-program-id" },
    create: {
      id: "demo-program-id",
      productId: trainingPlan.id,
      title: "PPL Training Split",
      description: "A Push/Pull/Legs split designed for maximum hypertrophy.",
      split: "Push / Pull / Legs",
      totalWeeks: 12,
      isPublished: true,
      publishedAt: new Date(),
    },
    update: { productId: trainingPlan.id, isPublished: true },
  });

  // Also link to coaching product
  await db.product.update({ where: { id: coaching.id }, data: {} }); // coaching gets the same program via entitlement

  // Add a sample day
  const existingDay = await db.trainingDay.findFirst({ where: { programId: program.id } });
  if (!existingDay) {
    const pushDay = await db.trainingDay.create({ data: { programId: program.id, name: "Day 1 — Push", dayLabel: "Monday", focus: "Chest, Shoulders, Triceps", sortOrder: 1 } });
    await db.exercise.createMany({ data: [
      { dayId: pushDay.id, name: "Barbell Bench Press", sets: 4, reps: "6-10", rest: "2-3 min", instructions: "Control the descent. Full range of motion.", sortOrder: 1 },
      { dayId: pushDay.id, name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: "90 sec", sortOrder: 2 },
      { dayId: pushDay.id, name: "Lateral Raises", sets: 4, reps: "15-20", rest: "60 sec", sortOrder: 3 },
      { dayId: pushDay.id, name: "Tricep Pushdown", sets: 3, reps: "12-15", rest: "60 sec", sortOrder: 4 },
    ]});
    await db.trainingDay.create({ data: { programId: program.id, name: "Day 2 — Pull", dayLabel: "Tuesday", focus: "Back, Biceps", sortOrder: 2 } });
    await db.trainingDay.create({ data: { programId: program.id, name: "Day 3 — Rest", dayLabel: "Wednesday", isRestDay: true, sortOrder: 3 } });
    await db.trainingDay.create({ data: { programId: program.id, name: "Day 4 — Legs", dayLabel: "Thursday", focus: "Quads, Hamstrings, Glutes", sortOrder: 4 } });
  }
  console.log("✅ Demo training program seeded");

  // Default settings
  const settings = [
    { key: "whatsapp_number", value: "+34610354255" },
    { key: "currency", value: "EGP" },
    { key: "site_name", value: "Coach Amar" },
  ];
  for (const s of settings) {
    await db.setting.upsert({ where: { key: s.key }, create: { ...s, updatedBy: admin.id }, update: {} });
  }
  console.log("✅ Settings seeded");
  console.log("\n🎉 Done!");
  console.log(`   Admin login: ${email} / ${password}`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await db.$disconnect(); await pool.end(); });
