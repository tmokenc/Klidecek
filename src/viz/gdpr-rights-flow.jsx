// gdpr-rights-flow — Pick data subject request type; decision tree of
// legal grounds, timelines, response actions.
import { useState } from "react";

const REQUESTS = {
  access: {
    label: "Right of access (čl. 15)",
    legal: ["lawful basis check", "verify identity"],
    timeline: 30,  // days
    extension: 60, // can extend by 2 mo for complex
    actions: ["compile portable copy", "include purposes/recipients/retention", "free of charge first time"],
    refuse: ["manifestly unfounded", "excessive (charge fee)"]
  },
  rectify: {
    label: "Right to rectification (čl. 16)",
    legal: ["verify identity", "check accuracy claim"],
    timeline: 30,
    extension: 60,
    actions: ["correct data", "notify recipients of correction"],
    refuse: ["data demonstrably correct"]
  },
  erase: {
    label: "Right to erasure (čl. 17)",
    legal: ["verify identity", "check lawful basis still applies", "no overriding interest"],
    timeline: 30,
    extension: 60,
    actions: ["delete from primary systems", "delete from backups (next cycle)", "notify processors", "notify recipients"],
    refuse: ["freedom of expression", "legal obligation to retain (tax, audit)", "public interest", "legal claims"]
  },
  portability: {
    label: "Right to data portability (čl. 20)",
    legal: ["verify identity", "based on consent or contract", "automated processing"],
    timeline: 30,
    extension: 60,
    actions: ["export structured machine-readable (JSON/CSV)", "transmit to other controller if technically feasible"],
    refuse: ["not consent/contract basis", "not automated", "affects others' rights"]
  },
  object: {
    label: "Right to object (čl. 21)",
    legal: ["verify identity", "is direct marketing? → absolute right; otherwise balancing test"],
    timeline: 30,
    extension: 60,
    actions: ["stop processing immediately if direct marketing", "demonstrate compelling legitimate grounds (otherwise stop)"],
    refuse: ["compelling legitimate grounds", "legal claims"]
  },
};

export default function GdprRightsFlow() {
  const [req, setReq] = useState("erase");
  const [step, setStep] = useState(0);

  const r = REQUESTS[req];

  const STEPS = [
    { label: "1. Receive request", desc: `Data subject podává: ${r.label}` },
    { label: "2. Verify legal basis", desc: r.legal.join(" • ") },
    { label: "3. Take action", desc: r.actions.join(" • ") },
    { label: "4. Respond", desc: `Within ${r.timeline} days (up to +${r.extension} pokud complex)` },
  ];

  const W = 580, H = 270;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 11, alignItems: "center", flexWrap: "wrap" }}>
        <span>request type:</span>
        <select value={req} onChange={e => { setReq(e.target.value); setStep(0); }} style={ctrl}>
          {Object.entries(REQUESTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} style={btn(false)}>step ›</button>
        <button onClick={() => setStep(0)} style={btn(false)}>reset</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* Steps */}
        {STEPS.map((s, i) => {
          const x = 30 + i * 135;
          const active = step >= i;
          const isCur = step === i;
          return (
            <g key={i} opacity={active ? 1 : 0.35}>
              <rect x={x} y={25} width={125} height={50} rx="3"
                fill={isCur ? "oklch(0.65 0.16 245 / 0.3)" : active ? "var(--bg-inset)" : "var(--bg-inset)"}
                stroke={isCur ? "oklch(0.65 0.16 245)" : "var(--line)"} strokeWidth={isCur ? 2 : 0.8} />
              <text x={x + 62} y={45} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text)">{s.label}</text>
              <text x={x + 62} y={62} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{s.desc.split(" • ")[0].slice(0, 26)}{s.desc.length > 26 ? "…" : ""}</text>
              {i < STEPS.length - 1 && (
                <line x1={x + 125} y1={50} x2={x + 135} y2={50} stroke="var(--accent)" strokeWidth="1.5" markerEnd="url(#gd-ar)" />
              )}
            </g>
          );
        })}
        <defs>
          <marker id="gd-ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L5,3 L0,6 z" fill="var(--accent)" /></marker>
        </defs>

        {/* Current step details */}
        <rect x={20} y={95} width={W - 40} height={100} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={30} y={114} fontSize="11" fontWeight="700" fill="var(--text)">{STEPS[step].label}</text>
        <text x={30} y={130} fontSize="10" fill="var(--text)">{STEPS[step].desc}</text>
        {step === 1 && r.legal.map((l, i) => (
          <text key={i} x={40} y={148 + i * 13} fontSize="9.5" fill="var(--accent)">✓ {l}</text>
        ))}
        {step === 2 && r.actions.map((a, i) => (
          <text key={i} x={40} y={148 + i * 13} fontSize="9.5" fill="oklch(0.7 0.15 145)">→ {a}</text>
        ))}
        {step === 3 && (
          <>
            <text x={40} y={150} fontSize="10" fill="var(--text)">timeline = <tspan fontWeight="700" fill="oklch(0.65 0.16 245)">{r.timeline} days</tspan> (čl. 12.3)</text>
            <text x={40} y={166} fontSize="10" fill="var(--text)">extension = up to +{r.extension} days for complex requests</text>
            <text x={40} y={182} fontSize="9.5" fill="oklch(0.65 0.18 22)">⚠ Breach notification = <b>72 h</b> to supervisor (čl. 33)</text>
          </>
        )}

        {/* Refusal grounds */}
        <rect x={20} y={205} width={W - 40} height={50} rx="3" fill="oklch(0.65 0.18 22 / 0.1)" stroke="oklch(0.65 0.18 22 / 0.4)" />
        <text x={30} y={222} fontSize="10" fontWeight="600" fill="oklch(0.65 0.18 22)">odmítnutí lze pokud:</text>
        {r.refuse.map((rf, i) => (
          <text key={i} x={30 + (i % 2) * 270} y={238 + Math.floor(i / 2) * 13} fontSize="9.5" fill="var(--text)">• {rf}</text>
        ))}
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        GDPR čl. 12-23: každá žádost musí být zpracována <b>do 1 měsíce</b>, doložená písemně, bezplatně (poprvé).
        Penalties: až <b>€20 M nebo 4 %</b> globálního obratu (Amazon: €746 M, Meta: €1.2 B).
      </div>
    </div>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 5px", borderRadius: 3, fontSize: 11 };
function btn(active) {
  return { background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", border: "1px solid var(--line)", padding: "3px 9px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
