// Karger min-cut — contract random edges step by step on a small graph.
import { useState, useMemo } from "react";
import * as S from "./_msp-stats.js";

// Small graph with known min-cut. Two clusters connected by 2 edges.
// Vertices 0..5, edges as adjacency list of (u, v) pairs (multi-edges allowed)
const INIT = {
  vertices: [
    { id: 0, x: 100, y: 100 },
    { id: 1, x: 100, y: 220 },
    { id: 2, x: 200, y: 160 },
    { id: 3, x: 340, y: 160 },
    { id: 4, x: 440, y: 100 },
    { id: 5, x: 440, y: 220 },
  ],
  edges: [
    [0, 1], [0, 2], [1, 2],   // left cluster (triangle)
    [4, 5], [4, 3], [3, 5],   // right cluster (triangle)
    [2, 3], [2, 3],           // bridge — 2 edges → min-cut = 2
  ],
  trueMinCut: 2,
};

export default function KargerContractionAnim() {
  const [state, setState] = useState(makeState(INIT, 1));
  const [seed, setSeed] = useState(1);
  const [trialResults, setTrialResults] = useState([]);

  function reset() {
    setState(makeState(INIT, seed));
  }

  function step() {
    if (state.contractedEdges.length === 0 || state.vertexGroups.length <= 2) return;
    const rng = state.rng;
    const remaining = state.contractedEdges.filter((e) => e[0] !== e[1]);
    if (remaining.length === 0) return;
    const idx = Math.floor(rng() * remaining.length);
    const [u, v] = remaining[idx];

    // Merge group containing v into group containing u
    const newGroups = state.vertexGroups.map((g) => g.includes(u) ? [...g] : g.includes(v) ? null : g).filter(Boolean);
    const merged = state.vertexGroups.find((g) => g.includes(u)).concat(state.vertexGroups.find((g) => g.includes(v)));
    const groupsFinal = newGroups.map((g) => g.includes(u) ? merged : g);

    // Rewrite edges
    const repr = new Map();
    for (const g of groupsFinal) for (const x of g) repr.set(x, g[0]);
    const newEdges = state.contractedEdges
      .map((e) => [repr.get(e[0]), repr.get(e[1])])
      .filter((e) => e[0] !== e[1]);

    setState({
      ...state,
      vertexGroups: groupsFinal,
      contractedEdges: newEdges,
      stepCount: state.stepCount + 1,
      lastContracted: [u, v],
    });
  }

  function fullTrial() {
    let st = makeState(INIT, Math.floor(Math.random() * 100000));
    while (st.vertexGroups.length > 2) {
      const remaining = st.contractedEdges.filter((e) => e[0] !== e[1]);
      if (remaining.length === 0) break;
      const idx = Math.floor(st.rng() * remaining.length);
      const [u, v] = remaining[idx];
      const newGroups = st.vertexGroups.map((g) => g.includes(u) ? [...g] : g.includes(v) ? null : g).filter(Boolean);
      const merged = st.vertexGroups.find((g) => g.includes(u)).concat(st.vertexGroups.find((g) => g.includes(v)));
      const groupsFinal = newGroups.map((g) => g.includes(u) ? merged : g);
      const repr = new Map();
      for (const g of groupsFinal) for (const x of g) repr.set(x, g[0]);
      const newEdges = st.contractedEdges.map((e) => [repr.get(e[0]), repr.get(e[1])]).filter((e) => e[0] !== e[1]);
      st = { ...st, vertexGroups: groupsFinal, contractedEdges: newEdges };
    }
    return st.contractedEdges.length;  // final cut size
  }

  function runManyTrials(num = 100) {
    const out = [];
    for (let i = 0; i < num; i++) out.push(fullTrial());
    setTrialResults(out);
  }

  const successCount = trialResults.filter((c) => c === INIT.trueMinCut).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox="0 0 540 320" style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {/* Edges */}
        {state.contractedEdges.map(([u, v], i) => {
          const pu = state.positions.get(u);
          const pv = state.positions.get(v);
          if (!pu || !pv) return null;
          const isLast = state.lastContracted && (state.lastContracted[0] === u || state.lastContracted[1] === u) && (state.lastContracted[0] === v || state.lastContracted[1] === v);
          return <line key={i} x1={pu.x} y1={pu.y} x2={pv.x} y2={pv.y} stroke={isLast ? "var(--accent-line)" : "var(--text-muted)"} strokeWidth={isLast ? 2.5 : 1.5} />;
        })}

        {/* Group "super-vertices" */}
        {state.vertexGroups.map((g, i) => {
          const sumX = g.reduce((a, id) => a + INIT.vertices.find((v) => v.id === id).x, 0) / g.length;
          const sumY = g.reduce((a, id) => a + INIT.vertices.find((v) => v.id === id).y, 0) / g.length;
          return (
            <g key={i}>
              <circle cx={sumX} cy={sumY} r={20 + 3 * Math.min(5, g.length - 1)} fill="var(--accent)" fillOpacity="0.18" stroke="var(--accent)" strokeWidth="2" />
              <text x={sumX} y={sumY + 4} textAnchor="middle" fontSize="11" fill="var(--text)" fontFamily="var(--font-mono)">{g.join("·")}</text>
            </g>
          );
        })}

        <text x={20} y={300} fontSize="10.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">
          krok {state.stepCount} · zbývá {state.vertexGroups.length} vrcholů, {state.contractedEdges.length} hran
          {state.vertexGroups.length === 2 && ` · finální řez = ${state.contractedEdges.length} ${state.contractedEdges.length === INIT.trueMinCut ? "✓ min-cut nalezen" : "✗ není min-cut"}`}
        </text>
      </svg>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={step} disabled={state.vertexGroups.length <= 2} style={btn(false)}>kontrakce →</button>
        <button onClick={reset} style={btn(false)}>reset</button>
        <button onClick={() => setSeed(seed + 1)} style={btn(false)}>nový seed</button>
        <button onClick={() => runManyTrials(200)} style={btn(false)}>200 pokusů</button>
      </div>

      {trialResults.length > 0 && (
        <div style={{ fontSize: 11, color: "var(--text)", fontFamily: "var(--font-mono)" }}>
          Po 200 pokusech: {successCount} nalezlo min-cut = {INIT.trueMinCut} ({(successCount / 200 * 100).toFixed(1)}%)
          · teoretická spodní mez 2/(n(n-1)) = {(2 / (6 * 5) * 100).toFixed(1)}% pro n=6
        </div>
      )}
      <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
        Pravdivý min-cut = 2 (jen dvě hrany mezi clustery). Kontrahování náhodné hrany s pravděpodobností ≤ 2/(n(n-1)) zachová min-cut. Amplifikace přes opakování.
      </div>
    </div>
  );
}

function makeState(graph, seed) {
  const rng = S.mulberry32(seed * 1009 + 1);
  const positions = new Map(graph.vertices.map((v) => [v.id, { x: v.x, y: v.y }]));
  return {
    rng,
    positions,
    vertexGroups: graph.vertices.map((v) => [v.id]),
    contractedEdges: graph.edges.map((e) => [...e]),
    stepCount: 0,
    lastContracted: null,
  };
}

function btn(active) { return { padding: "4px 10px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
