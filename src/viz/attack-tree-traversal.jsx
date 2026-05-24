// attack-tree-traversal — AND/OR attack tree. Click leaf to toggle
// availability; root highlights open paths.
import { useState } from "react";

// Hardcoded tree: compromise webserver.
const TREE = {
  id: "root",
  label: "Compromise webserver",
  kind: "OR",
  children: [
    {
      id: "sqli",
      label: "SQL injection",
      kind: "AND",
      children: [
        { id: "sqli-find",  label: "find SQLi endpoint" },
        { id: "sqli-craft", label: "craft payload" },
      ],
    },
    {
      id: "bof",
      label: "BOF exploit",
      kind: "AND",
      children: [
        { id: "bof-ver",    label: "find vuln version" },
        { id: "bof-cve",    label: "use CVE exploit" },
      ],
    },
    {
      id: "soc",
      label: "social eng. admin",
      kind: "OR",
      children: [
        { id: "soc-phish",  label: "phishing" },
        { id: "soc-pre",    label: "pretexting" },
      ],
    },
  ],
};

function allLeaves(node, out = []) {
  if (!node.children) out.push(node);
  else node.children.forEach(c => allLeaves(c, out));
  return out;
}

function evaluate(node, leafState) {
  if (!node.children) return !!leafState[node.id];
  const childResults = node.children.map(c => evaluate(c, leafState));
  return node.kind === "AND" ? childResults.every(Boolean) : childResults.some(Boolean);
}

export default function AttackTreeTraversal() {
  const leaves = allLeaves(TREE);
  const [state, setState] = useState(() => leaves.reduce((o, l) => ({ ...o, [l.id]: false }), {}));

  const rootResult = evaluate(TREE, state);
  const enabledCount = Object.values(state).filter(Boolean).length;

  function toggle(id) { setState(s => ({ ...s, [id]: !s[id] })); }

  const W = 580, H = 280;

  // Layout
  const NODE_POS = {
    root: { x: 290, y: 30 },
    sqli: { x: 120, y: 100 },
    bof:  { x: 290, y: 100 },
    soc:  { x: 460, y: 100 },
    "sqli-find":  { x: 60, y: 200 },
    "sqli-craft": { x: 180, y: 200 },
    "bof-ver":    { x: 230, y: 200 },
    "bof-cve":    { x: 350, y: 200 },
    "soc-phish":  { x: 400, y: 200 },
    "soc-pre":    { x: 520, y: 200 },
  };

  function renderNode(node, parentResult = null) {
    const result = evaluate(node, state);
    const pos = NODE_POS[node.id];
    const isLeaf = !node.children;
    return (
      <g key={node.id}>
        {!isLeaf && node.children.map(c => {
          const childPos = NODE_POS[c.id];
          const open = evaluate(c, state);
          return (
            <line key={c.id} x1={pos.x} y1={pos.y + 14} x2={childPos.x} y2={childPos.y - 14}
              stroke={open ? "oklch(0.65 0.18 22)" : "var(--line)"} strokeWidth={open ? 1.5 : 0.8} />
          );
        })}
        <rect x={pos.x - 60} y={pos.y - 15} width={120} height={30} rx="3"
          fill={result ? "oklch(0.65 0.18 22 / 0.3)" : "var(--bg-inset)"}
          stroke={result ? "oklch(0.65 0.18 22)" : "var(--line)"} strokeWidth={result ? 1.5 : 0.8}
          style={{ cursor: isLeaf ? "pointer" : "default" }}
          onClick={isLeaf ? () => toggle(node.id) : undefined} />
        <text x={pos.x} y={pos.y - 3} textAnchor="middle" fontSize="9" fontWeight="600" fill="var(--text)">
          {node.label.slice(0, 18)}
        </text>
        <text x={pos.x} y={pos.y + 10} textAnchor="middle" fontSize="8"
          fill={isLeaf ? (result ? "oklch(0.65 0.18 22)" : "var(--text-muted)") : node.kind === "AND" ? "oklch(0.65 0.16 245)" : "oklch(0.7 0.15 145)"}>
          {isLeaf ? (result ? "[on]" : "[off]") : node.kind}
        </text>
        {!isLeaf && node.children.map(c => renderNode(c, result))}
      </g>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 11, alignItems: "center" }}>
        <button onClick={() => setState(leaves.reduce((o, l) => ({ ...o, [l.id]: true }), {}))} style={btn(false)}>enable all</button>
        <button onClick={() => setState(leaves.reduce((o, l) => ({ ...o, [l.id]: false }), {}))} style={btn(false)}>disable all</button>
        <span style={{ color: "var(--text-muted)" }}>klikni na leaf box pro toggle ({enabledCount}/{leaves.length} leaves on)</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {renderNode(TREE)}

        <rect x={20} y={240} width={W - 40} height={32} rx="3"
          fill={rootResult ? "oklch(0.65 0.18 22 / 0.25)" : "oklch(0.7 0.15 145 / 0.2)"}
          stroke={rootResult ? "oklch(0.65 0.18 22)" : "oklch(0.7 0.15 145)"} strokeWidth="1.5" />
        <text x={W / 2} y={261} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={rootResult ? "oklch(0.65 0.18 22)" : "oklch(0.7 0.15 145)"}>
          {rootResult ? "⚠ root achievable — at least one full path exists" : "✓ root not achievable — no full path"}
        </text>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        Attack tree: <b>AND</b> = všechny děti musí být splněny; <b>OR</b> = stačí jeden.
        Threat modeling: identifikovat všechny cesty k root; security architecture: zavřít control, který přeruší <i>více</i> cest.
      </div>
    </div>
  );
}

function btn(active) {
  return { background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", border: "1px solid var(--line)", padding: "3px 9px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
