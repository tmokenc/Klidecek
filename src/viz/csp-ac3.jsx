// AC-3 arc consistency propagation on Australia map-coloring.
import { useState, useMemo, useEffect } from "react";

const REGIONS = {
  WA: { x: 80, y: 130, name: "WA" },
  NT: { x: 175, y: 80, name: "NT" },
  SA: { x: 200, y: 160, name: "SA" },
  Q:  { x: 290, y: 100, name: "Q"  },
  NSW:{ x: 320, y: 180, name: "NSW"},
  V:  { x: 295, y: 230, name: "V"  },
  T:  { x: 305, y: 290, name: "T"  },
};

// Adjacency (each pair is constrained by ≠)
const NEIGHBORS = {
  WA: ["NT", "SA"],
  NT: ["WA", "SA", "Q"],
  SA: ["WA", "NT", "Q", "NSW", "V"],
  Q:  ["NT", "SA", "NSW"],
  NSW:["Q", "SA", "V"],
  V:  ["SA", "NSW"],
  T:  [], // island
};

const COLORS = ["R", "G", "B"];
const COLOR_FILL = { R: "oklch(0.65 0.18 30)", G: "oklch(0.65 0.18 145)", B: "oklch(0.65 0.18 240)" };

const PRESETS = {
  "full":      { label: "plná doména", fixed: {} },
  "wa-red":    { label: "WA = R",      fixed: { WA: ["R"] } },
  "v-blue":    { label: "V = B",       fixed: { V: ["B"] } },
};

function runAC3(fixed) {
  const dom = {};
  for (const r of Object.keys(REGIONS)) dom[r] = fixed[r] ? [...fixed[r]] : [...COLORS];

  // initial arc queue: every (Xi, Xj) with Xj ∈ neighbors(Xi)
  const queue = [];
  for (const a of Object.keys(NEIGHBORS)) {
    for (const b of NEIGHBORS[a]) queue.push([a, b]);
  }

  const frames = [];
  frames.push({
    kind: "init",
    queue: queue.map((q) => [...q]),
    dom: cloneDomains(dom),
    currentArc: null,
    pruned: null,
    requeued: [],
  });

  let safety = 0;
  while (queue.length > 0 && safety++ < 100) {
    const arc = queue.shift();
    const [Xi, Xj] = arc;
    const before = [...dom[Xi]];
    const after = before.filter((vi) => dom[Xj].some((vj) => vi !== vj));
    const pruned = before.filter((v) => !after.includes(v));
    dom[Xi] = after;

    const requeued = [];
    if (pruned.length > 0) {
      // add (Xk, Xi) for Xk in neighbors(Xi) \ Xj
      for (const Xk of NEIGHBORS[Xi]) {
        if (Xk === Xj) continue;
        if (!queue.some(([a, b]) => a === Xk && b === Xi)) {
          queue.push([Xk, Xi]);
          requeued.push([Xk, Xi]);
        }
      }
    }

    frames.push({
      kind: pruned.length > 0 ? "pruned" : "noop",
      queue: queue.map((q) => [...q]),
      dom: cloneDomains(dom),
      currentArc: arc,
      pruned: pruned.length > 0 ? { region: Xi, removed: pruned, kept: after } : null,
      requeued,
    });

    if (dom[Xi].length === 0) {
      frames.push({
        kind: "fail",
        queue: queue.map((q) => [...q]),
        dom: cloneDomains(dom),
        currentArc: arc,
        pruned: null,
        requeued: [],
        failureRegion: Xi,
      });
      return frames;
    }
  }

  frames.push({
    kind: "done",
    queue: [],
    dom: cloneDomains(dom),
    currentArc: null,
    pruned: null,
    requeued: [],
  });
  return frames;
}

function cloneDomains(d) {
  const out = {};
  for (const k in d) out[k] = [...d[k]];
  return out;
}

export default function CspAc3() {
  const [presetKey, setPresetKey] = useState("wa-red");
  const [step, setStep] = useState(0);

  const frames = useMemo(() => runAC3(PRESETS[presetKey].fixed), [presetKey]);
  useEffect(() => { setStep(0); }, [presetKey]);
  const cur = frames[Math.min(step, frames.length - 1)];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 11 }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)" }}>počátek:</span>
          <select value={presetKey} onChange={(e) => setPresetKey(e.target.value)}
            style={{ background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 4px", borderRadius: 3 }}>
            {Object.entries(PRESETS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </label>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setStep(0)} style={btnStyle()}>⏮</button>
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} style={btnStyle()}>◀</button>
          <button onClick={() => setStep((s) => Math.min(frames.length - 1, s + 1))} style={btnStyle()}>▶</button>
          <button onClick={() => setStep(frames.length - 1)} style={btnStyle()}>⏭</button>
        </div>
        <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          krok {step}/{frames.length - 1}
        </span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <svg viewBox="0 0 400 340" style={{ width: "100%", maxWidth: 360, display: "block" }}>
          <rect width="400" height="340" fill="var(--bg-inset)" />
          {/* edges between neighbors */}
          {Object.entries(NEIGHBORS).map(([a, adj]) =>
            adj.map((b) => {
              if (a > b) return null;
              const pa = REGIONS[a], pb = REGIONS[b];
              const isCurrent = cur.currentArc && ((cur.currentArc[0] === a && cur.currentArc[1] === b) || (cur.currentArc[0] === b && cur.currentArc[1] === a));
              return (
                <line key={`e-${a}-${b}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                  stroke={isCurrent ? "oklch(0.7 0.18 60)" : "var(--line)"}
                  strokeWidth={isCurrent ? 2.5 : 1} opacity={isCurrent ? 1 : 0.45}/>
              );
            })
          )}
          {Object.entries(REGIONS).map(([k, p]) => {
            const dom = cur.dom[k] || [];
            const isCur = cur.currentArc && (cur.currentArc[0] === k || cur.currentArc[1] === k);
            const isPruned = cur.pruned && cur.pruned.region === k;
            const failed = cur.failureRegion === k;
            return (
              <g key={k}>
                <circle cx={p.x} cy={p.y} r={26}
                  fill={failed ? "oklch(0.5 0.22 25)" : (isPruned ? "oklch(0.55 0.15 60)" : (isCur ? "color-mix(in oklch, var(--accent) 25%, var(--bg-card))" : "var(--bg-card)"))}
                  stroke={isCur ? "oklch(0.7 0.18 60)" : "var(--line-strong)"} strokeWidth={isCur ? 2 : 1.2}/>
                <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">{p.name}</text>
                {/* domain chips */}
                <g>
                  {COLORS.map((c, i) => {
                    const has = dom.includes(c);
                    return (
                      <g key={c}>
                        <circle cx={p.x - 14 + i * 14} cy={p.y + 8} r={5}
                          fill={has ? COLOR_FILL[c] : "var(--bg-card)"}
                          stroke={has ? COLOR_FILL[c] : "var(--text-faint)"}
                          strokeWidth={1.2}
                          opacity={has ? 1 : 0.35}/>
                        {!has && (
                          <line x1={p.x - 18 + i * 14} y1={p.y + 4} x2={p.x - 10 + i * 14} y2={p.y + 12}
                            stroke="var(--text-faint)" strokeWidth={1}/>
                        )}
                      </g>
                    );
                  })}
                </g>
              </g>
            );
          })}
        </svg>

        <div style={{ minWidth: 240, flex: 1, display: "flex", flexDirection: "column", gap: 6, fontSize: 11 }}>
          <div style={{ color: "var(--text-muted)", textTransform: "uppercase", fontSize: 10, letterSpacing: 0.5 }}>fronta arcs</div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", padding: 6, borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: 10, maxHeight: 100, overflowY: "auto" }}>
            {cur.queue.length === 0 ? (
              <span style={{ color: "var(--text-faint)" }}>(prázdná)</span>
            ) : (
              cur.queue.map(([a, b], i) => {
                const requeued = cur.requeued.some(([x, y]) => x === a && y === b);
                return (
                  <span key={i} style={{ marginRight: 6, color: requeued ? "oklch(0.75 0.18 60)" : "var(--text-muted)" }}>
                    ({a}→{b}){requeued ? "*" : ""}
                  </span>
                );
              })
            )}
          </div>
          {cur.currentArc && (
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)" }}>
              testuji: ({cur.currentArc[0]} → {cur.currentArc[1]})
            </div>
          )}
          {cur.pruned && (
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "oklch(0.78 0.18 30)" }}>
              odstraněno z D({cur.pruned.region}): {cur.pruned.removed.join(", ")}
            </div>
          )}
          {cur.kind === "noop" && !cur.pruned && (
            <div style={{ fontSize: 10.5, color: "var(--text-faint)" }}>arc konzistentní — žádná změna</div>
          )}
          {cur.kind === "fail" && (
            <div style={{ fontSize: 11, color: "oklch(0.7 0.25 25)", fontWeight: 600 }}>
              D({cur.failureRegion}) = ∅ → nesplnitelné
            </div>
          )}
          {cur.kind === "done" && (
            <div style={{ fontSize: 11, color: "oklch(0.75 0.18 145)", fontWeight: 600 }}>
              ✓ AC dosaženo, fronta prázdná
            </div>
          )}
          <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 4 }}>
            * = znovu zařazeno po pruning (Xk → Xi pro k ∈ sousedi(Xi)\Xj)
          </div>
        </div>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        AC-3 (Mackworth 1977) iteruje frontu *arcs* (Xi, Xj). Pro každý arc odstraní z D(Xi) hodnoty, které nemají *žádný* support v D(Xj).
        Pokud došlo k pruning, znovu zařadí všechny arcs směřující *do* Xi. Composability dělá z AC-3 standardní preprocessing pro CSP.
      </div>
    </div>
  );
}

function btnStyle() {
  return { background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
