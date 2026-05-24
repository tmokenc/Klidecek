---
title: ROC a DET křivky
---

# ROC a DET křivky

**ROC** (Receiver Operating Characteristic) a **DET** (Detection Error Tradeoff) jsou *grafické* metody pro vizualizaci chybových měr ([[far-frr]], [[fmr-fnmr-eer]]) biometrického systému *přes celý rozsah threshold*. Místo jedné scalární hodnoty ukazují *trade-off* křivkou.

## ROC — Receiver Operating Characteristic

Křivka ROC vyjadřuje vztah:

* **X-osa:** FAR (False Accept Rate) — typicky log scale.
* **Y-osa:** GAR (= 1 − FRR) — Genuine Accept Rate.

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

* **"Ideal" systém** (perfect) — křivka prochází *bodem (0, 1)*: nulová FAR, plná GAR.
* **"Useless" systém** (random) — diagonála od (0,0) do (1,1).
* **Praktické systémy** — někde mezi; *blíž k (0, 1)* = lepší.

### Operating point

Každý bod na křivce odpovídá jednomu *threshold*. Designér volí *operating point* podle aplikace:

* **High-security:** posun *vlevo* (low FAR), může mít *vyšší* FRR.
* **High-convenience:** posun *vpravo* (low FRR), může mít *vyšší* FAR.

### AUC — Area Under Curve

* **AUC** je integrální plocha pod ROC křivkou.
* **AUC = 1** — perfect systém.
* **AUC = 0.5** — random.
* **AUC > 0.95** — výborný systém pro většinu biometrik.

### Příklad výpočtu

Test s 50 genuine + 50 impostor scores, postupně zvyšujeme threshold:

| Threshold | TP | FP | TN | FN | FAR | GAR |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 0.1 | 50 | 50 | 0 | 0 | 1.00 | 1.00 |
| 0.3 | 48 | 25 | 25 | 2 | 0.50 | 0.96 |
| 0.5 | 45 | 10 | 40 | 5 | 0.20 | 0.90 |
| 0.7 | 35 | 2 | 48 | 15 | 0.04 | 0.70 |
| 0.9 | 10 | 0 | 50 | 40 | 0.00 | 0.20 |

Plot (FAR, GAR) pairs → ROC curve.

## DET — Detection Error Tradeoff

Alternativní vizualizace, *populární v biometrii*:

* **X-osa:** FAR (log scale).
* **Y-osa:** FRR (log scale).

::: svg "DET křivka: oba axes na log scale, systém klesající křivka, EER bod na diagonále."
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
  <circle cx="170" cy="120" r="4" fill="rgb(64,192,87)"/>
  <circle cx="270" cy="100" r="4" fill="var(--danger, #d33)"/>
  <g fill="var(--text)" text-anchor="start" font-size="11">
    <text x="200" y="50" fill="rgb(64,192,87)">System A</text>
    <text x="300" y="80" fill="var(--danger, #d33)">System B</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="170" y="135">EER A</text>
    <text x="270" y="115">EER B</text>
    <text x="280" y="200">FAR (log)</text>
    <text x="22" y="100" transform="rotate(-90, 22, 100)">FRR (log)</text>
    <text x="270" y="195">EER line (FAR = FRR)</text>
  </g>
</svg>
:::

* **EER bod** leží na **diagonále** (FAR = FRR).
* **Lepší systémy** mají křivku *bližší* levému dolnímu rohu (oba chybové míry low).
* **Log scale** dovolí porovnání systémů s *velmi nízkými* error rates ($10^{-6}$).

### Proč DET vs. ROC?

* **ROC** je standard ve většině ML literatury.
* **DET** je *preferred v biometrii* — log scales lépe ukazují *practical* operating regions.
* Pro **identifikaci** (CMC křivky) ani jedno nestačí; CMC je samostatný typ.

::: viz roc-det-explorer "ROC a DET v jednom okně; přepínáte systémy a operační body (EER, FAR=10⁻⁴/10⁻⁶)."
:::

## Praktická interpretace ROC/DET

* **Křivka A vs. B:** pokud A je *všude* nad B (v ROC) nebo *všude* pod B (v DET), A je *jednoznačně lepší*.
* **Křivky se kříží:** A je lepší v určitém rozsahu FAR, B v jiném. Volba závisí na *operating point*.
* **Plochý úsek křivky** = robustní v daném rozsahu thresholds; *strmý* úsek = citlivý.

## Standardní operating points

V biometric industry se reportují *konkrétní* body:

* **FAR @ 10⁻⁴** = "FAR = 0.01 %, jaká je FRR?".
* **FAR @ 10⁻⁶** = "FAR = 1 ppm, jaká je FRR?".
* **EER** = "kde FAR = FRR?".

Příklad ze [NIST FRVT 2024](https://pages.nist.gov/frvt/):

| Vendor | FRR @ FAR=10⁻⁶ |
| :--- | :---: |
| NTECH Lab | 0.0010 |
| Cloudwalk | 0.0024 |
| SenseTime | 0.0035 |
| 100. percentil | 0.05 |
| Worst (older systems) | > 0.5 |

## Interpretace pro deployment

Pro reálné nasazení:

1. **Definuj operating constraint** — např. "FAR must be < 0.001 %".
2. **Spočítej příslušný threshold** z ROC/DET dat.
3. **Sleduj FRR** — pokud > 5 %, uživatelský zážitek je špatný.
4. Pokud nelze splnit obě, je třeba *lepší* biometrický systém nebo *multimodální fusion*.

## Limity ROC/DET

* **Statistická spolehlivost** — pro $10^{-6}$ FAR potřebujete *minimálně* $10^7$ impostor comparisonů. Test sets musí být velké.
* **Dataset bias** — *demographic* effects (různé chybové míry pro různé pohlaví, etnické skupiny, věk). Audit fairness ([NIST FRVT Part 3: Demographic Effects](https://pages.nist.gov/frvt/reports/demographics/annexes/annex_16.pdf)).
* **Aging** — ROC měřená na *čerstvých* šablonách neodráží *real-world* po roce / desítkách let.
* **Adversarial** — žádný ROC plot neukáže *vulnerability* vůči spoofing ([[liveness]]).

---

*Zdroj: BIO přednášky 2025/26, BIO 2 — Hodnocení spolehlivosti a kvality. Externí reference: ISO/IEC 19795-1:2021 *Biometric performance testing and reporting*; Martin, A. et al.: *The DET Curve in Assessment of Detection Task Performance* (Eurospeech 1997) — [PDF](https://www.itl.nist.gov/iad/mig/publications/storage_paper/det.pdf); NIST FRVT Ongoing — [pages.nist.gov/frvt](https://pages.nist.gov/frvt/); Bradley, A. P.: *The use of the area under the ROC curve in the evaluation of machine learning algorithms* (Pattern Recognition 1997).*
