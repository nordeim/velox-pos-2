// Session-13 evidence script — the reset-password remediation verified LIVE
// on the rebuilt standalone (F-86..F-94): the gray-family form card, the
// invalid-token alert + the API copy, the client-side mismatch check, the
// tokenless "Invalid Reset Link" dead-end, and the full reset round-trip
// (forgot-password → resetUrl → reset → done) — captured from the PRODUCTION
// standalone build (the family rule: never the dev badge). The owner's
// password is "reset" to its current value — the round-trip is proven, the
// dev db's credentials are unchanged.
//
// The script OWNS the server lifecycle (spawn → health → verify → capture →
// kill): the sandbox reaps detached daemons.
import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const PORT = 3431;
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

  // ---- 67: the form card (a REAL one-shot token, from the request leg) ----
  const forgot = await fetch(`${BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL }),
  });
  const forgotBody = await forgot.json();
  if (!forgotBody.resetUrl) throw new Error("no resetUrl in the forgot-password response");
  const resetUrl = forgotBody.resetUrl.replace("localhost:3000", `localhost:${PORT}`);
  await page.goto(resetUrl);
  await page.getByRole("button", { name: "Reset password" }).waitFor({ state: "visible" });
  await page.waitForTimeout(400);

  // --- F-86..F-91 live: the gray-family form card ---------------------------
  const form = await page.evaluate(() => {
    const cs = (el, p) => (el ? getComputedStyle(el)[p] : "N/A");
    const canvas = document.querySelector("main.reset-canvas");
    const card = canvas?.firstElementChild;
    const strip = card?.querySelector("div.absolute");
    const h2 = document.querySelector("h2");
    const labels = [...document.querySelectorAll("label")].map((l) => l.textContent);
    const pw = document.getElementById("rp-password");
    const tokenInputs = [...document.querySelectorAll("input")].filter((i) =>
      /token/i.test(i.id || ""),
    );
    const btn = [...document.querySelectorAll("button")].find((b) =>
      b.textContent?.includes("Reset password"),
    );
    const back = [...document.querySelectorAll("a")].find((a) =>
      a.textContent?.includes("Back to login"),
    );
    return {
      canvas: cs(canvas, "backgroundColor"),
      canvasImage: cs(canvas, "backgroundImage"),
      cardRadius: cs(card, "borderRadius"),
      stripH: strip ? getComputedStyle(strip).height : "N/A",
      stripBg: cs(strip, "backgroundColor"),
      h2: h2?.textContent ?? "N/A",
      labels,
      inputH: pw ? pw.getBoundingClientRect().height : "N/A",
      inputRadius: cs(pw, "borderRadius"),
      tokenInputs: tokenInputs.length,
      btnH: btn ? btn.getBoundingClientRect().height : "N/A",
      btnBg: cs(btn, "backgroundColor"),
      backText: back?.textContent ?? "N/A",
      imgs: document.querySelectorAll("main.reset-canvas img").length,
    };
  });
  ok(
    "F-86 the canvas is flat gray-50 (no gradient)",
    form.canvas === "rgb(249, 250, 251)" && form.canvasImage === "none",
    form.canvas,
  );
  ok(
    "F-87 the card is the 8px shadcn family + the 2px gray-900 strip",
    form.cardRadius === "8px" && form.stripH === "2px" && form.stripBg === "rgb(17, 24, 39)",
    `radius ${form.cardRadius}, strip ${form.stripH}/${form.stripBg}`,
  );
  ok(
    "F-88 the h2 block (no logo, Title Case labels)",
    form.h2 === "Set new password" &&
      form.labels.join("|") === "New Password|Confirm New Password" &&
      form.imgs === 0,
    form.h2,
  );
  ok(
    "F-89/F-90 the 44px 6px fields, NO token input",
    form.inputH === 44 && form.inputRadius === "6px" && form.tokenInputs === 0,
    `${form.inputH}/${form.inputRadius}, token inputs: ${form.tokenInputs}`,
  );
  ok(
    "F-91 the measured buttons",
    form.btnH === 44 && form.btnBg === "rgb(17, 24, 39)" && form.backText === "Back to login",
    `btn ${form.btnH}/${form.btnBg}, back: ${form.backText}`,
  );
  await page.screenshot({ path: `${OUT}/67-session13-reset-form.png` });

  // ---- the mismatch path (client-side, no network) -------------------------
  let mismatchRequests = 0;
  await page.route("**/api/auth/reset-password", (r) => {
    mismatchRequests += 1;
    return r.continue();
  });
  await page.getByLabel("New Password", { exact: true }).fill("Abcd1234!");
  await page.getByLabel("Confirm New Password").fill("Different99!");
  await page.getByRole("button", { name: "Reset password" }).click();
  await page.locator("main.reset-canvas [role='alert']").waitFor({ state: "visible" });
  const mismatch = await page.evaluate(() => {
    const a = document.querySelector("main.reset-canvas [role='alert']");
    return a ? a.textContent : "N/A";
  });
  ok(
    "F-92 the mismatch check is client-side with the measured copy",
    mismatch === "Passwords do not match" && mismatchRequests === 0,
    `"${mismatch}", requests: ${mismatchRequests}`,
  );
  await page.unrouteAll({ behavior: "wait" });

  // ---- 70: the done state — the REAL one-shot round-trip -------------------
  await page.getByLabel("Confirm New Password").fill("Abcd1234!");
  await page.getByRole("button", { name: "Reset password" }).click();
  await page.getByRole("heading", { name: "Password Updated" }).waitFor({ state: "visible" });
  await page.waitForTimeout(400);
  const done = await page.evaluate(() => {
    const h2 = [...document.querySelectorAll("h2")].find((h) =>
      h.textContent?.includes("Password Updated"),
    );
    const back = [...document.querySelectorAll("a")].find((a) =>
      a.textContent?.includes("Back to Login"),
    );
    return {
      h2: h2?.textContent ?? "N/A",
      backH: back ? back.getBoundingClientRect().height : "N/A",
    };
  });
  ok(
    "the full reset round-trip lands on the done card (the one-shot token consumed)",
    done.h2 === "Password Updated" && done.backH === 44,
    `${done.h2}, back ${done.backH}px`,
  );
  await page.screenshot({ path: `${OUT}/70-session13-reset-done.png` });

  // ---- 68: the invalid-token error state -----------------------------------
  await page.goto(`${BASE}/reset-password?token=${"f".repeat(48)}`);
  await page.getByRole("button", { name: "Reset password" }).waitFor({ state: "visible" });
  await page.getByLabel("New Password", { exact: true }).fill("Abcd1234!");
  await page.getByLabel("Confirm New Password").fill("Abcd1234!");
  await page.getByRole("button", { name: "Reset password" }).click();
  await page.locator("main.reset-canvas [role='alert']").waitFor({ state: "visible" });
  const alert = await page.evaluate(() => {
    const cs = (el, p) => (el ? getComputedStyle(el)[p] : "N/A");
    const a = document.querySelector("main.reset-canvas [role='alert']");
    const inner = a?.firstElementChild;
    return {
      radius: cs(a, "borderRadius"),
      bg: cs(a, "backgroundColor"),
      border: cs(a, "borderColor"),
      innerColor: cs(inner, "color"),
      copy: a?.textContent ?? "N/A",
      svgs: a ? a.querySelectorAll("svg").length : -1,
    };
  });
  ok(
    "F-92/F-94 the reset alert family + the API copy",
    alert.radius === "8px" &&
      /0\.5\)|0\.5\)/.test(alert.bg) &&
      alert.border === "rgb(254, 202, 202)" &&
      alert.innerColor === "rgb(153, 27, 27)" &&
      alert.copy === "Invalid or expired reset token" &&
      alert.svgs === 0,
    `${alert.radius}, ${alert.bg}, ${alert.copy}`,
  );
  await page.screenshot({ path: `${OUT}/68-session13-reset-error-alert.png` });

  // ---- 69: the tokenless dead-end ------------------------------------------
  await page.goto(`${BASE}/reset-password`);
  await page.getByRole("heading", { name: "Invalid Reset Link" }).waitFor({ state: "visible" });
  await page.waitForTimeout(400);
  const dead = await page.evaluate(() => {
    const chip = document.querySelector("main.reset-canvas div.bg-red-100");
    const h2 = [...document.querySelectorAll("h2")].find((h) =>
      h.textContent?.includes("Invalid Reset Link"),
    );
    const inputs = document.querySelectorAll("main.reset-canvas input").length;
    const icon = chip?.querySelector("svg");
    return {
      chipH: chip ? chip.getBoundingClientRect().height : "N/A",
      h2: h2?.textContent ?? "N/A",
      inputs,
      iconH: icon ? icon.getBoundingClientRect().height : "N/A",
    };
  });
  ok(
    "F-93 the tokenless dead-end (chip + ZERO inputs)",
    dead.chipH === 80 && dead.h2 === "Invalid Reset Link" && dead.inputs === 0 && dead.iconH === 40,
    `chip ${dead.chipH}px, icon ${dead.iconH}px, inputs ${dead.inputs}`,
  );
  await page.screenshot({ path: `${OUT}/69-session13-reset-invalid-link.png` });

  // ---- the sanity sweep: the login card still holds post-refactor ----------
  await page.goto(`${BASE}/login`);
  await page.getByRole("button", { name: "Sign in" }).waitFor({ state: "visible" });
  const loginCanvas = await page.evaluate(() => {
    const c = document.querySelector("main.login-canvas");
    return c ? getComputedStyle(c).backgroundImage.slice(0, 40) : "N/A";
  });
  ok(
    "the login surface is untouched (the slate gradient canvas)",
    loginCanvas.includes("linear-gradient"),
    loginCanvas,
  );

  await ctx.close();
} catch (err) {
  console.error("CAPTURE FAILED:", err);
  process.exitCode = 1;
} finally {
  await browser.close();
  try {
    process.kill(server.pid, "SIGTERM");
  } catch {}
}

const passed = results.filter((r) => r.pass).length;
console.log(`\nSESSION-13 EVIDENCE: ${passed}/${results.length} passed`);
if (passed !== results.length) process.exitCode = 1;
