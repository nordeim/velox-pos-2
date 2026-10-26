import { describe, expect, it } from "vitest";

import {
  cardProviderLabel,
  CARD_PROVIDERS,
  CURRENCIES,
  currencyLabel,
  isCardProvider,
  isSupportedCurrency,
} from "@/lib/currency";

describe("currencies", () => {
  it("USD first with the reference's label form", () => {
    expect(CURRENCIES[0]).toEqual({ code: "USD", label: "USD - US Dollar" });
  });

  it("labels resolve and unsupported codes fail the schema guard", () => {
    expect(currencyLabel("EUR")).toBe("EUR - Euro");
    expect(currencyLabel("XYZ")).toBe("XYZ");
    expect(isSupportedCurrency("USD")).toBe(true);
    expect(isSupportedCurrency("XYZ")).toBe(false);
  });
});

describe("card providers", () => {
  it("None first, known providers accepted, unknown rejected", () => {
    expect(CARD_PROVIDERS[0]).toBe("none");
    expect(isCardProvider("Stripe")).toBe(true);
    expect(isCardProvider("PayPal")).toBe(false);
    expect(cardProviderLabel("none")).toBe("None");
    expect(cardProviderLabel("SumUp")).toBe("SumUp");
  });
});
