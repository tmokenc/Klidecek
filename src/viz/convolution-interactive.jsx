// Interactive 2D convolution — editable kernel, stride/padding sliders, click output to highlight receptive field.
import { useState, useMemo } from "react";

const INPUT_SIZE = 7;
const KERNEL_SIZE = 3;

const KERNEL_PRESETS = {
  "identity": { label: "identita", k: [[0,0,0],[0,1,0],[0,0,0]] },
  "sobel-x":  { label: "Sobel X (hrana)", k: [[-1,0,1],[-2,0,2],[-1,0,1]] },
  "sobel-y":  { label: "Sobel Y (hrana)", k: [[-1,-2,-1],[0,0,0],[1,2,1]] },
  "blur":     { label: "blur 3×3",        k: [[1,1,1],[1,1,1],[1,1,1]].map((r)=>r.map((v)=>v/9)) },
  "sharpen":  { label: "sharpen",         k: [[0,-1,0],[-1,5,-1],[0,-1,0]] },
  "edge":     { label: "Laplace (edge)",  k: [[0,-1,0],[-1,4,-1],[0,-1,0]] },
};

// Default input image — a simple "X" pattern for hands-on testing
const INPUT_DEFAULT = [
  [10, 10, 10, 10, 10, 10, 10],
  [10, 50, 10, 10, 10, 50, 10],
  [10, 10, 50, 10, 50, 10, 10],
  [10, 10, 10, 90, 10, 10, 10],
  [10, 10, 50, 10, 50, 10, 10],
  [10, 50, 10, 10, 10, 50, 10],
  [10, 10, 10, 10, 10, 10, 10],
];

function convolve(input, kernel, stride, padding) {
  const N = input.length + 2 * padding;
  const padded = Array.from({ length: N }, () => Array(N).fill(0));
  for (let i = 0; i < input.length; i++) {
    for (let j = 0; j < input.length; j++) {
      padded[i + padding][j + padding] = input[i][j];
    }
  }
  const K = kernel.length;
  const outSize = Math.floor((N - K) / stride) + 1;
  const out = Array.from({ length: outSize }, () => Array(outSize).fill(0));
  const breakdown = Array.from({ length: outSize }, () => Array.from({ length: outSize }, () => []));
  for (let i = 0; i < outSize; i++) {
    for (let j = 0; j < outSize; j++) {
      let s = 0;
      const terms = [];
      for (let a = 0; a < K; a++) {
        for (let b = 0; b < K; b++) {
          const ii = i * stride + a, jj = j * stride + b;
          const v = padded[ii][jj];
          const w = kernel[a][b];
          s += v * w;
          terms.push({ i: ii, j: jj, v, w, vw: v * w });
        }
      }
      out[i][j] = s;
      breakdown[i][j] = terms;
    }
  }
  return { out, outSize, padded, N, breakdown };
}

function valueToColor(v, minV, maxV) {
  const t = Math.max(0, Math.min(1, (v - minV) / (maxV - minV + 1e-9)));
  return `oklch(${0.3 + t * 0.6} 0.05 240)`;
}

export default function ConvolutionInteractive() {
  const [presetKey, setPresetKey] = useState("sobel-x");
  const [kernel, setKernel] = useState(KERNEL_PRESETS.SobelX || KERNEL_PRESETS["sobel-x"].k);
  const [stride, setStride] = useState(1);
  const [padding, setPadding] = useState(0);
  const [selectedOut, setSelectedOut] = useState([0, 0]);

  const k = kernel;
  const result = useMemo(() => convolve(INPUT_DEFAULT, k, stride, padding), [k, stride, padding]);
  const { out, outSize, padded, N, breakdown } = result;

  // Compute color ranges
  const inputFlat = INPUT_DEFAULT.flat();
  const inMin = Math.min(...inputFlat), inMax = Math.max(...inputFlat);
  const outFlat = out.flat();
  const outMin = Math.min(...outFlat), outMax = Math.max(...outFlat);

  const CELL = 32;
  const inW = N * CELL;
  const outW = outSize * CELL;
  const kerW = KERNEL_SIZE * CELL;

  // Highlight rectangle on input for selected output cell
  const [si, sj] = selectedOut;
  const validSelection = si < outSize && sj < outSize;
  const sourceI = validSelection ? si * stride : null;
  const sourceJ = validSelection ? sj * stride : null;

  function applyPreset(key) {
    setPresetKey(key);
    setKernel(KERNEL_PRESETS[key].k.map((row) => [...row]));
  }

  function updateKernel(i, j, val) {
    const nk = kernel.map((row) => [...row]);
    nk[i][j] = +val || 0;
    setKernel(nk);
    setPresetKey("custom");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 11 }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)" }}>preset:</span>
          <select value={presetKey} onChange={(e) => applyPreset(e.target.value)}
            style={{ background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 4px", borderRadius: 3 }}>
            {Object.entries(KERNEL_PRESETS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            <option value="custom" disabled={presetKey !== "custom"}>(vlastní)</option>
          </select>
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center", fontFamily: "var(--font-mono)" }}>
          stride
          <input type="range" min={1} max={3} value={stride} onChange={(e) => setStride(+e.target.value)} style={{ width: 60 }}/>
          <span style={{ minWidth: 12 }}>{stride}</span>
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center", fontFamily: "var(--font-mono)" }}>
          padding
          <input type="range" min={0} max={2} value={padding} onChange={(e) => setPadding(+e.target.value)} style={{ width: 60 }}/>
          <span style={{ minWidth: 12 }}>{padding}</span>
        </label>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
        {/* Input */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>vstup {N}×{N}</div>
          <svg viewBox={`0 0 ${inW} ${inW}`} style={{ width: inW, height: inW, maxWidth: "100%" }}>
            <rect width={inW} height={inW} fill="var(--bg-card)"/>
            {padded.map((row, i) =>
              row.map((v, j) => (
                <g key={`${i}-${j}`}>
                  <rect x={j * CELL} y={i * CELL} width={CELL} height={CELL}
                    fill={i < padding || j < padding || i >= INPUT_SIZE + padding || j >= INPUT_SIZE + padding ? "var(--bg-inset)" : valueToColor(v, inMin, inMax)}
                    stroke="var(--line)" strokeWidth="0.5"/>
                  <text x={j * CELL + CELL / 2} y={i * CELL + CELL / 2 + 3} textAnchor="middle"
                    fontSize="9" fontFamily="var(--font-mono)"
                    fill={i < padding || j < padding || i >= INPUT_SIZE + padding || j >= INPUT_SIZE + padding ? "var(--text-faint)" : "white"}>
                    {v}
                  </text>
                </g>
              ))
            )}
            {/* Highlighted receptive field */}
            {validSelection && (
              <rect x={sourceJ * CELL} y={sourceI * CELL} width={KERNEL_SIZE * CELL} height={KERNEL_SIZE * CELL}
                fill="none" stroke="oklch(0.7 0.2 60)" strokeWidth="3"/>
            )}
          </svg>
        </div>

        {/* Kernel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>kernel 3×3</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, width: kerW, height: kerW, background: "var(--line)" }}>
            {k.map((row, i) => row.map((v, j) => (
              <input key={`${i}-${j}`} type="number" step="0.1" value={v}
                onChange={(e) => updateKernel(i, j, e.target.value)}
                style={{
                  width: "100%", height: CELL, textAlign: "center", border: "none",
                  background: "var(--bg-card)", color: "var(--text)",
                  fontFamily: "var(--font-mono)", fontSize: 10, padding: 0,
                }}/>
            )))}
          </div>
        </div>

        {/* Output */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>výstup {outSize}×{outSize}</div>
          <svg viewBox={`0 0 ${outW} ${outW}`} style={{ width: outW, height: outW, maxWidth: "100%" }}>
            <rect width={outW} height={outW} fill="var(--bg-card)"/>
            {out.map((row, i) =>
              row.map((v, j) => {
                const isSel = i === si && j === sj;
                return (
                  <g key={`${i}-${j}`} onClick={() => setSelectedOut([i, j])} style={{ cursor: "pointer" }}>
                    <rect x={j * CELL} y={i * CELL} width={CELL} height={CELL}
                      fill={valueToColor(v, outMin, outMax)}
                      stroke={isSel ? "oklch(0.7 0.2 60)" : "var(--line)"}
                      strokeWidth={isSel ? 2 : 0.5}/>
                    <text x={j * CELL + CELL / 2} y={i * CELL + CELL / 2 + 3} textAnchor="middle"
                      fontSize="9" fontFamily="var(--font-mono)" fill="white">
                      {v.toFixed(0)}
                    </text>
                  </g>
                );
              })
            )}
          </svg>
        </div>
      </div>

      {validSelection && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", padding: 8, borderRadius: 4, fontSize: 11, fontFamily: "var(--font-mono)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", marginBottom: 4 }}>
            výpočet pro out[{si}][{sj}]
          </div>
          <div>
            {breakdown[si][sj].map((t, idx) => (
              <span key={idx}>
                {idx > 0 && " + "}
                {t.v}·{t.w}
              </span>
            ))}
            {" = "}<strong>{out[si][sj].toFixed(2)}</strong>
          </div>
        </div>
      )}

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Klikni na výstupní pixel → vidíš receptive field na vstupu. Změna stride zvětší krok, padding přidá rámec nul.
        Output size = ⌊(N + 2p − K) / s⌋ + 1. Editovatelný kernel — zkus vlastní Gaussovu blur nebo směrovou hranu.
      </div>
    </div>
  );
}
