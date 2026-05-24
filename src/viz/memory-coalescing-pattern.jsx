// memory-coalescing-pattern — 32-thread warp; pattern selector (consec,
// stride-2, stride-8, random); transactions issued shown.
import { useState } from "react";

const WARP = 32;
const LINE_BYTES = 128; // GPU L2 line typical
const ELEM_BYTES = 4;

const PATTERNS = {
  consec: { label: "consecutive (T_i ↔ a[i])", get: i => i * ELEM_BYTES },
  s2:     { label: "stride 2 (T_i ↔ a[2i])",    get: i => i * ELEM_BYTES * 2 },
  s8:     { label: "stride 8 (T_i ↔ a[8i])",    get: i => i * ELEM_BYTES * 8 },
  s32:    { label: "stride 32 — kolumna",         get: i => i * ELEM_BYTES * 32 },
  random: { label: "random", get: (i, seed) => { let r = (seed + i * 2654435761) >>> 0; return ((r >>> 8) & 0x3FF) * ELEM_BYTES; } },
};

export default function MemoryCoalescingPattern() {
  const [patternKey, setPatternKey] = useState("consec");
  const [seed] = useState(11);
  const pattern = PATTERNS[patternKey];
  const addrs = Array.from({ length: WARP }, (_, i) => pattern.get(i, seed));
  const lines = new Set(addrs.map(a => Math.floor(a / LINE_BYTES)));
  const numTx = lines.size;
  const idealBytes = WARP * ELEM_BYTES;
  const actualBytes = numTx * LINE_BYTES;
  const efficiency = (idealBytes / actualBytes * 100).toFixed(0);

  const W = 580, H = 280;
  const cell = (W - 60) / WARP - 1;
  const lineMap = new Map();
  let idx = 0;
  for (const l of [...lines].sort((a, b) => a - b)) lineMap.set(l, idx++);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
        <select value={patternKey} onChange={e => setPatternKey(e.target.value)} style={ctrl}>
          {Object.entries(PATTERNS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          transakce: <b style={{ color: numTx === 1 ? "oklch(0.65 0.16 145)" : numTx >= 16 ? "oklch(0.65 0.18 22)" : "var(--accent)" }}>{numTx}</b>
        </span>
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          efektivita: {efficiency} %
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        <text x={20} y={20} fontSize="11" fill="var(--text)" fontWeight="600">32 threadů ve warpu — žádaná adresa:</text>

        {/* threads */}
        {addrs.map((a, i) => {
          const lineId = lineMap.get(Math.floor(a / LINE_BYTES));
          const hue = (lineId * 47) % 360;
          return (
            <g key={i}>
              <rect x={30 + i * (cell + 1)} y={30} width={cell} height={28}
                fill={`oklch(0.7 0.15 ${hue})`} opacity={0.7} stroke="var(--line)" rx="1.5" />
              <text x={30 + i * (cell + 1) + cell / 2} y={48} textAnchor="middle" fontSize="7"
                fill="white" fontWeight="600">T{i}</text>
            </g>
          );
        })}

        <text x={20} y={86} fontSize="11" fill="var(--text)" fontWeight="600">
          DRAM transakce (každá vrátí 128 B cache line):
        </text>
        {[...lines].sort((a, b) => a - b).map((l, i) => (
          <g key={l}>
            <rect x={30 + i * 40} y={96} width={36} height={30}
              fill={`oklch(0.7 0.15 ${(i * 47) % 360} / 0.4)`}
              stroke={`oklch(0.7 0.15 ${(i * 47) % 360})`} rx="2" />
            <text x={48 + i * 40} y={114} textAnchor="middle" fontSize="9"
              fontFamily="ui-monospace, monospace" fill="var(--text)">L{l}</text>
          </g>
        ))}

        <g fontSize="10.5" fill="var(--text)">
          <text x={20} y={160}>
            {numTx === 1 ? "✓ Plně coalesced: 1 transakce na celý warp (ideál)." :
             numTx <= 4 ? `kompromis: ${numTx} transakcí.` :
             `✗ Uncoalesced: ${numTx} transakcí — 32 threadů místo 1 line.`}
          </text>
          <text x={20} y={180} fill="var(--text-muted)" fontSize="9.5">
            Bandwidth efficiency = 32 × 4 B (chce se) / {numTx} × 128 B (vlastně se posílá) = {efficiency} %.
          </text>
        </g>

        {/* Eff bar */}
        <text x={20} y={210} fontSize="10.5" fill="var(--text)" fontWeight="600">bandwidth efektivita:</text>
        <rect x={20} y={218} width={500} height={20} fill="var(--bg-inset)" stroke="var(--line)" rx="2" />
        <rect x={20} y={218} width={500 * (parseInt(efficiency) / 100)} height={20}
          fill={parseInt(efficiency) > 80 ? "oklch(0.65 0.16 145)" : parseInt(efficiency) > 40 ? "var(--accent)" : "oklch(0.65 0.18 22)"} rx="2" />
        <text x={270} y={231} textAnchor="middle" fontSize="10" fill="white" fontWeight="600">{efficiency} %</text>

        <text x={20} y={H - 10} fontSize="9.5" fill="var(--text-faint)">
          Consecutive je ideální. Random/large stride efektivně serializuje paměťové přístupy → 32× šířky pásma.
        </text>
      </svg>
    </div>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "3px 6px", borderRadius: 3, fontSize: 11 };
