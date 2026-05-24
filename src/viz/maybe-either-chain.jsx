// Maybe/Either chain — first failure short-circuits.
import { useState } from "react";

const STEPS = [
  { lbl: "lookup name",  fn: 'lookupName' },
  { lbl: "lookup age",   fn: 'lookupAge' },
  { lbl: "validate ≥ 0", fn: 'validate'   },
  { lbl: "double",        fn: 'double'     },
];

export default function MaybeEitherChain() {
  const [mode, setMode] = useState("Maybe");
  const [failAt, setFailAt] = useState(-1); // -1 = no failure

  const results = STEPS.map((s, i) => {
    if (failAt === i) return mode === "Maybe" ? "Nothing" : `Left "${s.lbl} failed"`;
    if (failAt !== -1 && i > failAt) return "(skip)";
    return mode === "Maybe" ? `Just <ok>` : `Right <ok>`;
  });
  const final = failAt === -1
    ? (mode === "Maybe" ? "Just 60" : "Right 60")
    : (mode === "Maybe" ? "Nothing" : `Left "${STEPS[failAt].lbl} failed"`);

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>monad:</label>
        {["Maybe", "Either"].map((m) => (
          <button key={m} style={mode === m ? btnOn : btn} onClick={() => setMode(m)}>{m}</button>
        ))}
        <span style={{ ...lbl, marginLeft: 12 }}>fail at step:</span>
        <select value={failAt} onChange={(e) => setFailAt(parseInt(e.target.value))} style={sel}>
          <option value={-1}>none (all succeed)</option>
          {STEPS.map((s, i) => <option key={i} value={i}>step {i + 1}: {s.lbl}</option>)}
        </select>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)", whiteSpace: "pre", display: "block" }}>{
`do
  name <- lookupName key   -- ${mode === "Maybe" ? "Maybe String" : "Either String String"}
  age  <- lookupAge name
  ok   <- validate age
  return (double ok)`
        }</code>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {STEPS.map((s, i) => {
          const failed = failAt === i;
          const skipped = failAt !== -1 && i > failAt;
          const passed = !failed && !skipped;
          return (
            <div key={i} style={{
              padding: 10, borderRadius: 6,
              background: failed ? "rgba(220,80,80,0.18)" : skipped ? "var(--bg-inset)" : "rgba(64,192,87,0.18)",
              border: `1px solid ${failed ? "rgb(220,80,80)" : skipped ? "var(--line)" : "rgb(64,192,87)"}`,
              opacity: skipped ? 0.5 : 1,
            }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>krok {i + 1}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)" }}>{s.fn}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: failed ? "rgb(220,80,80)" : skipped ? "var(--text-muted)" : "rgb(64,192,87)", marginTop: 6 }}>
                {results[i]}
              </div>
              {skipped && <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4, fontStyle: "italic" }}>short-circuit</div>}
            </div>
          );
        })}
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>final výsledek:</div>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: failAt === -1 ? "rgb(64,192,87)" : "rgb(220,80,80)" }}>{final}</code>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        <strong>Maybe</strong> propagace Nothing — žádná informace o tom, kde to selhalo. <strong>Either</strong> nese error zprávu napříč celým řetězcem, takže chyba zůstává <em>identifikovatelná</em>. Oba implementují monad zákony, takže <code style={mono}>do</code> notation funguje stejně.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const btnOn = { ...btn, background: "var(--accent)", color: "var(--bg-card)", borderColor: "var(--accent)" };
const mono = { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" };
