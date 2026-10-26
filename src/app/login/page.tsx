"use client";

import * as React from "react";
import { Zap } from "lucide-react";

// The measured auth surface (sub-screens swap client-side — see
// src/components/auth/login-surface.tsx). useSearchParams requires a
// Suspense boundary during static prerender; the fallback renders the
// brand shell so the prerendered HTML is never empty.
import { LoginSurface } from "@/components/auth/login-surface";

function AuthFallback() {
  return (
    <main className="vx-canvas flex min-h-dvh items-center justify-center p-4">
      <div className="vx-card flex w-full max-w-md flex-col items-center p-8">
        <span
          aria-hidden
          className="vx-gradient flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl text-white"
        >
          <Zap className="h-6 w-6" strokeWidth={2} fill="currentColor" />
        </span>
      </div>
    </main>
  );
}

export default function AuthRoutePage() {
  return (
    <React.Suspense fallback={<AuthFallback />}>
      <LoginSurface />
    </React.Suspense>
  );
}
