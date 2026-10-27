"use client";

// ---------------------------------------------------------------------------
// /reset-password?token=… — the one-shot reset surface, restructured to the
// reference's MEASURED contract (Session-13, F-86..F-94, live 2026-10-27).
// The reference's reset page is NOT the login card's slate family — it is
// the stock shadcn GRAY family: a flat bg-gray-50 canvas, an 8px
// rounded-lg shadow-lg card carrying a 2px SOLID gray-900 top strip (not
// the login's 4px slate gradient), Title Case gray-700 labels, 6px
// rounded-md gray-200 inputs with Lock icons on BOTH fields, the "Must be
// at least 8 characters" helper, NO token field (the URL carries the
// token), a 44px gray-900 "Reset password" plus a full-width "Back to
// login" text link — and its OWN alert family (rounded-lg + red-50 at 0.5
// + inner red-800 #991b1b — distinct from the login's 12px/0.7/red-700
// panel; the reference itself ships two alert treatments on its two auth
// surfaces).
//
// Three states, all server-rendered (the token arrives as a PROP from the
// page's searchParams — no client-side URL read, no hydration flip):
//   tokenless → the "Invalid Reset Link" dead-end (an 80px red-100 circle
//               chip + circle-alert, ZERO inputs — the reference never
//               renders the form without a token);
//   token     → the measured form (the client-side equality check runs
//               BEFORE any fetch; API errors surface the route's copy);
//   done      → the clone's own success notice (the reference's success
//               state is unmeasurable — its reset emails are unreachable —
//               a documented superset on the measured card family).
// ---------------------------------------------------------------------------

import * as React from "react";
import Link from "next/link";
import { CircleAlert, Lock } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FIELD_CLASSES =
  "h-11 rounded-md border-gray-200 bg-gray-50/50 pl-10 placeholder:text-zinc-500 " +
  "focus-visible:border-gray-400 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2";

const LockGlyph = (
  <Lock
    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
    aria-hidden="true"
  />
);

export function ResetPasswordSurface({ token }: { token: string }) {
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  // Same hydration gate as the login surface (the timer-callback note
  // there): the submit ships disabled from the server and unlocks a tick
  // after mount — a pre-hydration native GET would leak the password.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const submit = async (): Promise<void> => {
    // F-92 (measured): the equality check runs CLIENT-SIDE before any
    // fetch — the mismatch path never reaches the API. The reference's
    // copy carries no trailing period.
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "The reset failed. Request a new link.");
        return;
      }
      setDone(true);
    } catch {
      setError("You appear to be offline. Reconnect and try again.");
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    void submit();
  };

  // ---- the shared card skeleton (F-87): 8px shadcn card + the 2px strip --
  const cardShell = (children: React.ReactNode) => (
    <main className="reset-canvas theme-light flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lg">
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 top-0 h-0.5 bg-gray-900"
        />
        {children}
      </div>
    </main>
  );

  // ---- F-93: the tokenless dead-end — the reference renders ZERO inputs --
  if (!token) {
    return cardShell(
      <div className="space-y-6 p-6 pb-10 px-12 pt-12 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <CircleAlert className="h-10 w-10 text-red-600" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Invalid Reset Link</h2>
          <p className="text-gray-600">This password reset link is invalid or has expired.</p>
        </div>
        <Link
          href="/login"
          className="vpx-focus inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800"
        >
          Back to Login
        </Link>
      </div>,
    );
  }

  // ---- the done state: the clone's own notice (documented superset) -----
  if (done) {
    return cardShell(
      <div className="space-y-6 p-6 pb-10 px-12 pt-12 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Password Updated</h2>
          <p className="text-gray-600">
            Your password has been updated. Sign in with the new password.
          </p>
        </div>
        <Link
          href="/login"
          className="vpx-focus inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800"
        >
          Back to Login
        </Link>
      </div>,
    );
  }

  // ---- F-86..F-91: the measured form state -------------------------------
  return cardShell(
    <div className="space-y-8 p-6 pb-10 px-12 pt-12">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Set new password</h2>
        <p className="text-gray-600">
          Enter your new password for VeloxPOS (Point Of Sale)
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <div className="space-y-5">
          {error && <Alert tone="error-soft">{error}</Alert>}
          <div className="space-y-2">
            <Label htmlFor="rp-password" className="text-gray-700">
              New Password
            </Label>
            <div className="relative">
              {LockGlyph}
              <Input
                id="rp-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={FIELD_CLASSES}
              />
            </div>
            <p className="text-xs text-gray-500">Must be at least 8 characters</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rp-confirm" className="text-gray-700">
              Confirm New Password
            </Label>
            <div className="relative">
              {LockGlyph}
              <Input
                id="rp-confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className={FIELD_CLASSES}
              />
            </div>
          </div>
          <div className="space-y-3">
            <button
              type="submit"
              disabled={busy || !mounted}
              data-testid="reset-submit"
              className="vpx-focus inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800 disabled:pointer-events-none disabled:opacity-50"
            >
              {busy ? "Saving…" : "Reset password"}
            </button>
            <Link
              href="/login"
              className="vpx-focus block w-full text-center text-sm text-gray-600 transition-colors hover:text-gray-700"
            >
              Back to login
            </Link>
          </div>
        </div>
      </form>
    </div>,
  );
}
