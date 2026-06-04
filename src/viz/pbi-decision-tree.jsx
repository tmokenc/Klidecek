// Decision tree induction on a 2D dataset: step through a predetermined demo
// sequence of axis-aligned splits. NOTE: this is an XOR/checkerboard layout, so
// the FIRST (root) split has near-zero information gain (≈0.03 bit) — it is NOT
// the greedy ID3/C4.5 maximum (the real argmax root would be ~x<1.35). It is
// shown to illustrate greedy myopia: a single root split barely reduces impurity
// here, yet it still enables pure children. The two child splits ARE the greedy
// best within each half. Shows the partitioned scatter plot AND the tree.
import { useState } from "react";

// Two-class dataset in a 10x10 grid. class 0 = circle, class 1 = square.
const POINTS = [
  { x: 1.5, y: 7.5, c: 0 }, { x: 2.5, y: 8.5, c: 0 }, { x: 1.0, y: 6.0, c: 0 },
  { x: 3.0, y: 7.0, c: 0 }, { x: 2.0, y: 5.5, c: 0 }, { x: 1.2, y: 8.8, c: 0 },
  { x: 6.5, y: 8.0, c: 1 }, { x: 7.5, y: 7.0, c: 1 }, { x: 8.5, y: 8.5, c: 1 },
  { x: 7.0, y: 9.0, c: 1 }, { x: 8.0, y: 6.5, c: 1 }, { x: 6.0, y: 6.0, c: 1 },
  { x: 2.0, y: 2.0, c: 1 }, { x: 3.0, y: 1.5, c: 1 }, { x: 1.5, y: 3.0, c: 1 },
  { x: 7.5, y: 2.5, c: 0 }, { x: 8.0, y: 1.5, c: 0 }, { x: 6.5, y: 3.0, c: 0 },
  { x: 8.5, y: 2.0, c: 0 }, { x: 7.0, y: 1.0, c: 0 },
];

// Predetermined demo splits (root + 2 children). The two child splits are the
// locally greedy best within their half; the root x<4.5 is a deliberately
// non-greedy demo choice (XOR data ⇒ near-zero root gain, see note above). Each
// split: feature ("x" axis = svisle, "y" axis = vodorovne), threshold t, and
// the region it applies to (xmin..xmax, ymin..ymax).
const SPLITS = [
  { id: "n0", feat: "x", t: 4.5, region: { x0: 0, x1: 10, y0: 0, y1: 10 } },
  { id: "n1", feat: "y", t: 4.5, region: { x0: 0, x1: 4.5, y0: 0, y1: 10 } },
  { id: "n2", feat: "y", t: 4.5, region: { x0: 4.5, x1: 10, y0: 0, y1: 10 } },
];

function entropy(pts) {
  if (pts.length === 0) return 0;
  const p = pts.filter((q) => q.c === 0).length / pts.length;
  const q = 1 - p;
  const l = (z) => (z > 0 ? z * Math.log2(z) : 0);
  return -(l(p) + l(q));
}

export default function PbiDecisionTree() {
  const [step, setStep] = useState(0); // 0..3 splits applied
  const W = 540, H = 230;
  // scatter area on the left
  const PX0 = 38, PX1 = 250, PY0 = 22, PY1 = 200;
  const sx = (x) => PX0 + (x / 10) * (PX1 - PX0);
  const sy = (y) => PY1 - (y / 10) * (PY1 - PY0);

  const applied = SPLITS.slice(0, step);

  // entropy of root vs after current split, for the readout
  const rootH = entropy(POINTS);
  let infoGain = null;
  if (step >= 1 && step <= SPLITS.length) {
    const s = SPLITS[step - 1];
    const inRegion = POINTS.filter(
      (p) => p.x >= s.region.x0 && p.x < s.region.x1 && p.y >= s.region.y0 && p.y < s.region.y1
    );
    const left = inRegion.filter((p) => (s.feat === "x" ? p.x : p.y) < s.t);
    const right = inRegion.filter((p) => (s.feat === "x" ? p.x : p.y) >= s.t);
    const before = entropy(inRegion);
    const after =
      (left.length / inRegion.length) * entropy(left) +
      (right.length / inRegion.length) * entropy(right);
    infoGain = before - after;
  }

  const colorOf = (c) => (c === 0 ? "var(--accent)" : "var(--accent-line)");

  // tree node layout on the right
  const tx0 = 300;
  const treeNodes = [
    { id: "root", x: tx0 + 110, y: 40, label: "x < 4.5 ?", show: step >= 1 },
    { id: "L", x: tx0 + 50, y: 110, label: step >= 2 ? "y < 4.5 ?" : "", leaf: step < 2, cls: 0, show: step >= 1 },
    { id: "R", x: tx0 + 170, y: 110, label: step >= 3 ? "y < 4.5 ?" : "", leaf: step < 3, cls: 1, show: step >= 1 },
    { id: "LL", x: tx0 + 20, y: 178, leaf: true, cls: 1, show: step >= 2 },
    { id: "LR", x: tx0 + 80, y: 178, leaf: true, cls: 0, show: step >= 2 },
    { id: "RL", x: tx0 + 140, y: 178, leaf: true, cls: 0, show: step >= 3 },
    { id: "RR", x: tx0 + 200, y: 178, leaf: true, cls: 1, show: step >= 3 },
  ];
  const nById = Object.fromEntries(treeNodes.map((n) => [n.id, n]));
  const treeEdges = [
    ["root", "L"], ["root", "R"],
    ["L", "LL"], ["L", "LR"],
    ["R", "RL"], ["R", "RR"],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* axes */}
        <line x1={PX0} y1={PY0} x2={PX0} y2={PY1} stroke="var(--line-strong)" strokeWidth="0.7" />
        <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke="var(--line-strong)" strokeWidth="0.7" />
        <text x={PX0 - 6} y={PY0 + 4} textAnchor="end" fontSize="9" fill="var(--text-faint)" fontFamily="var(--font-mono)">y</text>
        <text x={PX1} y={PY1 + 12} textAnchor="end" fontSize="9" fill="var(--text-faint)" fontFamily="var(--font-mono)">x</text>

        {/* split lines, drawn within their region */}
        {applied.map((s) => {
          if (s.feat === "x") {
            return (
              <line key={s.id} x1={sx(s.t)} y1={sy(s.region.y1)} x2={sx(s.t)} y2={sy(s.region.y0)}
                stroke="var(--text)" strokeWidth="1.4" strokeDasharray="4 2" />
            );
          }
          return (
            <line key={s.id} x1={sx(s.region.x0)} y1={sy(s.t)} x2={sx(s.region.x1)} y2={sy(s.t)}
              stroke="var(--text)" strokeWidth="1.4" strokeDasharray="4 2" />
          );
        })}

        {/* data points */}
        {POINTS.map((p, i) =>
          p.c === 0 ? (
            <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="4" fill={colorOf(0)} stroke="var(--bg-inset)" strokeWidth="0.8" />
          ) : (
            <rect key={i} x={sx(p.x) - 3.6} y={sy(p.y) - 3.6} width="7.2" height="7.2"
              fill={colorOf(1)} stroke="var(--bg-inset)" strokeWidth="0.8" />
          )
        )}

        <text x={PX0} y={H - 6} fontSize="9.5" fill="var(--text-faint)" fontFamily="var(--font-mono)">
          ● = třída A   ■ = třída B   ┄ = osově zarovnaný řez
        </text>

        {/* divider */}
        <line x1={285} y1={16} x2={285} y2={H - 18} stroke="var(--line)" strokeWidth="0.6" />

        {/* tree */}
        {treeEdges.map(([a, b], i) => {
          const na = nById[a], nb = nById[b];
          if (!na.show || !nb.show) return null;
          return <line key={i} x1={na.x} y1={na.y + 9} x2={nb.x} y2={nb.y - 9}
            stroke="var(--line-strong)" strokeWidth="0.8" />;
        })}
        {treeNodes.map((n) => {
          if (!n.show) return null;
          if (n.leaf) {
            return (
              <g key={n.id}>
                <rect x={n.x - 10} y={n.y - 9} width="20" height="18" rx="3"
                  fill={colorOf(n.cls)} opacity="0.85" />
                <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="9.5" fill="var(--bg-inset)"
                  fontFamily="var(--font-mono)" fontWeight="600">{n.cls === 0 ? "A" : "B"}</text>
              </g>
            );
          }
          return (
            <g key={n.id}>
              <rect x={n.x - 30} y={n.y - 10} width="60" height="20" rx="4"
                fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1" />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="10" fill="var(--text)"
                fontFamily="var(--font-mono)">{n.label}</text>
            </g>
          );
        })}
        <text x={tx0 + 110} y={18} textAnchor="middle" fontSize="9.5" fill="var(--text-faint)" fontFamily="var(--font-mono)">
          indukovaný strom
        </text>
      </svg>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
          style={{ padding: "3px 10px" }}>← zpět</button>
        <button onClick={() => setStep((s) => Math.min(SPLITS.length, s + 1))} disabled={step === SPLITS.length}
          style={{ padding: "3px 10px" }}>další řez →</button>
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          řez {step} / {SPLITS.length}
          {infoGain != null && ` · info. zisk ≈ ${infoGain.toFixed(2)} bit`}
          {step === 0 && ` · entropie kořene ≈ ${rootH.toFixed(2)} bit`}
          {step === 1 && " · (kořen má u XOR dat skoro nulový zisk — ukázka hladové krátkozrakosti)"}
        </span>
      </div>
    </div>
  );
}
