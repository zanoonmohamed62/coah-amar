import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

// ─────────────────────────────────────────────────────────────
// ORDERS / CHECKOUT
// ─────────────────────────────────────────────────────────────

export const createOrderSchema = z.object({
  productId: z.string().cuid("Invalid product ID"),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  paymentMethod: z.enum(["INSTAPAY", "VISA_CARD", "PAYPAL"]),
  goal: z.string().optional(),
  level: z.string().optional(),
  notes: z.string().optional(),
  isRenewal: z.boolean().default(false),
  orderRef: z.string(), // AMAR-xxxxxx generated client-side
});

// ─────────────────────────────────────────────────────────────
// PRODUCTS (admin)
// ─────────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  type: z.enum(["TRAINING_PLAN", "PERSONAL_COACHING"]),
  price: z.number().int().min(100),
  currency: z.string().default("EGP"),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateProductSchema = createProductSchema.partial();

// ─────────────────────────────────────────────────────────────
// TRAINING PROGRAM (admin)
// ─────────────────────────────────────────────────────────────

export const createProgramSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  split: z.string(),
  totalWeeks: z.number().int().min(1).default(1),
  productId: z.string().cuid().optional(),
});

export const updateProgramSchema = createProgramSchema.partial().extend({
  isPublished: z.boolean().optional(),
});

// ─────────────────────────────────────────────────────────────
// TRAINING DAY (admin)
// ─────────────────────────────────────────────────────────────

export const createDaySchema = z.object({
  name: z.string().min(1),
  dayLabel: z.string().optional(),
  focus: z.string().optional(),
  isRestDay: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  notes: z.string().optional(),
});

export const updateDaySchema = createDaySchema.partial();

// ─────────────────────────────────────────────────────────────
// EXERCISE (admin)
// ─────────────────────────────────────────────────────────────

export const createExerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.number().int().min(1).optional(),
  reps: z.string().optional(),
  rest: z.string().optional(),
  instructions: z.string().optional(),
  notes: z.string().optional(),
  sortOrder: z.number().int().default(0),
  imageId: z.string().cuid().optional(),
  videoId: z.string().cuid().optional(),
});

export const updateExerciseSchema = createExerciseSchema.partial();

// ─────────────────────────────────────────────────────────────
// ENTITLEMENT (admin manual grant)
// ─────────────────────────────────────────────────────────────

export const grantEntitlementSchema = z.object({
  productId: z.string().cuid(),
  orderId: z.string().cuid().optional(),
  expiresAt: z.string().datetime().optional(),
  note: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────
// CMS
// ─────────────────────────────────────────────────────────────

export const updateContentSchema = z.object({
  sectionId: z.string(),
  fieldId: z.string(),
  lang: z.enum(["en", "ar"]),
  value: z.string(),
  draft: z.boolean().default(true), // true = save as draft, false = publish immediately
});

export const publishContentSchema = z.object({
  sectionId: z.string().optional(), // publish all fields in section
  fieldId: z.string().optional(),   // or a specific field
  lang: z.enum(["en", "ar"]).optional(),
});

// ─────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────

export const updateSettingSchema = z.object({
  key: z.string(),
  value: z.string(),
});

// ─────────────────────────────────────────────────────────────
// CUSTOMER (admin)
// ─────────────────────────────────────────────────────────────

export const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
export type CreateDayInput = z.infer<typeof createDaySchema>;
export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;
