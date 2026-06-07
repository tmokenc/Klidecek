---
title: Klasifikace otisků prstů — Henry, počítání papilárních linií (ridge count)
---

# Klasifikace otisků prstů — Henry, počítání papilárních linií (ridge count)

Pro **efektivní vyhledávání** v databázi miliónů otisků není možné porovnávat *každý* s každým. Klasifikační systémy zmenšují prohledávaný prostor (search space) tím, že kandidáty *předfiltrují* podle *globálního typu* otisku, a teprve poté provádějí *detailní* porovnání jen v relevantní podmnožině.

## Globální vzory

Existují tři základní vzory (a jejich kombinace) — tzv. **Galtonovy třídy** (Galton class, 1892):

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
    <circle cx="280" cy="90" r="3" fill="var(--accent)"/>
    <text x="298" y="86">core</text>
    <circle cx="248" cy="135" r="3" fill="var(--accent)"/>
    <text x="236" y="138">δ</text>
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

* **Jádro (core)** — *centrální* bod papilárních linií (ridges); vrchol smyčky („loop").
* **Delta (delta point)** — *trojúhelníkový* bod, kde se setkávají tři směry papilárních linií.

### Arch (oblouk) — ~5 % populace

* Papilární linie *plynou napříč* obrazem od jedné strany ke druhé, aniž by vytvořily smyčku.
* **0 delta, 0 nebo 1 core**.
* Podtypy:
  * **Plain arch** — pozvolný oblouk.
  * **Tented arch** — *ostřejší* obrátka uprostřed.

### Loop (smyčka) — ~65 % populace

Nejčastější typ. Papilární linie *vstupují* z jedné strany, vytvoří smyčku a *vystupují* ze stejné strany.

* **1 delta, 1 core**.
* Podtypy:
  * **Radial loop** — smyčka směřuje ke kosti *radius* (k palci).
  * **Ulnar loop** — smyčka směřuje ke kosti *ulna* (k malíčku).

### Whorl (závit) — ~30 % populace

Papilární linie se *kroutí* okolo centrálního bodu.

* **2+ delta, 1 core (nebo více)**.
* Podtypy:
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

## Henryho klasifikační systém (Henry Classification System)

**Sir Edward Henry** (Indie / Britský Egypt, 1897) zavedl systematickou klasifikaci pro **10 otisků** (všech prstů) najednou.

### Algoritmus

Pro každý z 10 prstů platí:

* **Whorl** = 1.
* **Loop / Arch** = 0.

Poté se spočítá vážený součet (podle pozice prstu). Poziční váhy jsou: prsty 1–2 = 16, 3–4 = 8, 5–6 = 4, 7–8 = 2, 9–10 = 1.

Schéma výpočtu:

::: math
\text{Henry primary} = \frac{(P_2 + P_4 + P_6 + P_8 + P_{10}) + 1}{(P_1 + P_3 + P_5 + P_7 + P_9) + 1}
:::

* $P_i = 0$ pro arch/loop, $= 2^{\lfloor (10-i)/2 \rfloor}$ pro whorl.
* Výsledkem je zlomek mezi hodnotami 1/32 a 32/1.

* Vzniká tak 1 024 *primárních tříd* (primary classes) — což výrazně zmenšuje prohledávaný prostor.

V *moderních systémech AFIS* je Henryho klasifikace *automatizovaná* — počítač detekuje vzor sám.

## Počítání papilárních linií (ridge count)

**Počítání papilárních linií (ridge count)** je *počet papilárních linií* mezi *jádrem (core)* a *deltou*.

* Pro každý prst: spočítej papilární linie *protnuté* přímkou vedenou mezi jádrem a deltou.
* Jde o **standardizovanou** metodu; výsledné číslo se používá pro *doplňkové třídění* (sub-classification).

### Použití

* Slouží jako druhá úroveň zjemnění Henryho klasifikace.
* AFIS *používá počet papilárních linií* jako sekundární atribut pro pořadí kandidátů (candidate ranking).

## Markanty (minutiae) — viz [[markanty]]

Vedle globálního vzoru existují *lokální* charakteristiky — **markanty (minutiae)**, což jsou specifické body, kde papilární linie *začínají*, *končí*, *rozdvojují se* atd. Markanty jsou *hlavní* charakteristikou pro detailní porovnávání (matching).

## Klasifikace v AFIS

Automatický systém identifikace otisků prstů (Automatic Fingerprint Identification System, AFIS) provádí tyto kroky:

1. **Pořízení obrazu (image acquisition)** a předzpracování.
2. **Klasifikace vzoru (pattern classification)** podle globálního typu dle Henryho — funguje jako *hrubý filtr*.
3. **Extrakce markantů** ([[markanty]]).
4. **Vyhledávání v databázi** *přibližně v 1/3 až 1/10* záznamů (díky předchozí klasifikaci).
5. **Detailní porovnání** přes markanty.

Pro databázi $10^9$ otisků (FBI NGI) klasifikace zmenší vyhledávání z $10^9$ na ~$10^8$ kandidátů.

## Limity klasifikace

* **~3–5 % otisků** je *nejednoznačných* (na hranici mezi typy). Je nutné manuální posouzení.
* **Latentní otisky (latent prints)** (částečné otisky) — *nelze* je jednoznačně klasifikovat. AFIS běží *bez* klasifikace.
* **Otisky dětí** — nevyzrálé vzory.
* **Poškozené otisky** — jizvy překryjí globální vzor.

## Moderní AFIS bez klasifikace

S rostoucími výpočetními prostředky (computational resources) některé systémy od Henryho klasifikace *upustily*:

* **AFIS založené na hlubokém učení (DL-based AFIS)** — využívají vektorové reprezentace (embeddings) z hlubokého učení; *žádná manuální* klasifikace.
* **Indexování přes trojice markantů (minutiae triplets)** — Z. Cao et al., porovnávání založené na metodě RANSAC s LSH (locality-sensitive hashing).

Klasifikace zůstává *užitečná* pro *forenzní* identifikaci (lidský expert poskytuje klasifikaci jako *apriorní* informaci).

---

*Zdroj: BIO přednášky 2025/26, BIO 5 — Rozpoznávání podle otisků prstů (Drahanský). Externí reference: Maltoni, D., Maio, D., Jain, A. K., Prabhakar, S.: *Handbook of Fingerprint Recognition* (2nd ed., Springer 2009), kap. 5; Henry, E. R.: *Classification and Uses of Finger Prints* (1900); Galton, F.: *Finger Prints* (1892); FBI: *Henry classification system* — [historical](https://www.fbi.gov/services/cjis/fingerprints-and-other-biometrics).*
