// ---------------------------------------------------------------------------
// /api/products — ownership-scoped CRUD collection (GET list + POST create).
// ---------------------------------------------------------------------------

import { makeCollectionRoutes } from "@/lib/server/http";
import { productDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(productDelegate);
