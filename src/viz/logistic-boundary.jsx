// Logistic regression 2D — draggable weights, sigmoid heatmap, decision boundary.
import { useState } from "react";

const W = 540, H = 320;
const PAD_L = 40, PAD_R = 20, PAD_T = 20, PAD_B = 40;
const XMIN = -4, XMAX = 4;
const YMIN = -4, YMAX = 4;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const xToPx = (x) => PAD_L + ((x - XMIN) / (XMAX - XMIN)) * PLOT_W;
const yToPx = (y) => PAD_T + (1 - (y - YMIN) / (YMAX - YMIN)) * PLOT_H;

// Two clusters: class 0 (blue) and class 1 (orange).
const DATASETS = {
  "linear-sep": {
    label: "lineárně separovatelné",
    points: [
      [-2.5, -2.0, 0], [-2.0, -1.0, 0], [-1.5, -2.5, 0], [-2.8, -0.5, 0],
      [-1.2, -1.5, 0], [-2.2, -2.2, 0], [-0.8, -1.8, 0], [-1.8, -0.2, 0],
      [1.5, 2.0, 1], [2.0, 1.0, 1], [1.8, 2.5, 1], [2.6, 1.5, 1],
      [1.2, 1.8, 1], [2.3, 2.3, 1], [0.8, 1.6, 1], [1.6, 0.7, 1],
    ],
  },
  "overlap": {
    label: "překryv",
    points: [
      [-1.5, -1.0, 0], [-1.0, -0.5, 0], [-2.0, -1.5, 0], [-0.5, -0.8, 0],
      [-1.0, 0.3, 0], [-2.2, 0.0, 0], [0.5, -1.2, 0], [-0.3, -2.0, 0],
      [0.5, 1.0, 1], [1.0, 0.5, 1], [1.5, 1.5, 1], [0.3, 1.8, 1],
      [1.8, 0.7, 1], [1.0, 1.8, 1], [-0.2, 1.5, 1], [2.0, 1.2, 1],
    ],
  },
  "diagonal": {
    label: "diagonální",
    points: [
      [-2.5, 2.0, 0], [-1.5, 2.5, 0], [-2.0, 1.5, 0], [-3.0, 2.0, 0],
      [-1.0, 3.0, 0], [-0.5, 2.5, 0], [-2.5, 3.0, 0], [-1.5, 1.8, 0],
      [2.0, -2.0, 1], [1.5, -2.5, 1], [3.0, -1.5, 1], [2.5, -1.0, 1],
      [1.0, -3.0, 1], [2.0, -1.5, 1], [3.5, -2.5, 1], [1.5, -1.5, 1],
    ],
  },
};

function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }

// Fit logistic via batch gradient ascent
function fitLogistic(points, steps = 200, lr = 0.2) {
  let w0 = 0, w1 = 0.1, w2 = -0.1;
  for (let it = 0; it < steps; it++) {
    let g0 = 0, g1 = 0, g2 = 0;
    for (const [x, y, c] of points) {
      const z = w0 + w1 * x + w2 * y;
      const p = sigmoid(z);
      const err = c - p;
      g0 += err;
      g1 += err * x;
      g2 += err * y;
    }
    w0 += lr * g0 / points.length;
    w1 += lr * g1 / points.length;
    w2 += lr * g2 / points.length;
  }
  return [w0, w1, w2];
}

export default function LogisticBoundary() {
  const [dataKey, setDataKey] = useState("linear-sep");
  const [manual, setManual] = useState(false);
  const [manualW, setManualW] = useState([0, 1, 0.5]);

  const points = DATASETS[dataKey].points;
  const fittedW = manual ? manualW : fitLogistic(points);
  const [w0, w1, w2] = fittedW;

  // Compute heatmap as low-resolution cells.
  const GRID = 28;
  const cells = [];
  for (let i = 0; i < GRID; i++) {
    for (let j = 0; j < GRID; j++) {
      const x = XMIN + (i + 0.5) / GRID * (XMAX - XMIN);
      const y = YMIN + (j + 0.5) / GRID * (YMAX - YMIN);
      const p = sigmoid(w0 + w1 * x + w2 * y);
      cells.push({ i, j, p });
    }
  }
  const cellW = PLOT_W / GRID;
  const cellH = PLOT_H / GRID;

  // Decision boundary: w0 + w1 x + w2 y = 0 → y = -(w0 + w1 x) / w2
  let boundaryPath = "";
  if (Math.abs(w2) > 1e-6) {
    const yL = -(w0 + w1 * XMIN) / w2;
    const yR = -(w0 + w1 * XMAX) / w2;
    boundaryPath = `M${xToPx(XMIN)} ${yToPx(yL)} L${xToPx(XMAX)} ${yToPx(yR)}`;
  } else if (Math.abs(w1) > 1e-6) {
    const xB = -w0 / w1;
    boundaryPath = `M${xToPx(xB)} ${yToPx(YMIN)} L${xToPx(xB)} ${yToPx(YMAX)}`;
  }

  // Compute accuracy
  let correct = 0;
  for (const [x, y, c] of points) {
    const p = sigmoid(w0 + w1 * x + w2 * y);
    if ((p > 0.5 ? 1 : 0) === c) correct++;
  }
  const acc = correct / points.length;

  function probColor(p) {
    // class 1 (p high) = orange, class 0 (p low) = blue
    const r = 240 + (30 - 240) * p;
    return `oklch(0.75 0.13 ${r})`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 11 }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)" }}>data:</span>
          <select value={dataKey} onChange={(e) => setDataKey(e.target.value)}
            style={{ background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 4px", borderRadius: 3 }}>
            {Object.entries(DATASETS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <input type="checkbox" checked={manual} onChange={(e) => setManual(e.target.checked)} />
          manuální váhy
        </label>
        {manual && (
          <>
            <label style={{ display: "flex", gap: 4, alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 10 }}>
              w₀
              <input type="range" min={-3} max={3} step={0.1} value={manualW[0]}
                onChange={(e) => setManualW([+e.target.value, manualW[1], manualW[2]])} style={{ width: 80 }}/>
              <span style={{ minWidth: 36 }}>{manualW[0].toFixed(1)}</span>
            </label>
            <label style={{ display: "flex", gap: 4, alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 10 }}>
              w₁
              <input type="range" min={-3} max={3} step={0.1} value={manualW[1]}
                onChange={(e) => setManualW([manualW[0], +e.target.value, manualW[2]])} style={{ width: 80 }}/>
              <span style={{ minWidth: 36 }}>{manualW[1].toFixed(1)}</span>
            </label>
            <label style={{ display: "flex", gap: 4, alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 10 }}>
              w₂
              <input type="range" min={-3} max={3} step={0.1} value={manualW[2]}
                onChange={(e) => setManualW([manualW[0], manualW[1], +e.target.value])} style={{ width: 80 }}/>
              <span style={{ minWidth: 36 }}>{manualW[2].toFixed(1)}</span>
            </label>
          </>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 620 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* heatmap */}
        {cells.map(({ i, j, p }) => (
          <rect key={`${i}-${j}`}
            x={PAD_L + i * cellW} y={PAD_T + (GRID - 1 - j) * cellH}
            width={cellW + 0.5} height={cellH + 0.5}
            fill={probColor(p)} opacity="0.5"/>
        ))}
        {/* axes */}
        <g stroke="var(--line-strong)" strokeWidth="1" fill="none">
          <line x1={PAD_L} y1={yToPx(0)} x2={W - PAD_R} y2={yToPx(0)} strokeOpacity="0.5"/>
          <line x1={xToPx(0)} y1={PAD_T} x2={xToPx(0)} y2={H - PAD_B} strokeOpacity="0.5"/>
        </g>
        {/* boundary */}
        <path d={boundaryPath} stroke="var(--text)" strokeWidth="2.5" fill="none" strokeDasharray="6 3"/>

        {/* points */}
        {points.map(([x, y, c], i) => (
          <circle key={i} cx={xToPx(x)} cy={yToPx(y)} r="5"
            fill={c === 0 ? "oklch(0.55 0.18 240)" : "oklch(0.65 0.18 30)"}
            stroke="white" strokeWidth="1.5"/>
        ))}

        {/* axis labels */}
        <g fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          {[-4, -2, 0, 2, 4].map((x) => (
            <text key={`xl${x}`} x={xToPx(x)} y={H - PAD_B + 14} textAnchor="middle">{x}</text>
          ))}
          {[-4, -2, 0, 2, 4].map((y) => (
            <text key={`yl${y}`} x={PAD_L - 6} y={yToPx(y) + 3} textAnchor="end">{y}</text>
          ))}
          <text x={W - PAD_R} y={H - PAD_B + 26} textAnchor="end">x₁</text>
          <text x={PAD_L - 30} y={PAD_T + 8}>x₂</text>
        </g>
      </svg>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        <span>σ(w₀ + w₁ x₁ + w₂ x₂)</span>
        <span>w = ({w0.toFixed(2)}, {w1.toFixed(2)}, {w2.toFixed(2)})</span>
        <span>accuracy = {(acc * 100).toFixed(1)}%</span>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 10.5 }}>
        <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 5, background: "oklch(0.55 0.18 240)" }}/> třída 0
        </span>
        <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 5, background: "oklch(0.65 0.18 30)" }}/> třída 1
        </span>
        <span style={{ color: "var(--text-faint)" }}>čárkovaná = decision boundary (P = 0.5)</span>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Heatmapa zobrazuje P(c=1 | x) pro celou rovinu. Decision boundary `wᵀx̃ = 0` rozdělí rovinu na poloprostory.
        S manuálními váhami zkuste w₂ = 0 — boundary bude vertikální (klasifikuje jen podle x₁).
      </div>
    </div>
  );
}
