// ---------------------------------------------------------------------------
// /api/reports/summary?days=N — the Reports aggregation: period stats, the
// daily series, the payment-method breakdown (N validated against the
// REPORT_PERIODS set; default 30).
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { withUser } from "@/lib/server/http";
import { recentSales } from "@/lib/server/pos";
import {
  buildDailySeries,
  buildMethodBreakdown,
  buildPeriodStats,
  isReportPeriod,
} from "@/lib/reports";

export const GET = withUser(async (user, request: NextRequest) => {
  const raw = request.nextUrl.searchParams.get("days") ?? "30";
  const days = isReportPeriod(raw) ? Number(raw) : 30;
  const sales = await recentSales(user.id, days);
  return NextResponse.json({
    days,
    stats: buildPeriodStats(sales),
    daily: buildDailySeries(sales, days),
    methods: buildMethodBreakdown(sales),
  });
});
