// χ²(k), t(ν), F(d1,d2) PDF gallery with df sliders + relationships.
import { useState } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 280;
const PAD_L = 40, PAD_R = 18, PAD_T = 20, PAD_B = 34;
const PW = W - PAD_L - PAD_R, PH = H - PAD_T - PAD_B;

const FAMILIES = {
  chi2: { label: "χ²(k)", xMin: 0, xMax: 30, hasD2: false },
  t:    { label: "t(ν)", xMin: -5, xMax: 5, hasD2: false },
  f:    { label: "F(d₁, d₂)", xMin: 0, xMax: 5, hasD2: true },
};

const RELATIONS = {
  chi2: "Σ Zᵢ² pro Z ∼ N(0,1) i.i.d. · χ²(n)/n → 1 (LLN) · (χ²(n)−n)/√(2n) → N(0,1)",
  t: "Z/√(V/n), V ∼ χ²(n) · t(n) → N(0,1) pro n→∞ · t(1) = Cauchy (bez E[X])",
  f: "(U/m)/(V/n) pro U ∼ χ²(m), V ∼ χ²(n) · F(1,n) = t(n)² · m·F(m,n) → χ²(n) pro m→∞",
};

export default function ChisqTFGallery() {
  const [fam, setFam] = useState("chi2");
  const [df1, setDf1] = useState(5);
  const [df2, setDf2] = useState(10);

  const F = FAMILIES[fam];
  const pdf = (x) => {
    if (fam === "chi2") return S.chi2PDF(x, df1);
    if (fam === "t") return S.tPDF(x, df1);
    return S.fPDF(x, df1, df2);
  };

  const N = 240;
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const x = F.xMin + (i / N) * (F.xMax - F.xMin);
    pts.push([x, pdf(x)]);
  }
  const yMax = Math.max(...pts.map(([, y]) => y)) * 1.15;
  const toX = (x) => PAD_L + ((x - F.xMin) / (F.xMax - F.xMin)) * PW;
  const toY = (y) => PAD_T + PH - (y / yMax) * PH;

  // Sample quantiles at α = 0.05 (one-sided upper for χ², F; two-sided for t)
  let q05, q01;
  if (fam === "chi2") { q05 = S.chi2Quantile(0.95, df1); q01 = S.chi2Quantile(0.99, df1); }
  else if (fam === "t") { q05 = S.tQuantile(0.975, df1); q01 = S.tQuantile(0.995, df1); }
  else { q05 = S.fQuantile(0.95, df1, df2); q01 = S.fQuantile(0.99, df1, df2); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        {Object.entries(FAMILIES).map(([k, v]) => (
          <button key={k} className="viz-btn" data-active={fam === k} onClick={() => setFam(k)}>{v.label}</button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <line x1={PAD_L} y1={PAD_T + PH} x2={PAD_L + PW} y2={PAD_T + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} stroke="var(--line-strong)" />

        {/* PDF */}
        <path d={pts.map(([x, y], i) => `${i ? "L" : "M"} ${toX(x).toFixed(2)} ${toY(y).toFixed(2)}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2.2" />

        {/* Upper-tail shading α=0.05 */}
        {q05 < F.xMax && (
          <path d={`M ${toX(q05).toFixed(2)} ${PAD_T + PH} ${pts.filter(([x]) => x >= q05).map(([x, y]) => `L ${toX(x).toFixed(2)} ${toY(y).toFixed(2)}`).join(" ")} L ${toX(F.xMax).toFixed(2)} ${PAD_T + PH} Z`}
            fill="var(--accent-line)" opacity="0.3" />
        )}
        {q05 < F.xMax && (
          <>
            <line x1={toX(q05)} y1={PAD_T} x2={toX(q05)} y2={PAD_T + PH} stroke="var(--accent-line)" strokeDasharray="3 3" />
            <text x={toX(q05) + 3} y={PAD_T + 10} fontSize="10" fill="var(--accent-line)" fontFamily="var(--font-mono)">q₀.₉₅={q05.toFixed(2)}</text>
          </>
        )}

        {/* For t: lower tail too */}
        {fam === "t" && (
          <path d={`M ${toX(-q05).toFixed(2)} ${PAD_T + PH} ${pts.filter(([x]) => x <= -q05).map(([x, y]) => `L ${toX(x).toFixed(2)} ${toY(y).toFixed(2)}`).join(" ")} L ${toX(F.xMin).toFixed(2)} ${PAD_T + PH} Z`}
            fill="var(--accent-line)" opacity="0.3" />
        )}

        {/* x ticks */}
        {(fam === "t" ? [-4, -2, 0, 2, 4] : fam === "chi2" ? [0, 5, 10, 15, 20, 25, 30] : [0, 1, 2, 3, 4, 5]).map((v) => (
          <g key={v}>
            <line x1={toX(v)} y1={PAD_T + PH} x2={toX(v)} y2={PAD_T + PH + 4} stroke="var(--line-strong)" />
            <text x={toX(v)} y={PAD_T + PH + 14} fontSize="9.5" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v}</text>
          </g>
        ))}
        <text x={W - 2} y={H - 2} fontSize="10" textAnchor="end" fill="var(--text-muted)" fontFamily="var(--font-mono)">x</text>
      </svg>

      <div className="viz-controls">
        <label style={lab()}>{fam === "chi2" ? "k" : fam === "t" ? "ν" : "d₁"} = {df1}
          <input type="range" className="viz-slider" min={1} max={40} value={df1} onChange={(e) => setDf1(+e.target.value)} style={{ width: "100%" }} />
        </label>
        {F.hasD2 && (
          <label style={lab()}>d₂ = {df2}
            <input type="range" className="viz-slider" min={1} max={40} value={df2} onChange={(e) => setDf2(+e.target.value)} style={{ width: "100%" }} />
          </label>
        )}
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        q₀.₉₅ = {q05.toFixed(3)} · q₀.₉₉ = {q01.toFixed(3)}
        <br /><em>{RELATIONS[fam]}</em>
      </div>
    </div>
  );
}

function lab() { return { flex: "1 1 200px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }; }
