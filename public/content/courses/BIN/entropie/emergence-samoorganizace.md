---
title: Emergence a samoorganizace
---

# Emergence a samoorganizace

Z mnoha jednoduchých prvků, které spolu jen *lokálně* interagují, dokáže vzniknout složitý globální řád — bez jakéhokoli centrálního dirigenta. Tento jev je jádrem biologií inspirovaných výpočtů: hejna, mraveniště, neuronové sítě i celulární automaty fungují právě takto.

## Dva základní pojmy

* **Samoorganizace** — *spontánní* vznik struktury a uspořádanosti v dynamickém nelineárním systému **bez vnějšího či centrálního řízení**. Pořádek se rodí „zevnitř", jen z interakcí komponent.
* **Emergence** — vznik komplexního *globálního* chování, tvaru či vzoru na základě *lokálních* interakcí velkého počtu komponent. Celek vykazuje vlastnosti, které jednotlivá komponenta nemá (*„celek je víc než součet částí"*).

## Vlastnosti samoorganizujících se systémů

* Jsou to **otevřené dynamické** systémy (vyvíjejí se v čase, vyměňují si energii/informaci s okolím).
* Skládají se z **nelineárních** komponent a obsahují **zpětné vazby**.
* **Chybí** centrální řízení.
* Nacházejí se **daleko od rovnováhy** (v rovnováze by se vývoj zastavil).
* Globální uspořádání vzniká **spontánně** jen z lokálních interakcí.
* Bývají **robustní** — odolné vůči výpadku jednotlivých komponent.

::: svg "Boids (Reynolds 1987): každý jedinec se řídí 3 lokálními pravidly vůči sousedům ve svém okolí — vpravo emergentně vzniká soudržné hejno bez vůdce."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <rect width="540" height="200" fill="var(--bg-inset)"/>

  <!-- LEFT: three local rules -->
  <text x="120" y="20" text-anchor="middle" font-size="11" fill="var(--text-muted)">3 lokalni pravidla (vuci sousedum)</text>

  <!-- separation -->
  <circle cx="40" cy="60" r="20" fill="none" stroke="var(--line)" stroke-width="0.6" stroke-dasharray="2 2"/>
  <path d="M 40 60 l 8 3 l -8 3 z" fill="var(--accent)"/>
  <path d="M 24 52 l 7 3 l -7 3 z" fill="var(--text-muted)"/>
  <line x1="40" y1="60" x2="20" y2="58" stroke="#cf6660" stroke-width="1.2" marker-end="url(#binArr)"/>
  <text x="78" y="58" font-size="10" fill="var(--text)">separace</text>
  <text x="78" y="70" font-size="8.5" fill="var(--text-faint)">odtlac se od prilis blizkych</text>

  <!-- alignment -->
  <path d="M 40 110 l 9 0 l -3 4 z" fill="var(--text-muted)" transform="rotate(20 40 110)"/>
  <path d="M 24 104 l 9 0 l -3 4 z" fill="var(--text-muted)" transform="rotate(20 24 104)"/>
  <path d="M 32 120 l 9 0 l -3 4 z" fill="var(--accent)" transform="rotate(20 32 120)"/>
  <text x="78" y="110" font-size="10" fill="var(--text)">zarovnani</text>
  <text x="78" y="122" font-size="8.5" fill="var(--text-faint)">smer = prumer smeru sousedu</text>

  <!-- cohesion -->
  <circle cx="34" cy="166" r="2" fill="var(--text-faint)"/>
  <path d="M 20 158 l 8 3 l -8 3 z" fill="var(--text-muted)"/>
  <path d="M 48 172 l -8 3 l 8 3 z" fill="var(--text-muted)"/>
  <line x1="24" y1="160" x2="33" y2="165" stroke="var(--accent)" stroke-width="1" marker-end="url(#binArr)"/>
  <line x1="46" y1="174" x2="35" y2="167" stroke="var(--accent)" stroke-width="1" marker-end="url(#binArr)"/>
  <text x="78" y="166" font-size="10" fill="var(--text)">soudrznost</text>
  <text x="78" y="178" font-size="8.5" fill="var(--text-faint)">mir ke stredu okoli</text>

  <!-- arrow to the right -->
  <line x1="300" y1="100" x2="340" y2="100" stroke="var(--accent)" stroke-width="1.6" marker-end="url(#binArr)"/>
  <text x="320" y="92" text-anchor="middle" font-size="9" fill="var(--text-muted)">emergence</text>

  <!-- RIGHT: emergent coherent flock -->
  <text x="440" y="20" text-anchor="middle" font-size="11" fill="var(--text-muted)">globalni vzor: hejno</text>
  <g fill="var(--accent)">
    <path d="M 380 60 l 14 5 l -14 5 z" transform="rotate(-15 380 65)"/>
    <path d="M 410 52 l 14 5 l -14 5 z" transform="rotate(-15 410 57)"/>
    <path d="M 440 66 l 14 5 l -14 5 z" transform="rotate(-15 440 71)"/>
    <path d="M 396 84 l 14 5 l -14 5 z" transform="rotate(-15 396 89)"/>
    <path d="M 426 92 l 14 5 l -14 5 z" transform="rotate(-15 426 97)"/>
    <path d="M 458 100 l 14 5 l -14 5 z" transform="rotate(-15 458 105)"/>
    <path d="M 412 118 l 14 5 l -14 5 z" transform="rotate(-15 412 123)"/>
    <path d="M 444 130 l 14 5 l -14 5 z" transform="rotate(-15 444 135)"/>
    <path d="M 478 138 l 14 5 l -14 5 z" transform="rotate(-15 478 143)"/>
  </g>
  <text x="430" y="172" text-anchor="middle" font-size="8.5" fill="var(--text-faint)">zadny vudce — vzor je pouze emergentni</text>

  <defs>
    <marker id="binArr" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
      <path d="M 0 0 L 6 3.5 L 0 7 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

## Edge of chaos

Mnoho samoorganizujících se a výpočetně „zajímavých" systémů funguje na **hraně chaosu** (*edge of chaos*) — v úzkém přechodovém pásmu mezi *přílišným řádem* (statický, zamrzlý systém, který nic nepočítá) a *přílišným chaosem* (vše se rozpadá, informace se nezachová). Právě zde systém dokáže informaci *uchovávat* i *šířit* a vykazuje nejbohatší — výpočetně nejschopnější — chování.

## Příklad v IT — celulární automaty

Klasickou ukázkou emergence je **úloha majority** na jednorozměrném uniformním synchronním celulárním automatu. Každá buňka přepíná svůj stav jen podle *lokální* přechodové funkce (svého malého okolí), přesto soustava jako celek dokáže vyřešit *globální* otázku: zda počáteční konfigurace obsahovala většinu jedniček, nebo nul. Globální shody je dosaženo **bez jakéhokoli centrálního koordinátora** — to je emergence v čisté podobě.

::: quiz "Co nejlépe charakterizuje emergenci v samoorganizujícím se systému?"
- [x] Globální vzor vzniká z lokálních interakcí komponent bez centrálního řízení.
- [ ] Centrální řídicí jednotka vypočítá optimální stav a rozešle ho komponentám.
- [ ] Systém je v termodynamické rovnováze a nemění se v čase.
- [ ] Každá komponenta musí znát celkový stav systému.
> Emergence i samoorganizace stojí na ryze lokálních pravidlech a zpětných vazbách; systém je otevřený, daleko od rovnováhy a nemá žádného koordinátora.
:::

::: link "C. W. Reynolds — Flocks, Herds, and Schools: A Distributed Behavioral Model (SIGGRAPH, 1987)" "https://www.red3d.com/cwr/papers/1987/boids.html"
:::

::: link "Self-organization — Wikipedia" "https://en.wikipedia.org/wiki/Self-organization"
:::

*Zdroj: BIN státnicové okruhy NBIO, VUT FIT. Externí reference: Reynolds, C. W.: Flocks, Herds, and Schools (SIGGRAPH 1987); Langton, C. G.: Computation at the Edge of Chaos (Physica D, 1990); Wikipedia — Self-organization, Emergence.*
