---
title: Snímání otisků prstů — technologie senzorů
---

# Snímání otisků prstů — technologie senzorů

Kvalita biometrické šablony závisí *primárně* na kvalitě senzoru. Pro otisky prstů existuje 4 hlavní technologie senzorů — optical, capacitive, ultrasonic, thermal — každá s vlastními kompromisy mezi přesností, robustností, cenou a anti-spoofing odolností.

## Klasifikace senzorů

::: svg "Technologie fingerprint senzorů a jejich charakteristiky: optical (FTIR), capacitive, ultrasonic, thermal."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="30" width="120" height="180" rx="6"/>
    <rect x="150" y="30" width="120" height="180" rx="6"/>
    <rect x="280" y="30" width="120" height="180" rx="6"/>
    <rect x="410" y="30" width="120" height="180" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="80" y="54" font-size="12.5">Optický</text>
    <text x="210" y="54" font-size="12.5">Kapacitní</text>
    <text x="340" y="54" font-size="12.5">Ultrazvukový</text>
    <text x="470" y="54" font-size="12.5">Termální</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9.5">
    <text x="80" y="76">FTIR / CCD</text>
    <text x="210" y="76">CMOS array</text>
    <text x="340" y="76">piezo / MEMS</text>
    <text x="470" y="76">infrared</text>
  </g>
  <g fill="var(--text)" text-anchor="start" font-size="9.5">
    <text x="32" y="100">+ vysoké rozlišení</text>
    <text x="32" y="115">+ levné</text>
    <text x="32" y="130">+ velká plocha</text>
    <text x="32" y="148">− spoofable</text>
    <text x="32" y="163">− vlhkost</text>
    <text x="32" y="178">− velikost</text>
    <text x="162" y="100">+ malé</text>
    <text x="162" y="115">+ rychlé</text>
    <text x="162" y="130">+ anti-photo</text>
    <text x="162" y="148">− vlhkost</text>
    <text x="162" y="163">− ESD risk</text>
    <text x="162" y="178">− omezené rozlišení</text>
    <text x="292" y="100">+ pod displejem</text>
    <text x="292" y="115">+ mokré ruce OK</text>
    <text x="292" y="130">+ liveness</text>
    <text x="292" y="148">− pomalejší</text>
    <text x="292" y="163">− dražší</text>
    <text x="292" y="178">− vlnové artefakty</text>
    <text x="422" y="100">+ anti-spoof</text>
    <text x="422" y="115">+ tenké</text>
    <text x="422" y="148">− sweep motion</text>
    <text x="422" y="163">− temperature drift</text>
    <text x="422" y="178">− malá plocha</text>
  </g>
</svg>
:::

## Optické senzory

### FTIR (Frustrated Total Internal Reflection)

Klasický mechanismus:

1. **Skleněný prism**, prsten LED osvětlení.
2. Při kontaktu **hřebeny** absorbují světlo (kvůli kontaktu se sklem).
3. **Dna** zachycují *total internal reflection* (TIR) — světlo se *odráží* zpět k senzoru.
4. **CCD/CMOS kamera** zachytí výsledný *kontrastní obraz* — hřebeny tmavé, dna světlá.

* **Rozlišení:** 500–1000 dpi (typicky 500).
* **Velikost senzoru:** 25 × 25 mm.
* **Použití:** forenzní readers, AFIS terminals, border control.

### Touch-less optical

* *Bezdotykové* snímání — prsten není v kontaktu.
* **Camera + structured light** — projekce vzoru na prst, 3D reconstruction.
* **Pro:** *higher hygiene* (relevantní covid era), žádné degradace povrchu senzoru.
* **Proti:** *citlivý na osvětlení*, motion blur.
* **Použití:** Mantra Touchless (India), pilotní projekty v hospital ID.

## Kapacitní senzory

Princip:

* Pole malých **kapacitních plotter** v silicon array (~256 × 256 pixels).
* Každý "plotter" měří *kapacitanci* mezi sebou a povrchem prstu.
* **Hřeben** (kontakt s pokožkou) → *vyšší* kapacita.
* **Dno** (vzduchový mezera) → *nižší* kapacita.
* Spojení do **grayscale image**.

### Typy

* **Active capacitive** — *driven* z chip, vyžaduje ground reference (typicky kovový rám okolo senzoru).
* **Passive capacitive** — *parallel plate* model; menší robustnost.

### Použití

* **Apple Touch ID** (iPhone 5s – iPhone 8, iPhone SE 2-3, iPad mini, MacBook Touch Bar).
* **Samsung Galaxy** (pre-2018).
* **Sensor area:** ~5 × 5 mm.
* **Resolution:** ~500 dpi.

### Limity

* **Vlhkost / suchá kůže** — *dramaticky* zhorší přesnost.
* **ESD risk** — elektrostatický náboj může destruovat tenkou izolační vrstvu.
* **Spoofing risky** — silicon casts, conductive gummy bears.

## Ultrazvukové senzory

Nejnovější mass-market technologie:

* **MEMS array** generuje *ultrasonic pulse* (~10 MHz).
* Pulse *prochází* epidermis až k *dermis*.
* Echos odražené *spodní vrstvou* skin (dermis-epidermis junction).
* *Phase differences* → 3D image of ridge structure.

### Výhody

* **Funguje s mokrou rukou, špínou, lotion** — ultrasonic prochází lépe než light/electricity.
* **Under-display:** může být umístěn *pod* OLED display (no hole in glass).
* **Anti-spoofing:** detekuje *3D* structure, *blood flow* (in research).

### Použití

* **Qualcomm Sense ID** — Galaxy S10+ (2019), S20+, …
* **Apple TouchID variants** — některé prototyp, ne produkce.

### Limity

* **Slower** než capacitive (~ 500 ms vs ~ 100 ms).
* **More expensive** chip.
* **Sensor degrades** s display longevity.

## Termální senzory

Princip:

* Senzor měří **rozdíl teploty** mezi *hřebeny* (kontakt s prstem ~30 °C) a *dna* (vzduch ~22 °C).
* Pyroelectric detector → time-based signal.
* **Sweep across** senzor — prst posouvá, obraz se "stitche".

### Výhody

* **Anti-spoof** — vyžaduje *živý* prst s tělesnou teplotou.
* **Tenké** (1D linear sensor stačí).

### Nevýhody

* **Sweep motion** required — uživatel musí posunout prst, ne jen přiložit.
* **Temperature drift** — outdoor cold weather may not work.
* **Small image** — obtížné zachycení velkých plochy.

### Použití

* Atmel/AuthenTec sensors v notebookech (2000s).
* Dnes překonáno capacitive / ultrasonic.

## Anti-spoofing

Detailně [[liveness]]. Stručně pro fingerprints:

* **Capacitive** — vyžaduje *conductive* materiál (silicon nestačí; gummy bears workují).
* **Optical** — *static photo* nestačí; ale *high-quality silicone* může uspět.
* **Ultrasonic** — *3D structure* detection; obtížnější spoofing.
* **Thermal** — *temperature* detection; vyžaduje *heated* fake finger.

State-of-the-art: **multimodal liveness** — kombinace:

* Temperature + pulse oximetry (blood flow).
* Skin conductance (galvanic skin response).
* Subdermal capacitance pattern.

## Mobile vs. desktop sensors

| | **Mobile** | **Desktop / forensic** |
| :--- | :---: | :---: |
| Velikost senzoru | 5 × 5 mm | 25 × 25 mm |
| Rozlišení | 500 dpi | 500–1000 dpi |
| Captured area | partial finger | full finger / rolled |
| Cena | $1–$10 | $100+ |
| Účel | unlock, payment | enrollment, AFIS |

## Standardy

* **ANSI/NIST-ITL 1-2011** — fingerprint data format.
* **ISO/IEC 19794-2:2011** — finger minutiae data.
* **ISO/IEC 19794-4:2005** — finger image data.
* **ISO/IEC 24745:2022** — biometric information protection.
* **NIST SP 800-76-2** — biometric specifications for PIV.

## Trendy 2025

* **Larger area sensors** — Apple ditched Touch ID, ale Android moves to *full-display* ultrasonic.
* **In-display optical** — Samsung Galaxy ($300+ phones).
* **Multimodal** — fingerprint + ECG (heart rhythm) — Apple Watch series.
* **Touchless** — post-COVID interest, but quality still inferior.

---

*Zdroj: BIO přednášky 2025/26, BIO 5 — Rozpoznávání podle otisků prstů (Drahanský). Externí reference: Maltoni, D., Maio, D., Jain, A. K., Prabhakar, S.: *Handbook of Fingerprint Recognition* (2nd ed., Springer 2009), kap. 2; Maio, D., Maltoni, D.: *Direct Gray-Scale Minutiae Detection in Fingerprints* (IEEE PAMI 1997); Qualcomm Snapdragon Sense ID datasheet; NIST FpVTE ongoing.*
