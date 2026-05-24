// rowhammer-flip — DRAM grid; pick aggressor rows; hammer count rises;
// victim row bits flip. Toggle TRR / ECC defenses.
import { useState } from "react";

const ROWS = 7;
const COLS = 64;
// Victim row in the middle (3)
const VICTIM = 3;

function rng(seed) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export default function RowhammerFlip() {
  const [aggrTop, setAggrTop] = useState(false);
  const [aggrBot, setAggrBot] = useState(false);
  const [hammers, setHammers] = useState(0);
  const [trr, setTrr] = useState(false);
  const [ecc, setEcc] = useState(false);

  // Threshold: ~100k accesses to start flipping
  const baseFlipRate = (aggrTop ? 0.5 : 0) + (aggrBot ? 0.5 : 0);
  let effective = baseFlipRate * hammers;
  if (trr) effective *= 0.2; // TRR slows it (but not perfect)
  const flipsExpected = Math.max(0, (effective - 30_000) / 5_000);
  const flipCount = Math.min(COLS, Math.floor(flipsExpected));

  // Compute flipped bit positions (deterministic from hammers).
  const r = rng(7 + hammers);
  const flips = new Set();
  for (let i = 0; i < flipCount; i++) {
    flips.add(Math.floor(r() * COLS));
  }

  let outcome, color;
  if (flipCount === 0) {
    outcome = baseFlipRate > 0 ? "hammer accumuluje, ještě pod prahem" : "vyber alespoň jeden aggressor row";
    color = "var(--text-muted)";
  } else if (ecc) {
    outcome = flipCount <= 2 ? `✓ ECC: ${flipCount} flip(s) detected + corrected` :
              `⚠ ECC: ${flipCount} multi-bit flips — ECC may miss, kernel panic`;
    color = flipCount <= 2 ? "oklch(0.7 0.15 145)" : "oklch(0.65 0.18 22)";
  } else {
    outcome = `⚠ ${flipCount} bits flipped — útočník kontroluje page table entry → privilege escalation`;
    color = "oklch(0.65 0.18 22)";
  }

  const W = 580, H = 260;
  const cellSize = 7;
  const startX = 30;
  const startY = 25;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", alignItems: "center", fontSize: 11 }}>
        <label><input type="checkbox" checked={aggrTop} onChange={e => setAggrTop(e.target.checked)} /> aggressor row 2 (above)</label>
        <label><input type="checkbox" checked={aggrBot} onChange={e => setAggrBot(e.target.checked)} /> aggressor row 4 (below)</label>
        <button onClick={() => setHammers(h => h + 50_000)} style={btn(false)}>hammer +50k</button>
        <button onClick={() => setHammers(0)} style={btn(false)}>reset hammer</button>
        <label><input type="checkbox" checked={trr} onChange={e => setTrr(e.target.checked)} /> TRR</label>
        <label><input type="checkbox" checked={ecc} onChange={e => setEcc(e.target.checked)} /> ECC</label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* DRAM grid */}
        {Array.from({ length: ROWS }).map((_, r) => {
          const isAggrTop = r === 2 && aggrTop;
          const isAggrBot = r === 4 && aggrBot;
          const isAggr = isAggrTop || isAggrBot;
          const isVictim = r === VICTIM;
          return (
            <g key={r}>
              <text x={20} y={startY + r * (cellSize + 2) + cellSize - 1} fontSize="9" fill="var(--text-muted)" textAnchor="end">{r}</text>
              {Array.from({ length: COLS }).map((_, c) => {
                const flipped = isVictim && flips.has(c);
                let fill = "var(--bg-inset)";
                if (isAggr) fill = "oklch(0.65 0.18 22 / 0.7)";
                else if (isVictim) fill = flipped ? "oklch(0.6 0.2 25)" : "oklch(0.65 0.16 245 / 0.4)";
                return (
                  <rect key={c} x={startX + c * (cellSize + 1)} y={startY + r * (cellSize + 2)}
                    width={cellSize} height={cellSize} fill={fill} stroke="var(--line)" strokeWidth="0.3" />
                );
              })}
              <text x={startX + COLS * (cellSize + 1) + 6} y={startY + r * (cellSize + 2) + cellSize - 1} fontSize="9" fill={isAggr ? "oklch(0.65 0.18 22)" : isVictim ? "oklch(0.65 0.16 245)" : "var(--text-muted)"}>
                {isAggr ? "aggressor" : isVictim ? "victim" : ""}
              </text>
            </g>
          );
        })}

        {/* hammer stats */}
        <g fontFamily="ui-monospace, monospace" fontSize="10">
          <text x={20} y={110} fontFamily="ui-sans-serif, system-ui" fontWeight="700" fill="var(--text)">DRAM state</text>
          <text x={20} y={128} fill="var(--text)">accesses: {hammers.toLocaleString()}</text>
          <text x={20} y={142} fill="var(--text)">effective hammers: {effective.toLocaleString(undefined, { maximumFractionDigits: 0 })}</text>
          <text x={20} y={156} fill="var(--text)">flips: {flipCount}/{COLS}</text>
          {trr && <text x={20} y={170} fill="oklch(0.7 0.15 145)">TRR: refreshing suspicious rows</text>}
          {ecc && <text x={20} y={184} fill="oklch(0.65 0.16 245)">ECC: detect single-bit + correct</text>}
        </g>

        {/* legend */}
        <g fontSize="9.5">
          <rect x={300} y={120} width={10} height="10" fill="oklch(0.65 0.18 22 / 0.7)" />
          <text x={315} y={129} fill="var(--text-muted)">aggressor row (hammered)</text>
          <rect x={300} y={134} width={10} height="10" fill="oklch(0.65 0.16 245 / 0.4)" />
          <text x={315} y={143} fill="var(--text-muted)">victim row (between aggressors)</text>
          <rect x={300} y={148} width={10} height="10" fill="oklch(0.6 0.2 25)" />
          <text x={315} y={157} fill="var(--text-muted)">flipped bit (0↔1)</text>
        </g>

        {/* outcome */}
        <rect x={20} y={200} width={W - 40} height={42} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={W / 2} y={220} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>{outcome}</text>
        <text x={W / 2} y={235} textAnchor="middle" fontSize="9" fill="var(--text-faint)">
          double-sided rowhammer (aggressors v okolí victim) je nejúčinnější
        </text>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        Hammering řádku opakovaně → leak charge induktivně do sousedních → bity víc bipartitě (zde stylizováno).
        Útok: namířit na page table entry, flipnout flag → page mapped jinam → privilege escalation. Defense: TRR, ECC (limit), refresh rate ↑.
      </div>
    </div>
  );
}

function btn(active) {
  return { background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", border: "1px solid var(--line)", padding: "3px 9px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
