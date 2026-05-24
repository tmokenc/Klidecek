// pdca-isms — Plan → Do → Check → Act cycle. Click phase to advance;
// see example artifacts at each step + arrow showing continual loop.
import { useState } from "react";

const PHASES = [
  {
    id: "plan", label: "Plan", angle: 225,
    title: "establish ISMS scope + policy",
    artifacts: [
      "ISMS scope statement",
      "Information Security Policy",
      "Risk assessment (ISO 27005)",
      "Risk treatment plan",
      "Statement of Applicability (SoA)",
    ],
  },
  {
    id: "do", label: "Do", angle: 315,
    title: "implement + operate ISMS",
    artifacts: [
      "implement controls (Annex A)",
      "operate processes",
      "training + awareness",
      "manage operations",
      "detect + respond to incidents",
    ],
  },
  {
    id: "check", label: "Check", angle: 45,
    title: "monitor + review",
    artifacts: [
      "monitor metrics",
      "internal audits",
      "management review",
      "incident analysis",
      "compliance check",
    ],
  },
  {
    id: "act", label: "Act", angle: 135,
    title: "improve",
    artifacts: [
      "corrective actions",
      "preventive actions",
      "update policies/procedures",
      "address audit findings",
      "continual improvement",
    ],
  },
];

export default function PdcaIsms() {
  const [active, setActive] = useState(0);

  function next() { setActive(a => (a + 1) % PHASES.length); }

  const W = 580, H = 270;
  const cx = 180, cy = 130, R = 80;
  const phase = PHASES[active];

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 11, alignItems: "center" }}>
        <button onClick={next} style={btn(false)}>▶ next phase</button>
        {PHASES.map((p, i) => (
          <button key={p.id} onClick={() => setActive(i)} style={btn(active === i)}>{p.label}</button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* PDCA wheel */}
        {PHASES.map((p, i) => {
          const ang = (p.angle - 90) * Math.PI / 180;
          const x = cx + R * Math.cos(ang);
          const y = cy + R * Math.sin(ang);
          const isActive = i === active;
          return (
            <g key={p.id} style={{ cursor: "pointer" }} onClick={() => setActive(i)}>
              <circle cx={x} cy={y} r="38"
                fill={isActive ? "var(--accent)" : "var(--bg-inset)"}
                stroke={isActive ? "white" : "var(--line)"} strokeWidth={isActive ? 2 : 1} />
              <text x={x} y={y - 2} textAnchor="middle" fontSize="14" fontWeight="700"
                fill={isActive ? "white" : "var(--text)"}>{p.label}</text>
              <text x={x} y={y + 14} textAnchor="middle" fontSize="8.5"
                fill={isActive ? "white" : "var(--text-muted)"}>{p.id.toUpperCase()}</text>
            </g>
          );
        })}
        {/* Arrows around the circle */}
        {PHASES.map((p, i) => {
          const next = PHASES[(i + 1) % PHASES.length];
          const a1 = (p.angle - 90 + 35) * Math.PI / 180;
          const a2 = (next.angle - 90 - 35) * Math.PI / 180;
          const x1 = cx + (R + 4) * Math.cos(a1);
          const y1 = cy + (R + 4) * Math.sin(a1);
          const x2 = cx + (R + 4) * Math.cos(a2);
          const y2 = cy + (R + 4) * Math.sin(a2);
          return (
            <path key={i} d={`M ${x1} ${y1} A ${R + 8} ${R + 8} 0 0 1 ${x2} ${y2}`}
              stroke="var(--accent)" strokeWidth="1.5" fill="none" markerEnd="url(#pd-ar)" />
          );
        })}
        <defs>
          <marker id="pd-ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L5,3 L0,6 z" fill="var(--accent)" /></marker>
        </defs>
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fill="var(--text-muted)">ISMS</text>

        {/* Artifacts panel */}
        <rect x={300} y={30} width={260} height={210} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={310} y={50} fontSize="12" fontWeight="700" fill="var(--accent)">{phase.label}</text>
        <text x={310} y={68} fontSize="10" fill="var(--text)">{phase.title}</text>
        <text x={310} y={90} fontSize="10" fontWeight="600" fill="var(--text-muted)">typické artefakty:</text>
        {phase.artifacts.map((a, i) => (
          <text key={i} x={320} y={108 + i * 16} fontSize="9.5" fill="var(--text)">• {a}</text>
        ))}
        <text x={310} y={220} fontSize="9" fill="var(--text-faint)">každý cyklus → měřitelné zlepšení</text>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        ISO 27001 ISMS = <b>žijící proces</b>, ne jednorázová implementace. PDCA běží <i>continuously</i> — typically annual full cycle,
        quarterly partial. Stagnace = stale policy = compliance theatre.
      </div>
    </div>
  );
}

function btn(active) {
  return { background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", border: "1px solid var(--line)", padding: "3px 9px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
