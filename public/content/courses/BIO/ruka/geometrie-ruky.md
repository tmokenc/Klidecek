---
title: Geometrie ruky
---

# Geometrie ruky

Geometrie ruky (hand geometry) je biometrika založená na *fyzických rozměrech* ruky — délka prstů, šířka, tloušťka a obvody. Patří k *nejstarším* prakticky používaným biometrikám (od 70. let 20. století). Přestože *nepatří* mezi nejpřesnější, má specifické výhody: je neinvazivní (non-invasive), uživatelsky příjemná (user-friendly) a odolná (robust) vůči mírnému zranění.

## Princip

Měří se *makrofyzická* anatomie ruky, tedy její celkové vnější rozměry (nikoli jemné detaily jako otisky):

::: svg "Hand geometry — měřené dimenze: length fingers (5), palm width (3 levels), palm thickness (2 places), finger thickness (5)."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="rgba(255,220,180,0.6)" stroke="var(--accent)" stroke-width="1.5">
    <path d="M180,200 L180,140 L195,90 L210,60 L225,55 L240,65 L245,100 L260,80 L275,55 L290,60 L295,100 L310,80 L325,75 L335,90 L340,140 L320,160 L320,200 Z"/>
  </g>
  <g stroke="var(--danger, #d33)" stroke-width="1" fill="none" stroke-dasharray="2 2">
    <line x1="225" y1="55" x2="225" y2="140"/>
    <line x1="282" y1="55" x2="282" y2="140"/>
    <line x1="320" y1="75" x2="320" y2="140"/>
    <line x1="180" y1="170" x2="340" y2="170"/>
    <line x1="180" y1="120" x2="340" y2="120"/>
  </g>
  <g fill="var(--accent)" font-size="10">
    <text x="218" y="50">L1</text>
    <text x="275" y="50">L2</text>
    <text x="315" y="70">L3</text>
    <text x="350" y="170">W1</text>
    <text x="350" y="120">W2</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="start" font-size="10">
    <text x="20" y="220">L = délka prstu</text>
    <text x="200" y="220">W = šířka dlaně</text>
    <text x="400" y="220">+ thickness (z boku)</text>
  </g>
</svg>
:::

Typický vektor příznaků (feature vector) obsahuje:

* **5× délka prstů** (palec, ukazovák, prostředníček, prsteník, malíček).
* **2–3× šířka dlaně** (na různých výškách).
* **5× šířka prstů** (na proximální falanze, tedy na článku nejblíže dlani).
* **2× tloušťka ruky** (z boku, palec dolů).
* **Obvod (perimeter) ruky.**

Celkem tedy zhruba 14–30 rozměrů — jde o *kompaktní* vektor příznaků.

## Snímání

### Tradiční hardware

* **Komerční:** specializovaný snímač s vodicími kolíky (pegs), které ruku navedou do správné polohy.
* **Kamera a osvětlení:** RGB kamera nad rukou; značky (markers) na ruce vyznačují klíčové body (keypoints).
* **Boční zrcadlo (side mirror)** — umožní zachytit *tloušťku* (hloubku kolmou ke kameře).

Klasickým systémem byl **Recognition Systems ID3D** (od 90. let) — první komerční systém pro geometrii ruky, nasazený v tisících zařízení.

### Moderní

* **Řešení založená na smartphonu** — RGB kamera plus strojové učení (ML) pro detekci ruky a změření rozměrů.
* **3D snímání hloubky** — Kinect, RealSense, ToF (time-of-flight, měření doby letu světla).
* **Bezkontaktní (touchless)** — preferované po pandemii COVID.

## Snímací protokol

1. Subjekt položí ruku na **rovnou plochu** s kolíky či značkami.
2. Kamera zachytí **pohled shora** a volitelně i **pohled z boku**.
3. Zpracování obrazu:
   * **Odečtení pozadí (background subtraction)** — segmentace ruky.
   * **Detekce klíčových bodů (keypoint detection)** — špičky prstů a body v zářezech mezi prsty.
   * **Extrakce měření** — výpočet vzdáleností.
4. **Vektor příznaků** se uloží jako šablona (template, zhruba 30 čísel s plovoucí desetinnou čárkou).

## Porovnávání (matching)

* **Eukleidovská vzdálenost** mezi vektory příznaků.
* O shodě či neshodě rozhoduje **práh (threshold)**.
* Metoda je **jednoduchá a rychlá** — složitost O(D) pro D-rozměrný vektor.

## Vlastnosti

### Pro

* **Neinvazivní** — pohodlné, bez kontaktu s citlivými zónami (oči, ústa).
* **Rychlé** — snímání trvá méně než 1 sekundu.
* **Odolné vůči nečistotám** — lehké škrábance a malé řezné rány porovnávání neovlivní.
* **Snadná registrace (enrollment)** — stačí jediné nebo několik málo snímání.
* **Nízká výpočetní náročnost** — proveditelné i na vestavěných (embedded) systémech.
* **Kulturní přijatelnost** — vhodné pro mnoho oblastí, kde je snímání obličeje či duhovky tabu.
* **Cenová dostupnost** — senzor kolem 200 USD, celý systém kolem 1000 USD.

### Proti

* **Nižší přesnost** než otisk prstu, duhovka nebo obličej zpracovaný hlubokým učením (DL).
  * Typická EER (chyba ve vyrovnaném bodě): 1–5 % (oproti duhovce s méně než 0,001 %).
* **Stabilní, ale ne jedinečná** — prostor příznaků je *omezený*.
  * Některé studie naznačují, že samotná geometrie ruky *neumí* jednoznačně identifikovat osobu v databázích nad 10 000 záznamů.
* **Stárnutí** — děti rostou, u dospělých se ruka mění mírněji.
* **Zranitelnost vůči podvržení (spoofing)** — voskové odlitky, falešné ruce.
* **Citlivost na polohu** — i malé pootočení ruky vede k velké chybě měření.

## Praktická nasazení {tier=practice}

### Evidence docházky

* **Systémy pro evidenci pracovní doby a docházky** — odpíchnutí příchodu a odchodu na pracovišti.
* **ID3D** (Recognition Systems) — nasazený v tisících firem, věznic a škol.

### Hraniční kontrola

* **INSPASS** (USA, 1993–2002) — Immigration and Naturalization Service Passenger Accelerated Service System. Nahrazen 2D čárovým kódem a snímáním obličeje.

### Školní programy obědů

* **Americké školy K-12** — geometrie ruky jako platba ve školní jídelně. Kontroverzní (soukromí, děti).

### Stavby

* Pracovníci se odhlašují a přihlašují v *náročném* (rugged) prostředí.
* Snáší nečistoty, rukavice se sundavají.

### Věznice

* **California Department of Corrections** — identifikace vězňů pomocí geometrie ruky.
* Odolné v prostředí, kde mohou senzory otisků prstů selhávat.

## Klasifikace dle rozsahu

### Snímač s jedním uchycením na kolíky (single peg-based scanner)

* Uživatel je předem napolohován kolíky.
* Vysoká přesnost.
* Používá se v aplikacích pro evidenci pracovní síly.

### Bez kolíků (peg-less, free-form)

* Bez fyzických vodítek.
* Ruku zarovná zpracování obrazu.
* Uživatelsky příjemnější.

### Bezkontaktní (touchless)

* Založené na kameře, bez kontaktu.
* Rozšíření vyvolané pandemií COVID.
* Nižší přesnost než varianta s kolíky.

## Standardy

* **ANSI INCITS 396-2005** — Hand Geometry Interchange Format (formát výměny dat geometrie ruky).
* **ISO/IEC 19794-10:2007** — data siluety geometrie ruky.

## Měření výkonu (performance benchmarks)

* **FAR (míra chybného přijetí) při 0,01 %**: FRR (míra chybného odmítnutí) zhruba 5 % (typicky).
* **EER**: 1–3 % (u nejlepších systémů).
* **Propustnost (throughput)**: více než 100 identifikací za sekundu.

Geometrie ruky je méně přesná než duhovka ($10^{-12}$ FAR) nebo moderní obličejové systémy s hlubokým učením (DL, $10^{-6}$ FAR), ale je *dostatečná* pro aplikace s nízkou až střední úrovní zabezpečení.

## Geometrie ruky vs. otisk dlaně (palmprint)

Pozor na rozdíl:

* **Geometrie ruky** — *makroskopické* příznaky (rozměry).
* **Otisk dlaně (palmprint)** — *mikroskopické* příznaky (čáry a papilární linie na dlani), analogie k otisku prstu, ale na dlani. Má *mnohem vyšší* jedinečnost.

Obojí lze zkombinovat do **biometriky dlaně (palm biometrics)**:

* Žíly dlaně (palm vein) plus geometrie dlaně plus otisk dlaně.
* Používají to některé banky (Fujitsu PalmSecure — založené na žilním řečišti).

## Trendy

* **Úpadek** čisté geometrie ruky.
* **Nahrazování** otiskem prstu (smartphone) nebo obličejem (kiosky).
* **Přežívá** ve *specializovaných* prostředích (stavby, věznice).
* **Hybridní řešení** s otiskem dlaně a žilami dlaně dosahují lepší přesnosti.

---

*Zdroj: BIO přednášky 2025/26, BIO — Identifikátory ruky (Rydlo). Externí reference: Zunkel, R. L.: *Hand Geometry Based Verification* (chapter in *Biometrics: Personal Identification in Networked Society*, Springer 1999); Sanchez-Reillo, R., Sanchez-Avila, C., Gonzalez-Marcos, A.: *Biometric Identification through Hand Geometry Measurements* (IEEE PAMI 2000); Recognition Systems ID3D historical documentation.*
