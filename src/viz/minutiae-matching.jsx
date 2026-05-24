// Minutia matching with translation + rotation.
// Compares template T with probe I; tolerance circle per minutia; live N²/(|T||I|) score.
import { useMemo, useState } from "react";

const TOL_XY = 14, TOL_TH = 18;

// Two preset patterns (template + ground-truth aligned probe)
function genBase(seed) {
  const rnd = mulberry32(seed);
  const pts = [];
  for (let i = 0; i < 24; i++) {
    pts.push({
      x: 40 + rnd() * 200,
      y: 30 + rnd() * 160,
      t: rnd() < 0.55 ? "end" : "bif",
      theta: rnd() * 360,
    });
  }
  return pts;
}
function mulberry32(a) { return function() { a |= 0; a = a + 0x6D2B79F5 | 0; var t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const TEMPLATE = genBase(2);
// "Same finger different capture": same points + noise + missing/extra
const PROBE = (() => {
  const rnd = mulberry32(11);
  const out = [];
  for (const p of TEMPLATE) {
    if (rnd() < 0.2) continue; // missing
    out.push({ x: p.x + (rnd() - 0.5) * 6, y: p.y + (rnd() - 0.5) * 6, t: p.t, theta: p.theta + (rnd() - 0.5) * 10 });
  }
  // a few extra
  for (let i = 0; i < 3; i++) out.push({ x: 40 + rnd() * 200, y: 30 + rnd() * 160, t: rnd() < 0.5 ? "end" : "bif", theta: rnd() * 360 });
  return out;
})();
// Impostor probe = totally different fingerprint
const IMPOSTOR = genBase(99);

export default function MinutiaeMatching() {
  const [scenario, setScenario] = useState("genuine");
  const [tx, setTx] = useState(60);
  const [ty, setTy] = useState(40);
  const [rot, setRot] = useState(15); // initial misalignment
  const probe = scenario === "genuine" ? PROBE : IMPOSTOR;

  // Apply transform (translate + rotate around center of probe canvas)
  const cx = 140, cy = 110;
  const cosR = Math.cos(rot * Math.PI / 180);
  const sinR = Math.sin(rot * Math.PI / 180);
  const transformed = useMemo(() => probe.map((p) => {
    const dx = p.x - cx, dy = p.y - cy;
    return {
      x: cx + dx * cosR - dy * sinR + tx,
      y: cy + dx * sinR + dy * cosR + ty,
      t: p.t,
      theta: (p.theta + rot) % 360,
    };
  }), [probe, tx, ty, rot, cosR, sinR]);

  // Pair greedy: for each template, find nearest probe within tolerance
  const matches = useMemo(() => {
    const matchedProbe = new Set();
    const m = [];
    for (let i = 0; i < TEMPLATE.length; i++) {
      const t = TEMPLATE[i];
      let best = -1, bestD = TOL_XY;
      for (let j = 0; j < transformed.length; j++) {
        if (matchedProbe.has(j)) continue;
        const p = transformed[j];
        const dx = p.x - (t.x + 250); // template drawn shifted right
        // Wait — actually we'll draw both in same coords; compute distance directly
      }
      // (real distance below)
      for (let j = 0; j < transformed.length; j++) {
        if (matchedProbe.has(j)) continue;
        const p = transformed[j];
        const dx = p.x - t.x, dy = p.y - t.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const dt = Math.abs(((p.theta - t.theta + 540) % 360) - 180);
        if (d < bestD && dt < TOL_TH && p.t === t.t) { bestD = d; best = j; }
      }
      if (best >= 0) { matchedProbe.add(best); m.push({ tIdx: i, pIdx: best }); }
    }
    return m;
  }, [transformed]);

  const N = matches.length;
  const score = (N * N) / (TEMPLATE.length * transformed.length);

  function autoAlign() {
    // Random restart-ish grid search for best alignment
    let best = { tx, ty, rot, n: matches.length };
    for (let rr = -30; rr <= 30; rr += 5) {
      const cR = Math.cos(rr * Math.PI / 180), sR = Math.sin(rr * Math.PI / 180);
      for (let xx = -60; xx <= 60; xx += 8) {
        for (let yy = -40; yy <= 40; yy += 8) {
          // count matches under (xx, yy, rr)
          const tp = probe.map((p) => ({
            x: cx + (p.x - cx) * cR - (p.y - cy) * sR + xx,
            y: cy + (p.x - cx) * sR + (p.y - cy) * cR + yy,
            t: p.t,
            theta: (p.theta + rr) % 360,
          }));
          const used = new Set();
          let n = 0;
          for (const t of TEMPLATE) {
            let bd = TOL_XY, bj = -1;
            for (let j = 0; j < tp.length; j++) {
              if (used.has(j)) continue;
              const dx = tp[j].x - t.x, dy = tp[j].y - t.y;
              const d = Math.sqrt(dx * dx + dy * dy);
              const dt = Math.abs(((tp[j].theta - t.theta + 540) % 360) - 180);
              if (d < bd && dt < TOL_TH && tp[j].t === t.t) { bd = d; bj = j; }
            }
            if (bj >= 0) { used.add(bj); n++; }
          }
          if (n > best.n) best = { tx: xx, ty: yy, rot: rr, n };
        }
      }
    }
    setTx(best.tx); setTy(best.ty); setRot(best.rot);
  }

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>scénář:</label>
        <select value={scenario} onChange={(e) => { setScenario(e.target.value); setTx(60); setTy(40); setRot(15); }} style={sel}>
          <option value="genuine">genuine (stejný prst, jiný snímek)</option>
          <option value="impostor">impostor (jiný prst)</option>
        </select>
        <button style={btn} onClick={autoAlign}>auto-align (grid RANSAC)</button>
        <button style={btn} onClick={() => { setTx(0); setTy(0); setRot(0); }}>0/0/0</button>
      </div>

      <svg viewBox="0 0 280 230" style={{ width: "100%", maxWidth: 600, background: "var(--bg-inset)", borderRadius: 6 }}>
        {/* template minutiae */}
        {TEMPLATE.map((p, i) => (
          <g key={`t${i}`}>
            <circle cx={p.x} cy={p.y} r={TOL_XY} fill="none" stroke="rgba(64,192,87,0.18)" strokeDasharray="2 2" />
            {p.t === "end" ? (
              <circle cx={p.x} cy={p.y} r="3.5" fill="rgb(64,192,87)" />
            ) : (
              <rect x={p.x - 3} y={p.y - 3} width="6" height="6" fill="rgb(64,192,87)" />
            )}
            <line x1={p.x} y1={p.y} x2={p.x + 9 * Math.cos(p.theta * Math.PI / 180)} y2={p.y + 9 * Math.sin(p.theta * Math.PI / 180)} stroke="rgb(64,192,87)" strokeWidth="1" />
          </g>
        ))}
        {/* probe minutiae (transformed) */}
        {transformed.map((p, i) => (
          <g key={`p${i}`}>
            {p.t === "end" ? (
              <circle cx={p.x} cy={p.y} r="3.5" fill="rgb(220,80,80)" opacity="0.85" />
            ) : (
              <rect x={p.x - 3} y={p.y - 3} width="6" height="6" fill="rgb(220,80,80)" opacity="0.85" />
            )}
            <line x1={p.x} y1={p.y} x2={p.x + 9 * Math.cos(p.theta * Math.PI / 180)} y2={p.y + 9 * Math.sin(p.theta * Math.PI / 180)} stroke="rgb(220,80,80)" strokeWidth="1" opacity="0.85" />
          </g>
        ))}
        {/* match lines */}
        {matches.map((m, i) => (
          <line key={i} x1={TEMPLATE[m.tIdx].x} y1={TEMPLATE[m.tIdx].y} x2={transformed[m.pIdx].x} y2={transformed[m.pIdx].y} stroke="var(--accent)" strokeWidth="1.5" />
        ))}
        <text x={8} y={14} fontSize="10" fill="rgb(64,192,87)">● template (kruh = ridge end, čtverec = bifurcation)</text>
        <text x={8} y={26} fontSize="10" fill="rgb(220,80,80)">● probe</text>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <div>
          <label style={lbl}>tx = {tx}</label>
          <input type="range" min="-60" max="60" value={tx} onChange={(e) => setTx(parseInt(e.target.value))} style={{ width: "100%" }} />
        </div>
        <div>
          <label style={lbl}>ty = {ty}</label>
          <input type="range" min="-40" max="40" value={ty} onChange={(e) => setTy(parseInt(e.target.value))} style={{ width: "100%" }} />
        </div>
        <div>
          <label style={lbl}>rot = {rot}°</label>
          <input type="range" min="-30" max="30" value={rot} onChange={(e) => setRot(parseInt(e.target.value))} style={{ width: "100%" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <div style={statBox}><div style={statLbl}>matches</div><div style={statVal}>{N} / {TEMPLATE.length}</div></div>
        <div style={statBox}><div style={statLbl}>|T|, |I|</div><div style={statVal}>{TEMPLATE.length}, {transformed.length}</div></div>
        <div style={statBox}><div style={statLbl}>score N²/(|T|·|I|)</div><div style={{ ...statVal, color: score > 0.3 ? "rgb(64,192,87)" : "rgb(220,80,80)" }}>{score.toFixed(3)}</div></div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Threshold ≈ 0.30–0.50 v praxi. Genuine probe po správné registraci dosáhne N ≥ 12 (forenzní pravidlo).
        Tolerance: ±{TOL_XY} px polohy, ±{TOL_TH}° orientace, shoda typu (ridge ending / bifurcation).
        Auto-align dělá hrubý grid search; reálné AFIS používá RANSAC / Hough.
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
const statVal = { fontSize: 16, fontWeight: 600, fontFamily: "var(--font-mono)", marginTop: 4 };
