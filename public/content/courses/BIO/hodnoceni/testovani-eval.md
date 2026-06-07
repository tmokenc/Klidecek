---
title: Testování a evaluace biometrických systémů
---

# Testování a evaluace biometrických systémů

Hodnocení biometrického systému je *statistický* problém — pro spolehlivé odhady FAR/FRR ([[far-frr]]) potřebujeme *velký* dataset, *reprezentativní* podmínky a *standardizovanou* metodologii. Normy ISO/IEC 19795 a směrnice NIST (NIST guidelines) specifikují tři úrovně evaluace.

## Tři úrovně evaluace (ISO/IEC 19795-1)

### 1. Evaluace technologie (Technology evaluation)

* **Cíl:** porovnání algoritmů na **standardní databázi**.
* **Postup:** dataset je *zveřejněn*, různé algoritmy ho zpracovávají a výsledky se porovnávají.
* **Výhody:** *reprodukovatelné* a nezávislé na hardwaru.
* **Nevýhody:** *nezachycuje* podmínky reálného nasazení (real-world podmínky) — různé senzory, různé prostředí (environment).
* **Příklady:** NIST FRVT, FpVTE, FVC (Fingerprint Verification Competition).

### 2. Evaluace scénáře (Scenario evaluation)

* **Cíl:** test systému v **kontrolovaném** prostředí, které simuluje reálné nasazení.
* **Postup:** reální účastníci (real subjects) v konkrétním testovacím scénáři (test scenario) — například testovací letiště nebo bezpečnostní brána (gateway).
* **Výhody:** zachycuje *typické* podmínky (kvalita snímání (capture), chování uživatele (user behavior)).
* **Nevýhody:** je *drahá* a vyžaduje účastníky (subjects) i řízení (control) celého testu.
* **Příklady:** evaluace IBIA britského ministerstva vnitra (UK Home Office), DHS Maryland Test Facility.

### 3. Provozní evaluace (Operational evaluation)

* **Cíl:** měření (measurement) *v reálném nasazení*.
* **Postup:** instrumentace produkčního systému a sběr dat během běžného provozu.
* **Výhody:** *nejrealističtější*; *skutečná* populace uživatelů a skutečné prostředí.
* **Nevýhody:** chybí *referenční pravda (ground truth)* pro podvodníky (impostors) — často ji nelze získat; vznikají také obavy o soukromí (privacy concerns).
* **Příklady:** reporty propustnosti programu US-VISIT, studie spolehlivosti systému Aadhaar.

## Sběr dat a vyhodnocení

### Testovací množiny (test sets)

* **Trénovací množina (train set)** — slouží k *trénování* (pokud má algoritmus fázi učení, learning).
* **Validační množina (validation set)** — slouží k *ladění* parametrů (threshold, hyperparametry).
* **Testovací množina (test set)** — slouží k *finálnímu* vyhodnocení. Musí být *disjunktní* od trénovací i validační množiny.

Důležité: **překryv subjektů (subject overlap)** mezi trénovací a testovací množinou je *fatální* — vyhodnocení pak vyjde příliš optimisticky. Standardním paradigmatem je rozdělení *nezávislé na subjektech* (subject-independent split), kde se tytéž osoby neobjeví v obou množinách.

### Velikost datasetu

Pro *statistickou jistotu (statistical confidence)* odhadů FAR/FRR platí:

::: math
\text{počet impostor pokusů} \ge \frac{1}{\text{target FAR}} \cdot \text{confidence factor}
:::

Pro cílovou FAR (target FAR) = $10^{-6}$ s 95% spolehlivostí (confidence): **minimálně 10⁷ porovnání podvodníků (impostor comparisons)**.

* **NIST FRVT 2024:** 18 milionů snímků obličejů.
* **Aadhaar:** 1,3 miliardy zaregistrovaných osob (enrollment).
* Pro akademický výzkum: typicky 10⁵ – 10⁶ porovnání.

### Testovací prostředí (test environments)

* **Laboratoř (lab)** — kontrolované osvětlení, pevný senzor, optimální poloha (pose).
* **Kancelář / interiér (office/indoor)** — typické kancelářské prostředí.
* **Venku (outdoor)** — denní světlo, proměnlivé počasí.
* **Mobil (mobile)** — snímání z telefonu v ruce, rozmazání pohybem (motion blur).

## Stárnutí (Aging)

Specifický test — *jak* se přesnost mění s časem, který uplyne mezi registrací (enrollment) a rozpoznáním (recognition)?

* **Otisky prstů:** velmi stabilní; pomalá degradace.
* **Obličej:** *rychlá* degradace (vrásky, změny váhy, vlasy).
* **Iris (duhovka):** *velmi* stabilní (po dětství).
* **Hlas (voice):** kolísá; ovlivňují ho nemoci a věkové změny.

**Studie NIST FRVT Aging** (2018): FRR při FAR=10⁻⁴ vzroste z 1 % (čerstvá registrace) na 3 % po 10 letech (obličej).

### Mitigace

* **Opětovná registrace (re-enrollment)** každých N let.
* **Adaptivní registrace (adaptive enrollment)** — automatická aktualizace při úspěšné autentizaci (authentication).
* **Více šablon (multiple templates)** uložených v různých časech.

## Dvojčata

**Zátěžový test (stress test)** — biometrika u jednovaječných dvojčat.

* **DNA:** prakticky stejná (sdílení 99,99 %); rozlišení vyžaduje specifické markery (SNPs).
* **Obličej:** *velmi* podobný; mnoho systémů FaceID zde chybuje.
* **Hlas:** podobný (kombinace genetiky a prostředí).
* **Otisky prstů:** *odlišné* (vznikají epigeneticky).
* **Iris (duhovka):** *odlišné* (vzniká epigeneticky).

Testovací databáze: **TwinsDB** (NIST), **ND-Twins** (Notre Dame) — speciální datasety s páry dvojčat (twin pairs).

## Počet porovnání pro výpočet FMR

Pro $N$ zaregistrovaných subjektů v testovací množině:

* **Pravá porovnání (genuine comparisons)** (FNMR): $N \cdot \binom{T}{2} = N \cdot T(T - 1) / 2$, kde $T$ je počet vzorků (samples) na jeden subjekt.
* **Porovnání podvodníků (impostor comparisons)** (FMR): $\binom{N}{2} \cdot T \cdot T$ (každý pár × vzorky).

Pro $N = 1000$ subjektů a $T = 10$ vzorků:

* Pravá: ~45 000.
* Podvodnická: ~50 milionů.

To *stačí* pro FMR > 10⁻⁵, ale *nestačí* pro FMR < 10⁻⁶.

## Benchmarky NIST

NIST vede *průběžné* (ongoing) evaluační programy:

* **FRVT** (Face Recognition Vendor Test) — rozpoznávání obličejů, od roku 2002.
* **FpVTE** (Fingerprint Vendor Technology Evaluation) — otisky prstů, od roku 2003.
* **IREX** (Iris Exchange) — duhovka, od roku 2009.
* **SRE** (Speaker Recognition Evaluation) — hlas, od roku 1996.
* **MINEX** (Minutiae Interoperability Exchange) — interoperabilita šablon otisků prstů.

Dodavatelé (vendors) *poskytují* svůj algoritmus a NIST jej testuje *naslepo (blind)* na neveřejných (proprietary) databázích. Reportování je *plně transparentní* — žebříčky jsou publikované online.

## Plánování testování

Než se evaluace zahájí:

1. **Definuj rozsah testu (test scope)** — který biometrický rys, kterou modalitu (modal) a kterou metriku (verifikace, nebo identifikace).
2. **Vyber dataset** — relevantní demografie, podmínky a velikost.
3. **Definuj protokol (protocol)** — rozdělení na trénovací/testovací množinu, jeden pokus vs. více pokusů, povolené opakování (retries).
4. **Implementuj** — testovací řetězec (pipeline) a vyhodnocování skóre (scoring).
5. **Statistická analýza** — intervaly spolehlivosti (confidence intervals), demografické vlivy.
6. **Reportuj** — norma ISO/IEC 19795-1 standardizuje formát reportu.

## Zkreslení datasetu a férovost (Dataset bias a fairness)

Důležité téma posledních let:

* Mnoho komerčních systémů rozpoznávání obličeje funguje *výrazně hůře* na tmavších odstínech pleti (Buolamwini-Gebru 2018, *Gender Shades*).
* Důvod: trénovací data jsou silně zkreslená (biased) směrem k bílým a mužským subjektům.
* **NIST FRVT Part 3: Demographic Effects** (2019) — formální evaluace napříč pohlavím, věkem a etnicitou.

Mitigace:

* Rozmanitá (diverse) trénovací data.
* **Adversariální odstranění zkreslení (adversarial debiasing)** — postih učení rysů specifických pro pohlaví či rasu.
* **Prahy zohledňující demografii (demographic-aware thresholds)** — odlišné prahy pro jednotlivé skupiny (kontroverzní řešení).

## Standardy reportování

Norma ISO/IEC 19795-1 vyžaduje:

* Popis *testovacího korpusu (test corpus)* (subjekty, vzorky, demografie).
* *Protokol* (jak byla porovnání prováděna).
* *Verzi algoritmu* a jeho parametry.
* *Pracovní bod (operating point)* a odpovídající míry.
* *Intervaly spolehlivosti (confidence intervals)* u reportovaných měr.
* *Demografický rozpad (demographic breakdown)* (pohlaví, věk, etnicita).

Pro **akademické publikace** — plná reprodukovatelnost (kód, přístup k datasetu).

## Limity evaluací

* **Podvržení (spoofing) se netestuje** v tradičních evaluacích — je předmětem samostatného posouzení zranitelnosti (vulnerability assessment) ([[liveness]]).
* **Kolísání kvality (quality variations)** — reálný svět má *horší* kvalitu než benchmarky.
* **Adversariální robustnost** — benchmarky z doby před hlubokým učením (pre-DL) ignorují adversariální příklady.
* **Dlouhodobé stárnutí (long-term aging)** — většina benchmarků pokrývá jen několik let.

---

*Zdroj: BIO přednášky 2025/26, BIO 2 — Hodnocení spolehlivosti a kvality. Externí reference: ISO/IEC 19795-1:2021 *Biometric performance testing and reporting — Part 1: Principles and framework*; NIST FRVT, FpVTE, IREX ongoing — [pages.nist.gov/frvt](https://pages.nist.gov/frvt/); Buolamwini, J., Gebru, T.: *Gender Shades: Intersectional Accuracy Disparities in Commercial Gender Classification* (FAccT 2018) — [paper](http://proceedings.mlr.press/v81/buolamwini18a.html); NIST FRVT Part 3: Demographic Effects (2019).*
