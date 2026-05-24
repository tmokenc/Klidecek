---
title: Historie biometrie
---

# Historie biometrie

Biometrika *jako disciplína* je překvapivě stará. Lidstvo používá *fyzické rysy* k identifikaci osob tisíce let — od otisků prstů na hliněných tabulkách (5. st. př. n. l.) přes Bertillonovo systematické měření (19. století) až po moderní deep learning. Pochopení historického kontextu pomáhá ocenit dnešní state-of-the-art.

## Pravěk a starověk

* **500 let př. n. l.** — Babylonské hliněné tabulky obsahují otisky prstů jako *potvrzení* obchodních transakcí. Šlo o *primitivní podpis*, ne o systematické rozpoznávání.
* **3000 let př. n. l.** — Čína: úředníci pečetili dokumenty otiskem prstu a inkoustu.
* **14. století** — Persie, *Tarikh-i Jahan-Gusha* (Velká historie světa) zmiňuje použití otisků pro **verifikaci obchodních partnerů**.

## 19. století — Vědecký základ

Klíčové období; vznik *systematické* biometrie.

### William J. Herschel (1858)

* Britský úředník v Indii.
* Použil otisky prstů a dlaně na zadní straně **kontraktů zaměstnanců** pro prevenci pension fraud.
* První *vědomé* používání biometriky pro autentizaci.

### Francis Galton (1865–1892)

Bratranec Charlese Darwina, statistik, polymát:

* **1865** — studie o dědičnosti fyzických vlastností (*Hereditary talent and character*).
* **1869** — spoluzakladatel *eugeniky* (kontroverzní, dnes odmítnuto).
* **1875** — zakladatel *výzkumu dvojčat*.
* **1880** — **antropometrie** — systematické měření lidských dimenzí.
* **1892** — *Finger Prints*, kniha, která formalizovala studie otisků prstů. Galton dokázal, že:
  * Otisky jsou **unikátní** (probability shoda < $10^{-64}$).
  * Otisky jsou **stálé** během života.
  * Existují klasifikovatelné **vzory** (arches, loops, whorls).

Galtonův odkaz je *zásadní* — modernost daktyloskopie stojí na jeho práci.

### Alphonse Bertillon (1879)

Francouzský policejní úředník:

* Vyvinul **Bertillonovu metodu** (anthropometric system) — kombinace **11 měření**:
  * Výška postavy.
  * Šířka hlavy.
  * Délka středního prstu, levého chodidla.
  * Délka pravého ucha.
  * ...
* Systém byl použit v Paříži pro identifikaci recidivistů.
* **Mezinárodně** přijatý do 1890s.

### Slabost Bertillonu — případ West (1903)

V kansaském vězení Leavenworth se dostavil vězeň jménem *Will West*. Bertillon měření = identický jako *William West*, který už ve vězení byl. *Otisky prstů* je rozlišily — Will i William měli identické Bertillon profily, ale různé otisky. To byl klíčový bod, kdy daktyloskopie nahradila Bertillonu jako preferred metoda.

## 20. století — Daktyloskopie a forenzní biometrie

### Henry Faulds (1880)

Skotský lékař v Japonsku — *první* navrhl **klasifikační systém otisků** pro forenzní identifikaci. Publikoval v *Nature*.

### Henry Classification System (1897)

* Sir Edward Henry, Indie/Britský Egypt.
* Systematická klasifikace otisků do 10 typů (arches, loops, whorls + subtypes).
* Použito Scotland Yardem od 1901, dále standardizováno celosvětově.
* Stále základ moderních AFIS ([[zpracovani-afis|Automated Fingerprint Identification Systems]]).

### Identifikace v WWI a WWII

* US Army: identifikace vojáků otisky prstů.
* Nazistický režim: bohužel zneužití biometriky pro persekuce.
* FBI (1924): centrální fingerprint database.

## Druhá polovina 20. století

### 1960s–1970s — Začátky automatizace

* **1968** — první komerční fingerprint reader (FBI).
* **1971** — **první článek o rozpoznávání obličeje** (Bledsoe).
* **1976** — Goldstein-Harmon-Lesk: feature-based face recognition (manual measurements).

### 1980s — Iris recognition

* **1985** — **Leonard Flom and Aran Safir** představili koncept, že duhovka oka je jedinečná identifikační charakteristika. *Patent*.
* **1991** — Apple QuickTake camera — early digital cameras opening face recognition era.
* **1993** — **John Daugman** publikoval Daugman algorithm pro iris encoding ([[daugman]]) — dodnes standardní.

### 1990s — Komerční rozšíření

* **1991** — *Eigenfaces* (Matthew Turk, Alex Pentland, MIT) — PCA-based face recognition ([[eigenfaces-pca]]). Práh "rozpoznávání obličeje je možné".
* **1999** — FBI **IAFIS** (Integrated Automated Fingerprint Identification System) deployed.

## 21. století — Mass adoption

### 2000s — Government deployments

* **2002** — ICAO publikuje standardy pro **biometrické pasy** ([[icao-9303]]).
* **2003** — Visa Waiver Program požaduje biometrické pasy pro vstup do USA.
* **2004** — US-VISIT (US Visitor and Immigrant Status Indicator Technology) — fingerprint + photo entry/exit system.
* **2009** — *India Aadhaar* — největší biometrická databáze v historii (1.3 miliarda osob, fingerprint + iris + photo).
* **2010** — Stuxnet (viz kurz BZA) — biometrika *není* primárně cíl, ale demonstrace státem-sponsored cyber capabilities.

### 2010s — Consumer biometrics

* **2011** — FBI **NGI** (Next Generation Identification) replaces IAFIS.
* **2013** — **Apple Touch ID** — first mass-market fingerprint sensor on a phone (iPhone 5s).
* **2014** — Samsung Galaxy S5 with finger scanner.
* **2017** — **Apple Face ID** (iPhone X) — first mainstream 3D face recognition.
* **2018** — Mastercard chip card s built-in fingerprint sensor.
* **2018** — Eurodac III — EU biometric database asylum seekers.

### 2020s — Deep learning era

* **2020** — **Deep learning** dominantní pro face recognition. ArcFace, FaceNet trained on millions of images.
* **2021** — Apple Watch Series 7 — heart rhythm + ECG biometrics for atrial fibrillation detection (medical biometry).
* **2022** — Worldcoin — controversial iris scanning project for global biometric ID.
* **2024** — **PassKey** + biometric integration in operating systems (passwordless authentication).
* **2025** — EU AI Act — regulation of biometric mass surveillance.

## Tendence

* **Multimodální biometriky** — kombinace více modalit (face + iris + fingerprint) pro vyšší přesnost.
* **Continuous authentication** — biometriky využívané *průběžně* (keystroke dynamics, mouse patterns).
* **Mobile-first** — všechna biometrika musí běžet na mobile SOC s minimal power.
* **Edge computing** — biometrické šablony zůstávají *na zařízení*, ne v cloudu.
* **Privacy-preserving biometrics** — homomorphic encryption, federated learning, secure multiparty computation.
* **Post-quantum biometrics** — odolnost vůči kvantovým útokům na kryptografické vrstvy biometric systems.
* **Anti-deepfake** — adversarial robustness, liveness detection ([[deepfakes]]).

---

*Zdroj: BIO přednášky 2025/26, BIO 1 — Úvod do biometrických systémů. Externí reference: Galton, F.: *Finger Prints* (1892) — [archive.org](https://archive.org/details/cu31924074404737); Maltoni, D., Maio, D., Jain, A. K., Prabhakar, S.: *Handbook of Fingerprint Recognition* (2nd ed., Springer 2009); IEEE Biometrics History Project — [link](https://ethw.org/Biometrics); Humanode blog: *Evolution of Biometrics* — [blog.humanode.io](https://blog.humanode.io/evolution-of-biometrics).*
