// Rust iterator chain — pulled element-by-element, no intermediate allocations.
import { useState } from "react";

export default function RustIteratorChain() {
  const [step, setStep] = useState(0);
  const input = [1, 2, 3, 4, 5, 6, 7, 8];
  // chain: iter -> filter(>2) -> map(*x) -> take(3) -> collect
  const trace = [];
  let taken = 0;
  for (let i = 0; i < input.length && taken < 3; i++) {
    const x = input[i];
    trace.push({ stage: "iter", v: x, sink: false });
    if (x > 2) {
      trace.push({ stage: "filter passed", v: x, sink: false });
      const sq = x * x;
      trace.push({ stage: "map (*x*x)", v: sq, sink: false });
      trace.push({ stage: "take", v: sq, sink: true });
      taken++;
    } else {
      trace.push({ stage: "filter rejected", v: x, sink: false, skip: true });
    }
  }
  trace.push({ stage: "collect → Vec", v: input.filter((x) => x > 2).map((x) => x * x).slice(0, 3).join(", "), sink: true, done: true });

  const cur = trace[Math.min(step, trace.length - 1)];

  return (
    <div style={ctn}>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, textAlign: "center" }}>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>
          v.iter().filter(|&amp;&amp;x| x &gt; 2).map(|x| x * x).take(3).collect::&lt;Vec&lt;_&gt;&gt;()
        </code>
      </div>

      <div style={row}>
        <button style={btn} disabled={step === 0} onClick={() => setStep(step - 1)}>‹</button>
        <span style={{ ...lbl, marginLeft: 8 }}>krok {step + 1} / {trace.length}</span>
        <button style={btn} disabled={step >= trace.length - 1} onClick={() => setStep(step + 1)}>›</button>
        <button style={{ ...btn, marginLeft: 12 }} onClick={() => setStep(trace.length - 1)}>jdi na collect</button>
      </div>

      <svg viewBox="0 0 540 220" style={{ width: "100%", maxWidth: 600, background: "var(--bg-inset)", borderRadius: 6 }}>
        <defs>
          <marker id="aRI" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)" />
          </marker>
        </defs>
        {[
          { x: 20,  w: 90, lbl: ".iter()", desc: "yields &i32" },
          { x: 120, w: 90, lbl: ".filter", desc: "|&&x| x > 2" },
          { x: 220, w: 90, lbl: ".map",    desc: "|x| x * x" },
          { x: 320, w: 90, lbl: ".take(3)", desc: "max 3 prvky" },
          { x: 420, w: 100,lbl: ".collect()", desc: "do Vec<_>" },
        ].map((s, i, arr) => {
          const active = cur.stage.toLowerCase().includes(s.lbl.replace(/[.()0-9]/g, "").trim().toLowerCase()) || (i === 4 && cur.done);
          return (
            <g key={i}>
              <rect x={s.x} y="50" width={s.w} height="60" rx="6"
                    fill={active ? "var(--accent)" : "var(--bg-card)"}
                    stroke="var(--accent)" strokeWidth={active ? 2 : 1} />
              <text x={s.x + s.w / 2} y="75" fontSize="11" textAnchor="middle" fill={active ? "var(--bg-card)" : "var(--text)"} fontFamily="var(--font-mono)">{s.lbl}</text>
              <text x={s.x + s.w / 2} y="92" fontSize="9" textAnchor="middle" fill={active ? "var(--bg-card)" : "var(--text-muted)"} fontFamily="var(--font-mono)">{s.desc}</text>
              {i < arr.length - 1 && <line x1={s.x + s.w} y1="80" x2={arr[i + 1].x} y2="80" stroke="var(--accent)" strokeWidth="1.2" markerEnd="url(#aRI)" />}
            </g>
          );
        })}
        <text x="270" y="140" fontSize="11" textAnchor="middle" fill="var(--text-muted)">aktuální hodnota proudu:</text>
        <text x="270" y="165" fontSize="20" textAnchor="middle" fill={cur.skip ? "rgb(220,80,80)" : cur.done ? "rgb(64,192,87)" : "var(--accent)"} fontFamily="var(--font-mono)">
          {cur.skip ? "↳ DROPPED" : cur.done ? `[${cur.v}]` : cur.v}
        </text>
        <text x="270" y="195" fontSize="10" textAnchor="middle" fill="var(--text-muted)">{cur.stage}</text>
      </svg>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>klíčové: žádný mezikrok nealokuje vector!</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Každá metoda (.filter, .map, .take) vrátí <strong>nový iterator type</strong> — když .collect pulluje jeden prvek, projde celou pipeline. Compiler dělá <em>monomorfizaci</em> + <em>inlining</em> = ekvivalentní s ručním for-loopem.</div>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)", display: "block", whiteSpace: "pre" }}>{
`// Equivalentní (ale verboznější) imperativně:
let mut out = Vec::new();
for x in v.iter() {
    if *x > 2 {
        out.push(x * x);
        if out.len() == 3 { break; }
    }
}`
        }</code>
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
