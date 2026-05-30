---
title: Enigma — konstrukce
---

# Enigma — konstrukce

Enigma je elektromechanický rotorový stroj vyvinutý Arthurem Scherbiusem (patent 1918, komerční prodej 1923). Wehrmacht ji přijal v 1928 a vojenská varianta byla v provozu po celou 2. světovou válku. Stroj sám o sobě nebyl tajný — byl prodáván komerčně pro banky a podniky. Tajné byly *nastavení* (denní klíče) a vojenské varianty s plugboardem.

## Komponenty Enigmy I (Wehrmacht / Heer)

::: svg "Enigma I — schematický řez (zjednodušeno)"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="20"  y="40" width="60"  height="120" rx="6"/>
    <rect x="100" y="40" width="40"  height="120" rx="4"/>
    <rect x="155" y="40" width="40"  height="120" rx="4"/>
    <rect x="210" y="40" width="40"  height="120" rx="4"/>
    <rect x="265" y="40" width="50"  height="120" rx="6"/>
    <rect x="335" y="40" width="60"  height="120" rx="6"/>
    <rect x="415" y="40" width="100" height="120" rx="6"/>
  </g>
  <g fill="var(--text)" font-size="10.5" text-anchor="middle">
    <text x="50"  y="35">Klávesnice</text>
    <text x="50"  y="100">A B C…</text>
    <text x="120" y="35">Plugboard</text>
    <text x="120" y="105">(steckers)</text>
    <text x="175" y="35">R₁</text>
    <text x="230" y="35">R₂</text>
    <text x="290" y="35">R₃</text>
    <text x="365" y="35">Reflektor</text>
    <text x="365" y="105">UKW</text>
    <text x="465" y="35">Lampová deska</text>
    <text x="465" y="105">(rozsvítí písmeno)</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.1" fill="none">
    <path d="M80,100  L100,100"/>
    <path d="M140,100 L155,100"/>
    <path d="M195,100 L210,100"/>
    <path d="M250,100 L265,100"/>
    <path d="M315,100 L335,100"/>
    <path d="M395,100 L415,100"/>
  </g>
  <g stroke="var(--text-muted)" stroke-dasharray="2 2" fill="none">
    <path d="M395,140 L80,140"/>
  </g>
  <g fill="var(--text-muted)" font-size="10">
    <text x="240" y="200" text-anchor="middle">cesta proudu: tam (plné) a zpět přes reflektor (přerušované)</text>
  </g>
</svg>
:::

### Rotory (Walzen)

* **Set 3 rotorů** vybrán z 5 dostupných typů (I, II, III, IV, V). Pozdější varianty (M3 ponorky) měly výběr ze 7, M4 Kriegsmarine z 8.
* Každý rotor má *jinou* vnitřní permutaci.
* Každý rotor má vrubový kroužek (*notch*) na obvodu, který v určité pozici způsobí, že *další* rotor v řadě se posune. Pozice notche závisí na typu rotoru.
* **Ring setting (Ringstellung)** — kroužek s abecedou se může na rotoru nastavit do 26 pozic, čímž se posune relace mezi vnitřní permutací a externí značkou.

### Reflektor (Umkehrwalze, UKW)

* Pevná permutace, která **párově propojuje** všech 26 kontaktů — když přijde signál do A, výsledkem je třeba J, a obráceně J → A.
* Existují dvě hlavní verze: UKW-B (Wehrmacht 1937–) a UKW-C (krátkodobě 1944).
* Reflektor je důvod, proč je Enigma *involutivní* — šifrování a dešifrování stejnou operací. **A důvod, proč žádné písmeno se nezašifruje samo na sebe** — slabina, kterou polská a britská kryptoanalýza využila.

### Plugboard (Steckerbrett)

* Manuální propojovací panel s 26 zdířkami a 10 kabely.
* Kabel propojí dvě zdířky a *zamění* odpovídající písmena.
* Při zapojení 10 kabelů je 20 písmen "stecker" (zaměněných) a 6 zůstává "self-stecker".
* **Počet konfigurací plugboardu** = $\binom{26}{20} \cdot \frac{20!}{2^{10} \cdot 10!}$ = $\approx 1{,}5 \cdot 10^{14}$ — největší příspěvek k stavovému prostoru.

### Klávesnice + lampová deska

* 26 kláves (A–Z, žádné číslice ani interpunkce — operátor je hláskoval, např. "DREI" pro 3).
* Po stisku klávesy: rotory se *nejprve* posunou, *poté* proud projde stroje, lampa odpovídajícího ciphertextového písmena se rozsvítí.

::: viz enigma "Nastavte pozice rotorů a plugboard, klikněte na klávesnici — uvidíte cestu signálu plugboard → R1 → R2 → R3 → reflektor a zpět. Žádné písmeno nešifruje samo sebe."
:::

## Stavový prostor Enigmy

| Komponenta | Možností |
| :--- | :-: |
| Výběr 3 rotorů z 5 (na pořadí záleží) | $5 \cdot 4 \cdot 3 = 60$ |
| Nastavení 3 rotorů (počáteční pozice) | $26^3 = 17\,576$ |
| Ringstellung (3 × 26) | $26^3 = 17\,576$ (lze redukovat) |
| Plugboard (10 kabelů) | $\approx 1{,}5 \cdot 10^{14}$ |
| **Celkem** | $\approx 1{,}59 \cdot 10^{20}$ |

To je řád $\approx 2^{67}$ — pro brute force i v 21. století velmi obtížné, natož v 1940. Polská a britská kryptoanalýza nešla cestou brute force — využila *strukturní slabiny*.

## Denní klíč (Tagesschlüssel)

Wehrmacht publikoval pro každý den a každou jednotku v armádě **denní klíč** — soubor parametrů:

* Pořadí rotorů (Walzenlage), např. `III I IV`.
* Ringstellung (poloha abecedního kroužku), např. `AAA`.
* Plugboard (Steckerverbindungen), např. `AM FI NV PS TU WZ`.
* Indikační skupiny (Kenngruppen) pro identifikaci zprávy.

Denní klíče byly distribuovány v *Schlüsseltafel* — měsíční tabulce, kterou si operátor vyzvedl a držel pod zámkem. Vyzrazení Schlüsseltafelu znamenalo prolomení komunikace.

## Šifrování konkrétní zprávy

Operátor neposílal zprávu přímo s denním klíčem (to by byla *katastrofa*, opakované použití). Místo toho:

1. Operátor zvolí náhodné **klíč zprávy** (Spruchschlüssel), 3 písmena, např. `WAG`.
2. Nastaví Enigmu na *denní klíč* a zašifruje `WAG` *dvakrát* (do 1940 — pak pouze jednou). Výsledek je 6-znakový indikátor, např. `BLAVZX`.
3. Posune rotory na pozici `WAG` a zašifruje vlastní zprávu.
4. Indikátor `BLAVZX` připojí na začátek šifrovaného textu.

Příjemce s denním klíčem rozšifruje indikátor → získá `WAG` → posune rotory → rozšifruje zprávu. Zranitelnost spočívá v *opakování*: indikátor obsahuje `WAGWAG` zašifrované sériově, což polská kryptoanalýza využila.

## Námořní Enigma (M3, M4)

Námořní (Kriegsmarine) Enigma byla podstatně robustnější:

* **M3** (zavedena 1934; od 1940 výběr 3 rotorů z 8 — přidány rotory VI–VIII — namísto z 5).
* **M4** (1942, ponorky / U-Boote) — *čtvrtý* rotor "Beta" nebo "Gamma" pevně nastavený plus tenký reflektor UKW-B/C — efektivně 4 rotory.
* **Kurzsignal book / Wetterkurzschlüssel** — kódové knihy pro krátké zprávy o počasí, navigaci.

M4 znemožnila britské dešifrování od února 1942 do prosince 1942 — kritické období bitvy o Atlantik. Bletchley Park získal M4 zachycením tří kódových knih ze ztroskotaných ponorek (U-559 / 1942 byla rozhodující) a sestavil novou Bombu pro 4 rotory.

## Slabosti Enigmy *před* prolomením

1. **Reflektor → involuce** → žádné písmeno se nešifruje samo na sebe.
2. **Notch je v každém rotoru jen v jedné pozici** → posunutí prostředního rotoru je *předvídatelné*.
3. **Operátorská disciplína** — `HHHHHHHH` jako test, opakované hlavičky `WETTER`, denně stejný formát hlášení, plugboard nikdy nemíchal sousední písmena. Tato *cribs* polské/britské kryptoanalytice masivně pomáhaly.
4. **Indikační schéma** s opakováním `WAGWAG` (do 1940).
5. **Plugboard se nikdy nezavádí mezi sousední písmena** (jako bezpečnostní opatření operátora — ironicky to omezilo prostor zkoušení).

Detaily kryptoanalýzy viz [[enigma-utok]].

---

*Zdroj: KRY přednášky 2025/26, KRY 2 — Rotorové stroje. Externí reference: Welchman, G.: *The Hut Six Story* (M&M Baldwin 1997); Sebag-Montefiore, H.: *Enigma: The Battle for the Code* (Wiley 2000); Bauer, F. L.: *Decrypted Secrets* (4th ed., Springer 2007), kap. 8; Imperial War Museum & Bletchley Park, Buckinghamshire — sbírka rotorových strojů.*
