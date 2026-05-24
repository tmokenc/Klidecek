// Eta-conversion → point-free style derivation.
import { useState } from "react";

const STEPS = {
  "sumSq": [
    { lhs: "sumSq xs = sum (map (^2) xs)",                code: "explicit lambda" },
    { lhs: "sumSq xs = (sum . map (^2)) xs",              code: "f (g x) = (f . g) x" },
    { lhs: "sumSq = sum . map (^2)",                       code: "η: \\xs -> f xs ≡ f" },
  ],
  "doubleAll": [
    { lhs: "doubleAll xs = map (\\x -> x * 2) xs",         code: "explicit lambda" },
    { lhs: "doubleAll xs = map (* 2) xs",                  code: "operator section" },
    { lhs: "doubleAll = map (* 2)",                        code: "η-redukce" },
  ],
  "pipeline": [
    { lhs: "process xs = sum (filter (>0) (map (*2) xs))",      code: "nested calls" },
    { lhs: "process xs = (sum . filter (>0) . map (*2)) xs",    code: "composition" },
    { lhs: "process = sum . filter (>0) . map (*2)",             code: "η + pipeline" },
  ],
  "applyTwice": [
    { lhs: "f x = g (g x)",                                       code: "manual nesting" },
    { lhs: "f x = (g . g) x",                                     code: "compose" },
    { lhs: "f = g . g",                                            code: "η: pointfree" },
  ],
};

export default function EtaPointfree() {
  const [ex, setEx] = useState("sumSq");
  const [step, setStep] = useState(0);
  const trace = STEPS[ex];

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>příklad:</label>
        <select value={ex} onChange={(e) => { setEx(e.target.value); setStep(0); }} style={sel}>
          <option value="sumSq">sumSq = sum . map (^2)</option>
          <option value="doubleAll">doubleAll = map (*2)</option>
          <option value="pipeline">process pipeline</option>
          <option value="applyTwice">f = g . g</option>
        </select>
      </div>
      <div style={{ background: "var(--bg-inset)", padding: 14, borderRadius: 6, minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
        {trace.slice(0, step + 1).map((s, i) => (
          <div key={i}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: i === step ? "var(--accent)" : "var(--text-muted)", padding: "2px 0" }}>{s.lhs}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", paddingLeft: 12, fontStyle: "italic" }}>{s.code}</div>
          </div>
        ))}
      </div>
      <div style={row}>
        <button style={btn} disabled={step === 0} onClick={() => setStep(step - 1)}>‹ předchozí</button>
        <span style={{ ...lbl, marginLeft: 8 }}>krok {step + 1} / {trace.length}</span>
        <button style={btn} disabled={step === trace.length - 1} onClick={() => setStep(step + 1)}>další ›</button>
      </div>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>η-konverze:</div>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>λx. f x  ≡_η  f</code>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>pokud <code style={mono}>x ∉ FV(f)</code> — funkce, která jen aplikuje <code style={mono}>f</code> na argument, <em>je</em> <code style={mono}>f</code>.</div>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Point-free style zdůrazňuje <em>flow dat</em> přes pipeline. Tasteful použití zvyšuje čitelnost; <em>extrémní</em> point-free může být méně čitelný.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const mono = { fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" };
