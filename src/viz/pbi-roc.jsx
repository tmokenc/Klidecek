// Threshold slider over the scores of two classes -> live confusion matrix
// (TP/FP/FN/TN), the operating point on the ROC curve, plus accuracy /
// precision / recall. Positive class = the right-hand (higher-score) bump.
import { useState } from "react";

// Fixed scored samples in [0,1]. label 1 = positive, 0 = negative.
// Two overlapping bumps so the threshold genuinely trades TP for FP.
const SAMPLES = [
  // negatives (label 0) — clustered low
  ...[0.05, 0.1, 0.12, 0.18, 0.2, 0.24, 0.28, 0.3, 0.33, 0.38, 0.42, 0.48, 0.55, 0.62].map((s) => ({ s, y: 0 })),
  // positives (label 1) — clustered high
  ...[0.4, 0.46, 0.52, 0.58, 0.6, 0.64, 0.68, 0.72, 0.78, 0.82, 0.86, 0.9, 0.94, 0.97].map((s) => ({ s, y: 1 })),
];

const P = SAMPLES.filter((d) => d.y === 1).length;
const N = SAMPLES.filter((d) => d.y === 0).length;

function metricsAt(thr) {
  let TP = 0, FP = 0, FN = 0, TN = 0;
  for (const d of SAMPLES) {
    const pred = d.s >= thr ? 1 : 0;
    if (d.y === 1 && pred === 1) TP++;
    else if (d.y === 0 && pred === 1) FP++;
    else if (d.y === 1 && pred === 0) FN++;
    else TN++;
  }
  const tpr = P ? TP / P : 0; // recall
  const fpr = N ? FP / N : 0;
  return { TP, FP, FN, TN, tpr, fpr };
}

export default function PbiRoc() {
  const [thr, setThr] = useState(0.5);
  const W = 540, H = 220;

  // ROC curve: sweep threshold from 1 down to 0
  const curve = [];
  for (let t = 1.001; t >= -0.001; t -= 0.02) curve.push(metricsAt(t));

  const m = metricsAt(thr);
  const acc = (m.TP + m.TN) / SAMPLES.length;
  const prec = m.TP + m.FP > 0 ? m.TP / (m.TP + m.FP) : 0;
  const rec = m.tpr;

  // --- left: score strip with threshold ---
  const SX0 = 32, SX1 = 230, SY = 40;
  const px = (s) => SX0 + s * (SX1 - SX0);

  // --- right: ROC plot ---
  const RX0 = 330, RX1 = 500, RY0 = 30, RY1 = 175;
  const rx = (fpr) => RX0 + fpr * (RX1 - RX0);
  const ry = (tpr) => RY1 - tpr * (RY1 - RY0);
  const rocPath = curve.map((c, i) => `${i === 0 ? "M" : "L"} ${rx(c.fpr)} ${ry(c.tpr)}`).join(" ");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* score strip */}
        <text x={SX0} y={13} fontSize="10" fill="var(--text-faint)" fontFamily="var(--font-mono)">skóre modelu →</text>
        <line x1={SX0} y1={SY + 26} x2={SX1} y2={SY + 26} stroke="var(--line-strong)" strokeWidth="0.7" />
        {SAMPLES.map((d, i) =>
          d.y === 1 ? (
            <rect key={i} x={px(d.s) - 3} y={SY - 8} width="6" height="6" fill="var(--accent-line)" />
          ) : (
            <circle key={i} cx={px(d.s)} cy={SY + 18} r="3" fill="var(--accent)" />
          )
        )}
        <text x={SX0} y={SY - 14} fontSize="9" fill="var(--accent-line)" fontFamily="var(--font-mono)">■ pozitivní</text>
        <text x={SX1} y={SY + 40} textAnchor="end" fontSize="9" fill="var(--accent)" fontFamily="var(--font-mono)">● negativní</text>
        {/* threshold line */}
        <line x1={px(thr)} y1={SY - 14} x2={px(thr)} y2={SY + 28} stroke="var(--text)" strokeWidth="1.4" />
        <text x={px(thr)} y={SY - 18} textAnchor="middle" fontSize="9" fill="var(--text)" fontFamily="var(--font-mono)">práh</text>

        {/* confusion matrix */}
        <g fontFamily="var(--font-mono)">
          {(() => {
            const CX = 40, CY = 100, cw = 78, ch = 28;
            const cell = (col, row, label, val, fill) => (
              <g key={label}>
                <rect x={CX + col * cw} y={CY + row * ch} width={cw - 3} height={ch - 3} rx="3"
                  fill={fill} opacity="0.85" />
                <text x={CX + col * cw + (cw - 3) / 2} y={CY + row * ch + 12} textAnchor="middle"
                  fontSize="8.5" fill="var(--bg-inset)">{label}</text>
                <text x={CX + col * cw + (cw - 3) / 2} y={CY + row * ch + 22} textAnchor="middle"
                  fontSize="11" fontWeight="700" fill="var(--bg-inset)">{val}</text>
              </g>
            );
            return (
              <>
                <text x={CX} y={CY - 16} fontSize="9.5" fill="var(--text-faint)">matice záměn</text>
                <text x={CX + cw} y={CY - 6} textAnchor="middle" fontSize="8" fill="var(--text-muted)">predikce →</text>
                {cell(0, 0, "TP", m.TP, "var(--accent-line)")}
                {cell(1, 0, "FN", m.FN, "var(--line-strong)")}
                {cell(0, 1, "FP", m.FP, "var(--line-strong)")}
                {cell(1, 1, "TN", m.TN, "var(--accent)")}
              </>
            );
          })()}
        </g>

        {/* divider */}
        <line x1={300} y1={16} x2={300} y2={H - 12} stroke="var(--line)" strokeWidth="0.6" />

        {/* ROC plot */}
        <text x={RX0} y={20} fontSize="9.5" fill="var(--text-faint)" fontFamily="var(--font-mono)">ROC křivka</text>
        <line x1={RX0} y1={RY0} x2={RX0} y2={RY1} stroke="var(--line-strong)" strokeWidth="0.7" />
        <line x1={RX0} y1={RY1} x2={RX1} y2={RY1} stroke="var(--line-strong)" strokeWidth="0.7" />
        <line x1={RX0} y1={RY1} x2={RX1} y2={RY0} stroke="var(--line)" strokeWidth="0.7" strokeDasharray="3 3" />
        <path d={rocPath} fill="none" stroke="var(--accent)" strokeWidth="1.6" />
        <circle cx={rx(m.fpr)} cy={ry(m.tpr)} r="4.5" fill="var(--accent-line)" stroke="var(--bg-inset)" strokeWidth="1" />
        <text x={RX1} y={RY1 + 12} textAnchor="end" fontSize="8.5" fill="var(--text-faint)" fontFamily="var(--font-mono)">FPR</text>
        <text x={RX0 - 4} y={RY0 + 4} textAnchor="end" fontSize="8.5" fill="var(--text-faint)" fontFamily="var(--font-mono)">TPR</text>
      </svg>

      <input type="range" min={0} max={1} step={0.01} value={thr}
        onChange={(e) => setThr(+e.target.value)} style={{ width: "100%" }} />
      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        práh = {thr.toFixed(2)} · accuracy = {acc.toFixed(2)} · precision = {prec.toFixed(2)} · recall = {rec.toFixed(2)}
      </div>
    </div>
  );
}
