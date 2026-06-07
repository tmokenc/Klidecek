---
title: Anatomie oka pro biometriku
---

# Anatomie oka pro biometriku

**Oko** poskytuje dvě nezávislé biometriky: **duhovku** (iris) a **sítnici** (retina). Obě se vyznačují *extrémní jedinečností* a *stálostí* — jsou považovány za jedny z nejpřesnějších biometrických modalit (vedle DNA). Pochopení anatomie je nezbytné pro porozumění algoritmům rozpoznávání.

## Struktura oka

::: svg "Anatomie oka v řezu: rohovka, duhovka, pupila, čočka, sklivec, sítnice se slepou skvrnou."
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
    <path d="M358,110 L350,104"/>
    <path d="M295,180 L320,196"/>
  </g>
</svg>
:::

* **Rohovka (cornea)** — průhledná přední vrstva oka. Tvoří přibližně dvě třetiny lomivosti oka.
* **Duhovka (iris)** — *barevná část* oka mezi rohovkou a čočkou. Obsahuje pigment a vzor, který je *u každého člověka jedinečný*.
* **Pupila (zornice)** — *otvor* uprostřed duhovky; svou velikost mění reflexně podle osvětlení (díky svalům musculus sphincter pupillae a dilatator pupillae).
* **Čočka (lens)** — průhledná čočka za duhovkou; mění svou křivost (akomodace) pro zaostření.
* **Sklivec (vitreum)** — průhledná gelovitá náplň zadní komory oka.
* **Sítnice (retina)** — *vnitřní* světločitlivá vrstva s fotoreceptory (tyčinky a čípky); detekuje světlo a vede signál do mozku.

## Duhovka (iris) — anatomie

Duhovka je *plochá*, kruhová struktura tloušťky přibližně 0,5 mm. Je tvořena ze dvou vrstev:

* **Stroma** — přední (viditelná) vrstva s pigmentovými buňkami a *spletitými* vlákny — právě ta tvoří jedinečný vzor. Obsah melaninu ve stromatu (spolu s Rayleighovým rozptylem) *určuje barvu* (málo melaninu → modrá, hodně → hnědá).
* **Pigmentový epitel (pigment epithelium)** — zadní vrstva, u všech lidí *rovnoměrně tmavá* (silně pigmentovaná melaninem).

Duhovka se dělí na **dvě oblasti**:

* **Vnitřní (pupilární)** — okolo pupily.
* **Vnější (řasová, ciliární)** — při vnějším okraji.

### Roztahovací svaly

* **Musculus sphincter pupillae** — kruhový sval kolem pupily; *stahuje* ji při jasném světle.
* **Musculus dilatator pupillae** — radiální vlákna; *roztahuje* pupilu v tmavém prostředí.

Tato dynamika způsobuje **proměnlivost polohy duhovky** během snímání — *normalizace* obrazu pak musí tyto změny kompenzovat.

### Genetika versus epigenetika

* **Barva** je geneticky určená (geny OCA2, HERC2 a další).
* **Vzor** vzniká *epigeneticky* během vývoje plodu (v 8. až 9. měsíci):
  * **Jednovaječná dvojčata** mají *odlišný* vzor duhovky!
  * Levé a pravé oko *jediné* osoby jsou navzájem také *odlišné*.

### Stálost

* Po prvním roce života je duhovka **velmi stabilní** — jde o *nejstálejší* biometriku.
* Výjimky:
  * Trauma.
  * Některé oční nemoci (např. *nádor duhovky*, iris neoplasm).
  * Operace katarakty, tedy šedého zákalu (výměna čočky, lens replacement).
  * Cukrovka (diabetes) — *iridopatie* může způsobit drobné, jemné změny.

## Sítnice — anatomie

Sítnice je *vnitřní* vrstva oka o tloušťce přibližně 0,5 mm. Obsahuje:

* **Fotoreceptory:**
  * **Tyčinky (rods)** — přibližně 120 milionů, detekce *jasu* (vidění za šera, scotopic vision).
  * **Čípky (cones)** — přibližně 6 milionů, detekce *barvy* (vidění za denního světla, photopic vision); existují tři typy (R, G, B).
* **Slepá skvrna (optic disk)** — místo, kde do oka vstupuje zrakový nerv (optic nerve); *nejsou* zde žádné fotoreceptory.
* **Žlutá skvrna (macula lutea)** — centrální oblast s nejvyšší hustotou čípků; uprostřed se nachází *fovea* (jamka nejostřejšího vidění).

### Cévní systém

Sítnice je *bohatě prokrvená* — vede ji *centrální* retinální tepna a žíla i jejich větve. **Vzor cév (vascular pattern)** je *u každého člověka jedinečný* a slouží jako biometrická šablona (template).

Rozpoznávání:

* Sítnice se snímá přes pupilu *pomocí* infračervené (IR) kamery a slabého laseru.
* Už samotné snímání je náročné — vyžaduje *spolupracujícího člověka* a přesné zarovnání optiky.

## Klíčový rozdíl: duhovka versus sítnice

| | **Duhovka (iris)** | **Sítnice (retina)** |
| :--- | :---: | :---: |
| **Snímání** | externí (kamera + IR) | interní (přes pupilu) |
| **Nutná spolupráce uživatele** | minimální | vysoká |
| **Snímací vzdálenost** | 0,1–1 m | 5 cm (zblízka) |
| **Sledovaná vlastnost** | pigment + textura | cévní vzor |
| **Stálost** | velmi vysoká | mimořádně vysoká |
| **Jedinečnost** | velmi vysoká | mimořádně vysoká |
| **Detekce nemocí** | částečná | vysoká (cukrovka, zelený zákal) |
| **Praktické nasazení** | hromadné | jen pro vysoké zabezpečení |

Kvůli lepšímu uživatelskému komfortu je **duhovka** dominantní v komerčních systémech; **sítnice** se používá hlavně v *vysoce zabezpečených* nebo *lékařských* prostředích.

## Duhovka versus sítnice — rozlišení pojmů

* **Duhovka (iris)** — je *na povrchu* oka, navenek viditelná.
* **Sítnice (retina)** — je *uvnitř* oka, snímač musí mířit dovnitř přes pupilu.

V *populárním* tisku se oba pojmy často zaměňují. Správně:

* „Iris scanning" — snímání duhovky.
* „Retinal scanning" — snímání sítnice.
* „Eye scanning" — vágní pojem; obvykle se jím myslí duhovka.

## Snímací technologie

### Duhovka

* **Kamera v blízkém infračerveném pásmu (NIR camera)** (700–900 nm).
* **Norma:** ISO/IEC 19794-6 — *iris image data* (formát dat o obrazu duhovky).
* **Doporučené rozlišení:** přibližně 640 × 480 pixelů pro oblast duhovky.
* **Vzdálenost:** 10 cm – 1 m (u novějších systémů i větší).
* **Algoritmus:** Daugman ([[daugman]]).

### Sítnice

* **Osvětlení ve viditelném i blízkém infračerveném pásmu (NIR)**.
* **Fundus kamera** — specializované oftalmologické vybavení.
* **Vzdálenost:** přibližně 5 cm (velmi zblízka).
* **Algoritmus:** porovnávání cévního vzoru (vascular pattern matching) ([[sitnice-cevy]]).

## Specifika biometrického snímání

### Duhovka

* **Rozšiřování pupily (pupil dilation)** — pupila mění velikost, a tím se *plocha duhovky* zmenší nebo zvětší → je potřeba *normalizace* (Daugmanův rubber-sheet model, tedy model „pružné plachetky", který duhovku rozvine do pravidelného obdélníku).
* **Kontaktní čočky** — některé typy (zejména vzorované kosmetické čočky) snímání ruší.
* **Odlesky světla** — odlesky na rohovce.
* **Mrkání** — řasy a víčka mohou duhovku zakrýt.

### Sítnice

* **Pohyb oka** — přirozené pohyby oka (sakády).
* **Spektrální analýza tkání a cév**.
* **Odraz světla** — odraz na rohovce (corneal reflection).
* **Krevní průtok** — pomalé pulzující změny.
* **Mrkání na povel** — některé protokoly jej vyžadují.
* **Reakce na světlo** — pupilární reflex.

## Speciální zařízení — Eyrina

Akademický projekt zařízení **Eyrina**:

* *Téměř v jednom okamžiku* pořídí *oba snímky* (duhovku i sítnici).
* Využití pro **biomedicínské** i **biometrické** účely.
* Komplexní sestava s přesnou optikou.

Podrobně viz [[snimaci-systemy]].

## Klinické versus biometrické snímání

Mezi *lékařským* a *biometrickým* snímáním jsou zásadní rozdíly:

* **Lékařské** — cílem je diagnostika, *vysoké rozlišení*, *úplné zhodnocení patologie*. Drahé fundus kamery.
* **Biometrické** — cílem je *identifikace*, *střední rozlišení*, *rychlý sken*. Kompaktní kamery, automatizované.

Existuje i určité prolínání: **chytré fundus kamery** kombinují diagnostiku diabetické retinopatie s biometrickou identifikací.

---

*Zdroj: BIO přednášky 2025/26, BIO — Rozpoznávání podle duhovky a sítnice (Drahanský, Semerád). Externí reference: Daugman, J.: *How Iris Recognition Works* (IEEE T-CSVT 2004) — [PDF](https://www.cl.cam.ac.uk/~jgd1000/csvt.pdf); Bowyer, K. W., Hollingsworth, K., Flynn, P. J.: *Image Understanding for Iris Biometrics: A Survey* (CVIU 2008); STRaDe @ FIT VUT — [strade.fit.vutbr.cz](https://strade.fit.vutbr.cz/).*
