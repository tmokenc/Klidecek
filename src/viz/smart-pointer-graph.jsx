// Smart pointers — Box, Rc, Arc, RefCell — graphs with refcounts.
import { useState } from "react";

const SCENARIOS = {
  Box: {
    title: "Box<T> — heap allocation",
    code: `let b = Box::new(42);
println!("{}", *b);`,
    nodes: [
      { id: "stack", lbl: "stack: b", x: 60, y: 80, color: "var(--accent)" },
      { id: "heap", lbl: "heap: 42", x: 250, y: 80, color: "rgb(64,140,220)" },
    ],
    edges: [{ from: "stack", to: "heap", lbl: "Box" }],
    note: "Box je single-owner unique pointer. Drop uvolní heap.",
  },
  Rc: {
    title: "Rc<T> — shared ownership (single-thread)",
    code: `let a = Rc::new(String::from("shared"));
let b = Rc::clone(&a);
let c = Rc::clone(&a);
// strong_count = 3`,
    nodes: [
      { id: "a", lbl: "a", x: 50, y: 50, color: "var(--accent)" },
      { id: "b", lbl: "b", x: 50, y: 110, color: "var(--accent)" },
      { id: "c", lbl: "c", x: 50, y: 170, color: "var(--accent)" },
      { id: "heap", lbl: "heap: \"shared\"\nrc=3", x: 300, y: 110, color: "rgb(64,192,87)" },
    ],
    edges: [
      { from: "a", to: "heap" },
      { from: "b", to: "heap" },
      { from: "c", to: "heap" },
    ],
    note: "Heap data se uvolní jen když poslední Rc dropne (rc → 0). Není thread-safe.",
  },
  Arc: {
    title: "Arc<T> — atomic reference count (multi-thread)",
    code: `let a = Arc::new(data);
thread::spawn({
    let a = Arc::clone(&a);
    move || println!("{:?}", a)
});`,
    nodes: [
      { id: "main", lbl: "main thread", x: 40, y: 50, color: "var(--accent)" },
      { id: "t1", lbl: "thread 1", x: 40, y: 130, color: "var(--accent)" },
      { id: "t2", lbl: "thread 2", x: 40, y: 210, color: "var(--accent)" },
      { id: "heap", lbl: "Arc: data\nrc=3 (atomic)", x: 320, y: 130, color: "rgb(64,192,87)" },
    ],
    edges: [
      { from: "main", to: "heap" },
      { from: "t1", to: "heap" },
      { from: "t2", to: "heap" },
    ],
    note: "Arc používá atomic ops pro refcount → thread-safe ale o trochu pomalejší než Rc.",
  },
  RefCell: {
    title: "RefCell<T> — interior mutability",
    code: `let cell = RefCell::new(5);
*cell.borrow_mut() += 10;
// kompile-time: cell má jen &; runtime check`,
    nodes: [
      { id: "ref", lbl: "&cell\n(immutable)", x: 60, y: 90, color: "rgb(64,192,87)" },
      { id: "cell", lbl: "RefCell<i32>\nvalue: 15\nborrows: 0", x: 300, y: 90, color: "rgb(220,140,80)" },
    ],
    edges: [{ from: "ref", to: "cell", lbl: "borrow_mut()" }],
    note: "Skutečná mutace skrze immutable &; check borrow rules RUNTIME (panika při porušení).",
  },
  "Rc+RefCell": {
    title: "Rc<RefCell<T>> — shared mutable",
    code: `let shared = Rc::new(RefCell::new(0));
let a = Rc::clone(&shared);
let b = Rc::clone(&shared);
*a.borrow_mut() += 1;`,
    nodes: [
      { id: "a", lbl: "a: Rc", x: 50, y: 60, color: "var(--accent)" },
      { id: "b", lbl: "b: Rc", x: 50, y: 140, color: "var(--accent)" },
      { id: "rc", lbl: "Rc-heap\nrc=2", x: 200, y: 100, color: "rgb(64,192,87)" },
      { id: "cell", lbl: "RefCell\nvalue=1", x: 400, y: 100, color: "rgb(220,140,80)" },
    ],
    edges: [
      { from: "a", to: "rc" },
      { from: "b", to: "rc" },
      { from: "rc", to: "cell", lbl: "contains" },
    ],
    note: "Klasický pattern pro graph/DAG struktury s sdílenou mutací (např. doubly linked list).",
  },
};

export default function SmartPointerGraph() {
  const [s, setS] = useState("Box");
  const cur = SCENARIOS[s];
  const nodeMap = Object.fromEntries(cur.nodes.map((n) => [n.id, n]));

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>smart pointer:</label>
        {Object.keys(SCENARIOS).map((k) => (
          <button key={k} style={s === k ? btnOn : btn} onClick={() => setS(k)}>{k}</button>
        ))}
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <pre style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)", margin: 0, whiteSpace: "pre" }}>{cur.code}</pre>
      </div>

      <svg viewBox="0 0 540 260" style={{ width: "100%", maxWidth: 600, background: "var(--bg-inset)", borderRadius: 6 }}>
        <defs>
          <marker id="aSP" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)" />
          </marker>
        </defs>
        {cur.edges.map((e, i) => {
          const a = nodeMap[e.from], b = nodeMap[e.to];
          return (
            <g key={i}>
              <line x1={a.x + 50} y1={a.y} x2={b.x - 50} y2={b.y} stroke="var(--accent)" strokeWidth="1.3" markerEnd="url(#aSP)" />
              {e.lbl && <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 4} fontSize="10" textAnchor="middle" fill="var(--accent)">{e.lbl}</text>}
            </g>
          );
        })}
        {cur.nodes.map((n) => (
          <g key={n.id}>
            <rect x={n.x - 50} y={n.y - 22} width="100" height="44" rx="6" fill="var(--bg-card)" stroke={n.color} strokeWidth="1.5" />
            <text x={n.x} y={n.y + 3} fontSize="10.5" textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)">
              {n.lbl.split("\n").map((l, i) => <tspan key={i} x={n.x} dy={i === 0 ? 0 : 11}>{l}</tspan>)}
            </text>
          </g>
        ))}
      </svg>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{cur.note}</div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Volba: <code style={mono}>Box</code> = heap, single owner. <code style={mono}>Rc</code> = sdílení v 1 vláknu. <code style={mono}>Arc</code> = sdílení napříč vlákny. <code style={mono}>RefCell</code> = mutation skrze &amp; (runtime check). <code style={mono}>Rc&lt;RefCell&lt;T&gt;&gt;</code> = sdílená mutace.
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
