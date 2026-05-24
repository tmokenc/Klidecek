// Lazy graph reduction with sharing — fibs = 0:1:zipWith (+) fibs (tail fibs).
import { useState } from "react";

function buildFib(n) {
  // Returns list of nodes: { id, kind: "cons"|"thunk"|"val", value, deps }
  const nodes = [];
  // fib_0 = 0, fib_1 = 1, fib_n = thunk
  nodes.push({ id: 0, kind: "val", value: 0, evaluated: true, deps: [] });
  nodes.push({ id: 1, kind: "val", value: 1, evaluated: true, deps: [] });
  for (let i = 2; i < n; i++) {
    nodes.push({ id: i, kind: "thunk", value: null, evaluated: false, deps: [i - 1, i - 2], expr: `+(fib_${i - 1}, fib_${i - 2})` });
  }
  return nodes;
}

export default function LazyThunkGraph() {
  const [step, setStep] = useState(2);
  const [demand, setDemand] = useState(0);
  const N = 9;
  const nodes = buildFib(N);
  // simulate evaluation up to `step`: nodes 0..step are evaluated
  const evaluated = new Set();
  // BFS from node `demand` doing only what's needed
  const order = [];
  const visit = (id) => {
    if (evaluated.has(id)) return;
    const node = nodes[id];
    for (const dep of node.deps) visit(dep);
    evaluated.add(id);
    order.push(id);
  };
  visit(demand);
  // Truncate order to current step
  const shownEvaluated = new Set(order.slice(0, step + 1));

  // Compute values for shown
  const vals = nodes.map((n) => n.value);
  for (const id of order.slice(0, step + 1)) {
    if (id >= 2) vals[id] = vals[id - 1] + vals[id - 2];
  }

  const W = 540, H = 240;
  const xPos = (id) => 30 + (id / (N - 1)) * (W - 60);
  const yPos = (id) => 100 + Math.sin(id * 0.7) * 20;

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>demand fib_n:</label>
        <input type="range" min="0" max={N - 1} value={demand} onChange={(e) => { setDemand(parseInt(e.target.value)); setStep(0); }} />
        <code style={mono}>n = {demand}</code>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 600, background: "var(--bg-inset)", borderRadius: 6 }}>
        {/* edges */}
        {nodes.map((node) => node.deps.map((dep) => (
          <line key={`${node.id}-${dep}`} x1={xPos(node.id)} y1={yPos(node.id)} x2={xPos(dep)} y2={yPos(dep)}
                stroke={shownEvaluated.has(node.id) ? "var(--accent)" : "var(--text-muted)"} strokeWidth="1" strokeDasharray={shownEvaluated.has(node.id) ? "" : "3 2"} opacity={0.6} />
        )))}
        {nodes.map((node) => {
          const ev = shownEvaluated.has(node.id);
          const isDemand = node.id === demand;
          return (
            <g key={node.id}>
              <circle cx={xPos(node.id)} cy={yPos(node.id)} r={isDemand ? 18 : 14}
                      fill={ev ? "rgb(64,192,87)" : "var(--bg-card)"}
                      stroke={isDemand ? "var(--accent)" : "var(--text-muted)"} strokeWidth={isDemand ? 2 : 1} />
              <text x={xPos(node.id)} y={yPos(node.id) + 4} fontSize="11" textAnchor="middle" fill={ev ? "var(--bg-card)" : "var(--text)"}>
                {ev ? vals[node.id] : "?"}
              </text>
              <text x={xPos(node.id)} y={yPos(node.id) - 22} fontSize="9" textAnchor="middle" fill="var(--text-muted)">fib_{node.id}</text>
            </g>
          );
        })}
      </svg>
      <div style={row}>
        <button style={btn} disabled={step === 0} onClick={() => setStep(step - 1)}>‹ undo</button>
        <button style={btn} disabled={step >= order.length - 1} onClick={() => setStep(step + 1)}>vyhodnoť další thunk ›</button>
        <span style={{ ...lbl, marginLeft: 8 }}>krok {step + 1} / {order.length}</span>
      </div>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" }}>fibs = 0 : 1 : zipWith (+) fibs (tail fibs)</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
          Sdílení (sharing): když thunk <code style={mono}>fib_4</code> potřebuje <code style={mono}>fib_3</code>, použije *již vyhodnocenou* hodnotu — žádné opakované výpočty.
          Call-by-need = lazy + sharing.
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
          Vyhodnoceno: <strong style={{ color: "var(--accent)" }}>{shownEvaluated.size}</strong> z {N} thunků (jen co bylo potřeba pro fib_{demand}).
        </div>
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const mono = { fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" };
