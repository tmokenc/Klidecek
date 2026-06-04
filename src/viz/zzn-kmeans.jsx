// k-means vs k-medoids: step through assignment + update on 2D points.
import { useState } from "react";

// Fixed dataset (three loose blobs) so iterations are reproducible.
const POINTS = [
  [55, 50], [70, 42], [48, 66], [80, 60], [62, 58], [40, 48],
  [195, 55], [210, 70], [225, 52], [200, 40], [218, 66], [235, 60],
  [120, 135], [140, 122], [105, 120], [132, 142], [118, 150], [150, 138],
];

// Deterministic, deliberately off-centre seeds so the demo actually moves.
const SEEDS = [
  [60, 120], [160, 50], [180, 130],
];

const PALETTE = ["var(--accent)", "oklch(0.65 0.16 264)", "oklch(0.6 0.18 22)"];

function dist(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

// One full Lloyd / k-medoids iteration from a set of centres.
function iterate(centres, medoid) {
  // Assignment step.
  const assign = POINTS.map((p) => {
    let best = 0, bd = Infinity;
    centres.forEach((c, k) => {
      const d = dist(p, c);
      if (d < bd) { bd = d; best = k; }
    });
    return best;
  });
  // Update step.
  const next = centres.map((c, k) => {
    const members = POINTS.filter((_, i) => assign[i] === k);
    if (members.length === 0) return c;
    if (medoid) {
      // Medoid = the member minimising total distance to the rest.
      let bestPt = members[0], bestCost = Infinity;
      for (const cand of members) {
        const cost = members.reduce((s, m) => s + dist(cand, m), 0);
        if (cost < bestCost) { bestCost = cost; bestPt = cand; }
      }
      return bestPt;
    }
    // Centroid = mean of members (fictitious point).
    const mx = members.reduce((s, m) => s + m[0], 0) / members.length;
    const my = members.reduce((s, m) => s + m[1], 0) / members.length;
    return [mx, my];
  });
  return { assign, next };
}

export default function ZznKMeans() {
  const [medoid, setMedoid] = useState(false);
  const [step, setStep] = useState(0);

  // Replay from the seeds up to `step` iterations (cheap, dataset is tiny).
  let centres = SEEDS;
  let assign = POINTS.map(() => -1);
  let moved = true;
  for (let s = 0; s < step; s++) {
    const r = iterate(centres, medoid);
    moved = r.next.some((c, k) => dist(c, centres[k]) > 0.01);
    centres = r.next;
  }
  // Assignment shown is the one against the current (post-update) centres.
  if (step > 0) assign = iterate(centres, medoid).assign;

  const W = 300, H = 200;
  const reset = () => setStep(0);
  const converged = step > 0 && !moved;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 440, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* membership lines to the assigned centre */}
        {step > 0 && POINTS.map((p, i) => {
          const c = centres[assign[i]];
          return (
            <line key={`l${i}`} x1={p[0]} y1={p[1]} x2={c[0]} y2={c[1]}
              stroke={PALETTE[assign[i]]} strokeWidth="0.5" opacity="0.4" />
          );
        })}
        {/* data points */}
        {POINTS.map((p, i) => (
          <circle key={`p${i}`} cx={p[0]} cy={p[1]} r="4"
            fill={step > 0 ? PALETTE[assign[i]] : "var(--bg-card)"}
            stroke="var(--line-strong)" strokeWidth="0.75" />
        ))}
        {/* centres / medoids */}
        {centres.map((c, k) => (
          <g key={`c${k}`}>
            {medoid ? (
              <rect x={c[0] - 6} y={c[1] - 6} width="12" height="12"
                fill="none" stroke={PALETTE[k]} strokeWidth="2.5" />
            ) : (
              <path
                d={`M ${c[0]} ${c[1] - 7} L ${c[0] + 7} ${c[1]} L ${c[0]} ${c[1] + 7} L ${c[0] - 7} ${c[1]} Z`}
                fill="var(--bg-card)" stroke={PALETTE[k]} strokeWidth="2.5" />
            )}
          </g>
        ))}
        <text x={8} y={H - 8} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          {medoid ? "medoid = ctverec (skutecny bod)" : "centroid = kosoctverec (fiktivni bod)"}
        </text>
      </svg>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setStep((s) => s + 1)} disabled={converged}
          style={{ fontFamily: "var(--font-mono)", fontSize: 12, padding: "3px 9px",
            background: "var(--bg-card)", color: "var(--text)",
            border: "1px solid var(--line-strong)", borderRadius: 4, cursor: converged ? "default" : "pointer" }}>
          krok iterace ▸
        </button>
        <button onClick={reset}
          style={{ fontFamily: "var(--font-mono)", fontSize: 12, padding: "3px 9px",
            background: "var(--bg-inset)", color: "var(--text-muted)",
            border: "1px solid var(--line)", borderRadius: 4, cursor: "pointer" }}>
          reset
        </button>
        <label style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)",
          display: "flex", gap: 5, alignItems: "center", cursor: "pointer" }}>
          <input type="checkbox" checked={medoid} onChange={(e) => { setMedoid(e.target.checked); setStep(0); }} />
          k-medoids
        </label>
      </div>

      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        iterace = {step} · k = 3 · {converged ? "konvergovano (zadny presun)" : "stiskni krok"}
      </div>
    </div>
  );
}
