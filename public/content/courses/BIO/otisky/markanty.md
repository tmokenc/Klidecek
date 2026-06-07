---
title: Markanty (minutiae) — detailní porovnání
---

# Markanty (minutiae) — detailní porovnání

**Markant** (minutia) je *lokální* singulární bod papilárních linií — místo, kde papilární linie (ridge) nestandardně končí, dělí se nebo se propojuje. Markanty jsou *primární rys* (primary feature) pro detailní porovnávání otisků prstů. Jediný otisk obsahuje 30–100 markantů; jejich *pozice*, *orientace* a *typ* dohromady tvoří *jedinečný podpis otisku* (unique fingerprint signature).

## Typy markantů

::: svg "Typy markantů: zakončení linie, rozdvojení, spojitá linie (bez markantu), tečka/ostrov, jezírko (uzavřená oblast), uzavřené jezírko, ostruha, přemostění."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1">
    <rect x="20" y="30" width="120" height="90" rx="4"/>
    <rect x="150" y="30" width="120" height="90" rx="4"/>
    <rect x="280" y="30" width="120" height="90" rx="4"/>
    <rect x="410" y="30" width="120" height="90" rx="4"/>
    <rect x="20" y="130" width="120" height="90" rx="4"/>
    <rect x="150" y="130" width="120" height="90" rx="4"/>
    <rect x="280" y="130" width="120" height="90" rx="4"/>
    <rect x="410" y="130" width="120" height="90" rx="4"/>
  </g>
  <g stroke="var(--text)" stroke-width="1.5" fill="none">
    <path d="M30,75 L70,75"/>
    <path d="M30,90 L70,90"/>
    <path d="M30,60 L70,60"/>
    <path d="M160,82 L195,82 L220,70"/>
    <path d="M195,82 L220,94"/>
    <path d="M290,75 L370,75"/>
    <path d="M290,90 L370,90"/>
    <path d="M420,75 L500,75"/>
    <path d="M420,90 L460,90 M470,90 L500,90"/>
    <path d="M30,185 L55,185 C70,175 90,175 100,185 L130,185"/>
    <path d="M55,185 C70,195 90,195 100,185"/>
    <path d="M160,175 L260,175"/>
    <path d="M160,195 L195,195 C200,205 215,205 220,195 L260,195"/>
    <path d="M290,175 L325,175 L335,165 M345,165 L370,175"/>
    <path d="M290,190 L325,190 L335,200 M345,200 L370,190"/>
    <path d="M420,175 L500,175"/>
    <path d="M420,190 L460,190 L470,180 L500,190"/>
  </g>
  <g fill="var(--accent)" stroke="var(--accent)">
    <circle cx="70" cy="75" r="3" fill="var(--accent)"/>
    <circle cx="195" cy="82" r="3" fill="var(--accent)"/>
    <circle cx="335" cy="80" r="3" fill="var(--accent)"/>
    <circle cx="465" cy="90" r="3" fill="var(--accent)"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="80" y="22">Ridge ending</text>
    <text x="210" y="22">Bifurcation</text>
    <text x="340" y="22">Continuous</text>
    <text x="470" y="22">Dot / island</text>
    <text x="80" y="125">Lake (enclosure)</text>
    <text x="210" y="125">Lake closed</text>
    <text x="340" y="125">Spur (hook)</text>
    <text x="470" y="125">Crossover (bridge)</text>
  </g>
</svg>
:::

### Klíčové markanty

* **Zakončení linie** (ridge ending) — místo, kde papilární linie *končí*. Nejběžnější typ.
* **Rozdvojení** (bifurcation) — papilární linie se *rozděluje na dvě*. Druhý nejčastější.
* **Tečka / ostrov** (dot / island) — *velmi krátká* papilární linie (1–3 body) stojící izolovaně.
* **Jezírko / uzavřená oblast** (lake / enclosure) — papilární linie se *rozdělí a opět spojí* a uzavře tak ohraničenou oblast.
* **Ostruha** (spur, hook) — krátká papilární linie *připojená* k delší linii.
* **Přemostění** (crossover, bridge) — *propojení* dvou rovnoběžných papilárních linií krátkou spojkou.
* **Složený markant** (compound minutia) — kombinace více markantů, např. *trojení* (trifurcation, rozdělení na tři).

### Forenzní vs. automatické rozpoznávání

V **automatizovaných** systémech (AFIS) se obvykle používají jen dva typy:

* **Zakončení linie** (jednoduché ukončení papilární linie).
* **Rozdvojení** (bifurcation).

Důvod: ostatní markanty jsou *vzácnější* a po zpracování obrazu (image processing) bývají často *nejednoznačné*.

Ve **forenzním** kontextu (manuální zkoumání odborníkem) examinátor rozpoznává *všechny* typy markantů a uplatňuje příslušná pravidla.

## Reprezentace markantu

Standard ISO/IEC 19794-2 ukládá markant jako *n-tici* (tuple):

::: math
m = (x, y, \theta, t, q)
:::

* $x, y$ — souřadnice v obraze.
* $\theta$ — orientace (úhel směru papilární linie, 0–360°).
* $t$ — typ (zakončení linie = 0, rozdvojení = 1).
* $q$ — kvalita / míra jistoty (quality / confidence, 0–100).

Typický otisk obsahuje **30–100 markantů**. Formát ISO uloží přibližně $100 \times 6 \text{ B} = 600 \text{ B}$ na jednu šablonu (template).

## Orientace markantů

Orientace je důležitá pro zarovnání otisků (alignment):

* **Zakončení linie:** směr *papilární linie* v jejím koncovém bodě (úhel tečny).
* **Rozdvojení:** směr *centrální papilární linie* (prostřední ze tří).

Standardní zavedení: orientace se udává **ve stupních od 0 do 360**, kde 0 znamená vodorovně doprava a hodnota roste proti směru hodinových ručiček.

## Extrakce markantů — algoritmus

Klasický postup zpracování (pipeline, Maltoni-Maio 1997):

1. **Pořízení obrazu** (image acquisition) — surový obraz ve stupních šedi.
2. **Vylepšení obrazu** (image enhancement) — banky Gaborových filtrů, vylepšení založené na FFT.
3. **Binarizace** (binarization) — černé papilární linie, bílé prohlubně.
4. **Ztenčení** (thinning) — *skeletonizace* papilárních linií na čáry o šířce 1 pixelu.
5. **Detekce markantů** (minutiae detection) — pro každý pixel:
   * Spočítej *číslo křížení* (crossing number, Q. Liu 1996) — počet přechodů 0→1 v okolí 3×3.
   * CN = 1 → *zakončení linie*.
   * CN = 3 → *rozdvojení*.
   * CN = 2 → *spojitá papilární linie* (žádný markant).
6. **Následné zpracování** (post-processing) — odfiltrování falešných markantů:
   * Markanty *příliš blízko u sebe* (< 10 pixelů) → pravděpodobně vznikly ze šumu.
   * Markanty *u okraje obrazu* → nespolehlivé.
   * Markanty *u okraje masky papilárních linií* → artefakt zpracování obrazu.
7. **Hodnocení kvality** (quality assessment) — *skóre kvality* pro každý markant.

## Daktyloskopické porovnání (matching)

### Princip

Mějme dvě sady markantů $T = \{t_1, ..., t_n\}$ (šablona, template) a $I = \{i_1, ..., i_m\}$ (vstup, input). Cílem je najít *maximální počet shod* (matchů).

::: math
\text{match}(t, i) = 1 \iff \begin{cases}
|t.x - i.x| \le \tau_x \\
|t.y - i.y| \le \tau_y \\
|t.\theta - i.\theta| \le \tau_\theta
\end{cases}
:::

Pro dané *zarovnání* (alignment — posun $T_x, T_y$ a rotace $R$):

::: math
N_{\text{matches}} = \sum_{t \in T} \mathbb{1}\left[\exists i \in I : \text{match}(R \cdot t + T, i)\right]
:::

### Algoritmus

1. **Zarovnání** (alignment) — najdi *optimální* posun a rotaci, které maximalizují počet shod.
   * Standardní přístup: **RANSAC** pro robustní odhad.
   * Alternativně: Houghova transformace, ICP (Iterative Closest Point, iterativní hledání nejbližšího bodu).
2. **Skóre shody** (match score) — *normalizovaná* hodnota:

::: math
S = \frac{N_{\text{matches}}^2}{|T| \cdot |I|}
:::

3. **Rozhodnutí** (decision) — $S > \tau$ → shoda (typicky $\tau \in [0.3, 0.5]$).

### Výpočetní složitost

* **Naivní přístup:** $O(n \cdot m)$ na jednu hypotézu o zarovnání.
* **Pro $k$ hypotéz o zarovnání:** $O(k \cdot n \cdot m)$.
* **Optimalizace:** indexované vyhledávání, k-D stromy, locality-sensitive hashing (hashování zachovávající blízkost).

Moderní AFIS zvládne **~1 000 000** porovnání za sekundu na jednom jádře procesoru (single CPU core).

::: viz minutiae-matching "Posuňte posunem/rotací a sledujte počet spárovaných markantů a skóre N²/(|T|·|I|)."
:::

## Pravidlo „12 markantů"

V mnoha jurisdikcích (USA, Velká Británie, Německo) se v soudním řízení vyžaduje **minimálně 12 shodujících se markantů** pro *pozitivní identifikaci* (pravidlo *12 charakteristik papilárních linií*).

* Jde o *konvenci*, nikoli o *empiricky doložený fakt*. Galton roku 1892 odhadoval, že 12 markantů dává míru chybného přijetí (FAR) okolo $10^{-13}$.
* **Moderní AFIS** používá *statistické skórování*, nikoli pevně danou mez.

## Věrohodnostní poměr (likelihood ratio)

Ve *forenzní statistice* se používá *věrohodnostní poměr* (likelihood ratio, LR):

::: math
LR = \frac{P(\text{evidence} | H_p)}{P(\text{evidence} | H_d)}
:::

* $H_p$ — *hypotéza obžaloby* (prosecution hypothesis — otisk zanechal podezřelý).
* $H_d$ — *hypotéza obhajoby* (defense hypothesis — otisk zanechala náhodná osoba).
* **LR > 10⁶** = silný důkaz ve prospěch hypotézy $H_p$.

Moderní forenzní zpráva se formuluje takto: *„Pravděpodobnost, že bychom pozorovali tuto shodu otisků, kdyby otisk nezanechal podezřelý, je přibližně 1 ku N."*

## Limity markantů

* **Obrazy nízké kvality** — málo extrahovaných markantů → nízká přesnost.
* **Latentní otisky** (latent prints) — *částečný* otisk; k dispozici je jen ~30 % markantů.
* **Zkreslení** (distortion) — nepravidelná deformace kůže způsobí *chybná zamítnutí* (false negatives).
* **Podvržení** (spoofing) — falešné prsty s replikovanými markanty.

## Standard ANSI/NIST-ITL

* **ANSI/NIST-ITL 1-2011** — standardizovaný formát pro výměnu daktyloskopických dat.
* *Záznam typu 9* (Record Type 9) obsahuje data o markantech.
* Formát: konkrétní binární rozložení doplněné o ASCII pole.
* Použití: FBI NGI, INTERPOL AFIS, Eurodac.

---

*Zdroj: BIO přednášky 2025/26, BIO 5 — Rozpoznávání podle otisků prstů (Drahanský). Externí reference: Maltoni, D., Maio, D., Jain, A. K., Prabhakar, S.: *Handbook of Fingerprint Recognition* (2nd ed., Springer 2009), kap. 3–4; ISO/IEC 19794-2:2011 *Biometric data interchange formats — Finger minutiae data*; ANSI/NIST-ITL 1-2011 *Data Format for Fingerprint Information Transfer*; Champod, C. et al.: *Fingerprints and Other Ridge Skin Impressions* (2nd ed., CRC Press 2016) — forenzní pohled.*
