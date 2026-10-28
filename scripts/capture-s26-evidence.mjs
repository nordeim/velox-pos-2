// Session-26 evidence captures: the password-reset round-trip's surfaces
// (F-124). Runs against the dev server (:3000) running the remediated
// codebase.
//
// Standing tier note: the reset round-trip is STANDING-pinned in the e2e
// suite itself (tests/e2e/auth.spec.ts — the round-trip test + the one-shot
// test run on every `bun run test:e2e`). This script is the cycle's
// evidence-capture record (the s19..s25 family posture — self-provisioning
// fixture, re-runnable): screenshots 114-116.
//
// The fixture mirrors the spec's chain (a throwaway account: register →
// verify-email → forgot → the REAL 48-hex token) and the ANALYZE journey:
// the reset form rendering from the URL token (114), the submit's done
// state (115), and this cycle's mobile drawer capture at 390 (116 — the
// operator's priority surface). The self-clean deletes the throwaway
// account from the dev db (cascade removes its tokens — the dev db must
// end in the default state).
import { chromium, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { existsSync } from "node:fs";

const BASE = "http://localhost:3000";
const OUT = "/home/z/my-project/velox-pos-2/docs/screenshots";

const EMAIL = "reset.walk.ev@veloxpos.test";
const OLD_PASSWORD = "OldEvidence1!";
const NEW_PASSWORD = "NewEvidence2!";

if (!existsSync("db/custom.db")) {
  console.error("the dev db is absent — run bun run db:push && bun run db:seed first");
  process.exit(1);
}

const browser = await chromium.launch();

// The API legs ride bun's NATIVE fetch (not playwright's APIRequestContext):
// this script runs under bun, where playwright-core's set-cookie header
// parsing crashes on the response URL (the e2e specs are unaffected — they
// run under the node-based playwright runner, proven green 117/117). The
// legs need only status codes + JSON bodies — no cookie jar — so native
// fetch is the exact-fit tool (the "use the right runtime for the seam" law).
const post = async (path, data) => {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};

async function login(page) {
  await page.goto(BASE + "/login");
  await page.getByRole("button", { name: "Sign in", exact: true }).waitFor({ state: "visible" });
  await page.getByLabel("Email").fill("sepnetflix2023@outlook.com");
  await page.getByLabel("Password").fill("$Abcd1234");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(BASE + "/");
}

// ---- captures 114-115: the reset journey with a REAL token (guest tier) ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // The fixture (idempotent per email — the register route's three states).
  const reg = await post("/api/auth/register", {
    name: "Reset Walk",
    email: EMAIL,
    password: OLD_PASSWORD,
  });
  if (![200, 201].includes(reg.status) || !reg.body.ok) {
    console.error("fixture register failed:", reg.status, JSON.stringify(reg.body));
    process.exit(1);
  }
  if (reg.body.code) {
    const verify = await post("/api/auth/verify-email", { email: EMAIL, code: reg.body.code });
    if (verify.status !== 200) {
      console.error("fixture verify failed:", verify.status);
      process.exit(1);
    }
  }

  const forgot = await post("/api/auth/forgot-password", { email: EMAIL });
  const forgotBody = forgot.body;
  if (forgot.status !== 200 || !/^\/reset-password\?token=[0-9a-f]{48}$/.test(forgotBody.resetPath ?? "")) {
    console.error("fixture forgot failed:", forgot.status, JSON.stringify(forgotBody));
    process.exit(1);
  }
  console.log("fixture verified: the 48-hex one-shot token issued");

  // 114: the reset form rendering from the URL token.
  await page.goto(BASE + forgotBody.resetPath);
  await expect(page.getByRole("heading", { name: "Set new password" })).toBeVisible({
    timeout: 15000,
  });
  const formProbe = await page.evaluate(() => ({
    inputs: document.querySelectorAll("main.reset-canvas input").length,
    canvas: getComputedStyle(document.querySelector("main.reset-canvas")).backgroundColor,
  }));
  if (formProbe.inputs !== 2 || formProbe.canvas !== "rgb(249, 250, 251)") {
    console.error("CAPTURE 114 VERIFICATION FAILED:", JSON.stringify(formProbe));
    process.exit(1);
  }
  console.log("114 reset-form verified:", JSON.stringify(formProbe));
  await page.screenshot({ path: `${OUT}/114-session26-reset-form-real-token.png`, fullPage: false });

  // 115: the submit's done state (the password write + the one-shot
  // consumption — verified through the API after the capture).
  await page.getByLabel("New Password", { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel("Confirm New Password").fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Reset password" }).click();
  await expect(page.getByRole("heading", { name: "Password Updated" })).toBeVisible({
    timeout: 15000,
  });
  const doneProbe = await page.evaluate(() => ({
    h2: document.querySelector("h2")?.textContent,
    inputs: document.querySelectorAll("main.reset-canvas input").length,
    backLink: !!document.querySelector('a[href="/login"]'),
  }));
  if (doneProbe.h2 !== "Password Updated" || doneProbe.inputs !== 0 || !doneProbe.backLink) {
    console.error("CAPTURE 115 VERIFICATION FAILED:", JSON.stringify(doneProbe));
    process.exit(1);
  }
  console.log("115 done-state verified:", JSON.stringify(doneProbe));
  await page.screenshot({ path: `${OUT}/115-session26-password-updated.png`, fullPage: false });

  // The round-trip's completion legs, API-verified: the new password signs
  // in, the old one is dead, the consumed token rejects replays.
  const newLogin = await post("/api/auth/login", { email: EMAIL, password: NEW_PASSWORD });
  const oldLogin = await post("/api/auth/login", { email: EMAIL, password: OLD_PASSWORD });
  const replay = await post("/api/auth/reset-password", {
    token: forgotBody.resetPath.split("token=")[1],
    password: "ThirdPass3!",
  });
  if (newLogin.status !== 200 || oldLogin.status !== 401 || replay.status !== 400) {
    console.error("ROUND-TRIP COMPLETION FAILED:", {
      newLogin: newLogin.status,
      oldLogin: oldLogin.status,
      replay: replay.status,
    });
    process.exit(1);
  }
  console.log("round-trip completion verified: new=200 old=401 replay=400");
  await ctx.close();
}

// ---- capture 116: the mobile drawer at 390 (the operator's priority surface) ----
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await login(page);
  await page.goto(BASE + "/POS");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  const dialog = page.getByRole("dialog", { name: "Navigation menu" });
  await dialog.waitFor({ state: "visible" });
  await expect(dialog.getByRole("link")).toHaveCount(8);
  await page.waitForTimeout(700); // the animation-settle (the s16 lesson)
  const probe = await page.evaluate(() => {
    const d = document.querySelector("[role=dialog]");
    return {
      w: Math.round(d.getBoundingClientRect().width),
      overflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  if (probe.w !== 288 || probe.overflow) {
    console.error("CAPTURE 116 VERIFICATION FAILED:", JSON.stringify(probe));
    process.exit(1);
  }
  console.log("116 drawer verified:", JSON.stringify(probe));
  await page.screenshot({ path: `${OUT}/116-session26-mobile-drawer-390.png`, fullPage: false });
  await ctx.close();
}

await browser.close();

// ---- the self-clean: the dev db returns to its default state ----
{
  // The ABSOLUTE datasource URL (the documented quirk: .env-loaded relative
  // URLs resolve against the CWD, not the schema — pass it explicitly like
  // every other harness script).
  const db = new PrismaClient({
    datasources: { db: { url: `file:${process.cwd()}/db/custom.db` } },
  });
  const user = await db.user.findUnique({ where: { email: EMAIL }, select: { id: true } });
  if (user) {
    // Cascade removes the verification + reset tokens with the user.
    await db.user.delete({ where: { id: user.id } });
    console.log("self-clean verified: the throwaway account deleted (cascade tokens)");
  } else {
    console.log("self-clean: the throwaway account already absent");
  }
  const leftover = await db.passwordResetToken.count({ where: { user: { email: EMAIL } } });
  if (leftover !== 0) {
    console.error("SELF-CLEAN VERIFICATION FAILED:", leftover, "tokens remain");
    process.exit(1);
  }
  await db.$disconnect();
}

console.log("Session-26 evidence captured: 114-116");
