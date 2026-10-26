"use client";

// ---------------------------------------------------------------------------
// The StoreSettings view (English copy, reference-measured): "Store Settings
// / Customize your business" and the six cards — Business Information,
// Branding, Receipt, Fiscal / Tax Data, Card Payment Provider, Product
// Categories — plus Save Changes. The branding colors drive the receipt's
// accent and are validated as hex (the Zod contract mirrors the reference's
// #6366f1 / #8b5cf6 defaults).
// ---------------------------------------------------------------------------

import * as React from "react";
import { Palette, FileText, Receipt, Store, Upload, CreditCard, Tag, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/pos/shared";
import { apiSend, usePosStore, type Category, type StoreSettingsRow } from "@/lib/store";
import { CURRENCIES, currencyLabel, CARD_PROVIDERS, cardProviderLabel } from "@/lib/currency";

function SectionCard({
  icon,
  title,
  children,
  tone = "violet",
  headerAction,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  tone?: "violet" | "green";
  /** Optional control mounted in the card header row (the reference's fiscal
      card carries its "…on receipt" toggle there, right of the title). */
  headerAction?: React.ReactNode;
}) {
  return (
    <section className="glass-card rounded-2xl p-5" aria-label={title}>
      {/* Session-6 (measured live): the header row matches the reference —
          `flex items-center justify-between mb-4`, a BARE w-5 h-5 icon in a
          per-section color (gap-2), no chip wrapper. The heading keeps the
          clone's readable color (the reference's text-slate-700 on dark
          glass is its own near-invisible defect — the documented a11y
          superset posture). */}
      <div className="mb-4 flex items-center justify-between">
        <h2
          className={`flex items-center gap-2 text-base font-bold ${
            tone === "green" ? "text-emerald-300/80" : "text-violet-300/80"
          }`}
        >
          {icon}
          {title}
        </h2>
        {headerAction}
      </div>
      <div>{children}</div>
    </section>
  );
}

export function StoreSettingsView() {
  const settings = usePosStore((s) => s.settings);
  const categories = usePosStore((s) => s.categories);
  const upsertCategory = usePosStore((s) => s.upsertCategory);
  const { toast: toastApi } = useToast();

  const [form, setForm] = React.useState({
    storeName: "My Store",
    address: "",
    phone: "",
    email: "",
    taxId: "",
    currency: "USD",
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    receiptFooter: "Thank you for your purchase!",
    hideFiscalOnReceipt: true,
    fiscalRuc: "",
    fiscalBusinessType: "",
    fiscalAddress: "",
    fiscalExpenseAccount: "",
    cardProvider: "none",
    logoDataUrl: "",
  });
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [catDialogOpen, setCatDialogOpen] = React.useState(false);
  const [catBusy, setCatBusy] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  // Render-time adjustment (the React-recommended pattern for "state that
  // follows a prop"): re-sync the form whenever the settings ROW identity
  // changes — never inside an effect (the react-hooks/set-state-in-effect rule).
  const [syncedKey, setSyncedKey] = React.useState<string | null>(null);
  const settingsKey = settings ? settings.updatedAt ?? "loaded" : null;
  if (settings && settingsKey && syncedKey !== settingsKey) {
    setSyncedKey(settingsKey);
    setForm({
      storeName: settings.storeName,
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      taxId: settings.taxId,
      currency: settings.currency,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      receiptFooter: settings.receiptFooter,
      hideFiscalOnReceipt: settings.hideFiscalOnReceipt,
      fiscalRuc: settings.fiscalRuc,
      fiscalBusinessType: settings.fiscalBusinessType,
      fiscalAddress: settings.fiscalAddress,
      fiscalExpenseAccount: settings.fiscalExpenseAccount,
      cardProvider: settings.cardProvider,
      logoDataUrl: settings.logoDataUrl ?? "",
    });
  }

  const set = (patch: Partial<typeof form>): void => setForm((f) => ({ ...f, ...patch }));

  const save = async (): Promise<void> => {
    setBusy(true);
    try {
      const row = await apiSend<StoreSettingsRow>(
        "PATCH",
        "/api/store-settings", {
        storeName: form.storeName.trim() || "My Store",
        address: form.address,
        phone: form.phone,
        email: form.email,
        taxId: form.taxId,
        currency: form.currency,
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        receiptFooter: form.receiptFooter,
        hideFiscalOnReceipt: form.hideFiscalOnReceipt,
        fiscalRuc: form.fiscalRuc,
        fiscalBusinessType: form.fiscalBusinessType,
        fiscalAddress: form.fiscalAddress,
        fiscalExpenseAccount: form.fiscalExpenseAccount,
        cardProvider: form.cardProvider,
        logoDataUrl: form.logoDataUrl || null,
      });
      usePosStore.getState().setSettings(row);
      toastApi.success("Settings saved")
    } catch (err) {
      toastApi.error(`Save failed: ${err instanceof Error ? err.message : "Please try again."}`)
    } finally {
      setBusy(false);
    }
  };

  // Session-6 (measured live): the reference adds categories through a
  // "New Category" dialog opened from the section header's Add button —
  // not an inline input row. The name resets in the OPEN handler (the
  // key-identity doctrine: no setState-in-effect).
  const createCategory = async (): Promise<void> => {
    const name = newCategoryName.trim();
    if (!name) return;
    setCatBusy(true);
    try {
      const row = await apiSend<Category>("POST", "/api/categories", {
        name,
        color: form.secondaryColor,
      });
      upsertCategory(row);
      setCatDialogOpen(false);
      setNewCategoryName("");
      toastApi.success("Category added")
    } catch (err) {
      toastApi.error(`Could not add category: ${err instanceof Error ? err.message : "Please try again."}`)
    } finally {
      setCatBusy(false);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <PageHeader title="Store Settings" subtitle="Customize your business" />

      <div className="mt-5 grid max-w-4xl gap-5">
        <SectionCard icon={<Store className="h-5 w-5 text-indigo-500" aria-hidden="true" />} title="Business Information">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="set-name" className="text-white/70">
                Store name *
              </Label>
              <Input
                id="set-name"
                value={form.storeName}
                onChange={(e) => set({ storeName: e.target.value })}
                className="text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-white/70">Logo</Label>
              <label className="glass-button vpx-focus inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm">
                <Upload className="h-4 w-4" aria-hidden="true" />
                Upload logo
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  aria-label="Upload store logo"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => set({ logoDataUrl: String(reader.result ?? "") });
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="set-address" className="text-white/70">
                Address
              </Label>
              <Input
                id="set-address"
                value={form.address}
                onChange={(e) => set({ address: e.target.value })}
                className="text-white"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="set-phone" className="text-white/70">
                  Phone
                </Label>
                <Input
                  id="set-phone"
                  value={form.phone}
                  onChange={(e) => set({ phone: e.target.value })}
                  className="text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="set-email" className="text-white/70">
                  Email
                </Label>
                <Input
                  id="set-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set({ email: e.target.value })}
                  className="text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="set-taxid" className="text-white/70">
                  Tax ID / EIN
                </Label>
                <Input
                  id="set-taxid"
                  value={form.taxId}
                  onChange={(e) => set({ taxId: e.target.value })}
                  className="text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-white/70">Currency</Label>
                <Select value={form.currency} onValueChange={(v) => set({ currency: v })}>
                  <SelectTrigger className="text-white" aria-label="Currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-dark border-edge">
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={<Palette className="h-5 w-5 text-purple-500" aria-hidden="true" />} title="Branding">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="set-primary" className="text-white/70">
                Primary color
              </Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="set-primary"
                  value={form.primaryColor}
                  onChange={(e) => set({ primaryColor: e.target.value })}
                  aria-label="Primary color"
                  className="h-10 w-10 cursor-pointer rounded-lg"
                />
                <Input
                  value={form.primaryColor}
                  onChange={(e) => set({ primaryColor: e.target.value })}
                  className="font-mono text-white"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="set-secondary" className="text-white/70">
                Secondary color
              </Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="set-secondary"
                  value={form.secondaryColor}
                  onChange={(e) => set({ secondaryColor: e.target.value })}
                  aria-label="Secondary color"
                  className="h-10 w-10 cursor-pointer rounded-lg"
                />
                <Input
                  value={form.secondaryColor}
                  onChange={(e) => set({ secondaryColor: e.target.value })}
                  className="font-mono text-white"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={<FileText className="h-5 w-5 text-green-500" aria-hidden="true" />} title="Receipt" tone="green">
          <div className="grid gap-2">
            <Label htmlFor="set-footer" className="text-white/70">
              Receipt footer
            </Label>
            {/* Session-5 (measured live): the reference renders a TEXTAREA
                (rows=2, min-h-60px, resize vertical) — multi-line footers. */}
            <Textarea
              id="set-footer"
              rows={2}
              value={form.receiptFooter}
              onChange={(e) => set({ receiptFooter: e.target.value })}
              className="text-white"
            />
          </div>
        </SectionCard>

        <SectionCard
          icon={<Receipt className="h-5 w-5 text-orange-500" aria-hidden="true" />}
          title="Fiscal / Tax Data"
          headerAction={
            // The reference mounts the toggle in the card header row, right of
            // the title. Polarity per the reference: switch ON = fiscal data
            // VISIBLE on the receipt (default OFF = hidden). The internal
            // column stays hideFiscalOnReceipt, so the wiring inverts here.
            <label className="flex w-fit items-center gap-3 text-sm text-white/70">
              <Switch
                checked={!form.hideFiscalOnReceipt}
                onCheckedChange={(v) => set({ hideFiscalOnReceipt: !v })}
                aria-label="Show fiscal data on receipt"
              />
              {form.hideFiscalOnReceipt ? "Hidden on receipt" : "Visible on receipt"}
            </label>
          }
        >
          <div className="grid gap-4">
            <p className="text-sm text-white/50">
              If you configure these fields and enable the option, they will appear in the header
              of each printed or emailed receipt.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="set-ruc" className="text-white/70">
                  Tax ID / EIN
                </Label>
                <Input
                  id="set-ruc"
                  value={form.fiscalRuc}
                  onChange={(e) => set({ fiscalRuc: e.target.value })}
                  placeholder="e.g. 12-3456789"
                  className="text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="set-biztype" className="text-white/70">
                  Tax Regime
                </Label>
                <Input
                  id="set-biztype"
                  value={form.fiscalBusinessType}
                  onChange={(e) => set({ fiscalBusinessType: e.target.value })}
                  placeholder="e.g. S-Corp, LLC"
                  className="text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="set-fiscal-address" className="text-white/70">
                  Fiscal Address
                </Label>
                <Input
                  id="set-fiscal-address"
                  value={form.fiscalAddress}
                  onChange={(e) => set({ fiscalAddress: e.target.value })}
                  placeholder="Street, city, state, ZIP"
                  className="text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="set-expense" className="text-white/70">
                  CFDI Use (default)
                </Label>
                <Input
                  id="set-expense"
                  value={form.fiscalExpenseAccount}
                  onChange={(e) => set({ fiscalExpenseAccount: e.target.value })}
                  placeholder="e.g. G03 - General expenses"
                  className="text-white"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={<CreditCard className="h-5 w-5 text-blue-500" aria-hidden="true" />} title="Card Payment Provider">
          <div className="grid max-w-xs gap-2">
            <Label className="text-white/70">Provider</Label>
            <Select value={form.cardProvider} onValueChange={(v) => set({ cardProvider: v })}>
              <SelectTrigger className="text-white" aria-label="Card payment provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-dark border-edge">
                {CARD_PROVIDERS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {cardProviderLabel(p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SectionCard>

        <SectionCard
          icon={<Tag className="h-5 w-5 text-amber-500" aria-hidden="true" />}
          title="Product Categories"
          headerAction={
            // Session-6 (measured live): the header-row Add chip — glass-button
            // px-3 py-1.5 text-sm rounded-lg font-medium + Plus w-4 h-4 (the
            // glass-button class owns the text color; the reference's inert
            // text-slate-700 computes nothing).
            <Button
              variant="ghost"
              onClick={() => {
                setNewCategoryName("");
                setCatDialogOpen(true);
              }}
              className="glass-button px-3 py-1.5 text-sm rounded-lg font-medium"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </Button>
          }
        >
          <ul className="flex flex-wrap gap-2" aria-label="Product categories">
            {categories.map((c) => (
              <li
                key={c.id}
                className="inline-flex items-center gap-2 rounded-full border border-edge bg-white/5 px-3 py-1.5 text-sm text-white/80"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: c.color }}
                  aria-hidden="true"
                />
                {c.name}
              </li>
            ))}
            {categories.length === 0 && (
              <li className="text-sm text-slate-400">No categories</li>
            )}
          </ul>
        </SectionCard>

        {/* The New Category dialog (Session-6 — the reference's own flow). */}
        <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
          <DialogContent className="glass-dark border-edge sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-white">New Category</DialogTitle>
              <DialogDescription className="sr-only">
                Register a new product category.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="new-cat-name" className="text-white/70">
                Name
              </Label>
              <Input
                id="new-cat-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Beverages"
                className="text-white"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setCatDialogOpen(false)}
                className="glass-button rounded-xl border-0"
              >
                Cancel
              </Button>
              <Button
                onClick={() => void createCategory()}
                disabled={catBusy || !newCategoryName.trim()}
                className="glass-button-primary rounded-xl border-0"
              >
                {catBusy ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="sticky bottom-4 flex justify-end">
          <Button
            onClick={() => void save()}
            disabled={busy}
            data-testid="save-settings"
            className="glass-button-primary rounded-xl border-0 px-6 py-3.5 text-base font-medium shadow-lg"
          >
            {busy ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* currencyLabel participates in the visible tree for screen readers via
          the Select — the helper stays imported for the aria descriptions. */}
      <span className="sr-only">Currency: {currencyLabel(form.currency)}</span>
    </div>
  );
}
