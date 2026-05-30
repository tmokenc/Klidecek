// mbb-filter-refine — two draggable shapes; show MBR (axis-aligned
// bounding rectangle), MBR-vs-MBR intersection test (Phase 1), and exact
// segment-based intersection (Phase 2). Switch DE-9IM predicates.
import { useMemo, useState } from "react";

const W = 540, H = 360;

const SHAPES = {
  A: {
    label: "polygon A",
    pts: [[3, 3], [6, 3], [5, 4.5], [6, 6], [3, 6]],
  },
  B: {
    label: "polygon B",
    pts: [[5, 5], [8, 5], [8, 7], [5, 7]],
  },
};

const PREDICATES = [
  { key: "intersects", label: "Intersects", de9im: "interior(A) ∩ interior(B) ≠ ∅ ∨ boundary touch" },
  { key: "contains", label: "Contains (A ⊃ B)", de9im: "interior(B) ⊂ interior(A)" },
  { key: "within", label: "Within (A ⊂ B)", de9im: "interior(A) ⊂ interior(B)" },
  { key: "touches", label: "Touches", de9im: "share boundary only" },
  { key: "disjoint", label: "Disjoint", de9im: "no common point" },
];

function mbb(pts) {
  return {
    lo: [Math.min(...pts.map(p => p[0])), Math.min(...pts.map(p => p[1]))],
    hi: [Math.max(...pts.map(p => p[0])), Math.max(...pts.map(p => p[1]))],
  };
}

function mbbOverlaps(a, b) {
  return !(a.hi[0] < b.lo[0] || b.hi[0] < a.lo[0] || a.hi[1] < b.lo[1] || b.hi[1] < a.lo[1]);
}

// Point-in-polygon (ray casting)
function pip(pt, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > pt[1]) !== (yj > pt[1])) &&
      (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi + 1e-12) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function segIntersect(p1, p2, p3, p4) {
  const ccw = (A, B, C) => (C[1] - A[1]) * (B[0] - A[0]) > (B[1] - A[1]) * (C[0] - A[0]);
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

function polygonIntersect(a, b) {
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      if (segIntersect(a[i], a[(i + 1) % a.length], b[j], b[(j + 1) % b.length])) return true;
    }
  }
  return false;
}

function exactRelations(a, b) {
  const mA = a.every(p => pip(p, b));
  const mB = b.every(p => pip(p, a));
  const interSeg = polygonIntersect(a, b);
  const anyAInB = a.some(p => pip(p, b));
  const anyBInA = b.some(p => pip(p, a));
  const intersects = interSeg || anyAInB || anyBInA;
  const touches = interSeg && !(anyAInB || anyBInA);
  const containsAB = mB && !mA;
  const containsBA = mA && !mB;
  return { intersects, touches, containsAB, containsBA, disjoint: !intersects && !touches };
}

export default function MbbFilterRefine() {
  const [a, setA] = useState(SHAPES.A.pts.map(p => [...p]));
  const [b, setB] = useState(SHAPES.B.pts.map(p => [...p]));
  const [dragA, setDragA] = useState(false);
  const [dragB, setDragB] = useState(false);
  const [predicate, setPredicate] = useState("intersects");
  const [stage, setStage] = useState("both"); // "filter" | "refine" | "both"

  const mA = mbb(a), mB = mbb(b);
  const phase1 = mbbOverlaps(mA, mB);
  const phase2 = useMemo(() => exactRelations(a, b), [a, b]);

  const PAD = 20;
  const xMin = 0, xMax = 10, yMin = 0, yMax = 10;
  const PW = W - PAD * 2 - 220;
  const PH = H - PAD * 2 - 40;
  const toX = (x) => PAD + ((x - xMin) / (xMax - xMin)) * PW;
  const toY = (y) => PAD + PH - ((y - yMin) / (yMax - yMin)) * PH;
  const pxToX = (px) => (px - PAD) / PW * (xMax - xMin);
  const pxToY = (py) => yMax - (py - PAD) / PH * (yMax - yMin);

  let lastPx = null, lastPy = null;
  function onMove(e) {
    const svg = e.currentTarget;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const py = ((e.clientY - r.top) / r.height) * H;
    if (lastPx === null) { lastPx = px; lastPy = py; }
    const dx = pxToX(px) - pxToX(lastPx);
    const dy = pxToY(py) - pxToY(lastPy);
    if (dragA) setA(a.map(p => [Math.max(0, Math.min(10, p[0] + dx)), Math.max(0, Math.min(10, p[1] + dy))]));
    if (dragB) setB(b.map(p => [Math.max(0, Math.min(10, p[0] + dx)), Math.max(0, Math.min(10, p[1] + dy))]));
    lastPx = px; lastPy = py;
  }
  function up() { setDragA(false); setDragB(false); lastPx = null; lastPy = null; }

  const predResult = (() => {
    switch (predicate) {
      case "intersects": return phase2.intersects;
      case "contains": return phase2.containsAB;
      case "within": return phase2.containsBA;
      case "touches": return phase2.touches;
      case "disjoint": return phase2.disjoint;
      default: return false;
    }
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {PREDICATES.map(p => (
          <button key={p.key} onClick={() => setPredicate(p.key)} style={btn(predicate === p.key)}>{p.label}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => setStage("filter")} style={btn(stage === "filter")}>Phase 1 only (MBR)</button>
        <button onClick={() => setStage("refine")} style={btn(stage === "refine")}>Phase 2 only (exact)</button>
        <button onClick={() => setStage("both")} style={btn(stage === "both")}>both</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4, userSelect: "none", touchAction: "none" }}
        onMouseMove={onMove} onMouseUp={up} onMouseLeave={up}>
        <line x1={PAD} y1={PAD + PH} x2={PAD + PW} y2={PAD + PH} stroke="var(--line-strong)" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={PAD + PH} stroke="var(--line-strong)" />

        {/* polygons */}
        <polygon points={a.map(p => `${toX(p[0])},${toY(p[1])}`).join(" ")} fill="oklch(0.65 0.16 264 / 0.25)" stroke="oklch(0.65 0.16 264)" strokeWidth="1.5"
          style={{ cursor: "move" }} onMouseDown={() => setDragA(true)} />
        <polygon points={b.map(p => `${toX(p[0])},${toY(p[1])}`).join(" ")} fill="oklch(0.6 0.18 22 / 0.25)" stroke="oklch(0.6 0.18 22)" strokeWidth="1.5"
          style={{ cursor: "move" }} onMouseDown={() => setDragB(true)} />

        {/* MBRs */}
        {(stage === "filter" || stage === "both") && (
          <>
            <rect x={toX(mA.lo[0])} y={toY(mA.hi[1])} width={toX(mA.hi[0]) - toX(mA.lo[0])} height={toY(mA.lo[1]) - toY(mA.hi[1])}
              fill="none" stroke="oklch(0.65 0.16 264)" strokeWidth="0.8" strokeDasharray="3 3" />
            <rect x={toX(mB.lo[0])} y={toY(mB.hi[1])} width={toX(mB.hi[0]) - toX(mB.lo[0])} height={toY(mB.lo[1]) - toY(mB.hi[1])}
              fill="none" stroke="oklch(0.6 0.18 22)" strokeWidth="0.8" strokeDasharray="3 3" />
          </>
        )}

        <text x={toX(a[0][0])} y={toY(a[0][1]) - 6} fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.65 0.16 264)">A</text>
        <text x={toX(b[0][0])} y={toY(b[0][1]) - 6} fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.6 0.18 22)">B</text>

        {/* Panel right */}
        <g transform={`translate(${PAD + PW + 20}, ${PAD})`}>
          <text x={0} y={0} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">Phase 1 — MBR test</text>
          <rect x={0} y={6} width={180} height={36} fill="var(--bg-inset)" stroke={phase1 ? "oklch(0.65 0.16 145)" : "oklch(0.6 0.18 22)"} strokeWidth="1.2" />
          <text x={6} y={22} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">MBR(A) ∩ MBR(B) ?</text>
          <text x={6} y={36} fontSize="10" fontFamily="var(--font-mono)" fill={phase1 ? "oklch(0.65 0.16 145)" : "oklch(0.6 0.18 22)"}>{phase1 ? "MAY intersect" : "DEFINITELY disjoint"}</text>

          <text x={0} y={66} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">Phase 2 — exact test</text>
          <rect x={0} y={72} width={180} height={106} fill="var(--bg-inset)" stroke="var(--line)" />
          <text x={6} y={88} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">intersects: <tspan fill={phase2.intersects ? "oklch(0.65 0.16 145)" : "var(--text-faint)"}>{String(phase2.intersects)}</tspan></text>
          <text x={6} y={102} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">touches: <tspan fill={phase2.touches ? "oklch(0.65 0.16 145)" : "var(--text-faint)"}>{String(phase2.touches)}</tspan></text>
          <text x={6} y={116} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">A contains B: <tspan fill={phase2.containsAB ? "oklch(0.65 0.16 145)" : "var(--text-faint)"}>{String(phase2.containsAB)}</tspan></text>
          <text x={6} y={130} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">B contains A: <tspan fill={phase2.containsBA ? "oklch(0.65 0.16 145)" : "var(--text-faint)"}>{String(phase2.containsBA)}</tspan></text>
          <text x={6} y={144} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">disjoint: <tspan fill={phase2.disjoint ? "oklch(0.65 0.16 145)" : "var(--text-faint)"}>{String(phase2.disjoint)}</tspan></text>

          <text x={0} y={200} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">{PREDICATES.find(p => p.key === predicate).label}</text>
          <rect x={0} y={206} width={180} height={56} fill="var(--bg-inset)" stroke={predResult ? "oklch(0.65 0.16 145)" : "var(--line)"} strokeWidth={predResult ? 1.4 : 0.6} />
          <text x={6} y={224} fontSize="10" fontFamily="var(--font-mono)" fill={predResult ? "oklch(0.65 0.16 145)" : "var(--text-muted)"}>
            {predResult ? "TRUE" : "false"}
          </text>
          <text x={6} y={228} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
            {wrapLabel(PREDICATES.find(p => p.key === predicate).de9im, 30).map((ln, i) => (
              <tspan key={i} x={6} dy={i === 0 ? 12 : 10}>{ln}</tspan>
            ))}
          </text>
        </g>

        <text x={PAD} y={H - 6} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">drag any polygon</text>
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        Two-phase evaluation in spatial DB: Phase 1 prunes 99 % of pairs by MBR comparison (cheap, R-tree O(log N)). Only survivors get the exact O(n·m) test.
        DE-9IM classifies the 9 interior/boundary/exterior intersection dimensions — standard predicates are shorthand over its 3×3 matrix.
      </div>
    </div>
  );
}

function wrapLabel(text, max) {
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > max) { lines.push(cur); cur = w; }
    else cur = cur ? cur + " " + w : w;
  }
  if (cur) lines.push(cur);
  return lines;
}

function btn(active) {
  return {
    fontFamily: "var(--font-mono)", fontSize: 10, padding: "2px 6px",
    background: active ? "var(--accent)" : "var(--bg-inset)",
    color: active ? "var(--bg-card)" : "var(--text)",
    border: "1px solid var(--line-strong)", borderRadius: 3, cursor: "pointer",
  };
}
