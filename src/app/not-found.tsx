// ---------------------------------------------------------------------------
// The measured not-found surface (plan F11): a centered dark card with the
// violet-gradient 404 badge, "Página no encontrada" (the reference's own
// copy), and the "Ir al Terminal" primary action.
// ---------------------------------------------------------------------------

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="vx-canvas flex min-h-dvh items-center justify-center p-4">
      <div className="vx-card flex w-full max-w-md flex-col items-center gap-5 px-8 py-12 text-center">
        <span
          aria-hidden
          className="vx-gradient vx-glow flex h-24 w-24 items-center justify-center rounded-3xl text-3xl font-extrabold text-white"
        >
          404
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-white">Página no encontrada</h1>
          <p className="mx-auto max-w-xs text-sm text-slate-400">
            La página que buscas no existe o fue movida.
          </p>
        </div>
        <Link
          href="/"
          className="vx-gradient vx-gradient-hover vx-glow vx-focusable flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white outline-none"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Ir al Terminal
        </Link>
      </div>
    </main>
  );
}
