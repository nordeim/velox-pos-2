// ---------------------------------------------------------------------------
// /api/products — ownership-scoped CRUD (GET list + POST create). Product
// payloads carry price/cost in dollars; the Zod moneyInput maps them to
// cents at the boundary.
// ---------------------------------------------------------------------------

import { makeCollectionRoutes } from "@/lib/server/http";
import { productDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(productDelegate);
