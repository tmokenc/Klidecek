// Genuine vs impostor score distributions with threshold slider.
// Live FAR/FRR/EER + 2x2 confusion matrix.
import { useMemo, useState } from "react";

// Gaussian PDF
function pdf(x, mu, sigma) {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}
// 1 - CDF for normal via erf approximation (Abramowitz-Stegun)
function erf(x) {
  const s = Math.sign(x); x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return s * y;
}
function cdf(x, mu, sigma) {
  return 0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2)));
}

const PRESETS = {
  iris:    { gMu: 0.10, gS: 0.05, iMu: 0.50, iS: 0.015, label: "Iris (Daugman, HD)" },
  face_dl: { gMu: 0.75, gS: 0.08, iMu: 0.25, iS: 0.10,  label: "Face DL (cos sim)" },
  finger:  { gMu: 0.70, gS: 0.12, iMu: 0.30, iS: 0.10,  label: "Fingerprint (score)" },
  voice:   { gMu: 0.65, gS: 0.18, iMu: 0.35, iS: 0.15,  label: "Voice" },
  weak:    { gMu: 0.60, gS: 0.20, iMu: 0.45, iS: 0.20,  label: "Slabý systém" },
};

export default function ScoreDistributions() {
  const [preset, setPreset] = useState("face_dl");
  const [thr, setThr] = useState(0.5);
  const cfg = PRESETS[preset];

  // Genuine = scores from same person. Impostor = scores from different persons.
  // For iris (HD), match = score < threshold (low HD); for similarity scores, match = score > threshold.
  // We'll use convention: match = score >= threshold. For iris, "genuine" mean is low and "impostor" mean is high — swap convention internally.
  const matchIfGreater = cfg.gMu > cfg.iMu;

  // FAR = P(impostor >= thr)   if matchIfGreater else P(impostor <= thr)
  // FRR = P(genuine < thr)     if matchIfGreater else P(genuine > thr)
  const FAR = matchIfGreater ? 1 - cdf(thr, cfg.iMu, cfg.iS) : cdf(thr, cfg.iMu, cfg.iS);
  const FRR = matchIfGreater ? cdf(thr, cfg.gMu, cfg.gS) : 1 - cdf(thr, cfg.gMu, cfg.gS);

  // Numerical EER search
  const eer = useMemo(() => {
    let lo = 0, hi = 1, best = { t: 0.5, err: 1 };
    for (let i = 0; i < 60; i++) {
      const t = (lo + hi) / 2;
      const far = matchIfGreater ? 1 - cdf(t, cfg.iMu, cfg.iS) : cdf(t, cfg.iMu, cfg.iS);
      const frr = matchIfGreater ? cdf(t, cfg.gMu, cfg.gS) : 1 - cdf(t, cfg.gMu, cfg.gS);
      if (Math.abs(far - frr) < best.err) best = { t, err: Math.abs(far - frr), v: (far + frr) / 2 };
      if (far > frr) { if (matchIfGreater) lo = t; else hi = t; } else { if (matchIfGreater) hi = t; else lo = t; }
    }
    return best;
  }, [cfg, matchIfGreater]);

  // Confusion counts assuming 1000 genuine + 1000 impostor trials
  const N = 1000;
  const GA = Math.round(N * (1 - FRR));
  const FRcount = Math.round(N * FRR);
  const FAcount = Math.round(N * FAR);
  const IR = Math.round(N * (1 - FAR));

  // Build SVG curves
  const W = 540, H = 220;
  const xMin = 0, xMax = 1;
  const x2px = (x) => 30 + (x - xMin) / (xMax - xMin) * (W - 50);

  const peakG = pdf(cfg.gMu, cfg.gMu, cfg.gS);
  const peakI = pdf(cfg.iMu, cfg.iMu, cfg.iS);
  const yMax = Math.max(peakG, peakI) * 1.1;
  const y2px = (y) => H - 30 - (y / yMax) * (H - 50);

  const pathFor = (mu, s) => {
    const steps = 80;
    let d = "";
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = pdf(x, mu, s);
      d += (i === 0 ? "M " : "L ") + x2px(x).toFixed(1) + " " + y2px(y).toFixed(1) + " ";
    }
    return d;
  };

  const tx = x2px(thr);

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>preset:</label>
        <select value={preset} onChange={(e) => setPreset(e.target.value)} style={sel}>
          {Object.entries(PRESETS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span style={{ ...lbl, marginLeft: 12 }}>match if</span>
        <code style={mono}>score {matchIfGreater ? "≥" : "≤"} τ</code>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 600 }}>
        <line x1={30} y1={H - 30} x2={W - 20} y2={H - 30} stroke="var(--text-muted)" strokeWidth="1" />
        <line x1={30} y1={20} x2={30} y2={H - 30} stroke="var(--text-muted)" strokeWidth="1" />
        <path d={pathFor(cfg.gMu, cfg.gS)} fill="rgba(64,192,87,0.25)" stroke="rgb(64,192,87)" strokeWidth="1.5" />
        <path d={pathFor(cfg.iMu, cfg.iS)} fill="rgba(220,80,80,0.25)" stroke="rgb(220,80,80)" strokeWidth="1.5" />
        <line x1={tx} y1={20} x2={tx} y2={H - 30} stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 3" />
        <text x={tx} y={16} fontSize="11" textAnchor="middle" fill="var(--accent)">τ = {thr.toFixed(3)}</text>
        <text x={x2px(cfg.gMu)} y={y2px(peakG) - 5} fontSize="11" textAnchor="middle" fill="rgb(64,192,87)">genuine</text>
        <text x={x2px(cfg.iMu)} y={y2px(peakI) - 5} fontSize="11" textAnchor="middle" fill="rgb(220,80,80)">impostor</text>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <text key={t} x={x2px(t)} y={H - 14} fontSize="9.5" textAnchor="middle" fill="var(--text-muted)">{t}</text>
        ))}
        <text x={W - 30} y={H - 14} fontSize="10" fill="var(--text-muted)">score</text>
      </svg>

      <div style={row}>
        <label style={lbl}>threshold τ:</label>
        <input type="range" min="0" max="1" step="0.005" value={thr} onChange={(e) => setThr(parseFloat(e.target.value))} style={{ flex: 1 }} />
        <button style={btn} onClick={() => setThr(eer.t)}>jdi na EER</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <div style={statBox}>
          <div style={statLbl}>FAR (false accept)</div>
          <div style={{ ...statVal, color: "rgb(220,80,80)" }}>{(FAR * 100).toFixed(3)} %</div>
        </div>
        <div style={statBox}>
          <div style={statLbl}>FRR (false reject)</div>
          <div style={{ ...statVal, color: "rgb(220,140,80)" }}>{(FRR * 100).toFixed(3)} %</div>
        </div>
        <div style={statBox}>
          <div style={statLbl}>EER</div>
          <div style={{ ...statVal, color: "var(--accent)" }}>{((eer.v ?? 0) * 100).toFixed(3)} %</div>
        </div>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
          confusion matrix při 1000 genuine + 1000 impostor pokusech:
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "var(--font-mono)" }}>
          <thead>
            <tr><th></th><th>accept</th><th>reject</th></tr>
          </thead>
          <tbody>
            <tr><td>genuine</td><td style={{ color: "rgb(64,192,87)" }}>GA = {GA}</td><td style={{ color: "rgb(220,140,80)" }}>FR = {FRcount}</td></tr>
            <tr><td>impostor</td><td style={{ color: "rgb(220,80,80)" }}>FA = {FAcount}</td><td style={{ color: "rgb(64,192,87)" }}>IR = {IR}</td></tr>
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Posuňte τ doleva → menší FRR, větší FAR (více pohodlí, méně bezpečnosti). EER bod = kde FAR=FRR.
        Iris má distribuce skoro nepřekrývající se → EER &lt; 0.01%. Slabý systém má velký překryv → EER 10%+.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const mono = { fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" };
const statBox = { background: "var(--bg-inset)", padding: 10, borderRadius: 6, textAlign: "center" };
const statLbl = { fontSize: 10, color: "var(--text-muted)" };
const statVal = { fontSize: 18, fontWeight: 600, fontFamily: "var(--font-mono)", marginTop: 4 };
