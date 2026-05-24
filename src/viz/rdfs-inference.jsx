// rdfs-inference — toggle facts and watch derived facts appear via
// subClassOf transitivity, subPropertyOf, domain/range, and an OWL
// transitive property example.
import { useMemo, useState } from "react";

const W = 540, H = 320;

const SUBCLASS = [
  ["Manager", "Employee"],
  ["Employee", "Person"],
  ["Customer", "Person"],
];
const SUBPROP = [
  ["reports", "knows"],
];
const PROPS = {
  salary: { domain: "Employee", range: "Decimal" },
  reports: { domain: "Employee", range: "Manager" },
  hasAncestor: { transitive: true },
};

const ASSERTED_INIT = [
  ["anna", "type", "Manager"],
  ["bob", "type", "Employee"],
  ["anna", "salary", 50000],
  ["anna", "hasAncestor", "beata"],
  ["beata", "hasAncestor", "cecilie"],
];

function transitive(start, pairs) {
  const idx = new Map();
  for (const [a, b] of pairs) {
    if (!idx.has(a)) idx.set(a, new Set());
    idx.get(a).add(b);
  }
  // BFS closure
  const out = new Set();
  const stack = [start];
  while (stack.length) {
    const cur = stack.pop();
    if (idx.has(cur)) for (const n of idx.get(cur)) if (!out.has(n)) { out.add(n); stack.push(n); }
  }
  return [...out];
}

function infer(asserted) {
  const derived = [];
  const seen = new Set(asserted.map(t => JSON.stringify(t)));
  function add(t) {
    const k = JSON.stringify(t);
    if (!seen.has(k)) { seen.add(k); derived.push(t); }
  }
  // 1. subClassOf transitivity
  for (const [s, p, o] of asserted) {
    if (p === "type") {
      for (const sup of transitive(o, SUBCLASS)) add([s, "type", sup]);
    }
  }
  // 2. domain/range
  for (const [s, p, o] of asserted) {
    if (PROPS[p]?.domain) {
      add([s, "type", PROPS[p].domain]);
      for (const sup of transitive(PROPS[p].domain, SUBCLASS)) add([s, "type", sup]);
    }
    if (PROPS[p]?.range && typeof o === "string") {
      add([o, "type", PROPS[p].range]);
      for (const sup of transitive(PROPS[p].range, SUBCLASS)) add([o, "type", sup]);
    }
  }
  // 3. subPropertyOf
  for (const [s, p, o] of asserted) {
    for (const sup of transitive(p, SUBPROP)) add([s, sup, o]);
  }
  // 4. transitive properties — owl:TransitiveProperty
  for (const [prop, info] of Object.entries(PROPS)) {
    if (info.transitive) {
      const idx = new Map();
      for (const [s, p, o] of asserted) {
        if (p === prop) {
          if (!idx.has(s)) idx.set(s, new Set());
          idx.get(s).add(o);
        }
      }
      for (const [s] of idx) {
        for (const reach of transitive(s, asserted.filter(t => t[1] === prop).map(t => [t[0], t[2]]))) {
          if (reach !== s) add([s, prop, reach]);
        }
      }
    }
  }
  return derived;
}

export default function RdfsInference() {
  const [asserted, setAsserted] = useState(ASSERTED_INIT);

  const derived = useMemo(() => infer(asserted), [asserted]);

  const allFacts = [...asserted.map(t => ({ t, kind: "asserted" })), ...derived.map(t => ({ t, kind: "derived" }))];

  function toggleType(s, type) {
    const exists = asserted.some(t => t[0] === s && t[1] === "type" && t[2] === type);
    if (exists) setAsserted(asserted.filter(t => !(t[0] === s && t[1] === "type" && t[2] === type)));
    else setAsserted([...asserted, [s, "type", type]]);
  }

  const subjects = ["anna", "bob", "carol", "dave"];
  const types = ["Manager", "Employee", "Customer", "Person"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "auto repeat(4, 1fr)", gap: 4, fontFamily: "var(--font-mono)", fontSize: 11 }}>
        <span></span>
        {types.map(t => <span key={t} style={{ color: "var(--text-muted)", textAlign: "center" }}>{t}</span>)}
        {subjects.map(s => (
          <>
            <span key={`s-${s}`} style={{ color: "var(--text-muted)" }}>{s}</span>
            {types.map(t => {
              const asserted_ = asserted.some(tr => tr[0] === s && tr[1] === "type" && tr[2] === t);
              const derived_ = !asserted_ && derived.some(tr => tr[0] === s && tr[1] === "type" && tr[2] === t);
              return (
                <button key={`${s}-${t}`} onClick={() => toggleType(s, t)}
                  style={{ fontFamily: "var(--font-mono)", fontSize: 10, padding: "1px 4px",
                    background: asserted_ ? "var(--accent)" : derived_ ? "oklch(0.65 0.16 145 / 0.4)" : "var(--bg-inset)",
                    color: asserted_ ? "var(--bg-card)" : "var(--text)",
                    border: "1px solid var(--line-strong)", borderRadius: 3, cursor: "pointer" }}>
                  {asserted_ ? "● asserted" : derived_ ? "↳ derived" : "+ add"}
                </button>
              );
            })}
          </>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {/* Class hierarchy diagram */}
        <g transform="translate(20, 16)">
          <text x={0} y={0} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">RDFS class hierarchy</text>
          <g transform="translate(60, 12)">
            <rect x={0} y={0} width={80} height={20} fill="var(--bg-inset)" stroke="var(--accent)" />
            <text x={40} y={14} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">Person</text>

            <line x1={20} y1={20} x2={20} y2={40} stroke="var(--line)" />
            <line x1={60} y1={20} x2={60} y2={40} stroke="var(--line)" />

            <rect x={-30} y={40} width={80} height={20} fill="var(--bg-inset)" stroke="var(--accent)" />
            <text x={10} y={54} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">Employee</text>

            <rect x={70} y={40} width={80} height={20} fill="var(--bg-inset)" stroke="var(--accent)" />
            <text x={110} y={54} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">Customer</text>

            <line x1={10} y1={60} x2={10} y2={80} stroke="var(--line)" />

            <rect x={-30} y={80} width={80} height={20} fill="var(--bg-inset)" stroke="var(--accent)" />
            <text x={10} y={94} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">Manager</text>
          </g>
          <text x={0} y={130} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">subClassOf:</text>
          <text x={0} y={144} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">Manager ⊂ Employee</text>
          <text x={0} y={158} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">Employee ⊂ Person</text>
          <text x={0} y={172} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">Customer ⊂ Person</text>
        </g>

        {/* Facts list */}
        <g transform={`translate(${W / 2 - 20}, 16)`}>
          <text x={0} y={0} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">facts</text>
          {allFacts.slice(0, 18).map((f, i) => (
            <g key={i}>
              <text x={0} y={16 + i * 13} fontSize="9.5" fontFamily="var(--font-mono)" fill={f.kind === "asserted" ? "var(--accent)" : "oklch(0.65 0.16 145)"}>
                {f.kind === "asserted" ? "●" : "↳"} {f.t[0]} {f.t[1]} {String(f.t[2])}
              </text>
            </g>
          ))}
          {allFacts.length > 18 && (
            <text x={0} y={16 + 18 * 13} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">… +{allFacts.length - 18} more</text>
          )}
        </g>
      </svg>

      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
        <div>● {asserted.length} asserted · ↳ {derived.length} derived</div>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        RDFS rules: (1) subClassOf transitivity propagates `type` upward; (2) `salary` has domain Employee → using it implies subject is Employee; (3) range Manager propagates similarly;
        (4) owl:TransitiveProperty closes `hasAncestor` (anna → beata → cecilie ⇒ anna → cecilie). Toggle a class to see derivations recompute.
      </div>
    </div>
  );
}
