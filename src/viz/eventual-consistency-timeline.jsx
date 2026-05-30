// eventual-consistency-timeline — scrub through writes and replication
// events; clients reading from any node see what they would see at time T.
// Toggle R + W ≥ N quorum to see when strong consistency kicks in.
import { useState } from "react";

const W = 540, H = 280;

// Event timeline (T in ticks)
const EVENTS = [
  { t: 0, kind: "write", to: "A", value: 3 },
  { t: 2, kind: "ack", to: "A", value: 3 },
  { t: 3, kind: "write", to: "A", value: 5 },
  { t: 5, kind: "ack", to: "A", value: 5 },
  { t: 6, kind: "replicate", from: "A", to: "B", value: 5 },
  { t: 9, kind: "replicate", from: "A", to: "C", value: 5 },
];

function stateAt(T) {
  const s = { A: 0, B: 0, C: 0 };
  for (const e of EVENTS) {
    if (e.t > T) break;
    if (e.kind === "write" || e.kind === "replicate") s[e.to] = e.value;
  }
  return s;
}

export default function EventualConsistencyTimeline() {
  const [T, setT] = useState(4);
  const [N, setN] = useState("ONE"); // ONE, QUORUM, ALL
  const s = stateAt(T);

  // What client sees at time T from each node + quorum decision
  const reads = { A: s.A, B: s.B, C: s.C };
  const quorumValue = (function () {
    const vals = Object.values(s);
    if (N === "ONE") return vals[Math.floor(Math.random() * 3)];
    if (N === "ALL") return vals.every(v => v === vals[0]) ? vals[0] : "INCONSISTENT";
    // QUORUM: majority — count
    const counts = new Map();
    for (const v of vals) counts.set(v, (counts.get(v) || 0) + 1);
    let best = null, bc = 0;
    for (const [v, c] of counts) if (c > bc) { best = v; bc = c; }
    return bc >= 2 ? best : "NO_MAJORITY";
  })();

  const Tmax = 12;
  const PAD = 20;
  const colors = { A: "oklch(0.65 0.16 264)", B: "oklch(0.65 0.16 145)", C: "oklch(0.7 0.15 22)" };
  const yA = 60, yB = 110, yC = 160;
  const toX = (t) => PAD + (t / Tmax) * (W - PAD * 2);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 11 }}>
        <span>time</span>
        <input type="range" min={0} max={Tmax} step={0.5} value={T} onChange={(e) => setT(+e.target.value)} style={{ flex: 1, maxWidth: 240 }} />
        <span>T = {T}</span>
        <span style={{ marginLeft: 12 }}>read level</span>
        {["ONE", "QUORUM", "ALL"].map(l => (
          <button key={l} onClick={() => setN(l)} style={btn(N === l)}>{l}</button>
        ))}
      </div>

      <svg viewBox={`-24 0 ${W + 24} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {/* Time axis */}
        <line x1={PAD} y1={H - 50} x2={W - PAD} y2={H - 50} stroke="var(--line-strong)" />
        {Array.from({ length: Tmax + 1 }, (_, i) => i).map(t => (
          <g key={t}>
            <line x1={toX(t)} y1={H - 54} x2={toX(t)} y2={H - 46} stroke="var(--line)" />
            <text x={toX(t)} y={H - 36} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">t={t}</text>
          </g>
        ))}
        {/* Current time marker */}
        <line x1={toX(T)} y1={30} x2={toX(T)} y2={H - 50} stroke="oklch(0.7 0.15 60)" strokeWidth="1.5" strokeDasharray="3 2" />

        {/* Node lanes */}
        {["A", "B", "C"].map((n, i) => {
          const y = [yA, yB, yC][i];
          return (
            <g key={n}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="var(--line)" />
              <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize="11" fontFamily="var(--font-mono)" fill={colors[n]}>node {n}</text>
              {/* current value */}
              <rect x={W - 80} y={y - 12} width={64} height={22} fill="var(--bg-inset)" stroke={colors[n]} strokeWidth="1.2" rx={2} />
              <text x={W - 48} y={y + 4} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill={colors[n]}>x = {s[n]}</text>
            </g>
          );
        })}

        {/* Events */}
        {EVENTS.filter(e => e.t <= T).map((e, i) => {
          const y = { A: yA, B: yB, C: yC }[e.to];
          const fy = e.from ? { A: yA, B: yB, C: yC }[e.from] : y;
          if (e.kind === "replicate") {
            return (
              <g key={i}>
                <line x1={toX(e.t)} y1={fy} x2={toX(e.t)} y2={y} stroke={colors[e.from]} strokeWidth="1" strokeDasharray="2 2" />
                <circle cx={toX(e.t)} cy={y} r={5} fill={colors[e.from]} opacity={0.8} />
                <text x={toX(e.t)} y={y - 8} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill={colors[e.from]}>repl {e.value}</text>
              </g>
            );
          } else if (e.kind === "write") {
            return (
              <g key={i}>
                <circle cx={toX(e.t)} cy={y} r={6} fill={colors[e.to]} stroke="var(--text)" strokeWidth="0.6" />
                <text x={toX(e.t)} y={y - 8} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill={colors[e.to]}>w({e.value})</text>
              </g>
            );
          }
          return null;
        })}

        {/* Quorum decision panel */}
        <g transform={`translate(${PAD}, ${H - 24})`}>
          <text x={0} y={0} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">
            client read @ T={T} with {N}: <tspan fill={quorumValue === "INCONSISTENT" || quorumValue === "NO_MAJORITY" ? "oklch(0.6 0.18 22)" : "oklch(0.65 0.16 145)"}>{String(quorumValue)}</tspan>
          </text>
        </g>
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        Eventually consistent system: write to leader A propagates asynchronously to B then C. With R=ONE you may read stale data depending on which node you hit.
        QUORUM requires majority — gives strong consistency when also W ≥ N − R + 1. ALL waits for every replica; one node failure → request blocks.
      </div>
    </div>
  );
}

function btn(active) {
  return {
    fontFamily: "var(--font-mono)", fontSize: 10, padding: "2px 6px",
    background: active ? "var(--accent)" : "var(--bg-inset)",
    color: active ? "var(--bg-card)" : "var(--text)",
    border: "1px solid var(--line-strong)", borderRadius: 3, cursor: "pointer",
  };
}
