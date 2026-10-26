"use client";

// ---------------------------------------------------------------------------
// The Inventory view (English copy, reference-measured): "0 products
// registered", + New Product, search "Search by name or code...", the All
// category pill, the PRODUCT/CODE/PRICE/STOCK/CATEGORY/STATUS/ACTIONS table.
// Superset: edit/delete, CSV export/import, category-color chips.
// ---------------------------------------------------------------------------

import * as React from "react";
import { Download, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/pos/shared";
import { apiSend, usePosStore, type Category, type Product } from "@/lib/store";
import { formatMoney } from "@/lib/money";
import { stockStatus, UNITS, productsToCsv, parseCsv, parseCsvRow } from "@/lib/inventory-status";

type ProductDraft = {
  name: string;
  barcode: string;
  categoryId: string;
  price: string;
  cost: string;
  stock: string;
  minStock: string;
  taxRate: string;
  unit: string;
  image: string;
  active: boolean;
};

const EMPTY_DRAFT: ProductDraft = {
  name: "",
  barcode: "",
  categoryId: "",
  price: "",
  cost: "",
  stock: "0",
  minStock: "5",
  taxRate: "16",
  unit: "Piece",
  image: "",
  active: true,
};

function statusChip(stock: number, minStock: number): { label: string; cls: string } {
  const status = stockStatus(stock, minStock);
  if (status === "out") return { label: "Out of stock", cls: "bg-red-500/15 text-red-400" };
  if (status === "low") return { label: "Low stock", cls: "bg-orange-500/15 text-orange-400" };
  return { label: "In stock", cls: "bg-emerald-500/15 text-emerald-400" };
}

function ProductModal({
  open,
  editing,
  onClose,
}: {
  open: boolean;
  editing: Product | null;
  onClose: () => void;
}) {
  const categories = usePosStore((s) => s.categories);
  // The dialog's state starts fresh on every mount — the view keys this
  // component by (editing id × open), so the draft initializes DIRECTLY from
  // the editing row (no reset effect: the react-hooks/set-state-in-effect
  // rule). A "new product" mount starts at the reference's defaults.
  const [draft, setDraft] = React.useState<ProductDraft>(() =>
    editing
      ? {
          name: editing.name,
          barcode: editing.barcode,
          categoryId: editing.categoryId ?? "",
          price: String(editing.price),
          cost: editing.cost == null ? "" : String(editing.cost),
          stock: String(editing.stock),
          minStock: String(editing.minStock),
          taxRate: String(editing.taxRate),
          unit: editing.unit,
          image: editing.image ?? "",
          active: editing.active,
        }
      : EMPTY_DRAFT,
  );
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast: toastApi } = useToast();

  const set = (patch: Partial<ProductDraft>): void => setDraft((d) => ({ ...d, ...patch }));
  const nameValid = draft.name.trim().length > 0;
  const priceValid = draft.price !== "" && Number(draft.price) >= 0;

  const submit = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    const payload = {
      name: draft.name.trim(),
      barcode: draft.barcode.trim(),
      categoryId: draft.categoryId || null,
      price: Number(draft.price),
      cost: draft.cost === "" ? null : Number(draft.cost),
      stock: Number(draft.stock || 0),
      minStock: Number(draft.minStock || 0),
      taxRate: Number(draft.taxRate || 0),
      unit: draft.unit,
      image: draft.image || null,
      active: draft.active,
    };
    try {
      const row = editing
        ? await apiSend<Product>(
        "PATCH",
        `/api/products/${editing.id}`, payload)
        : await apiSend<Product>(
        "POST",
        "/api/products", payload);
      usePosStore.setState((s) => ({
        products: editing
          ? s.products.map((p) => (p.id === row.id ? { ...row, category: s.categories.find((c) => c.id === row.categoryId) ?? null } : p))
          : [row, ...s.products],
      }));
      toastApi.success(editing ? "Product updated" : "Product created")
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the product.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="glass-dark border-edge sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">{editing ? "Edit Product" : "New Product"}</DialogTitle>
          <DialogDescription className="sr-only">
            {editing ? "Update the product." : "Register a new product."}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <div className="vpx-scroll grid max-h-[60vh] gap-4 overflow-y-auto pr-1">
          <div className="grid gap-2">
            <Label htmlFor="p-name" className="text-white/70">
              Name *
            </Label>
            <Input
              id="p-name"
              value={draft.name}
              onChange={(e) => set({ name: e.target.value })}
              className="text-white"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="p-barcode" className="text-white/70">
                Barcode *
              </Label>
              <Input
                id="p-barcode"
                value={draft.barcode}
                onChange={(e) => set({ barcode: e.target.value })}
                className="text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-white/70">Category</Label>
              <Select
                value={draft.categoryId || "none"}
                onValueChange={(v) => set({ categoryId: v === "none" ? "" : v })}
              >
                <SelectTrigger className="text-white" aria-label="Category">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="glass-dark border-edge">
                  <SelectItem value="none">Select</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-price" className="text-white/70">
                Selling price *
              </Label>
              <Input
                id="p-price"
                type="number"
                min={0}
                step="0.01"
                value={draft.price}
                onChange={(e) => set({ price: e.target.value })}
                className="text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-cost" className="text-white/70">
                Cost
              </Label>
              <Input
                id="p-cost"
                type="number"
                min={0}
                step="0.01"
                value={draft.cost}
                onChange={(e) => set({ cost: e.target.value })}
                className="text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-stock" className="text-white/70">
                Current stock
              </Label>
              <Input
                id="p-stock"
                type="number"
                min={0}
                step="1"
                value={draft.stock}
                onChange={(e) => set({ stock: e.target.value })}
                className="text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-minstock" className="text-white/70">
                Min. stock
              </Label>
              <Input
                id="p-minstock"
                type="number"
                min={0}
                step="1"
                value={draft.minStock}
                onChange={(e) => set({ minStock: e.target.value })}
                className="text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-tax" className="text-white/70">
                Tax rate (%)
              </Label>
              <Input
                id="p-tax"
                type="number"
                min={0}
                max={100}
                step="0.5"
                value={draft.taxRate}
                onChange={(e) => set({ taxRate: e.target.value })}
                className="text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-white/70">Unit</Label>
              <Select value={draft.unit} onValueChange={(v) => set({ unit: v })}>
                <SelectTrigger className="text-white" aria-label="Unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-dark border-edge">
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-image" className="text-white/70">
              Product image
            </Label>
            <Input
              id="p-image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => set({ image: String(reader.result ?? "") });
                reader.readAsDataURL(file);
              }}
              className="text-white/70"
            />
          </div>
          <label className="flex items-center gap-3 text-sm text-white/70">
            <Switch checked={draft.active} onCheckedChange={(v) => set({ active: v })} />
            Active product
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-white/70">
            Cancel
          </Button>
          <Button
            onClick={() => void submit()}
            disabled={busy || !nameValid || !priceValid}
            className="glass-button-primary rounded-xl border-0"
          >
            {busy ? "Saving…" : editing ? "Save changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function InventoryView() {
  const products = usePosStore((s) => s.products);
  const categories = usePosStore((s) => s.categories);
  const dropProduct = usePosStore((s) => s.dropProduct);
  const settings = usePosStore((s) => s.settings);
  const { toast: toastApi } = useToast();

  const [search, setSearch] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<string>("all");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [deleting, setDeleting] = React.useState<Product | null>(null);

  const currency = settings?.currency ?? "USD";
  const byId = new Map(categories.map((c) => [c.id, c]));
  const visible = products.filter((p) => {
    if (categoryId !== "all" && p.categoryId !== categoryId) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q);
  });

  const exportCsv = (): void => {
    const csv = productsToCsv(
      products.map((p) => ({
        name: p.name,
        barcode: p.barcode,
        categoryName: p.categoryId ? (byId.get(p.categoryId)?.name ?? null) : null,
        price: p.price,
        cost: p.cost,
        stock: p.stock,
        minStock: p.minStock,
        taxRate: p.taxRate,
        unit: p.unit,
        active: p.active,
      })),
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCsv = async (file: File): Promise<void> => {
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) throw new Error("The file has no data rows.");
      let imported = 0;
      for (const cells of rows) {
        if (cells[0]?.trim().toLowerCase() === "name") continue; // header row
        const row = parseCsvRow(cells);
        const category = row.category
          ? categories.find((c) => c.name.toLowerCase() === row.category.toLowerCase())
          : undefined;
        const created = await apiSend<Product>(
        "POST",
        "/api/products", {
          name: row.name,
          barcode: row.barcode,
          categoryId: category?.id ?? null,
          price: row.price,
          cost: row.cost,
          stock: row.stock,
          minStock: row.minStock,
          taxRate: row.taxRate,
          unit: UNITS.includes(row.unit as (typeof UNITS)[number]) ? row.unit : "Piece",
          image: null,
          active: row.active,
        });
        usePosStore.getState().upsertProduct(created);
        imported += 1;
      }
      toastApi.success("Import complete")
    } catch (err) {
      toastApi.error(`Import failed: ${err instanceof Error ? err.message : "Check the CSV format."}`)
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deleting) return;
    try {
      await apiSend("DELETE", `/api/products/${deleting.id}`);
      dropProduct(deleting.id);
      toastApi.success("Product deleted")
    } catch (err) {
      toastApi.error(`Delete failed: ${err instanceof Error ? err.message : "Please try again."}`)
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <PageHeader
        title="Inventory"
        subtitle={`${products.length} products registered`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={exportCsv}
              aria-label="Export products as CSV"
              className="glass-button rounded-xl text-sm"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export
            </Button>
            <label className="glass-button vpx-focus inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Import
              <input
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                aria-label="Import products from CSV"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void importCsv(f);
                  e.currentTarget.value = "";
                }}
              />
            </label>
            <Button
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
              className="glass-button-primary rounded-xl border-0"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Product
            </Button>
          </div>
        }
      />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or code..."
            aria-label="Search by name or code"
            className="pl-10 text-white"
          />
        </div>
        {/* Session-6 (measured live): the reference's chip family — container
            `flex gap-2 overflow-x-auto`; chips `px-4 rounded-xl text-xs
            font-semibold whitespace-nowrap` computing 36px (the reference's
            py-2 chip measures 36px — a Base44 base-button quirk +2px over the
            utility math; pinned via h-9) with the ACTIVE chip on the
            glass-button-primary gradient. The inactive treatment follows the
            reference's pill family (white/40 → white/70 on hover) — the live
            reference renders only the active "All" chip in its empty store,
            so the inactive state is the documented family assumption. */}
        <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Filter by category">
          <button
            type="button"
            onClick={() => setCategoryId("all")}
            aria-pressed={categoryId === "all"}
            className={`vpx-focus flex h-9 items-center gap-2 whitespace-nowrap rounded-xl px-4 text-xs font-semibold ${
              categoryId === "all"
                ? "glass-button-primary"
                : "text-white/40 hover:bg-white/5 hover:text-white/70"
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
              className={`vpx-focus flex h-9 items-center gap-2 whitespace-nowrap rounded-xl px-4 text-xs font-semibold ${
                categoryId === c.id
                  ? "glass-button-primary"
                  : "text-white/40 hover:bg-white/5 hover:text-white/70"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card mt-4 overflow-hidden rounded-2xl">
        <div className="vpx-scroll overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-edge text-xs font-bold uppercase tracking-wider text-white/50">
                <th scope="col" className="px-5 py-3.5">Product</th>
                <th scope="col" className="px-5 py-3.5">Code</th>
                <th scope="col" className="px-5 py-3.5">Price</th>
                <th scope="col" className="px-5 py-3.5">Stock</th>
                <th scope="col" className="px-5 py-3.5">Category</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  {/* Session-10 (F-63, measured live): the reference's own
                      empty-cell treatment — text-center py-12 text-slate-400
                      text-sm. */}
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">
                    No products found
                  </td>
                </tr>
              ) : (
                visible.map((p) => {
                  const chip = statusChip(p.stock, p.minStock);
                  return (
                    <tr key={p.id} className="border-b border-edge/60 last:border-0 hover:bg-white/[0.02]">
                      <td className="px-5 py-3.5 font-semibold text-white/90">{p.name}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-white/50">{p.barcode || "—"}</td>
                      <td className="px-5 py-3.5 text-white/80">{formatMoney(p.price, currency)}</td>
                      <td className="px-5 py-3.5 text-white/80">
                        {Math.trunc(p.stock)} {p.unit === "Piece" ? "" : p.unit}
                      </td>
                      <td className="px-5 py-3.5 text-white/60">
                        {p.categoryId ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: byId.get(p.categoryId)?.color ?? "#475569" }}
                              aria-hidden="true"
                            />
                            {byId.get(p.categoryId)?.name ?? "—"}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${chip.cls}`}>
                          {chip.label}
                        </span>
                        {!p.active && (
                          <span className="ml-1.5 inline-block rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/40">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(p);
                              setModalOpen(true);
                            }}
                            aria-label={`Edit ${p.name}`}
                            className="vpx-focus rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-violet-300"
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(p)}
                            aria-label={`Delete ${p.name}`}
                            className="vpx-focus rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal
        key={`${editing?.id ?? "new"}-${modalOpen}`}
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="glass-dark border-edge">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete product</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              {deleting ? `Delete "${deleting.name}"? This cannot be undone.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-white/70">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void confirmDelete()}
              className="glass-button-danger border-0"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
