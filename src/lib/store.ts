"use client";

// ---------------------------------------------------------------------------
// The app Zustand store. No React Context anywhere — views subscribe with
// selectors; the store is the only mutation path.
//
// useAppStore — SPA view state + chrome (sidebar collapse, mobile drawer).
// The POS app is dark-only by design (the reference's measured aesthetic);
// there is no theme store.
// ---------------------------------------------------------------------------

import { create } from "zustand";

import { pathForView, viewFromPath, type ViewId } from "./router";

const SIDEBAR_COLLAPSED_KEY = "vx-sidebar-collapsed";

// ---- the authenticated user's /api/auth/me shape (camelCase User row) ------

export type AppUser = {
  id: string;
  email: string;
  /** The API's public field (publicUser() maps the DB's fullName → name). */
  name: string;
  role: string;
  phone: string;
  active: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

// ---- useAppStore ------------------------------------------------------------

type AppStore = {
  view: ViewId;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  /** SPA navigation: pushes the canonical PascalCase path + flips the view. */
  navigate: (view: ViewId) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setMobileMenu: (open: boolean) => void;
  /** Mount-time sync: read the URL + the persisted collapse preference. */
  hydrate: () => void;
};

let popstateBound = false;

export const useAppStore = create<AppStore>((set, get) => ({
  view: "terminal",
  sidebarCollapsed: false,
  mobileMenuOpen: false,

  navigate: (view) => {
    try {
      window.history.pushState({}, "", pathForView(view));
    } catch {
      // history unavailable (SSR/tests) — the view flip still happens
    }
    set({ view, mobileMenuOpen: false });
  },

  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch {
      // storage unavailable (sandboxed) — collapse stays session-only
    }
  },

  toggleSidebar: () => {
    get().setSidebarCollapsed(!get().sidebarCollapsed);
  },

  setMobileMenu: (open) => set({ mobileMenuOpen: open }),

  hydrate: () => {
    try {
      const view = viewFromPath(window.location.pathname);
      set({ view });
    } catch {
      // no window (tests) — keep the default
    }
    try {
      const stored = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (stored === "1") set({ sidebarCollapsed: true });
    } catch {
      // storage unavailable — default expanded
    }
    if (popstateBound) return;
    popstateBound = true;
    try {
      window.addEventListener("popstate", () => {
        set({ view: viewFromPath(window.location.pathname), mobileMenuOpen: false });
      });
    } catch {
      // no window — nothing to bind
    }
  },
}));
