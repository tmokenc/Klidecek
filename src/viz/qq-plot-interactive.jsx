// Q-Q plot interactive — switch data source shape, see Q-Q against N(0,1).
import { useState, useMemo } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 320;
const PAD_L = 40, PAD_R = 14, PAD_T = 18, PAD_B = 36;
const PW = W - PAD_L - PAD_R, PH = H - PAD_T - PAD_B;

const SOURCES = {
  normal:  { label: "N(0, 1)", sample: (rng) => S.sampleNormal(rng, 0, 1) },
  heavy:   { label: "Student t(3) — heavy tails", sample: (rng) => {
    // t(3) via Z / sqrt(V/3), V ~ chi2(3)
    const Z = S.sampleNormal(rng, 0, 1);
    const V = S.sampleGamma(rng, 1.5, 2);
    return Z / Math.sqrt(V / 3);
  }},
  skew:    { label: "log-normal (skewed)", sample: (rng) => Math.exp(S.sampleNormal(rng, 0, 0.5)) - Math.exp(0.5 * 0.5 / 2) },
  bimodal: { label: "bimodální (mix N)", sample: (rng) => (rng() < 0.5 ? -1.5 : 1.5) + S.sampleNormal(rng, 0, 0.5) },
  uniform: { label: "U(−2, 2) — light tails", sample: (rng) => -2 + 4 * rng() },
};

export default function QqPlotInteractive() {
  const [src, setSrc] = useState("heavy");
  const [n, setN] = useState(80);
  const [seed, setSeed] = useState(3);

  const m = SOURCES[src];

  const data = useMemo(() => {
    const rng = S.mulberry32(seed * 131 + 1);
    const out = [];
    for (let i = 0; i < n; i++) out.push(m.sample(rng));
    out.sort((a, b) => a - b);
    return out;
  }, [src, n, seed]);

  // Standardize empirical sample (z-score) so it's directly comparable to N(0,1)
  const mean = data.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(data.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1));
  const standardized = data.map((x) => (x - mean) / (sd || 1));

  // Theoretical quantiles: Φ⁻¹((i - 0.5)/n)
  const theo = Array.from({ length: n }, (_, i) => S.normalQuantile((i + 0.5) / n));

  const allXY = standardized.map((y, i) => [theo[i], y]);
  const lim = 3.5;
  const xMin = -lim, xMax = lim, yMin = -lim, yMax = lim;
  const toX = (x) => PAD_L + ((x - xMin) / (xMax - xMin)) * PW;
  const toY = (y) => PAD_T + PH - ((y - yMin) / (yMax - yMin)) * PH;
  // Clamp plotted points to the plot rectangle so extreme z-scores (heavy tails)
  // peg at the edge instead of rendering past the top/edges and clipping the viewBox.
  const R = 2.6;
  const clampX = (x) => Math.max(PAD_L + R, Math.min(PAD_L + PW - R, toX(x)));
  const clampY = (y) => Math.max(PAD_T + R, Math.min(PAD_T + PH - R, toY(y)));

  // K-S statistic and Shapiro-Wilk-like check; use simple K-S against N(0,1) on standardized
  let ksMax = 0;
  for (let i = 0; i < n; i++) {
    const F0 = S.normalCDF(standardized[i]);
    const F1 = (i + 1) / n;
    const F0_ = i / n;
    ksMax = Math.max(ksMax, Math.abs(F1 - F0), Math.abs(F0 - F0_));
  }
  // Asymptotic K-S critical value at α=0.05: 1.36/√n
  const ksCrit = 1.36 / Math.sqrt(n);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.entries(SOURCES).map(([k, v]) => (
          <button key={k} onClick={() => setSrc(k)} style={btn(src === k)}>{v.label}</button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <line x1={PAD_L} y1={PAD_T + PH} x2={PAD_L + PW} y2={PAD_T + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} stroke="var(--line-strong)" />

        {/* Diagonal y=x */}
        <line x1={toX(-lim)} y1={toY(-lim)} x2={toX(lim)} y2={toY(lim)} stroke="var(--text-muted)" strokeDasharray="3 3" />

        {/* Data points */}
        {allXY.map(([x, y], i) => (
          <circle key={i} cx={clampX(x)} cy={clampY(y)} r={R} fill="var(--accent)" opacity="0.75" />
        ))}

        {/* axes */}
        {[-3, -2, -1, 0, 1, 2, 3].map((v) => (
          <g key={v}>
            <line x1={toX(v)} y1={PAD_T + PH} x2={toX(v)} y2={PAD_T + PH + 4} stroke="var(--line-strong)" />
            <text x={toX(v)} y={PAD_T + PH + 14} fontSize="9.5" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v}</text>
            <line x1={PAD_L - 4} y1={toY(v)} x2={PAD_L} y2={toY(v)} stroke="var(--line-strong)" />
            <text x={PAD_L - 6} y={toY(v) + 3} fontSize="9.5" textAnchor="end" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v}</text>
          </g>
        ))}

        <text x={PAD_L + PW / 2} y={H - 8} textAnchor="middle" fontSize="10.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">teoretický kvantil Φ⁻¹((i−0.5)/n)</text>
        <text x={14} y={PAD_T + PH / 2} fontSize="10.5" fill="var(--text-muted)" fontFamily="var(--font-mono)" transform={`rotate(-90 14 ${PAD_T + PH / 2})`}>standardizovaný vzorek</text>
      </svg>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <label style={lab()}>n = {n}
          <input type="range" min={20} max={500} value={n} onChange={(e) => setN(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <button onClick={() => setSeed(seed + 1)} style={btn(false)}>nový vzorek</button>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        x̄ = {mean.toFixed(3)}, s = {sd.toFixed(3)} · K-S statistika D = <strong>{ksMax.toFixed(3)}</strong>, kritická D₀.₀₅ ≈ {ksCrit.toFixed(3)}
        {" "}→ {ksMax > ksCrit ? <strong style={{ color: "var(--accent-line)" }}>data nejsou normální</strong> : <span>nezamítáme normalitu</span>}
        <br />Odchylky od přímky: heavy tails = ohnuté konce; skew = systematický posun; bimodal = vlnitost.
      </div>
    </div>
  );
}

function btn(active) { return { padding: "3px 9px", fontSize: 10.5, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
function lab() { return { flex: "1 1 200px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }; }
