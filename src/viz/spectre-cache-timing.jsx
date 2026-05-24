// spectre-cache-timing — Train branch predictor, trigger OOB speculative load,
// FLUSH+RELOAD cache → timing histogram reveals leaked byte.
import { useState } from "react";

// Secret byte to leak
const SECRET = 0x41; // 'A'

const STEPS = [
  { id: 0, label: "init", desc: "secret v kernel memory, array2 256 cache lines (one per possible byte value)" },
  { id: 1, label: "train", desc: "krát 5: zavolat victim s in-bounds x → BHT predikuje 'in-bounds'" },
  { id: 2, label: "exploit", desc: "zavolat s x out-of-bounds; CPU spekulativně načte array1[x] = SECRET" },
  { id: 3, label: "speculation", desc: "spekulativně načti array2[SECRET * 256] → cache line touched" },
  { id: 4, label: "squash", desc: "branch resolved out-of-bounds; results discarded, ALE cache effect zůstává" },
  { id: 5, label: "probe", desc: "FLUSH+RELOAD: měř load time pro array2[i*256], i=0..255 → fast = leaked byte" },
];

export default function SpectreCacheTiming() {
  const [step, setStep] = useState(0);

  // Cache state: which indices are in cache.
  const cached = step >= 3 ? new Set([SECRET]) : new Set();
  // Probe results visible only at step 5+
  const showProbe = step >= 5;

  const W = 580, H = 250;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", alignItems: "center", fontSize: 11 }}>
        <button onClick={() => setStep(Math.max(0, step - 1))} style={btn(false)}>‹ back</button>
        <button onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} style={btn(false)}>step ›</button>
        <button onClick={() => setStep(0)} style={btn(false)}>reset</button>
        <span style={{ marginLeft: 6, fontFamily: "ui-monospace, monospace" }}>
          step {step + 1}/{STEPS.length}: <b>{STEPS[step].label}</b>
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* Code box */}
        <rect x={20} y={20} width={W - 40} height={70} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
        <g fontFamily="ui-monospace, monospace" fontSize="10.5">
          <text x={30} y={38} fill="var(--text-muted)">// gadget v jádře (přístupné syscallem)</text>
          <text x={30} y={52} fill="var(--text)">if (x &lt; array1_size) &#123;</text>
          <text x={40} y={66} fill={step >= 2 ? "oklch(0.65 0.18 22)" : "var(--text)"}>
            y = array2[array1[x] * 256];
          </text>
          <text x={30} y={80} fill="var(--text)">&#125;</text>
        </g>

        {/* Cache 256 lines */}
        <text x={20} y={108} fontSize="10" fontWeight="600" fill="var(--text)">array2 cache lines (256, one per byte value):</text>
        {Array.from({ length: 32 }).map((_, i) => {
          const idx = i * 8;
          const inCache = Array.from(cached).some(c => Math.floor(c / 8) === i);
          return (
            <rect key={i} x={20 + i * 17} y={115} width="14" height="14"
              fill={inCache ? "oklch(0.65 0.18 22)" : "var(--bg-inset)"}
              stroke="var(--line)" opacity={inCache ? 0.9 : 0.5} />
          );
        })}
        <text x={20} y={144} fontSize="8.5" fill="var(--text-muted)">index 0…255 (shown in groups of 8)</text>

        {/* Probe histogram */}
        {showProbe && (
          <>
            <text x={20} y={170} fontSize="10" fontWeight="600" fill="var(--text)">FLUSH+RELOAD timings (ns):</text>
            {Array.from({ length: 32 }).map((_, i) => {
              const isHit = Math.floor(SECRET / 8) === i;
              const t = isHit ? 4 : 250;
              const h = Math.min(40, t / 8);
              return (
                <g key={i}>
                  <rect x={20 + i * 17} y={215 - h} width="14" height={h}
                    fill={isHit ? "oklch(0.65 0.18 22)" : "oklch(0.65 0.16 245 / 0.5)"}
                    stroke="var(--line)" strokeWidth="0.3" />
                  {isHit && <text x={27 + i * 17} y={232} fontSize="9" fill="oklch(0.65 0.18 22)" fontWeight="700">↑</text>}
                </g>
              );
            })}
            <text x={20 + Math.floor(SECRET / 8) * 17 - 5} y={244} fontSize="9" fontWeight="600" fill="oklch(0.65 0.18 22)">
              leak: byte = 0x{SECRET.toString(16).toUpperCase()} ('A')
            </text>
          </>
        )}
        {!showProbe && step >= 1 && (
          <text x={W / 2} y={210} textAnchor="middle" fontSize="10.5" fill="var(--text-muted)">{STEPS[step].desc}</text>
        )}
        {step === 0 && (
          <text x={W / 2} y={195} textAnchor="middle" fontSize="10.5" fill="var(--text-muted)">{STEPS[step].desc}</text>
        )}
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        Spectre v1: speculative bounds check bypass. CPU <i>squashne</i> wrong-path výsledky, ale <b>cache stopy</b> zůstávají.
        FLUSH+RELOAD: vyflushuj array2; po experimentu změř, který index loadne rychle → to je leaked secret byte.
      </div>
    </div>
  );
}

function btn(active) {
  return { background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", border: "1px solid var(--line)", padding: "3px 9px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
