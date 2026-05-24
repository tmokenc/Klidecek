// Hill climbing vs simulated annealing on a 1D multi-modal landscape.
import { useState, useEffect, useMemo } from "react";

const W = 540, H = 260;
const PAD_L = 30, PAD_R = 20, PAD_T = 20, PAD_B = 40;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;
const XMIN = 0, XMAX = 10;

// Multi-modal landscape — sum of Gaussians (peaks) and one global maximum
function landscape(x) {
  return (
    1.0 * Math.exp(-Math.pow(x - 2.5, 2) / 0.8)
    + 1.6 * Math.exp(-Math.pow(x - 6.5, 2) / 0.6)
    + 0.9 * Math.exp(-Math.pow(x - 8.5, 2) / 0.4)
    + 0.3 * Math.exp(-Math.pow(x - 0.5, 2) / 0.5)
  );
}

const STEP = 0.18;

// Seeded RNG
function rngFactory(seed) {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function runHillClimb(start, steps) {
  const path = [{ x: start, f: landscape(start), accept: true }];
  let x = start;
  let cur = landscape(x);
  for (let i = 0; i < steps; i++) {
    const candidates = [x - STEP, x + STEP].filter((c) => c >= XMIN && c <= XMAX);
    let best = x, bestF = cur;
    for (const c of candidates) {
      const f = landscape(c);
      if (f > bestF) { best = c; bestF = f; }
    }
    if (best === x) {
      path.push({ x, f: cur, accept: false, stuck: true });
      break;
    }
    x = best;
    cur = bestF;
    path.push({ x, f: cur, accept: true });
  }
  return path;
}

function runSA(start, steps, T0, seed) {
  const rng = rngFactory(seed);
  const path = [{ x: start, f: landscape(start), accept: true }];
  let x = start;
  let cur = landscape(x);
  for (let i = 0; i < steps; i++) {
    const T = T0 * Math.pow(0.95, i);
    const dx = (rng() - 0.5) * 1.5;
    const nx = Math.max(XMIN, Math.min(XMAX, x + dx));
    const nf = landscape(nx);
    const dE = nf - cur;
    const p = dE > 0 ? 1 : Math.exp(dE / Math.max(T, 0.01));
    const accept = rng() < p;
    if (accept) { x = nx; cur = nf; }
    path.push({ x: nx, f: nf, accept, T, p });
  }
  return path;
}

const xToPx = (x) => PAD_L + ((x - XMIN) / (XMAX - XMIN)) * PLOT_W;
const fToPx = (f, fMax) => PAD_T + (1 - f / fMax) * PLOT_H;

export default function HillClimbingSa() {
  const [start, setStart] = useState(2.0);
  const [steps, setSteps] = useState(40);
  const [T0, setT0] = useState(0.5);
  const [seed, setSeed] = useState(42);
  const [scrub, setScrub] = useState(steps);

  const hc = useMemo(() => runHillClimb(start, steps), [start, steps]);
  const sa = useMemo(() => runSA(start, steps, T0, seed), [start, steps, T0, seed]);
  useEffect(() => { setScrub(Math.max(hc.length, sa.length)); }, [hc.length, sa.length]);
  const maxStep = Math.max(hc.length, sa.length);
  const showHc = hc.slice(0, scrub);
  const showSa = sa.slice(0, scrub);

  // Compute global max
  const fMax = 1.7;

  // Render landscape curve
  const STEPS_PLOT = 240;
  const curvePath = [];
  for (let i = 0; i <= STEPS_PLOT; i++) {
    const x = XMIN + (i / STEPS_PLOT) * (XMAX - XMIN);
    const f = landscape(x);
    curvePath.push(`${i === 0 ? "M" : "L"}${xToPx(x).toFixed(1)} ${fToPx(f, fMax).toFixed(1)}`);
  }
  const curveD = curvePath.join(" ");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 11 }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center", fontFamily: "var(--font-mono)" }}>
          start x:
          <input type="range" min={0.5} max={9.5} step={0.5} value={start} onChange={(e) => setStart(+e.target.value)} style={{ width: 100 }}/>
          <span style={{ minWidth: 28 }}>{start.toFixed(1)}</span>
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center", fontFamily: "var(--font-mono)" }}>
          T₀:
          <input type="range" min={0.05} max={2} step={0.05} value={T0} onChange={(e) => setT0(+e.target.value)} style={{ width: 100 }}/>
          <span style={{ minWidth: 28 }}>{T0.toFixed(2)}</span>
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center", fontFamily: "var(--font-mono)" }}>
          kroky:
          <input type="range" min={10} max={80} step={5} value={steps} onChange={(e) => setSteps(+e.target.value)} style={{ width: 80 }}/>
          <span style={{ minWidth: 24 }}>{steps}</span>
        </label>
        <button onClick={() => setSeed(seed + 1)} style={btnStyle()}>nový seed</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 620 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* Landscape */}
        <path d={curveD} stroke="var(--accent)" strokeWidth="2" fill="none"/>
        {/* HC path */}
        {showHc.length > 1 && (
          <path
            d={showHc.map((p, i) => `${i === 0 ? "M" : "L"}${xToPx(p.x).toFixed(1)} ${fToPx(p.f, fMax).toFixed(1)}`).join(" ")}
            stroke="oklch(0.7 0.18 30)" strokeWidth="1.4" fill="none" strokeDasharray="0"/>
        )}
        {showHc.map((p, i) => (
          <circle key={`hc${i}`} cx={xToPx(p.x)} cy={fToPx(p.f, fMax)} r="3"
            fill={p.stuck ? "var(--text-faint)" : "oklch(0.7 0.18 30)"}/>
        ))}
        {/* SA path */}
        {showSa.length > 1 && (
          <path
            d={showSa.map((p, i) => `${i === 0 ? "M" : "L"}${xToPx(p.x).toFixed(1)} ${fToPx(p.f, fMax).toFixed(1)}`).join(" ")}
            stroke="oklch(0.65 0.18 280)" strokeWidth="1.2" fill="none" opacity="0.6"/>
        )}
        {showSa.map((p, i) => (
          <circle key={`sa${i}`} cx={xToPx(p.x)} cy={fToPx(p.f, fMax)} r="2.5"
            fill="oklch(0.65 0.18 280)" opacity={p.accept ? 1 : 0.3}/>
        ))}

        {/* axes */}
        <g stroke="var(--line)" strokeWidth="0.6" fill="none">
          <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B}/>
          <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={H - PAD_B}/>
        </g>
        <g fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          {[0, 2, 4, 6, 8, 10].map((x) => (
            <text key={`xl${x}`} x={xToPx(x)} y={H - PAD_B + 14} textAnchor="middle">{x}</text>
          ))}
          <text x={W - PAD_R} y={H - PAD_B + 26} textAnchor="end">x</text>
          <text x={PAD_L - 22} y={PAD_T + 8}>f(x)</text>
        </g>
      </svg>

      <div style={{ display: "flex", gap: 16, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
        <span style={{ color: "oklch(0.7 0.18 30)" }}>● Hill climb: f = {hc[Math.min(scrub - 1, hc.length - 1)]?.f.toFixed(3)}</span>
        <span style={{ color: "oklch(0.65 0.18 280)" }}>● SA: f = {sa[Math.min(scrub - 1, sa.length - 1)]?.f.toFixed(3)}</span>
        <span>globální max ≈ 1.6 v x=6.5</span>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Hill climb se *zasekne* v lokálním maximu (start ≈ 2.5 nebo 8.5 → uvízne mimo globální). SA akceptuje horší stav s prav. exp(ΔE/T).
        Vysoké T₀ = více náhody (explorace), nízké = chování blíž k HC. Cooling schedule T = T₀ · 0.95^t.
      </div>
    </div>
  );
}

function btnStyle() {
  return { background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 8px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
