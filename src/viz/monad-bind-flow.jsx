// Visualize do-notation desugaring per-monad.
import { useState } from "react";

const SCENARIOS = {
  Maybe: {
    do: `do
  x <- lookup "alice" db
  y <- lookup "bob" db
  return (x + y)`,
    desug: `lookup "alice" db >>= \\x ->
lookup "bob" db   >>= \\y ->
return (x + y)`,
    cases: [
      { lbl: "obě jména v db",            x: "Just 30", y: "Just 25", out: "Just 55" },
      { lbl: "alice chybí",                x: "Nothing", y: "(skip)",   out: "Nothing — short-circuit na 1. >>=" },
      { lbl: "bob chybí",                  x: "Just 30", y: "Nothing",  out: "Nothing — short-circuit na 2. >>=" },
    ],
  },
  "Either e": {
    do: `do
  x <- parse "5"
  y <- parse "abc"
  return (x + y)`,
    desug: `parse "5"   >>= \\x ->
parse "abc" >>= \\y ->
return (x + y)`,
    cases: [
      { lbl: "obě parsované",              x: "Right 5", y: "Right 10", out: "Right 15" },
      { lbl: "druhý nesmyslný",            x: "Right 5", y: "Left \"abc\"", out: "Left \"abc\" — chybová zpráva přežije" },
    ],
  },
  List: {
    do: `do
  x <- [1, 2]
  y <- [10, 20]
  return (x + y)`,
    desug: `[1,2] >>= \\x ->
[10,20] >>= \\y ->
return (x + y)`,
    cases: [
      { lbl: "všechny kombinace",          x: "[1, 2]", y: "[10, 20]", out: "[11, 21, 12, 22]" },
      { lbl: "jeden je prázdný",            x: "[1, 2]", y: "[]",        out: "[]" },
    ],
  },
  IO: {
    do: `do
  name <- getLine
  age  <- readLn
  putStrLn (name ++ " " ++ show age)`,
    desug: `getLine >>= \\name ->
readLn  >>= \\age ->
putStrLn (name ++ " " ++ show age)`,
    cases: [
      { lbl: "sekvenční efekty",            x: "IO String", y: "IO Int", out: "IO () — vstupy v daném pořadí" },
    ],
  },
};

export default function MonadBindFlow() {
  const [type, setType] = useState("Maybe");
  const [caseIdx, setCaseIdx] = useState(0);
  const cur = SCENARIOS[type];
  const cs = cur.cases[caseIdx] || cur.cases[0];

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>monad:</label>
        {Object.keys(SCENARIOS).map((t) => (
          <button key={t} style={type === t ? btnOn : btn} onClick={() => { setType(t); setCaseIdx(0); }}>{t}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={col}>
          <div style={colHd}>do notation</div>
          <pre style={pre}>{cur.do}</pre>
        </div>
        <div style={col}>
          <div style={colHd}>desugared</div>
          <pre style={pre}>{cur.desug}</pre>
        </div>
      </div>

      <div style={row}>
        <label style={lbl}>scénář:</label>
        {cur.cases.map((c, i) => (
          <button key={i} style={caseIdx === i ? btnOn : btn} onClick={() => setCaseIdx(i)}>{c.lbl}</button>
        ))}
      </div>

      <svg viewBox="0 0 540 160" style={{ width: "100%", maxWidth: 600, background: "var(--bg-inset)", borderRadius: 6 }}>
        <defs>
          <marker id="arrMB" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)" />
          </marker>
        </defs>
        <rect x="20" y="55" width="120" height="50" rx="6" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="80" y="76" fontSize="11" textAnchor="middle" fill="var(--text)">m1</text>
        <text x="80" y="94" fontSize="10" textAnchor="middle" fill={cs.x.includes("Nothing") || cs.x.includes("Left") || cs.x === "[]" ? "rgb(220,80,80)" : "rgb(64,192,87)"} fontFamily="var(--font-mono)">{cs.x}</text>

        <line x1="140" y1="80" x2="195" y2="80" stroke="var(--accent)" strokeWidth="1.5" markerEnd="url(#arrMB)" />
        <text x="167" y="73" fontSize="10" textAnchor="middle" fill="var(--accent)">&gt;&gt;=</text>

        <rect x="200" y="55" width="120" height="50" rx="6" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="260" y="76" fontSize="11" textAnchor="middle" fill="var(--text)">\x -&gt; m2</text>
        <text x="260" y="94" fontSize="10" textAnchor="middle" fill={cs.y.includes("Nothing") || cs.y.includes("Left") || cs.y === "[]" ? "rgb(220,80,80)" : "rgb(64,192,87)"} fontFamily="var(--font-mono)">{cs.y}</text>

        <line x1="320" y1="80" x2="375" y2="80" stroke="var(--accent)" strokeWidth="1.5" markerEnd="url(#arrMB)" />
        <text x="347" y="73" fontSize="10" textAnchor="middle" fill="var(--accent)">&gt;&gt;=</text>

        <rect x="380" y="55" width="140" height="50" rx="6" fill="var(--bg-card)" stroke="rgb(64,192,87)" strokeWidth="1.5" />
        <text x="450" y="76" fontSize="11" textAnchor="middle" fill="var(--text)">return ...</text>
        <text x="450" y="94" fontSize="9.5" textAnchor="middle" fill="rgb(64,192,87)" fontFamily="var(--font-mono)">{cs.out.slice(0, 24)}</text>

        <text x="270" y="135" fontSize="10" textAnchor="middle" fill="var(--text-muted)">každý &gt;&gt;= je per-monad: Maybe propaguje Nothing, List rozvětvuje, IO sekvencuje</text>
      </svg>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>výsledek:</div>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: cs.out.includes("Nothing") || cs.out.includes("Left") || cs.out === "[]" ? "rgb(220,80,80)" : "rgb(64,192,87)" }}>{cs.out}</code>
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const btnOn = { ...btn, background: "var(--accent)", color: "var(--bg-card)", borderColor: "var(--accent)" };
const col = { background: "var(--bg-inset)", padding: 10, borderRadius: 6 };
const colHd = { fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 };
const pre = { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)", margin: 0, whiteSpace: "pre" };
