// Church numerals + SUCC/ADD/MUL/POW/ISZERO with step-by-step reduction.
import { useMemo, useState } from "react";

function churchN(n) { let s = "x"; for (let i = 0; i < n; i++) s = "f (" + s + ")"; return "λf x. " + s; }

function reduceOp(op, m, n) {
  // Compute the Church result numerically, then format as a reduction story.
  const steps = [];
  let result = 0;
  if (op === "succ") {
    steps.push(`SUCC ${m}`);
    steps.push(`= (λn f x. f (n f x)) ${m}`);
    steps.push(`= λf x. f (${m} f x)`);
    steps.push(`= λf x. f^${m + 1}(x) = ${m + 1}`);
    result = m + 1;
  } else if (op === "add") {
    steps.push(`ADD ${m} ${n}`);
    steps.push(`= (λm n f x. m f (n f x)) ${m} ${n}`);
    steps.push(`= λf x. ${m} f (${n} f x)`);
    steps.push(`= λf x. ${m} f (f^${n}(x))`);
    steps.push(`= λf x. f^${m}(f^${n}(x)) = f^${m + n}(x) = ${m + n}`);
    result = m + n;
  } else if (op === "mul") {
    steps.push(`MUL ${m} ${n}`);
    steps.push(`= (λm n f. m (n f)) ${m} ${n}`);
    steps.push(`= λf. ${m} (${n} f)`);
    steps.push(`= λf. ${m} (f^${n}) = (f^${n})^${m} = f^${m * n}`);
    steps.push(`→ ${m * n}`);
    result = m * n;
  } else if (op === "pow") {
    steps.push(`POW ${m} ${n}`);
    steps.push(`= (λm n. n m) ${m} ${n}`);
    steps.push(`= ${n} ${m}`);
    steps.push(`= ${m}^${n} = ${Math.pow(m, n)}`);
    result = Math.pow(m, n);
  } else if (op === "iszero") {
    steps.push(`ISZERO ${m}`);
    steps.push(`= (λn. n (λx. FALSE) TRUE) ${m}`);
    if (m === 0) {
      steps.push(`= ZERO (λx. FALSE) TRUE`);
      steps.push(`= TRUE  (f aplikováno 0×)`);
      result = "TRUE";
    } else {
      steps.push(`= ${m} (λx. FALSE) TRUE`);
      steps.push(`= (λx. FALSE)^${m} (TRUE)`);
      steps.push(`= FALSE`);
      result = "FALSE";
    }
  }
  return { steps, result };
}

const OPS = {
  succ:   { lbl: "SUCC m",  arity: 1, def: "λn f x. f (n f x)" },
  add:    { lbl: "ADD m n", arity: 2, def: "λm n f x. m f (n f x)" },
  mul:    { lbl: "MUL m n", arity: 2, def: "λm n f. m (n f)" },
  pow:    { lbl: "POW m n", arity: 2, def: "λm n. n m" },
  iszero: { lbl: "ISZERO m", arity: 1, def: "λn. n (λx. FALSE) TRUE" },
};

export default function ChurchNumerals() {
  const [op, setOp] = useState("add");
  const [m, setM] = useState(2);
  const [n, setN] = useState(3);
  const trace = useMemo(() => reduceOp(op, m, n), [op, m, n]);

  // visualize the Church numeral n = λf x. f^n(x) as a stack of f bubbles
  const renderChurch = (k, color) => {
    const W = 140, H = 110;
    const bubbles = [];
    for (let i = 0; i < k; i++) {
      bubbles.push(<circle key={i} cx={W / 2} cy={H - 14 - i * 16} r="8" fill={color} stroke="var(--text)" strokeWidth="1" />);
      bubbles.push(<text key={"t" + i} x={W / 2} y={H - 11 - i * 16} fontSize="9" textAnchor="middle" fill="var(--bg-card)">f</text>);
    }
    bubbles.push(<text key="x" x={W / 2} y={H - 14 - k * 16 - 4} fontSize="9" textAnchor="middle" fill="var(--text-muted)">x</text>);
    bubbles.push(<text key="lbl" x={W / 2} y={14} fontSize="11" textAnchor="middle" fill="var(--text)">{k}</text>);
    return <svg viewBox={`0 0 ${W} ${H}`} style={{ width: 140, height: 110, background: "var(--bg-inset)", borderRadius: 6 }}>{bubbles}</svg>;
  };

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>operace:</label>
        <select value={op} onChange={(e) => setOp(e.target.value)} style={sel}>
          {Object.entries(OPS).map(([k, v]) => <option key={k} value={k}>{v.lbl} = {v.def}</option>)}
        </select>
      </div>
      <div style={row}>
        <label style={lbl}>m:</label>
        <input type="range" min="0" max="6" value={m} onChange={(e) => setM(parseInt(e.target.value))} />
        <code style={mono}>{m}</code>
        {OPS[op].arity === 2 && <>
          <label style={{ ...lbl, marginLeft: 12 }}>n:</label>
          <input type="range" min="0" max="6" value={n} onChange={(e) => setN(parseInt(e.target.value))} />
          <code style={mono}>{n}</code>
        </>}
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        {renderChurch(m, "rgb(64,140,220)")}
        {OPS[op].arity === 2 && <>
          <span style={{ fontSize: 18, color: "var(--accent)" }}>{op === "add" ? "+" : op === "mul" ? "×" : op === "pow" ? "^" : "?"}</span>
          {renderChurch(n, "rgb(180,120,200)")}
        </>}
        <span style={{ fontSize: 18, color: "var(--accent)" }}>=</span>
        {typeof trace.result === "number" ? renderChurch(trace.result, "rgb(64,192,87)") : (
          <div style={{ padding: 14, background: "var(--bg-inset)", borderRadius: 6, color: trace.result === "TRUE" ? "rgb(64,192,87)" : "rgb(220,80,80)", fontFamily: "var(--font-mono)", fontSize: 16 }}>{trace.result}</div>
        )}
      </div>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        {trace.steps.map((s, i) => (
          <div key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: i === trace.steps.length - 1 ? "var(--accent)" : "var(--text)", padding: "2px 0" }}>{s}</div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Church numeral <code style={mono}>n = λf x. f^n(x)</code> — funkce, která aplikuje <code style={mono}>f</code> přesně <code style={mono}>n</code>×.
        ZERO = neaplikuje vůbec. Aritmetika je čistě syntaktická β-redukce.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const mono = { fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" };
