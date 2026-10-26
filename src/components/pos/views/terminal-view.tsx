"use client";

// ---------------------------------------------------------------------------
// The Terminal view: the shift gate (reference copy — "No active shift / Go
// to Registers to open a shift before making sales.") and, with a shift open,
// the catalog + cart + checkout workflow (the superset the reference's demo
// account cannot exercise: server-authoritative totals, cash change, receipt).
// ---------------------------------------------------------------------------

import * as React from "react";
import { CircleCheck, Minus, Monitor, Plus, ScanLine, ShoppingCart, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { apiGet, apiSend, usePosStore, type Product, type Sale } from "@/lib/store";
import { changeDue, cartTotals, type CartLine } from "@/lib/cart";
import { formatMoney, round2 } from "@/lib/money";
import { stockStatus } from "@/lib/inventory-status";

// ---- the shift gate (the measured empty state) --------------------------------

export function ShiftGate() {
  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center p-6">
      <div className="glass-card w-full max-w-md rounded-2xl p-10 text-center">
        <Monitor className="mx-auto h-16 w-16 text-violet-400/70" strokeWidth={1.5} aria-hidden="true" />
        <h2 className="mt-5 text-xl font-bold text-white/70">No active shift</h2>
        <p className="mt-2 text-sm text-white/50">
          Go to{" "}
          <a
            href="/Registers"
            className="vpx-focus font-bold text-white/90 underline decoration-white/30 underline-offset-2 hover:decoration-white/70"
          >
            Registers
          </a>{" "}
          to open a shift before making sales.
        </p>
      </div>
    </div>
  );
}

// ---- the charge dialog ---------------------------------------------------------

type ChargeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  currency: string;
  onComplete: (sale: Sale) => void;
};

function ChargeDialog({ open, onOpenChange, total, currency, onComplete }: ChargeDialogProps) {
  const [method, setMethod] = React.useState<"cash" | "card">("cash");
  const [amountPaid, setAmountPaid] = React.useState("");
  const [customer, setCustomer] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const { toast: toastApi } = useToast();
  const resetCart = usePosStore((s) => s.resetCart);
  const activeShift = usePosStore((s) => s.shifts.find((sh) => sh.status === "active"));

  const paid = method === "cash" ? Number(amountPaid || 0) : total;
  const change = changeDue(total, paid);
  const valid = method === "card" || (amountPaid !== "" && round2(paid) >= total);

  const submit = async (): Promise<void> => {
    if (!activeShift || !valid) return;
    setBusy(true);
    try {
      const cart = usePosStore.getState().cart;
      const sale = await apiSend<Sale>(
        "POST",
        "/api/sales", {
        items: cart.map((l) => ({
          productId: l.productId,
          name: l.name,
          price: l.price,
          qty: l.qty,
          taxRate: l.taxRate,
        })),
        paymentMethod: method,
        amountPaid: method === "cash" ? round2(paid) : null,
        customer,
      });
      usePosStore.getState().addSale(sale);
      // Stock was decremented server-side — refresh the catalog's numbers.
      const products = await apiGet<Product[]>("/api/products");
      usePosStore.setState({ products });
      resetCart();
      onOpenChange(false);
      onComplete(sale);
    } catch (err) {
      toastApi.error(`Checkout failed: ${err instanceof Error ? err.message : "Please try again."}`)
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-dark border-edge sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Charge {formatMoney(total, currency)}</DialogTitle>
          <DialogDescription className="text-white/50">
            Choose the payment method and complete the sale.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMethod("cash")}
            aria-pressed={method === "cash"}
            className={`vpx-focus rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
              method === "cash"
                ? "border-violet-500/50 bg-violet-600/20 text-violet-200"
                : "border-edge bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            Cash
          </button>
          <button
            type="button"
            onClick={() => setMethod("card")}
            aria-pressed={method === "card"}
            className={`vpx-focus rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
              method === "card"
                ? "border-violet-500/50 bg-violet-600/20 text-violet-200"
                : "border-edge bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            Card
          </button>
        </div>
        {method === "cash" && (
          <div className="grid gap-2">
            <Label htmlFor="charge-amount" className="text-white/70">
              Amount received
            </Label>
            <Input
              id="charge-amount"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder={total.toFixed(2)}
              className="border-edge bg-white/5 text-white"
            />
            {amountPaid !== "" && (
              <p className={`text-sm ${change > 0 ? "text-emerald-400" : "text-white/50"}`} data-testid="change-due">
                Change: {formatMoney(change, currency)}
              </p>
            )}
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="charge-customer" className="text-white/70">
            Customer (optional)
          </Label>
          <Input
            id="charge-customer"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="Walk-in customer"
            className="border-edge bg-white/5 text-white"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white/70">
            Cancel
          </Button>
          <Button
            onClick={() => void submit()}
            disabled={busy || !valid}
            className="glass-button-success rounded-2xl border-0 px-6 font-bold"
          >
            {busy ? "Processing…" : `Complete ${method === "cash" ? "cash" : "card"} sale`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- the receipt dialog --------------------------------------------------------

function ReceiptDialog({ sale, onClose }: { sale: Sale | null; onClose: () => void }) {
  const settings = usePosStore((s) => s.settings);
  if (!sale) return null;
  const lines = JSON.parse(sale.items) as CartLine[];
  const currency = settings?.currency ?? "USD";
  return (
    <Dialog open={!!sale} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-dark border-edge sm:max-w-sm">
        <div className="receipt-print">
          <DialogHeader>
            <DialogTitle className="text-white">{settings?.storeName ?? "My Store"}</DialogTitle>
            <DialogDescription className="font-mono text-white/60">
              {sale.ticket} · {new Date(sale.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="my-3 space-y-1.5 border-y border-dashed border-edge py-3 font-mono text-sm">
            {lines.map((l) => (
              <div key={l.productId} className="flex justify-between gap-2 text-white/80">
                <span className="truncate">
                  {l.qty} × {l.name}
                </span>
                <span>{formatMoney(l.price * l.qty, currency)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1 font-mono text-sm">
            <div className="flex justify-between text-white/60">
              <span>Subtotal</span>
              <span>{formatMoney(sale.subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Tax</span>
              <span>{formatMoney(sale.taxTotal, currency)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white">
              <span>Total</span>
              <span>{formatMoney(sale.total, currency)}</span>
            </div>
            {sale.paymentMethod === "cash" && sale.changeDue != null && (
              <div className="flex justify-between text-white/60">
                <span>Cash / Change</span>
                <span>
                  {formatMoney(sale.amountPaid ?? 0, currency)} / {formatMoney(sale.changeDue, currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-white/60">
              <span>Method</span>
              <span className="capitalize">{sale.paymentMethod}</span>
            </div>
          </div>
          {!settings?.hideFiscalOnReceipt && (settings?.fiscalRuc || settings?.taxId) && (
            <p className="mt-3 border-t border-dashed border-edge pt-2 text-center text-xs text-white/40">
              {settings?.fiscalRuc || settings?.taxId}
              {settings?.fiscalBusinessType ? ` · ${settings.fiscalBusinessType}` : ""}
            </p>
          )}
          <p className="mt-3 text-center text-sm text-white/60">{settings?.receiptFooter}</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-white/70">
            Close
          </Button>
          <Button onClick={() => window.print()} className="glass-button-primary rounded-2xl border-0">
            Print receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- the view --------------------------------------------------------------------

export function TerminalView() {
  const products = usePosStore((s) => s.products);
  const categories = usePosStore((s) => s.categories);
  const cart = usePosStore((s) => s.cart);
  const shifts = usePosStore((s) => s.shifts);
  const settings = usePosStore((s) => s.settings);
  const addProduct = usePosStore((s) => s.addProduct);
  const changeQty = usePosStore((s) => s.changeQty);
  const removeLine = usePosStore((s) => s.removeLine);

  const [search, setSearch] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<string>("all");
  const [chargeOpen, setChargeOpen] = React.useState(false);
  const [receipt, setReceipt] = React.useState<Sale | null>(null);

  // The cart's "Added" banner (the reference's cart DOM): expands with the
  // last-added product's name, auto-collapses after a short hold. Timer
  // state lives in the handler (React 19: no setState-in-effect), the ref
  // only needs unmount cleanup.
  const [addedName, setAddedName] = React.useState("");
  const addedTimer = React.useRef<number | null>(null);
  React.useEffect(() => {
    return () => {
      if (addedTimer.current !== null) window.clearTimeout(addedTimer.current);
    };
  }, []);

  const activeShift = shifts.find((sh) => sh.status === "active");
  const currency = settings?.currency ?? "USD";
  const totals = cartTotals(cart, currency);

  const visible = products.filter((p) => {
    if (!p.active) return false;
    if (categoryId !== "all" && p.categoryId !== categoryId) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q);
  });

  const addLine = (p: Product): void => {
    if (p.stock <= 0) return;
    addProduct({
      productId: p.id,
      name: p.name,
      price: p.price,
      qty: 1,
      taxRate: p.taxRate,
      unit: p.unit,
      image: p.image,
    });
    setAddedName(p.name);
    if (addedTimer.current !== null) window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAddedName(""), 2500);
  };

  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      {/* Catalog column — the shift gate renders here when closed. */}
      {!activeShift ? (
        <ShiftGate />
      ) : (
        <>
      <div className="vpx-scroll min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
        <div className="relative mb-4">
          <ScanLine
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Scan barcode or search products…"
            aria-label="Scan barcode or search products"
            className="border-edge bg-panel pl-9 text-white placeholder:text-white/30"
          />
        </div>
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Category filter">
          <button
            type="button"
            onClick={() => setCategoryId("all")}
            aria-pressed={categoryId === "all"}
            className={`vpx-focus rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              categoryId === "all"
                ? "bg-violet-600 text-white"
                : "bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryId(c.id)}
              aria-pressed={categoryId === c.id}
              className={`vpx-focus rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                categoryId === c.id
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
        {visible.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center text-sm text-white/50">
            {products.length === 0
              ? "No products yet. Add them in Inventory."
              : "No products match your filters."}
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {visible.map((p) => {
              const status = stockStatus(p.stock, p.minStock);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => addLine(p)}
                    disabled={p.stock <= 0}
                    aria-label={`Add ${p.name} to cart`}
                    className="glass-card vpx-focus flex h-full w-full flex-col rounded-2xl p-3 text-left transition-transform hover:-translate-y-0.5 disabled:opacity-40"
                  >
                    <div className="mb-2 flex h-16 items-center justify-center rounded-xl bg-white/5 text-white/30">
                      {p.image ? (
                        <img src={p.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                      ) : (
                        <ShoppingCart className="h-7 w-7" aria-hidden="true" />
                      )}
                    </div>
                    <p className="line-clamp-2 flex-1 text-sm font-semibold text-white/90">{p.name}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-base font-bold text-violet-300">
                        {formatMoney(p.price, currency)}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          status === "out"
                            ? "text-red-400"
                            : status === "low"
                              ? "text-orange-400"
                              : "text-white/40"
                        }`}
                      >
                        {p.stock <= 0 ? "Out" : `${Math.trunc(p.stock)} left`}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

        </>
      )}

      {/* Cart panel — the measured w-full md:w-[380px] rail (Session-3 F-5:
          the reference activates the side panel at md, not lg); the reference
          keeps it visible even with no active shift. */}
      <aside
        data-testid="cart-panel"
        className="flex w-full shrink-0 flex-col border-t border-edge bg-panel p-4 min-h-0 md:w-[380px] md:border-l md:border-t-0"
      >
        {/* The Added banner (the reference's cart DOM verbatim): a collapsed
            max-h-0/opacity-0 strip that expands on add — emerald gradient chip,
            circle-check, "ADDED" + the product name — then auto-collapses. */}
        <div
          data-testid="added-banner"
          aria-hidden={!addedName}
          className={`transition-all duration-300 overflow-hidden ${
            addedName ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-600/80 to-teal-600/70 px-4 py-3">
            <CircleCheck className="h-6 w-6 shrink-0 text-emerald-300" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300/70">
                Added
              </p>
              <p className="truncate text-lg font-black leading-tight text-white">{addedName}</p>
            </div>
          </div>
        </div>
        <h2 className="text-xs font-bold uppercase tracking-wide text-white/80">Cart</h2>
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
            <ShoppingCart className="h-16 w-16 text-white/15" strokeWidth={1.5} aria-hidden="true" />
            <p className="text-sm text-white/40">Scan or select products</p>
          </div>
        ) : (
          <ul className="vpx-scroll mt-3 flex-1 space-y-2 overflow-y-auto" aria-label="Cart items">
            {cart.map((l) => (
              <li key={l.productId} className="rounded-xl border border-edge bg-white/[0.03] p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-white/90">{l.name}</p>
                  <button
                    type="button"
                    onClick={() => removeLine(l.productId)}
                    aria-label={`Remove ${l.name} from cart`}
                    className="vpx-focus rounded p-1 text-white/40 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => changeQty(l.productId, l.qty - 1)}
                      aria-label={`Decrease ${l.name} quantity`}
                      className="vpx-focus rounded-lg border border-edge p-1.5 text-white/70 hover:text-white"
                    >
                      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <span
                      className="w-8 text-center text-sm font-bold text-white"
                      data-testid={`qty-${l.productId}`}
                      aria-live="polite"
                    >
                      {l.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeQty(l.productId, l.qty + 1)}
                      aria-label={`Increase ${l.name} quantity`}
                      className="vpx-focus rounded-lg border border-edge p-1.5 text-white/70 hover:text-white"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-white/90">
                    {formatMoney(l.price * l.qty, currency)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        {cart.length > 0 && (
          <div className="mt-3 space-y-1 border-t border-edge pt-3 text-sm">
            <div className="flex justify-between text-white/60">
              <span>Subtotal</span>
              <span>{formatMoney(totals.subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Tax</span>
              <span>{formatMoney(totals.taxTotal, currency)}</span>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setChargeOpen(true)}
          disabled={!totals.itemCount || totals.total <= 0}
          data-testid="charge-button"
          className="glass-button-success mt-3 flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-xl font-black"
        >
          <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          CHARGE {totals.totalDisplay}
        </button>
      </aside>

      <ChargeDialog
        key={chargeOpen ? "charge-open" : "charge-closed"}
        open={chargeOpen}
        onOpenChange={setChargeOpen}
        total={totals.total}
        currency={currency}
        onComplete={setReceipt}
      />
      <ReceiptDialog sale={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}
