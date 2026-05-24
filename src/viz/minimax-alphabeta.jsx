// Minimax with alpha-beta pruning — game tree visualization with cutoff highlighting.
import { useState, useMemo } from "react";

// Tree presets — each leaf is a numeric value. Inner nodes alternate MAX (root) / MIN.
const TREES = {
  "classic": {
    label: "AIMA klasik",
    leaves: [[3, 12, 8], [2, 4, 6], [14, 5, 2]],
  },
  "good-order": {
    label: "dobré pořadí",
    leaves: [[10, 5, 8], [2, 6, 4], [3, 7, 9]],
  },
  "bad-order": {
    label: "špatné pořadí",
    leaves: [[3, 7, 9], [2, 6, 4], [10, 5, 8]],
  },
  "deep-cut": {
    label: "silný cutoff",
    leaves: [[5, 6, 7], [3, 100, 100], [100, 100, 100]],
  },
};

function runMinimax(leaves, useAB) {
  const events = [];
  const evalLeaf = (val, path) => {
    events.push({ kind: "leaf", path, value: val });
    return val;
  };

  function maxNode(pathIdx, alpha, beta) {
    const childCount = leaves.length;
    let v = -Infinity;
    let bestI = -1;
    for (let i = 0; i < childCount; i++) {
      events.push({ kind: "enter", path: [pathIdx, i], side: "MIN", alpha, beta });
      const cv = minNode([pathIdx, i], alpha, beta);
      events.push({ kind: "return", path: [pathIdx, i], value: cv });
      if (cv > v) { v = cv; bestI = i; }
      if (useAB) {
        alpha = Math.max(alpha, v);
        if (alpha >= beta) {
          // prune the remaining children
          for (let j = i + 1; j < childCount; j++) {
            events.push({ kind: "prune", path: [pathIdx, j], reason: "α≥β" });
          }
          break;
        }
      }
    }
    return v;
  }
  function minNode(parentPath, alpha, beta) {
    const [, j] = parentPath;
    const row = leaves[j];
    let v = Infinity;
    for (let k = 0; k < row.length; k++) {
      const path = [parentPath[0], j, k];
      const cv = evalLeaf(row[k], path);
      if (cv < v) v = cv;
      if (useAB) {
        beta = Math.min(beta, v);
        if (beta <= alpha) {
          for (let m = k + 1; m < row.length; m++) {
            events.push({ kind: "prune", path: [parentPath[0], j, m], reason: "β≤α" });
          }
          break;
        }
      }
    }
    return v;
  }

  const root = maxNode("R", -Infinity, Infinity);
  events.push({ kind: "root", value: root });
  return { events, value: root };
}

export default function MinimaxAlphaBeta() {
  const [treeKey, setTreeKey] = useState("classic");
  const [useAB, setUseAB] = useState(true);
  const [step, setStep] = useState(0);

  const { events, value: rootValue } = useMemo(() => runMinimax(TREES[treeKey].leaves, useAB), [treeKey, useAB]);
  const visible = events.slice(0, step + 1);
  const maxStep = events.length - 1;

  const leaves = TREES[treeKey].leaves;
  const W = 520, H = 240;
  const ROOT = { x: W / 2, y: 30 };
  const midPositions = [0, 1, 2].map((i) => ({ x: 90 + i * 170, y: 110 }));
  const leafPositions = (j, k) => ({ x: 50 + j * 170 + k * 50, y: 200 });

  // Lookup events by path
  const stateFor = (path) => {
    let state = { kind: "untouched", value: null, prune: false, alpha: null, beta: null };
    for (const e of visible) {
      const ek = JSON.stringify(e.path);
      const pk = JSON.stringify(path);
      if (ek === pk) {
        if (e.kind === "prune") state = { ...state, kind: "pruned", prune: true };
        else if (e.kind === "enter") state = { kind: "enter", value: null, alpha: e.alpha, beta: e.beta };
        else if (e.kind === "return") state = { ...state, kind: "returned", value: e.value };
        else if (e.kind === "leaf") state = { kind: "leaf", value: e.value };
      }
    }
    return state;
  };

  const last = visible[visible.length - 1];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 11 }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)" }}>strom:</span>
          <select value={treeKey} onChange={(e) => { setTreeKey(e.target.value); setStep(0); }}
            style={{ background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 4px", borderRadius: 3 }}>
            {Object.entries(TREES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <input type="checkbox" checked={useAB} onChange={(e) => { setUseAB(e.target.checked); setStep(0); }} />
          <span>α-β cutoff</span>
        </label>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setStep(0)} style={btnStyle()}>⏮</button>
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} style={btnStyle()}>◀</button>
          <button onClick={() => setStep((s) => Math.min(maxStep, s + 1))} style={btnStyle()}>▶</button>
          <button onClick={() => setStep(maxStep)} style={btnStyle()}>⏭</button>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 620 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* root → MIN edges */}
        {midPositions.map((mp, i) => (
          <line key={`re${i}`} x1={ROOT.x} y1={ROOT.y + 14} x2={mp.x} y2={mp.y - 14}
            stroke="var(--line-strong)" strokeWidth={1} opacity={0.7} />
        ))}
        {/* MIN → leaf edges */}
        {leaves.map((row, j) => row.map((_, k) => {
          const lp = leafPositions(j, k);
          const state = stateFor(["R", j, k]);
          const color = state.prune ? "var(--text-faint)" : "var(--line-strong)";
          return (
            <line key={`le${j}-${k}`} x1={midPositions[j].x} y1={midPositions[j].y + 14}
              x2={lp.x} y2={lp.y - 10}
              stroke={color} strokeWidth={1} strokeDasharray={state.prune ? "3 2" : "none"} opacity={state.prune ? 0.4 : 0.7} />
          );
        }))}

        {/* root */}
        <g>
          <rect x={ROOT.x - 30} y={ROOT.y - 14} width={60} height={28} rx={4}
            fill="oklch(0.4 0.1 240)" stroke="var(--accent)" strokeWidth={1.5}/>
          <text x={ROOT.x} y={ROOT.y - 2} textAnchor="middle" fontSize="10" fill="var(--text)" fontWeight="600">MAX</text>
          {last && last.kind === "root" && (
            <text x={ROOT.x} y={ROOT.y + 10} textAnchor="middle" fontSize="11" fill="oklch(0.85 0.2 60)" fontFamily="var(--font-mono)" fontWeight="700">
              = {rootValue}
            </text>
          )}
        </g>

        {/* MIN nodes */}
        {midPositions.map((mp, j) => {
          const state = stateFor(["R", j]);
          let bgColor = "var(--bg-card)";
          let strokeC = "var(--line-strong)";
          if (state.prune) { bgColor = "color-mix(in oklch, var(--text-faint) 35%, var(--bg-card))"; }
          else if (state.kind === "returned") bgColor = "color-mix(in oklch, oklch(0.6 0.15 30) 30%, var(--bg-card))";
          else if (state.kind === "enter") { strokeC = "oklch(0.7 0.18 60)"; }
          return (
            <g key={`m${j}`}>
              <rect x={mp.x - 30} y={mp.y - 14} width={60} height={28} rx={4}
                fill={bgColor} stroke={strokeC} strokeWidth={1.5}/>
              <text x={mp.x} y={mp.y - 2} textAnchor="middle" fontSize="10" fill="var(--text)" fontWeight="600">MIN</text>
              {state.kind === "returned" && (
                <text x={mp.x} y={mp.y + 10} textAnchor="middle" fontSize="10" fill="oklch(0.78 0.16 30)" fontFamily="var(--font-mono)">
                  = {state.value}
                </text>
              )}
            </g>
          );
        })}

        {/* leaves */}
        {leaves.map((row, j) => row.map((val, k) => {
          const lp = leafPositions(j, k);
          const state = stateFor(["R", j, k]);
          let fill = "var(--bg-card)";
          let strokeC = "var(--line-strong)";
          let textFill = "var(--text-muted)";
          if (state.prune) {
            fill = "color-mix(in oklch, var(--text-faint) 30%, var(--bg-card))";
            textFill = "var(--text-faint)";
          } else if (state.kind === "leaf") {
            fill = "color-mix(in oklch, oklch(0.75 0.18 145) 50%, var(--bg-card))";
            textFill = "var(--text)";
          }
          return (
            <g key={`l${j}${k}`}>
              <rect x={lp.x - 14} y={lp.y - 10} width={28} height={20} rx={2}
                fill={fill} stroke={strokeC} strokeWidth={1} />
              <text x={lp.x} y={lp.y + 4} textAnchor="middle" fontSize="11" fill={textFill} fontFamily="var(--font-mono)" fontWeight={state.prune ? 400 : 600}>
                {val}
              </text>
              {state.prune && (
                <text x={lp.x} y={lp.y + 22} textAnchor="middle" fontSize="8" fill="var(--text-faint)" fontFamily="var(--font-mono)">
                  ✂
                </text>
              )}
            </g>
          );
        }))}
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        krok {step}/{maxStep} · {last && describeEvent(last)}
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Pořadí listů má velký vliv — zkuste &quot;dobré&quot; vs &quot;špatné&quot; pořadí: lepší pořadí dovolí α-β oříznout výrazně více.
        Cutoff *nemění* hodnotu kořene, jen šetří vyhodnocení.
      </div>
    </div>
  );
}

function describeEvent(e) {
  if (e.kind === "leaf") return `vyhodnocen list (${e.path.slice(1).join(",")}) = ${e.value}`;
  if (e.kind === "enter") return `vstup do ${e.side} uzlu, α=${fmt(e.alpha)} β=${fmt(e.beta)}`;
  if (e.kind === "return") return `návrat z (${e.path.slice(1).join(",")}) = ${e.value}`;
  if (e.kind === "prune") return `oříznut podstrom (${e.path.slice(1).join(",")})`;
  if (e.kind === "root") return `root MAX = ${e.value}`;
  return "";
}
function fmt(x) { if (x === -Infinity) return "−∞"; if (x === Infinity) return "+∞"; return String(x); }
function btnStyle() {
  return { background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
