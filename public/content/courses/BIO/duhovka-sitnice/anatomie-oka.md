---
title: Anatomie oka pro biometriku
---

# Anatomie oka pro biometriku

**Oko** poskytuje dvě nezávislé biometriky: **duhovku** (iris) a **sítnici** (retina). Obě se vyznačují *extrémní jedinečností* a *stálostí* — jsou považovány za jedny z nejpřesnějších biometrických modalit (vedle DNA). Pochopení anatomie je nezbytné pro porozumění algoritmům rozpoznávání.

## Struktura oka

::: svg "Anatomie oka v řezu: rohovka, duhovka, pupila, čočka, sklivec, sítnice s slepou skvrnou."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <circle cx="270" cy="120" r="90"/>
  </g>
  <g fill="rgba(150,200,230,0.3)" stroke="var(--accent)" stroke-width="1">
    <ellipse cx="195" cy="120" rx="20" ry="60"/>
  </g>
  <g fill="rgba(100,150,200,0.5)" stroke="var(--accent)" stroke-width="1.2">
    <circle cx="195" cy="120" r="25"/>
  </g>
  <g fill="rgba(50,50,50,0.8)" stroke="var(--accent)" stroke-width="1.2">
    <circle cx="195" cy="120" r="10"/>
  </g>
  <g fill="rgba(255,220,200,0.4)" stroke="var(--accent)" stroke-width="1">
    <ellipse cx="220" cy="120" rx="14" ry="32"/>
  </g>
  <g fill="rgba(180,150,200,0.3)" stroke="var(--accent)" stroke-width="0.8">
    <path d="M270,40 Q360,80 360,120 Q360,160 270,200 L270,40" />
  </g>
  <g fill="var(--accent)" stroke="none">
    <circle cx="325" cy="120" r="4"/>
  </g>
  <g fill="var(--text)" text-anchor="start" font-size="10">
    <text x="100" y="62">Rohovka (cornea)</text>
    <text x="100" y="118">Duhovka (iris)</text>
    <text x="100" y="148">Pupila</text>
    <text x="245" y="74">Čočka</text>
    <text x="350" y="100">Sítnice (retina)</text>
    <text x="335" y="130" fill="var(--accent)">slepá skvrna</text>
    <text x="320" y="200">Sklivec (vitreum)</text>
  </g>
  <g stroke="var(--text-muted)" stroke-width="0.8" fill="none">
    <path d="M180,80 L155,65"/>
    <path d="M175,120 L155,118"/>
    <path d="M192,140 L155,148"/>
    <path d="M225,100 L245,80"/>
    <path d="M325,110 L350,108"/>
    <path d="M295,180 L320,196"/>
  </g>
</svg>
:::

* **Rohovka (cornea)** — průhledná přední vrstva oka. Tvoří ~2/3 lomivosti.
* **Duhovka (iris)** — *barevná část* oka mezi rohovkou a čočkou. Obsahuje pigment a vzor, který je *unique per person*.
* **Pupila (zornice)** — *otvor* uprostřed duhovky; mění svou velikost reflexně podle osvětlení (musculus sphincter pupillae a dilatator pupillae).
* **Čočka (lens)** — průhledná čočka za duhovkou; mění svou křivost (akomodace) pro zaostření.
* **Sklivec (vitreum)** — průhledná gelovitá náplň zadní komory oka.
* **Sítnice (retina)** — *vnitřní* světločitlivá vrstva s fotoreceptory (tyčinky + čípky); detekuje světlo a vede signál do mozku.

## Duhovka (iris) — anatomie

Duhovka je *plochá*, kruhová struktura tloušťky ~0.5 mm. Tvořena ze dvou vrstev:

* **Stroma** — vnitřní vrstva s pigment cells a *spletitými* vlákny — tvoří unique pattern.
* **Pigment epithelium** — zadní vrstva s pigmentem (melaninem), který určuje barvu (modrá, zelená, hnědá).

Duhovka se dělí na **dvě oblasti**:

* **Vnitřní (pupilární)** — okolo pupily.
* **Vnější (řasová, ciliární)** — okolo perimeter.

### Roztahovací svaly

* **Musculus sphincter pupillae** — kruhový sval kolem pupily; *stahuje* ji při jasném světle.
* **Musculus dilatator pupillae** — radiální vlákna; *roztahuje* pupilu v tmavém prostředí.

Tato dynamika vytváří **variability v poloze duhovky** během snímání — *normalizace* musí kompenzovat změny.

### Genetics vs. epigenetics

* **Barva** je geneticky determinovaná (gen OCA2 + HERC2 a další).
* **Vzor** je *epigeneticky* tvořen during fetal development (8-9 měsíc):
  * **Identická dvojčata** mají *odlišné* iris pattern!
  * Levé a pravé oko *jediné* osoby jsou také *odlišné*.

### Stálost

* Po prvním roce života je iris **velmi stabilní** — *nejstabilnější* biometrika.
* Excpetions:
  * Trauma.
  * Některé oční nemoci (např. *iris neoplasm*).
  * Cataract surgery (lens replacement).
  * Diabetes — *iridopatie* může mít subtle changes.

## Sítnice — anatomie

Sítnice je *vnitřní* vrstva oka, ~0.5 mm thick. Obsahuje:

* **Fotoreceptory:**
  * **Tyčinky (rods)** — ~120 milionů, detekce *jasu* (scotopic vision).
  * **Čípky (cones)** — ~6 milionů, detekce *barvy* (photopic vision); tři typy (R, G, B).
* **Optical disk** (slepá skvrna) — místo, kde optical nerve vstupuje; *žádné* fotoreceptory.
* **Macula lutea** — central area s nejvyšší hustotou čípků; *fovea* uprostřed.

### Cévní systém

Sítnice je *bohatě prokrvená* — *centrální* retinální arterie a venule + jejich větve. **Vzor cév** (vascular pattern) je *unique per person* a slouží jako biometric template.

Rozpoznávání:

* Sítnice je snímána přes pupilu *pomocí* IR camera + low-power laser.
* Komplikované již samo o sobě — vyžaduje *cooperative subject* a precision alignment.

## Klíčový rozdíl: duhovka vs. sítnice

| | **Duhovka (iris)** | **Sítnice (retina)** |
| :--- | :---: | :---: |
| **Snímání** | externí (kamera + IR) | internal (přes pupilu) |
| **User cooperation** | minimal | high |
| **Snímací vzdálenost** | 0.1–1 m | 5 cm (close) |
| **Vlastnost** | pigment + texture | cévní vzor |
| **Stálost** | very high | extremely high |
| **Unique** | very high | extremely high |
| **Detekce nemocí** | partial | high (diabetes, glaucoma) |
| **Praktické nasazení** | mass-scale | high-security only |

Z důvodu lepšího user experience je **iris** dominantní v komerčních systémech; **retina** se používá hlavně v *high-security* / *medical* contextu.

## Iris vs. retina rozlišení

* **Iris** — *outside* of eye, externally visible.
* **Retina** — *inside* of eye, requires sensor pointing into pupil.

V *populárním* tisku se často zaměňuje. Korektní:

* "Iris scanning" — duhovka.
* "Retinal scanning" — sítnice.
* "Eye scanning" — vágní; obvykle iris.

## Snímací technologie

### Iris

* **NIR camera** (700–900 nm).
* **Standard:** ISO/IEC 19794-6 — *iris image data*.
* **Best resolution:** ~640 × 480 pixels for iris area.
* **Distance:** 10 cm – 1 m (extended in newer systems).
* **Algorithm:** Daugman ([[daugman]]).

### Retina

* **Visible + NIR illumination**.
* **Fundus camera** — specialized ophthalmology equipment.
* **Distance:** ~5 cm (very close).
* **Algorithm:** vascular pattern matching ([[sitnice-cevy]]).

## Specifika biometrického snímání

### Duhovka

* **Pupil dilation** — pupila změní velikost; *iris area* se vlivem toho zmenší/zvětší → potřeba *normalization* (Daugman rubber-sheet model).
* **Kontaktní čočky** — některé designs (especially patterned cosmetic lenses) ruší snímání.
* **Interference světla** — odlesky na rohovce.
* **Mrkání** — řasy a víčka mohou zakrýt iris.

### Sítnice

* **Pohyb oka** — natural eye movement (saccades).
* **Spektrální analýza tkání a cév**.
* **Reflexe světla** — corneal reflection.
* **Krevní průtok** — slow pulsatile changes.
* **Mrkání na povel** — required for some protocols.
* **Reakce na světlo** — pupilární reflex.

## Speciální zařízení — Eyrina

Akademický projekt zařízení **Eyrina**:

* *Téměř v jednom okamžiku* pořídí *oba snímky* (iris + retina).
* Využití pro **biomedicínské** i **biometrické** účely.
* Komplexní setup s precision optics.

Detailně [[snimaci-systemy]].

## Klinické vs. biometrické snímání

Mezi *medical* a *biometric* snímání jsou zásadní rozdíly:

* **Medical** — diagnostické cíle, *high resolution*, *full pathology assessment*. Drahé fundus cameras.
* **Biometric** — *identification* cíl, *moderate resolution*, *quick scan*. Compact cameras, automatizované.

Some integration: **smart fundus cameras** kombinují diagnostiku diabetic retinopathy s biometric ID.

---

*Zdroj: BIO přednášky 2025/26, BIO — Rozpoznávání podle duhovky a sítnice (Drahanský, Semerád). Externí reference: Daugman, J.: *How Iris Recognition Works* (IEEE T-CSVT 2004) — [PDF](https://www.cl.cam.ac.uk/~jgd1000/csvt.pdf); Bowyer, K. W., Hollingsworth, K., Flynn, P. J.: *Image Understanding for Iris Biometrics: A Survey* (CVIU 2008); STRaDe @ FIT VUT — [strade.fit.vutbr.cz](https://strade.fit.vutbr.cz/).*
