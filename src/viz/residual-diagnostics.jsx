// Residual diagnostics — show 4 plots when data violates assumptions.
import { useState, useMemo } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 360;

const SCENARIOS = {
  good:    { label: "OK lineární model", desc: "Předpoklady splněny — rezidua náhodná, normální." },
  nonlin:  { label: "Nelinearita (Y = x²)", desc: "Rezidua mají systematický U-tvar — linearita porušena." },
  hetero:  { label: "Heteroskedasticita", desc: "Rozptyl reziduí roste s x (trychtýř) — Var(ε) ≠ konst." },
  heavy:   { label: "Heavy tails (t₃)", desc: "Rezidua mají těžké chvosty — Q-Q se vychyluje." },
  outlier: { label: "Outlier + leverage", desc: "Jeden bod daleko od mraku — vysoké h_ii, vlivný." },
};

function generate(scenario, seed, n = 30) {
  const rng = S.mulberry32(seed);
  const X = [], Y = [];
  for (let i = 0; i < n; i++) {
    const x = i * 0.4 + S.sampleNormal(rng, 0, 0.05);
    X.push(x);
    if (scenario === "good")        Y.push(2 + 0.5 * x + S.sampleNormal(rng, 0, 1));
    else if (scenario === "nonlin") Y.push(2 + 0.05 * x * x + S.sampleNormal(rng, 0, 1));
    else if (scenario === "hetero") Y.push(2 + 0.5 * x + S.sampleNormal(rng, 0, 0.3 + 0.3 * x));
    else if (scenario === "heavy") {
      // t(3) noise via Z / sqrt(V/3)
      const Z = S.sampleNormal(rng, 0, 1);
      const V = S.sampleGamma(rng, 1.5, 2);
      Y.push(2 + 0.5 * x + (Z / Math.sqrt(V / 3)) * 0.7);
    } else {
      Y.push(2 + 0.5 * x + S.sampleNormal(rng, 0, 0.5));
    }
  }
  if (scenario === "outlier") {
    Y[Y.length - 1] = 2 + 0.5 * X[X.length - 1] - 7;  // outlier dragging fit
  }
  return { X, Y };
}

function fitLR(X, Y) {
  const n = X.length;
  const xbar = X.reduce((a, b) => a + b, 0) / n;
  const ybar = Y.reduce((a, b) => a + b, 0) / n;
  const Sxx = X.reduce((a, x) => a + (x - xbar) ** 2, 0);
  const Sxy = X.reduce((a, x, i) => a + (x - xbar) * (Y[i] - ybar), 0);
  const b1 = Sxy / Sxx, b0 = ybar - b1 * xbar;
  const yhat = X.map((x) => b0 + b1 * x);
  const resid = Y.map((y, i) => y - yhat[i]);
  const sigma = Math.sqrt(resid.reduce((a, r) => a + r * r, 0) / (n - 2));
  const h = X.map((x) => 1 / n + (x - xbar) ** 2 / Sxx);
  const stdres = resid.map((r, i) => r / (sigma * Math.sqrt(Math.max(1e-9, 1 - h[i]))));
  return { b0, b1, yhat, resid, sigma, stdres, h, xbar };
}

export default function ResidualDiagnostics() {
  const [sc, setSc] = useState("hetero");
  const [seed, setSeed] = useState(0);

  const { X, Y } = useMemo(() => generate(sc, seed), [sc, seed]);
  const f = useMemo(() => fitLR(X, Y), [X, Y]);

  // 4-quadrant layout
  const W2 = W / 2, H2 = (H - 30) / 2;
  const PAD = 30;

  // Panel 1: scatter + fit
  // Panel 2: residuals vs fitted
  // Panel 3: Q-Q of standardized residuals
  // Panel 4: scale-location √|stdres| vs fitted

  function plotScatter(ox, oy, w, h, title) {
    const xMin = Math.min(...X) - 0.5, xMax = Math.max(...X) + 0.5;
    const yMin = Math.min(...Y) - 0.5, yMax = Math.max(...Y) + 0.5;
    const toX = (x) => ox + ((x - xMin) / (xMax - xMin)) * w;
    const toY = (y) => oy + h - ((y - yMin) / (yMax - yMin)) * h;
    return (
      <>
        <text x={ox} y={oy - 6} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">{title}</text>
        <line x1={ox} y1={oy + h} x2={ox + w} y2={oy + h} stroke="var(--line-strong)" />
        <line x1={ox} y1={oy} x2={ox} y2={oy + h} stroke="var(--line-strong)" />
        <line x1={toX(xMin)} y1={toY(f.b0 + f.b1 * xMin)} x2={toX(xMax)} y2={toY(f.b0 + f.b1 * xMax)} stroke="var(--accent)" strokeWidth="1.5" />
        {X.map((x, i) => <circle key={i} cx={toX(x)} cy={toY(Y[i])} r="2.5" fill="var(--accent-line)" opacity="0.8" />)}
      </>
    );
  }

  function plotResVsFit(ox, oy, w, h) {
    const yhatMin = Math.min(...f.yhat) - 0.5, yhatMax = Math.max(...f.yhat) + 0.5;
    const rMax = Math.max(...f.resid.map(Math.abs)) * 1.2;
    const toX = (x) => ox + ((x - yhatMin) / (yhatMax - yhatMin)) * w;
    const toY = (r) => oy + h / 2 - (r / rMax) * (h / 2);
    return (
      <>
        <text x={ox} y={oy - 6} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">rezidua vs. Ŷ</text>
        <line x1={ox} y1={oy + h / 2} x2={ox + w} y2={oy + h / 2} stroke="var(--line-strong)" strokeDasharray="3 3" />
        <line x1={ox} y1={oy} x2={ox} y2={oy + h} stroke="var(--line-strong)" />
        {f.yhat.map((yh, i) => <circle key={i} cx={toX(yh)} cy={toY(f.resid[i])} r="2.5" fill="var(--accent)" opacity="0.8" />)}
      </>
    );
  }

  function plotQQ(ox, oy, w, h) {
    const n = X.length;
    const sorted = [...f.stdres].sort((a, b) => a - b);
    const theo = sorted.map((_, i) => S.normalQuantile((i + 0.5) / n));
    const lim = 3.5;
    const toX = (x) => ox + ((x + lim) / (2 * lim)) * w;
    const toY = (y) => oy + h - ((y + lim) / (2 * lim)) * h;
    return (
      <>
        <text x={ox} y={oy - 6} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">Q-Q (norm.)</text>
        <line x1={toX(-lim)} y1={toY(-lim)} x2={toX(lim)} y2={toY(lim)} stroke="var(--text-muted)" strokeDasharray="3 3" />
        <line x1={ox} y1={oy + h} x2={ox + w} y2={oy + h} stroke="var(--line-strong)" />
        <line x1={ox} y1={oy} x2={ox} y2={oy + h} stroke="var(--line-strong)" />
        {sorted.map((y, i) => <circle key={i} cx={toX(theo[i])} cy={toY(y)} r="2.5" fill="var(--accent)" opacity="0.8" />)}
      </>
    );
  }

  function plotScaleLoc(ox, oy, w, h) {
    const yhatMin = Math.min(...f.yhat) - 0.5, yhatMax = Math.max(...f.yhat) + 0.5;
    const sloc = f.stdres.map((r) => Math.sqrt(Math.abs(r)));
    const sMax = Math.max(...sloc) * 1.15;
    const toX = (x) => ox + ((x - yhatMin) / (yhatMax - yhatMin)) * w;
    const toY = (s) => oy + h - (s / sMax) * h;
    return (
      <>
        <text x={ox} y={oy - 6} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">√|stdres| vs. Ŷ (scale-loc)</text>
        <line x1={ox} y1={oy + h} x2={ox + w} y2={oy + h} stroke="var(--line-strong)" />
        <line x1={ox} y1={oy} x2={ox} y2={oy + h} stroke="var(--line-strong)" />
        {f.yhat.map((yh, i) => <circle key={i} cx={toX(yh)} cy={toY(sloc[i])} r="2.5" fill="var(--accent-line)" opacity="0.8" />)}
      </>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.entries(SCENARIOS).map(([k, v]) => (
          <button key={k} onClick={() => setSc(k)} style={btn(sc === k)}>{v.label}</button>
        ))}
        <button onClick={() => setSeed(seed + 1)} style={btn(false)}>nový vzorek</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {plotScatter(PAD, PAD, W2 - 2 * PAD, H2 - 2 * PAD, "scatter + LR")}
        {plotResVsFit(W2 + PAD, PAD, W2 - 2 * PAD, H2 - 2 * PAD)}
        {plotQQ(PAD, H2 + PAD, W2 - 2 * PAD, H2 - 2 * PAD)}
        {plotScaleLoc(W2 + PAD, H2 + PAD, W2 - 2 * PAD, H2 - 2 * PAD)}
      </svg>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        {SCENARIOS[sc].desc}
      </div>
    </div>
  );
}

function btn(active) { return { padding: "3px 9px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
