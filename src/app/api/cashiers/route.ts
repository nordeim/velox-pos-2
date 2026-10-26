// ---------------------------------------------------------------------------
// /api/cashiers — the store roster (owner-only): list + create cashiers.
// ---------------------------------------------------------------------------

import { makeCollectionRoutes } from "@/lib/server/http";
import { cashierDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(cashierDelegate);
