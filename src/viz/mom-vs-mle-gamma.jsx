// MoM vs MLE estimators on Γ(k, θ) — MoM closed-form, MLE iterative.
import { useState, useMemo } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 280;
const PAD_L = 50, PAD_R = 14, PAD_T = 20, PAD_B = 36;
const PW = W - PAD_L - PAD_R, PH = H - PAD_T - PAD_B;

// Digamma function — approximation
function digamma(x) {
  if (x < 6) {
    let val = 0;
    while (x < 6) { val -= 1 / x; x += 1; }
    // asymptotic
    const x2 = 1 / (x * x);
    val += Math.log(x) - 0.5 / x - x2 * (1 / 12 - x2 * (1 / 120 - x2 / 252));
    return val;
  }
  const x2 = 1 / (x * x);
  return Math.log(x) - 0.5 / x - x2 * (1 / 12 - x2 * (1 / 120 - x2 / 252));
}

// MLE for Γ(k, θ) — iterative on k via Newton on log(k) - ψ(k) = log(x̄) - mean(log x)
function mleGamma(data) {
  const n = data.length;
  const xbar = data.reduce((a, b) => a + b, 0) / n;
  const logbar = data.reduce((a, b) => a + Math.log(b), 0) / n;
  const s = Math.log(xbar) - logbar;
  // Initial: Stirling-style approximation
  let k = (3 - s + Math.sqrt((s - 3) * (s - 3) + 24 * s)) / (12 * s);
  // Newton iterations: F(k) = log k - psi(k) - s; F'(k) = 1/k - psi'(k); psi'(k) ≈ 1/k + 1/(2k²)
  for (let iter = 0; iter < 100; iter++) {
    const F = Math.log(k) - digamma(k) - s;
    const FP = 1 / k - (1 / k + 1 / (2 * k * k));
    const newK = k - F / FP;
    if (Math.abs(newK - k) < 1e-9) { k = newK; break; }
    k = Math.max(0.01, newK);
  }
  const theta = xbar / k;
  return { k, theta };
}

function momGamma(data) {
  const n = data.length;
  const xbar = data.reduce((a, b) => a + b, 0) / n;
  const s2 = data.reduce((a, b) => a + (b - xbar) ** 2, 0) / n;  // method of moments uses 1/n
  const k = (xbar * xbar) / s2;
  const theta = s2 / xbar;
  return { k, theta };
}

export default function MomVsMleGamma() {
  const [trueK, setTrueK] = useState(2);
  const [trueTheta, setTrueTheta] = useState(1);
  const [n, setN] = useState(30);
  const [seed, setSeed] = useState(1);

  const data = useMemo(() => {
    const rng = S.mulberry32(seed * 137 + 1);
    return Array.from({ length: n }, () => S.sampleGamma(rng, trueK, trueTheta));
  }, [trueK, trueTheta, n, seed]);

  const mom = momGamma(data);
  const mle = mleGamma(data);

  // Plot: data histogram + true Gamma + MoM Gamma + MLE Gamma
  const xMin = 0;
  const xMax = Math.max(...data) * 1.1;
  const BINS = 25;
  const hist = new Int32Array(BINS);
  for (const x of data) {
    const idx = Math.floor((x / xMax) * BINS);
    if (idx >= 0 && idx < BINS) hist[idx]++;
  }
  const binW = xMax / BINS;
  const dens = Array.from(hist).map((c) => c / (n * binW));

  const trueY = (x) => S.gammaPDF(x, trueK, trueTheta);
  const momY = (x) => S.gammaPDF(x, mom.k, mom.theta);
  const mleY = (x) => S.gammaPDF(x, mle.k, mle.theta);

  const Ncurve = 200;
  const curve = (f) => {
    const out = [];
    for (let i = 0; i <= Ncurve; i++) {
      const x = (i / Ncurve) * xMax;
      out.push([x, f(x)]);
    }
    return out;
  };

  const tc = curve(trueY), mc = curve(momY), lc = curve(mleY);
  const yMax = Math.max(...dens, ...tc.map(([, y]) => y), ...mc.map(([, y]) => y), ...lc.map(([, y]) => y)) * 1.1;

  const toX = (x) => PAD_L + (x / xMax) * PW;
  const toY = (y) => PAD_T + PH - (y / yMax) * PH;
  const pathOf = (arr) => arr.map(([x, y], i) => `${i ? "L" : "M"} ${toX(x).toFixed(2)} ${toY(y).toFixed(2)}`).join(" ");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <line x1={PAD_L} y1={PAD_T + PH} x2={PAD_L + PW} y2={PAD_T + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} stroke="var(--line-strong)" />

        {/* Histogram */}
        {dens.map((d, i) => {
          const x0 = i * binW;
          return <rect key={i} x={toX(x0)} y={toY(d)} width={Math.max(1, toX(x0 + binW) - toX(x0) - 1)} height={PAD_T + PH - toY(d)} fill="var(--text-muted)" opacity="0.3" />;
        })}

        {/* True */}
        <path d={pathOf(tc)} fill="none" stroke="var(--text)" strokeWidth="2" strokeDasharray="3 3" />
        {/* MoM */}
        <path d={pathOf(mc)} fill="none" stroke="var(--accent-line)" strokeWidth="2" />
        {/* MLE */}
        <path d={pathOf(lc)} fill="none" stroke="var(--accent)" strokeWidth="2" />

        {/* legend */}
        <g transform={`translate(${PAD_L + 20}, ${PAD_T + 6})`} fontSize="10.5" fontFamily="var(--font-mono)">
          <line x1="0" y1="6" x2="14" y2="6" stroke="var(--text)" strokeWidth="2" strokeDasharray="3 3" />
          <text x="18" y="9" fill="var(--text)">true Γ({trueK}, {trueTheta})</text>
          <line x1="120" y1="6" x2="134" y2="6" stroke="var(--accent-line)" strokeWidth="2" />
          <text x="138" y="9" fill="var(--accent-line)">MoM</text>
          <line x1="200" y1="6" x2="214" y2="6" stroke="var(--accent)" strokeWidth="2" />
          <text x="218" y="9" fill="var(--accent)">MLE</text>
        </g>
      </svg>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <label style={lab()}>k = {trueK.toFixed(1)}
          <input type="range" min={0.5} max={8} step={0.1} value={trueK} onChange={(e) => setTrueK(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>θ = {trueTheta.toFixed(1)}
          <input type="range" min={0.2} max={3} step={0.1} value={trueTheta} onChange={(e) => setTrueTheta(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>n = {n}
          <input type="range" min={5} max={500} value={n} onChange={(e) => setN(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <button onClick={() => setSeed(seed + 1)} style={btn(false)}>nový vzorek</button>
      </div>

      <table style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text)", borderCollapse: "collapse" }}>
        <thead><tr style={{ color: "var(--text-muted)" }}><th style={th()}>metoda</th><th style={th()}>k̂</th><th style={th()}>θ̂</th><th style={th()}>chyba k</th><th style={th()}>chyba θ</th></tr></thead>
        <tbody>
          <tr><td style={td()}>MoM</td><td style={td()}>{mom.k.toFixed(3)}</td><td style={td()}>{mom.theta.toFixed(3)}</td><td style={td()}>{(mom.k - trueK).toFixed(3)}</td><td style={td()}>{(mom.theta - trueTheta).toFixed(3)}</td></tr>
          <tr><td style={td()}>MLE</td><td style={td()}>{mle.k.toFixed(3)}</td><td style={td()}>{mle.theta.toFixed(3)}</td><td style={td()}>{(mle.k - trueK).toFixed(3)}</td><td style={td()}>{(mle.theta - trueTheta).toFixed(3)}</td></tr>
        </tbody>
      </table>
      <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
        MoM: k̂ = x̄²/s², θ̂ = s²/x̄ (uzavřená forma). MLE: řešení log(k) − ψ(k) = log(x̄) − (1/n)Σ log(xᵢ) (Newton). MLE má menší asymptotický rozptyl (efektivní). Pro malé n MoM dává rychlý start.
      </div>
    </div>
  );
}

function btn(active) { return { padding: "4px 10px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
function lab() { return { flex: "1 1 180px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }; }
function th() { return { textAlign: "left", padding: "3px 10px", fontWeight: "normal", borderBottom: "1px solid var(--line)" }; }
function td() { return { padding: "3px 10px" }; }
