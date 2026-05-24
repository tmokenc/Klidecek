// Prolog unification — step through recursive matching, substitutions.
import { useState } from "react";

const EXAMPLES = {
  "simple": {
    t1: "foo(X, b)",
    t2: "foo(a, Y)",
    steps: [
      { msg: "shoda funktoru foo/2, projdi argumenty",      subs: [] },
      { msg: "arg 1: X = a — proměnná × konstanta",         subs: ["X = a"] },
      { msg: "arg 2: b = Y — konstanta × proměnná",          subs: ["X = a", "Y = b"] },
      { msg: "✓ unifikace úspěšná",                         subs: ["X = a", "Y = b"] },
    ],
    ok: true,
  },
  "nested": {
    t1: "f(X, bar(Y, Z))",
    t2: "f(a, bar(b, c))",
    steps: [
      { msg: "funktor f/2, projdi args",                                       subs: [] },
      { msg: "arg 1: X = a",                                                   subs: ["X = a"] },
      { msg: "arg 2: bar(Y,Z) = bar(b,c) — rekurzivně",                       subs: ["X = a"] },
      { msg: "  funktor bar/2, projdi args",                                   subs: ["X = a"] },
      { msg: "  arg 1: Y = b",                                                  subs: ["X = a", "Y = b"] },
      { msg: "  arg 2: Z = c",                                                  subs: ["X = a", "Y = b", "Z = c"] },
      { msg: "✓ unifikace úspěšná",                                            subs: ["X = a", "Y = b", "Z = c"] },
    ],
    ok: true,
  },
  "same-var": {
    t1: "foo(X, X)",
    t2: "foo(a, b)",
    steps: [
      { msg: "funktor foo/2",                                                  subs: [] },
      { msg: "arg 1: X = a",                                                    subs: ["X = a"] },
      { msg: "arg 2: X = b — ale X už je vázáno na a",                          subs: ["X = a"] },
      { msg: "✗ konflikt: a ≠ b — fail",                                       subs: ["X = a"] },
    ],
    ok: false,
  },
  "different-functor": {
    t1: "foo(X)",
    t2: "bar(X)",
    steps: [
      { msg: "porovnej funktory foo/1 vs bar/1 — různé",                       subs: [] },
      { msg: "✗ fail",                                                          subs: [] },
    ],
    ok: false,
  },
  "occurs": {
    t1: "X",
    t2: "f(X)",
    steps: [
      { msg: "X je proměnná → bind X = f(X)?",                                  subs: [] },
      { msg: "(klasický algoritmus, bez occurs check) X = f(X)",                subs: ["X = f(X)"] },
      { msg: "⚠ infinite term! správný occurs check by selhal",                 subs: ["X = f(X)"] },
    ],
    ok: false,
  },
  "list": {
    t1: "[H | T]",
    t2: "[1, 2, 3]",
    steps: [
      { msg: "list cons . / 2",                                                 subs: [] },
      { msg: "H = 1, T = [2, 3]",                                               subs: ["H = 1", "T = [2,3]"] },
      { msg: "✓ unifikace úspěšná",                                             subs: ["H = 1", "T = [2,3]"] },
    ],
    ok: true,
  },
};

export default function PrologUnifyTree() {
  const [ex, setEx] = useState("nested");
  const [step, setStep] = useState(0);
  const cur = EXAMPLES[ex];

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>příklad:</label>
        <select value={ex} onChange={(e) => { setEx(e.target.value); setStep(0); }} style={sel}>
          {Object.entries(EXAMPLES).map(([k, v]) => <option key={k} value={k}>{v.t1} = {v.t2}</option>)}
        </select>
      </div>
      <div style={{ background: "var(--bg-inset)", padding: 12, borderRadius: 6, textAlign: "center" }}>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--accent)" }}>
          {cur.t1}  =  {cur.t2}
        </code>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
        <div style={col}>
          <div style={colHd}>kroky</div>
          {cur.steps.slice(0, step + 1).map((s, i) => (
            <div key={i} style={{ ...lineSt, color: i === step ? "var(--accent)" : "var(--text)" }}>
              {s.msg}
            </div>
          ))}
        </div>
        <div style={col}>
          <div style={colHd}>substituce σ</div>
          {cur.steps[step].subs.length === 0
            ? <div style={{ ...lineSt, color: "var(--text-muted)" }}>(prázdná)</div>
            : cur.steps[step].subs.map((s, i) => (
              <div key={i} style={{ ...lineSt, color: "rgb(64,192,87)" }}>{s}</div>
            ))}
        </div>
      </div>

      <div style={row}>
        <button style={btn} disabled={step === 0} onClick={() => setStep(step - 1)}>‹ undo</button>
        <span style={{ ...lbl, marginLeft: 8 }}>krok {step + 1} / {cur.steps.length}</span>
        <button style={btn} disabled={step === cur.steps.length - 1} onClick={() => setStep(step + 1)}>další ›</button>
      </div>

      {step === cur.steps.length - 1 && (
        <div style={{ background: cur.ok ? "rgba(64,192,87,0.18)" : "rgba(220,80,80,0.18)", padding: 10, borderRadius: 6, border: `1px solid ${cur.ok ? "rgb(64,192,87)" : "rgb(220,80,80)"}` }}>
          <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: cur.ok ? "rgb(64,192,87)" : "rgb(220,80,80)" }}>
            {cur.ok ? "✓ unify succeeds with σ" : "✗ unify fails"}
          </code>
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Unifikace = nahrazuje pattern matching + assignment + equality. Klasický algoritmus neprovádí occurs check (performance) — proto SWI má <code style={mono}>unify_with_occurs_check/2</code>.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const col = { background: "var(--bg-inset)", padding: 10, borderRadius: 6 };
const colHd = { fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 };
const lineSt = { fontFamily: "var(--font-mono)", fontSize: 11, padding: "2px 0" };
const mono = { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" };
