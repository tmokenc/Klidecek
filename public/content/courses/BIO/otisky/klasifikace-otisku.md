---
title: Klasifikace otisků prstů — Henry, Ridge count
---

# Klasifikace otisků prstů — Henry, Ridge count

Pro **efektivní vyhledávání** v databázi miliónů otisků není možné porovnávat *každý* s každým. Klasifikační systémy redukují search space — *předfiltrují* kandidáty podle *globálního typu* otisku, pak provádí *detailní* porovnání jen v relevantní podmnožině.

## Globální vzory

Tři základní (a jejich kombinace) — **Galton class** (1892):

::: svg "Tři základní vzory otisků prstů: oblouky (arches) — bez delta, smyčky (loops) — 1 delta, závity (whorls) — 2+ delta."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="30" y="40" width="150" height="130" rx="8"/>
    <rect x="195" y="40" width="150" height="130" rx="8"/>
    <rect x="360" y="40" width="150" height="130" rx="8"/>
  </g>
  <g stroke="var(--text)" stroke-width="1.5" fill="none">
    <path d="M50,140 C70,100 90,80 105,80 C120,80 140,100 160,140"/>
    <path d="M55,150 C75,110 95,90 105,90 C115,90 135,110 155,150"/>
    <path d="M60,160 C80,120 100,100 105,100 C110,100 130,120 150,160"/>
    <path d="M210,160 C235,90 255,80 280,90 C295,98 305,140 320,160"/>
    <path d="M215,150 C240,100 260,90 280,100 C295,108 305,150 325,160"/>
    <path d="M220,140 C245,110 265,100 280,110 C295,118 305,160 330,160"/>
  </g>
  <g stroke="var(--text)" stroke-width="1.5" fill="none">
    <circle cx="435" cy="110" r="20"/>
    <circle cx="435" cy="110" r="14"/>
    <circle cx="435" cy="110" r="8"/>
    <path d="M390,160 C400,140 410,130 415,128"/>
    <path d="M480,160 C470,140 460,130 455,128"/>
  </g>
  <g fill="var(--accent)" font-size="11" text-anchor="middle">
    <circle cx="105" cy="80" r="3" fill="var(--accent)"/>
    <circle cx="280" cy="90" r="3" fill="var(--accent)"/>
    <text x="295" y="100">δ</text>
  </g>
  <g fill="var(--text)" font-size="12" text-anchor="middle">
    <text x="105" y="65">Arch (oblouk)</text>
    <text x="270" y="65">Loop (smyčka)</text>
    <text x="435" y="65">Whorl (závit)</text>
    <text x="105" y="190" fill="var(--text-muted)" font-size="10">0 delta, 0 core</text>
    <text x="270" y="190" fill="var(--text-muted)" font-size="10">1 delta, jeden core</text>
    <text x="435" y="190" fill="var(--text-muted)" font-size="10">2 delta, plný / spirální závit</text>
  </g>
</svg>
:::

### Klíčové body

* **Core** (jádro) — *centrální* bod ridges; vrchol "loop".
* **Delta** (delta point) — *trojúhelníkový* bod, kde se setkávají tři směry ridges.

### Arch (oblouk) — ~5 % populace

* Ridges *plynou napříč* obrazem od jedné strany ke druhé bez vytvoření smyčky.
* **0 delta, 0 nebo 1 core**.
* Sub-types:
  * **Plain arch** — pozvolný oblouk.
  * **Tented arch** — *ostřejší* obrátka uprostřed.

### Loop (smyčka) — ~65 % populace

Nejčastější typ. Ridges *vstupují* z jedné strany, vytvoří smyčku, *vystupují* ze stejné strany.

* **1 delta, 1 core**.
* Sub-types:
  * **Radial loop** — smyčka směřuje k *radius* kosti (k palci).
  * **Ulnar loop** — smyčka směřuje k *ulna* kosti (k malíčku).

### Whorl (závit) — ~30 % populace

Ridges *kroutí* okolo centrálního bodu.

* **2+ delta, 1 core (nebo více)**.
* Sub-types:
  * **Plain whorl** — koncentrické kruhy.
  * **Central pocket loop** — kruh uprostřed smyčky.
  * **Double loop** — dvě protilehlé smyčky.
  * **Accidental** — nestandardní kombinace.

### Composite — kompozitní typy

* **Tented arch + loop**.
* **Double loop + whorl**.
* ~5 % populace nemá jednoznačný typ.

::: viz henry-pattern-classifier "Vyberte vzor (arch/loop/whorl) a 10-prstovou kombinaci; spočte se Henry primary."
:::

## Henry Classification System

**Sir Edward Henry** (Indie/Britský Egypt, 1897) zavedl systematickou klasifikaci pro **10 otisků** (všech prstů) najednou.

### Algoritmus

Pro každý z 10 prstů:

* **Whorl** = 1.
* **Loop / Arch** = 0.

Pak váhováný součet (podle pozice). Poziční váhy: prsty 1–2 = 16, 3–4 = 8, 5–6 = 4, 7–8 = 2, 9–10 = 1.

Schéma:

::: math
\text{Henry primary} = \frac{(P_2 + P_4 + P_6 + P_8 + P_{10}) + 1}{(P_1 + P_3 + P_5 + P_7 + P_9) + 1}
:::

* $P_i = 0$ pro arch/loop, $= 2^{\lfloor (10-i)/2 \rfloor}$ pro whorl.
* Result: zlomek mezi 1/32 a 32/1.

* 1 024 *primary classes* — significant reduction search space.

V *modern AFIS* systémech je Henry classification *automatizovaná* — počítač detekuje pattern.

## Ridge count

**Ridge count** je *počet ridges* mezi *core* a *delta*.

* Pro každý prst: spočítej ridges *protínané* přímkou mezi core a delta.
* **Standardizovaná** metoda; výsledné číslo používáno pro *sub-classification*.

### Použití

* Druhý úrovní fragment Henry classification.
* AFIS *uses ridge count* jako secondary attribute pro candidate ranking.

## Markanty (minutiae) — viz [[markanty]]

Vedle globálního vzoru existují *lokální* charakteristiky — **markanty** (minutiae), což jsou specifické body kde ridges *začínají*, *končí*, *rozdvojují* atd. Markanty jsou *primary* feature pro detailní matching.

## Klasifikace v AFIS

Automatic Fingerprint Identification System (AFIS) provádí:

1. **Image acquisition** + preprocessing.
2. **Pattern classification** (Henry global type) — *coarse filter*.
3. **Minutiae extraction** ([[markanty]]).
4. **Search v databázi** v *přibližně 1/3 - 1/10* records (díky classification).
5. **Detailní matching** přes minutiae.

Pro databázi $10^9$ otisků (FBI NGI), classification redukuje search z $10^9$ na ~$10^8$ candidates.

## Limity klasifikace

* **~3–5 % otisků** je *ambiguous* (na hranici mezi typy). Manuální posouzení vyžadováno.
* **Latent prints** (partial otisky) — *nelze* jednoznačně klasifikovat. AFIS jede *bez* classification.
* **Children's prints** — nevyzrálé vzory.
* **Damaged prints** — jizvy překryjí globální pattern.

## Moderní AFIS bez klasifikace

S rostoucími computational resources některé systémy *opustily* Henry classification:

* **DL-based AFIS** — Deep learning embeddings; *no manual* classification.
* **Indexing přes minutiae triplets** — Z. Cao et al., RANSAC-based matching s LSH (locality-sensitive hashing).

Klasifikace zůstává *užitečná* pro *forenzní* identification (lidský expert poskytuje classification jako *priori*).

---

*Zdroj: BIO přednášky 2025/26, BIO 5 — Rozpoznávání podle otisků prstů (Drahanský). Externí reference: Maltoni, D., Maio, D., Jain, A. K., Prabhakar, S.: *Handbook of Fingerprint Recognition* (2nd ed., Springer 2009), kap. 5; Henry, E. R.: *Classification and Uses of Finger Prints* (1900); Galton, F.: *Finger Prints* (1892); FBI: *Henry classification system* — [historical](https://www.fbi.gov/services/cjis/fingerprints-and-other-biometrics).*
