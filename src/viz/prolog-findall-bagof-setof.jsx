// findall / bagof / setof — collection over backtracking.
import { useState } from "react";

const KB = `parent(tom, bob).
parent(tom, liz).
parent(bob, ann).
parent(bob, pat).
parent(liz, mary).
parent(liz, ann).`;

const QUERIES = {
  "tom-children": {
    goal: "Y, parent(tom, Y), Result",
    raw: ["bob", "liz"],
  },
  "alice-children": {
    goal: "Y, parent(alice, Y), Result",
    raw: [],
  },
  "all-pairs": {
    goal: "(X,Y), parent(X, Y), Result",
    raw: ["(tom,bob)", "(tom,liz)", "(bob,ann)", "(bob,pat)", "(liz,mary)", "(liz,ann)"],
  },
  "ann-parents": {
    goal: "X, parent(X, ann), Result",
    raw: ["bob", "liz"],
  },
  "dups-test": {
    goal: "Y, parent(X, Y), Result",
    raw: ["bob", "liz", "ann", "pat", "mary", "ann"],
  },
};

export default function PrologFindallBagofSetof() {
  const [q, setQ] = useState("tom-children");
  const cur = QUERIES[q];

  // findall: always returns list (may be empty)
  const findall = cur.raw;
  // bagof: fails if empty
  const bagof = cur.raw.length === 0 ? "FAIL (no solutions)" : cur.raw;
  // setof: sorted, unique, fails if empty
  const setof = cur.raw.length === 0 ? "FAIL (no solutions)" : [...new Set(cur.raw)].sort();

  return (
    <div style={ctn}>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <pre style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)", margin: 0, whiteSpace: "pre" }}>{KB}</pre>
      </div>
      <div style={row}>
        <label style={lbl}>query:</label>
        <select value={q} onChange={(e) => setQ(e.target.value)} style={sel}>
          {Object.entries(QUERIES).map(([k, v]) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>všechna řešení přes backtracking:</div>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" }}>[{cur.raw.join(", ")}]</code>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <div style={col}>
          <div style={colHd}>findall/3</div>
          <code style={callCode}>findall({cur.goal})</code>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6 }}>vrátí ALL, prázdný OK</div>
          <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgb(64,192,87)" }}>[{findall.join(", ")}]</code>
        </div>
        <div style={col}>
          <div style={colHd}>bagof/3</div>
          <code style={callCode}>bagof({cur.goal})</code>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6 }}>FAIL na prázdný</div>
          {Array.isArray(bagof)
            ? <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgb(64,192,87)" }}>[{bagof.join(", ")}]</code>
            : <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgb(220,80,80)" }}>{bagof}</code>}
        </div>
        <div style={col}>
          <div style={colHd}>setof/3</div>
          <code style={callCode}>setof({cur.goal})</code>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6 }}>sorted, unique, FAIL na prázdný</div>
          {Array.isArray(setof)
            ? <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgb(64,192,87)" }}>[{setof.join(", ")}]</code>
            : <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgb(220,80,80)" }}>{setof}</code>}
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        <strong>findall</strong> = "give me everything, even empty"; <strong>bagof</strong> = "give me everything but fail if nothing"; <strong>setof</strong> = bagof + sort + dedup. <code style={mono}>dups-test</code> (poslední item) ukazuje výhodu setof — dva výskyty <code style={mono}>ann</code> kolapsují na jeden.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const col = { background: "var(--bg-inset)", padding: 10, borderRadius: 6 };
const colHd = { fontSize: 12, color: "var(--accent)", marginBottom: 4, fontWeight: 600 };
const callCode = { fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-muted)", display: "block", marginBottom: 4 };
const mono = { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" };
