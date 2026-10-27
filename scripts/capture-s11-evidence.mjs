// Session-11 evidence script — the six remediation fixes verified LIVE on
// the rebuilt standalone (F-70 the login typed-text color, F-64 the dialog
// container family, F-66 the #e7e9ef form-text family, F-67 the dialog
// Cancel family, F-68 the register dialog width, F-69 the select dropdown
// surface) + a compact checkout journey (nothing broke end-to-end) + the
// mobile drawer contract at 390×844 + the Session-11 screenshot set —
// captured from the PRODUCTION standalone build (the family rule: never the
// dev badge).
//
// The script OWNS the server lifecycle (spawn → health → verify → capture →
// kill): the sandbox reaps detached daemons.
import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const PORT = 3420;
const BASE = `http://localhost:${PORT}`;
const OUT = "docs/screenshots";
const ROOT = process.cwd();
const EMAIL = "sepnetflix2023@outlook.com";
const PASSWORD = "$Abcd1234";

import { mkdirSync } from "node:fs";
mkdirSync(OUT, { recursive: true });

try {
  execSync(`bun tests/e2e/kill-port.ts`, { stdio: "pipe", cwd: ROOT });
} catch {}

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
    } catch {}
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

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // --- F-70 live: the login TYPED text is the reference's zinc-950 ---------
  await page.goto(`${BASE}/login`);
  await page.getByRole("button", { name: "Sign in" }).waitFor({ state: "visible" });
  await page.waitForTimeout(500);
  const emailField = page.getByRole("textbox", { name: "Email" });
  await emailField.fill(EMAIL);
  const typedColor = await emailField.evaluate((el) => getComputedStyle(el).color);
  ok(
    "F-70 live: the login's TYPED text computes rgb(9, 9, 11) (zinc-950 — visible credentials)",
    typedColor === "rgb(9, 9, 11)",
    typedColor,
  );
  await page.screenshot({ path: `${OUT}/55-session11-login-typed.png` });
  await page.getByRole("textbox", { name: "Password" }).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((url) => url.pathname === "/" || url.pathname === "/POS", {
    timeout: 20_000,
  });
  await page.getByTestId("app-sidebar").waitFor({ timeout: 15_000 });

  // --- F-64/F-68/F-67/F-66 live: the New Register dialog contract ---------
  await page.goto(`${BASE}/Registers`);
  await page.getByRole("button", { name: "New Register" }).click();
  const regDialog = page.getByRole("dialog", { name: "New Register" });
  await regDialog.waitFor({ timeout: 10_000 });
  await page.waitForTimeout(600); // the zoom-in entrance settles (trap 16)
  const reg = await regDialog.evaluate((el) => {
    const cs = getComputedStyle(el);
    const title = el.querySelector("h2");
    const label = el.querySelector("label");
    const input = el.querySelector("input");
    const cancel = [...el.querySelectorAll("button")].find(
      (b) => b.textContent.trim() === "Cancel",
    );
    return {
      w: Math.round(el.getBoundingClientRect().width),
      bg: cs.backgroundColor,
      border: cs.borderColor,
      blur: cs.backdropFilter,
      title: getComputedStyle(title).color,
      label: label ? getComputedStyle(label).color : null,
      input: input ? getComputedStyle(input).color : null,
      cancel: cancel ? getComputedStyle(cancel).backgroundColor : null,
    };
  });
  ok(
    "F-64 live: the register dialog is SOLID #0f121a + #262a36 border + NO blur",
    reg.bg === "rgb(15, 18, 26)" &&
      reg.border === "rgb(38, 42, 54)" &&
      reg.blur === "none",
    JSON.stringify({ bg: reg.bg, border: reg.border, blur: reg.blur }),
  );
  ok("F-68 live: the register dialog is 512px (max-w-lg)", reg.w === 512, String(reg.w));
  ok(
    "F-67 live: the Cancel computes the gray glass-button rgba(28, 31, 52, 0.85)",
    reg.cancel === "rgba(28, 31, 52, 0.85)",
    reg.cancel ?? "none",
  );
  ok(
    "F-66 live: the dialog's title/label/input text compute #e7e9ef",
    reg.title === "rgb(231, 233, 239)" &&
      reg.label === "rgb(231, 233, 239)" &&
      reg.input === "rgb(231, 233, 239)",
    JSON.stringify({ title: reg.title, label: reg.label, input: reg.input }),
  );
  await page.screenshot({ path: `${OUT}/56-session11-register-dialog.png` });
  await page.keyboard.press("Escape");

  // --- F-64/F-69 live: the category + product dialogs + the select -------
  await page.goto(`${BASE}/StoreSettings`);
  await page.getByRole("button", { name: "Add", exact: true }).click();
  const catDialog = page.getByRole("dialog", { name: "New Category" });
  await catDialog.waitFor({ timeout: 10_000 });
  await page.waitForTimeout(600);
  const cat = await catDialog.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      w: Math.round(el.getBoundingClientRect().width),
      bg: cs.backgroundColor,
      blur: cs.backdropFilter,
    };
  });
  ok(
    "F-64 live: the category dialog is the solid family at 384px",
    cat.bg === "rgb(15, 18, 26)" && cat.blur === "none" && cat.w === 384,
    JSON.stringify(cat),
  );
  await page.keyboard.press("Escape");

  await page.goto(`${BASE}/Inventory`);
  await page.getByRole("button", { name: "New Product" }).click();
  const prodDialog = page.getByRole("dialog", { name: "New Product" });
  await prodDialog.waitFor({ timeout: 10_000 });
  await page.waitForTimeout(600);
  const prod = await prodDialog.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      w: Math.round(el.getBoundingClientRect().width),
      bg: cs.backgroundColor,
      blur: cs.backdropFilter,
    };
  });
  ok(
    "F-64 live: the product dialog is the solid family at 512px",
    prod.bg === "rgb(15, 18, 26)" && prod.blur === "none" && prod.w === 512,
    JSON.stringify(prod),
  );
  await prodDialog.getByLabel("Category").click();
  const listbox = page.getByRole("listbox");
  await listbox.waitFor({ timeout: 10_000 });
  const lb = await listbox.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { bg: cs.backgroundColor, radius: cs.borderRadius, border: cs.borderColor };
  });
  ok(
    "F-69 live: the select dropdown surface is #161922 + 6px radius",
    lb.bg === "rgb(22, 25, 34)" && lb.radius === "6px",
    JSON.stringify(lb),
  );
  await page.screenshot({ path: `${OUT}/57-session11-product-dialog-select.png` });
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");

  // --- F-66 live: the Settings label family ------------------------------
  await page.goto(`${BASE}/StoreSettings`);
  await page.getByText("Store name *", { exact: true }).waitFor({ timeout: 15_000 });
  const labels = await page.evaluate(() => {
    const targets = ["Store name *", "Address", "Phone", "Tax Regime"];
    return targets.map((t) => {
      const el = [...document.querySelectorAll("label")].find(
        (l) => l.textContent.trim() === t,
      );
      return el ? getComputedStyle(el).color : "missing";
    });
  });
  ok(
    "F-66 live: the Settings labels compute #e7e9ef (the token, not white/70)",
    labels.every((c) => c === "rgb(231, 233, 239)"),
    JSON.stringify(labels),
  );
  await page.screenshot({ path: `${OUT}/58-session11-settings-labels.png` });

  // --- the compact checkout journey (nothing broke end-to-end) -----------
  await page.goto(`${BASE}/POS`);
  await page.getByTestId("app-sidebar").waitFor({ timeout: 15_000 });
  await page.waitForTimeout(800); // hydration + the gate decision renders
  let gateVisible = await page
    .getByRole("heading", { name: "No active shift" })
    .isVisible()
    .catch(() => false);
  if (gateVisible) {
    await page.goto(`${BASE}/Registers`);
    await page.getByRole("button", { name: "Open shift" }).click();
    const shiftDialog = page.getByRole("dialog", { name: "Open shift — Register 1" });
    await shiftDialog.getByLabel("Opening float").fill("100");
    await shiftDialog.getByRole("button", { name: "Open shift" }).click();
    await page.getByText("Shift open").first().waitFor({ timeout: 15_000 });
    await page.goto(`${BASE}/POS`);
    await page.getByTestId("app-sidebar").waitFor({ timeout: 15_000 });
    await page.waitForTimeout(800);
  }
  await page.goto(`${BASE}/POS`);
  await page.waitForTimeout(1000);
  const addBtn = page.getByRole("button", { name: "Add Espresso Beans 250g to cart" });
  if (await addBtn.count()) {
    await addBtn.first().click();
    await page.waitForTimeout(400);
    await addBtn.first().click();
    await page.waitForTimeout(400);
  }
  const charge = page.getByTestId("charge-button");
  const chargeText = await charge.textContent();
  ok(
    "checkout journey: the cart accumulates and CHARGE reads the total",
    /\$\d/.test(chargeText ?? ""),
    chargeText ?? "none",
  );
  await charge.click();
  const chargeDialog = page.getByRole("dialog", { name: /^Charge/ });
  await chargeDialog.getByLabel("Amount received").fill("20");
  await chargeDialog.getByRole("button", { name: "Complete cash sale" }).click();
  // The receipt dialog's title is the store name; the ticket rides the
  // mono description line ("T-000036 · <date>").
  const receipt = page
    .getByRole("dialog")
    .filter({ hasText: /T-\d+ · / });
  await receipt.waitFor({ timeout: 20_000 });
  const desc = (await receipt.locator("[data-slot='dialog-description'], p.font-mono").first().textContent()) ?? "";
  const ticket = (desc.match(/T-\d+/) ?? [""])[0];
  ok(
    "checkout journey: the receipt dialog renders the allocated ticket",
    /^T-\d+$/.test(ticket),
    ticket || desc.slice(0, 40),
  );
  await page.screenshot({ path: `${OUT}/59-session11-checkout-receipt.png` });

  // --- the mobile drawer contract at 390×844 ------------------------------
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const mpage = await mobile.newPage();
  // A fresh context has no session cookie — sign in through the real UI first.
  await mpage.goto(`${BASE}/login`);
  await mpage.getByRole("button", { name: "Sign in" }).waitFor({ state: "visible" });
  await mpage.getByRole("textbox", { name: "Email" }).fill(EMAIL);
  await mpage.getByRole("textbox", { name: "Password" }).fill(PASSWORD);
  await mpage.getByRole("button", { name: "Sign in" }).click();
  await mpage.waitForURL((url) => url.pathname === "/" || url.pathname === "/POS", {
    timeout: 20_000,
  });
  await mpage.goto(`${BASE}/POS`);
  // Below md the desktop sidebar is hidden (it stays in the DOM — visibility
  // semantics, per the e2e doctrine) — wait on the hamburger instead.
  await mpage.getByRole("button", { name: "Open navigation menu" }).waitFor({
    timeout: 15_000,
  });
  await mpage.waitForTimeout(600);
  const burger = mpage.getByRole("button", { name: "Open navigation menu" });
  await burger.click();
  const drawer = mpage.getByRole("dialog", { name: "Navigation menu" });
  await drawer.waitFor({ timeout: 10_000 });
  await mpage.waitForTimeout(600); // settle-wait (the capture discipline)
  const drawerLinks = await drawer.getByRole("link").count();
  const overflow = await mpage.evaluate(
    () => document.documentElement.scrollWidth > 390,
  );
  ok(
    "mobile drawer: labeled hamburger → role=dialog with 8 links, no horizontal overflow",
    drawerLinks === 8 && !overflow,
    JSON.stringify({ links: drawerLinks, overflow }),
  );
  await mpage.screenshot({ path: `${OUT}/60-session11-mobile-drawer.png` });

  const passed = results.filter((r) => r.pass).length;
  console.log(`\nEVIDENCE: ${passed}/${results.length} PASSED`);
  if (passed !== results.length) process.exitCode = 1;
} catch (err) {
  console.error("EVIDENCE RUN FAILED:", err);
  process.exitCode = 1;
} finally {
  await browser.close().catch(() => {});
  server.kill("SIGKILL");
  try { execSync(`bun tests/e2e/kill-port.ts`, { stdio: "pipe", cwd: ROOT }); } catch {}
}
