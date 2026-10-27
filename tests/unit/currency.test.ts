import { describe, expect, it } from "vitest";

import {
  cardProviderLabel,
  CARD_PROVIDERS,
  CURRENCIES,
  currencyLabel,
  isCardProvider,
  isSupportedCurrency,
} from "@/lib/currency";

// Session-15 (F-108/F-109, measured live on the reference 2026-10-27): both
// Settings listboxes were ENUMERATED for the first time — Session-101 had
// recorded only "USD/EUR/MXN/GBP/…" (an ellipsis, never measured), and the
// clone shipped invented extras while MISSING the reference's own entries.
// These pins hold the clone to the MEASURED lists, in the measured order.

describe("currencies", () => {
  it("USD first with the reference's label form", () => {
    expect(CURRENCIES[0]).toEqual({ code: "USD", label: "USD - US Dollar" });
  });

  it("the Currency listbox is the reference's measured six, in order (F-108)", () => {
    expect(CURRENCIES).toEqual([
      { code: "USD", label: "USD - US Dollar" },
      { code: "EUR", label: "EUR - Euro" },
      { code: "GBP", label: "GBP - British Pound" },
      { code: "MXN", label: "MXN - Mexican Peso" },
      { code: "COP", label: "COP - Colombian Peso" },
      { code: "ARS", label: "ARS - Argentine Peso" },
    ]);
  });

  it("labels resolve (incl. the measured ARS) and unsupported codes fail the guard", () => {
    expect(currencyLabel("EUR")).toBe("EUR - Euro");
    expect(currencyLabel("ARS")).toBe("ARS - Argentine Peso");
    expect(currencyLabel("COP")).toBe("COP - Colombian Peso");
    expect(currencyLabel("XYZ")).toBe("XYZ");
    expect(isSupportedCurrency("ARS")).toBe(true);
    expect(isSupportedCurrency("CAD")).toBe(false);
    expect(isSupportedCurrency("XYZ")).toBe(false);
  });
});

describe("card providers", () => {
  it("the Card Payment Provider listbox is the reference's measured five, in order (F-109)", () => {
    expect(CARD_PROVIDERS).toEqual(["none", "Stripe", "PayPal", "Clip", "Mercado Pago"]);
  });

  it("None first, measured providers accepted, invented ones rejected", () => {
    expect(CARD_PROVIDERS[0]).toBe("none");
    expect(isCardProvider("Stripe")).toBe(true);
    expect(isCardProvider("PayPal")).toBe(true);
    expect(isCardProvider("Clip")).toBe(true);
    expect(isCardProvider("Mercado Pago")).toBe(true);
    expect(isCardProvider("SumUp")).toBe(false);
    expect(isCardProvider("Square")).toBe(false);
    expect(cardProviderLabel("none")).toBe("None");
    expect(cardProviderLabel("Clip")).toBe("Clip");
  });
});
