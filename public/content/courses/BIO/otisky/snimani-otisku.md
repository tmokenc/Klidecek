---
title: Snímání otisků prstů — technologie senzorů
---

# Snímání otisků prstů — technologie senzorů

Kvalita biometrické šablony závisí *především* na kvalitě senzoru (sensor). Pro otisky prstů existují čtyři hlavní technologie senzorů — optická, kapacitní, ultrazvuková a termální — a každá z nich má vlastní kompromisy mezi přesností, robustností, cenou a odolností proti podvržení (anti-spoofing).

## Klasifikace senzorů

::: svg "Technologie fingerprint senzorů a jejich charakteristiky: optický (FTIR), kapacitní, ultrazvukový, termální."
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

Klasický princip funguje takto:

1. **Skleněný hranol (prism)** a kruhové LED osvětlení.
2. Při kontaktu **hřebeny (ridges)** světlo pohltí (kvůli dotyku se sklem).
3. **Dna mezi hřebeny (valleys)** zachovají *úplný vnitřní odraz* (total internal reflection, TIR) — světlo se *odráží* zpět k senzoru.
4. **CCD/CMOS kamera** zachytí výsledný *kontrastní obraz* — hřebeny tmavé, dna světlá.

* **Rozlišení:** 500–1000 dpi (typicky 500).
* **Velikost senzoru:** 25 × 25 mm.
* **Použití:** forenzní čtečky (readers), terminály AFIS, hraniční kontrola (border control).

### Bezdotykové optické snímání

* *Bezdotykové* snímání — prst se senzoru nedotýká.
* **Kamera a strukturované světlo (structured light)** — na prst se promítne vzor a z něj se rekonstruuje 3D model.
* **Pro:** *vyšší hygiena* (relevantní v době covidu), žádné opotřebení povrchu senzoru.
* **Proti:** *citlivost na osvětlení*, rozmazání pohybem (motion blur).
* **Použití:** Mantra Touchless (Indie), pilotní projekty pro identifikaci v nemocnicích.

## Kapacitní senzory

Princip:

* Pole drobných **kapacitních destiček (plates)** v křemíkovém poli (silicon array, ~256 × 256 pixelů).
* Každá destička měří *kapacitu (capacitance)* mezi sebou a povrchem prstu.
* **Hřeben** (kontakt s pokožkou) → *vyšší* kapacita.
* **Dno** (vzduchová mezera) → *nižší* kapacita.
* Jednotlivé hodnoty se spojí do **obrazu ve stupních šedi (grayscale image)**.

### Typy

* **Aktivní kapacitní (active capacitive)** — *buzený* z čipu, vyžaduje vztažnou zem (ground reference), typicky kovový rám okolo senzoru.
* **Pasivní kapacitní (passive capacitive)** — model *paralelních desek (parallel plate)*; menší robustnost.

### Použití

* **Apple Touch ID** (iPhone 5s – iPhone 8, iPhone SE 2.–3. generace, iPad mini, MacBook Touch Bar).
* **Samsung Galaxy** (před rokem 2018).
* **Plocha senzoru:** ~5 × 5 mm.
* **Rozlišení:** ~500 dpi.

### Limity

* **Vlhkost / suchá kůže** — *dramaticky* zhorší přesnost.
* **Riziko ESD (elektrostatického výboje)** — elektrostatický náboj může zničit tenkou izolační vrstvu.
* **Riziko podvržení (spoofing)** — křemíkové (silikonové) odlitky, vodivé „gumové medvídky".

## Ultrazvukové senzory

Nejnovější technologie pro masový trh:

* **Pole MEMS** generuje *ultrazvukový puls* (~10 MHz).
* Puls *prochází* pokožkou (epidermis) až do *škáry (dermis)*.
* Echa se odrážejí od *spodní vrstvy* kůže (rozhraní dermis–epidermis).
* *Fázové rozdíly (phase differences)* → 3D obraz struktury hřebenů.

### Výhody

* **Funguje s mokrou rukou, špínou i krémem** — ultrazvuk prochází lépe než světlo nebo elektřina.
* **Pod displejem (under-display):** může být umístěn *pod* OLED displejem (bez otvoru ve skle).
* **Odolnost proti podvržení (anti-spoofing):** detekuje *3D* strukturu a *průtok krve (blood flow)* (zatím ve výzkumu).

### Použití

* **Qualcomm Sense ID** — Galaxy S10+ (2019), S20+, …
* **Varianty Apple TouchID** — některé prototypy, ne sériová výroba.

### Limity

* **Pomalejší** než kapacitní (~500 ms oproti ~100 ms).
* **Dražší** čip.
* **Senzor degraduje** spolu s životností displeje.

## Termální senzory

Princip:

* Senzor měří **rozdíl teploty** mezi *hřebeny* (kontakt s prstem ~30 °C) a *dny* (vzduch ~22 °C).
* Pyroelektrický detektor → časově proměnný signál (time-based signal).
* **Přejetí přes senzor (sweep):** prst se po senzoru posouvá a obraz se postupně skládá (stitching).

### Výhody

* **Odolnost proti podvržení (anti-spoof)** — vyžaduje *živý* prst s tělesnou teplotou.
* **Tenké provedení** — stačí jednorozměrný řádkový senzor (1D linear sensor).

### Nevýhody

* **Vyžaduje pohyb (sweep motion)** — uživatel musí prst posunout, nestačí jen přiložit.
* **Teplotní drift (temperature drift)** — venku v chladu nemusí fungovat.
* **Malý obraz** — obtížně se zachytí velká plocha.

### Použití

* Senzory Atmel/AuthenTec v noteboocích (kolem roku 2000).
* Dnes překonáno kapacitními / ultrazvukovými senzory.

## Odolnost proti podvržení (anti-spoofing)

Podrobně viz [[liveness]]. Stručně pro otisky prstů:

* **Kapacitní** — vyžaduje *vodivý* materiál (samotný silikon nestačí; „gumoví medvídci" fungují).
* **Optické** — *statická fotografie* nestačí, ale *kvalitní silikon* může uspět.
* **Ultrazvukové** — detekce *3D struktury*; podvržení je obtížnější.
* **Termální** — detekce *teploty*; vyžaduje *zahřátý* falešný prst.

Aktuální špička oboru (state-of-the-art): **multimodální detekce živosti (multimodal liveness)** — kombinace:

* Teplota a pulzní oxymetrie (průtok krve).
* Kožní vodivost (galvanická kožní reakce, galvanic skin response).
* Podkožní (subdermální) kapacitní vzor.

## Mobilní vs. stolní senzory

| | **Mobilní** | **Stolní / forenzní** |
| :--- | :---: | :---: |
| Velikost senzoru | 5 × 5 mm | 25 × 25 mm |
| Rozlišení | 500 dpi | 500–1000 dpi |
| Snímaná plocha | část prstu | celý prst / válený otisk |
| Cena | 1–10 $ | 100 $ a více |
| Účel | odemčení, platba | registrace (enrollment), AFIS |

## Standardy

* **ANSI/NIST-ITL 1-2011** — formát dat otisků prstů.
* **ISO/IEC 19794-2:2011** — data markantů (minutiae) prstu.
* **ISO/IEC 19794-4:2005** — obrazová data prstu.
* **ISO/IEC 24745:2022** — ochrana biometrických informací.
* **NIST SP 800-76-2** — biometrické specifikace pro PIV.

## Trendy 2025

* **Senzory s větší plochou** — Apple od Touch ID upustil, ale Android směřuje k *celodisplejovým (full-display)* ultrazvukovým senzorům.
* **Optické v displeji (in-display)** — Samsung Galaxy (telefony za 300 $ a více).
* **Multimodální** — otisk prstu + EKG (srdeční rytmus) — řada Apple Watch.
* **Bezdotykové (touchless)** — zájem po pandemii covidu, kvalita je ale stále nižší.

---

*Zdroj: BIO přednášky 2025/26, BIO 5 — Rozpoznávání podle otisků prstů (Drahanský). Externí reference: Maltoni, D., Maio, D., Jain, A. K., Prabhakar, S.: *Handbook of Fingerprint Recognition* (2nd ed., Springer 2009), kap. 2; Maio, D., Maltoni, D.: *Direct Gray-Scale Minutiae Detection in Fingerprints* (IEEE PAMI 1997); Qualcomm Snapdragon Sense ID datasheet; NIST FpVTE ongoing.*
