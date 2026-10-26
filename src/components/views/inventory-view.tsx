"use client";

// ---------------------------------------------------------------------------
// Inventory (plan F17/F18): the header + count, the gradient "New Product"
// action, the search ("Search by name or code..."), the category chip, and
// the PRODUCT/CODE/PRICE/STOCK/CATEGORY/STATUS/ACTIONS table. The New/Edit
// Product dialog mirrors the reference's measured field set — and WORKS
// (the reference's own create flow never completes, plan F10).
// ---------------------------------------------------------------------------

import * as React from "react";
import { Package, Pencil, Plus, Search, Trash2, X } from "lucide-react";

import {
  GhostButton,
  PageHeader,
  PrimaryButton,
  StatusPill,
  TableCard,
  Td,
  Th,
} from "@/components/pos/shared";
import { useToast } from "@/components/ui/toast";
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from "@/lib/api";
import { centsToDecimalString, formatMoney } from "@/lib/money";
import { UNITS } from "@/lib/validation";

type Category = { id: string; name: string; color: string };

type Product = {
  id: string;
  name: string;
  barcode: string;
  categoryId: string | null;
  priceCents: number;
  costCents: number;
  stock: number;
  minStock: number;
  taxRate: number;
  unit: string;
  imageUrl: string;
  active: boolean;
};

type ProductForm = {
  name: string;
  barcode: string;
  categoryId: string;
  price: string;
  cost: string;
  stock: string;
  minStock: string;
  taxRate: string;
  unit: string;
  imageUrl: string;
  active: boolean;
};

const EMPTY_FORM: ProductForm = {
  name: "",
  barcode: "",
  categoryId: "",
  price: "",
  cost: "",
  stock: "0",
  minStock: "5",
  taxRate: "16",
  unit: "Piece",
  imageUrl: "",
  active: true,
};

export function InventoryView() {
  const { toast } = useToast();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [form, setForm] = React.useState<ProductForm>(EMPTY_FORM);
  const [busy, setBusy] = React.useState(false);

  const reload = React.useCallback(async () => {
    const [productRows, categoryRows] = await Promise.all([
      apiGet<Product[]>("/api/products"),
      apiGet<Category[]>("/api/categories"),
    ]);
    setProducts(productRows);
    setCategories(categoryRows);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [productRows, categoryRows] = await Promise.all([
          apiGet<Product[]>("/api/products"),
          apiGet<Category[]>("/api/categories"),
        ]);
        if (cancelled) return;
        setProducts(productRows);
        setCategories(categoryRows);
      } catch (err: unknown) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          window.location.replace("/login");
          return;
        }
        toast.error(err instanceof Error ? err.message : "Inventory failed to load.");
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, taxRate: String(categories.length > 0 ? form.taxRate : 16) });
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      barcode: product.barcode,
      categoryId: product.categoryId ?? "",
      price: centsToDecimalString(product.priceCents),
      cost: centsToDecimalString(product.costCents),
      stock: String(product.stock),
      minStock: String(product.minStock),
      taxRate: String(product.taxRate),
      unit: product.unit,
      imageUrl: product.imageUrl,
      active: product.active,
    });
    setDialogOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const payload = {
      name: form.name,
      barcode: form.barcode,
      categoryId: form.categoryId,
      price: form.price === "" ? 0 : Number(form.price),
      cost: form.cost === "" ? 0 : Number(form.cost),
      stock: form.stock === "" ? 0 : Number(form.stock),
      minStock: form.minStock === "" ? 0 : Number(form.minStock),
      taxRate: form.taxRate === "" ? 16 : Number(form.taxRate),
      unit: form.unit,
      imageUrl: form.imageUrl,
      active: form.active,
    };
    try {
      if (editing) {
        await apiPatch(`/api/products/${editing.id}`, payload);
        toast.success("Product updated.");
      } else {
        await apiPost("/api/products", payload);
        toast.success("Product created.");
      }
      setDialogOpen(false);
      await reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "The product failed to save.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await apiDelete(`/api/products/${product.id}`);
      toast.success("Product deleted.");
      await reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "The product failed to delete.");
    }
  };

  const filtered = products.filter((p) => {
    const q = query.trim().toLowerCase();
    if (categoryFilter !== "all" && p.categoryId !== categoryFilter) return false;
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q);
  });

  const categoryName = (id: string | null) =>
    id ? (categories.find((c) => c.id === id)?.name ?? "—") : "—";

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle={`${products.length} product${products.length === 1 ? "" : "s"} registered`}
        action={
          <PrimaryButton onClick={openCreate} data-testid="new-product">
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            New Product
          </PrimaryButton>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search products</span>
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or code..."
            className="vx-input pl-9"
            data-testid="inventory-search"
          />
        </label>
        {categories.length > 0 && (
          <label className="shrink-0">
            <span className="sr-only">Filter by category</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="vx-input sm:w-44"
              data-testid="inventory-category-filter"
            >
              <option value="all">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {!loaded ? (
        <p className="text-sm text-slate-500">Loading inventory…</p>
      ) : (
        <TableCard testId="inventory-table">
          <thead>
            <tr>
              <Th>PRODUCT</Th>
              <Th>CODE</Th>
              <Th>PRICE</Th>
              <Th>STOCK</Th>
              <Th>CATEGORY</Th>
              <Th>STATUS</Th>
              <Th className="text-right">ACTIONS</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="border-b border-white/5 px-5 py-14 text-center text-slate-400">
                  No products found
                </td>
              </tr>
            )}
            {filtered.map((product) => {
              const low = product.active && product.stock <= product.minStock;
              const out = product.stock <= 0;
              return (
                <tr key={product.id} className="transition-colors hover:bg-white/[0.02]">
                  <Td className="font-medium text-slate-100">{product.name}</Td>
                  <Td className="font-mono text-xs text-slate-400">{product.barcode}</Td>
                  <Td className="font-semibold text-slate-100">{formatMoney(product.priceCents)}</Td>
                  <Td>
                    <span className={out ? "text-red-400" : low ? "text-amber-400" : "text-slate-300"}>
                      {product.stock}
                    </span>
                    <span className="text-xs text-slate-600"> / min {product.minStock}</span>
                  </Td>
                  <Td>{categoryName(product.categoryId)}</Td>
                  <Td>
                    <StatusPill
                      kind={!product.active ? "inactive" : out ? "out" : low ? "low" : "ok"}
                      label={!product.active ? "Inactive" : out ? "Out of stock" : low ? "Low" : "Active"}
                    />
                  </Td>
                  <Td className="text-right">
                    <span className="inline-flex justify-end gap-1">
                      <button
                        type="button"
                        aria-label={`Edit ${product.name}`}
                        onClick={() => openEdit(product)}
                        className="vx-focusable flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 outline-none hover:bg-white/5 hover:text-violet-300"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${product.name}`}
                        onClick={() => void remove(product)}
                        className="vx-focusable flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 outline-none hover:bg-white/5 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </span>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableCard>
      )}

      {/* ---- the New/Edit Product dialog ---- */}
      {dialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={editing ? "Edit product" : "New product"}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center"
          data-testid="product-dialog"
        >
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => setDialogOpen(false)}
            className="fixed inset-0 bg-black/60"
          />
          <div className="vx-card relative z-10 my-auto w-full max-w-2xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editing ? "Edit Product" : "New Product"}
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setDialogOpen(false)}
                className="vx-focusable flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 outline-none hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" data-testid="product-form">
              <label className="flex flex-col gap-1.5 text-sm text-slate-300 sm:col-span-2">
                Name *
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="vx-input"
                  data-testid="product-name"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Barcode *
                <input
                  required
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  className="vx-input"
                  data-testid="product-barcode"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Category
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="vx-input"
                  data-testid="product-category"
                >
                  <option value="">Select</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Selling price *
                <input
                  required
                  inputMode="decimal"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="vx-input"
                  data-testid="product-price"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Cost
                <input
                  inputMode="decimal"
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
                  className="vx-input"
                  data-testid="product-cost"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Current stock
                <input
                  inputMode="numeric"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="vx-input"
                  data-testid="product-stock"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Min. stock
                <input
                  inputMode="numeric"
                  value={form.minStock}
                  onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                  className="vx-input"
                  data-testid="product-min-stock"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Tax rate (%)
                <input
                  inputMode="decimal"
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                  className="vx-input"
                  data-testid="product-tax"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Unit
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="vx-input"
                  data-testid="product-unit"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-slate-300 sm:col-span-2">
                Product image URL
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="vx-input"
                  placeholder="https://…"
                  data-testid="product-image"
                />
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-300 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="h-4 w-4 accent-violet-600"
                  data-testid="product-active"
                />
                Active product
              </label>
              <div className="flex justify-end gap-2 sm:col-span-2">
                <GhostButton type="button" onClick={() => setDialogOpen(false)}>
                  Cancel
                </GhostButton>
                <PrimaryButton type="submit" disabled={busy} data-testid="product-submit">
                  {editing ? "Save" : "Create"}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
