// PDF/PMF ↔ CDF linker — drag x, see CDF value and shaded interval.
// Demonstrates F(x) = ∫f, jump heights for PMF, and P(X=x)=0 in continuous.
import { useState } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 340;
const PAD_L = 38, PAD_R = 12, PAD_T = 16, PAD_B = 28;
const PW = W - PAD_L - PAD_R;
const PH = (H - PAD_T - PAD_B - 14) / 2; // two stacked panes

const MODES = {
  "normal":   { label: "spojitá N(0,1)", disc: false, xMin: -4, xMax: 4 },
  "binomial": { label: "diskrétní Bi(10, 0.4)", disc: true, xMin: 0, xMax: 10 },
  "exp":      { label: "spojitá Exp(1)", disc: false, xMin: 0, xMax: 6 },
};

function densityAt(mode, x) {
  if (mode === "normal")   return S.normalPDF(x, 0, 1);
  if (mode === "exp")      return S.expPDF(x, 1);
  if (mode === "binomial") return S.binomialPMF(Math.round(x), 10, 0.4);
  return 0;
}
function cdfAt(mode, x) {
  if (mode === "normal")   return S.normalCDF(x, 0, 1);
  if (mode === "exp")      return S.expCDF(x, 1);
  if (mode === "binomial") {
    let s = 0;
    for (let k = 0; k <= Math.floor(x); k++) s += S.binomialPMF(k, 10, 0.4);
    return s;
  }
  return 0;
}

export default function PdfCdfLink() {
  const [mode, setMode] = useState("normal");
  const [x, setX] = useState(0.5);

  const m = MODES[mode];
  const xMin = m.xMin, xMax = m.xMax;
  const toX = (v) => PAD_L + ((v - xMin) / (xMax - xMin)) * PW;

  // PDF / PMF curve / bars
  const pdfMaxRef = mode === "normal" ? 0.45 : mode === "exp" ? 1.05 : 0.3;
  const toPdfY = (y) => PAD_T + PH - (y / pdfMaxRef) * PH;

  let pdfCurve;
  if (m.disc) {
    const bars = [];
    for (let k = 0; k <= 10; k++) bars.push({ k, p: S.binomialPMF(k, 10, 0.4) });
    pdfCurve = bars;
  } else {
    const N = 240;
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const v = xMin + (i / N) * (xMax - xMin);
      pts.push([v, densityAt(mode, v)]);
    }
    pdfCurve = pts;
  }

  // CDF curve
  const N2 = 240;
  const cdfPts = [];
  for (let i = 0; i <= N2; i++) {
    const v = xMin + (i / N2) * (xMax - xMin);
    cdfPts.push([v, cdfAt(mode, v)]);
  }
  const cdfY0 = PAD_T + PH + 14;
  const toCdfY = (y) => cdfY0 + PH - y * PH;

  const Fx = cdfAt(mode, x);

  // Shaded area under PDF for x ≤ X
  let area;
  if (m.disc) {
    area = [];
    for (let k = 0; k <= Math.floor(x); k++) area.push(k);
  } else {
    // build shaded polygon up to x
    const pts = [];
    for (const [v, y] of pdfCurve) {
      if (v > x) break;
      pts.push([v, y]);
    }
    pts.push([x, densityAt(mode, x)]);
    area = pts;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        {Object.entries(MODES).map(([k, v]) => (
          <button key={k} className="viz-btn" data-active={mode === k} onClick={() => { setMode(k); setX(v.disc ? 3 : (v.xMin + v.xMax) / 2); }}
          >{v.label}</button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {/* PDF pane */}
        <text x={PAD_L} y={PAD_T - 3} fontSize="10.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">{m.disc ? "PMF p(x)" : "PDF f(x)"}</text>
        <line x1={PAD_L} y1={PAD_T + PH} x2={PAD_L + PW} y2={PAD_T + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} stroke="var(--line-strong)" />

        {/* shaded area / bars */}
        {m.disc ? (
          area.map((k) => (
            <line key={k} x1={toX(k)} y1={PAD_T + PH} x2={toX(k)} y2={toPdfY(S.binomialPMF(k, 10, 0.4))}
              stroke="var(--accent-line)" strokeWidth="6" opacity="0.45" />
          ))
        ) : (
          <path
            d={`M ${toX(area[0][0])} ${PAD_T + PH} ${area.map(([v, y]) => `L ${toX(v).toFixed(2)} ${toPdfY(y).toFixed(2)}`).join(" ")} L ${toX(x).toFixed(2)} ${(PAD_T + PH).toFixed(2)} Z`}
            fill="var(--accent-line)" opacity="0.25"
          />
        )}

        {/* PDF curve / PMF bars */}
        {m.disc ? (
          pdfCurve.map(({ k, p }) => (
            <line key={k} x1={toX(k)} y1={PAD_T + PH} x2={toX(k)} y2={toPdfY(p)} stroke="var(--accent)" strokeWidth="2.4" />
          ))
        ) : (
          <path d={pdfCurve.map(([v, y], i) => `${i ? "L" : "M"} ${toX(v).toFixed(2)} ${toPdfY(y).toFixed(2)}`).join(" ")}
            fill="none" stroke="var(--accent)" strokeWidth="2" />
        )}

        {/* x-marker */}
        <line x1={toX(x)} y1={PAD_T} x2={toX(x)} y2={PAD_T + PH} stroke="var(--text)" strokeDasharray="3 3" />
        <text x={toX(x) + (toX(x) > PAD_L + PW - 48 ? -5 : 5)} y={PAD_T + 12} fontSize="10" fill="var(--text)" fontFamily="var(--font-mono)" textAnchor={toX(x) > PAD_L + PW - 48 ? "end" : "start"}>x={x.toFixed(2)}</text>

        {/* CDF pane */}
        <text x={PAD_L} y={cdfY0 - 3} fontSize="10.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">CDF F(x) = P(X ≤ x)</text>
        <line x1={PAD_L} y1={cdfY0 + PH} x2={PAD_L + PW} y2={cdfY0 + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={cdfY0} x2={PAD_L} y2={cdfY0 + PH} stroke="var(--line-strong)" />
        <text x={PAD_L - 6} y={cdfY0 + 5} fontSize="9" textAnchor="end" fill="var(--text-muted)" fontFamily="var(--font-mono)">1</text>
        <text x={PAD_L - 6} y={cdfY0 + PH + 3} fontSize="9" textAnchor="end" fill="var(--text-muted)" fontFamily="var(--font-mono)">0</text>

        {/* CDF curve — staircase for discrete */}
        {m.disc ? (
          <g>
            {(() => {
              const segs = [];
              let acc = 0;
              const xs = [];
              for (let k = 0; k <= 10; k++) {
                xs.push([k, acc]);
                acc += S.binomialPMF(k, 10, 0.4);
                xs.push([k, acc]);
              }
              for (let i = 0; i < xs.length - 1; i += 2) {
                segs.push(<line key={i} x1={toX(xs[i][0])} y1={toCdfY(xs[i][1])} x2={toX(xs[i+1][0])} y2={toCdfY(xs[i+1][1])} stroke="var(--accent)" strokeWidth="1.8" />);
                if (i + 2 < xs.length) {
                  segs.push(<line key={i + 0.5} x1={toX(xs[i+1][0])} y1={toCdfY(xs[i+1][1])} x2={toX(xs[i+2][0])} y2={toCdfY(xs[i+2][1])} stroke="var(--accent)" strokeWidth="1.8" />);
                }
              }
              return segs;
            })()}
          </g>
        ) : (
          <path d={cdfPts.map(([v, y], i) => `${i ? "L" : "M"} ${toX(v).toFixed(2)} ${toCdfY(y).toFixed(2)}`).join(" ")}
            fill="none" stroke="var(--accent)" strokeWidth="2" />
        )}

        {/* Link line: PDF area → CDF height */}
        <line x1={toX(x)} y1={cdfY0} x2={toX(x)} y2={cdfY0 + PH} stroke="var(--text)" strokeDasharray="3 3" />
        <line x1={PAD_L} y1={toCdfY(Fx)} x2={toX(x)} y2={toCdfY(Fx)} stroke="var(--accent-line)" strokeDasharray="2 2" />
        <circle cx={toX(x)} cy={toCdfY(Fx)} r="3.5" fill="var(--accent-line)" />
        <text x={toX(x) + 6} y={toCdfY(Fx) - 3} fontSize="10" fill="var(--accent-line)" fontFamily="var(--font-mono)">F(x)={Fx.toFixed(3)}</text>
      </svg>

      <label style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
        x = {x.toFixed(2)}
        <input type="range" className="viz-slider" min={xMin} max={xMax} step={m.disc ? 1 : 0.05} value={x} onChange={(e) => setX(+e.target.value)} style={{ width: "100%" }} />
      </label>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
        {m.disc
          ? "PMF: výška sloupce p(k); CDF skokově roste o p(k) v každém celém čísle."
          : "PDF: P(X = x) = 0 pro každý jednotlivý bod; pravděpodobnost je v ploše pod křivkou. CDF je integrál PDF."}
      </div>
    </div>
  );
}
