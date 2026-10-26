// ---------------------------------------------------------------------------
// Currency atoms (the Settings select + the money formatters' inputs).
// Pure — unit-pinned by tests/unit/currency.test.ts.
// ---------------------------------------------------------------------------

export type CurrencyOption = { code: string; label: string };

/** The Settings dropdown's options — code + the reference's "USD - US Dollar" label form. */
export const CURRENCIES: CurrencyOption[] = [
  { code: "USD", label: "USD - US Dollar" },
  { code: "EUR", label: "EUR - Euro" },
  { code: "GBP", label: "GBP - British Pound" },
  { code: "MXN", label: "MXN - Mexican Peso" },
  { code: "CAD", label: "CAD - Canadian Dollar" },
  { code: "AUD", label: "AUD - Australian Dollar" },
  { code: "PEN", label: "PEN - Peruvian Sol" },
  { code: "COP", label: "COP - Colombian Peso" },
];

export function currencyLabel(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.label ?? code;
}

export function isSupportedCurrency(code: string): boolean {
  return CURRENCIES.some((c) => c.code === code);
}

// ---- the card-payment provider atoms ----------------------------------------

export const CARD_PROVIDERS = ["none", "Stripe", "SumUp", "Square"] as const;

export function isCardProvider(value: string): boolean {
  return (CARD_PROVIDERS as readonly string[]).includes(value);
}

/** Provider label for the select ("None" for the empty choice). */
export function cardProviderLabel(value: string): string {
  if (value === "none") return "None";
  return value;
}
