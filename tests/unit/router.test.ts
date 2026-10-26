import { describe, expect, it } from "vitest";

import { isAppPath, NAV_ITEMS, pathForView, viewFromPath, VIEWS } from "@/lib/router";

describe("the reference route map", () => {
  it("carries the 8 reference paths — Terminal first, Settings → /StoreSettings", () => {
    expect(NAV_ITEMS.map((n) => n.path)).toEqual([
      "/POS",
      "/Dashboard",
      "/Inventory",
      "/Sales",
      "/Registers",
      "/Cashiers",
      "/Reports",
      "/StoreSettings",
    ]);
    expect(NAV_ITEMS.map((n) => n.label)).toEqual([
      "Terminal",
      "Dashboard",
      "Inventory",
      "Sales",
      "Registers",
      "Cashiers",
      "Reports",
      "Settings",
    ]);
    expect(VIEWS).toHaveLength(8);
  });

  it("viewFromPath is case-insensitive, slash-tolerant; / → terminal", () => {
    expect(viewFromPath("/POS")).toBe("terminal");
    expect(viewFromPath("/pos")).toBe("terminal");
    expect(viewFromPath("/Dashboard/")).toBe("dashboard");
    expect(viewFromPath("/StoreSettings")).toBe("settings");
    expect(viewFromPath("/")).toBe("terminal");
    expect(viewFromPath("/nowhere")).toBe(null);
  });

  it("pathForView falls back to /POS for unknown ids", () => {
    expect(pathForView("reports")).toBe("/Reports");
    expect(pathForView("nonsense" as never)).toBe("/POS");
  });

  it("isAppPath gates the shell (unknown paths → the 404 surface)", () => {
    expect(isAppPath("/Reports")).toBe(true);
    expect(isAppPath("/login")).toBe(false);
    expect(isAppPath("/Settings")).toBe(false); // the reference's own 404 trap
  });
});
