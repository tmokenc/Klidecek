---
title: FAR, FRR, GAR, IRR — základní chybové míry
---

# FAR, FRR, GAR, IRR — základní chybové míry

Biometrický systém *není* deterministický — jeho výstup je *pravděpodobnostní*. Pro hodnocení používáme čtyři základní míry, které pokrývají všechny možné situace (správné/chybné × přijetí/odmítnutí).

## Confusion matrix

::: svg "Confusion matrix biometrického rozhodnutí: 4 případy podle (skutečnost × rozhodnutí). 2 správné, 2 chybné."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="120" y="40" width="180" height="60" rx="6"/>
    <rect x="300" y="40" width="180" height="60" rx="6"/>
    <rect x="120" y="100" width="180" height="60" rx="6"/>
    <rect x="300" y="100" width="180" height="60" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="50" y="74" font-size="11">genuine</text>
    <text x="50" y="90" font-size="9" fill="var(--text-muted)">je to oprávněný</text>
    <text x="50" y="134" font-size="11">impostor</text>
    <text x="50" y="150" font-size="9" fill="var(--text-muted)">je to útočník</text>
    <text x="210" y="28" font-size="11">přijetí (accept)</text>
    <text x="390" y="28" font-size="11">odmítnutí (reject)</text>
    <text x="210" y="68" font-size="13" fill="rgb(64,192,87)">GAR ✓</text>
    <text x="210" y="84" font-size="10" fill="var(--text-muted)">správně přijat</text>
    <text x="390" y="68" font-size="13" fill="var(--danger, #d33)">FRR ✗</text>
    <text x="390" y="84" font-size="10" fill="var(--text-muted)">chybně odmítnut</text>
    <text x="210" y="128" font-size="13" fill="var(--danger, #d33)">FAR ✗</text>
    <text x="210" y="144" font-size="10" fill="var(--text-muted)">chybně přijat</text>
    <text x="390" y="128" font-size="13" fill="rgb(64,192,87)">IRR ✓</text>
    <text x="390" y="144" font-size="10" fill="var(--text-muted)">správně odmítnut</text>
  </g>
</svg>
:::

| | **Přijetí (accept)** | **Odmítnutí (reject)** |
| :--- | :---: | :---: |
| **Genuine** (oprávněný) | GAR ✓ správně | FRR ✗ chyba |
| **Impostor** (útočník) | FAR ✗ chyba | IRR ✓ správně |

## FAR — False Accept Rate

**Míra chybného přijetí.**

Pravděpodobnost, že systém *chybně přijme* impostora jako legitimního uživatele.

::: math
\text{FAR} = \frac{\text{počet úspěšně přijatých impostorů}}{\text{celkový počet impostor pokusů}}
:::

* **Bezpečnostní význam:** FAR určuje, jak snadno se může cizí osoba *vydávat* za legitimního uživatele.
* **Cíl:** *minimalizovat* FAR pro bezpečnost.
* **Trade-off:** snížení FAR (zvýšení prahu $\tau$) → zvýšení FRR.

### Typické hodnoty FAR

| Aplikace | Typický FAR |
| :--- | :---: |
| Smartphone unlock (Touch ID) | $1 / 50\,000$ |
| Smartphone unlock (Face ID) | $1 / 1\,000\,000$ |
| Border control (biometric pasy) | $1 / 100\,000$ |
| Iris recognition (Daugman) | $1 / 10^{10}$ |
| High-security access (ATM) | $1 / 100\,000$ |

## FRR — False Reject Rate

**Míra chybného odmítnutí.**

Pravděpodobnost, že systém *chybně odmítne* legitimního uživatele.

::: math
\text{FRR} = \frac{\text{počet úspěšně odmítnutých genuine pokusů}}{\text{celkový počet genuine pokusů}}
:::

* **Uživatelský význam:** FRR určuje, jak často legitimní uživatel musí *opakovat* autentizaci. Vysoký FRR = frustrující UX.
* **Cíl:** *minimalizovat* FRR pro pohodlí.
* **Trade-off:** snížení FRR (snížení prahu $\tau$) → zvýšení FAR.

### Typické hodnoty FRR

| Aplikace | Typický FRR |
| :--- | :---: |
| Smartphone unlock | 1–5 % |
| Border control | 0.1–1 % |
| Forensic AFIS | 0.001 % |

## GAR — Genuine Accept Rate

**Míra správného přijetí.**

::: math
\text{GAR} = 1 - \text{FRR}
:::

* GAR = $1 -$ FRR.
* Hodnota *dovedností* systému přijmout *správné* uživatele.
* Často používáno v marketing materiálech ("99.9 % accuracy").

## IRR — Imposter Reject Rate

**Míra správného odmítnutí impostora.**

::: math
\text{IRR} = 1 - \text{FAR}
:::

* IRR = $1 -$ FAR.
* Komplement FAR — kolik impostorů systém *správně* odmítne.

## Vztahy

::: math
\begin{aligned}
\text{GAR} + \text{FRR} &= 1 \quad \text{(genuine pokusy)} \\
\text{IRR} + \text{FAR} &= 1 \quad \text{(impostor pokusy)}
\end{aligned}
:::

Dvě nezávislé veličiny: typically se reportují **FAR** a **FRR**.

## Příklad — výpočet

Test biometrického systému s 1 000 genuine + 1 000 impostor pokusy:

* Genuine pokusů: 980 přijato, 20 odmítnuto.
* Impostor pokusů: 5 přijato, 995 odmítnuto.

Výpočty:

* **GAR** = 980 / 1000 = **98 %**.
* **FRR** = 20 / 1000 = **2 %**.
* **FAR** = 5 / 1000 = **0.5 %**.
* **IRR** = 995 / 1000 = **99.5 %**.

## Praktická interpretace

* **FAR 0.5 %** znamená: 1 z 200 impostorů by byl mylně přijat.
  * V mass deployment (100 000 zaměstnanců) by *průměrně* 500 útoků uspělo. Nepřijatelné pro bezpečnost.
  * Vyžaduje *vyšší* threshold → FAR ↓ na 0.01 % (1 v 10 000) → FRR ↑ na 5 % → uživatelé frustrovaní.
* **Trade-off** je *neoddělitelný* — fixní rozdělení pro danou biometriku + threshold se posouvá.

## Threshold a operating point

Threshold $\tau$ je *konfigurovatelný*. Posunutí:

* $\tau$ ↓ (tolerantnější systém) → FAR ↑, FRR ↓.
* $\tau$ ↑ (přísnější systém) → FAR ↓, FRR ↑.

Operating point je *volba* designéra:

* **High-security** (vládní HSM access) — FAR < $10^{-6}$, FRR může být 5 %.
* **High-convenience** (smartphone unlock) — FRR < 1 %, FAR může být $10^{-4}$.

Pro vizualizaci trade-off se používají **ROC** a **DET** křivky ([[roc-det]]).

::: viz score-distributions "Posuňte threshold τ a sledujte živě FAR, FRR a confusion matrix u různých biometrik."
:::

## FMR, FNMR — terminologie ISO

ISO/IEC 19795 standardizuje:

* **FMR** (False Match Rate) — podobné FAR, ale pracuje na úrovni *single comparison* (1:1).
* **FNMR** (False Non-Match Rate) — podobné FRR, ale single comparison.

V kontextu **identifikace** (1:N) jsou FAR/FRR ovlivněny velikostí databáze:

::: math
\text{FAR}_{1:N} \approx N \cdot \text{FMR}
:::

Pro velké databáze (Aadhaar 1.3 mld.) je dokonce $10^{-10}$ FMR nedostatečné. Detailně [[fmr-fnmr-eer]].

## Důležité poznámky

* Hodnoty FAR/FRR jsou **statistické**; měření závisí na *test set* (kvalita, demographics).
* **Replication crisis** — některá publikovaná čísla nejsou *reprodukovatelná* na jiných datasetech.
* **NIST FRVT, FpVTE** — standardní benchmarks; nezávislé hodnocení komerčních systémů.

---

*Zdroj: BIO přednášky 2025/26, BIO 2 — Hodnocení spolehlivosti a kvality. Externí reference: ISO/IEC 19795-1:2021 *Biometric performance testing and reporting — Part 1: Principles and framework*; NIST FRVT (Face Recognition Vendor Test) ongoing benchmarks — [link](https://www.nist.gov/programs-projects/face-recognition-vendor-test-frvt); Wayman, J., Jain, A., Maltoni, D., Maio, D. (eds.): *Biometric Systems: Technology, Design and Performance Evaluation* (Springer 2005).*
