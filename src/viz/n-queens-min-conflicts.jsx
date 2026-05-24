// 8-queens via min-conflicts local search — show conflict counts + step-by-step relocations.
import { useState, useMemo, useEffect } from "react";

const N = 8;

function rngFactory(seed) {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function conflictsFor(board, col, row) {
  let c = 0;
  for (let i = 0; i < N; i++) {
    if (i === col) continue;
    if (board[i] === row) c++;
    if (Math.abs(board[i] - row) === Math.abs(i - col)) c++;
  }
  return c;
}

function totalConflicts(board) {
  let c = 0;
  for (let i = 0; i < N; i++) c += conflictsFor(board, i, board[i]);
  return c / 2;
}

function runMinConflicts(seed, maxSteps = 60) {
  const rng = rngFactory(seed);
  const board = Array.from({ length: N }, () => Math.floor(rng() * N));
  const trace = [];
  trace.push({ board: [...board], conflicts: totalConflicts(board), pick: null, moveTo: null });

  for (let step = 0; step < maxSteps; step++) {
    if (totalConflicts(board) === 0) break;
    // pick a random conflicted column
    const conflicted = [];
    for (let c = 0; c < N; c++) if (conflictsFor(board, c, board[c]) > 0) conflicted.push(c);
    if (conflicted.length === 0) break;
    const pickCol = conflicted[Math.floor(rng() * conflicted.length)];
    // find row in pickCol that minimizes conflicts
    let bestRows = [];
    let bestConf = Infinity;
    for (let r = 0; r < N; r++) {
      const c = conflictsFor(board, pickCol, r);
      if (c < bestConf) { bestConf = c; bestRows = [r]; }
      else if (c === bestConf) bestRows.push(r);
    }
    const newRow = bestRows[Math.floor(rng() * bestRows.length)];
    trace.push({ board: [...board], conflicts: totalConflicts(board), pick: pickCol, moveTo: newRow, oldRow: board[pickCol] });
    board[pickCol] = newRow;
  }
  trace.push({ board: [...board], conflicts: totalConflicts(board), pick: null, moveTo: null, done: true });
  return trace;
}

export default function NQueensMinConflicts() {
  const [seed, setSeed] = useState(42);
  const trace = useMemo(() => runMinConflicts(seed), [seed]);
  const [step, setStep] = useState(0);
  useEffect(() => { setStep(0); }, [seed]);
  const cur = trace[Math.min(step, trace.length - 1)];

  const CELL = 40;
  const W = N * CELL;

  // conflict per cell helper
  function cellConflicts(c, r) { return conflictsFor(cur.board, c, r); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 11 }}>
        <button onClick={() => setSeed((s) => s + 1)} style={btnStyle()}>nový start</button>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setStep(0)} style={btnStyle()}>⏮</button>
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} style={btnStyle()}>◀</button>
          <button onClick={() => setStep((s) => Math.min(trace.length - 1, s + 1))} style={btnStyle()}>▶</button>
          <button onClick={() => setStep(trace.length - 1)} style={btnStyle()}>⏭</button>
        </div>
        <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          krok {step}/{trace.length - 1}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", color: cur.conflicts === 0 ? "oklch(0.75 0.18 145)" : "var(--text)" }}>
          konfliktů: {cur.conflicts}{cur.conflicts === 0 && cur.done ? " ✓" : ""}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${W}`} style={{ width: W, maxWidth: "100%", display: "block" }}>
        {/* board */}
        {Array.from({ length: N }).map((_, r) =>
          Array.from({ length: N }).map((_, c) => {
            const isLight = (c + r) % 2 === 0;
            const conf = cellConflicts(c, r);
            const isHovered = false;
            return (
              <g key={`${c}-${r}`}>
                <rect x={c * CELL} y={r * CELL} width={CELL} height={CELL}
                  fill={isLight ? "color-mix(in oklch, var(--bg-card) 95%, white 5%)" : "var(--bg-card)"}/>
                {cur.pick === c && (
                  <rect x={c * CELL} y={r * CELL} width={CELL} height={CELL}
                    fill="color-mix(in oklch, oklch(0.7 0.18 60) 25%, transparent)"/>
                )}
                {/* mini conflict number for column being picked */}
                {cur.pick === c && cur.board[c] !== r && (
                  <text x={c * CELL + CELL / 2} y={r * CELL + CELL / 2 + 4} textAnchor="middle"
                    fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                    {conf}
                  </text>
                )}
              </g>
            );
          })
        )}
        {/* grid */}
        {Array.from({ length: N + 1 }).map((_, i) => (
          <g key={i}>
            <line x1={i * CELL} y1={0} x2={i * CELL} y2={W} stroke="var(--line)" strokeWidth="0.5"/>
            <line x1={0} y1={i * CELL} x2={W} y2={i * CELL} stroke="var(--line)" strokeWidth="0.5"/>
          </g>
        ))}
        {/* queens */}
        {cur.board.map((r, c) => {
          const isAttacked = conflictsFor(cur.board, c, r) > 0;
          const isPicked = cur.pick === c;
          return (
            <g key={`q${c}`}>
              <circle cx={c * CELL + CELL / 2} cy={r * CELL + CELL / 2} r={CELL * 0.32}
                fill={isAttacked ? "oklch(0.55 0.22 25)" : "oklch(0.4 0.05 240)"}
                stroke={isPicked ? "oklch(0.7 0.18 60)" : "white"} strokeWidth={isPicked ? 3 : 1.5}/>
              <text x={c * CELL + CELL / 2} y={r * CELL + CELL / 2 + 4} textAnchor="middle" fontSize="14" fill="white" fontWeight="700">♛</text>
            </g>
          );
        })}
        {/* highlight move target */}
        {cur.moveTo !== null && cur.pick !== null && (
          <rect x={cur.pick * CELL + 2} y={cur.moveTo * CELL + 2} width={CELL - 4} height={CELL - 4}
            fill="none" stroke="oklch(0.7 0.18 145)" strokeWidth="3" strokeDasharray="4 2"/>
        )}
      </svg>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", padding: 6, borderRadius: 3, fontSize: 11, fontFamily: "var(--font-mono)" }}>
        {cur.pick !== null && cur.moveTo !== null ? (
          <>
            sloupec <strong>{cur.pick}</strong>: dáma byla v ř.{cur.oldRow}, přesouvám do ř.{cur.moveTo} (nejmíň konfliktů)
          </>
        ) : cur.done ? (
          <span style={{ color: "oklch(0.75 0.18 145)" }}>✓ řešení nalezeno</span>
        ) : step === 0 ? (
          <>výchozí náhodné rozmístění</>
        ) : null}
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Min-conflicts: opakovaně vyber konfliktní dámu (sloupec), přesuň ji do řádku s *nejmenším počtem* konfliktů.
        Empiricky řeší n-queens *v lineárním čase* pro velké n (~1M dam za sekundu) — překvapivě robustní heuristika
        oproti DFS+backtrack (exponenciální).
      </div>
    </div>
  );
}

function btnStyle() {
  return { background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 8px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
