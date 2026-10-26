"use client";

// ---------------------------------------------------------------------------
// /reset-password?token=… — the one-shot reset surface (the forgot-password
// route returns the resetUrl; in this single-box deployment the UI surfaces
// it as a notice on the login screen). New password + confirmation →
// /api/auth/reset-password → back to /login.
// ---------------------------------------------------------------------------

import * as React from "react";
import Link from "next/link";
import { Lock, Zap } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** The token lives in the URL — read it as an external store snapshot so the
 *  server snapshot is "" and the client hydrates without an effect-setState. */
function useTokenFromUrl(): [string, (v: string) => void] {
  const subscribe = React.useCallback(() => () => undefined, []);
  const server = React.useCallback(() => "", []);
  const client = React.useCallback(
    () => new URLSearchParams(window.location.search).get("token") ?? "",
    [],
  );
  const urlToken = React.useSyncExternalStore(subscribe, client, server);
  const [override, setOverride] = React.useState<string | null>(null);
  const token = override ?? urlToken;
  return [token, setOverride];
}

export function ResetPasswordSurface() {
  const [token, setToken] = useTokenFromUrl();
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  // Same hydration gate as the login surface (see the timer-callback note
  // there): ships disabled, unlocks a tick after mount.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    try {
      setToken(new URLSearchParams(window.location.search).get("token") ?? "");
    } catch {
      setToken("");
    }
  }, []);

  const submit = async (): Promise<void> => {
    if (password !== confirm) {
      setError("The passwords do not match.");
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

  return (
    <main className="login-canvas theme-light flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white px-8 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#1e1b3a]">
            <Zap className="h-9 w-9 text-white" strokeWidth={1.8} aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">Set a new password</h1>
          <p className="mt-2 text-slate-500">Choose a strong password for your account.</p>
        </div>
        {done ? (
          <div className="mt-8 space-y-4 text-center">
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Your password has been updated. Sign in with the new password.
            </p>
            <Link
              href="/login"
              className="vpx-focus inline-block w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }} className="mt-8 space-y-5" noValidate>
            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="rp-token" className="text-slate-700">
                Reset token
              </Label>
              <Input
                id="rp-token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rp-password" className="text-slate-700">
                New password
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <Input
                  id="rp-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rp-confirm" className="text-slate-700">
                Confirm password
              </Label>
              <Input
                id="rp-confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={busy || !mounted}
              className="vpx-focus w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {busy ? "Saving…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
