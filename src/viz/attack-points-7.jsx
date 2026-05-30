// Ratha-Connell-Bolle 7-point attack diagram. Click an attack point to see
// concrete example + layered defense.
import { useState } from "react";

const POINTS = {
  1: {
    title: "1. Sensor — presentation attack",
    examples: [
      "Matsumoto 2002 — gummy bear na capacitive sensor",
      "Bkav 2017 — silikonová maska obejde Face ID",
      "Patterned contact lens — falešná duhovka",
      "Pre-recorded audio replay (voice biometric)",
    ],
    defenses: [
      "Liveness detection (pulsace, mikropotenciál, 3D depth)",
      "Multispektrální senzor (subdermální struktura)",
      "Challenge-response (mrkni, otočte hlavou)",
      "ISO/IEC 30107 PAD certifikace (iBeta Level 2+)",
    ],
  },
  2: {
    title: "2. Kanál sensor → extractor — replay",
    examples: [
      "USB sniff: zaznamenat baseline feature vektor",
      "NFC odposlech RFID čtečky",
      "Network MITM mezi klientem a backendem",
    ],
    defenses: [
      "TLS / Secure Messaging na kanálu",
      "Nonce-based anti-replay",
      "Sekvenční čísla + timestamps",
      "TEE / Secure Enclave (Apple, Android TrustZone)",
    ],
  },
  3: {
    title: "3. Feature extractor — substitute",
    examples: [
      "Malware nahradí lib do feature extractoru",
      "DLL injection vrací útočníkovy features",
      "Modifikace pluginu prohlížeče (web biometric)",
    ],
    defenses: [
      "Code signing + Secure Boot",
      "Trusted Execution Environment (TEE/SGX)",
      "Application allowlisting",
      "Integrity Measurement (TPM PCR)",
    ],
  },
  4: {
    title: "4. Kanál extractor → matcher — replay",
    examples: [
      "MITM mezi modulem extractoru a matcherem",
      "API endpoint replay (REST microservices)",
    ],
    defenses: [
      "mTLS mezi mikroslužbami",
      "Signed feature vector (HMAC)",
      "Nonce + freshness",
    ],
  },
  5: {
    title: "5. Template DB — krádež, mass impersonation",
    examples: [
      "OPM hack 2015 — 5.6M federal otisků prstů",
      "23andMe 2023 — 6.9M genetických profilů",
      "BioStar 2 leak (Suprema 2019) — 27M biom. záznamů",
    ],
    defenses: [
      "Cancelable biometrics (one-way transformation)",
      "Homomorphic encryption (research)",
      "Bio cryptosystém (fuzzy extractor)",
      "On-device storage (Secure Enclave)",
      "Encryption at rest + access audit",
    ],
  },
  6: {
    title: "6. Matcher override",
    examples: [
      "Patch matcher binary vždy vrací match",
      "Side-channel injection podmínky if-then",
      "Library replacement",
    ],
    defenses: [
      "HSM / smart card pro matcher",
      "Tamper-resistant hardware",
      "Code signing + remote attestation",
      "Multiple independent matchers + vote",
    ],
  },
  7: {
    title: "7. Decision modification",
    examples: [
      "Bit-flip ve výsledku (USB injection)",
      "Replay starého úspěšného session tokenu",
      "Server-side bypass (admin endpoint)",
    ],
    defenses: [
      "MAC nad rozhodnutím",
      "End-to-end signed session token",
      "Vícestupňová autorizace (biometric → token → server check)",
      "Audit log všech rozhodnutí",
    ],
  },
};

export default function AttackPoints7() {
  const [sel, setSel] = useState(1);

  // Layout for the 7-point Ratha diagram (matches the SVG in the .md)
  const layout = {
    1: { x: 60,  y: 100 }, // sensor
    2: { x: 110, y: 60  }, // channel sensor→extract
    3: { x: 170, y: 100 }, // feature extractor
    4: { x: 235, y: 60  }, // channel extract→matcher
    5: { x: 290, y: 190 }, // template DB
    6: { x: 290, y: 100 }, // matcher
    7: { x: 400, y: 100 }, // decision
  };

  return (
    <div style={ctn}>
      <svg viewBox="0 -4 520 244" style={{ width: "100%", maxWidth: 720, background: "var(--bg-inset)", borderRadius: 6 }}>
        {/* boxes */}
        <g fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.2">
          <rect x="20"  y="90"  width="80" height="40" rx="4" />
          <rect x="130" y="90"  width="80" height="40" rx="4" />
          <rect x="250" y="90"  width="80" height="40" rx="4" />
          <rect x="360" y="90"  width="80" height="40" rx="4" />
          <rect x="450" y="90"  width="60" height="40" rx="4" />
          <rect x="240" y="180" width="100" height="40" rx="4" />
        </g>
        <g fill="var(--text)" textAnchor="middle" fontSize="10">
          <text x="60"  y="114">Sensor</text>
          <text x="170" y="114">Feat. extract</text>
          <text x="290" y="114">Matcher</text>
          <text x="400" y="114">Decision</text>
          <text x="480" y="114">Output</text>
          <text x="290" y="206">Template DB</text>
        </g>
        {/* flow arrows */}
        <g stroke="var(--accent)" strokeWidth="1" fill="none">
          <path d="M100,110 L128,110" />
          <path d="M210,110 L248,110" />
          <path d="M330,110 L358,110" />
          <path d="M440,110 L448,110" />
          <path d="M290,180 L290,130" strokeDasharray="3 2" />
        </g>
        {/* attack point markers */}
        {[1,2,3,4,5,6,7].map((id) => (
          <g key={id} onClick={() => setSel(id)} style={{ cursor: "pointer" }}>
            <circle cx={layout[id].x} cy={layout[id].y - 50} r="13" fill={sel === id ? "rgb(220,80,80)" : "var(--bg-card)"} stroke="rgb(220,80,80)" strokeWidth="2" />
            <text x={layout[id].x} y={layout[id].y - 46} textAnchor="middle" fontSize="11" fontWeight="600" fill={sel === id ? "#fff" : "rgb(220,80,80)"}>{id}</text>
            <line x1={layout[id].x} y1={layout[id].y - 37} x2={layout[id].x} y2={layout[id].y - 25} stroke="rgb(220,80,80)" strokeWidth="1" strokeDasharray="2 1" />
          </g>
        ))}
        {/* DB attack arrow comes from below */}
        <g onClick={() => setSel(5)} style={{ cursor: "pointer" }}>
          <line x1={290} y1={224} x2={290} y2={221} stroke="rgb(220,80,80)" strokeWidth="1" />
        </g>
      </svg>

      <div style={{ background: "var(--bg-inset)", padding: 12, borderRadius: 6 }}>
        <div style={{ fontWeight: 600, color: "rgb(220,80,80)" }}>{POINTS[sel].title}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>příklady útoku</div>
            <ul style={ul}>{POINTS[sel].examples.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "rgb(64,192,87)", marginBottom: 4 }}>obrana (vrstvy)</div>
            <ul style={ul}>{POINTS[sel].defenses.map((d, i) => <li key={i}>{d}</li>)}</ul>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {[1,2,3,4,5,6,7].map((id) => (
          <button key={id} style={{ ...pointBtn, background: sel === id ? "rgb(220,80,80)" : "var(--bg-inset)", color: sel === id ? "#fff" : "var(--text)" }} onClick={() => setSel(id)}>
            {id}. {POINTS[id].title.split(" — ")[1] || POINTS[id].title}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Žádná jedna obrana neuzavře všech 7 bodů — vyžaduje <b>defense in depth</b>:
        liveness + crypto kanály + TEE + cancelable templates + HSM + MAC nad rozhodnutím.
        Většina komerčních systémů řeší pouze body 1 a 5 — kompletní stack je vzácný.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const ul = { margin: 0, paddingLeft: 18, fontSize: 11.5, color: "var(--text)", lineHeight: 1.5 };
const pointBtn = { padding: "4px 8px", border: "1px solid var(--line)", borderRadius: 5, fontSize: 11, cursor: "pointer", textAlign: "left" };
