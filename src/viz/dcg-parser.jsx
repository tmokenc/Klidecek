// DCG parser tracing — difference list residue at each step.
import { useState } from "react";

const GRAMMAR = `sentence    --> noun_phrase, verb_phrase.
noun_phrase --> [the], noun.
verb_phrase --> verb, noun_phrase.
noun        --> [cat].
noun        --> [dog].
verb        --> [sees].
verb        --> [chases].`;

const INPUTS = {
  "ok-cat-sees-dog": { words: ["the", "cat", "sees", "the", "dog"], ok: true },
  "ok-dog-chases-cat": { words: ["the", "dog", "chases", "the", "cat"], ok: true },
  "fail-missing-the": { words: ["cat", "sees", "the", "dog"], ok: false },
};

function tracePar(words) {
  // Step by step what DCG does
  const steps = [];
  const w = words.slice();
  steps.push({ rule: "sentence([the,cat,sees,the,dog], [])", resid: w.slice() });
  if (w[0] === "the" && w.length >= 2 && (w[1] === "cat" || w[1] === "dog")) {
    steps.push({ rule: "  noun_phrase: [the], noun",            resid: w.slice(1) });
    steps.push({ rule: `  ✓ [the] consumed, noun=${w[1]}`,        resid: w.slice(2) });
    const r1 = w.slice(2);
    if (r1.length >= 1 && (r1[0] === "sees" || r1[0] === "chases")) {
      steps.push({ rule: `  verb_phrase: verb=${r1[0]}`,          resid: r1.slice(1) });
      const r2 = r1.slice(1);
      if (r2[0] === "the" && r2.length >= 2 && (r2[1] === "cat" || r2[1] === "dog")) {
        steps.push({ rule: `    noun_phrase: [the], noun=${r2[1]}`, resid: r2.slice(2) });
        steps.push({ rule: "  ✓ residue empty → parse succeeds",  resid: [] });
      } else {
        steps.push({ rule: "  ✗ noun_phrase nezačíná 'the'",       resid: r2 });
      }
    } else {
      steps.push({ rule: "  ✗ není sloveso",                       resid: r1 });
    }
  } else {
    steps.push({ rule: "✗ noun_phrase: nezačíná 'the'",             resid: w });
  }
  return steps;
}

export default function DcgParser() {
  const [inputKey, setInputKey] = useState("ok-cat-sees-dog");
  const cur = INPUTS[inputKey];
  const steps = tracePar(cur.words);
  const [step, setStep] = useState(0);

  return (
    <div style={ctn}>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <pre style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)", margin: 0, whiteSpace: "pre" }}>{GRAMMAR}</pre>
      </div>

      <div style={row}>
        <label style={lbl}>vstup:</label>
        <select value={inputKey} onChange={(e) => { setInputKey(e.target.value); setStep(0); }} style={sel}>
          {Object.entries(INPUTS).map(([k, v]) => <option key={k} value={k}>[{v.words.join(", ")}]</option>)}
        </select>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>kroky se zbytkovou (residue) listem:</div>
        {steps.slice(0, step + 1).map((s, i) => (
          <div key={i} style={{ padding: "4px 0", borderBottom: i < step ? "1px dashed var(--line)" : "none" }}>
            <code style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: i === step ? "var(--accent)" : "var(--text)" }}>{s.rule}</code>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
              residue: [{s.resid.join(", ")}] {s.resid.length === 0 && "← empty, parse done"}
            </div>
          </div>
        ))}
      </div>

      <div style={row}>
        <button style={btn} disabled={step === 0} onClick={() => setStep(step - 1)}>‹</button>
        <span style={{ ...lbl, marginLeft: 8 }}>krok {step + 1} / {steps.length}</span>
        <button style={btn} disabled={step >= steps.length - 1} onClick={() => setStep(step + 1)}>›</button>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>jak DCG překládá:</div>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", display: "block", whiteSpace: "pre" }}>{
`sentence --> np, vp.
% překládá se na:
sentence(S0, S) :- np(S0, S1), vp(S1, S).
% S0 = vstup před, S = residue po`
        }</code>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Definite Clause Grammar je <em>sugar</em> nad difference lists. Argumenty <code style={mono}>(S0, S)</code> reprezentují "vstup minus zbytek" = co bylo zkonzumováno. Volání <code style={mono}>sentence(L, [])</code> se táže "byl celý L parsován?".
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
