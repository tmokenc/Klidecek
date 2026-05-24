// bank-conflict-warp — shared memory 32 banks, warp access pattern,
// serialization shown.
import { useState } from "react";

const N_BANKS = 32;

const PATTERNS = {
  noConflict: { label: "no conflict (T_i ↔ data[i])", get: i => i },
  conflict2:  { label: "2-way (T_i ↔ data[i*2])",     get: i => (i * 2) % N_BANKS },
  conflict4:  { label: "4-way (T_i ↔ data[i*4])",     get: i => (i * 4) % N_BANKS },
  conflict32: { label: "32-way (všichni do banku 0)",  get: () => 0 },
  padded:     { label: "padded col (T_i ↔ data[i][32]→bank i)", get: i => i },
  broadcast:  { label: "broadcast (čtení 1 hodnoty)",  get: () => 0, broadcast: true },
};

export default function BankConflictWarp() {
  const [patternKey, setPatternKey] = useState("noConflict");
  const pattern = PATTERNS[patternKey];
  const banks = Array.from({ length: 32 }, (_, i) => pattern.get(i));
  const counts = new Array(N_BANKS).fill(0);
  banks.forEach(b => counts[b]++);
  const maxLoad = Math.max(...counts);
  const cycles = pattern.broadcast ? 1 : maxLoad;
  const efficiency = 1 / cycles;

  const W = 580, H = 280;
  const bankW = (W - 60) / N_BANKS - 1;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
        <select value={patternKey} onChange={e => setPatternKey(e.target.value)} style={ctrl}>
          {Object.entries(PATTERNS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          cyklů: <b style={{ color: cycles === 1 ? "oklch(0.65 0.16 145)" : "oklch(0.65 0.18 22)" }}>{cycles}</b>
          {" "} (1 = bez konfliktu)
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        <text x={20} y={20} fontSize="11" fill="var(--text)" fontWeight="600">32 threadů → bank index:</text>
        {banks.map((b, i) => (
          <g key={i}>
            <line x1={30 + i * (bankW + 1) + bankW / 2} y1={28} x2={30 + b * (bankW + 1) + bankW / 2} y2={70}
              stroke={counts[b] > 1 && !pattern.broadcast ? "oklch(0.65 0.18 22)" : "oklch(0.65 0.16 145)"} strokeWidth="0.6" opacity={0.6} />
            <rect x={30 + i * (bankW + 1)} y={26} width={bankW} height={14}
              fill="var(--bg-inset)" stroke="var(--line)" rx="1" />
            <text x={30 + i * (bankW + 1) + bankW / 2} y={37} textAnchor="middle" fontSize="6" fill="var(--text-muted)">T{i}</text>
          </g>
        ))}

        <text x={20} y={86} fontSize="11" fill="var(--text)" fontWeight="600">32 bank (každý 1 servis/cyklus):</text>
        {Array.from({ length: N_BANKS }).map((_, b) => (
          <g key={b}>
            <rect x={30 + b * (bankW + 1)} y={92} width={bankW} height={20}
              fill={counts[b] === 0 ? "var(--bg-inset)" :
                    counts[b] === 1 ? "oklch(0.65 0.16 145 / 0.5)" :
                    pattern.broadcast ? "oklch(0.7 0.15 60 / 0.5)" : "oklch(0.65 0.18 22 / 0.5)"}
              stroke={counts[b] === 0 ? "var(--text-faint)" :
                      counts[b] === 1 ? "oklch(0.65 0.16 145)" :
                      pattern.broadcast ? "oklch(0.7 0.15 60)" : "oklch(0.65 0.18 22)"} rx="1" />
            <text x={30 + b * (bankW + 1) + bankW / 2} y={106} textAnchor="middle" fontSize="7" fill="var(--text)" fontWeight="600">
              {counts[b]}
            </text>
          </g>
        ))}

        <g fontSize="10.5" fill="var(--text)">
          <text x={20} y={140}>
            {cycles === 1
              ? "✓ 1 cyklus — žádný konflikt"
              : pattern.broadcast
                ? "✓ broadcast: stejná adresa → HW vrátí všem threadům za 1 cyklus"
                : `✗ ${cycles}-way bank conflict → serializace ${cycles}× pomalejší`}
          </text>
        </g>

        {/* Cycles bar */}
        <text x={20} y={170} fontSize="10.5" fill="var(--text)" fontWeight="600">relativní čas:</text>
        <rect x={20} y={178} width={500} height={20} fill="var(--bg-inset)" stroke="var(--line)" rx="2" />
        <rect x={20} y={178} width={500 * (cycles / 8)} height={20}
          fill={cycles === 1 ? "oklch(0.65 0.16 145)" : "oklch(0.65 0.18 22)"} rx="2" />
        <text x={270} y={191} textAnchor="middle" fontSize="10" fill="white" fontWeight="600">{cycles} cyklů</text>

        <text x={20} y={222} fontSize="10" fill="var(--text-muted)">
          Padding fix: __shared__ float data[32][33] (33 namísto 32) odsune adresy o 1 bank → každý thread jiný bank.
        </text>
        <text x={20} y={H - 8} fontSize="9.5" fill="var(--text-faint)">
          Detekce: Nsight Compute `shared_load_bank_conflict` counter. Příčina obvykle column-major přístup s šířkou 32.
        </text>
      </svg>
    </div>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "3px 6px", borderRadius: 3, fontSize: 11 };
