// Mobilní formulář a softwarová klávesnice.
// Toggle "klávesnice nahoře" ukazuje, že label NAD polem zůstává viditelný,
// kdežto placeholder uvnitř pole po začátku psaní zmizí a label-uvnitř
// (floating) se musí odsunout. Druhý toggle přepíná typ klávesnice podle
// input type (text / email / tel).
import { useState } from "react";

const W = 320, H = 280;

const KEYS = {
  text: ["q w e r t z u i o p", "a s d f g h j k l", "y x c v b n m", "mezerník"],
  email: ["q w e r t z u i o p", "a s d f g h j k l @", "y x c v b n m .", ". com  @  mezerník"],
  tel: ["1 2 3", "4 5 6", "7 8 9", "+ 0 #"],
};

export default function TamaFormKeyboard() {
  const [kb, setKb] = useState(true); // klávesnice vysunutá
  const [type, setType] = useState("text"); // text | email | tel
  const typing = kb; // při vysunuté klávesnici předpokládáme, že uživatel píše

  const fieldY = 60; // pole "se štítkem nad" (good)
  const badY = 140; // pole "se štítkem jen jako placeholder" (bad)
  const kbTop = 168; // horní hrana klávesnice když je nahoře

  const labelText = type === "email" ? "E-mail" : type === "tel" ? "Telefon" : "Jméno";
  const placeholder = type === "email" ? "jan@example.com" : type === "tel" ? "+420 …" : "Jan Novák";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="viz-controls">
        <button className="viz-btn" data-active={kb} onClick={() => setKb((k) => !k)}>
          {kb ? "klávesnice nahoře" : "klávesnice dole"}
        </button>
        <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>input type:</span>
        {["text", "email", "tel"].map((t) => (
          <button key={t} className="viz-btn" data-active={type === t} onClick={() => setType(t)}>{t}</button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 320 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />
        {/* tělo telefonu */}
        <rect x="16" y="12" width={W - 32} height={H - 24} rx="14" fill="var(--bg-card)" stroke="var(--line-strong)" strokeWidth="1.5" />

        {/* --- POLE 1: label NAD polem (správně) --- */}
        <text x="36" y={fieldY - 8} fontSize="10.5" fontWeight="600" fill="var(--text)">{labelText}</text>
        <rect x="36" y={fieldY} width={W - 72} height={30} rx="5" fill="var(--bg-inset)" stroke="var(--accent)" strokeWidth="1.4" />
        <text x="46" y={fieldY + 19} fontSize="11" fontFamily="var(--font-mono)"
          fill={typing ? "var(--text)" : "var(--text-faint)"}>
          {typing ? (type === "tel" ? "+420 777" : type === "email" ? "jan@ex" : "Jan") : placeholder}
        </text>
        {typing && <line x1={type === "tel" ? 105 : type === "email" ? 96 : 70} y1={fieldY + 8} x2={type === "tel" ? 105 : type === "email" ? 96 : 70} y2={fieldY + 22} stroke="var(--accent)" strokeWidth="1.2" />}
        <text x="36" y={fieldY + 46} fontSize="8.5" fill="oklch(0.5 0.15 150)">✓ label nad polem — vidět i při psaní</text>

        {/* --- POLE 2: label jen jako placeholder (špatně) --- */}
        <rect x="36" y={badY} width={W - 72} height={30} rx="5" fill="var(--bg-inset)" stroke="var(--line)" strokeWidth="1" />
        <text x="46" y={badY + 19} fontSize="11" fontFamily="var(--font-mono)"
          fill={typing ? "var(--text)" : "var(--text-faint)"}>
          {typing ? "Aha 12" : labelText}
        </text>
        <text x="36" y={badY + 46} fontSize="8.5"
          fill={typing ? "oklch(0.6 0.19 25)" : "var(--text-muted)"}>
          {typing ? "✗ placeholder zmizel — kontext ztracen" : "label jen jako placeholder uvnitř"}
        </text>

        {/* --- softwarová klávesnice --- */}
        {kb && (
          <g>
            <rect x="16" y={kbTop} width={W - 32} height={H - 24 - (kbTop - 12)} rx="0" fill="var(--bg-inset)" stroke="var(--line)" />
            <rect x="16" y={kbTop} width={W - 32} height="3" fill="var(--accent)" fillOpacity="0.5" />
            {KEYS[type].map((row, i) => (
              <text key={i} x={W / 2} y={kbTop + 20 + i * 20} textAnchor="middle"
                fontSize={type === "tel" ? "14" : "10.5"} fontFamily="var(--font-mono)"
                letterSpacing={type === "tel" ? "6" : "1.5"} fill="var(--text)">{row}</text>
            ))}
            <text x={W / 2} y={kbTop + 20 + (KEYS[type].length - 1) * 20 + 16} textAnchor="middle" fontSize="8.5" fill="var(--accent)" fontFamily="var(--font-mono)">
              klávesnice pro „{type}"
            </text>
          </g>
        )}
      </svg>

      <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        Při vysunuté klávesnici zůstává <strong>label nad polem</strong> viditelný, takže uživatel pořád ví, co vyplňuje.
        <strong> Placeholder</strong> po začátku psaní zmizí a kontext se ztratí — proto nenahrazuje label.
        Správný <strong>input type</strong> navíc vyvolá vhodnou klávesnici (e-mail s @, telefon s numerickou).
      </div>
    </div>
  );
}
