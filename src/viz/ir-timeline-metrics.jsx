// ir-timeline-metrics — Drag (advance) incident events on timeline.
// Detection / containment / recovery markers; MTTD/MTTR computed live.
import { useState } from "react";

const EVENTS = [
  { id: "compromise", label: "compromise",   shortLabel: "C", defaultT: 0,   color: "oklch(0.65 0.18 22)" },
  { id: "detect",     label: "detection",    shortLabel: "D", defaultT: 12,  color: "oklch(0.75 0.12 60)" },
  { id: "contain",    label: "containment",  shortLabel: "Ct", defaultT: 16, color: "oklch(0.7 0.15 30)" },
  { id: "eradicate",  label: "eradication",  shortLabel: "E",  defaultT: 18, color: "oklch(0.65 0.16 245)" },
  { id: "recover",    label: "recovery",     shortLabel: "R",  defaultT: 36, color: "oklch(0.7 0.15 145)" },
];

const MAX_HOURS = 72;
const PRESETS = {
  fast:    { detect: 1,  contain: 2,  eradicate: 4,  recover: 8 },
  median:  { detect: 12, contain: 16, eradicate: 18, recover: 36 },
  slow:    { detect: 48, contain: 60, eradicate: 64, recover: 72 },
};

export default function IrTimelineMetrics() {
  const [times, setTimes] = useState({ compromise: 0, detect: 12, contain: 16, eradicate: 18, recover: 36 });

  function applyPreset(p) {
    setTimes({ compromise: 0, ...PRESETS[p] });
  }

  const mttd = times.detect - times.compromise;
  const mttContain = times.contain - times.detect;
  const mttr = times.recover - times.detect;

  // Damage scales with detection time
  const damageEst = mttd * 1000 + (times.recover - times.compromise) * 200;

  const W = 580, H = 260;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 11, alignItems: "center" }}>
        <span>preset:</span>
        <button onClick={() => applyPreset("fast")} style={btn(false)}>fast (mature SOC)</button>
        <button onClick={() => applyPreset("median")} style={btn(false)}>median industry</button>
        <button onClick={() => applyPreset("slow")} style={btn(false)}>slow (no IR)</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8, fontSize: 10.5 }}>
        {EVENTS.slice(1).map(e => (
          <div key={e.id}>
            {e.label}: {times[e.id]} h
            <input type="range" min="0" max={MAX_HOURS} step="1" value={times[e.id]}
              onChange={ev => setTimes(t => ({ ...t, [e.id]: +ev.target.value }))} style={{ width: "100%" }} />
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* Timeline */}
        <line x1={30} y1={70} x2={W - 30} y2={70} stroke="var(--line-strong)" strokeWidth="2" />
        {[0, 12, 24, 36, 48, 60, 72].map(t => (
          <g key={t}>
            <line x1={30 + (t / MAX_HOURS) * (W - 60)} y1={66} x2={30 + (t / MAX_HOURS) * (W - 60)} y2={74} stroke="var(--text-muted)" />
            <text x={30 + (t / MAX_HOURS) * (W - 60)} y={90} fontSize="9" fill="var(--text-muted)" textAnchor="middle">{t}h</text>
          </g>
        ))}

        {/* Events */}
        {EVENTS.map((e) => {
          const x = 30 + (times[e.id] / MAX_HOURS) * (W - 60);
          return (
            <g key={e.id}>
              <line x1={x} y1={40} x2={x} y2={70} stroke={e.color} strokeWidth="1.5" />
              <circle cx={x} cy={40} r="6" fill={e.color} stroke="white" strokeWidth="1.5" />
              <text x={x} y={32} fontSize="9" fontWeight="600" fill={e.color} textAnchor="middle">{e.label}</text>
            </g>
          );
        })}

        {/* Period brackets */}
        {(() => {
          const xC = 30 + (times.compromise / MAX_HOURS) * (W - 60);
          const xD = 30 + (times.detect / MAX_HOURS) * (W - 60);
          const xR = 30 + (times.recover / MAX_HOURS) * (W - 60);
          return (
            <>
              <line x1={xC} y1={110} x2={xD} y2={110} stroke="oklch(0.65 0.18 22)" strokeWidth="3" />
              <text x={(xC + xD) / 2} y={106} textAnchor="middle" fontSize="9.5" fill="oklch(0.65 0.18 22)" fontWeight="600">MTTD = {mttd}h</text>
              <line x1={xD} y1={130} x2={xR} y2={130} stroke="oklch(0.7 0.15 145)" strokeWidth="3" />
              <text x={(xD + xR) / 2} y={126} textAnchor="middle" fontSize="9.5" fill="oklch(0.7 0.15 145)" fontWeight="600">MTTR = {mttr}h</text>
            </>
          );
        })()}

        {/* Metrics card */}
        <rect x={20} y={150} width={W - 40} height={95} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={30} y={170} fontSize="11" fontWeight="700" fill="var(--text)">SOC metrics</text>
        <g fontFamily="ui-monospace, monospace" fontSize="10">
          <text x={30} y={190} fill="var(--text)">MTTD (mean time to detect) = {mttd} h</text>
          <text x={30} y={205} fill="var(--text)">MTT contain = {mttContain} h</text>
          <text x={30} y={220} fill="var(--text)">MTTR (to recover) = {mttr} h</text>
          <text x={30} y={235} fill={mttd <= 1 ? "oklch(0.7 0.15 145)" : mttd <= 24 ? "oklch(0.75 0.12 60)" : "oklch(0.65 0.18 22)"} fontWeight="700">
            target: MTTD &lt; 1h, MTTR &lt; 24h {mttd <= 1 && mttr <= 24 ? "✓" : ""}
          </text>
        </g>
        <text x={310} y={170} fontSize="11" fontWeight="700" fill="var(--text)">estimated impact</text>
        <text x={310} y={188} fontSize="10" fontFamily="ui-monospace, monospace" fill="var(--text)">damage = MTTD × $1k/h + total_time × $200/h</text>
        <text x={310} y={205} fontSize="14" fontFamily="ui-monospace, monospace" fontWeight="700"
          fill={damageEst > 50000 ? "oklch(0.65 0.18 22)" : "oklch(0.7 0.15 145)"}>
          ≈ ${(damageEst / 1000).toFixed(1)} k
        </text>
        <text x={310} y={225} fontSize="9" fill="var(--text-muted)">early detection → expon. snížení škod</text>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        NIST 4 fáze: Prepare → Detect &amp; Analyze → Contain/Eradicate/Recover → Post-incident.
        Verizon DBIR median MTTD ~ <b>200 dní</b> (!). Modern XDR + SOAR cílí pod 1 h.
      </div>
    </div>
  );
}

function btn(active) {
  return { background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", border: "1px solid var(--line)", padding: "3px 9px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
