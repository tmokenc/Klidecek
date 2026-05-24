// kill-chain-defender — Lockheed Martin 7-stage cyber kill chain. Toggle
// defender control at each stage; see survival probability of attack chain.
import { useState } from "react";

const STAGES = [
  { id: "recon",   label: "Recon",      defender: "IDS / OSINT mon",   defEff: 0.3 },
  { id: "weapon",  label: "Weaponize",  defender: "honeypot trap",     defEff: 0.4 },
  { id: "deliver", label: "Deliver",    defender: "email filter",      defEff: 0.7 },
  { id: "exploit", label: "Exploit",    defender: "EDR + patching",    defEff: 0.55 },
  { id: "install", label: "Install",    defender: "FIM + EDR",         defEff: 0.5 },
  { id: "c2",      label: "C2",         defender: "DNS sinkhole / egress FW", defEff: 0.6 },
  { id: "action",  label: "Actions",    defender: "DLP",               defEff: 0.4 },
];

export default function KillChainDefender() {
  const [enabled, setEnabled] = useState(() => STAGES.reduce((o, s) => ({ ...o, [s.id]: false }), {}));

  function toggle(id) { setEnabled(e => ({ ...e, [id]: !e[id] })); }

  // Per-stage survival: 1 - defEff if defense on, else 1.
  const probSurvive = STAGES.map(s => enabled[s.id] ? 1 - s.defEff : 1);
  // Cumulative: chain still alive after stage i.
  const cum = probSurvive.reduce((acc, p) => {
    const last = acc.length === 0 ? 1 : acc[acc.length - 1];
    acc.push(last * p);
    return acc;
  }, []);
  const finalProb = cum[cum.length - 1];
  const numEnabled = Object.values(enabled).filter(Boolean).length;

  const W = 580, H = 250;
  const colW = (W - 60) / STAGES.length;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center", fontSize: 11 }}>
        <button onClick={() => setEnabled(STAGES.reduce((o, s) => ({ ...o, [s.id]: true }), {}))} style={btn}>vše zapnout</button>
        <button onClick={() => setEnabled({})} style={btn}>vše vypnout</button>
        <span style={{ color: "var(--text-muted)" }}>kliknutí na fázi = toggle defense</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {STAGES.map((s, i) => {
          const x = 30 + i * colW;
          const on = enabled[s.id];
          const surv = cum[i];
          const barH = 60 * surv;
          return (
            <g key={s.id} style={{ cursor: "pointer" }} onClick={() => toggle(s.id)}>
              <rect x={x + 4} y={40} width={colW - 8} height={36} rx="3"
                fill={on ? "oklch(0.7 0.15 145)" : "var(--bg-inset)"}
                stroke="var(--line)" strokeWidth="1" />
              <text x={x + colW / 2} y={56} textAnchor="middle" fontSize="10" fontWeight="600"
                fill={on ? "white" : "var(--text)"}>{i + 1}. {s.label}</text>
              <text x={x + colW / 2} y={70} textAnchor="middle" fontSize="8.5"
                fill={on ? "white" : "var(--text-muted)"}>{on ? "✓ " : ""}{s.defender}</text>
              {/* survival bar */}
              <rect x={x + colW / 2 - 12} y={155 - barH} width="24" height={barH}
                fill={surv < 0.3 ? "oklch(0.65 0.18 22)" : surv < 0.7 ? "oklch(0.75 0.12 60)" : "oklch(0.65 0.16 245)"}
                opacity="0.85" />
              <line x1={x + 4} y1="155" x2={x + colW - 4} y2="155" stroke="var(--line)" strokeWidth="0.5" />
              <text x={x + colW / 2} y={170} textAnchor="middle" fontSize="9" fill="var(--text-muted)">
                {(surv * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}
        <text x={20} y={100} fontSize="10" fill="var(--text-muted)">útok →</text>
        <text x={20} y={150} fontSize="10" fill="var(--text-muted)">survival</text>

        <rect x={30} y={195} width={W - 60} height={30} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={W / 2} y={213} textAnchor="middle" fontSize="11" fontWeight="600"
          fill={finalProb < 0.05 ? "oklch(0.7 0.15 145)" : finalProb < 0.3 ? "oklch(0.75 0.12 60)" : "oklch(0.65 0.18 22)"}>
          {numEnabled === 0
            ? "žádné defense → útok projde s 100% pravděpodobností"
            : `${numEnabled}/${STAGES.length} defense, útok projde s ${(finalProb * 100).toFixed(1)} % pravděpodobností`}
        </text>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        Klíčový insight: <b>early detection wins</b>. Zastavit recon je triviální (low impact); zastavit ve fázi actions = data už unika.
        Násobíme survival probabilities napříč řetězcem — defense in depth.
      </div>
    </div>
  );
}

const btn = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "3px 8px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
