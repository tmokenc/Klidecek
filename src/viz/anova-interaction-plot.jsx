// Two-way ANOVA interaction plot — lines parallel = no interaction; crossing = interaction.
import { useState } from "react";

const W = 540, H = 300;
const PAD_L = 50, PAD_R = 90, PAD_T = 28, PAD_B = 36;
const PW = W - PAD_L - PAD_R, PH = H - PAD_T - PAD_B;

export default function AnovaInteractionPlot() {
  const [mu, setMu] = useState(50);
  const [alphaA1, setAlphaA1] = useState(-3);
  const [alphaA2, setAlphaA2] = useState(3);   // A levels: A1, A2; Σα = 0
  const [betaB1, setBetaB1] = useState(-4);
  const [betaB2, setBetaB2] = useState(4);    // B levels: B1, B2
  const [interaction, setInteraction] = useState(0);  // interaction term magnitude

  // Cell means: μ + α_i + β_j + γ_ij where γ_11 = +I, γ_12 = -I, γ_21 = -I, γ_22 = +I
  const cellMean = (i, j) => {
    const a = i === 0 ? alphaA1 : alphaA2;
    const b = j === 0 ? betaB1 : betaB2;
    const g = (i === j ? 1 : -1) * interaction;
    return mu + a + b + g;
  };

  const cells = [
    [cellMean(0, 0), cellMean(0, 1)],
    [cellMean(1, 0), cellMean(1, 1)],
  ];

  const yMin = 30, yMax = 70;
  const xB1 = PAD_L + 60;
  const xB2 = PAD_L + PW - 60;
  const toY = (v) => PAD_T + PH - ((v - yMin) / (yMax - yMin)) * PH;

  // Interaction effect on A1 vs A2 — should we say signif?
  const linesParallel = Math.abs(interaction) < 0.5;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <line x1={PAD_L} y1={PAD_T + PH} x2={PAD_L + PW} y2={PAD_T + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} stroke="var(--line-strong)" />

        {/* B-axis labels */}
        <text x={xB1} y={PAD_T + PH + 18} textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">B₁</text>
        <text x={xB2} y={PAD_T + PH + 18} textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">B₂</text>

        {/* Y ticks */}
        {[30, 40, 50, 60, 70].map((v) => (
          <g key={v}>
            <line x1={PAD_L - 4} y1={toY(v)} x2={PAD_L} y2={toY(v)} stroke="var(--line-strong)" />
            <text x={PAD_L - 6} y={toY(v) + 3} fontSize="9.5" textAnchor="end" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v}</text>
          </g>
        ))}

        {/* Line for A1 */}
        <line x1={xB1} y1={toY(cells[0][0])} x2={xB2} y2={toY(cells[0][1])} stroke="var(--accent)" strokeWidth="2.5" />
        <circle cx={xB1} cy={toY(cells[0][0])} r="5" fill="var(--accent)" />
        <circle cx={xB2} cy={toY(cells[0][1])} r="5" fill="var(--accent)" />
        <text x={xB2 + 10} y={toY(cells[0][1]) + 4} fontSize="11" fill="var(--accent)" fontFamily="var(--font-mono)">A₁</text>

        {/* Line for A2 */}
        <line x1={xB1} y1={toY(cells[1][0])} x2={xB2} y2={toY(cells[1][1])} stroke="var(--accent-line)" strokeWidth="2.5" />
        <circle cx={xB1} cy={toY(cells[1][0])} r="5" fill="var(--accent-line)" />
        <circle cx={xB2} cy={toY(cells[1][1])} r="5" fill="var(--accent-line)" />
        <text x={xB2 + 10} y={toY(cells[1][1]) + 4} fontSize="11" fill="var(--accent-line)" fontFamily="var(--font-mono)">A₂</text>

        {/* Cell mean labels */}
        {cells.map((row, i) => row.map((v, j) => (
          <text key={`${i}-${j}`} x={j === 0 ? xB1 - 16 : xB2 + 16} y={toY(v) - 8} fontSize="9.5" textAnchor={j === 0 ? "end" : "start"} fill="var(--text-muted)" fontFamily="var(--font-mono)">{v.toFixed(1)}</text>
        )))}

        <text x={20} y={PAD_T - 10} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">Y</text>
      </svg>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <label style={lab()}>α (efekt A) = {((alphaA2 - alphaA1) / 2).toFixed(2)}
          <input type="range" min={-8} max={8} step={0.5} value={alphaA2} onChange={(e) => { setAlphaA2(+e.target.value); setAlphaA1(-(+e.target.value)); }} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>β (efekt B) = {((betaB2 - betaB1) / 2).toFixed(2)}
          <input type="range" min={-8} max={8} step={0.5} value={betaB2} onChange={(e) => { setBetaB2(+e.target.value); setBetaB1(-(+e.target.value)); }} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>γ (interakce) = {interaction.toFixed(2)}
          <input type="range" min={-6} max={6} step={0.5} value={interaction} onChange={(e) => setInteraction(+e.target.value)} style={{ width: "100%" }} />
        </label>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        Buňkový průměr: Y = μ + α_i + β_j + γ_ij. <strong>Bez interakce</strong> (γ=0): linie paralelní; efekt B je stejný v obou úrovních A.
        <strong> S interakcí</strong> (γ≠0): linie se kříží nebo divergují; <em>efekt B závisí na úrovni A</em>. Pravidlo: pokud je interakce signifikantní, hlavní efekty interpretujte opatrně.
        <br />{linesParallel ? "↑ Aktuálně: linie paralelní (žádná interakce)" : "↑ Aktuálně: linie nejsou paralelní (interakce)"}
      </div>
    </div>
  );
}

function lab() { return { flex: "1 1 180px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }; }
