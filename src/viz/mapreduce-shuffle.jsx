// mapreduce-shuffle — animate map → shuffle → reduce on a small word-count
// input. Step through phases; see how hash(k) mod R partitions intermediate
// keys into the right reducer.
import { useEffect, useState } from "react";

const DOCS = [
  ["d1", "to be or not"],
  ["d2", "to be that is"],
  ["d3", "be or not be"],
];

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 131 + s.charCodeAt(i)) >>> 0;
  return h;
}

const PHASES = ["input", "map", "shuffle", "reduce", "output"];

const W = 540, H = 300;

export default function MapreduceShuffle() {
  const [R, setR] = useState(3);
  const [phase, setPhase] = useState(0);
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setPhase(p => (p + 1) % PHASES.length), 1100);
    return () => clearInterval(id);
  }, [auto]);

  // Stage 1: map output per doc
  const mapOut = DOCS.map(([id, text]) => ({
    docId: id, pairs: text.split(/\s+/).map(w => ({ k: w, v: 1 })),
  }));

  // Stage 2: shuffle — group by hash(k) % R
  const groups = Array.from({ length: R }, () => ({ k: new Map() }));
  for (const m of mapOut) {
    for (const { k, v } of m.pairs) {
      const g = groups[hash(k) % R];
      g.k.set(k, (g.k.get(k) || 0) + v);
    }
  }

  // Stage 3: reduce — sort + sum (already summed in shuffle map)
  const reduceOut = groups.map((g, i) => Array.from(g.k.entries()).map(([k, c]) => ({ k, c })).sort((a, b) => a.k.localeCompare(b.k)));

  const colors = ["oklch(0.65 0.16 264)", "oklch(0.65 0.16 145)", "oklch(0.7 0.15 22)", "oklch(0.7 0.15 320)"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 11 }}>
        <span>R (reducers)</span>
        <input type="range" min={1} max={4} value={R} onChange={(e) => { setR(+e.target.value); setPhase(0); }} />
        <span>{R}</span>
        <div style={{ flex: 1 }} />
        {PHASES.map((p, i) => (
          <button key={p} onClick={() => setPhase(i)} style={btn(phase === i)}>{i + 1}. {p}</button>
        ))}
        <button onClick={() => setAuto(a => !a)} style={btn(auto)}>{auto ? "■ stop" : "▶ auto"}</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {/* Documents on the left */}
        <g>
          <text x={20} y={14} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">Input</text>
          {DOCS.map(([id, t], i) => (
            <g key={id}>
              <rect x={20} y={26 + i * 56} width={110} height={48} fill="var(--bg-inset)" stroke="var(--line)" />
              <text x={26} y={42 + i * 56} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">{id}</text>
              <text x={26} y={58 + i * 56} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">"{t}"</text>
            </g>
          ))}
        </g>

        {/* Map nodes */}
        <g opacity={phase >= 1 ? 1 : 0.25}>
          <text x={170} y={14} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">Map</text>
          {mapOut.map((m, i) => (
            <g key={m.docId}>
              <rect x={150} y={26 + i * 56} width={140} height={48} fill="var(--bg-inset)" stroke="var(--line)" />
              <text x={156} y={42 + i * 56} fontSize="9.5" fontFamily="var(--font-mono)" fill="oklch(0.65 0.16 264)">M({m.docId})</text>
              <text x={156} y={58 + i * 56} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                {m.pairs.slice(0, 4).map(p => `(${p.k},1)`).join(" ")}
              </text>
              {/* line input→map */}
              <line x1={130} y1={50 + i * 56} x2={150} y2={50 + i * 56} stroke={colors[i]} strokeWidth="0.6" />
            </g>
          ))}
        </g>

        {/* Shuffle lines: each map pair flows to bucket = hash%R */}
        <g opacity={phase >= 2 ? 1 : 0.15}>
          {mapOut.flatMap((m, mi) =>
            m.pairs.map((p, pi) => {
              const r = hash(p.k) % R;
              const x0 = 290, y0 = 30 + mi * 56 + pi * 3;
              const x1 = 310, y1 = 30 + r * 56 + pi * 1.5;
              return <line key={`${mi}-${pi}`} x1={x0} y1={y0} x2={x1} y2={y1} stroke={colors[r]} strokeWidth="0.7" opacity={0.55} />;
            })
          )}
          <text x={310} y={14} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">Shuffle/Group</text>
        </g>

        {/* Reducer boxes */}
        <g opacity={phase >= 3 ? 1 : 0.25}>
          {groups.map((g, ri) => (
            <g key={ri}>
              <rect x={310} y={26 + ri * 56} width={110} height={48} fill="var(--bg-inset)" stroke={colors[ri]} strokeWidth={1.2} />
              <text x={316} y={42 + ri * 56} fontSize="9.5" fontFamily="var(--font-mono)" fill={colors[ri]}>R{ri} (hash%{R}={ri})</text>
              <text x={316} y={58 + ri * 56} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                {Array.from(g.k.entries()).slice(0, 3).map(([k, c]) => `${k}:[${c}]`).join(" ")}
              </text>
            </g>
          ))}
        </g>

        {/* Reduce output */}
        <g opacity={phase >= 4 ? 1 : 0.15}>
          <text x={440} y={14} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">Output</text>
          {reduceOut.map((arr, ri) => (
            <g key={ri}>
              <rect x={440} y={26 + ri * 56} width={86} height={48} fill="var(--bg-inset)" stroke="var(--line)" />
              <text x={446} y={42 + ri * 56} fontSize="9" fontFamily="var(--font-mono)" fill={colors[ri]}>
                {arr.slice(0, 2).map(p => `${p.k}:${p.c}`).join(" ")}
              </text>
              {arr.length > 2 && (
                <text x={446} y={58 + ri * 56} fontSize="9" fontFamily="var(--font-mono)" fill={colors[ri]}>
                  {arr.slice(2, 4).map(p => `${p.k}:${p.c}`).join(" ")}
                </text>
              )}
              <line x1={420} y1={50 + ri * 56} x2={440} y2={50 + ri * 56} stroke={colors[ri]} strokeWidth="0.6" />
            </g>
          ))}
        </g>

        {/* phase label */}
        <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          phase {phase + 1}/{PHASES.length}: {PHASES[phase]}
        </text>
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        Each map task processes one document independently → emit (word, 1). Shuffle routes pairs by hash(key) mod R, so all occurrences of the same key meet at one reducer.
        Reduce sums counts per key. Map and Reduce are embarassingly parallel; shuffle is the all-to-all network bottleneck.
      </div>
    </div>
  );
}

function btn(active) {
  return {
    fontFamily: "var(--font-mono)", fontSize: 10, padding: "2px 6px",
    background: active ? "var(--accent)" : "var(--bg-inset)",
    color: active ? "var(--bg-card)" : "var(--text)",
    border: "1px solid var(--line-strong)", borderRadius: 3, cursor: "pointer",
  };
}
