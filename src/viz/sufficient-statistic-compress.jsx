// Sufficient statistic compression — n Bernoulli samples → T(X) = Σxᵢ.
// Visualizes that all n-tuples with same sum are equally probable given T.
import { useState, useMemo } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 280;

export default function SufficientStatisticCompress() {
  const [n, setN] = useState(8);
  const [seed, setSeed] = useState(1);

  const sample = useMemo(() => {
    const rng = S.mulberry32(seed);
    return Array.from({ length: n }, () => rng() < 0.4 ? 1 : 0);
  }, [n, seed]);

  const T = sample.reduce((a, b) => a + b, 0);
  // All n-tuples with same sum T have probability 1 / C(n, T)
  const choose = (n, k) => {
    let r = 1;
    for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1);
    return r;
  };
  const nCT = choose(n, T);

  // Show: raw sample (n cells), then arrow to T value, with note "compressed".
  const CELL = 30;
  const startX = (W - n * CELL) / 2;
  const cellY = 30;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {/* Sample */}
        <text x={W / 2} y={20} textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">vzorek X₁..X_{n}: {n} bitů</text>
        {sample.map((b, i) => (
          <g key={i}>
            <rect x={startX + i * CELL} y={cellY} width={CELL - 4} height={CELL} fill={b ? "var(--accent)" : "var(--bg-inset)"} stroke="var(--accent)" strokeWidth="1.5" />
            <text x={startX + i * CELL + (CELL - 4) / 2} y={cellY + CELL / 2 + 5} textAnchor="middle" fontSize="13" fill={b ? "white" : "var(--text)"} fontFamily="var(--font-mono)">{b}</text>
          </g>
        ))}

        {/* Arrow */}
        <path d={`M ${W / 2 - 8} 90 L ${W / 2 + 8} 100 L ${W / 2 - 8} 110 Z`} fill="var(--accent-line)" />
        <text x={W / 2 + 16} y={104} fontSize="11" fill="var(--accent-line)" fontFamily="var(--font-mono)">T(X) = Σ Xᵢ</text>

        {/* T compressed */}
        <rect x={W / 2 - 30} y={130} width={60} height={36} fill="var(--accent-line)" stroke="var(--accent-line)" strokeWidth="2" opacity="0.3" />
        <text x={W / 2} y={154} textAnchor="middle" fontSize="18" fill="var(--text)" fontFamily="var(--font-mono)">T = {T}</text>

        <text x={W / 2} y={188} textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">
          P(X = x | T = {T}, p) = 1 / C({n}, {T}) = 1 / {nCT.toFixed(0)} — nezávisí na p ✓
        </text>

        {/* Show how many distinct n-tuples exist */}
        <g transform="translate(40, 210)" fontSize="10" fontFamily="var(--font-mono)">
          <text x="0" y="0" fill="var(--text-muted)">Konkrétně {nCT.toFixed(0)} různých posloupností {n} bitů s sumou {T}:</text>
          {(() => {
            // List a few examples
            const enumerate = [];
            function helper(prefix, remaining, ones) {
              if (enumerate.length >= 6 || prefix.length === n) {
                if (prefix.length === n && ones === T) enumerate.push(prefix);
                return;
              }
              if (ones < T) helper(prefix + "1", remaining - 1, ones + 1);
              helper(prefix + "0", remaining - 1, ones);
            }
            helper("", n, 0);
            return enumerate.map((s, i) => (
              <text key={i} x={i < 3 ? 0 : 240} y={20 + (i % 3) * 16} fill="var(--text)">  {s.split('').join(' ')}</text>
            ));
          })()}
          {nCT > 6 && <text x="480" y="36" fill="var(--text-muted)">…</text>}
        </g>
      </svg>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <label style={lab()}>n = {n}
          <input type="range" min={3} max={12} value={n} onChange={(e) => setN(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <button onClick={() => setSeed(seed + 1)} style={btn(false)}>nový vzorek</button>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
        Pro inference o p stačí <strong>T = Σxᵢ</strong> — všechny posloupnosti s tímto T mají *stejnou* podmíněnou pravděpodobnost. Vzorek X přináší jen informaci, kolik 1 v něm bylo, ne jejich pořadí.
      </div>
    </div>
  );
}

function btn(active) { return { padding: "4px 10px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
function lab() { return { flex: "1 1 200px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }; }
