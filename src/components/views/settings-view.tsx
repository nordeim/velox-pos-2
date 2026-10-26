"use client";

// ---------------------------------------------------------------------------
// Settings — the reference's own Settings route is a 404 (plan F11); this
// page is the documented superset: Store profile (name/address/phone/
// currency/receipt footer/default tax), the Categories manager (the
// reference's product-dialog category list was empty), the Account card
// (name/phone), and password change. Tabs keep it light.
// ---------------------------------------------------------------------------

import * as React from "react";
import { Plus, Store, Tags, Trash2, UserCircle } from "lucide-react";

import {
  GhostButton,
  PageHeader,
  PrimaryButton,
} from "@/components/pos/shared";
import { useToast } from "@/components/ui/toast";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut, ApiError } from "@/lib/api";
import { formatMoney } from "@/lib/money";

type StoreSettings = {
  storeName: string;
  address: string;
  phone: string;
  currency: string;
  receiptFooter: string;
  defaultTaxRate: number;
};

type Category = { id: string; name: string; color: string };

type Me = {
  user: { id: string; email: string; name: string; phone: string; role: string };
};

const TABS = ["store", "categories", "account"] as const;
type Tab = (typeof TABS)[number];

export function SettingsView() {
  const { toast } = useToast();
  const [tab, setTab] = React.useState<Tab>("store");
  const [settings, setSettings] = React.useState<StoreSettings | null>(null);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [me, setMe] = React.useState<Me["user"] | null>(null);
  const [newCategory, setNewCategory] = React.useState("");
  const [categoryColor, setCategoryColor] = React.useState("#7c3aed");
  const [account, setAccount] = React.useState({ name: "", phone: "" });
  const [passwords, setPasswords] = React.useState({ current: "", next: "" });
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const [settingsRow, categoryRows, meRow] = await Promise.all([
          apiGet<StoreSettings>("/api/settings"),
          apiGet<Category[]>("/api/categories"),
          apiGet<Me>("/api/auth/me"),
        ]);
        setSettings(settingsRow);
        setCategories(categoryRows);
        setMe(meRow.user);
        setAccount({ name: meRow.user.name, phone: meRow.user.phone });
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 401) {
          window.location.replace("/login");
          return;
        }
        toast.error(err instanceof Error ? err.message : "Settings failed to load.");
      }
    })();
  }, [toast]);

  const saveStore = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!settings) return;
    setBusy(true);
    try {
      const saved = await apiPut<StoreSettings>("/api/settings", settings);
      setSettings(saved);
      toast.success("Store settings saved.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "The settings failed to save.");
    } finally {
      setBusy(false);
    }
  };

  const addCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newCategory.trim() === "") return;
    setBusy(true);
    try {
      await apiPost("/api/categories", { name: newCategory.trim(), color: categoryColor });
      setCategories(await apiGet<Category[]>("/api/categories"));
      setNewCategory("");
      toast.success("Category added.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "The category failed to save.");
    } finally {
      setBusy(false);
    }
  };

  const removeCategory = async (category: Category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    try {
      await apiDelete(`/api/categories/${category.id}`);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      toast.success("Category deleted.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "The category failed to delete.");
    }
  };

  const saveAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = await apiPatch<Me>("/api/account", account);
      setMe(result.user);
      toast.success("Account updated.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "The account failed to save.");
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await apiPost("/api/auth/change-password", {
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });
      setPasswords({ current: "", next: "" });
      toast.success("Password updated.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "The password failed to update.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Store profile, catalog categories, and your account." />

      <div
        role="tablist"
        aria-label="Settings sections"
        className="mb-6 flex items-center gap-1 rounded-xl border border-vx-border bg-vx-surface p-1 sm:w-max"
      >
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`vx-focusable h-9 rounded-lg px-4 text-sm font-medium capitalize outline-none transition-colors ${
              tab === t ? "vx-gradient text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            {t === "store" ? "Store" : t === "categories" ? "Categories" : "Account"}
          </button>
        ))}
      </div>

      {/* ---- store ---- */}
      {tab === "store" && settings && (
        <form onSubmit={saveStore} className="vx-card max-w-2xl p-6" data-testid="store-settings">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
            <Store aria-hidden className="h-4 w-4 text-violet-400" />
            Store profile
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm text-slate-300 sm:col-span-2">
              Store name
              <input
                required
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="vx-input"
                data-testid="store-name"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-slate-300 sm:col-span-2">
              Address
              <input
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="vx-input"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-slate-300">
              Phone
              <input
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="vx-input"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-slate-300">
              Currency
              <input
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="vx-input"
                maxLength={3}
              />
              <span className="text-xs text-slate-500">
                ISO code — amounts preview as {formatMoney(1234, settings.currency || "USD")}
              </span>
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-slate-300">
              Default tax rate (%)
              <input
                inputMode="decimal"
                value={String(settings.defaultTaxRate)}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultTaxRate: Number(e.target.value) || 0,
                  })
                }
                className="vx-input"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-slate-300 sm:col-span-2">
              Receipt footer
              <input
                value={settings.receiptFooter}
                onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                className="vx-input"
              />
            </label>
          </div>
          <div className="mt-5 flex justify-end">
            <PrimaryButton type="submit" disabled={busy}>
              Save changes
            </PrimaryButton>
          </div>
        </form>
      )}

      {/* ---- categories ---- */}
      {tab === "categories" && (
        <div className="vx-card max-w-2xl p-6" data-testid="category-manager">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
            <Tags aria-hidden className="h-4 w-4 text-violet-400" />
            Categories
          </h2>
          <form onSubmit={addCategory} className="flex gap-2">
            <label className="flex-1">
              <span className="sr-only">New category name</span>
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Beverages"
                className="vx-input"
                data-testid="category-name"
              />
            </label>
            <label className="shrink-0">
              <span className="sr-only">Category color</span>
              <input
                type="color"
                value={categoryColor}
                onChange={(e) => setCategoryColor(e.target.value)}
                className="vx-focusable h-10 w-12 cursor-pointer rounded-lg border border-vx-border bg-vx-elevated p-1"
                aria-label="Category color"
              />
            </label>
            <PrimaryButton type="submit" disabled={busy} aria-label="Add category">
              <Plus className="h-4 w-4" />
              Add
            </PrimaryButton>
          </form>
          {categories.length === 0 ? (
            <p className="mt-8 text-center text-sm text-slate-500">No categories yet</p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-white/5">
              {categories.map((category) => (
                <li key={category.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span
                    aria-hidden
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-slate-200">{category.name}</span>
                  <span className="ml-auto">
                    <button
                      type="button"
                      aria-label={`Delete ${category.name}`}
                      onClick={() => void removeCategory(category)}
                      className="vx-focusable flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 outline-none hover:bg-white/5 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ---- account ---- */}
      {tab === "account" && me && (
        <div className="grid max-w-4xl grid-cols-1 gap-4 lg:grid-cols-2">
          <form onSubmit={saveAccount} className="vx-card p-6" data-testid="account-card">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
              <UserCircle aria-hidden className="h-4 w-4 text-violet-400" />
              Account
            </h2>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-slate-400">
                <span className="block text-xs uppercase tracking-wide text-slate-500">Email</span>
                {me.email}
              </p>
              <p className="text-sm text-slate-400">
                <span className="block text-xs uppercase tracking-wide text-slate-500">Role</span>
                <span className="capitalize">{me.role}</span>
              </p>
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Display name
                <input
                  required
                  value={account.name}
                  onChange={(e) => setAccount({ ...account, name: e.target.value })}
                  className="vx-input"
                  data-testid="account-name"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Phone
                <input
                  value={account.phone}
                  onChange={(e) => setAccount({ ...account, phone: e.target.value })}
                  className="vx-input"
                />
              </label>
              <div className="flex justify-end">
                <PrimaryButton type="submit" disabled={busy}>
                  Save
                </PrimaryButton>
              </div>
            </div>
          </form>

          <form onSubmit={changePassword} className="vx-card p-6" data-testid="password-card">
            <h2 className="mb-4 text-base font-bold text-white">Change password</h2>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Current password
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="vx-input"
                  data-testid="current-password"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                New password
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={passwords.next}
                  onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                  className="vx-input"
                  data-testid="new-password"
                />
                <span className="text-xs text-slate-500">At least 8 characters.</span>
              </label>
              <div className="flex justify-end">
                <PrimaryButton type="submit" disabled={busy}>
                  Update password
                </PrimaryButton>
              </div>
            </div>
          </form>

          <div className="vx-card p-6 lg:col-span-2">
            <h2 className="mb-2 text-base font-bold text-white">Session</h2>
            <p className="mb-3 text-sm text-slate-400">
              Sign out of this device. Your session cookie is cleared immediately.
            </p>
            <GhostButton
              onClick={async () => {
                try {
                  await apiPost("/api/auth/logout");
                } finally {
                  window.location.replace("/login");
                }
              }}
              data-testid="logout-button"
            >
              Sign out
            </GhostButton>
          </div>
        </div>
      )}
    </div>
  );
}
