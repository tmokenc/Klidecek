// Beta reputační systém: posuvníky pro r (pozitivní) a s (negativní) zkušenosti.
// Kreslí hustotu Beta(r+1, s+1) a počítá normalizované skóre Rep = (r-s)/(r+s+2).
import { useState } from "react";

// log-gamma (Lanczos) → pro normalizaci hustoty Beta
function lgamma(z) {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function betaPdf(p, a, b) {
  if (p <= 0 || p >= 1) return 0;
  const lnB = lgamma(a) + lgamma(b) - lgamma(a + b);
  return Math.exp((a - 1) * Math.log(p) + (b - 1) * Math.log(1 - p) - lnB);
}

export default function PdsBetaReputation() {
  const [r, setR] = useState(8); // positive experiences
  const [s, setS] = useState(2); // negative experiences

  const a = r + 1;
  const b = s + 1;
  const mean = a / (a + b); // E(p)
  const rep = (r - s) / (r + s + 2); // normalized score in [-1,1]

  const W = 360, H = 160;
  const padL = 30, padR = 12, padT = 14, padB = 36;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const N = 120;
  const pts = [];
  let maxY = 0;
  for (let i = 0; i <= N; i++) {
    const p = i / N;
    const y = betaPdf(p, a, b);
    pts.push([p, y]);
    if (isFinite(y) && y > maxY) maxY = y;
  }
  maxY = Math.max(maxY, 1) * 1.1;

  const xS = (p) => padL + plotW * p;
  const yS = (y) => padT + plotH - (plotH * Math.min(y, maxY)) / maxY;

  const path = pts
    .map(([p, y], i) => `${i === 0 ? "M" : "L"} ${xS(p).toFixed(1)} ${yS(y).toFixed(1)}`)
    .join(" ");
  const area = `${path} L ${xS(1)} ${yS(0)} L ${xS(0)} ${yS(0)} Z`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="8" />

        {/* axes */}
        <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH} stroke="var(--text-muted)" strokeWidth="0.8" />
        <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="var(--text-muted)" strokeWidth="0.8" />
        {[0, 0.5, 1].map((t) => (
          <text key={t} x={xS(t)} y={padT + plotH + 14} textAnchor="middle" fontSize="9" fill="var(--text-faint)" fontFamily="var(--font-mono)">{t}</text>
        ))}
        <text x={padL - 3} y={padT + 6} textAnchor="end" fontSize="9" fill="var(--text-faint)" fontFamily="var(--font-mono)">f(p)</text>
        <text x={W - padR} y={padT + plotH - 4} textAnchor="end" fontSize="9" fill="var(--text-faint)" fontFamily="var(--font-mono)">p</text>

        {/* density */}
        <path d={area} fill="var(--accent)" opacity="0.16" />
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="1.8" />

        {/* mean line */}
        <line x1={xS(mean)} y1={padT} x2={xS(mean)} y2={padT + plotH} stroke="oklch(0.62 0.15 145)" strokeWidth="1.2" strokeDasharray="4 3" />
        <text x={xS(mean)} y={padT - 2} textAnchor="middle" fontSize="9" fill="oklch(0.55 0.15 145)" fontFamily="var(--font-mono)">E(p)={mean.toFixed(2)}</text>

        <text x={W / 2} y={padT + plotH + 28} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">
          Beta(α={a}, β={b})
        </text>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
        <label style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--text-muted)" }}>
          <span style={{ fontFamily: "var(--font-mono)" }}>r (poz.)</span>
          <input type="range" className="viz-slider" min="0" max="40" step="1" value={r} onChange={(e) => setR(parseInt(e.target.value, 10))} style={{ flex: 1 }} />
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--text)", minWidth: 18, textAlign: "right" }}>{r}</span>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--text-muted)" }}>
          <span style={{ fontFamily: "var(--font-mono)" }}>s (neg.)</span>
          <input type="range" className="viz-slider" min="0" max="40" step="1" value={s} onChange={(e) => setS(parseInt(e.target.value, 10))} style={{ flex: 1 }} />
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--text)", minWidth: 18, textAlign: "right" }}>{s}</span>
        </label>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div style={badge}>
          <span style={{ color: "var(--text-muted)" }}>Rep = (r−s)/(r+s+2) = </span>
          <span style={{ fontWeight: 700, color: rep >= 0 ? "oklch(0.55 0.15 145)" : "oklch(0.58 0.18 25)" }}>
            {rep >= 0 ? "+" : ""}{rep.toFixed(3)}
          </span>
        </div>
        <div style={badge}>
          <span style={{ color: "var(--text-muted)" }}>E(p) = α/(α+β) = </span>
          <span style={{ fontWeight: 700, color: "var(--text)" }}>{mean.toFixed(3)}</span>
        </div>
      </div>

      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.45 }}>
        Víc zkušeností (vyšší r+s) = užší a jistější distribuce. Stejné Rep při různém objemu (např. 100/10 vs 90/0)
        rozliší právě tento model: jmenovatel r+s+2 váží i objem důkazů, ne jen poměr.
      </div>
    </div>
  );
}

const badge = {
  padding: "6px 10px",
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  borderRadius: 6,
  fontFamily: "var(--font-mono)",
  fontSize: 12,
};
