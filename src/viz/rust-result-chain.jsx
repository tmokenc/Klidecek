// Rust ? operator propagation chain.
import { useState } from "react";

const SCENARIOS = {
  ok: {
    title: "vše úspěšné",
    code: `fn process(path: &str) -> Result<i32, AppError> {
    let content = fs::read_to_string(path)?;   // step 1
    let trimmed = content.trim();
    let n: i32  = trimmed.parse()?;            // step 2
    let doubled = n.checked_mul(2)
        .ok_or(AppError::Overflow)?;           // step 3
    Ok(doubled)
}`,
    steps: [
      { stage: "read_to_string", result: "Ok(\"42  \")",  err: false },
      { stage: "trim",            result: "\"42\"",        err: false },
      { stage: "parse",           result: "Ok(42)",        err: false },
      { stage: "checked_mul(2)",  result: "Some(84)",      err: false },
      { stage: "final",           result: "Ok(84)",        err: false, done: true },
    ],
  },
  fail_io: {
    title: "soubor neexistuje",
    code: `fn process(path: &str) -> Result<i32, AppError> {
    let content = fs::read_to_string(path)?;   // ← fails!
    ...
}`,
    steps: [
      { stage: "read_to_string", result: "Err(NotFound)", err: true },
      { stage: "? early return", result: "Err(AppError::Io(NotFound))", err: true, done: true },
    ],
  },
  fail_parse: {
    title: "obsah není číslo",
    code: `fn process(path: &str) -> Result<i32, AppError> {
    let content = fs::read_to_string(path)?;
    let n: i32  = content.trim().parse()?;     // ← fails!
    ...
}`,
    steps: [
      { stage: "read_to_string", result: "Ok(\"abc\")",  err: false },
      { stage: "trim + parse",   result: "Err(ParseIntError)", err: true },
      { stage: "? + From",       result: "Err(AppError::Parse(...))", err: true, done: true },
    ],
  },
  fail_overflow: {
    title: "i32 overflow",
    code: `fn process(path: &str) -> Result<i32, AppError> {
    let n: i32  = "2000000000".parse()?;
    let doubled = n.checked_mul(2)
        .ok_or(AppError::Overflow)?;           // ← None!
    ...
}`,
    steps: [
      { stage: "parse",        result: "Ok(2000000000)", err: false },
      { stage: "checked_mul",  result: "None (overflow)", err: true },
      { stage: "ok_or + ?",     result: "Err(AppError::Overflow)", err: true, done: true },
    ],
  },
};

export default function RustResultChain() {
  const [s, setS] = useState("ok");
  const [step, setStep] = useState(0);
  const cur = SCENARIOS[s];

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>scénář:</label>
        <select value={s} onChange={(e) => { setS(e.target.value); setStep(0); }} style={sel}>
          {Object.entries(SCENARIOS).map(([k, v]) => <option key={k} value={k}>{v.title}</option>)}
        </select>
      </div>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <pre style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)", margin: 0, whiteSpace: "pre-wrap" }}>{cur.code}</pre>
      </div>

      <div style={row}>
        <button style={btn} disabled={step === 0} onClick={() => setStep(step - 1)}>‹</button>
        <span style={{ ...lbl, marginLeft: 8 }}>krok {step + 1} / {cur.steps.length}</span>
        <button style={btn} disabled={step >= cur.steps.length - 1} onClick={() => setStep(step + 1)}>›</button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {cur.steps.map((st, i) => {
          const active = i === step;
          const past = i < step;
          return (
            <div key={i} style={{
              padding: 8, borderRadius: 6, minWidth: 120,
              background: st.err && (active || past) ? "rgba(220,80,80,0.18)" :
                          (past || active) && st.done ? "rgba(64,192,87,0.18)" :
                          (past || active) ? "rgba(64,140,220,0.18)" :
                          "var(--bg-inset)",
              border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
              opacity: i > step ? 0.4 : 1,
            }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>krok {i + 1}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{st.stage}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: st.err ? "rgb(220,80,80)" : "rgb(64,192,87)", marginTop: 4 }}>{st.result}</div>
            </div>
          );
        })}
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)", display: "block", whiteSpace: "pre" }}>{
`// ? je syntactic sugar pro:
match expr {
    Ok(v)  => v,
    Err(e) => return Err(e.into()),  // .into() volá impl From<E> for AppError
}`
        }</code>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        <code style={mono}>?</code> propaguje error nahoru a automaticky volá <code style={mono}>From::from</code> ke konverzi error typů. <code style={mono}>From&lt;io::Error&gt; for AppError</code> + <code style={mono}>From&lt;ParseIntError&gt; for AppError</code> umožňují jednotně proudit.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const mono = { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" };
