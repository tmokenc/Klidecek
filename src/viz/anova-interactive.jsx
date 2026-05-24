// One-way ANOVA — three group means as sliders, F-statistic, decision.
import { useState, useMemo } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 320;
const PAD_L = 40, PAD_R = 16, PAD_T = 16, PAD_B = 36;
const PW = W - PAD_L - PAD_R, PH = H - PAD_T - PAD_B - 12;

const COLORS = ["var(--accent)", "var(--accent-line)", "oklch(0.65 0.16 264)"];

export default function AnovaInteractive() {
  const [m1, setM1] = useState(78);
  const [m2, setM2] = useState(87);
  const [m3, setM3] = useState(82);
  const [sigma, setSigma] = useState(2.5);
  const [n, setN] = useState(5);
  const [seed, setSeed] = useState(2);
  const [alpha, setAlpha] = useState(0.05);

  // Generate samples
  const data = useMemo(() => {
    const rng = S.mulberry32(seed);
    const means = [m1, m2, m3];
    return means.map((mu) => Array.from({ length: n }, () => S.sampleNormal(rng, mu, sigma)));
  }, [m1, m2, m3, sigma, n, seed]);

  // Compute ANOVA
  const k = 3;
  const nT = k * n;
  const groupMeans = data.map((g) => g.reduce((a, b) => a + b, 0) / g.length);
  const grandMean = groupMeans.reduce((a, b) => a + b, 0) / k;
  const SSB = groupMeans.reduce((a, gm) => a + n * (gm - grandMean) ** 2, 0);
  const SSW = data.reduce((acc, g, i) => acc + g.reduce((a, x) => a + (x - groupMeans[i]) ** 2, 0), 0);
  const SST = SSB + SSW;
  const dfB = k - 1, dfW = nT - k;
  const MSB = SSB / dfB, MSW = SSW / dfW;
  const F = MSW > 0 ? MSB / MSW : 0;
  const pval = 1 - S.fCDF(F, dfB, dfW);
  const crit = S.fQuantile(1 - alpha, dfB, dfW);
  const reject = F > crit;
  const eta2 = SST > 0 ? SSB / SST : 0;

  // Plot — strip plot per group
  const xMin = Math.min(70, m1, m2, m3) - 3 * sigma;
  const xMax = Math.max(95, m1, m2, m3) + 3 * sigma;
  const toX = (v) => PAD_L + ((v - xMin) / (xMax - xMin)) * PW;

  const stripGap = PH / 4;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <line x1={PAD_L} y1={PAD_T + PH} x2={PAD_L + PW} y2={PAD_T + PH} stroke="var(--line-strong)" />

        {/* Grand mean reference */}
        <line x1={toX(grandMean)} y1={PAD_T} x2={toX(grandMean)} y2={PAD_T + PH} stroke="var(--text)" strokeDasharray="3 3" opacity="0.5" />
        <text x={toX(grandMean)} y={PAD_T - 4} textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">Ȳ = {grandMean.toFixed(2)}</text>

        {/* Each group's data + group mean */}
        {data.map((g, gi) => {
          const stripY = PAD_T + (gi + 0.5) * stripGap;
          const gm = groupMeans[gi];
          return (
            <g key={gi}>
              <line x1={PAD_L} y1={stripY} x2={PAD_L + PW} y2={stripY} stroke="var(--line)" />
              <text x={PAD_L - 6} y={stripY + 3} textAnchor="end" fontSize="10" fill={COLORS[gi]} fontFamily="var(--font-mono)">G{gi + 1}</text>
              {g.map((x, i) => (
                <circle key={i} cx={toX(x)} cy={stripY} r="4" fill={COLORS[gi]} opacity="0.55" />
              ))}
              {/* Group mean marker */}
              <line x1={toX(gm)} y1={stripY - 14} x2={toX(gm)} y2={stripY + 14} stroke={COLORS[gi]} strokeWidth="3" />
              <text x={toX(gm)} y={stripY + 26} textAnchor="middle" fontSize="10" fill={COLORS[gi]} fontFamily="var(--font-mono)">Ȳ_{gi + 1}={gm.toFixed(2)}</text>
            </g>
          );
        })}

        {/* x ticks */}
        {[70, 75, 80, 85, 90, 95].map((v) => (
          v >= xMin && v <= xMax && (
            <g key={v}>
              <line x1={toX(v)} y1={PAD_T + PH} x2={toX(v)} y2={PAD_T + PH + 4} stroke="var(--line-strong)" />
              <text x={toX(v)} y={PAD_T + PH + 16} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v}</text>
            </g>
          )
        ))}
        <text x={W - 14} y={H - 6} textAnchor="end" fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">Y</text>
      </svg>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <label style={lab(COLORS[0])}>μ₁ = {m1.toFixed(1)}
          <input type="range" min={70} max={95} step={0.5} value={m1} onChange={(e) => setM1(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab(COLORS[1])}>μ₂ = {m2.toFixed(1)}
          <input type="range" min={70} max={95} step={0.5} value={m2} onChange={(e) => setM2(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab(COLORS[2])}>μ₃ = {m3.toFixed(1)}
          <input type="range" min={70} max={95} step={0.5} value={m3} onChange={(e) => setM3(+e.target.value)} style={{ width: "100%" }} />
        </label>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <label style={lab()}>σ (within) = {sigma.toFixed(2)}
          <input type="range" min={0.5} max={6} step={0.1} value={sigma} onChange={(e) => setSigma(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>n per skupinu = {n}
          <input type="range" min={3} max={30} value={n} onChange={(e) => setN(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <button onClick={() => setSeed(seed + 1)} style={btn(false)}>nový vzorek</button>
      </div>

      <table style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text)", borderCollapse: "collapse" }}>
        <thead><tr style={{ color: "var(--text-muted)" }}><th style={th()}>zdroj</th><th style={th()}>df</th><th style={th()}>SS</th><th style={th()}>MS</th><th style={th()}>F</th><th style={th()}>p</th></tr></thead>
        <tbody>
          <tr><td style={td()}>between</td><td style={td()}>{dfB}</td><td style={td()}>{SSB.toFixed(2)}</td><td style={td()}>{MSB.toFixed(2)}</td><td style={td()}><strong>{F.toFixed(3)}</strong></td><td style={td()}><strong style={{ color: reject ? "var(--accent-line)" : "var(--text)" }}>{pval.toExponential(2)}</strong></td></tr>
          <tr><td style={td()}>within</td><td style={td()}>{dfW}</td><td style={td()}>{SSW.toFixed(2)}</td><td style={td()}>{MSW.toFixed(2)}</td><td style={td()}>—</td><td style={td()}>—</td></tr>
          <tr><td style={td()}>total</td><td style={td()}>{nT - 1}</td><td style={td()}>{SST.toFixed(2)}</td><td style={td()}>—</td><td style={td()}>—</td><td style={td()}>—</td></tr>
        </tbody>
      </table>
      <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        F<sub>(0.95, {dfB}, {dfW})</sub> = {crit.toFixed(3)} · η² = SS_B/SST = {eta2.toFixed(3)} ({eta2 < 0.06 ? "malý" : eta2 < 0.14 ? "střední" : "velký"} efekt)
        <br />→ {reject ? <strong style={{ color: "var(--accent-line)" }}>zamítáme rovnost μ_j</strong> : <span>nezamítáme rovnost μ_j</span>}
      </div>
    </div>
  );
}

function btn(active) { return { padding: "4px 10px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
function lab(color) { return { flex: "1 1 150px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: color || "var(--text-muted)" }; }
function th() { return { textAlign: "left", padding: "3px 10px", fontWeight: "normal", borderBottom: "1px solid var(--line)" }; }
function td() { return { padding: "3px 10px" }; }
