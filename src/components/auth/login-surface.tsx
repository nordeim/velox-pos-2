"use client";

// ---------------------------------------------------------------------------
// The VeloxPOS auth surface — the reference's hosted login layout (plan F21):
// "Welcome to VeloxPOS (Point Of Sale)" / "Sign in to continue", the four
// social buttons, email+password, Forgot password?, Sign up. The sub-screens
// (login / register / verify / forgot) swap client-side.
//
// The social buttons render for visual parity; their activation surfaces an
// honest notice instead of pretending to authenticate (no fake UI) — SSO is
// not part of the self-hosted build.
// ---------------------------------------------------------------------------

import * as React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

import { apiPost, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

type Screen = "login" | "register" | "verify" | "forgot";

const SOCIAL_PROVIDERS = ["Google", "Microsoft", "Facebook", "Apple"] as const;

function fieldErrors(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return err instanceof Error ? err.message : "Something went wrong. Please try again.";
}

export function LoginSurface() {
  const [screen, setScreen] = React.useState<Screen>("login");
  const [busy, setBusy] = React.useState(false);
  const [notice, setNotice] = React.useState<{ kind: "error" | "info"; text: string } | null>(null);
  const [resetLink, setResetLink] = React.useState<string | null>(null);
  const { toast } = useToast();

  // login
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  // register / verify
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");

  const switchScreen = (next: Screen) => {
    setScreen(next);
    setNotice(null);
  };

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      await apiPost("/api/auth/login", { email, password });
      window.location.replace("/");
      return;
    } catch (err: unknown) {
      setNotice({ kind: "error", text: fieldErrors(err) });
      setBusy(false);
    }
  };

  const register = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const result = await apiPost<{ ok: boolean; code?: string }>("/api/auth/register", {
        name,
        email,
        password,
      });
      // No SMTP in the self-hosted context: the verification code surfaces
      // to the actor directly (the register route's documented delivery).
      setCode(result.code ?? "");
      setNotice({
        kind: "info",
        text: result.code
          ? `Account created. Your verification code is ${result.code} (no email is configured on this deployment).`
          : "Account created. Check your email for the verification code.",
      });
      setScreen("verify");
    } catch (err: unknown) {
      setNotice({ kind: "error", text: fieldErrors(err) });
    } finally {
      setBusy(false);
    }
  };

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      await apiPost("/api/auth/verify-email", { email, code });
      setNotice({ kind: "info", text: "Email verified. You can sign in now." });
      setScreen("login");
    } catch (err: unknown) {
      setNotice({ kind: "error", text: fieldErrors(err) });
    } finally {
      setBusy(false);
    }
  };

  const forgot = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const result = await apiPost<{ ok: boolean; resetPath?: string }>(
        "/api/auth/forgot-password",
        { email },
      );
      if (result.resetPath) {
        setResetLink(result.resetPath);
        setNotice({
          kind: "info",
          text: "Reset link ready (no email is configured on this deployment):",
        });
      } else {
        setNotice({ kind: "info", text: "If that account exists, a reset link was created." });
      }
    } catch (err: unknown) {
      setNotice({ kind: "error", text: fieldErrors(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="vx-canvas flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="vx-card p-8">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <span
              aria-hidden
              className="vx-gradient vx-glow flex h-12 w-12 items-center justify-center rounded-2xl text-white"
            >
              <Zap className="h-6 w-6" strokeWidth={2} fill="currentColor" />
            </span>
            <h1 className="text-2xl font-bold text-white">
              Welcome to VeloxPOS (Point Of Sale)
            </h1>
            <p className="text-sm text-slate-400">
              {screen === "register"
                ? "Create your store account"
                : screen === "verify"
                  ? "Enter the verification code"
                  : screen === "forgot"
                    ? "We will prepare a reset link"
                    : "Sign in to continue"}
            </p>
          </div>

          {notice && (
            <div
              role={notice.kind === "error" ? "alert" : "status"}
              className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
                notice.kind === "error"
                  ? "border-red-500/40 bg-red-500/10 text-red-400"
                  : "border-violet-500/40 bg-violet-500/10 text-violet-300"
              }`}
              data-testid="auth-notice"
            >
              {notice.kind === "error" ? (
                notice.text
              ) : (
                <>
                  {notice.text}{" "}
                  {screen === "forgot" && resetLink && (
                    <Link href={resetLink} className="underline underline-offset-2">
                      Open reset link
                    </Link>
                  )}
                </>
              )}
            </div>
          )}

          {screen === "login" && (
            <form onSubmit={signIn} className="flex flex-col gap-4" data-testid="login-form">
              <div className="flex flex-col gap-3">
                {SOCIAL_PROVIDERS.map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    onClick={() =>
                      toast.info(
                        `${provider} single sign-on is not configured on this deployment.`,
                      )
                    }
                    className="vx-focusable flex h-10 items-center justify-center rounded-lg border border-vx-border bg-vx-elevated text-sm font-medium text-slate-200 outline-none transition-colors hover:bg-white/5"
                  >
                    Continue with {provider}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="h-px flex-1 bg-vx-border" />
                or
                <span className="h-px flex-1 bg-vx-border" />
              </div>
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Email
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="vx-input"
                  data-testid="login-email"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Password
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="vx-input"
                  data-testid="login-password"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="vx-gradient vx-gradient-hover vx-glow vx-focusable flex h-11 items-center justify-center rounded-xl text-sm font-semibold text-white outline-none transition-colors disabled:opacity-60"
                data-testid="login-submit"
              >
                {busy ? "Signing in…" : "Sign in"}
              </button>
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => switchScreen("forgot")}
                  className="vx-focusable rounded text-slate-400 outline-none transition-colors hover:text-violet-300"
                >
                  Forgot password?
                </button>
                <button
                  type="button"
                  onClick={() => switchScreen("register")}
                  className="vx-focusable rounded font-medium text-violet-300 outline-none transition-colors hover:text-violet-200"
                  data-testid="to-register"
                >
                  Need an account? Sign up
                </button>
              </div>
            </form>
          )}

          {screen === "register" && (
            <form onSubmit={register} className="flex flex-col gap-4" data-testid="register-form">
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Name
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="vx-input"
                  data-testid="register-name"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Email
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="vx-input"
                  data-testid="register-email"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Password
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="vx-input"
                  data-testid="register-password"
                />
                <span className="text-xs text-slate-500">At least 8 characters.</span>
              </label>
              <button
                type="submit"
                disabled={busy}
                className="vx-gradient vx-gradient-hover vx-glow vx-focusable flex h-11 items-center justify-center rounded-xl text-sm font-semibold text-white outline-none transition-colors disabled:opacity-60"
              >
                {busy ? "Creating account…" : "Create account"}
              </button>
              <button
                type="button"
                onClick={() => switchScreen("login")}
                className="vx-focusable self-center rounded text-sm text-slate-400 outline-none transition-colors hover:text-violet-300"
              >
                Already have an account? Sign in
              </button>
            </form>
          )}

          {screen === "verify" && (
            <form onSubmit={verify} className="flex flex-col gap-4" data-testid="verify-form">
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Verification code
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="vx-input text-center text-lg tracking-[0.3em]"
                  data-testid="verify-code"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="vx-gradient vx-gradient-hover vx-glow vx-focusable flex h-11 items-center justify-center rounded-xl text-sm font-semibold text-white outline-none transition-colors disabled:opacity-60"
              >
                {busy ? "Verifying…" : "Verify email"}
              </button>
              <button
                type="button"
                onClick={() => switchScreen("login")}
                className="vx-focusable self-center rounded text-sm text-slate-400 outline-none transition-colors hover:text-violet-300"
              >
                Back to sign in
              </button>
            </form>
          )}

          {screen === "forgot" && (
            <form onSubmit={forgot} className="flex flex-col gap-4" data-testid="forgot-form">
              <label className="flex flex-col gap-1.5 text-sm text-slate-300">
                Email
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="vx-input"
                  data-testid="forgot-email"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="vx-gradient vx-gradient-hover vx-glow vx-focusable flex h-11 items-center justify-center rounded-xl text-sm font-semibold text-white outline-none transition-colors disabled:opacity-60"
              >
                {busy ? "Preparing…" : "Send reset link"}
              </button>
              <button
                type="button"
                onClick={() => switchScreen("login")}
                className="vx-focusable self-center rounded text-sm text-slate-400 outline-none transition-colors hover:text-violet-300"
              >
                Back to sign in
              </button>
            </form>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          VeloxPOS — your store, your data. Self-hosted point of sale.
        </p>
      </div>
    </main>
  );
}
