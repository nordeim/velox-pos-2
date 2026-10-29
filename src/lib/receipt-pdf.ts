// ---------------------------------------------------------------------------
// receipt-pdf.ts — the hand-rolled PDF 1.4 receipt renderer (Session-29,
// F-127). ZERO dependencies (the "zero chart dependencies" doctrine extended
// to PDF: no pdfkit, no jspdf — the charts' hand-rolled-SVG precedent).
//
// The input carries PRE-FORMATTED strings: money and timestamp formatting
// stays at the EDGE (the route layer formats via formatMoney/saleTimestamp —
// src/lib/money.ts, src/lib/reports.ts); this seam is pure bytes.
//
// Structure (the unit-pinned contract, tests/unit/receipt-pdf.test.ts):
//   %PDF-1.4 header · obj 1 catalog · obj 2 pages · obj 3 page (A4 595x842,
//   references 4=font 6=contents) · obj 4 font (Courier, WinAnsiEncoding) ·
//   obj 5 info (fixed Producer only — no CreationDate: DETERMINISM is law,
//   same input => identical bytes) · obj 6 the content stream · xref with
//   EXACT byte offsets · trailer · startxref · %%EOF.
//
// Text is encoded latin-1 (WinAnsi): the receipt family's × (0xD7), · (0xB7),
// and the Spanish diacritics are single-byte WinAnsi. Characters outside
// latin-1 (a CJK product name, say) are a DOCUMENTED limitation of the
// no-dependency renderer — the es/en receipt domain the reference itself
// ships; mangled outside-WinAnsi bytes are replaced, never crash.
// ---------------------------------------------------------------------------

export type ReceiptPdfLine = { qty: number; name: string; amount: string };

export type ReceiptPdfInput = {
  storeName: string;
  ticket: string;
  /** Preformatted DD/MM/YYYY HH:MM (F-110's byte-stable form). */
  timestamp: string;
  lines: ReceiptPdfLine[];
  subtotal: string;
  tax: string;
  total: string;
  method: string;
  /** Cash sales only — the Paid / Change row. */
  cash?: { paid: string; change: string };
  /** The preformatted "RUC · business type" line; undefined = the fiscal block hidden. */
  fiscal?: string;
  footer?: string;
};

// ---- PDF primitives ---------------------------------------------------------

/** PDF string-literal escaping: backslash, parens. */
function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/** latin-1 bytes (WinAnsi). Un-encodable code points become '?'. */
function latin1Bytes(s: string): Uint8Array {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i += 1) {
    const c = s.charCodeAt(i);
    out[i] = c >= 256 || (c >= 128 && c <= 159) ? 63 : c; // '?'
  }
  return out;
}

const concat = (chunks: Uint8Array[]): Uint8Array => {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.length;
  }
  return out;
};

const PAGE_W = 595;
const PAGE_H = 842;
const FONT_SIZE_TITLE = 14;
const FONT_SIZE = 10;
// Courier advance = 0.6em per glyph.
const charW = (size: number) => size * 0.6;

/** Centered x for a rendered string (width from the UNESCAPED text). */
const centeredX = (s: string, size: number) =>
  Math.max(0, (PAGE_W - s.length * charW(size)) / 2);

// ---- the content stream -----------------------------------------------------

function contentStream(input: ReceiptPdfInput): string {
  const ops: string[] = [];
  // Text rows from the top of the page, stepping down 14pt.
  let y = PAGE_H - 52;
  const row = (text: string, x: number, size = FONT_SIZE) => {
    ops.push(`1 0 0 1 ${x.toFixed(2)} ${y} Tm (${esc(text)}) Tj`);
    if (size === FONT_SIZE) y -= 14;
  };
  const centered = (text: string, size = FONT_SIZE) => row(text, centeredX(text, size), size);
  const twoCol = (left: string, right: string) => {
    const rx = PAGE_W - 57 - right.length * charW(FONT_SIZE);
    ops.push(`1 0 0 1 57 ${y} Tm (${esc(left)}) Tj`);
    ops.push(`1 0 0 1 ${rx.toFixed(2)} ${y} Tm (${esc(right)}) Tj`);
    y -= 14;
  };

  ops.push("BT");
  // The store name — the title, 14pt centered.
  ops.push(`/F1 ${FONT_SIZE_TITLE} Tf`);
  centered(input.storeName, FONT_SIZE_TITLE);
  y -= 14;
  ops.push(`/F1 ${FONT_SIZE} Tf`);
  centered(`${input.ticket} · ${input.timestamp}`);
  y -= 6;
  const rule = "-".repeat(40);
  centered(rule);
  y -= 4;
  for (const l of input.lines) {
    twoCol(`${l.qty} × ${l.name}`, l.amount);
  }
  y -= 6;
  centered(rule);
  y -= 4;
  twoCol("Subtotal", input.subtotal);
  twoCol("Tax", input.tax);
  twoCol("Total", input.total);
  if (input.cash) {
    twoCol("Cash / Change", `${input.cash.paid} / ${input.cash.change}`);
  }
  twoCol("Method", input.method);
  if (input.fiscal) {
    y -= 8;
    centered(input.fiscal);
  }
  if (input.footer) {
    y -= 8;
    centered(input.footer);
  }
  ops.push("ET");
  return ops.join("\n");
}

// ---- the file assembly ------------------------------------------------------

export function renderReceiptPdf(input: ReceiptPdfInput): Uint8Array {
  const content = contentStream(input);
  const contentBytes = latin1Bytes(content);

  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] " +
      "/Resources << /Font << /F1 4 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>",
    "<< /Producer (VeloxPOS) >>",
    `<< /Length ${contentBytes.length} >>\nstream\n${content}\nendstream`,
  ];

  // header + objects, tracking each object's byte offset for the xref.
  const chunks: Uint8Array[] = [latin1Bytes("%PDF-1.4\n")];
  const offsets: number[] = [0]; // obj 0 — the free entry
  let cursor = chunks[0].length;
  objects.forEach((body, i) => {
    const n = i + 1;
    offsets[n] = cursor;
    const objBytes = latin1Bytes(`${n} 0 obj\n${body}\nendobj\n`);
    chunks.push(objBytes);
    cursor += objBytes.length;
  });

  const xrefAt = cursor;
  const xrefLines = ["xref", "0 7", "0000000000 65535 f "];
  for (let n = 1; n <= 6; n += 1) {
    xrefLines.push(`${String(offsets[n]).padStart(10, "0")} 00000 n `);
  }
  const xrefBytes = latin1Bytes(xrefLines.join("\n") + "\n");
  chunks.push(xrefBytes);

  const trailer = latin1Bytes(
    "trailer\n<< /Size 7 /Root 1 0 R /Info 5 0 R >>\n" +
      `startxref\n${xrefAt}\n%%EOF\n`,
  );
  chunks.push(trailer);

  return concat(chunks);
}
