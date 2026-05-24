// rbac-abac-evaluator — Compare RBAC (role lookup) vs ABAC (attributes
// + condition) for a request. Change role, dept, time, location; see both.
import { useState } from "react";

const ROLES = {
  guest:     { perms: [] },
  doctor:    { perms: ["read_patient", "write_notes"] },
  admin:     { perms: ["read_patient", "write_notes", "delete_record", "admin_panel"] },
  auditor:   { perms: ["read_patient", "read_logs"] },
};

const ACTIONS = ["read_patient", "write_notes", "delete_record", "admin_panel"];

export default function RbacAbacEvaluator() {
  const [role, setRole] = useState("doctor");
  const [dept, setDept] = useState("cardiology");
  const [objDept, setObjDept] = useState("cardiology");
  const [hour, setHour] = useState(10);
  const [onSite, setOnSite] = useState(true);
  const [action, setAction] = useState("read_patient");

  // RBAC: just role → perm lookup.
  const rbacAllow = ROLES[role].perms.includes(action);

  // ABAC: role + dept match + time business hours + on-site.
  const businessHours = hour >= 8 && hour < 18;
  const deptMatch = dept === objDept;
  const abacAllow = rbacAllow && deptMatch && businessHours && onSite;
  const abacFails = [];
  if (!rbacAllow) abacFails.push("role nemá perm");
  if (!deptMatch) abacFails.push(`dept ≠ obj dept (${dept} ≠ ${objDept})`);
  if (!businessHours) abacFails.push(`mimo 8-18 (hour=${hour})`);
  if (!onSite) abacFails.push("není na síti nemocnice");

  const W = 580, H = 240;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8, fontSize: 11 }}>
        <div>
          <div>Role: <select value={role} onChange={e => setRole(e.target.value)} style={ctrl}>
            {Object.keys(ROLES).map(r => <option key={r} value={r}>{r}</option>)}
          </select></div>
          <div style={{ marginTop: 4 }}>User dept: <select value={dept} onChange={e => setDept(e.target.value)} style={ctrl}>
            <option value="cardiology">cardiology</option>
            <option value="neurology">neurology</option>
            <option value="radiology">radiology</option>
          </select></div>
          <div style={{ marginTop: 4 }}>Object dept: <select value={objDept} onChange={e => setObjDept(e.target.value)} style={ctrl}>
            <option value="cardiology">cardiology</option>
            <option value="neurology">neurology</option>
            <option value="radiology">radiology</option>
          </select></div>
        </div>
        <div>
          <div>Time of day: {hour}:00
            <input type="range" min="0" max="23" value={hour} onChange={e => setHour(+e.target.value)} style={{ width: "100%" }} />
          </div>
          <div style={{ marginTop: 4 }}>
            <label><input type="checkbox" checked={onSite} onChange={e => setOnSite(e.target.checked)} /> na síti nemocnice</label>
          </div>
          <div style={{ marginTop: 4 }}>Action: <select value={action} onChange={e => setAction(e.target.value)} style={ctrl}>
            {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select></div>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* RBAC card */}
        <rect x={20} y={20} width={270} height={200} rx="4" fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={155} y={40} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)">RBAC</text>
        <text x={155} y={55} textAnchor="middle" fontSize="9" fill="var(--text-muted)">role → permission lookup</text>
        <text x={35} y={80} fontSize="10" fontFamily="ui-monospace, monospace" fill="var(--text)">role = {role}</text>
        <text x={35} y={97} fontSize="10" fontFamily="ui-monospace, monospace" fill="var(--text)">perms:</text>
        {ROLES[role].perms.map((p, i) => (
          <text key={p} x={45} y={114 + i * 14} fontSize="9.5" fontFamily="ui-monospace, monospace" fill="var(--accent)">• {p}</text>
        ))}
        <rect x={35} y={175} width={240} height={30} rx="3"
          fill={rbacAllow ? "oklch(0.7 0.15 145 / 0.3)" : "oklch(0.65 0.18 22 / 0.25)"}
          stroke={rbacAllow ? "oklch(0.7 0.15 145)" : "oklch(0.65 0.18 22)"} />
        <text x={155} y={194} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={rbacAllow ? "oklch(0.7 0.15 145)" : "oklch(0.65 0.18 22)"}>
          {rbacAllow ? "✓ ALLOW" : "✗ DENY"}
        </text>

        {/* ABAC card */}
        <rect x={300} y={20} width={260} height={200} rx="4" fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={430} y={40} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)">ABAC</text>
        <text x={430} y={55} textAnchor="middle" fontSize="9" fill="var(--text-muted)">attributes + condition</text>
        <g fontSize="9" fontFamily="ui-monospace, monospace">
          <text x={310} y={75} fill="var(--text-muted)">policy.allow ⟸</text>
          <text x={320} y={89} fill={rbacAllow ? "oklch(0.7 0.15 145)" : "oklch(0.65 0.18 22)"}>role.perm({action})</text>
          <text x={320} y={102} fill={dept === objDept ? "oklch(0.7 0.15 145)" : "oklch(0.65 0.18 22)"}>∧ user.dept = obj.dept</text>
          <text x={320} y={115} fill={businessHours ? "oklch(0.7 0.15 145)" : "oklch(0.65 0.18 22)"}>∧ time ∈ [8,18)</text>
          <text x={320} y={128} fill={onSite ? "oklch(0.7 0.15 145)" : "oklch(0.65 0.18 22)"}>∧ loc = hospital_net</text>
        </g>
        <rect x={315} y={175} width={230} height={30} rx="3"
          fill={abacAllow ? "oklch(0.7 0.15 145 / 0.3)" : "oklch(0.65 0.18 22 / 0.25)"}
          stroke={abacAllow ? "oklch(0.7 0.15 145)" : "oklch(0.65 0.18 22)"} />
        <text x={430} y={194} textAnchor="middle" fontSize="11" fontWeight="700"
          fill={abacAllow ? "oklch(0.7 0.15 145)" : "oklch(0.65 0.18 22)"}>
          {abacAllow ? "✓ ALLOW" : "✗ DENY"}
        </text>
        {!abacAllow && abacFails.length > 0 && (
          <text x={430} y={150} textAnchor="middle" fontSize="9" fill="var(--text-muted)">fails: {abacFails[0]}</text>
        )}
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        RBAC: rychlé, hrubě granulární. ABAC: <i>kontext-aware</i> (čas, lokalita, dept), méně role-explosion.
        V praxi <b>hybrid</b> — RBAC primary, ABAC podmínky.
      </div>
    </div>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 5px", borderRadius: 3, fontSize: 11 };
