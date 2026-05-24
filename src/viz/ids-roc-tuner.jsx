// ids-roc-tuner — IDS sensitivity slider. Confusion matrix + ROC + alert
// fatigue gauge. Shows tradeoff between FP and FN.
import { useState } from "react";

// Underlying truth: 5% of events are attacks. Anomaly score for attack vs normal
// drawn from overlapping Gaussian-ish distributions.
const N = 1000;
const ATTACK_FRACTION = 0.05;

function gauss(mean, sd) {
  // Box-Muller
  const u1 = Math.random(), u2 = Math.random();
  return mean + sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Generate fixed sample (one per session)
const SAMPLE = (() => {
  // seed-ish: use Math.random but freeze.
  const rng = (() => { let s = 7; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; })();
  const ng = (m, sd) => {
    const u1 = rng(), u2 = rng();
    return m + sd * Math.sqrt(-2 * Math.log(u1 || 1e-9)) * Math.cos(2 * Math.PI * u2);
  };
  return Array.from({ length: N }, () => {
    const attack = rng() < ATTACK_FRACTION;
    const score = attack ? ng(70, 12) : ng(40, 10);
    return { attack, score: Math.max(0, Math.min(100, score)) };
  });
})();

export default function IdsRocTuner() {
  const [threshold, setThreshold] = useState(55);

  // Confusion matrix
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (const e of SAMPLE) {
    const alert = e.score >= threshold;
    if (e.attack && alert) tp++;
    else if (e.attack && !alert) fn++;
    else if (!e.attack && alert) fp++;
    else tn++;
  }
  const fpr = fp / (fp + tn);
  const tpr = tp / (tp + fn);
  const alertsPerDay = (fp + tp) / N * 5000; // assume 5000 events/day

  // ROC curve: scan threshold 0..100
  const rocPoints = [];
  for (let t = 0; t <= 100; t += 2) {
    let p = 0, q = 0, ny = 0, na = 0;
    for (const e of SAMPLE) {
      if (e.attack) { na++; if (e.score >= t) p++; }
      else { ny++; if (e.score >= t) q++; }
    }
    rocPoints.push({ t, tpr: p / na, fpr: q / ny });
  }

  const W = 580, H = 260;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: 8, fontSize: 11 }}>
        IDS threshold = {threshold}
        <input type="range" min="0" max="100" value={threshold} onChange={e => setThreshold(+e.target.value)}
          style={{ width: 300, marginLeft: 8, verticalAlign: "middle" }} />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* Score histogram */}
        <text x={150} y={20} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text)">score distribution</text>
        {/* normal histogram */}
        {Array.from({ length: 20 }).map((_, i) => {
          const lo = i * 5, hi = lo + 5;
          const normalCount = SAMPLE.filter(e => !e.attack && e.score >= lo && e.score < hi).length;
          const attackCount = SAMPLE.filter(e => e.attack && e.score >= lo && e.score < hi).length;
          const nH = normalCount / 80 * 80;
          const aH = attackCount / 12 * 60;
          return (
            <g key={i}>
              <rect x={20 + i * 14} y={130 - nH} width="12" height={nH} fill="oklch(0.65 0.16 245 / 0.5)" />
              <rect x={20 + i * 14} y={130 - aH} width="12" height={aH} fill="oklch(0.65 0.18 22 / 0.65)" />
            </g>
          );
        })}
        <line x1={20} y1={130} x2={300} y2={130} stroke="var(--line)" />
        {/* threshold line */}
        <line x1={20 + threshold / 100 * 280} y1={35} x2={20 + threshold / 100 * 280} y2={130}
          stroke="var(--accent)" strokeWidth="2" strokeDasharray="3 2" />
        <text x={20 + threshold / 100 * 280} y={32} textAnchor="middle" fontSize="9" fill="var(--accent)">T={threshold}</text>
        <text x={20} y={148} fontSize="8.5" fill="oklch(0.65 0.16 245)">■ normal</text>
        <text x={80} y={148} fontSize="8.5" fill="oklch(0.65 0.18 22)">■ attack</text>

        {/* ROC */}
        <text x={420} y={20} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text)">ROC curve</text>
        <rect x={340} y={30} width={160} height={120} fill="var(--bg-inset)" stroke="var(--line)" />
        {/* diagonal */}
        <line x1={340} y1={150} x2={500} y2={30} stroke="var(--text-faint)" strokeDasharray="2 2" />
        {/* curve */}
        <path d={rocPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${340 + p.fpr * 160} ${150 - p.tpr * 120}`).join(" ")}
          stroke="oklch(0.7 0.15 145)" strokeWidth="2" fill="none" />
        {/* current point */}
        <circle cx={340 + fpr * 160} cy={150 - tpr * 120} r="5" fill="var(--accent)" stroke="white" strokeWidth="1.5" />
        <text x={420} y={166} textAnchor="middle" fontSize="9" fill="var(--text-muted)">FPR →</text>
        <text x={335} y={90} fontSize="9" fill="var(--text-muted)" textAnchor="end">TPR ↑</text>

        {/* confusion matrix + alert rate */}
        <g fontSize="10" fontFamily="ui-monospace, monospace">
          <text x={20} y={180} fontWeight="700" fill="var(--text)" fontFamily="ui-sans-serif, system-ui">confusion matrix</text>
          <rect x={20} y={188} width={80} height={30} fill="oklch(0.7 0.15 145 / 0.3)" stroke="var(--line)" />
          <rect x={105} y={188} width={80} height={30} fill="oklch(0.65 0.18 22 / 0.3)" stroke="var(--line)" />
          <rect x={20} y={222} width={80} height={30} fill="oklch(0.65 0.18 22 / 0.3)" stroke="var(--line)" />
          <rect x={105} y={222} width={80} height={30} fill="oklch(0.7 0.15 145 / 0.3)" stroke="var(--line)" />
          <text x={60} y={206} textAnchor="middle">TP={tp}</text>
          <text x={145} y={206} textAnchor="middle">FP={fp}</text>
          <text x={60} y={240} textAnchor="middle">FN={fn}</text>
          <text x={145} y={240} textAnchor="middle">TN={tn}</text>
          <text x={195} y={206} fontSize="9" fill="var(--text-muted)" fontFamily="ui-sans-serif, system-ui">detected attack / FP</text>
          <text x={195} y={240} fontSize="9" fill="var(--text-muted)" fontFamily="ui-sans-serif, system-ui">missed / normal</text>
        </g>

        <g fontFamily="ui-sans-serif, system-ui">
          <text x={345} y={180} fontSize="10" fontWeight="700" fill="var(--text)">analyst impact</text>
          <text x={345} y={196} fontSize="9.5" fill="var(--text)">alerts/day @ 5k events: <tspan fontWeight="700" fill={alertsPerDay > 200 ? "oklch(0.65 0.18 22)" : "var(--accent)"}>{Math.round(alertsPerDay)}</tspan></text>
          <text x={345} y={210} fontSize="9.5" fill="var(--text)">TPR (detect rate) = {(tpr * 100).toFixed(1)}%</text>
          <text x={345} y={224} fontSize="9.5" fill="var(--text)">FPR = {(fpr * 100).toFixed(2)}%</text>
          <text x={345} y={245} fontSize="9" fill="var(--text-muted)">
            {alertsPerDay > 300 ? "→ alert fatigue, analysts ignore" :
             tpr < 0.6 ? "→ misses real attacks (high FN)" : "→ rozumný balance"}
          </text>
        </g>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        Snížíš threshold: víc TP, ale i víc FP (alert fatigue). Zvýšíš: méně FP, ale roste FN (chybíš útoky).
        ROC sleduje TPR vs FPR napříč prahem. AUC ↑ = lepší classifier.
      </div>
    </div>
  );
}
