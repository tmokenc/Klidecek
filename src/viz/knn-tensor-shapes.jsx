// Live calculator: input HxWxC + kernel k + stride + #filters -> output tensor shape,
// conv params vs fully-connected params.
import { useState } from "react";

export default function KnnTensorShapes() {
  const [H, setH] = useState(32);
  const [Wi, setWi] = useState(32);
  const [C, setC] = useState(3);
  const [k, setK] = useState(3);
  const [stride, setStride] = useState(1);
  const [pad, setPad] = useState(1);
  const [F, setF] = useState(16);   // number of filters

  // Output spatial size: (W - k + 2P)/S + 1  (floor)
  const outH = Math.floor((H - k + 2 * pad) / stride) + 1;
  const outW = Math.floor((Wi - k + 2 * pad) / stride) + 1;
  const valid = outH > 0 && outW > 0;

  // Conv params: (k*k*C)*F weights + F biases. Independent of spatial size.
  const convParams = (k * k * C) * F + F;
  // A fully-connected layer producing the SAME output tensor would need
  // (H*W*C) * (outH*outW*F) weights + biases — astronomically more.
  const inUnits = H * Wi * C;
  const outUnits = outH * outW * F;
  const fcParams = valid ? inUnits * outUnits + outUnits : 0;

  const fmt = (n) => n.toLocaleString("en-US").replace(/,/g, " ");
  const ratio = valid && convParams > 0 ? Math.round(fcParams / convParams) : 0;

  const VW = 380, VH = 160;
  // bar widths (log-ish scaled to fit). Reserve ~80px on the right so a
  // full-width bar never overlaps its value label (right-aligned at VW-8).
  const maxBar = VW - 190;
  const lp = (n) => Math.log10(Math.max(n, 1) + 1);
  const denom = Math.max(lp(convParams), lp(fcParams), 1);
  const convBar = Math.max(4, (lp(convParams) / denom) * maxBar);
  const fcBar = Math.max(4, (lp(fcParams) / denom) * maxBar);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "4px 16px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>
        {[
          ["výška H", H, setH, 4, 128],
          ["šířka W", Wi, setWi, 4, 128],
          ["kanály C", C, setC, 1, 64],
          ["jádro k", k, setK, 1, 7],
          ["stride", stride, setStride, 1, 4],
          ["padding", pad, setPad, 0, 4],
          ["filtry F", F, setF, 1, 256],
        ].map(([label, val, set, lo, hi]) => (
          <label key={label} style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
            <span>{label}</span>
            <input type="range" min={lo} max={hi} value={val}
              onChange={(e) => set(+e.target.value)} style={{ flex: 1, minWidth: 60 }} />
            <span style={{ color: "var(--accent)", minWidth: 30, textAlign: "right" }}>{val}</span>
          </label>
        ))}
      </div>

      <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: "100%", display: "block" }}>
        <rect width={VW} height={VH} fill="var(--bg-inset)" />

        <text x={12} y={20} fontSize="12" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          vstup: {H}×{Wi}×{C}
        </text>
        <text x={12} y={40} fontSize="13" fontFamily="var(--font-mono)" fill="var(--accent)">
          {valid ? `výstup: ${outH}×${outW}×${F}` : "neplatné (výstup ≤ 0)"}
        </text>

        {/* param comparison bars */}
        <text x={12} y={72} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">konvoluční</text>
        <rect x={110} y={62} width={convBar} height={14} rx="2" fill="var(--accent)" />
        <text x={VW - 8} y={73} textAnchor="end" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-muted)">{fmt(convParams)}</text>

        <text x={12} y={102} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">plně propojená</text>
        <rect x={110} y={92} width={fcBar} height={14} rx="2" fill="var(--line-strong)" />
        <text x={VW - 8} y={103} textAnchor="end" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-muted)">{valid ? fmt(fcParams) : "—"}</text>

        <text x={12} y={134} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          konv. = (k·k·C)·F + F = ({k}·{k}·{C})·{F} + {F}
        </text>
        <text x={12} y={150} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          {valid && ratio > 0 ? `plně propojená má ~${fmt(ratio)}× více vah` : "osy log-měřítko"}
        </text>
      </svg>
    </div>
  );
}
