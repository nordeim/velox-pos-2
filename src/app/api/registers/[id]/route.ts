// ---------------------------------------------------------------------------
// /api/registers/[id] — PATCH update + DELETE remove (ownership-checked).
// ---------------------------------------------------------------------------

import { makeItemRoutes } from "@/lib/server/http";
import { registerDelegate } from "@/lib/server/entities";

export const { PATCH, DELETE } = makeItemRoutes(registerDelegate);
