---
title: Elektromagnetický kanál (EMA)
---

# Elektromagnetický kanál (EMA)

**Electromagnetic Emanation Analysis** (EMA) je rozšířením power analysis ([[spa-dpa]]) o měření *EM záření* místo přímé spotřeby. Cílem je získat **víc lokální** informaci než z globální spotřeby. EMA má dlouhou historii — vojenské zaměstnance trénovali už od 50. let v *TEMPEST* programu pro odposlech klasifikovaných elektronických zařízení.

## Princip

Každý proud měnící se v čase generuje *magnetické pole*. CMOS gates při switch způsobují krátké proudové impulsy ve vodičích — z nichž každý vyzařuje *EM signál*. Útočník s **anténou nebo cívkou** signál zachytí, *blízko zařízení* nebo z dálky.

::: svg "EM emanace: gates switching → proud → magnetic field → detection coil → osciloskop. EMA má lepší prostorovou rozlišovací schopnost než power analysis."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="60" y="80" width="200" height="60" rx="4"/>
    <circle cx="380" cy="110" r="22" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <circle cx="380" cy="110" r="15" fill="none" stroke="var(--accent)" stroke-width="1"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="160" y="115" font-size="11">čip (smart card)</text>
    <text x="160" y="156" font-size="10" fill="var(--text-muted)">CMOS gates switching</text>
    <text x="380" y="148" font-size="10.5" fill="var(--text-muted)">probe coil</text>
    <text x="380" y="164" font-size="10" fill="var(--text-muted)">~1 mm dosah</text>
    <text x="480" y="115" font-size="11" fill="var(--accent)">→ osciloskop</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1" fill="none" stroke-dasharray="2 2">
    <path d="M180,80 C200,50 240,40 280,55 C310,65 330,85 358,98"/>
    <path d="M200,80 C220,55 245,48 285,65 C310,75 335,90 360,103"/>
  </g>
  <g fill="var(--text-muted)" font-size="10">
    <text x="270" y="40" text-anchor="middle">B-pole (silokvótní čáry)</text>
  </g>
</svg>
:::

* **Detection coil** — cívka, často miniaturní (~1 mm průměr) s vysokou citlivostí. Specializované sondy jako [Langer ICR](https://www.langer-emv.com/), [Riscure EM probe](https://www.riscure.com/) — komerční nástroje pro EMA.
* **Antény pro vzdálené odposlechy** — *log-periodic*, *horn antennas* pro GHz pásmo.
* **Vzorkovací frekvence** — pro smart card s 5 MHz CLK stačí 500 MS/s; pro moderní CPU s 3 GHz je třeba 10+ GS/s.

## EMA vs. Power Analysis

| Vlastnost | Power Analysis | EMA |
| :--- | :--- | :--- |
| **Měřená veličina** | celková spotřeba zařízení | lokální EM emise |
| **Spatial resolution** | žádné (celý čip) | sub-millimeter |
| **Invazivita** | non-invasive (resistor v GND) | non-invasive (bez kontaktu) |
| **Sensor** | resistor + ADC | coil + amplifier + ADC |
| **Bandwidth** | omezený LFP zařízení (kHz–MHz) | vyšší (MHz–GHz) |
| **Šum** | algorithmic + environmental | + radiation interference |
| **Použití pro útok** | smart cards, IoT | + CPU, FPGA, servery |
| **Cena vybavení** | $500–10 000 | $2 000–100 000 |

EMA má dvě klíčové výhody:

1. **Lokální rozlišení** — pohyb coil po čipu izoluje specifické bloky (CPU vs. krypto-koprocesor vs. cache).
2. **Žádný fyzický kontakt** — útočník nemusí připojovat resistor, stačí položit cívku.

## Útoky

### EMA na smart cards

[Quisquater, Samyde 2001](https://link.springer.com/chapter/10.1007/3-540-44709-1_18) — **ElectroMagnetic Analysis (EMA)**:

* Demonstrace na DES a 3DES smart card.
* Detection coil ø 0.5 mm, ručně pozicovaná nad čipem.
* Stejný DPA algoritmus jako pro power, ale s EM measurements.
* Recovery DES klíče za 10 000 traces.

### EMA na CPU

[*Screaming Channels: When Electromagnetic Side Channels Meet Radio Transceivers*](https://www.usenix.org/system/files/conference/woot18/woot18-paper-camurati.pdf) (Camurati et al.) — útok na ARM Cortex-M0:

* Coil na top desky procesoru.
* Recovery AES klíče během 1 minuty.
* Open-source nástroj (ChipWhisperer-based).

### TEMPEST — keyboard sniffing přes EM

Klasický TEMPEST scénář — odposlech klávesnice z chodby:

* PS/2 a USB klávesnice vysílají na nemodulovaných linkách klíčové scan codes.
* EM emanace specifická pro každou klávesu.
* [Vuagnoux-Pasini 2009](https://lasec.epfl.ch/keyboard/) demonstrovali odposlech až do 20 m s log-periodic anténou.
* Mitigace: shielded keyboard, RF gasket okolo elektronky, wireless šifrované klávesnice (Bluetooth s LE Secure Connections).

### Tablet / phone screen sniffing

[*Stealing PINs via mobile sensors*](https://www.computer.org/csdl/proceedings-article/sp/2020/091300a013/1cvgX1NkUC0) — odposlech zobrazované informace přes EM emanace LCD displeje:

* Vysoké rozlišení LCD vyzařuje na high-frequencies.
* Útočník s SDR (HackRF, USRP) může rekonstruovat obraz.
* Dosah ~1–5 m, omezený amplifikací antény.

## Differential EMA (DEMA)

DEMA je analogie [[spa-dpa|DPA]] pro EM kanál:

1. Stejný algoritmus — selection intermediate value $v$, model úniku (HW/HD), korelace.
2. Místo `T_j[t]` (power trace) máš `EM_j[t]` (EM trace).
3. Korelace odhalí klíč.

DEMA je *citlivější* než DPA na low-end zařízeních (kde algorithmic noise dominuje power signal), ale *méně citlivá* na zařízeních s aktivním EM shielding.

## Útok na vzdálenost — Genkin Acoustic 2014

[*RSA Key Extraction via Low-Bandwidth Acoustic Cryptanalysis*](https://www.tau.ac.il/~tromer/acoustic/) (Genkin, Shamir, Tromer):

* Útok cílí na **kapacitor voltage regulators** v notebookech — tyto reagují na CPU load *zvukovými emisemi* (coil whine).
* Mikrofonem v *mobile telefonu* v dosahu 1 m, nebo *parabolickou* z 4 m, lze odposlechnout klíče GnuPG RSA.
* Útočník otevírá *speciálně zvolené* šifrované zprávy (chosen-ciphertext); CPU loading se mění podle hodnot, zvuk to projeví.
* Klíč extrahován za **1 hodinu** akustického odposlechu.

To je *de facto* side-channel útok přes akustický kanál, ale fyzikální princip je stejný — kondicionované switching, korelace s daty.

## Útok na ekonomický model — TPM 2.0

[*TPM-Fail*](https://tpm.fail/) (Moghimi, Sunar, Eisenbarth, Heninger 2019):

* Intel firmware TPM (fTPM) je software v ME (Management Engine).
* Side-channel přes **system management interrupt (SMI)** — útočník s root právy měří, jak dlouho běží TPM operace.
* Recovery ECDSA klíče pro attestation, signing za 4–20 minut.

Mitigace: Intel/STMicro vydali firmware updates s constant-time implementace.

## Praktický pohled — co útoky vyžadují

Reálný EMA útok:

1. **Setup** — coil pozicovaná nad čipem; pro smart card cca 1–10 minut hledání nejlepší pozice.
2. **Triggering** — synchronizace s operací (např. GPIO pin "start AES"). Obvykle vyžaduje modifikovanou firmware nebo aktivní řízení input.
3. **Acquisition** — 10 000 – 1 000 000 traces. Pro 5 MHz smart card s 500 MS/s scope to je ~10 GB dat.
4. **Analysis** — Python + numpy + scipy, nebo komerční Riscure Inspector, lab-grade ChipWhisperer.
5. **Result** — recovery klíče za hodiny až dny.

Vybavení:
* **ChipWhisperer** ($300+) — open source, určen pro výuku a research; nahrazuje DPA tools $50 000+. Komunitní knihovny [chipwhisperer.io](https://chipwhisperer.io/).
* **Riscure Inspector / Pi** — komerční, používané laboratořemi pro CC EAL5+ certifikace, $50 000+.
* **Langer EM probe set** — sondy ø 50 mm – 1 mm, ~$5 000.

## Obrany — EMA-specific

* **EM shielding** — vodivý obal (kovová klec, RF gasket) okolo zařízení. Útlum 40–80 dB.
* **Balanced logic** — dual-rail signals (každý bit reprezentován jako pár vodičů s opačnými hodnotami). EM emise se vyruší. Standardní u high-security smart cards.
* **Top-metal mesh** — vodivá síť nad citlivými oblastmi čipu. Stíní EMA + tamper detection.
* **Frequency-hopping clocks** — náhodné kolísání hodin rozkládá emise na širší pásmo.
* Stejné obrany jako proti DPA: **masking**, **random delays**, **dummy operations**.

---

*Zdroj: BZA přednášky 2025/26, BZA 05 — Postranní kanály (Malinka). Externí reference: Quisquater, J.-J., Samyde, D.: *ElectroMagnetic Analysis (EMA): Measures and Counter-Measures for Smart Cards* (E-Smart 2001) — [PDF](https://link.springer.com/chapter/10.1007/3-540-44709-1_18); Genkin, D., Shamir, A., Tromer, E.: *RSA Key Extraction via Low-Bandwidth Acoustic Cryptanalysis* (CRYPTO 2014) — [project page](https://www.tau.ac.il/~tromer/acoustic/); Vuagnoux, M., Pasini, S.: *Compromising Electromagnetic Emanations of Wired and Wireless Keyboards* (USENIX Security 2009) — [project page](https://lasec.epfl.ch/keyboard/); NSA TEMPEST: [NACSIM 5000](https://cryptome.org/jya/tempest.htm).*
