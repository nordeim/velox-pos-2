import { TerminalPage } from "@/components/pos/pages";

// Session-10 (F-60): the reference serves the terminal at the ROOT path —
// its post-login landing is `/` (measured live 2026-10-27: the login flow
// lands on "/" and renders "No active shift" + CART). The /POS route stays
// canonical (the reference's own nav href for Terminal IS /POS); this page
// is the root-path spelling of the same view (the (app) layout's server
// gate covers both).
export const metadata = { title: "Terminal | VeloxPOS (Point Of Sale)" };

export default function Page() {
  return <TerminalPage />;
}
