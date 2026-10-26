"use client";

// ---------------------------------------------------------------------------
// The Terminal (the reference's landing view, plan F16): the left stage is
// the product grid (or the "No active shift" gate), the right rail is the
// CART (header, empty state, CHARGE button — the emerald gradient). The
// checkout dialog captures method/customer/cash and lands the receipt.
//
// Supersets over the reference: the flow WORKS end-to-end (the reference's
// own write flows never complete — plan F10), the barcode field accepts
// scanner input (Enter submits), and the receipt is printable.
// ---------------------------------------------------------------------------

import * as React from "react";
import {
  Banknote,
  CreditCard,
  Landmark,
  Minus,
  Plus,
  Printer,
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
  Monitor,
  CircleAlert,
} from "lucide-react";

import {
  EmptyState,
  GhostButton,
  PrimaryButton,
} from "@/components/pos/shared";
import { useToast } from "@/components/ui/toast";
import {
  addToCart,
  buildCartTotals,
  buildReceipt,
  changeDue,
  clearCart,
  parseBarcodeInput,
  removeLine,
  setQty,
  suggestCashTender,
  PAYMENT_METHODS,
  type CartLine,
  type PaymentMethod,
} from "@/lib/cart";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { formatMoney } from "@/lib/money";

type Product = {
  id: string;
  name: string;
  barcode: string;
  priceCents: number;
  stock: number;
  taxRate: number;
  categoryId: string | null;
  imageUrl: string;
  active: boolean;
};

type OpenShift = {
  id: string;
  registerId: string;
  status: string;
  openedAt: string;
  register: { id: string; name: string; location: string };
};

type CreatedSale = {
  id: string;
  ticketNo: string;
  method: string;
  totalCents: number;
  subtotalCents: number;
  taxCents: number;
  discountCents: number;
  paidCents: number;
  changeCents: number;
  customerName: string;
  createdAt: string;
  register: { name: string };
  items: Array<{ name: string; qty: number; priceCents: number; lineTotalCents: number }>;
};

const METHOD_ICON: Record<PaymentMethod, typeof Banknote> = {
  cash: Banknote,
  card: CreditCard,
  transfer: Landmark,
  other: Receipt,
};

export function TerminalView() {
  const { toast } = useToast();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [openShift, setOpenShift] = React.useState<OpenShift | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [barcode, setBarcode] = React.useState("");
  const [lines, setLines] = React.useState<CartLine[]>([]);
  const [discount, setDiscount] = React.useState("");
  const [addedPulse, setAddedPulse] = React.useState(false);
  // checkout dialog state
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [method, setMethod] = React.useState<PaymentMethod>("cash");
  const [customerName, setCustomerName] = React.useState("");
  const [paidInput, setPaidInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [receipt, setReceipt] = React.useState<CreatedSale | null>(null);

  const reload = React.useCallback(async () => {
    const [productRows, shifts] = await Promise.all([
      apiGet<Product[]>("/api/products"),
      apiGet<OpenShift[]>("/api/shifts"),
    ]);
    return { productRows, shifts };
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { productRows, shifts } = await reload();
        if (cancelled) return;
        setProducts(productRows.filter((p) => p.active));
        const open = shifts.find((s) => s.status === "open") ?? null;
        setOpenShift(open);
        // Every open shift drives the same Terminal (single-register stores
        // are the default; multi-register stores pick the first open shift).
      } catch (err: unknown) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          window.location.replace("/login");
          return;
        }
        toast.error(err instanceof Error ? err.message : "The catalog failed to load.");
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload, toast]);

  const totals = buildCartTotals(lines, 0);
  const discountCents = Math.max(
    0,
    Math.min(totals.subtotal + totals.tax, Math.round((Number.parseFloat(discount) || 0) * 100)),
  );
  const grandTotal = Math.max(0, totals.subtotal + totals.tax - discountCents);

  const pulse = () => {
    setAddedPulse(true);
    window.setTimeout(() => setAddedPulse(false), 1400);
  };

  const addProduct = (product: Product, qty = 1) => {
    if (!openShift) return;
    if (product.stock <= 0) {
      toast.error(`"${product.name}" is out of stock.`);
      return;
    }
    const inCart = lines.find((l) => l.productId === product.id)?.qty ?? 0;
    if (inCart + qty > product.stock) {
      toast.error(`Only ${product.stock} × "${product.name}" in stock.`);
      return;
    }
    setLines((prev) =>
      addToCart(prev, {
        productId: product.id,
        name: product.name,
        priceCents: product.priceCents,
        taxRate: product.taxRate,
      }, qty),
    );
    pulse();
  };

  const onBarcodeSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = parseBarcodeInput(barcode);
    if (!value) {
      toast.error("That does not look like a product code.");
      return;
    }
    const product = products.find(
      (p) => p.barcode === value || p.barcode.toLowerCase() === value.toLowerCase(),
    );
    if (!product) {
      toast.error(`No product matches code ${value}.`);
      return;
    }
    addProduct(product);
    setBarcode("");
  };

  const submitCheckout = async () => {
    if (!openShift) return;
    setBusy(true);
    try {
      const sale = await apiPost<CreatedSale>("/api/sales", {
        registerId: openShift.registerId,
        method,
        customerName,
        discount: discountCents / 100,
        paid: method === "cash" ? (Number.parseFloat(paidInput) || 0) : grandTotal / 100,
        items: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
      });
      setReceipt(sale);
      setCheckoutOpen(false);
      setLines(clearCart());
      setDiscount("");
      setPaidInput("");
      setCustomerName("");
      toast.success(`Sale ${sale.ticketNo} completed.`);
      void (async () => {
        try {
          const { productRows, shifts } = await reload();
          setProducts(productRows.filter((p) => p.active));
          setOpenShift(shifts.find((s) => s.status === "open") ?? null);
        } catch {
          // the checkout already succeeded; the refresh is best-effort
        }
      })();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "The checkout failed.");
    } finally {
      setBusy(false);
    }
  };

  const filtered = products.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q);
  });

  if (!loaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">Loading the terminal…</p>
      </div>
    );
  }

  // ---- the no-shift gate (the reference's measured empty state) ----
  if (!openShift) {
    return (
      <div className="flex min-h-[calc(100dvh-9rem)] items-center justify-center gap-6 lg:h-dvh">
        <EmptyState
          icon={Monitor}
          title="No active shift"
          text={
            <>
              Go to <strong className="font-semibold text-slate-200">Registers</strong> to open a
              shift before making sales.
            </>
          }
          testId="terminal-no-shift"
        />
        <aside className="hidden w-96 shrink-0 flex-col justify-between border-l border-vx-border xl:flex" />
      </div>
    );
  }

  const MethodIcon = METHOD_ICON[method];
  const paidCents = Math.round((Number.parseFloat(paidInput) || 0) * 100);

  return (
    <div className="flex flex-col gap-6 xl:h-dvh xl:flex-row">
      {/* ---- left stage: search + product grid ---- */}
      <section className="flex min-w-0 flex-1 flex-col gap-4" aria-label="Products">
        <div className="flex flex-col gap-2 sm:flex-row">
          <form onSubmit={onBarcodeSubmit} className="flex flex-1 gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Scan or type a barcode</span>
              <Search
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              />
              <input
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Scan barcode or type a code…"
                className="vx-input pl-9"
                data-testid="terminal-barcode"
              />
            </label>
            <GhostButton type="submit">Add</GhostButton>
          </form>
        </div>
        <label className="relative">
          <span className="sr-only">Search products</span>
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="vx-input pl-9"
            data-testid="terminal-search"
          />
        </label>

        {filtered.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            text={
              products.length === 0
                ? "No products yet — add your catalog in Inventory."
                : "No products match that search."
            }
          />
        ) : (
          <ul
            className="vx-scroll grid flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto pb-2 sm:grid-cols-3 2xl:grid-cols-4"
            data-testid="terminal-product-grid"
          >
            {filtered.map((product) => {
              const out = product.stock <= 0;
              return (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => addProduct(product)}
                    disabled={out}
                    className="vx-focusable flex h-full w-full flex-col gap-1 rounded-xl border border-vx-border bg-vx-card p-3 text-left outline-none transition-colors hover:border-violet-600/50 disabled:opacity-50"
                    data-testid={`terminal-product-${product.id}`}
                  >
                    <span className="line-clamp-2 text-sm font-medium text-slate-100">
                      {product.name}
                    </span>
                    <span className="text-xs text-slate-500">{product.barcode}</span>
                    <span className="mt-auto flex items-center justify-between pt-1">
                      <span className="text-sm font-bold text-violet-300">
                        {formatMoney(product.priceCents)}
                      </span>
                      <span className={`text-xs ${out ? "text-red-400" : "text-slate-500"}`}>
                        {product.stock} in stock
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ---- right rail: the CART ---- */}
      <aside
        aria-label="Cart"
        data-testid="terminal-cart"
        className="flex w-full shrink-0 flex-col border-t border-vx-border xl:h-dvh xl:w-96 xl:border-l xl:border-t-0"
      >
        <div className="border-b border-vx-border px-5 py-4">
          {addedPulse && (
            <p className="vx-label mb-1 text-emerald-400" role="status" data-testid="terminal-added">
              ADDED
            </p>
          )}
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">CART</h2>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingCart aria-hidden className="h-14 w-14 text-slate-600" strokeWidth={1.5} />
            <p className="text-sm text-slate-500">Scan or select products</p>
          </div>
        ) : (
          <ul className="vx-scroll flex-1 divide-y divide-white/5 overflow-y-auto px-2">
            {lines.map((line) => (
              <li key={line.productId} className="flex items-center gap-2 px-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-100">{line.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatMoney(line.priceCents)} · {line.taxRate}% tax
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Decrease ${line.name}`}
                    onClick={() => setLines((prev) => setQty(prev, line.productId, line.qty - 1))}
                    className="vx-focusable flex h-7 w-7 items-center justify-center rounded-md border border-vx-border text-slate-300 outline-none hover:bg-white/5"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-slate-100">
                    {line.qty}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase ${line.name}`}
                    onClick={() => {
                      const product = products.find((p) => p.id === line.productId);
                      if (product && line.qty + 1 > product.stock) {
                        toast.error(`Only ${product.stock} × "${line.name}" in stock.`);
                        return;
                      }
                      setLines((prev) => setQty(prev, line.productId, line.qty + 1));
                    }}
                    className="vx-focusable flex h-7 w-7 items-center justify-center rounded-md border border-vx-border text-slate-300 outline-none hover:bg-white/5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="w-20 text-right text-sm font-semibold text-slate-100">
                  {formatMoney(line.priceCents * line.qty)}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${line.name}`}
                  onClick={() => setLines((prev) => removeLine(prev, line.productId))}
                  className="vx-focusable flex h-7 w-7 items-center justify-center rounded-md text-slate-500 outline-none hover:bg-white/5 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-2 border-t border-vx-border px-5 py-4 text-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span>Subtotal</span>
            <span data-testid="cart-subtotal">{formatMoney(totals.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Tax</span>
            <span data-testid="cart-tax">{formatMoney(totals.tax)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Discount</span>
            <span data-testid="cart-discount">−{formatMoney(discountCents)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-vx-border pt-2 text-base font-bold text-white">
            <span>Total</span>
            <span data-testid="cart-total">{formatMoney(grandTotal)}</span>
          </div>
          <label className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span className="w-16 shrink-0">Discount $</span>
            <input
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              className="vx-input h-8 py-1 text-xs"
              aria-label="Discount in dollars"
            />
          </label>
          <button
            type="button"
            disabled={lines.length === 0}
            onClick={() => {
              setMethod("cash");
              setPaidInput(lines.length > 0 ? (suggestCashTender(grandTotal) / 100).toFixed(2) : "");
              setCheckoutOpen(true);
            }}
            className="vx-charge-gradient vx-focusable mt-2 flex h-[70px] w-full items-center justify-center gap-3 rounded-2xl text-xl font-black tracking-wide text-white outline-none transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="terminal-charge"
          >
            <Receipt aria-hidden className="h-6 w-6" strokeWidth={2.2} />
            CHARGE {formatMoney(grandTotal)}
          </button>
        </div>
      </aside>

      {/* ---- checkout dialog ---- */}
      {checkoutOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Charge the cart"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          data-testid="checkout-dialog"
        >
          <button
            type="button"
            aria-label="Close checkout"
            onClick={() => setCheckoutOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="vx-card relative z-10 w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-white">Charge {formatMoney(grandTotal)}</h2>
            <p className="mt-1 text-sm text-slate-400">
              {openShift.register.name} · {totals.itemCount} item{totals.itemCount === 1 ? "" : "s"}
            </p>

            <fieldset className="mt-4">
              <legend className="vx-label mb-2">Payment method</legend>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((m) => {
                  const Icon = METHOD_ICON[m];
                  const selected = method === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      aria-pressed={selected}
                      className={`vx-focusable flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-medium capitalize outline-none transition-colors ${
                        selected
                          ? "border-violet-600 bg-violet-600/20 text-violet-200"
                          : "border-vx-border bg-vx-elevated text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {m}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <label className="mt-4 flex flex-col gap-1.5 text-sm text-slate-300">
              Customer (optional)
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="vx-input"
                placeholder="Walk-in"
              />
            </label>

            {method === "cash" && (
              <>
                <label className="mt-3 flex flex-col gap-1.5 text-sm text-slate-300">
                  Cash received
                  <input
                    value={paidInput}
                    onChange={(e) => setPaidInput(e.target.value)}
                    inputMode="decimal"
                    className="vx-input"
                    data-testid="checkout-cash"
                  />
                </label>
                <p className="mt-1 text-xs text-slate-500" data-testid="checkout-change">
                  Change due: <span className="font-semibold text-slate-300">
                    {formatMoney(changeDue(grandTotal, paidCents))}
                  </span>
                </p>
                {paidCents > 0 && paidCents < grandTotal && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-amber-400" role="alert">
                    <CircleAlert className="h-3.5 w-3.5" /> The cash tendered is less than the total.
                  </p>
                )}
              </>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <GhostButton onClick={() => setCheckoutOpen(false)}>Cancel</GhostButton>
              <PrimaryButton
                onClick={() => void submitCheckout()}
                disabled={busy || (method === "cash" && paidCents < grandTotal)}
                data-testid="checkout-confirm"
              >
                <MethodIcon className="h-4 w-4" />
                {busy ? "Charging…" : `Charge ${formatMoney(grandTotal)}`}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* ---- receipt dialog ---- */}
      {receipt && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Receipt ${receipt.ticketNo}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          data-testid="receipt-dialog"
        >
          <button
            type="button"
            aria-label="Close receipt"
            onClick={() => setReceipt(null)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="vx-card relative z-10 w-full max-w-sm p-6">
            <div id="vx-receipt" className="flex flex-col gap-3 text-sm text-slate-200">
              <div className="text-center">
                <p className="text-base font-bold text-white">VeloxPOS</p>
                <p className="text-xs text-slate-400">
                  {new Date(receipt.createdAt).toLocaleString()} · {receipt.register.name}
                </p>
                <p className="text-sm font-semibold text-violet-300">{receipt.ticketNo}</p>
              </div>
              <ul className="divide-y divide-white/5">
                {receipt.items.map((item, i) => (
                  <li key={i} className="flex items-center justify-between py-1.5">
                    <span className="min-w-0 truncate">
                      {item.qty} × {item.name}
                    </span>
                    <span className="ml-2 shrink-0">{formatMoney(item.lineTotalCents)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-1 border-t border-vx-border pt-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatMoney(receipt.subtotalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatMoney(receipt.taxCents)}</span>
                </div>
                {receipt.discountCents > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>−{formatMoney(receipt.discountCents)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white">
                  <span>TOTAL</span>
                  <span>{formatMoney(receipt.totalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="capitalize">{receipt.method}</span>
                  <span>{formatMoney(receipt.paidCents)}</span>
                </div>
                {receipt.method === "cash" && (
                  <div className="flex justify-between">
                    <span>Change</span>
                    <span>{formatMoney(receipt.changeCents)}</span>
                  </div>
                )}
              </div>
              <p className="text-center text-xs text-slate-500">Thank you for your purchase!</p>
            </div>
            <div className="vx-no-print mt-6 flex justify-end gap-2">
              <GhostButton onClick={() => setReceipt(null)}>Close</GhostButton>
              <PrimaryButton onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                Print
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

