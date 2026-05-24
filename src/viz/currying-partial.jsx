// Currying + partial application visualization.
import { useState } from "react";

export default function CurryingPartial() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);
  const [c, setC] = useState(4);
  const [stage, setStage] = useState(0); // 0..3 — how many args applied

  const stages = [
    { type: "Int -> Int -> Int -> Int",       expr: "add3",         val: "<funkce 3 arg>" },
    { type: "Int -> Int -> Int",              expr: `add3 ${a}`,    val: "<funkce 2 arg>" },
    { type: "Int -> Int",                     expr: `add3 ${a} ${b}`,    val: "<funkce 1 arg>" },
    { type: "Int",                            expr: `add3 ${a} ${b} ${c}`,    val: String(a + b + c) },
  ];
  const cur = stages[stage];

  return (
    <div style={ctn}>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, textAlign: "center" }}>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>
          add3 :: Int -&gt; Int -&gt; Int -&gt; Int  ≡  Int -&gt; (Int -&gt; (Int -&gt; Int))
        </code>
      </div>

      <div style={row}>
        <label style={lbl}>a:</label>
        <input type="range" min="0" max="9" value={a} onChange={(e) => setA(parseInt(e.target.value))} />
        <code style={mono}>{a}</code>
        <label style={{ ...lbl, marginLeft: 8 }}>b:</label>
        <input type="range" min="0" max="9" value={b} onChange={(e) => setB(parseInt(e.target.value))} />
        <code style={mono}>{b}</code>
        <label style={{ ...lbl, marginLeft: 8 }}>c:</label>
        <input type="range" min="0" max="9" value={c} onChange={(e) => setC(parseInt(e.target.value))} />
        <code style={mono}>{c}</code>
      </div>

      <div style={row}>
        <label style={lbl}>aplikováno:</label>
        {["0 arg", "1 arg", "2 arg", "3 arg"].map((s, i) => (
          <button key={i} style={stage === i ? btnOn : btn} onClick={() => setStage(i)}>{s}</button>
        ))}
      </div>

      <svg viewBox="0 0 540 200" style={{ width: "100%", maxWidth: 600, background: "var(--bg-inset)", borderRadius: 6 }}>
        {[0, 1, 2, 3].map((i) => {
          const filled = i < stage;
          const x = 30 + i * 130;
          return (
            <g key={i}>
              <rect x={x} y="60" width="100" height="70" rx="8"
                    fill={filled ? "rgb(64,192,87)" : i === stage ? "var(--bg-card)" : "var(--bg-inset)"}
                    stroke={i <= stage ? "var(--accent)" : "var(--text-muted)"} strokeWidth={i === stage ? 2 : 1} />
              <text x={x + 50} y="86" fontSize="11" textAnchor="middle" fill={filled ? "var(--bg-card)" : "var(--text)"}>
                {i === 0 ? "add3" : i === 1 ? `(add3 ${a})` : i === 2 ? `(add3 ${a} ${b})` : `add3 ${a} ${b} ${c}`}
              </text>
              <text x={x + 50} y="105" fontSize="9.5" textAnchor="middle" fill={filled ? "var(--bg-card)" : "var(--accent)"} fontFamily="var(--font-mono)">
                {i === 3 ? `= ${a + b + c}` : "→ funkce"}
              </text>
            </g>
          );
        })}
        <text x="270" y="155" fontSize="11" textAnchor="middle" fill="var(--text-muted)">každá aplikace odebere 1 argument, vrátí funkci s o 1 méně parametry</text>
        <text x="270" y="175" fontSize="10" textAnchor="middle" fill="var(--text-muted)">partial application = zastavit kdykoli, dostat novou funkci jako hodnotu</text>
      </svg>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>aktuální typ:</div>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>{cur.expr} :: {cur.type}</code>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>hodnota: <code style={{ fontFamily: "var(--font-mono)", color: cur.val.startsWith("&lt;") ? "var(--text-muted)" : "rgb(64,192,87)" }}>{cur.val}</code></div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Curried = všechny funkce 1-ární. <code style={mono}>add3 2</code> není error — je to <em>nová funkce</em>. Operator sections: <code style={mono}>(+5)</code>, <code style={mono}>(&gt;10)</code> jsou partial applications.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const btnOn = { ...btn, background: "var(--accent)", color: "var(--bg-card)", borderColor: "var(--accent)" };
const mono = { fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" };
