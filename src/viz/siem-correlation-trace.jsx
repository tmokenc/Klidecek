// siem-correlation-trace — Stream events; correlation rule window fills;
// alert fires when threshold reached. Demo: failed login + success = ATO.
import { useState } from "react";

const EVENTS = [
  { t: 0,   src: "AD",    type: "auth_fail",    user: "alice", ip: "10.0.0.5" },
  { t: 10,  src: "AD",    type: "auth_fail",    user: "alice", ip: "10.0.0.5" },
  { t: 20,  src: "AD",    type: "auth_fail",    user: "alice", ip: "10.0.0.5" },
  { t: 30,  src: "AD",    type: "auth_fail",    user: "alice", ip: "10.0.0.5" },
  { t: 40,  src: "AD",    type: "auth_fail",    user: "alice", ip: "10.0.0.5" },
  { t: 50,  src: "AD",    type: "auth_fail",    user: "alice", ip: "10.0.0.5" },
  { t: 55,  src: "AD",    type: "auth_fail",    user: "alice", ip: "10.0.0.5" },
  { t: 60,  src: "AD",    type: "auth_fail",    user: "alice", ip: "10.0.0.5" },
  { t: 65,  src: "AD",    type: "auth_fail",    user: "alice", ip: "10.0.0.5" },
  { t: 70,  src: "AD",    type: "auth_fail",    user: "alice", ip: "10.0.0.5" },
  { t: 80,  src: "AD",    type: "auth_success", user: "alice", ip: "203.0.113.7" },
  { t: 90,  src: "VPN",   type: "connect",      user: "alice", ip: "203.0.113.7" },
  { t: 100, src: "files", type: "read",         user: "alice", file: "/sensitive/payroll.csv" },
];

export default function SiemCorrelationTrace() {
  const [idx, setIdx] = useState(0);

  const visible = EVENTS.slice(0, idx);
  // Rule: ≥10 auth_fail same user within 60s, then auth_success same user different IP within 60s
  const fails = visible.filter(e => e.type === "auth_fail" && e.user === "alice");
  const success = visible.find(e => e.type === "auth_success" && e.user === "alice");
  const failsBeforeSuccess = success
    ? fails.filter(f => f.t <= success.t && f.t >= success.t - 60)
    : [];
  const ruleFired = success && failsBeforeSuccess.length >= 10 && success.ip !== "10.0.0.5";

  const ipMismatch = success && success.ip !== "10.0.0.5";
  const fileTouch = visible.find(e => e.type === "read" && e.file && e.file.includes("sensitive"));

  const W = 580, H = 270;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 11, alignItems: "center" }}>
        <button onClick={() => setIdx(Math.min(EVENTS.length, idx + 1))} style={btn(false)}>▶ next event ({idx}/{EVENTS.length})</button>
        <button onClick={() => setIdx(EVENTS.length)} style={btn(false)}>▶▶ run all</button>
        <button onClick={() => setIdx(0)} style={btn(false)}>reset</button>
        <span style={{ color: "var(--text-muted)" }}>rule: ≥10 fails &amp; success(diff IP) within 60s → account takeover</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* Timeline */}
        <text x={20} y={25} fontSize="10" fill="var(--text-muted)">timeline (seconds):</text>
        <line x1={20} y1={40} x2={W - 20} y2={40} stroke="var(--line)" />
        {EVENTS.map((e, i) => {
          if (i >= idx) return null;
          const x = 20 + (e.t / 100) * (W - 40);
          const y = e.src === "AD" ? 50 : e.src === "VPN" ? 70 : 90;
          const color = e.type === "auth_fail" ? "oklch(0.65 0.18 22)" :
                        e.type === "auth_success" ? (ipMismatch ? "oklch(0.75 0.12 60)" : "oklch(0.7 0.15 145)") :
                        e.type === "read" ? "oklch(0.65 0.16 245)" : "var(--accent)";
          return (
            <circle key={i} cx={x} cy={y} r="4" fill={color} stroke="white" strokeWidth="0.5" />
          );
        })}
        <text x={5} y={54} fontSize="8" fill="var(--text-muted)">AD</text>
        <text x={5} y={74} fontSize="8" fill="var(--text-muted)">VPN</text>
        <text x={5} y={94} fontSize="8" fill="var(--text-muted)">file</text>

        {/* Rule state panel */}
        <rect x={20} y={110} width={260} height={140} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={30} y={128} fontSize="10.5" fontWeight="700" fill="var(--text)">correlation rule state</text>
        <text x={30} y={146} fontSize="10" fontFamily="ui-monospace, monospace"
          fill={fails.length >= 10 ? "oklch(0.7 0.15 145)" : "var(--text)"}>
          fails(60s) = {fails.length} {fails.length >= 10 ? "✓ ≥10" : "(need 10)"}
        </text>
        <text x={30} y={162} fontSize="10" fontFamily="ui-monospace, monospace"
          fill={success ? (ipMismatch ? "oklch(0.75 0.12 60)" : "oklch(0.7 0.15 145)") : "var(--text)"}>
          success = {success ? `yes (ip=${success.ip})` : "—"}
        </text>
        <text x={30} y={178} fontSize="10" fontFamily="ui-monospace, monospace"
          fill={ipMismatch ? "oklch(0.75 0.12 60)" : "var(--text)"}>
          ip mismatch = {success ? (ipMismatch ? "YES (10.0.0.5 → 203.0.113.7)" : "no") : "—"}
        </text>
        <text x={30} y={196} fontSize="10" fontFamily="ui-monospace, monospace"
          fill={fileTouch ? "oklch(0.65 0.18 22)" : "var(--text)"}>
          sensitive file read = {fileTouch ? "YES" : "—"}
        </text>
        {ruleFired ? (
          <g>
            <rect x={28} y={215} width={244} height={28} rx="3" fill="oklch(0.65 0.18 22 / 0.3)" stroke="oklch(0.65 0.18 22)" strokeWidth="1.5" />
            <text x={150} y={233} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="oklch(0.65 0.18 22)">
              ⚠ ALERT: account takeover (alice)
            </text>
          </g>
        ) : (
          <text x={30} y={230} fontSize="10" fill="var(--text-muted)">no alert</text>
        )}

        {/* Recent events list */}
        <rect x={300} y={110} width={260} height={140} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={310} y={128} fontSize="10.5" fontWeight="700" fill="var(--text)">recent events</text>
        {visible.slice(-7).map((e, i) => (
          <text key={i} x={310} y={144 + i * 13} fontSize="9" fontFamily="ui-monospace, monospace" fill="var(--text)">
            t={e.t}s {e.src}/{e.type} {e.user}{e.ip ? " @" + e.ip : ""}
          </text>
        ))}
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        SIEM <i>normalizuje</i> logy z různých zdrojů a hledá <b>vzory</b> napříč. Single events innocuous, kombinace = compromise.
        Rule windowing (60 s zde) + threshold (≥10 fails) — sliding-window CEP.
      </div>
    </div>
  );
}

function btn(active) {
  return { background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", border: "1px solid var(--line)", padding: "3px 9px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
