// wap-event-propagation — šíření DOM události třemi fázemi.
// Tři vnořené prvky (dům > pokoj > tlačítko). Krokujeme capturing (kořen→cíl),
// target a bubbling (cíl→kořen). Toggle přepíná, kteří posluchači jsou
// registrováni v capture fázi — mění to pořadí, ve kterém se ozvou.
import { useState } from "react";

// Vnořené prvky od kořene k cíli.
const NODES = [
  { id: "dum", label: "#dum", hue: 264 },
  { id: "pokoj", label: "#pokoj", hue: 200 },
  { id: "tlacitko", label: "#tlačítko (cíl)", hue: 142 },
];

// Geometrie soustředných obdélníků.
const BOX = [
  { x: 20, y: 16, w: 300, h: 150 },
  { x: 55, y: 48, w: 230, h: 90 },
  { x: 95, y: 78, w: 150, h: 34 },
];

// Postav sekvenci „zásahů" posluchačů podle toho, jestli je daný uzel
// registrován v capture fázi. capture[i] = true → uzel reaguje při sestupu,
// jinak při probublávání. Cílový posluchač se ozve uprostřed.
function buildHits(capture) {
  const hits = [];
  // capturing: kořen → cíl, jen uzly s capture=true (mimo samotný cíl)
  for (let i = 0; i < NODES.length - 1; i++)
    if (capture[i]) hits.push({ node: i, phase: "capturing" });
  // target
  hits.push({ node: NODES.length - 1, phase: "target" });
  // bubbling: cíl → kořen, uzly s capture=false (mimo cíl)
  for (let i = NODES.length - 2; i >= 0; i--)
    if (!capture[i]) hits.push({ node: i, phase: "bubbling" });
  return hits;
}

const PHASE_COLOR = {
  capturing: 200,
  target: 142,
  bubbling: 22,
};

export default function WapEventPropagation() {
  // capture[0]=dum, capture[1]=pokoj. Cíl (tlačítko) reaguje vždy v target.
  const [capture, setCapture] = useState([false, false]);
  const [step, setStep] = useState(0);

  const hits = buildHits(capture);
  const shown = hits.slice(0, step); // kolik posluchačů už se ozvalo
  const activeHit = step > 0 ? hits[step - 1] : null;
  const activeNode = activeHit ? activeHit.node : -1;

  const toggle = (i) => {
    setCapture((c) => c.map((v, k) => (k === i ? !v : v)));
    setStep(0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setStep(0)}>⟲ reset</button>
        <button className="viz-btn primary" onClick={() => setStep(Math.min(hits.length, step + 1))} disabled={step >= hits.length}>
          {step === 0 ? "▶ klikni na tlačítko" : "krok →"}
        </button>
        <span className="viz-readout">
          {step}/{hits.length}
        </span>
      </div>

      <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-muted)", flexWrap: "wrap" }}>
        <span>posluchač v capture fázi:</span>
        {NODES.slice(0, 2).map((n, i) => (
          <label key={n.id} style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)" }}>
            <input type="checkbox" checked={capture[i]} onChange={() => toggle(i)} />
            {n.label}
          </label>
        ))}
      </div>

      <svg viewBox="0 0 340 250" style={{ width: "100%", maxWidth: 400, background: "var(--bg-inset)", borderRadius: 6 }}>
        {/* soustředné prvky */}
        {NODES.map((n, i) => {
          const b = BOX[i];
          const active = i === activeNode;
          const hue = n.hue;
          return (
            <g key={n.id}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={6}
                fill={active ? `oklch(0.62 0.15 ${hue} / 0.30)` : "var(--bg-card)"}
                stroke={`oklch(0.6 0.14 ${hue})`} strokeWidth={active ? 2.2 : 1} />
              <text x={b.x + 8} y={b.y + 15} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">{n.label}</text>
              {capture[i] !== undefined && i < 2 && (
                <text x={b.x + b.w - 6} y={b.y + 15} textAnchor="end" fontSize="8.5"
                  fill={capture[i] ? `oklch(0.55 0.15 ${PHASE_COLOR.capturing})` : "var(--text-faint)"}>
                  {capture[i] ? "capture" : "bubble"}
                </text>
              )}
            </g>
          );
        })}

        {/* sekvence zásahů jako log vpravo dole už ne — dáme pod SVG */}
        {/* šipky fází po stranách */}
        <line x1="328" y1="22" x2="328" y2="95" stroke={`oklch(0.55 0.15 ${PHASE_COLOR.capturing})`} strokeWidth="2" markerEnd="url(#wepDown)" />
        <text x="320" y="60" fontSize="8.5" textAnchor="middle" fill={`oklch(0.5 0.15 ${PHASE_COLOR.capturing})`} writingMode="tb">capturing</text>
        <line x1="12" y1="95" x2="12" y2="22" stroke={`oklch(0.55 0.15 ${PHASE_COLOR.bubbling})`} strokeWidth="2" markerEnd="url(#wepUp)" />

        <defs>
          <marker id="wepDown" viewBox="0 0 10 10" refX="5" refY="9" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,0 L5,10 Z" fill={`oklch(0.55 0.15 ${PHASE_COLOR.capturing})`} />
          </marker>
          <marker id="wepUp" viewBox="0 0 10 10" refX="5" refY="9" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,0 L5,10 Z" fill={`oklch(0.55 0.15 ${PHASE_COLOR.bubbling})`} />
          </marker>
        </defs>

        {/* aktuální fáze */}
        {activeHit && (
          <g>
            <rect x="90" y="175" width="160" height="24" rx={5}
              fill={`oklch(0.62 0.15 ${PHASE_COLOR[activeHit.phase]} / 0.22)`}
              stroke={`oklch(0.6 0.15 ${PHASE_COLOR[activeHit.phase]})`} />
            <text x="170" y="191" textAnchor="middle" fontSize="11" fontWeight="600"
              fill="var(--text)">fáze: {activeHit.phase}</text>
          </g>
        )}

        {/* log výpisů */}
        <text x="20" y="218" fontSize="10" fontWeight="600" fill="var(--text)">console:</text>
        <text x="20" y="236" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--accent)">
          {shown.length ? shown.map((h) => NODES[h.node].label).join(" → ") : "—"}
        </text>
      </svg>

      <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        Bez capture (vše bubbling) je pořadí <b style={{ color: "var(--text)" }}>tlačítko → pokoj → dům</b>: událost
        nejdřív zasáhne cíl a pak probublá nahoru. Zapni capture na vnějším prvku — ten se ozve už při sestupu, ještě před cílem.
      </div>
    </div>
  );
}
