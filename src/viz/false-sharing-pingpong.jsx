// false-sharing-pingpong — 4 cores updating their own slots in one cache
// line; toggle padding to put each slot on its own line.
import { useEffect, useState } from "react";

const N_CORES = 4;
const LINE_BYTES = 64;
const SLOT_BYTES = 4;

export default function FalseSharingPingpong() {
  const [padded, setPadded] = useState(false);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  // Per-core state: which line each core has and in which MESI state
  // Without padding: all share line 0
  // With padding: each core has its own line
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const [transfers, setTransfers] = useState(0);
  const [lineOwner, setLineOwner] = useState(0); // for unpadded, who holds line 0 in M
  const [lastTransfer, setLastTransfer] = useState(null);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTick(t => t + 1);
      // Round-robin core writes
      const writer = tick % N_CORES;
      setCounts(c => c.map((v, i) => i === writer ? v + 1 : v));
      if (!padded) {
        // line ping-pongs
        if (lineOwner !== writer) {
          setTransfers(x => x + 1);
          setLastTransfer({ from: lineOwner, to: writer });
          setLineOwner(writer);
        } else {
          setLastTransfer(null);
        }
      } else {
        setLastTransfer(null);
      }
    }, 600);
    return () => clearInterval(id);
  }, [running, tick, lineOwner, padded]);

  function reset() {
    setRunning(false); setTick(0); setCounts([0,0,0,0]); setTransfers(0); setLineOwner(0); setLastTransfer(null);
  }

  const ops = counts.reduce((a, b) => a + b, 0);
  const transferRate = ops > 0 ? (transfers / ops * 100).toFixed(0) : "0";

  const W = 580, H = 280;
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center", color: "var(--text)", fontSize: 11 }}>
          <input type="checkbox" checked={padded} onChange={e => { setPadded(e.target.checked); reset(); }} /> padding (aligned 64)
        </label>
        <button onClick={() => setRunning(r => !r)} style={btn(running)}>{running ? "■ stop" : "▶ run"}</button>
        <button onClick={reset} style={btn(false)}>reset</button>
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          ops: {ops} | transfers: <b style={{ color: transfers > 0 ? "oklch(0.65 0.18 22)" : "var(--text-muted)" }}>{transfers}</b> ({transferRate} %)
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* Cores */}
        {Array.from({ length: N_CORES }).map((_, i) => {
          const x = 50 + i * 130;
          const hot = lastTransfer && (lastTransfer.from === i || lastTransfer.to === i);
          return (
            <g key={i}>
              <rect x={x} y={30} width={100} height={60} fill={hot ? "oklch(0.65 0.18 22 / 0.3)" : "var(--bg-inset)"}
                stroke={hot ? "oklch(0.65 0.18 22)" : "var(--line)"} strokeWidth={hot ? 2 : 1} rx="3" />
              <text x={x + 50} y={48} textAnchor="middle" fontSize="11" fill="var(--text)" fontWeight="600">Core {i}</text>
              <text x={x + 50} y={62} textAnchor="middle" fontSize="9" fill="var(--text-muted)">L1 cache</text>
              <text x={x + 50} y={78} textAnchor="middle" fontSize="10" fill="var(--text)" fontFamily="ui-monospace, monospace">
                counts[{i}] = {counts[i]}
              </text>
            </g>
          );
        })}

        {/* Cache line(s) */}
        <text x={20} y={120} fontSize="11" fill="var(--text)" fontWeight="600">paměť / sdílená cache:</text>

        {!padded ? (
          <g>
            <rect x={50} y={130} width={480} height={36} fill={lineOwner >= 0 ? "oklch(0.65 0.18 22 / 0.2)" : "var(--bg-inset)"}
              stroke="oklch(0.65 0.18 22)" strokeWidth="1.2" rx="3" />
            <text x={290} y={145} textAnchor="middle" fontSize="10" fill="var(--text)" fontWeight="600">jedna 64 B cache line — counts[0..3]</text>
            <text x={290} y={160} textAnchor="middle" fontSize="9" fill="var(--text-muted)">
              vlastní: Core {lineOwner} (M) — ostatní I
            </text>
          </g>
        ) : (
          <g>
            {Array.from({ length: N_CORES }).map((_, i) => (
              <g key={i}>
                <rect x={50 + i * 130} y={130} width={100} height={36}
                  fill="oklch(0.65 0.16 145 / 0.2)" stroke="oklch(0.65 0.16 145)" strokeWidth="1.2" rx="3" />
                <text x={100 + i * 130} y={145} textAnchor="middle" fontSize="9.5" fill="var(--text)" fontWeight="600">vlastní line</text>
                <text x={100 + i * 130} y={158} textAnchor="middle" fontSize="9" fill="var(--text-muted)">counts[{i}]</text>
              </g>
            ))}
          </g>
        )}

        {/* Transfer arrow */}
        {lastTransfer && !padded && (
          <g>
            <path d={`M ${100 + lastTransfer.from * 130} 95 Q ${(100 + lastTransfer.from * 130 + 100 + lastTransfer.to * 130) / 2} 105 ${100 + lastTransfer.to * 130} 95`}
              fill="none" stroke="oklch(0.65 0.18 22)" strokeWidth="2" markerEnd="url(#ar-trans)" strokeDasharray="3 3" />
            <text x={(100 + lastTransfer.from * 130 + 100 + lastTransfer.to * 130) / 2} y={115}
              textAnchor="middle" fontSize="9" fill="oklch(0.65 0.18 22)" fontWeight="600">BusReadEx, invalidate</text>
          </g>
        )}
        <defs>
          <marker id="ar-trans" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L5,3 L0,6 z" fill="oklch(0.65 0.18 22)" />
          </marker>
        </defs>

        <g fontSize="10" fill="var(--text)">
          <text x={20} y={200}>
            {padded ? "S paddingem: každá counts[i] je na vlastní 64 B line. Hardware koherence se neaktivuje — žádný ping-pong."
                    : "Bez paddingu: counts[0..3] = 16 B, vejdou se na jednu 64 B line. Každý zápis → bus invalidace."}
          </text>
          <text x={20} y={216} fill="var(--text-muted)" fontSize="9.5">
            Realistický náklad: ~50-100 cyklů per transfer (cross-core L1) vs ~1 cyklus L1 hit lokálně.
          </text>
        </g>

        {/* Effective throughput bar */}
        <text x={20} y={240} fontSize="10.5" fill="var(--text)" fontWeight="600">efektivní throughput:</text>
        <rect x={20} y={246} width={500} height={18} fill="var(--bg-inset)" stroke="var(--line)" rx="2" />
        <rect x={20} y={246} width={padded ? 500 : 50} height={18}
          fill={padded ? "oklch(0.65 0.16 145)" : "oklch(0.65 0.18 22)"} rx="2" />
        <text x={270} y={259} textAnchor="middle" fontSize="10" fill="white" fontWeight="600">
          {padded ? "~10× rychlejší (lokální L1 hit)" : "~10× pomalejší (cache line ping-pong)"}
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
