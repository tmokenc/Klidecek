---
title: Daugmanův algoritmus pro duhovku
---

# Daugmanův algoritmus pro duhovku

**John Daugman** (Cambridge University, 1993) navrhl algoritmus pro **zakódování duhovky (encoding)** do *2048bitového kódu duhovky (iris code)*. Tento algoritmus je dodnes *zlatým standardem* — používá ho většina komerčních systémů pro rozpoznávání podle duhovky (iris recognition), například Iridian Technologies, IriTech, Aware nebo Tascent. Daugmanův algoritmus umožňuje *extrémně přesnou* identifikaci i s libovolně velkou databází.

## Zpracovatelská linka (pipeline) algoritmu

::: svg "Daugman pipeline: snímání → lokalizace duhovky (integro-diferenční operátor) → normalizace (rubber sheet) → Gaborova demodulace → kód duhovky (2048 bitů) → Hammingova vzdálenost."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="10">
  <defs>
    <marker id="aDG" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="10" y="60" width="70" height="40" rx="4"/>
    <rect x="90" y="60" width="90" height="40" rx="4"/>
    <rect x="190" y="60" width="90" height="40" rx="4"/>
    <rect x="290" y="60" width="100" height="40" rx="4"/>
    <rect x="400" y="60" width="80" height="40" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="45" y="78">capture</text>
    <text x="45" y="92" font-size="9" fill="var(--text-muted)">NIR image</text>
    <text x="135" y="78">lokalizace</text>
    <text x="135" y="92" font-size="9" fill="var(--text-muted)">int.-dif. op.</text>
    <text x="235" y="78">normalizace</text>
    <text x="235" y="92" font-size="9" fill="var(--text-muted)">rubber sheet</text>
    <text x="340" y="78">Gabor demod.</text>
    <text x="340" y="92" font-size="9" fill="var(--text-muted)">2048 bit code</text>
    <text x="440" y="78">match</text>
    <text x="440" y="92" font-size="9" fill="var(--text-muted)">Hamming dist.</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aDG)">
    <path d="M80,80 L88,80"/>
    <path d="M180,80 L188,80"/>
    <path d="M280,80 L288,80"/>
    <path d="M390,80 L398,80"/>
  </g>
</svg>
:::

## 1. Snímání (capture)

* **NIR kamera** (snímání v blízké infračervené oblasti, 700–900 nm) — světlo je pro člověka neviditelné, ale odhalí strukturu duhovky i u *tmavých* duhovek.
* **Rozlišení:** minimálně 200 pixelů napříč duhovkou (typicky obraz 640 × 480).
* **Vzdálenost:** 10–60 cm (klasicky), nově až 5 m (rozšířený dosah).

## 2. Lokalizace duhovky

Cíl: najít *vnitřní* hranici (vůči zornici, pupile) a *vnější* hranici duhovky (vůči bělimě, scléře).

### Integro-diferenční operátor (integro-differential operator)

Daugmanův klíčový přínos. Operátor hledá *kruhovou* hranici, kde je *radiální gradient* (změna jasu ve směru poloměru) maximální:

::: math
\max_{(r, x_0, y_0)} \left| G_\sigma(r) * \frac{\partial}{\partial r} \oint_{r, x_0, y_0} \frac{I(x, y)}{2\pi r} ds \right|
:::

* $I(x, y)$ — intenzita (jas) obrazu.
* Křivkový integrál $\oint$ je *kruhová* kontura se středem $(x_0, y_0)$ a poloměrem $r$.
* Operátor hledá *konturu*, kde se průměrný jas obrazu prudce mění v závislosti na $r$.
* $G_\sigma$ je Gaussovo vyhlazovací jádro (kernel).

Dvě použití:

1. **Hranice zornice (pupilární hranice)** — *malý* poloměr, *vysoký kontrast*.
2. **Hranice bělimy (sclerální hranice)** — *velký* poloměr, *nízký kontrast*.

### Detekce víček

Operátor také hledá *víčka (eyelids)*, která mají tvar paraboly → ta se v oblasti duhovky maskují (vyřadí z dalšího zpracování).

## 3. Normalizace — model pružné plachty (rubber-sheet model)

::: svg "Rubber sheet: 2D plocha duhovky (kartézské souřadnice x-y) → 1D radiální profil (polární souřadnice r-θ), normalizovaný na pevnou velikost."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="rgba(150,200,230,0.3)" stroke="var(--accent)" stroke-width="1.3">
    <circle cx="100" cy="100" r="60"/>
  </g>
  <g fill="rgba(80,80,80,0.7)" stroke="var(--accent)" stroke-width="1.3">
    <circle cx="100" cy="100" r="22"/>
  </g>
  <g fill="rgba(150,200,230,0.3)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="240" y="60" width="220" height="80" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11">
    <text x="100" y="180">Cartesian (x, y)</text>
    <text x="100" y="195" font-size="9" fill="var(--text-muted)">iris area</text>
    <text x="350" y="180">Polar (r, θ)</text>
    <text x="350" y="195" font-size="9" fill="var(--text-muted)">unrolled, 64 × 512</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none" marker-end="url(#aDG)">
    <path d="M170,100 L235,100"/>
  </g>
</svg>
:::

Duhovka se *rozvine* z 2D kruhové plochy do **1D polárních souřadnic**:

::: math
I(x, y) \to I(r, \theta)
:::

kde:

* $r \in [0, 1]$ je normalizovaný poloměr (0 = zornice, 1 = bělima).
* $\theta \in [0, 2\pi)$ je úhel.

Klíčová vlastnost **modelu pružné plachty**:

* **Rozšíření zornice (pupil dilation)** mění poměr $r_{\text{iris}} / r_{\text{pupil}}$ — ale **normalizovaný polární obraz** zůstává *stejný*.
* Tím se automaticky kompenzuje **deformace způsobená změnou velikosti zornice (pupillary deformation)**.

Výstup: **polární obraz duhovky o rozměru 64 × 512**.

## 4. Gaborova demodulace (Gabor demodulation)

Daugmanův nejdůležitější přínos. Aplikuje **2D Gaborovy vlnky (wavelets)**:

::: math
G(r, \theta) = \exp\left(-\frac{(r - r_0)^2}{\alpha^2}\right) \exp\left(-\frac{(\theta - \theta_0)^2}{\beta^2}\right) \exp(-i\omega(\theta - \theta_0))
:::

* Reálná část: $\cos(\omega \theta)$ — *sudá* složka.
* Imaginární část: $-\sin(\omega \theta)$ — *lichá* složka.

Konvoluce s každým Gaborovým jádrem (kernel) → komplexní odezva $h$. Ta se **kvantuje** podle fáze:

::: math
\text{bit}_{Re} = \begin{cases} 1 & \text{if } \text{Re}(h) > 0 \\ 0 & \text{else} \end{cases}, \quad \text{bit}_{Im} = \begin{cases} 1 & \text{if } \text{Im}(h) > 0 \\ 0 & \text{else} \end{cases}
:::

Po 1024 Gaborových jádrech (různé pozice a frekvence) vznikne **2048bitový kód duhovky**.

Každý bit je *robustní*: drobné změny v obraze nezmění *znaménko fáze* (mění jen velikost odezvy). Právě proto je Daugmanův kód *velmi* stabilní napříč různými snímáními.

## 5. Porovnávání (matching) — Hammingova vzdálenost

Pro porovnání dvou kódů duhovky $a, b$ slouží:

::: math
HD = \frac{1}{N} \sum_{i=1}^N (a_i \oplus b_i) \cdot m_i
:::

* $\oplus$ — XOR.
* $m_i$ — *maskovací bit (mask bit)* (1, pokud mají oba kódy na této pozici platná data; 0, pokud je pozice maskována kvůli víčku, odlesku nebo šumu).
* $N$ — počet platných bitů.

**Hammingova vzdálenost** = procento bitů, které se liší:

* HD = 0 → totožné kódy (v praxi nemožné, dokonce ani u téhož oka při různých snímcích).
* HD = 0,5 → náhodné kódy (nezávislé).
* HD < 0,32 → *shoda (match)* (standardní prahová hodnota).

### Rozložení pravých a podvržených shod (genuine vs. impostor)

* **Pravá shoda (stejné oko, různá snímání):** HD ~ 0,10 (průměr), σ ~ 0,05.
* **Nepravá shoda (různá oči):** HD ~ 0,50 (průměr), σ ~ 0,032.

**Extrémní oddělení** — obě rozdělení se prakticky *nepřekrývají*. Daugman ([*Probing the Uniqueness and Randomness of IrisCodes* 2006](https://www.cl.cam.ac.uk/~jgd1000/proceedings.pdf)) odhadl míru chybného přijetí (FAR) < $10^{-12}$ pro HD < 0,30.

::: viz daugman-iris-code "Pět fází Daugmanovy pipeline a Hammingova vzdálenost pro pravé vs. podvržené shody."
:::

## Ošetření rotace (rotation handling)

Kód duhovky se *počítá v polárních souřadnicích*. *Natočení* oka (náklon hlavy) odpovídá *cyklickému posunu (circular shift)* kódu duhovky.

* Při porovnávání se *opakovaně* zkoušejí různé posuny: $-8, -7, ..., +7, +8$ pixelů.
* Minimální HD přes všechny posuny → konečné skóre.

## Standard kódu duhovky

* **Daugmanův kód** je *de facto* standard, ale není to standard ISO.
* **ISO/IEC 19794-6:2011** — *Biometric data interchange formats — Part 6: Iris image data*. Standardizuje *formát obrazu*, nikoli samotný kód duhovky.
* **Iridian / IriTech / Tascent** používají proprietární formáty kódu; *interoperabilita* je proto omezená.

## Systémy pro rozpoznávání podle duhovky

### Databáze CASIA Iris

* Chinese Academy of Sciences.
* Více datových sad (CASIA-Iris v1/v2/v3/v4/Thousand) — celkem desítky tisíc snímků.
* *Standardní* akademický benchmark.

### Kód duhovky v reálných systémech

* **Hraniční kontrola v SAE (UAE iris border control)** (nasazeno od roku 2002) — FAR 1 ku 23 milionům.
* **Indický systém Aadhaar** — využívá duhovku pro hromadnou registraci.
* **Bankomaty Bank of America** — pilotní provoz 2019.
* **Worldcoin** — kontroverzní hromadné skenování duhovek od roku 2022.

## Výkonnostní benchmarky

NIST **IREX** (Iris Exchange):

* **Nejlepší algoritmy:** FRR (míra chybného odmítnutí) < 0,1 % při FAR = $10^{-5}$.
* **Demografické vlivy:** minimální (u duhovky na rozdíl od obličeje není významné zkreslení podle pohlaví ani rasy).
* **Stárnutí:** velmi stabilní.

## Limity Daugmanova algoritmu

* **Kvalita obrazu** — rozostření nebo rozmazání pohybem zhoršuje kód.
* **Plocha duhovky** — u některých lidí je malá; méně bitů → nižší přesnost.
* **Stažení zornice (pupil constriction)** — extrémní rozšíření nebo stažení může protáhnout pružnou plachtu za hranice předpokladů modelu.
* **Kontaktní čočky** — vzorované kosmetické čočky mohou duhovku zcela zakrýt.
* **Patologie** — diabetická retinopatie či glaukom mohou ovlivnit i duhovku.

## Alternativní algoritmy pro duhovku

* **Wildes 1997** — Houghova transformace pro lokalizaci, vícestupňové (multi-scale) porovnávání.
* **Boles-Boashash 1998** — průchody nulou (zero-crossings) ve vlnkové (wavelet) reprezentaci.
* **Ma a kol. 2004** — texturní lokální binární vzory (local binary patterns).
* **Moderní hluboké učení (DL)** — vnoření duhovky (embeddings) založená na konvolučních sítích (CNN); používají se v některých komerčních systémech, ale Daugmanův přístup stále dominuje.

## Čím je Daugmanův algoritmus tak dobrý

* **Matematická preciznost** — čistá formulace a statistická analýza podložená empirickými daty.
* **Robustnost** — kódování založené na fázi je necitlivé vůči šumu.
* **Rychlost** — porovnání jedné šablony (template) v *mikrosekundách*.
* **Škálovatelnost** — proveditelné jsou miliardy porovnání.
* **Desítky let ověřování** — rozsáhlé nasazení bez chybných shod.

---

*Zdroj: BIO přednášky 2025/26, BIO — Rozpoznávání podle duhovky a sítnice (Drahanský, Semerád). Externí reference: Daugman, J.: *High Confidence Visual Recognition of Persons by a Test of Statistical Independence* (IEEE PAMI 1993); Daugman, J.: *How Iris Recognition Works* (IEEE T-CSVT 2004) — [PDF](https://www.cl.cam.ac.uk/~jgd1000/csvt.pdf); Daugman, J.: *Probing the Uniqueness and Randomness of IrisCodes* (Proc. IEEE 2006); CASIA iris database — [biometrics.idealtest.org](http://biometrics.idealtest.org/); NIST IREX — [nist.gov/programs-projects/iris-exchange-irex-overview](https://www.nist.gov/programs-projects/iris-exchange-irex-overview).*
