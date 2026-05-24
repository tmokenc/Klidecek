// 95% CI repeated-sampling demo — generate K samples from N(μ, σ²);
// each yields a CI. Red CIs miss μ. Empirical coverage shown live.
import { useState, useMemo } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 360;
const PAD_L = 50, PAD_R = 14, PAD_T = 26, PAD_B = 30;
const PW = W - PAD_L - PAD_R, PH = H - PAD_T - PAD_B;

export default function CiRepeatedSampling() {
  const [n, setN] = useState(20);
  const [alpha, setAlpha] = useState(0.05);
  const [knownSigma, setKnownSigma] = useState(true);
  const [seed, setSeed] = useState(1);

  const mu = 0;
  const sigma = 1;
  const K = 80;  // number of CIs

  const cis = useMemo(() => {
    const rng = S.mulberry32(seed * 211 + 3);
    const out = [];
    const zCrit = S.normalQuantile(1 - alpha / 2);
    const tCrit = S.tQuantile(1 - alpha / 2, n - 1);
    for (let k = 0; k < K; k++) {
      let sum = 0, sq = 0;
      for (let i = 0; i < n; i++) {
        const x = S.sampleNormal(rng, mu, sigma);
        sum += x; sq += x * x;
      }
      const xbar = sum / n;
      const s2 = (sq - n * xbar * xbar) / (n - 1);
      const s = Math.sqrt(Math.max(s2, 0));
      const half = knownSigma ? (zCrit * sigma) / Math.sqrt(n) : (tCrit * s) / Math.sqrt(n);
      out.push({ xbar, lo: xbar - half, hi: xbar + half, miss: (mu < xbar - half) || (mu > xbar + half) });
    }
    return out;
  }, [n, alpha, knownSigma, seed]);

  const coverage = cis.filter((c) => !c.miss).length / K;

  const xMin = -1.8, xMax = 1.8;
  const toX = (x) => PAD_L + ((x - xMin) / (xMax - xMin)) * PW;
  const rowH = PH / K;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button onClick={() => setKnownSigma(true)} style={btn(knownSigma)}>známé σ (z)</button>
        <button onClick={() => setKnownSigma(false)} style={btn(!knownSigma)}>neznámé σ (Studentovo t)</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {/* μ vertical reference */}
        <line x1={toX(mu)} y1={PAD_T} x2={toX(mu)} y2={PAD_T + PH} stroke="var(--text)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
        <text x={toX(mu)} y={PAD_T - 8} textAnchor="middle" fontSize="11" fill="var(--text)" fontFamily="var(--font-mono)">μ = 0</text>

        {/* x ticks */}
        {[-1.5, -1, -0.5, 0, 0.5, 1, 1.5].map((v) => (
          <g key={v}>
            <line x1={toX(v)} y1={PAD_T + PH} x2={toX(v)} y2={PAD_T + PH + 4} stroke="var(--line-strong)" />
            <text x={toX(v)} y={PAD_T + PH + 14} textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v}</text>
          </g>
        ))}

        {/* CIs */}
        {cis.map((c, i) => {
          const y = PAD_T + (i + 0.5) * rowH;
          const col = c.miss ? "var(--accent-line)" : "var(--accent)";
          return (
            <g key={i}>
              <line x1={toX(c.lo)} y1={y} x2={toX(c.hi)} y2={y} stroke={col} strokeWidth="1.2" />
              <circle cx={toX(c.xbar)} cy={y} r="1.5" fill={col} />
            </g>
          );
        })}

        {/* coverage box */}
        <g transform={`translate(${W - 160}, ${PAD_T + 6})`} fontSize="10.5" fontFamily="var(--font-mono)">
          <text x="0" y="0" fill="var(--text-muted)">empirické pokrytí</text>
          <text x="0" y="16" fontSize="14" fill="var(--accent)">{(coverage * 100).toFixed(1)}%</text>
          <text x="0" y="34" fill="var(--text-muted)">cíl: {((1 - alpha) * 100).toFixed(0)}%</text>
          <text x="0" y="52" fill="var(--accent-line)">{cis.filter((c) => c.miss).length}/{K} miss</text>
        </g>
      </svg>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <label style={lab()}>n = {n}
          <input type="range" min={3} max={100} value={n} onChange={(e) => setN(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>α = {alpha.toFixed(3)}
          <input type="range" min={0.01} max={0.3} step={0.01} value={alpha} onChange={(e) => setAlpha(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <button onClick={() => setSeed(seed + 1)} style={btn(false)}>nový seed</button>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
        {K} CI vzorků z N(0, 1) o velikosti n. Při α={alpha.toFixed(2)} by ≈{(alpha * K).toFixed(0)} z {K} CI mělo *minout* μ (červeně).
        „Pravděpodobnost 95 %" se vztahuje na *opakované vzorky*, ne na konkrétní vzorek.
      </div>
    </div>
  );
}

function btn(active) { return { padding: "3px 9px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
function lab() { return { flex: "1 1 180px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }; }
