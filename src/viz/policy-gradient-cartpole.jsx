// Policy gradient on a simplified cartpole — policy probabilities, trajectory replay, reward curve.
import { useState, useMemo, useEffect } from "react";

// Toy cartpole: state = pole angle θ ∈ [-π/4, π/4], cart position ignored.
// Actions: 0 = push left, 1 = push right
// Reward: +1 each step the pole is upright (|θ| < π/6); episode ends if |θ| > π/4.

// Policy: π_θ(left | s) = σ(w0 + w1 · θ + w2 · θ²) — parametric stochastic policy.
function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }

function rngFactory(seed) {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function step(theta, omega, a, dt = 0.1) {
  const g = 9.8, l = 1, m = 0.1;
  const force = a === 0 ? -2 : 2;
  // simplified pendulum: dω/dt = g/l · sin(θ) + force/(m·l)
  const dOmega = (g / l) * Math.sin(theta) + force / (m * l);
  const newOmega = omega + dOmega * dt;
  const newTheta = theta + newOmega * dt;
  return { theta: newTheta, omega: newOmega };
}

function runEpisode(w, seed, maxSteps = 50) {
  const rng = rngFactory(seed);
  let theta = (rng() - 0.5) * 0.1; // small initial angle
  let omega = 0;
  let totalR = 0;
  const traj = [{ theta, omega, a: null, r: 0 }];
  for (let t = 0; t < maxSteps; t++) {
    if (Math.abs(theta) > Math.PI / 4) break;
    const pLeft = sigmoid(w[0] + w[1] * theta + w[2] * theta * theta);
    const a = rng() < pLeft ? 0 : 1;
    const next = step(theta, omega, a);
    const r = Math.abs(next.theta) < Math.PI / 6 ? 1 : 0;
    totalR += r;
    theta = next.theta;
    omega = next.omega;
    traj.push({ theta, omega, a, r, pLeft });
  }
  return { traj, totalR };
}

function trainEpisodes(numEps, seed) {
  const rng = rngFactory(seed);
  let w = [0, -5, 0]; // start with a slight bias to push opposite of lean
  const returnsHist = [];
  for (let ep = 0; ep < numEps; ep++) {
    const { traj, totalR } = runEpisode(w, seed * 1000 + ep);
    returnsHist.push(totalR);
    // REINFORCE update: ∇log π(a|s) · R
    const lr = 0.005;
    for (const s of traj.slice(1)) {
      const z = w[0] + w[1] * s.theta + w[2] * s.theta * s.theta;
      const pL = sigmoid(z);
      const aOneHot = s.a === 0 ? 1 : 0;
      const dlog = aOneHot - pL;
      w[0] += lr * dlog * totalR;
      w[1] += lr * dlog * s.theta * totalR;
      w[2] += lr * dlog * s.theta * s.theta * totalR;
    }
  }
  return { w, returnsHist };
}

export default function PolicyGradientCartpole() {
  const [eps, setEps] = useState(80);
  const [seed, setSeed] = useState(7);
  const { w: trainedW, returnsHist } = useMemo(() => trainEpisodes(eps, seed), [eps, seed]);
  const [scrub, setScrub] = useState(eps);
  useEffect(() => { setScrub(eps); }, [eps]);

  // Snapshot policy after `scrub` episodes
  const { w: snapshotW, returnsHist: snapHist } = useMemo(() => trainEpisodes(Math.max(1, scrub), seed), [scrub, seed]);

  // Run a demonstration episode with snapshot policy
  const demo = useMemo(() => runEpisode(snapshotW, seed + 99999), [snapshotW, seed]);

  const W = 540, H = 320;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", fontSize: 11 }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center", fontFamily: "var(--font-mono)" }}>
          episodes
          <input type="range" min={1} max={200} value={eps} onChange={(e) => setEps(+e.target.value)} style={{ width: 100 }}/>
          <span style={{ minWidth: 30 }}>{eps}</span>
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center", fontFamily: "var(--font-mono)" }}>
          scrub
          <input type="range" min={1} max={eps} value={scrub} onChange={(e) => setScrub(+e.target.value)} style={{ width: 100 }}/>
          <span style={{ minWidth: 30 }}>{scrub}</span>
        </label>
        <button onClick={() => setSeed(seed + 1)} style={btnStyle()}>nový seed</button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {/* Trajectory visualization */}
        <div style={{ flex: 1, minWidth: 250 }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            ukázková trajektorie (policy po {scrub} ep.)
          </div>
          <svg viewBox="0 0 280 200" style={{ width: "100%", maxWidth: 320 }}>
            <rect width="280" height="200" fill="var(--bg-inset)"/>
            {/* Pole visualization with frames */}
            {demo.traj.slice(0, 15).map((s, i) => {
              const cx = 30 + i * 17;
              const cy = 110;
              const tipX = cx + 30 * Math.sin(s.theta);
              const tipY = cy - 30 * Math.cos(s.theta);
              return (
                <g key={i}>
                  <line x1={cx} y1={cy} x2={tipX} y2={tipY}
                    stroke={Math.abs(s.theta) > Math.PI / 6 ? "oklch(0.6 0.22 25)" : "oklch(0.7 0.18 145)"}
                    strokeWidth="2"/>
                  <circle cx={cx} cy={cy} r="3" fill="var(--accent)"/>
                  {s.a !== null && (
                    <text x={cx} y={cy + 14} textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                      {s.a === 0 ? "←" : "→"}
                    </text>
                  )}
                </g>
              );
            })}
            <text x={10} y={14} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">survived: {demo.totalR}</text>
          </svg>
        </div>

        {/* Return curve */}
        <div style={{ flex: 1, minWidth: 250 }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            return per episode
          </div>
          <svg viewBox="0 0 280 200" style={{ width: "100%", maxWidth: 320 }}>
            <rect width="280" height="200" fill="var(--bg-inset)"/>
            {returnsHist.length > 1 && (() => {
              const maxR = Math.max(...returnsHist, 50);
              const window = Math.max(2, Math.floor(returnsHist.length / 25));
              const smoothed = returnsHist.map((_, i) => {
                const start = Math.max(0, i - window);
                const slice = returnsHist.slice(start, i + 1);
                return slice.reduce((a, b) => a + b, 0) / slice.length;
              });
              const path = smoothed.map((v, i) => {
                const x = 10 + (i / (returnsHist.length - 1)) * 260;
                const y = 180 - (v / maxR) * 160;
                return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
              }).join(" ");
              return (
                <>
                  <line x1="10" y1="20" x2="10" y2="180" stroke="var(--line)" strokeWidth="0.5"/>
                  <line x1="10" y1="180" x2="270" y2="180" stroke="var(--line)" strokeWidth="0.5"/>
                  <path d={path} stroke="var(--accent)" strokeWidth="1.5" fill="none"/>
                  {/* dots for raw returns */}
                  {returnsHist.map((v, i) => (
                    <circle key={i} cx={10 + (i / (returnsHist.length - 1)) * 260}
                      cy={180 - (v / maxR) * 160} r="1.5" fill="var(--accent)" opacity="0.3"/>
                  ))}
                  <text x={14} y={18} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">{maxR.toFixed(0)}</text>
                  {/* scrub marker */}
                  <line x1={10 + ((scrub - 1) / (returnsHist.length - 1)) * 260} y1={20}
                    x2={10 + ((scrub - 1) / (returnsHist.length - 1)) * 260} y2={180}
                    stroke="oklch(0.7 0.18 60)" strokeWidth="1" strokeDasharray="3 2"/>
                </>
              );
            })()}
          </svg>
        </div>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", padding: 6, borderRadius: 3, fontSize: 11, fontFamily: "var(--font-mono)" }}>
        <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", marginBottom: 2 }}>policy parametry (po {scrub} ep.)</div>
        <div>w = ({snapshotW.map((v) => v.toFixed(3)).join(", ")})</div>
        <div>π(left | θ) = σ(w₀ + w₁·θ + w₂·θ²)</div>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        REINFORCE: ∇θ J = E[Σ ∇log π_θ(a|s) · R(τ)]. Po každé epizodě aktualizuje w ve směru, který zvyšuje
        pravděpodobnost akcí vedoucích k vyšší odměně. Při dobré inicializaci policy konverguje k udržení pólu vzhůru;
        při špatné se může „rozpadnout". Skrubujte přes epizody — pozorujte učení.
      </div>
    </div>
  );
}

function btnStyle() {
  return { background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 8px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
