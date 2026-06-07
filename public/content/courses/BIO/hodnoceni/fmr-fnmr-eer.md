---
title: FMR, FNMR, EER a další míry
---

# FMR, FNMR, EER a další míry

Vedle základních [[far-frr|FAR/FRR]] má biometrie celou rodinu **specializovaných** chybových měr. Některé pracují na úrovni jednoho porovnání (single comparison) — tedy posuzují jediné srovnání dvou šablon (FMR/FNMR), jiné agregují přes celou pracovní křivku (operating curve), tj. přes všechny možné prahy najednou (EER, ZeroFMR). Znalost těchto rozdílů je klíčová pro správnou interpretaci výsledků.

## FMR — False Match Rate

**Míra chybné shody (False Match Rate)** — pravděpodobnost, že porovnání *dvou různých* osob *náhodou* vyjde jako shoda (match).

::: math
\text{FMR} = \frac{\text{počet shodných impostor comparisonů}}{\text{celkový počet impostor comparisonů}}
:::

* **Pracovní úroveň:** jedno porovnání (single comparison), tedy srovnání 1:1 dvou šablon.
* **Rozdíl od FAR:** FAR pracuje s celým *transakčním* procesem (více pokusů, více modalit dohromady), zatímco FMR se týká jen úrovně jediného porovnání (matching).

## FNMR — False Non-Match Rate

**Míra chybné neshody (False Non-Match Rate)** — pravděpodobnost, že porovnání *stejné* osoby *náhodou* vyjde jako neshoda (no match).

::: math
\text{FNMR} = \frac{\text{počet neshodných genuine comparisonů}}{\text{celkový počet genuine comparisonů}}
:::

## TMR a TNMR

* **TMR** (True Match Rate) = $1 - \text{FNMR}$ — podíl správně rozpoznaných pravých porovnání (genuine).
* **TNMR** (True Non-Match Rate) = $1 - \text{FMR}$ — podíl správně odmítnutých podvodných porovnání (impostor).

## FAR/FRR vs. FMR/FNMR

Vztah mezi nimi:

::: math
\begin{aligned}
\text{FAR} &\approx 1 - (1 - \text{FMR})^N \quad \text{pro N comparisons} \\
\text{FRR} &\approx 1 - (1 - \text{FNMR})^M \quad \text{pro M retries}
\end{aligned}
:::

* **Pro verifikaci 1:1** s jediným pokusem platí: FAR ≈ FMR, FRR ≈ FNMR.
* **Pro identifikaci 1:N** roste FAR lineárně s velikostí databáze.
* **Pro více pokusů** (politika opakování, retry policy) FRR klesá (uživatel má více šancí), ale FAR zároveň roste.

Praktický důsledek: u rozsáhlých systémů (large-scale, např. Aadhaar) je nutné dosáhnout velmi nízkého FMR ($10^{-9}$ a méně).

## EER — Equal Error Rate

**Míra vyrovnání chyb (Equal Error Rate)** — bod, ve kterém platí *FAR = FRR*.

::: svg "EER bod: kde křivka FAR (rostoucí s prahem) protíná křivku FRR (klesající)."
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
    <path d="M212,80 L212,180"/>
    <path d="M40,80 L212,80"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="100" y="60" font-size="11" fill="rgb(64,192,87)">FRR</text>
    <text x="100" y="170" font-size="11" fill="var(--danger, #d33)">FAR</text>
    <text x="212" y="65" font-size="11" fill="var(--accent)">EER</text>
    <text x="222" y="200" font-size="10" fill="var(--text-muted)">τ</text>
    <text x="22" y="80" font-size="10" fill="var(--text-muted)">EER value</text>
  </g>
  <circle cx="212" cy="80" r="4" fill="var(--accent)"/>
</svg>
:::

* **Vlastnost:** jde o *jedinou* skalární hodnotu, která charakterizuje celý systém.
* **Výhoda:** umožňuje snadné porovnání mezi systémy („Systém A má EER 0,1 %, systém B má EER 0,5 %“).
* **Nevýhoda:** *odhlíží* od konkrétního pracovního bodu (operating point); reálné nasazení obvykle neběží na úrovni EER (typicky se u vysoce zabezpečených aplikací volí nízké FAR).

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

* **ZeroFMR** — hodnota FNMR při FMR = 0 (žádné chybné shody).
* **ZeroFNMR** — hodnota FMR při FNMR = 0 (žádné chybné neshody).

Použití: situace, kdy je *jediná* chyba nepřípustná.

* **Vysoce zabezpečený přístup (high-security access)** — požaduje FMR = 0; ZeroFMR pak udává, jak často selže legitimní uživatel.
* **Forenzní identifikace (forensic identification)** — požaduje FNMR = 0; ZeroFNMR udává, jak často dojde k chybné shodě (false positive).

## d' (d-prime) — index oddělitelnosti (signal-detection sensitivity index)

Měří **oddělitelnost (separovatelnost)** rozdělení pravých (genuine) a podvodných (impostor) skóre:

::: math
d' = \frac{|\mu_{\text{genuine}} - \mu_{\text{impostor}}|}{\sqrt{(\sigma_{\text{genuine}}^2 + \sigma_{\text{impostor}}^2) / 2}}
:::

* **Vyšší d'** = lépe oddělená rozdělení = lepší rozlišování.
* Pro **iris**: $d' > 12$. To je *extrémně* vysoká hodnota.
* Pro **face** (DL): $d' \approx 6 - 8$.
* Pro **voice**: $d' \approx 3 - 5$.

## F-ratio

Statistická míra:

::: math
F = \frac{\sigma^2_{\text{between-class}}}{\sigma^2_{\text{within-class}}}
:::

* **Vyšší F** = lepší rozlišovací schopnost (discriminability).
* Standardně se používá pro **výběr příznaků (feature selection)** ve zpracovatelských řetězcích strojového učení (ML pipelines).

## Míry pro forenzní identifikaci

V kontextu identifikace (1:N), kde záleží na *pořadí (rank)* správné odpovědi:

### Rank-k Rate

* **Rank-1 rate** — pravděpodobnost, že **správná** osoba je *na prvním místě* seznamu kandidátů.
* **Rank-5 rate** — že je *mezi prvními pěti*.
* **Rank-k rate** — že je *mezi prvními k*.

### CMC — Cumulative Match Characteristic

* Křivka: pořadí (rank) vs. kumulativní míra rozpoznání (cumulative recognition rate).
* Použití: forenzní AFIS, identifikace proti seznamu hledaných (watchlist identification).
* Pro srovnání: ROC slouží pro verifikaci, CMC pro identifikaci.

## Slovníček: kompromis (trade-off)

* **Kompromis (trade-off)** mezi *bezpečností* (nízké FAR) a *uživatelským pohodlím* (nízké FRR).
* Není možné mít *zároveň* nízké obě hodnoty — rozdělení skóre se *fyzicky překrývají*.
* Jediná cesta, jak snížit obě míry současně, je **lepší biometrika** (vyšší d', lépe oddělená rozdělení) — to vyžaduje *lepší senzor*, *lepší algoritmus* a *multimodální fúzi (fusion)*.

## Důležité pravidlo

> **Neporovnávejte chybové míry napříč různými datovými sadami či podmínkami.** EER 0,1 % na *ideálních laboratorních datech* neznamená EER 0,1 % v *reálném nasazení*.

Pro spravedlivé porovnání (fair comparison) se používají standardní srovnávací testy (benchmarks):

* **NIST FpVTE** (Fingerprint Vendor Technology Evaluation).
* **NIST FRVT** (Face Recognition Vendor Test).
* **NIST IREX** (Iris Exchange).
* **NIST SRE** (Speaker Recognition Evaluation).

Pro podrobnosti k metodice testování viz [[testovani-eval]].

---

*Zdroj: BIO přednášky 2025/26, BIO 2 — Hodnocení spolehlivosti a kvality. Externí reference: ISO/IEC 19795-1:2021 *Biometric performance testing and reporting*; Mansfield, A. J., Wayman, J. L.: *Best Practices in Testing and Reporting Performance of Biometric Devices* (NPL 2002); NIST: *FRVT Ongoing* — [PDF reports](https://pages.nist.gov/frvt/reports/11/frvt_11_report.pdf); Daugman, J.: *Probing the uniqueness and randomness of iriscodes* (Proc. IEEE 2006).*
