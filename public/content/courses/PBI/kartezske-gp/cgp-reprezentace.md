---
title: Reprezentace CGP
---

**Kartézské genetické programování (CGP)** je forma genetického programování, ve které se počítačový program, matematický výraz nebo digitální obvod reprezentuje jako **orientovaný acyklický graf (DAG)**. Výpočetní elementy — uzly — jsou pomyslně rozmístěny do dvourozměrné kartézské **mřížky** o rozměrech `n_c × n_r` (počet sloupců × počet řádků). Odtud pochází přívlastek „kartézské": pozice každého uzlu je dána souřadnicí v mřížce.

Každý uzel má pevný počet vstupů (typicky dva) a vykonává jednu funkci z předem dané **množiny funkcí Γ** (program alphabet) — například aritmetické operace pro symbolickou regresi nebo hradla `AND`, `OR`, `XOR` pro logickou syntézu.

::: viz pbi-cgp "Mřížka CGP: lineární genotyp (čísla) se dekóduje na fenotyp (graf). Aktivní uzly na cestě k výstupu jsou zvýrazněné, neaktivní (neexprimované) zůstávají v genotypu, ale neovlivňují výpočet. Přepni mezi dvěma genotypy."
:::

## Genotyp versus fenotyp

CGP důsledně odděluje dvě úrovně popisu jedince. **Genotyp** je lineární řetězec celých čísel s **pevnou délkou** — to je objekt, se kterým přímo pracují evoluční operátory. Je tvořen bloky: každý uzel mřížky je zakódován jako n-tice, jejíž

- **propojovací geny** (connection genes) určují indexy uzlů (nebo primárních vstupů), odkud uzel bere své vstupy,
- **funkční gen** (function gene) udává index funkce z množiny Γ.

Za bloky uzlů jsou na konci chromozomu explicitně uvedeny **výstupní geny** (output genes) — indexy uzlů, které tvoří primární výstupy celého systému.

**Fenotyp** je naopak orientovaný acyklický graf, který vznikne **dekódováním** genotypu: postupuje se od výstupních genů zpět a sleduje se, které uzly skutečně přispívají k primárním výstupům. Fenotyp má proto **proměnlivou velikost**, zatímco genotyp je vždy stejně dlouhý.

## Parametr levels-back (L)

Omezení `levels-back` (parametr `L`) určuje, jak daleko „dozadu" se uzel smí propojit: vstupy uzlu mohou pocházet pouze z `L` předcházejících sloupců (nebo z primárních vstupů). Pro `L` rovné počtu sloupců se uzel smí připojit k libovolnému dřívějšímu uzlu; malé `L` naopak vynucuje lokálnější topologii. Tato podmínka spolu s tím, že uzel odkazuje jen na **dříve indexované** uzly, zaručuje, že fenotyp je vždy acyklický.

## Aktivní a neaktivní uzly

Protože výstupy jsou určeny až výstupními geny, v mřížce se téměř vždy nacházejí uzly, jejichž výstup nikdo neodebírá — nevedou k žádnému primárnímu výstupu.

- **Aktivní uzly** leží na cestě k primárním výstupům a reálně ovlivňují chování fenotypu (jsou „exprimované").
- **Neaktivní uzly** (non-coding, „junk") se výpočtu neúčastní. Jsou ale stále součástí genotypu a tvoří jakousi genetickou paměť: mutace, která je znovu zapojí do grafu, je může kdykoli aktivovat.

Tato **fenotypová redundance** — přítomnost nekódujících genů — je klíčová pro účinnost prohledávání a souvisí s pojmem neutrality, který rozvádí navazující podtéma.

::: link "Cartesian Genetic Programming (přehled)" "https://en.wikipedia.org/wiki/Cartesian_genetic_programming"
:::

::: link "J. F. Miller, P. Thomson: Cartesian Genetic Programming (původní práce, PDF)" "https://neuro.bstu.by/ai/Data-mining/Fitness-landscape/miller00cartesian.pdf"
:::

*Zdroj: PBI státnicové okruhy NBIO, VUT FIT. Externí reference: J. F. Miller & P. Thomson – Cartesian Genetic Programming (EuroGP 2000); cartesiangp.com; Wikipedia – Cartesian genetic programming.*
