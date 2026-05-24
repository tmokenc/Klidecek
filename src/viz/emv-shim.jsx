// Murdoch-Drimer EMV chip-and-PIN shim: utocnik mezi kartu a terminal vlozi
// MITM zarizeni; terminal akceptuje libovolny PIN.
import { useState } from "react";

const STEPS = [
  {
    actor: "T",
    msg: "VERIFY PIN 0000",
    dir: "→ Shim",
    note: "Terminal posila zadany PIN k overeni karte.",
    bgcolor: "var(--bg-card)",
  },
  {
    actor: "S",
    msg: "(zachycen — nepouzit dal)",
    dir: "× ↛ Card",
    note: "Shim NEpredava VERIFY PIN na kartu. Karta tak vubec neprovadi overovani.",
    bgcolor: "var(--bg-card)",
    danger: true,
  },
  {
    actor: "S",
    msg: "90 00",
    dir: "→ Terminal",
    note: "Shim odpovida terminalu jako kdyby karta potvrdila uspesny PIN.",
    bgcolor: "var(--bg-card)",
    danger: true,
  },
  {
    actor: "T",
    msg: "GENERATE AC (ARQC, no-CVM-tried IAD)",
    dir: "→ Card",
    note: "Terminal pokracuje k autorizaci transakce. Posila kartě požadavek na podpis transakcních dat.",
    bgcolor: "var(--bg-card)",
  },
  {
    actor: "C",
    msg: "ARQC s IAD: 'no CVM performed'",
    dir: "→ Terminal",
    note: "Karta v IAD (Issuer Application Data) hlasi 'zadny CVM nebyl proveden' — protoze ze sve strany VERIFY PIN nevidela.",
    bgcolor: "var(--bg-card)",
  },
  {
    actor: "T",
    msg: "Auth Request: 'PIN OK' v TVR",
    dir: "→ Banka",
    note: "Terminal hlasi bance 'PIN overen' (TVR — Terminal Verification Results). Banka ARQC verifikuje a schvali.",
    bgcolor: "var(--bg-card)",
    accent: true,
  },
];

const ACTOR_STYLE = {
  T: { x: 80, label: "Terminal", color: "var(--accent)" },
  S: { x: 260, label: "Shim (MITM)", color: "#e07a5f" },
  C: { x: 440, label: "Karta", color: "#81b29a" },
};

export default function EmvShim() {
  const [step, setStep] = useState(0);

  const W = 520, H = 360;
  const stepY = 70;
  const stepGap = 42;

  return (
    <div style={ctn}>
      <div style={row}>
        <button style={btn} onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← zpet</button>
        <span style={lbl}>krok {step + 1} / {STEPS.length}</span>
        <button style={btn} onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={step === STEPS.length - 1}>vpred →</button>
        <button style={btn} onClick={() => setStep(0)}>reset</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 580, background: "var(--bg-inset)", borderRadius: 6 }}>
        {Object.entries(ACTOR_STYLE).map(([k, v]) => (
          <g key={k}>
            <rect x={v.x - 50} y={16} width={100} height={32} rx={6} fill="var(--bg-card)" stroke={v.color} strokeWidth="1.4" />
            <text x={v.x} y={37} fontSize="12" textAnchor="middle" fill={v.color} fontWeight="bold">{v.label}</text>
            <line x1={v.x} y1={50} x2={v.x} y2={H - 8} stroke={v.color} strokeWidth="0.6" strokeDasharray="3 3" />
          </g>
        ))}

        {STEPS.slice(0, step + 1).map((s, idx) => {
          const y = stepY + idx * stepGap;
          const fromX = ACTOR_STYLE[s.actor].x;
          let toX;
          if (s.dir.includes("Terminal")) toX = ACTOR_STYLE.T.x;
          else if (s.dir.includes("Shim")) toX = ACTOR_STYLE.S.x;
          else if (s.dir.includes("Card")) toX = ACTOR_STYLE.C.x;
          else toX = ACTOR_STYLE.T.x; // bank
          const danger = s.danger;
          const color = danger ? "#e07a5f" : "var(--accent)";
          const lineColor = s.dir.includes("↛") ? "#e07a5f" : color;

          if (s.dir.includes("Banka")) {
            return (
              <g key={idx}>
                <text x={fromX} y={y - 4} fontSize="10" textAnchor="middle" fill={color} fontFamily="var(--font-mono)">{s.msg}</text>
                <text x={fromX} y={y + 18} fontSize="9" textAnchor="middle" fill="var(--text-muted)">↑ → Banka</text>
              </g>
            );
          }

          return (
            <g key={idx}>
              <text x={(fromX + toX) / 2} y={y - 4} fontSize="10" textAnchor="middle" fill={color} fontFamily="var(--font-mono)">{s.msg}</text>
              {s.dir.includes("↛") ? (
                <text x={(fromX + toX) / 2} y={y + 14} fontSize="14" textAnchor="middle" fill="#e07a5f">✗</text>
              ) : (
                <line x1={fromX} y1={y + 6} x2={toX} y2={y + 6} stroke={lineColor} strokeWidth={idx === step ? 2 : 1}
                  markerEnd={`url(#arr-${danger ? "d" : "a"})`} />
              )}
            </g>
          );
        })}

        <defs>
          <marker id="arr-a" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)" />
          </marker>
          <marker id="arr-d" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="#e07a5f" />
          </marker>
        </defs>
      </svg>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontSize: 12 }}>
        <div style={{ fontWeight: 600, color: STEPS[step].danger ? "#e07a5f" : STEPS[step].accent ? "var(--accent)" : "var(--text)" }}>
          {STEPS[step].actor}: {STEPS[step].msg}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{STEPS[step].note}</div>
      </div>

      {step === STEPS.length - 1 && (
        <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontSize: 11, color: "var(--text-muted)", borderLeft: "3px solid #e07a5f" }}>
          <b style={{ color: "var(--text)" }}>Klicovy mismatch:</b> terminal hlasi v TVR "PIN OK", ale karta v IAD vraci
          "no CVM performed". V dobe utoku (2010) banky tento mismatch NEkontrolovaly. Mitigace (EMV od 2013):
          <b> Combined DDA / AC generation (CDA)</b> — karta podepisuje hash vsech CVM dat spolu s ARQC, banka nemůže přehlédnout mismatch.
        </div>
      )}
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
