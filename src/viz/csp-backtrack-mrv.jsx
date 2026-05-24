// CSP backtracking with MRV / LCV / forward-checking on Australia map-coloring.
import { useState, useMemo, useEffect } from "react";

const REGIONS = ["WA", "NT", "SA", "Q", "NSW", "V", "T"];
const POSITIONS = {
  WA: { x: 70, y: 130 }, NT: { x: 165, y: 80 }, SA: { x: 190, y: 160 },
  Q: { x: 280, y: 100 }, NSW: { x: 310, y: 180 }, V: { x: 285, y: 230 }, T: { x: 295, y: 290 },
};
const NEIGHBORS = {
  WA: ["NT", "SA"], NT: ["WA", "SA", "Q"], SA: ["WA", "NT", "Q", "NSW", "V"],
  Q: ["NT", "SA", "NSW"], NSW: ["Q", "SA", "V"], V: ["SA", "NSW"], T: [],
};
const COLORS = ["R", "G", "B"];
const COLOR_FILL = { R: "oklch(0.65 0.18 30)", G: "oklch(0.65 0.18 145)", B: "oklch(0.65 0.18 240)" };

function runBacktrack(useMRV, useLCV, useFC) {
  // Pre-prune WA = R initial assignment to force interesting branching.
  const assignment = { WA: "R" };
  const dom = {};
  for (const r of REGIONS) dom[r] = [...COLORS];
  dom.WA = ["R"];
  // forward-check from initial WA = R
  if (useFC) {
    for (const n of NEIGHBORS.WA) dom[n] = dom[n].filter((c) => c !== "R");
  }

  const events = [];
  events.push({ kind: "init", assignment: { ...assignment }, dom: cloneDom(dom) });

  function pickVar(asg, dom) {
    const unassigned = REGIONS.filter((r) => !(r in asg));
    if (useMRV) {
      // smallest domain size; break ties by max degree
      unassigned.sort((a, b) => {
        if (dom[a].length !== dom[b].length) return dom[a].length - dom[b].length;
        return NEIGHBORS[b].length - NEIGHBORS[a].length;
      });
    }
    return unassigned[0];
  }

  function orderValues(v, asg, dom) {
    const vals = [...dom[v]];
    if (useLCV) {
      // for each value, count constraints it removes from neighbors
      vals.sort((a, b) => {
        const ca = countConflicts(v, a, dom);
        const cb = countConflicts(v, b, dom);
        return ca - cb;
      });
    }
    return vals;
  }
  function countConflicts(v, val, dom) {
    let count = 0;
    for (const n of NEIGHBORS[v]) {
      if (dom[n].includes(val)) count++;
    }
    return count;
  }

  function consistent(v, val, asg) {
    for (const n of NEIGHBORS[v]) {
      if (asg[n] === val) return false;
    }
    return true;
  }

  function bt(asg, dom, depth) {
    if (Object.keys(asg).length === REGIONS.length) {
      events.push({ kind: "solution", assignment: { ...asg }, dom: cloneDom(dom) });
      return true;
    }
    const v = pickVar(asg, dom);
    if (!v) return false;
    events.push({ kind: "pick", variable: v, depth, assignment: { ...asg }, dom: cloneDom(dom) });
    const vals = orderValues(v, asg, dom);
    for (const val of vals) {
      events.push({ kind: "try", variable: v, value: val, depth, assignment: { ...asg }, dom: cloneDom(dom) });
      if (!consistent(v, val, asg)) {
        events.push({ kind: "conflict", variable: v, value: val, depth, assignment: { ...asg }, dom: cloneDom(dom) });
        continue;
      }
      const newAsg = { ...asg, [v]: val };
      let newDom = cloneDom(dom);
      newDom[v] = [val];
      if (useFC) {
        const removed = {};
        let dead = false;
        for (const n of NEIGHBORS[v]) {
          if (n in newAsg) continue;
          const before = newDom[n];
          const after = before.filter((c) => c !== val);
          if (after.length < before.length) {
            removed[n] = before.filter((c) => !after.includes(c));
            newDom[n] = after;
            if (after.length === 0) dead = true;
          }
        }
        if (dead) {
          events.push({ kind: "fc-fail", variable: v, value: val, depth, assignment: newAsg, dom: cloneDom(newDom) });
          continue;
        }
      }
      events.push({ kind: "assign", variable: v, value: val, depth, assignment: newAsg, dom: cloneDom(newDom) });
      if (bt(newAsg, newDom, depth + 1)) return true;
      events.push({ kind: "backtrack", variable: v, value: val, depth, assignment: { ...asg }, dom: cloneDom(dom) });
    }
    return false;
  }

  bt(assignment, dom, 0);
  return events;
}

function cloneDom(d) { const o = {}; for (const k in d) o[k] = [...d[k]]; return o; }

export default function CspBacktrackMrv() {
  const [useMRV, setMRV] = useState(true);
  const [useLCV, setLCV] = useState(true);
  const [useFC, setFC] = useState(true);
  const [step, setStep] = useState(0);

  const events = useMemo(() => runBacktrack(useMRV, useLCV, useFC), [useMRV, useLCV, useFC]);
  useEffect(() => { setStep(0); }, [useMRV, useLCV, useFC]);
  const cur = events[Math.min(step, events.length - 1)];

  const assignmentCount = Object.keys(cur.assignment).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", fontSize: 11 }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <input type="checkbox" checked={useMRV} onChange={(e) => setMRV(e.target.checked)} /> MRV
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <input type="checkbox" checked={useLCV} onChange={(e) => setLCV(e.target.checked)} /> LCV
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <input type="checkbox" checked={useFC} onChange={(e) => setFC(e.target.checked)} /> Forward checking
        </label>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setStep(0)} style={btnStyle()}>⏮</button>
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} style={btnStyle()}>◀</button>
          <button onClick={() => setStep((s) => Math.min(events.length - 1, s + 1))} style={btnStyle()}>▶</button>
          <button onClick={() => setStep(events.length - 1)} style={btnStyle()}>⏭</button>
        </div>
        <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          krok {step}/{events.length - 1} ({events.length} celkem)
        </span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <svg viewBox="0 0 400 340" style={{ width: "100%", maxWidth: 360, display: "block" }}>
          <rect width="400" height="340" fill="var(--bg-inset)" />
          {Object.entries(NEIGHBORS).map(([a, adj]) =>
            adj.map((b) => {
              if (a > b) return null;
              const pa = POSITIONS[a], pb = POSITIONS[b];
              return <line key={`${a}-${b}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke="var(--line)" strokeWidth="1" opacity="0.4"/>;
            })
          )}
          {REGIONS.map((r) => {
            const p = POSITIONS[r];
            const asg = cur.assignment[r];
            const dom = cur.dom[r] || [];
            const isCur = cur.variable === r;
            return (
              <g key={r}>
                <circle cx={p.x} cy={p.y} r="26"
                  fill={asg ? COLOR_FILL[asg] : (isCur ? "color-mix(in oklch, oklch(0.7 0.18 60) 30%, var(--bg-card))" : "var(--bg-card)")}
                  stroke={isCur ? "oklch(0.7 0.18 60)" : "var(--line-strong)"} strokeWidth={isCur ? 2 : 1.2}/>
                <text x={p.x} y={p.y - 6} textAnchor="middle" fontSize="11" fontWeight="700" fill={asg ? "white" : "var(--text)"}>{r}</text>
                {!asg && (
                  <g>
                    {COLORS.map((c, i) => {
                      const has = dom.includes(c);
                      return (
                        <circle key={c} cx={p.x - 14 + i * 14} cy={p.y + 10} r="4"
                          fill={has ? COLOR_FILL[c] : "transparent"}
                          stroke={has ? COLOR_FILL[c] : "var(--text-faint)"} strokeWidth="1"
                          opacity={has ? 1 : 0.3}/>
                      );
                    })}
                  </g>
                )}
                {asg && (
                  <text x={p.x} y={p.y + 8} textAnchor="middle" fontSize="11" fontWeight="700" fill="white" fontFamily="var(--font-mono)">{asg}</text>
                )}
              </g>
            );
          })}
        </svg>

        <div style={{ minWidth: 220, flex: 1, display: "flex", flexDirection: "column", gap: 6, fontSize: 11 }}>
          <div style={{ color: "var(--text-muted)", textTransform: "uppercase", fontSize: 10, letterSpacing: 0.5 }}>událost</div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", padding: 6, borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: 10.5 }}>
            {describeEvent(cur)}
          </div>
          <div style={{ color: "var(--text-muted)", textTransform: "uppercase", fontSize: 10, letterSpacing: 0.5, marginTop: 4 }}>přiřazení</div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", padding: 6, borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: 10.5 }}>
            {Object.entries(cur.assignment).length === 0 ? "(prázdné)" :
              Object.entries(cur.assignment).map(([k, v]) =>
                <span key={k} style={{ marginRight: 8 }}>{k}={v}</span>
              )
            }
          </div>
          <div style={{ fontSize: 10.5, color: "var(--text-faint)" }}>
            přiřazeno {assignmentCount}/{REGIONS.length}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        <strong>MRV</strong>: vyber proměnnou s *nejmenší zbývající doménou*. <strong>LCV</strong>: zkus hodnotu, která *nejméně omezuje* sousedy.
        <strong> FC</strong>: po každém přiřazení zruš nekompatibilní hodnoty v doménách sousedů; když je doména prázdná, vrať se hned.
        Zkuste vypnout MRV — uvidíte mnohem víc backtracks.
      </div>
    </div>
  );
}

function describeEvent(e) {
  if (e.kind === "init") return "start — WA=R předdefinováno";
  if (e.kind === "pick") return `vybírám proměnnou: ${e.variable}`;
  if (e.kind === "try") return `zkouším ${e.variable} = ${e.value}`;
  if (e.kind === "conflict") return `konflikt ${e.variable} = ${e.value} (porušuje constraint)`;
  if (e.kind === "fc-fail") return `forward-check fail: ${e.variable} = ${e.value} → doména souseda prázdná`;
  if (e.kind === "assign") return `přiřazeno ${e.variable} = ${e.value}, zanořuji`;
  if (e.kind === "backtrack") return `backtrack z ${e.variable} = ${e.value}`;
  if (e.kind === "solution") return "✓ kompletní přiřazení — řešení";
  return e.kind;
}

function btnStyle() {
  return { background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
