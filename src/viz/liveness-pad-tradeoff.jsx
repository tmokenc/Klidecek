// Liveness PAD tradeoff: APCER vs BPCER as threshold moves.
// Attack mix changes the curves.
import { useMemo, useState } from "react";

function erf(x) {
  const s = Math.sign(x); x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return s * y;
}
const cdf = (x, mu, s) => 0.5 * (1 + erf((x - mu) / (s * Math.SQRT2)));

const ATTACKS = {
  photo:     { label: "Photo printout",   muSpoof: 0.25, sSpoof: 0.05, color: "rgb(220,140,80)" },
  video:     { label: "Video replay",     muSpoof: 0.35, sSpoof: 0.08, color: "rgb(220,80,80)" },
  silicone:  { label: "3D silikon. maska",muSpoof: 0.55, sSpoof: 0.10, color: "rgb(180,40,160)" },
  deepfake:  { label: "Deepfake video",   muSpoof: 0.70, sSpoof: 0.12, color: "rgb(100,40,180)" },
};

const BONA_FIDE = { mu: 0.85, s: 0.07 };

export default function LivenessPadTradeoff() {
  const [enabled, setEnabled] = useState({ photo: true, video: true, silicone: true, deepfake: false });
  const [thr, setThr] = useState(0.5);

  // For each enabled attack, APCER = % spoofs with liveness score >= threshold
  const attackKeys = Object.keys(ATTACKS).filter(k => enabled[k]);
  const apcers = attackKeys.map(k => ({
    key: k,
    cfg: ATTACKS[k],
    apcer: 1 - cdf(thr, ATTACKS[k].muSpoof, ATTACKS[k].sSpoof),
  }));
  const meanAPCER = apcers.length > 0 ? apcers.reduce((a, b) => a + b.apcer, 0) / apcers.length : 0;
  const BPCER = cdf(thr, BONA_FIDE.mu, BONA_FIDE.s); // bona fide users with score < threshold are rejected

  // Build curves over threshold
  const W = 540, H = 200;
  const x2px = (x) => 40 + x * (W - 60);
  const y2px = (y) => H - 25 - y * (H - 50);

  const apcerPath = (cfg) => {
    let d = "";
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const a = 1 - cdf(t, cfg.muSpoof, cfg.sSpoof);
      d += (i === 0 ? "M " : "L ") + x2px(t).toFixed(1) + " " + y2px(a).toFixed(1) + " ";
    }
    return d;
  };
  const bpcerPath = (() => {
    let d = "";
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const b = cdf(t, BONA_FIDE.mu, BONA_FIDE.s);
      d += (i === 0 ? "M " : "L ") + x2px(t).toFixed(1) + " " + y2px(b).toFixed(1) + " ";
    }
    return d;
  })();

  const certified = meanAPCER < 0.01 && BPCER < 0.05;

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>aktivní útoky v testu:</label>
        {Object.entries(ATTACKS).map(([k, v]) => (
          <label key={k} style={{ ...chip, borderColor: enabled[k] ? v.color : "var(--line)", color: enabled[k] ? v.color : "var(--text-muted)" }}>
            <input type="checkbox" checked={enabled[k]} onChange={(e) => setEnabled({ ...enabled, [k]: e.target.checked })} style={{ marginRight: 4 }} />
            {v.label}
          </label>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-inset)", borderRadius: 6 }}>
        <line x1={40} y1={H - 25} x2={W - 20} y2={H - 25} stroke="var(--text-muted)" />
        <line x1={40} y1={20} x2={40} y2={H - 25} stroke="var(--text-muted)" />
        {/* attack APCER curves */}
        {apcers.map((a) => (
          <g key={a.key}>
            <path d={apcerPath(a.cfg)} fill="none" stroke={a.cfg.color} strokeWidth="1.5" />
          </g>
        ))}
        {/* BPCER curve */}
        <path d={bpcerPath} fill="none" stroke="rgb(64,192,87)" strokeWidth="2" />
        {/* threshold line */}
        <line x1={x2px(thr)} y1={20} x2={x2px(thr)} y2={H - 25} stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 3" />
        {/* APCER < 1% line */}
        <line x1={40} y1={y2px(0.01)} x2={W - 20} y2={y2px(0.01)} stroke="rgba(220,80,80,0.3)" strokeDasharray="3 2" />
        <text x={W - 30} y={y2px(0.01) - 2} fontSize="9" fill="rgba(220,80,80,0.6)">APCER = 1% (Level 2)</text>
        <line x1={40} y1={y2px(0.05)} x2={W - 20} y2={y2px(0.05)} stroke="rgba(64,192,87,0.3)" strokeDasharray="3 2" />
        <text x={W - 30} y={y2px(0.05) - 2} fontSize="9" fill="rgba(64,192,87,0.6)">BPCER = 5%</text>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <text key={t} x={x2px(t)} y={H - 11} fontSize="9" textAnchor="middle" fill="var(--text-muted)">{t}</text>
        ))}
        <text x={W / 2} y={H - 1} fontSize="10" textAnchor="middle" fill="var(--text-muted)">liveness threshold τ</text>
      </svg>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 11 }}>
        {apcers.map((a) => (
          <div key={a.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 12, height: 3, background: a.cfg.color, display: "inline-block" }} />
            {a.cfg.label}: APCER = {(a.apcer * 100).toFixed(2)}%
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 12, height: 3, background: "rgb(64,192,87)", display: "inline-block" }} />
          bona fide BPCER = {(BPCER * 100).toFixed(2)}%
        </div>
      </div>

      <div style={row}>
        <label style={lbl}>threshold τ:</label>
        <input type="range" min="0" max="1" step="0.01" value={thr} onChange={(e) => setThr(parseFloat(e.target.value))} style={{ flex: 1 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <div style={statBox}>
          <div style={statLbl}>mean APCER</div>
          <div style={{ ...statVal, color: meanAPCER < 0.01 ? "rgb(64,192,87)" : "rgb(220,80,80)" }}>{(meanAPCER * 100).toFixed(2)}%</div>
        </div>
        <div style={statBox}>
          <div style={statLbl}>BPCER</div>
          <div style={{ ...statVal, color: BPCER < 0.05 ? "rgb(64,192,87)" : "rgb(220,140,80)" }}>{(BPCER * 100).toFixed(2)}%</div>
        </div>
        <div style={statBox}>
          <div style={statLbl}>iBeta Level 2?</div>
          <div style={{ ...statVal, color: certified ? "rgb(64,192,87)" : "rgb(220,80,80)" }}>{certified ? "PASS" : "FAIL"}</div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        <b>APCER</b> = % attack présenté presentations chybně akceptovaných jako bona fide.
        <b>BPCER</b> = % bona fide pokusů chybně označených jako spoof.
        Posunutí τ doprava: ↓ APCER (méně spoofs prochází) ale ↑ BPCER (víc legitimních odmítnutí).
        Když přidáte deepfake do mixu (vyšší muSpoof), křivka přiblíží bona fide → systém je <b>vůči deepfake nepřipraven</b>.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const chip = { padding: "3px 8px", background: "var(--bg-inset)", border: "1px solid", borderRadius: 12, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center" };
const statBox = { background: "var(--bg-inset)", padding: 10, borderRadius: 6, textAlign: "center" };
const statLbl = { fontSize: 10, color: "var(--text-muted)" };
const statVal = { fontSize: 16, fontWeight: 600, fontFamily: "var(--font-mono)", marginTop: 4 };
