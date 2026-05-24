// ICAO LDS explorer: tree of master/application/DG files; click DG for details.
import { useState } from "react";

const DGS = [
  { id: "DG1",  name: "MRZ data",                size: "~100 B",  format: "ASCII",       required: true,  access: "BAC/PACE", note: "Machine-readable zone — name, DOB, expiry" },
  { id: "DG2",  name: "Face image",              size: "~15 KB",  format: "JPEG 2000",   required: true,  access: "BAC/PACE", note: "Mandatory; ICAO 9303 Part 9; 300+ dpi" },
  { id: "DG3",  name: "Fingerprints (2)",        size: "~20 KB",  format: "WSQ 500dpi",  required: false, access: "EAC",      note: "EU mandatory since 2009; left + right index" },
  { id: "DG4",  name: "Iris images",             size: "~70 KB",  format: "JPEG 2000",   required: false, access: "EAC",      note: "Optional; NIR; ISO 19794-6" },
  { id: "DG5",  name: "Signature image",         size: "~5 KB",   format: "JPEG",        required: false, access: "BAC/PACE", note: "Optional" },
  { id: "DG6",  name: "(reserved)",              size: "—",       format: "—",           required: false, access: "—",        note: "Reserved by ICAO" },
  { id: "DG7",  name: "Displayed signature",     size: "~5 KB",   format: "JPEG/PNG",    required: false, access: "BAC/PACE", note: "Image of handwritten signature" },
  { id: "DG8",  name: "Encoded face features",   size: "~1 KB",   format: "ISO 19794",   required: false, access: "BAC/PACE", note: "Optional template (vs image)" },
  { id: "DG9",  name: "Encoded fingerprint",     size: "~1 KB",   format: "Minutiae",    required: false, access: "EAC",      note: "Optional template" },
  { id: "DG10", name: "Encoded iris",            size: "~256 B",  format: "Iris code",   required: false, access: "EAC",      note: "Daugman code optional" },
  { id: "DG11", name: "Additional personal",     size: "~500 B",  format: "ASN.1",       required: false, access: "BAC/PACE", note: "Place of birth, residence" },
  { id: "DG12", name: "Additional document",     size: "~500 B",  format: "ASN.1",       required: false, access: "BAC/PACE", note: "Issuing authority, dates" },
  { id: "DG13", name: "National data",           size: "var",     format: "national",    required: false, access: "BAC/PACE", note: "Country-specific (Czech CSN data)" },
  { id: "DG14", name: "Security (PACE/CA)",      size: "~500 B",  format: "ASN.1",       required: false, access: "open",     note: "Required if PACE or CA used" },
  { id: "DG15", name: "AA public key",           size: "~300 B",  format: "RSA/ECDSA pubkey", required: false, access: "BAC/PACE", note: "EU mandatory; corresponds to private key in tamper chip" },
  { id: "DG16", name: "Persons to notify",       size: "~200 B",  format: "ASN.1",       required: false, access: "BAC/PACE", note: "Emergency contact" },
];

const ACCESS_COLOR = {
  "BAC/PACE": "rgb(64,192,87)",
  "EAC":      "rgb(220,80,80)",
  "open":     "rgb(80,140,220)",
  "—":        "var(--text-muted)",
};

export default function IcaoLdsExplorer() {
  const [selected, setSelected] = useState("DG2");
  const [showOnlyRequired, setShowOnlyRequired] = useState(false);

  const visible = showOnlyRequired ? DGS.filter(d => d.required) : DGS;
  const cur = DGS.find(d => d.id === selected) || DGS[0];

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={{ ...lbl, display: "flex", alignItems: "center", gap: 4 }}>
          <input type="checkbox" checked={showOnlyRequired} onChange={(e) => setShowOnlyRequired(e.target.checked)} />
          jen povinná DG
        </label>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 12, fontSize: 11 }}>
          <span style={{ width: 12, height: 12, background: "rgb(64,192,87)", display: "inline-block" }} /> BAC/PACE
          <span style={{ width: 12, height: 12, background: "rgb(220,80,80)", display: "inline-block" }} /> EAC
          <span style={{ width: 12, height: 12, background: "rgb(80,140,220)", display: "inline-block" }} /> open
        </div>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5 }}>
          <div style={{ color: "var(--text-muted)" }}>Master File (MF)</div>
          <div style={{ marginLeft: 12, color: "var(--text-muted)" }}>└── Application MF (eMRTD, AID = A0 00 00 02 47 10 01)</div>
          <div style={{ marginLeft: 32, color: "var(--text)" }}>├── EF.COM <span style={{ color: "var(--text-muted)" }}>(list of DG)</span></div>
          <div style={{ marginLeft: 32, color: "var(--text)" }}>├── EF.SOD <span style={{ color: "var(--text-muted)" }}>(hash list, signed by DSC)</span></div>
        </div>
        <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
          {visible.map((dg) => (
            <div key={dg.id} onClick={() => setSelected(dg.id)} style={{
              padding: "6px 8px",
              background: selected === dg.id ? "var(--accent)" : "var(--bg-card)",
              color: selected === dg.id ? "#fff" : "var(--text)",
              border: `1px solid ${ACCESS_COLOR[dg.access]}`,
              borderRadius: 5, cursor: "pointer", fontSize: 11, fontFamily: "var(--font-mono)",
            }}>
              <div style={{ fontWeight: 600 }}>{dg.id} {dg.required ? "★" : ""}</div>
              <div style={{ fontSize: 10, opacity: 0.85 }}>{dg.name.substring(0, 18)}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 12, borderRadius: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--accent)" }}>{cur.id} — {cur.name}</div>
          {cur.required && <div style={{ color: "rgb(64,192,87)", fontSize: 11, fontWeight: 600 }}>★ POVINNÉ (ICAO)</div>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 8, fontSize: 11.5 }}>
          <div><span style={lbl}>velikost:</span> <span style={{ fontFamily: "var(--font-mono)" }}>{cur.size}</span></div>
          <div><span style={lbl}>formát:</span> <span style={{ fontFamily: "var(--font-mono)" }}>{cur.format}</span></div>
          <div><span style={lbl}>chrání:</span> <span style={{ fontFamily: "var(--font-mono)", color: ACCESS_COLOR[cur.access] }}>{cur.access}</span></div>
        </div>
        <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--text-muted)" }}>{cur.note}</div>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>typické pořadí přístupu při border control:</div>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 11.5 }}>
          <li>OCR čte MRZ z papírové stránky.</li>
          <li>BAC/PACE handshake → odemkne <b>většinu</b> DG (1, 2, 5, 11, 12, 13, 15, 16).</li>
          <li>EF.SOD signature verification (PA) → integrita dat.</li>
          <li>Active Authentication (AA) ↔ DG15 → anti-cloning.</li>
          <li>EAC TA + CA → odemkne DG3 (fingerprints) a DG4 (iris).</li>
          <li>Face match: stored DG2 ↔ live capture.</li>
        </ol>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Velikost čipu typicky 64 KB; full set s otisky vyplní většinu kapacity.
        ★ = mandatory podle ICAO Doc 9303; EU navíc DG3 + DG15.
        DG3/DG4 vyžadují EAC → terminál musí mít platný certifikát od Document Verifier / CVCA — Američan v EU obvykle nemá → EU otisky pro něj nedostupné.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
