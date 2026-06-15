// Raft leader election + log replication.
// 5 uzlů, scénáře: čistá volba a replikace; volba s pádem leadera.
// Krokuj — vidíš term, votedFor, log, commitIndex u každého uzlu + zprávy.
import { useState, useMemo } from "react";

const N = 5;

// Each step records the full cluster state + messages in flight + narrative.
function buildScenario(crashLeader) {
  const states = [];

  // helper to make a clean cluster state
  const mkNode = (id, state, term, votedFor, log, commit, alive = true) =>
    ({ id, state, term, votedFor, log: log.slice(), commit, alive });

  // step 0 — all followers, term 0
  states.push({
    nodes: [1, 2, 3, 4, 5].map((id) => mkNode(id, "F", 0, null, [], 0)),
    msgs: [],
    label: "Start — všichni followers, term 0, žádný leader",
    detail: "Cluster právě nastartoval. Každý uzel je Follower s term=0. Žádné committy v logu.",
  });

  // step 1 — node 1 election timeout
  states.push({
    nodes: [
      mkNode(1, "C", 1, 1, [], 0),
      mkNode(2, "F", 0, null, [], 0),
      mkNode(3, "F", 0, null, [], 0),
      mkNode(4, "F", 0, null, [], 0),
      mkNode(5, "F", 0, null, [], 0),
    ],
    msgs: [],
    label: "⏰ Uzel 1: election timeout → Candidate",
    detail: "Uzel 1 přestal slyšet heartbeats. Stává se Candidate, zvyšuje currentTerm na 1, hlasuje pro sebe.",
  });

  // step 2 — node 1 sends RequestVote to all
  states.push({
    nodes: [
      mkNode(1, "C", 1, 1, [], 0),
      mkNode(2, "F", 0, null, [], 0),
      mkNode(3, "F", 0, null, [], 0),
      mkNode(4, "F", 0, null, [], 0),
      mkNode(5, "F", 0, null, [], 0),
    ],
    msgs: [
      { from: 1, to: 2, kind: "RV", label: "RequestVote(t=1)" },
      { from: 1, to: 3, kind: "RV", label: "RequestVote(t=1)" },
      { from: 1, to: 4, kind: "RV", label: "RequestVote(t=1)" },
      { from: 1, to: 5, kind: "RV", label: "RequestVote(t=1)" },
    ],
    label: "Uzel 1 posílá RequestVote všem",
    detail: "Candidate posílá RequestVote(term=1, lastLogIndex=0, lastLogTerm=0) všem ostatním uzlům.",
  });

  // step 3 — followers vote yes
  states.push({
    nodes: [
      mkNode(1, "C", 1, 1, [], 0),
      mkNode(2, "F", 1, 1, [], 0),
      mkNode(3, "F", 1, 1, [], 0),
      mkNode(4, "F", 1, 1, [], 0),
      mkNode(5, "F", 1, 1, [], 0),
    ],
    msgs: [
      { from: 2, to: 1, kind: "V", label: "vote ✓" },
      { from: 3, to: 1, kind: "V", label: "vote ✓" },
      { from: 4, to: 1, kind: "V", label: "vote ✓" },
      { from: 5, to: 1, kind: "V", label: "vote ✓" },
    ],
    label: "Followers hlasují pro uzel 1",
    detail: "Term=1 > 0, votedFor=null nebo ne pro tento term → všichni odpoví ano. Aktualizují svůj currentTerm na 1.",
  });

  // step 4 — node 1 becomes leader
  states.push({
    nodes: [
      mkNode(1, "L", 1, 1, [], 0),
      mkNode(2, "F", 1, 1, [], 0),
      mkNode(3, "F", 1, 1, [], 0),
      mkNode(4, "F", 1, 1, [], 0),
      mkNode(5, "F", 1, 1, [], 0),
    ],
    msgs: [
      { from: 1, to: 2, kind: "HB", label: "heartbeat" },
      { from: 1, to: 3, kind: "HB", label: "heartbeat" },
      { from: 1, to: 4, kind: "HB", label: "heartbeat" },
      { from: 1, to: 5, kind: "HB", label: "heartbeat" },
    ],
    label: "Uzel 1 ⇒ Leader! Posílá heartbeats",
    detail: "Uzel 1 obdržel majority votes (5 z 5 včetně sebe). Stává se Leader pro term 1. Posílá AppendEntries(empty) jako heartbeat — uznává své vůdcovství.",
  });

  // step 5 — client cmd "x=1"
  const log1 = [{ term: 1, idx: 1, cmd: "x=1" }];
  states.push({
    nodes: [
      mkNode(1, "L", 1, 1, log1, 0),
      mkNode(2, "F", 1, 1, [], 0),
      mkNode(3, "F", 1, 1, [], 0),
      mkNode(4, "F", 1, 1, [], 0),
      mkNode(5, "F", 1, 1, [], 0),
    ],
    msgs: [{ from: 0, to: 1, kind: "C", label: "client: x=1" }],
    label: "Klient pošle příkaz „x=1\" leaderovi",
    detail: "Leader přidá entry (term=1, idx=1, cmd=\"x=1\") do svého logu. Zatím necommitnutí.",
  });

  // step 6 — leader replicates
  states.push({
    nodes: [
      mkNode(1, "L", 1, 1, log1, 0),
      mkNode(2, "F", 1, 1, [], 0),
      mkNode(3, "F", 1, 1, [], 0),
      mkNode(4, "F", 1, 1, [], 0),
      mkNode(5, "F", 1, 1, [], 0),
    ],
    msgs: [
      { from: 1, to: 2, kind: "AE", label: "AppendEntries x=1" },
      { from: 1, to: 3, kind: "AE", label: "AppendEntries x=1" },
      { from: 1, to: 4, kind: "AE", label: "AppendEntries x=1" },
      { from: 1, to: 5, kind: "AE", label: "AppendEntries x=1" },
    ],
    label: "Leader posílá AppendEntries(x=1) všem followers",
    detail: "AppendEntries(term=1, prevLogIndex=0, prevLogTerm=0, entries=[(t=1, x=1)], leaderCommit=0).",
  });

  // step 7 — followers append + ACK
  states.push({
    nodes: [
      mkNode(1, "L", 1, 1, log1, 0),
      mkNode(2, "F", 1, 1, log1, 0),
      mkNode(3, "F", 1, 1, log1, 0),
      mkNode(4, "F", 1, 1, log1, 0),
      mkNode(5, "F", 1, 1, log1, 0),
    ],
    msgs: [
      { from: 2, to: 1, kind: "AK", label: "ACK" },
      { from: 3, to: 1, kind: "AK", label: "ACK" },
      { from: 4, to: 1, kind: "AK", label: "ACK" },
      { from: 5, to: 1, kind: "AK", label: "ACK" },
    ],
    label: "Followers append do logu + ACK",
    detail: "Všichni followers přidali (t=1, x=1) do svého logu. Posílají ACK leaderovi.",
  });

  // step 8 — leader commits
  states.push({
    nodes: [
      mkNode(1, "L", 1, 1, log1, 1),
      mkNode(2, "F", 1, 1, log1, 0),
      mkNode(3, "F", 1, 1, log1, 0),
      mkNode(4, "F", 1, 1, log1, 0),
      mkNode(5, "F", 1, 1, log1, 0),
    ],
    msgs: [],
    label: "✓ Leader commit (majority ACK), aplikuje na state machine",
    detail: "Leader vidí, že entry idx=1 je replikované u majority (5 z 5). Commituje (commitIndex=1) a aplikuje x=1 na state machine. Klient dostane odpověď.",
  });

  // step 9 — propagate commitIndex
  const log2 = [{ term: 1, idx: 1, cmd: "x=1" }, { term: 1, idx: 2, cmd: "y=2" }];
  states.push({
    nodes: [
      mkNode(1, "L", 1, 1, log2, 1),
      mkNode(2, "F", 1, 1, log1, 1),
      mkNode(3, "F", 1, 1, log1, 1),
      mkNode(4, "F", 1, 1, log1, 1),
      mkNode(5, "F", 1, 1, log1, 1),
    ],
    msgs: [{ from: 0, to: 1, kind: "C", label: "client: y=2" }],
    label: "Další klientský příkaz „y=2\" + commit info propagován",
    detail: "Followers v dalším AppendEntries dostanou leaderCommit=1 a aplikují x=1 lokálně. Leader už má (t=1, y=2) ve svém logu.",
  });

  if (crashLeader) {
    // step 10 — leader dies
    states.push({
      nodes: [
        mkNode(1, "L", 1, 1, log2, 1, false),
        mkNode(2, "F", 1, 1, log1, 1),
        mkNode(3, "F", 1, 1, log1, 1),
        mkNode(4, "F", 1, 1, log1, 1),
        mkNode(5, "F", 1, 1, log1, 1),
      ],
      msgs: [],
      label: "💥 Leader (uzel 1) crash!",
      detail: "Uzel 1 spadl — followers přestávají dostávat heartbeats. Entry y=2 (idx=2) byla jen v leader logu, není committed (followers ji ještě nedostali).",
    });

    // step 11 — node 2 timeout
    states.push({
      nodes: [
        mkNode(1, "L", 1, 1, log2, 1, false),
        mkNode(2, "C", 2, 2, log1, 1),
        mkNode(3, "F", 1, 1, log1, 1),
        mkNode(4, "F", 1, 1, log1, 1),
        mkNode(5, "F", 1, 1, log1, 1),
      ],
      msgs: [],
      label: "⏰ Uzel 2: election timeout → Candidate, term=2",
      detail: "Uzel 2 zvyšuje term na 2, hlasuje pro sebe. Random election timeout zaručí, že obvykle jen jeden uzel kandiduje.",
    });

    // step 12 — RequestVote
    states.push({
      nodes: [
        mkNode(1, "L", 1, 1, log2, 1, false),
        mkNode(2, "C", 2, 2, log1, 1),
        mkNode(3, "F", 1, 1, log1, 1),
        mkNode(4, "F", 1, 1, log1, 1),
        mkNode(5, "F", 1, 1, log1, 1),
      ],
      msgs: [
        { from: 2, to: 3, kind: "RV", label: "RequestVote(t=2)" },
        { from: 2, to: 4, kind: "RV", label: "RequestVote(t=2)" },
        { from: 2, to: 5, kind: "RV", label: "RequestVote(t=2)" },
      ],
      label: "Uzel 2 posílá RequestVote (uzel 1 mrtvý)",
      detail: "Uzel 2 nemůže dosáhnout uzel 1. Ale stačí majority — 3 z 5.",
    });

    // step 13 — votes from 3, 4, 5
    states.push({
      nodes: [
        mkNode(1, "L", 1, 1, log2, 1, false),
        mkNode(2, "C", 2, 2, log1, 1),
        mkNode(3, "F", 2, 2, log1, 1),
        mkNode(4, "F", 2, 2, log1, 1),
        mkNode(5, "F", 2, 2, log1, 1),
      ],
      msgs: [
        { from: 3, to: 2, kind: "V", label: "vote ✓" },
        { from: 4, to: 2, kind: "V", label: "vote ✓" },
        { from: 5, to: 2, kind: "V", label: "vote ✓" },
      ],
      label: "Uzly 3, 4, 5 hlasují pro 2",
      detail: "Term 2 > 1, kandidát má aspoň tak nový log → followers hlasují ano.",
    });

    // step 14 — node 2 becomes leader
    states.push({
      nodes: [
        mkNode(1, "L", 1, 1, log2, 1, false),
        mkNode(2, "L", 2, 2, log1, 1),
        mkNode(3, "F", 2, 2, log1, 1),
        mkNode(4, "F", 2, 2, log1, 1),
        mkNode(5, "F", 2, 2, log1, 1),
      ],
      msgs: [
        { from: 2, to: 3, kind: "HB", label: "heartbeat t=2" },
        { from: 2, to: 4, kind: "HB", label: "heartbeat t=2" },
        { from: 2, to: 5, kind: "HB", label: "heartbeat t=2" },
      ],
      label: "✓ Uzel 2 ⇒ Leader pro term 2",
      detail: "Cluster pokračuje s novým leaderem. Záznam y=2 z předchozí term je ztracen — nikdy nebyl committed. Klient by ho musel poslat znovu.",
    });
  } else {
    // step 10 — happy path: more cmds
    const log3 = [
      { term: 1, idx: 1, cmd: "x=1" },
      { term: 1, idx: 2, cmd: "y=2" },
    ];
    states.push({
      nodes: [
        mkNode(1, "L", 1, 1, log3, 2),
        mkNode(2, "F", 1, 1, log3, 2),
        mkNode(3, "F", 1, 1, log3, 2),
        mkNode(4, "F", 1, 1, log3, 2),
        mkNode(5, "F", 1, 1, log3, 2),
      ],
      msgs: [],
      label: "✓ y=2 také commitnuté",
      detail: "Cluster je ustálený. Všechny logy synchronizované, commit-index = 2. Leader periodicky posílá heartbeats.",
    });
  }

  return states;
}

const stateBadge = {
  F: { fill: "var(--bg-card)", color: "var(--text-muted)", border: "var(--line-strong)" },
  C: { fill: "oklch(0.62 0.14 65 / 0.3)", color: "oklch(0.40 0.18 65)", border: "oklch(0.55 0.18 65)" },
  L: { fill: "oklch(0.62 0.14 142 / 0.3)", color: "oklch(0.25 0.14 142)", border: "oklch(0.55 0.18 142)" },
};

export default function RaftPraxe() {
  const [scenario, setScenario] = useState("happy");
  const [step, setStep] = useState(0);

  const states = useMemo(() => buildScenario(scenario === "crash"), [scenario]);
  const cur = states[Math.min(step, states.length - 1)];

  useMemo(() => { setStep(0); }, [scenario]);

  const W = 560, H = 400;
  // Nodes ring sized so V1 (top) clears the client box.
  const cx = W / 2, cy = 200, r = 110;
  const nodePos = (id) => {
    const a = ((id - 1) / N) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  // Client at top, far enough above V1 (which is at y = cy − r = 90) that the
  // client's bottom edge (y + 12 = 30) doesn't bite into V1's circle.
  const clientPos = { x: cx, y: 18 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Scenario controls */}
      <div className="viz-controls" style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 8 }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>scénář:</span>
        <button className="viz-btn" data-active={scenario === "happy"} onClick={() => setScenario("happy")}>volba + replikace</button>
        <button className="viz-btn" data-active={scenario === "crash"} onClick={() => setScenario("crash")}>+ pád leadera</button>
      </div>

      {/* Step nav */}
      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← předchozí</button>
        <span className="viz-readout" style={{ flex: 1, textAlign: "center" }}>
          krok {step + 1} / {states.length}
        </span>
        <button className="viz-btn primary" onClick={() => setStep(Math.min(states.length - 1, step + 1))} disabled={step >= states.length - 1}>další →</button>
        <button className="viz-btn" onClick={() => setStep(0)}>↻</button>
      </div>

      {/* Cluster SVG */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* Client */}
        <g>
          <rect x={clientPos.x - 30} y={clientPos.y - 12} width="60" height="22" rx="3" fill="var(--bg-card)" stroke="var(--line-strong)" />
          <text x={clientPos.x} y={clientPos.y + 4} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">client</text>
        </g>

        {/* Messages */}
        {cur.msgs.map((m, k) => {
          const a = m.from === 0 ? clientPos : nodePos(m.from);
          const b = m.to === 0 ? clientPos : nodePos(m.to);
          let color = "var(--text-muted)";
          if (m.kind === "RV") color = "oklch(0.55 0.18 65)";
          else if (m.kind === "V") color = "oklch(0.55 0.18 142)";
          else if (m.kind === "HB") color = "var(--accent)";
          else if (m.kind === "AE") color = "var(--accent)";
          else if (m.kind === "AK") color = "oklch(0.55 0.18 142)";
          else if (m.kind === "C") color = "oklch(0.55 0.18 22)";
          // Find midpoint and offset
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          return (
            <g key={`m-${k}`}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth="1.6" markerEnd="url(#raftArr)" opacity="0.85" />
              {k === 0 && (
                <g>
                  <rect x={mx - 50} y={my - 8} width="100" height="16" rx="3" fill="var(--bg-card)" stroke={color} strokeWidth="0.8" opacity="0.95" />
                  <text x={mx} y={my + 3.5} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fontWeight="600" fill={color}>
                    {m.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {cur.nodes.map((n) => {
          const p = nodePos(n.id);
          const badge = stateBadge[n.state];
          return (
            <g key={`n-${n.id}`} opacity={n.alive ? 1 : 0.35}>
              <circle cx={p.x} cy={p.y} r="34" fill={badge.fill} stroke={badge.border} strokeWidth="1.4"
                      strokeDasharray={n.alive ? "" : "4 3"} />
              <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill={badge.color} fontWeight="700">
                {n.state}{!n.alive && " ✗"}
              </text>
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--text)">
                V{n.id}
              </text>
              <text x={p.x} y={p.y + 18} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                t={n.term}{n.votedFor !== null ? ` ∗${n.votedFor}` : ""}
              </text>
              <text x={p.x} y={p.y + 50} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
                log: {n.log.length === 0 ? "∅" : n.log.map((e) => `${e.cmd}`).join(",")}
              </text>
              <text x={p.x} y={p.y + 62} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill={n.commit > 0 ? "oklch(0.55 0.18 142)" : "var(--text-faint)"}>
                commit={n.commit}
              </text>
            </g>
          );
        })}

        <defs>
          <marker id="raftArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="currentColor" />
          </marker>
        </defs>

        <text x={W / 2} y={392} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          F=Follower · C=Candidate · L=Leader · t=term · ∗=votedFor
        </text>
      </svg>

      {/* Description */}
      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 4 }}>{cur.label}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{cur.detail}</div>
      </div>
    </div>
  );
}
