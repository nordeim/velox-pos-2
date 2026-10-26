// ---------------------------------------------------------------------------
// /api/cashiers/[id] — PATCH update + DELETE deactivate (owner-only).
// ---------------------------------------------------------------------------

import { makeItemRoutes } from "@/lib/server/http";
import { cashierDelegate } from "@/lib/server/entities";

export const { PATCH, DELETE } = makeItemRoutes(cashierDelegate);
