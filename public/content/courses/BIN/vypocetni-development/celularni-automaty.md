---
title: Celulární automaty a Wolframovy třídy
---

# Celulární automaty a Wolframovy třídy

**Celulární automat (CA)** je paralelní výpočetní model s **lokální interakcí** výpočetních elementů, který pracuje v **diskrétním prostoru i čase**. Z extrémně jednoduchých lokálních pravidel přitom vzniká bohaté globální (emergentní) chování — proto je CA oblíbený model výpočetního developmentu, modelování fyzikálních a biologických systémů i generátorů pseudonáhodných čísel.

## Stavba modelu

CA je tvořen **pravidelnou mřížkou buněk**. Každá buňka se v čase *t* nachází v jednom stavu z konečné množiny stavů *Q*. Stavy se aktualizují **synchronně** v diskrétních krocích podle **lokální přechodové funkce**, jejímž jediným vstupem je stav buňky a stavy jejích sousedů.

- **Konfigurace** *c(t)* je stav všech buněk v čase *t*; **výpočtem** CA rozumíme posloupnost konfigurací *c(0), c(1), c(2), …*
- **Okrajové podmínky** u konečné mřížky: nejčastěji **cyklické** (zřetězení do prstence / toru) nebo **konstantní**.
- Pravidlo je **lokální a uniformní** — stejná přechodová funkce platí pro všechny buňky, žádné centrální řízení neexistuje.

::: math
c_i(t+1) = F\bigl(c_{i-1}(t),\, c_i(t),\, c_{i+1}(t)\bigr)
:::

## 1D a 2D varianty

**1D CA** mají buňky uspořádané v řadě. Typické je **3-sousedství** (buňka + levý a pravý soused), případně 5-sousedství. **2D CA** mají buňky v rovině a používají dva základní typy sousedství:

- **von Neumannovo okolí** — 4 hranou sousedící buňky (sever, jih, východ, západ) + středová buňka.
- **Mooreovo okolí** — všech 8 okolních buněk (včetně diagonálních) + středová buňka. Tohle okolí používá například *Conwayova Hra života* (Game of Life).

## Elementární 1D CA a prostor pravidel

**Elementární celulární automat (ECA)** je nejjednodušší netriviální případ: **2 stavy** (0/1), 3-sousedství. Lokální pravidlo musí předepsat výstup pro každý ze **2³ = 8** možných vzorů okolí; pravidlo je tedy 8bitové číslo, kterých je celkem **2⁸ = 256**. Jednotlivá pravidla se podle Wolframa značí svým dekadickým kódem (např. *pravidlo 30*, *110*).

Pokud kreslíme jednu generaci pod druhou, vznikne prostoročasový rastr, ve kterém je charakter pravidla okamžitě vidět:

::: viz bin-eca "Elementární 1D CA: zvol pravidlo 0–255, generace běží shora dolů. Přednastavená pravidla ukazují všechny čtyři Wolframovy třídy."
:::

## Wolframovy třídy chování

Stephen Wolfram analyzoval dynamiku všech 256 elementárních pravidel (typicky z náhodné počáteční konfigurace) a rozdělil ji do **čtyř kvalitativních tříd**:

- **Třída I — ustálení v homogenním stavu.** Vývoj téměř ze všech počátečních konfigurací vede ke stejnému uniformnímu stabilnímu stavu (vše 0 nebo vše 1). Veškerá počáteční informace se ztratí. *Příklad: pravidlo 0.*
- **Třída II — periodické / stabilní lokální struktury.** Vznikají stabilní nebo periodicky oscilující prostorově lokalizované struktury; změny počáteční konfigurace se šíří jen lokálně. *Příklad: pravidlo 50.*
- **Třída III — deterministický chaos.** Vzniká zdánlivě náhodný, neperiodický vzor. Drobná změna počátku se šíří lavinovitě (vysoká citlivost na počáteční podmínky), entropie je maximální. *Příklad: pravidlo 30* — Wolfram jej využil i jako generátor pseudonáhodných čísel.
- **Třída IV — komplexní struktury na hraně chaosu.** Vznikají lokalizované struktury, které se pohybují a vzájemně interagují (gliders). Systém leží na přechodu mezi řádem a chaosem a je dostatečně mocný pro **univerzální výpočet**.

**Pravidlo 110** je klíčový příklad třídy IV: Matthew Cook dokázal (2004, emulací cyklického tag systému), že je **Turingovsky úplné** — patří k nejjednodušším známým univerzálním výpočetním systémům.

::: quiz "Které pravidlo elementárního CA bylo dokázáno jako Turingovsky úplné a reprezentuje Wolframovu třídu IV?"
- [ ] Pravidlo 30
> Pravidlo 30 je chaotické (třída III) a slouží jako PRNG, ne jako univerzální stroj.
- [ ] Pravidlo 90
> Pravidlo 90 generuje Sierpińského fraktál (nested vzor), univerzalita nebyla dokázána.
- [x] Pravidlo 110
> Pravidlo 110 (třída IV) je univerzální — Turingovsky úplné, dokázal Matthew Cook (2004).
- [ ] Pravidlo 0
> Pravidlo 0 je triviálně třída I — vše zhasne do homogenního stavu 0.
:::

::: link "Elementary cellular automaton — Wikipedia (Wolframovy třídy, pravidla 30/90/110)" "https://en.wikipedia.org/wiki/Elementary_cellular_automaton"
:::

::: link "Rule 110 — Wikipedia (důkaz Turingovské úplnosti, Matthew Cook 2004)" "https://en.wikipedia.org/wiki/Rule_110"
:::

---

*Zdroj: BIN státnicové okruhy NBIO, VUT FIT. Externí reference: Wolfram, S.: A New Kind of Science (Wolfram Media, 2002); Cook, M.: Universality in Elementary Cellular Automata (Complex Systems 15, 2004); Wikipedia — Elementary cellular automaton, Rule 110.*
