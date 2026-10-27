// Session-14 (F-95..F-106, measured live on the reference 2026-10-27): the
// smooth-path seam. The reference's two charts (recharts, curveMonotoneX)
// render SMOOTH C-segment curves — the Dashboard's flat zero-data line
// measures `M65,245C95.833,245,126.667,245,157.5,245…` (control points at
// exactly 1/3 and 2/3 of each span, the tangent-family signature) — while
// the clone drew straight L segments. The pure seam that closes the gap:
// a monotone-X cubic Hermite (the Fritsch-Carlson tangent family, the
// d3 curveMonotoneX lineage): flat data reproduces the measured D shape,
// monotone data never overshoots its range, and the degenerate edges
// (0/1/2 points) stay render-safe.
import { describe, expect, it } from "vitest";

import { smoothPath } from "@/lib/chart-path";

describe("smoothPath (the chart curve seam — the reference's monotone family)", () => {
  it("renders a single point as a bare M command", () => {
    expect(smoothPath([{ x: 10, y: 20 }])).toBe("M10,20");
  });

  it("renders two flat points with on-segment controls (visually straight)", () => {
    const d = smoothPath([
      { x: 0, y: 100 },
      { x: 90, y: 100 },
    ]);
    expect(d).toBe("M0,100C30,100,60,100,90,100");
  });

  it("reproduces the reference's measured flat-line D shape (controls at 1/3 and 2/3 spans)", () => {
    // The measured reference D (7 flat points at y=245, span 92.5 from
    // x=65): `M65,245C95.833,245,126.667,245,157.5,245C…` — the controls
    // ride AT the data y with x at 1/3·2/3 of each span.
    const pts = Array.from({ length: 7 }, (_, i) => ({ x: 65 + i * 92.5, y: 245 }));
    const d = smoothPath(pts);
    expect(d.startsWith("M65,245C")).toBe(true);
    expect(d).not.toContain("L");
    // First segment: C 65+30.8333,245, 65+61.6667,245, 157.5,245.
    expect(d).toMatch(/^M65,245C95\.83+,245,126\.66+7?,245,157\.5,245/);
    // Six C segments for seven points.
    expect(d.match(/C/g)).toHaveLength(6);
  });

  it("zeroes the tangent at a local extremum (the monotone signature)", () => {
    // Peak at (1,10): both controls around the peak carry y=10 — the
    // curve flattens AT the measured point instead of overshooting it.
    // (Asserted numerically — the float repr of 10/3 ends in 5, so a
    // strict D-string regex would pin the serializer, not the property.)
    const d = smoothPath([
      { x: 0, y: 0 },
      { x: 1, y: 10 },
      { x: 2, y: 0 },
    ]);
    const n = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
    // M x0,y0 = n[0],n[1]; the first C carries c1=(n[2],n[3]),
    // c2=(n[4],n[5]), end=(n[6],n[7]); the second C c1=(n[8],n[9])…
    expect(d).toMatch(/^M0,0C/);
    expect(n[2]).toBeCloseTo(1 / 3, 10);
    expect(n[3]).toBeCloseTo(10 / 3, 10);
    expect(n[4]).toBeCloseTo(2 / 3, 10);
    // The zero-tangent signature: the control arriving AT the peak sits at
    // the peak's y (10) — no overshoot.
    expect(n[5]).toBe(10);
    expect(n[6]).toBe(1);
    expect(n[7]).toBe(10);
    // And the control leaving the peak also rides the peak's y.
    expect(n[9]).toBe(10);
    expect(d.endsWith("2,0")).toBe(true);
  });

  it("never overshoots a plateau edge (the Fritsch-Carlson clamp)", () => {
    // A steep rise onto a flat plateau: the segment leaving the rise must
    // not carry a control y above the plateau (the classic un-clamped
    // Hermite bulge). Assert every y literal in the D stays <= 10.
    const d = smoothPath([
      { x: 0, y: 0 },
      { x: 1, y: 10 },
      { x: 3, y: 10 },
    ]);
    const ys = d.match(/-?\d+(\.\d+)?/g)!.filter((_, i) => i % 2 === 1).map(Number);
    expect(Math.max(...ys)).toBeLessThanOrEqual(10);
  });
});
