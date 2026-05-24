// E-passport reader<->chip protocol stack: BAC vs PACE, PA, AA, EAC.
// Step through each layer; show which DG it protects.
import { useState } from "react";

const DGS = [
  { id: 1,  name: "DG1 — MRZ",            access: "BAC", layer: "PA",  desc: "Machine-readable zone (vis.)" },
  { id: 2,  name: "DG2 — Face",           access: "BAC", layer: "PA",  desc: "Face JPEG2000" },
  { id: 3,  name: "DG3 — Fingerprints",   access: "EAC", layer: "EAC", desc: "WSQ, EU mandatory" },
  { id: 4,  name: "DG4 — Iris",           access: "EAC", layer: "EAC", desc: "JPEG2000 iris, optional" },
  { id: 11, name: "DG11 — Add. personal", access: "BAC", layer: "PA",  desc: "Extended pers. data" },
  { id: 14, name: "DG14 — Security",      access: "open",layer: "PA",  desc: "PACE/CA params" },
  { id: 15, name: "DG15 — AA public key", access: "BAC", layer: "AA",  desc: "Anti-cloning pub key" },
];

const STEPS = [
  { id: "scan",  title: "1. Reader scanuje MRZ (OCR)", desc: "Z MRZ jsou odvozeny klíče BAC i PACE password.", protects: [] },
  { id: "bac",   title: "2a. BAC — 3-pass mutual auth (legacy)", desc: "K_ENC, K_MAC = SHA-1(MRZ); 3DES-CBC challenge-response. 3DES + ~30 efektivních bitů entropie MRZ → offline brute-force feasible.", protects: ["DG1", "DG2", "DG11", "DG15"] },
  { id: "pace",  title: "2b. PACE — DH key agreement (modern)", desc: "Brainpool P-256 ECDH; password z MRZ nebo CAN. Forward secrecy — i únik MRZ neovlivní minulé session.", protects: ["DG1", "DG2", "DG11", "DG15"] },
  { id: "pa",    title: "3. Passive Authentication — verifikace EF.SOD", desc: "Reader spočítá hashy DGs, porovná s EF.SOD; verifikuje DSC podpis (DSC ← CSCA). Garantuje integritu, NEgarantuje anti-cloning.", protects: ["DG1...DG15"] },
  { id: "aa",    title: "4. Active Authentication — challenge-response", desc: "Reader pošle nonce r; chip podepíše SHA-256(r||r_p) privátním klíčem z DG15. Klon by musel mít fyzický privátní klíč.", protects: ["DG15"] },
  { id: "ta",    title: "5a. EAC Terminal Authentication", desc: "Reader prokáže autoritu k DG3/DG4 (certifikát ← Document Verifier ← CVCA).", protects: ["DG3", "DG4"] },
  { id: "ca",    title: "5b. EAC Chip Authentication", desc: "Nová DH session pro citlivá biom. data. Šifrovaný kanál mimo PACE.", protects: ["DG3", "DG4"] },
  { id: "read",  title: "6. Read biometric DGs", desc: "Reader čte DG1, DG2 (BAC/PACE), DG3 + DG4 (po EAC).", protects: [] },
];

export default function EpassportHandshake() {
  const [step, setStep] = useState(0);
  const [accessMode, setAccessMode] = useState("pace"); // pace | bac
  const [activeDG, setActiveDG] = useState(null);

  const visibleSteps = STEPS.filter(s => {
    if (accessMode === "pace" && s.id === "bac") return false;
    if (accessMode === "bac" && s.id === "pace") return false;
    return true;
  });

  const cur = visibleSteps[step];

  function dgProtectedBy(dg) {
    const tags = [];
    if (dg.access === "BAC") tags.push(accessMode === "pace" ? "PACE" : "BAC");
    if (dg.access === "EAC") tags.push("PACE/BAC", "PA", "EAC TA/CA");
    if (dg.access === "open") tags.push("(plain)");
    if (dg.layer === "AA") tags.push("AA");
    if (dg.layer === "PA") tags.push("PA");
    return tags;
  }

  // BAC entropy bars
  const bacBits = 30;
  const paceBits = 128;

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>access protokol:</label>
        <select value={accessMode} onChange={(e) => { setAccessMode(e.target.value); setStep(0); }} style={sel}>
          <option value="pace">PACE (modern, EU 2014+)</option>
          <option value="bac">BAC (legacy)</option>
        </select>
        <button style={btn} onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>◀ prev</button>
        <span style={lbl}>krok {step + 1}/{visibleSteps.length}</span>
        <button style={btn} onClick={() => setStep(Math.min(visibleSteps.length - 1, step + 1))} disabled={step >= visibleSteps.length - 1}>next ▶</button>
        <button style={btn} onClick={() => setStep(0)}>reset</button>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontWeight: 600, color: "var(--accent)" }}>{cur.title}</div>
        <div style={{ fontSize: 11.5, color: "var(--text)", marginTop: 4 }}>{cur.desc}</div>
        {cur.protects.length > 0 && (
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
            chrání: {cur.protects.join(", ")}
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Data Groups (klikni pro detail):</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {DGS.map((dg) => {
            const tags = dgProtectedBy(dg);
            const stepProtects = cur.protects.some(p => p === dg.name.split(" ")[0] || p.includes(dg.name.split(" ")[0]) || p === "DG1...DG15");
            return (
              <div key={dg.id} onClick={() => setActiveDG(activeDG === dg.id ? null : dg.id)} style={{
                background: stepProtects ? "rgba(64,192,87,0.18)" : activeDG === dg.id ? "var(--accent)" : "var(--bg-inset)",
                color: activeDG === dg.id ? "#fff" : "var(--text)",
                padding: "6px 8px", borderRadius: 5, cursor: "pointer",
                border: stepProtects ? "1px solid rgb(64,192,87)" : "1px solid var(--line)",
                fontSize: 11, fontFamily: "var(--font-mono)",
              }}>
                <div style={{ fontWeight: 600 }}>{dg.name}</div>
                <div style={{ fontSize: 9, opacity: 0.8 }}>{dg.desc}</div>
                <div style={{ fontSize: 9, opacity: 0.75 }}>{tags.join(" · ")}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>brute-force entropy (offline po odposlechu):</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ width: 60, fontSize: 11, fontFamily: "var(--font-mono)" }}>BAC</span>
          <div style={{ flex: 1, height: 14, background: "var(--bg-card)", borderRadius: 7, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${bacBits/128*100}%`, background: "rgb(220,80,80)" }} />
          </div>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", width: 80 }}>~{bacBits} bit (~hours)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 60, fontSize: 11, fontFamily: "var(--font-mono)" }}>PACE</span>
          <div style={{ flex: 1, height: 14, background: "var(--bg-card)", borderRadius: 7, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${paceBits/128*100}%`, background: "rgb(64,192,87)" }} />
          </div>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", width: 80 }}>{paceBits} bit (PFS)</span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Plný stack: <b>access</b> (BAC/PACE) → <b>integrita</b> (PA) → <b>anti-cloning</b> (AA) → <b>EAC</b> (TA + CA) pro citlivá biom.
        ICAO 9303 vyžaduje PA univerzálně; EU navíc AA + EAC od 2009. USA bez AA (relies on visual + immigration DB).
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
