// rtree-insert-split — interactive R-tree: drag-create rectangles, watch
// ChooseLeaf, Quadratic Split, MBR overlap. Range query traversal counts
// visited nodes.
import { useMemo, useState } from "react";

const W = 540, H = 340;

const INIT_RECTS = [
  [1, 1, 2, 2], [3, 1, 4, 2.5], [1, 4, 2.5, 5], [4, 4, 5.5, 5],
  [6, 1, 7, 2.5], [6, 4, 7, 5], [3, 6, 4.5, 7.5], [8, 6, 9, 7.5],
];

function makeNode(leaf = true) {
  return { entries: [], leaf, mbr: null };
}

function updateMbr(node) {
  if (node.entries.length === 0) { node.mbr = null; return; }
  let lo0 = Infinity, lo1 = Infinity, hi0 = -Infinity, hi1 = -Infinity;
  for (const e of node.entries) {
    const m = e.mbr || e;
    lo0 = Math.min(lo0, m[0]); lo1 = Math.min(lo1, m[1]);
    hi0 = Math.max(hi0, m[2]); hi1 = Math.max(hi1, m[3]);
  }
  node.mbr = [lo0, lo1, hi0, hi1];
}

function area(m) { return Math.max(0, m[2] - m[0]) * Math.max(0, m[3] - m[1]); }
function enlarged(parent, child) {
  return [Math.min(parent[0], child[0]), Math.min(parent[1], child[1]), Math.max(parent[2], child[2]), Math.max(parent[3], child[3])];
}

function chooseLeaf(node, rect) {
  if (node.leaf) return node;
  let best = node.entries[0];
  let bestEnl = area(enlarged(best.child.mbr, rect)) - area(best.child.mbr);
  for (let i = 1; i < node.entries.length; i++) {
    const e = node.entries[i];
    const enl = area(enlarged(e.child.mbr, rect)) - area(e.child.mbr);
    if (enl < bestEnl || (enl === bestEnl && area(e.child.mbr) < area(best.child.mbr))) {
      bestEnl = enl; best = e;
    }
  }
  return chooseLeaf(best.child, rect);
}

function quadraticSplit(entries, M = 4) {
  // pick seeds maximizing waste
  let s1 = 0, s2 = 1, worst = -Infinity;
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i].mbr || entries[i];
      const b = entries[j].mbr || entries[j];
      const e = enlarged(a, b);
      const w = area(e) - area(a) - area(b);
      if (w > worst) { worst = w; s1 = i; s2 = j; }
    }
  }
  const g1 = [entries[s1]], g2 = [entries[s2]];
  const remaining = entries.filter((_, k) => k !== s1 && k !== s2);
  let m1 = g1[0].mbr || g1[0];
  let m2 = g2[0].mbr || g2[0];
  while (remaining.length > 0) {
    if (g1.length + remaining.length <= Math.ceil(M / 2)) { g1.push(...remaining); remaining.length = 0; break; }
    if (g2.length + remaining.length <= Math.ceil(M / 2)) { g2.push(...remaining); remaining.length = 0; break; }
    let bestIdx = 0, bestDelta = -Infinity, into = "1";
    for (let i = 0; i < remaining.length; i++) {
      const r = remaining[i].mbr || remaining[i];
      const d1 = area(enlarged(m1, r)) - area(m1);
      const d2 = area(enlarged(m2, r)) - area(m2);
      const delta = Math.abs(d1 - d2);
      if (delta > bestDelta) {
        bestDelta = delta; bestIdx = i;
        into = d1 < d2 ? "1" : "2";
      }
    }
    const r = remaining.splice(bestIdx, 1)[0];
    if (into === "1") { g1.push(r); m1 = enlarged(m1, r.mbr || r); }
    else { g2.push(r); m2 = enlarged(m2, r.mbr || r); }
  }
  return [g1, g2];
}

function insert(root, rect, M = 4) {
  // Reach leaf
  const stack = [];
  let node = root;
  while (!node.leaf) {
    let best = node.entries[0];
    let bestEnl = area(enlarged(best.child.mbr, rect)) - area(best.child.mbr);
    for (let i = 1; i < node.entries.length; i++) {
      const e = node.entries[i];
      const enl = area(enlarged(e.child.mbr, rect)) - area(e.child.mbr);
      if (enl < bestEnl || (enl === bestEnl && area(e.child.mbr) < area(best.child.mbr))) {
        bestEnl = enl; best = e;
      }
    }
    stack.push({ parent: node, entry: best });
    node = best.child;
  }
  node.entries.push({ mbr: rect, leaf: true });
  let newSibling = null;
  if (node.entries.length > M) {
    const [g1, g2] = quadraticSplit(node.entries, M);
    node.entries = g1;
    newSibling = { entries: g2, leaf: true, mbr: null };
    updateMbr(newSibling);
  }
  updateMbr(node);

  // Propagate up
  while (stack.length > 0) {
    const { parent } = stack.pop();
    if (newSibling) {
      parent.entries.push({ mbr: null, child: newSibling });
      updateMbr(newSibling);
      parent.entries[parent.entries.length - 1].mbr = newSibling.mbr;
      if (parent.entries.length > M) {
        const [g1, g2] = quadraticSplit(parent.entries, M);
        parent.entries = g1;
        const nsib = { entries: g2, leaf: false, mbr: null };
        updateMbr(nsib);
        for (const e of nsib.entries) e.mbr = e.child ? e.child.mbr : e.mbr;
        newSibling = nsib;
      } else {
        newSibling = null;
      }
    }
    // refresh stored entry mbrs in parent
    for (const e of parent.entries) e.mbr = e.child ? e.child.mbr : e.mbr;
    updateMbr(parent);
  }
  if (newSibling) {
    // grow root
    const newRoot = { entries: [], leaf: false, mbr: null };
    const oldRoot = { ...root };
    newRoot.entries.push({ mbr: oldRoot.mbr, child: oldRoot });
    newRoot.entries.push({ mbr: newSibling.mbr, child: newSibling });
    updateMbr(newRoot);
    Object.assign(root, newRoot);
  }
}

function buildTree(rects) {
  const root = makeNode(true);
  updateMbr(root);
  for (const r of rects) insert(root, r);
  return root;
}

function rectsOverlap(a, b) {
  return !(a[2] < b[0] || b[2] < a[0] || a[3] < b[1] || b[3] < a[1]);
}

function rangeQuery(node, q, stats = { visited: 0, results: [], pruned: 0 }) {
  stats.visited++;
  if (!node.mbr || !rectsOverlap(node.mbr, q)) { stats.pruned++; return stats; }
  if (node.leaf) {
    for (const e of node.entries) {
      stats.visited++;
      if (rectsOverlap(e.mbr || e, q)) stats.results.push(e.mbr || e);
    }
  } else {
    for (const e of node.entries) {
      if (rectsOverlap(e.mbr || e.child.mbr, q)) rangeQuery(e.child, q, stats);
      else stats.pruned++;
    }
  }
  return stats;
}

export default function RtreeInsertSplit() {
  const [rects, setRects] = useState(INIT_RECTS.map(r => [...r]));
  const [drawing, setDrawing] = useState(null);
  const [queryRect, setQueryRect] = useState([2, 2, 5, 6]);
  const [dragQ, setDragQ] = useState(null);

  const tree = useMemo(() => buildTree(rects), [rects]);

  const stats = useMemo(() => rangeQuery(tree, queryRect, { visited: 0, results: [], pruned: 0 }), [tree, queryRect]);

  const PAD = 16;
  const PW = 320, PH = 280;
  const xMin = 0, xMax = 10, yMin = 0, yMax = 10;
  const toX = (x) => PAD + ((x - xMin) / (xMax - xMin)) * PW;
  const toY = (y) => PAD + PH - ((y - yMin) / (yMax - yMin)) * PH;
  const pxToX = (px) => Math.max(xMin, Math.min(xMax, (px - PAD) / PW * (xMax - xMin)));
  const pxToY = (py) => Math.max(yMin, Math.min(yMax, yMax - (py - PAD) / PH * (yMax - yMin)));

  function pos(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const py = ((e.clientY - r.top) / r.height) * H;
    return [pxToX(px), pxToY(py)];
  }
  function down(e) {
    const [x, y] = pos(e);
    if (x < 0 || x > 10 || y < 0 || y > 10) return;
    // check if inside query rect → drag query
    if (x >= queryRect[0] && x <= queryRect[2] && y >= queryRect[1] && y <= queryRect[3]) {
      setDragQ({ ox: x, oy: y, qx: queryRect[0], qy: queryRect[1] });
      return;
    }
    setDrawing({ x0: x, y0: y, x1: x, y1: y });
  }
  function move(e) {
    const [x, y] = pos(e);
    if (drawing) setDrawing({ ...drawing, x1: x, y1: y });
    if (dragQ) {
      const dx = x - dragQ.ox, dy = y - dragQ.oy;
      const w = queryRect[2] - queryRect[0], h = queryRect[3] - queryRect[1];
      const nx = Math.max(0, Math.min(10 - w, dragQ.qx + dx));
      const ny = Math.max(0, Math.min(10 - h, dragQ.qy + dy));
      setQueryRect([nx, ny, nx + w, ny + h]);
    }
  }
  function up() {
    if (drawing) {
      const r = [
        Math.min(drawing.x0, drawing.x1),
        Math.min(drawing.y0, drawing.y1),
        Math.max(drawing.x0, drawing.x1),
        Math.max(drawing.y0, drawing.y1),
      ];
      if ((r[2] - r[0]) > 0.2 && (r[3] - r[1]) > 0.2) setRects([...rects, r]);
      setDrawing(null);
    }
    setDragQ(null);
  }

  // Draw tree nodes recursively
  function drawNodeMBR(node, depth = 0, idx = 0) {
    if (!node || !node.mbr) return null;
    const colors = ["oklch(0.7 0.15 22)", "oklch(0.65 0.16 145)", "oklch(0.65 0.16 264)"];
    const c = colors[depth % colors.length];
    return (
      <g key={`${depth}-${idx}`}>
        <rect x={toX(node.mbr[0])} y={toY(node.mbr[3])}
          width={toX(node.mbr[2]) - toX(node.mbr[0])}
          height={toY(node.mbr[1]) - toY(node.mbr[3])}
          fill="none" stroke={c} strokeWidth={1.2 - depth * 0.2}
          opacity={0.65} strokeDasharray={depth === 0 ? "5 3" : "0"} />
        {!node.leaf && node.entries.map((e, i) => drawNodeMBR(e.child, depth + 1, i))}
      </g>
    );
  }

  function renderTreeText(node, indent = "") {
    if (!node) return [];
    if (node.leaf) return [`${indent}[leaf] entries=${node.entries.length}`];
    const lines = [`${indent}[internal] entries=${node.entries.length}`];
    for (const e of node.entries) {
      if (e.child) lines.push(...renderTreeText(e.child, indent + "  "));
    }
    return lines;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button onClick={() => setRects(INIT_RECTS.map(r => [...r]))} style={btn(false)}>reset</button>
        <button onClick={() => setRects(rects.slice(0, -1))} style={btn(false)} disabled={rects.length === 0}>− last</button>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", padding: "4px 0" }}>drag empty area to add a rectangle</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4, userSelect: "none", touchAction: "none", cursor: "crosshair" }}
        onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up}>
        <rect x={PAD} y={PAD} width={PW} height={PH} fill="var(--bg-inset)" stroke="var(--line)" />

        {/* MBRs */}
        {drawNodeMBR(tree)}

        {/* data rectangles */}
        {rects.map((r, i) => {
          const matched = stats.results.some(m => m[0] === r[0] && m[1] === r[1] && m[2] === r[2] && m[3] === r[3]);
          return (
            <rect key={i} x={toX(r[0])} y={toY(r[3])} width={toX(r[2]) - toX(r[0])} height={toY(r[1]) - toY(r[3])}
              fill={matched ? "oklch(0.65 0.16 145 / 0.25)" : "oklch(0.65 0.16 264 / 0.15)"}
              stroke={matched ? "oklch(0.65 0.16 145)" : "oklch(0.65 0.16 264)"}
              strokeWidth="1" />
          );
        })}

        {/* drawing rect */}
        {drawing && (
          <rect x={toX(Math.min(drawing.x0, drawing.x1))} y={toY(Math.max(drawing.y0, drawing.y1))}
            width={Math.abs(toX(drawing.x1) - toX(drawing.x0))} height={Math.abs(toY(drawing.y1) - toY(drawing.y0))}
            fill="none" stroke="var(--accent)" strokeWidth="1.4" strokeDasharray="3 2" />
        )}

        {/* query rect */}
        <rect x={toX(queryRect[0])} y={toY(queryRect[3])} width={toX(queryRect[2]) - toX(queryRect[0])} height={toY(queryRect[1]) - toY(queryRect[3])}
          fill="oklch(0.7 0.15 60 / 0.15)" stroke="oklch(0.7 0.15 60)" strokeWidth="1.4" strokeDasharray="4 3" style={{ cursor: "move" }} />

        {/* tree text */}
        <g transform={`translate(${PAD + PW + 16}, ${PAD})`}>
          <text x={0} y={0} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">R-tree (M=4)</text>
          {renderTreeText(tree).slice(0, 14).map((line, i) => (
            <text key={i} x={0} y={14 + i * 12} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-muted)" style={{ whiteSpace: "pre" }}>{line}</text>
          ))}
          <text x={0} y={210} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">range query</text>
          <text x={0} y={224} fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.65 0.16 145)">results: {stats.results.length}</text>
          <text x={0} y={238} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">visited: {stats.visited}</text>
          <text x={0} y={252} fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.6 0.18 22)">pruned: {stats.pruned}</text>
        </g>
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        ChooseLeaf descends the subtree whose MBR enlarges the least (ties broken by smallest area). When a leaf exceeds M=4 entries, Quadratic Split picks the two seeds that waste the most area together,
        then distributes the rest into the group whose MBR grows less. MBR overlap between siblings → range queries may visit multiple subtrees.
      </div>
    </div>
  );
}

function btn(active) {
  return {
    fontFamily: "var(--font-mono)", fontSize: 11, padding: "2px 8px",
    background: active ? "var(--accent)" : "var(--bg-inset)",
    color: active ? "var(--bg-card)" : "var(--text)",
    border: "1px solid var(--line-strong)", borderRadius: 3, cursor: "pointer",
  };
}
