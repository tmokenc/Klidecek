// openmp-fork-join — show fork/join from a single source. Toggle: nested
// parallel, nowait. Threads animate timelines from source.
import { useEffect, useState } from "react";

export default function OpenmpForkJoin() {
  const [nThreads, setNThreads] = useState(4);
  const [t, setT] = useState(0);
  const [auto, setAuto] = useState(false);
  const [nowait, setNowait] = useState(false);
  const [nested, setNested] = useState(false);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setT(x => x >= 100 ? 0 : x + 2), 100);
    return () => clearInterval(id);
  }, [auto]);

  // Phases:
  // 0..20: serial
  // 20..50: parallel for #1 (each thread takes 30/nThreads of "iter")
  // 50..55: barrier (or skipped if nowait)
  // 55..85: parallel for #2
  // 85..100: barrier + serial
  const events = [];
  events.push({ kind: "serial", start: 0, end: 20, label: "serial init" });
  events.push({ kind: "parallel-1", start: 20, end: 50, label: "#pragma omp parallel for (#1)" });
  events.push({ kind: "barrier", start: 50, end: nowait ? 50 : 55, label: nowait ? "(nowait)" : "implicit barrier" });
  events.push({ kind: "parallel-2", start: nowait ? 50 : 55, end: nowait ? 80 : 85, label: "for #2" });
  events.push({ kind: "join", start: nowait ? 80 : 85, end: 100, label: "join → serial" });

  const W = 580, H = 280;
  const padX = 100;
  const chartW = W - padX - 20;
  const xOf = ts => padX + (ts / 100) * chartW;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ display: "flex", flexDirection: "column", color: "var(--text)", fontSize: 11 }}>
          threads: {nThreads}
          <input type="range" min={2} max={8} value={nThreads} onChange={e => setNThreads(+e.target.value)} style={{ width: 100 }} />
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center", color: "var(--text)", fontSize: 11 }}>
          <input type="checkbox" checked={nowait} onChange={e => setNowait(e.target.checked)} /> nowait
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center", color: "var(--text)", fontSize: 11 }}>
          <input type="checkbox" checked={nested} onChange={e => setNested(e.target.checked)} /> nested
        </label>
        <button onClick={() => setAuto(a => !a)} style={btn(auto)}>{auto ? "■" : "▶"}</button>
        <button onClick={() => setT(0)} style={btn(false)}>reset</button>
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>t = {t}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* Time axis */}
        <line x1={padX} y1={20} x2={padX + chartW} y2={20} stroke="var(--line)" />
        <text x={padX} y={14} fontSize="9" fill="var(--text-muted)">t=0</text>
        <text x={padX + chartW} y={14} fontSize="9" fill="var(--text-muted)" textAnchor="end">t=100</text>
        <line x1={xOf(t)} y1={20} x2={xOf(t)} y2={H - 30} stroke="var(--accent)" strokeWidth="1.5" />

        {/* Master thread (always alive) */}
        <text x={6} y={48} fontSize="10" fontWeight="600" fill="var(--text)">master</text>
        <line x1={padX} y1={45} x2={padX + chartW} y2={45} stroke="oklch(0.7 0.15 60)" strokeWidth="2" />

        {/* Worker threads */}
        {Array.from({ length: nThreads }).map((_, ti) => {
          const y = 70 + ti * 24;
          return (
            <g key={ti}>
              <text x={6} y={y + 4} fontSize="10" fill="var(--text-muted)">thread {ti}</text>
              {/* draw the segments per event */}
              {events.map((e, ei) => {
                if (e.kind === "serial" || e.kind === "join") return null;
                if (e.kind === "barrier") {
                  // gray dashed (waiting)
                  return (
                    <line key={ei} x1={xOf(e.start)} y1={y} x2={xOf(e.end)} y2={y}
                      stroke="var(--text-faint)" strokeWidth="1.5" strokeDasharray="3 3" />
                  );
                }
                return (
                  <g key={ei}>
                    <line x1={xOf(e.start)} y1={y} x2={xOf(e.end)} y2={y}
                      stroke={e.kind === "parallel-1" ? "oklch(0.7 0.15 245)" : "oklch(0.7 0.15 145)"} strokeWidth="3" />
                    {nested && e.kind === "parallel-2" && ti === 0 && (
                      Array.from({ length: 2 }).map((_, sub) => (
                        <line key={sub} x1={xOf(e.start + 3)} y1={y + 5 + sub * 3} x2={xOf(e.end - 3)} y2={y + 5 + sub * 3}
                          stroke="oklch(0.65 0.18 22)" strokeWidth="1.5" />
                      ))
                    )}
                  </g>
                );
              })}
              {/* Fork arrow from master */}
              <line x1={xOf(20)} y1={45} x2={xOf(20) + 1} y2={y} stroke="oklch(0.7 0.15 245)" strokeWidth="0.8" />
              <line x1={xOf(events[2].end)} y1={y} x2={xOf(events[2].end)} y2={45} stroke="oklch(0.7 0.15 60)" strokeWidth="0.4" strokeDasharray="2 2" />
            </g>
          );
        })}

        {/* Phase labels */}
        {events.map((e, ei) => {
          const x = xOf((e.start + e.end) / 2);
          return (
            <text key={ei} x={x} y={H - 38} textAnchor="middle" fontSize="9"
              fill={e.kind === "barrier" ? (nowait ? "var(--text-faint)" : "var(--text-muted)") : "var(--text-muted)"}
              fontStyle={e.kind === "barrier" ? "italic" : "normal"}>
              {e.label}
            </text>
          );
        })}

        {/* Fork/join arrows */}
        <g>
          <line x1={xOf(20)} y1={45} x2={xOf(20)} y2={70 + (nThreads - 1) * 24} stroke="oklch(0.7 0.15 245)" strokeWidth="1" strokeDasharray="2 2" />
          <text x={xOf(20) + 4} y={62} fontSize="9" fill="oklch(0.7 0.15 245)" fontWeight="600">FORK</text>
          <line x1={xOf(events[4].start)} y1={45} x2={xOf(events[4].start)} y2={70 + (nThreads - 1) * 24} stroke="oklch(0.7 0.15 60)" strokeWidth="1" strokeDasharray="2 2" />
          <text x={xOf(events[4].start) - 4} y={62} fontSize="9" textAnchor="end" fill="oklch(0.7 0.15 60)" fontWeight="600">JOIN</text>
        </g>

        <text x={20} y={H - 12} fontSize="9.5" fill="var(--text-faint)">
          nowait: implicit barrier zmizí → fast thread vstoupí do dalšího for early. nested: vnitřní team uvnitř thread 0.
        </text>
      </svg>
    </div>
  );
}

function btn(active) {
  return {
    fontFamily: "var(--font-mono)", fontSize: 11, padding: "3px 9px",
    background: active ? "var(--accent)" : "var(--bg-inset)",
    color: active ? "white" : "var(--text)",
    border: "1px solid var(--line-strong)", borderRadius: 3, cursor: "pointer",
  };
}
