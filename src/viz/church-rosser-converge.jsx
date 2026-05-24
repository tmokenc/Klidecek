// Church-Rosser: same redex two strategies converge to identical NF.
import { useState } from "react";

const EXAMPLES = {
  "kk-id": {
    src: "(λx y. x) ((λz. z) a) ((λz. z) b)",
    normal: [
      "(λx y. x) ((λz. z) a) ((λz. z) b)",
      "(λy. (λz. z) a) ((λz. z) b)",
      "(λz. z) a",
      "a",
    ],
    applic: [
      "(λx y. x) ((λz. z) a) ((λz. z) b)",
      "(λx y. x) a ((λz. z) b)",
      "(λx y. x) a b",
      "(λy. a) b",
      "a",
    ],
    nf: "a",
  },
  "non-term-normal": {
    src: "(λx. y) ((λx. x x) (λx. x x))",
    normal: [
      "(λx. y) ((λx. x x) (λx. x x))",
      "y",
    ],
    applic: [
      "(λx. y) ((λx. x x) (λx. x x))",
      "(λx. y) ((λx. x x) (λx. x x))   — Ω stále stejné",
      "… (∞ kroků, NF neexistuje)",
    ],
    nf: "y (jen normal-order)",
  },
  "succ-zero": {
    src: "(λn f x. f (n f x)) (λf x. x)",
    normal: [
      "(λn f x. f (n f x)) (λf x. x)",
      "λf x. f ((λf x. x) f x)",
      "λf x. f ((λx. x) x)",
      "λf x. f x      = ONE",
    ],
    applic: [
      "(λn f x. f (n f x)) (λf x. x)",
      "λf x. f ((λf x. x) f x)",
      "λf x. f ((λx. x) x)",
      "λf x. f x      = ONE",
    ],
    nf: "λf x. f x   (ONE)",
  },
};

export default function ChurchRosserConverge() {
  const [ex, setEx] = useState("kk-id");
  const e = EXAMPLES[ex];
  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>výraz:</label>
        <select value={ex} onChange={(ev) => setEx(ev.target.value)} style={sel}>
          {Object.keys(EXAMPLES).map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 13, textAlign: "center", color: "var(--accent)" }}>
        {e.src}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={col}>
          <div style={colHd}>normal-order (leftmost-outermost)</div>
          {e.normal.map((l, i) => (
            <div key={i} style={{ ...lineSt, color: i === e.normal.length - 1 ? "var(--accent)" : "var(--text)" }}>{l}</div>
          ))}
        </div>
        <div style={col}>
          <div style={colHd}>applicative-order (leftmost-innermost)</div>
          {e.applic.map((l, i) => (
            <div key={i} style={{ ...lineSt, color: i === e.applic.length - 1 ? (e.applic[e.applic.length - 1].includes("∞") ? "rgb(220,80,80)" : "var(--accent)") : "var(--text)" }}>{l}</div>
          ))}
        </div>
      </div>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" }}>
        NF: {e.nf}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        <strong>Church-Rosser:</strong> pokud výraz <em>má</em> NF, je jednoznačně určena. Strategie ovlivňuje <em>jestli</em> a <em>jak rychle</em> ji najdeme.
        Normal-order najde NF kdykoli existuje. Applicative někdy diverguje (příklad 2) — vnitřní Ω evaluuje "first".
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const col = { background: "var(--bg-inset)", padding: 10, borderRadius: 6 };
const colHd = { fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 };
const lineSt = { fontFamily: "var(--font-mono)", fontSize: 11, padding: "2px 0" };
