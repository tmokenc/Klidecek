// ZigBee default TC Link Key extraction.
// "ZigBeeAlliance09" je verejne znamy default v ZigBee 2007.
import { useState } from "react";

const DEFAULT_TLK = "5A 69 67 42 65 65 41 6C 6C 69 61 6E 63 65 30 39";
const DEFAULT_TLK_ASCII = "ZigBeeAlliance09";

export default function ZigbeeDefaultKey() {
  const [version, setVersion] = useState("zigbee2007");
  const [step, setStep] = useState(0);

  const installCodeUsed = version === "zigbee3";

  function reset() { setStep(0); }

  const steps = [
    {
      title: "1. ZigBee joiner se pripoji",
      msg: "Nove zarizeni vysila beacon request. Trust Center (koordinátor) odpovida s NWK Update.",
      attacker: "utocnik v dosahu (~30 m) muze sledovat join procedure.",
    },
    {
      title: "2. TC posila Network Key encrypted s TC Link Key",
      msg: installCodeUsed
        ? "Joiner predem zna individualni install code (vytisteny na zarizeni). TLK je odvozen z install code."
        : `TLK = ${DEFAULT_TLK} (ZigBee 2007 default — verejne znama hodnota!)`,
      attacker: installCodeUsed
        ? "utocnik bez install code TLK NEZNA — nemuze dekódovat Transport Key."
        : "utocnik zna TLK z dokumentace → dekóduje Transport Key.",
      danger: !installCodeUsed,
    },
    {
      title: "3. Joiner dekóduje a ulozi Network Key",
      msg: "Po uspesnem unwrap má joiner Network Key — sdileny vsemi uzly site.",
      attacker: installCodeUsed
        ? "utocnik stale nezna NWK Key."
        : "utocnik nyni zna NWK Key — muze cist, injektovat, modifikovat packety v cele síti.",
      danger: !installCodeUsed,
    },
    {
      title: "4. Sit v provozu",
      msg: "Vsechny broadcast packety jsou sifrovany NWK Key. Unicast pripojeneho linku jsou sifrovany Link Key.",
      attacker: installCodeUsed
        ? "utocnik nemůže pripojeni k sítí, dokud nezná install code daného zařízení."
        : "utocnik se muze pripojit jako legitimni uzel (zname NWK + Link Key), injektovat ON/OFF/lock/dim prikazy.",
      danger: !installCodeUsed,
    },
  ];

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>verze:</label>
        <select value={version} onChange={(e) => { setVersion(e.target.value); reset(); }} style={{ ...sel, minWidth: 220 }}>
          <option value="zigbee2007">ZigBee 2007 (default TLK)</option>
          <option value="zigbee3">ZigBee 3.0 (install code)</option>
        </select>
        <button style={btn} onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step >= steps.length - 1}>vpred →</button>
        <button style={btn} onClick={reset}>reset</button>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
          TC Link Key v plaintextu:
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, padding: "4px 0", color: installCodeUsed ? "#81b29a" : "#e07a5f" }}>
          {installCodeUsed
            ? `derived from install code "${"19A4 6850 2D31 67E1"}" (per-device unikatni)`
            : `${DEFAULT_TLK}   ← ASCII "${DEFAULT_TLK_ASCII}"`
          }
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {steps.slice(0, step + 1).map((s, i) => (
          <div key={i} style={{ padding: 10, borderRadius: 6,
            background: i === step ? "var(--bg-inset)" : "transparent",
            border: i === step ? "1px solid var(--line)" : "1px solid transparent" }}>
            <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>{s.title}</div>
            <div style={{ fontSize: 11, color: "var(--text)" }}>{s.msg}</div>
            <div style={{ fontSize: 11, color: s.danger ? "#e07a5f" : "#81b29a", marginTop: 4, fontStyle: "italic" }}>↳ utocnik: {s.attacker}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Default <span style={{ fontFamily: "var(--font-mono)" }}>ZigBeeAlliance09</span> klic je v specifikaci od 2007.
        Mnohé prvni-generace IKEA Tradfri, Philips Hue (do firmware update) tento klic používají dodnes. ZigBee 3.0 zavedlo
        per-device <b>install code</b> (8-byte unikatni hodnota, často vytisteny na zarizeni jako QR kod), z které se TLK odvodí přes Matyas-Meyer-Oseas.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
