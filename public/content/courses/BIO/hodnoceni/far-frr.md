---
title: FAR, FRR, GAR, IRR — základní chybové míry
---

# FAR, FRR, GAR, IRR — základní chybové míry

Biometrický systém *není* deterministický — jeho výstup je *pravděpodobnostní*. To znamená, že stejný uživatel nedostane vždy přesně stejné skóre a systém se rozhoduje na základě pravděpodobnosti, ne s jistotou. Pro hodnocení proto používáme čtyři základní míry, které pokrývají všechny možné situace (správné/chybné × přijetí/odmítnutí).

## Matice záměn (confusion matrix)

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
| **Genuine** (oprávněný uživatel) | GAR ✓ správně | FRR ✗ chyba |
| **Impostor** (útočník) | FAR ✗ chyba | IRR ✓ správně |

## FAR — False Accept Rate

**Míra chybného přijetí.**

Pravděpodobnost, že systém *chybně přijme* impostora (útočníka) jako legitimního uživatele.

::: math
\text{FAR} = \frac{\text{počet úspěšně přijatých impostorů}}{\text{celkový počet impostor pokusů}}
:::

* **Bezpečnostní význam:** FAR určuje, jak snadno se může cizí osoba *vydávat* za legitimního uživatele.
* **Cíl:** FAR *minimalizovat* kvůli bezpečnosti.
* **Kompromis (trade-off):** snížení FAR (zvýšení prahu $\tau$) vede ke zvýšení FRR.

### Typické hodnoty FAR

| Aplikace | Typický FAR |
| :--- | :---: |
| Odemykání smartphonu (Touch ID) | $1 / 50\,000$ |
| Odemykání smartphonu (Face ID) | $1 / 1\,000\,000$ |
| Hraniční kontrola (biometrické pasy) | $1 / 100\,000$ |
| Rozpoznávání duhovky (Daugman) | $1 / 10^{10}$ |
| Vysoce zabezpečený přístup (bankomat) | $1 / 100\,000$ |

## FRR — False Reject Rate

**Míra chybného odmítnutí.**

Pravděpodobnost, že systém *chybně odmítne* legitimního uživatele.

::: math
\text{FRR} = \frac{\text{počet úspěšně odmítnutých genuine pokusů}}{\text{celkový počet genuine pokusů}}
:::

* **Uživatelský význam:** FRR určuje, jak často musí legitimní uživatel *opakovat* autentizaci (authentication). Vysoký FRR znamená frustrující uživatelský zážitek (UX).
* **Cíl:** FRR *minimalizovat* kvůli pohodlí.
* **Kompromis (trade-off):** snížení FRR (snížení prahu $\tau$) vede ke zvýšení FAR.

### Typické hodnoty FRR

| Aplikace | Typický FRR |
| :--- | :---: |
| Odemykání smartphonu | 1–5 % |
| Hraniční kontrola | 0,1–1 % |
| Forenzní AFIS | 0,001 % |

## GAR — Genuine Accept Rate

**Míra správného přijetí.**

::: math
\text{GAR} = 1 - \text{FRR}
:::

* GAR = $1 -$ FRR.
* Vyjadřuje *schopnost* systému přijmout *správné* uživatele.
* Často se používá v marketingových materiálech ("přesnost 99,9 %").

## IRR — Imposter Reject Rate

**Míra správného odmítnutí impostora.**

::: math
\text{IRR} = 1 - \text{FAR}
:::

* IRR = $1 -$ FAR.
* Doplněk (komplement) FAR — kolik impostorů systém *správně* odmítne.

## Vztahy

::: math
\begin{aligned}
\text{GAR} + \text{FRR} &= 1 \quad \text{(genuine pokusy)} \\
\text{IRR} + \text{FAR} &= 1 \quad \text{(impostor pokusy)}
\end{aligned}
:::

Nezávislé veličiny jsou tedy jen dvě: obvykle se uvádějí **FAR** a **FRR**.

## Příklad — výpočet {tier=example}

Test biometrického systému s 1 000 genuine a 1 000 impostor pokusy:

* Genuine pokusů: 980 přijato, 20 odmítnuto.
* Impostor pokusů: 5 přijato, 995 odmítnuto.

Výpočty:

* **GAR** = 980 / 1000 = **98 %**.
* **FRR** = 20 / 1000 = **2 %**.
* **FAR** = 5 / 1000 = **0,5 %**.
* **IRR** = 995 / 1000 = **99,5 %**.

## Praktická interpretace

* **FAR 0,5 %** znamená: 1 z 200 impostorů by byl mylně přijat.
  * Při nasazení ve velkém měřítku (100 000 zaměstnanců) by *průměrně* uspělo 500 útoků. To je z hlediska bezpečnosti nepřijatelné.
  * Řešením je *vyšší* práh (threshold) → FAR klesne na 0,01 % (1 z 10 000) → ovšem FRR stoupne na 5 % → uživatelé jsou frustrovaní.
* **Kompromis (trade-off)** je *neoddělitelný* — rozdělení skóre je pro danou biometriku dané a pevné, posouvá se jen práh.

## Práh (threshold) a pracovní bod (operating point)

Práh $\tau$ je *konfigurovatelný*. Jeho posunutí má tyto účinky:

* $\tau$ ↓ (tolerantnější systém) → FAR ↑, FRR ↓.
* $\tau$ ↑ (přísnější systém) → FAR ↓, FRR ↑.

Pracovní bod (operating point) je *volba* návrháře:

* **Vysoké zabezpečení** (přístup k vládnímu HSM) — FAR < $10^{-6}$, FRR může být i 5 %.
* **Vysoké pohodlí** (odemykání smartphonu) — FRR < 1 %, FAR může být až $10^{-4}$.

Pro vizualizaci tohoto kompromisu se používají křivky **ROC** a **DET** ([[roc-det]]).

::: viz score-distributions "Posuňte threshold τ a sledujte živě FAR, FRR a confusion matrix u různých biometrik."
:::

## FMR, FNMR — terminologie ISO

Norma ISO/IEC 19795 zavádí standardizované pojmy:

* **FMR** (False Match Rate) — podobné jako FAR, ale počítá se na úrovni *jediného srovnání* (single comparison, 1:1).
* **FNMR** (False Non-Match Rate) — podobné jako FRR, ale rovněž na úrovni jediného srovnání.

V kontextu **identifikace** (1:N) jsou hodnoty FAR/FRR ovlivněny velikostí databáze:

::: math
\text{FAR}_{1:N} \approx N \cdot \text{FMR}
:::

U velkých databází (např. Aadhaar s 1,3 miliardami záznamů) je i FMR $10^{-10}$ nedostatečné. Podrobně viz [[fmr-fnmr-eer]].

## Důležité poznámky

* Hodnoty FAR/FRR jsou **statistické**; konkrétní měření závisí na *testovací sadě* (test set) — na její kvalitě a demografickém složení.
* **Krize reprodukovatelnosti (replication crisis)** — některá publikovaná čísla nejsou *reprodukovatelná* na jiných datasetech.
* **NIST FRVT, FpVTE** — standardní srovnávací testy (benchmarks); nezávislé hodnocení komerčních systémů.

---

*Zdroj: BIO přednášky 2025/26, BIO 2 — Hodnocení spolehlivosti a kvality. Externí reference: ISO/IEC 19795-1:2021 *Biometric performance testing and reporting — Part 1: Principles and framework*; NIST FRVT (Face Recognition Vendor Test) ongoing benchmarks — [link](https://www.nist.gov/programs-projects/face-recognition-vendor-test-frvt); Wayman, J., Jain, A., Maltoni, D., Maio, D. (eds.): *Biometric Systems: Technology, Design and Performance Evaluation* (Springer 2005).*
