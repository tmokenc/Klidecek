---
title: Testování a evaluace biometrických systémů
---

# Testování a evaluace biometrických systémů

Hodnocení biometrického systému je *statistický* problém — pro spolehlivé odhady FAR/FRR ([[far-frr]]) potřebujeme *velký* dataset, *reprezentativní* podmínky a *standardizovanou* metodologii. ISO/IEC 19795 a NIST guidelines specifikují tři úrovně evaluace.

## Tři úrovně evaluace (ISO/IEC 19795-1)

### 1. Evaluace technologie (Technology evaluation)

* **Cíl:** porovnání algoritmů na **standardní databázi**.
* **Postup:** dataset je *zveřejněn*, různé algoritmy ho zpracovávají, výsledky se porovnávají.
* **Výhody:** *reprodukovatelné*, nezávislé na hardware.
* **Nevýhody:** *nezachycuje* real-world podmínky (různé senzory, environment).
* **Příklady:** NIST FRVT, FpVTE, FVC (Fingerprint Verification Competition).

### 2. Evaluace scénáře (Scenario evaluation)

* **Cíl:** test systému v **kontrolovaném** prostředí simulujícím reálné nasazení.
* **Postup:** real subjects ve specific test scenario (např. testovací letiště, gateway).
* **Výhody:** zachycuje *typické* podmínky (kvalita capture, user behavior).
* **Nevýhody:** *drahé*, vyžaduje subjects + control.
* **Příklady:** UK Home Office IBIA evaluations, DHS Maryland Test Facility.

### 3. Provozní evaluace (Operational evaluation)

* **Cíl:** measurement *v reálném nasazení*.
* **Postup:** instrumentace produkčního systému; sběr dat během běžného provozu.
* **Výhody:** *most realistic*; *true* user population, environment.
* **Nevýhody:** *no ground truth* pro impostors (často není); *privacy concerns*.
* **Příklady:** US-VISIT throughput reports, Aadhaar reliability studies.

## Sběr dat a vyhodnocení

### Test sets

* **Train set** — pro *trénování* (pokud algoritmus má learning fázi).
* **Validation set** — pro *tuning* parameters (threshold, hyperparameters).
* **Test set** — pro *final* evaluation. *Disjoint* od train/validation.

Important: **subject overlap** mezi train a test je *fatal* — vyhodnocení je optimistické. Standardní paradigm: *subject-independent* split.

### Velikost datasetu

Pro *statistical confidence* of FAR/FRR estimates:

::: math
\text{počet impostor pokusů} \ge \frac{1}{\text{target FAR}} \cdot \text{confidence factor}
:::

Pro target FAR = $10^{-6}$ s 95 % confidence: **minimum 10⁷ impostor comparisons**.

* **NIST FRVT 2024:** 18 million face images.
* **Aadhaar:** 1.3 miliardy enrollment.
* Pro academic research: 10⁵ – 10⁶ comparisons typical.

### Test environments

* **Lab** — kontrolované osvětlení, fixed senzor, optimal pose.
* **Office/Indoor** — typické office environment.
* **Outdoor** — daylight, weather variations.
* **Mobile** — handheld phone capture, motion blur.

## Stárnutí (Aging)

Specifický test — *jak* se přesnost mění s časem mezi enrollment a recognition?

* **Otisky prstů:** velmi stabilní; pomalá degradace.
* **Obličej:** *rychlá* degradace (vrásky, váhové změny, vlasy).
* **Iris:** *velmi* stabilní (po dětství).
* **Voice:** kolísá; nemoci, věkové změny.

**NIST FRVT Aging study** (2018): FRR @ FAR=10⁻⁴ vzroste z 1 % (čerstvé enrollment) na 3 % po 10 letech (face).

### Mitigace

* **Re-enrollment** každých N let.
* **Adaptive enrollment** — automatic update při successful authentication.
* **Multiple templates** uložené v různých časech.

## Dvojčata

**Stress test** — biometrika mezi identickými dvojčaty.

* **DNA:** prakticky stejná (sdílení 99.99 %); rozlišení vyžaduje specifické markery (SNPs).
* **Obličej:** *velmi* podobný; mnoho FaceID systems chybuje.
* **Hlas:** podobný (genetics + environment).
* **Otisky prstů:** *odlišné* (epigeneticky tvořené).
* **Iris:** *odlišné* (epigeneticky tvořené).

Test database: **TwinsDB** (NIST), **ND-Twins** (Notre Dame) — speciální datasets s twin pairs.

## Počet porovnání pro výpočet FMR

Pro $N$ enrolled subjects v test set:

* **Genuine comparisons** (FNMR): $N \cdot (T - 1) / 2$, kde $T$ je počet samples per subject.
* **Impostor comparisons** (FMR): $\binom{N}{2} \cdot T \cdot T$ (každý pair × samples).

Pro $N = 1000$ subjects, $T = 10$ samples:

* Genuine: ~45 000.
* Impostor: ~50 milion.

Toto je *enough* pro FMR > 10⁻⁵, *not enough* pro FMR < 10⁻⁶.

## NIST benchmarks

NIST vede *ongoing* evaluation programs:

* **FRVT** (Face Recognition Vendor Test) — face recognition, since 2002.
* **FpVTE** (Fingerprint Vendor Technology Evaluation) — fingerprints, since 2003.
* **IREX** (Iris Exchange) — iris, since 2009.
* **SRE** (Speaker Recognition Evaluation) — voice, since 1996.
* **MINEX** (Minutiae Interoperability Exchange) — fingerprint template interoperability.

Vendors *poskytují* svůj algoritmus, NIST ho testuje *blind* na proprietary databases. Reporting je *fully transparent* — žebříčky publikované online.

## Plánování testování

Před started evaluation:

1. **Definuj test scope** — který biometric, který modal, kterou metriku (verifikace nebo identifikace).
2. **Vyber dataset** — relevant demographics, conditions, size.
3. **Definuj protocol** — train/test split, single-shot vs. multiple, allowed retries.
4. **Implement** — testing pipeline, scoring.
5. **Statistical analysis** — confidence intervals, demographic effects.
6. **Report** — ISO/IEC 19795-1 standardizes report format.

## Dataset bias a fairness

Důležitý nedávný topic:

* Mnoho commercial face recognition systems performs *much worse* on darker skin tones (Buolamwini-Gebru 2018, *Gender Shades*).
* Důvod: training data heavily biased toward white/male subjects.
* **NIST FRVT Part 3: Demographic Effects** (2019) — formal evaluation napříč pohlaví, věk, etnicita.

Mitigace:

* Diverse training data.
* **Adversarial debiasing** — penalize learning gender/race-specific features.
* **Demographic-aware thresholds** — different thresholds per group (controversial).

## Reporting standardy

ISO/IEC 19795-1 vyžaduje:

* Description of *test corpus* (subjects, samples, demographics).
* *Protocol* (how comparisons were made).
* *Algorithm version* + parameters.
* *Operating point* + corresponding rates.
* *Confidence intervals* on reported rates.
* *Demographic breakdown* (gender, age, ethnicity).

Pro **academic publications** — full reproducibility (code, dataset access).

## Limit evaluací

* **Spoofing not tested** in traditional evaluations — separate vulnerability assessment ([[liveness]]).
* **Quality variations** — real-world has *worse* quality than benchmarks.
* **Adversarial robustness** — pre-DL benchmarks ignore adversarial examples.
* **Long-term aging** — most benchmarks span only few years.

---

*Zdroj: BIO přednášky 2025/26, BIO 2 — Hodnocení spolehlivosti a kvality. Externí reference: ISO/IEC 19795-1:2021 *Biometric performance testing and reporting — Part 1: Principles and framework*; NIST FRVT, FpVTE, IREX ongoing — [pages.nist.gov/frvt](https://pages.nist.gov/frvt/); Buolamwini, J., Gebru, T.: *Gender Shades: Intersectional Accuracy Disparities in Commercial Gender Classification* (FAccT 2018) — [paper](http://proceedings.mlr.press/v81/buolamwini18a.html); NIST FRVT Part 3: Demographic Effects (2019).*
