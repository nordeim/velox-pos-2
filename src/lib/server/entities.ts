// ---------------------------------------------------------------------------
// The entity delegates (ADR-006 shape, VeloxPOS): one configuration object
// per owned model, consumed by the makeCollectionRoutes/makeItemRoutes
// factories. Every query is scoped where:{userId} — ownership by
// construction; updates/removes verify ownership BEFORE mutating. Every
// payload passes its Zod schema first.
// ---------------------------------------------------------------------------

import type { ZodType } from "zod";

import { db } from "../db";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  productCreateSchema,
  productUpdateSchema,
  registerCreateSchema,
  registerUpdateSchema,
} from "../validation";
import { NotFoundError, parseWith, type EntityDelegate } from "./http";

type Row = Record<string, unknown>;

// ---- the minimal structural Prisma model --------------------------------------

type OwnedModel = {
  findMany(args: {
    where: { userId: string };
    orderBy?: { createdAt: "asc" | "desc" } | { name: "asc" };
  }): Promise<unknown[]>;
  findFirst(args: { where: Record<string, unknown> }): Promise<unknown>;
  create(args: { data: unknown }): Promise<unknown>;
  update(args: { where: { id: string }; data: unknown }): Promise<unknown>;
  delete(args: { where: { id: string } }): Promise<unknown>;
};

// ---- the owned-delegate factory -------------------------------------------------

type OwnedConfig = {
  model: OwnedModel;
  createSchema: ZodType<Row>;
  updateSchema: ZodType<Row>;
  /** Boundary-name → column-name mapping (products carry dollar inputs
   *  that land as *Cents columns). Applied to BOTH create and update. */
  mapData?: (data: Row) => Row;
};

function makeOwnedDelegate(config: OwnedConfig): EntityDelegate {
  // Prisma's generated model delegates are structurally compatible but their
  // generic `update` signature resists structural assignment — the seam
  // narrows through `as unknown as OwnedModel` ONCE, here, and every route
  // stays 3-line shells.
  const model = config.model as unknown as OwnedModel;
  const mapData = config.mapData ?? ((data: Row) => data);
  async function assertOwned(userId: string, id: string): Promise<void> {
    const row = await model.findFirst({ where: { id, userId } });
    if (!row) throw new NotFoundError();
  }
  return {
    list: (userId) =>
      model.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    create: async (userId, input) => {
      const data = parseWith(config.createSchema, input);
      return model.create({ data: { ...mapData(data), userId } });
    },
    update: async (userId, id, input) => {
      await assertOwned(userId, id);
      const data = parseWith(config.updateSchema, input);
      return model.update({ where: { id }, data: mapData(data) });
    },
    remove: async (userId, id) => {
      await assertOwned(userId, id);
      return model.delete({ where: { id } });
    },
  };
}

// ---- categories -----------------------------------------------------------------

export const categoryDelegate = makeOwnedDelegate({
  model: db.category as unknown as OwnedModel,
  createSchema: categoryCreateSchema,
  updateSchema: categoryUpdateSchema,
});

// ---- registers ---------------------------------------------------------------------

export const registerDelegate = makeOwnedDelegate({
  model: db.register as unknown as OwnedModel,
  createSchema: registerCreateSchema,
  updateSchema: registerUpdateSchema,
});

// ---- products -----------------------------------------------------------------------
// Product create/update is the money-mapped delegate: the payload's price/
// cost arrive in dollars (Zod moneyInput maps to cents) and land on the
// schema's *Cents columns. Partial updates carry whichever keys arrived.

function mapProductData(data: Row): Row {
  const { price, cost, ...rest } = data;
  if (price !== undefined) rest.priceCents = price;
  if (cost !== undefined) rest.costCents = cost;
  return rest;
}

export const productDelegate = makeOwnedDelegate({
  model: db.product as unknown as OwnedModel,
  createSchema: productCreateSchema,
  updateSchema: productUpdateSchema,
  mapData: mapProductData,
});
