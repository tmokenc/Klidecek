// Ownership/borrowing flow — drag value through scopes, see borrow checker.
import { useState } from "react";

const SCENARIOS = {
  "basic-move": {
    title: "Move semantika",
    code: `let s1 = String::from("hello");
let s2 = s1;          // ← move
println!("{}", s1);   // ← ?`,
    states: [
      { line: 0, s1: "owns", s2: "—", err: "" },
      { line: 1, s1: "moved", s2: "owns", err: "" },
      { line: 2, s1: "moved", s2: "owns", err: "ERROR: borrow of moved value `s1`" },
    ],
  },
  "copy-int": {
    title: "Copy types (Int, Bool, ...)",
    code: `let x = 5;
let y = x;            // ← COPY (i32 implements Copy)
println!("{} {}", x, y);  // ← OK`,
    states: [
      { line: 0, s1: "owns 5", s2: "—", err: "" },
      { line: 1, s1: "owns 5", s2: "owns 5 (copy)", err: "" },
      { line: 2, s1: "owns 5", s2: "owns 5", err: "" },
    ],
  },
  "borrow-imm": {
    title: "Immutable borrow",
    code: `let s = String::from("hi");
let r1 = &s;
let r2 = &s;          // ← další imm OK
println!("{} {} {}", r1, r2, s);`,
    states: [
      { line: 0, s1: "owns", s2: "—", err: "" },
      { line: 1, s1: "owns (1 borrow)", s2: "&s", err: "" },
      { line: 2, s1: "owns (2 borrows)", s2: "&s, &s", err: "" },
      { line: 3, s1: "owns (2 borrows)", s2: "&s, &s", err: "" },
    ],
  },
  "borrow-conflict": {
    title: "Mut/imm konflikt",
    code: `let mut s = String::from("hi");
let r1 = &s;
let r2 = &mut s;      // ← KONFLIKT
println!("{} {}", r1, r2);`,
    states: [
      { line: 0, s1: "owns", s2: "—", err: "" },
      { line: 1, s1: "owns (imm borrow)", s2: "&s", err: "" },
      { line: 2, s1: "owns (imm borrow)", s2: "&s + want &mut", err: "ERROR: cannot borrow `s` as mutable because it is also borrowed as immutable" },
    ],
  },
  "drop-scope": {
    title: "Drop na konci scope",
    code: `{
    let s = String::from("hi");
    println!("{}", s);
}                     // ← drop(s)`,
    states: [
      { line: 0, s1: "scope začíná", s2: "—", err: "" },
      { line: 1, s1: "owns \"hi\"", s2: "—", err: "" },
      { line: 2, s1: "owns \"hi\"", s2: "—", err: "" },
      { line: 3, s1: "DROPPED — heap uvolněn", s2: "—", err: "" },
    ],
  },
};

export default function OwnershipFlow() {
  const [s, setS] = useState("basic-move");
  const [step, setStep] = useState(0);
  const cur = SCENARIOS[s];
  const st = cur.states[step];

  const lines = cur.code.split("\n");

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>scénář:</label>
        <select value={s} onChange={(e) => { setS(e.target.value); setStep(0); }} style={sel}>
          {Object.entries(SCENARIOS).map(([k, v]) => <option key={k} value={k}>{v.title}</option>)}
        </select>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            display: "flex", gap: 8, alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 12,
            padding: "3px 4px", borderRadius: 3,
            background: i === step ? "rgba(64,140,220,0.18)" : "transparent",
            color: i === step ? "var(--accent)" : "var(--text)",
          }}>
            <span style={{ color: "var(--text-muted)", width: 22 }}>{i + 1}</span>
            <span style={{ whiteSpace: "pre" }}>{line}</span>
          </div>
        ))}
      </div>

      <div style={row}>
        <button style={btn} disabled={step === 0} onClick={() => setStep(step - 1)}>‹ undo</button>
        <span style={{ ...lbl, marginLeft: 8 }}>krok {step + 1} / {cur.states.length}</span>
        <button style={btn} disabled={step >= cur.states.length - 1} onClick={() => setStep(step + 1)}>další ›</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={col}>
          <div style={colHd}>binding 1 (s / s1 / x)</div>
          <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: st.s1.includes("DROPPED") || st.s1.includes("moved") ? "rgb(220,80,80)" : "rgb(64,192,87)" }}>
            {st.s1}
          </code>
        </div>
        <div style={col}>
          <div style={colHd}>binding 2 (s2 / y / r1 / r2)</div>
          <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: st.s2 === "—" ? "var(--text-muted)" : "rgb(64,192,87)" }}>
            {st.s2}
          </code>
        </div>
      </div>

      {st.err && (
        <div style={{ background: "rgba(220,80,80,0.18)", padding: 10, borderRadius: 6, border: "1px solid rgb(220,80,80)" }}>
          <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgb(220,80,80)" }}>{st.err}</code>
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Pravidla: (1) každá hodnota má <em>právě jednoho</em> vlastníka; (2) buď <em>jedna</em> mutable reference NEBO <em>libovolně</em> immutable, nikdy oboje; (3) reference musí být <em>vždy validní</em>. Compile-time enforcement = žádné dangling pointers, žádné data races.
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
