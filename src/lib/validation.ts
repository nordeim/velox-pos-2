// ---------------------------------------------------------------------------
// Every VeloxPOS API payload contract. Zod v4 in strip mode (unknown keys
// dropped — the repo-wide convention). Unit-pinned by tests/unit/validation.test.ts.
// ---------------------------------------------------------------------------

import { z } from "zod";

import { isCardProvider, isSupportedCurrency } from "./currency";
import { UNITS } from "./inventory-status";

// ---- shared atoms ----------------------------------------------------------

const idField = z.string().min(1);
/** Dialogs send "" for cleared relations — accept it and map to null. */
const nullableId = z
  .union([idField, z.literal("")])
  .nullish()
  .transform((v) => (v === "" ? null : (v ?? null)));
const money = z.coerce.number().min(0).max(1_000_000);
const percent = z.coerce.number().min(0).max(100);
const quantity = z.coerce.number().min(0).max(1_000_000);
const boundedText = z.string().min(1).max(200);
const optionalText = z
  .string()
  .max(500)
  .transform((v) => v.trim());
const dataUrl = z
  .string()
  .max(2_000_000)
  .refine((v) => v === "" || v.startsWith("data:"), "Not a valid data URL")
  .nullish()
  .transform((v) => (v === "" ? null : (v ?? null)));

// ---- products ----------------------------------------------------------------

export const productCreateSchema = z.object({
  name: boundedText,
  barcode: z
    .string()
    .max(500)
    .nullish()
    .transform((v) => (v ?? "").trim()),
  categoryId: nullableId,
  price: money,
  cost: money.nullish().transform((v) => (v == null ? null : v)),
  stock: quantity,
  minStock: quantity,
  taxRate: percent,
  unit: z.enum(UNITS).default("Piece"),
  image: dataUrl,
  active: z.boolean().default(true),
});

export const productUpdateSchema = productCreateSchema.partial();

// ---- categories ----------------------------------------------------------------

export const categoryCreateSchema = z.object({
  name: boundedText,
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #8b5cf6")
    .default("#8b5cf6"),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

// ---- registers ------------------------------------------------------------------

export const registerCreateSchema = z.object({
  name: boundedText,
  location: z
    .string()
    .max(500)
    .nullish()
    .transform((v) => (v ?? "").trim()),
});

export const registerUpdateSchema = registerCreateSchema.partial().extend({
  status: z.enum(["closed", "open"]).optional(),
});

// ---- shifts -----------------------------------------------------------------------

export const shiftOpenSchema = z.object({
  registerId: idField,
  openingFloat: money.default(0),
});

export const shiftCloseSchema = z.object({
  countedCash: z.coerce.number().min(0).max(1_000_000),
});

// ---- sales (checkout) ----------------------------------------------------------------

export const saleItemSchema = z.object({
  productId: idField,
  name: boundedText,
  price: money,
  qty: z.coerce.number().int().min(1).max(999),
  taxRate: percent,
});

export const saleCreateSchema = z.object({
  items: z.array(saleItemSchema).min(1, "The cart is empty").max(200),
  paymentMethod: z.enum(["cash", "card"]),
  amountPaid: z.coerce.number().min(0).max(1_000_000).nullish(),
  customer: z
    .string()
    .max(500)
    .nullish()
    .transform((v) => (v ?? "").trim()),
});

// ---- store settings -----------------------------------------------------------------

const currencyEnum = z
  .string()
  .refine(isSupportedCurrency, "Unsupported currency code");

const cardProviderEnum = z
  .string()
  .refine(isCardProvider, "Unsupported card provider");

export const storeSettingsUpdateSchema = z
  .object({
    storeName: boundedText,
    logoDataUrl: dataUrl,
    address: z
      .string()
      .max(500)
      .nullish()
      .transform((v) => (v ?? "").trim()),
    phone: z
      .string()
      .max(500)
      .nullish()
      .transform((v) => (v ?? "").trim()),
    email: z
      .union([z.literal(""), z.string().email()])
      .nullish()
      .transform((v) => (v ?? "").trim()),
    taxId: z
      .string()
      .max(500)
      .nullish()
      .transform((v) => (v ?? "").trim()),
    currency: currencyEnum,
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #6366f1"),
    secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #8b5cf6"),
    receiptFooter: z
      .string()
      .max(500)
      .nullish()
      .transform((v) => (v ?? "").trim()),
    hideFiscalOnReceipt: z.boolean(),
    fiscalRuc: z
      .string()
      .max(500)
      .nullish()
      .transform((v) => (v ?? "").trim()),
    fiscalBusinessType: z
      .string()
      .max(500)
      .nullish()
      .transform((v) => (v ?? "").trim()),
    fiscalAddress: z
      .string()
      .max(500)
      .nullish()
      .transform((v) => (v ?? "").trim()),
    fiscalExpenseAccount: z
      .string()
      .max(500)
      .nullish()
      .transform((v) => (v ?? "").trim()),
    cardProvider: cardProviderEnum,
  })
  .partial();

// ---- cashiers (owner-only user management) --------------------------------------------

export const cashierCreateSchema = z.object({
  fullName: boundedText,
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export const cashierUpdateSchema = z.object({
  fullName: boundedText.optional(),
  active: z.boolean().optional(),
  password: z.string().min(8).max(200).optional(),
});

// ---- auth (the scaffolding's contracts — unchanged) -----------------------------------

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export const registerSchema = z.object({
  fullName: z.string().max(100).optional().default(""),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
});

export const resetPasswordSchema = z.object({
  token: z.string().regex(/^[0-9a-f]{48}$/),
  password: z.string().min(8).max(200),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(200),
    newPassword: z.string().min(8).max(200),
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    message: "The new password must be different from your current password.",
  });

export const deleteAccountSchema = z
  .object({
    password: z.string().min(8).max(200),
    confirmation: z.string(),
  })
  .refine((v) => v.confirmation === "DELETE", {
    message: "Type DELETE to confirm.",
  });

export const changeEmailSchema = z
  .object({
    password: z.string().min(8).max(200),
    newEmail: z.string().max(200).email(),
    confirmEmail: z.string().max(200).email(),
  })
  .refine((v) => v.newEmail === v.confirmEmail, {
    message: "The email addresses do not match.",
  });

// ---- types ------------------------------------------------------------------------

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type RegisterCreateInput = z.infer<typeof registerCreateSchema>;
export type ShiftOpenInput = z.infer<typeof shiftOpenSchema>;
export type ShiftCloseInput = z.infer<typeof shiftCloseSchema>;
export type SaleCreateInput = z.infer<typeof saleCreateSchema>;
export type StoreSettingsUpdateInput = z.infer<typeof storeSettingsUpdateSchema>;
export type CashierCreateInput = z.infer<typeof cashierCreateSchema>;
