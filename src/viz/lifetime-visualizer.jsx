// Lifetimes on a time axis — references must end before owner drops.
import { useState } from "react";

const SCENARIOS = {
  ok: {
    title: "OK — borrow ends before drop",
    bindings: [
      { name: "s", kind: "owner", from: 0, to: 8 },
      { name: "r", kind: "borrow", from: 2, to: 6, of: "s" },
    ],
    err: "",
  },
  bad_dangling: {
    title: "BAD — borrow přežívá owner",
    bindings: [
      { name: "x", kind: "owner", from: 1, to: 4 },
      { name: "r", kind: "borrow", from: 2, to: 8, of: "x" },
    ],
    err: "ERROR: `x` does not live long enough — `r` is used at t=7 but `x` dropped at t=4",
  },
  nll: {
    title: "NLL — borrow končí poslední použití",
    bindings: [
      { name: "s", kind: "owner", from: 0, to: 8 },
      { name: "r1", kind: "borrow", from: 1, to: 3, of: "s", note: "imm — last use t=3" },
      { name: "r2", kind: "borrow-mut", from: 4, to: 6, of: "s", note: "&mut OK po r1 končí" },
    ],
    err: "",
  },
  conflict: {
    title: "BAD — imm + mut překryv",
    bindings: [
      { name: "s", kind: "owner", from: 0, to: 8 },
      { name: "r1", kind: "borrow", from: 2, to: 6, of: "s" },
      { name: "r2", kind: "borrow-mut", from: 3, to: 5, of: "s" },
    ],
    err: "ERROR: cannot borrow `s` as mutable because it is also borrowed as immutable (t=3..5)",
  },
  static: {
    title: "'static — celé trvání programu",
    bindings: [
      { name: "main", kind: "owner", from: 0, to: 10 },
      { name: "STR", kind: "static", from: 0, to: 10, note: "&'static str = \"hi\"" },
    ],
    err: "",
  },
};

export default function LifetimeVisualizer() {
  const [s, setS] = useState("ok");
  const cur = SCENARIOS[s];
  const W = 540, H = 60 + cur.bindings.length * 36;
  const tMax = 10;
  const tx = (t) => 100 + (t / tMax) * (W - 130);

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>scénář:</label>
        <select value={s} onChange={(e) => setS(e.target.value)} style={sel}>
          {Object.entries(SCENARIOS).map(([k, v]) => <option key={k} value={k}>{v.title}</option>)}
        </select>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 600, background: "var(--bg-inset)", borderRadius: 6 }}>
        {/* time axis */}
        <line x1={100} y1={H - 18} x2={W - 30} y2={H - 18} stroke="var(--text-muted)" strokeWidth="1" />
        {Array.from({ length: tMax + 1 }, (_, i) => (
          <g key={i}>
            <line x1={tx(i)} y1={H - 22} x2={tx(i)} y2={H - 14} stroke="var(--text-muted)" strokeWidth="0.7" />
            <text x={tx(i)} y={H - 4} fontSize="9" textAnchor="middle" fill="var(--text-muted)">t{i}</text>
          </g>
        ))}
        {cur.bindings.map((b, i) => {
          const y = 30 + i * 36;
          const color = b.kind === "owner" ? "rgb(64,140,220)" : b.kind === "borrow" ? "rgb(64,192,87)" : b.kind === "borrow-mut" ? "rgb(220,140,80)" : "rgb(180,120,200)";
          return (
            <g key={i}>
              <text x={6} y={y + 14} fontSize="11" fill="var(--text)" fontFamily="var(--font-mono)">{b.name}</text>
              <rect x={tx(b.from)} y={y} width={tx(b.to) - tx(b.from)} height="22" rx="3" fill={color} opacity="0.85" />
              <text x={tx((b.from + b.to) / 2)} y={y + 15} fontSize="10" textAnchor="middle" fill="var(--bg-card)">
                {b.kind === "owner" ? "owns" : b.kind === "borrow" ? "&" + b.of : b.kind === "borrow-mut" ? "&mut " + b.of : "'static"}
              </text>
              {b.note && <text x={tx(b.to) + 6} y={y + 14} fontSize="9" fill="var(--text-muted)">{b.note}</text>}
            </g>
          );
        })}
      </svg>

      {cur.err
        ? <div style={{ background: "rgba(220,80,80,0.18)", padding: 10, borderRadius: 6, border: "1px solid rgb(220,80,80)" }}>
            <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgb(220,80,80)" }}>{cur.err}</code>
          </div>
        : <div style={{ background: "rgba(64,192,87,0.12)", padding: 10, borderRadius: 6, border: "1px solid rgb(64,192,87)" }}>
            <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgb(64,192,87)" }}>✓ borrow checker accepts</code>
          </div>
      }

      <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--text-muted)", flexWrap: "wrap" }}>
        <span><span style={{ display: "inline-block", width: 12, height: 10, background: "rgb(64,140,220)", marginRight: 4, verticalAlign: "middle" }}/> owner</span>
        <span><span style={{ display: "inline-block", width: 12, height: 10, background: "rgb(64,192,87)", marginRight: 4, verticalAlign: "middle" }}/> &amp; (imm borrow)</span>
        <span><span style={{ display: "inline-block", width: 12, height: 10, background: "rgb(220,140,80)", marginRight: 4, verticalAlign: "middle" }}/> &amp;mut</span>
        <span><span style={{ display: "inline-block", width: 12, height: 10, background: "rgb(180,120,200)", marginRight: 4, verticalAlign: "middle" }}/> &amp;'static</span>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Lifetime annotations <em>nezmění</em>, jak dlouho ref žije — jen <em>popisují vztahy</em> mezi referencemi. Borrow checker odmítne, pokud kombinace porušuje pravidla.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
