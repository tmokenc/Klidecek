// Arbiter PUF + linear modeling attack. Procesni variace dela rozdily v delays;
// vystup = sign(W · phi(c)). Modeling utok ucistudent linear classifier
// nad CRPs a presnost roste s N.
import { useEffect, useMemo, useState } from "react";

const K = 8; // challenge length

// Generate a fixed "true" PUF model: weights for k+1 (k phi components + bias)
function makeTrueModel(seed) {
  let s = seed >>> 0;
  const w = new Array(K + 1);
  for (let i = 0; i <= K; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    w[i] = ((s >>> 0) / 0xffffffff - 0.5) * 0.2; // small random delays in ps
  }
  return w;
}

// Lim transform: phi_i = product_{j=i}^{k-1} (1 - 2*c_j), phi_k = 1
function phiOf(challenge) {
  const phi = new Array(K + 1);
  phi[K] = 1;
  for (let i = K - 1; i >= 0; i--) {
    phi[i] = phi[i + 1] * (1 - 2 * challenge[i]);
  }
  return phi;
}

function delayDiff(w, phi) {
  let d = 0;
  for (let i = 0; i <= K; i++) d += w[i] * phi[i];
  return d;
}

function response(w, c) {
  return delayDiff(w, phiOf(c)) > 0 ? 1 : 0;
}

function randomChallenge() {
  const c = new Array(K);
  for (let i = 0; i < K; i++) c[i] = Math.random() < 0.5 ? 1 : 0;
  return c;
}

// Train linear classifier via LMS (Widrow-Hoff) for binary response in {0,1}
function trainLinear(crps, epochs = 30) {
  let w = new Array(K + 1).fill(0);
  const lr = 0.05;
  for (let e = 0; e < epochs; e++) {
    for (const [phi, y] of crps) {
      const pred = delayDiff(w, phi);
      const target = y === 1 ? 1 : -1;
      const err = target - pred;
      for (let i = 0; i <= K; i++) w[i] += lr * err * phi[i];
    }
  }
  return w;
}

export default function ArbiterPuf() {
  const [modelSeed, setModelSeed] = useState(12345);
  const trueModel = useMemo(() => makeTrueModel(modelSeed), [modelSeed]);
  const [chal, setChal] = useState(() => randomChallenge());
  const [nCrps, setNCrps] = useState(50);

  const trueResp = response(trueModel, chal);
  const trueDelay = delayDiff(trueModel, phiOf(chal));

  // Generate train set (deterministic for given nCrps)
  const trainSet = useMemo(() => {
    let s = (modelSeed + 7919) >>> 0;
    const set = [];
    for (let i = 0; i < nCrps; i++) {
      const c = new Array(K);
      for (let j = 0; j < K; j++) {
        s = (Math.imul(s, 22695477) + 1) | 0;
        c[j] = (s >>> 16) & 1;
      }
      set.push([phiOf(c), response(trueModel, c)]);
    }
    return set;
  }, [trueModel, nCrps, modelSeed]);

  // Train model
  const learned = useMemo(() => trainLinear(trainSet), [trainSet]);

  // Test accuracy on 200 fresh challenges
  const testAcc = useMemo(() => {
    let s = (modelSeed + 31337) >>> 0;
    let correct = 0;
    const TEST = 200;
    for (let i = 0; i < TEST; i++) {
      const c = new Array(K);
      for (let j = 0; j < K; j++) {
        s = (Math.imul(s, 22695477) + 1) | 0;
        c[j] = (s >>> 16) & 1;
      }
      const trueR = response(trueModel, c);
      const learnedR = response(learned, c);
      if (trueR === learnedR) correct++;
    }
    return correct / TEST;
  }, [trueModel, learned, modelSeed]);

  const W = 480, H = 130;

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>cip:</label>
        <button style={btn} onClick={() => setModelSeed(Math.floor(Math.random() * 1e6))}>jiny cip (random)</button>
        <button style={btn} onClick={() => setChal(randomChallenge())}>jine c (random)</button>
      </div>
      <div style={row}>
        <label style={lbl}>challenge c =</label>
        {chal.map((b, i) => (
          <button key={i} style={{ ...chalBtn, background: b ? "var(--accent)" : "var(--bg-inset)", color: b ? "var(--bg-inset)" : "var(--text)" }}
            onClick={() => setChal(chal.map((x, j) => j === i ? 1 - x : x))}>{b}</button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 560, background: "var(--bg-inset)", borderRadius: 6 }}>
        {/* paths */}
        {Array.from({ length: K }).map((_, i) => {
          const x = 20 + i * ((W - 60) / K);
          const x2 = 20 + (i + 1) * ((W - 60) / K);
          const cross = chal[i] === 1;
          return (
            <g key={i}>
              <rect x={x + 4} y={48} width={(W - 60) / K - 8} height={32} rx={3}
                fill="var(--bg-card)" stroke={cross ? "#e07a5f" : "var(--line)"} strokeWidth={cross ? 1.4 : 0.8} />
              <text x={x + ((W - 60) / K) / 2} y={42} fontSize="9" textAnchor="middle" fill={cross ? "#e07a5f" : "var(--text-muted)"} fontFamily="var(--font-mono)">c={chal[i]}</text>
              {/* lines through switch */}
              <line x1={x} y1={58} x2={x + 4} y2={58} stroke="var(--accent)" strokeWidth="1" />
              <line x1={x} y1={72} x2={x + 4} y2={72} stroke="var(--accent)" strokeWidth="1" />
              {cross ? (
                <>
                  <line x1={x + 4} y1={58} x2={x + ((W - 60) / K) - 8} y2={72} stroke="var(--accent)" strokeWidth="1" />
                  <line x1={x + 4} y1={72} x2={x + ((W - 60) / K) - 8} y2={58} stroke="var(--accent)" strokeWidth="1" />
                </>
              ) : (
                <>
                  <line x1={x + 4} y1={58} x2={x + ((W - 60) / K) - 8} y2={58} stroke="var(--accent)" strokeWidth="1" />
                  <line x1={x + 4} y1={72} x2={x + ((W - 60) / K) - 8} y2={72} stroke="var(--accent)" strokeWidth="1" />
                </>
              )}
              <line x1={x + ((W - 60) / K) - 4} y1={58} x2={x2} y2={58} stroke="var(--accent)" strokeWidth="1" />
              <line x1={x + ((W - 60) / K) - 4} y1={72} x2={x2} y2={72} stroke="var(--accent)" strokeWidth="1" />
            </g>
          );
        })}
        {/* arbiter */}
        <rect x={W - 36} y={50} width={28} height={32} rx={4} fill="var(--bg-card)" stroke={trueResp ? "#81b29a" : "#e07a5f"} strokeWidth={1.4} />
        <text x={W - 22} y={68} fontSize="11" textAnchor="middle" fill={trueResp ? "#81b29a" : "#e07a5f"} fontWeight="bold" fontFamily="var(--font-mono)">{trueResp}</text>
        <text x={W - 22} y={102} fontSize="9" textAnchor="middle" fill="var(--text-muted)">arbiter</text>
        <text x={20} y={20} fontSize="10" fill="var(--text-muted)">edge ↑</text>
        <text x={20} y={120} fontSize="10" fill="var(--text-muted)">delta tau = {trueDelay.toFixed(4)} ps</text>
      </svg>

      <div style={{ borderTop: "1px dashed var(--line)", paddingTop: 8 }}>
        <div style={row}>
          <label style={lbl}>modeling utok: N CRPs =</label>
          <input type="range" min={5} max={500} step={5} value={nCrps} onChange={(e) => setNCrps(+e.target.value)} style={{ flex: 1, minWidth: 140 }} />
          <span style={lbl}>{nCrps}</span>
        </div>
        <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", marginTop: 6 }}>
          presnost modelu na 200 nove vygenerovanych challenges: &nbsp;
          <span style={{ color: testAcc > 0.95 ? "#81b29a" : testAcc > 0.75 ? "var(--accent)" : "#e07a5f", fontWeight: "bold" }}>{(testAcc * 100).toFixed(1)} %</span>
        </div>
        <div style={{ background: "var(--bg-inset)", borderRadius: 6, height: 8, marginTop: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${testAcc * 100}%`, background: testAcc > 0.9 ? "#81b29a" : "var(--accent)" }} />
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Switch je krizove zapojen pro c=1, primo pro c=0. Edge se siri obema cestami; arbiter latchne, ktera dorazi drive.
        Linearni model nad Limovym phi-transformem dokaze rekonstruovat Arbiter PUF s 95+% presnosti pri stovkach CRPs.
        XOR PUF nebo Feed-Forward PUF tuto zranitelnost zmirnuji.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const chalBtn = { width: 28, height: 28, borderRadius: 4, border: "1px solid var(--line)", fontFamily: "var(--font-mono)", fontSize: 13, cursor: "pointer" };
