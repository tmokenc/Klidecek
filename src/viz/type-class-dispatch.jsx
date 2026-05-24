// Type class compiled to dictionary-passing — visualize dispatch.
import { useState } from "react";

const SOURCE = `class Eq a where
  (==) :: a -> a -> Bool

elem :: Eq a => a -> [a] -> Bool
elem _ []     = False
elem x (y:ys) = x == y || elem x ys`;

const DESUGARED = `data EqDict a = EqDict { eq :: a -> a -> Bool }

elem :: EqDict a -> a -> [a] -> Bool
elem _    _ []     = False
elem dict x (y:ys) = (eq dict x y) || elem dict x ys`;

const DICTS = {
  Int:    { eq: "primIntEq",     where: "built-in", call: "elem dict_Int 5 [1,2,5,3]" },
  String: { eq: "stringEq",      where: "Data.String", call: "elem dict_String \"hi\" [\"a\",\"hi\"]" },
  Bool:   { eq: "boolEq",         where: "Data.Bool", call: "elem dict_Bool True [False, True]" },
  Person: { eq: "personEqByName", where: "uživatelská instance",  call: "elem dict_Person alice people" },
};

export default function TypeClassDispatch() {
  const [type, setType] = useState("Int");
  const cur = DICTS[type];

  return (
    <div style={ctn}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={col}>
          <div style={colHd}>zdrojový Haskell</div>
          <pre style={pre}>{SOURCE}</pre>
        </div>
        <div style={col}>
          <div style={colHd}>po desugaring (GHC Core)</div>
          <pre style={pre}>{DESUGARED}</pre>
        </div>
      </div>

      <div style={row}>
        <label style={lbl}>volání s typem:</label>
        {Object.keys(DICTS).map((t) => (
          <button key={t} style={type === t ? btnOn : btn} onClick={() => setType(t)}>{t}</button>
        ))}
      </div>

      <svg viewBox="0 0 540 200" style={{ width: "100%", maxWidth: 600, background: "var(--bg-inset)", borderRadius: 6 }}>
        <rect x="30" y="30" width="160" height="60" rx="6" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.5" />
        <text x="110" y="52" fontSize="11" textAnchor="middle" fill="var(--text)">call site</text>
        <text x="110" y="72" fontSize="10" textAnchor="middle" fill="var(--accent)" fontFamily="var(--font-mono)">{cur.call.slice(0, 28)}</text>

        <line x1="190" y1="60" x2="280" y2="100" stroke="var(--accent)" strokeWidth="1.5" markerEnd="url(#arr)" />

        <rect x="280" y="80" width="200" height="80" rx="6" fill="var(--bg-card)" stroke="rgb(64,192,87)" strokeWidth="1.5" />
        <text x="380" y="100" fontSize="11" textAnchor="middle" fill="var(--text)">dict_{type}</text>
        <text x="380" y="120" fontSize="10" textAnchor="middle" fill="rgb(64,192,87)" fontFamily="var(--font-mono)">eq = {cur.eq}</text>
        <text x="380" y="138" fontSize="9" textAnchor="middle" fill="var(--text-muted)">({cur.where})</text>

        <line x1="380" y1="160" x2="380" y2="190" stroke="var(--text-muted)" strokeWidth="1" markerEnd="url(#arr)" />
        <text x="380" y="195" fontSize="10" textAnchor="middle" fill="var(--text-muted)">selektor "eq" vybere konkrétní funkci</text>

        <defs>
          <marker id="arr" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)" />
          </marker>
        </defs>
      </svg>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>plný call:</div>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" }}>{cur.call}</code>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        <strong>Dictionary passing</strong> — implicit slovník metod předávaný spolu s hodnotou. <strong>Specialization</strong> v GHC: pokud je <code style={mono}>type</code> známý <em>statically</em>, dispatch je inlinen → zero overhead.
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
const pre = { fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text)", margin: 0, whiteSpace: "pre-wrap" };
const mono = { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" };
