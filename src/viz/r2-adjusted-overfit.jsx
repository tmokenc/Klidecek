// R² vs adjusted R² vs R²_pred (PRESS) — adding noise predictors makes R²
// keep growing but adjusted/predictive measures decay.
import { useState, useMemo } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 280;
const PAD_L = 50, PAD_R = 14, PAD_T = 18, PAD_B = 34;
const PW = W - PAD_L - PAD_R, PH = H - PAD_T - PAD_B;

// QR-less direct OLS via normal equations for design X (n×k); solve X'X β = X'y
function solveOLS(X, y) {
  const n = X.length;
  const k = X[0].length;
  // XtX (k×k)
  const XtX = Array.from({ length: k }, () => new Array(k).fill(0));
  const Xty = new Array(k).fill(0);
  for (let i = 0; i < n; i++) {
    for (let a = 0; a < k; a++) {
      Xty[a] += X[i][a] * y[i];
      for (let b = 0; b < k; b++) XtX[a][b] += X[i][a] * X[i][b];
    }
  }
  // Solve via Gauss-Jordan
  const M = XtX.map((row, i) => [...row, Xty[i]]);
  for (let i = 0; i < k; i++) {
    let piv = i;
    for (let r = i + 1; r < k; r++) if (Math.abs(M[r][i]) > Math.abs(M[piv][i])) piv = r;
    [M[i], M[piv]] = [M[piv], M[i]];
    if (Math.abs(M[i][i]) < 1e-12) return null;
    for (let j = 0; j < k; j++) if (j !== i) {
      const f = M[j][i] / M[i][i];
      for (let c = i; c <= k; c++) M[j][c] -= f * M[i][c];
    }
  }
  const out = new Array(k);
  for (let i = 0; i < k; i++) out[i] = M[i][k] / M[i][i];
  return out;
}

// Compute hat matrix diagonal h_ii via Cholesky inverse — simpler: compute via M^-1
function fitWithLeverage(X, y) {
  const n = X.length, k = X[0].length;
  const beta = solveOLS(X, y);
  if (!beta) return null;
  const yhat = X.map((row) => row.reduce((s, v, j) => s + v * beta[j], 0));
  const resid = y.map((yi, i) => yi - yhat[i]);
  const RSS = resid.reduce((a, r) => a + r * r, 0);
  const ybar = y.reduce((a, b) => a + b, 0) / n;
  const TSS = y.reduce((a, yi) => a + (yi - ybar) ** 2, 0);
  const R2 = TSS > 0 ? 1 - RSS / TSS : 0;
  const R2adj = 1 - (1 - R2) * (n - 1) / Math.max(1, n - k);

  // Compute h_ii via (XtX)^-1 — use Gauss-Jordan to invert XtX
  const XtX = Array.from({ length: k }, () => new Array(k).fill(0));
  for (let i = 0; i < n; i++) for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) XtX[a][b] += X[i][a] * X[i][b];
  // Gauss-Jordan inverse
  const I = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => (i === j ? 1 : 0)));
  const aug = XtX.map((row, i) => [...row, ...I[i]]);
  for (let i = 0; i < k; i++) {
    let piv = i;
    for (let r = i + 1; r < k; r++) if (Math.abs(aug[r][i]) > Math.abs(aug[piv][i])) piv = r;
    [aug[i], aug[piv]] = [aug[piv], aug[i]];
    if (Math.abs(aug[i][i]) < 1e-12) return null;
    const pv = aug[i][i];
    for (let c = 0; c < 2 * k; c++) aug[i][c] /= pv;
    for (let j = 0; j < k; j++) if (j !== i) {
      const f = aug[j][i];
      for (let c = 0; c < 2 * k; c++) aug[j][c] -= f * aug[i][c];
    }
  }
  const inv = aug.map((row) => row.slice(k));
  // h_ii = x_i' (XtX)^-1 x_i
  const h = X.map((row) => {
    let s = 0;
    for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) s += row[a] * inv[a][b] * row[b];
    return s;
  });
  // PRESS = Σ (resid_i / (1 - h_i))²
  const PRESS = resid.reduce((a, r, i) => a + (r / Math.max(1e-9, 1 - h[i])) ** 2, 0);
  const R2pred = TSS > 0 ? 1 - PRESS / TSS : 0;
  return { R2, R2adj, R2pred, RSS, PRESS };
}

export default function R2AdjustedOverfit() {
  const [n, setN] = useState(30);
  const [pMax, setPMax] = useState(15);  // up to how many noise predictors
  const [signalStrength, setSignalStrength] = useState(1);
  const [seed, setSeed] = useState(1);

  const results = useMemo(() => {
    const rng = S.mulberry32(seed * 911 + 1);
    // Build design with: intercept + one real predictor + p-1 noise predictors
    const X = [];
    const y = [];
    const realX = [];
    for (let i = 0; i < n; i++) {
      const xreal = S.sampleNormal(rng, 0, 1);
      realX.push(xreal);
      y.push(signalStrength * xreal + S.sampleNormal(rng, 0, 1));
    }
    const noisePreds = [];
    for (let p = 0; p < pMax; p++) {
      noisePreds.push(Array.from({ length: n }, () => S.sampleNormal(rng, 0, 1)));
    }
    const out = [];
    for (let k = 0; k <= pMax; k++) {
      const design = realX.map((x, i) => {
        const row = [1, x];
        for (let p = 0; p < k; p++) row.push(noisePreds[p][i]);
        return row;
      });
      const fit = fitWithLeverage(design, y);
      if (fit) out.push({ k, ...fit });
    }
    return out;
  }, [n, pMax, signalStrength, seed]);

  const xMin = 0, xMax = pMax;
  const yMin = -0.5, yMax = 1;
  const toX = (k) => PAD_L + ((k - xMin) / (xMax - xMin)) * PW;
  const toY = (v) => PAD_T + PH - ((v - yMin) / (yMax - yMin)) * PH;

  const pathOf = (key) => results.map((r, i) => `${i ? "L" : "M"} ${toX(r.k).toFixed(2)} ${toY(r[key]).toFixed(2)}`).join(" ");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <line x1={PAD_L} y1={PAD_T + PH} x2={PAD_L + PW} y2={PAD_T + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} stroke="var(--line-strong)" />

        {/* R² */}
        <path d={pathOf("R2")} fill="none" stroke="var(--accent)" strokeWidth="2" />
        {results.map((r, i) => <circle key={`r-${i}`} cx={toX(r.k)} cy={toY(r.R2)} r="2.5" fill="var(--accent)" />)}

        {/* R²_adj */}
        <path d={pathOf("R2adj")} fill="none" stroke="var(--accent-line)" strokeWidth="2" />
        {results.map((r, i) => <circle key={`a-${i}`} cx={toX(r.k)} cy={toY(r.R2adj)} r="2.5" fill="var(--accent-line)" />)}

        {/* R²_pred */}
        <path d={pathOf("R2pred")} fill="none" stroke="var(--text-muted)" strokeWidth="2" />
        {results.map((r, i) => <circle key={`p-${i}`} cx={toX(r.k)} cy={toY(r.R2pred)} r="2.5" fill="var(--text-muted)" />)}

        {/* axis ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const v = yMin + t * (yMax - yMin);
          return (
            <g key={t}>
              <line x1={PAD_L - 4} y1={toY(v)} x2={PAD_L} y2={toY(v)} stroke="var(--line-strong)" />
              <text x={PAD_L - 6} y={toY(v) + 3} fontSize="9.5" textAnchor="end" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v.toFixed(2)}</text>
            </g>
          );
        })}
        {[0, 5, 10, 15].map((k) => k <= xMax && (
          <g key={k}>
            <line x1={toX(k)} y1={PAD_T + PH} x2={toX(k)} y2={PAD_T + PH + 4} stroke="var(--line-strong)" />
            <text x={toX(k)} y={PAD_T + PH + 14} fontSize="9.5" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)">{k}</text>
          </g>
        ))}

        <text x={PAD_L + PW} y={H - 6} fontSize="10" textAnchor="end" fill="var(--text-muted)" fontFamily="var(--font-mono)">počet šumových prediktorů →</text>

        {/* legend */}
        <g transform={`translate(${PAD_L + 20}, ${PAD_T + 6})`} fontSize="10.5" fontFamily="var(--font-mono)">
          <line x1="0" y1="6" x2="14" y2="6" stroke="var(--accent)" strokeWidth="2" />
          <text x="18" y="9" fill="var(--accent)">R²</text>
          <line x1="60" y1="6" x2="74" y2="6" stroke="var(--accent-line)" strokeWidth="2" />
          <text x="78" y="9" fill="var(--accent-line)">R²_adj</text>
          <line x1="150" y1="6" x2="164" y2="6" stroke="var(--text-muted)" strokeWidth="2" />
          <text x="168" y="9" fill="var(--text-muted)">R²_pred (PRESS)</text>
        </g>
      </svg>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <label style={lab()}>n = {n}
          <input type="range" min={10} max={100} value={n} onChange={(e) => setN(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>signal β = {signalStrength.toFixed(2)}
          <input type="range" min={0} max={3} step={0.1} value={signalStrength} onChange={(e) => setSignalStrength(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <button onClick={() => setSeed(seed + 1)} style={btn(false)}>nový vzorek</button>
      </div>
      <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
        R² nikdy neklesá s přidáním šumového prediktoru. R²_adj klesá, jakmile penalty &gt; přírůstek vysvětlené variability. R²_pred (PRESS) odhaluje overfitting silněji — může jít i pod 0.
      </div>
    </div>
  );
}

function btn(active) { return { padding: "4px 10px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
function lab() { return { flex: "1 1 180px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }; }
