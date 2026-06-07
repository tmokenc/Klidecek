---
title: Sítnice a cévní řečiště
---

# Sítnice a cévní řečiště

**Sítnice** (retina) je *vnitřní* světločitlivá vrstva oka. Pro biometriku je podstatný její *cévní vzor* (vascular pattern) — pro každého člověka *jedinečný* a *mimořádně stabilní* v průběhu života. Biometrika založená na sítnici je technicky nejnáročnější ze všech, zato poskytuje nejvyšší přesnost — proto se používá jen ve *vysoce zabezpečených* aplikacích.

## Cévní struktura sítnice

::: svg "Fundus oculi — pohled na sítnici: terč zrakového nervu (vstup cév), žlutá skvrna, centrální tepna a žíla s větveními."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="rgba(180,140,100,0.5)" stroke="var(--accent)" stroke-width="1.5">
    <circle cx="270" cy="120" r="100"/>
  </g>
  <g fill="rgba(255,240,200,0.6)" stroke="var(--accent)" stroke-width="1.2">
    <circle cx="220" cy="120" r="15"/>
  </g>
  <g fill="rgba(150,80,80,0.3)" stroke="rgb(150,30,30)" stroke-width="0.8">
    <circle cx="290" cy="130" r="3"/>
  </g>
  <g stroke="rgb(180,40,40)" stroke-width="2" fill="none">
    <path d="M220,120 C260,100 280,80 290,70 C295,60 300,55 305,52"/>
    <path d="M220,120 C260,140 280,160 290,170 C295,180 300,185 305,188"/>
    <path d="M280,90 C290,85 300,80 310,80"/>
    <path d="M280,150 C290,155 300,160 310,160"/>
    <path d="M255,105 C245,95 240,85 235,80"/>
    <path d="M255,135 C245,145 240,155 235,160"/>
  </g>
  <g stroke="rgb(80,100,180)" stroke-width="1.5" fill="none">
    <path d="M220,120 C260,108 280,85 285,72"/>
    <path d="M220,120 C260,132 280,155 285,168"/>
  </g>
  <g fill="var(--text)" text-anchor="start" font-size="10.5">
    <text x="100" y="115">optical disk</text>
    <text x="100" y="130" font-size="9" fill="var(--text-muted)">slepá skvrna</text>
    <text x="320" y="135">macula</text>
    <text x="320" y="148" font-size="9" fill="var(--text-muted)">central vision</text>
    <text x="330" y="55" font-size="9.5" fill="rgb(180,40,40)">arteries</text>
    <text x="330" y="190" font-size="9.5" fill="rgb(80,100,180)">veins</text>
  </g>
  <g stroke="var(--text-muted)" stroke-width="0.7" fill="none">
    <path d="M170,118 L205,118"/>
    <path d="M316,132 L292,132"/>
  </g>
</svg>
:::

* **Terč zrakového nervu** (optical disk, papilla optici, slepá skvrna) — místo, kde do oka vstupuje a vystupuje zrakový nerv (optical nerve) spolu s *centrální sítnicovou tepnou* (central retinal artery) a *žílou*. Má v průměru asi 1,5 mm.
* **Žlutá skvrna** (macula lutea) — oblast s nejvyšší hustotou čípků, zodpovědná za ostré centrální vidění. V průměru má zhruba 5 mm, uprostřed leží *fovea* (jamka nejostřejšího vidění).
* **Centrální sítnicová tepna** (central retinal artery, CRA) — vstupuje společně se zrakovým nervem a větví se do *horního a dolního* oblouku a dále.
* **Centrální sítnicová žíla** (central retinal vein, CRV) — vede analogicky a zajišťuje odvod krve.

### Vzor cév

Vzor cév se vytvoří *během vývoje plodu* (přibližně 16. týden) a *zůstává stabilní* po celý život.

* **Genetika** (genetics) určuje *globální uspořádání* (lokaci terče zrakového nervu, typický způsob větvení).
* **Epigenetické faktory** (epigenetic factors) ovlivňují *přesný vzor větvení* — proto je odlišný i u *jednovaječných dvojčat*.
* **Vlastnosti:**
  * **Jedinečnost** — *žádné dva* obrazy sítnice nejsou totožné.
  * **Stálost** — od přibližně 1. roku života až do smrti.
  * **Nelze jej zvnějšku změnit** — je chráněn svou anatomickou polohou.

### Změny vlivem nemocí

* **Cukrovka** (diabetes) — *diabetická retinopatie*: mikroaneurysmata, novotvorba cév (neovaskularizace), exsudáty.
* **Vysoký krevní tlak** (hypertenze) — *hypertenzní retinopatie*: zúžení arteriol, změny v místech křížení tepen a žil.
* **Glaukom** (zelený zákal) — změny poměru exkavace k terči zrakového nervu (cup-to-disc ratio).
* **Věkem podmíněná makulární degenerace** (AMD) — ztráta centrálního vidění.

Z pohledu *biometriky* mohou tyto změny zhoršit porovnávání (matching) — vyžadují proto průběžnou aktualizaci registrované šablony (adaptive enrollment).

Z pohledu *medicíny* je naopak snímkování očního pozadí (fundus imaging) primárním diagnostickým nástrojem.

## Snímání sítnice

### Funduskamera (fundus camera)

Specializované zařízení tvoří:

* **Zdroj světla** (viditelné světlo nebo blízké infračervené záření, NIR) — osvětlení zábleskem.
* **Optická soustava** — štěrbinová lampa a kondenzační čočka.
* **Snímač** — vysokorozlišovací čip CCD nebo CMOS.
* **Vzdálenost** — přibližně 5 cm od oka.

### Postup

1. Vyšetřovaná osoba se opírá o **podpěru brady** a **opěrku čela**, aby zůstala v klidu.
2. **Rozšíření zornice** (mydriáza) — pomocí očních kapek se zornice roztáhne. Tato nutnost *omezuje reálné nasazení*.
3. **Zacílení** — obsluha přesně nastaví polohu kamery.
4. **Pořízení snímku** — jeden samostatný obraz.
5. **Posouzení kvality snímku** — případně se snímání opakuje.

### Obtíže

* **Pohyby oka** — během snímání přirozeně dochází k drobným cukavým pohybům (sakádám).
* **Rohovka a čočka** — světlo jimi musí projít, takže jakýkoli zákal vede ke špatnému obrazu.
* **Stažení zornice** — přirozený reflex na silné světlo.
* **Spolupráce snímané osoby** je nutná — metoda *není* vhodná pro sledování (surveillance).

### Mobilní snímání sítnice

* **Welch Allyn iExaminer** — oftalmoskop připojitelný k chytrému telefonu.
* **Aurora Smart Retinal Camera** — ruční přístroj pro primární péči.
* Mají nižší kvalitu než plnohodnotné funduskamery, zato jsou dostupnější.

## Algoritmy

### Extrakce cév

1. **Předzpracování obrazu** — zelený kanál (poskytuje nejlepší kontrast cév).
2. **Segmentace cév:**
   * **Klasická:** přizpůsobené filtry (matched filters), například Frangiho filtr nebo konvoluce zvýrazňující cévy.
   * **Založená na hlubokém učení (DL):** sémantická segmentace sítí U-Net.
3. **Extrakce kostry** — ztenčování (thinning).
4. **Body větvení (bifurkace)** — *místa křížení cév* a *body, kde se céva dělí*.

### Extrakce příznaků

* **Body větvení** — souřadnice a úhly.
* **Délky cév** — vzdálenosti mezi bifurkacemi.
* **Šířky cév**.
* **Střed terče zrakového nervu** — referenční bod pro zarovnání (alignment).

### Porovnávání (matching)

Obdobné porovnávání markant u otisku prstu ([[markanty]]):

* Zarovnání podle středu terče zrakového nervu a dvou nejbližších bifurkací.
* Spočítání shodných příznakových bodů.
* Normalizace skóre.

### Algoritmus Hill / Frome

Klasický algoritmus pro porovnávání sítnice (1978, EyeDentify Inc.):

* 320 referenčních příznaků v okolí terče zrakového nervu (coronal features).
* Porovnání vede k výslednému skóre podobnosti.
* Použit v zařízení EyeDentify EyeScan (od roku 1985).

## Praktická nasazení {tier=practice}

### EyeDentify / EyeScan (od roku 1985)

* První komerční skener sítnice.
* Nasazení v objektech s vysokým zabezpečením: NSA, CIA, FBI, jaderné elektrárny.
* FAR < $10^{-6}$.
* Cena přibližně 10 000 $ za kus.
* Výroba ukončena kolem roku 2000 (nahradilo ji rozpoznávání podle duhovky).

### IriTech IrisShield v režimu sítnice

* Moderní zařízení kombinující duhovku a sítnici.
* Hybridní biometrika.
* Řízení přístupu (access control) ve vysoce zabezpečených objektech.

### Překryv medicíny a biometriky

* Vyšetření diabetické retinopatie pomocí chytrého telefonu spojené s biometrickou identifikací.
* Detekce patologie umělou inteligencí současně s ověřením totožnosti.
* Aravind Eye Care (Indie) — rozsáhlé nasazení ve venkovských oblastech.

## Limity biometriky podle sítnice

### Uživatelská zkušenost

* **Nepříjemný pocit** — silné světlo namířené do oka z bezprostřední blízkosti.
* **Nutné rozšíření zornice** — dočasné rozmazané vidění.
* **Nezbytná spolupráce snímané osoby** — žádné skryté rozpoznávání (covert recognition).
* **Často je potřeba více snímků**.

### Náklady

* Specializovaný hardware (více než 1000 $ za přístroj).
* Vhodná je vyškolená obsluha.

### Zdravotní obavy

* **Silný záblesk** — *přehnané obavy*, jinak je obecně bezpečný.
* **Časté snímkování** — neexistují dlouhodobé studie o používání v četnosti běžné u biometrie.

## Eyrina — kombinované snímání

Akademický projekt zaměřený na *téměř současné* snímání duhovky a sítnice:

* Jedním přístrojem se v rychlém sledu pořídí obraz duhovky i sítnice.
* Hybridní biometrika s vyšší přesností než samostatná modalita.
* Podrobně viz [[snimaci-systemy]].

## Sítnice vs. duhovka

| | **Sítnice** | **Duhovka** |
| :--- | :---: | :---: |
| Snímání | invazivní (zblízka, silné světlo) | neinvazivní |
| Spolupráce uživatele | vysoká | nízká |
| Přesnost | velmi vysoká | velmi vysoká |
| Podvržení (spoofing) | mimořádně obtížné | obtížné (s ochranou proti podvržení) |
| Náklady | vysoké | střední |
| Hromadné nasazení | obtížné | proveditelné |
| Lékařský přínos | vysoký (záchyt patologií) | částečný |

Shrnutí: **duhovku** volíme pro hromadné nasazení, **sítnici** pro velmi vysoké zabezpečení nebo lékařsko-biometrické hybridy.

## Trendy roku 2025

* **Detekce onemocnění sítnice umělou inteligencí** spojená s ověřením totožnosti.
* **OCT** (optická koherentní tomografie) — *3D* snímkování sítnice, *hlubší* než běžná fotografie očního pozadí.
* **Snímání sítnice chytrým telefonem** (stále jen průměrná kvalita).
* **Federované učení** (federated learning) — společné trénování modelů bez sdílení pacientských snímků.

---

*Zdroj: BIO přednášky 2025/26, BIO — Rozpoznávání podle duhovky a sítnice (Drahanský, Semerád). Externí reference: Williams, T. D.: *Biometric Identification — A Comparative Study of Retinal and Iris Recognition* (IEEE Trans. on Information Forensics 2002); Mariño, C. et al.: *Personal Authentication Using Digital Retinal Images* (Pattern Analysis 2006); Frangi, A. F. et al.: *Multiscale Vessel Enhancement Filtering* (MICCAI 1998); STRaDe @ FIT VUT — [strade.fit.vutbr.cz](https://strade.fit.vutbr.cz/).*
