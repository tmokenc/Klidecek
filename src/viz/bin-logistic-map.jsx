// Bifurcation diagram of the logistic map x_{n+1} = r x (1 - x).
// The full diagram is drawn for r in [2.5, 4]; a slider picks one r and
// the attractor (the last iterates) for that r is highlighted.
import { useMemo, useState } from "react";

export default function BinLogisticMap() {
  const [r, setR] = useState(3.2);

  const W = 360, H = 220;
  const padL = 30, padR = 10, padT = 10, padB = 26;
  const rMin = 2.5, rMax = 4;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const xR = (rr) => padL + ((rr - rMin) / (rMax - rMin)) * plotW;
  const yX = (xx) => padT + (1 - xx) * plotH; // x in [0,1]

  // Precompute the bifurcation point cloud once.
  const points = useMemo(() => {
    const pts = [];
    const cols = 240; // r samples across the canvas
    for (let c = 0; c <= cols; c++) {
      const rr = rMin + (c / cols) * (rMax - rMin);
      let x = 0.5;
      for (let i = 0; i < 200; i++) x = rr * x * (1 - x); // transient
      for (let i = 0; i < 80; i++) {
        x = rr * x * (1 - x);
        pts.push([xR(rr), yX(x)]);
      }
    }
    return pts;
  }, []);

  // Attractor for the currently selected r.
  const attractor = useMemo(() => {
    let x = 0.5;
    for (let i = 0; i < 400; i++) x = r * x * (1 - x);
    const out = [];
    for (let i = 0; i < 60; i++) {
      x = r * x * (1 - x);
      out.push(x);
    }
    return out;
  }, [r]);

  // count distinct attractor values (rough period estimate)
  const distinct = useMemo(() => {
    const s = [];
    for (const v of attractor) {
      if (!s.some((u) => Math.abs(u - v) < 0.002)) s.push(v);
    }
    return s.length;
  }, [attractor]);

  const regime =
    r < 3 ? "pevný bod (perioda 1)"
    : r < 3.449 ? "perioda 2"
    : r < 3.544 ? "perioda 4"
    : r < 3.5699 ? "zdvojování period"
    : "chaos";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 480, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* axes */}
        <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="var(--line-strong)" strokeWidth="0.5" />
        <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="var(--line-strong)" strokeWidth="0.5" />
        <text x={padL - 6} y={padT + 6} textAnchor="end" fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-faint)">1</text>
        <text x={padL - 6} y={H - padB + 2} textAnchor="end" fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-faint)">0</text>
        <text x={6} y={padT + plotH / 2} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)"
          transform={`rotate(-90 12 ${padT + plotH / 2})`}>x</text>
        <text x={(padL + W - padR) / 2} y={H - 6} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">r (parametr rustu)</text>
        {[2.5, 3, 3.5, 4].map((t) => (
          <text key={t} x={xR(t)} y={H - padB + 12} textAnchor="middle" fontSize="8"
            fontFamily="var(--font-mono)" fill="var(--text-faint)">{t}</text>
        ))}
        {/* bifurcation cloud */}
        <g fill="var(--text-muted)">
          {points.map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r="0.35" opacity="0.55" />
          ))}
        </g>
        {/* onset-of-chaos marker r ~ 3.56995 */}
        <line x1={xR(3.56995)} y1={padT} x2={xR(3.56995)} y2={H - padB}
          stroke="var(--accent-line)" strokeWidth="0.7" strokeDasharray="2 3" />
        <text x={xR(3.56995)} y={padT + 8} textAnchor="middle" fontSize="7.5"
          fontFamily="var(--font-mono)" fill="var(--text-faint)">3.57</text>
        {/* selected r line + its attractor points */}
        <line x1={xR(r)} y1={padT} x2={xR(r)} y2={H - padB}
          stroke="var(--accent)" strokeWidth="1" opacity="0.6" />
        <g fill="var(--accent)">
          {attractor.map((x, i) => (
            <circle key={i} cx={xR(r)} cy={yX(x)} r="1.6" />
          ))}
        </g>
      </svg>

      <input type="range" min={2.5} max={4} step={0.005} value={r}
        onChange={(e) => setR(+e.target.value)} style={{ width: "100%" }} />

      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        r = {r.toFixed(3)} · {regime}
        {regime !== "chaos" && distinct <= 16 ? ` · ${distinct} bod${distinct === 1 ? "" : distinct < 5 ? "y" : "u"}` : ""}
      </div>
    </div>
  );
}
