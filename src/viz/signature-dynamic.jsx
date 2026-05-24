// Dynamic signature: playback of (x,y,p,t); pressure + velocity profiles.
// Genuine vs skilled forgery → DTW distance.
import { useEffect, useRef, useState } from "react";

// Encoded as polylines with time/pressure: arrays of {x, y, p, t}
// Time normalized to 0..1, pressure 0..1
const GENUINE = generateSig(0, "smooth", 1.0);
const SKILLED_FORGE = generateSig(0, "shape_only", 1.0); // same shape, different timing/pressure
const RANDOM_FORGE = generateSig(99, "smooth", 1.0); // different shape

function generateSig(seed, mode, scale) {
  // Generate a signature-like curve with key strokes
  const rnd = mulberry32(seed);
  const pts = [];
  // shape: "name-like" signature with 3 strokes
  const stroke1 = [
    {x: 30, y: 80, t: 0.00, p: 0.6},
    {x: 50, y: 70, t: 0.05, p: 0.8},
    {x: 75, y: 60, t: 0.08, p: 0.7},
    {x: 95, y: 80, t: 0.12, p: 0.9},
    {x: 115, y: 90, t: 0.15, p: 0.7},
    {x: 130, y: 65, t: 0.18, p: 0.5},
  ];
  const stroke2 = [
    {x: 140, y: 100, t: 0.22, p: 0.0}, // pen up
    {x: 150, y: 60, t: 0.25, p: 0.7},
    {x: 165, y: 90, t: 0.28, p: 0.9},
    {x: 180, y: 75, t: 0.31, p: 0.6},
    {x: 200, y: 95, t: 0.34, p: 0.85},
    {x: 215, y: 65, t: 0.38, p: 0.5},
  ];
  const stroke3 = [
    {x: 220, y: 105, t: 0.42, p: 0.0},
    {x: 230, y: 75, t: 0.45, p: 0.85},
    {x: 245, y: 90, t: 0.48, p: 0.95},
    {x: 260, y: 70, t: 0.52, p: 0.7},
    {x: 280, y: 85, t: 0.56, p: 0.8},
    {x: 300, y: 100, t: 0.60, p: 0.55},
  ];

  const all = [...stroke1, ...stroke2, ...stroke3];

  if (mode === "smooth") {
    return all.map(p => ({ ...p, x: p.x * scale, y: p.y * scale }));
  }
  if (mode === "shape_only") {
    // Forger gets shape right but timing/pressure wrong
    return all.map((p, i) => ({
      x: p.x * scale + (rnd() - 0.5) * 4,
      y: p.y * scale + (rnd() - 0.5) * 4,
      t: i / all.length * 0.7, // slow, monotone
      p: p.p > 0 ? 0.5 + (rnd() - 0.5) * 0.3 : 0, // uniform pressure
    }));
  }
  return all.map(p => ({
    x: 30 + rnd() * 270,
    y: 60 + rnd() * 50,
    t: p.t,
    p: 0.4 + rnd() * 0.4,
  }));
}

function mulberry32(a) { return function() { a |= 0; a = a + 0x6D2B79F5 | 0; var t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// DTW between two pressure/velocity sequences
function dtw(a, b) {
  const n = a.length, m = b.length;
  const dp = Array(n + 1).fill(0).map(() => Array(m + 1).fill(Infinity));
  dp[0][0] = 0;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const cost = Math.abs(a[i-1] - b[j-1]);
    dp[i][j] = cost + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  }
  return dp[n][m] / Math.max(n, m);
}

function velocityProfile(sig) {
  const v = [];
  for (let i = 1; i < sig.length; i++) {
    const dx = sig[i].x - sig[i-1].x;
    const dy = sig[i].y - sig[i-1].y;
    const dt = Math.max(0.001, sig[i].t - sig[i-1].t);
    v.push(Math.sqrt(dx*dx + dy*dy) / dt);
  }
  return v;
}

export default function SignatureDynamic() {
  const [scenario, setScenario] = useState("genuine");
  const [t, setT] = useState(0);
  const [auto, setAuto] = useState(true);
  const animRef = useRef(null);

  const probe = scenario === "genuine" ? GENUINE : scenario === "skilled" ? SKILLED_FORGE : RANDOM_FORGE;

  useEffect(() => {
    if (!auto) { if (animRef.current) cancelAnimationFrame(animRef.current); return; }
    let last = performance.now();
    function tick(now) {
      const dt = (now - last) / 1000;
      last = now;
      setT((tt) => {
        const nt = tt + dt * 0.4;
        return nt > 1 ? 0 : nt;
      });
      animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [auto]);

  // Render trajectory up to current t
  const W = 360, H = 160;
  const renderedRef = probe.filter(p => p.t <= t);
  const renderedGen = GENUINE.filter(p => p.t <= t);

  // Build segments where pressure > 0 (pen down)
  function segments(pts) {
    const segs = [];
    let cur = [];
    for (const p of pts) {
      if (p.p === 0) { if (cur.length) { segs.push(cur); cur = []; } }
      else cur.push(p);
    }
    if (cur.length) segs.push(cur);
    return segs;
  }

  const pressureSeq = probe.filter(p => p.p > 0).map(p => p.p);
  const pressureGen = GENUINE.filter(p => p.p > 0).map(p => p.p);
  const velProbe = velocityProfile(probe);
  const velGen = velocityProfile(GENUINE);

  const dPressure = dtw(pressureSeq, pressureGen);
  const dVelocity = dtw(velProbe, velGen);
  const totalDist = (dPressure * 100 + dVelocity * 0.5) / 2;
  const verdict = totalDist < 15 ? "GENUINE" : "FORGERY";

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>vzorek:</label>
        <select value={scenario} onChange={(e) => setScenario(e.target.value)} style={sel}>
          <option value="genuine">genuine (uložená šablona)</option>
          <option value="skilled">skilled forgery (shape OK, timing/pressure špatně)</option>
          <option value="random">random forgery (jiný shape)</option>
        </select>
        <button style={btn} onClick={() => setAuto(!auto)}>{auto ? "stop" : "play"}</button>
        <button style={btn} onClick={() => setT(0)}>reset</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 480, background: "var(--bg-inset)", borderRadius: 6 }}>
        {/* genuine reference (light) */}
        {segments(GENUINE).map((seg, i) => (
          <polyline key={`g${i}`} points={seg.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke="rgb(64,192,87)" strokeWidth="1" opacity="0.3" />
        ))}
        {/* probe trajectory */}
        {segments(renderedRef).map((seg, i) => (
          <g key={`p${i}`}>
            {seg.map((p, j) => j === 0 ? null : (
              <line key={j} x1={seg[j-1].x} y1={seg[j-1].y} x2={p.x} y2={p.y} stroke={scenario === "genuine" ? "rgb(64,192,87)" : "rgb(220,80,80)"} strokeWidth={1 + p.p * 4} strokeLinecap="round" />
            ))}
          </g>
        ))}
        {/* current pen */}
        {renderedRef.length > 0 && renderedRef[renderedRef.length - 1].p > 0 && (
          <circle cx={renderedRef[renderedRef.length - 1].x} cy={renderedRef[renderedRef.length - 1].y} r="3" fill="var(--accent)" />
        )}
        <text x={6} y={12} fontSize="10" fill="rgb(64,192,87)">─ genuine šablona (tlustší = vyšší tlak)</text>
        <text x={6} y={H - 4} fontSize="10" fill="var(--text-muted)">t = {t.toFixed(2)} / 0.60</text>
      </svg>

      <div style={row}>
        <label style={lbl}>t:</label>
        <input type="range" min="0" max="0.7" step="0.01" value={t} onChange={(e) => { setAuto(false); setT(parseFloat(e.target.value)); }} style={{ flex: 1 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <div style={panelTitle}>pressure profile</div>
          <svg viewBox={`0 0 ${W/2} 80`} style={{ width: "100%", background: "var(--bg-inset)", borderRadius: 4 }}>
            <polyline points={pressureGen.map((p, i) => `${5 + i * 170 / pressureGen.length},${80 - p * 70}`).join(" ")} fill="none" stroke="rgb(64,192,87)" strokeWidth="1.5" opacity="0.5" />
            <polyline points={pressureSeq.map((p, i) => `${5 + i * 170 / pressureSeq.length},${80 - p * 70}`).join(" ")} fill="none" stroke={scenario === "genuine" ? "rgb(64,192,87)" : "rgb(220,80,80)"} strokeWidth="2" />
            <text x={5} y={12} fontSize="9" fill="var(--text-muted)">DTW dist = {dPressure.toFixed(3)}</text>
          </svg>
        </div>
        <div>
          <div style={panelTitle}>velocity profile</div>
          <svg viewBox={`0 0 ${W/2} 80`} style={{ width: "100%", background: "var(--bg-inset)", borderRadius: 4 }}>
            <polyline points={velGen.map((v, i) => `${5 + i * 170 / velGen.length},${80 - Math.min(v, 500) / 500 * 70}`).join(" ")} fill="none" stroke="rgb(64,192,87)" strokeWidth="1.5" opacity="0.5" />
            <polyline points={velProbe.map((v, i) => `${5 + i * 170 / velProbe.length},${80 - Math.min(v, 500) / 500 * 70}`).join(" ")} fill="none" stroke={scenario === "genuine" ? "rgb(64,192,87)" : "rgb(220,80,80)"} strokeWidth="2" />
            <text x={5} y={12} fontSize="9" fill="var(--text-muted)">DTW dist = {dVelocity.toFixed(1)}</text>
          </svg>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={statBox}><div style={statLbl}>kombinovaná DTW vzdálenost</div><div style={statVal}>{totalDist.toFixed(1)}</div></div>
        <div style={statBox}><div style={statLbl}>verdikt (threshold 15)</div><div style={{ ...statVal, color: verdict === "GENUINE" ? "rgb(64,192,87)" : "rgb(220,80,80)" }}>{verdict}</div></div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        <b>Statický</b> podpis (jen tvar) by skilled forgery prošel — křivka je velmi podobná.
        <b>Dynamický</b> zachycuje tlak a rychlost. I když forger napodobí tvar, <b>timing</b> a <b>tlakový profil</b> jsou skoro nemožné zachytit.
        EER ~3 % pro skilled forgery vs ~0.5 % pro random.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const panelTitle = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 4 };
const statBox = { background: "var(--bg-inset)", padding: 10, borderRadius: 6, textAlign: "center" };
const statLbl = { fontSize: 10, color: "var(--text-muted)" };
const statVal = { fontSize: 16, fontWeight: 600, fontFamily: "var(--font-mono)", marginTop: 4 };
