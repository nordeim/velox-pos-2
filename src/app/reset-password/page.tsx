"use client";

// ---------------------------------------------------------------------------
// /reset-password?token=… — the reset link's landing (3-state forgot flow).
// Self-hosted, no SMTP: the token arrives through the surface the actor
// controls (the login screen shows the prepared link — ADR-013 contract).
// ---------------------------------------------------------------------------

import * as React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

import { apiPost, ApiError } from "@/lib/api";

function ResetForm() {
  const [token, setToken] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    // Hydration-safe token pickup: the prerendered HTML keeps the field
    // editable; the URL value lands in a microtask (never a sync setState).
    let cancelled = false;
    void Promise.resolve().then(() => {
      try {
        const fromUrl = new URLSearchParams(window.location.search).get("token");
        if (fromUrl && !cancelled) setToken(fromUrl);
      } catch {
        // no location (prerender) — the field stays editable
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await apiPost("/api/auth/reset-password", { token, password });
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "The reset failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="vx-canvas flex min-h-dvh items-center justify-center p-4">
      <div className="vx-card w-full max-w-md p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span
            aria-hidden
            className="vx-gradient vx-glow flex h-12 w-12 items-center justify-center rounded-2xl text-white"
          >
            <Zap className="h-6 w-6" strokeWidth={2} fill="currentColor" />
          </span>
          <h1 className="text-2xl font-bold text-white">Reset your password</h1>
        </div>
        {done ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-slate-300" role="status">
              Password updated. You can sign in with the new password now.
            </p>
            <Link
              href="/login"
              className="vx-gradient vx-glow vx-focusable flex h-11 items-center justify-center rounded-xl px-6 text-sm font-semibold text-white outline-none"
            >
              Go to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4" data-testid="reset-form">
            <label className="flex flex-col gap-1.5 text-sm text-slate-300">
              Reset token
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="vx-input font-mono text-xs"
                data-testid="reset-token"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-slate-300">
              New password
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="vx-input"
                data-testid="reset-password"
              />
              <span className="text-xs text-slate-500">At least 8 characters.</span>
            </label>
            {error && (
              <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="vx-gradient vx-gradient-hover vx-glow vx-focusable flex h-11 items-center justify-center rounded-xl text-sm font-semibold text-white outline-none transition-colors disabled:opacity-60"
            >
              {busy ? "Updating…" : "Update password"}
            </button>
            <Link
              href="/login"
              className="vx-focusable self-center rounded text-sm text-slate-400 outline-none transition-colors hover:text-violet-300"
            >
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return <ResetForm />;
}
