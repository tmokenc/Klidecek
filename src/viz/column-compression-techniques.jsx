// column-compression-techniques — compare RLE / prefix / cluster / sparse /
// indirect / delta on the same column with different distributions.
import { useMemo, useState } from "react";

const W = 540, H = 320;

const DISTRIBUTIONS = {
  "sorted-dominant": () => {
    const out = [];
    for (let i = 0; i < 30; i++) out.push("CZ");
    for (let i = 0; i < 5; i++) out.push("DE");
    for (let i = 0; i < 5; i++) out.push("FR");
    for (let i = 0; i < 8; i++) out.push("US");
    return out;
  },
  "clustered": () => {
    const out = [];
    for (const v of ["A", "A", "A", "B", "C", "C", "C", "A", "A", "B", "B", "C", "C", "C", "C", "D", "D", "D"]) out.push(v);
    return out;
  },
  "sparse-null": () => {
    const out = [];
    for (let i = 0; i < 30; i++) out.push(Math.random() < 0.8 ? "—" : ["X", "Y", "Z"][Math.floor(Math.random() * 3)]);
    return out;
  },
  "indirect": () => {
    // grouped by region with small local alphabet
    const groups = [["Karel", "Pavel", "Jiří"], ["Anna", "Eva", "Jana"], ["Petr", "Jan"]];
    const out = [];
    for (let g = 0; g < 3; g++) for (let i = 0; i < 8; i++) out.push(groups[g][Math.floor(Math.random() * groups[g].length)]);
    return out;
  },
  "random": () => {
    const out = [];
    const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    for (let i = 0; i < 36; i++) out.push(alpha[Math.floor(Math.random() * alpha.length)]);
    return out;
  },
};

function plainBytes(values) {
  return values.reduce((s, v) => s + (v.length + 1), 0);
}

function dictBytes(values) {
  const uniq = Array.from(new Set(values));
  const bits = Math.max(1, Math.ceil(Math.log2(uniq.length)));
  return { bytes: uniq.reduce((s, v) => s + v.length + 1, 0) + Math.ceil(values.length * bits / 8), uniq: uniq.length, bits };
}

function rleEncode(values) {
  // (value, count) — bit-pack ID + 8-bit count
  const uniq = Array.from(new Set(values));
  const bits = Math.max(1, Math.ceil(Math.log2(uniq.length)));
  let runs = 0;
  for (let i = 0; i < values.length; ) {
    let j = i;
    while (j + 1 < values.length && values[j + 1] === values[i]) j++;
    runs++;
    i = j + 1;
  }
  const dictBy = uniq.reduce((s, v) => s + v.length + 1, 0);
  const runBytes = Math.ceil(runs * (bits + 8) / 8);
  return { bytes: dictBy + runBytes, runs, segments: rleSegments(values) };
}

function rleSegments(values) {
  const out = [];
  for (let i = 0; i < values.length; ) {
    let j = i;
    while (j + 1 < values.length && values[j + 1] === values[i]) j++;
    out.push({ value: values[i], start: i, count: j - i + 1 });
    i = j + 1;
  }
  return out;
}

function prefixEncode(values) {
  if (values.length === 0) return { bytes: 0, prefixCount: 0, rest: values };
  let i = 0;
  while (i < values.length && values[i] === values[0]) i++;
  const prefixCount = i;
  const rest = values.slice(i);
  const restEnc = dictBytes(rest);
  return { bytes: (values[0].length + 1) + 4 /* count */ + restEnc.bytes, prefixCount, rest };
}

function clusterEncode(values, blockSize = 6) {
  const blocks = [];
  for (let i = 0; i < values.length; i += blockSize) {
    const slice = values.slice(i, i + blockSize);
    const uniq = new Set(slice);
    blocks.push({ slice, reducible: uniq.size === 1 });
  }
  const reducedBlocks = blocks.filter(b => b.reducible).length;
  const fullBlocks = blocks.length - reducedBlocks;
  const dict = dictBytes(values);
  // one ID per reduced block + full bits per full block
  const bytes = blocks.length /* bit vec rounded */ + reducedBlocks * Math.ceil(dict.bits / 8) + fullBlocks * Math.ceil(blockSize * dict.bits / 8);
  return { bytes, blocks };
}

function sparseEncode(values) {
  const freq = new Map();
  for (const v of values) freq.set(v, (freq.get(v) || 0) + 1);
  let dom = values[0], domC = 0;
  for (const [v, c] of freq) if (c > domC) { dom = v; domC = c; }
  const remaining = values.filter(v => v !== dom);
  const remainingEnc = dictBytes(remaining);
  const bitVec = Math.ceil(values.length / 8);
  return { bytes: (dom.length + 1) + bitVec + remainingEnc.bytes, dominant: dom, domCount: domC, remainingN: remaining.length };
}

function indirectEncode(values, blockSize = 6) {
  const dict = dictBytes(values);
  let total = 0;
  let savings = 0;
  for (let i = 0; i < values.length; i += blockSize) {
    const slice = values.slice(i, i + blockSize);
    const uniq = Array.from(new Set(slice));
    if (uniq.length < dict.uniq) {
      const localBits = Math.max(1, Math.ceil(Math.log2(uniq.length)));
      total += uniq.length * 2; // local dict pointers
      total += Math.ceil(slice.length * localBits / 8);
      savings++;
    } else {
      total += Math.ceil(slice.length * dict.bits / 8);
    }
  }
  return { bytes: dict.bytes - Math.ceil(values.length * dict.bits / 8) + total, blocksSaved: savings };
}

function deltaEncode(values) {
  // For sorted dictionary, store common prefix length + suffix per string
  const sorted = Array.from(new Set(values)).sort();
  if (sorted.length === 0) return { bytes: 0 };
  let total = sorted[0].length + 1;
  for (let i = 1; i < sorted.length; i++) {
    let p = 0;
    while (p < Math.min(sorted[i - 1].length, sorted[i].length) && sorted[i - 1][p] === sorted[i][p]) p++;
    total += 1 + (sorted[i].length - p);
  }
  const bits = Math.max(1, Math.ceil(Math.log2(sorted.length)));
  return { bytes: total + Math.ceil(values.length * bits / 8) };
}

const TECHNIQUES = [
  { key: "plain", label: "plain", calc: (v) => ({ bytes: plainBytes(v) }) },
  { key: "dict", label: "dictionary", calc: (v) => dictBytes(v) },
  { key: "rle", label: "RLE", calc: (v) => rleEncode(v) },
  { key: "prefix", label: "prefix", calc: (v) => prefixEncode(v) },
  { key: "cluster", label: "cluster", calc: (v) => clusterEncode(v) },
  { key: "sparse", label: "sparse", calc: (v) => sparseEncode(v) },
  { key: "indirect", label: "indirect", calc: (v) => indirectEncode(v) },
  { key: "delta", label: "delta-dict", calc: (v) => deltaEncode(v) },
];

export default function ColumnCompressionTechniques() {
  const [dist, setDist] = useState("sorted-dominant");
  const [tick, setTick] = useState(0);

  const values = useMemo(() => DISTRIBUTIONS[dist](), [dist, tick]);

  const results = TECHNIQUES.map(t => ({ ...t, result: t.calc(values) }));
  const maxB = Math.max(...results.map(r => r.result.bytes));

  // RLE segments for visualization (best technique for clustered)
  const segs = rleSegments(values);

  const PAD = 16;
  const colors = ["oklch(0.65 0.16 264)", "oklch(0.65 0.16 145)", "oklch(0.7 0.15 22)", "oklch(0.7 0.15 320)", "oklch(0.7 0.15 60)"];
  const uniqVals = Array.from(new Set(values));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.keys(DISTRIBUTIONS).map(d => (
          <button key={d} onClick={() => setDist(d)} style={btn(dist === d)}>{d}</button>
        ))}
        <button onClick={() => setTick(t => t + 1)} style={btn(false)}>regen</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {/* Column visualization with RLE bands */}
        <text x={PAD} y={14} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">column ({values.length} values, {uniqVals.length} unique)</text>
        {(() => {
          const cellW = (W - PAD * 2) / values.length;
          return values.map((v, i) => {
            const ci = uniqVals.indexOf(v) % colors.length;
            return (
              <g key={i}>
                <rect x={PAD + i * cellW} y={22} width={cellW - 0.5} height={20} fill={colors[ci]} opacity={0.7} stroke="var(--bg-card)" strokeWidth="0.4" />
                {cellW > 12 && (
                  <text x={PAD + i * cellW + cellW / 2} y={36} textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="white">{v.length > 3 ? v.slice(0, 2) : v}</text>
                )}
              </g>
            );
          });
        })()}

        {/* RLE-segments below */}
        <text x={PAD} y={62} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">RLE segments: {segs.length} runs</text>
        {(() => {
          const cellW = (W - PAD * 2) / values.length;
          return segs.map((s, i) => {
            const ci = uniqVals.indexOf(s.value) % colors.length;
            return (
              <g key={i}>
                <rect x={PAD + s.start * cellW} y={70} width={s.count * cellW - 0.5} height={14} fill={colors[ci]} stroke="var(--text)" strokeWidth="0.4" />
                {s.count * cellW > 18 && (
                  <text x={PAD + (s.start + s.count / 2) * cellW} y={81} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="white">{s.value}×{s.count}</text>
                )}
              </g>
            );
          });
        })()}

        {/* Bar chart of sizes */}
        <text x={PAD} y={108} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">total size (bytes)</text>
        {results.map((r, i) => {
          const barX = PAD + 90;
          const barMaxW = W - PAD * 2 - 100;
          const len = (r.result.bytes / maxB) * barMaxW;
          const isPlain = r.key === "plain";
          const isBest = r.result.bytes === Math.min(...results.filter(rr => rr.key !== "plain").map(rr => rr.result.bytes));
          return (
            <g key={r.key} transform={`translate(0, ${120 + i * 22})`}>
              <text x={PAD} y={12} fontSize="10" fontFamily="var(--font-mono)" fill={isBest ? "oklch(0.65 0.16 145)" : "var(--text-muted)"}>
                {isBest ? "★ " : "  "}{r.label}
              </text>
              <rect x={barX} y={4} width={Math.max(1, len)} height={14}
                fill={isPlain ? "oklch(0.6 0.18 22)" : isBest ? "oklch(0.65 0.16 145)" : "oklch(0.65 0.16 264 / 0.6)"} />
              <text x={barX + len + 4} y={14} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">
                {r.result.bytes} B
                {!isPlain && plainBytes(values) > 0 && ` (${(plainBytes(values) / r.result.bytes).toFixed(1)}× plain)`}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        Sorted+dominant → prefix encoding wins (long head of one value). Clustered → RLE wins. Sparse with one dominant value → sparse encoding (bit-vector + remaining list).
        Local alphabets per block → indirect (per-block dictionaries). Random high-cardinality → plain often wins (overhead beats savings).
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
