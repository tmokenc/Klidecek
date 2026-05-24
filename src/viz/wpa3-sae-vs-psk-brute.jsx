// wpa3-sae-vs-psk-brute — Compare offline (WPA2) vs online-only (WPA3-SAE)
// brute force. Time to crack pw of given length and charset.
import { useState } from "react";

function timeToCrack(pwLen, charsetSize, attemptsPerSec) {
  const space = Math.pow(charsetSize, pwLen);
  return (space / 2) / attemptsPerSec; // average half space
}

function fmtTime(sec) {
  if (sec < 60) return sec.toFixed(1) + " s";
  if (sec < 3600) return (sec / 60).toFixed(1) + " min";
  if (sec < 86400) return (sec / 3600).toFixed(1) + " h";
  if (sec < 86400 * 365) return (sec / 86400).toFixed(1) + " dní";
  if (sec < 86400 * 365 * 1e6) return (sec / 86400 / 365).toFixed(1) + " let";
  return (sec / 86400 / 365 / 1e6).toFixed(1) + " mil. let";
}

export default function Wpa3SaeVsPskBrute() {
  const [pwLen, setPwLen] = useState(8);
  const [charset, setCharset] = useState("alnum"); // alnum, az, dict
  const charsetSize = charset === "dict" ? 1 : charset === "az" ? 26 : 62;
  const dictSize = 14_344_391; // rockyou.txt size

  // WPA2: offline. Hashcat with RTX 4090: ~ 1 MH/s for WPA-PBKDF2.
  const wpa2Rate = 1_000_000;
  // WPA3 SAE: online only, 1 attempt/second (AP rate limit).
  const wpa3Rate = 1;

  const wpa2Sec = charset === "dict" ? dictSize / 2 / wpa2Rate : timeToCrack(pwLen, charsetSize, wpa2Rate);
  const wpa3Sec = charset === "dict" ? dictSize / 2 / wpa3Rate : timeToCrack(pwLen, charsetSize, wpa3Rate);

  const W = 580, H = 240;

  // Bars: log scale (years).
  const wpa2Years = wpa2Sec / 86400 / 365;
  const wpa3Years = wpa3Sec / 86400 / 365;
  const logScale = (years) => {
    if (years <= 0) return 0;
    return Math.max(0, Math.min(220, (Math.log10(years) + 6) * 25));
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8, fontSize: 11 }}>
        <div>
          Password length = {pwLen}
          <input type="range" min="4" max="20" value={pwLen} onChange={e => setPwLen(+e.target.value)} style={{ width: "100%" }} />
        </div>
        <div>
          Charset:
          <select value={charset} onChange={e => setCharset(e.target.value)} style={ctrl}>
            <option value="az">26 lowercase</option>
            <option value="alnum">62 alnum (a-zA-Z0-9)</option>
            <option value="dict">dictionary attack (rockyou 14M)</option>
          </select>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* WPA2 card */}
        <rect x={20} y={20} width={270} height={200} rx="4" fill="oklch(0.65 0.18 22 / 0.15)" stroke="oklch(0.65 0.18 22)" />
        <text x={155} y={40} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">WPA2-PSK (offline)</text>
        <text x={155} y={55} textAnchor="middle" fontSize="9" fill="var(--text-muted)">capture handshake → hashcat GPU</text>
        <text x={155} y={73} textAnchor="middle" fontSize="10" fontFamily="ui-monospace, monospace" fill="var(--text)">rate = {wpa2Rate.toExponential(0)} attempts/s</text>
        <rect x={35} y={90} width={240} height={20} fill="var(--bg-inset)" stroke="var(--line)" />
        <rect x={35} y={90} width={logScale(wpa2Years)} height={20} fill="oklch(0.65 0.18 22 / 0.7)" />
        <text x={155} y={140} textAnchor="middle" fontSize="16" fontWeight="700" fill="oklch(0.65 0.18 22)">{fmtTime(wpa2Sec)}</text>
        <text x={155} y={165} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)">
          {wpa2Sec < 86400 ? "crack in a day" :
           wpa2Sec < 86400 * 365 ? "crack in months" : "infeasible"}
        </text>

        {/* WPA3 card */}
        <rect x={300} y={20} width={260} height={200} rx="4" fill="oklch(0.7 0.15 145 / 0.15)" stroke="oklch(0.7 0.15 145)" />
        <text x={430} y={40} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">WPA3-SAE (online only)</text>
        <text x={430} y={55} textAnchor="middle" fontSize="9" fill="var(--text-muted)">Dragonfly PAKE, AP rate-limits</text>
        <text x={430} y={73} textAnchor="middle" fontSize="10" fontFamily="ui-monospace, monospace" fill="var(--text)">rate = {wpa3Rate} attempt/s</text>
        <rect x={315} y={90} width={230} height={20} fill="var(--bg-inset)" stroke="var(--line)" />
        <rect x={315} y={90} width={logScale(wpa3Years)} height={20} fill="oklch(0.7 0.15 145 / 0.7)" />
        <text x={430} y={140} textAnchor="middle" fontSize="16" fontWeight="700" fill="oklch(0.7 0.15 145)">{fmtTime(wpa3Sec)}</text>
        <text x={430} y={165} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)">
          {wpa3Sec > 86400 * 365 ? "infeasible" :
           wpa3Sec > 86400 * 30 ? "months online" : "weak pw stále zranitelné"}
        </text>

        <text x={W / 2} y={205} textAnchor="middle" fontSize="9.5" fill="var(--text-faint)">
          ratio = {(wpa3Sec / wpa2Sec).toExponential(1)}× pomalejší online
        </text>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        WPA3 SAE: každý guess vyžaduje *online* interakci s AP — rate limit srazí útok z miliónů/s na 1/s.
        Slabé heslo stále zranitelné, ale offline dictionary attack <i>eliminován</i>. Plus <b>forward secrecy</b> (DH per session).
      </div>
    </div>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 5px", borderRadius: 3, fontSize: 11, marginLeft: 5 };
