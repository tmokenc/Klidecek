---
title: CRISP-DM — životní cyklus analytického projektu
---

# CRISP-DM — životní cyklus analytického projektu

**CRISP-DM** (Cross-Industry Standard Process for Data Mining, 1996) je referenční metodika pro analytické projekty. Vznikla iniciativou DaimlerChrysler, SPSS a NCR a stala se *de facto* standardem v dolování dat a data science. CRISP-DM strukturuje projekty do **šesti fází** s explicitními zpětnými vazbami — projekt zpravidla není sekvenční, mezi fázemi se vracíme. Pochopení CRISP-DM je klíčové pro koordinaci analytických týmů a komunikaci se *stakeholdery*. I když novější metodiky (TDSP od Microsoftu, Domino's lifecycle) přidávají detaily, jádro CRISP-DM zůstává relevantní.

## Šest fází CRISP-DM

::: svg "CRISP-DM životní cyklus: 6 fází (Pochopení kontextu → Pochopení dat → Příprava dat → Modelování → Zhodnocení → Použití). Šipky ukazují hlavní postup, zpětné vazby mezi fázemi naznačují iterativní povahu."
<svg viewBox="0 0 540 300" font-family="ui-sans-serif, system-ui" font-size="11">
  <g transform="translate(270, 150)">
    <circle cx="0" cy="-110" r="50" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <text x="0" y="-115" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="10">1. Pochopení</text>
    <text x="0" y="-100" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="10">kontextu</text>
    <circle cx="105" cy="-50" r="50" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <text x="105" y="-55" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="10">2. Pochopení</text>
    <text x="105" y="-40" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="10">dat</text>
    <circle cx="105" cy="50" r="50" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <text x="105" y="45" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="10">3. Příprava</text>
    <text x="105" y="60" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="10">dat</text>
    <circle cx="0" cy="110" r="50" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <text x="0" y="105" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="10">4. Modelování</text>
    <circle cx="-105" cy="50" r="50" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <text x="-105" y="45" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="10">5. Zhodnocení</text>
    <circle cx="-105" cy="-50" r="50" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="2"/>
    <text x="-105" y="-55" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="10">6. Použití</text>
    <circle cx="0" cy="0" r="32" fill="var(--bg-inset)" stroke="var(--accent)" stroke-width="1.5"/>
    <text x="0" y="-2" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="11">DATA</text>
    <line x1="40" y1="-90" x2="80" y2="-75" stroke="var(--accent)" marker-end="url(#crisp-arr)"/>
    <line x1="130" y1="-15" x2="135" y2="20" stroke="var(--accent)" marker-end="url(#crisp-arr)"/>
    <line x1="80" y1="85" x2="40" y2="100" stroke="var(--accent)" marker-end="url(#crisp-arr)"/>
    <line x1="-40" y1="100" x2="-80" y2="85" stroke="var(--accent)" marker-end="url(#crisp-arr)"/>
    <line x1="-135" y1="20" x2="-135" y2="-20" stroke="var(--accent)" marker-end="url(#crisp-arr)"/>
    <line x1="-50" y1="-110" x2="40" y2="-110" stroke="var(--accent)" stroke-dasharray="2 2" marker-end="url(#crisp-arr)"/>
  </g>
  <defs>
    <marker id="crisp-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0L10 5L0 10z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

## Fáze 1 — Pochopení kontextu (Business Understanding)

**Cíl**: Dozvědět se *co nejvíce o problému* z hlediska byznysu.

Aktivity:
1. **Pochopení a stanovení cílů** projektu z hlediska organizace. Kritéria úspěšnosti.
   * *Příklad: "Jak více upoutat zákazníka na našich webových stránkách?" → doporučování, personalizace.*
2. **Zhodnocení situace** — dostupné zdroje (lidé, znalosti, data), omezení, čas.
3. **Určení cílů z hlediska DM** — převedení byznysových cílů do definice DM problému + kritéria a metody hodnocení.
   * *Příklad: "Na základě analýzy historických nákupů najdeme skupiny produktů kupovaných současně. (Analýza nákupního košíku.) Cíl: zvýšení času na stránce o 5 %."*
4. **Vytvoření projektového plánu** — ekonomický rozbor, fáze, rizika.

Bez této fáze se hrozí *řešení špatného problému*. Stakeholder chce *prodej*, ne *přesný model*; pokud model bude přesný, ale neaplikovatelný, projekt selže.

## Fáze 2 — Pochopení dat (Data Understanding)

**Cíl**: Dozvědět se *co nejvíce o datech*.

Předpoklady (z předchozí fáze): pochopení problematiky, stanovené cíle, kritéria úspěšnosti, znalost dostupných dat, typ DM úlohy.

Vstupy: dostupné datové zdroje a dokumentace.

Aktivity:
1. **Rozpracování informace** o datech — význam, dostupnost, cena. Věrohodnost dat. Potřeba dalších dat?
2. **Popis dat** — struktura, význam, formát, množství.
3. **Prozkoumání dat** (*explorační analýza*) — popisné statistiky, grafy, korelace.
4. **Zhodnocení kvality dat** — chybějící hodnoty, šum, konzistence.

Výstupy: detailní popis dat + podklady pro vytvoření datové sady. Viz [[datova-sada]].

## Fáze 3 — Příprava dat (Data Preparation)

**Cíl**: Připravit data pro modelování.

Tato fáze tvoří **~60–80 % pracnosti** typického projektu — kvalita dat určuje kvalitu modelu (*Garbage In, Garbage Out*).

Aktivity (více v [[cisteni-dat]] a dalších):
1. **Výběr dat** — která data použít a proč.
2. **Čištění dat** — chybějící hodnoty, šum, nekonzistence.
3. **Integrace dat** — kombinace z více zdrojů, řešení konfliktů.
4. **Úprava datové sady** — redukce dimenzionality, počtu záznamů, řešení nevyváženosti.
5. **Transformace dat** — konstrukce nových atributů, normalizace, diskretizace, kódování kategorických.

Výstup: připravená datová sada vhodná pro dolovací algoritmus.

## Fáze 4 — Modelování (Modeling)

**Cíl**: Sestavit a otestovat modely odpovídající DM úloze.

Aktivity:
1. **Výběr modelovací techniky** — klasifikace, regrese, shlukování, asociace, …
2. **Příprava testovacího plánu** — train/validation/test split, cross-validation.
3. **Vytvoření modelu** — trénování na trénovacích datech.
4. **Ohodnocení modelu** — měření na validačních datech (accuracy, F1, AUC, RMSE…).

Mnoho **iterací** — pro tutéž úlohu se zkouší různé algoritmy a hyperparametry. Často je nutné se vrátit k fázi 3 (více feature engineeringu).

## Fáze 5 — Zhodnocení (Evaluation)

**Cíl**: Posoudit, zda model **splnil byznysový cíl**, ne jen statistická kritéria.

Aktivity:
1. **Interpretace výsledků** z hlediska byznysu — co to znamená pro stakeholdery?
2. **Posouzení procesu** — co se naučilo, co příště zlepšit.
3. **Rozhodnutí o dalším postupu** — nasadit? Vylepšit? Zopakovat fáze 1–4?

Klíčový rozdíl od *technického* hodnocení: model s 95% accuracy může být *bezcenný*, pokud nepokrývá zájmovou subpopulaci. Příklad: fraud detection — 99 % accuracy je triviální (99 % transakcí *není* fraud); důležitý je *recall* na *podvodných* transakcích.

## Fáze 6 — Použití (Deployment)

**Cíl**: Aplikovat model v produkčním prostředí a integrovat ho do byznysových procesů.

Aktivity:
1. **Plán nasazení** — jak model produkčně použít (batch scoring, real-time API, embedded v aplikaci).
2. **Monitoring a údržba** — sledovat *model drift* (kvalita modelu klesá s časem, jak se mění data).
3. **Reporting** — pravidelná hodnocení účinnosti modelu vůči byznysovým KPI.
4. **Plán obnovy** — kdy a jak natrénovat nový model.

V *MLOps* éře je deployment netriviální — A/B testing, canary rollout, model versioning (MLflow, Weights & Biases), feature stores.

## Iterace mezi fázemi

CRISP-DM **není sekvenční**. Šipky v diagramu naznačují *typický směr*, ale často se vracíme:

* Při modelování zjistíme, že atributy nejsou vhodné → fáze 3 (transformace).
* Při zhodnocení zjistíme, že cíl byl špatně definovaný → fáze 1.
* Při použití narážíme na změnu dat → fáze 2.

Centrum diagramu zobrazuje *data* — všechny fáze se kolem nich točí, opakovaně k nim přistupují.

## Příbuzné metodiky

* **SEMMA** (SAS Institute) — Sample, Explore, Modify, Model, Assess. Užší, jen technický pohled.
* **TDSP** (Microsoft Team Data Science Process) — moderní (2018), zaměřená na týmovou kolaboraci, Git, CI/CD.
* **Domino's Lifecycle** — komerční s důrazem na MLOps.
* **OSEMN** — Obtain, Scrub, Explore, Model, iNterpret. Akademický.

CRISP-DM je *nejstarší* (1996) a *nejrozšířenější* — kompromis mezi byznysem a technologií.

## Praktické zkušenosti

* **Fáze 1 je often skipped** — týmy skočí rovnou k modelování. Cena: model neřeší skutečný problém.
* **Fáze 3 trvá nejdéle** — typicky 60–80 % času projektu. Čištění dat je *unsexy*, ale klíčové.
* **Fáze 5 vyžaduje doménového experta** — data scientist sám neumí ohodnotit byznysový impact.
* **Fáze 6 je nejvíce přehlížená** — model v notebooku ≠ produkční systém. *MLOps* je samostatná disciplína.

## Analytické vs. softwarové projekty

| | SW projekt | Analytický projekt |
| :--- | :--- | :--- |
| **Cíl** | funkční software | využitelná znalost |
| **Vstupy** | specifikace | data + DDD problem |
| **Hlavní výzva** | architecture, code quality | data quality, modeling |
| **Iterativnost** | agile sprints | CRISP-DM iterace |
| **Doménový expert** | důležitý | *kritický* (interpretace) |
| **Zaměření** | algoritmy zpracování dat | data + aplikace existujících algoritmů |
| **Reprodukovatelnost** | tests, CI/CD | tests + data versioning + seed |

Klíčový rozdíl: **doménový analytik a expert** hraje *centrální* roli — bez něj je interpretace výsledků nemožná. SW projekt může fungovat i s méně doménové znalosti (specifikace pokryje vše).

## Vstup a výstup analytického projektu

* **Vstupy**: byznysový problém *data-driven decision making* (DDD) nebo hypotéza, data.
* **Výstupy**: znalost (model, vzory, profily) + kvantitativní hodnocení kvality.

```
řešený        → DM         → DM         → interpretovaný
problém        úloha/y       výsledek      výsledek
       \         /              ↓
        \       /              feedback do dalších iterací
         data
```

::: link "Wirth, R., Hipp, J.: CRISP-DM — Towards a Standard Process Model for Data Mining (PAKDD 2000)" "https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=48b9293cfd4297f855867ca278f7069abc6a9c24"
:::

::: link "Provost, F., Fawcett, T.: Data Science for Business (kniha)" "https://data-science-for-business.com/"
:::

---

*Zdroj: UPA přednáška *Získávání znalostí z dat — úvodní informace* (Burgetová). Externí reference: Wirth, R., Hipp, J.: *CRISP-DM — Towards a Standard Process Model for Data Mining*, PAKDD 2000; Chapman, P. et al.: *CRISP-DM 1.0 Step-by-step data mining guide*, SPSS Inc. 2000; Provost, F., Fawcett, T.: *Data Science for Business*, O'Reilly 2013; EMC Education Services: *Data Science and Big Data Analytics*, Wiley 2015.*
