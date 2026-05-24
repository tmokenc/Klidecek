// ArcFace angular margin: 2D embedding circle, class centers, decision boundaries.
// Sliders for margin m and scale s; compare softmax / CosFace / ArcFace.
import { useMemo, useState } from "react";

const CLASSES = [
  { id: "A", angle: 30,  color: "rgb(64,192,87)" },
  { id: "B", angle: 100, color: "rgb(220,140,80)" },
  { id: "C", angle: 200, color: "rgb(80,140,220)" },
  { id: "D", angle: 280, color: "rgb(220,80,180)" },
];

const LOSSES = {
  softmax:  { label: "Softmax",  desc: "cos(θ_y) — žádná margina",          marginType: "none" },
  cosface:  { label: "CosFace",  desc: "cos(θ_y) − m — additive cosine",    marginType: "cos" },
  arcface:  { label: "ArcFace",  desc: "cos(θ_y + m) — additive angular",   marginType: "arc" },
};

function angularDist(a, b) {
  let d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

export default function ArcfaceMargin() {
  const [loss, setLoss] = useState("arcface");
  const [m, setM] = useState(0.5); // radians for arc, scalar for cos
  const [s, setS] = useState(64);
  const [sampleAngle, setSampleAngle] = useState(45);

  // Distance to each class
  const dists = useMemo(() => CLASSES.map((c) => ({
    id: c.id,
    color: c.color,
    angleDeg: c.angle,
    angleRad: c.angle * Math.PI / 180,
    sampleAngleRad: sampleAngle * Math.PI / 180,
    delta: angularDist(sampleAngle, c.angle),
  })), [sampleAngle]);

  // Compute logits per class
  const logits = dists.map((c) => {
    const deltaRad = c.delta * Math.PI / 180;
    let logit;
    if (loss === "softmax") logit = Math.cos(deltaRad);
    else if (loss === "cosface") logit = Math.cos(deltaRad) - m;
    else logit = Math.cos(deltaRad + m);
    return { ...c, raw: Math.cos(deltaRad), modified: logit, scaled: s * logit };
  });

  const softmaxProbs = useMemo(() => {
    const expVals = logits.map(l => Math.exp(Math.min(50, l.scaled)));
    const Z = expVals.reduce((a, b) => a + b, 0);
    return expVals.map(e => e / Z);
  }, [logits]);

  // Predicted class = max
  const predIdx = softmaxProbs.indexOf(Math.max(...softmaxProbs));

  // Boundaries: between class A and class B at angle θ where logit_A = logit_B
  // i.e., where the two cosines are equal
  // For visualization, compute decision boundary angles
  const boundaries = [];
  for (let i = 0; i < CLASSES.length; i++) {
    const j = (i + 1) % CLASSES.length;
    const midpoint = (CLASSES[i].angle + (CLASSES[j].angle > CLASSES[i].angle ? CLASSES[j].angle : CLASSES[j].angle + 360)) / 2;
    boundaries.push(midpoint % 360);
  }

  const W = 320, H = 320, cx = W / 2, cy = H / 2, R = 130;

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>loss:</label>
        <select value={loss} onChange={(e) => setLoss(e.target.value)} style={sel}>
          {Object.entries(LOSSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span style={{ ...lbl, color: "var(--text-muted)" }}>{LOSSES[loss].desc}</span>
      </div>

      <div style={row}>
        <label style={lbl}>margin m = {m.toFixed(2)}</label>
        <input type="range" min="0" max="1" step="0.02" value={m} onChange={(e) => setM(parseFloat(e.target.value))} disabled={loss === "softmax"} />
        <label style={{ ...lbl, marginLeft: 12 }}>scale s = {s}</label>
        <input type="range" min="1" max="64" value={s} onChange={(e) => setS(parseInt(e.target.value))} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-inset)", borderRadius: 6 }}>
          {/* unit circle */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--text-muted)" strokeDasharray="2 3" />
          {/* boundaries */}
          {boundaries.map((b, i) => (
            <line key={i} x1={cx} y1={cy} x2={cx + R * Math.cos(b * Math.PI / 180)} y2={cy + R * Math.sin(b * Math.PI / 180)} stroke="rgba(150,150,150,0.3)" strokeDasharray="2 2" />
          ))}
          {/* class centers */}
          {CLASSES.map((c, i) => (
            <g key={c.id}>
              <line x1={cx} y1={cy} x2={cx + R * Math.cos(c.angle * Math.PI / 180)} y2={cy + R * Math.sin(c.angle * Math.PI / 180)} stroke={c.color} strokeWidth="1.5" />
              <circle cx={cx + R * Math.cos(c.angle * Math.PI / 180)} cy={cy + R * Math.sin(c.angle * Math.PI / 180)} r="8" fill={c.color} />
              <text x={cx + (R + 18) * Math.cos(c.angle * Math.PI / 180)} y={cy + (R + 18) * Math.sin(c.angle * Math.PI / 180)} fontSize="14" textAnchor="middle" fill={c.color} fontWeight="600">{c.id}</text>
              {/* margin arc: for arcface, show class A's "expanded boundary" */}
              {loss === "arcface" && (
                <path
                  d={describeArc(cx, cy, R - 18, c.angle - m * 180 / Math.PI, c.angle + m * 180 / Math.PI)}
                  fill="none"
                  stroke={c.color}
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  opacity="0.5"
                />
              )}
            </g>
          ))}
          {/* sample */}
          <circle cx={cx + R * 0.85 * Math.cos(sampleAngle * Math.PI / 180)} cy={cy + R * 0.85 * Math.sin(sampleAngle * Math.PI / 180)} r="6" fill="rgb(255,200,0)" stroke="#000" strokeWidth="1.5" />
          <text x={cx + (R * 0.85 + 16) * Math.cos(sampleAngle * Math.PI / 180)} y={cy + (R * 0.85 + 16) * Math.sin(sampleAngle * Math.PI / 180)} fontSize="11" fill="rgb(255,200,0)" textAnchor="middle">sample</text>
          <text x={cx} y={cy + 4} fontSize="10" textAnchor="middle" fill="var(--text-muted)">unit hypersphere (cos sim)</text>
        </svg>

        <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>logity + softmax pravděpodobnost (po scale s):</div>
          <table style={{ width: "100%", fontSize: 11.5, borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>class</th><th style={th}>cos(θ)</th><th style={th}>logit</th><th style={th}>p</th></tr></thead>
            <tbody>
              {logits.map((l, i) => (
                <tr key={l.id} style={{ background: i === predIdx ? "rgba(64,192,87,0.12)" : "transparent" }}>
                  <td style={{ ...td, color: l.color, fontWeight: 600 }}>{l.id}</td>
                  <td style={td}>{l.raw.toFixed(3)}</td>
                  <td style={td}>{l.modified.toFixed(3)}</td>
                  <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{(softmaxProbs[i] * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)" }}>
            margina <i>m</i> "rozšiřuje" target class — sample musí být <i>blíže</i> než dříve, aby byl klasifikován do své třídy.
            <br />ArcFace přidává m k úhlu; CosFace odečítá m od cosinusu.
          </div>
        </div>
      </div>

      <div style={row}>
        <label style={lbl}>úhel sample = {sampleAngle}°</label>
        <input type="range" min="0" max="359" value={sampleAngle} onChange={(e) => setSampleAngle(parseInt(e.target.value))} style={{ flex: 1 }} />
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Posuňte sample blízko hranice mezi dvěma třídami: bez margin (softmax) je klasifikace nestabilní.
        S marginou m sample musí být dostatečně blízko target class. ArcFace m=0.5 rad ≈ 28° "no-go zóna" kolem boundaries.
        Scale s ≈ 64 dělá softmax ostřejší — bez něj by gradienty zmizely.
      </div>
    </div>
  );
}

function describeArc(cx, cy, r, startDeg, endDeg) {
  const sR = startDeg * Math.PI / 180, eR = endDeg * Math.PI / 180;
  const sx = cx + r * Math.cos(sR), sy = cy + r * Math.sin(sR);
  const ex = cx + r * Math.cos(eR), ey = cy + r * Math.sin(eR);
  const large = (endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const th = { textAlign: "left", padding: "2px 4px", color: "var(--text-muted)", fontSize: 10.5, fontWeight: 500 };
const td = { padding: "2px 4px" };
