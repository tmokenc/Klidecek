// CLT demo — pick source distribution, sample sums of X̄_n, compare to N(μ, σ²/n).
// Demonstrates LLN + CLT and how it fails for distributions without finite variance.
import { useState, useMemo } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 280;
const PAD_L = 40, PAD_R = 12, PAD_T = 20, PAD_B = 32;
const PW = W - PAD_L - PAD_R, PH = H - PAD_T - PAD_B;

const SOURCES = {
  uniform:    { label: "U(0, 1)", mean: 0.5, var: 1 / 12, support: [0, 1] },
  exponential:{ label: "Exp(1)",  mean: 1,   var: 1,      support: [0, 6] },
  bimodal:    { label: "bimodální (0.5·N(-1.5,.4²)+0.5·N(1.5,.4²))", mean: 0, var: 0.5 * (0.4*0.4 + 1.5*1.5) + 0.5 * (0.4*0.4 + 1.5*1.5) - 0, support: [-3, 3] },
  skewed:     { label: "skewed (Γ(2, 0.5))", mean: 1, var: 0.5, support: [0, 5] },
  cauchy:     { label: "Cauchy — bez E[X], CLT selhává", mean: NaN, var: NaN, support: [-6, 6] },
};

// Note: bimodal var is computed by mixture formula: σ² = Σw_i(σ_i² + (μ_i - μ)²)
// Here μ=0, so σ² = 0.5·(.16 + 2.25) + 0.5·(.16 + 2.25) = 2.41.
SOURCES.bimodal.var = 2.41;

function sample(rng, src) {
  switch (src) {
    case "uniform": return rng();
    case "exponential": return S.sampleExp(rng, 1);
    case "bimodal": return (rng() < 0.5 ? -1.5 : 1.5) + S.sampleNormal(rng, 0, 0.4);
    case "skewed": return S.sampleGamma(rng, 2, 0.5);
    case "cauchy": return Math.tan(Math.PI * (rng() - 0.5));  // standard Cauchy via inverse CDF
    default: return 0;
  }
}

export default function CltSamplingConverge() {
  const [src, setSrc] = useState("exponential");
  const [n, setN] = useState(30);
  const [seed, setSeed] = useState(42);

  const numTrials = 600;
  const means = useMemo(() => {
    const rng = S.mulberry32(seed);
    const out = new Float64Array(numTrials);
    for (let t = 0; t < numTrials; t++) {
      let sum = 0;
      for (let i = 0; i < n; i++) sum += sample(rng, src);
      out[t] = sum / n;
    }
    return out;
  }, [src, n, seed]);

  const m = SOURCES[src];

  // For histogram axis, use either theoretical CLT bounds or empirical percentiles for Cauchy
  let xMin, xMax;
  if (src === "cauchy") {
    const sorted = Array.from(means).sort((a, b) => a - b);
    xMin = sorted[Math.floor(numTrials * 0.05)];
    xMax = sorted[Math.floor(numTrials * 0.95)];
    const span = xMax - xMin;
    xMin -= span * 0.2; xMax += span * 0.2;
  } else {
    const sd = Math.sqrt(m.var / n);
    xMin = m.mean - 4 * sd;
    xMax = m.mean + 4 * sd;
  }

  const BINS = 40;
  const hist = new Int32Array(BINS);
  for (let i = 0; i < means.length; i++) {
    const idx = Math.floor(((means[i] - xMin) / (xMax - xMin)) * BINS);
    if (idx >= 0 && idx < BINS) hist[idx]++;
  }
  const binW = (xMax - xMin) / BINS;
  const histDensity = Array.from(hist).map((c) => c / (means.length * binW));
  const yMax = Math.max(...histDensity, src === "cauchy" ? 0.3 : 1 / Math.sqrt(2 * Math.PI * m.var / n)) * 1.15;

  const toX = (x) => PAD_L + ((x - xMin) / (xMax - xMin)) * PW;
  const toY = (y) => PAD_T + PH - (y / yMax) * PH;

  // Theoretical CLT curve N(μ, σ²/n)
  const cltCurve = [];
  if (src !== "cauchy") {
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const x = xMin + (i / N) * (xMax - xMin);
      cltCurve.push([x, S.normalPDF(x, m.mean, Math.sqrt(m.var / n))]);
    }
  }

  const empMean = Array.from(means).reduce((a, b) => a + b, 0) / numTrials;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.entries(SOURCES).map(([key, s]) => (
          <button key={key} onClick={() => setSrc(key)}
            style={{
              padding: "3px 8px", fontSize: 10.5,
              border: "1px solid " + (src === key ? "var(--accent)" : "var(--line)"),
              background: src === key ? "var(--bg-inset)" : "var(--bg-card)",
              color: src === key ? "var(--accent)" : "var(--text)",
              borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)",
            }}
          >{s.label}</button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <line x1={PAD_L} y1={PAD_T + PH} x2={PAD_L + PW} y2={PAD_T + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} stroke="var(--line-strong)" />

        {/* histogram */}
        {histDensity.map((d, i) => {
          const x0 = xMin + i * binW;
          return <rect key={i} x={toX(x0)} y={toY(d)} width={Math.max(1, toX(x0 + binW) - toX(x0) - 1)} height={PAD_T + PH - toY(d)} fill="var(--accent)" opacity="0.5" />;
        })}

        {/* CLT curve */}
        {cltCurve.length > 0 && (
          <path d={cltCurve.map(([x, y], i) => `${i ? "L" : "M"} ${toX(x).toFixed(2)} ${toY(y).toFixed(2)}`).join(" ")}
            fill="none" stroke="var(--accent-line)" strokeWidth="2" />
        )}

        {/* μ markers */}
        {!isNaN(m.mean) && (
          <>
            <line x1={toX(m.mean)} y1={PAD_T} x2={toX(m.mean)} y2={PAD_T + PH} stroke="var(--accent-line)" strokeDasharray="3 3" />
            <text x={toX(m.mean)} y={PAD_T - 4} fontSize="10" textAnchor="middle" fill="var(--accent-line)" fontFamily="var(--font-mono)">μ</text>
          </>
        )}

        {/* x ticks */}
        {[0, 0.5, 1].map((t, i) => {
          const v = xMin + t * (xMax - xMin);
          return (
            <g key={i}>
              <line x1={toX(v)} y1={PAD_T + PH} x2={toX(v)} y2={PAD_T + PH + 4} stroke="var(--line-strong)" />
              <text x={toX(v)} y={PAD_T + PH + 14} fontSize="9.5" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v.toFixed(2)}</text>
            </g>
          );
        })}

        {/* legend */}
        <g transform={`translate(${W - 200}, ${PAD_T + 6})`} fontSize="10.5" fontFamily="var(--font-mono)">
          <rect x="0" y="0" width="14" height="9" fill="var(--accent)" opacity="0.5" />
          <text x="18" y="8" fill="var(--text-muted)">histogram X̄_n ({numTrials} pokusů)</text>
          {cltCurve.length > 0 && (
            <>
              <line x1="0" y1="22" x2="14" y2="22" stroke="var(--accent-line)" strokeWidth="2" />
              <text x="18" y="25" fill="var(--text-muted)">N(μ, σ²/n)</text>
            </>
          )}
        </g>
      </svg>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <label style={{ flex: "1 1 200px", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
          n = {n}
          <input type="range" min={1} max={200} value={n} onChange={(e) => setN(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <button onClick={() => setSeed(seed + 1)} style={{ padding: "5px 14px", fontSize: 11, border: "1px solid var(--line)", background: "var(--bg-card)", color: "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }}>
          nový seed ({seed})
        </button>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        empirický průměr X̄ = {empMean.toFixed(3)} {!isNaN(m.mean) && `· teoreticky μ = ${m.mean}`}
        {src === "cauchy" && " · Cauchy: histogram se NEzužuje s n — žádná E[X], CLT neplatí."}
      </div>
    </div>
  );
}
