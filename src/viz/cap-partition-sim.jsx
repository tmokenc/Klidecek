// cap-partition-sim — three-node cluster; toggle a network partition;
// choose CP (reject during split) vs AP (accept, reconcile later) and
// see client requests succeed/fail with explanation.
import { useState } from "react";

const W = 540, H = 280;

export default function CapPartitionSim() {
  const [mode, setMode] = useState("CP");
  const [partition, setPartition] = useState(false);
  const [log, setLog] = useState([]);
  const [version, setVersion] = useState({ A: 1, B: 1, C: 1, valA: 5, valB: 5, valC: 5 });

  function write(node, value) {
    const lines = [];
    if (partition) {
      if (mode === "CP") {
        // In CP, only the majority side accepts writes
        const majority = node === "A" || node === "B"; // A & B are connected, C isolated
        if (majority) {
          setVersion(v => ({ ...v, [`val${node}`]: value, [`val${node === "A" ? "B" : "A"}`]: value, [node]: v[node] + 1, [node === "A" ? "B" : "A"]: v[node === "A" ? "B" : "A"] + 1 }));
          lines.push(`✓ write x=${value} on ${node} → quorum reached (A+B), C diverges later`);
        } else {
          lines.push(`✗ write x=${value} on ${node} REJECTED — no quorum (only C reachable)`);
        }
      } else {
        // AP — accept locally
        setVersion(v => ({ ...v, [`val${node}`]: value, [node]: v[node] + 1 }));
        lines.push(`✓ write x=${value} on ${node} accepted locally — will reconcile`);
      }
    } else {
      // No partition — strong propagation
      setVersion(v => ({ A: v.A + 1, B: v.B + 1, C: v.C + 1, valA: value, valB: value, valC: value }));
      lines.push(`✓ write x=${value} propagated to A, B, C (v+1)`);
    }
    setLog([...log, ...lines].slice(-6));
  }

  function read(node) {
    setLog([...log, `read ${node} → x=${version[`val${node}`]} (v=${version[node]})`].slice(-6));
  }

  function heal() {
    // After partition heal, reconcile via LWW (latest version wins) or last value
    if (mode === "AP") {
      // simple: take max version
      const maxV = Math.max(version.A, version.B, version.C);
      const winner = version.A === maxV ? "A" : version.B === maxV ? "B" : "C";
      setVersion(v => ({ A: maxV, B: maxV, C: maxV, valA: v[`val${winner}`], valB: v[`val${winner}`], valC: v[`val${winner}`] }));
      setLog([...log, `→ heal: AP reconciled (LWW from ${winner}, v=${maxV})`].slice(-6));
    } else {
      // CP: minority catches up
      setVersion(v => ({ ...v, C: v.A, valC: v.valA }));
      setLog([...log, `→ heal: CP minority node C catches up to v=${version.A}`].slice(-6));
    }
    setPartition(false);
  }

  function reset() {
    setVersion({ A: 1, B: 1, C: 1, valA: 5, valB: 5, valC: 5 });
    setPartition(false);
    setLog([]);
  }

  const positions = { A: [140, 80], B: [340, 80], C: [240, 200] };
  const colors = { A: "oklch(0.65 0.16 264)", B: "oklch(0.65 0.16 145)", C: "oklch(0.7 0.15 22)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        <button className="viz-btn" data-active={mode === "CP"} onClick={() => setMode("CP")}>CP (favor consistency)</button>
        <button className="viz-btn" data-active={mode === "AP"} onClick={() => setMode("AP")}>AP (favor availability)</button>
        <button className="viz-btn" data-active={partition} onClick={() => setPartition(p => !p)}>{partition ? "✗ partition" : "× start partition"}</button>
        <button className="viz-btn" onClick={heal} disabled={!partition}>heal</button>
        <button className="viz-btn" onClick={reset}>reset</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {/* Node links */}
        {[["A", "B"], ["A", "C"], ["B", "C"]].map(([a, b]) => {
          const broken = partition && (a === "C" || b === "C");
          return (
            <line key={`${a}-${b}`} x1={positions[a][0]} y1={positions[a][1]} x2={positions[b][0]} y2={positions[b][1]}
              stroke={broken ? "oklch(0.6 0.18 22)" : "var(--line-strong)"} strokeWidth={broken ? 1.2 : 0.8}
              strokeDasharray={broken ? "4 4" : "0"} />
          );
        })}

        {/* Partition cloud */}
        {partition && (
          <g>
            <ellipse cx={240} cy={140} rx={150} ry={20} fill="oklch(0.6 0.18 22 / 0.1)" stroke="oklch(0.6 0.18 22)" strokeWidth="0.6" strokeDasharray="3 3" />
            <text x={240} y={146} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.6 0.18 22)">network partition</text>
          </g>
        )}

        {/* Nodes */}
        {["A", "B", "C"].map(n => (
          <g key={n} transform={`translate(${positions[n][0]}, ${positions[n][1]})`}>
            <circle r={26} fill="var(--bg-inset)" stroke={colors[n]} strokeWidth="2" />
            <text x={0} y={-2} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill={colors[n]}>node {n}</text>
            <text x={0} y={10} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">x = {version[`val${n}`]}</text>
            <text x={0} y={22} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">v={version[n]}</text>
          </g>
        ))}
      </svg>

      <div className="viz-controls">
        {["A", "B", "C"].map(n => (
          <span key={n} style={{ display: "flex", gap: 2 }}>
            <button className="viz-btn" onClick={() => write(n, Math.floor(Math.random() * 10) + 10)}>write {n}</button>
            <button className="viz-btn" onClick={() => read(n)}>read {n}</button>
          </span>
        ))}
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 6, borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: 10.5, minHeight: 60 }}>
        {log.length === 0 ? <span style={{ color: "var(--text-faint)" }}>(operation log)</span> :
          log.map((l, i) => <div key={i} style={{ color: l.startsWith("✗") ? "oklch(0.6 0.18 22)" : l.startsWith("→") ? "oklch(0.7 0.15 60)" : "var(--text-muted)" }}>{l}</div>)}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        Start a partition (C is isolated), then try writes. CP: only A+B accept (quorum); writes via C are rejected — clients on C see errors but never stale data.
        AP: all nodes accept; clients are happy but C diverges; "heal" reconciles via last-write-wins (potential data loss).
      </div>
    </div>
  );
}
