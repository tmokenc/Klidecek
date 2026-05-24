// Bias-variance MSE decomposition for estimators of μ
// (mean, median, trimmed mean) on data with outlier contamination.
import { useState, useMemo } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 280;
const PAD_L = 50, PAD_R = 14, PAD_T = 20, PAD_B = 36;
const PW = W - PAD_L - PAD_R, PH = H - PAD_T - PAD_B;

function trimmedMean(arr, frac) {
  const sorted = [...arr].sort((a, b) => a - b);
  const k = Math.floor(arr.length * frac);
  const t = sorted.slice(k, sorted.length - k);
  return t.reduce((a, b) => a + b, 0) / t.length;
}
function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const n = s.length;
  return n % 2 === 0 ? (s[n / 2 - 1] + s[n / 2]) / 2 : s[(n - 1) / 2];
}
function mean(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }

export default function BiasVarianceMse() {
  const [contam, setContam] = useState(0.1);
  const [outlierShift, setOutlierShift] = useState(10);
  const [n, setN] = useState(30);
  const [seed, setSeed] = useState(1);

  const trueMu = 0;
  const numTrials = 500;

  const results = useMemo(() => {
    const rng = S.mulberry32(seed * 79 + 1);
    const all = { mean: [], median: [], trim10: [], trim25: [] };
    for (let t = 0; t < numTrials; t++) {
      const sample = [];
      for (let i = 0; i < n; i++) {
        if (rng() < contam) sample.push(S.sampleNormal(rng, outlierShift, 1));
        else sample.push(S.sampleNormal(rng, trueMu, 1));
      }
      all.mean.push(mean(sample));
      all.median.push(median(sample));
      all.trim10.push(trimmedMean(sample, 0.1));
      all.trim25.push(trimmedMean(sample, 0.25));
    }
    return all;
  }, [contam, outlierShift, n, seed]);

  function stats(arr) {
    const bias = mean(arr) - trueMu;
    const v = mean(arr.map((x) => (x - mean(arr)) ** 2));
    const mse = mean(arr.map((x) => (x - trueMu) ** 2));
    return { bias, variance: v, mse };
  }

  const stMean = stats(results.mean);
  const stMedian = stats(results.median);
  const stTrim10 = stats(results.trim10);
  const stTrim25 = stats(results.trim25);

  const ROWS = [
    { label: "X̄ (mean)", color: "var(--accent)", s: stMean },
    { label: "med", color: "var(--accent-line)", s: stMedian },
    { label: "trim 10%", color: "oklch(0.65 0.18 264)", s: stTrim10 },
    { label: "trim 25%", color: "oklch(0.55 0.18 30)", s: stTrim25 },
  ];

  // Plot: side-by-side bias² and variance bars per estimator (stacked → MSE)
  const maxMSE = Math.max(...ROWS.map((r) => r.s.mse)) * 1.15;
  const colW = PW / 4;
  const toBarH = (v) => (v / maxMSE) * PH;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <line x1={PAD_L} y1={PAD_T + PH} x2={PAD_L + PW} y2={PAD_T + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} stroke="var(--line-strong)" />

        {ROWS.map((r, i) => {
          const cx = PAD_L + i * colW + colW / 2;
          const bw = Math.min(50, colW * 0.5);
          const biasSq = r.s.bias * r.s.bias;
          const yBase = PAD_T + PH;
          const hVar = toBarH(r.s.variance);
          const hBiasSq = toBarH(biasSq);
          return (
            <g key={i}>
              {/* Variance bar (bottom) */}
              <rect x={cx - bw / 2} y={yBase - hVar} width={bw} height={hVar} fill={r.color} opacity="0.7" />
              {/* Bias² bar (on top) */}
              <rect x={cx - bw / 2} y={yBase - hVar - hBiasSq} width={bw} height={hBiasSq} fill={r.color} opacity="0.3" stroke={r.color} strokeWidth="1" />
              <text x={cx} y={yBase + 14} textAnchor="middle" fontSize="10.5" fill={r.color} fontFamily="var(--font-mono)">{r.label}</text>
              <text x={cx} y={yBase + 26} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">MSE={r.s.mse.toFixed(3)}</text>
              <text x={cx} y={yBase - hVar - hBiasSq - 6} textAnchor="middle" fontSize="9.5" fill={r.color} fontFamily="var(--font-mono)">bias²={biasSq.toFixed(3)}</text>
              <text x={cx} y={yBase - hVar / 2 + 3} textAnchor="middle" fontSize="9.5" fill="white">var={r.s.variance.toFixed(3)}</text>
            </g>
          );
        })}

        <text x={PAD_L - 6} y={PAD_T + 8} fontSize="10" textAnchor="end" fill="var(--text-muted)" fontFamily="var(--font-mono)">MSE</text>
      </svg>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <label style={lab()}>kontaminace = {(contam * 100).toFixed(0)}%
          <input type="range" min={0} max={0.4} step={0.01} value={contam} onChange={(e) => setContam(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>outlier shift = {outlierShift.toFixed(1)}
          <input type="range" min={0} max={20} step={0.5} value={outlierShift} onChange={(e) => setOutlierShift(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>n = {n}
          <input type="range" min={5} max={100} value={n} onChange={(e) => setN(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <button onClick={() => setSeed(seed + 1)} style={btn(false)}>nový seed</button>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        MSE = bias² + variance. Pro čistá normální data: X̄ nejlepší (efektivní). Při kontaminaci (outliers): medián a trimmed mean *robustnější* — menší bias, mírně vyšší rozptyl.
      </div>
    </div>
  );
}

function btn(active) { return { padding: "4px 10px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
function lab() { return { flex: "1 1 180px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }; }
