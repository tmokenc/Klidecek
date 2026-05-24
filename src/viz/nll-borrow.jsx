// NLL — borrow ends at last use vs end-of-scope.
import { useState } from "react";

const CODE = `let mut s = String::from("hi");
let r1 = &s;
println!("{}", r1);   // ← r1 LAST USE here
let r2 = &mut s;       // ← OK with NLL?
println!("{}", r2);`;

export default function NllBorrow() {
  const [nll, setNll] = useState(true);

  // Lifetime spans
  const spans = nll
    ? [
        { name: "s",  kind: "owner", from: 0, to: 5 },
        { name: "r1", kind: "borrow", from: 1, to: 3, of: "s", note: "končí na t=3 (last use)" },
        { name: "r2", kind: "borrow-mut", from: 3, to: 5, of: "s" },
      ]
    : [
        { name: "s",  kind: "owner", from: 0, to: 5 },
        { name: "r1", kind: "borrow", from: 1, to: 5, of: "s", note: "končí na konci scope" },
        { name: "r2", kind: "borrow-mut", from: 3, to: 5, of: "s", note: "KONFLIKT s r1!" },
      ];

  const ok = nll;
  const W = 540, H = 200;
  const tx = (t) => 80 + (t / 5) * (W - 110);

  return (
    <div style={ctn}>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <pre style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text)", margin: 0, whiteSpace: "pre" }}>{CODE}</pre>
      </div>

      <div style={row}>
        <label style={lbl}>borrow checker:</label>
        <button style={!nll ? btnOn : btn} onClick={() => setNll(false)}>pre-NLL (Rust 1.36-)</button>
        <button style={nll ? btnOn : btn} onClick={() => setNll(true)}>NLL (Rust 2018+)</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 600, background: "var(--bg-inset)", borderRadius: 6 }}>
        <line x1={80} y1={H - 18} x2={W - 30} y2={H - 18} stroke="var(--text-muted)" strokeWidth="1" />
        {["t0", "t1", "t2", "t3", "t4", "t5"].map((t, i) => (
          <g key={i}>
            <line x1={tx(i)} y1={H - 22} x2={tx(i)} y2={H - 14} stroke="var(--text-muted)" strokeWidth="0.7" />
            <text x={tx(i)} y={H - 4} fontSize="9" textAnchor="middle" fill="var(--text-muted)">{t}</text>
          </g>
        ))}
        <text x={tx(0)} y={H - 32} fontSize="8" textAnchor="middle" fill="var(--text-muted)">let s</text>
        <text x={tx(1)} y={H - 32} fontSize="8" textAnchor="middle" fill="var(--text-muted)">let r1</text>
        <text x={tx(3)} y={H - 32} fontSize="8" textAnchor="middle" fill="var(--text-muted)">let r2</text>
        <text x={tx(5)} y={H - 32} fontSize="8" textAnchor="middle" fill="var(--text-muted)">scope end</text>

        {spans.map((b, i) => {
          const y = 20 + i * 36;
          const color = b.kind === "owner" ? "rgb(64,140,220)" : b.kind === "borrow" ? "rgb(64,192,87)" : "rgb(220,140,80)";
          return (
            <g key={i}>
              <text x={6} y={y + 14} fontSize="11" fill="var(--text)" fontFamily="var(--font-mono)">{b.name}</text>
              <rect x={tx(b.from)} y={y} width={tx(b.to) - tx(b.from)} height="22" rx="3" fill={color} opacity="0.85" />
              <text x={tx((b.from + b.to) / 2)} y={y + 15} fontSize="10" textAnchor="middle" fill="var(--bg-card)">
                {b.kind === "owner" ? "owns" : b.kind === "borrow" ? "&" + b.of : "&mut " + b.of}
              </text>
              {b.note && <text x={tx(b.to) + 4} y={y + 14} fontSize="9" fill="var(--text-muted)">{b.note}</text>}
            </g>
          );
        })}
      </svg>

      <div style={{ background: ok ? "rgba(64,192,87,0.18)" : "rgba(220,80,80,0.18)", padding: 10, borderRadius: 6, border: `1px solid ${ok ? "rgb(64,192,87)" : "rgb(220,80,80)"}` }}>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: ok ? "rgb(64,192,87)" : "rgb(220,80,80)" }}>
          {ok ? "✓ NLL: r1 končí na t=3, r2 začíná na t=3 — borrows neoverlapují → OK" : "✗ pre-NLL: r1 lifetime do konce scope překrývá r2 → cannot borrow as mutable"}
        </code>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        <strong>Non-Lexical Lifetimes</strong> — borrow checker je <em>smarter</em>: borrow končí poslední <em>použití</em>, ne konec textového scope. Drastically more code compiles bez explicit dropů.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const btnOn = { ...btn, background: "var(--accent)", color: "var(--bg-card)", borderColor: "var(--accent)" };
