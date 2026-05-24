// Value iteration on the 3-state MDP from value-iteration.md.
import { useState } from "react";

// S = {s1, s2, s3}, A = {a, b}, γ = 0.9
// P(s1, a, s2) = 1, r(s1, a) = 5
// P(s1, b, s3) = 1, r(s1, b) = 10
// P(s2, a, s3) = 1, r(s2, a) = 1
// P(s3, a, s3) = 1, r(s3, a) = 0  (absorbing)
// Expected: V* = (10, 0.9, 0), σ*(s1) = b

const ACTIONS = ["a", "b"];

function bellmanStep(V, gamma) {
  const newV = [...V];
  const Q = [[0, 0], [0, 0], [0, 0]];
  // s1
  Q[0][0] = 5  + gamma * V[1];      // a: → s2
  Q[0][1] = 10 + gamma * V[2];      // b: → s3
  newV[0] = Math.max(Q[0][0], Q[0][1]);
  // s2 (only action a)
  Q[1][0] = 1 + gamma * V[2];
  newV[1] = Q[1][0];
  // s3 absorbing
  Q[2][0] = 0 + gamma * V[2];
  newV[2] = Q[2][0];
  const pi = [Q[0][0] >= Q[0][1] ? 0 : 1, 0, 0];
  return [newV, Q, pi];
}

export default function ValueIterationConverge() {
  const [gamma, setGamma] = useState(0.9);
  const [history, setHistory] = useState([[0, 0, 0]]);

  function step() {
    const curV = history[history.length - 1];
    const [newV] = bellmanStep(curV, gamma);
    setHistory([...history, newV]);
  }
  function reset() { setHistory([[0, 0, 0]]); }

  const k = history.length - 1;
  const curV = history[history.length - 1];
  const [, Q, pi] = bellmanStep(curV, gamma);

  // V* exact for γ=0.9: 10, 0.9, 0
  const Vstar = [10, gamma, 0];

  const W = 540, H = 320;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <defs>
          <marker id="viArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L 10 5 L 0 10 z" fill="var(--text-muted)" />
          </marker>
        </defs>

        {/* States */}
        {[[120, 80, "s₁"], [320, 80, "s₂"], [440, 220, "s₃"]].map(([x, y, label], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="30" fill="var(--bg-inset)" stroke={i === 2 ? "var(--accent-line)" : "var(--accent)"} strokeWidth="2" />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="13" fill="var(--text)" fontFamily="var(--font-mono)">{label}</text>
            <text x={x} y={y - 38} textAnchor="middle" fontSize="11" fill="var(--accent)" fontFamily="var(--font-mono)">V={curV[i].toFixed(3)}</text>
            <text x={x} y={y + 50} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">cíl: {Vstar[i].toFixed(3)}</text>
          </g>
        ))}

        {/* Edges */}
        <g>
          {/* s1 → s2, action a, r=5 */}
          <path d="M 152 75 L 288 75" stroke={pi[0] === 0 && k > 0 ? "var(--accent)" : "var(--line-strong)"} strokeWidth={pi[0] === 0 && k > 0 ? "2.5" : "1.5"} fill="none" markerEnd="url(#viArr)" />
          <text x="220" y="65" textAnchor="middle" fontSize="10.5" fill={pi[0] === 0 && k > 0 ? "var(--accent)" : "var(--text-muted)"} fontFamily="var(--font-mono)">a, r=5</text>
          {/* s1 → s3, action b, r=10 */}
          <path d="M 140 110 L 425 200" stroke={pi[0] === 1 && k > 0 ? "var(--accent)" : "var(--line-strong)"} strokeWidth={pi[0] === 1 && k > 0 ? "2.5" : "1.5"} fill="none" markerEnd="url(#viArr)" />
          <text x="280" y="160" textAnchor="middle" fontSize="10.5" fill={pi[0] === 1 && k > 0 ? "var(--accent)" : "var(--text-muted)"} fontFamily="var(--font-mono)">b, r=10</text>
          {/* s2 → s3, action a, r=1 */}
          <path d="M 330 110 L 425 200" stroke="var(--line-strong)" fill="none" markerEnd="url(#viArr)" />
          <text x="395" y="155" textAnchor="middle" fontSize="10.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">a, r=1</text>
          {/* s3 self-loop (absorbing) */}
          <path d="M 468 220 C 510 220, 510 250, 468 245" stroke="var(--accent-line)" fill="none" markerEnd="url(#viArr)" />
          <text x="490" y="265" textAnchor="middle" fontSize="10" fill="var(--accent-line)" fontFamily="var(--font-mono)">absorpční</text>
        </g>

        {/* Q-table */}
        <g transform="translate(40, 260)" fontSize="10.5" fontFamily="var(--font-mono)">
          <text x="0" y="0" fill="var(--text-muted)">Q-hodnoty pro s₁:</text>
          <text x="0" y="16" fill={pi[0] === 0 ? "var(--accent)" : "var(--text)"}>Q(s₁, a) = 5 + γ·V(s₂) = {Q[0][0].toFixed(3)}</text>
          <text x="0" y="32" fill={pi[0] === 1 ? "var(--accent)" : "var(--text)"}>Q(s₁, b) = 10 + γ·V(s₃) = {Q[0][1].toFixed(3)}</text>
          <text x="0" y="50" fill="var(--accent)">⇒ π*(s₁) = {ACTIONS[pi[0]]}</text>
        </g>
      </svg>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={step} style={btn(false)}>krok VI →</button>
        <button onClick={() => { for (let i = 0; i < 10; i++) step(); }} style={btn(false)}>×10</button>
        <button onClick={reset} style={btn(false)}>reset</button>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>iterace = {k}</span>
        <label style={lab()}>γ = {gamma.toFixed(2)}
          <input type="range" min={0.1} max={0.99} step={0.01} value={gamma} onChange={(e) => { setGamma(+e.target.value); setHistory([[0, 0, 0]]); }} style={{ width: "100%" }} />
        </label>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        Numerický příklad z value-iteration.md: V<sup>0</sup>=(0,0,0), V<sup>1</sup>=(10, 1, 0), V<sup>2</sup>=(10, 1, 0)
        — konverguje v 1 kroku pro γ=0.9. Optimální politika π*(s₁) = b (přímo do s₃ pro odměnu 10 &gt; 5 + 0.9·1).
      </div>
    </div>
  );
}

function btn(active) { return { padding: "4px 10px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
function lab() { return { flex: "0 1 200px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }; }
