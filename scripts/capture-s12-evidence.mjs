// Session-12 evidence script — the auth-surface remediation verified LIVE on
// the rebuilt standalone (F-76 the Alert error panel, F-77 the forgot-view
// swap, F-78 the signup 3-field card, F-79 the measured 404, F-82 the guest
// gate, F-84 the busy copy, F-85 the sign-in content-block depth) + the
// Session-12 screenshot set — captured from the PRODUCTION standalone build
// (the family rule: never the dev badge).
//
// The script OWNS the server lifecycle (spawn → health → verify → capture →
// kill): the sandbox reaps detached daemons.
import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const PORT = 3430;
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

  // ---- 61: the sign-in view (desktop) — the restructured content block ----
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/login`);
  await page.getByRole("button", { name: "Sign in" }).waitFor({ state: "visible" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/61-session12-signin-desktop.png` });

  // --- F-85 live: the sign-in content-block depth ---------------------------
  const depth = await page.evaluate(() => {
    const ring = document.querySelector("img[alt*='VeloxPOS']")?.parentElement;
    const h1 = document.querySelector("h1");
    const sub = h1?.parentElement?.querySelector("p");
    const forgot = [...document.querySelectorAll("button")].find((b) =>
      /Forgot password/.test(b.textContent),
    );
    const row = forgot?.parentElement;
    if (!ring || !h1 || !sub || !row) return null;
    const rs = getComputedStyle(ring);
    return {
      ringH: rs.height,
      ringRadius: rs.borderRadius,
      ringShadow: rs.boxShadow,
      h1Fs: getComputedStyle(h1).fontSize,
      h1Ls: getComputedStyle(h1).letterSpacing,
      subFw: getComputedStyle(sub).fontWeight,
      rowDir: getComputedStyle(row).flexDirection,
      rowJustify: getComputedStyle(row).justifyContent,
      gap: Math.round(
        h1.parentElement.getBoundingClientRect().top - ring.getBoundingClientRect().bottom,
      ),
    };
  });
  ok(
    "F-85 live: the sign-in block — ring 96px + halo, h1 30px/-0.75px, sub 500, links row space-between",
    !!depth &&
      depth.ringH === "96px" &&
      depth.h1Fs === "30px" &&
      depth.h1Ls === "-0.75px" &&
      depth.subFw === "500" &&
      depth.rowDir === "row" &&
      depth.rowJustify === "space-between" &&
      depth.gap === 32,
    JSON.stringify(depth),
  );

  // ---- 62: the failed-login error state (the F-76 Alert panel) ------------
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill("wrong-password-for-evidence");

  // --- F-84 live: the transient busy copy (the login response HELD 600ms
  //     via route interception so the mid-flight state is grabbable) --------
  await page.route("**/api/auth/login", async (route) => {
    await new Promise((r) => setTimeout(r, 600));
    await route.continue();
  });
  await page.getByTestId("login-submit").click();
  await page.waitForTimeout(250); // mid-flight
  const busyText =
    (await page.getByTestId("login-submit").textContent())?.trim() ?? "";
  await page
    .locator("main.login-canvas [role='alert']")
    .waitFor({ state: "visible", timeout: 15000 });
  const alert = page.locator("main.login-canvas [role='alert']");
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/62-session12-login-error-alert.png` });
  const alertBox = await alert.evaluate((el) => {
    const s = getComputedStyle(el);
    const inner = el.firstElementChild;
    return {
      bg: s.backgroundColor,
      border: s.borderColor,
      radius: s.borderRadius,
      pad: s.padding,
      innerFs: inner ? getComputedStyle(inner).fontSize : null,
      innerColor: inner ? getComputedStyle(inner).color : null,
      icons: el.querySelectorAll("svg").length,
      copy: el.textContent,
    };
  });
  ok(
    "F-76 live: the error renders the reference's Alert panel (rounded-xl red-200 red-50/70 p-4, inner 14px red-700, no icon)",
    alertBox.radius === "12px" &&
      alertBox.border === "rgb(254, 202, 202)" &&
      alertBox.pad === "16px" &&
      alertBox.innerFs === "14px" &&
      alertBox.innerColor === "rgb(185, 28, 28)" &&
      alertBox.icons === 0 &&
      alertBox.copy === "Invalid email or password",
    JSON.stringify(alertBox),
  );
  ok(
    "F-84 live: the sign-in busy copy is the reference's 'Signing in…' (mid-flight grab)",
    busyText.includes("Signing in"),
    `grabbed: ${JSON.stringify(busyText)}`,
  );

  // ---- 63: the forgot view (the F-77 whole-card swap) ----------------------
  await page.goto(`${BASE}/login`);
  await page.getByRole("button", { name: "Forgot password?" }).click();
  await page.getByRole("heading", { name: "Reset your password" }).waitFor();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/63-session12-forgot-view.png` });
  const forgotBox = await page.evaluate(() => ({
    h1: document.querySelector("h1") ? 1 : 0,
    sso: [...document.querySelectorAll("button")].filter((b) =>
      /Continue with/.test(b.textContent),
    ).length,
    back: [...document.querySelectorAll("button")].filter((b) =>
      /Back to sign in/.test(b.textContent),
    ).length,
    inputH: getComputedStyle(document.querySelector("input[type=email]")).height,
    sendH: getComputedStyle(
      [...document.querySelectorAll("button")].find((b) => /Send reset link/.test(b.textContent)),
    ).height,
  }));
  ok(
    "F-77 live: the forgot view swaps the whole card (no h1/SSO, back-first, 44px field + Send)",
    forgotBox.h1 === 0 &&
      forgotBox.sso === 0 &&
      forgotBox.back === 1 &&
      forgotBox.inputH === "44px" &&
      forgotBox.sendH === "44px",
    JSON.stringify(forgotBox),
  );

  // ---- 64: the signup view (the F-78 3-field card) -------------------------
  await page.goto(`${BASE}/login`);
  await page.getByRole("button", { name: "Need an account? Sign up" }).click();
  await page.getByRole("heading", { name: "Create your account" }).waitFor();
  await page.getByLabel("Email").fill("session12-evidence@example.com");
  await page.getByLabel("Password", { exact: true }).fill("Abcd1234!");
  await page.getByLabel("Confirm Password").fill("Abcd1234!");
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/64-session12-signup-view.png` });
  const signupBox = await page.evaluate(() => ({
    fullName: [...document.querySelectorAll("label")].filter((l) =>
      /Full name/.test(l.textContent),
    ).length,
    fields: document.querySelectorAll("form input").length,
    sso: [...document.querySelectorAll("button")].filter((b) =>
      /Continue with/.test(b.textContent),
    ).length,
    confirmPh: document.querySelector("#login-confirm")?.getAttribute("placeholder"),
  }));
  ok(
    "F-78 live: the signup view is the 3-field card (no Full name, no SSO, confirm placeholder)",
    signupBox.fullName === 0 &&
      signupBox.fields === 3 &&
      signupBox.sso === 0 &&
      signupBox.confirmPh === "Re-enter password",
    JSON.stringify(signupBox),
  );

  // ---- 65: the authenticated 404 (F-79) via a real login -------------------
  await page.goto(`${BASE}/login`);
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByTestId("login-submit").click();
  await page.waitForURL((u) => u.pathname === "/", { timeout: 20000 });
  await page.goto(`${BASE}/NoSuchView`);
  await page.getByText("404").waitFor();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/65-session12-authenticated-404.png` });
  const nfBox = await page.evaluate(() => {
    const link = [...document.querySelectorAll("a")].find((a) =>
      /Ir al Terminal/.test(a.textContent),
    );
    const numeral = [...document.querySelectorAll("span")].find(
      (s) => s.textContent === "404",
    );
    return {
      cardPad: getComputedStyle(document.querySelector(".glass-card")).padding,
      numeralFs: numeral ? getComputedStyle(numeral).fontSize : null,
      numeralBg: numeral ? getComputedStyle(numeral).backgroundColor : null,
      h1Color: getComputedStyle(document.querySelector("h1")).color,
      linkH: link ? getComputedStyle(link).height : null,
      linkIcon: link ? link.querySelectorAll("svg").length : 0,
    };
  });
  ok(
    "F-79 live: the 404 — glass-card p-12, plain span numeral, slate-800 h1, 50px ArrowLeft link",
    nfBox.cardPad === "48px" &&
      nfBox.numeralFs === "30px" &&
      nfBox.numeralBg === "rgba(0, 0, 0, 0)" &&
      nfBox.h1Color === "rgb(30, 41, 59)" &&
      nfBox.linkH === "50px" &&
      nfBox.linkIcon === 1,
    JSON.stringify(nfBox),
  );
  await ctx.close();

  // ---- F-82 live: the guest gate (a fresh, cookie-free context) -----------
  const guestCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const guest = await guestCtx.newPage();
  await guest.goto(`${BASE}/NoSuchView`);
  await guest.waitForURL(/\/login/, { timeout: 15000 });
  const gateUrl = guest.url();
  const gate404 = await guest.locator("text=Página no encontrada").count();
  ok(
    "F-82 live: the bogus route gates the guest to /login (no public 404)",
    /\/login$/.test(new URL(gateUrl).pathname) && gate404 === 0,
    `landed: ${gateUrl}`,
  );
  await guestCtx.close();

  // ---- 66: the mobile sign-in at 390×844 (the called-out surface) ----------
  const mctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    devices: undefined,
  });
  const mpage = await mctx.newPage();
  await mpage.goto(`${BASE}/login`);
  await mpage.getByRole("button", { name: "Sign in" }).waitFor({ state: "visible" });
  await mpage.waitForTimeout(500);
  await mpage.screenshot({ path: `${OUT}/66-session12-signin-mobile.png` });
  const mBox = await mpage.evaluate(() => {
    const ring = document.querySelector("img[alt*='VeloxPOS']")?.parentElement;
    const h1 = document.querySelector("h1");
    const forgot = [...document.querySelectorAll("button")].find((b) =>
      /Forgot password/.test(b.textContent),
    );
    const row = forgot?.parentElement;
    return {
      logoW: ring ? getComputedStyle(ring).width : null,
      h1Fs: h1 ? getComputedStyle(h1).fontSize : null,
      inputH: getComputedStyle(document.querySelector("input[type=email]")).height,
      btnH: getComputedStyle(document.querySelector('[data-testid="login-submit"]')).height,
      rowDir: row ? getComputedStyle(row).flexDirection : null,
      rowGap: row ? getComputedStyle(row).gap : null,
      overflowX: document.documentElement.scrollWidth > innerWidth,
    };
  });
  ok(
    "F-85 live (mobile 390): 80px logo, 24px h1, 44px inputs/button, links column — no horizontal overflow",
    mBox.logoW === "80px" &&
      mBox.h1Fs === "24px" &&
      mBox.inputH === "44px" &&
      mBox.btnH === "44px" &&
      mBox.rowDir === "column" &&
      mBox.rowGap === "8px" &&
      mBox.overflowX === false,
    JSON.stringify(mBox),
  );
  await mctx.close();

  const passed = results.filter((r) => r.pass).length;
  console.log(`\n${passed}/${results.length} live checks passed`);
  if (passed !== results.length) process.exitCode = 1;
} catch (err) {
  console.error("CAPTURE FAILED:", err);
  process.exitCode = 1;
} finally {
  await browser.close().catch(() => {});
  server.kill("SIGKILL");
}
