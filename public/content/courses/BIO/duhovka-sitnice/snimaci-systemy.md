---
title: Snímací systémy — komerční scannery duhovky a sítnice
---

# Snímací systémy — komerční scannery duhovky a sítnice

Praktické nasazení biometriky duhovky a sítnice vyžaduje *specifické* zařízení. Zde je přehled hlavních komerčních systémů a vývojových projektů, včetně multimodálního zařízení **Eyrina**.

## Scannery duhovky

### IriShield (IriTech)

* **Kompaktní** USB scanner duhovky.
* Snímá NIR (blízké infračervené) obrázky v rozlišení 640 × 480.
* Snímací vzdálenost 8–25 cm.
* Cena: 300–1000 $.
* Použití: zápisové stanice (enrollment stations), mobilní identifikace.

### CMITech BMT-20 (Aware)

* Čtečka duhovky s vysokou propustností.
* Snímá ze vzdálenosti 1 m — *bezkontaktně*.
* Příklad nasazení: automatizované odbavovací brány na letištích (eGates).

### Princeton Identity ID-200 / ID-300

* Společnost Princeton Identity (dceřiná společnost Samsungu) byla převzata (akvizice).
* Rozpoznávání duhovky špičkové třídy pro firemní nasazení.
* Používá ji armáda a zpravodajské služby USA.

### IRIS ID iCAM 7000 series

* Standardní scanner duhovky v indickém systému Aadhaar.
* 1,3 miliardy zápisů (enrollments).

### Mobilní snímání duhovky

* **Samsung Galaxy S8/S9/Note 8** (2017–2018) — první masově dostupný mobilní scanner duhovky. *Ukončeno* u modelu S10 a novějších (nahrazeno ultrazvukovou čtečkou otisků prstů).
* **iPhone X a novější** — *nejde* o duhovku, ale o Face ID (jiná biometrika).

### Worldcoin Orb

* Kontroverzní projekt z roku 2022.
* Masové snímání duhovky pro globální infrastrukturu nepodmíněného základního příjmu (UBI) a identity.
* Zakázkový hardware (přes 100 000 $ za jednotku).
* Obavy o soukromí a reakce evropské regulace.

## Scannery sítnice

### EyeDentify EyeScan

* První komerční scanner sítnice (1985).
* Speciální křeslo s opěrkou hlavy.
* Přes 10 000 $ za jednotku.
* Používaly jej NSA, CIA, FBI a jaderné elektrárny.
* Výroba ukončena kolem roku 2000.

### Topcon — kamery sítnice

* Fundus kamery v lékařské kvalitě (řada TRC-50DX).
* Hlavní využití: diagnostika.
* Biometrický režim je možný, ale využívá se zřídka.

### Optos California / Daytona

* Širokoúhlé snímání sítnice.
* Pořízení jediného snímku bez nutnosti rozšíření zornice (dilatace).
* Primárně lékařské využití, biometrika je až druhotná.

### Nástavce pro chytré telefony

* **Welch Allyn iExaminer** — pouzdro na iPhone s oftalmoskopem.
* **Aurora Smart Retinal Camera** — ruční přístroj.
* **D-EYE** — italský startup, mobilní oftalmoskop.

## Eyrina — multimodální zařízení pro duhovku i sítnici

Akademický projekt zaměřený na *kombinované snímání* duhovky a sítnice jedním zařízením.

### Cíl projektu

Vyvinout zařízení, které *téměř v jediném okamžiku* pořídí *oba snímky* (duhovku i sítnici).

### Architektura

* **Snímání duhovky** — NIR kamera, podobná komerčním scannerům duhovky.
* **Snímání sítnice** — optická dráha fundus kamery.
* **Sdílená optická cesta** — totéž oko, oba snímače.
* **Přesné zarovnání** — automatizované polohování snímaného subjektu.

### Využití

* **Biometrické** — hybridní biometrika s vyšší přesností než samotná duhovka nebo samotná sítnice.
* **Biomedicínské** — *jednorázová* diagnostická akce; detekce cukrovky (diabetes), zeleného zákalu (glaukomu) a vysokého krevního tlaku (hypertenze).

## Společné prvky komerčních scannerů

### Hardware

* **NIR LED osvětlení** — neviditelné, neruší uživatelský komfort.
* **Snímač CCD/CMOS** — vysoké rozlišení, nízký šum.
* **Optická soustava** — malá hloubka ostrosti, zaostření na duhovku/sítnici.
* **Antireflexní vrstvy** — minimalizují zrcadlové odlesky od rohovky.

### Protokol snímání

1. **Polohování subjektu** — opěrka brady nebo pomůcka pro nastavení hlavy.
2. **Automatické zaostření** — detekce oka, nastavení ostrosti.
3. **Posouzení kvality** — kontrola ostrosti, jasu a plochy duhovky.
4. **Pořízení snímku** — jeden snímek nebo průměrování z více snímků.
5. **Následné zpracování** — vylepšení obrazu.

### Metriky kvality

* **Ostrost** — přítomnost vysokofrekvenčního obsahu.
* **Jas** — rovnoměrné osvětlení.
* **Plocha duhovky** — dostatečná (pro duhovku průměr větší než 200 pixelů).
* **Překrytí víčkem** — minimální.
* **Poměr zornice a duhovky** — v přijatelném rozsahu (0,1–0,7).

## Standardy snímání

* **ISO/IEC 19794-6:2011** — formát obrazu duhovky.
* **ISO/IEC 29794-6:2015** — kvalita obrazu duhovky.
* **NIST SP 800-76-2** — biometrická data pro karty PIV (zahrnuje duhovku).
* **ANSI/NIST-ITL 1-2011 Type 17** — datový záznam obrazu duhovky.

## Mobilní vs. stolní zařízení

| | **Mobilní** | **Stolní / firemní** |
| :--- | :---: | :---: |
| Velikost | < 50 g | > 1 kg |
| Cena | nástavec za 10–100 $ | 500–5000 $ |
| Rozlišení | dostačující | vysoké |
| Vzdálenost | < 30 cm | 0,5–1 m |
| Příklad použití | osobní ověření | zápis, identifikace |

## Trendy 2025

* **Bezkontaktní snímání duhovky** — výzkum Applu a Googlu; integrace snímání duhovky do přední kamery.
* **Snímání duhovky na dálku** (řádově metry) — využití pro sledování, kontroverzní.
* **3D rekonstrukce duhovky** — hloubka i textura, odolnější vůči podvržení (spoofing).
* **Fúze duhovky a sítnice** — kombinovaná zařízení (jako Eyrina) směřují ke komerčnímu nasazení.
* **Snímání duhovky se zachováním soukromí** — šifrované šablony, odvolatelné kódy duhovky (cancelable iris codes).

## Ochrana proti podvržení (anti-spoofing) pro duhovku a sítnici

### Duhovka

* **Útok fotografií** — fotografie duhovky ve vysokém rozlišení. Obrana: analýza hloubky, dynamika zornice.
* **Vzorovaná kontaktní čočka** — vytištěný vzor duhovky. Obrana: spektrální analýza (čočka má jiné spektrum než přirozená duhovka).
* **Skutečná duhovka z mrtvého těla / po operaci** — krajní případ. Obrana: dynamika zornice (živá zornice reaguje na světlo).

### Sítnice

* **Mimořádně obtížné** podvrhnout — sítnice je *uvnitř* oka.
* **3D vytištěný model oka** + vzor sítnice → možné, ale velmi nákladné.
* Nejsou zdokumentovány žádné reálné případy podvržení.

## Limity nasazení

### Duhovka

* Masové nasazení je proveditelné, ale **brzdí** je přijetí ze strany uživatelů.
* „Skenování oka" vyvolává *nepříjemné pocity* u veřejnosti.
* V některých oblastech existují náboženské nebo kulturní výhrady.

### Sítnice

* **Velmi nepohodlné** — blízký kontakt, jasné světlo.
* Vyžaduje **spolupracující subjekt**.
* **Nevhodné** pro sledování či masové nasazení.

---

*Zdroj: BIO přednášky 2025/26, BIO — Rozpoznávání podle duhovky a sítnice (Drahanský, Semerád). Externí reference: STRaDe @ FIT VUT — [strade.fit.vutbr.cz](https://strade.fit.vutbr.cz/); ISO/IEC 19794-6:2011 *Biometric data interchange formats — Part 6: Iris image data*; Bowyer, K. W., Hollingsworth, K., Flynn, P. J.: *Image Understanding for Iris Biometrics: A Survey* (CVIU 2008); Worldcoin project documentation (controversial, 2022+).*
