// Genomics pipeline: click a stage to see the tool + data format flowing through it.
import { useState } from "react";

export default function PbiGenomikaPipeline() {
  const stages = [
    { id: 0, name: "Sekvenace",      tool: "Illumina / Nanopore / PacBio", inFmt: "DNA", outFmt: "FASTQ", note: "čtení (reads) + kvalita (Phred Q)" },
    { id: 1, name: "Kontrola kvality", tool: "FastQC, Trimmomatic, fastp",  inFmt: "FASTQ", outFmt: "FASTQ", note: "ořez adaptérů a nekvalitních konců" },
    { id: 2, name: "Sestavení / mapování", tool: "SPAdes (de novo) · BWA, Bowtie2 (na referenci)", inFmt: "FASTQ", outFmt: "FASTA / BAM", note: "contigy nebo zarovnání na referenci" },
    { id: 3, name: "Anotace",        tool: "Prokka, AUGUSTUS, MAKER",     inFmt: "FASTA", outFmt: "GFF / GTF", note: "geny, exony, regulační oblasti" },
    { id: 4, name: "Variant calling", tool: "GATK, bcftools, FreeBayes",  inFmt: "BAM", outFmt: "VCF", note: "SNP, indely vůči referenci" },
  ];
  const [sel, setSel] = useState(2);

  const W = 540, H = 200;
  const bw = 92, gap = 14, x0 = 12, by = 38, bh = 50;
  const xOf = (i) => x0 + i * (bw + gap);
  const cur = stages[sel];

  // Split a stage name onto (at most) two lines so it fits the bw-wide box.
  // Break on " / " when present, otherwise on the last space before the midpoint.
  const wrapLabel = (name) => {
    if (name.includes(" / ")) {
      const [a, b] = name.split(" / ");
      return [a, "/ " + b];
    }
    // ~6.6px per char at fontSize 11 mono → ~14 chars fit a 92px box.
    if (name.length <= 14 || !name.includes(" ")) return [name];
    const words = name.split(" ");
    let line1 = words[0];
    let i = 1;
    while (i < words.length && (line1 + " " + words[i]).length <= 13) {
      line1 += " " + words[i];
      i++;
    }
    const line2 = words.slice(i).join(" ");
    return line2 ? [line1, line2] : [line1];
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        <text x={x0} y={24} fontSize="12" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          tok dat genomickou analýzou — klikni na krok
        </text>

        {stages.map((s, i) => {
          const active = i === sel;
          const lines = wrapLabel(s.name);
          const cx = xOf(i) + bw / 2;
          const cy = by + bh / 2;
          // Single line: centered. Two lines: offset above/below center.
          const y0 = lines.length === 1 ? cy : cy - 6;
          return (
            <g key={s.id} onClick={() => setSel(i)} style={{ cursor: "pointer" }}>
              <rect x={xOf(i)} y={by} width={bw} height={bh} rx="6"
                fill={active ? "var(--accent)" : "var(--bg-card)"}
                stroke={active ? "var(--accent)" : "var(--line-strong)"} strokeWidth={active ? 2 : 1} />
              {lines.map((ln, li) => (
                <text key={li} x={cx} y={y0 + li * 13} textAnchor="middle" dominantBaseline="central"
                  fontSize="11" fontFamily="var(--font-mono)"
                  fill={active ? "var(--bg-inset)" : "var(--text)"}>
                  {ln}
                </text>
              ))}
            </g>
          );
        })}

        {stages.slice(0, -1).map((s, i) => {
          const x = xOf(i) + bw, xe = xOf(i + 1);
          const y = by + bh / 2;
          return (
            <g key={"a" + i}>
              <line x1={x} y1={y} x2={xe - 4} y2={y} stroke="var(--line-strong)" strokeWidth="1.5" />
              <path d={`M ${xe - 4} ${y} l -6 -3 l 0 6 z`} fill="var(--line-strong)" />
              <text x={(x + xe) / 2} y={y - 6} textAnchor="middle" fontSize="9"
                fontFamily="var(--font-mono)" fill="var(--text-faint)">
                {s.outFmt.split(" / ")[0]}
              </text>
            </g>
          );
        })}

        <rect x={x0} y={H - 78} width={W - 2 * x0} height={66} rx="6"
          fill="var(--bg-card)" stroke="var(--accent-line)" strokeWidth="1" />
        <text x={x0 + 10} y={H - 60} fontSize="11" fontFamily="var(--font-mono)" fill="var(--accent)">
          {cur.name}
        </text>
        <text x={x0 + 10} y={H - 44} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">
          vstup: {cur.inFmt}   {"→"}   výstup: {cur.outFmt}
        </text>
        <text x={x0 + 10} y={H - 28} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          nástroje: {cur.tool}
        </text>
        <text x={x0 + 10} y={H - 14} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          {cur.note}
        </text>
      </svg>
    </div>
  );
}
