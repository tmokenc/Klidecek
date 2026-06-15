// iSLIP / PIM / Take-a-Ticket matching with 3-phase animation.
// REQUEST → GRANT → ACCEPT, with rotating pointers (iSLIP).
// Click a VOQ cell to toggle a request.
import { useState, useRef } from "react";

const PHASES = ["idle", "request", "grant", "accept"];

export default function ISlip() {
  const N = 4;
  const [algo, setAlgo] = useState("islip");
  const [voq, setVoq] = useState(() => randVoq(N));
  const [grantPtr, setGrantPtr] = useState(() => Array(N).fill(0));
  const [acceptPtr, setAcceptPtr] = useState(() => Array(N).fill(0));
  const [phase, setPhase] = useState("idle");
  const [iter, setIter] = useState(0);
  const [requests, setRequests] = useState([]);
  const [grants, setGrants] = useState([]);
  const [accepts, setAccepts] = useState([]);
  const lastIterCommit = useRef(0);

  const reset = (a = algo) => {
    setAlgo(a);
    setVoq(randVoq(N));
    setGrantPtr(Array(N).fill(0));
    setAcceptPtr(Array(N).fill(0));
    setPhase("idle");
    setIter(0);
    setRequests([]);
    setGrants([]);
    setAccepts([]);
    lastIterCommit.current = 0;
  };

  const newRequests = () => {
    setVoq(randVoq(N));
    setPhase("idle");
    setIter(0);
    setRequests([]); setGrants([]); setAccepts([]);
  };

  const toggleCell = (i, j) => {
    setVoq((v) => v.map((row, ri) =>
      ri === i ? row.map((c, ci) => (ci === j ? 1 - c : c)) : row
    ));
    setPhase("idle");
    setRequests([]); setGrants([]); setAccepts([]);
  };

  const step = () => {
    if (phase === "idle" || phase === "accept") {
      // Start a new iteration with REQUEST
      const reqs = [];
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          if (voq[i][j]) reqs.push({ input: i, output: j });
        }
      }
      setRequests(reqs);
      setGrants([]); setAccepts([]);
      setIter((it) => it + 1);
      setPhase("request");
    } else if (phase === "request") {
      // GRANT: each output picks one of its requests
      const gs = [];
      for (let j = 0; j < N; j++) {
        const reqs = requests.filter((r) => r.output === j);
        if (reqs.length === 0) continue;
        let chosen = null;
        if (algo === "ticket") {
          chosen = reqs.slice().sort((a, b) => a.input - b.input)[0].input;
        } else if (algo === "pim") {
          chosen = reqs[Math.floor(Math.random() * reqs.length)].input;
        } else {
          // iSLIP: round-robin from grantPtr[j]
          for (let off = 0; off < N; off++) {
            const i = (grantPtr[j] + off) % N;
            if (reqs.some((r) => r.input === i)) { chosen = i; break; }
          }
        }
        if (chosen != null) gs.push({ output: j, input: chosen });
      }
      setGrants(gs);
      setPhase("grant");
    } else if (phase === "grant") {
      // ACCEPT: each input picks one of its grants
      const used = new Set();
      const acc = [];
      const newGrantPtr = [...grantPtr];
      const newAcceptPtr = [...acceptPtr];
      for (let i = 0; i < N; i++) {
        const myGrants = grants.filter((g) => g.input === i);
        if (!myGrants.length) continue;
        let chosen = null;
        if (algo === "ticket") {
          chosen = myGrants[0].output;
        } else if (algo === "pim") {
          chosen = myGrants[Math.floor(Math.random() * myGrants.length)].output;
        } else {
          for (let off = 0; off < N; off++) {
            const j = (acceptPtr[i] + off) % N;
            if (myGrants.some((g) => g.output === j)) { chosen = j; break; }
          }
        }
        if (chosen != null && !used.has(chosen)) {
          acc.push({ input: i, output: chosen });
          used.add(chosen);
          if (algo === "islip" && iter === lastIterCommit.current + 1) {
            newAcceptPtr[i] = (chosen + 1) % N;
            newGrantPtr[chosen] = (i + 1) % N;
          }
        }
      }
      // commit: clear matched VOQ cells
      const newVoq = voq.map((row, ri) =>
        row.map((c, ci) => (acc.some((a) => a.input === ri && a.output === ci) ? 0 : c))
      );
      setVoq(newVoq);
      setAccepts(acc);
      if (algo === "islip") {
        setGrantPtr(newGrantPtr);
        setAcceptPtr(newAcceptPtr);
      }
      lastIterCommit.current = iter;
      setPhase("accept");
    }
  };

  const W = 540, H = 280;
  const cell = 30;
  const gridX = 56, gridY = 50;
  const bipX = gridX + cell * N + 80;
  const bipR = 11;
  const gap = 140;
  const nodeY = (i) => gridY + 10 + i * cell;

  const phaseColor =
    phase === "accept"  ? "oklch(0.62 0.15 145)" :
    phase === "grant"   ? "var(--accent)" :
    phase === "request" ? "oklch(0.68 0.16 65)" : "var(--text-muted)";
  const phaseLabel = {
    idle:    "⏸ připraveno — klikni krok pro REQUEST",
    request: "① REQUEST — vstupy pošlou žádosti všem výstupům",
    grant:   "② GRANT — výstupy vyberou jeden požadavek",
    accept:  "③ ACCEPT — vstupy potvrdí jeden grant → matching",
  }[phase];

  const phaseIdx = PHASES.indexOf(phase);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* phase banner */}
        <text x={10} y={20} fontSize="11" fontWeight="700" fill={phaseColor}>
          {phaseLabel}
        </text>
        <text x={W - 10} y={20} textAnchor="end"
          fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          iter #{iter} · {algo}
        </text>

        {/* VOQ grid */}
        <text x={gridX + cell * N / 2} y={gridY - 16} textAnchor="middle"
          fontSize="9" fontFamily="var(--font-mono)" fontWeight="700"
          fill="var(--text)">
          VOQ ({N}×{N})
        </text>
        {Array.from({ length: N }, (_, i) => (
          <text key={`yl-${i}`} x={gridX - 6} y={gridY + 10 + i * cell + 3.5}
            textAnchor="end" fontSize="9" fontFamily="var(--font-mono)"
            fill="var(--text-muted)">
            in{i}
          </text>
        ))}
        {Array.from({ length: N }, (_, j) => (
          <text key={`xl-${j}`} x={gridX + j * cell + cell / 2} y={gridY - 4}
            textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)"
            fill="var(--text-muted)">
            o{j}
          </text>
        ))}
        {voq.map((row, i) =>
          row.map((c, j) => {
            const matched = accepts.some((a) => a.input === i && a.output === j) && phase === "accept";
            return (
              <g key={`cell-${i}-${j}`} onClick={() => toggleCell(i, j)}
                style={{ cursor: "pointer" }}>
                <rect x={gridX + j * cell} y={gridY + i * cell}
                  width={cell - 1} height={cell - 1}
                  fill={matched ? "oklch(0.62 0.15 145)" : (c ? "color-mix(in oklch, var(--accent) 25%, var(--bg-card))" : "var(--bg-card)")}
                  stroke="var(--line-strong)" strokeWidth="0.6" />
                {(c || matched) && (
                  <text x={gridX + j * cell + cell / 2}
                    y={gridY + i * cell + cell / 2 + 3.5}
                    textAnchor="middle" fontSize="10"
                    fontFamily="var(--font-mono)" fontWeight="700"
                    fill={matched ? "white" : "var(--accent)"}>
                    {matched ? "✓" : "•"}
                  </text>
                )}
              </g>
            );
          })
        )}

        {/* bipartite view */}
        <text x={bipX + gap / 2} y={gridY - 16} textAnchor="middle"
          fontSize="9" fontFamily="var(--font-mono)" fontWeight="700"
          fill="var(--text)">
          Bipartitní matching
        </text>

        {/* request lines (dashed) */}
        {phaseIdx >= 1 && requests.map((r, k) => (
          <line key={`req-${k}`}
            x1={bipX + bipR} y1={nodeY(r.input)}
            x2={bipX + gap - bipR} y2={nodeY(r.output)}
            stroke="var(--text-faint)" strokeWidth="0.6"
            strokeDasharray="3 2" opacity="0.7" />
        ))}
        {/* grant lines (accent) */}
        {phaseIdx >= 2 && grants.map((g, k) => (
          <line key={`grant-${k}`}
            x1={bipX + bipR} y1={nodeY(g.input)}
            x2={bipX + gap - bipR} y2={nodeY(g.output)}
            stroke="var(--accent)" strokeWidth="1.5" />
        ))}
        {/* accept lines (green) */}
        {phaseIdx === 3 && accepts.map((a, k) => (
          <line key={`acc-${k}`}
            x1={bipX + bipR} y1={nodeY(a.input)}
            x2={bipX + gap - bipR} y2={nodeY(a.output)}
            stroke="oklch(0.62 0.15 145)" strokeWidth="3" />
        ))}

        {/* nodes */}
        {Array.from({ length: N }, (_, i) => (
          <g key={`bn-${i}`}>
            <circle cx={bipX} cy={nodeY(i)} r={bipR}
              fill="var(--bg-card)" stroke="var(--text-muted)" strokeWidth="1" />
            <text x={bipX} y={nodeY(i) + 3} textAnchor="middle"
              fontSize="9" fontFamily="var(--font-mono)" fontWeight="700"
              fill="var(--text)">i{i}</text>
            <circle cx={bipX + gap} cy={nodeY(i)} r={bipR}
              fill="var(--bg-card)" stroke="var(--text-muted)" strokeWidth="1" />
            <text x={bipX + gap} y={nodeY(i) + 3} textAnchor="middle"
              fontSize="9" fontFamily="var(--font-mono)" fontWeight="700"
              fill="var(--text)">o{i}</text>
          </g>
        ))}

        {/* iSLIP pointers */}
        {algo === "islip" && Array.from({ length: N }, (_, i) => (
          <g key={`ptr-${i}`}>
            <text x={bipX - 18} y={nodeY(i) + 3} textAnchor="end"
              fontSize="7" fontFamily="var(--font-mono)" fill="var(--text-faint)">
              a={acceptPtr[i]}
            </text>
            <text x={bipX + gap + 18} y={nodeY(i) + 3}
              fontSize="7" fontFamily="var(--font-mono)" fill="var(--text-faint)">
              g={grantPtr[i]}
            </text>
          </g>
        ))}

        {/* legend */}
        <g transform="translate(56, 250)">
          <line x1="0" y1="0" x2="20" y2="0" stroke="var(--text-faint)"
            strokeWidth="0.6" strokeDasharray="3 2" />
          <text x="25" y="3" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">request</text>
          <line x1="100" y1="0" x2="120" y2="0" stroke="var(--accent)" strokeWidth="1.5" />
          <text x="125" y="3" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">grant</text>
          <line x1="180" y1="0" x2="200" y2="0" stroke="oklch(0.62 0.15 145)" strokeWidth="3" />
          <text x="205" y="3" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">accept</text>
        </g>
      </svg>

      <div className="viz-controls">
        <label style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--text-muted)" }}>
          <span>algoritmus:</span>
          <select className="viz-select" value={algo} onChange={(e) => reset(e.target.value)}>
            <option value="ticket">Take-a-Ticket</option>
            <option value="pim">PIM (náhodný)</option>
            <option value="islip">iSLIP (round-robin)</option>
          </select>
        </label>
        <button className="viz-btn primary" onClick={step}>
          ▸ {phase === "idle" || phase === "accept" ? "REQUEST" :
              phase === "request" ? "GRANT" : "ACCEPT"}
        </button>
        <button className="viz-btn" onClick={newRequests}>nové požadavky</button>
        <button className="viz-btn" onClick={() => reset()}>reset</button>
      </div>

      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.45 }}>
        {algo === "ticket" && "Take-a-Ticket: nejnižší index vyhrává. Spravedlivé, ale jednoduché — nestability v patologických případech."}
        {algo === "pim" && "PIM (Parallel Iterative Matching): náhodný výběr. Konverguje rychle, ale potřebuje hardwarový RNG na každý port."}
        {algo === "islip" && "iSLIP: round-robin ukazatele (a=acceptPtr, g=grantPtr) — deterministické a fair. Standardní v Cisco GSR/Catalyst."}
      </div>
    </div>
  );
}

function randVoq(N) {
  const v = Array.from({ length: N }, () => Array(N).fill(0));
  for (let i = 0; i < N; i++) {
    const k = 1 + Math.floor(Math.random() * (N - 1));
    const chosen = new Set();
    while (chosen.size < k) chosen.add(Math.floor(Math.random() * N));
    chosen.forEach((j) => (v[i][j] = 1));
  }
  return v;
}
