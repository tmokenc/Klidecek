---
title: NIST Test Suite — statistické testy RNG
---

# NIST Test Suite — statistické testy RNG

NIST publikoval v r. 2001 (s revizemi v 2010 a 2022) dokument **SP 800-22** *A Statistical Test Suite for Random and Pseudorandom Number Generators for Cryptographic Applications*, který definuje 15 statistických testů pro hodnocení výstupu RNG. Test suite je dnes *de facto* benchmark — komerční výrobci uvádějí "passes NIST SP 800-22" jako kvalitní známku. Test suite je *nutnou*, **nikoliv dostatečnou** podmínkou kvalitního RNG.

## Co testy *neumí*

Než přejdeme k samotným testům, je třeba si uvědomit, co testy *negarantují*:

* **Neprokazují nepredikovatelnost.** AES-CTR s konstantním klíčem a inkrementovaným čítačem projde *všemi* NIST testy — ale je triviálně predikovatelný útočníkem, který zná klíč.
* **Nevyloučí backdoor.** Dual EC DRBG procházel testy, přesto měl backdoor.
* **Nedetekují všechny systematické vady.** Detekují typické problémy (bias, periodicita, korelace), ale specifické "patologické" generátory mohou projít.

Testy jsou **negativní filtr** — pokud generátor *nepro­chází*, je *jistě* špatný. Pokud *prochází*, *může* být dobrý.

## Statistický rámec

Každý test pracuje na principu *p-hodnoty*:

1. Definuje se **null hypothesis** $H_0$: sekvence je generována uniformně náhodně.
2. Test spočítá statistiku $T$ z dat.
3. Vrací **p-value** $\in [0,1]$ — pravděpodobnost, že čistě náhodná sekvence by dala stejnou nebo extrémnější statistiku.
4. Pokud $p < \alpha$ (typicky $\alpha = 0.01$), zamítáme $H_0$. Sekvence "selhala".

::: math
H_0:\text{sekvence je náhodná} \qquad p\text{-value} = \Pr[T \ge T_{\text{obs}} \mid H_0]
:::

Pro hodnocení RNG se testuje **mnoho** nezávislých sekvencí (typicky 1000 sekvencí po $10^6$ bitech). Sleduje se:

* **Proportion passing** — jaký podíl sekvencí prošel testem. Při $\alpha = 0{,}01$ čekáme ~99 % průchodu; přípustné rozmezí podle binomického rozdělení.
* **Uniformita p-values** — p-hodnoty z jednotlivých sekvencí by měly být *rovnoměrně rozdělené* na $[0,1]$; testuje se chí-kvadrát testem.

## 15 testů SP 800-22

::: svg "Mapa NIST testů: po blocích vs. celá sekvence; lokální vs. globální statistika."
<svg viewBox="0 0 540 280" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="20"  y="30" width="240" height="220" rx="6"/>
    <rect x="280" y="30" width="240" height="220" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="140" y="50" font-size="12">Bitové statistiky (frekvenční)</text>
    <text x="400" y="50" font-size="12">Strukturální statistiky</text>
  </g>
  <g fill="var(--text)" text-anchor="start" font-size="10.5">
    <text x="32"  y="78">1. Frequency (monobit)</text>
    <text x="32"  y="96">2. Block Frequency</text>
    <text x="32"  y="114">3. Runs</text>
    <text x="32"  y="132">4. Longest Run of Ones</text>
    <text x="32"  y="150">5. Binary Matrix Rank</text>
    <text x="32"  y="168">6. DFT (Spectral)</text>
    <text x="32"  y="186">7. Non-overlapping Template</text>
    <text x="32"  y="204">8. Overlapping Template</text>
    <text x="292" y="78">9. Maurer's Universal</text>
    <text x="292" y="96">10. Linear Complexity</text>
    <text x="292" y="114">11. Serial</text>
    <text x="292" y="132">12. Approximate Entropy</text>
    <text x="292" y="150">13. Cumulative Sums</text>
    <text x="292" y="168">14. Random Excursions</text>
    <text x="292" y="186">15. Random Excursions Variant</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="start" font-size="9.5">
    <text x="32"  y="225">→ podíl 1/0, periodicita,</text>
    <text x="32"  y="240">  základní rovnoměrnost</text>
    <text x="292" y="225">→ kompresibilita, struktura,</text>
    <text x="292" y="240">  random walks</text>
  </g>
</svg>
:::

### Frekvenční rodina

* **Frequency (monobit) Test** — počítá počet jedniček $n_1$ vs. nul $n_0$ v sekvenci délky $n$. Pro náhodnou sekvenci $|n_1 - n_0|$ má normální rozdělení se směrodatnou odchylkou $\sqrt n$. Statistika $s_{\text{obs}} = |n_1 - n_0|/\sqrt n$, p-value z chvostů normálního rozdělení.
* **Block Frequency Test** — sekvence se rozdělí na bloky délky $M$ a v každém se počítá podíl jedniček. Detekuje *lokální* nerovnoměrnost (např. generátor produkující prvních $n/2$ bitů samé 1, dalších $n/2$ bitů samé 0 — monobit projde, block nikoliv).
* **Runs Test** — počet "runů" (úseků stejných bitů). Příliš málo runů = bity příliš korelované; příliš mnoho = bity příliš střídavé.
* **Longest Run of Ones in a Block** — nejdelší souvislá sekvence jedniček v bloku délky $M$. Detekuje *clustering* jedniček.
* **Cumulative Sums (CUSUM) Test** — kumulativní součet $\pm 1$ kroků; měří odchylky od $0$. Detekuje persistentní bias.

### Strukturální rodina

* **Binary Matrix Rank Test** — sekvence se naskládá do matic $M \times M$ nad GF(2), počítá se hodnost (rank). Pro náhodnou sekvenci je distribuce ranků známa; odchylka detekuje *lineární závislosti* mezi bity.
* **Discrete Fourier Transform (Spectral) Test** — DFT detekuje *periodické vzory*. Po DFT bity, které překračují prahovou hodnotu, by měly tvořit cca 5 %; výrazná odchylka = periodicita.
* **Non-overlapping/Overlapping Template Matching Test** — počítá výskyty *konkrétních bit-patternů* (např. `001001`); detekuje, jestli vzor nepřevažuje.
* **Maurer's Universal Statistical Test** — měří *kompresibilitu* sekvence. Pokud generátor produkuje sekvenci s nízkou entropií, lze ji efektivně zkomprimovat; náhodná sekvence je nekomprimovatelná.
* **Linear Complexity Test** — pro každý blok hledá nejmenší LFSR ([[lfsr-princip]]), který generuje stejný výstup (Berlekamp-Massey). Krátký LFSR = vysoká predikovatelnost.
* **Serial Test** — frekvence *všech* $2^m$ možných $m$-bit vzorů; měří uniformitu nad krátkými okny.
* **Approximate Entropy Test** — Shannon entropie nad $m$-bit a $(m+1)$-bit okny; porovnává.
* **Random Excursions / Variant** — modeluje sekvenci jako random walk a počítá návštěvy konkrétních stavů. Detekuje strukturu *trajektorií*.

::: viz nist-test-playground "Vyber generator (uniform / vychyleny / LCG / periodicky / AES-like) a sleduj, ktere testy projdou. LCG selze na strukturalnich testech; vychyleny generator na monobit; periodicky na runs/longest-run."
:::

## Praktické použití

Reálný workflow při hodnocení RNG:

1. **Sběr dat** — generátor produkuje typicky 1 GB až 1 TB výstupu. Pro PTRNG je třeba shrnout *raw* data (před post-processingem) i *finální* data.
2. **Spuštění test suite** — referenční implementace v jazyku C, [k dispozici od NIST](https://csrc.nist.gov/projects/random-bit-generation/documentation-and-software).
3. **Analýza výsledků** — pro každý test:
   * **Pass rate** ze všech sekvencí (řekněme 990/1000 prošlo) — ve směrnici $\alpha = 0{,}01$ akceptační rozmezí $0{,}99 \pm 0{,}0094$.
   * **Distribuce p-values** — vizuálně histogram, formálně chí-kvadrát test.
4. **Investigace selhání** — kterýkoliv test selže → identifikovat *proč*. Frequency test selhal? Bias v zdroji. Runs failed? Korelace mezi bity. Spectral? Periodicita oscilátoru.
5. **Iterace návrhu** — úprava post-processing, conditioner, případně i fyzikálního zdroje.

## SP 800-90B — entropy source testing

V r. 2018 NIST publikoval **SP 800-90B** *Recommendation for the Entropy Sources Used for Random Bit Generation*, který je *odlišný* od SP 800-22 a *povinný* pro FIPS 140-3:

* **Health tests** — testy *online* během provozu generátoru:
  * **Repetition Count Test (RCT)** — detekuje "zaseknutí" zdroje (více než $C$ stejných hodnot za sebou).
  * **Adaptive Proportion Test (APT)** — detekuje degradaci entropie sledováním frekvence nejčetnější hodnoty v okně.
* **Statistical evaluation** — empirické odhady min-entropie pro IID i non-IID zdroje (Markov estimator, predictor-based estimators).
* **Restart tests** — generátor se vícekrát restartuje a porovná se konzistence; detekuje deterministická "nasednutí".

NIST má pro SP 800-90B [veřejnou implementaci entropy assessment](https://github.com/usnistgov/SP800-90B_EntropyAssessment).

## Slabiny test suite

Známé omezení:

* **Krátké sekvence** (méně než $10^5$ bitů) jsou nespolehlivé — testy mají nízkou *power* (slabá detekce vad).
* **Lineární testy.** Většina NIST testů detekuje *lineární* korelace. Nelineární generátor s lineární vadou *projde* — ale je stejně špatný.
* **TestU01 a Dieharder** — alternativní suite (Pierre L'Ecuyer; G. Marsaglia), často přísnější, používané akademicky. TestU01 *BigCrush* je k dispozici online a regulárně odhaluje slabosti, které SP 800-22 nedetekuje.

> **Pravidlo:** pro produkční použití *nikdy* nezůstávej u SP 800-22. Provádí se *minimum* SP 800-22 + SP 800-90B health testy + ideálně TestU01 BigCrush + Dieharder.

---

*Zdroj: BZA přednášky 2025/26, BZA 02 — Generátory náhodných čísel. Externí reference: NIST SP 800-22 Rev. 1a — *A Statistical Test Suite for Random and Pseudorandom Number Generators for Cryptographic Applications* (2010) — [PDF](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-22r1a.pdf); NIST SP 800-90B — *Recommendation for the Entropy Sources Used for Random Bit Generation* (2018) — [PDF](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-90B.pdf); L'Ecuyer, P., Simard, R.: *TestU01: A C Library for Empirical Testing of Random Number Generators* (ACM TOMS 2007).*
