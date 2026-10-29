// ---------------------------------------------------------------------------
// GET /api/sales/[id]/receipt — the receipt PDF (Session-29, F-127).
//
// The server-side receipt artifact: ownership-scoped (the sale by
// `findFirst({ where: { id, userId } })` — the 404 wall rides NotFoundError),
// the settings row supplying the store name / fiscal block / footer, and the
// PRE-FORMATTED input composed at this edge (formatMoney + saleTimestamp —
// F-110's byte-stable stamp) before `renderReceiptPdf` renders the bytes.
// The response is `application/pdf` with a `Content-Disposition` attachment
// named `<ticket>.pdf` — the no-SMTP posture: the PDF endpoint IS the
// receipt's delivery (download, archive, attach); never stub a send.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { NotFoundError, withUserParams } from "@/lib/server/http";
import { formatMoney } from "@/lib/money";
import { saleTimestamp } from "@/lib/reports";
import { renderReceiptPdf, type ReceiptPdfLine } from "@/lib/receipt-pdf";
import type { CartLine } from "@/lib/cart";

export const GET = withUserParams(async (user, _request, id) => {
  const sale = await db.sale.findFirst({
    where: { id, userId: user.id },
    include: {
      cashier: { select: { fullName: true, email: true } },
      register: { select: { name: true } },
    },
  });
  if (!sale) throw new NotFoundError();

  const settings = await db.storeSettings.findUnique({ where: { userId: user.id } });
  const currency = settings?.currency ?? "USD";

  // The lines — the same JSON contract the on-screen receipts render.
  const raw = JSON.parse(sale.items) as CartLine[];
  const lines: ReceiptPdfLine[] = raw.map((l) => ({
    qty: l.qty,
    name: l.name,
    amount: formatMoney(l.price * l.qty, currency),
  }));

  // The fiscal block — the terminal receipt's exact conditional + template
  // (`{ruc|taxId}{biz ? ` · ${biz}` : ""}`; hidden when the flag is on).
  const fiscalVisible =
    !settings?.hideFiscalOnReceipt && Boolean(settings?.fiscalRuc || settings?.taxId);
  const fiscal = fiscalVisible
    ? `${settings?.fiscalRuc || settings?.taxId}${
        settings?.fiscalBusinessType ? ` · ${settings.fiscalBusinessType}` : ""
      }`
    : undefined;

  const pdf = renderReceiptPdf({
    storeName: settings?.storeName ?? "My Store",
    ticket: sale.ticket,
    timestamp: saleTimestamp(sale.createdAt),
    lines,
    subtotal: formatMoney(sale.subtotal, currency),
    tax: formatMoney(sale.taxTotal, currency),
    total: formatMoney(sale.total, currency),
    method: sale.paymentMethod.replace(/^./, (c) => c.toUpperCase()),
    cash:
      sale.paymentMethod === "cash" && sale.changeDue != null
        ? {
            paid: formatMoney(sale.amountPaid ?? 0, currency),
            change: formatMoney(sale.changeDue, currency),
          }
        : undefined,
    fiscal,
    footer: settings?.receiptFooter || undefined,
  });

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${sale.ticket}.pdf"`,
    },
  });
});
