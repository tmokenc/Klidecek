---
title: Podpis — dynamika a statika
---

# Podpis — dynamika a statika

**Podpis** je nejstarší formou autentizace (authentication) v právním kontextu — používá se na dokumentech, smlouvách a šecích. V biometrii rozlišujeme **statický** (off-line) a **dynamický** (on-line) podpis. Dynamický podpis je mnohem přesnější díky *behaviorálním* informacím o tom, jak podpis vzniká, tedy o samotném procesu psaní.

## Statický vs. dynamický

::: svg "Static signature: scan or photo of finished signature. Dynamic signature: capture process during writing — pressure, speed, pen angle over time."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="40" width="220" height="140" rx="8"/>
    <rect x="280" y="40" width="240" height="140" rx="8"/>
  </g>
  <g stroke="var(--text)" stroke-width="1.5" fill="none">
    <path d="M60,120 C80,80 100,140 130,90 C160,140 180,100 200,120"/>
  </g>
  <g stroke="var(--accent)" stroke-width="2" fill="none">
    <path d="M320,120 C340,80 360,140 390,90 C420,140 440,100 460,120"/>
  </g>
  <g stroke="var(--accent)" stroke-width="0.6" fill="none" stroke-dasharray="2 2">
    <line x1="320" y1="60" x2="320" y2="160"/>
    <line x1="340" y1="60" x2="340" y2="160"/>
    <line x1="360" y1="60" x2="360" y2="160"/>
    <line x1="380" y1="60" x2="380" y2="160"/>
    <line x1="400" y1="60" x2="400" y2="160"/>
    <line x1="420" y1="60" x2="420" y2="160"/>
    <line x1="440" y1="60" x2="440" y2="160"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="130" y="62" font-size="12">Statický (off-line)</text>
    <text x="130" y="78" font-size="10" fill="var(--text-muted)">jen obraz</text>
    <text x="400" y="62" font-size="12">Dynamický (on-line)</text>
    <text x="400" y="78" font-size="10" fill="var(--text-muted)">obraz + čas + tlak</text>
    <text x="130" y="190" font-size="10" fill="var(--text-muted)">scan, photo</text>
    <text x="400" y="190" font-size="10" fill="var(--text-muted)">digitizer tablet, stylus</text>
  </g>
</svg>
:::

### Statický (off-line, na základě obrazu)

* **Snímání:** *hotový* podpis na papíru, nasnímaný skenerem nebo vyfotografovaný.
* **Informace:** jen *tvar* / *obraz*.
* **Obtížnost rozpoznání padělku:** *velmi* vysoká — zkušeného padělatele lze jen těžko odlišit.
* **Výkon (performance):** EER 5–15 %.
* **Použití:** *forenzní* analýza (znalec rukopisu).

### Dynamický (on-line, na základě procesu)

* **Snímání:** během psaní; digitizační tablet (Wacom), stylus na dotykovém displeji.
* **Informace:**
  * **(x, y)** poloha v čase.
  * **tlak (pressure)** (z) — síla působící na stylus.
  * **úhly pera** (azimut, sklon).
  * **rychlost a zrychlení (velocity, acceleration)** — dopočítané.
  * **pohyby se zdviženým perem** (pohyby ve vzduchu).
* **Obtížnost padělání:** *mnohem vyšší* — i kdyby útočník (attacker) podpis viděl, neprozradí mu to, *jak* byl napsán.
* **Výkon (performance):** EER 2–5 %.
* **Použití:** bankovnictví, podepisování dokumentů.

::: viz signature-dynamic "Přehrání (x,y,p,t); zkušený padělek napodobí tvar, ale profily tlaku a rychlosti podvrh prozradí."
:::

## Příznaky dynamického podpisu

Z časových řad (time-series) dat extrahujeme:

* **Globální příznaky:**
  * Celková doba psaní.
  * Celková délka dráhy.
  * Průměrná rychlost.
  * Maximální tlak.
  * Počet zvednutí pera.
* **Lokální příznaky:**
  * Profil rychlosti.
  * Profil tlaku.
  * Tvar trajektorie.
* **Segmentace tahů (strokes):**
  * Rozpoznání *tahů* (souvislých pohybů se spuštěným perem).
  * Příznaky pro jednotlivé tahy.

## Snímání

### Digitizační tablet (Wacom, Topaz)

* **Tablet s perem** a aktivním stylusem.
* **Vzorkovací frekvence (sampling rate):** typicky 100–200 Hz.
* **Tlak:** 256–2048 úrovní.
* **Úhly pera** měří některé modely.
* **Vysoká přesnost.**

### Dotykový displej + stylus

* **iPad + Apple Pencil**, Galaxy Note s perem S Pen.
* **Vzorkování:** přibližně 60–120 Hz.
* **Tlak:** Apple Pencil 4096 úrovní.
* **Dostupnost na masovém trhu.**

### Prst na dotykovém displeji

* Bez stylusu, jen prst.
* Bez tlaku, bez úhlů.
* **Omezené množství informací** → nižší přesnost.

## Algoritmy

### DTW (Dynamic Time Warping)

Standardní metoda pro porovnávání časových řad (time-series matching):

::: math
DTW(s_1, s_2) = \min \sum_{i, j} d(s_1[i], s_2[j])
:::

* Zarovnává sekvence různé délky.
* Odolná vůči *kolísání rychlosti psaní*.

### Skryté Markovovy modely (Hidden Markov Models, HMM)

* Každý uživatel má HMM natrénovaný na svém podpisu.
* Testovaný podpis se ohodnotí pravděpodobností (likelihood) podle HMM.

### Hluboké učení (deep learning)

* Architektury LSTM a Transformer.
* Nejnovějším srovnávacím testům (benchmarks) dominuje právě hluboké učení.

### Příznakový přístup + klasifikátor

* Extrakce globálních a lokálních příznaků.
* SVM, Random Forest, k-NN.
* Rychlejší než DTW u velkých databází.

## Ochrana proti podvržení (anti-spoofing)

### Typy padělků

* **Náhodný padělek (random forgery)** — útočník nezná cílový podpis; použije *vlastní* podpis.
* **Zkušený padělek, jednoduchý (skilled forgery, simple)** — útočník cílový podpis jednou *viděl*.
* **Zkušený padělek, nacvičený (skilled forgery, practiced)** — útočník měl *čas si jej nacvičit*.

### Detekce

* **Vzory tlaku** — přesně se napodobují jen velmi obtížně.
* **Profily rychlosti** — obtížnější napodobit než samotný prostorový tvar.
* **Časová konzistence** — opakované podpisy téhož člověka jsou konzistentní.

### Limity

* Nacvičení padělatelé dokážou *statické* systémy snadno oklamat.
* **Dynamické** systémy jsou mnohem odolnější — i zkušení padělatelé mají problém s časováním.

## Standardy

* **ISO/IEC 19794-7:2014** — časové řady dat podpisu.
* **ISO/IEC 19794-11:2013** — zpracovaná dynamická data podpisu.

## Aplikace {tier=practice}

### Bankovnictví

* **Podpisové podložky na pobočce** — řada Wacom STU.
* **Mobilní podepisování** — DocuSign, Adobe Sign s biometrickým snímáním.
* **Autorizace šeků** — na ústupu, ale stále se používá.

### Podepisování dokumentů

* **Podepisování PDF** s vloženými biometrickými daty.
* **Právní rámce (frameworks):**
  * **eIDAS** (EU) — kvalifikované elektronické podpisy.
  * **ESIGN Act** (USA) — právní závaznost elektronických podpisů.

### Pokladna s tabletem

* Maloobchodní POS — platba kartou s podpisem na tabletu.
* Stále častěji nahrazováno PINem nebo bezkontaktní platbou.

## Limity

### Variabilita

* **Vnitrotřídní (intra-class):** *velká* — i tentýž člověk se pokaždé podepíše trochu jinak.
* **Nálada, emoce a poloha těla** ovlivňují podpis.
* **Stárnutí:** podpisy se v průběhu let vyvíjejí.

### Padělatelnost

* **Zkušení padělatelé** dokážou oklamat statické systémy.
* **Forenzní znalci** dosahují vyšší přesnosti než algoritmy.

### Mezi zařízeními (cross-device)

* Podpis na tabletu Wacom ≠ podpis téhož člověka na iPadu.
* Vyžaduje se **registrace (enrollment) závislá na zařízení**.

## Výkon (performance)

**SVC2004** (First International Signature Verification Competition, organizovaná HKUST, ICBA 2004):

* **Nejlepší systémy:** EER přibližně 3 % pro zkušený padělek.
* **Náhodný padělek:** EER < 0,5 %.

## Forenzní analýza rukopisu

Vedle biometrie existuje i forenzní přístup:

* **Forenzní zkoumatelé dokumentů (Forensic Document Examiners, FDE)** — odborníci na porovnávání rukopisu.
* **Svědectví u soudu** ve sporech o podvody či závěti.
* Metoda: ACE-V (analýza, porovnání, vyhodnocení, ověření).
* Kontroverze: subjektivnost, chybějící statistický základ (podobné výhrady jako u analýzy latentních otisků prstů po zprávě NAS 2009).

## Vztah k jiným biometrikám

| | **Podpis (dynamický)** | **Hlas** | **Dynamika psaní na klávesnici** |
| :--- | :---: | :---: | :---: |
| Aktivita uživatele | aktivní | pasivní | pasivní |
| Soukromí | vysoké | střední | vysoké |
| Přesnost | střední | střední | nízká |
| Detekce živosti (liveness) | implicitní (aktivní gesto) | vyžaduje kontroly | implicitní |
| Masové rozšíření | na ústupu | roste | roste |

## Trendy

* **Kvalifikované elektronické podpisy podle eIDAS** — dynamický podpis s integrací PKI.
* **Mobile-first** — Apple Pencil a S Pen pro kvalitní dynamické snímání.
* **Porovnávání založené na hlubokém učení** nahrazuje tradiční DTW.
* **Napříč doménami (cross-domain)** — rozpoznávání rukopisu + biometrická identifikace.

---

*Zdroj: BIO přednášky 2025/26, BIO 12 — Dynamické biometrické vlastnosti. Externí reference: Plamondon, R., Lorette, G.: *Automatic Signature Verification and Writer Identification — The State of the Art* (Pattern Recognition 1989); Fairhurst, M. C., Kaplani, E.: *Perceptual analysis of handwritten signatures for biometric authentication* (IEE Vision 2003); ISO/IEC 19794-7:2014; SVC2004 benchmark — [conference details](https://link.springer.com/chapter/10.1007/978-3-540-25976-3_2).*
