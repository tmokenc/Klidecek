---
title: Dynamika stisku kláves (keystroke dynamics)
---

# Dynamika stisku kláves (keystroke dynamics)

**Dynamika stisku kláves (keystroke dynamics)** identifikuje *osobu* podle *způsobu*, jakým píše na klávesnici — podle rytmu stisku kláves, časování (timing) a sledu pauz. Patří mezi *pasivní* behaviorální biometriky — funguje *průběžně* během běžného psaní, *bez další námahy* uživatele. Je proto vhodná pro **průběžnou autentizaci (continuous authentication)**, tedy ověřování totožnosti, které probíhá nepřetržitě po celou dobu práce.

## Princip

Lidské psaní je *behaviorální motorický vzor* — naučený pohybový návyk, který se u člověka opakuje. Při psaní *stejné* věty se u *stejné* osoby projevuje:

* **Doba stisku (dwell time)** — jak dlouho je klávesa stisknuta (od stisku klávesy po její uvolnění).
* **Doba letu (flight time)** — interval mezi *uvolněním* jedné klávesy a *stiskem* další.
* **Intervaly bigramů (bigram intervals)** — časování pro běžné dvojice písmen ("th", "he", "in").
* **Přítlak (pressure)** (u lepších klávesnic) — síla každého stisku.
* **Časování n-gramů (N-graph timing)** — sledy 2, 3 nebo 4 stisků.

::: svg "Časování stisků: sekvence stisk klávesy → uvolnění klávesy. Dwell = doba stisku, flight = mezera mezi klávesami."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--accent)" stroke-width="2" fill="none">
    <path d="M40,130 L40,100 L80,100 L80,130 L120,130 L120,100 L160,100 L160,130 L200,130 L200,100 L260,100 L260,130 L300,130 L300,100 L340,100 L340,130 L380,130 L380,100 L460,100 L460,130 L500,130"/>
  </g>
  <g fill="rgb(64,192,87)" font-size="10" text-anchor="middle">
    <text x="60" y="92">d₁</text>
    <text x="140" y="92">d₂</text>
    <text x="230" y="92">d₃</text>
    <text x="320" y="92">d₄</text>
    <text x="420" y="92">d₅</text>
  </g>
  <g fill="var(--danger, #d33)" font-size="10" text-anchor="middle">
    <text x="100" y="148">f₁</text>
    <text x="180" y="148">f₂</text>
    <text x="280" y="148">f₃</text>
    <text x="360" y="148">f₄</text>
  </g>
  <g fill="var(--text)" font-size="10" text-anchor="middle">
    <text x="60" y="170">'H'</text>
    <text x="140" y="170">'e'</text>
    <text x="230" y="170">'l'</text>
    <text x="320" y="170">'l'</text>
    <text x="420" y="170">'o'</text>
  </g>
  <g fill="var(--text-muted)" font-size="9.5" text-anchor="start">
    <text x="40" y="50">d = dwell time (key down)</text>
    <text x="280" y="50">f = flight time (between)</text>
  </g>
</svg>
:::

## Snímání

### Softwarový keylogger

* Zachytává události stisku i uvolnění kláves spolu s velmi přesnými časovými značkami.
* Využívá háčky operačního systému (Windows: SetWindowsHookEx; Linux: evdev; macOS: NSEvent).
* **Vzorkování:** standardně přesnost na úrovni milisekund.
* **V prohlížeči:** události JavaScriptu keydown/keyup.

### Hardwarová klávesnice

* Běžné klávesnice fungují bez problémů.
* **Mechanické klávesnice** s N-key rolloverem (současné snímání více kláves) poskytují kvalitnější události.
* **Klávesnice snímající přítlak** (vzácné) zaznamenávají sílu stisku.

### Dotyková obrazovka

* **Softwarové klávesnice telefonů** — dynamika dotyku.
* **Klávesnice tabletů** — kombinace doby stisku (dwell time) a přítlaku dotyku (force touch).
* **Odlišný model** než u fyzické klávesnice.

## Příznaky (features)

### Pro jednotlivý stisk

* **Doba stisku (dwell time)** $d_i$ — trvání i-tého stisku klávesy.
* **Doba letu (flight time)** $f_{i,j}$ — interval mezi uvolněním klávesy i a stiskem klávesy j.

### Příznaky n-gramů (N-graph)

* **Digraf (digraph)** (2 stisky) — běžné dvojice písmen (th, he, in, an).
* **Trigraf (trigraph)** (3 stisky) — tři písmena.
* **N-gram (N-graph)** — zobecnění.

### Pro celého uživatele

* **Průměr a rozptyl** dob stisku přes všechny klávesy.
* **Průměrné doby letu** pro konkrétní bigramy.
* **Rychlost psaní** (slov za minutu, WPM).
* **Chybovost** (počet stisků klávesy Backspace).
* **Vzor střídání rukou**.

## Algoritmy

### Statistické

* **Průměr a směrodatná odchylka** dob stisku a dob letu.
* **Mahalanobisova vzdálenost (Mahalanobis distance)** — zohledňuje korelaci mezi příznaky.

### Strojové učení

* **Klasifikátor k-NN** — jednoduchý a účinný.
* **SVM** s jádrem RBF.
* **Random Forest** — zvládá nelineární vzory.

### Hluboké učení

* **RNN / LSTM** — model časové posloupnosti.
* **Transformer** — pozornost (attention) nad posloupnostmi stisků.

::: viz keystroke-rhythm "Napište přesně frázi nebo nechte simulovat — vidíte profil dwell/flight a Mahalanobisovu vzdálenost vůči registrovanému profilu."
:::

## Případy použití

### Text závislý na obsahu (challenge)

* **Stejná fráze** psaná pokaždé (např. přihlašovací heslo).
* Vyšší přesnost (vstup je řízený a opakovatelný).
* **EER:** 5–15 % (typicky).

### Text nezávislý na obsahu (volné psaní)

* Uživatel píše *libovolný* obsah (např. během běžné práce).
* Nižší přesnost (vstup je méně konzistentní).
* **EER:** 10–25 %.

### Průběžná autentizace (continuous authentication)

* **Sledování psaní** po celou dobu relace.
* **Detekce "změny uživatele"** — pokud se vzor psaní změní, systém vyžádá opětovné ověření.
* **Příklad použití:** bankovní aplikace běžící na pozadí.

## Praktická nasazení {tier=practice}

### Bankovnictví

* **BioCatch** (izraelská firma) — behaviorální biometriky včetně dynamiky stisku kláves pro online bankovnictví.
* **BehavioSec** — platforma pro behaviorální biometriku.
* **TypingDNA** — API pro autentizaci na základě psaní.

### Pracoviště

* **Průběžné monitorování** zaměstnanců pracujících na dálku.
* Ochrana proti podvádění u online zkoušek.
* **TypingDNA Verify** — bezheslové dvoufaktorové ověření (2FA) na základě psaní.

### Online zkoušky

* **Coursera, edX** — ověřování dynamiky stisku kláves během dohlížených zkoušek.
* **Detekce výměny totožnosti** uprostřed zkoušky.

### Detekce vnitřní hrozby (insider threat)

* Behaviorální základní profil každého uživatele.
* Upozornění, pokud se vzor psaní *náhle změní* (kompromitovaný účet).

## Vlastnosti

### Výhody

* **Pasivní:** žádný hardware navíc, žádná akce uživatele navíc.
* **Průběžná:** funguje po celou dobu relace.
* **Nízká cena:** stačí běžná klávesnice.
* **Šetrná k soukromí:** nezachycuje biometrický *obsah*, pouze *časování*.

### Nevýhody

* **Nižší přesnost** než obličej, otisk prstu nebo duhovka.
* **Vysoká variabilita:**
  * Únava.
  * Nálada.
  * Různé klávesnice.
  * Souběžné úkoly (přerušení během psaní).
* **Stárnutí:** vzory psaní se v čase vyvíjejí.
* **Nevhodná pro jednorázovou autentizaci** — přesnost je příliš nízká.

## Ochrana proti podvržení (anti-spoofing)

### Přehrávací útok (replay attack)

* Předem zaznamenané časování stisků přehrané softwarem.
* **Obrana:** výzva-odpověď (challenge-response) — pokaždé jiná fráze.

### Napodobování (mimicry)

* Člověk se snaží psát jako jiná osoba.
* *Kvalitní systémy je obtížné* dlouhodobě a spolehlivě oklamat.

### Automatizované psaní

* Boti, kteří píší nadlidskou rychlostí nebo s příliš pravidelným časováním.
* **Snadno odhalitelné** — nelidské vzory.

## Standardy

* **Doporučení NIST pro dynamiku stisku kláves** — ad hoc, žádný formální standard.
* **EN ISO/IEC 19794** dynamiku stisku kláves formálně nepokrývá (zahrnuje jiné behaviorální biometriky).

## Limity

### Stabilita

* **Není absolutní** — silná únava, zdravotní stav nebo změna klávesnice (z notebooku na externí) může vzor výrazně změnit.
* Je nutné pravidelné opětovné zaregistrování (re-enrollment).

### Demografické vlivy

* **Věk:** mladší uživatelé vs. starší — odlišné vzory.
* **Mateřský jazyk:** psaní v cizím jazyce se liší od psaní v rodném jazyce.
* **Postižení:** poruchy hybnosti, RSI (syndrom z opakovaného přetížení).

## Dynamika myši (mouse dynamics) — analogie

Podobné dynamice stisku kláves, ale pro *pohyby myši*:

* **Časování kliknutí.**
* **Rychlost a zrychlení pohybu.**
* **Vzory tažení (drag).**
* **Chování při rolování (scroll).**

Často se kombinuje s dynamikou stisku kláves pro bohatší behaviorální biometriku.

## Trendy

* **Rámce (framework) pro průběžnou autentizaci** — kombinují dynamiku stisku kláves + myš + dotyk + chůzi (gait).
* **Federované učení (federated learning)** — model se trénuje na zařízeních uživatelů, žádná centralizovaná data o psaní.
* **Postupy založené na hlubokém učení** — dominují architektury typu Transformer.
* **Specifické pro mobilní zařízení** — psaní na dotykové obrazovce jako hlavní modalita.

## Vztah k jiným biometrikám

| | **Stisk kláves** | **Myš** | **Hlas** |
| :--- | :---: | :---: | :---: |
| Pasivní | ano | ano | částečně |
| Průběžná | ano | ano | částečně |
| Přesnost | nízká | nízká | střední |
| Námaha | žádná | žádná | malá |
| Hardware | běžná klávesnice | běžná myš | mikrofon |

Dynamika stisku kláves je *součástí* portfolia behaviorálních biometrik — obvykle se používá ve *fúzi* s ostatními, nikoli samostatně.

---

*Zdroj: BIO přednášky 2025/26, BIO 12 — Dynamické biometrické vlastnosti. Externí reference: Monrose, F., Rubin, A. D.: *Keystroke dynamics as a biometric for authentication* (Future Generation Computer Systems 2000); Killourhy, K. S., Maxion, R. A.: *Comparing Anomaly-Detection Algorithms for Keystroke Dynamics* (DSN 2009); Banerjee, S. P., Woodard, D. L.: *Biometric Authentication and Identification Using Keystroke Dynamics: A Survey* (Journal of Pattern Recognition Research 2012); TypingDNA — [typingdna.com](https://www.typingdna.com/).*
