// raft-leader-election — 5-node cluster, run leader election rounds; kill
// the current leader; observe term increments + new election.
import { useEffect, useState } from "react";

const W = 540, H = 280;

const N = 5;

function makeNodes() {
  return Array.from({ length: N }, (_, i) => ({
    id: i, term: 0, role: "follower", votedFor: null, alive: true,
  }));
}

const STAGES = ["idle", "timeout", "campaign", "leader-elected", "heartbeat"];

export default function RaftLeaderElection() {
  const [nodes, setNodes] = useState(makeNodes);
  const [stage, setStage] = useState("idle");
  const [tick, setTick] = useState(0);
  const [auto, setAuto] = useState(false);
  const [log, setLog] = useState(["term 0: all followers"]);

  function startElection() {
    setNodes(ns => {
      // pick first alive follower with no leader to start campaign
      const cand = ns.find(n => n.alive && n.role === "follower");
      if (!cand) return ns;
      const newTerm = Math.max(...ns.map(n => n.term)) + 1;
      const out = ns.map(n =>
        n.id === cand.id ? { ...n, term: newTerm, role: "candidate", votedFor: cand.id } :
        n.alive ? { ...n, term: newTerm, votedFor: null } : n
      );
      setStage("campaign");
      setLog(l => [...l, `term ${newTerm}: node ${cand.id} → candidate`]);
      return out;
    });
  }

  function collectVotes() {
    setNodes(ns => {
      const cand = ns.find(n => n.role === "candidate");
      if (!cand) return ns;
      const term = cand.term;
      // each alive follower votes for first candidate it sees (here: cand)
      const out = ns.map(n => {
        if (!n.alive) return n;
        if (n.role === "candidate") return n;
        if (n.votedFor === null) return { ...n, votedFor: cand.id, term };
        return n;
      });
      const votes = out.filter(n => n.votedFor === cand.id).length;
      const majority = Math.floor(ns.filter(n => n.alive).length / 2) + 1;
      if (votes >= majority) {
        setLog(l => [...l, `term ${term}: node ${cand.id} got ${votes}/${ns.filter(n => n.alive).length} votes → LEADER`]);
        setStage("leader-elected");
        return out.map(n => n.id === cand.id ? { ...n, role: "leader" } : n.role === "candidate" ? { ...n, role: "follower" } : n);
      }
      setLog(l => [...l, `term ${term}: ${votes} votes — no majority, retry`]);
      return out;
    });
  }

  function killLeader() {
    setNodes(ns => {
      const leader = ns.find(n => n.role === "leader");
      if (!leader) { setLog(l => [...l, "no leader to kill"]); return ns; }
      setLog(l => [...l, `node ${leader.id} CRASHED — election timer firing`]);
      setStage("timeout");
      return ns.map(n => n.id === leader.id ? { ...n, alive: false, role: "down" } :
        { ...n, role: n.role === "leader" ? "follower" : n.role, votedFor: null });
    });
  }

  function revive() {
    setNodes(ns => ns.map(n => !n.alive ? { ...n, alive: true, role: "follower", votedFor: null, term: Math.max(...ns.map(nn => nn.term)) } : n));
    setLog(l => [...l, "all downed nodes revived"]);
  }

  function reset() {
    setNodes(makeNodes());
    setStage("idle");
    setLog(["term 0: all followers"]);
  }

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => {
      setTick(t => t + 1);
      // step automaton
      const hasLeader = nodes.some(n => n.role === "leader");
      if (!hasLeader) {
        const hasCand = nodes.some(n => n.role === "candidate");
        if (hasCand) collectVotes();
        else startElection();
      } else {
        setStage("heartbeat");
      }
    }, 1300);
    return () => clearInterval(id);
  }, [auto, nodes]);

  const center = { x: W / 2, y: H / 2 - 10 };
  const r = 90;

  const colors = {
    leader: "oklch(0.7 0.15 60)",
    candidate: "oklch(0.65 0.16 145)",
    follower: "oklch(0.65 0.16 264)",
    down: "oklch(0.6 0.18 22)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button onClick={startElection} style={btn(false)}>start election</button>
        <button onClick={collectVotes} style={btn(false)}>collect votes</button>
        <button onClick={killLeader} style={btn(false)}>× kill leader</button>
        <button onClick={revive} style={btn(false)}>revive</button>
        <button onClick={() => setAuto(a => !a)} style={btn(auto)}>{auto ? "■ stop" : "▶ auto"}</button>
        <button onClick={reset} style={btn(false)}>reset</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {/* heartbeat lines from leader */}
        {nodes.find(n => n.role === "leader") && nodes.filter(n => n.role !== "leader" && n.alive).map((n) => {
          const leader = nodes.find(nn => nn.role === "leader");
          const a1 = (leader.id / N) * 2 * Math.PI - Math.PI / 2;
          const a2 = (n.id / N) * 2 * Math.PI - Math.PI / 2;
          return (
            <line key={n.id} x1={center.x + r * Math.cos(a1)} y1={center.y + r * Math.sin(a1)}
              x2={center.x + r * Math.cos(a2)} y2={center.y + r * Math.sin(a2)}
              stroke="oklch(0.7 0.15 60)" strokeWidth="0.8" strokeDasharray="3 3" opacity={0.5} />
          );
        })}

        {/* nodes */}
        {nodes.map(n => {
          const a = (n.id / N) * 2 * Math.PI - Math.PI / 2;
          const x = center.x + r * Math.cos(a);
          const y = center.y + r * Math.sin(a);
          return (
            <g key={n.id} transform={`translate(${x}, ${y})`}>
              <circle r={22} fill={n.alive ? "var(--bg-inset)" : "var(--bg-card)"} stroke={colors[n.role]} strokeWidth="2"
                opacity={n.alive ? 1 : 0.4} />
              <text x={0} y={-3} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill={colors[n.role]}>n{n.id}</text>
              <text x={0} y={9} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">{n.role}</text>
              <text x={0} y={20} textAnchor="middle" fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">term={n.term}</text>
            </g>
          );
        })}

        <text x={center.x} y={20} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">stage: {stage}</text>
      </svg>

      <div style={{ background: "var(--bg-inset)", padding: 6, borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: 10.5, minHeight: 60, maxHeight: 100, overflowY: "auto" }}>
        {log.slice(-6).map((l, i) => <div key={i} style={{ color: "var(--text-muted)" }}>{l}</div>)}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        Raft: a follower whose timeout expires becomes candidate, increments term, asks for votes. First-vote-wins: each node votes once per term.
        Majority quorum (3 of 5 here) → leader, who sends heartbeats. Kill the leader: timers fire, new election with higher term, old leader is rejected if it returns.
      </div>
    </div>
  );
}

function btn(active) {
  return {
    fontFamily: "var(--font-mono)", fontSize: 11, padding: "2px 8px",
    background: active ? "var(--accent)" : "var(--bg-inset)",
    color: active ? "var(--bg-card)" : "var(--text)",
    border: "1px solid var(--line-strong)", borderRadius: 3, cursor: "pointer",
  };
}
