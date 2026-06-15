// Systolic matrix multiplication na mřížce n×n procesorů.
// Matice A teče zleva (řádky staggered), B shora (sloupce staggered).
// Sleduj, jak se prvky setkávají v každé pozici (i,j) v různých časech.
import { useState, useMemo } from "react";

const N = 3;
const DEFAULT_A = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];
const DEFAULT_B = [
  [1, 0, 2],
  [0, 1, 3],
  [1, 1, 1],
];

// At time t, processor (i,j) (1-indexed) receives:
//   a_{i,s} and b_{s,j} where s = t - (i-1) - (j-1) + 1
// If 1 ≤ s ≤ n, the cell multiplies and accumulates.
function stateAt(A, B, t) {
  const n = N;
  const cells = Array.from({ length: n }, () => Array.from({ length: n }, () => ({ c: 0, op: null, history: [] })));
  for (let step = 0; step <= t; step++) {
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= n; j++) {
        const s = step - (i - 1) - (j - 1) + 1;
        if (s >= 1 && s <= n) {
          const a = A[i - 1][s - 1];
          const b = B[s - 1][j - 1];
          if (step === t) {
            cells[i - 1][j - 1].op = { a, b, s, contrib: a * b };
          }
          cells[i - 1][j - 1].c += a * b;
          cells[i - 1][j - 1].history.push({ step, a, b, s });
        }
      }
    }
  }
  return cells;
}

// Where is a_{i,s} at time t? It's flowing along row i; at time t it's at column j = t - (i-1) - (s-1) + 1.
// Actually, simpler: a_{i,s} starts entering P(i,1) at t = (i-1)+(s-1). Then moves right; at time t (t >= start) it's at j = t - start + 1.
function aPosAt(i, s, t) {
  const start = (i - 1) + (s - 1);
  if (t < start) return null;
  const j = t - start + 1;
  if (j > N) return null;
  return j;
}
function bPosAt(j, s, t) {
  const start = (j - 1) + (s - 1);
  if (t < start) return null;
  const i = t - start + 1;
  if (i > N) return null;
  return i;
}

export default function NasobeniMaticMesh() {
  const [t, setT] = useState(0);
  const [matA, setMatA] = useState(DEFAULT_A);
  const [matB, setMatB] = useState(DEFAULT_B);

  const maxT = 3 * N - 2;
  const cells = useMemo(() => stateAt(matA, matB, t), [matA, matB, t]);
  const finalC = useMemo(() => stateAt(matA, matB, maxT), [matA, matB, maxT]);

  const W = 540, H = 360;
  const meshX0 = 180, meshY0 = 100, cellSize = 70;
  // pos of mesh cell (i, j) center (1-indexed)
  const mx = (j) => meshX0 + (j - 1) * cellSize;
  const my = (i) => meshY0 + (i - 1) * cellSize;

  // Pre-compute which a_{i,s} and b_{s,j} are "in flight" at time t
  const flyingA = [];
  const flyingB = [];
  for (let i = 1; i <= N; i++) {
    for (let s = 1; s <= N; s++) {
      const j = aPosAt(i, s, t);
      if (j !== null) flyingA.push({ i, s, j, val: matA[i - 1][s - 1] });
    }
  }
  for (let j = 1; j <= N; j++) {
    for (let s = 1; s <= N; s++) {
      const i = bPosAt(j, s, t);
      if (i !== null) flyingB.push({ j, s, i, val: matB[s - 1][j - 1] });
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Step nav */}
      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setT(Math.max(0, t - 1))} disabled={t === 0}>← předchozí</button>
        <span className="viz-readout" style={{ flex: 1, textAlign: "center" }}>
          čas t = {t} / {maxT} &nbsp;·&nbsp; potřebných kroků: <b style={{ color: "var(--text)" }}>3n−2 = {maxT}</b>
        </span>
        <button className="viz-btn primary" onClick={() => setT(Math.min(maxT, t + 1))} disabled={t >= maxT}>další →</button>
        <button className="viz-btn" onClick={() => setT(maxT)}>⏭</button>
        <button className="viz-btn" onClick={() => setT(0)}>↻</button>
      </div>

      {/* Mesh SVG */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* Mesh cells */}
        {Array.from({ length: N }, (_, ii) =>
          Array.from({ length: N }, (_, jj) => {
            const i = ii + 1, j = jj + 1;
            const c = cells[ii][jj];
            const op = c.op;
            const fullyDone = c.history.length === N;
            return (
              <g key={`c-${i}-${j}`}>
                <rect x={mx(j) - cellSize / 2 + 4} y={my(i) - cellSize / 2 + 4} width={cellSize - 8} height={cellSize - 8} rx="4"
                      fill={op ? "oklch(0.62 0.14 252 / 0.3)" : fullyDone ? "oklch(0.62 0.14 142 / 0.2)" : "var(--bg-card)"}
                      stroke={op ? "var(--accent)" : fullyDone ? "oklch(0.55 0.18 142)" : "var(--line-strong)"} strokeWidth="1.4" />
                <text x={mx(j)} y={my(i) - 12} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">P({i},{j})</text>
                <text x={mx(j)} y={my(i) + 4} textAnchor="middle" fontSize="14" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--text)">{c.c}</text>
                {op && (
                  <text x={mx(j)} y={my(i) + 20} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--accent)">
                    +{op.a}·{op.b}
                  </text>
                )}
              </g>
            );
          })
        )}

        {/* Row labels (input A) on the left */}
        {Array.from({ length: N }, (_, i) => (
          <text key={`rl-${i}`} x={meshX0 - cellSize / 2 - 80} y={my(i + 1) + 4} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="oklch(0.55 0.18 22)">
            A[{i + 1},:]
          </text>
        ))}

        {/* In-flight A values flowing to right (column j) */}
        {flyingA.map((a, k) => (
          <g key={`fa-${k}`}>
            <text x={mx(a.j)} y={my(a.i) + 30} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="oklch(0.55 0.18 22)" opacity="0.7">
              a{a.i}{a.s}={a.val}
            </text>
          </g>
        ))}

        {/* Column labels (input B) on top */}
        {Array.from({ length: N }, (_, j) => (
          <text key={`cl-${j}`} x={mx(j + 1)} y={meshY0 - cellSize / 2 - 12} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="oklch(0.55 0.18 65)">
            B[:,{j + 1}]
          </text>
        ))}

        {/* In-flight B values */}
        {flyingB.map((b, k) => (
          <g key={`fb-${k}`}>
            <text x={mx(b.j)} y={my(b.i) - 26} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="oklch(0.55 0.18 65)" opacity="0.7">
              b{b.s}{b.j}={b.val}
            </text>
          </g>
        ))}

        {/* Arrows showing data flow */}
        <defs>
          <marker id="msArrA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.55 0.18 22)" />
          </marker>
          <marker id="msArrB" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.55 0.18 65)" />
          </marker>
        </defs>
        {Array.from({ length: N }, (_, i) => (
          <line key={`ar-${i}`} x1={meshX0 - cellSize / 2 - 8} y1={my(i + 1)} x2={meshX0 - cellSize / 2 + 4} y2={my(i + 1)}
                stroke="oklch(0.55 0.18 22)" strokeWidth="1.2" markerEnd="url(#msArrA)" opacity="0.7" />
        ))}
        {Array.from({ length: N }, (_, j) => (
          <line key={`ac-${j}`} x1={mx(j + 1)} y1={meshY0 - cellSize / 2 - 8} x2={mx(j + 1)} y2={meshY0 - cellSize / 2 + 4}
                stroke="oklch(0.55 0.18 65)" strokeWidth="1.2" markerEnd="url(#msArrB)" opacity="0.7" />
        ))}

        <text x={W / 2} y={24} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)">
          Systolic mesh — čas t = {t}
        </text>

        {/* Result matrix preview at bottom right when done */}
        {t === maxT && (
          <g transform={`translate(${meshX0 + N * cellSize - 20}, ${meshY0 + N * cellSize - 10})`}>
            <text x="0" y="24" fontSize="11" fontWeight="700" fill="oklch(0.55 0.18 142)">C = A · B ✓</text>
          </g>
        )}
      </svg>

      {/* Matrices A and B as small grids */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <MatrixDisplay label="A" matrix={matA} color="oklch(0.55 0.18 22)" />
        <MatrixDisplay label="B" matrix={matB} color="oklch(0.55 0.18 65)" />
        <MatrixDisplay label="C (akumulace)" matrix={cells.map((r) => r.map((c) => c.c))} color="oklch(0.55 0.18 142)" />
      </div>

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        Každý procesor P(i,j) v čase t přijme <code style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>a_{`{i,s}`}</code> a <code style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>b_{`{s,j}`}</code> pro <code style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>s = t − (i−1) − (j−1) + 1</code>, vynásobí a přičte k <code style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>c_{`{i,j}`}</code>. Pak <em>a</em> pošle vpravo, <em>b</em> dolů. Staggered timing zajistí, že každý součin proběhne přesně jednou. Tato architektura pohání Google TPU a NVIDIA Tensor Cores.
      </div>
    </div>
  );
}

function MatrixDisplay({ label, matrix, color }) {
  return (
    <div style={{ padding: 8, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)" }}>
        {matrix.map((row, i) => (
          <div key={i} style={{ display: "flex", gap: 8 }}>
            {row.map((v, j) => (
              <span key={j} style={{ width: 24, textAlign: "right" }}>{v}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
