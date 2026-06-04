// Elementary 1D cellular automaton (ECA): pick a Wolfram rule 0-255, run
// generations top-down as a raster. Presets show the four Wolfram classes.
import { useState } from "react";

const PRESETS = [
  { rule: 0, label: "tř. I", note: "homogenní — vše zhasne (stav 0)" },
  { rule: 50, label: "tř. II", note: "periodická lokální struktura" },
  { rule: 30, label: "tř. III", note: "chaos — citlivost, PRNG" },
  { rule: 110, label: "tř. IV", note: "komplexní — Turingovsky úplný" },
  { rule: 90, label: "Sierpiński", note: "fraktál (nested), pravidlo 90" },
];

export default function BinEca() {
  const [rule, setRule] = useState(30);

  // n cells, periodic boundary, g generations, single 1 in the middle as seed.
  const n = 51;
  const g = 26;
  const seed = new Array(n).fill(0);
  seed[Math.floor(n / 2)] = 1;

  const rows = [seed];
  for (let t = 1; t < g; t++) {
    const prev = rows[t - 1];
    const cur = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      const l = prev[(i - 1 + n) % n];
      const c = prev[i];
      const r = prev[(i + 1) % n];
      const idx = (l << 2) | (c << 1) | r; // 0..7 neighbourhood pattern
      cur[i] = (rule >> idx) & 1;
    }
    rows.push(cur);
  }

  // Wolfram rule as 8 output bits, pattern 111..000 from left to right.
  const bits = [];
  for (let p = 7; p >= 0; p--) bits.push((rule >> p) & 1);
  const patterns = ["111", "110", "101", "100", "011", "010", "001", "000"];

  const W = 360;
  const cell = (W - 12) / n; // raster width
  const top = 56;
  const H = top + g * cell + 20; // bottom margin so the caption clears the raster

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 460, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* rule lookup table: pattern (3 cells) -> output cell */}
        {patterns.map((pat, k) => {
          const x = 6 + k * ((W - 12) / 8);
          const bw = (W - 12) / 8;
          return (
            <g key={k}>
              {pat.split("").map((b, j) => (
                <rect key={j} x={x + 2 + j * 9} y={8} width={8} height={8}
                  fill={b === "1" ? "var(--accent)" : "var(--bg-card)"}
                  stroke="var(--line-strong)" strokeWidth="0.5" />
              ))}
              <rect x={x + 2 + 9} y={20} width={8} height={8}
                fill={bits[k] === 1 ? "var(--accent)" : "var(--bg-card)"}
                stroke="var(--line-strong)" strokeWidth="0.8" />
            </g>
          );
        })}
        <text x={6} y={46} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          okolí (8 vzorů) → výstup = pravidlo {rule}
        </text>

        {/* the space-time raster */}
        {rows.map((row, t) =>
          row.map((v, i) =>
            v === 1 ? (
              <rect key={`${t}-${i}`} x={6 + i * cell} y={top + t * cell}
                width={cell + 0.4} height={cell + 0.4} fill="var(--accent)" />
            ) : null
          )
        )}
        <text x={W - 6} y={H - 3} textAnchor="end" fontSize="9"
          fontFamily="var(--font-mono)" fill="var(--text-faint)">
          čas ↓ · {n} buněk · periodický okraj
        </text>
      </svg>

      <input type="range" min={0} max={255} value={rule}
        onChange={(e) => setRule(+e.target.value)} style={{ width: "100%" }} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {PRESETS.map((p) => (
          <button key={p.rule} onClick={() => setRule(p.rule)}
            style={{
              fontSize: 11, fontFamily: "var(--font-mono)", cursor: "pointer",
              padding: "3px 7px", borderRadius: 5,
              border: "1px solid var(--line-strong)",
              background: rule === p.rule ? "var(--accent)" : "var(--bg-card)",
              color: rule === p.rule ? "white" : "var(--text-muted)",
            }}>
            {p.rule} · {p.label}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        pravidlo {rule} · {PRESETS.find((p) => p.rule === rule)?.note || "vlastní pravidlo (0–255)"}
      </div>
    </div>
  );
}
