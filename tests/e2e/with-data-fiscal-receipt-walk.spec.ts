import { expect, test, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Session-25 (F-123): the fiscal receipt round-trip walk — the deepest
// functional chain on the StoreSettings surface, with ZERO e2e protection
// before this spec. The chain: the fiscal Switch flip (the INVERTED wiring:
// checked={!form.hideFiscalOnReceipt}, switch ON = "Visible on receipt") →
// the Tax ID / EIN + Tax Regime fills → Save Changes → the PATCH payload
// carrying hideFiscalOnReceipt + fiscalRuc/fiscalBusinessType →
// setSettings(row) (the store refresh) → the "Settings saved" toast → the
// TERMINAL CHECKOUT → the receipt's fiscal conditional
// `!settings?.hideFiscalOnReceipt && (settings?.fiscalRuc || settings?.taxId)`
// rendering the dashed-border RUC line with the business-type suffix.
//
// What was e2e-invisible before: surfaces.spec pins the toggle's DEFAULT
// (hidden) state, the static fiscal labels, and the basic store-name save;
// terminal.spec pins the receipt's ticket/timestamp/footer/print-path — but
// NOTHING pinned the receipt's fiscal line in EITHER render state. A
// polarity flip in the conditional, a lost fiscalRuc in the save payload, a
// broken setSettings refresh, or the receipt's fiscal <p> stopping rendering
// would ALL have passed the entire suite.
//
// The ANALYZE facts this spec transcribes (the V16 probes, measured live on
// the dev server before the spec was written): the flip + fill + save
// renders the toast and persists hideFiscalOnReceipt:false + the RUC (API
// verified); a full UI checkout then renders the receipt's fiscal line with
// the exact RUC text; the POLARITY state (toggle OFF, RUC still set) does
// NOT render the line — the !hideFiscalOnReceipt guard proven, not just
// empty-field absence; the restore returns the seed defaults.
//
// The reference cannot produce this state (write-gated; its fiscal toggle
// is an icon-button with NO switch semantics — the clone's labeled Radix
// Switch is the documented a11y superset) — this tier is a
// functional-SUPERSET addition, the s20..s24 lineage.
//
// The exact-value pins' red is by construction: the settings state is
// verified through the API (state, not just UI), and the receipt lines are
// asserted by their EXACT template text (the RUC + the " · " + the business
// type) — never a class string.
//
// FILE-NAME ORDERING IS LOAD-BEARING: this spec sorts AFTER
// with-data-dashboard-walk (d < f) and BEFORE with-data-inventory-csv
// (f < i) and with-data-reports-walk (f < r) in the chromium project.
// surfaces.spec's settings pins (the default toggle state, the basic save,
// the listboxes) and terminal.spec's receipt pins run BEFORE it exists
// (s/t < w); the CSV walk derives product counts from the API and the
// reports walk derives everything from the SALES API at runtime — both
// robust to this spec's product and sales. The walk SELF-CLEANS: both
// shifts CLOSED (counted = float + the cash sale → an exact variance), the
// settings RESTORED to seed defaults (toggle hidden + RUC empty) — and even
// a mid-test failure leaves a safe state for the remaining specs (the
// CSV/reports walks are settings-independent by construction). The mobile
// project runs after chromium and carries no settings/receipt pins.
// ---------------------------------------------------------------------------

const CATEGORY_NAME = "Fiscal Walk";
const PRODUCT_NAME = "Fiscal Walk Coffee";
const PRODUCT_BARCODE = "FWALK-390";
const PRODUCT_PRICE = 3.25;
const REGISTER_NAME = "Fiscal Walk Register";
const RUC = "FWALK-RUC-001";
const BUSINESS_TYPE = "S-Corp Test";
// The receipt's fiscal-line template: `{ruc}{biz ? ` · ${biz}` : ""}` — the
// middle dot is U+00B7, byte-matched to the view's own template literal.
const FISCAL_LINE = `${RUC} · ${BUSINESS_TYPE}`;
// float 100 + one cash sale of $3.25 → the exact-count close (zero variance).
const COUNTED_CASH = "103.25";

type CategoryRow = { id: string; name: string };
type ProductRow = { id: string; name: string; barcode: string };
type RegisterRow = { id: string; name: string };
type SettingsRow = { hideFiscalOnReceipt: boolean; fiscalRuc: string };

async function json(r: { json: () => Promise<unknown> }) {
  return r.json() as Promise<any>;
}

async function getSettings(page: Page): Promise<SettingsRow> {
  return json(await page.request.get("/api/store-settings"));
}

// The fixture chain (idempotent — re-used if present on a warm db; every
// POST ASSERTS its response, the F-120 law).
async function provision(page: Page): Promise<void> {
  const cats = (await json(await page.request.get("/api/categories"))) as CategoryRow[];
  let catId = cats.find((c) => c.name === CATEGORY_NAME)?.id;
  if (!catId) {
    const resp = await page.request.post("/api/categories", {
      data: { name: CATEGORY_NAME },
    });
    expect(resp.ok(), `the fixture category must create (got ${resp.status()})`).toBe(true);
    catId = (await json(resp)).id;
  }

  const prods = (await json(await page.request.get("/api/products"))) as ProductRow[];
  let prodId = prods.find((p) => p.barcode === PRODUCT_BARCODE)?.id;
  if (!prodId) {
    const resp = await page.request.post("/api/products", {
      data: {
        name: PRODUCT_NAME,
        price: PRODUCT_PRICE,
        categoryId: catId,
        stock: 10,
        minStock: 2,
        barcode: PRODUCT_BARCODE,
        taxRate: 0,
      },
    });
    expect(resp.ok(), `the fixture product must create (got ${resp.status()})`).toBe(true);
    prodId = (await json(resp)).id;
  }
  expect(prodId, "the fixture product id must resolve").toBeTruthy();

  const regs = (await json(await page.request.get("/api/registers"))) as RegisterRow[];
  if (!regs.some((r) => r.name === REGISTER_NAME)) {
    const resp = await page.request.post("/api/registers", {
      data: { name: REGISTER_NAME, openingFloat: 100 },
    });
    expect(resp.ok(), `the fixture register must create (got ${resp.status()})`).toBe(true);
  }
}

// The register card (the standing `register-<name>` testid) + its shift
// lifecycle, driven through the REAL dialogs (registers-shifts.spec's
// proven locators).
async function openShift(page: Page): Promise<void> {
  await page.goto("/Registers");
  const card = page.getByTestId(`register-${REGISTER_NAME}`);
  await card.getByRole("button", { name: "Open shift" }).click();
  const dialog = page.getByRole("dialog", { name: new RegExp(`Open shift — ${REGISTER_NAME}`) });
  await dialog.getByLabel("Opening float").fill("100");
  await dialog.getByRole("button", { name: "Open shift" }).click();
  await expect(card.getByText("Shift open")).toBeVisible();
}

// The checkout journey through the REAL terminal (terminal.spec's proven
// locators) — returns the receipt dialog locator.
async function checkout(page: Page) {
  await page.goto("/POS");
  await page.getByRole("button", { name: `Add ${PRODUCT_NAME} to cart` }).click();
  const charge = page.getByTestId("charge-button");
  await expect(charge).toContainText(`CHARGE $${PRODUCT_PRICE.toFixed(2)}`);
  await charge.click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Amount received").fill("5");
  await dialog.getByRole("button", { name: /Complete cash sale/ }).click();
  const receipt = page.getByRole("dialog");
  await expect(receipt.getByText(/T-0000\d/)).toBeVisible();
  return receipt;
}

// The self-clean law (the terminal.spec/drift-sweep/walks precedent): an
// ACTIVE shift leaks into every downstream spec's POS gate.
async function closeShift(page: Page): Promise<void> {
  await page.goto("/Registers");
  const card = page.getByTestId(`register-${REGISTER_NAME}`);
  await card.getByRole("button", { name: "Close shift" }).click();
  const dialog = page.getByRole("dialog", { name: "Close shift" });
  await dialog.getByLabel("Counted cash").fill(COUNTED_CASH);
  await dialog.getByRole("button", { name: "Close shift" }).click();
  await expect(card.getByRole("button", { name: "Open shift" })).toBeVisible();
}

test.describe("the fiscal receipt round-trip walk (Session-25, F-123)", () => {
  test("the visible state: flip → save → store refresh → the receipt renders the fiscal line", async ({
    page,
  }) => {
    await provision(page);

    // ---- the settings leg: the INVERTED switch + the fiscal fields ----
    await page.goto("/StoreSettings");
    const fiscal = page.getByRole("region", { name: "Fiscal / Tax Data" });
    // The default is hidden (the seed) — assert the starting polarity first.
    await expect(fiscal.getByRole("switch", { name: "Show fiscal data on receipt" })).not.toBeChecked();
    await expect(fiscal.getByText("Hidden on receipt")).toBeVisible();
    await fiscal.getByRole("switch", { name: "Show fiscal data on receipt" }).click();
    // The inverted wiring, live: switch ON = "Visible on receipt".
    await expect(fiscal.getByRole("switch", { name: "Show fiscal data on receipt" })).toBeChecked();
    await expect(fiscal.getByText("Visible on receipt")).toBeVisible();
    await fiscal.getByLabel("Tax ID / EIN").fill(RUC);
    await fiscal.getByLabel("Tax Regime").fill(BUSINESS_TYPE);
    await page.getByTestId("save-settings").click();
    await expect(
      page.getByRole("region", { name: "Notifications" }).getByText("Settings saved"),
    ).toBeVisible();

    // API verify (the F-120 posture — state, not just UI): the PATCH
    // persisted the inverted flag AND both fiscal fields.
    const saved = await getSettings(page);
    expect(saved.hideFiscalOnReceipt, "the inverted flag must persist (false = visible)").toBe(false);
    expect(saved.fiscalRuc, "the RUC must persist").toBe(RUC);

    // ---- the receipt leg: a real checkout renders the fiscal line ----
    await openShift(page);
    const receipt = await checkout(page);
    // The fiscal line's EXACT template text (the RUC · the business type),
    // inside the printable wrapper — the template, not just presence.
    await expect(receipt.locator(".receipt-print").getByText(FISCAL_LINE)).toBeVisible();
    // The store-refresh half of the chain: the receipt reads the SAME
    // settings the save wrote (the dashed-border line renders only when
    // !hideFiscalOnReceipt && the RUC exists — both conditions live).
    await receipt.getByRole("button", { name: "Close", exact: true }).first().click();
    await closeShift(page);
  });

  test("the hidden polarity + the full restore: the RUC set but gated off renders nothing", async ({
    page,
  }) => {
    await provision(page);

    // The dependency on test 1's settings state, asserted loudly (the API
    // carries the VISIBLE state: the flag false + the RUC persisted).
    const carried = await getSettings(page);
    expect(
      carried.hideFiscalOnReceipt === false && carried.fiscalRuc === RUC,
      "test 2 requires test 1's visible state (flag false + the RUC persisted)",
    ).toBe(true);

    // ---- the polarity state: flip OFF with the RUC STILL SET ----
    await page.goto("/StoreSettings");
    const fiscal = page.getByRole("region", { name: "Fiscal / Tax Data" });
    await fiscal.getByRole("switch", { name: "Show fiscal data on receipt" }).click();
    await expect(fiscal.getByText("Hidden on receipt")).toBeVisible();
    await fiscal.getByLabel("Tax ID / EIN").fill(RUC); // unchanged — still set
    await page.getByTestId("save-settings").click();
    await expect(
      page.getByRole("region", { name: "Notifications" }).getByText("Settings saved"),
    ).toBeVisible();

    // API verify the polarity state: the flag TRUE and the RUC STILL
    // persisted (the field exists but is gated — the strongest hidden
    // condition for the conditional's guard).
    const gated = await getSettings(page);
    expect(gated.hideFiscalOnReceipt, "the flag must gate (true = hidden)").toBe(true);
    expect(gated.fiscalRuc, "the RUC stays persisted while gated").toBe(RUC);

    // ---- the receipt leg: the SAME checkout renders NO fiscal line ----
    await openShift(page);
    const receipt = await checkout(page);
    await expect(receipt.getByText(/T-0000\d/)).toBeVisible();
    // The polarity pin: with the RUC set but the flag gating it, the
    // fiscal line does NOT render — the !hideFiscalOnReceipt guard, not
    // just empty-field absence.
    await expect(receipt.locator(".receipt-print").getByText(/FWALK-RUC-001/)).toHaveCount(0);
    await receipt.getByRole("button", { name: "Close", exact: true }).first().click();
    await closeShift(page);

    // ---- the full restore (the self-clean law): seed defaults ----
    await page.goto("/StoreSettings");
    // Scoped: TWO inputs carry the "Tax ID / EIN" label (Business
    // Information's taxId and the fiscal card's fiscalRuc) — the restore
    // targets the FISCAL one.
    await page
      .getByRole("region", { name: "Fiscal / Tax Data" })
      .getByLabel("Tax ID / EIN")
      .fill("");
    await page.getByTestId("save-settings").click();
    await expect(
      page.getByRole("region", { name: "Notifications" }).getByText("Settings saved"),
    ).toBeVisible();
    const restored = await getSettings(page);
    expect(restored.hideFiscalOnReceipt, "the seed default: fiscal hidden").toBe(true);
    expect(restored.fiscalRuc, "the seed default: no RUC").toBe("");
  });
});
