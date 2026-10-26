// ---------------------------------------------------------------------------
// The (app) route group's SERVER gate: the guest never receives app HTML.
// The server redirect sends the guest to /login; the login page falls back to
// /POS when no from_url is present (the client shell also classifies 401s and
// re-enters login with the precise from_url — the documented shim pattern).
// ---------------------------------------------------------------------------

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/server/auth";
import { AppShell } from "@/components/pos/app-shell";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return <AppShell>{children}</AppShell>;
}
