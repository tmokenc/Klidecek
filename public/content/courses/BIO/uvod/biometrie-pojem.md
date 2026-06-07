---
title: Pojem biometrie
---

# Pojem biometrie

**Biometrie** (z řeckého *bios* = život + *metron* = měřítko) je věda o měření a analýze biologických a behaviorálních rysů osob. V IT kontextu (ISO/IEC JTC 1/SC37) je *biometrie* **automatické rozpoznávání jednotlivců** na základě jejich charakteristických anatomických rysů (obličej, otisk prstu, duhovka, sítnice, DNA) a chování (podpis, hlas, chůze, dynamika klávesnice).

## Klíčové pojmy

* **Biometrická charakteristika** (biometric characteristic) — biologická nebo behaviorální vlastnost jednotlivce, kterou lze *detekovat* a ze které lze získat *opakovatelné* biometrické rysy pro účely automatického rozpoznávání. Příklady: papilární linie, geometrie obličeje, vzor duhovky.
* **Biometrický rys** (biometric feature) — *numerická* reprezentace charakteristiky vypočtená z naměřených dat. Např. souřadnice 50 markantů na otisku, 2048bitový kód duhovky (Daugman), 128rozměrný vektor příznaků obličeje (embedding, FaceNet).
* **Biometrická šablona** (biometric template) — *uložená* sada rysů konkrétní osoby; používá se při ověřování porovnáním s aktuálně naměřenými rysy.
* **Biometrický vzorek** (biometric sample) — naměřená data (obraz, zvuk, časová řada), z nichž se rysy extrahují.

## Klasifikace biometrik

::: svg "Klasifikace biometrik: fyziologické (statické — anatomie) vs. behaviorální (dynamické — chování)."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="40" width="240" height="160" rx="8"/>
    <rect x="280" y="40" width="240" height="160" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="140" y="62" font-size="12.5">Fyziologické (statické)</text>
    <text x="140" y="78" font-size="10" fill="var(--text-muted)">co jsme — anatomie</text>
    <text x="400" y="62" font-size="12.5">Behaviorální (dynamické)</text>
    <text x="400" y="78" font-size="10" fill="var(--text-muted)">jak konáme — chování</text>
  </g>
  <g fill="var(--text)" text-anchor="start" font-size="10.5">
    <text x="32" y="102">• Otisky prstů, dlaně</text>
    <text x="32" y="120">• Tvar a geometrie obličeje</text>
    <text x="32" y="138">• Duhovka, sítnice</text>
    <text x="32" y="156">• Geometrie ruky, kosti</text>
    <text x="32" y="174">• Krevní řečiště, nehty</text>
    <text x="32" y="192">• DNA, termogram</text>
    <text x="292" y="102">• Hlas / řeč</text>
    <text x="292" y="120">• Podpis (dynamika tlaku, rychlost)</text>
    <text x="292" y="138">• Chůze (gait)</text>
    <text x="292" y="156">• Dynamika klávesnice / myš</text>
    <text x="292" y="174">• Gestikulace, mimika</text>
    <text x="292" y="192">• Reakce na podněty</text>
  </g>
</svg>
:::

### Fyziologické (statické)

Vychází z **anatomie** — relativně stabilní v čase. Vyšší přesnost, ale invazivnější snímání.

* **Otisky prstů, dlaně** — papilární linie. Klasická volba; dnešní mobily.
* **Obličej** — 2D/3D geometrie, struktura tváře.
* **Duhovka, sítnice** — vzor barevné části oka, cévní struktura.
* **Geometrie ruky, kosti** — antropometrické rozměry.
* **Krevní řečiště** — žíly na dlani / prstu (Fujitsu PalmSecure).
* **DNA** — zlatý standard (gold standard) identifikace, ale časově náročná.
* **Termogram obličeje** — infračervený (IR) vzor cévního systému pod kůží.

### Behaviorální (dynamické)

Vychází z **chování** — méně stabilní (mění se s emocemi, věkem, zdravím), ale obvykle *uživatelsky přívětivější*.

* **Hlas / řeč** — spektrální příznaky (spectral features), prozodie, intonace.
* **Podpis (dynamika)** — tlak, rychlost, sklon, zrychlení (digitální pero, e-pen tablet).
* **Chůze** (gait) — video pohybu těla, založené na kostře (skeleton-based).
* **Dynamika klávesnice** (keystroke dynamics) — doba přeletu mezi klávesami (flight time) a doba stisku klávesy (dwell time).
* **Dynamika myši** (mouse dynamics) — pohyb kurzoru, vzory klikání (click patterns).

## Aplikace

* **Spotřebitelská elektronika** — odemykání mobilů (Apple Touch ID, Face ID), čtečky otisků prstů v noteboocích, chytrá domácnost (rozpoznávání obličeje v Nest).
* **Bankovnictví** — autorizace (authorization) plateb (TPay, platba selfie v mobilním bankovnictví), bankomaty s biometrií.
* **Identifikační dokumenty** — biometrické pasy ([[icao-9303]]), občanské průkazy s biometrií, vízum (US-VISIT).
* **Zabezpečení kritické infrastruktury** — datacentra, jaderné elektrárny, vojenské objekty.
* **Pohraniční kontrola** — letiště (eGates), schengenský systém vstupů a výstupů.
* **Forenzní věda** — DNA, otisky prstů, hlas (CIA, FBI, INTERPOL).
* **Zdravotnictví** — identifikace pacientů, prevence pojistných podvodů.
* **Kontrola docházky** — firemní přístupové systémy.

## Vlastnosti dobré biometriky

Pro praktické nasazení musí biometrická charakteristika splňovat (Jain et al. 2007):

* **Univerzálnost** (universality) — má ji *každý* člověk.
* **Jedinečnost** (uniqueness) — *liší se* mezi osobami.
* **Stálost** (permanence) — *nemění se* v čase.
* **Měřitelnost** (collectability) — lze ji *snadno změřit*.
* **Výkonnost** (performance) — *přesnost* a *rychlost* rozpoznávání.
* **Akceptovatelnost** (acceptability) — *přijetí* uživatelem.
* **Odolnost vůči obcházení** (circumvention) — *obtížnost* podvržení (spoofing) ([[antispoofing-face]], [[liveness]]).

Žádná biometrika není dokonalá ve všech kategoriích. Praxe vyžaduje **kompromisy** — otisk prstu je dostupný a stabilní, ale méně přesný než duhovka; obličej je dobře akceptovatelný, ale snadno podvrhnutelný; DNA je zlatý standard, ale pomalá a kontroverzní.

## Biometrika ≠ kryptografie

* **Kryptografie** (kurz KRY) pracuje s *exaktními* hodnotami — klíče se buď shodují, nebo ne.
* **Biometrie** pracuje s *fuzzy* hodnotami — naměřené rysy nikdy nejsou *přesně* stejné; vyžaduje *prahování* a *statistická* rozhodnutí.

Z toho plynou specifické problémy ([[far-frr]], [[roc-det]]):

* **Falešné přijetí** (False Accept) — neoprávněná osoba je akceptována.
* **Falešné odmítnutí** (False Reject) — oprávněná osoba je odmítnuta.
* **Kompromis** (trade-off) mezi oběma — vyšší bezpečnost znamená vyšší míru falešných odmítnutí.

Biometrická data **nelze prostě uložit jako hash** — jejich neostrá (fuzzy) povaha znamená, že hash by nedovolil rozpoznat *stejnou* osobu při různých měřeních (každé měření se totiž mírně liší, takže by vznikl pokaždé jiný hash). Místo toho se používá *fuzzy extractor* (Dodis et al.), biometrický kryptosystém (biometric cryptosystem) nebo zrušitelná biometrika (cancelable biometrics).

## Ochrana soukromí

Biometrika je *neměnná* — pokud unikne, **nelze ji vyměnit** jako heslo:

* Ukradené heslo → změníte je za 5 sekund.
* Uniklý biometrický otisk (např. **útok na Office of Personnel Management v roce 2015** — odcizeno 5,6 milionu otisků prstů federálních zaměstnanců, podezření padlo na aktéry napojené na Čínu) → nové prsty si *nepořídíte*.

Proto musí být biometrická data ukládána s **vyšší ochranou** než hesla:

* **Uložení přímo v zařízení** (on-device storage, Apple Secure Enclave) — data *nikdy* neopustí zařízení.
* **Šifrované šablony** (encrypted templates) — zašifrované algoritmem AES, přičemž klíč (key) je uložen v hardwaru.
* **Zrušitelná biometrika** (cancelable biometrics) — *transformované* šablony, kde lze transformaci při kompromitaci vyměnit.
* **Biometrický kryptosystém** (biometric cryptosystem) — kombinace s kryptografickým klíčem.

Detailně v [[etika-gdpr]].

---

*Zdroj: BIO přednášky 2025/26, BIO 1 — Úvod do biometrických systémů (Goldmann, na základě přednášek M. Drahanského). Externí reference: Jain, A. K., Ross, A., Nandakumar, K.: *Introduction to Biometrics* (Springer 2011) — kanonická reference; ISO/IEC 2382-37:2017 *Information technology — Vocabulary — Part 37: Biometrics*; Drahanský, M. et al.: *Biometrické systémy* (FIT VUT, 2014); IEEE Biometrics Council — [link](https://ieee-biometrics.org/).*
