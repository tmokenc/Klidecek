// Step-through Hindley-Milner inference for chosen expressions.
import { useState } from "react";

const EXAMPLES = {
  id: {
    expr: "id = \\x -> x",
    steps: [
      { code: "id x = x",                          subst: [],                              type: "α₁ -> α₂" },
      { code: "rule: x : α₁",                       subst: [],                              type: "α₁ -> α₂" },
      { code: "body x : α₂  ⊢  α₁ ~ α₂",            subst: ["α₂ := α₁"],                   type: "α₁ -> α₁" },
      { code: "generalize → ∀a. a -> a",            subst: ["α₂ := α₁"],                   type: "∀a. a -> a" },
    ],
    final: "id :: ∀a. a -> a",
  },
  applyTwice: {
    expr: "applyTwice f x = f (f x)",
    steps: [
      { code: "f : α₁,  x : α₂",                                                subst: [],                                                        type: "α₁ -> α₂ -> α₃" },
      { code: "f x : ?  ⊢  α₁ ~ α₂ -> β",                                       subst: ["α₁ := α₂ -> β"],                                          type: "(α₂ -> β) -> α₂ -> α₃" },
      { code: "f (f x) : ?  ⊢  α₂ -> β ~ β -> γ",                              subst: ["α₁ := α₂ -> β", "β := α₂", "γ := α₂"],                  type: "(α₂ -> α₂) -> α₂ -> α₂" },
      { code: "α₃ ~ α₂",                                                        subst: ["α₁ := α₂ -> α₂", "α₃ := α₂"],                            type: "(α₂ -> α₂) -> α₂ -> α₂" },
      { code: "generalize",                                                       subst: ["α₁ := α₂ -> α₂", "α₃ := α₂"],                            type: "∀a. (a -> a) -> a -> a" },
    ],
    final: "applyTwice :: ∀a. (a -> a) -> a -> a",
  },
  compose: {
    expr: "(.) = \\f g x -> f (g x)",
    steps: [
      { code: "f:α₁, g:α₂, x:α₃",                                                subst: [],                                                          type: "α₁ -> α₂ -> α₃ -> α₄" },
      { code: "g x  ⊢  α₂ ~ α₃ -> β",                                            subst: ["α₂ := α₃ -> β"],                                            type: "α₁ -> (α₃ -> β) -> α₃ -> α₄" },
      { code: "f (g x)  ⊢  α₁ ~ β -> γ",                                          subst: ["α₁ := β -> γ", "α₂ := α₃ -> β"],                            type: "(β -> γ) -> (α₃ -> β) -> α₃ -> γ" },
      { code: "α₄ ~ γ",                                                            subst: ["α₁ := β -> γ", "α₂ := α₃ -> β", "α₄ := γ"],                  type: "(β -> γ) -> (α₃ -> β) -> α₃ -> γ" },
      { code: "rename + generalize",                                                subst: ["…"],                                                       type: "∀a b c. (b -> c) -> (a -> b) -> a -> c" },
    ],
    final: "(.) :: ∀a b c. (b -> c) -> (a -> b) -> a -> c",
  },
  map: {
    expr: "map f xs = case xs of [] -> []; (h:t) -> f h : map f t",
    steps: [
      { code: "f : α₁,  xs : [α₂]",                                              subst: [],                                                          type: "α₁ -> [α₂] -> α₃" },
      { code: "branch [] : ?  ⊢  α₃ ~ [β]",                                       subst: ["α₃ := [β]"],                                                type: "α₁ -> [α₂] -> [β]" },
      { code: "h : α₂,  f h ⊢ α₁ ~ α₂ -> γ",                                     subst: ["α₃ := [β]", "α₁ := α₂ -> γ"],                              type: "(α₂ -> γ) -> [α₂] -> [β]" },
      { code: "f h : t ⊢ γ ~ β",                                                  subst: ["α₃ := [β]", "α₁ := α₂ -> β", "γ := β"],                    type: "(α₂ -> β) -> [α₂] -> [β]" },
      { code: "generalize",                                                         subst: [],                                                          type: "∀a b. (a -> b) -> [a] -> [b]" },
    ],
    final: "map :: ∀a b. (a -> b) -> [a] -> [b]",
  },
};

export default function HindleyMilner() {
  const [ex, setEx] = useState("id");
  const [step, setStep] = useState(0);
  const cur = EXAMPLES[ex];

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>expr:</label>
        <select value={ex} onChange={(e) => { setEx(e.target.value); setStep(0); }} style={sel}>
          {Object.entries(EXAMPLES).map(([k, v]) => <option key={k} value={k}>{v.expr}</option>)}
        </select>
      </div>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" }}>
        {cur.expr}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr", gap: 8 }}>
        <div style={col}>
          <div style={colHd}>krok algoritmu W</div>
          {cur.steps.slice(0, step + 1).map((s, i) => (
            <div key={i} style={{ ...lineSt, color: i === step ? "var(--accent)" : "var(--text)" }}>{s.code}</div>
          ))}
        </div>
        <div style={col}>
          <div style={colHd}>substituce σ</div>
          {cur.steps[step].subst.length === 0 ? <div style={{ ...lineSt, color: "var(--text-muted)" }}>(prázdná)</div> :
            cur.steps[step].subst.map((s, i) => <div key={i} style={{ ...lineSt }}>{s}</div>)}
        </div>
        <div style={col}>
          <div style={colHd}>aktuální typ</div>
          <div style={{ ...lineSt, color: "var(--accent)" }}>{cur.steps[step].type}</div>
        </div>
      </div>
      <div style={row}>
        <button style={btn} disabled={step === 0} onClick={() => setStep(step - 1)}>‹ předchozí</button>
        <span style={{ ...lbl, marginLeft: 8 }}>krok {step + 1} / {cur.steps.length}</span>
        <button style={btn} disabled={step === cur.steps.length - 1} onClick={() => setStep(step + 1)}>další ›</button>
      </div>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 13, color: "rgb(64,192,87)" }}>
        {cur.final}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Algoritmus W (Damas-Milner 1982): rekurzivně sestupuje výrazem, generuje constraint <code style={mono}>τ₁ ~ τ₂</code>, řeší unifikací; výsledek = <em>principal type</em>. Generalizace nakonec uzavře volné typové proměnné přes <code style={mono}>∀</code>.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const col = { background: "var(--bg-inset)", padding: 10, borderRadius: 6, minHeight: 110 };
const colHd = { fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 };
const lineSt = { fontFamily: "var(--font-mono)", fontSize: 11, padding: "2px 0" };
const mono = { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" };
