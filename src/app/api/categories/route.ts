// ---------------------------------------------------------------------------
// /api/categories — ownership-scoped CRUD (GET list + POST create).
// ---------------------------------------------------------------------------

import { makeCollectionRoutes } from "@/lib/server/http";
import { categoryDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(categoryDelegate);
