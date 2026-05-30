// replacement-policy-race — same address trace fed to LRU/FIFO/pseudo-LRU/
// random; miss counter + Bélády anomaly trace option.
import { useState } from "react";

const N_LINES = 4;

const TRACES = {
  stream: { label: "stream (kill-all)", addrs: [1,2,3,4,5,6,1,2,3,4,5,6] },
  belady: { label: "Bélády anomaly (FIFO)", addrs: [1,2,3,4,1,2,5,1,2,3,4,5] },
  locality: { label: "lokalita (typický)", addrs: [1,2,1,2,3,1,2,4,1,2,3,4,1] },
  mixed: { label: "smíšený", addrs: [1,2,3,1,4,2,5,3,1,6,2,4] },
};

function sim(policy, addrs) {
  let cache = []; // array of lines (LRU front=oldest)
  let history = []; // [pseudo-LRU]
  let plruBits = 0; // for 4-way pseudo-LRU, 3 bits
  let rngSeed = 7;
  const events = [];
  let misses = 0;
  for (const a of addrs) {
    const hit = cache.includes(a);
    if (hit) {
      if (policy === "LRU") {
        cache = cache.filter(x => x !== a).concat(a);
      } else if (policy === "PLRU") {
        // mark this way as recently used
        const way = cache.indexOf(a);
        // toggle bits per binary tree
        plruBits = updatePLRU(plruBits, way);
      }
      events.push({ a, hit: true });
    } else {
      misses++;
      if (cache.length < N_LINES) {
        cache.push(a);
        if (policy === "PLRU") plruBits = updatePLRU(plruBits, cache.length - 1);
        events.push({ a, hit: false, evict: null });
      } else {
        let evict;
        if (policy === "LRU") {
          evict = cache[0];
          cache = cache.slice(1).concat(a);
        } else if (policy === "FIFO") {
          evict = cache[0];
          cache = cache.slice(1).concat(a);
        } else if (policy === "PLRU") {
          const way = plruVictim(plruBits);
          evict = cache[way];
          cache[way] = a;
          plruBits = updatePLRU(plruBits, way);
        } else { // random
          rngSeed = (rngSeed * 1664525 + 1013904223) >>> 0;
          const way = rngSeed % N_LINES;
          evict = cache[way];
          cache[way] = a;
        }
        events.push({ a, hit: false, evict });
      }
    }
  }
  return { misses, total: addrs.length, events, cache };
}

function updatePLRU(bits, way) {
  // 4-way: 3 bits represent binary tree. Root b0 (0=left,1=right); left subtree b1; right subtree b2.
  // way 0,1 = left; 2,3 = right
  let b = bits;
  if (way < 2) {
    b = (b & ~1) | 1; // root → right (away from accessed)
    if (way === 0) b = (b & ~2) | 2;
    else b = b & ~2;
  } else {
    b = b & ~1;
    if (way === 2) b = (b & ~4) | 4;
    else b = b & ~4;
  }
  return b;
}

function plruVictim(bits) {
  const root = bits & 1;
  if (root === 0) {
    return (bits & 2) ? 0 : 1;
  } else {
    return (bits & 4) ? 2 : 3;
  }
}

export default function ReplacementPolicyRace() {
  const [traceKey, setTraceKey] = useState("stream");
  const trace = TRACES[traceKey].addrs;
  const policies = ["LRU", "FIFO", "PLRU", "random"];
  const results = policies.map(p => sim(p, trace));

  const W = 580, H = 296;
  const cellW = Math.min(36, (W - 100) / trace.length);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
        <select value={traceKey} onChange={e => setTraceKey(e.target.value)} style={ctrl}>
          {Object.entries(TRACES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          trace ({trace.length}), N_LINES = {N_LINES}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        <text x={20} y={20} fontSize="11" fill="var(--text)" fontWeight="600">trace adres:</text>
        {trace.map((a, i) => (
          <g key={i}>
            <rect x={80 + i * cellW} y={26} width={cellW - 2} height={20}
              fill="var(--bg-inset)" stroke="var(--line)" rx="2" />
            <text x={80 + i * cellW + cellW / 2} y={40} textAnchor="middle" fontSize="10"
              fontFamily="ui-monospace, monospace" fill="var(--text)">{a}</text>
          </g>
        ))}

        {policies.map((p, pi) => {
          const r = results[pi];
          const y = 70 + pi * 50;
          const miss = r.misses;
          const hit = r.total - r.misses;
          const pct = (hit / r.total * 100).toFixed(0);
          return (
            <g key={p}>
              <text x={20} y={y + 12} fontSize="11" fontWeight="600" fill="var(--text)">{p}</text>
              <text x={20} y={y + 28} fontSize="9.5" fill="var(--text-muted)">{hit}/{r.total} hit ({pct} %)</text>
              {r.events.map((e, i) => (
                <rect key={i} x={80 + i * cellW} y={y} width={cellW - 2} height={36}
                  fill={e.hit ? "oklch(0.65 0.16 145 / 0.5)" : "oklch(0.65 0.18 22 / 0.5)"}
                  stroke={e.hit ? "oklch(0.65 0.16 145)" : "oklch(0.65 0.18 22)"} strokeWidth="0.7" rx="1.5" />
              ))}
              {r.events.map((e, i) => (
                <text key={"l" + i} x={80 + i * cellW + cellW / 2} y={y + 22} textAnchor="middle"
                  fontSize="8" fill={e.hit ? "oklch(0.65 0.16 145)" : "white"} fontWeight={e.hit ? 600 : 400}>
                  {e.hit ? "H" : "M"}
                </text>
              ))}
            </g>
          );
        })}

        <text x={20} y={H - 22} fontSize="9.5" fill="var(--text-faint)">
          Bélády anomaly: u FIFO se zvětšením cache může vzrůst počet miss-ů (paradox).
        </text>
        <text x={20} y={H - 10} fontSize="9.5" fill="var(--text-faint)">
          Random nemá patologii — překvapivě konkurenční při velké asociativitě.
        </text>
      </svg>
    </div>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "3px 6px", borderRadius: 3, fontSize: 11 };
