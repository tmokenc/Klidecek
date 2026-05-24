// Viola-Jones cascade: slide window across image, each stage quickly rejects.
// Show how cascade structure makes detection O(W·H) rather than O(W·H·N_features).
import { useEffect, useRef, useState } from "react";

const IMG_W = 320, IMG_H = 200;

// Define simple "image": some "faces" at known positions + clutter
const FACES = [
  { x: 60,  y: 60,  size: 50, real: true },
  { x: 180, y: 90,  size: 56, real: true },
  { x: 260, y: 140, size: 30, real: false }, // tree/noise
  { x: 100, y: 150, size: 40, real: false },
];

// Cascade: 4 stages with increasing strictness
const STAGES = [
  { name: "Stage 1: edge",     features: 3,  rejectRate: 0.50 }, // rejects 50% of non-faces
  { name: "Stage 2: line",     features: 10, rejectRate: 0.70 },
  { name: "Stage 3: 4-rect",   features: 50, rejectRate: 0.85 },
  { name: "Stage 4: full",     features: 200, rejectRate: 0.99 },
];

export default function ViolaJonesCascade() {
  const [winX, setWinX] = useState(40);
  const [winY, setWinY] = useState(50);
  const [winSize, setWinSize] = useState(50);
  const [autoRun, setAutoRun] = useState(false);
  const [scanLog, setScanLog] = useState({ checked: 0, stage1Pass: 0, stage2Pass: 0, stage3Pass: 0, stage4Pass: 0, detected: 0, totalCost: 0 });
  const animRef = useRef(null);

  function isFace(x, y, size) {
    // Match if window overlaps a "real" face with similar size
    for (const f of FACES) {
      const cx = x + size / 2, cy = y + size / 2;
      const fcx = f.x + f.size / 2, fcy = f.y + f.size / 2;
      const dist = Math.sqrt((cx - fcx) ** 2 + (cy - fcy) ** 2);
      const sizeDiff = Math.abs(size - f.size) / f.size;
      if (dist < f.size / 2 && sizeDiff < 0.25 && f.real) return true;
    }
    return false;
  }
  function isClutter(x, y, size) {
    for (const f of FACES) {
      const cx = x + size / 2, cy = y + size / 2;
      const fcx = f.x + f.size / 2, fcy = f.y + f.size / 2;
      const dist = Math.sqrt((cx - fcx) ** 2 + (cy - fcy) ** 2);
      if (dist < f.size / 2 && !f.real) return true;
    }
    return false;
  }

  // For current window, determine cascade stage decisions deterministically
  function cascade(x, y, size) {
    const face = isFace(x, y, size);
    const clutter = isClutter(x, y, size);
    let stagesPassed = 0;
    let cost = 0;
    for (let i = 0; i < STAGES.length; i++) {
      cost += STAGES[i].features;
      // Real face always passes
      if (face) { stagesPassed = i + 1; continue; }
      // Random rejection based on hash + stage rate
      const seed = (x * 31 + y * 17 + size + i) % 1000;
      const r = (seed * 1664525 + 1013904223) % 1000 / 1000;
      const pass = clutter ? r < (1 - STAGES[i].rejectRate * 0.5) : r < (1 - STAGES[i].rejectRate);
      if (!pass) return { passedStages: stagesPassed, cost, detected: false };
      stagesPassed = i + 1;
    }
    return { passedStages: stagesPassed, cost, detected: face };
  }

  const result = cascade(winX, winY, winSize);

  function fullScan() {
    let totalChecked = 0, s1 = 0, s2 = 0, s3 = 0, s4 = 0, detected = 0, totalCost = 0;
    const step = 10;
    for (let y = 0; y < IMG_H - winSize; y += step) {
      for (let x = 0; x < IMG_W - winSize; x += step) {
        const r = cascade(x, y, winSize);
        totalChecked++;
        if (r.passedStages >= 1) s1++;
        if (r.passedStages >= 2) s2++;
        if (r.passedStages >= 3) s3++;
        if (r.passedStages >= 4) s4++;
        if (r.detected) detected++;
        totalCost += r.cost;
      }
    }
    setScanLog({ checked: totalChecked, stage1Pass: s1, stage2Pass: s2, stage3Pass: s3, stage4Pass: s4, detected, totalCost });
  }

  // Animate sliding window
  useEffect(() => {
    if (!autoRun) { if (animRef.current) cancelAnimationFrame(animRef.current); return; }
    let lastT = performance.now();
    function tick(t) {
      if (t - lastT > 80) {
        setWinX((x) => {
          let nx = x + 12;
          if (nx > IMG_W - winSize) { nx = 20; setWinY((y) => (y + 12 > IMG_H - winSize ? 20 : y + 12)); }
          return nx;
        });
        lastT = t;
      }
      animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [autoRun, winSize]);

  const naive = STAGES.reduce((a, s) => a + s.features, 0);
  const savings = scanLog.checked > 0 ? (1 - scanLog.totalCost / (scanLog.checked * naive)) * 100 : 0;

  return (
    <div style={ctn}>
      <div style={row}>
        <button style={btn} onClick={() => setAutoRun(!autoRun)}>{autoRun ? "stop" : "auto-slide"}</button>
        <button style={btn} onClick={fullScan}>full scan (statistika)</button>
        <button style={btn} onClick={() => { setWinX(40); setWinY(50); }}>reset pos</button>
        <label style={lbl}>velikost = {winSize}</label>
        <input type="range" min="24" max="80" value={winSize} onChange={(e) => setWinSize(parseInt(e.target.value))} />
      </div>

      <svg viewBox={`0 0 ${IMG_W} ${IMG_H}`} style={{ width: "100%", maxWidth: 480, background: "var(--bg-inset)", borderRadius: 6 }}>
        {/* image background */}
        <rect x={0} y={0} width={IMG_W} height={IMG_H} fill="rgba(80,90,100,0.3)" />
        {/* "faces" drawn */}
        {FACES.map((f, i) => f.real ? (
          <g key={i}>
            <circle cx={f.x + f.size/2} cy={f.y + f.size/2} r={f.size/2} fill="rgba(255,220,180,0.7)" stroke="rgba(120,80,40,0.6)" />
            <circle cx={f.x + f.size/2 - f.size*0.18} cy={f.y + f.size/2 - f.size*0.1} r={f.size*0.08} fill="rgba(40,40,40,0.7)" />
            <circle cx={f.x + f.size/2 + f.size*0.18} cy={f.y + f.size/2 - f.size*0.1} r={f.size*0.08} fill="rgba(40,40,40,0.7)" />
            <path d={`M ${f.x + f.size/2 - f.size*0.18} ${f.y + f.size/2 + f.size*0.15} Q ${f.x + f.size/2} ${f.y + f.size/2 + f.size*0.25} ${f.x + f.size/2 + f.size*0.18} ${f.y + f.size/2 + f.size*0.15}`} stroke="rgba(120,40,40,0.6)" strokeWidth="1.5" fill="none" />
          </g>
        ) : (
          <ellipse key={i} cx={f.x + f.size/2} cy={f.y + f.size/2} rx={f.size/2} ry={f.size/3} fill="rgba(100,140,80,0.5)" />
        ))}
        {/* sliding window */}
        <rect x={winX} y={winY} width={winSize} height={winSize}
          fill="rgba(255,255,0,0.08)"
          stroke={result.detected ? "rgb(64,192,87)" : result.passedStages >= 3 ? "rgb(220,140,80)" : "rgb(220,80,80)"}
          strokeWidth="2"
        />
        <text x={winX + 4} y={winY - 2} fontSize="10" fill={result.detected ? "rgb(64,192,87)" : "rgb(220,80,80)"}>
          {result.detected ? "DETECTED" : `rejected @ stage ${result.passedStages + 1}/4`}
        </text>
      </svg>

      <div style={row}>
        <label style={lbl}>x = {winX}</label>
        <input type="range" min="0" max={IMG_W - winSize} value={winX} onChange={(e) => setWinX(parseInt(e.target.value))} style={{ flex: 1 }} />
      </div>
      <div style={row}>
        <label style={lbl}>y = {winY}</label>
        <input type="range" min="0" max={IMG_H - winSize} value={winY} onChange={(e) => setWinY(parseInt(e.target.value))} style={{ flex: 1 }} />
      </div>

      {/* cascade stages indicator */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
        {STAGES.map((s, i) => (
          <div key={i} style={{
            background: i < result.passedStages ? "rgba(64,192,87,0.2)" : i === result.passedStages ? "rgba(220,80,80,0.2)" : "var(--bg-inset)",
            border: "1px solid " + (i < result.passedStages ? "rgb(64,192,87)" : i === result.passedStages ? "rgb(220,80,80)" : "var(--line)"),
            padding: 6, borderRadius: 5, textAlign: "center", fontSize: 11,
          }}>
            <div style={{ fontWeight: 600 }}>{s.name}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{s.features} features</div>
            <div style={{ fontSize: 11, color: i < result.passedStages ? "rgb(64,192,87)" : i === result.passedStages ? "rgb(220,80,80)" : "var(--text-muted)" }}>
              {i < result.passedStages ? "✓ pass" : i === result.passedStages ? "✗ reject" : "—"}
            </div>
          </div>
        ))}
      </div>

      {scanLog.checked > 0 && (
        <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 11.5 }}>
          <div style={{ marginBottom: 6, color: "var(--text-muted)" }}>statistika sliding-window scanu (step 10 px):</div>
          <div>celkem oken: <b>{scanLog.checked}</b></div>
          <div>prošlo stage 1: <b>{scanLog.stage1Pass}</b> ({(scanLog.stage1Pass/scanLog.checked*100).toFixed(0)}%)</div>
          <div>prošlo stage 2: <b>{scanLog.stage2Pass}</b> ({(scanLog.stage2Pass/scanLog.checked*100).toFixed(0)}%)</div>
          <div>prošlo stage 3: <b>{scanLog.stage3Pass}</b> ({(scanLog.stage3Pass/scanLog.checked*100).toFixed(0)}%)</div>
          <div>prošlo stage 4 (= detected): <b style={{ color: "rgb(64,192,87)" }}>{scanLog.stage4Pass}</b></div>
          <div>true faces nalezeno: <b>{scanLog.detected}</b></div>
          <div>celkem features evaluováno: <b>{scanLog.totalCost}</b> vs. naive {scanLog.checked * naive} → úspora <b style={{ color: "rgb(64,192,87)" }}>{savings.toFixed(1)}%</b></div>
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Cascade structure rejects většinu non-face oken v <b>stage 1</b> (3 features) → drahá stage 4 (200 features) se spustí jen pro malé % kandidátů.
        To dělá Viola-Jones (2001) real-time na CPU. Moderní detektory (MTCNN, RetinaFace) používají CNN ale stejný princip "cascade of classifiers".
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
