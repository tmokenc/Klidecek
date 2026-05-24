// Daugman iris code: pipeline visualization + Hamming distance distributions.
// Stages: localize -> rubber-sheet unwrap -> Gabor demod -> 2048-bit code -> HD match.
import { useMemo, useState } from "react";

const CODE_LEN = 256; // displayed bits (real is 2048; here scaled for SVG legibility)

function mulberry32(a) { return function() { a |= 0; a = a + 0x6D2B79F5 | 0; var t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function genCode(seed) {
  const rnd = mulberry32(seed);
  const b = new Array(CODE_LEN);
  for (let i = 0; i < CODE_LEN; i++) b[i] = rnd() < 0.5 ? 0 : 1;
  return b;
}
function flipBits(code, flipRate, seed) {
  const rnd = mulberry32(seed);
  return code.map((b) => rnd() < flipRate ? 1 - b : b);
}
function hd(a, b) { let n = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++; return n / a.length; }

const ENROLLED = genCode(42);

export default function DaugmanIrisCode() {
  const [stage, setStage] = useState(4);
  const [pupilR, setPupilR] = useState(28);
  const [scenario, setScenario] = useState("genuine"); // genuine | impostor | rotated
  const [shift, setShift] = useState(0);

  const probeCode = useMemo(() => {
    if (scenario === "genuine") return flipBits(ENROLLED, 0.10, 7);
    if (scenario === "impostor") return genCode(199);
    // rotated: circular shift then flip slightly
    const flipped = flipBits(ENROLLED, 0.10, 7);
    return flipped;
  }, [scenario]);

  // Apply shift for rotation handling
  const shifted = useMemo(() => {
    const out = new Array(CODE_LEN);
    for (let i = 0; i < CODE_LEN; i++) out[i] = probeCode[(i + shift + CODE_LEN) % CODE_LEN];
    return out;
  }, [probeCode, shift]);

  const HD = hd(ENROLLED, shifted);
  // For "rotated" scenario, search min HD over shifts
  const minHD = useMemo(() => {
    if (scenario !== "rotated") return HD;
    let best = 1;
    for (let s = -8; s <= 8; s++) {
      const out = new Array(CODE_LEN);
      for (let i = 0; i < CODE_LEN; i++) out[i] = probeCode[(i + s + 32 + CODE_LEN) % CODE_LEN];
      const h = hd(ENROLLED, out);
      if (h < best) best = h;
    }
    return best;
  }, [probeCode, scenario, HD]);

  const W = 540, H = 220;

  const stages = ["1. capture", "2. localizace", "3. rubber sheet", "4. Gabor demod", "5. iris code + HD"];

  return (
    <div style={ctn}>
      <div style={row}>
        {stages.map((s, i) => (
          <button key={i} style={{ ...stageBtn, background: stage === i ? "var(--accent)" : "var(--bg-inset)", color: stage === i ? "#fff" : "var(--text)" }} onClick={() => setStage(i)}>{s}</button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-inset)", borderRadius: 6 }}>
        {stage === 0 && (
          <g>
            <circle cx={140} cy={110} r="80" fill="rgba(170,140,100,0.25)" stroke="var(--accent)" strokeWidth="1" />
            <circle cx={140} cy={110} r="50" fill="rgba(100,140,200,0.4)" stroke="var(--accent)" strokeWidth="1" />
            <circle cx={140} cy={110} r={pupilR} fill="#1a1a1a" stroke="var(--accent)" />
            <text x={300} y={70} fontSize="11" fill="var(--text)">NIR snímek, 640×480</text>
            <text x={300} y={88} fontSize="10" fill="var(--text-muted)">700–900 nm — odhalí vzor i v tmavé duhovce</text>
          </g>
        )}
        {stage === 1 && (
          <g>
            <circle cx={140} cy={110} r="80" fill="rgba(170,140,100,0.2)" />
            <circle cx={140} cy={110} r="50" fill="rgba(100,140,200,0.4)" />
            <circle cx={140} cy={110} r={pupilR} fill="#1a1a1a" />
            <circle cx={140} cy={110} r={pupilR} fill="none" stroke="rgb(220,80,80)" strokeWidth="2" strokeDasharray="3 2" />
            <circle cx={140} cy={110} r="50" fill="none" stroke="rgb(220,80,80)" strokeWidth="2" strokeDasharray="3 2" />
            <text x={300} y={70} fontSize="11" fill="var(--text)">integro-diferenční operátor</text>
            <text x={300} y={88} fontSize="10" fill="var(--text-muted)">hledá r, x₀, y₀ s maximem radiálního gradientu</text>
            <text x={300} y={108} fontSize="10" fill="rgb(220,80,80)">— pupilární hranice (vnitřní)</text>
            <text x={300} y={124} fontSize="10" fill="rgb(220,80,80)">— sklerální hranice (vnější)</text>
          </g>
        )}
        {stage === 2 && (
          <g>
            <g transform="translate(140,110)">
              <circle r="50" fill="rgba(100,140,200,0.4)" />
              <circle r={pupilR} fill="#1a1a1a" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                <line key={a} x1={pupilR * Math.cos(a*Math.PI/180)} y1={pupilR * Math.sin(a*Math.PI/180)} x2={50 * Math.cos(a*Math.PI/180)} y2={50 * Math.sin(a*Math.PI/180)} stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
              ))}
            </g>
            <text x={210} y={106} fontSize="14" fill="var(--accent)">→</text>
            <rect x={230} y={70} width="280" height="80" fill="rgba(100,140,200,0.3)" stroke="var(--accent)" />
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={i} x1={230 + (i+1)/8 * 280} y1={70} x2={230 + (i+1)/8 * 280} y2={150} stroke="rgba(255,255,255,0.2)" />
            ))}
            <text x={370} y={166} fontSize="10" textAnchor="middle" fill="var(--text-muted)">64 × 512 polar (r, θ)</text>
            <text x={370} y={62} fontSize="11" textAnchor="middle" fill="var(--text)">rubber sheet: dilatace pupily se ruší</text>
          </g>
        )}
        {stage === 3 && (
          <g>
            <text x={W/2} y={30} fontSize="11" textAnchor="middle" fill="var(--text)">2D Gabor wavelet — komplexní odezva → 2 bity (sign Re, sign Im)</text>
            {/* gabor kernel sketch */}
            <g transform="translate(120,100)">
              {Array.from({ length: 30 }).map((_, i) => (
                <line key={i} x1={-50 + i * 3.5} y1={-30 * Math.exp(-((i-15)*(i-15))/100) * Math.cos((i-15)*0.6)} x2={-50 + i * 3.5} y2={30 * Math.exp(-((i-15)*(i-15))/100) * Math.cos((i-15)*0.6)} stroke="var(--accent)" strokeWidth="1.5" />
              ))}
            </g>
            <text x={120} y={170} fontSize="10" textAnchor="middle" fill="var(--text-muted)">G(r,θ) = exp(...) · cos(ωθ) − j·sin(ωθ)</text>
            <text x={300} y={100} fontSize="14" fill="var(--accent)">→</text>
            <g transform="translate(380,80)">
              {Array.from({ length: 16 }).map((_, i) => Array.from({ length: 4 }).map((_, j) => (
                <rect key={`${i}-${j}`} x={i * 8} y={j * 16} width="8" height="16" fill={(i * 4 + j) % 2 ? "rgb(64,192,87)" : "rgba(0,0,0,0.7)"} stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />
              )))}
            </g>
            <text x={446} y={154} fontSize="10" textAnchor="middle" fill="var(--text-muted)">2048-bit code (1024 Gabor kernels × 2 bity)</text>
          </g>
        )}
        {stage === 4 && (
          <g>
            <text x={W/2} y={20} fontSize="11" textAnchor="middle" fill="var(--text)">enrolled iris code (top) vs probe code (bottom)</text>
            <g transform="translate(20,30)">
              {ENROLLED.map((b, i) => (
                <rect key={`e${i}`} x={(i % 64) * 7.7} y={Math.floor(i / 64) * 10} width="7" height="9" fill={b ? "rgb(64,192,87)" : "var(--bg-card)"} />
              ))}
            </g>
            <g transform="translate(20,80)">
              {shifted.map((b, i) => (
                <rect key={`p${i}`} x={(i % 64) * 7.7} y={Math.floor(i / 64) * 10} width="7" height="9" fill={b !== ENROLLED[i] ? "rgb(220,80,80)" : (b ? "rgb(64,192,87)" : "var(--bg-card)")} />
              ))}
            </g>
            <text x={20} y={172} fontSize="11" fill="rgb(220,80,80)">červené = neshodné bity (XOR)</text>
            <text x={20} y={188} fontSize="14" fill="var(--accent)">HD = {(HD * 100).toFixed(2)} %</text>
            {scenario === "rotated" && <text x={20} y={206} fontSize="11" fill="var(--text-muted)">po max ± 8 shift: minHD = {(minHD * 100).toFixed(2)}%</text>}
          </g>
        )}
      </svg>

      <div style={row}>
        <label style={lbl}>scénář:</label>
        <select value={scenario} onChange={(e) => setScenario(e.target.value)} style={sel}>
          <option value="genuine">genuine — stejné oko, jiný snímek</option>
          <option value="impostor">impostor — jiné oko</option>
          <option value="rotated">rotated — stejné oko, naklonění hlavy</option>
        </select>
        <label style={lbl}>pupila r = {pupilR}</label>
        <input type="range" min="15" max="40" value={pupilR} onChange={(e) => setPupilR(parseInt(e.target.value))} />
        {scenario === "rotated" && (
          <>
            <label style={lbl}>shift = {shift}</label>
            <input type="range" min="-8" max="8" value={shift} onChange={(e) => setShift(parseInt(e.target.value))} />
          </>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <div style={statBox}>
          <div style={statLbl}>HD</div>
          <div style={{ ...statVal, color: HD < 0.32 ? "rgb(64,192,87)" : "rgb(220,80,80)" }}>{HD.toFixed(3)}</div>
        </div>
        <div style={statBox}>
          <div style={statLbl}>threshold</div>
          <div style={statVal}>0.32</div>
        </div>
        <div style={statBox}>
          <div style={statLbl}>verdikt</div>
          <div style={{ ...statVal, color: HD < 0.32 ? "rgb(64,192,87)" : "rgb(220,80,80)" }}>{HD < 0.32 ? "MATCH" : "no match"}</div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Daugman empiricky: <b>genuine</b> HD ≈ 0.10 (σ 0.05), <b>impostor</b> HD ≈ 0.50 (σ 0.015). Threshold 0.32 dává FAR ≈ 10⁻¹².
        Rotace hlavy = cyklický posun kódu → matching opakovaně zkouší shifts ±8 pozic, vybírá minimum HD.
        Mask bity v reálu maskují řasy / odlesky (zde vynecháno pro názornost).
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const stageBtn = { padding: "5px 10px", border: "1px solid var(--line)", borderRadius: 5, fontSize: 11, cursor: "pointer" };
const statBox = { background: "var(--bg-inset)", padding: 8, borderRadius: 6, textAlign: "center" };
const statLbl = { fontSize: 10, color: "var(--text-muted)" };
const statVal = { fontSize: 16, fontWeight: 600, fontFamily: "var(--font-mono)", marginTop: 4 };
