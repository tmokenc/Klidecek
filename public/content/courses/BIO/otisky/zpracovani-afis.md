---
title: Zpracování otisku a AFIS
---

# Zpracování otisku a AFIS

Plně automatizovaný pracovní postup (workflow) rozpoznání otisku — od surového snímku (raw image) ze senzoru až po rozhodnutí o shodě (match decision) v databázi miliónů otisků. **AFIS** (Automated Fingerprint Identification System) je *kompletní systém* zahrnující senzory, zpracování obrazu (image processing), srovnávací jádro (matching engine), databáze a správu celého procesu (workflow management).

## Pipeline zpracování

::: svg "Pipeline: snímek → enhancement → binarization → thinning → minutiae detection → matching → result."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aAFIS" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="10" y="60" width="70" height="40" rx="4"/>
    <rect x="90" y="60" width="70" height="40" rx="4"/>
    <rect x="170" y="60" width="70" height="40" rx="4"/>
    <rect x="250" y="60" width="70" height="40" rx="4"/>
    <rect x="330" y="60" width="80" height="40" rx="4"/>
    <rect x="420" y="60" width="60" height="40" rx="4"/>
    <rect x="170" y="150" width="160" height="40" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="45" y="85">snímek</text>
    <text x="125" y="85">enhance</text>
    <text x="205" y="85">binarize</text>
    <text x="285" y="85">thinning</text>
    <text x="370" y="85">minutiae</text>
    <text x="450" y="85">match</text>
    <text x="250" y="175">DB šablon</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aAFIS)">
    <path d="M80,80 L88,80"/>
    <path d="M160,80 L168,80"/>
    <path d="M240,80 L248,80"/>
    <path d="M320,80 L328,80"/>
    <path d="M410,80 L418,80"/>
    <path d="M250,150 L420,102"/>
  </g>
</svg>
:::

## 1. Vylepšení obrazu (image enhancement)

Surový snímek ze senzoru má *nízkou kvalitu*: malý kontrast, šum a přerušené hřebeny papilárních linií (gaps in ridges).

### Gaborův filtr (Gabor filter)

Standardní nástroj pro vylepšení snímku otisku. **Gaborův filtr** je směrový pásmový filtr (bandpass filter), tedy filtr, který propouští jen určité prostorové frekvence v určitém směru:

::: math
G(x, y; \theta, f) = \exp\left(-\frac{x'^2 + y'^2}{2\sigma^2}\right) \cdot \cos(2\pi f x')
:::

* $\theta$ — orientace filtru (odpovídá lokální orientaci hřebenů).
* $f$ — frekvence (odpovídá lokální hustotě hřebenů).
* $\sigma$ — sigma Gaussovy obálky (Gaussian envelope).

Postup aplikace:

1. **Výpočet pole orientací (orientation field)** — pro každý pixel odhadni *lokální orientaci hřebene* pomocí analýzy gradientu.
2. **Výpočet pole frekvencí (frequency field)** — lokální frekvence hřebenů (typicky 7–15 pixelů na jeden hřeben).
3. **Aplikace Gaborova filtru** — *směrově specifická*; filtr je přizpůsoben *lokálním* parametrům.

Výsledek: výrazné zlepšení čitelnosti hřebenů a zaplnění přerušených míst.

::: viz gabor-ridge-enhance "Nastavte orientaci a frekvenci Gaborova filtru a sledujte, jak zostří obraz hřebenů."
:::

### Vylepšení ve frekvenční oblasti (FFT-based enhancement)

Alternativní přístup: vylepšení ve *frekvenční oblasti* (frequency domain).

* FFT snímku → horní propust (high-pass filter) → inverzní FFT.
* Méně zohledňuje směr hřebenů než Gaborův filtr, zato je rychlejší.

## 2. Segmentace (segmentation)

Identifikace *oblasti otisku* (popředí, foreground) oproti *pozadí* (background) — tedy plochy mimo prst a šumu.

* **Na základě rozptylu (variance-based)** — vysoký rozptyl = popředí (hřebeny); nízký rozptyl = pozadí (hladká plocha).
* **Na základě koherence (coherence-based)** — dobře definovaná orientace = popředí.

Výstup: *binární maska* pouze s hřebeny.

## 3. Binarizace (binarization)

Převod z odstínů šedi (grayscale) na binární obraz (černé hřebeny, bílá údolí mezi nimi).

* **Adaptivní prahování (adaptive thresholding)** — Otsuova metoda počítaná pro každý lokální blok.
* **Průměrovací filtr a práh (mean filter + threshold)** — jednoduché, ale funkční.

## 4. Ztenčování / skeletonizace (thinning / skeletonization)

Redukce *každého hřebene* na linii *širokou jeden pixel* (kostru, skeleton).

* **Algoritmus:** iterativní mazání hraničních pixelů (Zhang-Suen 1984).
* Standardní předzpracování pro extrakci markantů (minutiae).

## 5. Extrakce markantů (minutiae extraction)

Viz [[markanty]]. Stručně:

* Pro každý pixel na kostře spočti **číslo křížení (crossing number, CN)**.
* CN = 1 → ukončení hřebene (ridge ending). CN = 3 → větvení (bifurcation).
* Následné zpracování: odfiltrování nepravých markantů (falešné kvůli okrajovým efektům a šumovým artefaktům).

## 6. Srovnávání (matching)

Viz [[markanty]]. Algoritmus zarovnání (alignment) a hledání odpovídajících si markantů (minutiae correspondence).

## 7. Rozhodnutí (decision)

Skóre > práh → shoda.

## AFIS — architektura pro velký rozsah (large-scale)

**Automated Fingerprint Identification System** je systémová implementace pro nasazení ve *velkém rozsahu* (large-scale).

### Komponenty

* **Pracoviště pro registraci (enrollment workstation)** — sejme všech 10 prstů a fotografii a propojí je s identitou osoby.
* **Databáze** — centralizované úložiště šablon.
* **Srovnávací jádro (matcher engine)** — srovnávání s vysokou propustností (1000+ porovnání za sekundu).
* **Pracoviště odborníka (examiner workstation)** — pro *lidskou kontrolu* kandidátů navržených systémem AFIS.
* **Pracoviště pro latentní otisky (latent fingerprint workstation)** — pro forenzní vyhledávání latentních otisků.

### Provozní režimy (operational modes)

* **Vyhledávání podle deseti prstů (tenprint search)** — kompletní registrace 10 prstů proti databázi. Používá se pro *prověrky osob* (background checks) a kriminální záznamy.
* **Latentní vyhledávání (latent search)** — *částečný jeden* otisk z místa činu proti databázi. Používá se ve forenzním vyšetřování.
* **Verifikace (verification)** — kontrola otisku 1:1 (např. vstup při hraniční kontrole).
* **Identifikace (identification)** — porovnání 1:N (např. identifikace podezřelého).

### Významná nasazení AFIS

| Systém | Region | Velikost |
| :--- | :--- | :---: |
| **FBI NGI** | USA | 150+ miliónů |
| **Aadhaar UIDAI** | Indie | 1,3 mld (s duhovkou + obličejem) |
| **EU Eurodac** | EU | ~6 miliónů (žadatelé o azyl) |
| **INTERPOL AFIS** | Mezinárodní | 200 000+ |
| **UK IDENT1** | UK | 8 miliónů |
| **DPMB** (policie ČR) | ČR | ~1 milión |

## Zpracování latentních otisků (latent fingerprint processing)

Forenzní případ užití — *částečný, nekvalitní* otisk z místa činu.

### Pracovní postup

1. **Snímání na místě činu (crime scene capture)** — policejní technici vyvolají latentní otisk (práškem nebo chemicky).
2. **Digitalizace** — sken 1000 dpi, kamera s vysokým rozlišením.
3. **Ruční posouzení kvality** — odborník posoudí, zda je otisk použitelný.
4. **Extrakce příznaků (feature extraction)** (často ruční) — odborník *označí* markanty.
5. **Vyhledání v AFIS** — automaticky vytvořený seznam kandidátů (top 20).
6. **Ruční porovnání** — odborník porovná otisk *vedle sebe* (side-by-side) s každým kandidátem.
7. **Rozhodnutí** — *identifikace* / *vyloučení* / *neprůkazné*.

### Limity

* **Částečné pokrytí (partial coverage)** — typicky < 50 % celého prstu.
* **Zkreslení (distortion)** — vlivem přítlaku a zakřivení povrchu.
* **Vzory pozadí (background patterns)** — podklad (kresba dřeva, textilie) ruší obraz.
* **Subjektivní zkreslení (subjective bias)** — *očekávání* odborníka může ovlivnit rozhodnutí (zpráva NAS 2009).

## NGI — Next Generation Identification

Modernizovaný AFIS od FBI (od roku 2011):

* **IAFIS** (1999) nahrazen systémem **NGI** (2011).
* Přidává:
  * **Rozpoznávání obličeje** (algoritmy testované v rámci FRVT).
  * **Rozpoznávání duhovky** (omezeně).
  * **Otisky dlaní (palmprints)** — zvýšená rozpoznávací schopnost.
* **Repository of Individuals of Special Concern** (RISC) — rychlé vyhledávání proti seznamu známých teroristů.

## Standardy

* **ANSI/NIST-ITL 1-2011** — formát pro výměnu dat.
* **ISO/IEC 19794-2:2011** — výměna markantů (minutiae interchange).
* **EBTS** (FBI Electronic Biometric Transmission Specification) — protokol pro komunikaci mezi FBI a státy a okresy.
* **ENFSI** (European Network of Forensic Science Institutes) — směrnice.

## Metriky výkonu (performance metrics)

Benchmark NIST FpVTE 2023:

* **Vedoucí dodavatel:** ~0,05 % FNMR při FMR = 0,01 % pro *vyhledávání podle deseti prstů (tenprint search)* proti databázi 100 miliónů záznamů.
* **Srovnávání latentních otisků:** ~50–70 % úspěšnost zásahu na první pozici (rank-1 hit rate), silně závisí na kvalitě otisku.

## Trendy 2025

* **Hluboké učení (deep learning)** — příznaky z hlubokého učení nahrazují u některých aplikací srovnávání založené na markantech.
* **Bezdotykové snímání (touchless capture)** — kvalitnější a hygieničtější registrace.
* **Mobilní AFIS** — příruční zařízení pro nasazení v terénu.
* **AFIS chránící soukromí (privacy-preserving AFIS)** — zrušitelné biometriky (cancelable biometrics) a plně homomorfní šifrování (fully homomorphic encryption).

---

*Zdroj: BIO přednášky 2025/26, BIO 5 — Rozpoznávání podle otisků prstů (Drahanský). Externí reference: Maltoni, D., Maio, D., Jain, A. K., Prabhakar, S.: *Handbook of Fingerprint Recognition* (2nd ed., Springer 2009); FBI: *Integrated Automated Fingerprint Identification System (IAFIS)* — [fbi.gov](https://www.fbi.gov/services/cjis/fingerprints-and-other-biometrics); NIST FpVTE — [nist.gov/programs-projects/fingerprint-vendor-technology-evaluation-fpvte](https://www.nist.gov/programs-projects/fingerprint-vendor-technology-evaluation-fpvte); National Research Council: *Strengthening Forensic Science in the United States: A Path Forward* (NAS 2009).*
