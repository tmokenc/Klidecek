// Gabor filter for fingerprint enhancement.
// Sliders for theta (orientation) and freq; apply to a noisy ridge patch.
import { useMemo, useState } from "react";

const SZ = 64; // image patch size

function mulberry32(a) { return function() { a |= 0; a = a + 0x6D2B79F5 | 0; var t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// Generate a noisy ridge image with given orientation
function genRidges(ridgeOrient, ridgeFreq, noise) {
  const img = new Float32Array(SZ * SZ);
  const rnd = mulberry32(7);
  const ct = Math.cos(ridgeOrient), st = Math.sin(ridgeOrient);
  for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) {
    const xp = (x - SZ/2) * ct + (y - SZ/2) * st;
    let v = 0.5 + 0.4 * Math.sin(xp * ridgeFreq * 2 * Math.PI);
    v += (rnd() - 0.5) * noise * 2;
    img[y * SZ + x] = Math.max(0, Math.min(1, v));
  }
  return img;
}

// Build 2D Gabor kernel
function gaborKernel(size, theta, freq, sigma) {
  const k = new Float32Array(size * size);
  const ct = Math.cos(theta), st = Math.sin(theta);
  const half = (size - 1) / 2;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const dx = x - half, dy = y - half;
    const xp = dx * ct + dy * st;
    const yp = -dx * st + dy * ct;
    const env = Math.exp(-(xp*xp + yp*yp) / (2 * sigma * sigma));
    const carrier = Math.cos(2 * Math.PI * freq * xp);
    k[y * size + x] = env * carrier;
  }
  return k;
}

function convolve(img, kernel, ksize) {
  const out = new Float32Array(SZ * SZ);
  const half = Math.floor(ksize / 2);
  for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) {
    let sum = 0;
    for (let ky = 0; ky < ksize; ky++) for (let kx = 0; kx < ksize; kx++) {
      const ix = Math.max(0, Math.min(SZ - 1, x + kx - half));
      const iy = Math.max(0, Math.min(SZ - 1, y + ky - half));
      sum += img[iy * SZ + ix] * kernel[ky * ksize + kx];
    }
    out[y * SZ + x] = sum;
  }
  return out;
}

function renderImage(data, size, normalize = false) {
  // normalize range
  let lo = Infinity, hi = -Infinity;
  for (const v of data) { if (v < lo) lo = v; if (v > hi) hi = v; }
  const cells = [];
  for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) {
    const v = data[y * SZ + x];
    const nv = normalize ? (v - lo) / (hi - lo + 1e-9) : Math.max(0, Math.min(1, v));
    const c = Math.round(nv * 255);
    cells.push(<rect key={y*SZ+x} x={x * size / SZ} y={y * size / SZ} width={size/SZ + 0.2} height={size/SZ + 0.2} fill={`rgb(${c},${c},${c})`} />);
  }
  return cells;
}

export default function GaborRidgeEnhance() {
  const [ridgeAngle, setRidgeAngle] = useState(45);
  const [noise, setNoise] = useState(0.4);
  const [gaborAngle, setGaborAngle] = useState(45);
  const [gaborFreq, setGaborFreq] = useState(0.15);
  const [showKernel, setShowKernel] = useState(true);

  const ridgeOrient = ridgeAngle * Math.PI / 180;
  const gaborOrient = gaborAngle * Math.PI / 180;
  const ridgeFreq = 0.15;

  const noisy = useMemo(() => genRidges(ridgeOrient, ridgeFreq, noise), [ridgeOrient, noise]);
  const kernel = useMemo(() => gaborKernel(15, gaborOrient, gaborFreq, 3.5), [gaborOrient, gaborFreq]);
  const enhanced = useMemo(() => convolve(noisy, kernel, 15), [noisy, kernel]);

  const SZP = 140; // SVG patch size

  // Energy ratio = how much signal vs noise the filter passed
  let signalE = 0, noiseE = 0;
  for (const v of enhanced) { signalE += v * v; }

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>orientace hřebenů: {ridgeAngle}°</label>
        <input type="range" min="0" max="180" value={ridgeAngle} onChange={(e) => setRidgeAngle(parseInt(e.target.value))} />
        <label style={lbl}>šum: {noise.toFixed(2)}</label>
        <input type="range" min="0" max="1" step="0.05" value={noise} onChange={(e) => setNoise(parseFloat(e.target.value))} />
      </div>

      <div style={row}>
        <label style={lbl}>Gabor θ: {gaborAngle}°</label>
        <input type="range" min="0" max="180" value={gaborAngle} onChange={(e) => setGaborAngle(parseInt(e.target.value))} />
        <label style={lbl}>Gabor f: {gaborFreq.toFixed(2)}</label>
        <input type="range" min="0.05" max="0.3" step="0.01" value={gaborFreq} onChange={(e) => setGaborFreq(parseFloat(e.target.value))} />
        <button style={btn} onClick={() => { setGaborAngle(ridgeAngle); setGaborFreq(ridgeFreq); }}>match k hřebenům</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <div style={panel}>
          <div style={panelTitle}>input — noisy ridges</div>
          <svg viewBox={`0 0 ${SZP} ${SZP}`} style={{ width: "100%", maxWidth: 180, background: "#000" }}>{renderImage(noisy, SZP)}</svg>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, fontFamily: "var(--font-mono)" }}>θ={ridgeAngle}° f={ridgeFreq.toFixed(2)}</div>
        </div>
        <div style={panel}>
          <div style={panelTitle}>Gabor kernel (15×15)</div>
          <svg viewBox="0 0 140 140" style={{ width: "100%", maxWidth: 180, background: "#000" }}>
            {showKernel && Array.from({ length: 15 }).map((_, ky) => Array.from({ length: 15 }).map((_, kx) => {
              const v = kernel[ky * 15 + kx];
              const nv = (v + 1) / 2;
              const c = Math.round(Math.max(0, Math.min(255, nv * 255)));
              return <rect key={`${kx}-${ky}`} x={kx * 140/15} y={ky * 140/15} width={140/15 + 0.5} height={140/15 + 0.5} fill={`rgb(${c},${c},${c})`} />;
            }))}
          </svg>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, fontFamily: "var(--font-mono)" }}>G(x,y) = e^{`{-(x²+y²)/2σ²}`} · cos(2πfx')</div>
        </div>
        <div style={panel}>
          <div style={panelTitle}>výsledek konvoluce</div>
          <svg viewBox={`0 0 ${SZP} ${SZP}`} style={{ width: "100%", maxWidth: 180, background: "#000" }}>{renderImage(enhanced, SZP, true)}</svg>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, fontFamily: "var(--font-mono)" }}>energie: {signalE.toFixed(1)}</div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Gabor filter je <b>směrový bandpass</b>: pásmo frekvence f, orientace θ.
        Když Gabor θ ≈ ridge θ a Gabor f ≈ ridge f, filter <b>maximálně zesílí signál</b> a potlačí šum → ostré hřebeny.
        AFIS odhaduje lokální θ a f z gradientů a aplikuje příslušný Gabor v každém regionu → tzv. "directional filtering".
        Když θ neodpovídá, výstup je rozmazaný / nulový.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const panel = { background: "var(--bg-inset)", padding: 8, borderRadius: 6, textAlign: "center" };
const panelTitle = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 4 };
