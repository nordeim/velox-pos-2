// ---------------------------------------------------------------------------
// router.ts — the 8-view map contract (paths, round-trips, the dashboard
// date label).
// ---------------------------------------------------------------------------
import { describe, expect, it } from "vitest";

import {
  dashboardDateLabel,
  NAV_ITEMS,
  pathForView,
  VIEWS,
  viewFromPath,
} from "../src/lib/router";

describe("the view map", () => {
  it("exposes the reference's 8 sections in sidebar order", () => {
    expect(VIEWS).toEqual([
      "terminal",
      "dashboard",
      "inventory",
      "sales",
      "registers",
      "cashiers",
      "reports",
      "settings",
    ]);
    expect(NAV_ITEMS).toHaveLength(8);
    expect(NAV_ITEMS[0]).toMatchObject({ id: "terminal", path: "/Terminal" });
  });

  it("round-trips view → path → view", () => {
    for (const view of VIEWS) {
      expect(viewFromPath(pathForView(view))).toBe(view);
    }
  });

  it("is case-insensitive and tolerates trailing slashes", () => {
    expect(viewFromPath("/inventory")).toBe("inventory");
    expect(viewFromPath("/Reports/")).toBe("reports");
  });

  it("falls back to the Terminal", () => {
    expect(viewFromPath("/")).toBe("terminal");
    expect(viewFromPath("/Nope")).toBe("terminal");
    expect(pathForView("nonexistent" as never)).toBe("/Terminal");
  });
});

describe("dashboardDateLabel", () => {
  it("renders the reference's long en-US date", () => {
    expect(dashboardDateLabel(new Date(2026, 9, 26))).toBe("Monday, October 26, 2026");
  });
});
