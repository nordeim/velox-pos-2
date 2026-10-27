// ---------------------------------------------------------------------------
// The chart smooth-curve seam (Session-14, F-95..F-106): the reference's two
// charts render recharts curveMonotoneX-family SMOOTH C segments — the
// Dashboard's flat zero-data line measures `M65,245C95.833,245,126.667,245,
// 157.5,245…` (controls at 1/3·2/3 of each span, the tangent-family
// signature) — while the clone drew straight L segments. This seam closes
// the gap as a monotone-X cubic Hermite (Fritsch-Carlson tangents + the
// limited-slope clamp): flat data reproduces the measured D shape, monotone
// data never overshoots its measured range, degenerate edges stay safe.
// Pure math, zero imports — unit-pinned in tests/unit/chart-path.test.ts.
// ---------------------------------------------------------------------------

/** A chart point in SVG user units (the seam's input). */
export type Pt = { x: number; y: number };

export function smoothPath(pts: Pt[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`;

  // Secant slopes per segment (x is strictly increasing by construction).
  const d: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    d.push((pts[i + 1].y - pts[i].y) / (pts[i + 1].x - pts[i].x));
  }

  // Fritsch-Carlson tangents: endpoints take the adjacent secant; interior
  // points average their neighboring secants, or zero at sign changes
  // (local extrema — the curve flattens AT the measured point).
  const m: number[] = new Array(pts.length);
  m[0] = d[0];
  m[pts.length - 1] = d[d.length - 1];
  for (let i = 1; i < pts.length - 1; i++) {
    m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  }

  // The limited-slope clamp: a segment whose combined tangents exceed 3×
  // its secant would overshoot the data range — scale both down.
  for (let i = 0; i < pts.length - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const alpha = m[i] / d[i] + m[i + 1] / d[i];
    if (Math.abs(alpha) > 3) {
      const t = 3 / alpha;
      m[i] *= t;
      m[i + 1] *= t;
    }
  }

  // Each segment: C with controls at 1/3 and 2/3 of the x-span, offset by
  // the endpoint tangents (dx/3 · m).
  let out = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x;
    const c1x = pts[i].x + dx / 3;
    const c1y = pts[i].y + (m[i] * dx) / 3;
    const c2x = pts[i + 1].x - dx / 3;
    const c2y = pts[i + 1].y - (m[i + 1] * dx) / 3;
    out += `C${c1x},${c1y},${c2x},${c2y},${pts[i + 1].x},${pts[i + 1].y}`;
  }
  return out;
}
