// ---------------------------------------------------------------------------
// /api/dashboard/summary — the Dashboard's single fetch: today's stats, the
// 7-day series, product/low-stock counts, the category distribution, and
// the open shifts (the Terminal gate).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { withUser } from "@/lib/server/http";
import { dashboardSummary } from "@/lib/server/pos";
import {
  buildCategoryCounts,
  buildDailySeries,
  buildTodayStats,
  isLowStock,
  type ProductRow,
} from "@/lib/reports";

export const GET = withUser(async (user) => {
  const summary = await dashboardSummary(user.id);
  const [categories, activeProducts] = await Promise.all([
    db.category.findMany({ where: { userId: user.id } }),
    db.product.findMany({ where: { userId: user.id, active: true } }),
  ]);
  const lowStock = activeProducts
    .filter(isLowStock)
    .slice(0, 8)
    .map((p) => ({ id: p.id, name: p.name, stock: p.stock, minStock: p.minStock }));
  const rows: ProductRow[] = activeProducts.map((p) => ({
    id: p.id,
    name: p.name,
    stock: p.stock,
    minStock: p.minStock,
    active: p.active,
    categoryId: p.categoryId,
  }));
  return NextResponse.json({
    today: buildTodayStats(summary.sales),
    series: buildDailySeries(summary.sales, 7),
    productCount: summary.productCount,
    lowStockCount: summary.lowStockCount,
    openShifts: summary.openShifts,
    categoryCounts: buildCategoryCounts(
      rows,
      categories.map((c) => ({ id: c.id, name: c.name })),
    ),
    lowStock,
  });
});
