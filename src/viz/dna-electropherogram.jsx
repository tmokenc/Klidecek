// CE electropherogram: peaks at fluorescent sizes per STR locus.
// Single contributor vs two-person mixture.
import { useState } from "react";

const LOCI = [
  { name: "D3S1358", channel: "blue",   sizeBase: 100, alleleStep: 4, alleleRange: [14, 18] },
  { name: "vWA",     channel: "blue",   sizeBase: 160, alleleStep: 4, alleleRange: [14, 19] },
  { name: "FGA",     channel: "green",  sizeBase: 220, alleleStep: 4, alleleRange: [19, 24] },
  { name: "D8S1179", channel: "green",  sizeBase: 290, alleleStep: 4, alleleRange: [10, 15] },
  { name: "TH01",    channel: "yellow", sizeBase: 350, alleleStep: 4, alleleRange: [6, 10] },
];

const SAMPLES = {
  single_clean: {
    label: "Jediný přispěvatel — čistý",
    profile: { D3S1358: [14, 16], vWA: [16, 17], FGA: [21, 24], D8S1179: [13, 14], TH01: [7, 9] },
    contributors: 1,
    background: 5,
  },
  single_degraded: {
    label: "Jediný přispěvatel — degradovaný",
    profile: { D3S1358: [14, 16], vWA: [16, 17], FGA: [21, 24], D8S1179: [13, 14], TH01: [7, 9] },
    contributors: 1,
    background: 18,
    degraded: true,
  },
  mixture: {
    label: "Směs 2 přispěvatelů (50/50)",
    profile: { D3S1358: [14, 15, 16, 18], vWA: [14, 16, 17, 19], FGA: [21, 22, 23, 24], D8S1179: [11, 13, 14, 15], TH01: [6, 7, 9, 10] },
    contributors: 2,
    background: 8,
    proportions: { D3S1358: [1, 0.9, 1, 0.95], vWA: [0.95, 1, 0.85, 0.9], FGA: [0.9, 0.95, 0.85, 1], D8S1179: [0.85, 1, 0.95, 0.9], TH01: [0.9, 0.95, 1, 0.85] },
  },
  lcn: {
    label: "Low Copy Number (touch DNA)",
    profile: { D3S1358: [14, 16], vWA: [16], FGA: [21, 24], D8S1179: [14], TH01: [7, 9] },
    contributors: 1,
    background: 12,
    dropout: true,
  },
};

const CHANNEL_COLOR = {
  blue:   "rgb(80,140,220)",
  green:  "rgb(64,192,87)",
  yellow: "rgb(220,200,80)",
  red:    "rgb(220,80,80)",
};

export default function DnaElectropherogram() {
  const [sample, setSample] = useState("single_clean");
  const cur = SAMPLES[sample];

  // Build peaks
  const peaks = [];
  for (const L of LOCI) {
    const calls = cur.profile[L.name] || [];
    for (let i = 0; i < calls.length; i++) {
      const allele = calls[i];
      const size = L.sizeBase + (allele - L.alleleRange[0]) * L.alleleStep;
      let height = cur.contributors === 2 ? 1800 * (cur.proportions?.[L.name]?.[i] ?? 1) : 3500;
      if (cur.degraded) {
        // Degradation: peaks at larger sizes diminished
        const sizeFactor = 1 - Math.max(0, (size - 100) / 700);
        height *= sizeFactor;
      }
      if (cur.dropout) {
        // Random dropouts (already baked in via fewer alleles)
        height *= 0.4 + Math.random() * 0.3;
      }
      peaks.push({ size, height, channel: L.channel, allele, locus: L.name });
    }
  }

  const W = 700, H = 240;
  const xMin = 80, xMax = 400;
  const x2px = (s) => 40 + (s - xMin) / (xMax - xMin) * (W - 60);
  const y2px = (h) => H - 40 - (h / 4000) * (H - 60);

  // Fan apart labels of adjacent same-locus peaks (alleles 1 repeat apart map to
  // only ~8px, so centered 2-digit labels would collide). Left label anchors
  // "end" and shifts left, right label anchors "start" and shifts right.
  const LABEL_GAP = 14; // min center-to-center px before a pair counts as "tight"
  for (let i = 0; i < peaks.length; i++) {
    peaks[i].labelDx = 0;
    peaks[i].labelAnchor = "middle";
  }
  for (let i = 1; i < peaks.length; i++) {
    const prev = peaks[i - 1], p = peaks[i];
    if (prev.locus === p.locus && x2px(p.size) - x2px(prev.size) < LABEL_GAP) {
      prev.labelDx = -4; prev.labelAnchor = "end";
      p.labelDx = 4; p.labelAnchor = "start";
    }
  }

  // Gaussian-like peaks
  function peakPath(p) {
    const xc = x2px(p.size);
    const yc = y2px(p.height);
    const baseY = H - 40;
    return `M ${xc - 8} ${baseY} Q ${xc - 5} ${(yc + baseY) / 2} ${xc} ${yc} Q ${xc + 5} ${(yc + baseY) / 2} ${xc + 8} ${baseY}`;
  }

  // Group peaks by locus for annotation
  const lociGroups = LOCI.map(L => ({
    L,
    peaks: peaks.filter(p => p.locus === L.name),
  }));

  // Mixture interpretation hint
  const isMixture = cur.contributors === 2;
  const minAllelesPerLocus = isMixture ? Math.min(...LOCI.map(L => (cur.profile[L.name] || []).length)) : 0;

  return (
    <div style={ctn}>
      <div className="viz-controls">
        <label style={lbl}>vzorek:</label>
        <select className="viz-select" value={sample} onChange={(e) => setSample(e.target.value)}>
          {Object.entries(SAMPLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 800, background: "var(--bg-inset)", borderRadius: 6 }}>
        {/* axes */}
        <line x1={40} y1={H - 40} x2={W - 20} y2={H - 40} stroke="var(--text-muted)" />
        <line x1={40} y1={20} x2={40} y2={H - 40} stroke="var(--text-muted)" />
        {/* size ticks */}
        {[100, 150, 200, 250, 300, 350, 400].map((s) => (
          <g key={s}>
            <line x1={x2px(s)} y1={H - 40} x2={x2px(s)} y2={H - 37} stroke="var(--text-muted)" />
            <text x={x2px(s)} y={H - 26} fontSize="9" textAnchor="middle" fill="var(--text-muted)">{s}</text>
          </g>
        ))}
        <text x={(W) / 2} y={H - 8} fontSize="10" textAnchor="middle" fill="var(--text-muted)">velikost fragmentu [bp]</text>

        {/* baseline noise */}
        <path d={`M 40 ${H - 40} ${Array.from({ length: 80 }).map((_, i) => `L ${40 + i * (W - 60) / 80} ${H - 40 - (Math.sin(i * 0.5) + Math.cos(i * 0.3)) * cur.background}`).join(" ")} L ${W - 20} ${H - 40}`} fill="rgba(150,150,150,0.15)" stroke="rgba(150,150,150,0.3)" />

        {/* peaks */}
        {peaks.map((p, i) => (
          <g key={i}>
            <path d={peakPath(p)} fill={CHANNEL_COLOR[p.channel]} opacity="0.85" />
            <text x={x2px(p.size) + p.labelDx} y={y2px(p.height) - 5} fontSize="10" textAnchor={p.labelAnchor} fill={CHANNEL_COLOR[p.channel]} fontWeight="600">{p.allele}</text>
          </g>
        ))}

        {/* locus groupings */}
        {lociGroups.map((g, i) => {
          if (g.peaks.length === 0) return null;
          const sizes = g.peaks.map(p => p.size);
          const xL = x2px(Math.min(...sizes)) - 12;
          const xR = x2px(Math.max(...sizes)) + 12;
          return (
            <g key={i}>
              <rect x={xL} y={20} width={xR - xL} height={4} fill={CHANNEL_COLOR[g.L.channel]} opacity="0.5" />
              <text x={(xL + xR) / 2} y={16} fontSize="10" textAnchor="middle" fill={CHANNEL_COLOR[g.L.channel]} fontWeight="600">{g.L.name}</text>
            </g>
          );
        })}
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <div style={statBox}>
          <div style={statLbl}>počet přispěvatelů</div>
          <div style={statVal}>{cur.contributors}{isMixture ? " (směs)" : ""}</div>
        </div>
        <div style={statBox}>
          <div style={statLbl}>max alel / locus</div>
          <div style={statVal}>{Math.max(...LOCI.map(L => (cur.profile[L.name] || []).length))}</div>
        </div>
        <div style={statBox}>
          <div style={statLbl}>volání</div>
          <div style={{ ...statVal, color: cur.dropout || cur.degraded ? "rgb(220,140,80)" : "rgb(64,192,87)" }}>
            {cur.dropout ? "partial (dropout)" : cur.degraded ? "degraded" : "jasné"}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Každý locus má svůj fluorescenční kanál (4-color CE). <b>Max 2 alely / locus</b> u jednotlivce (heterozygot) — víc alel = směs.
        <b>Degraded</b>: peaks vyšších bp se ztrácí (typické pro forenzní stopy).
        <b>LCN</b>: stochastické dropouty alel → probabilistic genotyping (STRmix / TrueAllele).
        Mix 50/50 dává peaks podobné výšky; nerovné poměry indikují major/minor contributor.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const statBox = { background: "var(--bg-inset)", padding: 8, borderRadius: 6, textAlign: "center" };
const statLbl = { fontSize: 10, color: "var(--text-muted)" };
const statVal = { fontSize: 14, fontWeight: 600, fontFamily: "var(--font-mono)", marginTop: 4 };
