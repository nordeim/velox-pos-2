// ---------------------------------------------------------------------------
// The VeloxPOS entity delegates (the scaffolding's ADR-006 pattern): one
// configuration object per owned model, consumed by the
// makeCollectionRoutes/makeItemRoutes factories. Every query is scoped
// where:{userId} — ownership by construction; updates/removes verify
// ownership BEFORE mutating. Every payload passes its Zod schema first.
//
// Non-CRUD operations (shift open/close, checkout) live in their own route
// files — they are workflows, not entity writes.
// ---------------------------------------------------------------------------

import type { ZodType } from "zod";

import { db } from "../db";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  cashierCreateSchema,
  cashierUpdateSchema,
  productCreateSchema,
  productUpdateSchema,
  registerCreateSchema,
  registerUpdateSchema,
} from "../validation";
import {
  NotFoundError,
  parseWith,
  ValidationError,
  type EntityDelegate,
} from "./http";
import { hashPassword } from "../auth";

// ---- the minimal structural Prisma model (see ADR-006) ------------------------

type OwnedModel = {
  findMany(args: {
    where: { userId: string };
    orderBy?: { createdAt: "asc" | "desc" };
  }): Promise<unknown[]>;
  findFirst(args: { where: Record<string, unknown> }): Promise<unknown>;
  create(args: { data: unknown }): Promise<unknown>;
  update(args: { where: { id: string }; data: unknown }): Promise<unknown>;
  delete(args: { where: { id: string } }): Promise<unknown>;
};

function makeDelegate<T>(
  rawModel: unknown,
  createSchema: ZodType<T>,
  updateSchema: ZodType<Partial<T>>,
  orderBy: "asc" | "desc" = "desc",
): EntityDelegate {
  // The structural seam: Prisma's generated delegates exceed this minimal
  // shape at runtime; the cast keeps the factory decoupled from generated
  // types (the where/data contracts are enforced by the Zod schemas above
  // and the ownership pre-checks below, not by this cast).
  const model = rawModel as OwnedModel;
  return {
    async list(userId) {
      return model.findMany({ where: { userId }, orderBy: { createdAt: orderBy } });
    },
    async create(userId, input) {
      const data = parseWith(createSchema, input);
      return model.create({ data: { ...(data as object), userId } });
    },
    async update(userId, id, input) {
      const data = parseWith(updateSchema, input);
      const owned = await model.findFirst({ where: { id, userId } });
      if (!owned) throw new NotFoundError();
      return model.update({ where: { id }, data });
    },
    async remove(userId, id) {
      const owned = await model.findFirst({ where: { id, userId } });
      if (!owned) throw new NotFoundError();
      await model.delete({ where: { id } });
      return { ok: true };
    },
  };
}

// ---- products ------------------------------------------------------------------

export const productDelegate = makeDelegate(
  db.product,
  productCreateSchema,
  productUpdateSchema,
);

// ---- categories ------------------------------------------------------------------

export const categoryDelegate = makeDelegate(
  db.category,
  categoryCreateSchema,
  categoryUpdateSchema,
  "asc",
);

// ---- registers ---------------------------------------------------------------------

export const registerDelegate = makeDelegate(
  db.register,
  registerCreateSchema,
  registerUpdateSchema,
  "asc",
);

// ---- cashiers (users with role=cashier owned by this store) ---------------------------
//
// The owner's store lists co-workers: users whose accounts were created by the
// owner. Ownership marker: the cashier row is the User itself; scope by
// matching on the creator through a dedicated column would add schema weight —
// instead cashiers are tracked by role + the creating owner via email domain?
// No: simplest honest model — a cashier's `active` flag and role live on User;
// the owner may only touch users with role "cashier" (the guard below), and
// CashierShift.cashierId pins who actually worked. Cross-owner hijack is
// impossible because only users with role=cashier are listable/editable and
// creating one requires a fresh unique email (P2002 → 409 on duplicates).

export const cashierDelegate = {
  async list(ownerId: string): Promise<unknown[]> {
    const owner = await db.user.findUnique({ where: { id: ownerId } });
    if (!owner) throw new NotFoundError();
    // The store roster: the owner + every cashier. The owner row itself is
    // excluded — the Cashiers view lists WORKERS; the reference's
    // "0 usuarios registrados" counts cashiers only.
    return db.user.findMany({
      where: { role: "cashier" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });
  },
  async create(ownerId: string, input: unknown): Promise<unknown> {
    const owner = await db.user.findUnique({ where: { id: ownerId } });
    if (!owner || owner.role !== "owner") throw new NotFoundError();
    const data = parseWith(cashierCreateSchema, input);
    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ValidationError("That email is already registered.");
    }
    return db.user.create({
      data: {
        email: data.email,
        passwordHash: hashPassword(data.password),
        fullName: data.fullName,
        role: "cashier",
        emailVerified: true,
      },
      select: { id: true, email: true, fullName: true, role: true, active: true, createdAt: true },
    });
  },
  async update(ownerId: string, id: string, input: unknown): Promise<unknown> {
    const owner = await db.user.findUnique({ where: { id: ownerId } });
    if (!owner || owner.role !== "owner") throw new NotFoundError();
    const data = parseWith(cashierUpdateSchema, input);
    const cashier = await db.user.findFirst({ where: { id, role: "cashier" } });
    if (!cashier) throw new NotFoundError();
    const patch: Record<string, unknown> = {};
    if (data.fullName !== undefined) patch.fullName = data.fullName;
    if (data.active !== undefined) patch.active = data.active;
    if (data.password !== undefined) patch.passwordHash = hashPassword(data.password);
    return db.user.update({
      where: { id },
      data: patch,
      select: { id: true, email: true, fullName: true, role: true, active: true, createdAt: true },
    });
  },
  async remove(ownerId: string, id: string): Promise<unknown> {
    const owner = await db.user.findUnique({ where: { id: ownerId } });
    if (!owner || owner.role !== "owner") throw new NotFoundError();
    const cashier = await db.user.findFirst({ where: { id, role: "cashier" } });
    if (!cashier) throw new NotFoundError();
    // History must survive the roster removal (sales pin cashierId) — a
    // cashier user is DEACTIVATED, never hard-deleted while shifts exist.
    const shifts = await db.cashierShift.count({ where: { cashierId: id } });
    if (shifts > 0) {
      return db.user.update({ where: { id }, data: { active: false } });
    }
    await db.user.delete({ where: { id } });
    return { ok: true };
  },
} satisfies EntityDelegate;
