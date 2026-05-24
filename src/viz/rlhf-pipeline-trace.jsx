// RLHF pipeline — SFT → reward model from preferences → PPO with KL penalty.
import { useState } from "react";

const STAGES = [
  {
    id: "sft",
    label: "1. SFT (Supervised Fine-Tuning)",
    short: "SFT",
    description: "Pre-trained LLM dotrénován na (instruction, response) párech od annotators. Učí se *odpovídat ve formátu*.",
    input: "instruction: 'Vysvětli rekurzi.'",
    output: "Rekurze je technika, kdy funkce volá sama sebe...",
    loss: "cross-entropy přes tokeny",
    paramsChanged: "celý LLM (často LoRA — adapters)",
  },
  {
    id: "rm",
    label: "2. Reward Model (Preferences → skalární odměna)",
    short: "RM",
    description: "Pro každý prompt vygenerují se 2-4 odpovědi. Lidé seřadí podle preferencí. Reward model (typicky kopie LLM s lineární hlavou) se naučí přiřazovat skalární skóre.",
    input: "(prompt, response_chosen, response_rejected)",
    output: "RM(prompt, chosen) > RM(prompt, rejected)",
    loss: "Bradley-Terry: −log σ(rθ(chosen) − rθ(rejected))",
    paramsChanged: "RM (typicky 6B-70B params)",
  },
  {
    id: "ppo",
    label: "3. PPO (Proximal Policy Optimization)",
    short: "PPO",
    description: "LLM fine-tunován RL algoritmem PPO. Reward = RM_score + −β·KL(π || π_SFT). KL penalizace zabrání 'mode collapse' (LLM by jinak našel exploit RM).",
    input: "prompt → policy generuje response → RM hodnotí",
    output: "policy update směrem k vyššímu R s KL ≤ ε",
    loss: "−E[r(τ) − β·KL(π_θ || π_ref)]",
    paramsChanged: "LLM (policy network)",
  },
];

const SAMPLE_PROMPT = "Napiš krátkou básničku o kočce.";
const SAMPLE_RESPONSES = [
  { text: "Kočka mňouká, kočka skáče, miluju ji nade vše.", rm: 0.83, chosen: true },
  { text: "kočka.kočka.kočka.kočka.kočka.kočka.", rm: 0.05, chosen: false },
];

const PPO_TRACE = [
  { step: 0,   reward: 0.30, kl: 0.01, lossPPO: -0.29 },
  { step: 10,  reward: 0.42, kl: 0.05, lossPPO: -0.40 },
  { step: 20,  reward: 0.55, kl: 0.10, lossPPO: -0.53 },
  { step: 30,  reward: 0.68, kl: 0.18, lossPPO: -0.64 },
  { step: 40,  reward: 0.74, kl: 0.27, lossPPO: -0.69 },
  { step: 50,  reward: 0.78, kl: 0.37, lossPPO: -0.71 },
];

export default function RlhfPipelineTrace() {
  const [stage, setStage] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", fontSize: 11 }}>
        {STAGES.map((s, i) => (
          <button key={s.id} onClick={() => setStage(i)}
            style={{
              background: stage === i ? "var(--accent)" : "var(--bg-card)",
              color: stage === i ? "white" : "var(--text)",
              border: "1px solid var(--line)", padding: "4px 12px", borderRadius: 3, fontSize: 11, cursor: "pointer",
              fontFamily: "var(--font-mono)", fontWeight: stage === i ? 700 : 400,
            }}>
            {s.short}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 540 70" style={{ width: "100%", display: "block", maxWidth: 620 }}>
        <rect width="540" height="70" fill="var(--bg-inset)"/>
        {STAGES.map((s, i) => {
          const x0 = 30 + i * 165;
          const active = i === stage;
          const past = i < stage;
          return (
            <g key={s.id} onClick={() => setStage(i)} style={{ cursor: "pointer" }}>
              <rect x={x0} y={14} width={150} height={42} rx={4}
                fill={active ? "color-mix(in oklch, oklch(0.7 0.18 60) 35%, var(--bg-card))" : (past ? "color-mix(in oklch, oklch(0.75 0.18 145) 28%, var(--bg-card))" : "var(--bg-card)")}
                stroke={active ? "oklch(0.7 0.18 60)" : "var(--accent)"} strokeWidth={active ? 2 : 1}/>
              <text x={x0 + 75} y={34} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fontWeight="700" fill="var(--text)">{s.short}</text>
              <text x={x0 + 75} y={48} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{s.label.replace(/^\d+\. /, "")}</text>
              {i < STAGES.length - 1 && (
                <line x1={x0 + 150} y1={35} x2={x0 + 165} y2={35} stroke="var(--accent)" strokeWidth="1.5" markerEnd="url(#rl-arr)"/>
              )}
            </g>
          );
        })}
        <defs>
          <marker id="rl-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M 0 0 L 5 3 L 0 6 z" fill="var(--accent)"/>
          </marker>
        </defs>
      </svg>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", padding: 10, borderRadius: 4, fontSize: 11, lineHeight: 1.55 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{STAGES[stage].label}</div>
        <div style={{ color: "var(--text)" }}>{STAGES[stage].description}</div>
        <div style={{ marginTop: 8, fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>vstup</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5 }}>{STAGES[stage].input}</div>
        <div style={{ marginTop: 6, fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>cíl</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5 }}>{STAGES[stage].output}</div>
        <div style={{ marginTop: 6, fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>loss</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5 }}>{STAGES[stage].loss}</div>
        <div style={{ marginTop: 6, fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>aktualizované parametry</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5 }}>{STAGES[stage].paramsChanged}</div>
      </div>

      {/* Stage-specific detail */}
      {stage === 1 && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", padding: 8, borderRadius: 4 }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>příklad: preference pair</div>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", marginBottom: 6 }}>
            <strong>prompt:</strong> {SAMPLE_PROMPT}
          </div>
          {SAMPLE_RESPONSES.map((r, i) => (
            <div key={i} style={{
              padding: "4px 8px", marginBottom: 4, borderRadius: 3,
              background: r.chosen ? "color-mix(in oklch, oklch(0.75 0.18 145) 18%, var(--bg-inset))" : "color-mix(in oklch, oklch(0.6 0.2 25) 15%, var(--bg-inset))",
              fontSize: 11, fontFamily: "var(--font-mono)",
              border: `1px solid ${r.chosen ? "oklch(0.75 0.18 145)" : "oklch(0.6 0.2 25)"}`,
            }}>
              {r.chosen ? "✓ chosen" : "✗ rejected"} (RM = {r.rm.toFixed(2)}): {r.text}
            </div>
          ))}
        </div>
      )}

      {stage === 2 && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", padding: 8, borderRadius: 4 }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>PPO trace</div>
          <svg viewBox="0 0 520 140" style={{ width: "100%", maxWidth: 600 }}>
            <rect width="520" height="140" fill="var(--bg-inset)"/>
            <line x1="40" y1="20" x2="40" y2="120" stroke="var(--line)" strokeWidth="0.5"/>
            <line x1="40" y1="120" x2="500" y2="120" stroke="var(--line)" strokeWidth="0.5"/>
            <path d={PPO_TRACE.map((p, i) => `${i === 0 ? "M" : "L"}${40 + (p.step / 50) * 460} ${120 - p.reward * 95}`).join(" ")}
              stroke="oklch(0.75 0.18 145)" strokeWidth="1.8" fill="none"/>
            <path d={PPO_TRACE.map((p, i) => `${i === 0 ? "M" : "L"}${40 + (p.step / 50) * 460} ${120 - p.kl * 200}`).join(" ")}
              stroke="oklch(0.7 0.2 30)" strokeWidth="1.8" fill="none" strokeDasharray="4 2"/>
            <text x={48} y={26} fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.78 0.18 145)">— reward</text>
            <text x={140} y={26} fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.78 0.18 30)">- - KL(π||π_SFT)</text>
            <text x={500} y={134} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">PPO step</text>
          </svg>
        </div>
      )}

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        RLHF: <strong>SFT</strong> dá modelu styl (instruction following), <strong>RM</strong> převede preference na skóre,
        <strong> PPO</strong> používá RM jako odměnu pro RL. KL k SFT referenci brání modelu, aby &quot;přechytračil&quot; RM
        (reward hacking). Alternativy: DPO (jen 2 stages, bez explicitního RM), Constitutional AI (Claude — místo lidí AI sebehodnotí podle principů).
      </div>
    </div>
  );
}
