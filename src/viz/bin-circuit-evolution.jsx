// Evoluce malého číslicového obvodu (CGP-styl).
// Mřížka hradel se 2 vstupy (A,B), tlačítko Mutuj/Evolvuj přibližuje výstup
// k cílové pravdivostní tabulce. Fitness = počet shodných řádků (ze 4).
import { useState } from "react";

// Cíl: XOR (A,B). 4 řádky pravdivostní tabulky.
const INPUTS = [
  [0, 0], [0, 1], [1, 0], [1, 1],
];
const TARGET = INPUTS.map(([a, b]) => a ^ b); // XOR

const GATES = ["AND", "OR", "XOR", "NOT"];
function gate(type, x, y) {
  switch (type) {
    case "AND": return x & y;
    case "OR": return x | y;
    case "XOR": return x ^ y;
    case "NOT": return x ^ 1; // neguje první vstup
    default: return 0;
  }
}

// Chromozom: 2 uzly. Každý uzel = {fn, in0, in1}.
// Vstupy indexy: 0=A, 1=B, 2=výstup uzlu 0. Uzel 1 je primární výstup.
function randNode(maxIn) {
  return {
    fn: Math.floor(Math.random() * GATES.length),
    in0: Math.floor(Math.random() * maxIn),
    in1: Math.floor(Math.random() * maxIn),
  };
}
function randGenome() {
  return [randNode(2), randNode(3)]; // uzel0 čte A/B; uzel1 čte A/B/uzel0
}

function evalGenome(g, a, b) {
  const wires = [a, b];
  const n0 = gate(GATES[g[0].fn], wires[g[0].in0], wires[g[0].in1]);
  wires.push(n0);
  const n1 = gate(GATES[g[1].fn], wires[g[1].in0 % 3], wires[g[1].in1 % 3]);
  return n1;
}
function fitness(g) {
  let f = 0;
  INPUTS.forEach(([a, b], i) => {
    if (evalGenome(g, a, b) === TARGET[i]) f++;
  });
  return f;
}
function mutate(g) {
  // bodová mutace jednoho genu
  const ng = g.map((n) => ({ ...n }));
  const node = Math.floor(Math.random() * 2);
  const maxIn = node === 0 ? 2 : 3;
  const pick = Math.floor(Math.random() * 3);
  if (pick === 0) ng[node].fn = Math.floor(Math.random() * GATES.length);
  else if (pick === 1) ng[node].in0 = Math.floor(Math.random() * maxIn);
  else ng[node].in1 = Math.floor(Math.random() * maxIn);
  return ng;
}

export default function BinCircuitEvolution() {
  const [genome, setGenome] = useState(randGenome);
  const [gen, setGen] = useState(0);
  const fit = fitness(genome);

  // 1+λ evoluce: jeden krok = vyzkoušej mutaci, ponech když není horší.
  const evolve = () => {
    let g = genome;
    const child = mutate(g);
    if (fitness(child) >= fitness(g)) g = child;
    setGenome(g);
    setGen((x) => x + 1);
  };
  const reset = () => { setGenome(randGenome()); setGen(0); };

  const W = 420, H = 200;
  const inName = (idx) => (idx === 0 ? "A" : idx === 1 ? "B" : "u0");
  const labelFn = (n) => GATES[n.fn];

  // Pozice uzlů
  const n0p = [180, 60], n1p = [300, 120];
  const aP = [40, 60], bP = [40, 130];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 520, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* primární vstupy */}
        {[["A", aP], ["B", bP]].map(([t, p]) => (
          <g key={t}>
            <circle cx={p[0]} cy={p[1]} r={14} fill="var(--bg-card)" stroke="var(--line-strong)" />
            <text x={p[0]} y={p[1]} textAnchor="middle" dominantBaseline="central"
              fontSize="12" fontFamily="var(--font-mono)" fill="var(--text)">{t}</text>
          </g>
        ))}

        {/* propojení uzlu 0 */}
        {[genome[0].in0, genome[0].in1].map((src, k) => {
          const from = src === 0 ? aP : bP;
          return <line key={`w0${k}`} x1={from[0] + 14} y1={from[1]} x2={n0p[0] - 24} y2={n0p[1] + (k ? 6 : -6)}
            stroke="var(--line-strong)" strokeWidth={1} opacity={0.7} />;
        })}
        {/* propojení uzlu 1 */}
        {[genome[1].in0 % 3, genome[1].in1 % 3].map((src, k) => {
          const from = src === 0 ? aP : src === 1 ? bP : n0p;
          return <line key={`w1${k}`} x1={from[0] + (src === 2 ? 24 : 14)} y1={from[1]} x2={n1p[0] - 24} y2={n1p[1] + (k ? 6 : -6)}
            stroke="var(--accent-line)" strokeWidth={1} opacity={0.75} />;
        })}

        {/* hradlo uzel 0 */}
        <g>
          <rect x={n0p[0] - 24} y={n0p[1] - 16} width={48} height={32} rx={6}
            fill="var(--bg-card)" stroke="var(--line-strong)" />
          <text x={n0p[0]} y={n0p[1]} textAnchor="middle" dominantBaseline="central"
            fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">{labelFn(genome[0])}</text>
        </g>
        {/* hradlo uzel 1 = výstup */}
        <g>
          <rect x={n1p[0] - 24} y={n1p[1] - 16} width={48} height={32} rx={6}
            fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={1.5} />
          <text x={n1p[0]} y={n1p[1]} textAnchor="middle" dominantBaseline="central"
            fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">{labelFn(genome[1])}</text>
        </g>
        <line x1={n1p[0] + 24} y1={n1p[1]} x2={n1p[0] + 52} y2={n1p[1]} stroke="var(--accent)" strokeWidth={1.5} />
        <text x={n1p[0] + 56} y={n1p[1]} dominantBaseline="central" fontSize="12"
          fontFamily="var(--font-mono)" fill="var(--accent)">Y</text>

        {/* pravdivostní tabulka: cíl vs aktuální */}
        <text x={W - 132} y={22} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">A B | cíl  Y</text>
        {INPUTS.map(([a, b], i) => {
          const y = evalGenome(genome, a, b);
          const ok = y === TARGET[i];
          return (
            <text key={i} x={W - 132} y={38 + i * 15} fontSize="10" fontFamily="var(--font-mono)"
              fill={ok ? "var(--accent)" : "var(--text-faint)"}>
              {a} {b} |  {TARGET[i]}   {y} {ok ? "✓" : "✗"}
            </text>
          );
        })}
      </svg>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button onClick={evolve}
          style={{ padding: "5px 14px", fontSize: 13, cursor: "pointer",
            background: "var(--accent)", color: "var(--accent-text-on)",
            border: "none", borderRadius: 6, fontWeight: 600 }}>
          Mutuj / Evolvuj ▸
        </button>
        <button onClick={reset}
          style={{ padding: "5px 12px", fontSize: 13, cursor: "pointer",
            background: "var(--bg-card)", color: "var(--text)",
            border: "1px solid var(--line-strong)", borderRadius: 6 }}>
          Reset
        </button>
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          cíl = XOR · generace {gen} · fitness {fit}/4 {fit === 4 ? "— hotovo!" : ""}
        </span>
      </div>
    </div>
  );
}
