// ---------------------------------------------------------------------------
// The reference's 404 surface — SPANISH copy, dark, no sidebar:
// "404 / Página no encontrada / La página que buscas no existe o fue movida."
// and the violet gradient "← Ir al Terminal" action back into the app.
// ---------------------------------------------------------------------------

import Link from "next/link";

export const metadata = { title: "Página no encontrada | VeloxPOS (Point Of Sale)" };

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink p-4">
      <div className="glass-card w-full max-w-md rounded-2xl p-10 text-center">
        <div className="brand-chip mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-2xl text-2xl font-black text-white">
          404
        </div>
        <h1 className="mt-6 text-2xl font-bold text-white/60">Página no encontrada</h1>
        <p className="mt-3 text-white/50">
          La página que buscas no existe o fue movida.
        </p>
        <Link
          href="/POS"
          className="glass-button-primary vpx-focus mt-7 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold"
        >
          <span aria-hidden="true">←</span> Ir al Terminal
        </Link>
      </div>
    </main>
  );
}
