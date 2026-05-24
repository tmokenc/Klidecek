// Eigenfaces reconstruction: mean + sum of weighted eigenfaces.
// Show how K cap affects reconstruction quality.
import { useMemo, useState } from "react";

// Synthetic "face" via parametric ellipses + features. We use a fixed grid of pixels.
const GRID = 28;
function mulberry32(a) { return function() { a |= 0; a = a + 0x6D2B79F5 | 0; var t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// Generate mean face: ellipse with darker eyes + mouth
function meanFace() {
  const f = new Float32Array(GRID * GRID);
  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) {
    const dx = (x - GRID / 2) / (GRID / 2), dy = (y - GRID / 2) / (GRID / 2);
    let v = 0.7 - 0.4 * Math.exp(-(dx*dx*1.2 + dy*dy*1.6) * 0.5);
    // eyes
    v -= 0.55 * Math.exp(-((x-9)**2 + (y-11)**2) / 6);
    v -= 0.55 * Math.exp(-((x-18)**2 + (y-11)**2) / 6);
    // mouth
    v -= 0.35 * Math.exp(-((x-13.5)**2 / 12 + (y-19)**2 / 2));
    // nose
    v -= 0.12 * Math.exp(-((x-13.5)**2 + (y-15)**2) / 4);
    f[y * GRID + x] = Math.max(0, Math.min(1, v));
  }
  return f;
}

// Eigenfaces: synthetic basis vectors representing variation modes
function eigenFace(idx) {
  const f = new Float32Array(GRID * GRID);
  const rnd = mulberry32(100 + idx);
  // Different "modes" of variation
  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) {
    const dx = (x - GRID / 2) / (GRID / 2), dy = (y - GRID / 2) / (GRID / 2);
    let v = 0;
    switch (idx) {
      case 0: v = Math.cos(dx * 2) * 0.4; break; // jas (horiz)
      case 1: v = Math.sin(dy * 3) * 0.4; break; // vert lighting
      case 2: v = Math.cos(dx*dy * 6) * 0.3; break; // tvar
      case 3: v = (Math.exp(-((x-9)**2 + (y-11)**2)/6) - Math.exp(-((x-18)**2 + (y-11)**2)/6)) * 0.7; break; // oči asym
      case 4: v = Math.cos(dx*4) * Math.sin(dy*3) * 0.35; break;
      case 5: v = Math.sin((x-y) * 0.3) * 0.3; break;
      default: v = (rnd() - 0.5) * 0.3 * Math.exp(-(dx*dx+dy*dy));
    }
    f[y * GRID + x] = v;
  }
  return f;
}

// Synthetic target faces with known weights
const TARGETS = {
  alice:  { w: [ 0.6,  0.3, -0.2,  0.5, -0.1,  0.2] },
  bob:    { w: [-0.4,  0.5,  0.4, -0.6,  0.2, -0.1] },
  carol:  { w: [ 0.1, -0.3,  0.6,  0.2,  0.5, -0.4] },
};

export default function EigenfacesRecon() {
  const [target, setTarget] = useState("alice");
  const [K, setK] = useState(6);
  const [showResidual, setShowResidual] = useState(false);
  const [weights, setWeights] = useState(TARGETS.alice.w.slice());

  const m = useMemo(() => meanFace(), []);
  const E = useMemo(() => [0, 1, 2, 3, 4, 5].map(eigenFace), []);

  // Build target = mean + sum weights * eigen
  const targetWeights = TARGETS[target].w;
  const reconstructed = useMemo(() => {
    const f = new Float32Array(GRID * GRID);
    for (let i = 0; i < f.length; i++) {
      let v = m[i];
      for (let k = 0; k < K; k++) v += weights[k] * E[k][i];
      f[i] = Math.max(0, Math.min(1, v));
    }
    return f;
  }, [K, weights, m, E]);

  const trueTarget = useMemo(() => {
    const f = new Float32Array(GRID * GRID);
    for (let i = 0; i < f.length; i++) {
      let v = m[i];
      for (let k = 0; k < targetWeights.length; k++) v += targetWeights[k] * E[k][i];
      f[i] = Math.max(0, Math.min(1, v));
    }
    return f;
  }, [targetWeights, m, E]);

  // L2 reconstruction error
  const mse = useMemo(() => {
    let e = 0;
    for (let i = 0; i < reconstructed.length; i++) e += (reconstructed[i] - trueTarget[i]) ** 2;
    return Math.sqrt(e / reconstructed.length);
  }, [reconstructed, trueTarget]);

  function autoProject() {
    // "Project" target onto first K eigenfaces: <target - mean, E_k>
    const w = [];
    for (let k = 0; k < 6; k++) {
      let dot = 0;
      for (let i = 0; i < m.length; i++) dot += (trueTarget[i] - m[i]) * E[k][i];
      let norm = 0;
      for (let i = 0; i < m.length; i++) norm += E[k][i] * E[k][i];
      w.push(dot / norm);
    }
    setWeights(w);
  }

  function reset() { setWeights(targetWeights.slice()); }

  function renderFace(data, size = 100, showSigned = false) {
    const cells = [];
    for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) {
      const v = data[y * GRID + x];
      let color;
      if (showSigned) {
        const c = Math.round(127 + v * 200);
        color = v > 0 ? `rgb(${c},${c-30},${c-60})` : `rgb(${c+50},${c+30},${c-30})`;
        const gray = Math.round(Math.max(0, Math.min(255, 127 + v * 280)));
        color = `rgb(${gray},${gray},${gray})`;
      } else {
        const c = Math.round(Math.max(0, Math.min(255, v * 255)));
        color = `rgb(${c},${c},${c})`;
      }
      cells.push(<rect key={y*GRID+x} x={x * (size/GRID)} y={y * (size/GRID)} width={size/GRID + 0.5} height={size/GRID + 0.5} fill={color} />);
    }
    return <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size, background: "#000" }}>{cells}</svg>;
  }

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>target:</label>
        <select value={target} onChange={(e) => { setTarget(e.target.value); setWeights(TARGETS[e.target.value].w.slice()); }} style={sel}>
          <option value="alice">Alice</option>
          <option value="bob">Bob</option>
          <option value="carol">Carol</option>
        </select>
        <label style={lbl}>K = {K}</label>
        <input type="range" min="0" max="6" value={K} onChange={(e) => setK(parseInt(e.target.value))} />
        <button style={btn} onClick={autoProject}>auto-projekce</button>
        <button style={btn} onClick={reset}>reset</button>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={panel}>
          <div style={panelTitle}>target</div>
          {renderFace(trueTarget, 96)}
        </div>
        <div style={panel}>
          <div style={panelTitle}>μ (mean)</div>
          {renderFace(m, 96)}
        </div>
        <div style={{ fontSize: 18, alignSelf: "center", color: "var(--text-muted)" }}>+</div>
        {E.slice(0, K).map((e, i) => (
          <div key={i} style={panel}>
            <div style={panelTitle}>w<sub>{i+1}</sub> · u<sub>{i+1}</sub></div>
            {renderFace(e.map(v => 0.5 + v * weights[i]), 64, true)}
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginTop: 2 }}>w = {weights[i].toFixed(2)}</div>
          </div>
        ))}
        <div style={{ fontSize: 18, alignSelf: "center", color: "var(--text-muted)" }}>=</div>
        <div style={panel}>
          <div style={panelTitle}>reconstruction</div>
          {renderFace(reconstructed, 96)}
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginTop: 2 }}>RMSE = {mse.toFixed(3)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
        {weights.map((w, i) => (
          <div key={i} style={{ background: "var(--bg-inset)", padding: 6, borderRadius: 4, opacity: i < K ? 1 : 0.3 }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>w<sub>{i+1}</sub></div>
            <input type="range" min="-1" max="1" step="0.05" value={w} disabled={i >= K} onChange={(e) => { const arr = weights.slice(); arr[i] = parseFloat(e.target.value); setWeights(arr); }} style={{ width: "100%" }} />
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}>{w.toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        K = 0 → jen průměrný obličej (žádná individualita).
        K = 6 → plná rekonstrukce v této syntetické bázi.
        "Auto-projekce" spočte optimální váhy w<sub>k</sub> = &lt;target − μ, u<sub>k</sub>&gt; — to je PCA encoding.
        V reálném systému je K ≈ 50–200 (z ~10 000 pixelů), embedding pak slouží k porovnání obličejů.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const panel = { background: "var(--bg-inset)", padding: 6, borderRadius: 6, textAlign: "center" };
const panelTitle = { fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 3 };
