// Interactive linear regression — draggable scatter, live β̂, SE, R²,
// residual plot, leverage h_ii, Cook's distance.
import { useState } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 380;

const INIT_DATA = [
  [1, 2.1], [2, 2.9], [3, 3.4], [4, 5.1], [5, 5.0],
  [6, 6.2], [7, 7.1], [8, 7.9], [9, 9.2], [10, 9.8],
];

function fit(data) {
  const n = data.length;
  const xbar = data.reduce((a, [x]) => a + x, 0) / n;
  const ybar = data.reduce((a, [, y]) => a + y, 0) / n;
  const Sxx = data.reduce((a, [x]) => a + (x - xbar) ** 2, 0);
  const Sxy = data.reduce((a, [x, y]) => a + (x - xbar) * (y - ybar), 0);
  const beta1 = Sxx > 0 ? Sxy / Sxx : 0;
  const beta0 = ybar - beta1 * xbar;
  // residuals
  const yhat = data.map(([x]) => beta0 + beta1 * x);
  const resid = data.map(([_, y], i) => y - yhat[i]);
  const RSS = resid.reduce((a, r) => a + r * r, 0);
  const TSS = data.reduce((a, [, y]) => a + (y - ybar) ** 2, 0);
  const R2 = TSS > 0 ? 1 - RSS / TSS : 0;
  const sigma2 = RSS / Math.max(1, n - 2);
  const sigma = Math.sqrt(sigma2);
  const se_b1 = Math.sqrt(sigma2 / Sxx);
  const se_b0 = Math.sqrt(sigma2 * (1 / n + (xbar * xbar) / Sxx));
  // leverage h_ii for simple regression = 1/n + (x_i - x̄)²/Sxx
  const h = data.map(([x]) => 1 / n + (x - xbar) ** 2 / Sxx);
  // standardized residuals = r_i / (σ √(1-h_i))
  const stdres = resid.map((r, i) => sigma > 0 ? r / (sigma * Math.sqrt(Math.max(1e-9, 1 - h[i]))) : 0);
  // Cook's distance D_i = r²/(2σ²) · h/(1-h)²  [Cook 1977]
  // Equivalent to (stdres² / p) * h/(1-h), p = number of params = 2
  const cookD = stdres.map((r, i) => (r * r / 2) * (h[i] / Math.max(1e-9, (1 - h[i]))));
  return { n, xbar, ybar, beta0, beta1, se_b0, se_b1, sigma, RSS, TSS, R2, resid, h, stdres, cookD, yhat };
}

export default function RegressionInteractive() {
  const [data, setData] = useState(INIT_DATA);
  const [drag, setDrag] = useState(null);

  const f = fit(data);

  // Scatter axes
  const xMin = 0, xMax = 12;
  const yMin = -1, yMax = 14;
  const PAD_L = 36, PAD_R = 16, PAD_T = 16, PAD_B = 24;
  const PW = W - PAD_L - PAD_R;
  const SCATTER_H = 200;
  const DIAG_Y0 = PAD_T + SCATTER_H + 20;
  const DIAG_H = H - DIAG_Y0 - PAD_B;

  const toX = (x) => PAD_L + ((x - xMin) / (xMax - xMin)) * PW;
  const toY = (y) => PAD_T + SCATTER_H - ((y - yMin) / (yMax - yMin)) * SCATTER_H;
  const pxToX = (px) => xMin + (px - PAD_L) / PW * (xMax - xMin);
  const pxToY = (py) => yMax - (py - PAD_T) / SCATTER_H * (yMax - yMin);

  // Diag pane: residuals vs fitted
  const yhatMin = Math.min(...f.yhat);
  const yhatMax = Math.max(...f.yhat);
  const rMax = Math.max(0.5, Math.max(...f.resid.map(Math.abs))) * 1.2;
  const toDiagX = (x) => PAD_L + ((x - yhatMin) / (yhatMax - yhatMin + 1e-9)) * (PW / 2);
  const toDiagY = (r) => DIAG_Y0 + DIAG_H / 2 - (r / rMax) * (DIAG_H / 2);

  // Leverage bars
  const lvBarX0 = PAD_L + PW / 2 + 20;
  const lvW = PW / 2 - 20;
  const lvMax = Math.max(...f.h, 0.5);
  const lvCookMax = Math.max(...f.cookD, 0.1);

  function onMove(e) {
    if (drag === null) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    const newX = Math.max(xMin, Math.min(xMax, pxToX(px)));
    const newY = Math.max(yMin, Math.min(yMax, pxToY(py)));
    const arr = data.map((p, i) => (i === drag ? [newX, newY] : p));
    setData(arr);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button onClick={() => setData(INIT_DATA)} style={btn(false)}>reset</button>
        <button onClick={() => setData([...data, [Math.random() * 10 + 1, Math.random() * 12 + 1]])} style={btn(false)}>+ bod</button>
        <button onClick={() => setData(data.length > 3 ? data.slice(0, -1) : data)} style={btn(false)}>− bod</button>
        <button onClick={() => setData([[1, 2.1], [2, 2.9], [3, 3.4], [4, 5.1], [5, 5.0], [6, 6.2], [7, 7.1], [8, 7.9], [9, 9.2], [12, 1]])} style={btn(false)}>outlier dolů</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4, userSelect: "none", touchAction: "none" }}
        onMouseMove={onMove}
        onMouseUp={() => setDrag(null)}
        onMouseLeave={() => setDrag(null)}>

        {/* Scatter axes */}
        <line x1={PAD_L} y1={PAD_T + SCATTER_H} x2={PAD_L + PW} y2={PAD_T + SCATTER_H} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + SCATTER_H} stroke="var(--line-strong)" />

        {/* Regression line */}
        <line x1={toX(xMin)} y1={toY(f.beta0 + f.beta1 * xMin)}
              x2={toX(xMax)} y2={toY(f.beta0 + f.beta1 * xMax)}
              stroke="var(--accent)" strokeWidth="2" />

        {/* Points */}
        {data.map(([x, y], i) => {
          const high = f.h[i] > 2 * 2 / data.length;
          return (
            <g key={i}>
              <line x1={toX(x)} y1={toY(y)} x2={toX(x)} y2={toY(f.beta0 + f.beta1 * x)} stroke="var(--accent-line)" strokeWidth="0.7" opacity="0.5" />
              <circle cx={toX(x)} cy={toY(y)} r={high ? 6 : 4.5}
                fill="var(--accent-line)" stroke={high ? "var(--text)" : "none"} strokeWidth="1.5"
                onMouseDown={() => setDrag(i)}
                style={{ cursor: "move" }} />
            </g>
          );
        })}

        {/* axis labels */}
        {[0, 4, 8, 12].map((v) => (
          <text key={v} x={toX(v)} y={PAD_T + SCATTER_H + 14} fontSize="9.5" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v}</text>
        ))}

        {/* DIAG: residuals vs fitted */}
        <text x={PAD_L} y={DIAG_Y0 - 4} fontSize="10.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">rezidua vs. Ŷ</text>
        <line x1={PAD_L} y1={DIAG_Y0 + DIAG_H / 2} x2={PAD_L + PW / 2} y2={DIAG_Y0 + DIAG_H / 2} stroke="var(--line-strong)" strokeDasharray="3 3" />
        {data.map(([x, y], i) => {
          const yhat = f.yhat[i];
          return <circle key={i} cx={toDiagX(yhat)} cy={toDiagY(f.resid[i])} r="3" fill="var(--accent)" opacity="0.8" />;
        })}

        {/* Leverage bars */}
        <text x={lvBarX0} y={DIAG_Y0 - 4} fontSize="10.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">leverage h_ii (◦) · Cook D (□)</text>
        {data.map(([x, y], i) => {
          const bw = lvW / data.length;
          const hHeight = (f.h[i] / lvMax) * (DIAG_H / 2 - 4);
          const cHeight = (f.cookD[i] / lvCookMax) * (DIAG_H / 2 - 4);
          const cookOver = f.cookD[i] > 4 / data.length;
          return (
            <g key={i}>
              <rect x={lvBarX0 + i * bw + 2} y={DIAG_Y0 + DIAG_H / 2 - hHeight} width={bw - 4} height={hHeight} fill="var(--accent)" opacity="0.6" />
              <rect x={lvBarX0 + i * bw + 2} y={DIAG_Y0 + DIAG_H / 2 + 2} width={bw - 4} height={cHeight} fill={cookOver ? "var(--accent-line)" : "var(--accent-line)"} opacity={cookOver ? 0.9 : 0.4} />
            </g>
          );
        })}
        <line x1={lvBarX0} y1={DIAG_Y0 + DIAG_H / 2} x2={lvBarX0 + lvW} y2={DIAG_Y0 + DIAG_H / 2} stroke="var(--line-strong)" />
      </svg>

      <div style={{ fontSize: 11, color: "var(--text)", fontFamily: "var(--font-mono)" }}>
        β̂₀ = {f.beta0.toFixed(3)} (s.e. {f.se_b0.toFixed(3)}) · β̂₁ = <strong>{f.beta1.toFixed(3)}</strong> (s.e. {f.se_b1.toFixed(3)})
        · R² = <strong>{f.R2.toFixed(4)}</strong> · σ̂ = {f.sigma.toFixed(3)} · n = {f.n}
        <br />
        t(β̂₁) = {(f.beta1 / f.se_b1).toFixed(2)} · p = {(2 * (1 - S.tCDF(Math.abs(f.beta1 / f.se_b1), f.n - 2))).toExponential(2)}
        {f.cookD.some((d) => d > 1) && <><br /><span style={{ color: "var(--accent-line)" }}>Pozor:</span> Cookova vzdálenost &gt; 1 — vlivný bod (zvýrazněn).</>}
      </div>
      <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
        Přetáhněte bod. Krajní body mají vysoké h_ii (leverage) — zkuste přesunout jeden daleko od x̄ a sledujte, jak se sklon mění (vysoký Cook D).
      </div>
    </div>
  );
}

function btn(active) { return { padding: "3px 9px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
