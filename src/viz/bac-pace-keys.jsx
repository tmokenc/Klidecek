// BAC vs PACE key derivation entropy + brute-force time estimate.
// Slider for guessability of MRZ components.
import { useMemo, useState } from "react";

const GPU_KEYS_PER_SEC = 5e9; // ~5G hash/s for SHA-1 on modern GPU

export default function BacPaceKeys() {
  const [passportRandom, setPassportRandom] = useState(true);
  const [knownDOB, setKnownDOB] = useState(false);
  const [knownExpiry, setKnownExpiry] = useState(false);
  const [nGPUs, setNGPUs] = useState(1);

  // BAC entropy bits
  const passportBits = passportRandom ? 33 : 20; // 9-digit random vs sequential
  const dobBits = knownDOB ? 0 : 14; // ~30 years × 365 days ≈ 10 950 → 14 bits
  const expiryBits = knownExpiry ? 0 : 11; // 10 years × 365/expected ~3 years → ~11 bits
  const checkBits = -3; // check digits redundancy
  const bacBits = Math.max(0, passportBits + dobBits + expiryBits + checkBits);

  // PACE entropy
  const paceBits = 128; // DH session key, regardless of password

  // Brute force time for BAC
  const trials = Math.pow(2, bacBits);
  const sec = trials / (GPU_KEYS_PER_SEC * nGPUs);

  function fmtTime(s) {
    if (s < 60) return s.toFixed(2) + " s";
    if (s < 3600) return (s / 60).toFixed(2) + " min";
    if (s < 86400) return (s / 3600).toFixed(2) + " h";
    if (s < 365 * 86400) return (s / 86400).toFixed(1) + " dní";
    return (s / (365 * 86400)).toExponential(2) + " let";
  }

  return (
    <div style={ctn}>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>znalost útočníka o MRZ:</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 11.5 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input type="checkbox" checked={!passportRandom} onChange={(e) => setPassportRandom(!e.target.checked)} />
            sekvenční passport. čísla
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input type="checkbox" checked={knownDOB} onChange={(e) => setKnownDOB(e.target.checked)} />
            známé datum narození
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input type="checkbox" checked={knownExpiry} onChange={(e) => setKnownExpiry(e.target.checked)} />
            známá expirace
          </label>
        </div>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>složení entropie BAC</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 4, fontSize: 11, fontFamily: "var(--font-mono)" }}>
          <div style={{ color: "var(--text-muted)" }}>passport #</div>
          <Bar bits={passportBits} maxBits={56} color="rgb(64,192,87)" />
          <div>{passportBits} bit</div>
          <div style={{ color: "var(--text-muted)" }}>+ DOB</div>
          <Bar bits={dobBits} maxBits={56} color="rgb(220,140,80)" />
          <div>{dobBits} bit</div>
          <div style={{ color: "var(--text-muted)" }}>+ expirace</div>
          <Bar bits={expiryBits} maxBits={56} color="rgb(80,140,220)" />
          <div>{expiryBits} bit</div>
          <div style={{ color: "var(--text-muted)" }}>− check redundance</div>
          <Bar bits={Math.abs(checkBits)} maxBits={56} color="rgba(220,80,80,0.5)" />
          <div>{checkBits} bit</div>
        </div>
        <div style={{ marginTop: 8, borderTop: "1px solid var(--line)", paddingTop: 6, display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 4, fontSize: 12, fontFamily: "var(--font-mono)" }}>
          <div style={{ fontWeight: 600 }}>celkem BAC</div>
          <Bar bits={bacBits} maxBits={56} color="rgb(220,80,80)" />
          <div style={{ fontWeight: 600 }}>{bacBits} bit</div>
        </div>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>BAC vs PACE</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 4, fontSize: 12, fontFamily: "var(--font-mono)" }}>
          <div>BAC</div>
          <Bar bits={bacBits} maxBits={128} color="rgb(220,80,80)" />
          <div>{bacBits} bit</div>
          <div>PACE</div>
          <Bar bits={128} maxBits={128} color="rgb(64,192,87)" />
          <div>128 bit (PFS)</div>
        </div>
      </div>

      <div style={row}>
        <label style={lbl}>GPU farm: {nGPUs}× RTX 4090 (~{(GPU_KEYS_PER_SEC * nGPUs / 1e9).toFixed(1)}G key/s SHA-1)</label>
        <input type="range" min="1" max="1000" value={nGPUs} onChange={(e) => setNGPUs(parseInt(e.target.value))} style={{ flex: 1 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={statBox}>
          <div style={statLbl}>offline brute-force BAC</div>
          <div style={{ ...statVal, color: sec < 3600 ? "rgb(220,80,80)" : sec < 86400 * 365 ? "rgb(220,140,80)" : "rgb(64,192,87)" }}>{fmtTime(sec)}</div>
        </div>
        <div style={statBox}>
          <div style={statLbl}>offline brute-force PACE</div>
          <div style={{ ...statVal, color: "rgb(64,192,87)" }}>~10⁹⁸ let (DLP)</div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        <b>Útok:</b> útočník zachytí encrypted komunikaci mezi readerem a chipem; offline brute-force MRZ derived keys.
        Pokud zná z foto pasu nebo sociálních sítí <b>DOB</b> nebo <b>expiraci</b>, entropie klesá. Sekvenční passport numbers (jako v USA pre-2007) snižují passport entropy z 33 na ~20 bitů.
        <b>PACE</b> používá Diffie-Hellman → i s plně známým MRZ je session klíč chráněn DLP problémem (Brainpool P-256).
        <b>Forward secrecy</b>: úprava v MRZ neohrozí minulé sessions (BAC nemá PFS).
      </div>
    </div>
  );
}

function Bar({ bits, maxBits, color }) {
  return (
    <div style={{ height: 14, background: "var(--bg-card)", borderRadius: 7, overflow: "hidden", position: "relative" }}>
      <div style={{ width: `${Math.min(100, bits / maxBits * 100)}%`, height: "100%", background: color }} />
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const statBox = { background: "var(--bg-inset)", padding: 10, borderRadius: 6, textAlign: "center" };
const statLbl = { fontSize: 10, color: "var(--text-muted)" };
const statVal = { fontSize: 18, fontWeight: 600, fontFamily: "var(--font-mono)", marginTop: 4 };
