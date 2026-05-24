// PKCS#11 wrap-key attack: utocnik wrapne sensitive klic vlastnim wrap klicem
// nebo s slabym ECB mode pro double-length 3DES. Toggle PKCS#11 v2.40 strict mode.
import { useState } from "react";

export default function Pkcs11Wrap() {
  const [target, setTarget] = useState({
    label: "MasterKey-3DES",
    keyType: "3DES",
    keyLen: 168, // double-length 3DES (16 byte key, 168 effective bits)
    sensitive: true,
    extractable: true,
  });
  const [wrapKey, setWrapKey] = useState({
    label: "AttackerKey",
    keyType: "DES",
    keyLen: 56,
    wrap: true,
  });
  const [mech, setMech] = useState("CKM_DES_ECB");
  const [strictMode, setStrictMode] = useState(false);

  // Compute attack outcome
  function evaluate() {
    const reasons = [];
    let blocked = false;

    if (!target.extractable) {
      reasons.push("✓ CKA_EXTRACTABLE=false zabranuje wrap operaci.");
      blocked = true;
    }
    if (strictMode) {
      if (wrapKey.keyLen < target.keyLen) {
        reasons.push("✓ strict mode: wrap key kratsi nez target (DES 56b < 3DES 168b) — odmitnuto.");
        blocked = true;
      }
      if (mech === "CKM_DES_ECB" || mech === "CKM_AES_ECB") {
        reasons.push("✓ strict mode: ECB pro wrapping not allowed.");
        blocked = true;
      }
      if (target.sensitive && !wrapKey.wrap) {
        reasons.push("✓ strict mode: wrap key without CKA_WRAP=true.");
        blocked = true;
      }
      if (!reasons.length) {
        reasons.push("◦ strict mode: kontrola CKA_WRAP_TEMPLATE matchuje — utok teoreticky prosel by, ale s spravnymi atributy.");
      }
    } else {
      if (mech === "CKM_DES_ECB" && target.keyType === "3DES") {
        reasons.push("✗ DES-ECB wrap rozkladá 3DES klic na 8-byte bloky — kazdy lze brute-force za ~$5 USD na cloud GPU.");
      }
      if (wrapKey.keyLen < target.keyLen) {
        reasons.push("✗ wrap key (56b) << target key (168b): unwrap by sebe rozšifruje cely target s DES brute-force.");
      }
      if (target.sensitive) {
        reasons.push("◦ C_WrapKey vraci ciphertext target_key wrapped attacker key.");
      }
    }

    return { reasons, blocked };
  }

  const evalResult = evaluate();

  const ciphertext = strictMode && evalResult.blocked
    ? null
    : "0xAA BB CC DD EE FF 11 22 33 44 55 66 77 88 99 00 (target wrapped s attacker key)";

  function attemptUnwrap() {
    if (!ciphertext) return null;
    if (mech === "CKM_DES_ECB" && target.keyType === "3DES") {
      return "↳ Brute-force DES kazdou 8-byte pulku zvlast: 2^56 × 2 ≈ 2^57 trials ~$10 cloud cost → plaintext target_key obnoven.";
    }
    if (wrapKey.keyLen < target.keyLen) {
      return "↳ Brute-force wrap key (krátky) → unwrap → plaintext target_key obnoven.";
    }
    return "↳ Wrap key má dostatecnou delku; ale utocnik ho zna (sam ho vygeneroval), tak unwrap je trivialni — plaintext target_key v utocnikove RAM.";
  }

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>PKCS#11 strict mode (v2.40+):</label>
        <button style={{ ...btn, background: strictMode ? "#81b29a" : "var(--bg-inset)", color: strictMode ? "var(--bg-inset)" : "var(--text)" }}
          onClick={() => setStrictMode(!strictMode)}>{strictMode ? "ON ✓" : "OFF"}</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={panel}>
          <div style={{ fontWeight: 600, color: "#81b29a", marginBottom: 4 }}>Target key (chceme ukrast)</div>
          <Row label="label" val={target.label} />
          <Row label="type" val={`${target.keyType} (${target.keyLen} bit)`} />
          <Toggle label="CKA_SENSITIVE" v={target.sensitive} on={(v) => setTarget({ ...target, sensitive: v })} />
          <Toggle label="CKA_EXTRACTABLE" v={target.extractable} on={(v) => setTarget({ ...target, extractable: v })} />
        </div>
        <div style={panel}>
          <div style={{ fontWeight: 600, color: "#e07a5f", marginBottom: 4 }}>Attacker's wrap key</div>
          <Row label="label" val={wrapKey.label} />
          <Row label="type" val={
            <select value={wrapKey.keyType} onChange={(e) => {
              const t = e.target.value;
              const len = t === "DES" ? 56 : t === "3DES" ? 168 : 256;
              setWrapKey({ ...wrapKey, keyType: t, keyLen: len });
            }} style={selSm}>
              <option value="DES">DES (56b)</option>
              <option value="3DES">3DES (168b)</option>
              <option value="AES">AES (256b)</option>
            </select>
          } />
          <Toggle label="CKA_WRAP" v={wrapKey.wrap} on={(v) => setWrapKey({ ...wrapKey, wrap: v })} />
        </div>
      </div>

      <div style={row}>
        <label style={lbl}>wrap mechanism:</label>
        <select value={mech} onChange={(e) => setMech(e.target.value)} style={sel}>
          <option value="CKM_DES_ECB">CKM_DES_ECB (slabe)</option>
          <option value="CKM_AES_CBC">CKM_AES_CBC (s IV)</option>
          <option value="CKM_NIST_AES_WRAP">CKM_NIST_AES_WRAP (RFC 3394, doporuc.)</option>
        </select>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, marginBottom: 6 }}>
          <span style={{ color: "var(--accent)" }}>&gt;</span> C_WrapKey(session, mech={mech}, wrap_key=AttackerKey, target=MasterKey-3DES)
        </div>
        {evalResult.reasons.map((r, i) => (
          <div key={i} style={{ fontSize: 11, padding: "2px 0", color: r.startsWith("✓") ? "#81b29a" : r.startsWith("✗") ? "#e07a5f" : "var(--text-muted)" }}>{r}</div>
        ))}
        <div style={{ marginTop: 6, fontFamily: "var(--font-mono)", fontSize: 11 }}>
          {evalResult.blocked && strictMode ? (
            <span style={{ color: "#81b29a" }}>&lt; CKR_KEY_FUNCTION_NOT_PERMITTED (zablokovano)</span>
          ) : (
            <>
              <div style={{ color: "var(--text-muted)" }}>&lt; ciphertext = {ciphertext}</div>
              <div style={{ color: "#e07a5f", marginTop: 4 }}>{attemptUnwrap()}</div>
            </>
          )}
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Bond-Anderson 2001 a Clulow 2003: PKCS#11 dovoluje wrapping target klice <i>kratsim</i> nebo <i>slabsim</i> klicem,
        s ECB modem, nebo bez kontroly oprávnění. Mitigace: PKCS#11 v2.40+ s <span style={{ fontFamily: "var(--font-mono)" }}>CKA_WRAP_TEMPLATE</span>,
        <span style={{ fontFamily: "var(--font-mono)" }}>CKA_UNWRAP_TEMPLATE</span>, a dedicated <span style={{ fontFamily: "var(--font-mono)" }}>CKM_NIST_AES_WRAP</span> (RFC 3394).
      </div>
    </div>
  );
}

function Row({ label, val }) {
  return <div style={{ display: "flex", gap: 6, padding: "2px 0", fontSize: 11, fontFamily: "var(--font-mono)" }}>
    <span style={{ minWidth: 100, color: "var(--text-muted)" }}>{label}:</span>
    <span>{val}</span>
  </div>;
}
function Toggle({ label, v, on }) {
  return <div style={{ display: "flex", gap: 6, padding: "2px 0", fontSize: 11, fontFamily: "var(--font-mono)", alignItems: "center" }}>
    <span style={{ minWidth: 110, color: "var(--text-muted)" }}>{label}:</span>
    <button onClick={() => on(!v)} style={{ padding: "1px 8px", background: v ? "#81b29a" : "var(--bg-inset)", color: v ? "var(--bg-inset)" : "var(--text)", border: "1px solid var(--line)", borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: 11, cursor: "pointer" }}>
      {v ? "true" : "false"}
    </button>
  </div>;
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const selSm = { padding: "1px 4px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 3, fontSize: 11, fontFamily: "var(--font-mono)" };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const panel = { background: "var(--bg-inset)", padding: 8, borderRadius: 6 };
