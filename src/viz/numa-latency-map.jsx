// numa-latency-map — 2-socket NUMA system. Drag thread between sockets,
// drag data page between memory banks; latency cost shown.
import { useState } from "react";

const LATENCY = {
  local: 80,
  remote: 200,
};

export default function NumaLatencyMap() {
  const [threadSocket, setThreadSocket] = useState(0);
  const [pageSocket, setPageSocket] = useState(0);

  const isLocal = threadSocket === pageSocket;
  const lat = isLocal ? LATENCY.local : LATENCY.remote;

  // STREAM-like bandwidth model
  const localBw = 50; // GB/s per channel
  const bandwidth = isLocal ? localBw : localBw * (LATENCY.local / LATENCY.remote);

  const W = 580, H = 280;
  return (
    <div style={{ width: "100%" }}>
      <div className="viz-controls" style={{ marginBottom: 6 }}>
        <span style={{ color: "var(--text)", fontSize: 11 }}>thread běží na:</span>
        <button className="viz-btn" data-active={threadSocket === 0} onClick={() => setThreadSocket(0)}>NUMA 0</button>
        <button className="viz-btn" data-active={threadSocket === 1} onClick={() => setThreadSocket(1)}>NUMA 1</button>
        <span style={{ color: "var(--text)", fontSize: 11, marginLeft: 8 }}>page alokována na:</span>
        <button className="viz-btn" data-active={pageSocket === 0} onClick={() => setPageSocket(0)}>NUMA 0</button>
        <button className="viz-btn" data-active={pageSocket === 1} onClick={() => setPageSocket(1)}>NUMA 1</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* Socket 0 */}
        <g>
          <rect x={20} y={20} width={250} height={140} fill={threadSocket === 0 ? "oklch(0.7 0.15 245 / 0.15)" : "var(--bg-inset)"}
            stroke={threadSocket === 0 ? "oklch(0.7 0.15 245)" : "var(--line)"} strokeWidth={1.2} rx="5" />
          <text x={145} y={40} textAnchor="middle" fontSize="12" fill="var(--text)" fontWeight="600">NUMA node 0 (socket 0)</text>
          {/* CPU */}
          <rect x={40} y={55} width={100} height={50} fill="var(--bg-card)" stroke="var(--line-strong)" rx="4" />
          <text x={90} y={75} textAnchor="middle" fontSize="10" fill="var(--text)" fontWeight="600">CPU 0 (8 cores)</text>
          <text x={90} y={92} textAnchor="middle" fontSize="9" fill="var(--text-muted)">L1/L2/L3</text>
          {threadSocket === 0 && <circle cx={90} cy={62} r={6} fill="oklch(0.7 0.15 60)" />}
          {/* Memory */}
          <rect x={150} y={55} width={100} height={50} fill="var(--bg-card)" stroke="var(--line-strong)" rx="4" />
          <text x={200} y={75} textAnchor="middle" fontSize="10" fill="var(--text)" fontWeight="600">DRAM 0</text>
          <text x={200} y={92} textAnchor="middle" fontSize="9" fill="var(--text-muted)">128 GB, 6 channels</text>
          {pageSocket === 0 && (
            <g>
              <rect x={158} y={62} width={18} height={16} fill="oklch(0.65 0.16 145)" rx="2" />
              <text x={167} y={73} textAnchor="middle" fontSize="8" fill="white" fontWeight="600">page</text>
            </g>
          )}
          {/* Latency local */}
          <text x={145} y={130} textAnchor="middle" fontSize="9" fill="var(--text-muted)">local lat: {LATENCY.local} ns</text>
          <text x={145} y={145} textAnchor="middle" fontSize="9" fill="var(--text-muted)">local bw: {localBw} GB/s</text>
        </g>

        {/* Socket 1 */}
        <g>
          <rect x={310} y={20} width={250} height={140} fill={threadSocket === 1 ? "oklch(0.7 0.15 245 / 0.15)" : "var(--bg-inset)"}
            stroke={threadSocket === 1 ? "oklch(0.7 0.15 245)" : "var(--line)"} strokeWidth={1.2} rx="5" />
          <text x={435} y={40} textAnchor="middle" fontSize="12" fill="var(--text)" fontWeight="600">NUMA node 1 (socket 1)</text>
          <rect x={330} y={55} width={100} height={50} fill="var(--bg-card)" stroke="var(--line-strong)" rx="4" />
          <text x={380} y={75} textAnchor="middle" fontSize="10" fill="var(--text)" fontWeight="600">CPU 1 (8 cores)</text>
          <text x={380} y={92} textAnchor="middle" fontSize="9" fill="var(--text-muted)">L1/L2/L3</text>
          {threadSocket === 1 && <circle cx={380} cy={62} r={6} fill="oklch(0.7 0.15 60)" />}
          <rect x={440} y={55} width={100} height={50} fill="var(--bg-card)" stroke="var(--line-strong)" rx="4" />
          <text x={490} y={75} textAnchor="middle" fontSize="10" fill="var(--text)" fontWeight="600">DRAM 1</text>
          <text x={490} y={92} textAnchor="middle" fontSize="9" fill="var(--text-muted)">128 GB, 6 channels</text>
          {pageSocket === 1 && (
            <g>
              <rect x={448} y={62} width={18} height={16} fill="oklch(0.65 0.16 145)" rx="2" />
              <text x={457} y={73} textAnchor="middle" fontSize="8" fill="white" fontWeight="600">page</text>
            </g>
          )}
          <text x={435} y={130} textAnchor="middle" fontSize="9" fill="var(--text-muted)">local lat: {LATENCY.local} ns</text>
          <text x={435} y={145} textAnchor="middle" fontSize="9" fill="var(--text-muted)">local bw: {localBw} GB/s</text>
        </g>

        {/* Interconnect */}
        <line x1={270} y1={90} x2={310} y2={90} stroke="var(--line-strong)" strokeWidth="2" />
        <text x={290} y={82} textAnchor="middle" fontSize="9" fill="var(--text-muted)">UPI / IF</text>
        <text x={290} y={108} textAnchor="middle" fontSize="9" fill="var(--text-muted)">~30 GB/s</text>

        {/* Access arrow */}
        {(() => {
          const tx = threadSocket === 0 ? 90 : 380;
          const px = pageSocket === 0 ? 167 : 457;
          return (
            <g>
              <path d={`M ${tx} 110 Q ${(tx + px) / 2} 120 ${px} 78`} fill="none"
                stroke={isLocal ? "oklch(0.65 0.16 145)" : "oklch(0.65 0.18 22)"} strokeWidth="2" markerEnd="url(#numa-ar)" />
            </g>
          );
        })()}
        <defs>
          <marker id="numa-ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L5,3 L0,6 z" fill={isLocal ? "oklch(0.65 0.16 145)" : "oklch(0.65 0.18 22)"} />
          </marker>
        </defs>

        <g fontSize="11" fill="var(--text)">
          <text x={20} y={195} fontWeight="600">
            {isLocal ? "✓ Local access" : "✗ Remote (cross-NUMA) access"} →
            latence: <tspan fontWeight="700" fill={isLocal ? "oklch(0.65 0.16 145)" : "oklch(0.65 0.18 22)"}>{lat} ns</tspan>
          </text>
          <text x={20} y={213} fontSize="10" fill="var(--text-muted)">
            STREAM bw ≈ {bandwidth.toFixed(0)} GB/s {isLocal ? "(full lokální bw)" : `(omezeno UPI ≈ ${(LATENCY.local / LATENCY.remote * 100).toFixed(0)} % lokální)`}
          </text>
        </g>

        {/* bandwidth bar */}
        <rect x={20} y={232} width={500} height={20} fill="var(--bg-inset)" stroke="var(--line)" rx="2" />
        <rect x={20} y={232} width={500 * (bandwidth / localBw)} height={20}
          fill={isLocal ? "oklch(0.65 0.16 145)" : "oklch(0.65 0.18 22)"} rx="2" />
        <text x={270} y={245} textAnchor="middle" fontSize="10" fill="white" fontWeight="600">
          {bandwidth.toFixed(0)} GB/s / {localBw} GB/s
        </text>

        <text x={20} y={H - 8} fontSize="9.5" fill="var(--text-faint)">
          Linux first-touch policy: page alokovaná u thread, který poprvé zapíše. Single-threaded init → vše na NUMA 0 → bottleneck.
        </text>
      </svg>
    </div>
  );
}
