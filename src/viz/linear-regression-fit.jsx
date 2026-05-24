// Linear regression with draggable points + basis expansion (poly degree slider).
import { useState, useRef } from "react";

const W = 540, H = 320;
const PAD_L = 50, PAD_R = 20, PAD_T = 20, PAD_B = 40;
const XMIN = 0, XMAX = 10;
const YMIN = 0, YMAX = 12;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const xToPx = (x) => PAD_L + ((x - XMIN) / (XMAX - XMIN)) * PLOT_W;
const yToPx = (y) => PAD_T + (1 - (y - YMIN) / (YMAX - YMIN)) * PLOT_H;
const pxToX = (px) => XMIN + ((px - PAD_L) / PLOT_W) * (XMAX - XMIN);
const pxToY = (py) => YMIN + (1 - (py - PAD_T) / PLOT_H) * (YMAX - YMIN);

const INITIAL_POINTS = [
  [1.5, 3.0], [2.5, 3.6], [3.0, 4.3], [4.5, 5.1],
  [5.5, 6.4], [6.0, 7.0], [7.0, 7.8], [8.0, 9.1], [9.0, 10.5],
];

// Fit polynomial of degree d. Returns coefficients [w0, w1, ..., wd].
function fitPoly(points, d) {
  // Design matrix Φ: n × (d+1)
  const n = points.length;
  const phi = points.map(([x]) => {
    const row = [];
    for (let k = 0; k <= d; k++) row.push(Math.pow(x, k));
    return row;
  });
  // Normal equations: (Φᵀ Φ) w = Φᵀ y
  const phiT_phi = matMul(transpose(phi), phi);
  const phiT_y = matVec(transpose(phi), points.map(([, y]) => y));
  // Add tiny ridge regularization for numerical stability
  for (let i = 0; i < phiT_phi.length; i++) phiT_phi[i][i] += 1e-9;
  return solveLinear(phiT_phi, phiT_y);
}

function transpose(A) {
  const r = A.length, c = A[0].length;
  const T = Array.from({ length: c }, () => Array(r).fill(0));
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) T[j][i] = A[i][j];
  return T;
}
function matMul(A, B) {
  const r = A.length, c = B[0].length, k = B.length;
  const C = Array.from({ length: r }, () => Array(c).fill(0));
  for (let i = 0; i < r; i++)
    for (let j = 0; j < c; j++)
      for (let m = 0; m < k; m++) C[i][j] += A[i][m] * B[m][j];
  return C;
}
function matVec(A, v) {
  return A.map((row) => row.reduce((s, a, i) => s + a * v[i], 0));
}
function solveLinear(A, b) {
  // Gauss-Jordan
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let i = 0; i < n; i++) {
    // pivot
    let p = i;
    for (let k = i + 1; k < n; k++) if (Math.abs(M[k][i]) > Math.abs(M[p][i])) p = k;
    [M[i], M[p]] = [M[p], M[i]];
    if (Math.abs(M[i][i]) < 1e-12) continue;
    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const f = M[k][i] / M[i][i];
      for (let j = i; j <= n; j++) M[k][j] -= f * M[i][j];
    }
  }
  return M.map((row, i) => {
    const v = row[n] / row[i][i];
    return isFinite(v) ? v : 0;
  });
}

function evalPoly(coef, x) {
  let s = 0;
  for (let i = 0; i < coef.length; i++) s += coef[i] * Math.pow(x, i);
  return s;
}

export default function LinearRegressionFit() {
  const [points, setPoints] = useState(INITIAL_POINTS.map((p) => [...p]));
  const [degree, setDegree] = useState(1);
  const [dragIdx, setDragIdx] = useState(null);
  const svgRef = useRef(null);

  const coef = fitPoly(points, degree);
  // Sum of squared residuals
  let sse = 0;
  const residuals = points.map(([x, y]) => {
    const yhat = evalPoly(coef, x);
    sse += (y - yhat) ** 2;
    return { x, y, yhat, r: y - yhat };
  });
  const mse = sse / points.length;

  function onMouseMove(e) {
    if (dragIdx === null) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    const x = Math.max(XMIN, Math.min(XMAX, pxToX(px)));
    const y = Math.max(YMIN, Math.min(YMAX, pxToY(py)));
    setPoints((pts) => pts.map((p, i) => (i === dragIdx ? [x, y] : p)));
  }
  function onUp() { setDragIdx(null); }

  // Curve points for the polynomial
  const STEPS = 120;
  const curve = [];
  for (let i = 0; i <= STEPS; i++) {
    const x = XMIN + (i / STEPS) * (XMAX - XMIN);
    const y = evalPoly(coef, x);
    if (y >= YMIN - 2 && y <= YMAX + 2) curve.push([x, y]);
  }
  const pathD = curve.map(([x, y], i) => `${i === 0 ? "M" : "L"}${xToPx(x).toFixed(1)} ${yToPx(Math.max(YMIN - 1, Math.min(YMAX + 1, y))).toFixed(1)}`).join(" ");

  function addPoint() {
    const newP = [Math.random() * (XMAX - 1) + 0.5, Math.random() * (YMAX - 2) + 1];
    setPoints((p) => [...p, newP]);
  }
  function removePoint(i) { setPoints((p) => p.filter((_, j) => j !== i)); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 11 }}>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)" }}>stupeň polynomu:</span>
          <input type="range" min={1} max={9} value={degree} onChange={(e) => setDegree(+e.target.value)} style={{ width: 100 }}/>
          <span style={{ fontFamily: "var(--font-mono)", minWidth: 16 }}>{degree}</span>
        </label>
        <button onClick={addPoint} style={btnStyle()}>+ bod</button>
        <button onClick={() => setPoints(INITIAL_POINTS.map((p) => [...p]))} style={btnStyle()}>reset</button>
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
          n = {points.length} · MSE = {mse.toFixed(3)}
        </span>
      </div>

      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
        onMouseMove={onMouseMove} onMouseUp={onUp} onMouseLeave={onUp}
        style={{ width: "100%", display: "block", touchAction: "none", maxWidth: 620, cursor: dragIdx !== null ? "grabbing" : "default" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* axes */}
        <g stroke="var(--line)" strokeWidth="0.8" fill="none">
          <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={H - PAD_B}/>
          <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B}/>
        </g>
        {/* grid + ticks */}
        <g fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          {[0, 2, 4, 6, 8, 10].map((x) => (
            <g key={`xt${x}`}>
              <line x1={xToPx(x)} y1={H - PAD_B} x2={xToPx(x)} y2={H - PAD_B + 4} stroke="var(--text-muted)"/>
              <text x={xToPx(x)} y={H - PAD_B + 14} textAnchor="middle">{x}</text>
              <line x1={xToPx(x)} y1={H - PAD_B} x2={xToPx(x)} y2={PAD_T} stroke="var(--line)" strokeOpacity="0.3"/>
            </g>
          ))}
          {[0, 3, 6, 9, 12].map((y) => (
            <g key={`yt${y}`}>
              <line x1={PAD_L - 4} y1={yToPx(y)} x2={PAD_L} y2={yToPx(y)} stroke="var(--text-muted)"/>
              <text x={PAD_L - 6} y={yToPx(y) + 3} textAnchor="end">{y}</text>
              <line x1={PAD_L} y1={yToPx(y)} x2={W - PAD_R} y2={yToPx(y)} stroke="var(--line)" strokeOpacity="0.3"/>
            </g>
          ))}
          <text x={W - PAD_R} y={H - PAD_B + 26} textAnchor="end">x</text>
          <text x={PAD_L - 28} y={PAD_T + 8}>y</text>
        </g>

        {/* residuals */}
        {residuals.map((r, i) => (
          <line key={`res${i}`} x1={xToPx(r.x)} y1={yToPx(r.y)} x2={xToPx(r.x)} y2={yToPx(r.yhat)}
            stroke="oklch(0.75 0.18 30)" strokeWidth="1.2" opacity="0.7"/>
        ))}

        {/* regression curve */}
        <path d={pathD} stroke="var(--accent)" strokeWidth="2" fill="none"/>

        {/* points */}
        {points.map(([x, y], i) => (
          <g key={`p${i}`}>
            <circle cx={xToPx(x)} cy={yToPx(y)} r="5"
              fill="var(--accent)" stroke="var(--bg-inset)" strokeWidth="1.5"
              style={{ cursor: "grab" }}
              onMouseDown={() => setDragIdx(i)}
              onDoubleClick={() => removePoint(i)}/>
          </g>
        ))}
      </svg>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        <span>y = {coef.map((c, i) => `${i === 0 ? "" : (c >= 0 ? "+ " : "")}${c.toFixed(3)}${i === 0 ? "" : (i === 1 ? "·x" : `·x^${i}`)}`).join(" ")}</span>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Táhněte body myší. Dvojklik smaže bod. Zkuste degree = 9 na 9 bodech — křivka prochází *všemi* body, ale MSE = 0 *neimplikuje* dobrý model
        (overfitting). Optimální stupeň pro tyto data je obvykle 1–2.
      </div>
    </div>
  );
}

function btnStyle() {
  return { background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 8px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
