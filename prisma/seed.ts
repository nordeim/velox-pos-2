// ---------------------------------------------------------------------------
// VeloxPOS seed — idempotent demo data.
//
// Contract: early-returns when the demo user already exists. Changing seed
// VALUES requires deleting the target db (db/custom.db or db/e2e.db) first —
// the early-return will not refresh them.
//
// The default seed creates the demo account with ZERO domain rows so the
// app mirrors the reference's empty states (the parity surface). Run
// `bun run db:seed:sample` for a populated demo (categories, products,
// register, a closed shift with sales) — used for manual exploration.
// ---------------------------------------------------------------------------
import { hashPassword } from "../src/lib/auth";
import { db } from "../src/lib/db";

const DEMO_EMAIL = "demo@veloxpos.app";
const DEMO_PASSWORD = "Demo1234!";

async function ensureDemoUser(): Promise<{ id: string }> {
  const existing = await db.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) return existing;
  const user = await db.user.create({
    data: {
      email: DEMO_EMAIL,
      passwordHash: hashPassword(DEMO_PASSWORD),
      fullName: "Demo Cashier",
      role: "admin",
      emailVerified: true,
    },
  });
  await db.storeSetting.create({
    data: { userId: user.id, storeName: "VeloxPOS Store" },
  });
  return user;
}

async function main(): Promise<void> {
  const user = await ensureDemoUser();
  const existingRegister = await db.register.findFirst({
    where: { userId: user.id },
  });
  if (existingRegister) {
    console.log(
      `Seed: demo data already present (${DEMO_EMAIL}) — nothing to do.`,
    );
    return;
  }

  await db.register.create({
    data: { userId: user.id, name: "Register 1", location: "Main entrance" },
  });

  console.log(`Seed: demo account ready — ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
