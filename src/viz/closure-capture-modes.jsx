// Fn / FnMut / FnOnce — what's captured and how.
import { useState } from "react";

const MODES = {
  Fn: {
    code: `let s = String::from("hi");
let f = || println!("{}", s);
f();  // ok
f();  // ok — call multiple times`,
    cap: "& (imm borrow)",
    canCallTwice: true,
    movesS: false,
    note: "Fn captures by &; readable multiple times.",
  },
  FnMut: {
    code: `let mut s = String::from("hi");
let mut f = || s.push_str("!");
f();   // s = "hi!"
f();   // s = "hi!!" — needs &mut`,
    cap: "&mut",
    canCallTwice: true,
    movesS: false,
    note: "FnMut captures by &mut; can mutate captured.",
  },
  FnOnce: {
    code: `let s = String::from("hi");
let f = move || drop(s);  // takes ownership
f();   // ok
// f();  // ERROR — s already dropped`,
    cap: "by value (move)",
    canCallTwice: false,
    movesS: true,
    note: "FnOnce consumes captured by value; can only run once.",
  },
};

export default function ClosureCaptureModes() {
  const [mode, setMode] = useState("Fn");
  const cur = MODES[mode];

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>mode:</label>
        {Object.keys(MODES).map((m) => (
          <button key={m} style={mode === m ? btnOn : btn} onClick={() => setMode(m)}>{m}</button>
        ))}
      </div>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <pre style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text)", margin: 0, whiteSpace: "pre" }}>{cur.code}</pre>
      </div>

      <svg viewBox="0 0 540 160" style={{ width: "100%", maxWidth: 600, background: "var(--bg-inset)", borderRadius: 6 }}>
        <rect x="40" y="40" width="120" height="60" rx="6" fill="var(--bg-card)" stroke="rgb(64,140,220)" strokeWidth="1.5" />
        <text x="100" y="64" fontSize="11" textAnchor="middle" fill="var(--text)">s : String</text>
        <text x="100" y="84" fontSize="10" textAnchor="middle" fill={cur.movesS ? "rgb(220,80,80)" : "rgb(64,140,220)"} fontFamily="var(--font-mono)">
          {cur.movesS ? "MOVED" : "owned"}
        </text>

        <path d={`M 160 70 Q 220 100 280 70`} stroke="var(--accent)" strokeWidth="1.5" fill="none" markerEnd="url(#aCC)" />
        <text x="220" y="80" fontSize="10" textAnchor="middle" fill="var(--accent)">{cur.cap}</text>

        <rect x="280" y="40" width="140" height="60" rx="6" fill="var(--bg-card)" stroke={cur.movesS ? "rgb(220,80,80)" : "var(--accent)"} strokeWidth="1.5" />
        <text x="350" y="64" fontSize="11" textAnchor="middle" fill="var(--text)">closure f</text>
        <text x="350" y="82" fontSize="10" textAnchor="middle" fill="var(--accent)" fontFamily="var(--font-mono)">trait: {mode}</text>

        <defs>
          <marker id="aCC" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)" />
          </marker>
        </defs>

        <text x="100" y="130" fontSize="10" textAnchor="middle" fill="var(--text-muted)">captured</text>
        <text x="350" y="130" fontSize="10" textAnchor="middle" fill="var(--text-muted)">callable: {cur.canCallTwice ? "vícekrát" : "jen 1× (FnOnce)"}</text>
      </svg>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{cur.note}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {Object.entries(MODES).map(([k, v]) => (
          <div key={k} style={{
            padding: 10, borderRadius: 6,
            background: k === mode ? "rgba(64,140,220,0.18)" : "var(--bg-inset)",
            border: `1px solid ${k === mode ? "var(--accent)" : "var(--line)"}`,
          }}>
            <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>{k}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, fontFamily: "var(--font-mono)" }}>capture: {v.cap}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>multi-call: {v.canCallTwice ? "✓" : "✗"}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Compiler vyberá <em>nejméně omezující</em> trait podle toho, co closure body skutečně dělá. Hierarchie: <code style={mono}>FnOnce ⊃ FnMut ⊃ Fn</code> — Fn implies FnMut implies FnOnce.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const btnOn = { ...btn, background: "var(--accent)", color: "var(--bg-card)", borderColor: "var(--accent)" };
const mono = { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" };
