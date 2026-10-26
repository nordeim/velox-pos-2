// ---------------------------------------------------------------------------
// /api/categories — ownership-scoped CRUD collection.
// ---------------------------------------------------------------------------

import { makeCollectionRoutes } from "@/lib/server/http";
import { categoryDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(categoryDelegate);
