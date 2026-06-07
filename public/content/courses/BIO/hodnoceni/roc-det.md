---
title: Křivky ROC a DET
---

# Křivky ROC a DET

**ROC** (Receiver Operating Characteristic) a **DET** (Detection Error Tradeoff) jsou *grafické* metody pro vizualizaci chybových měr ([[far-frr]], [[fmr-fnmr-eer]]) biometrického systému *přes celý rozsah prahu (threshold)*. Místo jediné skalární hodnoty zobrazují kompromis (trade-off) v podobě křivky.

## ROC — Receiver Operating Characteristic

Křivka ROC vyjadřuje vztah:

* **Osa X:** FAR (False Accept Rate) — typicky v logaritmickém měřítku (log scale).
* **Osa Y:** GAR (= 1 − FRR) — Genuine Accept Rate, tedy míra správného přijetí oprávněných osob.

::: svg "ROC křivka: kompromis mezi FAR a GAR. Lepší systém je 'blíže levému hornímu rohu'."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--text)" stroke-width="1" fill="none">
    <path d="M50,180 L500,180"/>
    <path d="M50,180 L50,20"/>
  </g>
  <g stroke="rgba(150,150,150,0.5)" stroke-width="1" stroke-dasharray="2 3" fill="none">
    <path d="M50,180 L500,20"/>
  </g>
  <g stroke="rgb(64,192,87)" stroke-width="2" fill="none">
    <path d="M50,180 C60,80 100,40 200,30 L500,25"/>
  </g>
  <g stroke="var(--danger, #d33)" stroke-width="2" fill="none">
    <path d="M50,180 C100,100 200,60 300,55 L500,30"/>
  </g>
  <g stroke="var(--accent)" stroke-width="2" fill="none">
    <path d="M50,180 C150,150 300,100 500,40"/>
  </g>
  <g fill="var(--text)" text-anchor="start" font-size="11">
    <text x="200" y="50" fill="rgb(64,192,87)">System A (best)</text>
    <text x="220" y="100" fill="var(--danger, #d33)">System B</text>
    <text x="280" y="140" fill="var(--accent)">System C (worst)</text>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="275" y="200">FAR (log scale)</text>
    <text x="22" y="100" transform="rotate(-90, 22, 100)">GAR = 1 − FRR</text>
  </g>
  <g fill="var(--text-muted)" font-size="9" text-anchor="middle">
    <text x="280" y="170">random (diagonal)</text>
  </g>
</svg>
:::

* **„Ideální" systém** (perfect) — křivka prochází *bodem (0, 1)*: nulová FAR a plná GAR.
* **„Bezcenný" systém** (random) — diagonála od (0, 0) do (1, 1); rozhoduje vlastně náhodně.
* **Praktické systémy** — leží někde mezi; čím *blíže k bodu (0, 1)*, tím lepší.

### Pracovní bod (operating point)

Každý bod na křivce odpovídá jednomu *prahu (threshold)*. Návrhář volí *pracovní bod (operating point)* podle aplikace:

* **Vysoká bezpečnost (high-security):** posun *vlevo* (nízká FAR), za cenu *vyšší* FRR.
* **Vysoké pohodlí (high-convenience):** posun *vpravo* (nízká FRR), za cenu *vyšší* FAR.

### AUC — Area Under Curve

* **AUC** je integrální plocha pod ROC křivkou.
* **AUC = 1** — dokonalý systém.
* **AUC = 0,5** — náhodné rozhodování.
* **AUC > 0,95** — výborný systém pro většinu biometrik.

### Příklad výpočtu

Test s 50 oprávněnými (genuine) a 50 podvodnými (impostor) skóre, kdy postupně zvyšujeme práh:

| Práh | TP | FP | TN | FN | FAR | GAR |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 0.1 | 50 | 50 | 0 | 0 | 1.00 | 1.00 |
| 0.3 | 48 | 25 | 25 | 2 | 0.50 | 0.96 |
| 0.5 | 45 | 10 | 40 | 5 | 0.20 | 0.90 |
| 0.7 | 35 | 2 | 48 | 15 | 0.04 | 0.70 |
| 0.9 | 10 | 0 | 50 | 40 | 0.00 | 0.20 |

Dvojice (FAR, GAR) vyneseme do grafu, čímž vznikne ROC křivka.

## DET — Detection Error Tradeoff

Alternativní vizualizace, *oblíbená v biometrii*:

* **Osa X:** FAR (logaritmické měřítko).
* **Osa Y:** FRR (logaritmické měřítko).

::: svg "DET křivka: obě osy v logaritmickém měřítku, klesající křivka systému, bod EER na diagonále."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--text)" stroke-width="1" fill="none">
    <path d="M50,180 L500,180"/>
    <path d="M50,180 L50,20"/>
  </g>
  <g stroke="rgba(150,150,150,0.5)" stroke-width="1" stroke-dasharray="2 3" fill="none">
    <path d="M50,20 L500,180"/>
  </g>
  <g stroke="rgb(64,192,87)" stroke-width="2" fill="none">
    <path d="M55,140 C150,80 250,50 460,30"/>
  </g>
  <g stroke="var(--danger, #d33)" stroke-width="2" fill="none">
    <path d="M55,170 C200,110 320,80 460,50"/>
  </g>
  <circle cx="201" cy="74" r="4" fill="rgb(64,192,87)"/>
  <circle cx="270" cy="100" r="4" fill="var(--danger, #d33)"/>
  <g fill="var(--text)" text-anchor="start" font-size="11">
    <text x="200" y="50" fill="rgb(64,192,87)">System A</text>
    <text x="300" y="80" fill="var(--danger, #d33)">System B</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="201" y="68">EER A</text>
    <text x="270" y="115">EER B</text>
    <text x="280" y="200">FAR (log)</text>
    <text x="22" y="100" transform="rotate(-90, 22, 100)">FRR (log)</text>
    <text x="120" y="58" transform="rotate(19.6, 120, 58)">EER line (FAR = FRR)</text>
  </g>
</svg>
:::

* **Bod EER** leží na **diagonále** (FAR = FRR).
* **Lepší systémy** mají křivku *blíže* levému dolnímu rohu (obě chybové míry jsou nízké).
* **Logaritmické měřítko** umožní porovnávat systémy s *velmi nízkými* chybovými mírami ($10^{-6}$).

### Proč DET místo ROC?

* **ROC** je standard ve většině literatury o strojovém učení.
* **DET** je *preferovaná v biometrii* — logaritmická měřítka lépe ukazují *prakticky používané* pracovní oblasti.
* Pro **identifikaci** (křivky CMC) nestačí ani jedna z nich; CMC je samostatný typ křivky.

::: viz roc-det-explorer "ROC a DET v jednom okně; přepínáte systémy a operační body (EER, FAR=10⁻⁴/10⁻⁶)."
:::

## Praktická interpretace ROC/DET

* **Křivka A vs. B:** pokud je A *všude* nad B (v ROC) nebo *všude* pod B (v DET), pak je A *jednoznačně lepší*.
* **Křivky se kříží:** A je lepší v určitém rozsahu FAR, B v jiném. Volba pak závisí na *pracovním bodu (operating point)*.
* **Plochý úsek křivky** = systém je robustní v daném rozsahu prahů; *strmý* úsek = systém je v něm citlivý.

## Standardní pracovní body

V biometrickém průmyslu se vykazují *konkrétní* body:

* **FAR @ 10⁻⁴** = „FAR = 0,01 %, jaká je FRR?".
* **FAR @ 10⁻⁶** = „FAR = 1 ppm, jaká je FRR?".
* **EER** = „kde platí FAR = FRR?".

Příklad ze [NIST FRVT 2024](https://pages.nist.gov/frvt/):

| Dodavatel | FRR @ FAR=10⁻⁶ |
| :--- | :---: |
| NTECH Lab | 0.0010 |
| Cloudwalk | 0.0024 |
| SenseTime | 0.0035 |
| Spodní percentil (slabší dodavatelé) | 0.05 |
| Nejhorší (starší systémy) | > 0.5 |

## Interpretace pro nasazení

Pro reálné nasazení:

1. **Definuj omezení pracovního bodu** — např. „FAR musí být < 0,001 %".
2. **Spočítej příslušný práh** z dat ROC/DET.
3. **Sleduj FRR** — pokud je > 5 %, je uživatelský zážitek špatný.
4. Pokud nelze splnit obě podmínky najednou, je potřeba *lepší* biometrický systém nebo *multimodální fúze* (multimodal fusion).

## Limity ROC/DET

* **Statistická spolehlivost** — pro FAR na úrovni $10^{-6}$ potřebujete *alespoň* $10^7$ porovnání s podvodnými vzorky (impostor comparisons). Testovací sady tedy musí být velké.
* **Zkreslení datové sady (dataset bias)** — *demografické* vlivy (různé chybové míry pro různá pohlaví, etnické skupiny a věk). Je vhodné provést audit spravedlivosti (fairness) ([NIST FRVT Part 3: Demographic Effects](https://pages.nist.gov/frvt/reports/demographics/annexes/annex_16.pdf)).
* **Stárnutí (aging)** — ROC měřená na *čerstvých* šablonách neodpovídá *reálnému provozu* po roce či po desítkách let.
* **Odolnost vůči útoku (adversarial)** — žádný ROC graf neukáže *zranitelnost (vulnerability)* vůči podvržení (spoofing) ([[liveness]]).

---

*Zdroj: BIO přednášky 2025/26, BIO 2 — Hodnocení spolehlivosti a kvality. Externí reference: ISO/IEC 19795-1:2021 *Biometric performance testing and reporting*; Martin, A. et al.: *The DET Curve in Assessment of Detection Task Performance* (Eurospeech 1997) — [PDF](https://www.itl.nist.gov/iad/mig/publications/storage_paper/det.pdf); NIST FRVT Ongoing — [pages.nist.gov/frvt](https://pages.nist.gov/frvt/); Bradley, A. P.: *The use of the area under the ROC curve in the evaluation of machine learning algorithms* (Pattern Recognition 1997).*
