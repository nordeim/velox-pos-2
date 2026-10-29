// Session-16 evidence script — the with-data Registers/Sales remediation
// verified LIVE on the rebuilt standalone: the demo-seeded surfaces the
// empty-store e2e can never see (the session_26 "Next" pointer's target —
// the Registers card census + the Open-shift dialog family, the Sales
// ledger census + the ticket search + the receipt viewer), the F-110
// byte-stable receipt timestamp, the Cashiers shift-ledger row, the POS
// gate, the Dashboard stat family + the s15 peak-below-gridline contract
// (re-proven), the standing F-76 drift spot-check, and the mobile drawer
// superset — captured from the PRODUCTION standalone build (the family
// rule: never the dev badge). The script OWNS the server lifecycle
// (spawn → health → verify → capture → kill).
import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const PORT = 3417;
const BASE = `http://localhost:${PORT}`;
const OUT = "docs/screenshots";
const ROOT = process.cwd();
const EMAIL = "sepnetflix2023@outlook.com";
const PASSWORD = "$Abcd1234";

// The with-data proofs run on the demo-seeded scratch db (the V23 pattern:
// db/demo.db, provisioned by this script if absent — 15 products, 5
// categories, a register, a closed shift, a week of sales).
const DEMO_DB = path.join(ROOT, "db", "demo.db");
if (!existsSync(DEMO_DB)) {
  execSync(`bunx prisma db push --accept-data-loss --skip-generate`, {
    cwd: ROOT,
    env: { ...process.env, DATABASE_URL: `file:${DEMO_DB}` },
    stdio: "inherit",
  });
  execSync(`bun prisma/seed.ts -- --demo`, {
    cwd: ROOT,
    env: { ...process.env, DATABASE_URL: `file:${DEMO_DB}` },
    stdio: "inherit",
  });
}

try {
  execSync(`bun tests/e2e/kill-port.ts`, { stdio: "pipe", cwd: ROOT });
} catch {}

const server = spawn("bun", [".next/standalone/server.js"], {
  cwd: ROOT,
  env: {
    ...process.env,
    PORT: String(PORT),
    NODE_ENV: "production",
    DATABASE_URL: `file:${DEMO_DB}`,
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
      if (r.ok) return;
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

// In-SVG probe contract (the s15 lineage): peak-vs-top-gridline + the family
// census. Inlined into each evaluate callback (evaluate args must be
// JSON-only — functions are not serializable).
const PROBE_SRC = `
  const paths = [...svg.querySelectorAll("path")];
  const line = paths[paths.length - 1];
  const d = line ? (line.getAttribute("d") || "") : "";
  const ys = [...d.matchAll(/,([\\d.]+)(?=[CA L]|$)/g)].map((m) => parseFloat(m[1]));
  const peakY = ys.length ? Math.min(...ys) : 9999;
  const texts = [...svg.querySelectorAll("text")].filter((t) =>
    yTickRegex.test((t.textContent || "").trim()),
  );
  const topTick = texts.reduce((a, b) =>
    parseFloat(b.getAttribute("y")) < parseFloat(a.getAttribute("y")) ? b : a,
  );
  return {
    peakY,
    topTickLabel: topTick.textContent.trim(),
    topTickY: parseFloat(topTick.getAttribute("y")),
    tickCount: texts.length,
    hasCurve: d.includes("C"),
    circles: svg.querySelectorAll("circle").length,
    ticks: texts.map((t) => t.textContent.trim()),
  };
`;

try {
  await waitHealthy();
  console.log("server healthy on :" + PORT);

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // ---- sign in through the REAL UI (the family rule) ----------------------
  await page.goto(`${BASE}/login`);
  await page.waitForFunction(
    () => { const b = document.querySelector('[data-testid="login-submit"]'); return !(b && b.disabled); },
  );
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByTestId("login-submit").click();
  await page.waitForURL(
    (url) => url.pathname === "/" || url.pathname === "/POS",
    { timeout: 15000 },
  );
  await page.waitForTimeout(800);

  // ---- 81: the WITH-DATA Registers (demo data — V19's census) --------------
  await page.goto(`${BASE}/Registers`);
  await page.getByTestId("register-cards").waitFor({ state: "visible" });
  await page.waitForTimeout(400);
  const reg = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('[data-testid="register-cards"] > li')];
    const card0 = cards[0];
    const chip = card0?.querySelector("span.rounded-full");
    const chipCs = chip ? getComputedStyle(chip) : null;
    const btns = card0
      ? [...card0.querySelectorAll("button, a")].map((b) => ({
          t: (b.textContent || "").trim().slice(0, 16),
          h: Math.round(b.getBoundingClientRect().height),
        }))
      : [];
    const sub = [...document.querySelectorAll("p, span")].find((el) =>
      /registers configured/i.test(el.textContent || ""),
    );
    return {
      count: cards.length,
      name: card0?.querySelector("h2")?.textContent?.trim(),
      h2size: card0?.querySelector("h2") ? getComputedStyle(card0.querySelector("h2")).fontSize : null,
      location: card0?.querySelector("p")?.textContent?.trim(),
      chip: chip ? { t: chip.textContent.trim(), size: chipCs.fontSize, color: chipCs.color } : null,
      btns,
      sub: sub ? sub.textContent.trim() : null,
    };
  });
  ok(
    "the with-data Registers card census holds (1 card, 18px h2, Available chip 12px)",
    reg.count === 1 && reg.name === "Register 1" && reg.h2size === "18px" &&
      reg.location === "Main entrance" && reg.chip?.t === "Available" && reg.chip?.size === "12px" &&
      reg.sub === "1 registers configured",
    `cards=${reg.count} name=${reg.name} chip=${reg.chip?.t}`,
  );
  ok(
    "the card's action row is the measured set (Open shift 32px, Go to Terminal, edit + delete)",
    reg.btns.length === 4 && reg.btns[0].t === "Open shift" && reg.btns[0].h === 32 &&
      reg.btns.some((b) => b.t === "Go to Terminal"),
    `[${reg.btns.map((b) => `${b.t}:${b.h}`).join(" | ")}]`,
  );

  // The Open-shift dialog (the superset surface follows the dialog family).
  await page.getByRole("button", { name: "Open shift" }).first().click();
  await page.getByRole("dialog").waitFor({ state: "visible" });
  // tw-animate-css zoom-in race: visible ≠ animation-settled — the dialog
  // measures 384×0.95 ≈ 365 mid-flight. Let the open animation finish
  // before any geometry read (the audit script's proven 600ms+ pattern).
  await page.waitForTimeout(700);
  const openDlg = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    const cs = getComputedStyle(dlg);
    const input = dlg.querySelector("input");
    return {
      w: Math.round(dlg.getBoundingClientRect().width),
      bg: cs.backgroundColor,
      radius: cs.borderRadius,
      pad: cs.padding,
      title: dlg.querySelector("h2")?.textContent?.trim(),
      labels: [...dlg.querySelectorAll("label")].map((l) => l.textContent.trim()),
      inputH: input ? getComputedStyle(input).height : null,
    };
  });
  ok(
    "the Open-shift dialog follows the measured dialog family (384px #0f121a 8px p-6, h-9 input)",
    openDlg.w === 384 && openDlg.bg === "rgb(15, 18, 26)" && openDlg.radius === "8px" &&
      openDlg.pad === "24px" && openDlg.inputH === "36px" &&
      openDlg.title === "Open shift — Register 1" && openDlg.labels.includes("Opening float"),
    `${openDlg.w}px ${openDlg.title}`,
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/81-session16-registers-withdata.png` });

  // ---- 82/83: the WITH-DATA Sales ledger + the receipt viewer (F-110) -----
  await page.goto(`${BASE}/Sales`);
  await page.waitForTimeout(800);
  const sales = await page.evaluate(() => {
    const rows = [...document.querySelectorAll("table tbody tr")];
    const first = rows[0];
    const cells = first
      ? [...first.querySelectorAll("td")].map((td) => (td.textContent || "").trim())
      : [];
    const sub = [...document.querySelectorAll("p, span")].find((el) =>
      /ventas registradas/i.test(el.textContent || ""),
    );
    return { rowCount: rows.length, cells, sub: sub ? sub.textContent.trim() : null };
  });
  ok(
    "the with-data Sales ledger renders the full week (33 rows, the subline, the Completada chip)",
    sales.rowCount === 33 && sales.sub === "33 ventas registradas" &&
      sales.cells[0].startsWith("T-") && sales.cells.includes("Completada") &&
      sales.cells.includes("cash"),
    `rows=${sales.rowCount} sub=${sales.sub} first=[${sales.cells.slice(0, 4).join(" | ")}]`,
  );

  // The ticket search (the reference's measured placeholder + the filter).
  const firstTicket = sales.cells[0];
  await page.getByLabel("Buscar por ticket, cliente o cajero").fill(firstTicket);
  await page.waitForTimeout(500);
  const filtered = await page.evaluate(() => ({
    rows: [...document.querySelectorAll("table tbody tr")].length,
  }));
  ok(
    "the ticket search filters the ledger to the exact match",
    filtered.rows === 1,
    `search "${firstTicket}" → ${filtered.rows} row`,
  );
  await page.getByLabel("Buscar por ticket, cliente o cajero").fill("");
  await page.waitForTimeout(400);

  // The receipt viewer (the superset): open + the F-110 byte-stable stamp.
  await page.getByRole("button", { name: `Ver ${firstTicket}` }).first().click();
  await page.getByRole("dialog").waitFor({ state: "visible" });
  // The same zoom-in settle — geometry reads only after the animation.
  await page.waitForTimeout(700);
  const receipt = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    const cs = getComputedStyle(dlg);
    const desc = dlg.querySelector("[data-dialog-description], [id*=description], p");
    return {
      w: Math.round(dlg.getBoundingClientRect().width),
      bg: cs.backgroundColor,
      radius: cs.borderRadius,
      title: dlg.querySelector("h2")?.textContent?.trim(),
      descText: (desc?.textContent || dlg.textContent || "").trim().slice(0, 40),
      body: dlg.textContent || "",
    };
  });
  const F110_RE = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/;
  ok(
    "the receipt viewer follows the dialog family (384px #0f121a 8px)",
    receipt.w === 384 && receipt.bg === "rgb(15, 18, 26)" && receipt.radius === "8px" &&
      receipt.title === firstTicket,
    `${receipt.w}px ${receipt.title}`,
  );
  ok(
    "F-110 the receipt timestamp is byte-stable es-convention (DD/MM/YYYY HH:MM — never the client's locale)",
    F110_RE.test(receipt.descText) && /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/.test(receipt.body),
    `stamp="${receipt.descText}"`,
  );
  await page.screenshot({ path: `${OUT}/82-session16-sales-receipt.png` });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/83-session16-sales-withdata.png` });

  // ---- the WITH-DATA Cashiers shift ledger (V19's census) ------------------
  await page.goto(`${BASE}/Cashiers`);
  // Bootstrap race: the ledger renders bare headers until the shifts
  // collection resolves — default "load" + a fixed sleep lost the race on
  // the cold route (the audit's networkidle pattern won). Wait for the
  // SETTLED ledger: the closed shift's Cerrado chip (this harness runs on
  // the demo db, which always carries closed shifts). The pre-Session-28
  // "Sin turnos" fallback arm died with the parity fix — sweep #22 measured
  // the reference's empty ledger as the BARE table (no empty-state row), so
  // an empty ledger now exposes no settled marker; wait on the roster copy
  // or a with-data row in that case (the AGENTS Session-28 note).
  await page.waitForFunction(
    () => {
      const t = document.body.innerText;
      return t.includes("Turnos Recientes") && t.includes("Cerrado");
    },
    { timeout: 15000 },
  );
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
  const cashiers = await page.evaluate(() => {
    const text = document.body.innerText;
    const row = [...document.querySelectorAll("table tbody tr")][0];
    return {
      hasLedger: /Turnos Recientes/.test(text),
      row: row ? [...row.querySelectorAll("td")].map((td) => (td.textContent || "").trim().slice(0, 22)) : [],
      cerradoChip: !!row?.querySelector("span.rounded-full"),
    };
  });
  ok(
    "the with-data Turnos Recientes ledger renders the closed shift (aggregate + Cerrado)",
    cashiers.hasLedger && cashiers.row.some((c) => c.includes("$410.64")) &&
      cashiers.row.some((c) => c.includes("33")) && cashiers.row.includes("Cerrado") &&
      cashiers.cerradoChip,
    `[${cashiers.row.join(" | ")}]`,
  );
  await page.screenshot({ path: `${OUT}/84-session16-cashiers-withdata.png` });

  // ---- the POS gate with the closed register --------------------------------
  await page.goto(`${BASE}/POS`);
  await page.waitForTimeout(800);
  const gate = await page.evaluate(() => ({
    gated: /No active shift/i.test(document.body.innerText),
    cart: /CART/i.test(document.body.innerText),
  }));
  ok(
    "the POS stays shift-gated with the closed register (gate + CART)",
    gate.gated && gate.cart,
    `gate=${gate.gated} cart=${gate.cart}`,
  );

  // ---- the Dashboard stat family + the s15 peak contract (re-proven) -------
  await page.goto(`${BASE}/Dashboard`);
  await page.getByTestId("line-chart").waitFor({ state: "visible" });
  await page.waitForTimeout(500);
  const dash = await page.getByTestId("line-chart").evaluate(
    new Function("svg", `const yTickRegex = /^\\d+$/; ${PROBE_SRC}`),
  );
  const statCensus = await page.evaluate(() => {
    const labels = [...document.querySelectorAll("p, span")]
      .filter((el) => /TODAY'S SALES|TRANSACTIONS|PRODUCTS|LOW STOCK/i.test(el.textContent || ""))
      .map((el) => ({ t: el.textContent.trim(), size: getComputedStyle(el).fontSize, weight: getComputedStyle(el).fontWeight }));
    const values = [...document.querySelectorAll("h2, h3, p, div")]
      .filter((el) => /^\$?\d+$/.test((el.textContent || "").trim()) && el.children.length === 0)
      .map((el) => ({ t: el.textContent.trim(), size: getComputedStyle(el).fontSize, weight: getComputedStyle(el).fontWeight }));
    return { labels, values };
  });
  ok(
    "F-107 (re-proven) the Dashboard peak sits at/below the topmost gridline",
    dash.peakY >= dash.topTickY - 0.5,
    `peak y=${dash.peakY.toFixed(1)} vs top gridline (${dash.topTickLabel}) y=${dash.topTickY.toFixed(1)}`,
  );
  ok(
    "the with-data stat family holds (12px/600 labels, 24px/700 values)",
    statCensus.labels.length === 4 &&
      statCensus.labels.every((l) => l.size === "12px" && l.weight === "600") &&
      statCensus.values.some((v) => v.t === "15" && v.size === "24px" && v.weight === "700"),
    `labels=[${statCensus.labels.map((l) => l.t).join(", ")}]`,
  );
  await page.screenshot({ path: `${OUT}/85-session16-dashboard-withdata.png` });

  // ---- the F-76 drift spot-check (a FRESH context; the documented
  // oklab-alpha posture — either serialization passes) ------------------------
  const f76ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const f76page = await f76ctx.newPage();
  await f76page.goto(`${BASE}/login`);
  await f76page.waitForFunction(
    () => { const b = document.querySelector('[data-testid="login-submit"]'); return !(b && b.disabled); },
  );
  await f76page.getByLabel("Email").fill(EMAIL);
  await f76page.getByLabel("Password").fill("Wrong-Password-99");
  await f76page.getByTestId("login-submit").click();
  // Trap #28: scope to main.login-canvas — the FIRST unscoped [role=alert]
  // can be Next's route announcer.
  await f76page
    .locator("main.login-canvas [role='alert']")
    .first()
    .waitFor({ state: "visible", timeout: 10000 });
  const f76 = await f76page.evaluate(() => {
    const a = document.querySelector("main.login-canvas [role='alert']");
    const cs = getComputedStyle(a);
    const inner = a.firstElementChild;
    return {
      text: a.textContent.trim().slice(0, 40),
      radius: cs.borderRadius,
      border: cs.border,
      padding: cs.padding,
      innerSize: inner ? getComputedStyle(inner).fontSize : null,
      bg: cs.backgroundColor,
    };
  });
  const f76bgOk = /rgba\(254, 242, 242, 0\.7\)|oklab/.test(f76.bg);
  ok(
    "F-76 the login error alert holds (text + geometry, alpha serialization either-form)",
    f76.text === "Invalid email or password" &&
      f76.radius === "12px" &&
      f76.border.includes("rgb(254, 202, 202)") &&
      f76.padding === "16px" &&
      f76.innerSize === "14px" &&
      f76bgOk,
    `text="${f76.text}" radius=${f76.radius} bg=${f76.bg}`,
  );
  await f76ctx.close();

  // ---- the mobile drawer (the first context is still authed) ---------------
  const mob = await ctx.newPage();
  await mob.setViewportSize({ width: 390, height: 844 });
  await mob.goto(`${BASE}/POS`);
  await mob.waitForTimeout(800);
  const burger = mob.getByRole("button", { name: /menu|navigation/i }).first();
  await burger.click();
  await mob.getByRole("dialog").waitFor({ state: "visible" });
  const mobState = await mob.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > 390,
    dialog: !!document.querySelector("[role=dialog]"),
    navLinks: [...document.querySelectorAll("[role=dialog] a")].length,
  }));
  ok(
    "the mobile drawer opens as a dialog with 8 links, zero horizontal overflow",
    mobState.dialog && mobState.navLinks === 8 && !mobState.overflow,
    `dialog=${mobState.dialog} links=${mobState.navLinks} overflow=${mobState.overflow}`,
  );
  await mob.screenshot({ path: `${OUT}/86-session16-mobile-drawer.png` });

  // ---- summary ---------------------------------------------------------------
  const passed = results.filter((r) => r.pass).length;
  console.log(`\nEVIDENCE: ${passed}/${results.length} PASSED`);
  if (passed !== results.length) process.exitCode = 1;
} catch (err) {
  console.error("EVIDENCE RUN CRASHED:", err);
  console.error(serverLog.slice(-2000));
  process.exitCode = 1;
} finally {
  await browser.close().catch(() => {});
  server.kill();
  try {
    execSync(`bun tests/e2e/kill-port.ts`, { stdio: "pipe", cwd: ROOT });
  } catch {}
}
