// Cache mapping visualizer: direct-mapped vs N-way set-associative.
import { useState } from "react";

// Cache parameters (fixed for clarity)
const NUM_BLOCKS = 8; // total blocks in cache
const BLOCK_SIZE = 16; // bytes per block (16-byte blocks for simple address arithmetic)

function computeMapping(addr, ways) {
  const sets = NUM_BLOCKS / ways;
  const offset = addr & (BLOCK_SIZE - 1);
  const blockAddr = addr >>> Math.log2(BLOCK_SIZE);
  const setIdx = blockAddr % sets;
  const tag = Math.floor(blockAddr / sets);
  return { offset, setIdx, tag, blockAddr };
}

const ADDRESSES = [
  0x100, 0x110, 0x120, 0x130, 0x140, 0x150,
  0x100, 0x180, 0x100, 0x200, 0x110, 0x100,
];

function simulate(addresses, ways) {
  const sets = NUM_BLOCKS / ways;
  // Each set is array of ways; way contains {tag} or null
  const cache = Array.from({ length: sets }, () => Array(ways).fill(null));
  // LRU tracking per set
  const lru = Array.from({ length: sets }, () => Array.from({ length: ways }, (_, i) => i));
  const history = [];
  for (const addr of addresses) {
    const { setIdx, tag } = computeMapping(addr, ways);
    const set = cache[setIdx];
    let hitWay = -1;
    for (let i = 0; i < ways; i++) {
      if (set[i] && set[i].tag === tag) {
        hitWay = i;
        break;
      }
    }
    if (hitWay >= 0) {
      // Hit — update LRU
      const idx = lru[setIdx].indexOf(hitWay);
      lru[setIdx].splice(idx, 1);
      lru[setIdx].push(hitWay);
      history.push({ addr, setIdx, tag, hit: true, way: hitWay });
    } else {
      // Miss — evict LRU
      let evictWay;
      const emptyIdx = set.findIndex((w) => w === null);
      if (emptyIdx >= 0) {
        evictWay = emptyIdx;
      } else {
        evictWay = lru[setIdx][0];
      }
      const evictedTag = set[evictWay]?.tag;
      set[evictWay] = { tag };
      const idx = lru[setIdx].indexOf(evictWay);
      lru[setIdx].splice(idx, 1);
      lru[setIdx].push(evictWay);
      history.push({ addr, setIdx, tag, hit: false, way: evictWay, evictedTag });
    }
  }
  return { cache, history };
}

export default function CacheMapping() {
  const [ways, setWays] = useState(2);
  const [step, setStep] = useState(0);
  const sets = NUM_BLOCKS / ways;
  const trace = ADDRESSES.slice(0, step + 1);
  const { cache, history } = simulate(trace, ways);
  const hits = history.filter((h) => h.hit).length;
  const total = history.length;

  const setH = 36;
  const wayW = 60;
  const SVG_W = 540;
  const SVG_H = sets * setH + 100;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ color: "var(--text)" }}>
          Asociativita:{" "}
          <select
            value={ways}
            onChange={(e) => { setWays(parseInt(e.target.value)); setStep(0); }}
            style={{
              background: "var(--bg-inset)",
              color: "var(--text)",
              border: "1px solid var(--line)",
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            <option value={1}>Direct-mapped (1-way)</option>
            <option value={2}>2-way</option>
            <option value={4}>4-way</option>
            <option value={8}>Fully assoc (8-way)</option>
          </select>
        </label>
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          style={{ padding: "4px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 4 }}
        >
          ← Krok
        </button>
        <button
          onClick={() => setStep(Math.min(ADDRESSES.length - 1, step + 1))}
          disabled={step === ADDRESSES.length - 1}
          style={{ padding: "4px 12px", background: "var(--accent)", color: "white", border: "1px solid var(--accent)", borderRadius: 4 }}
        >
          Krok →
        </button>
        <button
          onClick={() => setStep(ADDRESSES.length - 1)}
          style={{ padding: "4px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 4 }}
        >
          Až konec
        </button>
        <button
          onClick={() => setStep(0)}
          style={{ padding: "4px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 4 }}
        >
          Reset
        </button>
      </div>

      <div style={{ marginBottom: 10, color: "var(--text-muted)", fontSize: 12 }}>
        Sady: {sets} × {ways} cest | Hit rate: {total > 0 ? Math.round((hits / total) * 100) : 0}% ({hits}/{total})
      </div>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: "100%", maxWidth: 700, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* Cache table */}
        <text x={10} y={20} fill="var(--text)" fontWeight="600" fontSize="12">
          Cache (8 bloků, {ways}-way):
        </text>
        {Array.from({ length: sets }).map((_, si) => (
          <g key={si}>
            <text x={10} y={50 + si * setH + setH / 2} fill="var(--text-muted)" fontSize="10">
              S{si}
            </text>
            {Array.from({ length: ways }).map((_, wi) => {
              const block = cache[si][wi];
              const isJustAccessed =
                history.length > 0 &&
                history[history.length - 1].setIdx === si &&
                history[history.length - 1].way === wi;
              return (
                <g key={wi}>
                  <rect
                    x={40 + wi * (wayW + 4)}
                    y={50 + si * setH + 2}
                    width={wayW}
                    height={setH - 6}
                    fill={
                      isJustAccessed
                        ? history[history.length - 1].hit
                          ? "var(--accent)"
                          : "var(--accent-line)"
                        : block
                          ? "var(--bg-inset)"
                          : "var(--bg-card)"
                    }
                    stroke="var(--line)"
                    rx="3"
                    opacity={isJustAccessed ? 0.7 : 1}
                  />
                  <text
                    x={40 + wi * (wayW + 4) + wayW / 2}
                    y={50 + si * setH + setH / 2 + 4}
                    textAnchor="middle"
                    fontSize="11"
                    fill={isJustAccessed ? "white" : "var(--text)"}
                    fontFamily="ui-monospace, monospace"
                  >
                    {block ? `tag ${block.tag}` : "—"}
                  </text>
                </g>
              );
            })}
          </g>
        ))}

        {/* Current access */}
        {step >= 0 && (
          <g>
            <text x={10} y={sets * setH + 80} fill="var(--text)" fontWeight="600" fontSize="11">
              Adresa: 0x{ADDRESSES[step].toString(16).padStart(3, "0").toUpperCase()} →{" "}
              <tspan fill={history[history.length - 1]?.hit ? "var(--accent)" : "var(--accent-line)"}>
                {history[history.length - 1]?.hit ? "HIT" : "MISS"}
              </tspan>{" "}
              (set S{history[history.length - 1]?.setIdx}, tag {history[history.length - 1]?.tag})
            </text>
          </g>
        )}
      </svg>

      <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-faint)" }}>
        Stopa: {ADDRESSES.map((a, i) => (
          <span
            key={i}
            style={{
              padding: "1px 4px",
              margin: 1,
              background: i <= step ? "var(--bg-inset)" : "transparent",
              borderRadius: 2,
              fontFamily: "ui-monospace, monospace",
              fontWeight: i === step ? 600 : 400,
              color: i === step ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            0x{a.toString(16)}
          </span>
        ))}
      </div>
    </div>
  );
}
