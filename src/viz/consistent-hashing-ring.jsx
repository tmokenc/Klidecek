// consistent-hashing-ring — hash ring with movable nodes; show key→node
// assignment via "next-clockwise" rule; add/remove a node and see only a
// fraction of keys migrate. Compare to plain hash mod N.
import { useMemo, useState } from "react";

const W = 540, H = 340;

function fnv(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) >>> 0) + ((h << 4) >>> 0) + ((h << 7) >>> 0) + ((h << 8) >>> 0) + ((h << 24) >>> 0)) >>> 0;
  }
  return h;
}

const INIT_NODES = ["NodeA", "NodeB", "NodeC", "NodeD"];
const INIT_KEYS = ["user:42", "cart:7", "session:abc", "img:99", "log:31", "post:88", "blob:5", "vid:2", "cmt:15", "trk:21"];

function ringPos(label, vnodeIdx = 0, M = 360) {
  // hash to 0..M (degrees on ring)
  const h = fnv(label + "::vnode" + vnodeIdx);
  return (h % 1000000) / 1000000 * M;
}

function assignKeys(keys, nodes, vnodes) {
  // nodes: array of {name}, vnodes: replicas per node
  const ringPoints = [];
  for (const n of nodes) {
    for (let v = 0; v < vnodes; v++) {
      ringPoints.push({ pos: ringPos(n, v), node: n });
    }
  }
  ringPoints.sort((a, b) => a.pos - b.pos);
  function next(p) {
    for (const rp of ringPoints) if (rp.pos >= p) return rp;
    return ringPoints[0]; // wrap
  }
  return keys.map(k => {
    const p = ringPos(k);
    const owner = next(p);
    return { k, pos: p, node: owner.node };
  });
}

function assignModN(keys, nodes) {
  return keys.map(k => ({ k, node: nodes[fnv(k) % nodes.length] }));
}

export default function ConsistentHashingRing() {
  const [nodes, setNodes] = useState(INIT_NODES.slice(0, 3));
  const [keys] = useState(INIT_KEYS);
  const [vnodes, setVnodes] = useState(1);
  const [showModN, setShowModN] = useState(false);
  const [prevNodes, setPrevNodes] = useState(INIT_NODES.slice(0, 3));

  // current and previous assignments to highlight migrations
  const current = useMemo(() => {
    const cn = assignKeys(keys, nodes.map(n => ({ name: n })).map(n => n.name), vnodes);
    return cn;
  }, [keys, nodes, vnodes]);
  const prev = useMemo(() => assignKeys(keys, prevNodes, vnodes), [keys, prevNodes, vnodes]);

  function addNode() {
    if (nodes.length >= INIT_NODES.length) return;
    setPrevNodes(nodes);
    setNodes([...nodes, INIT_NODES[nodes.length]]);
  }
  function removeNode() {
    if (nodes.length <= 1) return;
    setPrevNodes(nodes);
    setNodes(nodes.slice(0, -1));
  }
  function reset() {
    const start = INIT_NODES.slice(0, 3);
    setPrevNodes(start);
    setNodes(start);
  }

  const migrations = current.filter((c, i) => prev[i] && c.node !== prev[i].node);

  const cx = 160, cy = H / 2;
  const radius = 110;
  const toRing = (pos) => {
    const a = pos / 360 * 2 * Math.PI - Math.PI / 2;
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a), a };
  };

  const nodeColors = {
    NodeA: "oklch(0.65 0.16 264)",
    NodeB: "oklch(0.65 0.16 145)",
    NodeC: "oklch(0.7 0.15 22)",
    NodeD: "oklch(0.7 0.15 320)",
  };

  const modAssign = assignModN(keys, nodes);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 11 }}>
        <button onClick={addNode} style={btn(false)}>+ node</button>
        <button onClick={removeNode} style={btn(false)}>− node</button>
        <button onClick={reset} style={btn(false)}>reset</button>
        <span>vnodes/node</span>
        <input type="range" min={1} max={20} value={vnodes} onChange={(e) => setVnodes(+e.target.value)} />
        <span>{vnodes}</span>
        <button onClick={() => setShowModN(s => !s)} style={btn(showModN)}>compare hash mod N</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {/* Ring circle */}
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--line-strong)" strokeWidth="1" />
        {/* hash position labels */}
        {[0, 90, 180, 270].map((deg) => {
          const p = toRing(deg);
          return <text key={deg} x={p.x + (deg === 0 ? -4 : deg === 180 ? 4 : 0)} y={p.y + (deg === 90 ? 14 : deg === 270 ? -6 : 4)} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)" textAnchor={deg === 0 ? "end" : deg === 180 ? "start" : "middle"}>{deg}°</text>;
        })}

        {/* nodes (+ vnodes) on ring */}
        {nodes.flatMap(n => Array.from({ length: vnodes }, (_, v) => v).map(v => {
          const pos = ringPos(n, v);
          const p = toRing(pos);
          return (
            <g key={`${n}-${v}`}>
              <line x1={cx + radius * Math.cos(p.a)} y1={cy + radius * Math.sin(p.a)}
                x2={cx + (radius + 6) * Math.cos(p.a)} y2={cy + (radius + 6) * Math.sin(p.a)}
                stroke={nodeColors[n]} strokeWidth="2" />
              {v === 0 && (
                <>
                  <circle cx={p.x} cy={p.y} r={7} fill={nodeColors[n]} stroke="var(--text)" strokeWidth="0.6" />
                  <text x={cx + (radius + 18) * Math.cos(p.a)} y={cy + (radius + 18) * Math.sin(p.a) + 3} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill={nodeColors[n]}>{n}</text>
                </>
              )}
            </g>
          );
        }))}

        {/* keys */}
        {current.map((kk, i) => {
          const p = toRing(kk.pos);
          const owner = toRing(ringPoints(nodes, vnodes).find(rp => rp.pos >= kk.pos)?.pos ?? ringPoints(nodes, vnodes)[0].pos);
          const migrated = prev[i] && kk.node !== prev[i].node;
          return (
            <g key={kk.k}>
              <line x1={p.x} y1={p.y} x2={owner.x} y2={owner.y} stroke={nodeColors[kk.node]} strokeWidth="0.4" strokeDasharray="2 2" opacity={0.5} />
              <circle cx={p.x} cy={p.y} r={migrated ? 5 : 3.5} fill={nodeColors[kk.node]} stroke={migrated ? "oklch(0.6 0.18 22)" : "var(--text)"} strokeWidth={migrated ? 1.5 : 0.4} />
            </g>
          );
        })}

        {/* tables on the right */}
        <g transform={`translate(330, 16)`}>
          <text x={0} y={0} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">consistent hash</text>
          {current.map((c, i) => (
            <g key={c.k} transform={`translate(0, ${12 + i * 13})`}>
              <text x={0} y={0} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">{c.k}</text>
              <text x={70} y={0} fontSize="9" fontFamily="var(--font-mono)" fill={nodeColors[c.node]}>→ {c.node.replace("Node", "")}</text>
              {prev[i] && prev[i].node !== c.node && (
                <text x={100} y={0} fontSize="9" fontFamily="var(--font-mono)" fill="oklch(0.6 0.18 22)">migr</text>
              )}
            </g>
          ))}
          {showModN && (
            <g transform={`translate(150, 0)`}>
              <text x={0} y={0} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">hash mod {nodes.length}</text>
              {modAssign.map((c, i) => (
                <g key={c.k} transform={`translate(0, ${12 + i * 13})`}>
                  <text x={0} y={0} fontSize="9" fontFamily="var(--font-mono)" fill={nodeColors[c.node]}>{c.k} → {c.node.replace("Node", "")}</text>
                </g>
              ))}
            </g>
          )}
        </g>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, fontFamily: "var(--font-mono)", fontSize: 11 }}>
        <span>nodes = {nodes.length}</span>
        <span>keys = {keys.length}</span>
        <span style={{ color: migrations.length ? "oklch(0.6 0.18 22)" : "var(--text-muted)" }}>migrated since last change: {migrations.length} / {keys.length}</span>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        Each key lives at the first node clockwise. Add/remove a node — only ~1/N of keys move (only those whose successor changed).
        Plain hash mod N would reshuffle nearly every key when N changes. Virtual nodes (slider) smooth out load imbalance.
      </div>
    </div>
  );
}

function ringPoints(nodes, vnodes) {
  const pts = [];
  for (const n of nodes) {
    for (let v = 0; v < vnodes; v++) pts.push({ pos: ringPos(n, v), node: n });
  }
  return pts.sort((a, b) => a.pos - b.pos);
}

function btn(active) {
  return {
    fontFamily: "var(--font-mono)", fontSize: 11, padding: "2px 8px",
    background: active ? "var(--accent)" : "var(--bg-inset)",
    color: active ? "var(--bg-card)" : "var(--text)",
    border: "1px solid var(--line-strong)", borderRadius: 3, cursor: "pointer",
  };
}
