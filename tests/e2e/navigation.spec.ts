import { expect, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// The DESKTOP navigation (1440x900): the reference's sidebar — 8 items in
// order, real paths, the active violet pill, the collapse chevron (220px ⇄
// 68px icon rail with title/aria labels preserved — the a11y superset).
// ---------------------------------------------------------------------------

const NAV = [
  ["Terminal", "/POS"],
  ["Dashboard", "/Dashboard"],
  ["Inventory", "/Inventory"],
  ["Sales", "/Sales"],
  ["Registers", "/Registers"],
  ["Cashiers", "/Cashiers"],
  ["Reports", "/Reports"],
  ["Settings", "/StoreSettings"],
] as const;

test("the sidebar carries all 8 reference items in order", async ({ page }) => {
  await page.goto("/POS");
  const sidebar = page.getByTestId("app-sidebar");
  const links = sidebar.getByRole("link");
  await expect(links).toHaveCount(8);
  for (const [i, [label]] of NAV.entries()) {
    await expect(links.nth(i)).toHaveAccessibleName(label);
  }
});

test("each item navigates to its real path and activates its pill", async ({ page }) => {
  await page.goto("/POS");
  const sidebar = page.getByTestId("app-sidebar");
  for (const [label, path] of NAV) {
    await sidebar.getByRole("link", { name: label }).click();
    await page.waitForURL(`**${path}`);
    await expect(sidebar.getByRole("link", { name: label })).toHaveAttribute(
      "aria-current",
      "page",
    );
  }
});

test("the collapse chevron toggles the 220px ⇄ 68px icon rail", async ({ page }) => {
  await page.goto("/POS");
  const sidebar = page.getByTestId("app-sidebar");
  await expect(sidebar).toHaveCSS("width", "220px");
  await sidebar.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(sidebar).toHaveCSS("width", "68px");
  // The a11y superset: collapsed icon links KEEP their accessible names.
  await expect(sidebar.getByRole("link", { name: "Dashboard" })).toBeVisible();
  await sidebar.getByRole("button", { name: "Expand sidebar" }).click();
  await expect(sidebar).toHaveCSS("width", "220px");
});

test("the collapse state persists across a reload", async ({ page }) => {
  await page.goto("/POS");
  const sidebar = page.getByTestId("app-sidebar");
  await sidebar.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(sidebar).toHaveCSS("width", "68px");
  await page.reload();
  await expect(sidebar).toHaveCSS("width", "68px");
  await sidebar.getByRole("button", { name: "Expand sidebar" }).click();
});

test("the mobile app bar is hidden on desktop (no dead controls)", async ({ page }) => {
  await page.goto("/POS");
  await expect(page.getByRole("button", { name: "Open navigation menu" })).not.toBeVisible();
});

// ---------------------------------------------------------------------------
// Session-6 pins: the nav chrome census (measured live on the reference).
// The reference's nav items are py-2.5 PADDING-DRIVEN (40px inactive; the
// active pill's 1px violet border grows it to 42px), font-medium, 16px
// icons, white/40 inactive text, an active border+shadow pair, a 14px
// white/90 wordmark, and a 16px footer chevron in a p-3 cell.
// ---------------------------------------------------------------------------

test("nav items compute the reference's py-2.5 padding-driven 40px + medium weight", async ({
  page,
}) => {
  await page.goto("/Dashboard");
  const sidebar = page.getByTestId("app-sidebar");
  const inactive = sidebar.getByRole("link", { name: "Terminal" });
  await expect(inactive).toBeVisible();
  await expect(inactive).toHaveCSS("height", "40px");
  await expect(inactive).toHaveCSS("padding", "10px 12px");
  await expect(inactive).toHaveCSS("font-weight", "500");
  // v4 serializes text-white/40 as oklab(...) with "/ 0.4)" — the reference's
  // rgba(255,255,255,0.4) is the same color; pin the ALPHA (the /40).
  // expect.poll: raw computed reads don't retry like toHaveCSS — poll until
  // the stylesheet has applied (the mid-load race once flaked this pin).
  await expect
    .poll(async () => inactive.evaluate((el) => getComputedStyle(el).color))
    .toMatch(/(?:\/\s*0\.4\)|,\s*0\.4\))/);
});

test("the active pill adds the reference's violet border + shadow (42px)", async ({ page }) => {
  await page.goto("/Dashboard");
  const sidebar = page.getByTestId("app-sidebar");
  const active = sidebar.locator("a[aria-current='page']");
  await expect(active).toBeVisible();
  await expect(active).toHaveCSS("height", "42px");
  await expect(active).toHaveCSS("border-top-width", "1px");
  // border-violet-500/30 — v4 serializes as oklab with /0.3 (same color as
  // the reference's rgba(139,92,246,0.3)); pin the ALPHA.
  await expect
    .poll(async () => active.evaluate((el) => getComputedStyle(el).borderTopColor))
    .toMatch(/(?:\/\s*0\.3\)|,\s*0\.3\))/);
  // bg-violet-600/20 — v4 serializes as oklab(0.54132 0.0964073 -0.226955 / 0.2)
  // (the reference computes rgba(124,58,237,0.2) — the same color). Pin the
  // oklab channel signature + the ALPHA.
  await expect
    .poll(async () => active.evaluate((el) => getComputedStyle(el).backgroundColor))
    .toMatch(/oklab\(0\.54\d*\s+0\.09\d*\s+-0\.2\d*\s*\/\s*0\.2\)/);
  await expect(active).toHaveCSS("color", "rgb(196, 181, 253)");
  // shadow-sm shadow-violet-500/10 — v4 serializes the composed shadow with
  // an oklab/alpha color stop; pin the /10 alpha.
  await expect
    .poll(async () => active.evaluate((el) => getComputedStyle(el).boxShadow))
    .toMatch(/(?:\/\s*0\.1\)|,\s*0\.1\))/);
});

test("nav icons, the wordmark, and the footer chevron compute the reference's 16px family", async ({
  page,
}) => {
  await page.goto("/Dashboard");
  const sidebar = page.getByTestId("app-sidebar");

  // Nav icons: w-4 h-4 (16px) — measured on the reference's live sidebar.
  const icon = sidebar.getByRole("link", { name: "Terminal" }).locator("svg");
  await expect(icon).toBeVisible();
  const iconBox = await icon.boundingBox();
  expect(iconBox?.width).toBe(16);
  expect(iconBox?.height).toBe(16);

  // The brand wordmark: text-sm font-bold text-white/90 (14px — Session-101
  // shipped text-lg; the live reference measures 14px). white/90 serializes
  // as oklab with /0.9 — pin the ALPHA.
  const wordmark = page.locator("#vpx-brand-label");
  await expect(wordmark).toHaveCSS("font-size", "14px");
  await expect(wordmark).toHaveCSS("font-weight", "700");
  await expect
    .poll(async () => wordmark.evaluate((el) => getComputedStyle(el).color))
    .toMatch(/(?:\/\s*0\.9\)|,\s*0\.9\))/);

  // The chip's Zap: w-4 h-4, stroke 2 (measured: lucide-zap w-4 h-4 text-white).
  const zap = wordmark.locator("..").locator("svg").first();
  const zapBox = await zap.boundingBox();
  expect(zapBox?.width).toBe(16);

  // The footer cell (p-3) and its chevron (w-4 h-4).
  const collapse = sidebar.getByRole("button", { name: "Collapse sidebar" });
  await expect(collapse.locator("..")).toHaveCSS("padding", "12px");
  const chevron = collapse.locator("svg");
  const chevronBox = await chevron.boundingBox();
  expect(chevronBox?.width).toBe(16);
});

// ---------------------------------------------------------------------------
// Session-9 pins (F-56/F-58) — two chrome contracts the earlier sessions
// missed because neither had a pin:
//   F-56: the Reports glyph is the FILE variant (a document with increasing
//         bars — class lucide-file-chart-column-increasing, the lucide
//         export FileChartColumnIncreasing). Session-6's F-47 fix misread
//         the class→export mapping and shipped ChartColumnIncreasing (bars
//         only) — a visibly different glyph that survived three sessions
//         because no pin asserted the class.
//   F-58: v4's preflight (unlike v3's) sets NO cursor:pointer on buttons —
//         every button on the clone computed cursor:default while the
//         reference (v3-era CSS) computes pointer. The base-layer rule in
//         tokens.css is the cure; this pin is the protection.
// ---------------------------------------------------------------------------

test("the Reports nav glyph is the reference's file-chart-column-increasing (the FILE variant)", async ({
  page,
}) => {
  await page.goto("/Dashboard");
  const sidebar = page.getByTestId("app-sidebar");
  const reportsIcon = sidebar.getByRole("link", { name: "Reports" }).locator("svg");
  await expect(reportsIcon).toBeVisible();
  // Measured live on the reference: class="lucide lucide-file-chart-column-increasing
  // w-4 h-4 flex-shrink-0" — the DOCUMENT variant, not the bare bars.
  await expect(reportsIcon).toHaveClass(/lucide-file-chart-column-increasing/);
});

test("buttons compute cursor:pointer (the v3-era preflight contract v4 dropped)", async ({
  page,
}) => {
  await page.goto("/Dashboard");
  const sidebar = page.getByTestId("app-sidebar");
  // The chevron: a plain button (no glass class) — the barest expression of
  // the base-layer rule. The reference measures cursor:pointer on it.
  const collapse = sidebar.getByRole("button", { name: "Collapse sidebar" });
  await expect(collapse).toBeVisible();
  await expect(collapse).toHaveCSS("cursor", "pointer");
});

test("Cashiers at zero shifts renders the reference's BARE ledger (no empty-state row)", async ({
  page,
}) => {
  // Session-28 (F-126-a, sweep #22 measured live on the reference): the
  // reference's EMPTY "Turnos Recientes" table is the BARE table — six
  // headers over an empty tbody, NO in-table empty-state row ("Sin turnos"
  // appears nowhere in its body; its Sales/Inventory ledgers DO carry
  // in-table empty rows — the convention is PER-SURFACE). The clone's former
  // "Sin turnos registrados" row was an unmeasured Session-2-era convention,
  // removed for parity.
  //
  // FILE-POSITION NOTE (the ordering law's inverse): this pin MUST run
  // BEFORE any spec that creates a shift — a closed shift renders a ledger
  // row forever after (no shift DELETE endpoints exist). This file sorts
  // n < r: registers-shifts.spec's shift lands after this pin reads the
  // zero-shift state. Never move this pin into a file sorting after "r".
  await page.goto("/Cashiers");
  await expect(page.getByRole("heading", { name: "Turnos Recientes" })).toBeVisible();
  const turnos = page.getByRole("table");
  await expect(turnos.getByRole("columnheader")).toHaveCount(6);
  await expect(turnos.locator("tbody tr")).toHaveCount(0);
});
