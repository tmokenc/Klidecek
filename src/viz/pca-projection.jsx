// pca-projection — draggable 2D points; live covariance ellipse + PC axes;
// 1D projection on PC1; reconstruction error shown as residual segments.
import { useState } from "react";

const W = 540, H = 336;

const INIT = [
  [1.5, 2.4], [2.5, 3.1], [3.5, 4.0], [4.5, 4.7], [5.5, 5.6], [6.5, 6.2],
  [7.5, 7.3], [3.0, 5.0], [5.0, 3.5], [6.0, 4.0], [4.0, 6.2], [5.0, 6.8],
];

function eigen2x2(c) {
  // c = [[a,b],[b,d]]
  const a = c[0][0], b = c[0][1], d = c[1][1];
  const tr = a + d;
  const det = a * d - b * b;
  const disc = Math.sqrt(Math.max(0, tr * tr / 4 - det));
  const l1 = tr / 2 + disc;
  const l2 = tr / 2 - disc;
  // eigenvector for l1
  let vx = 1, vy = 0;
  if (Math.abs(b) > 1e-9) {
    vx = b;
    vy = l1 - a;
  } else if (Math.abs(a - l1) < 1e-9) {
    vx = 1; vy = 0;
  } else {
    vx = 0; vy = 1;
  }
  const n1 = Math.sqrt(vx * vx + vy * vy);
  vx /= n1; vy /= n1;
  // perpendicular
  const ux = -vy, uy = vx;
  return { l1, l2, v1: [vx, vy], v2: [ux, uy] };
}

function pca(data) {
  const n = data.length;
  const mx = data.reduce((s, [x]) => s + x, 0) / n;
  const my = data.reduce((s, [, y]) => s + y, 0) / n;
  let sxx = 0, sxy = 0, syy = 0;
  for (const [x, y] of data) {
    sxx += (x - mx) ** 2;
    sxy += (x - mx) * (y - my);
    syy += (y - my) ** 2;
  }
  sxx /= n; sxy /= n; syy /= n;
  const { l1, l2, v1, v2 } = eigen2x2([[sxx, sxy], [sxy, syy]]);
  const totalVar = l1 + l2;
  const explained = totalVar > 0 ? l1 / totalVar : 0;
  // project + reconstruct using only v1
  const proj = data.map(([x, y]) => {
    const cx = x - mx, cy = y - my;
    const t = cx * v1[0] + cy * v1[1];
    return { t, recon: [mx + t * v1[0], my + t * v1[1]] };
  });
  const reconErr = data.reduce((s, [x, y], i) => s + (x - proj[i].recon[0]) ** 2 + (y - proj[i].recon[1]) ** 2, 0);
  return { mx, my, l1, l2, v1, v2, explained, proj, reconErr };
}

export default function PcaProjection() {
  const [data, setData] = useState(INIT.map(p => [...p]));
  const [drag, setDrag] = useState(null);
  const [showReconstruction, setShowReconstruction] = useState(true);

  const f = pca(data);

  const xMin = 0, xMax = 10, yMin = 0, yMax = 10;
  const PAD_L = 36, PAD_R = 16, PAD_T = 40, PAD_B = 50;
  const PW = W - PAD_L - PAD_R;
  const PH = H - PAD_T - PAD_B;
  const toX = (x) => PAD_L + ((x - xMin) / (xMax - xMin)) * PW;
  const toY = (y) => PAD_T + PH - ((y - yMin) / (yMax - yMin)) * PH;
  const pxToX = (px) => xMin + (px - PAD_L) / PW * (xMax - xMin);
  const pxToY = (py) => yMax - (py - PAD_T) / PH * (yMax - yMin);

  function onMove(e) {
    if (drag === null) return;
    const svg = e.currentTarget;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const py = ((e.clientY - r.top) / r.height) * H;
    const nx = Math.max(xMin, Math.min(xMax, pxToX(px)));
    const ny = Math.max(yMin, Math.min(yMax, pxToY(py)));
    setData(data.map((p, i) => i === drag ? [nx, ny] : p));
  }

  // Confidence ellipse: 2σ contour
  const ang = Math.atan2(f.v1[1], f.v1[0]) * 180 / Math.PI;
  const rx = 2 * Math.sqrt(Math.max(0, f.l1));
  const ry = 2 * Math.sqrt(Math.max(0, f.l2));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button onClick={() => setData(INIT.map(p => [...p]))} style={btn}>reset</button>
        <button onClick={() => setData([...data, [Math.random() * 8 + 1, Math.random() * 8 + 1]])} style={btn}>+ bod</button>
        <button onClick={() => setData(data.length > 3 ? data.slice(0, -1) : data)} style={btn}>− bod</button>
        <button onClick={() => setShowReconstruction(s => !s)} style={{ ...btn, background: showReconstruction ? "var(--accent)" : "var(--bg-inset)" }}>residuals</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4, userSelect: "none", touchAction: "none" }}
        onMouseMove={onMove}
        onMouseUp={() => setDrag(null)}
        onMouseLeave={() => setDrag(null)}>
        {/* axes */}
        <line x1={PAD_L} y1={PAD_T + PH} x2={W - PAD_R} y2={PAD_T + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} stroke="var(--line-strong)" />

        {/* covariance ellipse — center mean, axes ±2√λ along eigenvectors */}
        <g transform={`translate(${toX(f.mx)}, ${toY(f.my)}) rotate(${-ang})`}>
          <ellipse cx={0} cy={0}
            rx={(rx / (xMax - xMin)) * PW}
            ry={(ry / (yMax - yMin)) * PH}
            fill="none" stroke="oklch(0.65 0.16 264)" strokeWidth="1" strokeDasharray="3 3" />
        </g>

        {/* PC1 axis (along v1) */}
        <line
          x1={toX(f.mx - 5 * f.v1[0])} y1={toY(f.my - 5 * f.v1[1])}
          x2={toX(f.mx + 5 * f.v1[0])} y2={toY(f.my + 5 * f.v1[1])}
          stroke="oklch(0.6 0.18 22)" strokeWidth="1.5" />
        <text x={toX(f.mx + 4.5 * f.v1[0])} y={toY(f.my + 4.5 * f.v1[1]) - 4} fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.6 0.18 22)">PC1</text>

        {/* PC2 axis */}
        <line
          x1={toX(f.mx - 3 * f.v2[0])} y1={toY(f.my - 3 * f.v2[1])}
          x2={toX(f.mx + 3 * f.v2[0])} y2={toY(f.my + 3 * f.v2[1])}
          stroke="oklch(0.65 0.16 145)" strokeWidth="1.2" strokeDasharray="2 2" />
        <text x={toX(f.mx + 3 * f.v2[0])} y={toY(f.my + 3 * f.v2[1]) + 12} fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.65 0.16 145)">PC2</text>

        {/* original points */}
        {data.map(([x, y], i) => (
          <g key={i}>
            {showReconstruction && (
              <line x1={toX(x)} y1={toY(y)} x2={toX(f.proj[i].recon[0])} y2={toY(f.proj[i].recon[1])}
                stroke="oklch(0.7 0.14 60)" strokeWidth="0.8" strokeDasharray="2 2" />
            )}
            <circle cx={toX(x)} cy={toY(y)} r={5} fill="oklch(0.65 0.16 264)" stroke="var(--text)" strokeWidth="0.5"
              style={{ cursor: "move" }} onMouseDown={() => setDrag(i)} />
          </g>
        ))}

        {/* mean marker */}
        <circle cx={toX(f.mx)} cy={toY(f.my)} r={4} fill="oklch(0.6 0.18 22)" />
        <text x={toX(f.mx) + 6} y={toY(f.my) - 4} fontSize="9" fontFamily="var(--font-mono)" fill="oklch(0.6 0.18 22)">μ</text>

        {/* 1D projection line below */}
        <text x={PAD_L} y={H - 28} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">1D projection onto PC1:</text>
        <line x1={PAD_L} y1={H - 14} x2={W - PAD_R} y2={H - 14} stroke="var(--line-strong)" />
        {(() => {
          const tVals = f.proj.map(p => p.t);
          const tMin = Math.min(...tVals, -1), tMax = Math.max(...tVals, 1);
          const toT = (t) => PAD_L + ((t - tMin) / (tMax - tMin + 1e-9)) * (W - PAD_L - PAD_R);
          return f.proj.map((p, i) => (
            <circle key={i} cx={toT(p.t)} cy={H - 14} r={3.5} fill="oklch(0.65 0.16 264)" stroke="var(--text)" strokeWidth="0.3" />
          ));
        })()}
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, fontFamily: "var(--font-mono)", fontSize: 12 }}>
        <span>λ₁ = {f.l1.toFixed(3)}</span>
        <span>λ₂ = {f.l2.toFixed(3)}</span>
        <span>explained = {(f.explained * 100).toFixed(1)}%</span>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        PC1 = direction of maximum variance (red). Orthogonal residuals (orange) are minimized — PC1 is the optimal 1D linear projection by squared reconstruction error.
        Drag a point along PC1 → PC1 mostly extends; drag perpendicular → λ₂ grows.
      </div>
    </div>
  );
}

const btn = {
  fontFamily: "var(--font-mono)", fontSize: 11, padding: "2px 8px",
  background: "var(--bg-inset)", color: "var(--text)",
  border: "1px solid var(--line-strong)", borderRadius: 3, cursor: "pointer",
};
