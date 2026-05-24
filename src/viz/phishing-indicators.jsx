// phishing-indicators — Show email with hidden red flags. Click to reveal each.
// Score updates. Two presets: legit and phishing.
import { useState } from "react";

const PHISHING_EMAIL = {
  from: "support@paypaI-security.com",            // lowercase L is a capital I
  subject: "URGENT: Account Suspended — Action Required Within 24 Hours",
  body: [
    "Dear Customer,",
    "",
    "We've detected unusual activity on your account. To prevent permanent suspension,",
    "please verify your identity immediately by clicking the link below:",
    "",
    "    [Click here to verify] (https://verifypaypal-account.com/login)",
    "",
    "Failure to act within 24 hours will result in account closure.",
    "",
    "Sincerely,",
    "Account Protection Team",
  ],
  indicators: [
    { id: "domain",  x: 100, y: 36,  w: 280, label: "spoofed domain", note: "paypaI ≠ paypal — capital I masquerades as lowercase l" },
    { id: "urgent",  x: 20,  y: 56,  w: 470, label: "false urgency",  note: "'24 hours' creates panic to bypass critical thinking" },
    { id: "generic", x: 20,  y: 90,  w: 130, label: "generic greeting", note: "real services use your name" },
    { id: "url",     x: 70,  y: 160, w: 300, label: "lookalike URL",  note: "verifypaypal-account.com is attacker-controlled, not paypal.com" },
    { id: "consequence", x: 20, y: 195, w: 400, label: "threat consequence", note: "'account closure' pressures compliance" },
  ],
};

export default function PhishingIndicators() {
  const [revealed, setRevealed] = useState({});
  const [showAll, setShowAll] = useState(false);

  const allRevealed = showAll ? PHISHING_EMAIL.indicators : PHISHING_EMAIL.indicators.filter(i => revealed[i.id]);
  const score = Object.values(revealed).filter(Boolean).length + (showAll ? PHISHING_EMAIL.indicators.length - Object.values(revealed).filter(Boolean).length : 0);

  function toggle(id) { setRevealed(r => ({ ...r, [id]: !r[id] })); }

  const W = 580, H = 280;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 11, alignItems: "center" }}>
        <button onClick={() => setShowAll(s => !s)} style={btn(showAll)}>{showAll ? "skrýt" : "zobrazit"} všechny indikátory</button>
        <button onClick={() => { setRevealed({}); setShowAll(false); }} style={btn(false)}>reset</button>
        <span style={{ marginLeft: 6 }}>kliknutí na podezřelou část emailu = označit jako red flag</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* Email frame */}
        <rect x={10} y={10} width={W - 20} height={210} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={20} y={30} fontSize="10" fontFamily="ui-monospace, monospace" fill="var(--text-muted)">From: </text>
        <text x={60} y={30} fontSize="10.5" fontFamily="ui-monospace, monospace" fill="var(--text)">{PHISHING_EMAIL.from}</text>
        <text x={20} y={48} fontSize="10" fontFamily="ui-monospace, monospace" fill="var(--text-muted)">Subject: </text>
        <text x={70} y={48} fontSize="10.5" fill="var(--text)">{PHISHING_EMAIL.subject.slice(0, 60)}</text>
        <line x1={10} y1={56} x2={W - 10} y2={56} stroke="var(--line)" />

        {PHISHING_EMAIL.body.map((line, i) => (
          <text key={i} x={20} y={80 + i * 13} fontSize="10" fill={line.startsWith("    [") ? "oklch(0.65 0.16 245)" : "var(--text)"}>
            {line}
          </text>
        ))}

        {/* Highlight overlays */}
        {allRevealed.map(ind => (
          <rect key={ind.id}
            x={ind.x} y={ind.y} width={ind.w} height={ind.id === "domain" || ind.id === "urgent" ? 14 : ind.id === "url" ? 14 : 14}
            fill="oklch(0.65 0.18 22 / 0.25)" stroke="oklch(0.65 0.18 22)" strokeWidth="1.5"
            style={{ cursor: "pointer" }} onClick={() => toggle(ind.id)} />
        ))}

        {/* Invisible click zones for indicators not yet revealed */}
        {!showAll && PHISHING_EMAIL.indicators.filter(i => !revealed[i.id]).map(ind => (
          <rect key={"hot-" + ind.id}
            x={ind.x} y={ind.y} width={ind.w} height={14}
            fill="transparent" style={{ cursor: "pointer" }}
            onClick={() => toggle(ind.id)} />
        ))}

        {/* Indicator legend */}
        <rect x={10} y={230} width={W - 20} height={42} rx="3" fill="var(--bg-card)" stroke="var(--line)" />
        <text x={20} y={246} fontSize="10" fontWeight="700" fill="var(--text)">
          {score}/{PHISHING_EMAIL.indicators.length} red flags identifikováno
        </text>
        {allRevealed.slice(-2).map((ind, i) => (
          <text key={ind.id} x={20} y={258 + i * 12} fontSize="9.5" fill="oklch(0.65 0.18 22)">
            ⚠ {ind.label}: <tspan fill="var(--text-muted)">{ind.note}</tspan>
          </text>
        ))}
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        Cialdiniho principy: <b>authority</b> ("Account Protection Team"), <b>urgency</b> ("24 hours"), <b>fear</b> ("suspension").
        Defense: SPF/DKIM/DMARC u brány, MFA s number matching, click-time URL inspection, security awareness training.
      </div>
    </div>
  );
}

function btn(active) {
  return { background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", border: "1px solid var(--line)", padding: "3px 9px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
