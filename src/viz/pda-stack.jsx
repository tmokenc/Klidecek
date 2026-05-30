// PDA — interaktivní vizualizace zásobníku.
// Dva presety: {0^n 1^n} (deterministický) a palindromy {w w^R} (nedeterministický).
// Pro nedeterministický stroj: u rozhodovacího bodu (ε-přechod doprostřed) si volíš.
// Trace ručně ověřen pro vstup 0011, abba, abc.
import { useState, useMemo } from "react";

const EPS = "ε";
const BOTTOM = "Z";

// Rule: { from, read, pop, to, push }   push is bottom-of-stack-first string of chars
// "" means pop without push
const PRESETS = {
  "{0^n 1^n}": {
    desc: "Přijímá slova ve tvaru 0^n 1^n (n ≥ 0) přechodem do koncového stavu.",
    states: ["q0", "q1", "qF"],
    final: ["qF"],
    init: "0011",
    rules: [
      { from: "q0", read: "0", pop: BOTTOM, to: "q0", push: "0" + BOTTOM },
      { from: "q0", read: "0", pop: "0", to: "q0", push: "00" },
      { from: "q0", read: "1", pop: "0", to: "q1", push: "" },
      { from: "q1", read: "1", pop: "0", to: "q1", push: "" },
      { from: "q1", read: EPS, pop: BOTTOM, to: "qF", push: BOTTOM },
      { from: "q0", read: EPS, pop: BOTTOM, to: "qF", push: BOTTOM },
    ],
  },
  "palindromy {w w^R}": {
    desc: "Nedeterministický PDA pro palindromy nad {a,b} sudé délky. V rozhodovacím okamžiku můžeš zvolit ε-přechod (hádej střed).",
    states: ["q0", "q1", "qF"],
    final: ["qF"],
    init: "abba",
    rules: [
      { from: "q0", read: "a", pop: BOTTOM, to: "q0", push: "a" + BOTTOM },
      { from: "q0", read: "b", pop: BOTTOM, to: "q0", push: "b" + BOTTOM },
      { from: "q0", read: "a", pop: "a", to: "q0", push: "aa" },
      { from: "q0", read: "a", pop: "b", to: "q0", push: "ab" },
      { from: "q0", read: "b", pop: "a", to: "q0", push: "ba" },
      { from: "q0", read: "b", pop: "b", to: "q0", push: "bb" },
      { from: "q0", read: EPS, pop: "a", to: "q1", push: "a" },
      { from: "q0", read: EPS, pop: "b", to: "q1", push: "b" },
      { from: "q0", read: EPS, pop: BOTTOM, to: "qF", push: BOTTOM },
      { from: "q1", read: "a", pop: "a", to: "q1", push: "" },
      { from: "q1", read: "b", pop: "b", to: "q1", push: "" },
      { from: "q1", read: EPS, pop: BOTTOM, to: "qF", push: BOTTOM },
    ],
  },
};

function applicableRules(rules, state, input, stack) {
  const top = stack[stack.length - 1];
  const next = input[0];
  return rules.filter((r) => {
    if (r.from !== state) return false;
    if (r.pop !== top) return false;
    if (r.read !== EPS && r.read !== next) return false;
    return true;
  });
}

function applyRule(config, rule) {
  const newStack = config.stack.slice(0, -1);
  for (const ch of rule.push.split("").reverse()) newStack.push(ch);
  return {
    state: rule.to,
    input: rule.read === EPS ? config.input : config.input.slice(1),
    stack: newStack,
    lastRule: rule,
  };
}

export default function PdaStack() {
  const [presetKey, setPresetKey] = useState("{0^n 1^n}");
  const preset = PRESETS[presetKey];
  const [config, setConfig] = useState({
    state: preset.states[0],
    input: preset.init,
    stack: [BOTTOM],
    lastRule: null,
  });
  const [history, setHistory] = useState([]);

  useMemo(() => {
    const p = PRESETS[presetKey];
    setConfig({
      state: p.states[0],
      input: p.init,
      stack: [BOTTOM],
      lastRule: null,
    });
    setHistory([]);
    return null;
  }, [presetKey]);

  const isAccepting =
    preset.final.includes(config.state) &&
    config.input.length === 0;

  const choices = applicableRules(preset.rules, config.state, config.input, config.stack);

  function choose(rule) {
    setHistory([...history, config]);
    setConfig(applyRule(config, rule));
  }
  function doBack() {
    if (!history.length) return;
    setConfig(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  }
  function doReset() {
    setConfig({
      state: preset.states[0],
      input: preset.init,
      stack: [BOTTOM],
      lastRule: null,
    });
    setHistory([]);
  }

  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ fontSize: 12, color: "var(--text-muted)" }}>Preset:</label>
        <select value={presetKey} onChange={(e) => setPresetKey(e.target.value)} style={selectStyle}>
          {Object.keys(PRESETS).map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{preset.desc}</div>

      <svg viewBox="0 0 540 240" style={{ width: "100%", maxWidth: 620, alignSelf: "center" }} fontFamily="var(--font-mono, ui-monospace)" fontSize="13">
        {/* input tape */}
        <text x={20} y={28} fill="var(--text-muted)" fontSize="11">vstup (zbývá):</text>
        {config.input.split("").map((ch, i) => (
          <g key={"in" + i}>
            <rect x={20 + i * 28} y={36} width={28} height={28} fill={i === 0 ? "color-mix(in oklch, var(--accent) 25%, var(--bg-card))" : "var(--bg-inset)"} stroke="var(--line)" />
            <text x={20 + i * 28 + 14} y={56} textAnchor="middle" fill="var(--text)">{ch}</text>
          </g>
        ))}
        {config.input.length === 0 && (
          <text x={20} y={56} fill="var(--text-faint)" fontSize="12">(prázdný)</text>
        )}
        {/* state */}
        <text x={20} y={100} fill="var(--text-muted)" fontSize="11">stav:</text>
        <g>
          <rect x={20} y={108} width={70} height={32} rx={16} fill={isAccepting ? "color-mix(in oklch, var(--accent) 30%, var(--bg-card))" : "var(--bg-inset)"} stroke="var(--accent)" strokeWidth={isAccepting ? 2 : 1.2} />
          <text x={55} y={128} textAnchor="middle" fill="var(--text)">{config.state}{isAccepting && " ✓"}</text>
        </g>
        {/* stack */}
        <text x={516} y={20} textAnchor="end" fill="var(--text-muted)" fontSize="11">zásobník</text>
        <text x={516} y={32} textAnchor="end" fill="var(--text-muted)" fontSize="11">(vrchol nahoře):</text>
        {config.stack.slice().reverse().map((ch, i) => (
          <g key={"st" + i}>
            <rect x={460} y={36 + i * 28} width={56} height={28} fill={i === 0 ? "color-mix(in oklch, var(--accent) 25%, var(--bg-card))" : "var(--bg-inset)"} stroke="var(--line)" />
            <text x={488} y={56 + i * 28} textAnchor="middle" fill="var(--text)">{ch}</text>
          </g>
        ))}
        {/* last rule */}
        {config.lastRule && (
          <text x={20} y={180} fill="var(--text-muted)" fontSize="12">
            δ({config.lastRule.from}, {config.lastRule.read}, {config.lastRule.pop}) ∋ ({config.lastRule.to}, {config.lastRule.push || EPS})
          </text>
        )}
        <text x={20} y={210} fill="var(--text-faint)" fontSize="11">krok: {history.length}{isAccepting && " — přijato"}</text>
      </svg>

      {/* choices */}
      {!isAccepting && choices.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {choices.length > 1 ? "Více pravidel — vyber:" : "Aplikuj pravidlo:"}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {choices.map((r, i) => (
              <button key={i} onClick={() => choose(r)} style={{ ...btnStyle, fontFamily: "var(--font-mono, ui-monospace)", fontSize: 11 }}>
                {r.read}, {r.pop} → {r.push || EPS}, do {r.to}
              </button>
            ))}
          </div>
        </div>
      )}
      {!isAccepting && choices.length === 0 && (
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Žádné použitelné pravidlo — stroj zamítl.</div>
      )}

      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button onClick={doBack} disabled={!history.length} style={btnStyle}>◀ zpět</button>
        <button onClick={doReset} style={btnStyle}>reset</button>
      </div>
    </div>
  );
}

const containerStyle = {
  padding: 16,
  borderRadius: 12,
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const selectStyle = {
  padding: "4px 8px",
  background: "var(--bg-inset)",
  color: "var(--text)",
  border: "1px solid var(--line)",
  borderRadius: 6,
};

const btnStyle = {
  padding: "6px 12px",
  background: "var(--bg-inset)",
  color: "var(--text)",
  border: "1px solid var(--line)",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 12,
};
