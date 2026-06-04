// Progressive MSA: guide tree drives merge order; step through pairwise merges.
// "Once a gap, always a gap": a gap introduced in an early merge is frozen and only
// propagated (never removed) into later profiles.
import { useState } from "react";

// Four toy sequences. Merge order follows a guide tree: ((A,B),(C,D)) — the most
// similar pair (A,B) is aligned first, then (C,D), then the two profiles are merged.
const SEQ = {
  A: "TGCATTG",
  B: "TGCAATG",
  C: "TGCTTG",
  D: "TGCTAG",
};

// Pre-computed alignment states for each step. The position-3 gap is born only at the
// final profile↔profile merge (P1 is length 7, P2 length 6), then frozen.
// step 0: raw sequences (no alignment yet) — C, D have NO gaps (raw input can't)
// step 1: align most-similar pair A,B  -> profile P1 (length 7, no gap)
// step 2: align pair C,D               -> profile P2 (length 6, no internal gap)
// step 3: align profile P1 with profile P2 -> shorter P2 gets a gap at col 3; frozen
const STEPS = [
  {
    title: "Vstup: 4 sekvence, zatím nezarovnané",
    desc: "Naváděcí strom určí pořadí slučování. Nejprve se zarovná nejpodobnější pár.",
    rows: [
      { name: "A", chars: "TGCATTG".split("") },
      { name: "B", chars: "TGCAATG".split("") },
      { name: "C", chars: "TGCTTG".split("") },
      { name: "D", chars: "TGCTAG".split("") },
    ],
    active: [],
    profile: null,
  },
  {
    title: "Krok 1 — zarovnej nejpodobnější pár (A, B)",
    desc: "A a B se liší v 1 pozici, žádná mezera nutná. Vznikne profil P1 (délka 7).",
    rows: [
      { name: "A", chars: "TGCATTG".split("") },
      { name: "B", chars: "TGCAATG".split("") },
      { name: "C", chars: "TGCTTG".split("") },
      { name: "D", chars: "TGCTAG".split("") },
    ],
    active: ["A", "B"],
    profile: { rows: ["A", "B"], label: "P1" },
  },
  {
    title: "Krok 2 — zarovnej druhý pár (C, D)",
    desc: "C i D mají délku 6 a liší se jen v 1 pozici — žádná mezera nutná. Vznikne profil P2.",
    rows: [
      { name: "A", chars: "TGCATTG".split("") },
      { name: "B", chars: "TGCAATG".split("") },
      { name: "C", chars: "TGCTTG".split("") },
      { name: "D", chars: "TGCTAG".split("") },
    ],
    active: ["C", "D"],
    profile: { rows: ["C", "D"], label: "P2" },
  },
  {
    title: "Krok 3 — slouči profil P1 s profilem P2",
    desc: "P2 (délka 6) je kratší než P1 (délka 7), proto na 4. pozici vznikne mezera. Ta už zůstane — \"once a gap, always a gap\".",
    rows: [
      { name: "A", chars: "TGCATTG".split("") },
      { name: "B", chars: "TGCAATG".split("") },
      { name: "C", chars: "TGC-TTG".split("") },
      { name: "D", chars: "TGC-TAG".split("") },
    ],
    active: ["A", "B", "C", "D"],
    profile: { rows: ["A", "B", "C", "D"], label: "MSA", frozenGap: 3 },
  },
];

const NCOLS = 7;

export default function BifProgressiveMsa() {
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  const W = 480, H = 240;
  const cell = 26;
  const gridX = 150, gridY = 70;

  // consensus per column (most frequent non-gap char among active rows)
  const consensus = [];
  for (let c = 0; c < NCOLS; c++) {
    const counts = {};
    for (const r of s.rows) {
      if (s.active.includes(r.name)) {
        const ch = r.chars[c];
        if (ch && ch !== "-") counts[ch] = (counts[ch] || 0) + 1;
      }
    }
    let best = "-", bestN = 0;
    for (const k in counts) if (counts[k] > bestN) { best = k; bestN = counts[k]; }
    consensus.push(best);
  }

  const rowY = (i) => gridY + i * cell;
  const colX = (c) => gridX + c * cell;
  const isActive = (name) => s.active.includes(name);

  // Guide tree node positions (left side): leaves A B C D, internal nodes
  const tree = {
    A: [22, gridY + 0.5 * cell],
    B: [22, gridY + 1.5 * cell],
    C: [22, gridY + 2.5 * cell],
    D: [22, gridY + 3.5 * cell],
    AB: [62, gridY + 1.0 * cell],
    CD: [62, gridY + 3.0 * cell],
    root: [100, gridY + 2.0 * cell],
  };
  // which tree edges are "merged" at this step
  const abMerged = step >= 1;
  const cdMerged = step >= 2;
  const rootMerged = step >= 3;

  const edge = (p, q, on) => (
    <path d={`M ${p[0]} ${p[1]} L ${q[0]} ${p[1]} L ${q[0]} ${q[1]} L ${p[0] === q[0] ? q[0] : q[0]} ${q[1]}`}
      fill="none" stroke={on ? "var(--accent)" : "var(--line-strong)"}
      strokeWidth={on ? 2 : 1} opacity={on ? 1 : 0.55} />
  );
  // simple right-angle connector leaf->parent
  const conn = (leaf, parent, on) => (
    <path d={`M ${leaf[0]} ${leaf[1]} L ${parent[0]} ${leaf[1]} L ${parent[0]} ${parent[1]}`}
      fill="none" stroke={on ? "var(--accent)" : "var(--line-strong)"}
      strokeWidth={on ? 2 : 1} opacity={on ? 1 : 0.55} />
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 540, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* guide tree label */}
        <text x={10} y={56} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          naváděcí strom
        </text>

        {/* guide tree edges */}
        {conn(tree.A, tree.AB, abMerged)}
        {conn(tree.B, tree.AB, abMerged)}
        {conn(tree.C, tree.CD, cdMerged)}
        {conn(tree.D, tree.CD, cdMerged)}
        {conn(tree.AB, tree.root, rootMerged)}
        {conn(tree.CD, tree.root, rootMerged)}

        {/* tree leaf dots */}
        {["A", "B", "C", "D"].map((n) => (
          <circle key={n} cx={tree[n][0]} cy={tree[n][1]} r="4"
            fill={isActive(n) ? "var(--accent)" : "var(--bg-card)"}
            stroke="var(--line-strong)" strokeWidth="1" />
        ))}
        {/* internal node dots */}
        <circle cx={tree.AB[0]} cy={tree.AB[1]} r="3.5" fill={abMerged ? "var(--accent)" : "var(--bg-card)"} stroke="var(--line-strong)" />
        <circle cx={tree.CD[0]} cy={tree.CD[1]} r="3.5" fill={cdMerged ? "var(--accent)" : "var(--bg-card)"} stroke="var(--line-strong)" />
        <circle cx={tree.root[0]} cy={tree.root[1]} r="3.5" fill={rootMerged ? "var(--accent)" : "var(--bg-card)"} stroke="var(--line-strong)" />

        {/* alignment grid */}
        {s.rows.map((r, i) => (
          <g key={r.name}>
            <text x={gridX - 12} y={rowY(i) + cell / 2 + 4} textAnchor="end" fontSize="12"
              fontFamily="var(--font-mono)" fill={isActive(r.name) ? "var(--text)" : "var(--text-faint)"}>
              {r.name}
            </text>
            {r.chars.map((ch, c) => {
              const frozen = s.profile && s.profile.frozenGap === c && ch === "-";
              return (
                <g key={c}>
                  <rect x={colX(c)} y={rowY(i)} width={cell - 3} height={cell - 3} rx="3"
                    fill={ch === "-"
                      ? (frozen ? "color-mix(in oklch, var(--accent) 22%, var(--bg-card))" : "var(--bg-card)")
                      : (isActive(r.name) ? "color-mix(in oklch, var(--accent) 14%, var(--bg-card))" : "var(--bg-card)")}
                    stroke={frozen ? "var(--accent)" : "var(--line)"}
                    strokeWidth={frozen ? 1.5 : 0.8}
                    opacity={isActive(r.name) ? 1 : 0.45} />
                  <text x={colX(c) + (cell - 3) / 2} y={rowY(i) + (cell - 3) / 2 + 4}
                    textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)"
                    fill={isActive(r.name) ? "var(--text)" : "var(--text-faint)"}>
                    {ch}
                  </text>
                </g>
              );
            })}
          </g>
        ))}

        {/* consensus row */}
        <text x={gridX - 12} y={rowY(4) + cell / 2 + 4} textAnchor="end" fontSize="11"
          fontFamily="var(--font-mono)" fill="var(--text-muted)">kons.</text>
        {consensus.map((ch, c) => (
          <g key={"k" + c}>
            <rect x={colX(c)} y={rowY(4)} width={cell - 3} height={cell - 3} rx="3"
              fill="var(--bg-card)" stroke="var(--accent-line)" strokeWidth="1" opacity={s.active.length ? 1 : 0.4} />
            <text x={colX(c) + (cell - 3) / 2} y={rowY(4) + (cell - 3) / 2 + 4}
              textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)"
              fill={s.active.length ? "var(--accent)" : "var(--text-faint)"}>
              {s.active.length ? ch : "·"}
            </text>
          </g>
        ))}

        {/* profile bracket label */}
        {s.profile && (
          <text x={colX(NCOLS) + 8} y={gridY + (s.profile.rows.length / 2) * cell + 4}
            fontSize="12" fontFamily="var(--font-mono)" fill="var(--accent)">
            {s.profile.label}
          </text>
        )}
      </svg>

      <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{s.title}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", minHeight: 32 }}>{s.desc}</div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={() => setStep((x) => Math.max(0, x - 1))} disabled={step === 0}
          style={btn(step === 0)}>‹ zpět</button>
        <button onClick={() => setStep((x) => Math.min(STEPS.length - 1, x + 1))}
          disabled={step === STEPS.length - 1} style={btn(step === STEPS.length - 1)}>krok ›</button>
        <span style={{ fontSize: 12, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
          {step + 1} / {STEPS.length}
        </span>
      </div>
    </div>
  );
}

function btn(disabled) {
  return {
    padding: "4px 12px",
    fontSize: 13,
    fontFamily: "var(--font-mono)",
    color: disabled ? "var(--text-faint)" : "var(--text)",
    background: "var(--bg-card)",
    border: "1px solid var(--line-strong)",
    borderRadius: 6,
    cursor: disabled ? "default" : "pointer",
  };
}
