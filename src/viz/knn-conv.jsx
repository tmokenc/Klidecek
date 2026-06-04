// Sliding convolution kernel over an input grid: receptive field + one output value.
import { useState } from "react";

export default function KnnConv() {
  const [k, setK] = useState(3);          // kernel size
  const [stride, setStride] = useState(1);
  const [pos, setPos] = useState(0);      // index of current output cell

  const N = 7;                            // input is N x N
  // Fixed input values (deterministic, readable).
  const input = [];
  for (let r = 0; r < N; r++) {
    const row = [];
    for (let c = 0; c < N; c++) row.push(((r * 3 + c * 2) % 5));
    input.push(row);
  }
  // One small kernel (averaging-ish weights), reused at every position = shared weights.
  const kernel = [];
  for (let r = 0; r < k; r++) {
    const row = [];
    for (let c = 0; c < k; c++) row.push((r === c ? 2 : 1));
    kernel.push(row);
  }

  // Output spatial size: (N - k) / stride + 1
  const outN = Math.floor((N - k) / stride) + 1;
  const nOut = outN * outN;
  const p = Math.min(pos, nOut - 1);
  const oy = Math.floor(p / outN);
  const ox = p % outN;
  const top = oy * stride;       // top-left row of receptive field
  const left = ox * stride;      // top-left col of receptive field

  // Compute the single output value at this position.
  let acc = 0;
  for (let r = 0; r < k; r++)
    for (let c = 0; c < k; c++) acc += input[top + r][left + c] * kernel[r][c];

  const cell = 22, gap = 2;
  const gx = 12, gy = 30;                 // input grid origin
  const cellXY = (r, c) => [gx + c * (cell + gap), gy + r * (cell + gap)];
  const gridW = N * (cell + gap);

  const ox0 = gx + gridW + 28;            // output grid origin x
  const ocell = 20;
  const outXY = (r, c) => [ox0 + c * (ocell + gap), gy + r * (ocell + gap)];

  const W = 540, H = 230;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        <text x={gx} y={20} fontSize="12" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          vstup {N}×{N}
        </text>
        <text x={ox0} y={20} fontSize="12" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          mapa příznaků {outN}×{outN}
        </text>

        {/* Input grid */}
        {input.map((row, r) =>
          row.map((v, c) => {
            const inField = r >= top && r < top + k && c >= left && c < left + k;
            const [x, y] = cellXY(r, c);
            return (
              <g key={`i${r}-${c}`}>
                <rect x={x} y={y} width={cell} height={cell} rx="2"
                  fill={inField ? "color-mix(in oklch, var(--accent) 35%, var(--bg-card))" : "var(--bg-card)"}
                  stroke={inField ? "var(--accent)" : "var(--line-strong)"}
                  strokeWidth={inField ? 1.5 : 0.8} />
                <text x={x + cell / 2} y={y + cell / 2 + 4} textAnchor="middle"
                  fontSize="11" fontFamily="var(--font-mono)"
                  fill={inField ? "var(--text)" : "var(--text-faint)"}>{v}</text>
              </g>
            );
          })
        )}

        {/* Receptive-field outline (kernel window) */}
        {(() => {
          const [x, y] = cellXY(top, left);
          const wpx = k * cell + (k - 1) * gap;
          return <rect x={x - 2} y={y - 2} width={wpx + 4} height={wpx + 4} rx="3"
            fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 3" />;
        })()}

        {/* Output grid */}
        {Array.from({ length: outN }).map((_, r) =>
          Array.from({ length: outN }).map((_, c) => {
            const here = r === oy && c === ox;
            const [x, y] = outXY(r, c);
            return (
              <g key={`o${r}-${c}`}>
                <rect x={x} y={y} width={ocell} height={ocell} rx="2"
                  fill={here ? "var(--accent)" : "var(--bg-card)"}
                  stroke={here ? "var(--accent)" : "var(--line-strong)"} strokeWidth={here ? 1.5 : 0.8} />
                {here && (
                  <text x={x + ocell / 2} y={y + ocell / 2 + 4} textAnchor="middle"
                    fontSize="10" fontFamily="var(--font-mono)" fill="var(--bg-inset)">{acc}</text>
                )}
              </g>
            );
          })
        )}

        {/* Computation readout */}
        <text x={ox0} y={H - 30} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          jádro {k}×{k}, stride {stride}
        </text>
        <text x={ox0} y={H - 14} fontSize="11" fontFamily="var(--font-mono)" fill="var(--accent)">
          výstup = sum(okno · váhy) = {acc}
        </text>
      </svg>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          velikost jádra k
          <input type="range" min={2} max={5} value={k}
            onChange={(e) => { setK(+e.target.value); setPos(0); }} />
          <span style={{ color: "var(--accent)" }}>{k}</span>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          stride
          <input type="range" min={1} max={3} value={stride}
            onChange={(e) => { setStride(+e.target.value); setPos(0); }} />
          <span style={{ color: "var(--accent)" }}>{stride}</span>
        </label>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>
        <button onClick={() => setPos((q) => (q <= 0 ? nOut - 1 : q - 1))}
          style={{ cursor: "pointer" }}>◀</button>
        <span>pozice {p + 1} / {nOut}</span>
        <button onClick={() => setPos((q) => (q + 1) % nOut)}
          style={{ cursor: "pointer" }}>▶</button>
        <span style={{ color: "var(--text-faint)" }}>stejné váhy na každé pozici = sdílení vah</span>
      </div>
    </div>
  );
}
