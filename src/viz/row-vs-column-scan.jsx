// row-vs-column-scan — animate cache-line scan in row store vs column store
// for various query types; show bytes read and estimated time.
import { useEffect, useState } from "react";

const W = 540, H = 320;

// Schema: 6 columns, byte widths in row store
const COLS = [
  { name: "id", w: 8 },
  { name: "name", w: 64 },
  { name: "gender", w: 1, dictBits: 1 }, // post dict 1 bit
  { name: "city", w: 32, dictBits: 20 },
  { name: "salary", w: 8 },
  { name: "country", w: 32, dictBits: 8 },
];
const ROW_BYTES = COLS.reduce((s, c) => s + c.w, 0);

const N_ROWS = 8_000_000_000;
const CACHE_LINE = 64;
const BANDWIDTH_MB_PER_MS = 4;

const QUERIES = [
  { key: "gender_count", label: "SELECT gender, COUNT(*) … GROUP BY gender", uses: ["gender"] },
  { key: "salary_avg", label: "SELECT AVG(salary)", uses: ["salary"] },
  { key: "two_col", label: "SELECT country, AVG(salary)", uses: ["country", "salary"] },
  { key: "star_one", label: "SELECT * WHERE id = 42 (single row)", uses: COLS.map(c => c.name), single: true },
];

export default function RowVsColumnScan() {
  const [query, setQuery] = useState(QUERIES[0].key);
  const [tick, setTick] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setTick(t => t + 1), 60);
    return () => clearInterval(id);
  }, [auto]);

  const q = QUERIES.find(qq => qq.key === query);
  const usedCols = COLS.filter(c => q.uses.includes(c.name));

  // Bytes per row in row layout for this query
  const rowStride = ROW_BYTES;
  const rowBytesRead = q.single ? CACHE_LINE * Math.ceil(rowStride / CACHE_LINE) : N_ROWS * CACHE_LINE; // stride access
  const rowFullScan = q.single ? CACHE_LINE * Math.ceil(rowStride / CACHE_LINE) : N_ROWS * rowStride;

  // Column store: pack dict-encoded bits
  const colBitsTotal = usedCols.reduce((s, c) => s + (c.dictBits || c.w * 8), 0);
  const colBytesRead = q.single ? usedCols.length * CACHE_LINE : (N_ROWS * colBitsTotal) / 8;

  // Pretty bytes
  function pretty(b) {
    if (b < 1024) return `${b.toFixed(0)} B`;
    if (b < 1024 ** 2) return `${(b / 1024).toFixed(1)} KB`;
    if (b < 1024 ** 3) return `${(b / 1024 ** 2).toFixed(1)} MB`;
    if (b < 1024 ** 4) return `${(b / 1024 ** 3).toFixed(2)} GB`;
    return `${(b / 1024 ** 4).toFixed(2)} TB`;
  }
  function prettyTime(bytes) {
    const ms = bytes / (BANDWIDTH_MB_PER_MS * 1024 ** 2);
    if (ms < 1000) return `${ms.toFixed(0)} ms`;
    if (ms < 60_000) return `${(ms / 1000).toFixed(2)} s`;
    return `${(ms / 60_000).toFixed(1)} min`;
  }

  // Animation: highlight which bytes are being read each frame
  const cycleLen = 32;
  const ph = tick % cycleLen;

  const PAD = 16;
  const PW = W - PAD * 2;
  const ROW_H = 18;
  const ROW_TOP = 50;
  const COL_TOP = 200;

  // Row layout — one row drawn with column blocks
  const rowX = PAD + 20;
  const rowW = PW - 40;
  const sizes = COLS.map(c => c.w);
  const widthsPx = sizes.map(s => (s / ROW_BYTES) * rowW);
  let acc = 0;
  const offsets = widthsPx.map(w => { const v = acc; acc += w; return v; });

  // Column layout — separate stripes
  const stripeH = 16;
  const colY = (i) => COL_TOP + i * (stripeH + 4);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {QUERIES.map(qq => (
          <button key={qq.key} onClick={() => setQuery(qq.key)} style={btn(query === qq.key)}>{qq.label}</button>
        ))}
        <button onClick={() => setAuto(a => !a)} style={btn(auto)}>{auto ? "■ pause" : "▶ play"}</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {/* Row store strip */}
        <text x={PAD} y={ROW_TOP - 22} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">Row store — one tuple = {ROW_BYTES} B contiguous</text>

        {[0, 1, 2].map(rowIdx => (
          <g key={rowIdx} transform={`translate(0, ${rowIdx * (ROW_H + 4)})`}>
            {COLS.map((c, ci) => {
              const used = q.uses.includes(c.name);
              const active = used && (q.single ? rowIdx === 1 : ((ph + rowIdx) % 4 === 0));
              return (
                <g key={ci}>
                  <rect x={rowX + offsets[ci]} y={ROW_TOP} width={widthsPx[ci] - 1} height={ROW_H}
                    fill={used ? (active ? "oklch(0.65 0.16 145)" : "oklch(0.65 0.16 145 / 0.35)") : "var(--bg-inset)"}
                    stroke="var(--line)" strokeWidth="0.5" />
                  {rowIdx === 0 && (
                    <text x={rowX + offsets[ci] + widthsPx[ci] / 2} y={ROW_TOP - 4} textAnchor="middle"
                      fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-faint)">{c.name}</text>
                  )}
                </g>
              );
            })}
            {/* cache line guides — every 64B; only boundaries that fall within the
                drawn tuple (0, 64, 128 … ≤ ROW_BYTES) so they never run past the row/viewBox */}
            {!q.single && Array.from({ length: Math.floor(ROW_BYTES / CACHE_LINE) + 1 }, (_, i) => (
              <line key={i} x1={rowX + i * (CACHE_LINE / ROW_BYTES) * rowW}
                y1={ROW_TOP - 2} x2={rowX + i * (CACHE_LINE / ROW_BYTES) * rowW} y2={ROW_TOP + ROW_H + 2}
                stroke="oklch(0.6 0.18 22)" strokeWidth="0.4" strokeDasharray="2 2" opacity={0.5} />
            ))}
          </g>
        ))}
        <text x={PAD} y={ROW_TOP + 3 * (ROW_H + 4) + 14} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          per-row cache lines read (full): {Math.ceil(ROW_BYTES / CACHE_LINE)} × 64B = {Math.ceil(ROW_BYTES / CACHE_LINE) * CACHE_LINE} B
        </text>

        {/* Column store stripes */}
        <text x={PAD} y={COL_TOP - 10} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">Column store — each column packed contiguously</text>

        {(() => {
          // reserve room on the right for the longest "{bits} bits/row" label so it
          // never runs past the viewBox; the stripe origin sits at PAD + 60.
          const STRIPE_X = PAD + 60;
          const LABEL_GUTTER = 90; // worst case "512 bits/row" at fontSize 9
          const STRIPE_MAX = W - STRIPE_X - LABEL_GUTTER - PAD;
          const maxBits = Math.max(...COLS.map(cc => cc.dictBits || cc.w * 8));
          return COLS.map((c, ci) => {
          const used = q.uses.includes(c.name);
          const bits = c.dictBits || c.w * 8;
          const len = (bits / maxBits) * STRIPE_MAX;
          return (
            <g key={ci} transform={`translate(${STRIPE_X}, ${colY(ci)})`}>
              <text x={-58} y={12} fontSize="9.5" fontFamily="var(--font-mono)" fill={used ? "var(--text)" : "var(--text-faint)"}>{c.name}</text>
              <rect x={0} y={0} width={len} height={stripeH}
                fill={used ? "oklch(0.65 0.16 264 / 0.7)" : "var(--bg-inset)"} stroke="var(--line)" />
              {used && (
                <rect x={(ph % 16) * (len / 16)} y={0} width={len / 16} height={stripeH}
                  fill="oklch(0.65 0.16 145)" />
              )}
              <text x={len + 4} y={12} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">{bits} bits/row</text>
            </g>
          );
          });
        })()}
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ background: "var(--bg-inset)", padding: 8, borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: 11 }}>
          <div style={{ color: "oklch(0.6 0.18 22)" }}>Row store ({q.single ? "single row" : "stride access"})</div>
          <div style={{ color: "var(--text)" }}>read: {pretty(q.single ? rowBytesRead : Math.min(rowFullScan, rowBytesRead))}</div>
          <div style={{ color: "var(--text-muted)" }}>at 4 MB/ms/core: {prettyTime(q.single ? rowBytesRead : rowBytesRead)}</div>
          {!q.single && <div style={{ color: "var(--text-faint)", fontSize: 10 }}>(full table {pretty(rowFullScan)} if no stride)</div>}
        </div>
        <div style={{ background: "var(--bg-inset)", padding: 8, borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: 11 }}>
          <div style={{ color: "oklch(0.65 0.16 145)" }}>Column store</div>
          <div style={{ color: "var(--text)" }}>read: {pretty(colBytesRead)}</div>
          <div style={{ color: "var(--text-muted)" }}>at 4 MB/ms/core: {prettyTime(colBytesRead)}</div>
          <div style={{ color: "var(--text-faint)", fontSize: 10 }}>used: {usedCols.length} of {COLS.length} columns</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        Row store keeps tuples contiguous (great for SELECT * WHERE id=X). For analytics scanning one column it must jump 200 B per row to pick a single bit (cache-line waste).
        Column store reads only needed columns, packed densely after dictionary encoding (gender → 1 bit, country → 8 bits). For analytic queries that's 400–1600× less I/O.
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
