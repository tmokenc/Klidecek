// IDDFS — show repeated re-exploration of shallow levels at each depth iteration.
import { useState } from "react";

// Branching factor + max depth
const BF = 3;
const MAX_DEPTH = 5;

// Compute nodes touched by IDDFS up to depth d
// Sum over k = 0..d of (touched at depth limit k)
// At depth limit k, BFS-like over full tree to depth k => 1 + b + b^2 + ... + b^k
function nodesAtLimit(b, k) {
  let s = 0;
  for (let i = 0; i <= k; i++) s += Math.pow(b, i);
  return s;
}
function iddfsTotal(b, d) {
  let s = 0;
  for (let k = 0; k <= d; k++) s += nodesAtLimit(b, k);
  return s;
}

// Per-level expansion counts during IDDFS up to depth limit d.
function iddfsPerLevel(b, d) {
  // expansions[k] = how many times nodes at level k are touched across all iterations 0..d
  // For iteration with limit L, levels 0..L all touched once.
  const exp = new Array(d + 1).fill(0);
  for (let L = 0; L <= d; L++) {
    for (let k = 0; k <= L; k++) exp[k] += Math.pow(b, k);
  }
  return exp;
}

export default function IddfsRedundancy() {
  const [depth, setDepth] = useState(3);

  const dfsCount = nodesAtLimit(BF, depth); // single DFS to depth d
  const iddfsCount = iddfsTotal(BF, depth);
  const overhead = ((iddfsCount / dfsCount) - 1) * 100;

  const expPerLevel = iddfsPerLevel(BF, depth);
  const expSinglePerLevel = new Array(depth + 1).fill(0).map((_, k) => Math.pow(BF, k));

  // Build tree layout
  const W = 540, H = 280;
  const levelY = (k) => 30 + k * ((H - 100) / Math.max(1, depth));
  function nodesAtLevel(k) { return Math.min(20, Math.pow(BF, k)); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls" style={{ fontSize: 11 }}>
        <label style={{ display: "flex", gap: 6, alignItems: "center", fontFamily: "var(--font-mono)" }}>
          hloubka d:
          <input type="range" className="viz-slider" min={1} max={MAX_DEPTH} value={depth} onChange={(e) => setDepth(+e.target.value)} style={{ width: 100 }}/>
          <span style={{ minWidth: 14 }}>{depth}</span>
        </label>
        <span className="viz-readout">
          b (branching) = {BF}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 620 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* Draw tree silhouette */}
        {Array.from({ length: depth + 1 }).map((_, k) => {
          const n = nodesAtLevel(k);
          const y = levelY(k);
          return (
            <g key={`level${k}`}>
              {Array.from({ length: n }).map((_, i) => {
                const x = 80 + (i + 0.5) * (W - 160 - 120) / n;
                return (
                  <circle key={i} cx={x} cy={y} r="6" fill="var(--bg-card)" stroke="var(--line-strong)" strokeWidth="0.8"/>
                );
              })}
              <text x={70} y={y + 4} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                k={k}
              </text>
              {/* Expansion count bar */}
              <text x={W - 110} y={y + 4} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">
                IDDFS: <tspan fill="oklch(0.78 0.18 30)" fontWeight="700">{expPerLevel[k]}</tspan>
              </text>
              <text x={W - 110} y={y + 16} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                vs DFS: {expSinglePerLevel[k]}
              </text>
            </g>
          );
        })}
        {/* Total */}
        <line x1="60" y1={H - 30} x2={W - 20} y2={H - 30} stroke="var(--line)" strokeWidth="0.6"/>
        <text x={70} y={H - 10} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">
          Σ IDDFS = <tspan fontWeight="700" fill="oklch(0.78 0.18 30)">{iddfsCount}</tspan>
          {" "}vs DFS k limit d = <tspan fontWeight="700" fill="var(--accent)">{dfsCount}</tspan>
          {" "}(overhead +{overhead.toFixed(1)}%)
        </text>
      </svg>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", padding: 8, borderRadius: 4, fontSize: 11, fontFamily: "var(--font-mono)", lineHeight: 1.5 }}>
        <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", marginBottom: 4 }}>asymptotika</div>
        <div>DFS expand ≈ O(b^d) = O({BF}^{depth}) = {dfsCount}</div>
        <div>IDDFS expand ≈ Σ_{`k=0..d`} b^k · (d−k+1) → dominováno b^d</div>
        <div style={{ marginTop: 4 }}>
          Pro b=10, d=5: DFS = 111 111, IDDFS = 123 456 → +11 % overhead.
          Pro velké b je overhead malý — uzly na *posledních* hladinách dominují.
        </div>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        IDDFS = iterativní prohlubování. Volá DFS s rostoucím limitem 1, 2, ..., d. <strong>Vypadá to drahé</strong> — opakuje práci,
        ale dominantní cena je *poslední iterace*, takže overhead je jen ~1/(b−1)/d. Memory je O(d), ne O(b^d). Optimální v praxi.
      </div>
    </div>
  );
}
