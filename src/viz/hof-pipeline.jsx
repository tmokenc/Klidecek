// HOF pipeline — sum . map (^2) . filter even . take n; track actual function calls.
import { useState } from "react";

export default function HofPipeline() {
  const [n, setN] = useState(6);
  const [consumer, setConsumer] = useState("sum");
  // Pipeline: input [1..100], take n, filter even, map (^2), then consumer
  const input = Array.from({ length: 100 }, (_, i) => i + 1);

  // Simulate lazy pull: how many elements need to be evaluated?
  let toProduce = n; // take consumes up to n
  if (consumer === "head") toProduce = 1;
  if (consumer === "sum" || consumer === "list") toProduce = n;

  const takeN = input.slice(0, n);
  const filtered = takeN.filter((x) => x % 2 === 0);
  const mapped = filtered.map((x) => x * x);
  let result;
  if (consumer === "sum") result = mapped.reduce((a, b) => a + b, 0);
  else if (consumer === "head") result = mapped[0] ?? "Nothing";
  else if (consumer === "list") result = `[${mapped.join(", ")}]`;

  return (
    <div style={ctn}>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, textAlign: "center" }}>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>
          {consumer} . map (^2) . filter even . take {n}  $  [1..100]
        </code>
      </div>
      <div style={row}>
        <label style={lbl}>take:</label>
        <input type="range" min="0" max="20" value={n} onChange={(e) => setN(parseInt(e.target.value))} />
        <code style={mono}>n = {n}</code>
        <span style={{ ...lbl, marginLeft: 12 }}>consumer:</span>
        {["sum", "head", "list"].map((c) => (
          <button key={c} style={consumer === c ? btnOn : btn} onClick={() => setConsumer(c)}>{c}</button>
        ))}
      </div>

      <svg viewBox="0 0 580 220" style={{ width: "100%", maxWidth: 600, background: "var(--bg-inset)", borderRadius: 6 }}>
        <defs>
          <marker id="aHP" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)" />
          </marker>
        </defs>
        {[
          { x: 30, lbl: "input", val: "[1..∞]", desc: "lazy stream" },
          { x: 130, lbl: `take ${n}`, val: `[${takeN.join(",")}]`, desc: `${takeN.length} prvků` },
          { x: 240, lbl: "filter even", val: `[${filtered.join(",")}]`, desc: `${filtered.length} prošlo` },
          { x: 360, lbl: "map (^2)", val: `[${mapped.join(",")}]`, desc: `${mapped.length} mapováno` },
          { x: 470, lbl: consumer, val: String(result), desc: "výsledek", color: "rgb(64,192,87)" },
        ].map((s, i, arr) => (
          <g key={i}>
            <rect x={s.x} y="60" width="90" height="60" rx="6" fill="var(--bg-card)" stroke={s.color ?? "var(--accent)"} strokeWidth="1.3" />
            <text x={s.x + 45} y="80" fontSize="11" textAnchor="middle" fill="var(--text)">{s.lbl}</text>
            <text x={s.x + 45} y="98" fontSize="9" textAnchor="middle" fill={s.color ?? "var(--accent)"} fontFamily="var(--font-mono)">{s.val.slice(0, 16)}</text>
            <text x={s.x + 45} y="112" fontSize="8.5" textAnchor="middle" fill="var(--text-muted)">{s.desc}</text>
            {i < arr.length - 1 && <line x1={s.x + 90} y1="90" x2={arr[i + 1].x} y2="90" stroke="var(--accent)" strokeWidth="1.2" markerEnd="url(#aHP)" />}
          </g>
        ))}
        <text x="290" y="170" fontSize="10" textAnchor="middle" fill="var(--text-muted)">žádný mezikrok nealokuje celý seznam — laziness pulluje element po elementu</text>
        <text x="290" y="190" fontSize="10" textAnchor="middle" fill="var(--text-muted)">consumer rozhoduje, kolik prvků se skutečně vyhodnotí (sum = vše, head = první)</text>
      </svg>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>výsledek:</div>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "rgb(64,192,87)" }}>{String(result)}</code>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Composition (<code style={mono}>.</code>) řetězí čisté funkce. <code style={mono}>$</code> aplikuje na argument. Laziness zaručí, že pipeline neevaluuje víc, než consumer vyžaduje — kritické pro <code style={mono}>head . map expensive . [1..]</code>.
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
