// Deepfake detection: confidence over a video timeline with multiple signal channels.
// Toggle channels (blink, lip-sync, rPPG, freq); cross-domain drop simulation.
import { useState } from "react";

const FRAMES = 40;

// Build per-frame signals for "real" vs "fake (in-domain)" vs "fake (cross-domain)"
function mulberry32(a) { return function() { a |= 0; a = a + 0x6D2B79F5 | 0; var t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const CHANNELS = {
  blink:   { label: "blink rate",  color: "rgb(64,192,87)",  weight: 0.20 },
  lipsync: { label: "lip sync",    color: "rgb(220,140,80)", weight: 0.30 },
  rppg:    { label: "rPPG (HR)",   color: "rgb(220,80,80)",  weight: 0.30 },
  freq:    { label: "freq domain", color: "rgb(80,140,220)", weight: 0.20 },
};

function genSignal(scenario, ch, seed) {
  const rnd = mulberry32(seed);
  const out = new Array(FRAMES);
  // Each channel score is "deepfake confidence" (0 = real, 1 = fake)
  let base = 0;
  if (scenario === "real") base = 0.10 + rnd() * 0.10;
  else if (scenario === "deepfake_seen") base = 0.75 + rnd() * 0.10;
  else if (scenario === "deepfake_cross") base = 0.45 + rnd() * 0.15; // cross-domain weakness
  for (let i = 0; i < FRAMES; i++) {
    const noise = (rnd() - 0.5) * 0.15;
    // simulate per-channel quirks
    let v = base + noise;
    if (scenario === "deepfake_seen" && ch === "rppg") v = 0.90; // strong signal: no heartbeat
    if (scenario === "deepfake_cross" && ch === "rppg") v = 0.40; // novel attack mimics rPPG
    if (scenario === "real" && ch === "lipsync") v = 0.05 + rnd() * 0.1;
    out[i] = Math.max(0, Math.min(1, v));
  }
  return out;
}

export default function DeepfakeDetection() {
  const [scenario, setScenario] = useState("deepfake_seen");
  const [enabled, setEnabled] = useState({ blink: true, lipsync: true, rppg: true, freq: true });

  const signals = Object.fromEntries(Object.keys(CHANNELS).map(ch => [ch, genSignal(scenario, ch, scenario.length + ch.length)]));

  // Per-frame fusion = weighted sum of enabled channels
  const fusion = new Array(FRAMES).fill(0);
  let totalW = 0;
  for (const ch of Object.keys(CHANNELS)) if (enabled[ch]) totalW += CHANNELS[ch].weight;
  for (let i = 0; i < FRAMES; i++) {
    let s = 0;
    for (const ch of Object.keys(CHANNELS)) if (enabled[ch]) s += signals[ch][i] * CHANNELS[ch].weight;
    fusion[i] = totalW > 0 ? s / totalW : 0;
  }
  const meanFusion = fusion.reduce((a, b) => a + b, 0) / fusion.length;
  const verdict = meanFusion > 0.5 ? "FAKE" : "REAL";

  const W = 540, H = 200;
  const x2px = (i) => 40 + (i / (FRAMES - 1)) * (W - 60);
  const y2px = (v) => H - 30 - v * (H - 50);

  function path(arr, color) {
    return arr.map((v, i) => `${i === 0 ? "M" : "L"} ${x2px(i).toFixed(1)} ${y2px(v).toFixed(1)}`).join(" ");
  }

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>vstupní video:</label>
        <select value={scenario} onChange={(e) => setScenario(e.target.value)} style={sel}>
          <option value="real">real (skutečný subjekt)</option>
          <option value="deepfake_seen">deepfake — viděný typ (in-domain)</option>
          <option value="deepfake_cross">deepfake — neznámý typ (cross-domain)</option>
        </select>
      </div>

      <div style={row}>
        <span style={lbl}>aktivní signály:</span>
        {Object.entries(CHANNELS).map(([k, v]) => (
          <label key={k} style={{ ...chip, borderColor: enabled[k] ? v.color : "var(--line)", color: enabled[k] ? v.color : "var(--text-muted)" }}>
            <input type="checkbox" checked={enabled[k]} onChange={(e) => setEnabled({ ...enabled, [k]: e.target.checked })} style={{ marginRight: 4 }} />
            {v.label}
          </label>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-inset)", borderRadius: 6 }}>
        <line x1={40} y1={H - 30} x2={W - 20} y2={H - 30} stroke="var(--text-muted)" />
        <line x1={40} y1={20} x2={40} y2={H - 30} stroke="var(--text-muted)" />
        {/* decision threshold */}
        <line x1={40} y1={y2px(0.5)} x2={W - 20} y2={y2px(0.5)} stroke="rgba(220,80,80,0.4)" strokeDasharray="3 2" />
        <text x={W - 25} y={y2px(0.5) - 2} fontSize="9" textAnchor="end" fill="rgba(220,80,80,0.7)">decision threshold 0.5</text>

        {/* per-channel signals */}
        {Object.keys(CHANNELS).map((ch) => enabled[ch] && (
          <path key={ch} d={path(signals[ch], CHANNELS[ch].color)} fill="none" stroke={CHANNELS[ch].color} strokeWidth="1.2" opacity="0.55" />
        ))}
        {/* fusion (bold) */}
        <path d={path(fusion, "var(--accent)")} fill="none" stroke="var(--accent)" strokeWidth="2.5" />

        {/* y labels */}
        {[0, 0.5, 1].map(v => <text key={v} x={32} y={y2px(v) + 3} fontSize="9" textAnchor="end" fill="var(--text-muted)">{v}</text>)}
        <text x={40} y={16} fontSize="10" fill="var(--accent)">─ fusion (vážený součet)</text>
        <text x={W / 2} y={H - 14} fontSize="10" textAnchor="middle" fill="var(--text-muted)">frame index (0–{FRAMES-1})</text>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={statBox}>
          <div style={statLbl}>mean fusion score</div>
          <div style={{ ...statVal, color: meanFusion > 0.5 ? "rgb(220,80,80)" : "rgb(64,192,87)" }}>{meanFusion.toFixed(3)}</div>
        </div>
        <div style={statBox}>
          <div style={statLbl}>verdikt</div>
          <div style={{ ...statVal, color: verdict === "FAKE" ? "rgb(220,80,80)" : "rgb(64,192,87)" }}>{verdict}</div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        <b>In-domain</b> deepfake: detektor vidí silný signál v rPPG (chybí pulsace), lip-sync errors. Mean &gt;0.7 → FAKE.
        <b>Cross-domain</b> (neznámý generátor): signály oslabené, mean ~0.5 → na hraně. Toto je <b>generalization gap</b> — papers reportují drop z 95% accuracy na 60–80% při novém attack type.
        <b>Vypněte signály</b>: čím méně kanálů, tím křehčí detektor — defense in depth platí i tady.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const chip = { padding: "3px 8px", background: "var(--bg-inset)", border: "1px solid", borderRadius: 12, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center" };
const statBox = { background: "var(--bg-inset)", padding: 10, borderRadius: 6, textAlign: "center" };
const statLbl = { fontSize: 10, color: "var(--text-muted)" };
const statVal = { fontSize: 16, fontWeight: 600, fontFamily: "var(--font-mono)", marginTop: 4 };
