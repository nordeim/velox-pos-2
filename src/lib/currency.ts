// ---------------------------------------------------------------------------
// Currency atoms (the Settings select + the money formatters' inputs).
// Pure — unit-pinned by tests/unit/currency.test.ts.
// ---------------------------------------------------------------------------

export type CurrencyOption = { code: string; label: string };

/** The Settings dropdown's options — code + the reference's "USD - US Dollar" label form. */
// Session-15 (F-108/F-109, measured live 2026-10-27): BOTH Settings
// listboxes enumerated on the reference for the first time. Session-101 had
// recorded only "USD/EUR/MXN/GBP/…" (an ellipsis, never measured) and the
// clone shipped invented extras (CAD/AUD/PEN; SumUp/Square) while MISSING
// the reference's own entries (ARS - Argentine Peso; PayPal/Clip/Mercado
// Pago). The measured lists replace the inventions — the same
// measurement-over-assumption doctrine as the Session-14 chart colors.
export const CURRENCIES: CurrencyOption[] = [
  { code: "USD", label: "USD - US Dollar" },
  { code: "EUR", label: "EUR - Euro" },
  { code: "GBP", label: "GBP - British Pound" },
  { code: "MXN", label: "MXN - Mexican Peso" },
  { code: "COP", label: "COP - Colombian Peso" },
  { code: "ARS", label: "ARS - Argentine Peso" },
];

export function currencyLabel(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.label ?? code;
}

export function isSupportedCurrency(code: string): boolean {
  return CURRENCIES.some((c) => c.code === code);
}

// ---- the card-payment provider atoms ----------------------------------------

// The reference's Card Payment Provider listbox, measured live: None,
// Stripe, PayPal, Clip, Mercado Pago (the clone's SumUp/Square were
// Session-101 inventions). The stored value for "None" keeps the code
// form "none" (the seeded default).
export const CARD_PROVIDERS = ["none", "Stripe", "PayPal", "Clip", "Mercado Pago"] as const;

export function isCardProvider(value: string): boolean {
  return (CARD_PROVIDERS as readonly string[]).includes(value);
}

/** Provider label for the select ("None" for the empty choice). */
export function cardProviderLabel(value: string): string {
  if (value === "none") return "None";
  return value;
}
