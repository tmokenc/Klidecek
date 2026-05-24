// Vein imaging: wavelength slider + absorption curves for deoxy-Hb, oxy-Hb, water, melanin.
// Visualize how λ ≈ 760 nm gives maximum vein contrast.
import { useState } from "react";

// Simplified absorption curves (relative units) — captures characteristic peaks
function deoxyHb(lam) {
  // peak ~760 nm in NIR window; high in visible (especially red 600)
  if (lam < 600) return 0.3;
  const r = 1.0 * Math.exp(-((lam - 760) ** 2) / 9000);   // NIR peak
  const r2 = 0.6 * Math.exp(-((lam - 555) ** 2) / 1200);  // visible Soret-ish
  return Math.min(1, r + r2 + 0.05);
}
function oxyHb(lam) {
  if (lam < 600) return 0.6;
  // peak ~580 nm, falls in NIR past 700 (does NOT have 760 peak)
  const r = 0.95 * Math.exp(-((lam - 575) ** 2) / 1200);
  const r2 = 0.18 * (lam > 800 ? (lam - 800) / 400 : 0);
  return Math.min(1, r + r2 + 0.04);
}
function water(lam) {
  // Low in NIR up to ~1000, rises sharply
  if (lam < 950) return 0.02;
  return Math.min(1, 0.02 + Math.pow((lam - 950) / 200, 2));
}
function melanin(lam) {
  // Decreases as wavelength rises
  return Math.max(0.05, 0.9 - (lam - 400) / 1000);
}
function muscle(lam) {
  // Low everywhere in NIR
  return 0.12 + 0.08 * Math.cos((lam - 700) / 200);
}

const CURVES = [
  { key: "deoxy",   label: "deoxy-Hb (žíly)",  fn: deoxyHb,  color: "rgb(80,80,200)",   stroke: 2.5 },
  { key: "oxy",     label: "oxy-Hb (tepny)",   fn: oxyHb,    color: "rgb(220,80,80)",   stroke: 1.6 },
  { key: "water",   label: "voda",             fn: water,    color: "rgb(80,180,220)",  stroke: 1.6 },
  { key: "melanin", label: "melanin (kůže)",   fn: melanin,  color: "rgb(120,80,40)",   stroke: 1.6 },
  { key: "muscle",  label: "sval / kost",      fn: muscle,   color: "rgba(180,180,180,0.7)", stroke: 1.3 },
];

export default function VeinNirSpectrum() {
  const [lam, setLam] = useState(760);

  const W = 540, H = 200;
  const lamMin = 400, lamMax = 1100;
  const x2px = (l) => 40 + (l - lamMin) / (lamMax - lamMin) * (W - 60);
  const y2px = (v) => H - 25 - v * (H - 50);

  function pathFor(fn) {
    let d = "";
    for (let l = lamMin; l <= lamMax; l += 5) {
      const x = x2px(l), y = y2px(fn(l));
      d += (l === lamMin ? "M " : "L ") + x.toFixed(1) + " " + y.toFixed(1) + " ";
    }
    return d;
  }

  // At current λ, compute vein "contrast" = deoxyHb / (oxyHb + muscle + water)
  const cD = deoxyHb(lam), cO = oxyHb(lam), cW = water(lam), cM = melanin(lam), cMus = muscle(lam);
  const veinAbsorb = cD;
  const tissueAbsorb = (cO + cMus + cW + cM) / 4;
  const contrast = veinAbsorb / (tissueAbsorb + 0.01);

  // Visualize light absorption: how dark veins appear vs tissue
  const veinDarkness = Math.min(1, cD * 0.7);
  const tissueDarkness = Math.min(1, tissueAbsorb * 0.5);

  // Color of the wavelength itself
  function lambdaColor(l) {
    if (l < 700) return "rgb(220,40,40)"; // visible red
    if (l < 900) return "rgb(140,40,160)"; // NIR purple repr
    return "rgb(80,40,40)"; // far IR
  }

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>λ = {lam} nm</label>
        <input type="range" min={lamMin} max={lamMax} step="5" value={lam} onChange={(e) => setLam(parseInt(e.target.value))} style={{ flex: 1, maxWidth: 400 }} />
        <button style={btn} onClick={() => setLam(760)}>760 (optimum)</button>
        <button style={btn} onClick={() => setLam(550)}>550 (vis)</button>
        <button style={btn} onClick={() => setLam(1000)}>1000 (voda)</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-inset)", borderRadius: 6 }}>
        <line x1={40} y1={H - 25} x2={W - 20} y2={H - 25} stroke="var(--text-muted)" />
        <line x1={40} y1={20} x2={40} y2={H - 25} stroke="var(--text-muted)" />
        {/* NIR window highlight */}
        <rect x={x2px(700)} y={20} width={x2px(900) - x2px(700)} height={H - 45} fill="rgba(140,40,160,0.07)" />
        <text x={(x2px(700) + x2px(900))/2} y={32} fontSize="10" textAnchor="middle" fill="var(--text-muted)">NIR window</text>

        {CURVES.map((c) => (
          <g key={c.key}>
            <path d={pathFor(c.fn)} fill="none" stroke={c.color} strokeWidth={c.stroke} />
          </g>
        ))}

        {/* tick marks */}
        {[400, 500, 600, 700, 800, 900, 1000, 1100].map((l) => (
          <g key={l}>
            <line x1={x2px(l)} y1={H - 25} x2={x2px(l)} y2={H - 22} stroke="var(--text-muted)" />
            <text x={x2px(l)} y={H - 11} fontSize="9" textAnchor="middle" fill="var(--text-muted)">{l}</text>
          </g>
        ))}
        <text x={(W) / 2} y={H - 1} fontSize="10" textAnchor="middle" fill="var(--text-muted)">vlnová délka [nm]</text>

        {/* current lambda marker */}
        <line x1={x2px(lam)} y1={20} x2={x2px(lam)} y2={H - 25} stroke={lambdaColor(lam)} strokeWidth="2" strokeDasharray="3 2" />
        <text x={x2px(lam)} y={16} fontSize="10" textAnchor="middle" fill={lambdaColor(lam)}>{lam} nm</text>
      </svg>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {CURVES.map((c) => (
          <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
            <span style={{ width: 12, height: 3, background: c.color, display: "inline-block" }} />
            <span>{c.label}</span>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{c.fn(lam).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Vein image simulation */}
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>simulace pohledu na dlaň při zvolené λ (žíly tmavší = vyšší absorpce hemoglobinu):</div>
        <svg viewBox="0 0 480 110" style={{ width: "100%", maxWidth: 720 }}>
          <rect x={10} y={10} width={460} height={90} rx={40} fill={`rgba(255,210,180,${0.6 - tissueDarkness*0.4})`} stroke="var(--accent)" />
          {/* veins */}
          <g stroke="rgb(40,40,120)" strokeWidth="3" fill="none" strokeOpacity={veinDarkness}>
            <path d="M40,40 C100,60 180,30 280,55 C340,70 400,55 460,65" />
            <path d="M50,75 C110,70 180,85 270,75 C330,68 410,85 460,80" />
            <path d="M120,30 C180,45 220,60 270,50" />
          </g>
          <text x={240} y={102} textAnchor="middle" fontSize="10" fill="var(--text-muted)">
            kontrast žíly/pozadí ≈ {contrast.toFixed(2)}× ({lam < 700 ? "viditelné — slabý" : lam < 900 ? "NIR — vysoký" : "nad voda — nízký"})
          </text>
        </svg>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        <b>Deoxy-Hb peak ~760 nm</b> + minimum absorpce vodou až do ~950 nm → tzv. "tissue optical window".
        Při 550 nm absorpce oxy-Hb dominuje (tepny i žíly skoro stejně) → nelze rozlišit.
        Nad 1000 nm absorpce vody roste → málo světla projde do dermis.
        Fujitsu PalmSecure používá λ ~760 nm; Hitachi finger vein také v této oblasti.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
