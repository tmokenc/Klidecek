---
title: FMR, FNMR, EER a další míry
---

# FMR, FNMR, EER a další míry

Vedle základních [FAR/FRR]([[far-frr]]) má biometrie celou rodinu **specializovaných** chybových měr. Některé pracují na úrovni *single comparison* (FMR/FNMR), jiné agregují přes celou operating curve (EER, ZeroFMR). Znalost rozdílů je klíčová pro správnou interpretaci výsledků.

## FMR — False Match Rate

**Míra chybné shody** — pravděpodobnost, že porovnání *dvou různých* osob *náhodou* vyjde jako *match*.

::: math
\text{FMR} = \frac{\text{počet shodných impostor comparisonů}}{\text{celkový počet impostor comparisonů}}
:::

* **Pracovní úroveň:** *single comparison* (1:1 porovnání dvou šablon).
* **Rozdíl od FAR:** FAR pracuje s celým *transakčním* procesem (more retries, multiple modalities); FMR jen na úrovni jednotlivého matching.

## FNMR — False Non-Match Rate

**Míra chybné neshody** — pravděpodobnost, že porovnání *stejné* osoby *náhodou* vyjde jako *no match*.

::: math
\text{FNMR} = \frac{\text{počet neshodných genuine comparisonů}}{\text{celkový počet genuine comparisonů}}
:::

## TMR a TNMR

* **TMR** (True Match Rate) = $1 - \text{FNMR}$ — správně rozpoznané genuine.
* **TNMR** (True Non-Match Rate) = $1 - \text{FMR}$ — správně odmítnuté impostor.

## FAR/FRR vs. FMR/FNMR

Vztah:

::: math
\begin{aligned}
\text{FAR} &\approx 1 - (1 - \text{FMR})^N \quad \text{pro N comparisons} \\
\text{FRR} &\approx 1 - (1 - \text{FNMR})^M \quad \text{pro M retries}
\end{aligned}
:::

* **Pro 1:1 verifikaci** s jedním pokusem: FAR ≈ FMR, FRR ≈ FNMR.
* **Pro 1:N identifikaci**: FAR roste lineárně s velikostí databáze.
* **Pro vícero pokusů** (retry policy): FRR klesá (víc šancí), ale FAR roste.

Praktický důsledek: pro large-scale systémy (Aadhaar) je nutné velmi nízké FMR ($10^{-9}$+).

## EER — Equal Error Rate

**Míra vyrovnání chyb** — bod, ve kterém *FAR = FRR*.

::: svg "EER bod: kde FAR křivka (rostoucí s threshold) protíná FRR křivku (klesající)."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--text)" stroke-width="1" fill="none">
    <path d="M40,180 L500,180"/>
    <path d="M40,180 L40,30"/>
  </g>
  <g stroke="var(--danger, #d33)" stroke-width="2" fill="none">
    <path d="M50,150 C150,100 280,40 460,30"/>
  </g>
  <g stroke="rgb(64,192,87)" stroke-width="2" fill="none">
    <path d="M50,30 C150,40 280,120 460,170"/>
  </g>
  <g stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 3" fill="none">
    <path d="M255,80 L255,180"/>
    <path d="M40,80 L255,80"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="100" y="60" font-size="11" fill="rgb(64,192,87)">FRR</text>
    <text x="100" y="170" font-size="11" fill="var(--danger, #d33)">FAR</text>
    <text x="255" y="65" font-size="11" fill="var(--accent)">EER</text>
    <text x="265" y="200" font-size="10" fill="var(--text-muted)">τ</text>
    <text x="22" y="80" font-size="10" fill="var(--text-muted)">EER value</text>
  </g>
  <circle cx="255" cy="80" r="4" fill="var(--accent)"/>
</svg>
:::

* **Vlastnost:** *jediná* skalární hodnota charakterizující systém.
* **Výhoda:** snadná comparison mezi systémy ("System A má 0.1 % EER, System B má 0.5 % EER").
* **Nevýhoda:** *abstrahuje* od konkrétního operating point; reálné nasazení obvykle neprovádí na EER (typicky high-security = low FAR).

### Typická EER

| Biometrika | EER |
| :--- | :---: |
| Iris (Daugman) | $10^{-5}$ |
| Fingerprint (NIST FpVTE) | $\sim 0.1\%$ |
| Face (DL, FRVT 2024) | $\sim 0.05\%$ |
| Voice (best DL) | $\sim 1\%$ |
| Signature (online) | $\sim 2-5\%$ |
| Keystroke dynamics | $\sim 5-10\%$ |

## ZeroFMR a ZeroFNMR

* **ZeroFMR** — FNMR při FMR = 0 (zero false matches).
* **ZeroFNMR** — FMR při FNMR = 0 (zero false non-matches).

Použití: scenarios, kde *jedna* chyba je nepřípustná.

* **High-security access** — FMR = 0; ZeroFMR udává, jak často legitimní uživatel selže.
* **Forensic identification** — FNMR = 0; ZeroFNMR udává, jak často je false positive.

## d' (d-prime) — Bhattacharyya distance

Měří **separovatelnost** distribucí genuine a impostor scores:

::: math
d' = \frac{|\mu_{\text{genuine}} - \mu_{\text{impostor}}|}{\sqrt{(\sigma_{\text{genuine}}^2 + \sigma_{\text{impostor}}^2) / 2}}
:::

* **Vyšší d'** = lépe separované distribuce = lepší rozlišování.
* Pro **iris**: $d' > 12$. *Extrémně* vysoké.
* Pro **face** (DL): $d' \approx 6 - 8$.
* Pro **voice**: $d' \approx 3 - 5$.

## F-ratio

Statistická míra:

::: math
F = \frac{\sigma^2_{\text{between-class}}}{\sigma^2_{\text{within-class}}}
:::

* **Vyšší F** = lepší discriminability.
* Standardní pro **feature selection** v ML pipelines.

## Míry pro forenzní identifikaci

V kontextu identifikace (1:N), kde záleží na *rank* správné odpovědi:

### Rank-k Rate

* **Rank-1 rate** — pravděpodobnost, že **správná** osoba je *na prvním místě* seznamu kandidátů.
* **Rank-5 rate** — že je *mezi prvními 5*.
* **Rank-k rate** — že je *mezi prvními k*.

### CMC — Cumulative Match Characteristic

* Křivka: rank vs. cumulative recognition rate.
* Použití: forenzní AFIS, watchlist identification.
* Zarovnání: ROC pro verifikaci, CMC pro identifikaci.

## Slovníček: trade-off

* **Trade-off** mezi *bezpečností* (low FAR) a *uživatelským pohodlím* (low FRR).
* Není možné mít *zároveň* nízké oba — distribuce skóre se *fyzikálně překrývají*.
* Jediná cesta ke snížení obou současně je **lepší biometrika** (vyšší d', lépe separované distribuce) — vyžaduje *lepší senzor*, *lepší algoritmus*, *multimodální fusion*.

## Důležité pravidlo

> **Nepřibližujte chybové míry napříč různými datasety / podmínkami.** EER 0.1 % na *ideal lab data* neznamená EER 0.1 % v *real-world deployment*.

Pro fair comparison se používají standardní benchmarks:

* **NIST FpVTE** (Fingerprint Vendor Technology Evaluation).
* **NIST FRVT** (Face Recognition Vendor Test).
* **NIST IREX** (Iris Exchange).
* **NIST SRE** (Speaker Recognition Evaluation).

Pro detaily testing methodology viz [[testovani-eval]].

---

*Zdroj: BIO přednášky 2025/26, BIO 2 — Hodnocení spolehlivosti a kvality. Externí reference: ISO/IEC 19795-1:2021 *Biometric performance testing and reporting*; Mansfield, A. J., Wayman, J. L.: *Best Practices in Testing and Reporting Performance of Biometric Devices* (NPL 2002); NIST: *FRVT Ongoing* — [PDF reports](https://pages.nist.gov/frvt/reports/11/frvt_11_report.pdf); Daugman, J.: *Probing the uniqueness and randomness of iriscodes* (Proc. IEEE 2006).*
