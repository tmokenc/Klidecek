// CGP grid: genotype (integer string) decoded into a phenotype DAG.
// Two parameter inputs (x0, x1) feed a 3x2 grid of function nodes; one output gene
// selects which node drives the primary output. Active nodes (on the path to the
// output) are highlighted; inactive (non-expressed) nodes are dimmed.
import { useState } from "react";

// Function set Gamma: index -> {label, fn}
const GAMMA = [
  { label: "+", fn: (a, b) => a + b },
  { label: "-", fn: (a, b) => a - b },
  { label: "*", fn: (a, b) => a * b },
  { label: "max", fn: (a, b) => Math.max(a, b) },
];

// Two primary inputs -> node indices 0,1. Grid nodes get indices 2..7 (3 cols x 2 rows).
const NIN = 2;
const COLS = 3, ROWS = 2;
const NNODES = COLS * ROWS;

// A fixed example genotype. Each node = [in1, in2, func]; trailing entry = output gene.
// Node index = NIN + position. Connections respect "only earlier indices".
const PRESETS = [
  { name: "A", genes: [[0, 1, 2], [1, 0, 0], [2, 3, 0], [3, 1, 2], [4, 5, 1], [5, 6, 3]], out: 7 },
  { name: "B", genes: [[0, 1, 0], [0, 1, 2], [2, 1, 1], [2, 3, 0], [4, 0, 2], [3, 4, 3]], out: 6 },
];

export default function PbiCgp() {
  const [pi, setPi] = useState(0);
  const preset = PRESETS[pi];
  const genes = preset.genes;
  const outNode = preset.out;

  // index() -> coordinate of a node index in the canvas
  const W = 520, H = 230;
  const inX = 46, colGap = 120, nodeR = 19;
  const colX = (c) => 130 + c * colGap;
  const rowY = (r) => 70 + r * 90;
  const outX = W - 40;

  // position of every "wire endpoint" by node index
  const posOf = (idx) => {
    if (idx < NIN) return { x: inX, y: 70 + idx * 90 };
    const p = idx - NIN;
    return { x: colX(Math.floor(p / ROWS)), y: rowY(p % ROWS) };
  };

  // Decode: which nodes are active (reachable from output gene)?
  const active = new Set();
  const stack = [outNode];
  while (stack.length) {
    const idx = stack.pop();
    if (idx < NIN || active.has(idx)) continue;
    active.add(idx);
    const g = genes[idx - NIN];
    stack.push(g[0], g[1]);
  }

  // Evaluate phenotype on a sample input to show the decoded value.
  const sample = [2, 5]; // x0, x1
  const val = (idx) => {
    if (idx < NIN) return sample[idx];
    const g = genes[idx - NIN];
    return GAMMA[g[2]].fn(val(g[0]), val(g[1]));
  };
  const outVal = val(outNode);

  // Build the flat genotype string the way CGP encodes it.
  const genoStr = genes
    .map((g) => `${g[0]} ${g[1]} ${g[2]}`)
    .join(" | ") + `  ||  out ${outNode}`;

  const nodeFill = (idx) =>
    active.has(idx)
      ? "color-mix(in oklch, var(--accent) 30%, var(--bg-card))"
      : "var(--bg-card)";
  const nodeStroke = (idx) => (active.has(idx) ? "var(--accent)" : "var(--line-strong)");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* wires from each node's two inputs */}
        {genes.map((g, p) => {
          const idx = NIN + p;
          const dst = posOf(idx);
          return [g[0], g[1]].map((src, k) => {
            const sp = posOf(src);
            const on = active.has(idx);
            return (
              <line key={`${p}-${k}`} x1={sp.x + nodeR} y1={sp.y} x2={dst.x - nodeR} y2={dst.y + (k === 0 ? -5 : 5)}
                stroke={on ? "var(--accent)" : "var(--line-strong)"}
                strokeWidth={on ? 1.6 : 1} opacity={on ? 0.85 : 0.35} />
            );
          });
        })}
        {/* output wire */}
        <line x1={posOf(outNode).x + nodeR} y1={posOf(outNode).y} x2={outX - 14} y2={H / 2}
          stroke="var(--accent)" strokeWidth="1.8" opacity="0.9" />

        {/* primary inputs */}
        {Array.from({ length: NIN }).map((_, i) => {
          const p = posOf(i);
          return (
            <g key={`in-${i}`}>
              <rect x={p.x - 18} y={p.y - 14} width="36" height="28" rx="5"
                fill="var(--bg-card)" stroke="var(--line-strong)" />
              <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="central"
                fontSize="12" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                x{i}={sample[i]}
              </text>
            </g>
          );
        })}

        {/* function nodes */}
        {genes.map((g, p) => {
          const idx = NIN + p;
          const pos = posOf(idx);
          return (
            <g key={`n-${idx}`}>
              <circle cx={pos.x} cy={pos.y} r={nodeR}
                fill={nodeFill(idx)} stroke={nodeStroke(idx)}
                strokeWidth={active.has(idx) ? 2 : 1} />
              <text x={pos.x} y={pos.y - 4} textAnchor="middle" dominantBaseline="central"
                fontSize="13" fontFamily="var(--font-mono)"
                fill={active.has(idx) ? "var(--text)" : "var(--text-faint)"}>
                {GAMMA[g[2]].label}
              </text>
              <text x={pos.x} y={pos.y + 9} textAnchor="middle" dominantBaseline="central"
                fontSize="9" fontFamily="var(--font-mono)"
                fill={active.has(idx) ? "var(--accent)" : "var(--text-faint)"}>
                {active.has(idx) ? val(idx) : "·"}
              </text>
              <text x={pos.x} y={pos.y - nodeR - 5} textAnchor="middle"
                fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
                #{idx}
              </text>
            </g>
          );
        })}

        {/* primary output */}
        <g>
          <rect x={outX - 14} y={H / 2 - 16} width="44" height="32" rx="5"
            fill="color-mix(in oklch, var(--accent) 22%, var(--bg-card))" stroke="var(--accent)" strokeWidth="2" />
          <text x={outX + 8} y={H / 2 - 3} textAnchor="middle" dominantBaseline="central"
            fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">out</text>
          <text x={outX + 8} y={H / 2 + 8} textAnchor="middle" dominantBaseline="central"
            fontSize="12" fontFamily="var(--font-mono)" fill="var(--accent)">={outVal}</text>
        </g>

        {/* legend */}
        <text x={10} y={H - 10} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          plné = aktivní (exprimované) · slabé = neaktivní (neutrální)
        </text>
      </svg>

      <div style={{ display: "flex", gap: 6 }}>
        {PRESETS.map((p, i) => (
          <button key={p.name} onClick={() => setPi(i)}
            style={{
              flex: 1, fontSize: 12, padding: "4px 8px", cursor: "pointer",
              fontFamily: "var(--font-mono)",
              background: i === pi ? "var(--accent)" : "var(--bg-card)",
              color: i === pi ? "white" : "var(--text-muted)",
              border: "1px solid var(--line-strong)", borderRadius: 5,
            }}>
            genotyp {p.name}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", wordBreak: "break-word" }}>
        genotyp: {genoStr}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
        funkce Γ: 0=+ 1=− 2=* 3=max · aktivních uzlů: {active.size} z {NNODES}
      </div>
    </div>
  );
}
