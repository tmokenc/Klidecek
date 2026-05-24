// Beta-Bernoulli conjugate update — prior Beta(α, β) + Bernoulli data → posterior Beta(α+k, β+n−k).
import { useState } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 280;
const PAD_L = 40, PAD_R = 14, PAD_T = 22, PAD_B = 30;
const PW = W - PAD_L - PAD_R, PH = H - PAD_T - PAD_B;

export default function BayesianUpdateBeta() {
  const [alpha, setAlpha] = useState(2);
  const [beta, setBeta] = useState(2);
  const [successes, setSuccesses] = useState(0);
  const [failures, setFailures] = useState(0);

  const postA = alpha + successes;
  const postB = beta + failures;
  const n = successes + failures;
  const mleP = n > 0 ? successes / n : null;
  const postMean = postA / (postA + postB);
  const priorMean = alpha / (alpha + beta);

  // MAP for Beta(α, β) on (0,1): (α−1)/(α+β−2) when α, β > 1
  const mapPost = (postA > 1 && postB > 1) ? (postA - 1) / (postA + postB - 2) : null;

  // 95% credible interval (quantiles of Beta)
  const credLo = invertBeta(0.025, postA, postB);
  const credHi = invertBeta(0.975, postA, postB);

  // sample curves
  const N = 200;
  const xs = new Float64Array(N + 1);
  for (let i = 0; i <= N; i++) xs[i] = i / N;
  const priorYs = Array.from(xs, (x) => S.betaPDF(x, alpha, beta));
  const postYs  = Array.from(xs, (x) => S.betaPDF(x, postA, postB));
  const yMax = Math.max(...priorYs, ...postYs) * 1.12;

  const toX = (p) => PAD_L + p * PW;
  const toY = (y) => PAD_T + PH - (y / yMax) * PH;

  const pathOf = (ys) => Array.from(xs).map((x, i) => `${i ? "L" : "M"} ${toX(x).toFixed(2)} ${toY(ys[i]).toFixed(2)}`).join(" ");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setSuccesses(successes + 1)} style={btn("var(--accent)")}>+ úspěch (1)</button>
        <button onClick={() => setFailures(failures + 1)} style={btn("var(--accent-line)")}>+ neúspěch (0)</button>
        <button onClick={() => { setSuccesses(0); setFailures(0); }} style={btn()}>reset dat</button>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginLeft: 8 }}>
          k = {successes}, n−k = {failures}, n = {n}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <line x1={PAD_L} y1={PAD_T + PH} x2={PAD_L + PW} y2={PAD_T + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} stroke="var(--line-strong)" />

        {/* prior */}
        <path d={pathOf(priorYs)} fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="4 3" opacity="0.7" />
        {/* posterior */}
        <path d={pathOf(postYs)} fill="none" stroke="var(--accent)" strokeWidth="2.5" />

        {/* credible interval shading */}
        {n > 0 && (
          <rect x={toX(credLo)} y={PAD_T} width={toX(credHi) - toX(credLo)} height={PH} fill="var(--accent)" opacity="0.08" />
        )}

        {/* mean markers */}
        <line x1={toX(priorMean)} y1={PAD_T + PH - 6} x2={toX(priorMean)} y2={PAD_T + PH + 4} stroke="var(--text-muted)" strokeWidth="1.5" />
        <line x1={toX(postMean)} y1={PAD_T + PH - 6} x2={toX(postMean)} y2={PAD_T + PH + 4} stroke="var(--accent)" strokeWidth="2" />
        {mleP !== null && (
          <line x1={toX(mleP)} y1={PAD_T + PH - 6} x2={toX(mleP)} y2={PAD_T + PH + 4} stroke="var(--accent-line)" strokeWidth="2" />
        )}

        {/* x ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <g key={i}>
            <line x1={toX(t)} y1={PAD_T + PH} x2={toX(t)} y2={PAD_T + PH + 3} stroke="var(--line-strong)" />
            <text x={toX(t)} y={PAD_T + PH + 14} fontSize="9.5" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)">{t.toFixed(2)}</text>
          </g>
        ))}
        <text x={W - 10} y={H - 8} fontSize="10" textAnchor="end" fill="var(--text-muted)" fontFamily="var(--font-mono)">θ</text>

        {/* legend */}
        <g transform={`translate(${PAD_L + 8}, ${PAD_T + 8})`} fontSize="10.5" fontFamily="var(--font-mono)">
          <line x1="0" y1="6" x2="14" y2="6" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="4 3" />
          <text x="18" y="9" fill="var(--text-muted)">prior Beta({alpha.toFixed(1)}, {beta.toFixed(1)})</text>
          <line x1="0" y1="22" x2="14" y2="22" stroke="var(--accent)" strokeWidth="2.5" />
          <text x="18" y="25" fill="var(--accent)">posterior Beta({postA.toFixed(1)}, {postB.toFixed(1)})</text>
        </g>
      </svg>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <label style={lab()}>α = {alpha.toFixed(1)}
          <input type="range" min={0.5} max={10} step={0.1} value={alpha} onChange={(e) => setAlpha(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>β = {beta.toFixed(1)}
          <input type="range" min={0.5} max={10} step={0.1} value={beta} onChange={(e) => setBeta(+e.target.value)} style={{ width: "100%" }} />
        </label>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        prior E[θ] = α/(α+β) = {priorMean.toFixed(3)} · posterior E[θ|x] = (α+k)/(α+β+n) = <strong>{postMean.toFixed(3)}</strong>
        {mapPost !== null && <> · MAP θ̂ = (α+k−1)/(α+β+n−2) = {mapPost.toFixed(3)}</>}
        {mleP !== null && <> · MLE p̂ = k/n = {mleP.toFixed(3)}</>}
        {n > 0 && <><br />95% credible interval: [{credLo.toFixed(3)}, {credHi.toFixed(3)}]</>}
      </div>
    </div>
  );
}

function invertBeta(p, a, b) {
  // bisect Beta CDF
  let lo = 0, hi = 1;
  for (let i = 0; i < 60; i++) {
    const m = (lo + hi) / 2;
    if (S.betaCDF(m, a, b) < p) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}

function btn(color) {
  return { padding: "4px 10px", fontSize: 11, border: "1px solid " + (color || "var(--line)"), background: "var(--bg-card)", color: color || "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" };
}
function lab() {
  return { flex: "1 1 200px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" };
}
