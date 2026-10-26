// ---------------------------------------------------------------------------
// /api/registers — ownership-scoped CRUD collection.
// ---------------------------------------------------------------------------

import { makeCollectionRoutes } from "@/lib/server/http";
import { registerDelegate } from "@/lib/server/entities";

export const { GET, POST } = makeCollectionRoutes(registerDelegate);
