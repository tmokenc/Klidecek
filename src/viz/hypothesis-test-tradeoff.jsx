// Hypothesis test α/β trade-off — H₀ vs H₁ overlap, movable critical value.
import { useState } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 300;
const PAD_L = 40, PAD_R = 16, PAD_T = 20, PAD_B = 60;
const PW = W - PAD_L - PAD_R, PH = H - PAD_T - PAD_B;

export default function HypothesisTestTradeoff() {
  const [mu0, _] = useState(0);
  const [mu1, setMu1] = useState(1.5);
  const [sigma, setSigma] = useState(1);
  const [n, setN] = useState(16);
  const [side, setSide] = useState("right");  // right, two

  // Test statistic X̄ ∼ N(μ, σ²/n) under either hypothesis (known σ).
  const se = sigma / Math.sqrt(n);
  // Critical value: defined by α
  const [alpha, setAlpha] = useState(0.05);

  // For one-sided right: reject when X̄ > c, c = μ₀ + z_{1-α} · se
  // For two-sided: reject when |X̄ - μ₀| > z_{1-α/2} · se
  let c, cLeft, cRight;
  if (side === "right") {
    c = mu0 + S.normalQuantile(1 - alpha) * se;
    cLeft = -Infinity;
    cRight = c;
  } else {
    const z = S.normalQuantile(1 - alpha / 2);
    cLeft = mu0 - z * se;
    cRight = mu0 + z * se;
  }

  // Power: P(reject | μ = μ₁)
  let power;
  if (side === "right") {
    power = 1 - S.normalCDF(cRight, mu1, se);
  } else {
    power = S.normalCDF(cLeft, mu1, se) + (1 - S.normalCDF(cRight, mu1, se));
  }
  const beta = 1 - power;

  // Plot range
  const xMin = Math.min(mu0, mu1) - 4 * se;
  const xMax = Math.max(mu0, mu1) + 4 * se;
  const toX = (x) => PAD_L + ((x - xMin) / (xMax - xMin)) * PW;
  const yMaxRef = 1 / (se * Math.sqrt(2 * Math.PI));
  const toY = (y) => PAD_T + PH - (y / (yMaxRef * 1.1)) * PH;

  const N = 240;
  const pts0 = [], pts1 = [];
  for (let i = 0; i <= N; i++) {
    const x = xMin + (i / N) * (xMax - xMin);
    pts0.push([x, S.normalPDF(x, mu0, se)]);
    pts1.push([x, S.normalPDF(x, mu1, se)]);
  }

  const reject = (x) => side === "right" ? x > cRight : (x < cLeft || x > cRight);

  // Shade α area under H₀ in rejection region
  const alphaArea = pts0.filter(([x]) => reject(x));
  const betaArea = pts1.filter(([x]) => !reject(x));

  const pathPts = (pts) => pts.map(([x, y], i) => `${i ? "L" : "M"} ${toX(x).toFixed(2)} ${toY(y).toFixed(2)}`).join(" ");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        <button className="viz-btn" data-active={side === "right"} onClick={() => setSide("right")}>jednostranný (μ &gt; μ₀)</button>
        <button className="viz-btn" data-active={side === "two"} onClick={() => setSide("two")}>oboustranný (μ ≠ μ₀)</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <line x1={PAD_L} y1={PAD_T + PH} x2={PAD_L + PW} y2={PAD_T + PH} stroke="var(--line-strong)" />

        {/* α shading */}
        {(() => {
          if (alphaArea.length === 0) return null;
          if (side === "right") {
            return (
              <path d={`M ${toX(cRight).toFixed(2)} ${(PAD_T + PH).toFixed(2)} ${alphaArea.map(([x, y]) => `L ${toX(x).toFixed(2)} ${toY(y).toFixed(2)}`).join(" ")} L ${toX(xMax).toFixed(2)} ${(PAD_T + PH).toFixed(2)} Z`}
                fill="var(--accent)" opacity="0.3" />
            );
          }
          const leftArea = pts0.filter(([x]) => x < cLeft);
          const rightArea = pts0.filter(([x]) => x > cRight);
          return (
            <>
              {leftArea.length > 0 && (
                <path d={`M ${toX(xMin).toFixed(2)} ${(PAD_T + PH).toFixed(2)} ${leftArea.map(([x, y]) => `L ${toX(x).toFixed(2)} ${toY(y).toFixed(2)}`).join(" ")} L ${toX(cLeft).toFixed(2)} ${(PAD_T + PH).toFixed(2)} Z`} fill="var(--accent)" opacity="0.3" />
              )}
              {rightArea.length > 0 && (
                <path d={`M ${toX(cRight).toFixed(2)} ${(PAD_T + PH).toFixed(2)} ${rightArea.map(([x, y]) => `L ${toX(x).toFixed(2)} ${toY(y).toFixed(2)}`).join(" ")} L ${toX(xMax).toFixed(2)} ${(PAD_T + PH).toFixed(2)} Z`} fill="var(--accent)" opacity="0.3" />
              )}
            </>
          );
        })()}

        {/* β shading */}
        {betaArea.length > 0 && (
          <path d={`M ${toX(betaArea[0][0]).toFixed(2)} ${(PAD_T + PH).toFixed(2)} ${betaArea.map(([x, y]) => `L ${toX(x).toFixed(2)} ${toY(y).toFixed(2)}`).join(" ")} L ${toX(betaArea[betaArea.length - 1][0]).toFixed(2)} ${(PAD_T + PH).toFixed(2)} Z`}
            fill="var(--accent-line)" opacity="0.3" />
        )}

        {/* H0 curve */}
        <path d={pathPts(pts0)} fill="none" stroke="var(--accent)" strokeWidth="2" />
        {/* H1 curve */}
        <path d={pathPts(pts1)} fill="none" stroke="var(--accent-line)" strokeWidth="2" />

        {/* Critical value lines */}
        {side === "right" ? (
          <line x1={toX(cRight)} y1={PAD_T} x2={toX(cRight)} y2={PAD_T + PH} stroke="var(--text)" strokeDasharray="3 3" />
        ) : (
          <>
            <line x1={toX(cLeft)} y1={PAD_T} x2={toX(cLeft)} y2={PAD_T + PH} stroke="var(--text)" strokeDasharray="3 3" />
            <line x1={toX(cRight)} y1={PAD_T} x2={toX(cRight)} y2={PAD_T + PH} stroke="var(--text)" strokeDasharray="3 3" />
          </>
        )}

        {/* μ markers */}
        <line x1={toX(mu0)} y1={PAD_T + PH} x2={toX(mu0)} y2={PAD_T + PH + 6} stroke="var(--accent)" strokeWidth="2" />
        <text x={toX(mu0)} y={PAD_T + PH + 18} textAnchor="middle" fontSize="11" fill="var(--accent)" fontFamily="var(--font-mono)">μ₀</text>
        <line x1={toX(mu1)} y1={PAD_T + PH} x2={toX(mu1)} y2={PAD_T + PH + 6} stroke="var(--accent-line)" strokeWidth="2" />
        <text x={toX(mu1)} y={PAD_T + PH + 18} textAnchor="middle" fontSize="11" fill="var(--accent-line)" fontFamily="var(--font-mono)">μ₁</text>

        {/* legend */}
        <g transform={`translate(${W - 220}, ${PAD_T + 6})`} fontSize="10.5" fontFamily="var(--font-mono)">
          <rect x="-6" y="-7" width="178" height="59" fill="var(--bg-card)" rx="4" />
          <rect x="0" y="0" width="14" height="9" fill="var(--accent)" opacity="0.3" />
          <text x="18" y="8" fill="var(--accent)">α = {alpha.toFixed(3)}  (chyba I)</text>
          <rect x="0" y="16" width="14" height="9" fill="var(--accent-line)" opacity="0.3" />
          <text x="18" y="24" fill="var(--accent-line)">β = {beta.toFixed(3)}  (chyba II)</text>
          <text x="0" y="42" fill="var(--text-muted)">síla 1−β = {power.toFixed(3)}</text>
        </g>
      </svg>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <label style={lab()}>α = {alpha.toFixed(3)}
          <input type="range" className="viz-slider" min={0.001} max={0.2} step={0.001} value={alpha} onChange={(e) => setAlpha(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>μ₁ = {mu1.toFixed(2)}
          <input type="range" className="viz-slider" min={-3} max={3} step={0.05} value={mu1} onChange={(e) => setMu1(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>σ = {sigma.toFixed(2)}
          <input type="range" className="viz-slider" min={0.3} max={3} step={0.05} value={sigma} onChange={(e) => setSigma(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>n = {n}
          <input type="range" className="viz-slider" min={2} max={200} value={n} onChange={(e) => setN(+e.target.value)} style={{ width: "100%" }} />
        </label>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        kritická hodnota c = {side === "right" ? cRight.toFixed(3) : `±${cRight.toFixed(3)}`} (z_{(1-alpha).toFixed(3)} · σ/√n)
        · efektová velikost δ = (μ₁−μ₀)/σ = {((mu1 - mu0) / sigma).toFixed(2)}
        · Snížení α zvětší β. Zvětšení n snižuje obě.
      </div>
    </div>
  );
}

function lab() { return { flex: "1 1 180px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }; }
