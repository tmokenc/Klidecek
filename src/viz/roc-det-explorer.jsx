// ROC + DET parallel plot. Sweep threshold across model distributions,
// mark operating points (FAR=10^-4, 10^-6, EER) on both curves.
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

const SYSTEMS = {
  iris:    { gMu: 0.10, gS: 0.05, iMu: 0.50, iS: 0.015, color: "rgb(64,192,87)",  label: "Iris (Daugman)" },
  face_dl: { gMu: 0.75, gS: 0.08, iMu: 0.25, iS: 0.10,  color: "rgb(80,140,220)", label: "Face DL (ArcFace)" },
  voice:   { gMu: 0.65, gS: 0.18, iMu: 0.35, iS: 0.15,  color: "rgb(220,140,80)", label: "Voice" },
  weak:    { gMu: 0.60, gS: 0.20, iMu: 0.45, iS: 0.20,  color: "rgb(220,80,80)",  label: "Slabý systém" },
};

function rates(cfg, thr) {
  // Convention: match if score >= thr when gMu > iMu, else match if score <= thr
  const gtMatch = cfg.gMu > cfg.iMu;
  const FAR = gtMatch ? 1 - cdf(thr, cfg.iMu, cfg.iS) : cdf(thr, cfg.iMu, cfg.iS);
  const FRR = gtMatch ? cdf(thr, cfg.gMu, cfg.gS) : 1 - cdf(thr, cfg.gMu, cfg.gS);
  return { FAR: Math.max(FAR, 1e-12), FRR: Math.max(FRR, 1e-12) };
}

function sweep(cfg) {
  const N = 220;
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push({ t, ...rates(cfg, t) });
  }
  return pts;
}

function findThr(cfg, targetFAR) {
  // bisection
  let lo = 0, hi = 1, ans = 0.5;
  const gtMatch = cfg.gMu > cfg.iMu;
  for (let i = 0; i < 60; i++) {
    const m = (lo + hi) / 2;
    const { FAR } = rates(cfg, m);
    if (FAR > targetFAR) { if (gtMatch) lo = m; else hi = m; } else { if (gtMatch) hi = m; else lo = m; }
    ans = m;
  }
  return ans;
}

function eerThr(cfg) {
  let lo = 0, hi = 1;
  const gtMatch = cfg.gMu > cfg.iMu;
  for (let i = 0; i < 60; i++) {
    const m = (lo + hi) / 2;
    const { FAR, FRR } = rates(cfg, m);
    if (FAR > FRR) { if (gtMatch) lo = m; else hi = m; } else { if (gtMatch) hi = m; else lo = m; }
  }
  return (lo + hi) / 2;
}

export default function RocDetExplorer() {
  const [enabled, setEnabled] = useState({ iris: true, face_dl: true, voice: true, weak: false });
  const [marker, setMarker] = useState("eer"); // "eer" | "far4" | "far6"
  const allKeys = Object.keys(SYSTEMS);

  const curves = useMemo(() => {
    return allKeys.map((k) => ({ key: k, cfg: SYSTEMS[k], pts: sweep(SYSTEMS[k]) }));
  }, []);

  // ROC = (FAR log, GAR=1-FRR linear)
  const W = 280, H = 200;
  // log scale FAR from 1e-8 to 1
  const logMin = -8, logMax = 0;
  // clamp to the axis floor (10^logMin) so curves/markers never extrapolate
  // past the left/top axes (which would clip against the SVG viewBox).
  const axisFloor = Math.pow(10, logMin);
  const xlog = (far) => 30 + (Math.log10(Math.max(far, axisFloor)) - logMin) / (logMax - logMin) * (W - 50);
  const yROC = (gar) => H - 25 - gar * (H - 45);
  const yDET = (frr) => 20 + (Math.log10(Math.max(frr, axisFloor)) - logMin) / (logMax - logMin) * (H - 45);

  function rocPath(pts) {
    let d = "";
    for (let i = 0; i < pts.length; i++) {
      const x = xlog(pts[i].FAR);
      const y = yROC(1 - pts[i].FRR);
      d += (i === 0 ? "M " : "L ") + x.toFixed(1) + " " + y.toFixed(1) + " ";
    }
    return d;
  }
  function detPath(pts) {
    let d = "";
    for (let i = 0; i < pts.length; i++) {
      const x = xlog(pts[i].FAR);
      const y = yDET(pts[i].FRR);
      d += (i === 0 ? "M " : "L ") + x.toFixed(1) + " " + y.toFixed(1) + " ";
    }
    return d;
  }

  const markerInfo = (cfg) => {
    let thr;
    if (marker === "eer") thr = eerThr(cfg);
    else if (marker === "far4") thr = findThr(cfg, 1e-4);
    else thr = findThr(cfg, 1e-6);
    return rates(cfg, thr);
  };

  const logTicks = [-8, -6, -4, -2, 0];

  return (
    <div style={ctn}>
      <div style={row}>
        {allKeys.map((k) => (
          <label key={k} style={{ ...chip, borderColor: enabled[k] ? SYSTEMS[k].color : "var(--line)", color: enabled[k] ? SYSTEMS[k].color : "var(--text-muted)" }}>
            <input type="checkbox" checked={enabled[k]} onChange={(e) => setEnabled({ ...enabled, [k]: e.target.checked })} style={{ marginRight: 4 }} />
            {SYSTEMS[k].label}
          </label>
        ))}
      </div>

      <div style={row}>
        <label style={lbl}>operační bod:</label>
        <select value={marker} onChange={(e) => setMarker(e.target.value)} style={sel}>
          <option value="eer">EER</option>
          <option value="far4">FAR = 10⁻⁴</option>
          <option value="far6">FAR = 10⁻⁶</option>
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <div style={panelTitle}>ROC (lin)</div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
            <line x1={30} y1={H - 25} x2={W - 20} y2={H - 25} stroke="var(--text-muted)" strokeWidth="1" />
            <line x1={30} y1={20} x2={30} y2={H - 25} stroke="var(--text-muted)" strokeWidth="1" />
            {logTicks.map((p) => (
              <g key={p}>
                <line x1={xlog(Math.pow(10, p))} y1={H - 25} x2={xlog(Math.pow(10, p))} y2={H - 22} stroke="var(--text-muted)" />
                <text x={xlog(Math.pow(10, p))} y={H - 11} fontSize="8.5" textAnchor="middle" fill="var(--text-muted)">10^{p}</text>
              </g>
            ))}
            <line x1={xlog(1e-10)} y1={yROC(0)} x2={xlog(1)} y2={yROC(1)} stroke="rgba(150,150,150,0.4)" strokeDasharray="2 2" />
            {curves.filter(c => enabled[c.key]).map((c) => (
              <g key={c.key}>
                <path d={rocPath(c.pts)} fill="none" stroke={c.cfg.color} strokeWidth="1.5" />
                {(() => { const m = markerInfo(c.cfg); return (
                  <circle cx={xlog(m.FAR)} cy={yROC(1 - m.FRR)} r="3.5" fill={c.cfg.color} />
                ); })()}
              </g>
            ))}
            <text x={W / 2} y={H - 2} fontSize="10" textAnchor="middle" fill="var(--text-muted)">FAR (log)</text>
            <text x={6} y={H / 2} fontSize="10" fill="var(--text-muted)" transform={`rotate(-90, 12, ${H/2})`}>GAR</text>
          </svg>
        </div>
        <div>
          <div style={panelTitle}>DET (log-log)</div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
            <line x1={30} y1={H - 25} x2={W - 20} y2={H - 25} stroke="var(--text-muted)" strokeWidth="1" />
            <line x1={30} y1={20} x2={30} y2={H - 25} stroke="var(--text-muted)" strokeWidth="1" />
            {logTicks.map((p) => (
              <g key={p}>
                <line x1={xlog(Math.pow(10, p))} y1={H - 25} x2={xlog(Math.pow(10, p))} y2={H - 22} stroke="var(--text-muted)" />
                <text x={xlog(Math.pow(10, p))} y={H - 11} fontSize="8.5" textAnchor="middle" fill="var(--text-muted)">10^{p}</text>
              </g>
            ))}
            <line x1={xlog(1e-8)} y1={yDET(1e-8)} x2={xlog(1)} y2={yDET(1)} stroke="rgba(150,150,150,0.4)" strokeDasharray="2 2" />
            {curves.filter(c => enabled[c.key]).map((c) => (
              <g key={c.key}>
                <path d={detPath(c.pts)} fill="none" stroke={c.cfg.color} strokeWidth="1.5" />
                {(() => { const m = markerInfo(c.cfg); return (
                  <circle cx={xlog(m.FAR)} cy={yDET(m.FRR)} r="3.5" fill={c.cfg.color} />
                ); })()}
              </g>
            ))}
            <text x={W / 2} y={H - 2} fontSize="10" textAnchor="middle" fill="var(--text-muted)">FAR (log)</text>
            <text x={6} y={H / 2} fontSize="10" fill="var(--text-muted)" transform={`rotate(-90, 12, ${H/2})`}>FRR (log)</text>
          </svg>
        </div>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5, fontFamily: "var(--font-mono)" }}>
          <thead><tr><th style={th}>system</th><th style={th}>FAR</th><th style={th}>FRR</th></tr></thead>
          <tbody>
            {allKeys.filter(k => enabled[k]).map((k) => { const m = markerInfo(SYSTEMS[k]); return (
              <tr key={k}>
                <td style={{ color: SYSTEMS[k].color }}>{SYSTEMS[k].label}</td>
                <td>{m.FAR.toExponential(2)}</td>
                <td>{m.FRR.toExponential(2)}</td>
              </tr>
            ); })}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Lepší systém = ROC křivka u levého horního rohu, DET křivka u levého dolního. Diagonála = náhodný klasifikátor.
        Log škála na obou osách DET je standard v biometrii (umožňuje porovnat oblasti FAR &lt; 10⁻⁴).
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const chip = { padding: "3px 8px", background: "var(--bg-inset)", border: "1px solid", borderRadius: 12, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center" };
const panelTitle = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 4 };
const th = { textAlign: "left", padding: "2px 4px", color: "var(--text-muted)", fontWeight: 500, fontSize: 10.5 };
