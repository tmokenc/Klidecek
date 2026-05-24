// kd-tree-builder — click-to-add points, build a k-D tree by alternating
// x/y splits; range query box prunes subtrees; toggle quadtree mode.
import { useMemo, useState } from "react";

const W = 540, H = 320;

const INIT = [
  [4, 6], [2, 3], [1, 7], [6, 9], [8, 3], [3, 1], [7, 5], [9, 8],
];

function buildKD(points) {
  // points: array of [x, y, originalIndex]
  function rec(pts, depth) {
    if (pts.length === 0) return null;
    const dim = depth % 2;
    const sorted = [...pts].sort((a, b) => a[dim] - b[dim]);
    const mid = sorted.length >> 1;
    const pivot = sorted[mid];
    return {
      point: pivot,
      depth,
      dim,
      left: rec(sorted.slice(0, mid), depth + 1),
      right: rec(sorted.slice(mid + 1), depth + 1),
    };
  }
  return rec(points.map((p, i) => [p[0], p[1], i]), 0);
}

function collectSplits(node, bbox, splits = []) {
  if (!node) return splits;
  const { point, dim } = node;
  if (dim === 0) {
    splits.push({ x: point[0], y0: bbox[0][1], y1: bbox[1][1], dim });
    collectSplits(node.left, [bbox[0], [point[0], bbox[1][1]]], splits);
    collectSplits(node.right, [[point[0], bbox[0][1]], bbox[1]], splits);
  } else {
    splits.push({ y: point[1], x0: bbox[0][0], x1: bbox[1][0], dim });
    collectSplits(node.left, [bbox[0], [bbox[1][0], point[1]]], splits);
    collectSplits(node.right, [[bbox[0][0], point[1]], bbox[1]], splits);
  }
  return splits;
}

function buildQuadtree(pts, capacity = 1, bbox = [[0, 0], [10, 10]]) {
  // returns { bbox, points, children }
  const node = { bbox, points: [], children: null };
  function insert(n, p) {
    if (n.children) {
      const mx = (n.bbox[0][0] + n.bbox[1][0]) / 2;
      const my = (n.bbox[0][1] + n.bbox[1][1]) / 2;
      const ix = p[0] >= mx ? 1 : 0;
      const iy = p[1] >= my ? 1 : 0;
      insert(n.children[iy * 2 + ix], p);
    } else {
      n.points.push(p);
      if (n.points.length > capacity) {
        const mx = (n.bbox[0][0] + n.bbox[1][0]) / 2;
        const my = (n.bbox[0][1] + n.bbox[1][1]) / 2;
        n.children = [
          { bbox: [[n.bbox[0][0], n.bbox[0][1]], [mx, my]], points: [], children: null },
          { bbox: [[mx, n.bbox[0][1]], [n.bbox[1][0], my]], points: [], children: null },
          { bbox: [[n.bbox[0][0], my], [mx, n.bbox[1][1]]], points: [], children: null },
          { bbox: [[mx, my], [n.bbox[1][0], n.bbox[1][1]]], points: [], children: null },
        ];
        const pts = n.points;
        n.points = [];
        for (const q of pts) insert(n, q);
      }
    }
  }
  for (const p of pts) insert(node, p);
  return node;
}

function rangeQueryKD(node, q, hits = [], pruned = []) {
  if (!node) return;
  const inside = node.point[0] >= q.lo[0] && node.point[0] <= q.hi[0] && node.point[1] >= q.lo[1] && node.point[1] <= q.hi[1];
  if (inside) hits.push(node.point);
  // Recurse based on dim
  const { dim, point } = node;
  if (q.lo[dim] <= point[dim]) rangeQueryKD(node.left, q, hits, pruned); else if (node.left) pruned.push(node.left);
  if (q.hi[dim] >= point[dim]) rangeQueryKD(node.right, q, hits, pruned); else if (node.right) pruned.push(node.right);
  return { hits, pruned };
}

export default function KdTreeBuilder() {
  const [points, setPoints] = useState(INIT.map(p => [...p]));
  const [mode, setMode] = useState("kd");
  const [qLo, setQLo] = useState([2, 2]);
  const [qHi, setQHi] = useState([7, 6]);
  const [draggingCorner, setDraggingCorner] = useState(null);
  const [addMode, setAddMode] = useState(false);

  const kd = useMemo(() => buildKD(points), [points]);
  const splits = useMemo(() => collectSplits(kd, [[0, 0], [10, 10]]), [kd]);
  const queryResult = useMemo(() => kd ? rangeQueryKD(kd, { lo: qLo, hi: qHi }, [], []) : { hits: [], pruned: [] }, [kd, qLo, qHi]);

  const quad = useMemo(() => mode === "quad" ? buildQuadtree(points) : null, [points, mode]);

  const PAD = 16;
  const PW = 280, PH = 280;
  const xMin = 0, xMax = 10, yMin = 0, yMax = 10;
  const toX = (x) => PAD + ((x - xMin) / (xMax - xMin)) * PW;
  const toY = (y) => PAD + PH - ((y - yMin) / (yMax - yMin)) * PH;
  const pxToX = (px) => Math.max(xMin, Math.min(xMax, (px - PAD) / PW * (xMax - xMin)));
  const pxToY = (py) => Math.max(yMin, Math.min(yMax, yMax - (py - PAD) / PH * (yMax - yMin)));

  function onClick(e) {
    if (!addMode) return;
    const svg = e.currentTarget;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const py = ((e.clientY - r.top) / r.height) * H;
    if (px < PAD || px > PAD + PW || py < PAD || py > PAD + PH) return;
    setPoints([...points, [pxToX(px), pxToY(py)]]);
  }
  function onMove(e) {
    if (!draggingCorner) return;
    const svg = e.currentTarget;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const py = ((e.clientY - r.top) / r.height) * H;
    if (draggingCorner === "lo") setQLo([pxToX(px), pxToY(py)]);
    if (draggingCorner === "hi") setQHi([pxToX(px), pxToY(py)]);
  }

  function renderTreeText(node, indent = "") {
    if (!node) return [];
    const lines = [`${indent}[${node.dim === 0 ? "x" : "y"}=${node.point[node.dim].toFixed(1)}] (${node.point[0]},${node.point[1]})`];
    if (node.left) lines.push(...renderTreeText(node.left, indent + "  "));
    if (node.right) lines.push(...renderTreeText(node.right, indent + "  "));
    return lines;
  }

  function renderQuadtree(node) {
    if (!node) return null;
    return (
      <g>
        <rect x={toX(node.bbox[0][0])} y={toY(node.bbox[1][1])} width={toX(node.bbox[1][0]) - toX(node.bbox[0][0])} height={toY(node.bbox[0][1]) - toY(node.bbox[1][1])}
          fill="none" stroke="var(--line)" strokeWidth="0.4" />
        {node.children?.map((c, i) => <g key={i}>{renderQuadtree(c)}</g>)}
      </g>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button onClick={() => setPoints(INIT.map(p => [...p]))} style={btn(false)}>reset</button>
        <button onClick={() => setAddMode(a => !a)} style={btn(addMode)}>{addMode ? "click canvas to add" : "+ add mode"}</button>
        <button onClick={() => setPoints(points.length > 1 ? points.slice(0, -1) : points)} style={btn(false)}>− point</button>
        <button onClick={() => setMode("kd")} style={btn(mode === "kd")}>k-D tree</button>
        <button onClick={() => setMode("quad")} style={btn(mode === "quad")}>Quadtree</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4, userSelect: "none", cursor: addMode ? "crosshair" : "default", touchAction: "none" }}
        onClick={onClick} onMouseMove={onMove} onMouseUp={() => setDraggingCorner(null)} onMouseLeave={() => setDraggingCorner(null)}>
        <rect x={PAD} y={PAD} width={PW} height={PH} fill="var(--bg-inset)" stroke="var(--line)" />

        {/* splits */}
        {mode === "kd" && splits.map((s, i) => (
          s.dim === 0
            ? <line key={i} x1={toX(s.x)} y1={toY(s.y0)} x2={toX(s.x)} y2={toY(s.y1)} stroke="oklch(0.65 0.16 264)" strokeWidth="0.7" opacity={0.7} />
            : <line key={i} x1={toX(s.x0)} y1={toY(s.y)} x2={toX(s.x1)} y2={toY(s.y)} stroke="oklch(0.6 0.18 22)" strokeWidth="0.7" opacity={0.7} />
        ))}
        {mode === "quad" && renderQuadtree(quad)}

        {/* query box */}
        <rect x={toX(Math.min(qLo[0], qHi[0]))} y={toY(Math.max(qLo[1], qHi[1]))}
          width={Math.abs(toX(qHi[0]) - toX(qLo[0]))} height={Math.abs(toY(qLo[1]) - toY(qHi[1]))}
          fill="oklch(0.7 0.15 60 / 0.12)" stroke="oklch(0.7 0.15 60)" strokeWidth="1.4" strokeDasharray="5 3" />
        <circle cx={toX(qLo[0])} cy={toY(qLo[1])} r={5} fill="oklch(0.7 0.15 60)" style={{ cursor: "move" }} onMouseDown={() => setDraggingCorner("lo")} />
        <circle cx={toX(qHi[0])} cy={toY(qHi[1])} r={5} fill="oklch(0.7 0.15 60)" style={{ cursor: "move" }} onMouseDown={() => setDraggingCorner("hi")} />

        {/* points */}
        {points.map((p, i) => {
          const inside = queryResult.hits.some(h => h[2] === i);
          return (
            <g key={i}>
              <circle cx={toX(p[0])} cy={toY(p[1])} r={5} fill={inside ? "oklch(0.65 0.16 145)" : "oklch(0.65 0.16 264)"} stroke="var(--text)" strokeWidth="0.5" />
              <text x={toX(p[0]) + 6} y={toY(p[1]) - 6} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">{i}</text>
            </g>
          );
        })}

        {/* tree text */}
        <g transform={`translate(${PAD + PW + 16}, ${PAD})`}>
          <text x={0} y={0} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">{mode === "kd" ? "k-D tree" : "Quadtree"} structure</text>
          {mode === "kd" && renderTreeText(kd).slice(0, 14).map((line, i) => (
            <text key={i} x={0} y={14 + i * 12} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-muted)" style={{ whiteSpace: "pre" }}>{line}</text>
          ))}
        </g>
        <text x={PAD + PW + 16} y={PAD + 180} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">range query</text>
        <text x={PAD + PW + 16} y={PAD + 196} fontSize="9.5" fontFamily="var(--font-mono)" fill="oklch(0.65 0.16 145)">hits: {queryResult.hits.length}</text>
        <text x={PAD + PW + 16} y={PAD + 210} fontSize="9.5" fontFamily="var(--font-mono)" fill="oklch(0.65 0.16 264)">pruned subtrees: {queryResult.pruned.length}</text>
        <text x={PAD + PW + 16} y={PAD + 224} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">[{qLo[0].toFixed(1)},{qLo[1].toFixed(1)}] – [{qHi[0].toFixed(1)},{qHi[1].toFixed(1)}]</text>
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        k-D tree: each level splits on alternating axis (root by x, next by y, repeat). Median pivot keeps balance.
        Range query prunes subtrees whose half-plane is entirely outside the query box → average O(√N + R) in 2D.
        Quadtree: each leaf splits into 4 quadrants when capacity exceeded — adaptive to density.
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
