// CI for E[Y|x₀] (narrow) vs PI for Y(x₀) (wide) — drag x₀, see hyperbolic widening.
import { useState } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 320;
const PAD_L = 40, PAD_R = 14, PAD_T = 18, PAD_B = 34;
const PW = W - PAD_L - PAD_R, PH = H - PAD_T - PAD_B;

// Fixed dataset
const DATA = [
  [1, 2.4], [2, 3.0], [3, 3.5], [4, 5.2], [5, 5.1],
  [6, 6.3], [7, 7.0], [8, 7.6], [9, 8.9], [10, 9.5],
];

function fit(data) {
  const n = data.length;
  const xbar = data.reduce((a, [x]) => a + x, 0) / n;
  const ybar = data.reduce((a, [, y]) => a + y, 0) / n;
  const Sxx = data.reduce((a, [x]) => a + (x - xbar) ** 2, 0);
  const Sxy = data.reduce((a, [x, y]) => a + (x - xbar) * (y - ybar), 0);
  const b1 = Sxy / Sxx, b0 = ybar - b1 * xbar;
  const resid = data.map(([x, y]) => y - (b0 + b1 * x));
  const RSS = resid.reduce((a, r) => a + r * r, 0);
  const sigma = Math.sqrt(RSS / (n - 2));
  return { n, xbar, b0, b1, Sxx, sigma };
}

export default function PredictionVsConfidenceBand() {
  const [x0, setX0] = useState(8);
  const [alpha, setAlpha] = useState(0.05);

  const f = fit(DATA);
  const tc = S.tQuantile(1 - alpha / 2, f.n - 2);

  function dSquared(x) {
    return 1 / f.n + (x - f.xbar) ** 2 / f.Sxx;
  }

  const yhat0 = f.b0 + f.b1 * x0;
  const dist0 = dSquared(x0);
  const halfCI = tc * f.sigma * Math.sqrt(dist0);
  const halfPI = tc * f.sigma * Math.sqrt(1 + dist0);

  const xMin = 0, xMax = 12;
  const yMin = 0, yMax = 14;
  const toX = (x) => PAD_L + ((x - xMin) / (xMax - xMin)) * PW;
  const toY = (y) => PAD_T + PH - ((y - yMin) / (yMax - yMin)) * PH;

  // Build bands
  const N = 150;
  const ciTop = [], ciBot = [], piTop = [], piBot = [];
  for (let i = 0; i <= N; i++) {
    const x = xMin + (i / N) * (xMax - xMin);
    const y = f.b0 + f.b1 * x;
    const d = dSquared(x);
    const cih = tc * f.sigma * Math.sqrt(d);
    const pih = tc * f.sigma * Math.sqrt(1 + d);
    ciTop.push([x, y + cih]); ciBot.push([x, y - cih]);
    piTop.push([x, y + pih]); piBot.push([x, y - pih]);
  }

  const pathOf = (arr) => arr.map(([x, y], i) => `${i ? "L" : "M"} ${toX(x).toFixed(2)} ${toY(y).toFixed(2)}`).join(" ");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <line x1={PAD_L} y1={PAD_T + PH} x2={PAD_L + PW} y2={PAD_T + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} stroke="var(--line-strong)" />

        {/* PI band (wider) */}
        <path d={`${pathOf(piTop)} L ${toX(piBot[piBot.length - 1][0])} ${toY(piBot[piBot.length - 1][1])} ${[...piBot].reverse().map(([x, y]) => `L ${toX(x).toFixed(2)} ${toY(y).toFixed(2)}`).join(" ")} Z`}
          fill="var(--text-muted)" opacity="0.12" />
        {/* CI band */}
        <path d={`${pathOf(ciTop)} L ${toX(ciBot[ciBot.length - 1][0])} ${toY(ciBot[ciBot.length - 1][1])} ${[...ciBot].reverse().map(([x, y]) => `L ${toX(x).toFixed(2)} ${toY(y).toFixed(2)}`).join(" ")} Z`}
          fill="var(--accent-line)" opacity="0.2" />

        {/* Regression line */}
        <line x1={toX(xMin)} y1={toY(f.b0 + f.b1 * xMin)} x2={toX(xMax)} y2={toY(f.b0 + f.b1 * xMax)} stroke="var(--accent)" strokeWidth="2" />

        {/* Data */}
        {DATA.map(([x, y], i) => <circle key={i} cx={toX(x)} cy={toY(y)} r="3.5" fill="var(--accent)" opacity="0.7" />)}

        {/* x̄ mean marker */}
        <line x1={toX(f.xbar)} y1={PAD_T + PH} x2={toX(f.xbar)} y2={PAD_T + PH + 6} stroke="var(--text)" strokeWidth="2" />
        <text x={toX(f.xbar)} y={PAD_T + PH + 18} textAnchor="middle" fontSize="10" fill="var(--text)" fontFamily="var(--font-mono)">x̄ = {f.xbar.toFixed(1)}</text>

        {/* x0 marker + intervals */}
        <line x1={toX(x0)} y1={PAD_T} x2={toX(x0)} y2={PAD_T + PH} stroke="var(--text)" strokeDasharray="3 3" />
        <line x1={toX(x0) - 8} y1={toY(yhat0 - halfPI)} x2={toX(x0) + 8} y2={toY(yhat0 - halfPI)} stroke="var(--text-muted)" strokeWidth="2" />
        <line x1={toX(x0) - 8} y1={toY(yhat0 + halfPI)} x2={toX(x0) + 8} y2={toY(yhat0 + halfPI)} stroke="var(--text-muted)" strokeWidth="2" />
        <line x1={toX(x0) - 8} y1={toY(yhat0 - halfCI)} x2={toX(x0) + 8} y2={toY(yhat0 - halfCI)} stroke="var(--accent-line)" strokeWidth="3" />
        <line x1={toX(x0) - 8} y1={toY(yhat0 + halfCI)} x2={toX(x0) + 8} y2={toY(yhat0 + halfCI)} stroke="var(--accent-line)" strokeWidth="3" />
        <circle cx={toX(x0)} cy={toY(yhat0)} r="4" fill="var(--accent)" stroke="var(--text)" strokeWidth="1" />

        {/* x ticks */}
        {[0, 2, 4, 6, 8, 10, 12].map((v) => (
          <g key={v}>
            <text x={toX(v)} y={PAD_T + PH + 30} fontSize="9.5" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v}</text>
          </g>
        ))}

        {/* legend */}
        <g transform={`translate(${PAD_L + 14}, ${PAD_T + 4})`} fontSize="10" fontFamily="var(--font-mono)">
          <rect x="0" y="0" width="14" height="8" fill="var(--accent-line)" opacity="0.3" />
          <text x="18" y="7" fill="var(--accent-line)">CI pro E[Y|x₀]</text>
          <rect x="0" y="14" width="14" height="8" fill="var(--text-muted)" opacity="0.15" />
          <text x="18" y="21" fill="var(--text-muted)">PI pro Y(x₀)</text>
        </g>
      </svg>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <label style={lab()}>x₀ = {x0.toFixed(2)}
          <input type="range" min={-1} max={13} step={0.1} value={x0} onChange={(e) => setX0(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>α = {alpha.toFixed(2)}
          <input type="range" min={0.01} max={0.2} step={0.01} value={alpha} onChange={(e) => setAlpha(+e.target.value)} style={{ width: "100%" }} />
        </label>
      </div>
      <div style={{ fontSize: 10.5, color: "var(--text)", fontFamily: "var(--font-mono)" }}>
        Ŷ(x₀) = {yhat0.toFixed(3)} · {((1 - alpha) * 100).toFixed(0)}% CI = [{(yhat0 - halfCI).toFixed(3)}, {(yhat0 + halfCI).toFixed(3)}]
        · PI = [{(yhat0 - halfPI).toFixed(3)}, {(yhat0 + halfPI).toFixed(3)}]
      </div>
      <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
        Šířka(CI) = 2·t·σ·√(1/n + (x₀−x̄)²/Sxx) · šířka(PI) = 2·t·σ·√(1 + 1/n + (x₀−x̄)²/Sxx). Vzdálenost od x̄ zvětšuje obě hyperbolicky.
      </div>
    </div>
  );
}

function lab() { return { flex: "1 1 180px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }; }
