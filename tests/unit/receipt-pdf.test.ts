import { describe, expect, it } from "vitest";

import {
  renderReceiptPdf,
  type ReceiptPdfInput,
} from "@/lib/receipt-pdf";

// ---------------------------------------------------------------------------
// receipt-pdf.test.ts — Session-29 (F-127): the hand-rolled PDF 1.4 renderer
// at the pure seam (the zero-dependency doctrine — no PDF library, the
// "zero chart dependencies" precedent extended). The input carries
// PRE-FORMATTED strings (formatting stays at the edge — the route layer
// formats via formatMoney/saleTimestamp; the seam is pure bytes).
//
// The unit contract (the plan's §2.2):
//   1. the %PDF-1.4 magic + %%EOF terminator
//   2. the xref contract — every xref offset points EXACTLY at its "N 0 obj"
//   3. the content stream carries the receipt family (latin-1: × as 0xD7)
//   4. PDF string escaping — parens/backslashes survive round-trip
//   5. the conditionals — cash row, fiscal line, footer
//   6. determinism — same input, identical bytes
// ---------------------------------------------------------------------------

const baseInput: ReceiptPdfInput = {
  storeName: "My Store",
  ticket: "T-000001",
  timestamp: "29/10/2026 22:15",
  lines: [
    { qty: 2, name: "Viewer Walk Coffee", amount: "$9.00" },
    { qty: 1, name: "Latte", amount: "$3.50" },
  ],
  subtotal: "$12.50",
  tax: "$0.00",
  total: "$12.50",
  method: "cash",
  cash: { paid: "$15.00", change: "$2.50" },
  fiscal: "123456789 · Servicios",
  footer: "Thank you for your purchase!",
};

const latin1 = (bytes: Uint8Array) => Buffer.from(bytes).toString("latin1");

function findContentStream(bytes: Uint8Array): string {
  const text = latin1(bytes);
  const m = text.match(/6 0 obj\s*<<\s*\/Length (\d+)\s*>>\s*stream\r?\n([\s\S]*?)endstream/);
  if (!m) throw new Error("content stream (obj 6) not found");
  return m[2];
}

describe("receipt-pdf (F-127)", () => {
  it("renders the PDF 1.4 magic and the %%EOF terminator", () => {
    const out = renderReceiptPdf(baseInput);
    expect(latin1(out)).toMatch(/^%PDF-1.4/);
    expect(latin1(out).endsWith("%%EOF\n")).toBe(true);
  });

  it("the xref table's offsets point EXACTLY at their objects (the byte-math contract)", () => {
    const out = renderReceiptPdf(baseInput);
    const text = latin1(out);
    const xrefIdx = text.indexOf("xref");
    expect(xrefIdx).toBeGreaterThan(0);
    const entries = text
      .slice(xrefIdx)
      .split("\n")
      .slice(2) // skip "xref" + "0 7"
      .slice(0, 7)
      .map((l) => l.trim().split(/\s+/))
      .filter((p) => p.length === 3);
    expect(entries.length).toBe(7);
    // obj 0 is the free entry; objects 1..6 must point at their "N 0 obj"
    for (let n = 1; n <= 6; n += 1) {
      const offset = Number(entries[n][0]);
      expect(Number.isFinite(offset)).toBe(true);
      expect(text.startsWith(`${n} 0 obj`, offset)).toBe(true);
    }
    // startxref must point at the xref keyword itself
    const startxref = Number(text.match(/startxref\s+(\d+)/)?.[1]);
    expect(text.slice(startxref, startxref + 4)).toBe("xref");
  });

  it("the content stream carries the receipt family (store, ticket·stamp, lines, money, method — × as latin-1 0xD7)", () => {
    const content = findContentStream(renderReceiptPdf(baseInput));
    expect(content).toContain("My Store");
    expect(content).toContain("T-000001");
    expect(content).toContain("29/10/2026 22:15");
    expect(content).toContain("2 \xd7 Viewer Walk Coffee");
    expect(content).toContain("$9.00");
    expect(content).toContain("1 \xd7 Latte");
    expect(content).toContain("$12.50");
    expect(content).toContain("Subtotal");
    expect(content).toContain("Tax");
    expect(content).toContain("Total");
    expect(content).toContain("cash");
    expect(content).toContain("$15.00 / $2.50");
    expect(content).toContain("123456789 \xb7 Servicios");
    expect(content).toContain("Thank you for your purchase!");
  });

  it("escapes PDF string literals — parens and backslashes survive round-trip", () => {
    const out = renderReceiptPdf({
      ...baseInput,
      lines: [{ qty: 1, name: `Weird (name) \\ "quoted"`, amount: "$1.00" }],
      storeName: `Shop (one) \\ two`,
    });
    const content = findContentStream(out);
    // The rendered text uses the escaped forms inside (…); the round-trip
    // un-escapes back to the originals.
    expect(content).toContain(`Shop \\(one\\) \\\\ two`);
    expect(content).toContain(`1 \xd7 Weird \\(name\\) \\\\ "quoted"`);
  });

  it("the conditionals: no cash row / no fiscal line / no footer when the input omits them", () => {
    const out = renderReceiptPdf({
      ...baseInput,
      cash: undefined,
      fiscal: undefined,
      footer: undefined,
    });
    const content = findContentStream(out);
    expect(content).not.toContain("Paid / Change");
    expect(content).not.toContain("$15.00 / $2.50");
    expect(content).not.toContain("123456789");
    expect(content).not.toContain("Thank you");
  });

  it("is deterministic — the same input renders identical bytes", () => {
    const a = renderReceiptPdf(baseInput);
    const b = renderReceiptPdf(baseInput);
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(true);
  });
});
