// ---------------------------------------------------------------------------
// /api/products/[id] — PATCH update + DELETE remove (ownership-checked).
// ---------------------------------------------------------------------------

import { makeItemRoutes } from "@/lib/server/http";
import { productDelegate } from "@/lib/server/entities";

export const { PATCH, DELETE } = makeItemRoutes(productDelegate);
