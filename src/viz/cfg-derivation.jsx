// CFG derivace — interaktivní konstrukce derivačního stromu.
// Tři gramatiky: a^n b^n, vyrovnané ab, aritmetické výrazy (víceznačné).
// Klikni na neterminál ve větné formě a vyber pravidlo. Nebo "auto" pro
// předem připravenou derivaci. Pro výrazy zkus i + i * i dvakrát s různými
// prvními volbami a uvidíš dva různé stromy.
import { useState, useMemo } from "react";

// Gramatika { N: set neterminálů, T: set terminálů, S: startovní, P: pole pravidel }
// Pravidlo: { lhs: "S", rhs: ["a","S","b"] }
const GRAMMARS = {
  "a^n b^n": {
    desc: "Generuje {a^n b^n : n ≥ 0}.",
    N: ["S"],
    T: ["a", "b"],
    S: "S",
    P: [
      { lhs: "S", rhs: ["a", "S", "b"] },
      { lhs: "S", rhs: [] }, // ε
    ],
    target: "aaabbb",
  },
  "vyrovnané ab": {
    desc: "Generuje slova s #a = #b nad {a,b}.",
    N: ["S"],
    T: ["a", "b"],
    S: "S",
    P: [
      { lhs: "S", rhs: ["a", "S", "b"] },
      { lhs: "S", rhs: ["b", "S", "a"] },
      { lhs: "S", rhs: ["S", "S"] },
      { lhs: "S", rhs: [] },
    ],
    target: "abba",
  },
  "výrazy (víceznačná)": {
    desc: "E → E+E | E*E | i. Pro vstup i+i*i existují dva různé stromy podle priority.",
    N: ["E"],
    T: ["i", "+", "*"],
    S: "E",
    P: [
      { lhs: "E", rhs: ["E", "+", "E"] },
      { lhs: "E", rhs: ["E", "*", "E"] },
      { lhs: "E", rhs: ["i"] },
    ],
    target: "i+i*i",
  },
};

// Derivační strom je tree, kde každý uzel má { id, symbol, children: [tree] | null }
// children = null znamená "neexpandováno"
let nextId = 0;
function makeNode(symbol) {
  return { id: nextId++, symbol, children: null };
}

function rebuildTree(grammar) {
  nextId = 0;
  return makeNode(grammar.S);
}

function findUnexpanded(node, isNT) {
  if (node.children === null && isNT(node.symbol)) return node;
  if (!node.children) return null;
  for (const c of node.children) {
    const r = findUnexpanded(c, isNT);
    if (r) return r;
  }
  return null;
}

function findUnexpandedRight(node, isNT) {
  if (!node.children) {
    if (isNT(node.symbol)) return node;
    return null;
  }
  for (let i = node.children.length - 1; i >= 0; i--) {
    const r = findUnexpandedRight(node.children[i], isNT);
    if (r) return r;
  }
  return null;
}

function getYield(node) {
  if (!node.children) return [node.symbol];
  const out = [];
  for (const c of node.children) out.push(...getYield(c));
  return out;
}

function applyRuleToNode(node, rule) {
  node.children = rule.rhs.length === 0 ? [makeNode("ε")] : rule.rhs.map(makeNode);
}

// Layout the tree: assign x, y to each node
function layoutTree(node, depth = 0) {
  if (!node.children) {
    node._w = 40;
    node._depth = depth;
    return;
  }
  node._depth = depth;
  let totalW = 0;
  for (const c of node.children) {
    layoutTree(c, depth + 1);
    totalW += c._w;
  }
  node._w = Math.max(40, totalW);
}

function assignX(node, x0) {
  node._x = x0 + node._w / 2;
  if (!node.children) return;
  let cur = x0;
  for (const c of node.children) {
    assignX(c, cur);
    cur += c._w;
  }
}

function flatten(node, out = []) {
  out.push(node);
  if (node.children) for (const c of node.children) flatten(c, out);
  return out;
}

export default function CfgDerivation() {
  const [gKey, setGKey] = useState("a^n b^n");
  const g = GRAMMARS[gKey];
  const isNT = (s) => g.N.includes(s);

  const [tree, setTree] = useState(() => rebuildTree(g));
  const [history, setHistory] = useState([]);
  const [order, setOrder] = useState("L"); // L or R

  useMemo(() => {
    nextId = 0;
    setTree(makeNode(GRAMMARS[gKey].S));
    setHistory([]);
    return null;
  }, [gKey]);

  const finder = order === "L" ? findUnexpanded : findUnexpandedRight;
  const target = finder(tree, isNT);
  const yieldStr = getYield(tree).filter((s) => s !== "ε").join("");
  const applicableRules = target ? g.P.filter((r) => r.lhs === target.symbol) : [];
  const isDone = !target;

  function expand(rule) {
    if (!target) return;
    const oldClone = JSON.parse(JSON.stringify(tree));
    setHistory([...history, oldClone]);
    // mutate by id
    function mutate(n) {
      if (n.id === target.id) { applyRuleToNode(n, rule); return; }
      if (n.children) for (const c of n.children) mutate(c);
    }
    const newTree = JSON.parse(JSON.stringify(tree));
    mutate(newTree);
    setTree(newTree);
  }
  function back() {
    if (!history.length) return;
    setTree(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  }
  function reset() {
    nextId = 0;
    setTree(makeNode(g.S));
    setHistory([]);
  }

  // Layout
  layoutTree(tree);
  assignX(tree, 20);
  const nodes = flatten(tree);
  const maxDepth = Math.max(...nodes.map((n) => n._depth));
  const ROW_H = 50;
  const totalW = tree._w + 40;
  const totalH = (maxDepth + 1) * ROW_H + 40;

  return (
    <div style={containerStyle}>
      <div className="viz-controls">
        <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Gramatika:</label>
        <select className="viz-select" value={gKey} onChange={(e) => setGKey(e.target.value)}>
          {Object.keys(GRAMMARS).map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <label style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>Pořadí:</label>
        <select className="viz-select" value={order} onChange={(e) => setOrder(e.target.value)}>
          <option value="L">levá derivace</option>
          <option value="R">pravá derivace</option>
        </select>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{g.desc}</div>

      {/* Tree — wrapped in a width-capped div because `.block-viz-body svg` forces
          width:100%!important, so a sparse 1-node tree would otherwise balloon to full width.
          The cap grows with the tree (totalW) so deep derivations still use the space. */}
      <div style={{ width: "100%", maxWidth: Math.min(620, totalW * 2.6), margin: "0 auto" }}>
      <svg viewBox={`0 0 ${totalW} ${totalH}`} style={{ width: "100%" }} fontFamily="var(--font-mono, ui-monospace)" fontSize="12">
        {/* edges */}
        {nodes.flatMap((n) =>
          n.children
            ? n.children.map((c) => (
                <line key={`${n.id}-${c.id}`} x1={n._x} y1={n._depth * ROW_H + 20} x2={c._x} y2={c._depth * ROW_H + 20} stroke="var(--line)" />
              ))
            : []
        )}
        {/* nodes */}
        {nodes.map((n) => {
          const isLeaf = !n.children;
          const isNterm = isNT(n.symbol);
          const isTarget = target && n.id === target.id;
          return (
            <g key={n.id}>
              <circle
                cx={n._x}
                cy={n._depth * ROW_H + 20}
                r={isNterm ? 14 : 11}
                fill={isTarget ? "color-mix(in oklch, var(--accent) 35%, var(--bg-card))" : "var(--bg-card)"}
                stroke={isTarget ? "var(--accent)" : isNterm ? "var(--accent)" : "var(--line)"}
                strokeWidth={isTarget ? 2 : 1.2}
              />
              <text x={n._x} y={n._depth * ROW_H + 24} textAnchor="middle" fill={isNterm ? "var(--accent)" : "var(--text)"}>
                {n.symbol}
              </text>
            </g>
          );
        })}
      </svg>
      </div>

      <div style={{ fontSize: 13, color: "var(--text)", textAlign: "center", fontFamily: "var(--font-mono, ui-monospace)" }}>
        Větná forma: <span style={{ color: "var(--accent)" }}>{getYield(tree).join("")}</span>
        {isDone && <span style={{ color: "var(--accent)", marginLeft: 8 }}>✓ slovo: {yieldStr || "ε"}</span>}
      </div>

      {!isDone && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Aplikuj pravidlo na {target.symbol}{order === "L" ? " (nejlevější neterminál)" : " (nejpravější neterminál)"}:
          </div>
          <div className="viz-controls">
            {applicableRules.map((r, i) => (
              <button key={i} className="viz-btn" onClick={() => expand(r)}>
                {r.lhs} → {r.rhs.length === 0 ? "ε" : r.rhs.join("")}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="viz-controls" style={{ justifyContent: "center" }}>
        <button className="viz-btn" onClick={back} disabled={!history.length}>◀ zpět</button>
        <button className="viz-btn" onClick={reset}>reset</button>
      </div>
    </div>
  );
}

const containerStyle = {
  padding: 16,
  borderRadius: 12,
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

