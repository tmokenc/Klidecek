// LR vs Wald vs Score — three test statistics geometrically on a log-likelihood curve.
// Uses Exp(λ) likelihood ℓ(λ) = n log λ − λ Σx; H₀: λ = λ₀.
import { useState } from "react";

const W = 540, H = 280;
const PAD_L = 44, PAD_R = 18, PAD_T = 22, PAD_B = 34;
const PW = W - PAD_L - PAD_R, PH = H - PAD_T - PAD_B;

export default function LrWaldScoreTests() {
  const [n, setN] = useState(20);
  const [xbar, setXbar] = useState(0.7);  // empirical mean — leads to MLE λ̂ = 1/x̄
  const [lambda0, setLambda0] = useState(1);

  const sumX = xbar * n;
  const ll = (lam) => n * Math.log(lam) - lam * sumX;
  const score = (lam) => n / lam - sumX;
  const fisher_n = (lam) => n / (lam * lam);  // J_n(λ) = n/λ²
  const lambdaHat = 1 / xbar;

  // Plot range
  const lamMin = Math.max(0.1, Math.min(lambdaHat, lambda0) - 1);
  const lamMax = Math.max(lambdaHat, lambda0) + 1.5;

  const N = 200;
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const lam = lamMin + (i / N) * (lamMax - lamMin);
    pts.push([lam, ll(lam)]);
  }
  const yMax = ll(lambdaHat);
  const yMin = Math.min(ll(lamMin), ll(lamMax), ll(lambda0)) - 1;
  const yRange = yMax - yMin;
  const toX = (lam) => PAD_L + ((lam - lamMin) / (lamMax - lamMin)) * PW;
  const toY = (y) => PAD_T + PH - ((y - yMin) / yRange) * PH;

  // Statistics
  const LR = 2 * (ll(lambdaHat) - ll(lambda0));      // χ²(1)
  const W_stat = (lambdaHat - lambda0) ** 2 * fisher_n(lambdaHat);
  const Score = score(lambda0) ** 2 / fisher_n(lambda0);

  const cv = 3.841;  // χ²(1) at α=0.05

  // Score tangent line at λ₀ — y = ℓ(λ₀) + score(λ₀)·(λ−λ₀)
  const tanX1 = lambda0 - 0.3, tanX2 = lambda0 + 0.3;
  const tanY1 = ll(lambda0) + score(lambda0) * (tanX1 - lambda0);
  const tanY2 = ll(lambda0) + score(lambda0) * (tanX2 - lambda0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <line x1={PAD_L} y1={PAD_T + PH} x2={PAD_L + PW} y2={PAD_T + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} stroke="var(--line-strong)" />

        {/* log-likelihood */}
        <path d={pts.map(([lam, y], i) => `${i ? "L" : "M"} ${toX(lam).toFixed(2)} ${toY(y).toFixed(2)}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2" />

        {/* λ̂ marker */}
        <circle cx={toX(lambdaHat)} cy={toY(ll(lambdaHat))} r="4.5" fill="var(--accent)" />
        <text x={toX(lambdaHat)} y={toY(ll(lambdaHat)) - 10} textAnchor="middle" fontSize="10" fill="var(--accent)" fontFamily="var(--font-mono)">ℓ(λ̂)</text>
        <line x1={toX(lambdaHat)} y1={toY(ll(lambdaHat))} x2={toX(lambdaHat)} y2={PAD_T + PH} stroke="var(--accent)" strokeDasharray="2 2" opacity="0.5" />
        <text x={toX(lambdaHat)} y={PAD_T + PH + 14} textAnchor="middle" fontSize="10" fill="var(--accent)" fontFamily="var(--font-mono)">λ̂={lambdaHat.toFixed(2)}</text>

        {/* λ₀ marker */}
        <circle cx={toX(lambda0)} cy={toY(ll(lambda0))} r="4.5" fill="var(--accent-line)" />
        <line x1={toX(lambda0)} y1={toY(ll(lambda0))} x2={toX(lambda0)} y2={PAD_T + PH} stroke="var(--accent-line)" strokeDasharray="2 2" opacity="0.5" />
        <text x={toX(lambda0)} y={PAD_T + PH + 14} textAnchor="middle" fontSize="10" fill="var(--accent-line)" fontFamily="var(--font-mono)">λ₀={lambda0.toFixed(2)}</text>

        {/* LR: vertical segment between ℓ(λ̂) and ℓ(λ₀) */}
        <line x1={toX(lambdaHat) - 22} y1={toY(ll(lambdaHat))} x2={toX(lambdaHat) - 22} y2={toY(ll(lambda0))} stroke="var(--text)" strokeWidth="2" />
        <text x={toX(lambdaHat) - 26} y={(toY(ll(lambdaHat)) + toY(ll(lambda0))) / 2 + 4} textAnchor="end" fontSize="10" fill="var(--text)" fontFamily="var(--font-mono)">LR depth</text>

        {/* Wald: horizontal between λ̂ and λ₀ */}
        <line x1={toX(lambdaHat)} y1={PAD_T + PH - 16} x2={toX(lambda0)} y2={PAD_T + PH - 16} stroke="var(--text)" strokeWidth="2" />
        <text x={(toX(lambdaHat) + toX(lambda0)) / 2} y={PAD_T + PH - 22} textAnchor="middle" fontSize="10" fill="var(--text)" fontFamily="var(--font-mono)">Wald width</text>

        {/* Score: tangent at λ₀. Label at the tangent's lower-left end (end-anchored) so it
            clears the ℓ(λ̂) MLE label sitting at the curve apex on the right. */}
        <line x1={toX(tanX1)} y1={toY(tanY1)} x2={toX(tanX2)} y2={toY(tanY2)} stroke="var(--text-muted)" strokeWidth="2" />
        <text x={toX(tanX1) - 4} y={toY(tanY1) - 4} textAnchor="end" fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">slope U(λ₀)</text>

        {/* axis label */}
        <text x={W - 16} y={H - 14} fontSize="10" textAnchor="end" fill="var(--text-muted)" fontFamily="var(--font-mono)">λ</text>
      </svg>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <label style={lab()}>x̄ = {xbar.toFixed(2)} (⇒ λ̂ = {(1 / xbar).toFixed(2)})
          <input type="range" className="viz-slider" min={0.3} max={2.5} step={0.05} value={xbar} onChange={(e) => setXbar(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>λ₀ = {lambda0.toFixed(2)}
          <input type="range" className="viz-slider" min={0.3} max={2.5} step={0.05} value={lambda0} onChange={(e) => setLambda0(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>n = {n}
          <input type="range" className="viz-slider" min={5} max={200} value={n} onChange={(e) => setN(+e.target.value)} style={{ width: "100%" }} />
        </label>
      </div>

      <table style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--text)", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ color: "var(--text-muted)" }}>
            <th style={th()}>test</th><th style={th()}>vzorec</th><th style={th()}>hodnota</th><th style={th()}>χ²₀.₉₅(1)</th><th style={th()}>závěr</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={td()}>LR</td><td style={td()}>2(ℓ(λ̂)−ℓ(λ₀))</td><td style={td()}>{LR.toFixed(3)}</td><td style={td()}>{cv}</td><td style={td("yes", LR > cv)}>{LR > cv ? "zamítáme" : "ne"}</td></tr>
          <tr><td style={td()}>Wald</td><td style={td()}>(λ̂−λ₀)²·J_n(λ̂)</td><td style={td()}>{W_stat.toFixed(3)}</td><td style={td()}>{cv}</td><td style={td("yes", W_stat > cv)}>{W_stat > cv ? "zamítáme" : "ne"}</td></tr>
          <tr><td style={td()}>Score</td><td style={td()}>U(λ₀)²/J_n(λ₀)</td><td style={td()}>{Score.toFixed(3)}</td><td style={td()}>{cv}</td><td style={td("yes", Score > cv)}>{Score > cv ? "zamítáme" : "ne"}</td></tr>
        </tbody>
      </table>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
        Pro velké n se všechny tři statistiky asymptoticky shodují (∼ χ²(1) pod H₀). Lišit se mohou na malých vzorcích a daleko od MLE.
      </div>
    </div>
  );
}

function lab() { return { flex: "1 1 180px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }; }
function th() { return { textAlign: "left", padding: "3px 8px", borderBottom: "1px solid var(--line)", fontWeight: "normal" }; }
function td(kind, reject) {
  return { padding: "3px 8px", color: kind === "yes" ? (reject ? "var(--accent-line)" : "var(--text)") : "var(--text)" };
}
