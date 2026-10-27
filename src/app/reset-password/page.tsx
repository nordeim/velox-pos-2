import { ResetPasswordSurface } from "@/components/pos/reset-password-surface";

export const metadata = { title: "Reset password | VeloxPOS (Point Of Sale)" };

// Session-13 (F-93): the token arrives from the server-rendered searchParams
// — the surface's three states (dead-end / form / done) resolve BEFORE
// hydration, so a token-ful URL never flashes the dead-end first (the old
// client-side URL read SSR'd "" and flipped on mount). Reading searchParams
// makes the page dynamic; the route renders `ƒ /reset-password` (Dynamic).
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <ResetPasswordSurface token={token ?? ""} />;
}
