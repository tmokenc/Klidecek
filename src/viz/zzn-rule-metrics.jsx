// Association-rule metrics: pick X -> Y, compute support / confidence / lift live,
// thresholds decide whether the rule passes.
import { useState } from "react";

export default function ZznRuleMetrics() {
  const items = ["A", "B", "C", "D"];
  const txns = [
    ["A", "B"],
    ["A", "C", "D"],
    ["B", "C", "D"],
    ["A", "B", "C", "D"],
    ["A", "B", "C"],
  ];
  const N = txns.length;

  // a few illustrative rules (antecedent -> consequent)
  const rules = [
    { x: ["A"], y: ["B"] },
    { x: ["A"], y: ["C"] },
    { x: ["C"], y: ["D"] },
    { x: ["A", "C"], y: ["D"] },
    { x: ["B"], y: ["A"] },
  ];

  const [ri, setRi] = useState(0);
  const [minSup, setMinSup] = useState(0.4); // fraction
  const [minConf, setMinConf] = useState(0.6);

  const cnt = (s) => txns.filter((t) => s.every((x) => t.includes(x))).length;
  const supp = (s) => cnt(s) / N;

  const metrics = (r) => {
    const xy = [...r.x, ...r.y];
    const sXY = supp(xy);
    const sX = supp(r.x);
    const sY = supp(r.y);
    const conf = sX > 0 ? sXY / sX : 0;
    const lift = sX > 0 && sY > 0 ? sXY / (sX * sY) : 0;
    return { sXY, sX, sY, conf, lift };
  };

  const r = rules[ri];
  const m = metrics(r);
  const passes = (rr) => {
    const mm = metrics(rr);
    return mm.sXY >= minSup && mm.conf >= minConf;
  };
  const ruleStr = (rr) => `${rr.x.join("")} -> ${rr.y.join("")}`;

  const W = 360, H = 200;
  const bar = (label, val, max, y, color) => {
    const x0 = 86, w = 200;
    const len = Math.max(2, (val / max) * w);
    return (
      <g>
        <text x={8} y={y + 4} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-muted)">{label}</text>
        <rect x={x0} y={y - 6} width={w} height={12} rx="3" fill="var(--bg-card)" stroke="var(--line)" strokeWidth="0.5" />
        <rect x={x0} y={y - 6} width={len} height={12} rx="3" fill={color} />
        <text x={x0 + w + 6} y={y + 4} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">
          {val.toFixed(2)}
        </text>
      </g>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        <text x={8} y={22} fontSize="13" fontFamily="var(--font-mono)" fill="var(--accent)">
          pravidlo: {ruleStr(r)}
        </text>
        {bar("support", m.sXY, 1, 52, "color-mix(in oklch, var(--accent) 70%, var(--bg-card))")}
        {bar("confidence", m.conf, 1, 78, "color-mix(in oklch, var(--accent) 70%, var(--bg-card))")}
        {bar("lift", m.lift, 2.5, 104, m.lift >= 1 ? "oklch(0.62 0.15 150)" : "oklch(0.6 0.18 22)")}
        <line x1={86 + (1 / 2.5) * 200} y1={92} x2={86 + (1 / 2.5) * 200} y2={116}
          stroke="var(--text-faint)" strokeWidth="1" strokeDasharray="2 2" />
        <text x={86 + (1 / 2.5) * 200} y={130} textAnchor="middle" fontSize="9"
          fontFamily="var(--font-mono)" fill="var(--text-faint)">lift=1 (nezávislost)</text>
        <text x={8} y={158} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          supp(X)={m.sX.toFixed(2)} · supp(Y)={m.sY.toFixed(2)} · supp(X,Y)={m.sXY.toFixed(2)}
        </text>
        <text x={8} y={H - 14} fontSize="12" fontFamily="var(--font-mono)"
          fill={passes(r) ? "oklch(0.62 0.15 150)" : "oklch(0.6 0.18 22)"}>
          {passes(r) ? "PROJDE prahy (silné pravidlo)" : "NEPROJDE prahy"}
        </text>
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {rules.map((rr, i) => (
          <button key={i} onClick={() => setRi(i)}
            style={{
              fontFamily: "var(--font-mono)", fontSize: 11, padding: "3px 8px", borderRadius: 4,
              cursor: "pointer",
              border: i === ri ? "1.5px solid var(--accent)" : "1px solid var(--line)",
              background: passes(rr) ? "color-mix(in oklch, var(--accent) 18%, var(--bg-card))" : "var(--bg-card)",
              color: "var(--text)",
            }}>
            {ruleStr(rr)}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          min-support = {minSup.toFixed(2)}
          <input type="range" min={0} max={1} step={0.1} value={minSup}
            onChange={(e) => setMinSup(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          min-confidence = {minConf.toFixed(2)}
          <input type="range" min={0} max={1} step={0.1} value={minConf}
            onChange={(e) => setMinConf(+e.target.value)} style={{ width: "100%" }} />
        </label>
      </div>
    </div>
  );
}
