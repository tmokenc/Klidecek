// stride-prefetcher-trace — feed memory access stream to a stride detector,
// show prefetched lines vs missed lines, compare on/off.
import { useState } from "react";

const CACHE_LINES = 16;
const LINE_BYTES = 64;
const DETECT_TABLE_SIZE = 4;

const PATTERNS = {
  unit: { label: "stride 1 (lineární)", gen: (n) => Array.from({ length: n }, (_, i) => i * 4) },
  s8:   { label: "stride 32 (skok přes line)", gen: (n) => Array.from({ length: n }, (_, i) => i * 32) },
  s2:   { label: "stride 8", gen: (n) => Array.from({ length: n }, (_, i) => i * 8) },
  random: { label: "náhodný", gen: (n) => {
    let r = 7;
    return Array.from({ length: n }, () => { r = (r * 1664525 + 1013904223) >>> 0; return (r >>> 5) & 0x3FF; });
  }},
  mixed: { label: "smíšený (2 streamy)", gen: (n) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      if (i % 2 === 0) out.push(i * 4);
      else out.push(0x200 + Math.floor(i / 2) * 16);
    }
    return out;
  }},
};

function simulate(stream, enabled) {
  const cache = new Set();
  // Stride detector: PC → last_addr, stride, confidence. Simplified: stream index as PC.
  const detector = new Map();
  const trace = [];
  let hits = 0, misses = 0, prefetched = 0;
  let lru = []; // recently used line addrs
  function touch(line) {
    lru = lru.filter(l => l !== line);
    lru.push(line);
    if (lru.length > CACHE_LINES) {
      const evict = lru.shift();
      cache.delete(evict);
    }
    cache.add(line);
  }
  stream.forEach((addr, i) => {
    const line = Math.floor(addr / LINE_BYTES);
    const hit = cache.has(line);
    if (hit) hits++; else misses++;
    touch(line);
    let prefLine = null;
    if (enabled) {
      // Use "PC" = i % 2 to simulate two streams in mixed
      const pc = i % 2;
      const d = detector.get(pc) || { lastLine: line, stride: 0, conf: 0 };
      const newStride = line - d.lastLine;
      if (newStride === d.stride && d.stride !== 0) {
        d.conf = Math.min(3, d.conf + 1);
      } else {
        d.conf = Math.max(0, d.conf - 1);
        d.stride = newStride;
      }
      d.lastLine = line;
      detector.set(pc, d);
      if (d.conf >= 2 && d.stride !== 0) {
        prefLine = line + d.stride;
        if (!cache.has(prefLine)) {
          touch(prefLine);
          prefetched++;
        }
      }
    }
    trace.push({ addr, line, hit, prefLine });
  });
  return { trace, hits, misses, prefetched, cacheSize: cache.size };
}

export default function StridePrefetcherTrace() {
  const [patternKey, setPatternKey] = useState("unit");
  const [enabled, setEnabled] = useState(true);
  const stream = PATTERNS[patternKey].gen(40);
  const sim = simulate(stream, enabled);
  const simOff = simulate(stream, false);

  const W = 580, H = 240;
  const cellW = (W - 60) / Math.min(40, stream.length);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
        <select value={patternKey} onChange={e => setPatternKey(e.target.value)} style={ctrl}>
          {Object.entries(PATTERNS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <label style={{ display: "flex", gap: 4, alignItems: "center", color: "var(--text)", fontSize: 11 }}>
          <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} /> prefetcher
        </label>
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          miss rate: {(simOff.misses / stream.length * 100).toFixed(0)}% off → {(sim.misses / stream.length * 100).toFixed(0)}% on
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        <text x={20} y={20} fontSize="11" fill="var(--text)" fontWeight="600">access stream:</text>
        {sim.trace.map((acc, i) => (
          <g key={i}>
            <rect x={30 + i * cellW} y={28} width={cellW - 2} height={22}
              fill={acc.hit ? "oklch(0.65 0.16 145 / 0.5)" : "oklch(0.65 0.18 22 / 0.5)"}
              stroke={acc.hit ? "oklch(0.65 0.16 145)" : "oklch(0.65 0.18 22)"} strokeWidth="0.7" rx="1.5" />
            {acc.prefLine !== null && (
              <text x={30 + i * cellW + cellW / 2} y={66} textAnchor="middle" fontSize="8" fill="oklch(0.7 0.15 60)">pf</text>
            )}
          </g>
        ))}

        <text x={20} y={95} fontSize="11" fill="var(--text)" fontWeight="600">cache lines (zelená=in-cache, oranžová=prefetch):</text>
        {sim.trace.map((acc, i) => {
          const y = 105 + (acc.line % 8) * 12;
          return (
            <circle key={i} cx={30 + i * cellW + cellW / 2} cy={y} r={3}
              fill={acc.hit ? "oklch(0.65 0.16 145)" : acc.prefLine !== null ? "oklch(0.7 0.15 60)" : "oklch(0.65 0.18 22)"} />
          );
        })}

        <g fontSize="10.5" fill="var(--text)">
          <text x={20} y={210}>
            ON: <tspan fill="oklch(0.65 0.16 145)">{sim.hits} hit</tspan> / <tspan fill="oklch(0.65 0.18 22)">{sim.misses} miss</tspan> / <tspan fill="oklch(0.7 0.15 60)">{sim.prefetched} prefetched</tspan>
          </text>
          <text x={20} y={228} fill="var(--text-muted)">
            OFF: {simOff.hits} hit / {simOff.misses} miss
          </text>
        </g>
        <text x={W - 20} y={228} textAnchor="end" fontSize="9.5" fill="var(--text-faint)">
          Detektor uznává stride po 2 stejných deltách (conf ≥ 2).
        </text>
      </svg>
    </div>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "3px 6px", borderRadius: 3, fontSize: 11 };
