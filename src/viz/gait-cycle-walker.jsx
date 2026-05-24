// Gait cycle: animated stick figure walking, stance/swing phases.
// Compare 2 gait styles; show GEI accumulation.
import { useEffect, useRef, useState } from "react";

// Joint angles per gait phase (0..1 = one cycle)
// Returns body pose: torso, hipL, hipR, kneeL, kneeR, footL, footR positions
function pose(t, style) {
  // Two legs in antiphase
  const phaseL = t;
  const phaseR = (t + 0.5) % 1;

  // Hip pivot angle (forward swing)
  const hipAngle = (p) => {
    // p in [0, 1]; stance 0..0.6 (planted), swing 0.6..1
    if (p < 0.6) {
      // stance: leg goes from forward to backward
      return 20 - (p / 0.6) * 40; // +20° to -20°
    } else {
      // swing: leg goes from backward to forward
      return -20 + ((p - 0.6) / 0.4) * 40; // -20° to +20°
    }
  };
  const kneeAngle = (p) => {
    if (p < 0.6) {
      // stance: slight bend
      return p < 0.1 ? 10 : (p > 0.5 ? 5 : 0);
    } else {
      // swing: large bend
      return 60 - Math.abs(p - 0.8) / 0.2 * 30;
    }
  };

  // Style multipliers
  const sFactor = style === "limp" ? 1.5 : 1.0; // limp = asymmetric leg
  const speedFactor = style === "fast" ? 1.3 : 1.0;

  const hL = hipAngle(phaseL) * speedFactor;
  const hR = hipAngle(phaseR) * speedFactor * (style === "limp" ? 0.5 : 1);
  const kL = kneeAngle(phaseL);
  const kR = kneeAngle(phaseR) * (style === "limp" ? 0.4 : 1);

  // Body geometry
  const torsoTop = { x: 100, y: 60 };
  const torsoBot = { x: 100, y: 100 }; // hip

  // Vertical bob (height oscillation)
  const bob = Math.cos(t * 4 * Math.PI) * 3 * speedFactor;
  torsoTop.y += bob;
  torsoBot.y += bob;

  const thighLen = 30;
  const shinLen = 32;

  function legPos(hipAng, kneeAng) {
    const hipRad = hipAng * Math.PI / 180;
    const knee = {
      x: torsoBot.x + thighLen * Math.sin(hipRad),
      y: torsoBot.y + thighLen * Math.cos(hipRad),
    };
    const totalKnee = (hipAng + kneeAng) * Math.PI / 180;
    const foot = {
      x: knee.x + shinLen * Math.sin(totalKnee),
      y: knee.y + shinLen * Math.cos(totalKnee),
    };
    return { knee, foot };
  }
  const left = legPos(hL, kL);
  const right = legPos(hR, kR);

  // Arms (antiphase to legs)
  const armSwing = (p) => Math.sin(p * 2 * Math.PI) * 20;
  const armL = armSwing(phaseR);
  const armR = armSwing(phaseL);
  const elbowL = { x: torsoTop.x + 20 * Math.sin(armL * Math.PI / 180), y: torsoTop.y + 4 + 20 * Math.cos(armL * Math.PI / 180) };
  const elbowR = { x: torsoTop.x + 20 * Math.sin(armR * Math.PI / 180), y: torsoTop.y + 4 + 20 * Math.cos(armR * Math.PI / 180) };
  const handL = { x: elbowL.x + 18 * Math.sin(armL * Math.PI / 180 + 0.2), y: elbowL.y + 18 * Math.cos(armL * Math.PI / 180 + 0.2) };
  const handR = { x: elbowR.x + 18 * Math.sin(armR * Math.PI / 180 + 0.2), y: elbowR.y + 18 * Math.cos(armR * Math.PI / 180 + 0.2) };

  return { torsoTop, torsoBot, left, right, elbowL, elbowR, handL, handR, hL, hR, kL, kR, phaseL, phaseR };
}

function phaseLabel(p) {
  if (p < 0.1) return "heel strike";
  if (p < 0.6) return "stance";
  if (p < 0.7) return "toe-off";
  return "swing";
}

export default function GaitCycleWalker() {
  const [t, setT] = useState(0);
  const [auto, setAuto] = useState(true);
  const [style, setStyle] = useState("normal");
  const [showGEI, setShowGEI] = useState(false);
  const animRef = useRef(null);

  useEffect(() => {
    if (!auto) { if (animRef.current) cancelAnimationFrame(animRef.current); return; }
    let last = performance.now();
    function tick(now) {
      const dt = (now - last) / 1000;
      last = now;
      setT((tt) => (tt + dt * 0.5) % 1);
      animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [auto]);

  const p = pose(t, style);

  // Build GEI: union of N silhouettes
  const geiSilhouettes = Array.from({ length: 12 }, (_, i) => pose(i / 12, style));

  return (
    <div style={ctn}>
      <div style={row}>
        <button style={btn} onClick={() => setAuto(!auto)}>{auto ? "stop" : "play"}</button>
        <label style={lbl}>t = {t.toFixed(2)}</label>
        <input type="range" min="0" max="1" step="0.01" value={t} onChange={(e) => { setAuto(false); setT(parseFloat(e.target.value)); }} style={{ flex: 1, maxWidth: 200 }} />
        <label style={lbl}>styl:</label>
        <select value={style} onChange={(e) => setStyle(e.target.value)} style={sel}>
          <option value="normal">normal</option>
          <option value="fast">fast (větší kroky)</option>
          <option value="limp">limping (asymetrický)</option>
        </select>
        <label style={{ ...lbl, display: "flex", alignItems: "center", gap: 4 }}>
          <input type="checkbox" checked={showGEI} onChange={(e) => setShowGEI(e.target.checked)} />
          GEI (gait energy image)
        </label>
      </div>

      <svg viewBox="0 0 220 230" style={{ width: "100%", maxWidth: 380, background: "var(--bg-inset)", borderRadius: 6 }}>
        {/* ground */}
        <line x1={20} y1={210} x2={200} y2={210} stroke="var(--text-muted)" />

        {/* GEI silhouettes overlay */}
        {showGEI && geiSilhouettes.map((sp, i) => (
          <g key={i} opacity="0.18">
            <line x1={sp.torsoTop.x} y1={sp.torsoTop.y} x2={sp.torsoBot.x} y2={sp.torsoBot.y} stroke="var(--accent)" strokeWidth="6" />
            <line x1={sp.torsoBot.x} y1={sp.torsoBot.y} x2={sp.left.knee.x} y2={sp.left.knee.y} stroke="var(--accent)" strokeWidth="4" />
            <line x1={sp.left.knee.x} y1={sp.left.knee.y} x2={sp.left.foot.x} y2={sp.left.foot.y} stroke="var(--accent)" strokeWidth="4" />
            <line x1={sp.torsoBot.x} y1={sp.torsoBot.y} x2={sp.right.knee.x} y2={sp.right.knee.y} stroke="var(--accent)" strokeWidth="4" />
            <line x1={sp.right.knee.x} y1={sp.right.knee.y} x2={sp.right.foot.x} y2={sp.right.foot.y} stroke="var(--accent)" strokeWidth="4" />
          </g>
        ))}

        {/* head */}
        <circle cx={p.torsoTop.x} cy={p.torsoTop.y - 14} r="10" fill="rgba(255,210,170,0.8)" stroke="var(--text)" />
        {/* torso */}
        <line x1={p.torsoTop.x} y1={p.torsoTop.y} x2={p.torsoBot.x} y2={p.torsoBot.y} stroke="var(--text)" strokeWidth="3" />
        {/* arms */}
        <line x1={p.torsoTop.x} y1={p.torsoTop.y + 4} x2={p.elbowL.x} y2={p.elbowL.y} stroke="var(--text)" strokeWidth="2" />
        <line x1={p.elbowL.x} y1={p.elbowL.y} x2={p.handL.x} y2={p.handL.y} stroke="var(--text)" strokeWidth="2" />
        <line x1={p.torsoTop.x} y1={p.torsoTop.y + 4} x2={p.elbowR.x} y2={p.elbowR.y} stroke="var(--text)" strokeWidth="2" />
        <line x1={p.elbowR.x} y1={p.elbowR.y} x2={p.handR.x} y2={p.handR.y} stroke="var(--text)" strokeWidth="2" />
        {/* left leg (highlighted phase color) */}
        <line x1={p.torsoBot.x} y1={p.torsoBot.y} x2={p.left.knee.x} y2={p.left.knee.y} stroke={p.phaseL < 0.6 ? "rgb(64,192,87)" : "rgb(220,140,80)"} strokeWidth="3" />
        <line x1={p.left.knee.x} y1={p.left.knee.y} x2={p.left.foot.x} y2={p.left.foot.y} stroke={p.phaseL < 0.6 ? "rgb(64,192,87)" : "rgb(220,140,80)"} strokeWidth="3" />
        {/* right leg */}
        <line x1={p.torsoBot.x} y1={p.torsoBot.y} x2={p.right.knee.x} y2={p.right.knee.y} stroke={p.phaseR < 0.6 ? "rgb(64,192,87)" : "rgb(220,140,80)"} strokeWidth="3" />
        <line x1={p.right.knee.x} y1={p.right.knee.y} x2={p.right.foot.x} y2={p.right.foot.y} stroke={p.phaseR < 0.6 ? "rgb(64,192,87)" : "rgb(220,140,80)"} strokeWidth="3" />

        {/* phase labels */}
        <text x={20} y={20} fontSize="10" fill="rgb(64,192,87)">● stance (~60%)</text>
        <text x={20} y={32} fontSize="10" fill="rgb(220,140,80)">● swing (~40%)</text>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <div style={statBox}>
          <div style={statLbl}>cycle pos</div>
          <div style={statVal}>{(t * 100).toFixed(0)}%</div>
        </div>
        <div style={statBox}>
          <div style={statLbl}>L fáze</div>
          <div style={{ ...statVal, color: p.phaseL < 0.6 ? "rgb(64,192,87)" : "rgb(220,140,80)" }}>{phaseLabel(p.phaseL)}</div>
        </div>
        <div style={statBox}>
          <div style={statLbl}>R fáze</div>
          <div style={{ ...statVal, color: p.phaseR < 0.6 ? "rgb(64,192,87)" : "rgb(220,140,80)" }}>{phaseLabel(p.phaseR)}</div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Gait cycle = jeden kompletní krok (heel strike → stejná noha heel strike). Stance ~60%, swing ~40%, double support na přechodech.
        <b>GEI</b> (Gait Energy Image) sčítá silhouetty napříč cyklem — vytváří kompaktní 2D template invariantní k délce sekvence.
        Asymetrie (limping) je výrazná v GEI a slouží jako diskriminační rys.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const statBox = { background: "var(--bg-inset)", padding: 8, borderRadius: 6, textAlign: "center" };
const statLbl = { fontSize: 10, color: "var(--text-muted)" };
const statVal = { fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)", marginTop: 3 };
