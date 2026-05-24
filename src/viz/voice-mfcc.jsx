// Voice MFCC: waveform → window → FFT magnitude → mel filterbank → log → DCT → MFCC vector.
// Two speakers; compare MFCC sequences as heatmap.
import { useMemo, useState } from "react";

const N_FRAMES = 30;
const N_MFCC = 13;
const N_MEL = 26;
const FFT_BINS = 32;

function mulberry32(a) { return function() { a |= 0; a = a + 0x6D2B79F5 | 0; var t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// Synthesize speaker-specific spectrum per frame
function synthFrames(seed, vowelEnvelope = "a") {
  const rnd = mulberry32(seed);
  const frames = [];
  // Speaker characteristics: formant frequencies (F1, F2, F3) in normalized FFT bins
  const F1 = seed === 1 ? 5 : 7;
  const F2 = seed === 1 ? 14 : 11;
  const F3 = seed === 1 ? 22 : 19;
  const pitch = seed === 1 ? 4 : 6;

  for (let f = 0; f < N_FRAMES; f++) {
    const spec = new Float32Array(FFT_BINS);
    // pitch harmonics
    for (let k = 1; k <= 8; k++) {
      const bin = Math.min(FFT_BINS - 1, k * pitch + Math.sin(f * 0.3) * 1);
      spec[Math.floor(bin)] += 1 / k;
    }
    // formants
    for (let i = 0; i < FFT_BINS; i++) {
      spec[i] += 0.8 * Math.exp(-((i - F1) ** 2) / 4);
      spec[i] += 0.5 * Math.exp(-((i - F2) ** 2) / 5);
      spec[i] += 0.3 * Math.exp(-((i - F3) ** 2) / 6);
      // noise
      spec[i] += rnd() * 0.05;
    }
    frames.push(spec);
  }
  return frames;
}

// Mel filterbank: 26 triangular filters
function melBank(spectrum) {
  const out = new Float32Array(N_MEL);
  for (let m = 0; m < N_MEL; m++) {
    const centerBin = ((m + 1) / (N_MEL + 1)) * FFT_BINS;
    const width = FFT_BINS / N_MEL * 1.5;
    let sum = 0;
    for (let i = 0; i < FFT_BINS; i++) {
      const tri = Math.max(0, 1 - Math.abs(i - centerBin) / width);
      sum += spectrum[i] * tri;
    }
    out[m] = Math.log(sum + 1e-6);
  }
  return out;
}

// DCT-II: first N_MFCC coefficients
function dct(input) {
  const N = input.length;
  const out = new Float32Array(N_MFCC);
  for (let k = 0; k < N_MFCC; k++) {
    let sum = 0;
    for (let n = 0; n < N; n++) sum += input[n] * Math.cos(Math.PI * k * (n + 0.5) / N);
    out[k] = sum * Math.sqrt(2 / N);
  }
  return out;
}

function mfccFrame(spectrum) {
  return dct(melBank(spectrum));
}

export default function VoiceMfcc() {
  const [speakerA, setSpeakerA] = useState(1);
  const [speakerB, setSpeakerB] = useState(2);
  const [frame, setFrame] = useState(15);

  const framesA = useMemo(() => synthFrames(speakerA), [speakerA]);
  const framesB = useMemo(() => synthFrames(speakerB), [speakerB]);

  const mfccA = useMemo(() => framesA.map(mfccFrame), [framesA]);
  const mfccB = useMemo(() => framesB.map(mfccFrame), [framesB]);

  // Cosine distance between mean MFCC vectors
  function meanVec(seq) {
    const out = new Float32Array(N_MFCC);
    for (const f of seq) for (let i = 0; i < N_MFCC; i++) out[i] += f[i];
    for (let i = 0; i < N_MFCC; i++) out[i] /= seq.length;
    return out;
  }
  const mA = meanVec(mfccA), mB = meanVec(mfccB);
  let dot = 0, nA = 0, nB = 0;
  for (let i = 0; i < N_MFCC; i++) { dot += mA[i] * mB[i]; nA += mA[i] ** 2; nB += mB[i] ** 2; }
  const cosSim = dot / (Math.sqrt(nA) * Math.sqrt(nB));

  // Heatmap render
  function heat(mfccSeq, W, H) {
    const cells = [];
    // Normalize across the displayed sequence for visibility
    let lo = Infinity, hi = -Infinity;
    for (const f of mfccSeq) for (const v of f) { if (v < lo) lo = v; if (v > hi) hi = v; }
    const range = hi - lo + 1e-9;
    for (let f = 0; f < mfccSeq.length; f++) for (let k = 0; k < N_MFCC; k++) {
      const v = (mfccSeq[f][k] - lo) / range;
      const c = Math.round(v * 255);
      const fill = v > 0.5 ? `rgb(${255 - c},${100 + c/2},${50})` : `rgb(${20 + c},${20 + c},${100 + c})`;
      cells.push(<rect key={`${f}-${k}`} x={f * W / N_FRAMES} y={k * H / N_MFCC} width={W / N_FRAMES + 0.5} height={H / N_MFCC + 0.5} fill={fill} />);
    }
    return cells;
  }

  const W = 300, H = 110;

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>speaker A:</label>
        <select value={speakerA} onChange={(e) => setSpeakerA(parseInt(e.target.value))} style={sel}>
          <option value="1">Alice</option><option value="2">Bob</option><option value="3">Carol</option>
        </select>
        <label style={lbl}>speaker B:</label>
        <select value={speakerB} onChange={(e) => setSpeakerB(parseInt(e.target.value))} style={sel}>
          <option value="1">Alice</option><option value="2">Bob</option><option value="3">Carol</option>
        </select>
        <label style={lbl}>frame = {frame}</label>
        <input type="range" min="0" max={N_FRAMES - 1} value={frame} onChange={(e) => setFrame(parseInt(e.target.value))} />
      </div>

      {/* Pipeline visualization for current frame */}
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>frame {frame} pipeline (speaker A):</div>
        <svg viewBox="0 0 540 80" style={{ width: "100%" }}>
          {/* spectrum */}
          {framesA[frame].map((v, i) => (
            <rect key={i} x={20 + i * 4} y={70 - v * 35} width="3" height={v * 35} fill="rgb(80,140,220)" />
          ))}
          <text x={20} y={12} fontSize="10" fill="rgb(80,140,220)">|FFT|² (32 bins)</text>
          <text x={155} y={45} fontSize="14" fill="var(--text-muted)">→</text>
          {/* mel */}
          {melBank(framesA[frame]).map((v, i) => (
            <rect key={i} x={180 + i * 5} y={70 + Math.min(v, 0) * 7} width="4" height={Math.abs(Math.min(v, 0)) * 7 + 2} fill="rgb(64,192,87)" />
          ))}
          <text x={180} y={12} fontSize="10" fill="rgb(64,192,87)">log mel (26 filters)</text>
          <text x={320} y={45} fontSize="14" fill="var(--text-muted)">→</text>
          {/* mfcc */}
          {mfccA[frame].map((v, i) => (
            <rect key={i} x={345 + i * 10} y={45 - v * 12} width="8" height={Math.abs(v) * 12 + 1} fill={v > 0 ? "rgb(220,140,80)" : "rgb(220,80,80)"} />
          ))}
          <text x={345} y={12} fontSize="10" fill="rgb(220,140,80)">MFCC (13 coeffs)</text>
        </svg>
      </div>

      {/* Heatmaps */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <div style={panelTitle}>speaker A MFCC sequence</div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "#000", borderRadius: 4 }}>
            {heat(mfccA, W, H)}
            <line x1={frame * W / N_FRAMES} y1={0} x2={frame * W / N_FRAMES} y2={H} stroke="rgb(255,200,0)" strokeWidth="1" strokeDasharray="2 1" />
          </svg>
        </div>
        <div>
          <div style={panelTitle}>speaker B MFCC sequence</div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "#000", borderRadius: 4 }}>
            {heat(mfccB, W, H)}
            <line x1={frame * W / N_FRAMES} y1={0} x2={frame * W / N_FRAMES} y2={H} stroke="rgb(255,200,0)" strokeWidth="1" strokeDasharray="2 1" />
          </svg>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={statBox}>
          <div style={statLbl}>cos. podobnost mean MFCC</div>
          <div style={{ ...statVal, color: cosSim > 0.85 ? "rgb(64,192,87)" : "rgb(220,80,80)" }}>{cosSim.toFixed(3)}</div>
        </div>
        <div style={statBox}>
          <div style={statLbl}>verdikt (threshold 0.85)</div>
          <div style={{ ...statVal, color: cosSim > 0.85 ? "rgb(64,192,87)" : "rgb(220,80,80)" }}>{cosSim > 0.85 ? "SAME" : "DIFFERENT"}</div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Pipeline: 25ms okno → FFT → magnitude² → mel filterbank (26 triangulárních filtrů na perceptuální škále) → log → DCT (dekorelace) → 13 MFCC.
        Stejný speaker dává podobné MFCC sekvence (heatmap má stejný "vzor"); jiný speaker = jiné formant frekvence (různá distribuce energie po koeficientech).
        Moderní systémy nahrazují raw MFCC <b>x-vektory</b> (TDNN embedding) — vyšší přesnost, ale stejný princip.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const panelTitle = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 4 };
const statBox = { background: "var(--bg-inset)", padding: 10, borderRadius: 6, textAlign: "center" };
const statLbl = { fontSize: 10, color: "var(--text-muted)" };
const statVal = { fontSize: 16, fontWeight: 600, fontFamily: "var(--font-mono)", marginTop: 4 };
