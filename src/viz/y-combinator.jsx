// Y = λf. (λx. f (x x)) (λx. f (x x))
// Visualize Y g = g (Y g) unfolding and concrete factorial recursion.
import { useState } from "react";

const Y_DEF = "Y = λf. (λx. f (x x)) (λx. f (x x))";

function factorialTrace(n, depth) {
  const lines = [];
  const fact = (k, d) => {
    lines.push("  ".repeat(d) + `FACT ${k}`);
    lines.push("  ".repeat(d) + `= FACT_TMPL FACT ${k}`);
    if (k === 0) {
      lines.push("  ".repeat(d) + `= ISZERO 0 → ONE = 1`);
      return 1;
    }
    lines.push("  ".repeat(d) + `= ${k} × FACT ${k - 1}`);
    if (d < depth - 1) {
      const r = fact(k - 1, d + 1);
      lines.push("  ".repeat(d) + `= ${k} × ${r} = ${k * r}`);
      return k * r;
    }
    lines.push("  ".repeat(d) + `… (max depth)`);
    return NaN;
  };
  const result = fact(n, 0);
  return { lines, result };
}

export default function YCombinator() {
  const [n, setN] = useState(4);
  const [showUnfold, setShowUnfold] = useState(true);
  const [steps, setSteps] = useState(3);
  const trace = factorialTrace(n, 8);

  const unfoldLines = [
    "Y g",
    "= (λf. (λx. f (x x)) (λx. f (x x))) g",
    "= (λx. g (x x)) (λx. g (x x))         — β na f",
    "= g ((λx. g (x x)) (λx. g (x x)))     — β na vnější aplikaci",
    "= g (Y g)                              — vnitřní = Y g",
  ];
  const unfoldExpanded = ["Y g = g (Y g)"];
  for (let i = 0; i < steps; i++) {
    const prev = unfoldExpanded[unfoldExpanded.length - 1];
    unfoldExpanded.push(prev.replace("(Y g)", "(g (Y g))"));
  }

  return (
    <div style={ctn}>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)", textAlign: "center" }}>
        {Y_DEF}
      </div>
      <div style={row}>
        <button style={showUnfold ? btnOn : btn} onClick={() => setShowUnfold(true)}>derivace Y g = g (Y g)</button>
        <button style={!showUnfold ? btnOn : btn} onClick={() => setShowUnfold(false)}>factorial via Y</button>
      </div>
      {showUnfold ? (
        <>
          <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
            {unfoldLines.map((l, i) => (
              <div key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 12, padding: "2px 0", color: i === unfoldLines.length - 1 ? "var(--accent)" : "var(--text)" }}>{l}</div>
            ))}
          </div>
          <div style={row}>
            <label style={lbl}>opakované unfolding:</label>
            <input type="range" min="0" max="5" value={steps} onChange={(e) => setSteps(parseInt(e.target.value))} />
            <code style={mono}>{steps}×</code>
          </div>
          <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 11 }}>
            {unfoldExpanded.map((l, i) => <div key={i} style={{ padding: "2px 0", color: i === unfoldExpanded.length - 1 ? "var(--accent)" : "var(--text-muted)" }}>{l}</div>)}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Každé volání <code style={mono}>g</code> "rozbalí" další úroveň. Rekurze je *nekonečný strom volání*, ale lazy evaluace ho expanduje jen tak hluboko, kolik potřebuje.
          </div>
        </>
      ) : (
        <>
          <div style={row}>
            <label style={lbl}>FACT n:</label>
            <input type="range" min="0" max="6" value={n} onChange={(e) => setN(parseInt(e.target.value))} />
            <code style={mono}>n = {n}</code>
            <span style={{ marginLeft: 12, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>= {trace.result}</span>
          </div>
          <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, maxHeight: 320, overflowY: "auto" }}>
            {trace.lines.map((l, i) => (
              <div key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 11, whiteSpace: "pre", padding: "1px 0", color: "var(--text)" }}>{l}</div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            <code style={mono}>FACT = Y (λf n. ISZERO n ONE (MUL n (f (PRED n))))</code> — funkce <code style={mono}>f</code> ve šabloně dostane *sebe samu* skrze Y.
          </div>
        </>
      )}
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
        STLC zakazuje Y — selfaplikace <code style={mono}>x x</code> není typovatelná → STLC je strongly normalizing (každý program terminuje).
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
