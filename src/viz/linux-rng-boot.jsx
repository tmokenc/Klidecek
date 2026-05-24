// Linux RNG boot-time entropy starvation: desktop vs. headless server,
// kdy CRNG dosahne seeding threshold a kdy aplikace zada o random.
import { useEffect, useState } from "react";

const SCENARIOS = {
  desktop: {
    name: "Desktop (uzivatel + HDD)",
    sources: [
      { name: "bootloader seed", at: 0.2, bits: 64 },
      { name: "HDD IRQ", from: 1, to: 30, ratePerSec: 12 },
      { name: "network IRQ", from: 5, to: 30, ratePerSec: 6 },
      { name: "HID (kbd/mouse)", from: 8, to: 30, ratePerSec: 15 },
      { name: "RDRAND (Intel)", from: 0.5, to: 30, ratePerSec: 4 },
    ],
    events: [
      { at: 12, label: "uzivatel se prihlasil; ssh, gpg pripravne" },
    ],
  },
  ssd_server: {
    name: "Headless server (SSD only)",
    sources: [
      { name: "bootloader seed", at: 0.2, bits: 32 },
      { name: "SSD IRQ", from: 1, to: 30, ratePerSec: 2 },
      { name: "network IRQ", from: 4, to: 30, ratePerSec: 3 },
      { name: "RDRAND (Intel) bez trust_cpu", from: 0.5, to: 30, ratePerSec: 0.5 },
    ],
    events: [
      { at: 3, label: "sshd start: vygeneruje host RSA klic ←  HROZBA", danger: true },
    ],
  },
  iot_vm: {
    name: "Embedded VM (worst case)",
    sources: [
      { name: "(zadna bootloader seed)", at: 0.5, bits: 0 },
      { name: "minimalni IRQ", from: 1, to: 30, ratePerSec: 1 },
    ],
    events: [
      { at: 2, label: "dropbear keygen ← Heninger 2012 problem", danger: true },
    ],
  },
};

const THRESHOLD = 256; // bits needed to seed CRNG

export default function LinuxRngBoot() {
  const [scenario, setScenario] = useState("desktop");
  const sc = SCENARIOS[scenario];
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => {
      if (t >= 30) { setPlaying(false); return; }
      setT(Math.min(30, t + 0.2));
    }, 60);
    return () => clearTimeout(id);
  });

  function reset() { setT(0); setPlaying(false); }

  // Accumulate entropy up to time t
  function entropyAt(time) {
    let total = 0;
    for (const s of sc.sources) {
      if (s.at !== undefined && time >= s.at) total += s.bits;
      if (s.from !== undefined && time >= s.from) {
        const elapsed = Math.min(time, s.to) - s.from;
        total += elapsed * s.ratePerSec;
      }
    }
    return total;
  }

  const entropyNow = entropyAt(t);
  const seeded = entropyNow >= THRESHOLD;
  // When did seeding happen?
  let seedTime = null;
  for (let tt = 0; tt <= 30; tt += 0.1) {
    if (entropyAt(tt) >= THRESHOLD) { seedTime = tt; break; }
  }

  const W = 540, H = 200;

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>scenar:</label>
        <select value={scenario} onChange={(e) => { setScenario(e.target.value); reset(); }} style={{ ...sel, flex: 1, minWidth: 220 }}>
          {Object.entries(SCENARIOS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
        </select>
        <button style={btn} onClick={() => setPlaying(!playing)}>{playing ? "stop" : "play"}</button>
        <button style={btn} onClick={reset}>reset</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 580, background: "var(--bg-inset)", borderRadius: 6 }}>
        {/* axes */}
        <line x1={40} y1={H - 30} x2={W - 20} y2={H - 30} stroke="var(--line)" />
        <line x1={40} y1={20} x2={40} y2={H - 30} stroke="var(--line)" />
        <text x={40} y={H - 15} fontSize="9" textAnchor="middle" fill="var(--text-muted)">0s</text>
        <text x={W - 20} y={H - 15} fontSize="9" textAnchor="middle" fill="var(--text-muted)">30s</text>
        <text x={30} y={24} fontSize="9" textAnchor="end" fill="var(--text-muted)">512 b</text>
        <text x={30} y={H - 28} fontSize="9" textAnchor="end" fill="var(--text-muted)">0 b</text>

        {/* Threshold line */}
        <line x1={40} y1={H - 30 - (THRESHOLD / 512) * (H - 50)} x2={W - 20} y2={H - 30 - (THRESHOLD / 512) * (H - 50)}
          stroke="#81b29a" strokeWidth="1" strokeDasharray="4 3" />
        <text x={W - 24} y={H - 32 - (THRESHOLD / 512) * (H - 50)} fontSize="9" textAnchor="end" fill="#81b29a">threshold 256 b</text>

        {/* Entropy curve */}
        {(() => {
          const pts = [];
          for (let tt = 0; tt <= 30; tt += 0.2) {
            const e = Math.min(512, entropyAt(tt));
            const x = 40 + (tt / 30) * (W - 60);
            const y = H - 30 - (e / 512) * (H - 50);
            pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
          }
          return <polyline fill="none" stroke="var(--accent)" strokeWidth="1.6" points={pts.join(" ")} />;
        })()}

        {/* Current time indicator */}
        <line x1={40 + (t / 30) * (W - 60)} y1={20} x2={40 + (t / 30) * (W - 60)} y2={H - 30}
          stroke="#e07a5f" strokeWidth="1" />

        {/* Events */}
        {sc.events.map((ev, i) => {
          const x = 40 + (ev.at / 30) * (W - 60);
          const active = t >= ev.at;
          const danger = ev.danger && t >= ev.at && (seedTime === null || ev.at < seedTime);
          return (
            <g key={i}>
              <line x1={x} y1={H - 60} x2={x} y2={H - 30} stroke={danger ? "#e07a5f" : "var(--accent)"} strokeWidth="0.8" />
              <circle cx={x} cy={H - 60} r={4} fill={danger ? "#e07a5f" : active ? "var(--accent)" : "var(--bg-card)"} stroke={danger ? "#e07a5f" : "var(--accent)"} />
              <text x={x + 6} y={H - 56} fontSize="9" fill={danger ? "#e07a5f" : "var(--text)"}>{ev.label}</text>
            </g>
          );
        })}

        {/* Seed time marker */}
        {seedTime !== null && (
          <g>
            <line x1={40 + (seedTime / 30) * (W - 60)} y1={20} x2={40 + (seedTime / 30) * (W - 60)} y2={H - 30}
              stroke="#81b29a" strokeWidth="1" strokeDasharray="3 2" />
            <text x={40 + (seedTime / 30) * (W - 60) + 4} y={32} fontSize="9" fill="#81b29a">CRNG seeded @ {seedTime.toFixed(1)}s</text>
          </g>
        )}
      </svg>

      <div style={{ background: "var(--bg-inset)", padding: 8, borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 11 }}>
        <div>t = {t.toFixed(1)} s &nbsp; entropie = {Math.round(entropyNow)} b
          &nbsp; CRNG: <span style={{ color: seeded ? "#81b29a" : "#e07a5f" }}>{seeded ? "seeded" : "NEseeded"}</span>
        </div>
        <div style={{ marginTop: 4, color: "var(--text-muted)" }}>
          aktivni zdroje: {sc.sources.map((s) => s.name).join(", ")}
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Heninger et al. 2012 (Mining Your Ps and Qs): tisíce embedded zařízení (routery, IoT) sdilely RSA klíče,
        protože dropbear/openssh keygen běžel <b>před</b> CRNG seedovaním. Linux 5.6+ blokuje <span style={{ fontFamily: "var(--font-mono)" }}>getrandom()</span> dokud CRNG seedovan;
        bootloader seed (EFI variable) + RDRAND/RDSEED + <span style={{ fontFamily: "var(--font-mono)" }}>random.trust_cpu</span> resi nejhorsi pripady.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
