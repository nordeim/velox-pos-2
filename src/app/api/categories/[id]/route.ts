// ---------------------------------------------------------------------------
// /api/categories/[id] — PATCH update + DELETE remove.
// ---------------------------------------------------------------------------

import { makeItemRoutes } from "@/lib/server/http";
import { categoryDelegate } from "@/lib/server/entities";

export const { PATCH, DELETE } = makeItemRoutes(categoryDelegate);
