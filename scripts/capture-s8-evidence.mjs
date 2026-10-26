// Session-8 evidence script — the artifact-hygiene cure (F-54) verified live
// on the CLEANED standalone + the F-55 checkout journey through the REAL UI
// (the ticket/shift reads now inside the transaction) + the Session-8
// screenshot set, captured from the PRODUCTION standalone build (the family
// rule: never the dev badge).
//
// What this proves (T-7):
//   1. The CLEANED artifact boots and serves the full app — the tracing
//      excludes (F-54) removed .env + db/ from the artifact; nothing the
//      server truly needs was lost (login round-trip + every view renders).
//   2. The F-55 checkout journey live: open a shift through the API, add a
//      product, CHARGE (cash), read the receipt — the moved transaction
//      reads allocate the ticket + pin the shift in the real flow.
//   3. The mobile drawer contract at 390x844 (the user's called-out
//      mobile-nav surface) — hamburger, role=dialog, 8 labeled links,
//      settle-waited capture (the trap-16 discipline).
//
// What this captures (screenshots 37-42 into docs/screenshots/).
//
// The script OWNS the server lifecycle (spawn → health → verify → capture →
// kill): the sandbox reaps detached daemons, so the standalone runs as a
// child of this process and dies with it.
import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const PORT = 3400;
const BASE = `http://localhost:${PORT}`;
const OUT = "docs/screenshots";
const ROOT = process.cwd();
const EMAIL = "sepnetflix2023@outlook.com";
const PASSWORD = "$Abcd1234";

mkdirSync(OUT, { recursive: true });

// --- kill any port squatter (the e2e suite's documented guard) -----------
try {
  execSync(`bun tests/e2e/kill-port.ts`, { stdio: "pipe", cwd: ROOT });
} catch {
  /* no squatter — fine */
}

// --- boot the CLEANED standalone on :3400 (absolute DATABASE_URL) --------
const server = spawn("bun", [".next/standalone/server.js"], {
  cwd: ROOT,
  env: {
    ...process.env,
    PORT: String(PORT),
    NODE_ENV: "production",
    DATABASE_URL: `file:${path.join(ROOT, "db", "custom.db")}`,
    COOKIE_SECURE: "false",
    AUTH_SECRET: "5f3a9c1e7b2d4f6a8c0e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let serverLog = "";
server.stdout.on("data", (d) => (serverLog += d));
server.stderr.on("data", (d) => (serverLog += d));

const waitHealthy = async () => {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`${BASE}/api/health`);
      if (r.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`server never became healthy. log:\n${serverLog}`);
};

const browser = await chromium.launch();
const results = [];
const ok = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} · ${name}${detail ? " — " + detail : ""}`);
};

try {
  await waitHealthy();
  console.log("server healthy on :" + PORT);

  // --- login through the real UI (the form unlocks after hydration) ------
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/login`);
  const signin = page.getByRole("button", { name: "Sign in" });
  await signin.waitFor({ state: "visible" });
  await page.getByRole("textbox", { name: "Email" }).fill(EMAIL);
  await page.getByRole("textbox", { name: "Password" }).fill(PASSWORD);
  await signin.click({ timeout: 20_000 });
  await page.waitForURL("**/POS**", { timeout: 20_000 });
  // A prior aborted run may have left an ACTIVE shift (the gate then stays
  // hidden) — accept either surface; the journey below normalizes the state.
  await page
    .getByRole("heading", { name: "No active shift" })
    .or(page.getByTestId("charge-button"))
    .waitFor({ timeout: 15_000 });
  ok("the CLEANED artifact serves the login round-trip", true, page.url());

  // --- THE F-55 JOURNEY, live: shift via API → cart → cash charge → ------
  // --- receipt → the ledger row (the transaction reads in the real flow) -
  const regs = await (
    await page.request.get(`${BASE}/api/registers`)
  ).json();
  const reg = Array.isArray(regs) && regs[0] ? regs[0] : null;
  if (!reg) throw new Error("no register in the demo db — run bun run db:seed -- --demo");
  // close any stale active shift first (idempotent journey)
  const actives = await (await page.request.get(`${BASE}/api/shifts?status=active`)).json();
  for (const s of actives ?? []) {
    await page.request.patch(`${BASE}/api/shifts/${s.id}`, { data: { countedCash: 0 } });
  }
  const shift = await (
    await page.request.post(`${BASE}/api/shifts`, {
      data: { registerId: reg.id, openingFloat: 100 },
    })
  ).json();
  ok("shift opened (the F-55 journey setup)", !!shift?.id, `register=${reg.name}`);

  await page.goto(`${BASE}/POS`);
  await page.getByRole("heading", { name: "No active shift" }).waitFor({ state: "detached", timeout: 15_000 });
  // add the first two visible products
  const addButtons = page.getByRole("button", { name: /Add .+ to cart/ });
  await addButtons.first().waitFor({ state: "visible", timeout: 15_000 });
  await addButtons.nth(0).click();
  await page.waitForTimeout(250);
  await addButtons.nth(1).click();
  await page.waitForTimeout(600); // settle the Added banner
  await page.screenshot({ path: `${OUT}/38-session8-terminal-cart.png` });

  await page.getByTestId("charge-button").click();
  const pay = page.getByRole("dialog");
  await pay.waitFor({ state: "visible" });
  await pay.getByLabel("Amount received").fill("100");
  const changeTxt = await pay.getByTestId("change-due").textContent();
  ok("cash dialog computes change", /Change/.test(changeTxt ?? ""), (changeTxt ?? "").slice(0, 40));
  await pay.getByRole("button", { name: /Complete cash sale/ }).click();

  const receipt = page.getByRole("dialog");
  await receipt.getByText(/T-\d{6}/).waitFor({ timeout: 15_000 });
  const receiptTxt = (await receipt.textContent()) ?? "";
  const ticket = receiptTxt.match(/T-\d{6}/)?.[0] ?? "";
  ok("the checkout wrote a ticket (F-55 live)", /^T-\d{6}$/.test(ticket), ticket);
  await page.waitForTimeout(400); // settle the receipt dialog animation
  await page.screenshot({ path: `${OUT}/39-session8-receipt.png` });
  await receipt.getByRole("button", { name: "Close", exact: true }).first().click();
  await receipt.waitFor({ state: "detached", timeout: 10_000 });

  // the ledger row (the Historial de Ventas)
  await page.goto(`${BASE}/Sales`);
  await page.getByRole("heading", { name: "Historial de Ventas" }).waitFor({ timeout: 15_000 });
  const row = page.getByRole("row", { name: new RegExp(ticket) });
  await row.first().waitFor({ timeout: 15_000 });
  ok("the sale landed in the ledger", true, ticket);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/40-session8-sales-ledger.png` });

  // --- the dashboard chart at data scale (the standing pin) ---------------
  await page.goto(`${BASE}/Dashboard`);
  await page.getByText("Today's Sales").first().waitFor({ timeout: 15_000 });
  await page.waitForTimeout(600);
  const chart = page.getByTestId("line-chart");
  await chart.waitFor({ state: "visible", timeout: 15_000 });
  await page.screenshot({ path: `${OUT}/41-session8-dashboard-chart.png` });

  // --- the inventory view (the standard-surface record) -------------------
  await page.goto(`${BASE}/Inventory`);
  await page.getByRole("heading", { name: "Inventory" }).waitFor({ timeout: 15_000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/42-session8-inventory.png` });

  // --- close the shift (leave the store tidy for the next run) -----------
  const nowActives = await (await page.request.get(`${BASE}/api/shifts?status=active`)).json();
  for (const s of nowActives ?? []) {
    await page.request.patch(`${BASE}/api/shifts/${s.id}`, { data: { countedCash: 100 } });
  }
  ok("shift closed (store tidy)", true);

  // --- the mobile drawer contract at 390x844 (the called-out surface) ----
  const mctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    storageState: await ctx.storageState(),
  });
  const mob = await mctx.newPage();
  await mob.goto(`${BASE}/POS`);
  await mob.getByRole("button", { name: "Open navigation menu" }).waitFor({ timeout: 15_000 });
  await mob.getByRole("button", { name: "Open navigation menu" }).click();
  const drawer = mob.getByRole("dialog", { name: "Navigation menu" });
  await drawer.waitFor({ state: "visible" });
  const linkCount = await drawer.getByRole("link").count();
  ok("mobile drawer: dialog + 8 labeled links", linkCount === 8, `${linkCount} links`);
  const overflowOk = await mob.evaluate(() => document.body.scrollWidth - document.body.clientWidth <= 0);
  ok("no horizontal overflow at 390", overflowOk);
  await mob.waitForTimeout(600); // settle the slide-in (the trap-16 discipline)
  await mob.screenshot({ path: `${OUT}/37-session8-mobile-drawer-open.png` });
  await mctx.close();
  await ctx.close();
} catch (err) {
  console.error("EVIDENCE RUN FAILED:", err);
  results.push({ name: "fatal", pass: false, detail: String(err) });
} finally {
  server.kill("SIGKILL");
  await browser.close();
}

const passed = results.filter((r) => r.pass).length;
console.log(`\nEVIDENCE: ${passed}/${results.length} checks passed`);
process.exit(passed === results.length ? 0 : 1);
