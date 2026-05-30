// L1 vs L2 regularization — 2D weight space with loss contours + constraint ball.
import { useState } from "react";

const W = 540, H = 320;
const PAD_L = 50, PAD_R = 20, PAD_T = 20, PAD_B = 40;
const WMIN = -3, WMAX = 3;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const wToPx = (w) => PAD_L + ((w - WMIN) / (WMAX - WMIN)) * PLOT_W;
const wToPxY = (w) => PAD_T + (1 - (w - WMIN) / (WMAX - WMIN)) * PLOT_H;

// MSE loss with unregularized minimum (w1*, w2*)
const W_STAR = [2.0, 1.0]; // ideal weights
const A = [[1, 0.5], [0.5, 1]]; // quadratic form (positive-definite)

function loss(w1, w2) {
  const d1 = w1 - W_STAR[0], d2 = w2 - W_STAR[1];
  return 0.5 * (A[0][0] * d1 * d1 + 2 * A[0][1] * d1 * d2 + A[1][1] * d2 * d2);
}

// Find regularized solution on constraint set
// For L2: closed-form (ridge); we can compute approximately by gradient descent constrained to ||w|| ≤ R
// For L1: project onto L1 ball
function findRegSolution(reg, R) {
  // gradient descent with projection
  let w1 = 0, w2 = 0;
  const lr = 0.05;
  for (let i = 0; i < 500; i++) {
    const d1 = w1 - W_STAR[0], d2 = w2 - W_STAR[1];
    const g1 = A[0][0] * d1 + A[0][1] * d2;
    const g2 = A[0][1] * d1 + A[1][1] * d2;
    w1 -= lr * g1;
    w2 -= lr * g2;
    // Project onto constraint
    if (reg === "L2") {
      const norm = Math.sqrt(w1 * w1 + w2 * w2);
      if (norm > R) { w1 *= R / norm; w2 *= R / norm; }
    } else if (reg === "L1") {
      const sum = Math.abs(w1) + Math.abs(w2);
      if (sum > R) {
        // L1 projection (simplified: soft-thresholding equivalent)
        const v = [Math.abs(w1), Math.abs(w2)].sort((a, b) => b - a);
        let cumSum = 0;
        let rho = 0;
        for (let k = 0; k < v.length; k++) {
          cumSum += v[k];
          if (v[k] - (cumSum - R) / (k + 1) > 0) rho = k;
        }
        const theta = (([Math.abs(w1), Math.abs(w2)].slice(0, rho + 1).reduce((a, b) => a + b, 0)) - R) / (rho + 1);
        w1 = Math.sign(w1) * Math.max(Math.abs(w1) - theta, 0);
        w2 = Math.sign(w2) * Math.max(Math.abs(w2) - theta, 0);
      }
    }
  }
  return [w1, w2];
}

export default function RegularizationL1L2() {
  const [reg, setReg] = useState("L2");
  const [R, setR] = useState(1.5);

  const solution = findRegSolution(reg, R);

  // Loss contours
  const LEVELS = [0.5, 1.5, 3, 5, 8];
  function contourPath(level) {
    // For elliptical quadratic: ½ (w − w*)ᵀ A (w − w*) = level
    // Eigen-decomp of A: simple symmetric
    const tr = A[0][0] + A[1][1];
    const det = A[0][0] * A[1][1] - A[0][1] * A[0][1];
    const disc = Math.sqrt(Math.max(0, tr * tr / 4 - det));
    const lam1 = tr / 2 + disc;
    const lam2 = tr / 2 - disc;
    const theta = Math.atan2(2 * A[0][1], A[0][0] - A[1][1]) / 2;
    const a = Math.sqrt(2 * level / lam1);
    const b = Math.sqrt(2 * level / lam2);
    const STEPS = 80;
    const pts = [];
    for (let i = 0; i <= STEPS; i++) {
      const t = (i / STEPS) * Math.PI * 2;
      let x = a * Math.cos(t), y = b * Math.sin(t);
      const xr = x * Math.cos(theta) - y * Math.sin(theta) + W_STAR[0];
      const yr = x * Math.sin(theta) + y * Math.cos(theta) + W_STAR[1];
      pts.push([xr, yr]);
    }
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${wToPx(p[0]).toFixed(1)} ${wToPxY(p[1]).toFixed(1)}`).join(" ") + " Z";
  }

  // Constraint shape
  let constraintPath = "";
  if (reg === "L2") {
    const STEPS = 80;
    const pts = [];
    for (let i = 0; i <= STEPS; i++) {
      const t = (i / STEPS) * Math.PI * 2;
      pts.push([R * Math.cos(t), R * Math.sin(t)]);
    }
    constraintPath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${wToPx(p[0]).toFixed(1)} ${wToPxY(p[1]).toFixed(1)}`).join(" ") + " Z";
  } else if (reg === "L1") {
    // diamond: |w1| + |w2| = R
    constraintPath = `M${wToPx(R)} ${wToPxY(0)} L${wToPx(0)} ${wToPxY(R)} L${wToPx(-R)} ${wToPxY(0)} L${wToPx(0)} ${wToPxY(-R)} Z`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 11 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {["none", "L1", "L2"].map((r) => (
            <button key={r} onClick={() => setReg(r)}
              style={{
                background: reg === r ? "var(--accent)" : "var(--bg-card)",
                color: reg === r ? "white" : "var(--text)",
                border: "1px solid var(--line)", padding: "2px 10px", borderRadius: 3, fontSize: 11, cursor: "pointer",
                fontFamily: "var(--font-mono)",
              }}>
              {r}
            </button>
          ))}
        </div>
        {reg !== "none" && (
          <label style={{ display: "flex", gap: 4, alignItems: "center", fontFamily: "var(--font-mono)" }}>
            radius R
            <input type="range" min={0.2} max={3} step={0.05} value={R} onChange={(e) => setR(+e.target.value)} style={{ width: 100 }}/>
            <span style={{ minWidth: 30 }}>{R.toFixed(2)}</span>
          </label>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 620 }}>
        <defs>
          <clipPath id="rl1l2-plot">
            <rect x={PAD_L} y={PAD_T} width={PLOT_W} height={PLOT_H} />
          </clipPath>
        </defs>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* axes */}
        <g stroke="var(--line)" strokeWidth="0.6" fill="none">
          <line x1={PAD_L} y1={wToPxY(0)} x2={W - PAD_R} y2={wToPxY(0)} strokeOpacity="0.5"/>
          <line x1={wToPx(0)} y1={PAD_T} x2={wToPx(0)} y2={H - PAD_B} strokeOpacity="0.5"/>
        </g>
        {/* axis labels */}
        <g fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          {[-3, -2, -1, 0, 1, 2, 3].map((w) => (
            <g key={w}>
              <text x={wToPx(w)} y={H - PAD_B + 14} textAnchor="middle">{w}</text>
              <text x={wToPx(0) - 4} y={wToPxY(w) + 3} textAnchor="end">{w}</text>
            </g>
          ))}
          <text x={W - PAD_R} y={H - PAD_B + 26} textAnchor="end">w₁</text>
          <text x={PAD_L - 30} y={PAD_T + 8}>w₂</text>
        </g>
        {/* Loss contours (clipped to plot area so outer ellipses don't overflow the viewBox) */}
        <g clipPath="url(#rl1l2-plot)">
          {LEVELS.map((lv) => (
            <path key={lv} d={contourPath(lv)} stroke="var(--accent)" strokeWidth="1.2" fill="none" opacity="0.5"/>
          ))}
        </g>
        {/* Unconstrained minimum */}
        <circle cx={wToPx(W_STAR[0])} cy={wToPxY(W_STAR[1])} r="5" fill="oklch(0.75 0.18 145)" stroke="white" strokeWidth="1.5"/>
        <text x={wToPx(W_STAR[0]) + 8} y={wToPxY(W_STAR[1]) - 6} fontSize="9" fontFamily="var(--font-mono)" fill="oklch(0.78 0.18 145)">w* (no reg)</text>

        {/* Constraint */}
        {reg !== "none" && (
          <path d={constraintPath} stroke="oklch(0.7 0.2 60)" strokeWidth="2" fill="oklch(0.7 0.2 60)" fillOpacity="0.08"/>
        )}

        {/* Solution */}
        {reg !== "none" && (
          <>
            <circle cx={wToPx(solution[0])} cy={wToPxY(solution[1])} r="6" fill="oklch(0.7 0.2 30)" stroke="white" strokeWidth="1.5"/>
            <text x={wToPx(solution[0]) + 8} y={wToPxY(solution[1]) + 4} fontSize="9" fontFamily="var(--font-mono)" fill="oklch(0.78 0.18 30)">ŵ ({reg})</text>
          </>
        )}
      </svg>

      <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
        w* = ({W_STAR[0]}, {W_STAR[1]}) →
        {reg !== "none" && <strong style={{ color: "oklch(0.78 0.18 30)", marginLeft: 6 }}>
          ŵ = ({solution[0].toFixed(2)}, {solution[1].toFixed(2)})
        </strong>}
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Loss kontury = elipsy okolo w*. Constraint ball: <strong>L2</strong> = kruh, <strong>L1</strong> = kosočtverec.
        Řešení = tangenta nejnižší kontury ke constraintu. L1 má tangenty v *rozích* → sparse w (jedna složka = 0).
        L2 = hladké zmenšování všech složek. Proto L1 pro feature selection, L2 pro smooth shrinkage.
      </div>
    </div>
  );
}
