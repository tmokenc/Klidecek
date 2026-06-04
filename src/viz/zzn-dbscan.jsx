// DBSCAN: vary eps + minPts, classify points as core / border / noise.
import { useState } from "react";

// A non-convex layout (curved band + a denser blob + scattered noise) so that
// density-based clustering visibly beats centroid methods.
const POINTS = [
  // curved band
  [40, 120], [55, 105], [72, 95], [90, 90], [110, 90], [130, 95],
  [148, 105], [163, 120], [175, 138],
  // dense blob top-right
  [215, 55], [228, 48], [240, 60], [222, 70], [235, 78], [248, 50], [252, 68],
  // scattered noise
  [70, 165], [200, 150], [120, 40],
];

function dist(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

// Returns "core" | "border" | "noise" for every point given eps, minPts.
function classify(eps, minPts) {
  // neigh[i] = indices of other points within eps of point i
  const neigh = POINTS.map((p, i) =>
    POINTS.reduce((acc, q, j) => {
      if (i !== j && dist(p, q) <= eps) acc.push(j);
      return acc;
    }, []));
  // count includes the point itself (standard DBSCAN definition)
  const isCore = POINTS.map((_, i) => neigh[i].length + 1 >= minPts);
  return POINTS.map((_, i) => {
    if (isCore[i]) return "core";
    // border = within eps of some core point
    const nearCore = neigh[i].some((j) => isCore[j]);
    return nearCore ? "border" : "noise";
  });
}

const COLOR = {
  core: "var(--accent)",
  border: "oklch(0.65 0.16 264)",
  noise: "oklch(0.6 0.18 22)",
};

export default function ZznDbscan() {
  const [eps, setEps] = useState(42);
  const [minPts, setMinPts] = useState(4);
  const [sel, setSel] = useState(9); // which point shows its eps-neighbourhood

  const kind = classify(eps, minPts);
  const counts = kind.reduce((a, k) => (a[k]++, a), { core: 0, border: 0, noise: 0 });

  const W = 300, H = 200;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 440, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* eps-neighbourhood of the selected point */}
        <circle cx={POINTS[sel][0]} cy={POINTS[sel][1]} r={eps}
          fill="color-mix(in oklch, var(--accent) 12%, transparent)"
          stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3" />
        {POINTS.map((p, i) => (
          <g key={i} onClick={() => setSel(i)} style={{ cursor: "pointer" }}>
            <circle cx={p[0]} cy={p[1]} r={i === sel ? 6 : 4.5}
              fill={COLOR[kind[i]]}
              stroke={i === sel ? "var(--text)" : "var(--line-strong)"}
              strokeWidth={i === sel ? 1.5 : 0.75} />
          </g>
        ))}
        <text x={8} y={H - 8} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          klikni na bod → jeho eps-okoli
        </text>
      </svg>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 11,
        fontFamily: "var(--font-mono)" }}>
        <span style={{ color: COLOR.core }}>● core: {counts.core}</span>
        <span style={{ color: COLOR.border }}>● hranicni: {counts.border}</span>
        <span style={{ color: COLOR.noise }}>● sum: {counts.noise}</span>
      </div>

      <label style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        eps = {eps}
        <input type="range" min={15} max={70} value={eps}
          onChange={(e) => setEps(+e.target.value)} style={{ width: "100%" }} />
      </label>
      <label style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        minPts = {minPts}
        <input type="range" min={2} max={8} value={minPts}
          onChange={(e) => setMinPts(+e.target.value)} style={{ width: "100%" }} />
      </label>
    </div>
  );
}
