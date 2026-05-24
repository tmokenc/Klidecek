// Reachability x(s) = max P(s → T) by value iteration on a small DTMC.
// Worked example from reachability.md: s₀..s₃, t, s₂ stuck.
import { useState, useEffect, useRef } from "react";

const W = 540, H = 280;

// State graph from reachability.md numerical example
const STATES = ["s₀", "s₁", "s₂", "s₃", "t"];
const POS = [[80, 140], [200, 90], [200, 210], [340, 140], [470, 140]];
const T_IDX = 4;
const S0_IDX = 2;  // stuck state — cannot reach T
// Transitions: s₀ → s₁ (.5), s₀ → s₂ (.5); s₁ → s₃ (.5), s₁ → s₂ (.5); s₃ → t (.5), s₃ → s₁ (.5); s₂ → s₂ (1); t → t (1)
const P = [
  [0, 0.5, 0.5, 0, 0],
  [0, 0, 0.5, 0.5, 0],
  [0, 0, 1, 0, 0],
  [0, 0.5, 0, 0, 0.5],
  [0, 0, 0, 0, 1],
];

// Exact solution: x(s₀) = 1/6, x(s₁) = 1/3, x(s₂) = 0, x(s₃) = 2/3, x(t) = 1
const TRUE = [1 / 6, 1 / 3, 0, 2 / 3, 1];

export default function ReachabilityFixpoint() {
  const [x, setX] = useState([0, 0, 0, 0, 1]);
  const [k, setK] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef(null);

  function step() {
    setX((prev) => {
      const next = new Array(5).fill(0);
      next[T_IDX] = 1;
      next[S0_IDX] = 0;
      for (let i = 0; i < 5; i++) {
        if (i === T_IDX || i === S0_IDX) continue;
        let s = 0;
        for (let j = 0; j < 5; j++) s += P[i][j] * prev[j];
        next[i] = s;
      }
      return next;
    });
    setK((k) => k + 1);
  }

  useEffect(() => {
    if (!running) { if (timer.current) clearInterval(timer.current); return; }
    timer.current = setInterval(step, 400);
    return () => clearInterval(timer.current);
  }, [running]);

  function reset() {
    setRunning(false);
    setK(0);
    setX([0, 0, 0, 0, 1]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <defs>
          <marker id="rArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L 10 5 L 0 10 z" fill="var(--text-muted)" />
          </marker>
        </defs>

        {/* Edges */}
        {P.map((row, i) => row.map((p, j) => {
          if (p < 0.001 || i === j) return null;
          const [x1, y1] = POS[i];
          const [x2, y2] = POS[j];
          const dx = x2 - x1, dy = y2 - y1;
          const d = Math.sqrt(dx * dx + dy * dy);
          const r = 24;
          const sx = x1 + (dx / d) * r;
          const sy = y1 + (dy / d) * r;
          const ex = x2 - (dx / d) * r;
          const ey = y2 - (dy / d) * r;
          const perpX = -dy / d * 4, perpY = dx / d * 4;
          return (
            <g key={`${i}-${j}`}>
              <path d={`M ${sx + perpX} ${sy + perpY} L ${ex + perpX} ${ey + perpY}`} stroke="var(--line-strong)" fill="none" markerEnd="url(#rArr)" />
              <text x={(sx + ex) / 2 + perpX * 2.5} y={(sy + ey) / 2 + perpY * 2.5 + 3} fontSize="9.5" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)">{p.toFixed(2)}</text>
            </g>
          );
        }))}

        {/* States */}
        {POS.map(([px, py], i) => {
          const isT = i === T_IDX;
          const isS0 = i === S0_IDX;
          const color = isT ? "var(--accent)" : isS0 ? "var(--accent-line)" : "var(--accent)";
          return (
            <g key={i}>
              <circle cx={px} cy={py} r="22"
                fill={color} fillOpacity={0.15 + 0.6 * Math.min(1, x[i])}
                stroke={color} strokeWidth="2" />
              <text x={px} y={py + 4} textAnchor="middle" fontSize="11" fill="var(--text)" fontFamily="var(--font-mono)">{STATES[i]}</text>
              <text x={px} y={py + 38} textAnchor="middle" fontSize="10" fill={color} fontFamily="var(--font-mono)">{x[i].toFixed(4)}</text>
              {isT && <text x={px} y={py - 30} textAnchor="middle" fontSize="9.5" fill="var(--accent)" fontFamily="var(--font-mono)">T (x=1)</text>}
              {isS0 && <text x={px} y={py - 30} textAnchor="middle" fontSize="9.5" fill="var(--accent-line)" fontFamily="var(--font-mono)">S₀ (x=0)</text>}
            </g>
          );
        })}

        <text x={20} y={H - 10} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">x(s) = Σⱼ P(s, j)·x(j) pro s ∉ T ∪ S₀ — iterace</text>
      </svg>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setRunning(!running)} style={btn(false)}>{running ? "⏸" : "▶"}</button>
        <button onClick={step} disabled={running} style={btn(false)}>krok →</button>
        <button onClick={reset} style={btn(false)}>reset</button>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginLeft: 6 }}>k = {k}</span>
      </div>

      <table style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--text)", borderCollapse: "collapse" }}>
        <thead><tr style={{ color: "var(--text-muted)" }}><th style={th()}>stav</th><th style={th()}>x⁽{k}⁾</th><th style={th()}>přesné</th><th style={th()}>chyba</th></tr></thead>
        <tbody>
          {STATES.map((s, i) => (
            <tr key={i}>
              <td style={td()}>{s}</td>
              <td style={td()}>{x[i].toFixed(5)}</td>
              <td style={td()}>{TRUE[i].toFixed(5)}</td>
              <td style={td()}>{Math.abs(x[i] - TRUE[i]).toExponential(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
        s₂ je „uvíznutí" — z něj nelze do t (P(s₂, s₂) = 1, žádná cesta k T). Forward-backward analýza ho přiřadí do S₀ a iterace konverguje k jednoznačnému řešení.
      </div>
    </div>
  );
}

function btn(active) { return { padding: "4px 10px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
function th() { return { textAlign: "left", padding: "3px 12px", fontWeight: "normal", borderBottom: "1px solid var(--line)" }; }
function td() { return { padding: "3px 12px" }; }
