---
title: Historie biometrie
---

# Historie biometrie

Biometrie *jako vědní disciplína* je překvapivě stará. Lidstvo používá *fyzické rysy* k identifikaci osob už tisíce let — od otisků prstů na hliněných tabulkách (5. st. př. n. l.) přes Bertillonovo systematické měření (19. století) až po moderní hluboké učení (deep learning). Pochopení historického kontextu pomáhá ocenit dnešní špičkové metody.

## Pravěk a starověk {tier=extra}

* **500 let př. n. l.** — Babylonské hliněné tabulky obsahují otisky prstů jako *potvrzení* obchodních transakcí. Šlo o *primitivní podpis*, ne o systematické rozpoznávání.
* **3000 let př. n. l.** — Čína: úředníci pečetili dokumenty otiskem prstu a inkoustu.
* **13. století** (≈1252–1260) — Persie, *Tarikh-i Jahan-Gusha* (Dějiny dobyvatele světa) zmiňuje použití otisků k **ověření obchodních partnerů**.

## 19. století — Vědecký základ

Klíčové období; vzniká *systematická* biometrie.

### William J. Herschel (1858)

* Britský úředník v Indii.
* Otisky prstů a dlaně dával na zadní stranu **pracovních smluv zaměstnanců**, aby zabránil podvodům s penzijními výplatami.
* Šlo o první *vědomé* používání biometrie k autentizaci (authentication).

### Francis Galton (1865–1892)

Bratranec Charlese Darwina, statistik a polyhistor:

* **1865** — studie o dědičnosti fyzických vlastností (*Hereditary talent and character*).
* **1869** — *Hereditary Genius*.
* **1883** — zavedl pojem *eugenika* (kontroverzní, dnes odmítaný).
* **1875** — zakladatel *výzkumu dvojčat*.
* **1880** — **antropometrie** — systematické měření rozměrů lidského těla.
* **1892** — *Finger Prints*, kniha, která formalizovala studium otisků prstů. Galton dokázal, že:
  * Otisky jsou **jedinečné** (pravděpodobnost shody ≈ 1 ku 64 miliardám, ~$1.6\times10^{-11}$).
  * Otisky jsou **stálé** po celý život.
  * Existují klasifikovatelné **vzory** (oblouky, smyčky a víry — arches, loops, whorls).

Galtonův odkaz je *zásadní* — moderní daktyloskopie stojí na jeho práci.

### Alphonse Bertillon (1879)

Francouzský policejní úředník:

* Vyvinul **Bertillonovu metodu** (antropometrický systém) — kombinaci **11 měření**:
  * Výška postavy.
  * Šířka hlavy.
  * Délka prostředníku a levého chodidla.
  * Délka pravého ucha.
  * ...
* Systém se v Paříži používal k identifikaci recidivistů.
* **Mezinárodně** byl přijat do 90. let 19. století.

### Slabina Bertillonovy metody — případ West (1903)

Do kansaského vězení Leavenworth se dostavil vězeň jménem *Will West*. Jeho Bertillonova měření byla *totožná* s měřením *Williama Westa*, který už ve vězení byl. Rozlišily je teprve *otisky prstů* — Will i William měli shodné bertillonovské profily, ale různé otisky. To byl klíčový okamžik, kdy daktyloskopie nahradila Bertillonovu metodu jako preferovanou metodu identifikace.

## 20. století — Daktyloskopie a forenzní biometrie

### Henry Faulds (1880)

Skotský lékař působící v Japonsku — jako *první* navrhl **klasifikační systém otisků** pro forenzní identifikaci. Svou práci publikoval v časopise *Nature*.

### Henryho klasifikační systém (1897)

* Sir Edward Henry, Indie / Britský Egypt.
* Systematická klasifikace otisků do 10 typů (oblouky, smyčky a víry včetně podtypů — arches, loops, whorls).
* Scotland Yard ji používal od roku 1901, dále byla standardizována po celém světě.
* Je dodnes základem moderních systémů AFIS ([[zpracovani-afis|Automatizované systémy identifikace otisků prstů]]).

### Identifikace v 1. a 2. světové válce

* Armáda USA: identifikace vojáků podle otisků prstů.
* Nacistický režim: bohužel zneužití biometrie k perzekucím.
* FBI (1924): centrální databáze otisků prstů.

## Druhá polovina 20. století

### 60.–70. léta — Začátky automatizace

* **1968** — první komerční čtečka otisků prstů (FBI).
* **1964–1966** — **první experimenty s rozpoznáváním obličeje** (Bledsoe, systém typu člověk–stroj).
* **1971** — Goldstein, Harmon a Lesk: rozpoznávání obličeje založené na příznacích (ruční měření).

### 80. léta — Rozpoznávání duhovky

* **1987** — **Leonard Flom a Aran Safir** si nechali patentovat myšlenku, že duhovka oka je jedinečná identifikační charakteristika (poprvé ji navrhl už Frank Burch v roce 1936). *Patent*.
* **1994** — Apple QuickTake — jedna z prvních spotřebitelských digitálních kamer.
* **1993** — **John Daugman** publikoval Daugmanův algoritmus pro kódování duhovky ([[daugman]]) — dodnes je standardem.

### 90. léta — Komerční rozšíření

* **1991** — *Eigenfaces* (Matthew Turk, Alex Pentland, MIT) — rozpoznávání obličeje založené na metodě PCA ([[eigenfaces-pca]]). Hranice, za níž platí, že "rozpoznávání obličeje je možné".
* **1999** — FBI nasadila systém **IAFIS** (Integrovaný automatizovaný systém identifikace otisků prstů).

## 21. století — Masové rozšíření

### 2000–2009 — Nasazení ve státní správě

* **2002** — ICAO publikuje standardy pro **biometrické pasy** ([[icao-9303]]).
* **2003** — Program Visa Waiver požaduje pro vstup do USA biometrické pasy.
* **2004** — US-VISIT (US Visitor and Immigrant Status Indicator Technology) — systém vstupu/výstupu kombinující otisk prstu a fotografii.
* **2009** — *India Aadhaar* — největší biometrická databáze v historii (1,3 miliardy osob, otisk prstu, duhovka i fotografie).
* **2010** — Stuxnet (viz kurz BZA) — biometrie *není* primárním cílem, jde však o ukázku kybernetických schopností podporovaných státem.

### 2010–2019 — Spotřebitelská biometrie

* **2011** — FBI nahrazuje IAFIS systémem **NGI** (Next Generation Identification).
* **2013** — **Apple Touch ID** — první masově rozšířený snímač otisků prstů v telefonu (iPhone 5s).
* **2014** — Samsung Galaxy S5 se snímačem otisku prstu.
* **2017** — **Apple Face ID** (iPhone X) — první mainstreamové 3D rozpoznávání obličeje.
* **2018** — čipová karta Mastercard s vestavěným snímačem otisku prstu.
* **2018** — Eurodac III — biometrická databáze EU pro žadatele o azyl.

### 2020 a dál — Éra hlubokého učení

* **2020** — **Hluboké učení (deep learning)** se stává dominantním přístupem pro rozpoznávání obličeje. Modely ArcFace a FaceNet jsou trénované na milionech snímků.
* **2021** — Apple Watch Series 7 — měření srdečního rytmu a EKG pro detekci fibrilace síní (lékařská biometrie).
* **2022** — Worldcoin — kontroverzní projekt skenování duhovky pro globální biometrickou identitu.
* **2024** — **PassKey** + integrace biometrie do operačních systémů (přihlašování bez hesla).
* **2025** — EU AI Act — regulace hromadného biometrického dohledu.

## Trendy

* **Multimodální biometrie** — kombinace více modalit (obličej + duhovka + otisk prstu) pro vyšší přesnost.
* **Průběžná autentizace (continuous authentication)** — biometrie využívaná *nepřetržitě* (dynamika psaní na klávesnici, vzorce pohybu myši).
* **Mobile-first** — veškerá biometrie musí běžet na mobilních čipech (SoC) s minimální spotřebou energie.
* **Edge computing** — biometrické šablony zůstávají *na zařízení*, nikoli v cloudu.
* **Biometrie chránící soukromí (privacy-preserving biometrics)** — homomorfní šifrování, federované učení, bezpečný vícestranný výpočet.
* **Postkvantová biometrie** — odolnost vůči kvantovým útokům na kryptografické vrstvy biometrických systémů.
* **Obrana proti deepfakes** — adversariální robustnost, detekce živosti (liveness detection) ([[deepfakes]]).

---

*Zdroj: BIO přednášky 2025/26, BIO 1 — Úvod do biometrických systémů. Externí reference: Galton, F.: *Finger Prints* (1892) — [archive.org](https://archive.org/details/cu31924074404737); Maltoni, D., Maio, D., Jain, A. K., Prabhakar, S.: *Handbook of Fingerprint Recognition* (2nd ed., Springer 2009); IEEE Biometrics History Project — [link](https://ethw.org/Biometrics); Humanode blog: *Evolution of Biometrics* — [blog.humanode.io](https://blog.humanode.io/evolution-of-biometrics).*
