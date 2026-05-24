// Keystroke dynamics: type a target phrase, capture dwell + flight times,
// compare against an enrolled rhythm.
import { useEffect, useRef, useState } from "react";

const PHRASE = "biometrika";

// Two enrolled "users" — each character has expected mean dwell + flight (ms)
const USERS = {
  alice: {
    label: "Alice (rychlý typist)",
    dwell: { b: 80, i: 70, o: 75, m: 95, e: 70, t: 85, r: 90, k: 88, a: 65 },
    flight: { "b-i": 60, "i-o": 80, "o-m": 70, "m-e": 95, "e-t": 110, "t-r": 60, "r-i": 65, "i-k": 100, "k-a": 75 },
    var: 8,
  },
  bob: {
    label: "Bob (pomalý, jistý)",
    dwell: { b: 130, i: 110, o: 120, m: 145, e: 115, t: 130, r: 140, k: 135, a: 110 },
    flight: { "b-i": 150, "i-o": 180, "o-m": 160, "m-e": 200, "e-t": 220, "t-r": 150, "r-i": 145, "i-k": 220, "k-a": 170 },
    var: 18,
  },
};

export default function KeystrokeRhythm() {
  const [enrolled, setEnrolled] = useState("alice");
  const [typed, setTyped] = useState("");
  const [keyLog, setKeyLog] = useState([]); // {key, down, up}
  const downRef = useRef({});
  const lastUpRef = useRef(null);

  const u = USERS[enrolled];
  const PHR = PHRASE.split("");

  function onKey(e) {
    if (e.type === "keydown") {
      const k = e.key.toLowerCase();
      if (downRef.current[k]) return; // ignore autorepeat
      downRef.current[k] = performance.now();
    } else if (e.type === "keyup") {
      const k = e.key.toLowerCase();
      const down = downRef.current[k];
      if (!down) return;
      const up = performance.now();
      delete downRef.current[k];
      if (!PHR.includes(k)) return;
      const flight = lastUpRef.current != null ? down - lastUpRef.current : 0;
      lastUpRef.current = up;
      setKeyLog((l) => [...l, { key: k, down: up - down, flight }]);
      setTyped((t) => t + k);
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("keyup", onKey); };
  }, [enrolled]);

  function reset() {
    setTyped(""); setKeyLog([]); downRef.current = {}; lastUpRef.current = null;
  }

  // Simulate "typing" for demo if user can't focus
  function simulate(which) {
    reset();
    const v = USERS[which];
    const log = [];
    for (let i = 0; i < PHR.length; i++) {
      const k = PHR[i];
      const dwell = v.dwell[k] + (Math.random() - 0.5) * v.var * 2;
      const flight = i === 0 ? 0 : (v.flight[`${PHR[i-1]}-${k}`] || 100) + (Math.random() - 0.5) * v.var * 2;
      log.push({ key: k, down: dwell, flight });
    }
    setTimeout(() => { setKeyLog(log); setTyped(PHRASE); }, 50);
  }

  // Mahalanobis-ish distance
  const distance = (() => {
    if (keyLog.length < PHR.length) return null;
    let d = 0, n = 0;
    for (let i = 0; i < PHR.length; i++) {
      const k = PHR[i];
      const expD = u.dwell[k];
      const expF = i === 0 ? 0 : u.flight[`${PHR[i-1]}-${k}`];
      const dwell = keyLog[i].down;
      const flight = i === 0 ? 0 : keyLog[i].flight;
      d += Math.pow((dwell - expD) / u.var, 2);
      n++;
      if (i > 0) { d += Math.pow((flight - expF) / (u.var * 1.5), 2); n++; }
    }
    return Math.sqrt(d / n);
  })();

  const completed = typed === PHRASE;
  const verdict = distance == null ? null : (distance < 2.5 ? "MATCH" : "REJECT");

  // SVG profile plot
  const W = 540, H = 180;
  const xStep = (W - 50) / PHR.length;
  const maxY = 250;
  const y2px = (v) => H - 20 - (v / maxY) * (H - 40);

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>enrolled user:</label>
        <select value={enrolled} onChange={(e) => setEnrolled(e.target.value)} style={sel}>
          {Object.entries(USERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button style={btn} onClick={() => simulate("alice")}>simulovat Alice</button>
        <button style={btn} onClick={() => simulate("bob")}>simulovat Bob</button>
        <button style={btn} onClick={reset}>reset</button>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>napište přesně:</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, letterSpacing: 4 }}>
          {PHR.map((c, i) => (
            <span key={i} style={{ color: i < typed.length ? (typed[i] === c ? "rgb(64,192,87)" : "rgb(220,80,80)") : "var(--text-muted)" }}>{c}</span>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{completed ? "✓ celé fráze napsáno" : `${typed.length}/${PHR.length}`}</div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 700, background: "var(--bg-inset)", borderRadius: 6 }}>
        <text x={10} y={14} fontSize="10" fill="rgb(64,192,87)">● dwell (stisk)</text>
        <text x={130} y={14} fontSize="10" fill="rgb(220,140,80)">● flight (mezi)</text>
        <text x={250} y={14} fontSize="10" fill="var(--text-muted)">─ enrolled profil (Alice/Bob)</text>
        {/* enrolled reference */}
        {PHR.map((k, i) => i > 0 ? (
          <g key={`ef${i}`}>
            <rect x={20 + i * xStep - 14} y={y2px(u.flight[`${PHR[i-1]}-${k}`])} width="6" height={H - 20 - y2px(u.flight[`${PHR[i-1]}-${k}`])} fill="rgba(220,140,80,0.3)" />
          </g>
        ) : null)}
        {PHR.map((k, i) => (
          <g key={`ed${i}`}>
            <rect x={20 + i * xStep - 6} y={y2px(u.dwell[k])} width="6" height={H - 20 - y2px(u.dwell[k])} fill="rgba(64,192,87,0.3)" />
          </g>
        ))}
        {/* user observed */}
        {keyLog.map((rec, i) => i > 0 ? (
          <rect key={`f${i}`} x={20 + i * xStep - 14} y={y2px(rec.flight)} width="6" height={Math.max(0, H - 20 - y2px(rec.flight))} fill="rgb(220,140,80)" />
        ) : null)}
        {keyLog.map((rec, i) => (
          <rect key={`d${i}`} x={20 + i * xStep - 6} y={y2px(rec.down)} width="6" height={Math.max(0, H - 20 - y2px(rec.down))} fill="rgb(64,192,87)" />
        ))}
        {/* labels */}
        {PHR.map((k, i) => (
          <text key={`lbl${i}`} x={20 + i * xStep - 3} y={H - 6} fontSize="11" textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)">{k}</text>
        ))}
        <line x1={30} y1={H - 20} x2={W - 20} y2={H - 20} stroke="var(--text-muted)" />
        <text x={4} y={y2px(100)} fontSize="9" fill="var(--text-muted)">100ms</text>
        <line x1={30} y1={y2px(100)} x2={W - 20} y2={y2px(100)} stroke="rgba(150,150,150,0.2)" strokeDasharray="2 2" />
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={statBox}>
          <div style={statLbl}>Mahalanobis dist.</div>
          <div style={statVal}>{distance == null ? "–" : distance.toFixed(2)}</div>
        </div>
        <div style={statBox}>
          <div style={statLbl}>verdikt (threshold 2.5)</div>
          <div style={{ ...statVal, color: verdict === "MATCH" ? "rgb(64,192,87)" : verdict === "REJECT" ? "rgb(220,80,80)" : "var(--text-muted)" }}>{verdict ?? "–"}</div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Klikněte sem do okna a napište slovo "{PHRASE}" — nebo použijte "simulovat" tlačítka.
        Dwell = doba stisku klávesy, flight = doba mezi vypuštěním jedné a stiskem další.
        Profil Alice je rychlý; Bob pomalý — opačný typist → vysoká vzdálenost → REJECT.
        V praxi EER 5–15 % pro text-dependent; vyžaduje 10+ pokusů během enrollment.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const statBox = { background: "var(--bg-inset)", padding: 8, borderRadius: 6, textAlign: "center" };
const statLbl = { fontSize: 10, color: "var(--text-muted)" };
const statVal = { fontSize: 18, fontWeight: 600, fontFamily: "var(--font-mono)", marginTop: 4 };
