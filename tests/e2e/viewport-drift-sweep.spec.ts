import { expect, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// Session-20 (F-116): the four-width responsive drift-sweep battery — the
// standing visual-regression tier this codebase did not have (the session_33
// "Next" pointer; the master skill §15 gate:full doctrine). Before this spec
// the suite pinned 390 (the mobile drawer, /POS-centered) and 1440 (the
// desktop specs) — the intermediate widths 768/1024 had ZERO coverage, the
// route-battery overflow contract existed for /POS@390 only, and the
// with-data ledger containment had no guard anywhere.
//
// The ANALYZE facts this spec transcribes (the V16/V17 probes, measured live
// before the spec was written): every route computes docScrollW === clientW
// at all four widths, empty AND demo-seeded; the chrome switches exactly at
// md (the sidebar `hidden md:flex`, the hamburger `md:hidden`); the ledger
// tables (min-w 720–760) stay contained inside their `.vpx-scroll
// overflow-x-auto` containers. The reference itself ships the regression
// class (its own static 220px sidebar on phones — no hamburger, main
// squeezed to 170px beside it after the reference's own layout change; the
// Session-21 D-1 drift record).
//
// Session-21 (F-117) extended the with-data guard from Inventory-only to the
// THREE-ledger walk (the session_35 "Next" pointer): the clone ships three
// wide ledger tables — Inventory min-w-[760px], Sales min-w-[720px],
// Cashiers min-w-[640px] — each in its own .vpx-scroll container, and the
// s20 guard visited only Inventory. The frame battery stays blind to the
// inner-container break on ALL of them (the V18 proof), so Sales/Cashiers
// had no functional protection at all until this walk.
//
// The containment pin's observable is FUNCTIONAL, not structural — the V18
// mutation proof: a frame-level pin alone cannot catch the inner-container
// break (the outer `glass-card overflow-hidden` absorbs the spill — measured
// live), and Chromium reports `scrollWidth > clientWidth` even for
// overflow-x: visible (a scrollWidth census cannot distinguish the two —
// measured live). The `scrollLeft = 50` read-back DOES distinguish: under the
// injected regression the assignment no-ops. Pin the functional scroll.
// ---------------------------------------------------------------------------

const WIDTHS = [390, 768, 1024, 1440] as const;
const ROUTES = [
  "/POS",
  "/Dashboard",
  "/Inventory",
  "/Sales",
  "/Registers",
  "/Cashiers",
  "/Reports",
  "/StoreSettings",
] as const;

test.describe("the four-width drift-sweep battery (Session-20, F-116)", () => {
  test("no route overflows the four audit widths (the 390/768/1024/1440 battery)", async ({ page }) => {
    test.slow(); // 32 route visits (8 routes × 4 widths) + hydration settles
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 844 });
      for (const [i, route] of ROUTES.entries()) {
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(700); // the hydration settle (the empty-store battery posture)
        const probe = await page.evaluate(() => {
          const de = document.documentElement;
          const main = document.querySelector("main");
          return {
            docScrollW: de.scrollWidth,
            clientW: de.clientWidth,
            mainScrollW: main ? main.scrollWidth : null,
          };
        });
        expect(
          probe.docScrollW,
          `${route} @${width}: the document must not overflow horizontally`,
        ).toBeLessThanOrEqual(probe.clientW);
        if (probe.mainScrollW !== null) {
          expect(
            probe.mainScrollW,
            `${route} @${width}: main must not overflow horizontally`,
          ).toBeLessThanOrEqual(probe.clientW);
        }
        // The chrome-switch contract, asserted once per width (on /POS, the
        // first route): the hamburger is the <md chrome, the sidebar the >=md
        // chrome. VISIBILITY assertions — `hidden md:flex` elements stay in
        // the DOM below md; count would lie (the AGENTS law).
        if (i === 0) {
          const hamburger = page.getByRole("button", {
            name: "Open navigation menu",
          });
          const sidebar = page.getByTestId("app-sidebar");
          if (width < 768) {
            await expect(hamburger, `@${width}: the hamburger owns the sub-md chrome`).toBeVisible();
            await expect(sidebar, `@${width}: the sidebar is hidden below md`).not.toBeVisible();
          } else {
            await expect(sidebar, `@${width}: the sidebar owns the md+ chrome`).toBeVisible();
            await expect(hamburger, `@${width}: the hamburger is hidden at md and above`).not.toBeVisible();
          }
        }
      }
    }
  });

  test("the with-data ledgers stay contained and scrollable at 390 (the M-109c1 guard — the three-ledger walk)", async ({ page }) => {
    // Self-owned data (the s19 provisionFixture posture — the serial
    // one-worker suite; the names are unique to this spec). Session-21
    // (F-117) extended the chain past the product: ONE chain feeds all
    // THREE ledgers — the product → Inventory, the sale → Sales, the
    // shift → Cashiers ("Turnos Recientes" is a SHIFTS table and the
    // shifts POST route pins cashierId to the owner, so the owner's shift
    // renders as the ledger row).
    const json = (r: { json: () => Promise<unknown> }) => r.json() as Promise<any>;
    const cats = await json(await page.request.get("/api/categories"));
    let catId = cats.find((c: { name: string }) => c.name === "Drift Sweep")?.id;
    if (!catId) {
      const cat = await page.request.post("/api/categories", {
        data: { name: "Drift Sweep" },
      });
      catId = (await json(cat)).id;
    }
    const prods = await json(await page.request.get("/api/products"));
    let prodId = prods.find((p: { barcode: string }) => p.barcode === "DSWEEP-390")?.id;
    if (!prodId) {
      const prod = await page.request.post("/api/products", {
        data: {
          name: "Drift Sweep Cola",
          price: 2.5,
          categoryId: catId,
          stock: 50,
          minStock: 2,
          barcode: "DSWEEP-390",
          taxRate: 0,
        },
      });
      prodId = (await json(prod)).id;
    }
    // The register → active-shift → sale chain (Session-21): the checkout
    // pins to the latest ACTIVE shift, so the shift must exist first. All
    // three creates are idempotent on re-runs against a warm scratch db.
    const regs = await json(await page.request.get("/api/registers"));
    let reg = regs.find((r: { name: string }) => r.name === "Drift Sweep Register");
    if (!reg) {
      reg = await json(
        await page.request.post("/api/registers", {
          data: { name: "Drift Sweep Register", openingFloat: 100 },
        }),
      );
    }
    const activeShifts = await json(await page.request.get("/api/shifts?status=active"));
    let shift = activeShifts.find((s: { registerId: string }) => s.registerId === reg.id);
    if (!shift) {
      shift = await json(
        await page.request.post("/api/shifts", {
          data: { registerId: reg.id, openingFloat: 100 },
        }),
      );
    }
    const sales = await json(await page.request.get("/api/sales"));
    let ticket = sales.find((s: { customer: string | null }) => s.customer === "Drift Sweep")
      ?.ticket as string | undefined;
    if (!ticket) {
      // Session-22 (F-120): this POST silently 400'd for two sessions — the
      // payload carried the PRE-contract `quantity` field instead of the
      // saleCreateSchema's `name`/`price`/`qty`/`taxRate` line shape, so
      // `sale.ticket` was always undefined and the Sales leg's settled wait
      // (`filter({ hasText: undefined })` — no filter) matched ANY row:
      // terminal.spec's sale when it ran first, the empty-state td row on a
      // colder db. A provisioning POST ASSERTS its response — a silent 400
      // makes every downstream wait vacuous.
      const resp = await page.request.post("/api/sales", {
        data: {
          items: [
            {
              productId: prodId,
              name: "Drift Sweep Cola",
              price: 2.5,
              qty: 2,
              taxRate: 0,
            },
          ],
          paymentMethod: "cash",
          amountPaid: 20,
          customer: "Drift Sweep",
        },
      });
      expect(resp.ok(), `the fixture sale must create (got ${resp.status()})`).toBe(true);
      ticket = (await json(resp)).ticket;
      expect(ticket, "the fixture sale must allocate a ticket").toBeTruthy();
    }
    // The self-clean law (the terminal.spec posture — its shift closes so the
    // mobile spec's POS gate test sees the gate): close this spec's shift
    // BEFORE the walk. An ACTIVE shift would leak into every downstream
    // spec's terminal surface (the mobile project runs after chromium). A
    // CLOSED shift still renders the Cashiers ledger row — "Turnos
    // Recientes" lists recent shifts of ANY status ("Cerrado") — so the
    // walk's settled wait is unaffected.
    if (shift.status === "active") {
      await page.request.patch(`/api/shifts/${shift.id}`, {
        data: { countedCash: 110 },
      });
    }

    await page.setViewportSize({ width: 390, height: 844 });
    // The three-surface walk (the session_35 "Next" pointer): each route's
    // settled state is its OWN row — the product row (Inventory), the
    // ticket row (Sales), the shift row carrying the register name
    // (Cashiers) — the s16 bootstrap-race lesson: never a timer.
    const surfaces = [
      { route: "/Inventory", row: "Drift Sweep Cola", floor: 760 },
      { route: "/Sales", row: ticket, floor: 720 },
      { route: "/Cashiers", row: "Drift Sweep Register", floor: 640 },
    ] as const;
    for (const surface of surfaces) {
      await page.goto(surface.route, { waitUntil: "domcontentloaded" });
      await page
        .locator("table tbody tr")
        .filter({ hasText: surface.row })
        .first()
        .waitFor({ state: "visible", timeout: 15_000 });

      const probe = await page.evaluate(() => {
        const de = document.documentElement;
        const main = document.querySelector("main");
        // the ledger container = the table's OWN .vpx-scroll wrapper
        // (table.closest) — NEVER a document-order .find(): `main` itself
        // carries .vpx-scroll (the app-shell's overflow-y-auto) and contains
        // the table, so a `.find(c => c.querySelector("table"))` picks MAIN,
        // which is not a horizontal scroll container (the first run's lesson)
        const table = document.querySelector("table");
        const container = table ? table.closest(".vpx-scroll") : null;
        // THE FUNCTIONAL SCROLL PROBE (the V18/V17 mutation-proven
        // observable): under overflow-x: visible the assignment no-ops —
        // scrollWidth cannot distinguish, scrollLeft CAN.
        let functionalScroll = false;
        if (container) {
          container.scrollLeft = 50;
          functionalScroll = container.scrollLeft > 0;
          container.scrollLeft = 0;
        }
        return {
          docScrollW: de.scrollWidth,
          clientW: de.clientWidth,
          mainScrollW: main ? main.scrollWidth : null,
          functionalScroll,
          tableScrollW: table ? table.scrollWidth : null,
        };
      });
      expect(
        probe.docScrollW,
        `${surface.route}: the document must stay contained at 390 with data`,
      ).toBeLessThanOrEqual(probe.clientW);
      expect(
        probe.mainScrollW,
        `${surface.route}: main must stay contained at 390 with data`,
      ).toBeLessThanOrEqual(probe.clientW);
      expect(
        probe.functionalScroll,
        `${surface.route}: the ledger container must be a FUNCTIONAL scroll region (scrollLeft assignment works — the V18/V17 mutation-proven observable)`,
      ).toBe(true);
      expect(
        probe.tableScrollW,
        `${surface.route}: the table keeps its min-width floor (min-w-[${surface.floor}px]) — the container contains, the table never shrinks`,
      ).toBeGreaterThanOrEqual(surface.floor);
    }
  });
});
