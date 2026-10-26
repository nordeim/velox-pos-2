"use client";

// ---------------------------------------------------------------------------
// The below-lg chrome: a fixed app bar (hamburger + brand) and the slide-in
// navigation drawer. THE REFERENCE HAS NO WORKING MOBILE NAV — its desktop
// layout simply crushes at 390px (plan finding F13). This component is the
// documented superset: a full-height drawer built on the repo Tailwind v4
// skill's mobile-navigation contract (skills/nextjs16-tailwind4 §9):
//   - a real <button> trigger, aria-expanded + aria-controls;
//   - role=dialog + aria-modal, labelled;
//   - focus moves INTO the drawer on open and RETURNS to the trigger on
//     close; a focus trap cycles Tab within the panel;
//   - Escape closes; the backdrop tap closes; body scroll locks while open;
//   - the drawer closes when the viewport crosses into lg.
//
// Tailwind v4 traps honored (docs/Tailwind-V4-Validation-Report.md):
//   trap 4  — the nav list is `flex flex-col gap-1`; NEVER space-y-* with
//             mt-*/mb-* children (v4's :where() rewrite flips specificity);
//   trap 9  — the backdrop uses backdrop-blur-xs (v4's renamed 4px stop);
//   trap 5  — the brand chip gradient is the .vx-gradient class (exact
//             sRGB stops), never a utility gradient.
// ---------------------------------------------------------------------------

import * as React from "react";
import { Menu, X, Zap } from "lucide-react";

import { NavItemLink } from "@/components/layout/nav-items";
import { NAV_ITEMS } from "@/lib/router";
import { useAppStore } from "@/lib/store";

const DRAWER_ID = "vx-mobile-nav";

export function MobileChrome() {
  const mobileMenuOpen = useAppStore((s) => s.mobileMenuOpen);
  const setMobileMenu = useAppStore((s) => s.setMobileMenu);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const close = React.useCallback(() => setMobileMenu(false), [setMobileMenu]);

  // While the drawer is open: lock body scroll, close on Escape, trap Tab,
  // and close if the viewport crosses into lg (the app bar disappears there).
  React.useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus lands on the panel (tabIndex=-1) so Tab cycles inside.
    panelRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);

    const desktop = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = () => {
      if (desktop.matches) close();
    };
    desktop.addEventListener("change", onBreakpoint);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onBreakpoint);
      // Focus returns to the hamburger (the overlay a11y contract).
      triggerRef.current?.focus();
    };
  }, [mobileMenuOpen, close]);

  return (
    <>
      {/* App bar (the page's banner below lg). */}
      <header
        data-testid="mobile-app-bar"
        className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-vx-border bg-vx-surface px-4 lg:hidden"
      >
        <div className="flex min-w-0 items-center gap-3">
          <button
            ref={triggerRef}
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls={DRAWER_ID}
            data-testid="mobile-nav-trigger"
            onClick={() => setMobileMenu(true)}
            className="vx-focusable flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-300 outline-none transition-colors hover:bg-white/5"
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>
          <span
            aria-hidden
            className="vx-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
          >
            <Zap className="h-4 w-4" strokeWidth={2} fill="currentColor" />
          </span>
          <span className="text-base font-extrabold text-white">VeloxPOS</span>
        </div>
      </header>

      {/* The slide-in drawer — mounted only while open. */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          data-testid="mobile-nav-drawer"
          className="fixed inset-0 z-50 lg:hidden"
        >
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={close}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          />
          <div
            id={DRAWER_ID}
            ref={panelRef}
            tabIndex={-1}
            className="vx-slide-in absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-vx-border bg-vx-surface shadow-2xl outline-none"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-vx-border p-4">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="vx-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                >
                  <Zap className="h-5 w-5" strokeWidth={2} fill="currentColor" />
                </span>
                <p className="text-lg font-extrabold text-white">VeloxPOS</p>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={close}
                className="vx-focusable flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 outline-none transition-colors hover:bg-white/5 hover:text-slate-200"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            {/* Trap 4: gap on the parent, never margins on the items. */}
            <nav
              aria-label="Primary"
              className="vx-scroll flex flex-1 flex-col gap-1 overflow-y-auto p-3"
            >
              {NAV_ITEMS.map((item) => (
                <NavItemLink key={item.id} view={item.id} onNavigate={close} />
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
