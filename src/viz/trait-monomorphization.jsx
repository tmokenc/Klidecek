// Generic vs dyn Trait — monomorphization vs vtable.
import { useState } from "react";

const GENERIC = `fn process<T: Animal>(a: &T) {
    a.sound();
}

process(&Dog);
process(&Cat);
process(&Cow);`;

const GENERIC_EXPANDED = `// Po monomorfizaci:
fn process__Dog(a: &Dog) { a.sound(); }
fn process__Cat(a: &Cat) { a.sound(); }
fn process__Cow(a: &Cow) { a.sound(); }
// Tři KOPIE funkce v binárce.`;

const DYN = `fn process(a: &dyn Animal) {
    a.sound();
}

process(&Dog);
process(&Cat);
process(&Cow);`;

const DYN_EXPANDED = `// Jen JEDNA funkce v binárce:
fn process(a: &dyn Animal) {
    // a je fat pointer: (data_ptr, vtable_ptr)
    (a.vtable.sound)(a.data_ptr);  // runtime dispatch
}`;

export default function TraitMonomorphization() {
  const [mode, setMode] = useState("generic");

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>dispatch:</label>
        <button style={mode === "generic" ? btnOn : btn} onClick={() => setMode("generic")}>generic (monomorphize)</button>
        <button style={mode === "dyn" ? btnOn : btn} onClick={() => setMode("dyn")}>dyn Trait (vtable)</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={col}>
          <div style={colHd}>zdrojový kód</div>
          <pre style={pre}>{mode === "generic" ? GENERIC : DYN}</pre>
        </div>
        <div style={col}>
          <div style={colHd}>po kompilaci</div>
          <pre style={pre}>{mode === "generic" ? GENERIC_EXPANDED : DYN_EXPANDED}</pre>
        </div>
      </div>

      <svg viewBox="0 0 540 220" style={{ width: "100%", maxWidth: 600, background: "var(--bg-inset)", borderRadius: 6 }}>
        {mode === "generic" ? (
          <>
            <text x="270" y="20" fontSize="11" textAnchor="middle" fill="var(--text)">monomorfizace = 1 kopie funkce per typ</text>
            {[
              { x: 40, lbl: "process<Dog>", h: 40 },
              { x: 180, lbl: "process<Cat>", h: 40 },
              { x: 320, lbl: "process<Cow>", h: 40 },
            ].map((b, i) => (
              <g key={i}>
                <rect x={b.x} y="40" width="140" height={b.h} rx="6" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.3" />
                <text x={b.x + 70} y="65" fontSize="11" textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)">{b.lbl}</text>
              </g>
            ))}
            <text x="270" y="120" fontSize="11" textAnchor="middle" fill="var(--text-muted)">→ inlining možný, zero overhead</text>
            <text x="270" y="140" fontSize="11" textAnchor="middle" fill="var(--text-muted)">→ binarka roste (3× kopie kódu)</text>
            <text x="270" y="180" fontSize="13" textAnchor="middle" fill="rgb(64,192,87)" fontFamily="var(--font-mono)">compile-time dispatch</text>
          </>
        ) : (
          <>
            <text x="270" y="20" fontSize="11" textAnchor="middle" fill="var(--text)">trait object = 1 funkce + vtable per typ</text>
            <rect x="200" y="35" width="140" height="40" rx="6" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.3" />
            <text x="270" y="60" fontSize="11" textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)">process(&dyn)</text>

            {[
              { x: 50, lbl: "vtable_Dog", y: 110 },
              { x: 200, lbl: "vtable_Cat", y: 110 },
              { x: 350, lbl: "vtable_Cow", y: 110 },
            ].map((b, i) => (
              <g key={i}>
                <rect x={b.x} y={b.y} width="140" height="40" rx="6" fill="var(--bg-card)" stroke="rgb(220,140,80)" strokeWidth="1.3" />
                <text x={b.x + 70} y={b.y + 22} fontSize="11" textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)">{b.lbl}</text>
                <line x1={270} y1={75} x2={b.x + 70} y2={b.y} stroke="var(--text-muted)" strokeWidth="0.7" />
              </g>
            ))}

            <text x="270" y="180" fontSize="11" textAnchor="middle" fill="var(--text-muted)">menší binárka, vtable indirection</text>
            <text x="270" y="200" fontSize="13" textAnchor="middle" fill="rgb(220,140,80)" fontFamily="var(--font-mono)">runtime dispatch (vtable lookup)</text>
          </>
        )}
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={col}>
          <div style={colHd}>generic / monomorphize</div>
          <div style={{ fontSize: 11, color: "var(--text)" }}>+ zero-cost (inlined)</div>
          <div style={{ fontSize: 11, color: "var(--text)" }}>+ kompilátor vidí konkrétní typ</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>− binárka roste</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>− code bloat, delší kompilace</div>
        </div>
        <div style={col}>
          <div style={colHd}>dyn Trait / vtable</div>
          <div style={{ fontSize: 11, color: "var(--text)" }}>+ heterogenní kolekce <code style={mono}>Vec&lt;Box&lt;dyn Animal&gt;&gt;</code></div>
          <div style={{ fontSize: 11, color: "var(--text)" }}>+ menší binárka</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>− indirect call (vtable lookup)</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>− no inlining</div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Default v Rustu je <strong>generic</strong> — vyber <code style={mono}>dyn</code> jen když potřebujete heterogenní kolekci nebo small binary. Haskell: type classes vždy dictionary-passing; GHC dělá specialization v -O2.
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
const colHd = { fontSize: 12, color: "var(--accent)", marginBottom: 6, fontWeight: 600 };
const pre = { fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text)", margin: 0, whiteSpace: "pre" };
const mono = { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" };
