// CNN architectures stack — LeNet / AlexNet / VGG / ResNet / EfficientNet, feature map dims + parameter counts.
import { useState } from "react";

const ARCHS = {
  "LeNet-5": {
    year: 1998,
    layers: [
      { type: "input",   dims: "32×32×1",   params: 0,       label: "vstup" },
      { type: "conv",    dims: "28×28×6",   params: 156,     label: "Conv 5×5, 6" },
      { type: "pool",    dims: "14×14×6",   params: 0,       label: "AvgPool 2×2" },
      { type: "conv",    dims: "10×10×16",  params: 2416,    label: "Conv 5×5, 16" },
      { type: "pool",    dims: "5×5×16",    params: 0,       label: "AvgPool 2×2" },
      { type: "fc",      dims: "120",       params: 48120,   label: "FC 120" },
      { type: "fc",      dims: "84",        params: 10164,   label: "FC 84" },
      { type: "fc",      dims: "10",        params: 850,     label: "FC 10 (softmax)" },
    ],
  },
  "AlexNet": {
    year: 2012,
    layers: [
      { type: "input",   dims: "224×224×3",  params: 0,         label: "vstup" },
      { type: "conv",    dims: "55×55×96",   params: 34944,     label: "Conv 11×11/4, 96" },
      { type: "pool",    dims: "27×27×96",   params: 0,         label: "MaxPool 3×3/2" },
      { type: "conv",    dims: "27×27×256",  params: 614656,    label: "Conv 5×5, 256" },
      { type: "pool",    dims: "13×13×256",  params: 0,         label: "MaxPool 3×3/2" },
      { type: "conv",    dims: "13×13×384",  params: 885120,    label: "Conv 3×3, 384" },
      { type: "conv",    dims: "13×13×384",  params: 1327488,   label: "Conv 3×3, 384" },
      { type: "conv",    dims: "13×13×256",  params: 884992,    label: "Conv 3×3, 256" },
      { type: "pool",    dims: "6×6×256",    params: 0,         label: "MaxPool 3×3/2" },
      { type: "fc",      dims: "4096",       params: 37752832,  label: "FC 4096" },
      { type: "fc",      dims: "4096",       params: 16781312,  label: "FC 4096" },
      { type: "fc",      dims: "1000",       params: 4097000,   label: "FC 1000" },
    ],
  },
  "VGG-16": {
    year: 2014,
    layers: [
      { type: "input",   dims: "224×224×3",  params: 0,        label: "vstup" },
      { type: "conv",    dims: "224×224×64", params: 38720,    label: "Conv 3×3 ×2, 64" },
      { type: "pool",    dims: "112×112×64", params: 0,        label: "MaxPool 2×2" },
      { type: "conv",    dims: "112×112×128",params: 221440,   label: "Conv 3×3 ×2, 128" },
      { type: "pool",    dims: "56×56×128",  params: 0,        label: "MaxPool 2×2" },
      { type: "conv",    dims: "56×56×256",  params: 1475328,  label: "Conv 3×3 ×3, 256" },
      { type: "pool",    dims: "28×28×256",  params: 0,        label: "MaxPool 2×2" },
      { type: "conv",    dims: "28×28×512",  params: 5899776,  label: "Conv 3×3 ×3, 512" },
      { type: "pool",    dims: "14×14×512",  params: 0,        label: "MaxPool 2×2" },
      { type: "conv",    dims: "14×14×512",  params: 7079424,  label: "Conv 3×3 ×3, 512" },
      { type: "pool",    dims: "7×7×512",    params: 0,        label: "MaxPool 2×2" },
      { type: "fc",      dims: "4096",       params: 102764544,label: "FC 4096" },
      { type: "fc",      dims: "4096",       params: 16781312, label: "FC 4096" },
      { type: "fc",      dims: "1000",       params: 4097000,  label: "FC 1000" },
    ],
  },
  "ResNet-18": {
    year: 2015,
    layers: [
      { type: "input",   dims: "224×224×3",  params: 0,        label: "vstup" },
      { type: "conv",    dims: "112×112×64", params: 9408,     label: "Conv 7×7/2, 64" },
      { type: "pool",    dims: "56×56×64",   params: 0,        label: "MaxPool 3×3/2" },
      { type: "resblk",  dims: "56×56×64",   params: 147968,   label: "ResBlock ×2 (skip)" },
      { type: "resblk",  dims: "28×28×128",  params: 525568,   label: "ResBlock ×2 (skip)" },
      { type: "resblk",  dims: "14×14×256",  params: 2099712,  label: "ResBlock ×2 (skip)" },
      { type: "resblk",  dims: "7×7×512",    params: 8393728,  label: "ResBlock ×2 (skip)" },
      { type: "pool",    dims: "1×1×512",    params: 0,        label: "GlobalAvgPool" },
      { type: "fc",      dims: "1000",       params: 513000,   label: "FC 1000" },
    ],
  },
};

const TYPE_COLOR = {
  input:  "oklch(0.7 0.06 240)",
  conv:   "oklch(0.65 0.18 145)",
  pool:   "oklch(0.7 0.12 60)",
  resblk: "oklch(0.6 0.2 280)",
  fc:     "oklch(0.65 0.18 30)",
};

export default function CnnArchitecturesStack() {
  const [archKey, setArchKey] = useState("AlexNet");
  const [hover, setHover] = useState(null);

  const arch = ARCHS[archKey];
  const totalParams = arch.layers.reduce((s, l) => s + l.params, 0);
  const W = 540, H = 320;
  const colW = 220;

  // Maximum bar width for layers (proportional to log param count)
  const maxLog = Math.max(...arch.layers.map((l) => Math.log10(Math.max(l.params, 1))));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", fontSize: 11 }}>
        <span style={{ color: "var(--text-muted)" }}>architektura:</span>
        {Object.keys(ARCHS).map((k) => (
          <button key={k} onClick={() => setArchKey(k)}
            style={{
              background: archKey === k ? "var(--accent)" : "var(--bg-card)",
              color: archKey === k ? "white" : "var(--text)",
              border: "1px solid var(--line)", padding: "2px 10px", borderRadius: 3, fontSize: 11, cursor: "pointer",
              fontFamily: "var(--font-mono)",
            }}>
            {k}
          </button>
        ))}
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginLeft: 8 }}>
          {arch.year}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 620 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {arch.layers.map((layer, i) => {
          const y = 18 + i * ((H - 36) / arch.layers.length);
          const barLen = layer.params > 0 ? (Math.log10(layer.params) / maxLog) * 220 : 8;
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: "default" }}>
              <rect x={20} y={y} width={barLen} height={16}
                fill={TYPE_COLOR[layer.type]} opacity={hover === i ? 1 : 0.75}/>
              <text x={26 + barLen + 6} y={y + 12} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">
                {layer.label}
              </text>
              <text x={W - 14} y={y + 12} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                {layer.dims}
              </text>
              {layer.type === "resblk" && (
                <path d={`M 14 ${y + 8} Q 4 ${y + 8} 4 ${y - 8} L 4 ${y + 30} Q 4 ${y + 24} 14 ${y + 24}`}
                  stroke="oklch(0.7 0.18 145)" strokeWidth="1.2" fill="none" strokeDasharray="3 2"/>
              )}
            </g>
          );
        })}
      </svg>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 11, fontFamily: "var(--font-mono)" }}>
        <span style={{ color: "var(--text-muted)" }}>celkem parametrů:</span>
        <strong style={{ color: "var(--text)" }}>
          {totalParams.toLocaleString()} ({(totalParams / 1e6).toFixed(2)} M)
        </strong>
        <span style={{ color: "var(--text-muted)" }}>vrstev: {arch.layers.length}</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 10 }}>
        {Object.entries(TYPE_COLOR).map(([t, c]) => (
          <span key={t} style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
            <span style={{ display: "inline-block", width: 12, height: 10, background: c }}/>
            {t}
          </span>
        ))}
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Tloušťka pruhu = log(#parametrů). VGG-16 má drtivou většinu (~85 %) v *posledních* FC vrstvách.
        ResNet zavedl <strong>skip connections</strong> — gradient projde čistý zpět; umožňuje hloubku 100+ vrstev.
        AlexNet (2012) průlom: ReLU, dropout, GPU. EfficientNet (2019) compound scaling, GFLOP/přesnost optimum.
      </div>
    </div>
  );
}
