// toctou-timeline — Suid program access/open race. Step events; attacker
// can swap symlink between CHECK and USE. Toggle O_NOFOLLOW / drop priv.
import { useState } from "react";

const STEPS = [
  { id: "access",  who: "victim",   text: "access(\"/tmp/f\", R_OK)", note: "CHECK: euid? real uid?", t: 0 },
  { id: "swap",    who: "attacker", text: "unlink + symlink → /etc/shadow", note: "race window", t: 1 },
  { id: "open",    who: "victim",   text: "open(\"/tmp/f\", O_RDONLY)", note: "USE: follows symlink", t: 2 },
  { id: "read",    who: "victim",   text: "read(fd, buf)", note: "reads attacker's target file", t: 3 },
];

export default function ToctouTimeline() {
  const [step, setStep] = useState(0);
  const [noFollow, setNoFollow] = useState(false);
  const [dropPriv, setDropPriv] = useState(false);
  const [defended, setDefended] = useState(false); // fstat after open

  const W = 580, H = 240;
  const swapped = step >= 1;
  const opened = step >= 2;
  const read = step >= 3;

  let outcome, color;
  if (!opened) {
    outcome = "očekává se otevření souboru…";
    color = "var(--text-muted)";
  } else if (defended) {
    outcome = "✓ open + fstat(fd) — fd je vázán na original inode (i kdyby attacker swap)";
    color = "oklch(0.7 0.15 145)";
  } else if (noFollow && swapped) {
    outcome = "✓ O_NOFOLLOW → open zaselže (ELOOP) protože /tmp/f je teď symlink";
    color = "oklch(0.7 0.15 145)";
  } else if (dropPriv && swapped) {
    outcome = "✓ setuid(getuid()) předem — read s real uid, attacker target /etc/shadow inaccessible";
    color = "oklch(0.7 0.15 145)";
  } else if (swapped && read) {
    outcome = "⚠ TOCTOU exploit: /etc/shadow obsah leakován suid programem";
    color = "oklch(0.65 0.18 22)";
  } else if (swapped) {
    outcome = "race window otevřené — attacker swap byl úspěšný";
    color = "oklch(0.75 0.12 60)";
  } else {
    outcome = "ještě před race window";
    color = "var(--text-muted)";
  }

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", alignItems: "center", fontSize: 11 }}>
        <button onClick={() => setStep(Math.max(0, step - 1))} style={btn(false)}>‹ back</button>
        <button onClick={() => setStep(Math.min(STEPS.length, step + 1))} style={btn(false)}>step ›</button>
        <button onClick={() => setStep(0)} style={btn(false)}>reset</button>
        <label><input type="checkbox" checked={noFollow} onChange={e => { setNoFollow(e.target.checked); if (e.target.checked) setDefended(false); }} /> O_NOFOLLOW</label>
        <label><input type="checkbox" checked={dropPriv} onChange={e => setDropPriv(e.target.checked)} /> drop priv first</label>
        <label><input type="checkbox" checked={defended} onChange={e => { setDefended(e.target.checked); if (e.target.checked) setNoFollow(false); }} /> open + fstat (atomic)</label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* swimlanes */}
        <text x={20} y={32} fontSize="10" fontWeight="600" fill="oklch(0.65 0.16 245)">victim (suid)</text>
        <text x={20} y={100} fontSize="10" fontWeight="600" fill="oklch(0.65 0.18 22)">attacker</text>
        <line x1={20} y1={50} x2={W - 20} y2={50} stroke="var(--line)" />
        <line x1={20} y1={120} x2={W - 20} y2={120} stroke="var(--line)" />

        {STEPS.map((s, i) => {
          const x = 100 + i * 110;
          const done = step > i;
          const current = step === i + 1;
          const y = s.who === "victim" ? 50 : 120;
          return (
            <g key={s.id} opacity={done || current ? 1 : 0.35}>
              <circle cx={x} cy={y} r="7" fill={current ? "var(--accent)" : done ? "oklch(0.7 0.15 145)" : "var(--bg-inset)"} stroke="var(--line-strong)" strokeWidth="1.2" />
              <text x={x} y={y - 14} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="var(--text)">{i + 1}.</text>
              <text x={x} y={y + (s.who === "victim" ? -27 : 26)} textAnchor="middle" fontSize="9" fontFamily="ui-monospace, monospace" fill="var(--text)">{s.text}</text>
              <text x={x} y={y + (s.who === "victim" ? -40 : 39)} textAnchor="middle" fontSize="8.5" fill="var(--text-muted)">{s.note}</text>
            </g>
          );
        })}

        {/* race window highlight */}
        {step >= 1 && step <= 2 && (
          <g>
            <rect x={195} y={42} width={110} height={86} fill="oklch(0.65 0.18 22 / 0.15)" stroke="oklch(0.65 0.18 22)" strokeDasharray="4 3" strokeWidth="1.2" />
            <text x={250} y={140} textAnchor="middle" fontSize="9" fill="oklch(0.65 0.18 22)" fontWeight="600">race window</text>
          </g>
        )}

        {/* state of /tmp/f */}
        <text x={20} y={170} fontSize="10" fontWeight="600" fill="var(--text)">/tmp/f:</text>
        <rect x={70} y={158} width={490} height={20} rx="3" fill={swapped ? "oklch(0.65 0.18 22 / 0.25)" : "oklch(0.65 0.16 245 / 0.2)"} stroke="var(--line)" />
        <text x={315} y={172} textAnchor="middle" fontSize="10" fontFamily="ui-monospace, monospace" fill="var(--text)">
          {swapped ? "→ symlink → /etc/shadow (přepsáno útočníkem)" : "regular file (user-owned, world-readable)"}
        </text>

        {/* outcome */}
        <rect x={20} y={190} width={W - 40} height={36} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={W / 2} y={213} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>{outcome}</text>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        TOCTOU = <b>Time-Of-Check ≠ Time-Of-Use</b>. Mezi <code>access()</code> a <code>open()</code> útočník vymění file. Defense:
        <i>atomic ops</i> (open+fstat), <i>drop priv</i> dřív, <i>O_NOFOLLOW</i>.
      </div>
    </div>
  );
}

function btn(active) {
  return { background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", border: "1px solid var(--line)", padding: "3px 9px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
