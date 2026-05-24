// cc-eal-explorer — Slide EAL 1-7. Show required evidence (informal /
// semiformal / formal) + typical product class.
import { useState } from "react";

const EALS = [
  { n: 1, name: "Functionally tested",     evidence: ["functional spec"],                                                          cost: 100,    months: 6,  examples: ["basic apps"] },
  { n: 2, name: "Structurally tested",     evidence: ["functional spec", "high-level design", "vuln assessment"],                  cost: 250,    months: 9,  examples: ["mid-tier products"] },
  { n: 3, name: "Methodically tested",     evidence: ["high-level design", "test coverage analysis", "security testing"],          cost: 500,    months: 12, examples: ["commercial firewall"] },
  { n: 4, name: "Methodically designed",   evidence: ["low-level design", "source code review", "independent vuln testing"],       cost: 1000,   months: 15, examples: ["Windows Server", "RHEL", "Cisco ASA"] },
  { n: 5, name: "Semiformally designed",   evidence: ["semi-formal design", "covert channel analysis", "modular structure"],       cost: 2000,   months: 18, examples: ["smart card OS", "MUSCLE"] },
  { n: 6, name: "Semi-formally verified",  evidence: ["semi-formal proofs", "structured presentation", "deep vuln testing"],       cost: 3500,   months: 22, examples: ["high-assurance smart card"] },
  { n: 7, name: "Formally verified",       evidence: ["formal proof of design", "formal correspondence", "comprehensive testing"], cost: 5000,   months: 24, examples: ["seL4 microkernel", "military OS"] },
];

const STYLE_BY_LEVEL = (n) => {
  if (n <= 2) return { tone: "informal", color: "oklch(0.65 0.16 245)" };
  if (n <= 4) return { tone: "structured", color: "oklch(0.7 0.15 145)" };
  if (n <= 6) return { tone: "semiformal", color: "oklch(0.75 0.12 60)" };
  return { tone: "formal", color: "oklch(0.65 0.18 22)" };
};

export default function CcEalExplorer() {
  const [n, setN] = useState(4);

  const eal = EALS[n - 1];
  const tone = STYLE_BY_LEVEL(n);

  const W = 580, H = 260;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: 8, fontSize: 11 }}>
        EAL = {n} ({eal.name})
        <input type="range" min="1" max="7" value={n} onChange={e => setN(+e.target.value)}
          style={{ width: 280, marginLeft: 10, verticalAlign: "middle" }} />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* EAL ladder */}
        {EALS.map((e, i) => {
          const x = 30 + i * 75;
          const isSel = e.n === n;
          const style = STYLE_BY_LEVEL(e.n);
          return (
            <g key={e.n}>
              <rect x={x} y={30} width={68} height={36} rx="3"
                fill={isSel ? style.color : "var(--bg-inset)"}
                stroke={style.color} strokeWidth={isSel ? 2 : 0.8}
                opacity={isSel ? 0.9 : 0.4} />
              <text x={x + 34} y={51} textAnchor="middle" fontSize="13" fontWeight="700"
                fill={isSel ? "white" : "var(--text)"}>EAL {e.n}</text>
              <text x={x + 34} y={80} textAnchor="middle" fontSize="9" fill={style.color} fontWeight={isSel ? 700 : 400}>
                {STYLE_BY_LEVEL(e.n).tone}
              </text>
            </g>
          );
        })}

        {/* Required evidence */}
        <rect x={20} y={100} width={W - 40} height={80} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={30} y={118} fontSize="11" fontWeight="700" fill="var(--text)">{eal.name}</text>
        <text x={30} y={134} fontSize="10" fill="var(--text-muted)">vyžadované evidence:</text>
        {eal.evidence.map((ev, i) => (
          <text key={i} x={40} y={150 + i * 13} fontSize="10" fill={tone.color}>• {ev}</text>
        ))}

        {/* Cost + duration */}
        <g fontFamily="ui-monospace, monospace" fontSize="10.5">
          <rect x={20} y={195} width={170} height={50} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
          <text x={30} y={213} fill="var(--text-muted)" fontFamily="ui-sans-serif, system-ui">cost (k$)</text>
          <text x={30} y={235} fontWeight="700" fill={tone.color}>${eal.cost} k</text>

          <rect x={200} y={195} width={170} height={50} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
          <text x={210} y={213} fill="var(--text-muted)" fontFamily="ui-sans-serif, system-ui">trvání</text>
          <text x={210} y={235} fontWeight="700" fill={tone.color}>{eal.months} mes.</text>

          <rect x={380} y={195} width={180} height={50} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
          <text x={390} y={213} fill="var(--text-muted)" fontFamily="ui-sans-serif, system-ui">typický produkt</text>
          <text x={390} y={235} fontSize="10" fill="var(--text)" fontFamily="ui-sans-serif, system-ui">{eal.examples[0]}</text>
        </g>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        Vyšší EAL = víc evidence + víc nezávislých revizorů. EAL 4 je <i>praktický maximum</i> pro mainstream commercial.
        EAL 5+ pro smart card / military. EAL 7 vyžaduje <b>formální matematický důkaz</b> designu (seL4 microkernel).
      </div>
    </div>
  );
}
