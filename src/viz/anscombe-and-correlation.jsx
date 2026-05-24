// anscombe-and-correlation — interactive scatter with live Pearson r,
// Spearman rho, and the four Anscombe quartet datasets.
import { useState } from "react";

const W = 540, H = 320;

// Anscombe quartet — Anscombe, F. J. (1973). All four share:
// mean(x)=9, mean(y)=7.5, var(x)=11, var(y)=4.125, r≈0.816, y=3+0.5x
const ANSCOMBE = {
  I:  [[10,8.04],[8,6.95],[13,7.58],[9,8.81],[11,8.33],[14,9.96],[6,7.24],[4,4.26],[12,10.84],[7,4.82],[5,5.68]],
  II: [[10,9.14],[8,8.14],[13,8.74],[9,8.77],[11,9.26],[14,8.10],[6,6.13],[4,3.10],[12,9.13],[7,7.26],[5,4.74]],
  III:[[10,7.46],[8,6.77],[13,12.74],[9,7.11],[11,7.81],[14,8.84],[6,6.08],[4,5.39],[12,8.15],[7,6.42],[5,5.73]],
  IV: [[8,6.58],[8,5.76],[8,7.71],[8,8.84],[8,8.47],[8,7.04],[8,5.25],[19,12.50],[8,5.56],[8,7.91],[8,6.89]],
};

function rank(arr) {
  const idx = arr.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
  const r = new Array(arr.length);
  for (let i = 0; i < idx.length; ) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) r[idx[k][1]] = avg;
    i = j + 1;
  }
  return r;
}

function stats(data) {
  const n = data.length;
  const xs = data.map(d => d[0]);
  const ys = data.map(d => d[1]);
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let Sxx = 0, Syy = 0, Sxy = 0;
  for (let i = 0; i < n; i++) {
    Sxx += (xs[i] - mx) ** 2;
    Syy += (ys[i] - my) ** 2;
    Sxy += (xs[i] - mx) * (ys[i] - my);
  }
  const r = Sxy / Math.sqrt(Math.max(1e-12, Sxx * Syy));
  const b1 = Sxx > 0 ? Sxy / Sxx : 0;
  const b0 = my - b1 * mx;
  // Spearman
  const rx = rank(xs), ry = rank(ys);
  const mrx = rx.reduce((s, v) => s + v, 0) / n;
  const mry = ry.reduce((s, v) => s + v, 0) / n;
  let Rxx = 0, Ryy = 0, Rxy = 0;
  for (let i = 0; i < n; i++) {
    Rxx += (rx[i] - mrx) ** 2;
    Ryy += (ry[i] - mry) ** 2;
    Rxy += (rx[i] - mrx) * (ry[i] - mry);
  }
  const rho = Rxy / Math.sqrt(Math.max(1e-12, Rxx * Ryy));
  return { r, rho, b0, b1, mx, my, n };
}

export default function AnscombeAndCorrelation() {
  const [data, setData] = useState(ANSCOMBE.I);
  const [drag, setDrag] = useState(null);
  const [preset, setPreset] = useState("I");

  const f = stats(data);

  const PAD_L = 36, PAD_R = 16, PAD_T = 20, PAD_B = 36;
  const PW = W - PAD_L - PAD_R;
  const PH = H - PAD_T - PAD_B;
  const xMin = 0, xMax = 22, yMin = 0, yMax = 14;
  const toX = (x) => PAD_L + ((x - xMin) / (xMax - xMin)) * PW;
  const toY = (y) => PAD_T + PH - ((y - yMin) / (yMax - yMin)) * PH;
  const pxToX = (px) => xMin + (px - PAD_L) / PW * (xMax - xMin);
  const pxToY = (py) => yMax - (py - PAD_T) / PH * (yMax - yMin);

  function onMove(e) {
    if (drag === null) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    const nx = Math.max(xMin, Math.min(xMax, pxToX(px)));
    const ny = Math.max(yMin, Math.min(yMax, pxToY(py)));
    setData(data.map((p, i) => i === drag ? [nx, ny] : p));
  }

  function loadPreset(key) {
    setPreset(key);
    setData(ANSCOMBE[key].map(p => [...p]));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.keys(ANSCOMBE).map(k => (
          <button key={k} onClick={() => loadPreset(k)} style={btn(preset === k)}>Anscombe {k}</button>
        ))}
        <button onClick={() => setData(data.map(([x, y]) => [x, y + (Math.random() - 0.5) * 2]))} style={btn(false)}>jitter y</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4, userSelect: "none", touchAction: "none" }}
        onMouseMove={onMove}
        onMouseUp={() => setDrag(null)}
        onMouseLeave={() => setDrag(null)}>
        <line x1={PAD_L} y1={PAD_T + PH} x2={W - PAD_R} y2={PAD_T + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} stroke="var(--line-strong)" />

        {/* grid */}
        {[4, 8, 12, 16, 20].map(x => (
          <line key={x} x1={toX(x)} y1={PAD_T} x2={toX(x)} y2={PAD_T + PH} stroke="var(--line)" strokeWidth="0.3" strokeDasharray="2 4" />
        ))}
        {[4, 8, 12].map(y => (
          <line key={y} x1={PAD_L} y1={toY(y)} x2={W - PAD_R} y2={toY(y)} stroke="var(--line)" strokeWidth="0.3" strokeDasharray="2 4" />
        ))}
        {/* fit line */}
        <line x1={toX(xMin)} y1={toY(f.b0 + f.b1 * xMin)} x2={toX(xMax)} y2={toY(f.b0 + f.b1 * xMax)}
          stroke="oklch(0.6 0.18 22)" strokeWidth="1.5" />

        {/* points */}
        {data.map(([x, y], i) => (
          <circle key={i} cx={toX(x)} cy={toY(y)} r={6} fill="oklch(0.65 0.16 264)" stroke="var(--text)" strokeWidth="0.5"
            style={{ cursor: "move" }} onMouseDown={() => setDrag(i)} />
        ))}

        {/* axis labels */}
        {[0, 5, 10, 15, 20].map(v => (
          <text key={v} x={toX(v)} y={PAD_T + PH + 12} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">{v}</text>
        ))}
        {[0, 5, 10].map(v => (
          <text key={v} x={PAD_L - 4} y={toY(v) + 3} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">{v}</text>
        ))}
        <text x={W - PAD_R} y={PAD_T + PH + 28} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">x →</text>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, fontFamily: "var(--font-mono)", fontSize: 12 }}>
        <span>Pearson r = <b>{f.r.toFixed(3)}</b></span>
        <span>Spearman ρ = <b>{f.rho.toFixed(3)}</b></span>
        <span>y = {f.b0.toFixed(2)} + {f.b1.toFixed(2)} x</span>
        <span style={{ color: "var(--text-muted)" }}>x̄={f.mx.toFixed(2)} · ȳ={f.my.toFixed(2)}</span>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        Anscombe quartet — all four sets share r=0.816 and y = 3 + 0.5 x. II is quadratic, III has one outlier, IV is one influential point.
        Drag any point to see how r and the fit move.
      </div>
    </div>
  );
}

function btn(active) {
  return {
    fontFamily: "var(--font-mono)", fontSize: 11, padding: "2px 8px",
    background: active ? "var(--accent)" : "var(--bg-inset)",
    color: active ? "var(--bg-card)" : "var(--text)",
    border: "1px solid var(--line-strong)", borderRadius: 3, cursor: "pointer",
  };
}
