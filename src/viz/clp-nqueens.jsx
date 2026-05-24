// CLP(FD) n-queens — propagation prunes domains visually.
import { useState } from "react";

function isSafe(board, row, col) {
  for (let r = 0; r < row; r++) {
    if (board[r] === col || Math.abs(board[r] - col) === row - r) return false;
  }
  return true;
}

function solveTrace(n) {
  const trace = [];
  const board = Array(n).fill(-1);
  // domains: per row, which cols are still valid
  const search = (row) => {
    if (row === n) {
      trace.push({ board: [...board], domains: null, msg: "✓ solution found" });
      return true;
    }
    for (let c = 0; c < n; c++) {
      if (isSafe(board, row, c)) {
        board[row] = c;
        // compute remaining domains after placing this
        const doms = [];
        for (let r2 = row + 1; r2 < n; r2++) {
          const dom = [];
          for (let c2 = 0; c2 < n; c2++) if (isSafe(board, r2, c2)) dom.push(c2);
          doms.push(dom);
        }
        trace.push({ board: [...board], domains: doms, msg: `place Q at (${row},${c}), propagate constraints` });
        if (search(row + 1)) return true;
        board[row] = -1;
        trace.push({ board: [...board], domains: null, msg: `backtrack from row ${row + 1}` });
      }
    }
    return false;
  };
  search(0);
  return trace;
}

export default function ClpNqueens() {
  const [n, setN] = useState(4);
  const [step, setStep] = useState(0);
  const trace = solveTrace(n);
  const s = trace[Math.min(step, trace.length - 1)];

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>n:</label>
        {[4, 5, 6].map((k) => <button key={k} style={n === k ? btnOn : btn} onClick={() => { setN(k); setStep(0); }}>{k}-queens</button>)}
        <span style={{ ...lbl, marginLeft: 12 }}>krok {step + 1} / {trace.length}</span>
        <button style={btn} disabled={step === 0} onClick={() => setStep(step - 1)}>‹</button>
        <button style={btn} disabled={step >= trace.length - 1} onClick={() => setStep(step + 1)}>›</button>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <svg viewBox={`0 0 ${n * 40 + 4} ${n * 40 + 4}`} style={{ width: Math.min(280, n * 40 + 4), height: Math.min(280, n * 40 + 4), background: "var(--bg-inset)", borderRadius: 6 }}>
          {Array.from({ length: n * n }, (_, i) => {
            const r = Math.floor(i / n), c = i % n;
            const hasQ = s.board[r] === c;
            const inDom = s.domains && r > s.board.findIndex((x, idx) => x === -1 && idx >= 0)
              ? s.domains[r - (s.board.findIndex((x) => x === -1) >= 0 ? s.board.findIndex((x) => x === -1) : 0) - 1]?.includes(c) : false;
            return (
              <g key={i}>
                <rect x={c * 40 + 2} y={r * 40 + 2} width="38" height="38"
                      fill={(r + c) % 2 === 0 ? "var(--bg-card)" : "var(--bg-inset)"}
                      stroke="var(--line)" strokeWidth="0.5" />
                {hasQ && <text x={c * 40 + 21} y={r * 40 + 28} fontSize="22" textAnchor="middle" fill="var(--accent)">♛</text>}
              </g>
            );
          })}
        </svg>

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>akce:</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" }}>{s.msg}</div>
          </div>
          {s.domains && (
            <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, marginTop: 8 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>domény pro zbývající řádky:</div>
              {s.domains.map((d, i) => {
                const row = s.board.findIndex((x) => x === -1, i) === -1 ? s.board.length + i + 1 : i + 1 + s.board.filter((x) => x !== -1).length;
                return (
                  <div key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 11, padding: "2px 0" }}>
                    Q{i + 1 + s.board.filter((x) => x !== -1).length}: <span style={{ color: d.length === 0 ? "rgb(220,80,80)" : "rgb(64,192,87)" }}>{d.length === 0 ? "∅ (FAIL)" : `{${d.join(", ")}}`}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)", display: "block", whiteSpace: "pre" }}>{
`:- use_module(library(clpfd)).
queens(Qs) :-
    length(Qs, ${n}),
    Qs ins 1..${n},
    safe(Qs),
    label(Qs).`
        }</code>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        CLP(FD) propaguje constraint <em>před</em> jeho explicitním testem — když je domain prázdná, fail bez vlastní rekurze. <code style={mono}>label/1</code> spustí enumeraci přes valid hodnoty.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const btnOn = { ...btn, background: "var(--accent)", color: "var(--bg-card)", borderColor: "var(--accent)" };
const mono = { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" };
