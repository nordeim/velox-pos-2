"use client";

// ---------------------------------------------------------------------------
// /login — the reference's measured surface (Session-12 re-measured live
// 2026-10-27 at the content-block depth): a LIGHT card on a light canvas —
// one `flex flex-col items-center text-center space-y-6 sm:space-y-8` body
// whose sign-in view stacks the halo+ring logo group, the responsive
// h1/sub block, and a w-full block (the four display-only SSO buttons —
// Google/Microsoft/Facebook/Apple SSO is not part of the base44 shell the
// clone replaces — the knockout OR divider, the form with its IN-CARD
// justify-between links row). The forgot and sign-up views SWAP the whole
// body for the measured subview contract (back-first, h2, 44px fields).
// Errors and notices render through the Alert primitive (F-76's panel).
// ---------------------------------------------------------------------------

import * as React from "react";
import { Apple, ArrowLeft, Facebook, Lock, Mail } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SSO_PROVIDERS = [
  // Session-12 (F-85i, measured): the reference's SSO family — px-5 py-3.5
  // bordered white buttons at text-[16px] with transition-all duration-200;
  // only Google's icon wrapper carries the -ml-4 optical-centering quirk.
  {
    id: "google",
    label: "Continue with Google",
    icon: <GoogleMark />,
    iconWrap: "-ml-4",
  },
  {
    id: "microsoft",
    label: "Continue with Microsoft",
    icon: <MicrosoftMark />,
    iconWrap: "",
  },
  {
    id: "facebook",
    label: "Continue with Facebook",
    icon: <Facebook className="h-4 w-4 text-[#1877f2]" aria-hidden="true" />,
    iconWrap: "",
  },
  {
    id: "apple",
    label: "Continue with Apple",
    icon: <Apple className="h-4 w-4 text-black" aria-hidden="true" />,
    iconWrap: "",
  },
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

/** The subviews' shared field wrapper: label at 6px from its input. */
function Field({
  id,
  label,
  icon,
  inputProps,
  inputClassName,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  inputClassName: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-slate-700">
        {label}
      </Label>
      <div className="relative">
        {icon}
        <Input id={id} className={inputClassName} {...inputProps} />
      </div>
    </div>
  );
}

const MailIcon = (
  <Mail
    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
    aria-hidden="true"
  />
);
const LockIcon = (
  <Lock
    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
    aria-hidden="true"
  />
);

export function LoginSurface() {
  const [view, setView] = React.useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
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
      // Session-10 (F-60, measured live): the reference lands on `/` after
      // login (the terminal at the root path) — `/` is the landing default,
      // not /POS. Both render the terminal (router.ts maps / → terminal);
      // the reference's URL is the contract.
      return from && from.startsWith("/") ? from : "/";
    } catch {
      return "/";
    }
  };

  const switchView = (next: "signin" | "signup" | "forgot"): void => {
    setView(next);
    setError(null);
    setNotice(null);
  };

  const submit = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      // Session-12 (F-78): the reference's sign-up carries a Confirm
      // Password field; the equality check runs CLIENT-SIDE before any
      // fetch (the mismatch path never reaches the API).
      if (view === "signup" && password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
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
        // Session-12 (F-78, measured): the reference's sign-up collects NO
        // full name — just email + password (+ confirm, client-side). The
        // register API's optional fullName is simply not sent.
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        const body = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(body.error ?? "Could not create the account.");
          return;
        }
        // Registration signs the new owner in (the scaffolding's contract).
        // Session-10 (F-60): the reference's landing — `/`.
        window.location.assign("/");
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

  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    void submit();
  };

  // Session-12 (F-84): the reference's sign-in busy copy is "Signing in..."
  // (observed live mid-submit); the signup/forgot busy copy is unmeasured
  // (the reference's writes are restricted) — the clone's stays.
  const busyLabel = view === "signin" ? "Signing in…" : "Please wait…";
  const submitLabel =
    view === "signup" ? "Create account" : view === "forgot" ? "Send reset link" : "Sign in";

  const stateBlock = (
    <>
      {error && <Alert tone="error">{error}</Alert>}
      {notice && (
        <Alert tone="success" role="status">
          {notice}
        </Alert>
      )}
    </>
  );

  return (
    <main className="login-canvas theme-light flex min-h-dvh items-center justify-center p-4">
      {/* Session-5 (measured live): the reference's card — bg-white/95 +
          backdrop-blur + shadow-2xl + overflow-hidden + a 4px top gradient
          strip, with the content padding on an inner wrapper
          (p-8 sm:p-10 md:pt-12 md:pb-10 md:px-10). Session-10 (F-59): the
          reference's class is v3-era `backdrop-blur-sm` = blur(4px); v4
          RENAMED the scale (trap #8) — the 4px spelling here is
          `backdrop-blur-xs` (v4's blur-sm would double it to 8px). */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-0 bg-white/95 shadow-2xl backdrop-blur-xs">
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200"
        />
        <div className="p-8 sm:p-10 md:px-10 md:pb-10 md:pt-12">
          {/* Session-12 (F-85, measured live): the body is ONE centered
              flex column — space-y-6 sm:space-y-8 — not the old flat
              margin chain. Each view swaps its own children. */}
          <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
            {view === "signin" ? (
              <>
                {/* The logo group (F-85a): a blur(24px) slate halo behind a
                    rounded-full span with ring-4 ring-white/50 + shadow-lg
                    wrapping the 96px hexagonal crystal img (80px at <sm). */}
                <div className="relative group">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 opacity-30 blur-xl transition-opacity duration-300 group-hover:opacity-40"
                  />
                  <span className="relative flex h-20 w-20 shrink-0 overflow-hidden rounded-full shadow-lg ring-4 ring-white/50 transition-all duration-300 group-hover:shadow-xl sm:h-24 sm:w-24">
                    <img
                      src="/veloxpos-logo.png"
                      alt="VeloxPOS (Point Of Sale) logo"
                      width={96}
                      height={96}
                      className="aspect-square h-full w-full object-cover"
                    />
                  </span>
                </div>
                {/* The h1 block (F-85b/c): responsive scale + tracking-tight;
                    the sub is font-medium at text-sm sm:text-base. */}
                <div className="space-y-2 sm:space-y-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Welcome to VeloxPOS (Point Of Sale)
                  </h1>
                  <p className="text-sm font-medium text-slate-500 sm:text-base">
                    Sign in to continue
                  </p>
                </div>
                <div className="w-full">
                  <div className="space-y-3" aria-label="Single sign-on options">
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
                        className="vpx-focus flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 font-medium text-[16px] text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                      >
                        <div className={`transition-transform duration-200 ${p.iconWrap}`}>
                          {p.icon}
                        </div>
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                  {/* The OR divider (F-85f): a CONTINUOUS absolute 1px line
                      with a bg-white px-3 knockout rendering uppercase
                      "or" — tracking-wider, slate-500. */}
                  <div className="relative my-6" aria-hidden="true">
                    <div className="absolute inset-0 flex items-center">
                      <div className="h-[1px] w-full shrink-0 bg-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      {/* Session-12 (the F-59 trap family): v3's tracking-wider
                          is 0.1em; v4 RESCALED it to 0.05em — the reference's
                          computed 0.1em needs the arbitrary-value spelling. */}
                      <span className="bg-white px-3 font-medium tracking-[0.1em] text-slate-500">
                        or
                      </span>
                    </div>
                  </div>
                  <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5" noValidate>
                    {stateBlock}
                    <div className="space-y-3 sm:space-y-4">
                      <Field
                        id="login-email"
                        label="Email"
                        icon={MailIcon}
                        inputClassName="h-11 border-slate-200 bg-slate-50/50 pl-10 placeholder:text-slate-600 focus:border-slate-400 focus:ring-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:h-12"
                        inputProps={{
                          type: "email",
                          autoComplete: "email",
                          required: true,
                          value: email,
                          onChange: (e) => setEmail(e.target.value),
                          placeholder: "you@example.com",
                        }}
                      />
                      <Field
                        id="login-password"
                        label="Password"
                        icon={LockIcon}
                        inputClassName="h-11 border-slate-200 bg-slate-50/50 pl-10 placeholder:text-slate-600 focus:border-slate-400 focus:ring-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:h-12"
                        inputProps={{
                          type: "password",
                          autoComplete: "current-password",
                          required: true,
                          value: password,
                          onChange: (e) => setPassword(e.target.value),
                          placeholder: "••••••••",
                        }}
                      />
                    </div>
                    <div className="space-y-3">
                      <button
                        type="submit"
                        disabled={busy || !mounted}
                        data-testid="login-submit"
                        className="vpx-focus h-11 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-slate-800 disabled:opacity-60 sm:h-12"
                      >
                        {busy ? busyLabel : submitLabel}
                      </button>
                      {/* The links row (F-85h + F-83 + F-80, measured): it
                          lives INSIDE the form — justify-between at sm+
                          (Forgot left, signup right), stacked/centered
                          below. The "Sign up" phrase is a slate-700
                          font-medium span; the "Forgot password?" link is
                          14px/500 with NO underline. */}
                      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row sm:gap-0">
                        <button
                          type="button"
                          onClick={() => switchView("forgot")}
                          className="vpx-focus text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
                        >
                          Forgot password?
                        </button>
                        <button
                          type="button"
                          onClick={() => switchView("signup")}
                          className="vpx-focus text-sm text-slate-500 transition-colors hover:text-slate-700"
                        >
                          Need an account?{" "}
                          <span className="font-medium text-slate-700">Sign up</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div className="w-full">
                <div className="space-y-4 sm:space-y-6">
                  {/* The subview back link (F-77/F-78, measured): first
                      child, ArrowLeft icon, slate-500/500, -mb-2. */}
                  <button
                    type="button"
                    onClick={() => switchView("signin")}
                    className="vpx-focus -mb-2 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to sign in
                  </button>
                  {view === "forgot" ? (
                    <div className="space-y-2 text-center">
                      <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                        Reset your password
                      </h2>
                      <p className="text-sm text-slate-600 sm:text-base">
                        Enter your email and we&apos;ll send you a link to reset your password
                      </p>
                    </div>
                  ) : (
                    <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                      Create your account
                    </h2>
                  )}
                  {view === "forgot" ? (
                    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5" noValidate>
                      {stateBlock}
                      <Field
                        id="login-email"
                        label="Email"
                        icon={MailIcon}
                        inputClassName="h-10 border-slate-200 bg-slate-50/50 pl-10 placeholder:text-slate-400 focus:border-slate-400 focus:ring-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:h-11"
                        inputProps={{
                          type: "email",
                          autoComplete: "email",
                          required: true,
                          value: email,
                          onChange: (e) => setEmail(e.target.value),
                          placeholder: "you@example.com",
                        }}
                      />
                      <button
                        type="submit"
                        disabled={busy || !mounted}
                        data-testid="login-submit"
                        className="vpx-focus h-10 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-slate-800 disabled:opacity-60 sm:h-11"
                      >
                        {busy ? busyLabel : submitLabel}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4" noValidate>
                      {stateBlock}
                      <div className="space-y-3">
                        <Field
                          id="login-email"
                          label="Email"
                          icon={MailIcon}
                          inputClassName="h-10 border-slate-200 bg-slate-50/50 pl-10 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:ring-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:h-11 sm:text-base"
                          inputProps={{
                            type: "email",
                            autoComplete: "email",
                            required: true,
                            value: email,
                            onChange: (e) => setEmail(e.target.value),
                            placeholder: "you@example.com",
                          }}
                        />
                        <Field
                          id="login-password"
                          label="Password"
                          icon={LockIcon}
                          inputClassName="h-10 border-slate-200 bg-slate-50/50 pl-10 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:ring-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:h-11 sm:text-base"
                          inputProps={{
                            type: "password",
                            autoComplete: "new-password",
                            required: true,
                            value: password,
                            onChange: (e) => setPassword(e.target.value),
                            placeholder: "••••••••",
                          }}
                        />
                        <Field
                          id="login-confirm"
                          label="Confirm Password"
                          icon={LockIcon}
                          inputClassName="h-10 border-slate-200 bg-slate-50/50 pl-10 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:ring-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:h-11 sm:text-base"
                          inputProps={{
                            type: "password",
                            autoComplete: "new-password",
                            required: true,
                            value: confirmPassword,
                            onChange: (e) => setConfirmPassword(e.target.value),
                            placeholder: "Re-enter password",
                          }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={busy || !mounted}
                        data-testid="login-submit"
                        className="vpx-focus h-10 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-slate-800 disabled:opacity-60 sm:h-11"
                      >
                        {busy ? busyLabel : submitLabel}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
