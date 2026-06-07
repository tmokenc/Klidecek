---
title: Krevní řečiště — žilní biometrika
---

# Krevní řečiště — žilní biometrika

Žilní biometrika (vein biometrics) využívá *vnitřní vzor cév* pod kůží — nejčastěji na **dlani**, **prstu** nebo na *hřbetu ruky*. Žíly nejsou zvenčí vidět (jsou pod kůží), takže je nelze *fotograficky* podvrhnout — to dělá žilní biometriku *velmi odolnou* vůči většině útoků podvržením (spoofing). Komerčně nejúspěšnějším systémem je **Fujitsu PalmSecure**.

## Princip

Žíly obsahují **deoxygenovaný hemoglobin** (deoxyhemoglobin, deoxy-Hb). Tato složka *pohlcuje* blízké infračervené světlo (near-infrared, NIR) s nejsilnější absorpcí kolem 760 nm.

::: svg "Princip prosvícení prstu (transilluminace) v NIR pásmu: NIR LED osvětluje ruku, deoxy-Hb v žilách pohlcuje světlo (tmavé linky), kosti a okolní tkáň světlo propouštějí (světlé), kamera na protilehlé straně zachytí kontrastní obraz vzoru žil."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="40" y="40" width="160" height="120" rx="60"/>
  </g>
  <g stroke="rgb(50,50,150)" stroke-width="2.5" fill="none" stroke-opacity="0.7">
    <path d="M65,80 C95,100 130,85 175,105"/>
    <path d="M75,120 C100,110 140,130 180,115"/>
    <path d="M60,140 C95,135 125,115 175,140"/>
  </g>
  <g fill="rgba(255,150,0,0.4)" stroke="rgb(255,120,0)" stroke-width="2">
    <circle cx="120" cy="20" r="10"/>
  </g>
  <g fill="rgba(100,100,255,0.4)" stroke="rgb(100,100,255)" stroke-width="1.2">
    <rect x="100" y="170" width="60" height="20" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="120" y="24" font-size="9">NIR LED</text>
    <text x="130" y="183" font-size="9">NIR camera</text>
  </g>
  <g fill="var(--accent)" text-anchor="start" font-size="10">
    <text x="240" y="80">deoxy-Hb absorb. NIR (760 nm)</text>
    <text x="240" y="100">→ veins appear DARK</text>
    <text x="240" y="120">muscle + bones transmit NIR</text>
    <text x="240" y="140">→ background appears LIGHT</text>
  </g>
  <g stroke="rgb(255,200,0)" stroke-width="1" stroke-dasharray="2 2" fill="none">
    <path d="M120,30 L115,45"/>
    <path d="M125,30 L130,45"/>
  </g>
</svg>
:::

::: viz vein-nir-spectrum "Posuňte vlnovou délku — vidíte absorpční křivky deoxy-Hb, vody, melaninu a živý kontrast žil."
:::

### NIR okno

* **Vlnová délka** kolem 760 nm — *maximální* pohlcení u deoxy-Hb.
* **Kost, sval, voda** — *minimální* pohlcení při 760 nm.
* **Voda** pohlcuje hlavně nad 1000 nm.
* Výstupem je **vysoce kontrastní** obraz, kde jsou žíly *tmavší* než okolní tkáň.

## Modality

### 1. Dlaňové žíly (palm vein)

* **Fujitsu PalmSecure** (od roku 2002) — vedoucí systém na trhu.
* Bezdotykové: dlaň zhruba 5–10 cm nad senzorem.
* Snímání ve vysokém rozlišení (přibližně 500 × 500 pixelů).
* Používají ho japonské banky (Sumitomo Mitsui, Mizuho) pro přístup k bankomatům.

### 2. Prstové žíly (finger vein)

* **Hitachi finger vein** (od roku 2005).
* Prst se zasouvá do komůrky.
* Kamera je pod prstem nebo nad ním.
* Používá ho Bank of Tokyo-Mitsubishi a evropské čtečky karet.

### 3. Žíly hřbetu ruky (dorsal hand vein)

* Žíly na *hřbetu ruky*.
* Méně rozšířené, ale s výzkumným zájmem.

### 4. Žíly zápěstí (wrist vein)

* Integrované do chytrých hodinek.
* Apple Watch sledují srdeční rytmus na podobném principu (ovšem pro lékařské, nikoli biometrické účely).

## Snímací hardware

* Pole **NIR LED** diod — vlnová délka 760 nm.
* **NIR kamera** — křemíkový CMOS senzor bez IR filtru.
* **Dělič paprsku** (beam splitter) — zabraňuje přímému odrazu z LED do kamery.
* Upřednostňuje se **bezdotykové** snímání — hygienické a pohodlné.

## Algoritmus

### Zpracování obrazu

1. **Pořízení NIR snímku** — žíly tmavé, pozadí světlé.
2. **Předzpracování:**
   * **Vytyčení oblasti zájmu (ROI)** — okraj dlaně či prstu.
   * **Normalizace** — osvětlení a měřítko.
3. **Segmentace žil:**
   * **Přizpůsobené filtry (matched filters)** — konvoluce s jádry odpovídajícími tvaru cév.
   * **Postup založený na hessiánu** (Frangiho filtr) — detekce trubicových struktur.
   * **Postup založený na hlubokém učení (deep learning, DL)** — segmentace sítí U-Net.
4. **Skeletonizace** — získání os cév širokých jeden pixel.
5. **Extrakce příznaků:**
   * **Body větvení** (bifurcation points; obdoba markantů u otisku prstu).
   * **Koncové body**.
   * **Orientace a šířka cév**.

### Porovnávání

* **Porovnávání bodů větvení** — geometrické zarovnání a sečtení shod.
* **Porovnávání šablon (template matching)** — přímé srovnání obrazů po zarovnání.
* **DL příznakové vektory (embeddings)** — stále častější.

### Metrika vzdálenosti

* **Hammingova vzdálenost** pro binární kód žil.
* **Vzájemná korelace** pro porovnávání na úrovni obrazu.

## Vlastnosti

### Pro

* **Odolnost vůči podvržení:** žíly jsou *uvnitř* kůže, nelze je vyfotografovat zvenčí.
* **Žádné latentní stopy:** nezanechává se žádná stopa.
* **Stabilita:** vzor žil je *velmi stabilní* po celý život.
* **Vysoká přesnost:**
  * Fujitsu PalmSecure FAR: $10^{-8}$.
  * Hitachi finger vein FAR: $10^{-6}$.
* **Bezdotykové** varianty — hygienické, vhodné i pro období covidu.
* **Univerzálnost:** detekovatelné žíly má prakticky každý.

### Proti

* Je potřeba **NIR senzor** — není součástí běžných kamer.
* Snímání je **o něco pomalejší** než u otisku prstu.
* **Citlivost na:**
  * teplotu kůže (chlad = stažené žíly),
  * tlak (zmáčknutí prstu),
  * pigmentaci kůže (velmi tmavá = nižší kontrast).
* **Cena** — senzor 200–500 USD, drahý oproti snímači otisku prstu.

## Praktická nasazení {tier=practice}

### Bankovnictví

* **Japonsko:** od roku 2007 je přibližně 80 % bankomatů vybaveno snímáním žil dlaně či prstu. Zhruba 50 milionů uživatelů.
* **Mizuho, Sumitomo Mitsui, Bank of Tokyo-Mitsubishi.**
* **Brazílie:** banka Bradesco nasadila snímání prstových žil.

### Přístup na pracoviště

* Továrny Toyota — identifikace pracovníků podle dlaňových žil.
* Datová centra s vysokými nároky na bezpečnost.

### Zdravotnictví

* Identifikace pacientů v nemocnicích.
* Brazilské nemocnice používají dlaňové žíly při příjmu na pohotovost.

### Státní správa

* Některé pilotní projekty v Evropě (Velká Británie, Španělsko).
* Masové nasazení je omezené.

### Integrace do notebooků

* Notebooky **Fujitsu LifeBook** (od roku 2010) — přihlášení pomocí dlaňových žil.

## Srovnání žil a otisku prstu

| | **Žíly** | **Otisk prstu** |
| :--- | :---: | :---: |
| **Podvržení** | velmi obtížné | střední |
| **Latentní stopy** | žádné | zůstávají na površích |
| **Stabilita** | velmi vysoká | vysoká |
| **Cena** | senzor 200–500 USD | senzor 5–50 USD |
| **Přijetí veřejností** | střední (méně známé) | vysoké |
| **Propustnost** | střední (3–5 s) | rychlá (méně než 1 s) |
| **Soukromí** | vysoké (vnitřní rys) | střední |

Žilní biometrika má *bezpečnostní výhody* oproti otisku prstu, ale cena a zažitost otisku prstu v zařízeních pro koncové uživatele upřednostňují otisk prstu.

## Standardy

* **ISO/IEC 19794-9:2007** — data obrazu cévního řečiště.
* **ISO/IEC 19092:2008** — bezpečnost biometrie v bankovnictví.
* **JIS X 5093:2008** — japonský národní standard pro žilní biometriku.

## Ochrana proti podvržení

* **Odezva pouze v NIR pásmu** — falešná ruka či prst nemá absorpční vzor hemoglobinu.
* **Multispektrální snímání** — různé vlnové délky odhalí různou anatomii.
* **Detekce živosti (liveness):**
  * pulzní oxymetrie (okysličení krve),
  * teplota kůže,
  * detekce pulzujícího průtoku.

Některé pokročilé systémy kombinují žíly, otisk prstu a otisk dlaně.

## Trendy 2025

* **Masové rozšíření v chytrých telefonech** je nejisté — NIR senzory nejsou v telefonech standardem.
* **Apple Watch** používají červené a infračervené světlo pro měření okysličení krve (SpO2) — samotná tepová frekvence se přitom měří zelenou LED metodou PPG, nikoli NIR — pro biometrickou identifikaci je však zatím nepoužívají.
* **Multimodální biometrika dlaně** — žíly, otisk dlaně a geometrie.
* Algoritmy **založené na hlubokém učení** zlepšují přesnost.
* **Evropské zdravotnictví** projevuje po covidu zvýšený zájem.

## Lokální nasazení

* V ČR je nasazení omezené.
* Historicky některé projekty spojené se Sberbank žilní biometriku využívaly.
* Akademický výzkumný zájem (algoritmy pro dlaňové a prstové žíly, ochrana proti podvržení).

---

*Zdroj: BIO přednášky 2025/26, BIO — Identifikátory ruky (Rydlo). Externí reference: Fujitsu PalmSecure documentation — [fujitsu.com](https://www.fujitsu.com/global/products/computing/peripheral/sensors/biometrics/palm-vein/); Hashimoto, J.: *Finger Vein Authentication Technology and Its Future* (Hitachi 2006); Kumar, A., Prathyusha, K. V.: *Personal Authentication Using Hand Vein Triangulation and Knuckle Shape* (IEEE TIP 2009); ISO/IEC 19794-9:2007 *Biometric data interchange formats — Part 9: Vascular image data*.*
