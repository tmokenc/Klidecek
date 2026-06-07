---
title: Biometrická data v pasu
---

# Biometrická data v pasu

Klíčovým rozdílem mezi *klasickým* a *biometrickým* pasem je *digitální obraz* osoby uložený na čipu. Norma ICAO 9303 určuje obraz obličeje (face image) jako *povinný*, kdežto otisky prstů (fingerprints) a duhovku (iris) jako *volitelné* (přičemž v EU jsou otisky prstů povinné). Pochopení jejich formátů, kvality a použitelnosti je nezbytné pro práci s elektronickými cestovními doklady (eMRTD).

## DG2 — obraz obličeje

::: svg "Obsah DG2: hlavička + datový blok obrazu obličeje (JPEG 2000) + metadata podle ICAO."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="40" width="500" height="140" rx="6"/>
  </g>
  <g fill="rgba(150,200,230,0.4)" stroke="var(--accent)" stroke-width="1">
    <rect x="40" y="60" width="120" height="100" rx="3"/>
    <rect x="180" y="60" width="60" height="100" rx="3"/>
    <rect x="260" y="60" width="240" height="100" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11">
    <text x="100" y="115">DG2 header</text>
    <text x="100" y="130" font-size="9" fill="var(--text-muted)">ASN.1 BER</text>
    <text x="210" y="115">FAC header</text>
    <text x="210" y="130" font-size="9" fill="var(--text-muted)">ISO 19794-5</text>
    <text x="380" y="115">JPEG 2000 data</text>
    <text x="380" y="130" font-size="9" fill="var(--text-muted)">~15 KB</text>
  </g>
</svg>
:::

### Formát

* Soubor **DG2** používá kódování ASN.1 BER-TLV.
* Obsahuje blok **FAC** (Face Image Block, blok s obrazem obličeje) podle normy ISO/IEC 19794-5.
* **Uvnitř FAC** je obraz komprimovaný formátem JPEG 2000.

### Požadavky na obraz (ICAO 9303 část 9)

* **Formát:** JPEG 2000 (J2K).
* **Rozlišení:** ≥ 300 dpi.
* **Barvy:** 24bitové RGB.
* **Velikost:** typicky 15–25 KB.
* **Poměr stran:** 3:4 (na výšku).
* **Šířka × výška:** typicky 480 × 640 pixelů.

### Požadavky na fotografii

ICAO 9303 stanovuje *přísná* pravidla pro fotografii:

* **Postoj:** *čelní pohled*, oči směřují do objektivu.
* **Výraz:** *neutrální*, ústa zavřená.
* **Brýle:** povoleny, pokud se neodrážejí; sluneční brýle NE.
* **Pokrývka hlavy:** povolena pouze z náboženských důvodů a obličej musí být plně viditelný.
* **Pozadí:** jednolité, světlé (nejlépe bílé nebo krémové).
* **Osvětlení:** rovnoměrné, bez stínů.
* **Kvalita:** ostrá, bez pixelizace.
* **Aktuálnost:** doporučeno ne starší než 6 měsíců.

Mnoho zemí má *standardy pro fotobudky* a nástroje pro kontrolu fotografie.

### Český požadavek

* **Fotografie při podání žádosti** od fotografa nebo z policejní fotobudky.
* **Pořízení snímku přímo na místě** (live capture) na úřadě je stále běžnější.
* Standardy odpovídají ICAO; pokyny vydává Ministerstvo vnitra ČR.

## DG3 — otisky prstů

::: svg "Obsah DG3: 1 nebo 2 obrazy otisků prstů (typicky ukazováky), komprimované metodou WSQ."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="40" width="500" height="140" rx="6"/>
  </g>
  <g fill="rgba(255,200,150,0.4)" stroke="var(--accent)" stroke-width="1">
    <rect x="40" y="60" width="100" height="100" rx="3"/>
    <rect x="160" y="60" width="100" height="100" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11">
    <text x="90" y="115">left index</text>
    <text x="90" y="130" font-size="9" fill="var(--text-muted)">WSQ, 500 dpi</text>
    <text x="210" y="115">right index</text>
    <text x="210" y="130" font-size="9" fill="var(--text-muted)">WSQ, 500 dpi</text>
  </g>
  <path d="M40 166 H260" stroke="var(--text-muted)" stroke-width="0.8" fill="none"/>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="150" y="176">EAC-protected · ~10–20 KB / image</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="400" y="115">Required EU</text>
    <text x="400" y="130">since 2009</text>
  </g>
</svg>
:::

### Formát

* Soubor **DG3** obsahuje záznam **FIR** (Finger Image Record, záznam obrazu prstu) podle normy ISO/IEC 19794-4.
* **Uvnitř FIR** je obraz komprimovaný metodou **WSQ** (Wavelet Scalar Quantization).
* WSQ je standard FBI pro kompresi otisků prstů.

### Požadavky na obraz

* **Rozlišení:** minimálně 500 dpi.
* **Barvy:** 8bitové stupně šedi.
* **Snímání:** *přiložený* (živý) otisk ze senzoru.
* **Kvalita:** přijatelné skóre NFIQ (typicky ≥ 3).
* **Více prstů:** typicky 2 (levý a pravý ukazovák).

### Český a evropský požadavek

* **Nařízení EU 2252/2004** (a 444/2009) — otisky prstů jsou v pasech zemí EU povinné od roku 2009 (Schengen 2. generace).
* **Děti do 12 let:** výjimka (malé a měnící se prsty).

### Proces snímání

* Na úřadě při podání žádosti:
  * **Živý senzor otisků prstů** (optický nebo kapacitní).
  * **Více vzorků** pro zajištění kvality.
  * **Nejlepší vzorek** se vybere k uložení na čip.
* Žadatel drží prsty na senzoru 5–10 sekund na každý prst.

## DG4 — duhovka

* **Volitelné.**
* Zavádí ji jen málo zemí (Spojené arabské emiráty, Indie v rámci systému Aadhaar apod.).
* **Standard:** ISO/IEC 19794-6.
* **Formát:** JPEG 2000 nebo PNG.
* **Rozlišení:** přibližně 640 × 480 pixelů.
* **Osvětlení v blízké infračervené oblasti (NIR).**

## Kódované biometrické rysy (DG7-10)

Kromě obrazů umožňuje ICAO ukládat i *šablony* (templates):

* **DG8** — kódované rysy obličeje (šablona, např. 128rozměrný embedding).
* **DG9** — kódované rysy otisku prstu (markanty, minutiae).
* **DG10** — kódované rysy duhovky (Daugmanův kód).

**V praxi vzácné** — většina zemí ukládá obrazy, nikoli šablony.

## Zajištění kvality

### NFIQ (NIST Fingerprint Image Quality)

* Skóre od 1 (nejlepší) do 5 (nejhorší).
* Používá se při registraci k posouzení kvality otisku prstu.
* **NFIQ 2.0** — moderní verze, skóre 0–100.

### Kvalita obličeje

* ISO/IEC 29794-5 — kvalita obrazu obličeje.
* Ostrost, postoj, osvětlení, výraz.
* Automatické nástroje pro kontrolu při snímání.

### Kvalita duhovky

* ISO/IEC 29794-6.
* Plocha duhovky, ostrost, zakrytí (víčka, odlesky).

## Biometrický výkon — pasy

### Obličej

* **Moderní rozpoznávání obličeje pomocí hlubokého učení** nad fotografiemi o rozlišení 300 dpi:
  * EER < 0,5 % u spolupracujících osob.
  * Vyšší ve skutečných podmínkách elektronických bran (eGate) — kolísavé osvětlení, postoj.

### Otisky prstů

* **Ověřování založené na AFIS** nad otisky prstů z pasů o rozlišení 500 dpi:
  * EER typicky < 1 %.
  * Vyšší míra chybného zamítnutí u *malých* prstů (děti, ženy).

### Duhovka

* **Daugmanův algoritmus** nad duhovkou z biometrických pasů:
  * EER přibližně $10^{-5}$ — vynikající.

## Použití biometrických dat

### Hraniční kontrola

* **Porovnání nasnímané biometrie** (kamera u elektronické brány, eGate) s **uloženými** daty DG2/DG3.
* Křížové ověření: data z čipu + viditelná fotografie + samotná osoba.

### Žádosti o víza

* **VIS** (Visa Information System, vízový informační systém) — centralizovaná databáze EU s biometrickými údaji z vízových žádostí.
* **Schengenské vízum** = otisky prstů a fotografie pořízené na konzulátu.

### Prověřování (background checks)

* Mezinárodní spolupráce prostřednictvím Interpolu a Europolu.
* DNA *není* v pasech (vede se v samostatných forenzních databázích).

### Národní databáze

* **Francouzská TES** (Titres Électroniques Sécurisés) — centralizovaná biometrická databáze.
* **Britská NIDB** (National Identity Database — zrušena v roce 2010).
* **Česko:** policejní databáze DNA a otisků prstů (oddělené od pasů).

## Otázky soukromí

### Co je na čipu vs. v centrální databázi

* **Čip:** pouze obraz a podpis.
* **Centrální databáze:** obraz, podpis a *navíc* další údaje (historie, stav).
* Pravidla se liší podle jednotlivých zemí.

### Rozšiřování účelu (function creep)

* Původně určeno pro přeshraniční identifikaci.
* Využívá se i pro: vyšetřování trestné činnosti, sledování, boj proti terorismu.
* Zastánci ochrany soukromí mají obavy.

### Právo odmítnout

* **Zpravidla neexistuje** u biometrie v pasech.
* Některé země umožňují odmítnout otisky prstů (s vysvětlením).

### Minimalizace dat (GDPR)

* Čip by měl obsahovat jen *nezbytně nutná* data.
* Národní databáze podléhají článku 9 GDPR (zvláštní kategorie údajů).

## Obavy z podvržení (spoofing)

### Obličej

* **Fotografie vytištěná na papíře** — odhalitelná pohraničníkem.
* **Maska** — proti ní chrání kamerové systémy s detekcí podvržení.
* **Promítnutý deepfake** — elektronické brány porovnávají s kamerou, nikoli s předem nahraným záznamem.

### Otisky prstů

* **Latexové odlitky** — možné s jistou námahou.
* **Napodobeniny z gumových bonbonů** — moderní senzory je odhalí.
* **Detekce živého prstu** se zlepšuje.

### Duhovka

* **Vzorované kontaktní čočky** — částečná obrana.
* **Fotografie duhovky ve vysokém rozlišení** — možné podvržení.
* **3D detekce živosti** v novějších kamerách na snímání duhovky.

## Trendy

* **Kvalita obrazu obličeje** se zlepšuje — vyšší rozlišení, 3D snímání v některých pilotních projektech.
* **Bezdotykové snímání otisků prstů** kvůli hygieně a přístupnosti.
* **Zavádění duhovky** roste pomalu.
* **mDL (mobilní řidičský průkaz)** — posouvá biometrii směrem k přenositelnosti.
* **EU Digital Identity Wallet** — biometrická identita na chytrých telefonech.

---

*Zdroj: BIO přednášky 2025/26, BIO 11 — Biometrické pasy (Goldmann). Externí reference: ICAO Doc 9303 Part 9 — *Deployment of Biometric Identification and Electronic Storage of Data in eMRTDs*; ISO/IEC 19794-5 (face), 19794-4 (fingerprint), 19794-6 (iris) — biometric data interchange formats; ISO/IEC 29794 — biometric quality; NIST: *NFIQ 2.0 Fingerprint Image Quality* — [github.com/usnistgov/NFIQ2](https://github.com/usnistgov/NFIQ2).*
