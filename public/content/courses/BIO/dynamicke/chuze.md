---
title: Rozpoznávání podle chůze (gait)
---

# Rozpoznávání podle chůze (gait)

**Rozpoznávání podle chůze (gait recognition)** identifikuje *osobu* podle *způsobu chůze*. Patří mezi *behaviorální* biometriky a má jednu jedinečnou výhodu: lze ho použít *vzdáleně*, *bez vědomí dané osoby* a *bez fyzického kontaktu*. Díky tomu je zajímavé pro aplikace v oblasti sledování (surveillance), ale zároveň je kontroverzní z hlediska soukromí (privacy).

## Princip

Lidská chůze je *komplexní* pohyb — pozice nohou, paží a trupu se *koordinovaně* mění v čase. Každý člověk má *unikátní* vzorec chůze (gait pattern), který odpovídá jeho:

* **Anatomii** — výška, váha, délka končetin, postavení kloubů.
* **Svalové síle** — rozložení síly v těle.
* **Neurologii** — vzorce řízení pohybu (motor control).
* **Návykům** — naučený styl chůze.

::: svg "Stylizovaná chůze: stance fáze (noha na zemi) a swing fáze (noha ve vzduchu)."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--text)" stroke-width="1.5" fill="none">
    <circle cx="80" cy="60" r="12"/>
    <line x1="80" y1="72" x2="80" y2="130"/>
    <line x1="80" y1="100" x2="70" y2="120"/>
    <line x1="80" y1="100" x2="90" y2="115"/>
    <line x1="80" y1="130" x2="65" y2="175"/>
    <line x1="80" y1="130" x2="95" y2="175"/>
  </g>
  <g stroke="var(--text)" stroke-width="1.5" fill="none">
    <circle cx="180" cy="55" r="12"/>
    <line x1="180" y1="67" x2="180" y2="130"/>
    <line x1="180" y1="100" x2="195" y2="125"/>
    <line x1="180" y1="100" x2="165" y2="120"/>
    <line x1="180" y1="130" x2="170" y2="175"/>
    <line x1="180" y1="130" x2="200" y2="170"/>
  </g>
  <g stroke="var(--text)" stroke-width="1.5" fill="none">
    <circle cx="280" cy="60" r="12"/>
    <line x1="280" y1="72" x2="280" y2="130"/>
    <line x1="280" y1="100" x2="295" y2="115"/>
    <line x1="280" y1="100" x2="270" y2="120"/>
    <line x1="280" y1="130" x2="265" y2="175"/>
    <line x1="280" y1="130" x2="295" y2="175"/>
  </g>
  <g stroke="var(--text)" stroke-width="1.5" fill="none">
    <circle cx="380" cy="55" r="12"/>
    <line x1="380" y1="67" x2="380" y2="130"/>
    <line x1="380" y1="100" x2="365" y2="125"/>
    <line x1="380" y1="100" x2="395" y2="115"/>
    <line x1="380" y1="130" x2="395" y2="175"/>
    <line x1="380" y1="130" x2="370" y2="170"/>
  </g>
  <g stroke="var(--text)" stroke-width="1.5" fill="none">
    <circle cx="480" cy="60" r="12"/>
    <line x1="480" y1="72" x2="480" y2="130"/>
    <line x1="480" y1="100" x2="465" y2="115"/>
    <line x1="480" y1="100" x2="495" y2="120"/>
    <line x1="480" y1="130" x2="495" y2="175"/>
    <line x1="480" y1="130" x2="465" y2="175"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="80" y="195">t=0</text>
    <text x="180" y="195">t=1</text>
    <text x="280" y="195">t=2</text>
    <text x="380" y="195">t=3</text>
    <text x="480" y="195">t=4</text>
  </g>
</svg>
:::

## Cyklus chůze (gait cycle)

**Cyklus chůze (gait cycle)** = jeden kompletní cyklus chůze (od dotyku paty jedné nohy o zem zpět po dotyk paty téže nohy):

* **Stance fáze** (~60 %) — noha v kontaktu s podlahou.
* **Swing fáze** (~40 %) — noha ve vzduchu.
* **Dvojitá opora (double support)** (~20 % celkem — 2× ~10 %, na začátku a konci stance fáze) — obě nohy na zemi (přechody).

Jednotlivé fáze:
1. **Dotyk paty (heel strike)** — pata se dotkne podlahy.
2. **Střed opory (mid-stance)** — celá váha těla spočívá na noze.
3. **Odraz palce (toe-off)** — odraz špičkou nohy.
4. **Střed kmitu (mid-swing)** — noha v polovině pohybu vzduchem.

::: viz gait-cycle-walker "Animovaná chůze: stance/swing fáze, GEI overlay a srovnání tří stylů (normal, fast, limp)."
:::

## Metody snímání

### Na bázi videa (vision)

* **Standardní sledovací kamera** (CCTV).
* **Vzdálenost:** 5–50 m.
* **Rozlišení:** minimálně 640 × 480.
* **Zpracování:** odečtení pozadí (background subtraction), extrakce siluety, analýza časové řady.

### Nositelné senzory (wearable sensors)

* **Akcelerometry** — telefony, chytré hodinky.
* **Gyroskopy**.
* **Tlakově citlivé vložky do bot**.
* **Vyšší přesnost** než video, ale vyžaduje spolupráci uživatele.

### Podlahové senzory

* **Tlakově citlivá podlaha** (přístupové cesty, podlahy u bezpečnostních kontrol).
* Vysoká propustnost, ale vyžaduje pevnou instalaci.
* Ukázky z MIT Media Lab.

### Radar / LiDAR

* **mmWave radar** — snímání chůze skrz stěnu.
* **LiDAR** — sekvence mračen bodů (point cloud).
* Šetrné k soukromí (žádná vizuální identifikace).

## Příznaky (features)

### Na bázi siluety

* **Gait Energy Image (GEI)** — průměrná silueta za jeden cyklus chůze.
* **Active Energy Image (AEI)** — rozptyl.
* Statistiky **na základě periody** chůze.

### Na bázi modelu

* **Extrakce skeletu** — pozice kloubů (OpenPose, AlphaPose).
* **Úhly kloubů v čase** — kyčel, koleno, kotník.
* **Délka kroku, frekvence**.

### Hluboké učení (deep learning)

* **3D CNN** — prostorově-časové příznaky ze sekvencí siluet.
* **GaitSet, GaitGL** — současné špičkové (SOTA) architektury.

## Zpracovatelský řetězec (pipeline)

::: svg "Gait pipeline: video → silhouette segmentation → gait cycle detection → feature extraction → matching."
<svg viewBox="0 0 540 160" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aGT" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="10" y="60" width="70" height="40" rx="4"/>
    <rect x="90" y="60" width="90" height="40" rx="4"/>
    <rect x="190" y="60" width="100" height="40" rx="4"/>
    <rect x="300" y="60" width="100" height="40" rx="4"/>
    <rect x="410" y="60" width="90" height="40" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="45" y="84">video</text>
    <text x="135" y="84">silhouette</text>
    <text x="135" y="96" font-size="9" fill="var(--text-muted)">extraction</text>
    <text x="240" y="84">cycle detect</text>
    <text x="240" y="96" font-size="9" fill="var(--text-muted)">period</text>
    <text x="350" y="84">features</text>
    <text x="350" y="96" font-size="9" fill="var(--text-muted)">GEI, DL</text>
    <text x="455" y="84">match</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aGT)">
    <path d="M80,80 L88,80"/>
    <path d="M180,80 L188,80"/>
    <path d="M290,80 L298,80"/>
    <path d="M400,80 L408,80"/>
  </g>
</svg>
:::

## Vlastnosti

### Pro

* **Vzdálenost:** identifikuje až na 50+ m.
* **Bezkontaktnost:** není potřeba žádná spolupráce uživatele.
* **Stačí nízké rozlišení:** nevyžaduje obličej v HD kvalitě.
* **Těžko maskovatelné:** jde o nevědomý pohybový vzorec, který se dá vědomě jen těžko předstírat.
* **Vhodné pro sledování:** integruje se se stávajícími CCTV kamerami.

### Proti

* **Variabilita:** oblečení, obuv (podpatky vs. tenisky), povrch, nálada, zranění, únava.
* **Přesnost:** 5–10 % EER pro video; pro nositelné senzory lepší.
* **Obavy o soukromí:** umožňuje identifikaci na veřejných prostranstvích bez souhlasu.
* **Závislost na úhlu kamery:** funguje nejlépe z bočního pohledu.
* **Osvětlení:** venku lépe než uvnitř (konzistentní přirozené světlo).

## Výkon (performance)

* **Dataset CASIA-B** (největší dataset chůze) — *napříč pohledy* (různé úhly kamery) je obtížné.
* **Nejlepší systémy s hlubokým učením** (GaitGL, 2021): ~95 % přesnost rank-1 na CASIA-B.
* **Nositelné senzory:** EER ~2–5 %.

## Aplikace {tier=practice}

### Sledování (surveillance)

* **Bezpečnost na letištích** — londýnské Heathrow.
* **Městské sítě CCTV** — čínská města (kontroverzní).
* **Analýza chůze z místa činu** — britské soudy připouštějí důkazy z chůze.

### Forenzní použití

* **Video z místa činu** + srovnání chůze podezřelého.
* Soudní svědectví analytiků chůze.
* Kontroverzní — omezený vědecký základ.

### Medicína

* **Detekce parkinsonismu** — podle charakteristik chůze.
* **Posouzení diabetické neuropatie**.
* **Predikce pádů** u seniorů.
* Kombinace biometrie a medicíny.

### Průběžná autentizace (continuous authentication)

* **Chytrý telefon** s akcelerometry — pasivní kontrola chůze.
* Detekuje, zda zařízení používá *neoprávněná* osoba.

### Chytrá domácnost

* **Tlakové senzory v podlaze** — identifikují člena domácnosti.
* **Šetrná k soukromí** alternativa ke kamerám.

## Podvržení a obcházení (spoofing & evasion)

### Obcházení

* **Batohy, nošení předmětů** — mění chůzi.
* **Jiné boty** — významný vliv.
* **Nepřirozená chůze** — kvalitní systémy je překvapivě těžké takto soustavně oklamat.
* **Maskování** — proti systémům s hlubokým učením omezeně účinné.

### Podvržení (spoofing)

* **Napodobení chůze někoho jiného** — *velmi obtížné*.
* **Videa chůze generovaná umělou inteligencí** — možná, ale snadno odhalitelná.

## Soukromí a etika

* **Sledování bez vědomí** — *velký* problém pro soukromí.
* **Sledování napříč kamerami** — vytváření opětovné identifikace osob (person re-identification).
* **EU AI Act** — omezení biometrického sledování na veřejných prostranstvích.

## Trendy

* **3D chůze** — na bázi hloubkových senzorů.
* **Multimodální přístup** — chůze + obličej + oblečení.
* **Federované učení (federated learning)** — trénink modelů chůze šetrný k soukromí.
* **Robustnost vůči adversariálním útokům** — obrana proti záměrnému obcházení.

---

*Zdroj: BIO přednášky 2025/26, BIO 12 — Dynamické biometrické vlastnosti. Externí reference: Wang, L. et al.: *Silhouette Analysis-Based Gait Recognition for Human Identification* (IEEE PAMI 2003); Sarkar, S. et al.: *The HumanID Gait Challenge Problem: Data Sets, Performance, and Analysis* (IEEE PAMI 2005); Chao, H. et al.: *GaitSet: Regarding Gait as a Set for Cross-View Gait Recognition* (AAAI 2019); CASIA Gait Database — [biometrics.idealtest.org](http://biometrics.idealtest.org/).*
