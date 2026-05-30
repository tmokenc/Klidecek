# Procesy a jejich definice

Po předchozích přednáškách, které se věnovaly **datům** (objektový model, JPA) a **rozhraním** (REST, GraphQL, autentizace), se nyní zaměřujeme na třetí pilíř informačního systému — **procesy**. Procesy realizují transformace nad daty a obvykle se modelují pomocí **transakcí**, ovšem v reálu naráží na situace, kde klasická ACID transakce nestačí. Tato přednáška buduje *cestu k workflow systémům*: od jednoduché ploché transakce přes savepoints, chained transakce, distribuované 2PC a SAGA, až po zotavitelné fronty a Jakarta Messaging.

## Procesy ve schématu IS

Informační systém lze shrnout jako trojici:

- **Data** uchovávající *stav* systému (databáze).
- **Procesy** realizující *transformace* (často ve formě transakcí).
- **Vstupy a výstupy** propojující IS s okolím.

Obojí (data i procesy) musí být **izomorfní s reálným systémem** — model musí věrně odrážet to, co se děje v podnikové realitě, jinak IS neslouží svému účelu.

## UML stavový diagram

Procesy v IS modelujeme nejčastěji jako **stavové stroje**. UML stavový diagram má tři standardní prvky:

- **Počáteční stav** — plný kruh, vstup do procesu.
- **Stav** — zaoblený obdélník s třemi sekcemi: *název, stavové proměnné, činnosti* (`entry / do / exit`).
- **Koncový stav** — kruh s tečkou uvnitř, ukončení procesu.

Mezi stavy se kreslí **přechody** s případnou **strážní podmínkou** `[podmínka]` v hranatých závorkách. Přechod se uplatní jen tehdy, je-li podmínka pravdivá.

:::svg
<svg viewBox="0 0 540 200" xmlns="http://www.w3.org/2000/svg" style="max-width: 580px;">
  <defs>
    <marker id="arrA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--text)"/>
    </marker>
  </defs>
  <circle cx="40" cy="100" r="9" fill="var(--text)"/>
  <rect x="120" y="60" width="200" height="80" rx="14" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
  <line x1="120" y1="92" x2="320" y2="92" stroke="var(--accent)"/>
  <line x1="120" y1="118" x2="320" y2="118" stroke="var(--accent)"/>
  <text x="220" y="83" text-anchor="middle" font-family="ui-sans-serif" font-size="13" font-weight="bold" fill="var(--text)">stav</text>
  <text x="220" y="108" text-anchor="middle" font-family="ui-sans-serif" font-size="11" fill="var(--text)">proměnné</text>
  <text x="220" y="133" text-anchor="middle" font-family="ui-sans-serif" font-size="11" fill="var(--text)">entry/do/exit</text>
  <circle cx="480" cy="100" r="12" fill="none" stroke="var(--text)" stroke-width="2"/>
  <circle cx="480" cy="100" r="6" fill="var(--text)"/>
  <line x1="49" y1="100" x2="115" y2="100" stroke="var(--text)" stroke-width="2" marker-end="url(#arrA)"/>
  <line x1="320" y1="100" x2="464" y2="100" stroke="var(--text)" stroke-width="2" marker-end="url(#arrA)"/>
  <text x="400" y="92" text-anchor="middle" font-family="ui-monospace" font-size="11" fill="var(--accent)">[podmínka]</text>
</svg>
:::

## Typy procesů — Chomského hierarchie

Podle síly modelu (gramatika / automat) rozlišujeme tři typy procesů:

| Typ procesu | Model (gramatika) | Automat | Pravidlo |
| :--- | :--- | :--- | :--- |
| **Sekvenční** | regulární | konečný (FSM) | `A → b B` nebo `A → b` |
| **Hierarchický** | bezkontextová | zásobníkový (PDA) | `A → b B pokračováníA` |
| **Obecný** | neomezená | Turingův stroj | `a A b → c B d` |

### Sekvenční procesy

Stavový diagram s lineárními přechody — výpočet je posloupnost stavů řízená vstupy (událostmi nebo strážními podmínkami). Vstup může být i prázdný (epsilon přechod). Tento typ odpovídá konečnému automatu a tvoří **základní jednotku popisu řízení** v IS.

### Hierarchické procesy

Některý stav je vnitřně strukturován jako další stavový stroj — vznikají **vnořené stavové stroje**. Po ukončení vnořeného procesu se výpočet vrací do nadřazeného stavu (analogie volání podprogramu). Vstup *musí být vždy označen*, jinak hrozí nekonečný cyklus. Vnitřní kontext nadřazeného procesu se udržuje pomocí zásobníku — v UML stavovém diagramu se značí pseudostavem `H` (*history*).

### Obecné procesy

Pravidla typu `a A b → c B d` jsou tak silná, že **stavový diagram už nelze nakreslit** — popis je nutno provést v obecném programovacím jazyce. Pokud za paměť stroje považujeme data IS uložená v databázi, dostáváme **obecné procesy** — algoritmický kód, který čte a mění databázový stav.

## Dvouúrovňové schéma procesů

Pro IS se zavádí klíčové **dvouúrovňové schéma**:

```
Vrstva řízení:    stavový diagram  (sekvence, hierarchie)
        ↓
Vrstva stavů:     obecné procesy / transakce  (v každém stavu)
```

- **Vrstva řízení** = sekvenční/hierarchický stavový stroj. Rozhoduje, *kdy* která akce proběhne, ale sama s daty nepracuje.
- **Vrstva stavů** = v každém stavu se vykonává obecný proces — typicky **transakce** nad databází, která mění stav IS.

Tato dekompozice je zásadní motivace pro celou přednášku: ve **vrstvě řízení** se vystačíme s jednoduchými stavovými stroji, kdežto ve **vrstvě stavů** budeme potřebovat propracované **modely transakcí** (ploché, zřetězené, kompenzující, distribuované) — viz [[transakce-acid]] a navazující sekce.

:::svg
<svg viewBox="0 0 540 220" xmlns="http://www.w3.org/2000/svg" style="max-width: 580px;">
  <defs>
    <marker id="arrB" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--text)"/>
    </marker>
  </defs>
  <ellipse cx="180" cy="50" rx="140" ry="35" fill="none" stroke="var(--accent)" stroke-width="2"/>
  <text x="180" y="55" text-anchor="middle" font-family="ui-sans-serif" font-size="13" font-weight="bold" fill="var(--text)">Vrstva řízení (stavový diagram)</text>
  <line x1="180" y1="92" x2="180" y2="118" stroke="var(--text)" stroke-width="2" marker-end="url(#arrB)"/>
  <ellipse cx="180" cy="160" rx="180" ry="40" fill="none" stroke="var(--danger, #b91c1c)" stroke-width="2"/>
  <text x="180" y="155" text-anchor="middle" font-family="ui-sans-serif" font-size="13" font-weight="bold" fill="var(--text)">Vrstva stavů — obecné procesy</text>
  <text x="180" y="178" text-anchor="middle" font-family="ui-sans-serif" font-size="12" fill="var(--text)">(transakce nad databází)</text>
  <text x="538" y="50" text-anchor="end" font-family="ui-sans-serif" font-size="11" fill="var(--text-muted)">sekvence/hierarchie</text>
  <text x="538" y="170" text-anchor="end" font-family="ui-sans-serif" font-size="11" fill="var(--text-muted)">obsah jednotlivých kroků</text>
</svg>
:::

Pokud přechody ve stavovém diagramu *nemají žádné podmínky* — tedy řízení nemá co rozhodovat — obě vrstvy se přirozeně **slévají v jeden objekt: zřetězenou transakci** (viz [[zretezene-transakce]]).

---

*Zdroj: PIS přednáška 6 — Procesy, pokročilé modely procesů, cesta k workflow, doc. Ing. Radek Burget, Ph.D., FIT VUT v Brně, 2025/2026. Externí reference: UML 2.5.1 specifikace (OMG, [https://www.omg.org/spec/UML/](https://www.omg.org/spec/UML/)), Chomského hierarchie gramatik.*
