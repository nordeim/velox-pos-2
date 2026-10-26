"use client";

// ---------------------------------------------------------------------------
// /login — the reference's measured surface: a LIGHT card on a light canvas
// ("Welcome to VeloxPOS (Point Of Sale)" / "Sign in to continue"), the four
// SSO buttons (display-only — the clone documents that Google/Microsoft/
// Facebook/Apple SSO is not part of the base44 shell it replaces), the OR
// divider, Email + Password with leading icons, the navy "Sign in" button,
// "Forgot password?" and "Need an account? Sign up".
// ---------------------------------------------------------------------------

import * as React from "react";
import { Apple, Facebook, Lock, Mail, UserRound } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SSO_PROVIDERS = [
  { id: "google", label: "Continue with Google", icon: <GoogleMark /> },
  { id: "microsoft", label: "Continue with Microsoft", icon: <MicrosoftMark /> },
  { id: "facebook", label: "Continue with Facebook", icon: <Facebook className="h-4 w-4 text-[#1877f2]" aria-hidden="true" /> },
  { id: "apple", label: "Continue with Apple", icon: <Apple className="h-4 w-4 text-black" aria-hidden="true" /> },
] as const;

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.2-2.1 3.7-5.1 3.7-8.6z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.1 0-5.8-2.1-6.7-5H1.4v3C3.4 21.3 7.4 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4v-3H1.4C.5 8.2 0 10 0 12s.5 3.8 1.4 5.4l3.9-3z"
      />
      <path
        fill="#EA4335"
        d="M12 4.7c2.2 0 3.7.9 4.5 1.8l3.3-3.2C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.7 1.4 6.6l3.9 3c.9-2.9 3.6-4.9 6.7-4.9z"
      />
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" fill="#f25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7fba00" />
      <rect x="1" y="13" width="10" height="10" fill="#00a4ef" />
      <rect x="13" y="13" width="10" height="10" fill="#ffb900" />
    </svg>
  );
}

export function LoginSurface() {
  const [view, setView] = React.useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  // The form is inert until hydrated: a pre-hydration native submit would be
  // a full-page GET (the password would land in the URL). The button ships
  // disabled from the server (mounted=false renders disabled) and unlocks a
  // tick after mount — the setState runs in a TIMER CALLBACK, never
  // synchronously in the effect body (the react-hooks/set-state-in-effect
  // rule), and the server HTML always carries the disabled attribute.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const fromUrl = (): string => {
    try {
      const params = new URLSearchParams(window.location.search);
      const from = params.get("from_url");
      return from && from.startsWith("/") ? from : "/POS";
    } catch {
      return "/POS";
    }
  };

  const submit = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      if (view === "forgot") {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });
        const body = (await res.json()) as { error?: string; data?: unknown };
        if (!res.ok) {
          setError(body.error ?? "Could not start the reset.");
          return;
        }
        setNotice("If that email exists, a reset link is on its way. Check your inbox.");
        return;
      }
      if (view === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password, fullName: fullName.trim() }),
        });
        const body = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(body.error ?? "Could not create the account.");
          return;
        }
        // Registration signs the new owner in (the scaffolding's contract).
        window.location.assign("/POS");
        return;
      }
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "Sign in failed. Please try again.");
        return;
      }
      // Yield a tick before the navigation: the fetch response's Set-Cookie
      // is committed to the cookie jar by the network process — navigating in
      // the same task raced that commit in headless Chromium (observed live:
      // the /POS request left without the session cookie and the server gate
      // bounced straight back to /login). A macrotask boundary is enough.
      await new Promise((resolve) => setTimeout(resolve, 50));
      window.location.assign(fromUrl());
    } catch {
      setError("You appear to be offline. Reconnect and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login-canvas theme-light flex min-h-dvh items-center justify-center p-4">
      {/* Session-5 (measured live): the reference's card — bg-white/95 +
          backdrop-blur + shadow-2xl + overflow-hidden + a 4px top gradient
          strip, with the content padding on an inner wrapper
          (p-8 sm:p-10 md:pt-12 md:pb-10 md:px-10). */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-0 bg-white/95 shadow-2xl backdrop-blur-sm">
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200"
        />
        <div className="p-8 sm:p-10 md:px-10 md:pb-10 md:pt-12">
        <div className="flex flex-col items-center text-center">
          {/* The reference renders its logo image (96x96, the hexagonal
              crystal asset) — vendored at public/veloxpos-logo.png. */}
          <img
            src="/veloxpos-logo.png"
            alt="VeloxPOS (Point Of Sale) logo"
            width={96}
            height={96}
            className="h-24 w-24"
          />
          <h1 className="mt-5 text-3xl font-bold leading-tight text-slate-900">
            Welcome to VeloxPOS (Point Of Sale)
          </h1>
          <p className="mt-2 text-slate-500">Sign in to continue</p>
        </div>

        <div className="mt-8 space-y-3" aria-label="Single sign-on options">
          {SSO_PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              title="SSO is available on the hosted platform"
              onClick={() =>
                setError(
                  "Single sign-on is configured on the hosted platform. Use your email and password here.",
                )
              }
              className="vpx-focus flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:shadow"
            >
              {p.icon}
              {p.label}
            </button>
          ))}
        </div>

        <div className="my-7 flex items-center gap-4" aria-hidden="true">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium text-slate-400">OR</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }} className="space-y-5" noValidate>
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {notice}
            </p>
          )}
          {view === "signup" && (
            <div className="space-y-2 text-center">
              <Label htmlFor="login-name" className="block text-slate-700">
                Full name
              </Label>
              <div className="relative">
                <UserRound
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <Input
                  id="login-name"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="h-11 border-slate-200 bg-slate-50/50 pl-10 placeholder:text-slate-600 focus:border-slate-400 focus:ring-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:h-12"
                />
              </div>
            </div>
          )}
          <div className="space-y-2 text-center">
            <Label htmlFor="login-email" className="block text-slate-700">
              Email
            </Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 border-slate-200 bg-slate-50/50 pl-10 placeholder:text-slate-600 focus:border-slate-400 focus:ring-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:h-12"
              />
            </div>
          </div>
          {view !== "forgot" && (
            <div className="space-y-2 text-center">
              <Label htmlFor="login-password" className="block text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <Input
                  id="login-password"
                  type="password"
                  autoComplete={view === "signup" ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 border-slate-200 bg-slate-50/50 pl-10 placeholder:text-slate-600 focus:border-slate-400 focus:ring-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:h-12"
                />
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={busy || !mounted}
            data-testid="login-submit"
            className="vpx-focus w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
          >
            {busy
              ? "Please wait…"
              : view === "signup"
                ? "Create account"
                : view === "forgot"
                  ? "Send reset link"
                  : "Sign in"}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm">
          {view === "signin" ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setView("forgot");
                  setError(null);
                  setNotice(null);
                }}
                className="vpx-focus text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
              >
                Forgot password?
              </button>
              <p className="text-slate-500">
                {/* The reference makes the WHOLE phrase one slate-500 button
                    (text-sm font-medium, hover slate-700) — Session-4 parity. */}
                <button
                  type="button"
                  onClick={() => {
                    setView("signup");
                    setError(null);
                    setNotice(null);
                  }}
                  className="vpx-focus text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
                >
                  Need an account? Sign up
                </button>
              </p>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setView("signin");
                setError(null);
                setNotice(null);
              }}
              className="vpx-focus text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
            >
              Back to sign in
            </button>
          )}
        </div>
        </div>
      </div>
    </main>
  );
}
