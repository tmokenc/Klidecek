// Amplicon (16S rRNA) vs shotgun metagenomics: toggle between the two workflows.
import { useState } from "react";

export default function PbiMetagenomika() {
  const [mode, setMode] = useState("amplicon"); // "amplicon" | "shotgun"
  const W = 540, H = 210;

  const amplicon = {
    label: "Amplikon (16S rRNA)",
    steps: ["vzorek prostředí", "extrakce DNA", "PCR amplifikace\n16S rRNA genu", "sekvenace\namplikonu", "klastrování\nOTU / ASV"],
    out: ["taxonomie\n(~rod, místy druh)", "relativní zastoupení", "funkce jen predikce\n(PICRUSt)"],
    cheaper: true,
  };
  const shotgun = {
    label: "Shotgun metagenomika",
    steps: ["vzorek prostředí", "extrakce veškeré DNA", "fragmentace\n(bez cílení)", "sekvenace\nvšech fragmentů", "sestavení / mapování\n(reads, MAGs)"],
    out: ["taxonomie\n(až druh / kmen)", "funkční profil\n(geny, dráhy — HUMAnN)", "objev nových druhů"],
    cheaper: false,
  };
  const cfg = mode === "amplicon" ? amplicon : shotgun;

  const bw = 96, bh = 40, gap = 10, x0 = 10, topY = 56, botY = 132;
  const xOf = (i) => x0 + i * (bw + gap);
  const obw = 168;                                   // wider boxes for the (longer) output labels
  const xOfOut = (i) => x0 + i * (obw + gap);

  const Box = (text, x, y, fill, stroke, txt, w = bw) => {
    const lines = text.split("\n");
    return (
      <g>
        <rect x={x} y={y} width={w} height={bh} rx="5" fill={fill} stroke={stroke} strokeWidth="1" />
        {lines.map((ln, k) => (
          <text key={k} x={x + w / 2} y={y + bh / 2 + (k - (lines.length - 1) / 2) * 11}
            textAnchor="middle" dominantBaseline="central" fontSize="9"
            fontFamily="var(--font-mono)" fill={txt}>
            {ln}
          </text>
        ))}
      </g>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        <text x={x0} y={22} fontSize="12" fontFamily="var(--font-mono)" fill="var(--accent)">
          {cfg.label}
        </text>
        <text x={W - x0} y={22} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          {cfg.cheaper ? "levnější · cílené" : "dražší · komplexní"}
        </text>

        <text x={x0} y={46} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">postup:</text>
        {cfg.steps.map((s, i) => (
          <g key={"s" + i}>
            {Box(s, xOf(i), topY, "var(--bg-card)", "var(--line-strong)", "var(--text)")}
            {i < cfg.steps.length - 1 && (
              <path d={`M ${xOf(i) + bw} ${topY + bh / 2} l 8 0 l -3 -3 m 3 3 l -3 3`}
                fill="none" stroke="var(--line-strong)" strokeWidth="1.2" />
            )}
          </g>
        ))}

        <text x={x0} y={botY - 6} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">výstup / profilování:</text>
        {cfg.out.map((s, i) => (
          <g key={"o" + i}>{Box(s, xOfOut(i), botY, "var(--bg-card)", "var(--accent-line)", "var(--text-muted)", obw)}</g>
        ))}

        <text x={x0} y={H - 8} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          přepni přepínačem · oba přístupy začínají u stejného vzorku prostředí
        </text>
      </svg>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setMode("amplicon")}
          style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 12, padding: "4px 8px",
            cursor: "pointer", background: mode === "amplicon" ? "var(--accent)" : "var(--bg-card)",
            color: mode === "amplicon" ? "var(--bg-inset)" : "var(--text)",
            border: "1px solid var(--line-strong)", borderRadius: 5 }}>
          16S amplikon
        </button>
        <button onClick={() => setMode("shotgun")}
          style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 12, padding: "4px 8px",
            cursor: "pointer", background: mode === "shotgun" ? "var(--accent)" : "var(--bg-card)",
            color: mode === "shotgun" ? "var(--bg-inset)" : "var(--text)",
            border: "1px solid var(--line-strong)", borderRadius: 5 }}>
          shotgun
        </button>
      </div>
    </div>
  );
}
