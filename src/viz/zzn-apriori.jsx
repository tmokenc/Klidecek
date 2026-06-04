// Apriori: itemset lattice over a tiny transaction DB.
// min-support slider crosses out infrequent sets; downward closure makes any
// superset of an infrequent set also infrequent (shown as a fade + strike).
import { useState } from "react";

export default function ZznApriori() {
  // 5 transactions over items A,B,C,D (e.g. bread/milk/diaper/beer)
  const items = ["A", "B", "C", "D"];
  const txns = [
    ["A", "B"],
    ["A", "C", "D"],
    ["B", "C", "D"],
    ["A", "B", "C", "D"],
    ["A", "B", "C"],
  ];
  const N = txns.length;

  const [minSup, setMinSup] = useState(2); // absolute support threshold (count)

  // all non-empty subsets of {A,B,C,D}, grouped by size
  const subsets = [];
  for (let m = 1; m < 1 << items.length; m++) {
    const s = items.filter((_, i) => m & (1 << i));
    subsets.push(s);
  }
  const count = (s) => txns.filter((t) => s.every((x) => t.includes(x))).length;
  const key = (s) => s.join("");

  // map: key -> support count
  const sup = {};
  subsets.forEach((s) => (sup[key(s)] = count(s)));

  // frequent = support >= minSup. By downward closure a set is "reachable"
  // (a real Apriori candidate) only if all its size-(k-1) subsets are frequent.
  const freq = {};
  subsets.forEach((s) => (freq[key(s)] = sup[key(s)] >= minSup));
  const subsetsOf = (s) =>
    s.length <= 1 ? [] : s.map((_, i) => s.filter((__, j) => j !== i));
  const pruned = {}; // never generated as candidate
  subsets
    .slice()
    .sort((a, b) => a.length - b.length)
    .forEach((s) => {
      pruned[key(s)] =
        subsetsOf(s).some((c) => !freq[key(c)]) && s.length > 1;
    });

  // layout by size level
  const W = 540, H = 220;
  const levels = [[], [], [], []];
  subsets.forEach((s) => levels[s.length - 1].push(s));
  const rowY = [40, 95, 150, 200];
  const pos = {};
  levels.forEach((lvl, li) => {
    const gap = W / (lvl.length + 1);
    lvl.forEach((s, i) => (pos[key(s)] = [gap * (i + 1), rowY[li]]));
  });

  // lattice edges: subset (size k-1) to superset (size k) that adds one item
  const edges = [];
  subsets.forEach((s) => {
    if (s.length < 2) return;
    subsetsOf(s).forEach((c) => edges.push([key(c), key(s)]));
  });

  const fill = (s) => {
    if (pruned[key(s)]) return "var(--bg-card)";
    if (freq[key(s)]) return "color-mix(in oklch, var(--accent) 28%, var(--bg-card))";
    return "var(--bg-card)";
  };
  const stroke = (s) =>
    freq[key(s)] ? "var(--accent)" : "var(--line-strong)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {edges.map(([a, b], i) => (
          <line key={i} x1={pos[a][0]} y1={pos[a][1] + 7} x2={pos[b][0]} y2={pos[b][1] - 7}
            stroke="var(--line-strong)" strokeWidth="0.5" opacity="0.4" />
        ))}
        {subsets.map((s) => {
          const [x, y] = pos[key(s)];
          const dim = pruned[key(s)] || !freq[key(s)];
          const w = 13 + s.length * 9;
          return (
            <g key={key(s)} opacity={pruned[key(s)] ? 0.4 : 1}>
              <rect x={x - w / 2} y={y - 9} width={w} height={18} rx="4"
                fill={fill(s)} stroke={stroke(s)} strokeWidth={freq[key(s)] ? 1.5 : 1} />
              <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central"
                fontSize="11" fontFamily="var(--font-mono)"
                fill={freq[key(s)] ? "var(--text)" : "var(--text-muted)"}>
                {s.join("")}:{sup[key(s)]}
              </text>
              {dim && (
                <line x1={x - w / 2 + 2} y1={y} x2={x + w / 2 - 2} y2={y}
                  stroke="var(--text-faint)" strokeWidth="1" />
              )}
            </g>
          );
        })}
        <text x={8} y={H - 6} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          rows = velikost množiny · modrá = frekventovaná · škrtnutá = pod prahem / odřezaná
        </text>
      </svg>
      <input type="range" min={1} max={N} value={minSup}
        onChange={(e) => setMinSup(+e.target.value)} style={{ width: "100%" }} />
      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        min-support = {minSup} z {N} transakcí ({Math.round((minSup / N) * 100)} %) ·
        {" "}frekventovaných: {subsets.filter((s) => freq[key(s)]).length} ·
        {" "}odřezaných kandidátů: {subsets.filter((s) => pruned[key(s)]).length}
      </div>
    </div>
  );
}
