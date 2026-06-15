// Agent decision-flow — vacuum world; pick agent type (reflex / model / goal / utility / learning) and trace decision per percept.
import { useState } from "react";

// Vacuum world: 2 cells A,B. State = (agentLoc, dirtA, dirtB).
// Percepts: (atA?, dirty?) — partial observability.

const SCENARIO = {
  initialStates: [
    { agent: "A", dirtA: true, dirtB: true, label: "S1 — A, oba dirty" },
    { agent: "A", dirtA: false, dirtB: true, label: "S2 — A, B dirty" },
    { agent: "B", dirtA: true, dirtB: false, label: "S3 — B, A dirty" },
    { agent: "B", dirtA: false, dirtB: false, label: "S4 — B, oba clean" },
  ],
};

const AGENT_TYPES = [
  {
    id: "reflex",
    label: "1. Simple reflex",
    decide: (percept) => {
      if (percept.dirty) return "Suck";
      return percept.atA ? "R" : "L";
    },
    desc: "Mapuje aktuální vjem → akce přes pravidla. Žádná paměť. Selhává v částečně pozorovatelných prostředích.",
    memoryUsed: false,
    modelUsed: false,
    goalUsed: false,
    utilityUsed: false,
  },
  {
    id: "model",
    label: "2. Model-based reflex",
    decide: (percept, mem) => {
      // remembers other cell's last known state
      if (percept.dirty) return "Suck";
      const otherDirty = percept.atA ? mem.bDirty : mem.aDirty;
      if (otherDirty) return percept.atA ? "R" : "L";
      return "Idle"; // both clean according to memory
    },
    desc: "Drží *vnitřní model* světa (např. paměť posledních vjemů). Lépe zvládá partial observability.",
    memoryUsed: true,
    modelUsed: true,
    goalUsed: false,
    utilityUsed: false,
  },
  {
    id: "goal",
    label: "3. Goal-based",
    decide: (percept, mem) => {
      // goal = both clean
      const goalReached = mem.aDirty === false && mem.bDirty === false && !percept.dirty;
      if (goalReached) return "Idle ✓ goal";
      if (percept.dirty) return "Suck";
      return percept.atA ? "R" : "L";
    },
    desc: "Plánuje akce podle *cíle* (oba clean). Cíl explicitní, akce se vybírají podle jejich vlivu na dosažení cíle.",
    memoryUsed: true,
    modelUsed: true,
    goalUsed: true,
    utilityUsed: false,
  },
  {
    id: "utility",
    label: "4. Utility-based",
    decide: (percept, mem) => {
      // utility = -energy used - dirt remaining
      if (percept.dirty) return "Suck (U=-1, vyčistí)";
      const otherDirty = percept.atA ? mem.bDirty : mem.aDirty;
      if (otherDirty) return percept.atA ? "R (U=-1, pro Suck)" : "L (U=-1, pro Suck)";
      return "Idle (U=0)";
    },
    desc: "Volí akci maximalizující *užitkovou funkci* (např. -energy - dirt). Umí kompromisy. Optimální pro multikriteriální cíle.",
    memoryUsed: true,
    modelUsed: true,
    goalUsed: true,
    utilityUsed: true,
  },
  {
    id: "learning",
    label: "5. Learning",
    decide: (percept) => {
      return percept.dirty ? "Suck (Q-learning)" : "explore (ε-greedy)";
    },
    desc: "Adaptuje se zkušeností. Performance prvek + learning prvek + critic + problem generator. Nepotřebuje explicitní model.",
    memoryUsed: true,
    modelUsed: false,
    goalUsed: false,
    utilityUsed: true,
  },
];

export default function AgentDecisionFlow() {
  const [agentIdx, setAgentIdx] = useState(0);
  const [stateIdx, setStateIdx] = useState(0);
  const [memory, setMemory] = useState({ aDirty: undefined, bDirty: undefined });

  const state = SCENARIO.initialStates[stateIdx];
  const agent = AGENT_TYPES[agentIdx];

  const percept = {
    atA: state.agent === "A",
    dirty: state.agent === "A" ? state.dirtA : state.dirtB,
  };

  // For model-based, simulate accumulated memory
  const mem = {
    aDirty: percept.atA ? percept.dirty : (memory.aDirty ?? state.dirtA),
    bDirty: !percept.atA ? percept.dirty : (memory.bDirty ?? state.dirtB),
  };

  const action = agent.decide(percept, mem);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        <span style={{ color: "var(--text-muted)" }}>typ agenta:</span>
        <select className="viz-select" value={agentIdx} onChange={(e) => setAgentIdx(+e.target.value)}>
          {AGENT_TYPES.map((a, i) => <option key={a.id} value={i}>{a.label}</option>)}
        </select>
        <span style={{ color: "var(--text-muted)" }}>stav:</span>
        <select className="viz-select" value={stateIdx} onChange={(e) => setStateIdx(+e.target.value)}>
          {SCENARIO.initialStates.map((s, i) => <option key={i} value={i}>{s.label}</option>)}
        </select>
      </div>

      <svg viewBox="0 0 540 280" style={{ width: "100%", display: "block", maxWidth: 620 }}>
        <rect width="540" height="280" fill="var(--bg-inset)"/>
        {/* World view */}
        <g>
          <text x={30} y={18} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">SVĚT</text>
          {["A", "B"].map((cell, i) => {
            const x = 30 + i * 90;
            const dirty = cell === "A" ? state.dirtA : state.dirtB;
            return (
              <g key={cell}>
                <rect x={x} y={30} width={70} height={70}
                  fill={dirty ? "color-mix(in oklch, oklch(0.6 0.18 60) 35%, var(--bg-card))" : "var(--bg-card)"}
                  stroke="var(--accent)" strokeWidth="1.2"/>
                <text x={x + 35} y={50} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text)">{cell}</text>
                <text x={x + 35} y={70} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{dirty ? "dirty" : "clean"}</text>
                {state.agent === cell && (
                  <circle cx={x + 35} cy={88} r="8" fill="oklch(0.65 0.18 240)" stroke="white" strokeWidth="1.5"/>
                )}
              </g>
            );
          })}
        </g>

        {/* Percept */}
        <g transform="translate(230, 30)">
          <rect x={0} y={0} width={140} height={70} rx={4} fill="color-mix(in oklch, oklch(0.7 0.2 60) 20%, var(--bg-card))" stroke="oklch(0.7 0.2 60)" strokeWidth="1.4"/>
          <text x={70} y={16} textAnchor="middle" fontSize="10" fill="var(--text-muted)" textTransform="uppercase">PERCEPT</text>
          <text x={70} y={36} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">
            atA: <strong>{percept.atA ? "true" : "false"}</strong>
          </text>
          <text x={70} y={54} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">
            dirty: <strong>{percept.dirty ? "true" : "false"}</strong>
          </text>
        </g>

        {/* Agent internals */}
        <g transform="translate(30, 130)">
          <rect x={0} y={0} width={340} height={130} rx={4} fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.4"/>
          <text x={170} y={18} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">{agent.label}</text>
          {[
            { key: "memoryUsed", label: "Memory" },
            { key: "modelUsed", label: "Model světa" },
            { key: "goalUsed", label: "Goal" },
            { key: "utilityUsed", label: "Utility" },
          ].map((c, i) => {
            const used = agent[c.key];
            return (
              <g key={c.key}>
                <rect x={14 + i * 80} y={36} width={70} height={28} rx={3}
                  fill={used ? "color-mix(in oklch, oklch(0.75 0.18 145) 30%, var(--bg-card))" : "var(--bg-inset)"}
                  stroke={used ? "oklch(0.75 0.18 145)" : "var(--line)"} strokeWidth="1"/>
                <text x={14 + i * 80 + 35} y={54} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill={used ? "var(--text)" : "var(--text-faint)"}>
                  {c.label}
                </text>
                <text x={14 + i * 80 + 35} y={64} textAnchor="middle" fontSize="8" fill={used ? "oklch(0.78 0.18 145)" : "var(--text-faint)"}>
                  {used ? "✓" : "—"}
                </text>
              </g>
            );
          })}
          <foreignObject x={14} y={84} width={312} height={40}>
            <div style={{ fontSize: 9, color: "var(--text-muted)", lineHeight: 1.4, fontFamily: "inherit" }}>{agent.desc}</div>
          </foreignObject>
        </g>

        {/* Action output */}
        <g transform="translate(400, 130)">
          <rect x={0} y={0} width={120} height={130} rx={4} fill="color-mix(in oklch, oklch(0.7 0.18 145) 28%, var(--bg-card))" stroke="oklch(0.7 0.18 145)" strokeWidth="1.4"/>
          <text x={60} y={18} textAnchor="middle" fontSize="10" fill="var(--text-muted)" textTransform="uppercase">ACTION</text>
          <text x={60} y={70} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text)" fontFamily="var(--font-mono)">
            {action}
          </text>
        </g>
      </svg>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Stavební bloky (Russell & Norvig). Simple reflex: vjem → akce (lookup table).
        Model-based: drží stav. Goal-based: explicitní cíl. Utility-based: vážená utilita.
        Learning agent: vše výše + learning element (může se zlepšovat ze zkušenosti).
      </div>
    </div>
  );
}
