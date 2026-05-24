// gpu-warp-divergence — 32-thread warp with branchy code. Slider for
// how many threads take if-branch; cycles + masked lanes shown.
import { useState } from "react";

const WARP_SIZE = 32;

export default function GpuWarpDivergence() {
  const [splitN, setSplitN] = useState(16);
  const [sortFirst, setSortFirst] = useState(false);
  const [pattern, setPattern] = useState("split");

  // pattern = "split": first splitN take branch, rest else (already grouped)
  // pattern = "alt": alternating, worst-case
  // pattern = "random": random
  // pattern = "uniform": all same (best)
  let activeIf = [];
  if (pattern === "split") activeIf = Array.from({ length: WARP_SIZE }, (_, i) => i < splitN);
  else if (pattern === "alt") activeIf = Array.from({ length: WARP_SIZE }, (_, i) => i % 2 === 0);
  else if (pattern === "random") {
    let r = 17;
    activeIf = Array.from({ length: WARP_SIZE }, () => {
      r = (r * 1664525 + 1013904223) >>> 0;
      return (r & 1) === 1;
    });
  } else if (pattern === "uniform") {
    activeIf = Array.from({ length: WARP_SIZE }, () => true);
  }
  // sort first?
  if (sortFirst) activeIf = [...activeIf].sort((a, b) => (b ? 1 : 0) - (a ? 1 : 0));

  const nIf = activeIf.filter(x => x).length;
  const nElse = WARP_SIZE - nIf;
  // SIMT model: branch divergence forces serial execution of both paths if both exist within a warp
  const bothNeeded = nIf > 0 && nElse > 0;
  const cyclesBranch = bothNeeded ? 2 : 1;
  const baseCycles = 1; // uniform code
  const slowdown = cyclesBranch;

  const W = 580, H = 280;
  const cell = (W - 60) / WARP_SIZE - 1;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
        <select value={pattern} onChange={e => setPattern(e.target.value)} style={ctrl}>
          <option value="split">grouped split (slider)</option>
          <option value="alt">alternating (worst)</option>
          <option value="random">random</option>
          <option value="uniform">uniform (best)</option>
        </select>
        {pattern === "split" && (
          <label style={{ display: "flex", flexDirection: "column", color: "var(--text)", fontSize: 11 }}>
            split: {splitN}/{WARP_SIZE}
            <input type="range" min={0} max={WARP_SIZE} value={splitN} onChange={e => setSplitN(+e.target.value)} style={{ width: 120 }} />
          </label>
        )}
        <label style={{ display: "flex", gap: 4, alignItems: "center", color: "var(--text)", fontSize: 11 }}>
          <input type="checkbox" checked={sortFirst} onChange={e => setSortFirst(e.target.checked)} /> sort data first
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        <text x={20} y={20} fontSize="11" fill="var(--text)" fontWeight="600">32-thread warp — řeší if-else (PC = společný):</text>

        {/* Phase 1: if-branch (active threads do work, others masked) */}
        <text x={20} y={50} fontSize="10" fill="var(--text-muted)">phase 1: compute_A() — active = if-branch</text>
        {activeIf.map((on, i) => (
          <g key={"p1" + i}>
            <rect x={30 + i * (cell + 1)} y={58} width={cell} height={28}
              fill={on ? "oklch(0.65 0.16 145 / 0.6)" : "var(--bg-inset)"}
              stroke={on ? "oklch(0.65 0.16 145)" : "var(--text-faint)"}
              strokeDasharray={on ? "" : "2 2"} rx="1.5" />
            <text x={30 + i * (cell + 1) + cell / 2} y={76} textAnchor="middle" fontSize="7.5"
              fill={on ? "white" : "var(--text-faint)"} fontWeight="600">{on ? "✓" : "—"}</text>
          </g>
        ))}

        {/* Phase 2: else-branch */}
        <text x={20} y={108} fontSize="10" fill="var(--text-muted)">
          phase 2: compute_B() {!bothNeeded ? "(skip — žádný thread není v else)" : ""}
        </text>
        {bothNeeded && activeIf.map((on, i) => (
          <g key={"p2" + i}>
            <rect x={30 + i * (cell + 1)} y={116} width={cell} height={28}
              fill={!on ? "oklch(0.65 0.18 22 / 0.6)" : "var(--bg-inset)"}
              stroke={!on ? "oklch(0.65 0.18 22)" : "var(--text-faint)"}
              strokeDasharray={!on ? "" : "2 2"} rx="1.5" />
            <text x={30 + i * (cell + 1) + cell / 2} y={134} textAnchor="middle" fontSize="7.5"
              fill={!on ? "white" : "var(--text-faint)"} fontWeight="600">{!on ? "✓" : "—"}</text>
          </g>
        ))}

        <g fontSize="11" fill="var(--text)">
          <text x={20} y={170} fontWeight="600">
            stav: {nIf} threadů do if, {nElse} do else.
          </text>
          <text x={20} y={188} fill="var(--text-muted)">
            {bothNeeded ? `Oba paths se vykonají sériově: 2 cyklů (50% maskováno v každém) → ${slowdown}× pomalejší než uniform.`
                       : "Všechny thready stejně → bez divergence, 1 cyklus."}
          </text>
        </g>

        {/* Slowdown bar */}
        <text x={20} y={216} fontSize="10.5" fill="var(--text)" fontWeight="600">relativní čas:</text>
        <rect x={20} y={224} width={500} height={20} fill="var(--bg-inset)" stroke="var(--line)" rx="2" />
        <rect x={20} y={224} width={500 * (cyclesBranch / 2)} height={20}
          fill={bothNeeded ? "oklch(0.65 0.18 22)" : "oklch(0.65 0.16 145)"} rx="2" />
        <text x={270} y={237} textAnchor="middle" fontSize="10" fill="white" fontWeight="600">
          {bothNeeded ? `${slowdown}× pomalejší` : "uniform — žádný overhead"}
        </text>

        <text x={20} y={H - 12} fontSize="9.5" fill="var(--text-faint)">
          Mitigace: 1) seřaď data před launch — divergující thready se sjednotí; 2) přepiš if-else na arithmetic (ternar bez branche).
        </text>
      </svg>
    </div>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "3px 6px", borderRadius: 3, fontSize: 11 };
