---
title: Nehty jako biometrika
---

# Nehty jako biometrika

**Biometrika nehtů (nail biometrics)** je novější a zatím *experimentální* modalita, která využívá *unikátní vzory na ploše nehtu*. Studie ([Garg et al. 2017, *Nail-Plate Biometrics*](https://link.springer.com/article/10.1007/s12517-017-3151-5)) ukazují, že nehty mají *individuální* texturní vzor analogický otisku prstu (i když méně bohatý). Praktické nasazení je zatím omezené, ale výzkumný zájem (research interest) roste.

## Anatomie nehtu

::: svg "Anatomie nehtu: nail plate (vyleštěná tvrdá vrstva), nail bed (růžové podloží), lunula (bílý půlměsíc), cuticle (kůžička)."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="rgba(220,180,160,0.6)" stroke="var(--accent)" stroke-width="1.5">
    <path d="M180,60 Q190,40 270,40 Q350,40 360,60 L360,180 Q350,200 270,200 Q190,200 180,180 Z"/>
  </g>
  <g fill="rgba(255,240,230,0.8)" stroke="var(--accent)" stroke-width="1.2">
    <path d="M200,80 Q210,60 270,60 Q330,60 340,80 L340,170 Q330,185 270,185 Q210,185 200,170 Z"/>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--accent)" stroke-width="0.8">
    <ellipse cx="270" cy="80" rx="40" ry="8"/>
  </g>
  <g fill="rgba(180,120,100,0.4)" stroke="var(--accent)" stroke-width="0.8">
    <path d="M180,60 Q190,40 270,40 Q350,40 360,60 L355,70 L185,70 Z"/>
  </g>
  <g fill="var(--text)" text-anchor="start" font-size="10.5">
    <text x="380" y="60">cuticle (kůžička)</text>
    <text x="380" y="90">lunula (půlměsíc)</text>
    <text x="380" y="130">nail plate</text>
    <text x="380" y="155">nail bed (pod)</text>
  </g>
  <g stroke="var(--text-muted)" stroke-width="0.7" fill="none">
    <path d="M375,60 L350,52"/>
    <path d="M375,85 L290,82"/>
    <path d="M375,128 L290,120"/>
    <path d="M375,155 L290,158"/>
  </g>
</svg>
:::

* **Nehtová ploténka (nail plate)** — tvrdá vrstva keratinu, viditelná část nehtu.
* **Nehtové lůžko (nail bed)** — měkká *růžová* tkáň pod nehtovou ploténkou.
* **Lunula** — bílý *půlměsíc* u kořene nehtu (nejmladší keratin).
* **Kůžička (cuticle / eponychium)** — překrývá kořen nehtu.
* **Volný okraj (free edge)** — okraj nehtu, který přesahuje prst.

## Biometrické rysy

### Povrchové vzory (surface patterns)

Nehtová ploténka má *jemné textury*:

* **Podélné rýhy (longitudinal ridges)** — paralelní *jemné rýhy* vedoucí od kořene k volnému okraji.
* **Příčné rýhy (transverse striations, Beauovy linie)** — *horizontální* rýhy, které vznikají po nemoci nebo stresu.
* **Bílé skvrny (leukonychia)** — bílé skvrny způsobené úrazem (trauma).
* **Pigmentové pruhy (pigmented streaks)** — tmavé pruhy (melanonychie).

### Barva a průsvitnost

* Nehtové lůžko pod ploténkou je *růžové* (krev ve vlásečnicích).
* Lunula je *bílá* (nezralý keratin).
* Distální okraj (vzdálený konec nehtu) je *bílý*, protože už není připojen k nehtovému lůžku.

### Tvar

* **Poměr délky a šířky**.
* **Zakřivení (curvature)** — příčné i podélné.
* Variace dané genetikou, věkem a zaměstnáním.

### Složení

* **Keratin** je hlavní složkou.
* **Síra (sulfur)** obsažená v cysteinu — tvoří disulfidové vazby.
* **Stopové minerály** — zinek (Zn), vápník (Ca), železo (Fe).

## Snímání

### Optická fotografie (optical photography)

* RGB kamera a rovnoměrné osvětlení.
* Makrorežim pro zachycení vysokého detailu.
* Rozlišení: 1000+ dpi pro povrchové vzory.

### Mikroskopické snímání (microscopic imaging)

* Snímání pomocí mikroskopu.
* Vyšší detail, ale pomalé.

### Hyperspektrální snímání (hyperspectral)

* Zachycuje *více vlnových délek*.
* Viditelné světlo i blízká infračervená oblast (NIR).
* Odhalí podpovrchové detaily (strukturu nehtového lůžka).

### 3D skenování

* Zachycuje *zakřivení* i texturu.
* Poskytuje více informací než 2D snímek.

## Algoritmy

### Texturní metody (texture-based)

* Extrahují *texturní rysy*:
  * **Local Binary Patterns (LBP)** — texturní deskriptor.
  * **Odezvy Gaborova filtru (Gabor filter responses)** — směrová textura.
  * **GLCM** (Gray-Level Co-occurrence Matrix, matice společného výskytu úrovní šedi).
* Vektor rysů (feature vector) → klasifikátor SVM nebo k-NN.

### Hluboké učení (deep learning)

* CNN (konvoluční neuronová síť) trénovaná na snímcích nehtů.
* Porovnávání pomocí vnoření (embedding-based matching).
* Omezené datové sady, experimentální využití.

### Multimodální fúze (multimodal fusion)

* **Nehet + otisk prstu** — obojí ze stejného prstu.
* **Nehet + geometrie ruky** — vzájemně se doplňují.

## Vlastnosti

### Stálost

* Povrchové vzory se *mění* s růstem nehtu (úplná výměna nehtu trvá zhruba 6 měsíců).
* Hlubší *texturní charakteristiky* jsou relativně stabilní.
* Úraz (trauma) → dočasné změny (Beauovy linie, leukonychia).

### Unikátnost

* Studie naznačují *střední* míru unikátnosti.
* Jednovaječná dvojčata mají *korelované* vzory nehtů (podobná genetika i strava).
* *Není* tak unikátní jako otisk prstu nebo duhovka.

### Problémy se snímáním

* **Lak na nehty (nail polish)** — zakryje povrchové vzory.
* **Umělé nehty (artificial nails)** — překryjí přirozené vzory.
* **Poškození (broken nails)** — zlomený nehet způsobí dočasné selhání.

## Praktické nasazení

### Současný stav

* **Experimentální** — neexistují žádné produkty pro masový trh.
* **Výzkumný zájem** — alternativní biometrika pro kontexty, kde není otisk prstu k dispozici.

### Lékařské aplikace (medical applications)

* Detekce **onychomykózy (onychomycosis)** — plísňové infekce nehtu.
* **Chudokrevnost (anemia), onemocnění jater a ledvin** — projevují se změnami barvy či tvaru nehtu.
* Diagnostika ze snímků nehtů založená na AI.

### Forenzní hodnota (forensic value)

* **DNA z nehtů** — keratin obsahuje DNA (kontaktní DNA z buněk).
* **Stopové důkazy (trace evidence)** — ostřižky nehtů při kriminálním vyšetřování.
* Toto je *odlišné* od biometrického rozpoznávání nehtů.

## Trendy

* **Snímání nehtů smartphonem** pro výzkumné datové sady.
* **Sofistikovanější rysy** získané pomocí hlubokého učení (DL).
* **Multimodální spojení** s otiskem prstu nebo otiskem dlaně.
* **Sledování zdraví** v kombinaci (např. detekce chudokrevnosti z fotografií nehtů pořízených smartphonem).

## Limity

* **Nízké rozšíření v průmyslu** — otisk prstu je lépe zavedený.
* **Nižší přesnost** než otisk prstu.
* **Hygienické obavy** — dotyk senzoru (alternativou je bezdotykové snímání).
* **Kulturní hledisko** — v některých regionech jsou nehty považovány za soukromé a nevhodné pro biometrické snímání.

## Standardy

* **Žádné** standardy ISO/IEC pro biometriku nehtů (k roku 2025).
* Pouze na úrovni výzkumu.

## Vztah k jiným biometrikám

| | **Nehet** | **Otisk prstu** | **Geometrie dlaně** |
| :--- | :---: | :---: | :---: |
| Unikátnost | střední | vysoká | nízká |
| Stabilita | střední | vysoká | střední |
| Pohodlí pro uživatele | vysoké | střední | vysoké |
| Náklady | nízké | nízké až střední | střední |
| Rozšíření | vzácné | univerzální | okrajové |
| Riziko podvržení (spoofing) | střední | střední | nízké |

Biometrika nehtů zatím **není primární modalitou**, ale má roli v **multimodální fúzi** a v hybridních medicínsko-biometrických aplikacích.

---

*Zdroj: BIO přednášky 2025/26, BIO — Identifikátory ruky (Rydlo). Externí reference: Garg, R. K. et al.: *Nail-plate biometrics: A new approach* (Arabian Journal of Geosciences 2017); Bagchi, S. et al.: *Personal Identification using Nailbed Patterns* (Conference papers); Wikipedia: *Nail (anatomy)* — [link](https://en.wikipedia.org/wiki/Nail_(anatomy)).*
