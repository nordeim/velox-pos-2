// ---------------------------------------------------------------------------
// The reference's 404 surface (Session-12, measured live 2026-10-27):
// SPANISH copy, dark, no sidebar — a plain white "404" span, the
// slate-800/slate-500 text family ("Página no encontrada" / "La página que
// buscas no existe o fue movida."), the glass-card at rounded-3xl p-12, and
// the violet gradient "Ir al Terminal" action back into the app carrying a
// leading lucide ArrowLeft icon. The wrapper's pos-gradient-subtle computes
// a SOLID rgb(8,10,20) background — exactly the clone's --color-ink token.
//
// Session-12 (F-82): the reference AUTH-GATES unknown routes — a logged-out
// visitor is redirected to /login before any 404 HTML ships (mirroring the
// (app) layout's own server gate).
// ---------------------------------------------------------------------------

import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/server/auth";

export const metadata: Metadata = {
  title: "Página no encontrada | VeloxPOS (Point Of Sale)",
};

export default async function NotFound() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink p-6">
      <div className="glass-card max-w-md rounded-3xl p-12 text-center">
        <span className="text-3xl font-bold text-white">404</span>
        <h1 className="mb-2 text-2xl font-bold text-slate-800">Página no encontrada</h1>
        <p className="mb-8 text-slate-500">La página que buscas no existe o fue movida.</p>
        <Link
          href="/POS"
          className="glass-button-primary vpx-focus inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Ir al Terminal
        </Link>
      </div>
    </main>
  );
}
