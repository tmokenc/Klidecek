// risk-matrix-ale — Quantitative + qualitative risk analysis. Inputs:
// asset value, exposure factor, ARO → SLE, ALE. Plots on L×I matrix.
import { useState } from "react";

const LEVELS = ["Low", "Med", "High"];
const MATRIX = [
  ["Trivial", "Low",    "Medium"],
  ["Low",     "Medium", "High"],
  ["Medium",  "High",   "Critical"],
];
const CELL_COLOR = {
  Trivial:  "oklch(0.7 0.15 145)",
  Low:      "oklch(0.75 0.12 145)",
  Medium:   "oklch(0.78 0.12 60)",
  High:     "oklch(0.7 0.15 30)",
  Critical: "oklch(0.55 0.2 25)",
};

export default function RiskMatrixAle() {
  const [av, setAv] = useState(1_000_000);
  const [ef, setEf] = useState(60);    // %
  const [aro, setAro] = useState(0.2);
  const [ctrlCost, setCtrlCost] = useState(50_000);
  const [ctrlReduce, setCtrlReduce] = useState(80);  // % reduction of ARO or SLE

  const sle = av * (ef / 100);
  const ale = sle * aro;

  const aleAfter = ale * (1 - ctrlReduce / 100);
  const netSaving = ale - aleAfter - ctrlCost;

  // Qualitative bucket from ALE
  const lik = aro >= 0.5 ? 2 : aro >= 0.1 ? 1 : 0;
  const imp = sle >= 500_000 ? 2 : sle >= 50_000 ? 1 : 0;
  const cellLabel = MATRIX[lik][imp];

  const W = 580, H = 240;
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
        <div style={{ fontSize: 11 }}>
          <div>Asset Value (AV) = ${(av / 1000).toFixed(0)} k
            <input type="range" min="10000" max="10000000" step="10000" value={av} onChange={e => setAv(+e.target.value)} style={slider} /></div>
          <div>Exposure Factor = {ef} %
            <input type="range" min="5" max="100" step="5" value={ef} onChange={e => setEf(+e.target.value)} style={slider} /></div>
          <div>ARO (events/year) = {aro.toFixed(2)}
            <input type="range" min="0.05" max="3" step="0.05" value={aro} onChange={e => setAro(+e.target.value)} style={slider} /></div>
        </div>
        <div style={{ fontSize: 11 }}>
          <div>Control cost = ${(ctrlCost / 1000).toFixed(0)} k/year
            <input type="range" min="0" max="500000" step="5000" value={ctrlCost} onChange={e => setCtrlCost(+e.target.value)} style={slider} /></div>
          <div>Control reduces risk = {ctrlReduce} %
            <input type="range" min="0" max="99" step="1" value={ctrlReduce} onChange={e => setCtrlReduce(+e.target.value)} style={slider} /></div>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* matrix */}
        <text x={150} y={20} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text)">Risk matrix (L × I)</text>
        {[2, 1, 0].map((rowIdx, r) => LEVELS.map((_, c) => {
          const cell = MATRIX[rowIdx][c];
          const hit = rowIdx === lik && c === imp;
          return (
            <g key={`${rowIdx}-${c}`}>
              <rect x={50 + c * 60} y={40 + r * 40} width="58" height="38"
                fill={CELL_COLOR[cell]} opacity={hit ? 0.9 : 0.35}
                stroke={hit ? "white" : "var(--line)"} strokeWidth={hit ? 2 : 0.5} />
              <text x={50 + c * 60 + 29} y={40 + r * 40 + 22} textAnchor="middle" fontSize="9.5"
                fill={hit ? "white" : "var(--text)"} fontWeight={hit ? 700 : 400}>{cell}</text>
            </g>
          );
        }))}
        <text x={40} y={62} textAnchor="end" fontSize="9" fill="var(--text-muted)">High</text>
        <text x={40} y={102} textAnchor="end" fontSize="9" fill="var(--text-muted)">Med</text>
        <text x={40} y={142} textAnchor="end" fontSize="9" fill="var(--text-muted)">Low</text>
        <text x={80} y={172} textAnchor="middle" fontSize="9" fill="var(--text-muted)">Low</text>
        <text x={140} y={172} textAnchor="middle" fontSize="9" fill="var(--text-muted)">Med</text>
        <text x={200} y={172} textAnchor="middle" fontSize="9" fill="var(--text-muted)">High</text>
        <text x={20} y={100} fontSize="9" fill="var(--text-muted)" transform="rotate(-90 20 100)">Likelihood</text>
        <text x={140} y={188} textAnchor="middle" fontSize="9" fill="var(--text-muted)">Impact</text>

        {/* numbers panel */}
        <g fontFamily="ui-monospace, monospace" fontSize="11" fill="var(--text)">
          <text x={280} y={50} fontWeight="600" fill="var(--text)" fontFamily="ui-sans-serif, system-ui">Quantitative</text>
          <text x={280} y={70}>SLE = AV × EF = ${(sle / 1000).toFixed(0)} k</text>
          <text x={280} y={86}>ALE = SLE × ARO = <tspan fontWeight="700" fill="var(--accent)">${(ale / 1000).toFixed(1)} k</tspan>/year</text>
          <text x={280} y={108} fontWeight="600" fill="var(--text)" fontFamily="ui-sans-serif, system-ui">After control</text>
          <text x={280} y={128}>ALE' = ${(aleAfter / 1000).toFixed(1)} k/year</text>
          <text x={280} y={144}>saved = ALE − ALE' − cost</text>
          <text x={280} y={160} fontWeight="700"
            fill={netSaving > 0 ? "oklch(0.7 0.15 145)" : "oklch(0.65 0.18 22)"}>
            = ${(netSaving / 1000).toFixed(1)} k/year {netSaving > 0 ? "✓ worth it" : "✗ not worth it"}
          </text>
        </g>

        <rect x={280} y={185} width={280} height={40} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={420} y={203} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text)">Qualitative bucket: {cellLabel}</text>
        <text x={420} y={218} textAnchor="middle" fontSize="9" fill="var(--text-muted)">
          {cellLabel === "Critical" || cellLabel === "High" ? "→ mitigate / transfer" :
           cellLabel === "Medium" ? "→ mitigate or accept (with sign-off)" : "→ accept"}
        </text>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        Cost-benefit: <b>saved = ALE − ALE' − cost</b>. Pokud kontrola stojí víc, než ušetří, nezavádět; pokud ušetří víc, no-brainer.
        Reziduální riziko = ALE' — vždy zbude něco.
      </div>
    </div>
  );
}

const slider = { width: "100%", marginTop: 2 };
