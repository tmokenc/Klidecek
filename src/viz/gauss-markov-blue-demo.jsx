// Gauss-Markov demonstration — empirical variance of OLS vs other linear unbiased estimators.
// Two linear unbiased estimators of β₁ in y = β₀ + β₁x + ε:
//   β̂_OLS = Σ (xᵢ - x̄)(yᵢ - ȳ) / Σ (xᵢ - x̄)²
//   β̂_alt = simple slope between first and last point ((y_n - y_1)/(x_n - x_1)) — unbiased but inefficient
import { useState, useMemo } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 280;
const PAD_L = 50, PAD_R = 14, PAD_T = 20, PAD_B = 32;
const PW = W - PAD_L - PAD_R, PH = H - PAD_T - PAD_B;

export default function GaussMarkovBlueDemo() {
  const [n, setN] = useState(15);
  const [sigma, setSigma] = useState(1);
  const [seed, setSeed] = useState(0);

  const trueB1 = 0.5;
  const trueB0 = 1;

  const { ols, alt, two, theoryVarOLS, theoryVarAlt, theoryVar2pt } = useMemo(() => {
    const rng = S.mulberry32(seed * 113 + 1);
    const NUM_TRIALS = 1000;
    const olsAll = [], altAll = [], twoPtAll = [];

    // Fixed X for fair comparison
    const X = Array.from({ length: n }, (_, i) => i * 0.5);
    const xbar = X.reduce((a, b) => a + b, 0) / n;
    const Sxx = X.reduce((a, x) => a + (x - xbar) ** 2, 0);

    for (let t = 0; t < NUM_TRIALS; t++) {
      const Y = X.map((x) => trueB0 + trueB1 * x + S.sampleNormal(rng, 0, sigma));
      const ybar = Y.reduce((a, b) => a + b, 0) / n;
      // OLS
      const olsB1 = X.reduce((a, x, i) => a + (x - xbar) * (Y[i] - ybar), 0) / Sxx;
      olsAll.push(olsB1);
      // Two-point (use first and last)
      twoPtAll.push((Y[n - 1] - Y[0]) / (X[n - 1] - X[0]));
      // Alternative: weighted estimator using just first and last halves
      const half = Math.floor(n / 2);
      const firstHalfX = X.slice(0, half).reduce((a, b) => a + b, 0) / half;
      const firstHalfY = Y.slice(0, half).reduce((a, b) => a + b, 0) / half;
      const lastHalfX = X.slice(n - half).reduce((a, b) => a + b, 0) / half;
      const lastHalfY = Y.slice(n - half).reduce((a, b) => a + b, 0) / half;
      altAll.push((lastHalfY - firstHalfY) / (lastHalfX - firstHalfX));
    }

    // theoretical variances
    const varOLS = sigma * sigma / Sxx;
    const var2pt = (2 * sigma * sigma) / Math.pow(X[n - 1] - X[0], 2);
    // alternative (split-half): Var = σ²/(half² · (lastHalfX - firstHalfX)²) · 2 (correlated? no, independent halves)
    const half = Math.floor(n / 2);
    const fhx = X.slice(0, half).reduce((a, b) => a + b, 0) / half;
    const lhx = X.slice(n - half).reduce((a, b) => a + b, 0) / half;
    const varAlt = (2 * sigma * sigma / half) / Math.pow(lhx - fhx, 2);

    return {
      ols: { mean: olsAll.reduce((a, b) => a + b, 0) / NUM_TRIALS, var: variance(olsAll) },
      alt: { mean: altAll.reduce((a, b) => a + b, 0) / NUM_TRIALS, var: variance(altAll) },
      two: { mean: twoPtAll.reduce((a, b) => a + b, 0) / NUM_TRIALS, var: variance(twoPtAll) },
      theoryVarOLS: varOLS, theoryVarAlt: varAlt, theoryVar2pt: var2pt,
    };
  }, [n, sigma, seed]);

  function variance(arr) {
    const m = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((a, b) => a + (b - m) ** 2, 0) / (arr.length - 1);
  }

  const ROWS = [
    { label: "OLS (BLUE)", color: "var(--accent)", v: ols, th: theoryVarOLS },
    { label: "split-half", color: "var(--accent-line)", v: alt, th: theoryVarAlt },
    { label: "2-point", color: "oklch(0.65 0.18 264)", v: two, th: theoryVar2pt },
  ];

  const maxVar = Math.max(...ROWS.map((r) => r.v.var)) * 1.15;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <line x1={PAD_L} y1={PAD_T + PH} x2={PAD_L + PW} y2={PAD_T + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} stroke="var(--line-strong)" />

        <text x={PAD_L} y={PAD_T - 6} fontSize="10.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">empirický Var(β̂₁) přes 1000 vzorků</text>

        {ROWS.map((r, i) => {
          const cx = PAD_L + (i + 0.5) * (PW / 3);
          const bw = 80;
          const h = (r.v.var / maxVar) * PH;
          return (
            <g key={i}>
              <rect x={cx - bw / 2} y={PAD_T + PH - h} width={bw} height={h} fill={r.color} opacity="0.7" />
              <text x={cx} y={PAD_T + PH + 14} textAnchor="middle" fontSize="10.5" fill={r.color} fontFamily="var(--font-mono)">{r.label}</text>
              <text x={cx} y={PAD_T + PH + 26} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">Var={r.v.var.toFixed(4)}</text>
              {/* theoretical line */}
              <line x1={cx - bw / 2 - 4} y1={PAD_T + PH - (r.th / maxVar) * PH} x2={cx + bw / 2 + 4} y2={PAD_T + PH - (r.th / maxVar) * PH}
                stroke="var(--text)" strokeWidth="1.5" strokeDasharray="3 2" />
            </g>
          );
        })}
        <g transform={`translate(${W - 160}, ${PAD_T + 4})`} fontSize="10" fontFamily="var(--font-mono)">
          <line x1="0" y1="6" x2="14" y2="6" stroke="var(--text)" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="18" y="9" fill="var(--text-muted)">teoretický Var</text>
        </g>
      </svg>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <label style={lab()}>n = {n}
          <input type="range" min={6} max={50} value={n} onChange={(e) => setN(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>σ = {sigma.toFixed(2)}
          <input type="range" min={0.2} max={3} step={0.05} value={sigma} onChange={(e) => setSigma(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <button onClick={() => setSeed(seed + 1)} style={btn(false)}>nový seed</button>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        Všechny tři odhady jsou *lineární* a *nestranné* (E[β̂] = β₁ = {trueB1}). Gauss-Markov garantuje, že OLS má *nejmenší* rozptyl mezi takovými odhady.
        <br />
        Empirické střední hodnoty: OLS={ols.mean.toFixed(3)}, split={alt.mean.toFixed(3)}, 2pt={two.mean.toFixed(3)}.
      </div>
    </div>
  );
}

function btn(active) { return { padding: "4px 10px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
function lab() { return { flex: "1 1 180px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }; }
