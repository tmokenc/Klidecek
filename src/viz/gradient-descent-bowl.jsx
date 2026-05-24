// Gradient descent on a 2D loss surface — interactive start, learning rate, optimizer comparison.
import { useState, useRef, useMemo } from "react";

const W = 540, H = 320;
const PAD_L = 40, PAD_R = 20, PAD_T = 20, PAD_B = 40;
const XMIN = -3, XMAX = 3, YMIN = -3, YMAX = 3;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const xToPx = (x) => PAD_L + ((x - XMIN) / (XMAX - XMIN)) * PLOT_W;
const yToPx = (y) => PAD_T + (1 - (y - YMIN) / (YMAX - YMIN)) * PLOT_H;
const pxToX = (px) => XMIN + ((px - PAD_L) / PLOT_W) * (XMAX - XMIN);
const pxToY = (py) => YMIN + (1 - (py - PAD_T) / PLOT_H) * (YMAX - YMIN);

const SURFACES = {
  "bowl": {
    label: "konvexní (paraboloid)",
    f: (x, y) => 0.5 * (x * x + 2 * y * y),
    grad: (x, y) => [x, 2 * y],
  },
  "rosenbrock": {
    label: "Rosenbrock (banán)",
    f: (x, y) => Math.pow(1 - x, 2) + 5 * Math.pow(y - x * x, 2),
    grad: (x, y) => [-2 * (1 - x) - 20 * x * (y - x * x), 10 * (y - x * x)],
  },
  "saddle": {
    label: "sedlový bod",
    f: (x, y) => x * x - y * y + 0.1 * y * y * y * y,
    grad: (x, y) => [2 * x, -2 * y + 0.4 * y * y * y],
  },
};

const OPTIMIZERS = ["GD", "Momentum", "Adam"];

function runOptimizer(opt, surface, start, lr, steps = 60) {
  const path = [start];
  let x = start[0], y = start[1];
  let mx = 0, my = 0; // momentum / first moment
  let vx = 0, vy = 0; // second moment for Adam
  const beta1 = 0.9, beta2 = 0.999, eps = 1e-8;
  for (let t = 1; t <= steps; t++) {
    const [gx, gy] = surface.grad(x, y);
    if (opt === "GD") {
      x -= lr * gx;
      y -= lr * gy;
    } else if (opt === "Momentum") {
      mx = beta1 * mx + (1 - beta1) * gx;
      my = beta1 * my + (1 - beta1) * gy;
      x -= lr * mx;
      y -= lr * my;
    } else if (opt === "Adam") {
      mx = beta1 * mx + (1 - beta1) * gx;
      my = beta1 * my + (1 - beta1) * gy;
      vx = beta2 * vx + (1 - beta2) * gx * gx;
      vy = beta2 * vy + (1 - beta2) * gy * gy;
      const mhx = mx / (1 - Math.pow(beta1, t));
      const mhy = my / (1 - Math.pow(beta1, t));
      const vhx = vx / (1 - Math.pow(beta2, t));
      const vhy = vy / (1 - Math.pow(beta2, t));
      x -= lr * mhx / (Math.sqrt(vhx) + eps);
      y -= lr * mhy / (Math.sqrt(vhy) + eps);
    }
    if (!isFinite(x) || !isFinite(y) || Math.abs(x) > 100 || Math.abs(y) > 100) break;
    path.push([x, y]);
  }
  return path;
}

export default function GradientDescentBowl() {
  const [surfaceKey, setSurfaceKey] = useState("bowl");
  const [start, setStart] = useState([-2.2, 1.8]);
  const [lr, setLr] = useState(0.1);
  const [activeOpts, setActiveOpts] = useState({ GD: true, Momentum: true, Adam: true });
  const svgRef = useRef(null);

  const surface = SURFACES[surfaceKey];

  // Build contour data
  const contours = useMemo(() => {
    const GRID = 50;
    const cells = [];
    let zMin = Infinity, zMax = -Infinity;
    const grid = [];
    for (let i = 0; i < GRID; i++) {
      const row = [];
      for (let j = 0; j < GRID; j++) {
        const x = XMIN + i / (GRID - 1) * (XMAX - XMIN);
        const y = YMIN + j / (GRID - 1) * (YMAX - YMIN);
        const z = surface.f(x, y);
        row.push(z);
        if (z < zMin) zMin = z;
        if (z > zMax) zMax = z;
      }
      grid.push(row);
    }
    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        const z = grid[i][j];
        const t = Math.min(1, Math.max(0, (z - zMin) / (zMax - zMin + 1e-9)));
        cells.push({ i, j, t });
      }
    }
    return { cells, GRID };
  }, [surfaceKey]);

  const paths = useMemo(() => ({
    GD: runOptimizer("GD", surface, start, lr),
    Momentum: runOptimizer("Momentum", surface, start, lr),
    Adam: runOptimizer("Adam", surface, start, lr),
  }), [surface, start, lr]);

  const cellW = PLOT_W / contours.GRID;
  const cellH = PLOT_H / contours.GRID;

  function contourColor(t) {
    const l = 0.85 - t * 0.5;
    return `oklch(${l} 0.06 240)`;
  }

  function pathColor(o) {
    return { GD: "oklch(0.7 0.18 30)", Momentum: "oklch(0.7 0.18 145)", Adam: "oklch(0.65 0.2 280)" }[o];
  }

  function onSvgMouseDown(e) {
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    const x = pxToX(px), y = pxToY(py);
    if (x >= XMIN && x <= XMAX && y >= YMIN && y <= YMAX) setStart([x, y]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 11 }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)" }}>plocha:</span>
          <select value={surfaceKey} onChange={(e) => setSurfaceKey(e.target.value)}
            style={{ background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 4px", borderRadius: 3 }}>
            {Object.entries(SURFACES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center", fontFamily: "var(--font-mono)" }}>
          α
          <input type="range" min={0.005} max={0.5} step={0.005} value={lr} onChange={(e) => setLr(+e.target.value)} style={{ width: 110 }}/>
          <span style={{ minWidth: 40 }}>{lr.toFixed(3)}</span>
        </label>
        {OPTIMIZERS.map((o) => (
          <label key={o} style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <input type="checkbox" checked={activeOpts[o]} onChange={(e) => setActiveOpts({ ...activeOpts, [o]: e.target.checked })}/>
            <span style={{ color: pathColor(o), fontWeight: 600 }}>{o}</span>
          </label>
        ))}
      </div>

      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} onMouseDown={onSvgMouseDown}
        style={{ width: "100%", display: "block", maxWidth: 620, cursor: "crosshair" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {contours.cells.map(({ i, j, t }) => (
          <rect key={`${i}-${j}`} x={PAD_L + i * cellW} y={PAD_T + (contours.GRID - 1 - j) * cellH}
            width={cellW + 0.5} height={cellH + 0.5} fill={contourColor(t)}/>
        ))}
        {/* axes */}
        <g stroke="var(--line)" strokeWidth="1" fill="none">
          <line x1={PAD_L} y1={yToPx(0)} x2={W - PAD_R} y2={yToPx(0)} strokeOpacity="0.4"/>
          <line x1={xToPx(0)} y1={PAD_T} x2={xToPx(0)} y2={H - PAD_B} strokeOpacity="0.4"/>
        </g>
        {/* trajectories */}
        {OPTIMIZERS.map((o) => {
          if (!activeOpts[o]) return null;
          const p = paths[o];
          if (p.length < 2) return null;
          const d = p.map(([x, y], i) => `${i === 0 ? "M" : "L"}${xToPx(x).toFixed(1)} ${yToPx(y).toFixed(1)}`).join(" ");
          return (
            <g key={o}>
              <path d={d} stroke={pathColor(o)} strokeWidth="2" fill="none" opacity="0.85"/>
              {p.slice(0, -1).filter((_, idx) => idx % 5 === 0).map(([x, y], i) => (
                <circle key={i} cx={xToPx(x)} cy={yToPx(y)} r="2" fill={pathColor(o)} opacity="0.7"/>
              ))}
              <circle cx={xToPx(p[p.length - 1][0])} cy={yToPx(p[p.length - 1][1])} r="4" fill={pathColor(o)} stroke="var(--bg-inset)" strokeWidth="1.5"/>
            </g>
          );
        })}
        {/* start marker */}
        <g>
          <circle cx={xToPx(start[0])} cy={yToPx(start[1])} r="5" fill="var(--text)" stroke="var(--bg-inset)" strokeWidth="1.5"/>
          <text x={xToPx(start[0]) + 8} y={yToPx(start[1]) - 6} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">start</text>
        </g>
        {/* tick labels */}
        <g fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          {[-3, -2, -1, 0, 1, 2, 3].map((x) => (
            <text key={`xl${x}`} x={xToPx(x)} y={H - PAD_B + 14} textAnchor="middle">{x}</text>
          ))}
          {[-3, -2, -1, 0, 1, 2, 3].map((y) => (
            <text key={`yl${y}`} x={PAD_L - 6} y={yToPx(y) + 3} textAnchor="end">{y}</text>
          ))}
          <text x={W - PAD_R} y={H - PAD_B + 26} textAnchor="end">θ₁</text>
          <text x={PAD_L - 30} y={PAD_T + 8}>θ₂</text>
        </g>
      </svg>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        {OPTIMIZERS.map((o) => {
          if (!activeOpts[o]) return null;
          const p = paths[o];
          const final = p[p.length - 1];
          const lossFinal = surface.f(final[0], final[1]);
          return (
            <span key={o} style={{ color: pathColor(o) }}>
              {o}: {p.length - 1} kroků, L = {lossFinal.toFixed(3)}
            </span>
          );
        })}
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Klikněte kdekoliv v rovině pro nový start. GD = vanilla `θ ← θ − α∇L`. Momentum = `m ← β·m + (1−β)·∇L`.
        Adam = adaptive lr per param. Vyzkoušejte Rosenbrock funkci — GD se motá v ohýbáné dolině, Adam ji prokousává rychleji.
      </div>
    </div>
  );
}
