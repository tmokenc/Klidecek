// SLD resolution tree — backtracking search visualized.
import { useState } from "react";

const SCENARIOS = {
  parent: {
    kb: `parent(tom, bob).
parent(tom, liz).
parent(bob, ann).
parent(bob, pat).

grandparent(X, Z) :- parent(X, Y), parent(Y, Z).`,
    goal: "?- grandparent(tom, Z).",
    tree: {
      label: "grandparent(tom, Z)",
      bind: "",
      kind: "goal",
      children: [{
        label: "parent(tom, Y), parent(Y, Z)",
        bind: "X = tom",
        kind: "rule",
        children: [
          { label: "parent(bob, Z)",   bind: "Y = bob", kind: "ok", children: [
            { label: "Z = ann",        bind: "✓ solution",  kind: "sol" },
            { label: "Z = pat",        bind: "✓ next solution (redo)",  kind: "sol" },
          ]},
          { label: "parent(liz, Z)",   bind: "Y = liz", kind: "fail", children: [
            { label: "fail",            bind: "no clauses match",         kind: "x" },
          ]},
        ],
      }],
    },
    solutions: ["Z = ann", "Z = pat", "false"],
  },
  "with-cut": {
    kb: `max(X, Y, X) :- X >= Y, !.
max(_, Y, Y).

?- max(5, 3, M).`,
    goal: "?- max(5, 3, M).",
    tree: {
      label: "max(5, 3, M)",
      bind: "",
      kind: "goal",
      children: [
        { label: "X >= Y, !, M = X", bind: "X=5, Y=3",  kind: "rule", children: [
          { label: "5 >= 3", bind: "true", kind: "ok", children: [
            { label: "! (cut)", bind: "commit — no backtracking past this", kind: "cut", children: [
              { label: "M = 5", bind: "✓ solution", kind: "sol" },
            ]},
          ]},
        ]},
        { label: "max(_, Y, Y)", bind: "(blocked by cut)", kind: "fail", children: [
          { label: "x (cut prevents reaching)", bind: "", kind: "x" },
        ]},
      ],
    },
    solutions: ["M = 5"],
  },
};

function renderNode(node, x, y, dx, dy, idx = 0, parentX = null, parentY = null) {
  const color = node.kind === "sol" ? "rgb(64,192,87)" : node.kind === "fail" || node.kind === "x" ? "rgb(220,80,80)" : node.kind === "cut" ? "rgb(220,140,80)" : "var(--accent)";
  const out = [];
  if (parentX !== null) out.push(<line key={`l${x}-${y}`} x1={parentX} y1={parentY + 10} x2={x} y2={y - 14} stroke="var(--text-muted)" strokeWidth="0.8" />);
  out.push(
    <g key={`n${x}-${y}-${idx}`}>
      <rect x={x - 70} y={y - 14} width="140" height="32" rx="4" fill="var(--bg-card)" stroke={color} strokeWidth="1" />
      <text x={x} y={y - 2} fontSize="9.5" textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)">{node.label.slice(0, 22)}</text>
      <text x={x} y={y + 12} fontSize="8.5" textAnchor="middle" fill={color} fontFamily="var(--font-mono)">{node.bind.slice(0, 22)}</text>
    </g>
  );
  if (node.children) {
    const cN = node.children.length;
    const spread = Math.max(140, cN * 150);
    node.children.forEach((c, i) => {
      const cx = x - spread / 2 + (i + 0.5) * (spread / cN);
      out.push(...renderNode(c, cx, y + dy, dx * 0.7, dy, i, x, y));
    });
  }
  return out;
}

export default function PrologSldTree() {
  const [s, setS] = useState("parent");
  const cur = SCENARIOS[s];
  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>scenario:</label>
        {Object.keys(SCENARIOS).map((k) => (
          <button key={k} style={s === k ? btnOn : btn} onClick={() => setS(k)}>{k}</button>
        ))}
      </div>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <pre style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)", margin: 0, whiteSpace: "pre" }}>{cur.kb}</pre>
      </div>
      <div style={{ background: "var(--bg-inset)", padding: 8, borderRadius: 6, textAlign: "center" }}>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>{cur.goal}</code>
      </div>
      <svg viewBox="0 0 540 280" style={{ width: "100%", maxWidth: 600, background: "var(--bg-inset)", borderRadius: 6 }}>
        {renderNode(cur.tree, 270, 30, 200, 70)}
      </svg>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>všechna řešení (přes redo / ;):</div>
        {cur.solutions.map((sol, i) => (
          <div key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 12, padding: "2px 0", color: sol === "false" ? "var(--text-muted)" : "rgb(64,192,87)" }}>{sol}</div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        SLD = Selective Linear resolution with Definite clauses. Prolog volí <strong>first clause</strong>, hloubkové prohledávání s backtrackingem. Cut (!) "commituje" volbu — větve pravidla i alternativy nad cut jsou odříznuty.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const btnOn = { ...btn, background: "var(--accent)", color: "var(--bg-card)", borderColor: "var(--accent)" };
