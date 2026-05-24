// 5-stage MIPS pipeline visualizer with hazard detection and forwarding.
import { useState } from "react";

const STAGES = ["IF", "ID", "EX", "MA", "WB"];
const STAGE_COLORS = ["#5b8def", "#7c5bef", "#ef5b8d", "#ef8d5b", "#5befef"];

const PROGRAMS = {
  noHazards: {
    name: "Bez konfliktů",
    insts: [
      { id: 0, txt: "add r1, r2, r3", dst: "r1", src: ["r2", "r3"], type: "alu" },
      { id: 1, txt: "sub r4, r5, r6", dst: "r4", src: ["r5", "r6"], type: "alu" },
      { id: 2, txt: "mul r7, r8, r9", dst: "r7", src: ["r8", "r9"], type: "alu" },
      { id: 3, txt: "or  r10,r11,r12", dst: "r10", src: ["r11", "r12"], type: "alu" },
    ],
  },
  rawHazard: {
    name: "RAW konflikt (EX→EX bypass)",
    insts: [
      { id: 0, txt: "add r1, r2, r3", dst: "r1", src: ["r2", "r3"], type: "alu" },
      { id: 1, txt: "sub r4, r1, r5", dst: "r4", src: ["r1", "r5"], type: "alu" },
      { id: 2, txt: "or  r6, r4, r7", dst: "r6", src: ["r4", "r7"], type: "alu" },
      { id: 3, txt: "and r8, r9, r10", dst: "r8", src: ["r9", "r10"], type: "alu" },
    ],
  },
  loadUse: {
    name: "Load-use stall (1 takt)",
    insts: [
      { id: 0, txt: "lw  r4, 0(r1)", dst: "r4", src: ["r1"], type: "load" },
      { id: 1, txt: "add r5, r4, r2", dst: "r5", src: ["r4", "r2"], type: "alu" },
      { id: 2, txt: "sub r6, r5, r3", dst: "r6", src: ["r5", "r3"], type: "alu" },
      { id: 3, txt: "or  r7, r8, r9", dst: "r7", src: ["r8", "r9"], type: "alu" },
    ],
  },
};

function simulate(insts, forwarding) {
  const schedule = [];
  const completion = []; // when each instruction finishes WB
  for (let i = 0; i < insts.length; i++) {
    const inst = insts[i];
    let startIF;
    if (i === 0) startIF = 0;
    else startIF = schedule[i - 1].IF + 1;
    let startID = startIF + 1;
    let startEX = startID + 1;

    // Hazard detection: scan previous instructions for RAW
    for (let j = i - 1; j >= 0; j--) {
      const prev = insts[j];
      if (prev.dst && inst.src.includes(prev.dst)) {
        // Need value from prev at start of EX
        let availableAt;
        if (prev.type === "load") {
          // load produces value at end of MA
          availableAt = schedule[j].MA + 1;
        } else if (forwarding) {
          // alu: EX→EX bypass, value ready at end of EX
          availableAt = schedule[j].EX + 1;
        } else {
          // no forwarding: must wait for WB
          availableAt = schedule[j].WB + 1;
        }
        if (availableAt > startEX) {
          // stall: delay EX
          const delay = availableAt - startEX;
          startEX += delay;
          startID += delay;
        }
        break; // closest dependency dominates
      }
    }

    schedule.push({
      IF: startIF,
      ID: startID,
      EX: startEX,
      MA: startEX + 1,
      WB: startEX + 2,
    });
    completion.push(startEX + 2);
  }
  return schedule;
}

const CELL = 36;
const ROW = 30;
const LABEL_W = 130;

export default function PipelineHazards() {
  const [progKey, setProgKey] = useState("rawHazard");
  const [forwarding, setForwarding] = useState(true);
  const prog = PROGRAMS[progKey];
  const schedule = simulate(prog.insts, forwarding);
  const maxCycle = Math.max(...schedule.map((s) => s.WB)) + 1;
  const W = LABEL_W + maxCycle * CELL + 20;
  const H = prog.insts.length * ROW + 60;

  const cpi = (schedule[schedule.length - 1].WB + 1) / prog.insts.length;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <select
          value={progKey}
          onChange={(e) => setProgKey(e.target.value)}
          style={{
            background: "var(--bg-inset)",
            color: "var(--text)",
            border: "1px solid var(--line)",
            padding: "4px 8px",
            borderRadius: 4,
          }}
        >
          {Object.keys(PROGRAMS).map((k) => (
            <option key={k} value={k}>
              {PROGRAMS[k].name}
            </option>
          ))}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text)" }}>
          <input
            type="checkbox"
            checked={forwarding}
            onChange={(e) => setForwarding(e.target.checked)}
          />
          Forwarding (bypass)
        </label>
        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
          CPI = {cpi.toFixed(2)} (ideál: 1.00)
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", maxWidth: 700, fontFamily: "ui-sans-serif, system-ui" }}
      >
        {/* Cycle header */}
        <g fontSize="10" fill="var(--text-muted)" textAnchor="middle">
          {Array.from({ length: maxCycle }).map((_, c) => (
            <text key={c} x={LABEL_W + c * CELL + CELL / 2} y={15}>
              t{c}
            </text>
          ))}
        </g>

        {/* Grid lines */}
        <g stroke="var(--line)" strokeWidth="0.4">
          {Array.from({ length: maxCycle + 1 }).map((_, c) => (
            <line
              key={c}
              x1={LABEL_W + c * CELL}
              y1={25}
              x2={LABEL_W + c * CELL}
              y2={H - 25}
            />
          ))}
          {prog.insts.map((_, i) => (
            <line
              key={i}
              x1={0}
              y1={25 + i * ROW}
              x2={LABEL_W + maxCycle * CELL}
              y2={25 + i * ROW}
            />
          ))}
        </g>

        {/* Instructions and stages */}
        {prog.insts.map((inst, i) => {
          const s = schedule[i];
          return (
            <g key={i}>
              <text
                x={5}
                y={25 + i * ROW + ROW / 2 + 4}
                fill="var(--text)"
                fontFamily="ui-monospace, monospace"
                fontSize="11"
              >
                {inst.txt}
              </text>
              {STAGES.map((stage, si) => {
                const cyc = s[stage];
                const stallBefore = stage === "EX" ? s.EX - s.ID - 1 : 0;
                return (
                  <g key={stage}>
                    {/* Stall cells before EX */}
                    {stage === "EX" &&
                      Array.from({ length: stallBefore }).map((_, k) => (
                        <rect
                          key={k}
                          x={LABEL_W + (s.ID + 1 + k) * CELL + 2}
                          y={25 + i * ROW + 3}
                          width={CELL - 4}
                          height={ROW - 6}
                          fill="var(--bg-inset)"
                          stroke="var(--text-faint)"
                          strokeDasharray="2 2"
                          rx="2"
                        />
                      ))}
                    {stage === "EX" &&
                      Array.from({ length: stallBefore }).map((_, k) => (
                        <text
                          key={"t" + k}
                          x={LABEL_W + (s.ID + 1 + k) * CELL + CELL / 2}
                          y={25 + i * ROW + ROW / 2 + 4}
                          textAnchor="middle"
                          fontSize="10"
                          fill="var(--text-faint)"
                        >
                          —
                        </text>
                      ))}
                    <rect
                      x={LABEL_W + cyc * CELL + 2}
                      y={25 + i * ROW + 3}
                      width={CELL - 4}
                      height={ROW - 6}
                      fill={STAGE_COLORS[si]}
                      opacity="0.7"
                      rx="2"
                    />
                    <text
                      x={LABEL_W + cyc * CELL + CELL / 2}
                      y={25 + i * ROW + ROW / 2 + 4}
                      textAnchor="middle"
                      fontSize="10"
                      fill="white"
                      fontWeight="600"
                    >
                      {stage}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Footer */}
        <text
          x={W / 2}
          y={H - 5}
          textAnchor="middle"
          fill="var(--text-faint)"
          fontSize="10"
        >
          {forwarding
            ? "Forwarding zapnut: bypass EX→EX, MA→EX. Load-use stále 1 stall."
            : "Bez forwardingu: RAW = čekání na WB. Hodně stallů."}
        </text>
      </svg>
    </div>
  );
}
