// Reduction wiring — schematicky ukazuje, jak se z ⟨M, w⟩ konstruuje nový TS M'
// pro různé cílové nerozhodnutelné problémy: L_M, {L=∅}, {L=Σ*}.
// Toggle "M zastaví na w" mění výsledek L(M') a tedy příslušnost k cílové množině.
import { useState } from "react";

const TARGETS = {
  "HP ≤ L_M (členství)": {
    cible: "L_M",
    testInput: "ε",
    desc: "Konstruujeme M', pak se ptáme: přijímá M' řetězec ε?",
    extra: null,
    onHalt: { LMprime: "Σ*", inTarget: true, note: "L(M') = Σ* obsahuje ε" },
    onLoop: { LMprime: "∅", inTarget: false, note: "L(M') = ∅ neobsahuje ε" },
  },
  "co-HP ≤ {L = ∅}": {
    cible: "{⟨M⟩ : L(M) = ∅}",
    testInput: null,
    desc: "Konstruujeme M', ptáme se: je L(M') prázdný?",
    extra: null,
    onHalt: { LMprime: "Σ*", inTarget: false, note: "L(M') = Σ* ≠ ∅, M' není v cíli" },
    onLoop: { LMprime: "∅", inTarget: true, note: "L(M') = ∅, M' je v cíli" },
  },
  "co-HP ≤ {L = Σ*}": {
    cible: "{⟨M⟩ : L(M) = Σ*}",
    testInput: null,
    desc: "M' má navíc strážní test y ∈ {a^n b^n c^n} (svědecký jazyk).",
    extra: "guard",
    onHalt: { LMprime: "Σ*", inTarget: true, note: "L(M') = Σ* (vše přijato)" },
    onLoop: { LMprime: "{a^n b^n c^n}", inTarget: false, note: "L(M') = svědek ≠ Σ*" },
  },
};

export default function ReductionWiring() {
  const [targetKey, setTargetKey] = useState("HP ≤ L_M (členství)");
  const target = TARGETS[targetKey];
  const [halts, setHalts] = useState(true);

  const outcome = halts ? target.onHalt : target.onLoop;

  return (
    <div style={containerStyle}>
      <div className="viz-controls">
        <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Redukce:</label>
        <select className="viz-select" value={targetKey} onChange={(e) => setTargetKey(e.target.value)}>
          {Object.keys(TARGETS).map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{target.desc}</div>

      <svg viewBox="0 0 540 250" style={{ width: "100%", maxWidth: 620, alignSelf: "center" }} fontFamily="var(--font-mono, ui-monospace)" fontSize="11">
        <defs>
          <marker id="arrRW" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)" />
          </marker>
        </defs>

        {/* Input port: y */}
        <g>
          <circle cx="30" cy="120" r="10" fill="var(--bg-inset)" stroke="var(--accent)" strokeWidth="1.4" />
          <text x="30" y="124" textAnchor="middle" fill="var(--accent)">y</text>
          <text x="30" y="100" textAnchor="middle" fill="var(--text-muted)" fontSize="10">vstup</text>
        </g>

        {/* M' box */}
        <rect x="80" y="30" width="380" height="180" rx="10" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.4" strokeDasharray="6 3" />
        <text x="270" y="50" textAnchor="middle" fill="var(--accent)" fontSize="13">M' (zkonstruovaný stroj)</text>

        {/* Internal: embed (M, w) as data */}
        <rect x="100" y="70" width="100" height="40" rx="6" fill="var(--bg-inset)" stroke="var(--line-strong)" />
        <text x="150" y="86" textAnchor="middle" fill="var(--text-muted)" fontSize="10">vložená data:</text>
        <text x="150" y="100" textAnchor="middle" fill="var(--text)" fontSize="11">⟨M, w⟩</text>

        {/* Optional guard for L=Σ* */}
        {target.extra === "guard" && (
          <>
            <rect x="100" y="130" width="120" height="40" rx="6" fill="var(--bg-inset)" stroke="var(--line-strong)" />
            <text x="160" y="146" textAnchor="middle" fill="var(--text-muted)" fontSize="10">strážní test:</text>
            <text x="160" y="160" textAnchor="middle" fill="var(--text)" fontSize="10">y ∈ {`{a^n b^n c^n}`}?</text>
            <line x1="40" y1="120" x2="100" y2="150" stroke="var(--accent)" strokeWidth="1.2" fill="none" markerEnd="url(#arrRW)" />
            <line x1="220" y1="150" x2="420" y2="100" stroke="#81b29a" strokeWidth="1.3" strokeDasharray="3 2" fill="none" markerEnd="url(#arrRW)" />
            <text x="320" y="120" fill="#81b29a" fontSize="10">ano → přijmout</text>
          </>
        )}

        {/* Simulator */}
        <rect x="240" y="80" width="140" height="50" rx="6" fill="var(--bg-inset)" stroke="var(--line-strong)" />
        <text x="310" y="100" textAnchor="middle" fill="var(--text-muted)" fontSize="10">univerzální simulace</text>
        <text x="310" y="116" textAnchor="middle" fill="var(--text)">U(⟨M⟩, w)</text>

        {/* Wires: y → simulator */}
        <line x1="40" y1="120" x2="100" y2="90" stroke="var(--accent)" strokeWidth="1.2" fill="none" markerEnd="url(#arrRW)" opacity={target.extra ? 0 : 1} />
        {/* M, w → simulator */}
        <line x1="200" y1="90" x2="240" y2="100" stroke="var(--text-muted)" strokeWidth="1" fill="none" markerEnd="url(#arrRW)" />

        {/* Decision after simulator */}
        <text x="310" y="148" textAnchor="middle" fill="var(--text-muted)" fontSize="10">
          {halts ? "zastaví →" : "cyklí →"}
        </text>

        {/* Output: accept */}
        <rect x="400" y="80" width="74" height="40" rx="6" fill={halts ? "color-mix(in oklch, #81b29a 30%, var(--bg-inset))" : "var(--bg-inset)"} stroke="#81b29a" strokeWidth="1.3" />
        <text x="437" y="103" textAnchor="middle" fontSize="9" fill={halts ? "#81b29a" : "var(--text-muted)"}>přijmout</text>
        {halts && <line x1="380" y1="105" x2="400" y2="100" stroke="#81b29a" strokeWidth="1.3" fill="none" markerEnd="url(#arrRW)" />}

        {/* Output: loop */}
        <rect x="400" y="150" width="50" height="40" rx="6" fill={!halts ? "color-mix(in oklch, #e07a5f 30%, var(--bg-inset))" : "var(--bg-inset)"} stroke="#e07a5f" strokeWidth="1.3" />
        <text x="425" y="173" textAnchor="middle" fill={!halts ? "#e07a5f" : "var(--text-muted)"}>cyklit</text>
        {!halts && <line x1="380" y1="125" x2="400" y2="160" stroke="#e07a5f" strokeWidth="1.3" fill="none" markerEnd="url(#arrRW)" />}

        {/* Outcome box */}
        <text x="30" y="225" fill="var(--text-muted)" fontSize="11">
          L(M') = <tspan fill="var(--accent)">{outcome.LMprime}</tspan>
        </text>
        <text x="200" y="225" fill="var(--text-muted)" fontSize="11">
          ⟨M'⟩ ∈ {target.cible}? <tspan fill={outcome.inTarget ? "#81b29a" : "#e07a5f"}>{outcome.inTarget ? "ANO" : "NE"}</tspan>
        </text>
      </svg>

      {/* Toggle: M halts or loops on w */}
      <div className="viz-controls" style={{ justifyContent: "center" }}>
        <span style={{ color: "var(--text-muted)" }}>Předpoklad:</span>
        <button className="viz-btn" data-active={halts} onClick={() => setHalts(true)} style={halts ? { background: "color-mix(in oklch, #81b29a 25%, var(--bg-inset))" } : undefined}>
          M zastaví na w
        </button>
        <button className="viz-btn" data-active={!halts} onClick={() => setHalts(false)} style={!halts ? { background: "color-mix(in oklch, #e07a5f 25%, var(--bg-inset))" } : undefined}>
          M cyklí na w
        </button>
      </div>

      <div style={{ padding: 10, background: "var(--bg-inset)", borderRadius: 8, fontSize: 12 }}>
        <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>Výsledek:</div>
        <div>{outcome.note}</div>
        <div style={{ marginTop: 6, color: outcome.inTarget ? "#81b29a" : "#e07a5f" }}>
          ⇒ Pokud bychom uměli rozhodnout {target.cible}, uměli bychom rozhodnout zastavení M na w {outcome.inTarget !== halts ? "(co-HP)" : "(HP)"}.
        </div>
      </div>
    </div>
  );
}

const containerStyle = {
  padding: 16,
  borderRadius: 12,
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

