// smote-and-threshold-tuning — show SMOTE synthetic generation between
// k-NN of a minority point, plus classifier threshold sweep over P/R.
import { useMemo, useState } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 360;

function buildScatter(imbalance, seed) {
  const rng = S.mulberry32(seed);
  const maj = [], min = [];
  const nMaj = 80;
  const nMin = Math.max(2, Math.round(nMaj * imbalance));
  for (let i = 0; i < nMaj; i++) {
    const u = rng(), v = rng();
    const r = Math.sqrt(-2 * Math.log(Math.max(1e-9, u)));
    const a = 2 * Math.PI * v;
    maj.push([3 + r * Math.cos(a) * 1.2, 3 + r * Math.sin(a) * 1.0]);
  }
  for (let i = 0; i < nMin; i++) {
    const u = rng(), v = rng();
    const r = Math.sqrt(-2 * Math.log(Math.max(1e-9, u)));
    const a = 2 * Math.PI * v;
    min.push([7 + r * Math.cos(a) * 0.8, 7 + r * Math.sin(a) * 0.7]);
  }
  return { maj, min };
}

function nearestMinority(p, all, k) {
  return all
    .map((q, i) => ({ i, d: (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 }))
    .sort((a, b) => a.d - b.d)
    .slice(1, k + 1);
}

function smoteSynthetic(minorities, k, count, rng) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const c = minorities[Math.floor(rng() * minorities.length)];
    const nbrs = nearestMinority(c, minorities, k);
    if (nbrs.length === 0) continue;
    const kk = nbrs[Math.floor(rng() * nbrs.length)];
    const n = minorities[kk.i];
    const t = rng();
    out.push([c[0] + t * (n[0] - c[0]), c[1] + t * (n[1] - c[1])]);
  }
  return out;
}

// Simple separable classifier: P(min | x) sigmoid on signed distance from
// midline. Used to derive a P/R curve at various thresholds.
function score(p, midline = 5) {
  // distance from midline (positive = toward minority cluster center)
  const d = (p[0] + p[1]) / 2 - midline;
  return 1 / (1 + Math.exp(-d * 1.3));
}

function prAtThreshold(maj, min, t) {
  let tp = 0, fp = 0, fn = 0, tn = 0;
  for (const p of min) (score(p) >= t ? tp++ : fn++);
  for (const p of maj) (score(p) >= t ? fp++ : tn++);
  const prec = tp + fp > 0 ? tp / (tp + fp) : 1;
  const rec = tp + fn > 0 ? tp / (tp + fn) : 0;
  return { tp, fp, fn, tn, prec, rec, f1: prec + rec > 0 ? 2 * prec * rec / (prec + rec) : 0 };
}

export default function SmoteAndThresholdTuning() {
  const [imb, setImb] = useState(8);
  const [k, setK] = useState(3);
  const [synCount, setSynCount] = useState(20);
  const [thr, setThr] = useState(0.5);
  const [seed, setSeed] = useState(7);

  const base = useMemo(() => buildScatter(imb / 100, seed), [imb, seed]);
  const syn = useMemo(() => {
    const rng = S.mulberry32(seed + 17);
    return smoteSynthetic(base.min, k, synCount, rng);
  }, [base.min, k, synCount, seed]);

  const allMin = [...base.min, ...syn];
  const m = prAtThreshold(base.maj, allMin, thr);

  const PAD = 16;
  const SW = 280, SH = 280;
  const xMin = 0, xMax = 10;
  const toX = (x) => PAD + ((x - xMin) / (xMax - xMin)) * SW;
  const toY = (y) => PAD + SH - ((y - xMin) / (xMax - xMin)) * SH;

  // PR curve
  const curve = [];
  for (let tt = 0.0; tt <= 1.0001; tt += 0.02) {
    const v = prAtThreshold(base.maj, allMin, tt);
    curve.push({ t: tt, prec: v.prec, rec: v.rec });
  }
  const CX = SW + 60;
  const CW = W - CX - PAD;
  const CH = 200;
  const toCx = (r) => CX + r * CW;
  const toCy = (p) => PAD + 30 + (1 - p) * CH;

  // First minority + its k-NN for illustration
  const showC = base.min[0];
  const knn = showC ? nearestMinority(showC, base.min, k) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto 1fr auto", gap: "4px 12px", alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 11 }}>
        <span>imbalance</span>
        <input type="range" min={2} max={30} value={imb} onChange={(e) => setImb(+e.target.value)} />
        <span>{imb}%</span>
        <span>k (kNN)</span>
        <input type="range" min={1} max={6} value={k} onChange={(e) => setK(+e.target.value)} />
        <span>{k}</span>

        <span>synthetic</span>
        <input type="range" min={0} max={60} value={synCount} onChange={(e) => setSynCount(+e.target.value)} />
        <span>{synCount}</span>
        <span>threshold</span>
        <input type="range" min={0} max={100} value={thr * 100} onChange={(e) => setThr(+e.target.value / 100)} />
        <span>{thr.toFixed(2)}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {/* scatter panel */}
        <rect x={PAD} y={PAD} width={SW} height={SH} fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={PAD + SW / 2} y={PAD - 4} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">scatter (majoritní/minoritní/syntetické)</text>
        {/* decision boundary (midline (x+y)/2 = midline + threshold-shift) */}
        {(() => {
          // score = sigmoid((x+y)/2 - 5) * 1.3; threshold t ⇒ boundary where sigmoid = t.
          const shift = Math.log(thr / (1 - thr + 1e-9)) / 1.3;
          const xy = 5 + shift;
          // line (x+y)/2 = xy ⇒ y = 2*xy - x
          const x0 = 0, y0 = 2 * xy - x0;
          const x1 = 10, y1 = 2 * xy - x1;
          if (y0 < 0 && y1 < 0) return null;
          return <line x1={toX(x0)} y1={toY(Math.max(0, Math.min(10, y0)))} x2={toX(x1)} y2={toY(Math.max(0, Math.min(10, y1)))}
            stroke="oklch(0.7 0.18 22)" strokeWidth="1.2" strokeDasharray="4 3" />;
        })()}
        {base.maj.map((p, i) => (
          <circle key={`a${i}`} cx={toX(p[0])} cy={toY(p[1])} r={3} fill="oklch(0.65 0.16 264)" opacity={0.7} />
        ))}
        {base.min.map((p, i) => (
          <circle key={`b${i}`} cx={toX(p[0])} cy={toY(p[1])} r={4} fill="oklch(0.6 0.18 22)" stroke="var(--text)" strokeWidth="0.4" />
        ))}
        {syn.map((p, i) => (
          <circle key={`s${i}`} cx={toX(p[0])} cy={toY(p[1])} r={3.5} fill="oklch(0.7 0.15 145)" stroke="var(--text)" strokeWidth="0.4" />
        ))}
        {/* show k-NN of first minority */}
        {showC && knn.map((nb, i) => (
          <line key={i} x1={toX(showC[0])} y1={toY(showC[1])} x2={toX(base.min[nb.i][0])} y2={toY(base.min[nb.i][1])}
            stroke="oklch(0.7 0.15 145)" strokeWidth="0.6" strokeDasharray="2 2" />
        ))}
        {showC && (
          <circle cx={toX(showC[0])} cy={toY(showC[1])} r={6} fill="none" stroke="oklch(0.7 0.15 145)" strokeWidth="1.2" />
        )}

        {/* PR curve panel */}
        <rect x={CX} y={PAD + 30} width={CW} height={CH} fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={CX + CW / 2} y={PAD + 22} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">PR curve · threshold sweep</text>
        <path d={curve.map((c, i) => `${i ? "L" : "M"}${toCx(c.rec)} ${toCy(c.prec)}`).join(" ")}
          fill="none" stroke="oklch(0.65 0.16 264)" strokeWidth="1.5" />
        {/* current threshold marker */}
        <circle cx={toCx(m.rec)} cy={toCy(m.prec)} r={5} fill="oklch(0.6 0.18 22)" stroke="var(--text)" strokeWidth="0.6" />
        <text x={CX + 4} y={PAD + 30 + CH - 4} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">recall →</text>
        <text x={CX - 4} y={PAD + 38} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">prec</text>
        {[0, 0.5, 1].map(v => (
          <text key={v} x={toCx(v)} y={PAD + 30 + CH + 12} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">{v}</text>
        ))}

        {/* confusion matrix */}
        <g transform={`translate(${CX}, ${PAD + 30 + CH + 30})`}>
          <text x={0} y={0} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">confusion @ thr={thr.toFixed(2)}</text>
          <rect x={50} y={6} width={50} height={20} fill="var(--bg-inset)" stroke="var(--line)" />
          <text x={75} y={20} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.65 0.16 145)">TP={m.tp}</text>
          <rect x={100} y={6} width={50} height={20} fill="var(--bg-inset)" stroke="var(--line)" />
          <text x={125} y={20} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.6 0.18 22)">FP={m.fp}</text>
          <rect x={50} y={26} width={50} height={20} fill="var(--bg-inset)" stroke="var(--line)" />
          <text x={75} y={40} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.6 0.18 22)">FN={m.fn}</text>
          <rect x={100} y={26} width={50} height={20} fill="var(--bg-inset)" stroke="var(--line)" />
          <text x={125} y={40} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.65 0.16 145)">TN={m.tn}</text>
          <text x={0} y={18} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">true min</text>
          <text x={0} y={38} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">true maj</text>
        </g>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, fontFamily: "var(--font-mono)", fontSize: 11 }}>
        <span>nₘᵢₙ = {base.min.length} (+{syn.length} syn)</span>
        <span>precision = {m.prec.toFixed(3)}</span>
        <span>recall = {m.rec.toFixed(3)}</span>
        <span>F1 = {m.f1.toFixed(3)}</span>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        SMOTE: for each minority point, pick a random k-NN among minority class, generate a synthetic point on the line segment at random position.
        Threshold ↓ → recall ↑, precision ↓. Default 0.5 is rarely optimal for imbalanced data.
      </div>
      <button onClick={() => setSeed(s => s + 1)} style={{ alignSelf: "flex-start", fontFamily: "var(--font-mono)", fontSize: 11, padding: "2px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line-strong)", borderRadius: 3, cursor: "pointer" }}>resample</button>
    </div>
  );
}
