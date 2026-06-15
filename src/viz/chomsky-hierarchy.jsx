// Chomského hierarchie — průvodce. Pro každý vybraný jazyk se ukáže nejnižší
// třída, do které patří, jaký akceptor ji rozhoduje, a důkaz "proč ne nižší".
import { useState } from "react";

const LANGS = [
  {
    name: "{a*}",
    classLevel: 3,
    automaton: "DKA — 1 stav",
    why: "Triviálně regulární. Jediný stav přijímá libovolný počet a.",
  },
  {
    name: "{w ∈ {0,1}* : w končí 011}",
    classLevel: 3,
    automaton: "DKA — 4 stavy",
    why: "Regulární. Stav pamatuje 'posledně viděný sufix' (4 možnosti: ε, 0, 01, 011).",
  },
  {
    name: "{w : #a(w) sudý}",
    classLevel: 3,
    automaton: "DKA — 2 stavy",
    why: "Stav = parita počtu a. Regulární.",
  },
  {
    name: "{a^n b^n : n ≥ 0}",
    classLevel: 2,
    automaton: "PDA — zásobník počítá rozdíl",
    why: "Není regulární (pumping pro x = a^p, y = a^k → xy²z = a^{p+k} b^p ∉ L). Bezkontextový: S → aSb | ε.",
  },
  {
    name: "{w w^R : w ∈ {a,b}*} (palindromy)",
    classLevel: 2,
    automaton: "NPDA — nedeterministický PDA",
    why: "Není regulární. Bezkontextový (NPDA). NENÍ deterministicky bezkontextový (DPDA nestačí — neumí 'uhodnout střed').",
  },
  {
    name: "{w : #a(w) = #b(w)}",
    classLevel: 2,
    automaton: "PDA — zásobník udržuje saldo",
    why: "Není regulární (analogicky a^n b^n). Bezkontextový: S → aSb | bSa | SS | ε.",
  },
  {
    name: "{a^n b^n c^n : n ≥ 1}",
    classLevel: 1,
    automaton: "LBA — lineárně omezený TS",
    why: "Není bezkontextový (CFG pumping: vwx pokryje max 2 symboly; pumpování poruší rovnost). Kontextový: gramatika s CB → BC.",
  },
  {
    name: "{w w : w ∈ {a,b}*}",
    classLevel: 1,
    automaton: "LBA",
    why: "Není bezkontextový. Kontextový: lze ověřit lineárním prostorem (porovnat dvě půlky).",
  },
  {
    name: "{a^q : q prvočíslo}",
    classLevel: 1,
    automaton: "LBA — test prvočíselnosti",
    why: "Není regulární (pumping s i = r+1). Není bezkontextový (důkaz CFG-pumping). Lze rozhodnout LBA — test prvočíselnosti v lineárním prostoru.",
  },
  {
    name: "L_HP (problém zastavení)",
    classLevel: 0,
    automaton: "TS — částečně rozhoduje",
    why: "RE: TS simuluje vstupní M na w, přijme když zastaví. NENÍ rekurzivní (Turing 1936). Tedy v L₀ \\ R, mimo L₁ (L₁ ⊆ R).",
  },
  {
    name: "co-HP (TS nezastaví)",
    classLevel: -1,
    automaton: "žádný TS",
    why: "NENÍ ani RE. Kdyby byl, pak L_HP by byl R (paralelní spuštění). Mimo Chomského hierarchii.",
  },
];

const CLASSES = [
  { lvl: 3, name: "L₃", longName: "regulární", color: "#81b29a" },
  { lvl: 2, name: "L₂", longName: "bezkontextové", color: "#f2cc8f" },
  { lvl: 1, name: "L₁", longName: "kontextové", color: "#e07a5f" },
  { lvl: 0, name: "L₀ = RE", longName: "rekurzivně vyčíslitelné", color: "#3d5a80" },
];

export default function ChomskyHierarchy() {
  const [idx, setIdx] = useState(3);
  const L = LANGS[idx];

  const CX = 270, CY = 130, W = 480, H = 200;
  const sizes = [
    { lvl: 0, w: W, h: H },
    { lvl: 1, w: W * 0.78, h: H * 0.78 },
    { lvl: 2, w: W * 0.56, h: H * 0.56 },
    { lvl: 3, w: W * 0.32, h: H * 0.32 },
  ];

  function fillFor(lvl) {
    if (L.classLevel === -1) return "transparent";
    if (lvl === L.classLevel) return "color-mix(in oklch, var(--accent) 30%, var(--bg-card))";
    return "transparent";
  }

  return (
    <div style={containerStyle}>
      <div className="viz-controls">
        <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Jazyk:</label>
        <select className="viz-select" value={idx} onChange={(e) => setIdx(+e.target.value)} style={{ flex: 1 }}>
          {LANGS.map((l, i) => <option key={i} value={i}>{l.name}</option>)}
        </select>
      </div>

      <svg viewBox={`0 0 540 280`} style={{ width: "100%", maxWidth: 620, alignSelf: "center" }} fontFamily="var(--font-mono, ui-monospace)" fontSize="11">
        {/* nested rectangles */}
        {sizes.map((s) => {
          const cls = CLASSES.find((c) => c.lvl === s.lvl);
          const isThis = L.classLevel === s.lvl;
          return (
            <g key={s.lvl}>
              <rect
                x={CX - s.w / 2}
                y={CY - s.h / 2}
                width={s.w}
                height={s.h}
                rx={12}
                fill={fillFor(s.lvl)}
                stroke={cls.color}
                strokeWidth={isThis ? 2.5 : 1.2}
              />
              <text
                x={CX - s.w / 2 + 8}
                y={CY - s.h / 2 + 16}
                fill={cls.color}
                fontSize="11"
                fontWeight={isThis ? "bold" : "normal"}
              >
                {cls.name} — {cls.longName}
              </text>
            </g>
          );
        })}

        {/* universe box "all languages" */}
        <rect x={20} y={20} width={500} height={240} fill="none" stroke="var(--line)" strokeDasharray="4 3" rx={8} />
        <text x={30} y={254} fill="var(--text-faint)" fontSize="10">všechny jazyky nad Σ*</text>

        {/* dot for the selected language */}
        {L.classLevel === -1 ? (
          <g>
            <circle cx={CX} cy={245} r={8} fill="var(--accent)" />
            <text x={CX + 14} y={249} fill="var(--accent)">{L.name} (mimo RE)</text>
          </g>
        ) : (
          (() => {
            const s = sizes.find((x) => x.lvl === L.classLevel);
            // place dot just inside the box (slightly toward center from corner of inner exclusion)
            const innerSize = sizes.find((x) => x.lvl === L.classLevel - 1);
            const dotY = innerSize ? CY + innerSize.h / 2 + 14 : CY;
            return (
              <g>
                <circle cx={CX} cy={dotY} r={6} fill="var(--accent)" />
                <text x={CX + 12} y={dotY + 4} fill="var(--accent)" fontSize="10">{L.name}</text>
              </g>
            );
          })()
        )}
      </svg>

      <div style={{ padding: 10, background: "var(--bg-inset)", borderRadius: 8, fontSize: 12 }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: "var(--text-muted)" }}>Třída: </span>
          {L.classLevel >= 0 ? (
            <span style={{ color: CLASSES.find((c) => c.lvl === L.classLevel).color, fontWeight: "bold" }}>
              {CLASSES.find((c) => c.lvl === L.classLevel).name} ({CLASSES.find((c) => c.lvl === L.classLevel).longName})
            </span>
          ) : (
            <span style={{ color: "var(--accent)" }}>mimo RE</span>
          )}
        </div>
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: "var(--text-muted)" }}>Akceptor: </span>
          <span style={{ color: "var(--text)" }}>{L.automaton}</span>
        </div>
        <div style={{ color: "var(--text-muted)" }}>{L.why}</div>
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
