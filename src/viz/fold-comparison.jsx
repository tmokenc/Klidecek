// Compare foldr / foldl / foldl' — thunk buildup, stack risk.
import { useState } from "react";

function foldrTrace(op, z, xs) {
  // foldr (+) 0 [1,2,3] = 1 + (2 + (3 + 0))
  let s = String(z);
  for (let i = xs.length - 1; i >= 0; i--) s = `(${xs[i]} ${op} ${s})`;
  return s;
}
function foldlLazy(op, z, xs) {
  // foldl (+) 0 [1,2,3] = (((0+1)+2)+3) — thunks deeply nested
  let s = String(z);
  for (let i = 0; i < xs.length; i++) s = `((${s}) ${op} ${xs[i]})`;
  return s;
}
function foldlStrict(op, z, xs) {
  // foldl' evaluates accumulator each step
  let acc = z;
  const steps = [`acc = ${z}`];
  for (const x of xs) {
    if (op === "+") acc = acc + x;
    if (op === "*") acc = acc * x;
    if (op === "-") acc = acc - x;
    steps.push(`acc = ${acc}   (po ${x})`);
  }
  return steps;
}

const PRESETS = {
  "sum-small": { op: "+", z: 0, xs: [1, 2, 3] },
  "sum-big":   { op: "+", z: 0, xs: [1, 2, 3, 4, 5, 6, 7, 8] },
  "prod":      { op: "*", z: 1, xs: [1, 2, 3, 4] },
  "minus":     { op: "-", z: 100, xs: [10, 20, 30] },
};

export default function FoldComparison() {
  const [preset, setPreset] = useState("sum-small");
  const { op, z, xs } = PRESETS[preset];
  const rTree = foldrTrace(op, z, xs);
  const lTree = foldlLazy(op, z, xs);
  const lStrict = foldlStrict(op, z, xs);
  const result = lStrict[lStrict.length - 1].split("=")[1].split("(")[0].trim();
  const thunkCount = xs.length; // foldl builds up xs.length thunks before any evaluation

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>preset:</label>
        <select value={preset} onChange={(e) => setPreset(e.target.value)} style={sel}>
          {Object.keys(PRESETS).map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <span style={{ ...lbl, marginLeft: 12 }}>výsledek:</span>
        <code style={{ ...mono, color: "rgb(64,192,87)" }}>{result}</code>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <div style={col}>
          <div style={colHd}>foldr</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>right-associative</div>
          <code style={treeCode}>{rTree}</code>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6 }}>OK pro lazy operátory (||, &&); pro <code style={mono}>(+)</code> staví stack</div>
        </div>
        <div style={col}>
          <div style={colHd}>foldl (lazy)</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>left-associative + thunky</div>
          <code style={treeCode}>{lTree}</code>
          <div style={{ fontSize: 10, color: "rgb(220,80,80)", marginTop: 6 }}>{thunkCount} vnořených thunků → STACK OVERFLOW pro velký seznam!</div>
        </div>
        <div style={col}>
          <div style={colHd}>foldl' (strict)</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>vyhodnocuje acc po kroku</div>
          {lStrict.map((s, i) => (
            <div key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, padding: "1px 0", color: i === lStrict.length - 1 ? "rgb(64,192,87)" : "var(--text)" }}>{s}</div>
          ))}
          <div style={{ fontSize: 10, color: "rgb(64,192,87)", marginTop: 6 }}>0 nahromaděných thunků → O(1) stack, doporučeno</div>
        </div>
      </div>

      <svg viewBox="0 0 540 100" style={{ width: "100%", maxWidth: 600 }}>
        <text x="20" y="20" fontSize="11" fill="var(--text)">stack depth při evaluaci:</text>
        {[
          { lbl: "foldr", v: xs.length, c: "rgb(220,140,80)" },
          { lbl: "foldl", v: xs.length, c: "rgb(220,80,80)" },
          { lbl: "foldl'", v: 1, c: "rgb(64,192,87)" },
        ].map((s, i) => (
          <g key={i}>
            <text x="20" y={45 + i * 18} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">{s.lbl}</text>
            <rect x="80" y={37 + i * 18} width={s.v * 30} height="12" fill={s.c} />
            <text x={84 + s.v * 30} y={47 + i * 18} fontSize="10" fill="var(--text-muted)">{s.v}</text>
          </g>
        ))}
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Default <code style={mono}>foldl</code> v Preludium je <em>lazy</em>; chcete-li sumu, vždy importujte <code style={mono}>foldl'</code> z <code style={mono}>Data.List</code>. <code style={mono}>foldr</code> je správný default pro lazy operátory a nekonečné seznamy.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const col = { background: "var(--bg-inset)", padding: 10, borderRadius: 6, minHeight: 140 };
const colHd = { fontSize: 11, color: "var(--accent)", marginBottom: 4, fontWeight: 600 };
const treeCode = { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)", display: "block", padding: 4, background: "var(--bg-card)", borderRadius: 4, wordBreak: "break-all" };
const mono = { fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" };
