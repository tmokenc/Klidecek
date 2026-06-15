// Subset-construction step-through: NFA → DFA on a small fixed example.
import { useState } from "react";

const NFA_STATES = ["q0", "q1", "q2", "q3"];
const NFA_DELTA = {
  q0: { a: ["q0", "q1"], b: ["q0"] },
  q1: { a: [], b: ["q2"] },
  q2: { a: ["q3"], b: [] },
  q3: { a: ["q3"], b: ["q3"] },
};
const NFA_ACCEPT = new Set(["q3"]);

function moveSet(set, sym) {
  const out = new Set();
  for (const s of set) {
    for (const t of NFA_DELTA[s][sym] || []) out.add(t);
  }
  return [...out].sort();
}

const id = (set) => (set.length ? "{" + set.join(",") + "}" : "∅");

function buildDFA() {
  const start = ["q0"];
  const steps = [];
  const seen = new Map();
  seen.set(id(start), start);
  const queue = [start];
  while (queue.length) {
    const cur = queue.shift();
    for (const sym of ["a", "b"]) {
      const next = moveSet(cur, sym);
      const nid = id(next);
      const isNew = !seen.has(nid);
      if (isNew) { seen.set(nid, next); queue.push(next); }
      steps.push({ from: cur, sym, to: next, isNew });
    }
  }
  return { steps, states: [...seen.values()] };
}

const DFA = buildDFA();

const NFA_POS = {
  q0: [55, 90],
  q1: [140, 50],
  q2: [225, 50],
  q3: [225, 130],
};

export default function NfaToDfa() {
  const [step, setStep] = useState(0);
  const visible = DFA.steps.slice(0, step);
  const known = new Set(["{q0}"]);
  visible.forEach((s) => known.add(id(s.to)));

  const cur = step > 0 ? DFA.steps[step - 1] : null;
  const W = 540, H = 270;

  // Layout DFA states (subsets) once we know all
  const knownArr = [...known];
  const dfaPos = {};
  knownArr.forEach((k, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    dfaPos[k] = [330 + col * 65, 50 + row * 60];
  });

  const dfaEdges = visible
    .filter((s) => s.to.length > 0)
    .map((s) => ({ from: id(s.from), to: id(s.to), sym: s.sym }));

  return (
    <div style={{ width: "100%", maxWidth: 580 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* labels */}
        <text x={10} y={20} fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">
          NFA (původní)
        </text>
        <text x={320} y={20} fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">
          DFA (podmnožinová konstrukce)
        </text>
        <line x1={300} y1={30} x2={300} y2={H - 40} stroke="var(--line)" strokeDasharray="3 3" />

        {/* NFA edges */}
        {Object.entries(NFA_DELTA).flatMap(([from, byS]) =>
          Object.entries(byS).flatMap(([sym, tos]) =>
            tos.map((to) => {
              const [x1, y1] = NFA_POS[from];
              const [x2, y2] = NFA_POS[to];
              if (from === to) {
                return (
                  <g key={`${from}-${sym}-${to}`}>
                    <path d={`M${x1 - 8},${y1 - 14} Q${x1 - 25},${y1 - 30} ${x1 + 8},${y1 - 14}`}
                      stroke="var(--accent-line)" strokeWidth="1" fill="none" />
                    <text x={x1 - 27} y={y1 - 30} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{sym}</text>
                  </g>
                );
              }
              const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
              const isCur = cur && from === cur.from[0] && sym === cur.sym && cur.to.includes(to);
              return (
                <g key={`${from}-${sym}-${to}`}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={isCur ? "var(--accent)" : "var(--accent-line)"} strokeWidth={isCur ? 2 : 1} />
                  <text x={mx} y={my - 4} fontSize="10" fill={isCur ? "var(--accent)" : "var(--text-muted)"}>{sym}</text>
                </g>
              );
            })
          )
        )}

        {/* NFA nodes */}
        {NFA_STATES.map((s) => {
          const [x, y] = NFA_POS[s];
          const inCur = cur && cur.from.includes(s);
          const inTarget = cur && cur.to.includes(s);
          return (
            <g key={s}>
              <circle cx={x} cy={y} r={14}
                fill={inTarget ? "color-mix(in oklch, var(--accent) 30%, var(--bg-card))" : "var(--bg-card)"}
                stroke={inCur ? "var(--accent)" : "var(--line-strong)"} strokeWidth={inCur ? 2 : 1} />
              {NFA_ACCEPT.has(s) && (
                <circle cx={x} cy={y} r={10} fill="none" stroke={inCur ? "var(--accent)" : "var(--line-strong)"} />
              )}
              <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">{s}</text>
            </g>
          );
        })}

        {/* DFA edges */}
        {dfaEdges.map((e, i) => {
          if (!dfaPos[e.from] || !dfaPos[e.to]) return null;
          const [x1, y1] = dfaPos[e.from];
          const [x2, y2] = dfaPos[e.to];
          if (e.from === e.to) {
            return (
              <g key={i}>
                <path d={`M${x1 - 8},${y1 - 14} Q${x1 - 25},${y1 - 30} ${x1 + 8},${y1 - 14}`}
                  stroke="var(--accent)" strokeWidth="1" fill="none" />
                <text x={x1 - 27} y={y1 - 30} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{e.sym}</text>
              </g>
            );
          }
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--accent)" strokeWidth="1.2" />
              <text x={mx} y={my - 4} fontSize="10" fill="var(--text-muted)">{e.sym}</text>
            </g>
          );
        })}

        {/* DFA nodes */}
        {knownArr.map((k) => {
          if (!dfaPos[k]) return null;
          const [x, y] = dfaPos[k];
          const set = k === "∅" ? [] : k.slice(1, -1).split(",").filter(Boolean);
          const accepting = set.some((s) => NFA_ACCEPT.has(s));
          const isCurTarget = cur && id(cur.to) === k;
          return (
            <g key={k}>
              <ellipse cx={x} cy={y} rx={30} ry={14}
                fill={isCurTarget ? "color-mix(in oklch, var(--accent) 25%, var(--bg-card))" : "var(--bg-card)"}
                stroke={isCurTarget ? "var(--accent)" : "var(--line-strong)"} strokeWidth={isCurTarget ? 2 : 1} />
              {accepting && (
                <ellipse cx={x} cy={y} rx={26} ry={10} fill="none"
                  stroke={isCurTarget ? "var(--accent)" : "var(--line-strong)"} />
              )}
              <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text)">{k}</text>
            </g>
          );
        })}

        {/* status */}
        <text x={10} y={H - 12} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          {cur
            ? `δ_DFA(${id(cur.from)}, ${cur.sym}) = ${id(cur.to)}${cur.isNew ? "  (new state)" : ""}`
            : `δ_NFA(q0, a) = {q0, q1}  →  L = words ending in pattern ...ab.a*`}
        </text>
      </svg>
      <div className="viz-controls" style={{ marginTop: 8 }}>
        <button
          className="viz-btn"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >← prev</button>
        <button
          className="viz-btn primary"
          onClick={() => setStep(Math.min(DFA.steps.length, step + 1))}
          disabled={step >= DFA.steps.length}
        >next →</button>
        <button className="viz-btn" onClick={() => setStep(0)}>reset</button>
        <span className="viz-readout">
          step {step} / {DFA.steps.length}
        </span>
      </div>
    </div>
  );
}
