// ---------------------------------------------------------------------------
// Every API payload contract (VeloxPOS). Zod in strip mode (unknown keys
// dropped — the repo-wide convention). Unit-pinned by tests/validation.test.ts.
// ---------------------------------------------------------------------------

import { z } from "zod";

import { PAYMENT_METHODS } from "./cart";

// ---- shared atoms ----------------------------------------------------------

const idField = z.string().min(1);
/** Dialogs send "" for cleared relations — accept it and map to null. */
const nullableId = z
  .union([idField, z.literal("")])
  .nullish()
  .transform((v) => (v === "" ? null : (v ?? null)));
const shortText = z.string().min(1).max(120);
const mediumText = z.string().min(1).max(200);
const optionalShort = z
  .string()
  .max(200)
  .optional()
  .transform((v) => v ?? "");
const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .optional()
  .transform((v) => v ?? "#7c3aed");

const moneyInput = z.union([z.number(), z.string()]).transform((v) => {
  const value = typeof v === "string" ? Number.parseFloat(v) : v;
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 100);
});

const intInput = z.union([z.number(), z.string()]).transform((v) => {
  const value = typeof v === "string" ? Number.parseInt(v, 10) : v;
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.trunc(value));
});

const percentInput = z.union([z.number(), z.string()]).transform((v) => {
  const value = typeof v === "string" ? Number.parseFloat(v) : v;
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(100, Math.round(value));
});

export const UNITS = [
  "Piece",
  "Box",
  "Pack",
  "Kilogram",
  "Gram",
  "Liter",
  "Milliliter",
] as const;
export const unitField = z.enum(UNITS).default("Piece");

export const ROLES = ["admin", "cashier"] as const;
const roleField = z.enum(ROLES).default("cashier");

// ---- auth (shared with the existing routes) --------------------------------

export const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
});

export const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().max(200),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10).max(200),
  password: z.string().min(8).max(200),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(8).max(200),
});

/** The change-email journey: current-password proof + the typed-twice
 *  confirmation guarding the typo lockout (must match + must differ). */
export const changeEmailSchema = z
  .object({
    password: z.string().min(1).max(200),
    newEmail: z.string().email().max(200),
    confirmEmail: z.string().email().max(200),
  })
  .refine((v) => v.newEmail.toLowerCase() === v.confirmEmail.toLowerCase(), {
    message: "The email addresses do not match.",
  });

export const deleteAccountSchema = z
  .object({
    password: z.string().min(1).max(200),
    confirmation: z.string(),
  })
  .refine((v) => v.confirmation === "DELETE", {
    message: "Type DELETE to confirm.",
  });

export const verifyEmailSchema = z.object({
  email: z.string().email().max(200),
  code: z.string().min(4).max(8),
});

// ---- categories --------------------------------------------------------------

export const categoryCreateSchema = z.object({
  name: shortText,
  color: hexColor,
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

// ---- products -----------------------------------------------------------------

export const productCreateSchema = z.object({
  name: mediumText,
  barcode: z.string().min(1).max(64),
  categoryId: nullableId,
  price: moneyInput, // dollars in, cents out
  cost: moneyInput.optional().default(0),
  stock: intInput.optional().default(0),
  minStock: intInput.optional().default(5),
  taxRate: percentInput.optional().default(16),
  unit: unitField,
  imageUrl: optionalShort,
  active: z.boolean().optional().default(true),
});

export const productUpdateSchema = productCreateSchema.partial();

// ---- registers ------------------------------------------------------------------

export const registerCreateSchema = z.object({
  name: shortText,
  location: optionalShort,
});

export const registerUpdateSchema = registerCreateSchema.partial();

// ---- shifts -----------------------------------------------------------------------

export const shiftOpenSchema = z.object({
  registerId: idField,
  openingFloat: moneyInput.optional().default(0),
});

export const shiftCloseSchema = z.object({
  closingCash: moneyInput,
});

// ---- sales ---------------------------------------------------------------------------

export const saleCreateSchema = z.object({
  registerId: idField,
  method: z.enum(PAYMENT_METHODS).default("cash"),
  customerName: optionalShort,
  note: z
    .string()
    .max(500)
    .optional()
    .transform((v) => v ?? ""),
  discount: moneyInput.optional().default(0),
  paid: moneyInput.optional().default(0),
  items: z
    .array(
      z.object({
        productId: idField,
        qty: z.number().int().min(1).max(9999),
      }),
    )
    .min(1, "A sale needs at least one item."),
});

export const saleUpdateSchema = z.object({
  status: z.enum(["completed", "refunded"]),
});

// ---- cashiers ----------------------------------------------------------------------------

export const cashierCreateSchema = z.object({
  name: shortText,
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
  role: roleField,
  phone: optionalShort,
});

export const cashierUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  role: roleField.optional(),
  phone: optionalShort,
  active: z.boolean().optional(),
});

// ---- settings --------------------------------------------------------------------------------

export const settingsUpdateSchema = z.object({
  storeName: z.string().min(1).max(120).optional(),
  address: optionalShort,
  phone: optionalShort,
  currency: z
    .string()
    .min(3)
    .max(3)
    .optional()
    .transform((v) => (v ?? "USD").toUpperCase()),
  receiptFooter: optionalShort,
  defaultTaxRate: percentInput.optional(),
});

export const accountUpdateSchema = z.object({
  name: z.string().min(1).max(120),
  phone: optionalShort,
});
