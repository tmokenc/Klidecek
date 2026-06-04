---
title: Adlemanův experiment
---

V roce 1994 Leonard Adleman jako první prakticky předvedl, že molekuly **DNA** lze použít jako výpočetní médium. Klíčová myšlenka: laboratorní operace molekulární genetiky (syntéza oligonukleotidů, párování komplementárních vláken, ligace, PCR, elektroforéza) lze chápat jako **operace nad řetězci**, a vhodnou posloupností těchto operací dojdeme k výsledku „výpočtu". Jako demonstrační úlohu zvolil **problém Hamiltonovské cesty (HPP)** v orientovaném grafu.

**Hamiltonovská cesta** je cesta, která navštíví každý vrchol grafu **právě jednou**. Rozhodnout, zda taková cesta s daným počátkem a koncem existuje, je NP-úplný problém — klasicky neznáme algoritmus rychlejší než zhruba prohledání exponenciálně mnoha kandidátů. Adlemanův graf měl **7 vrcholů a 14 hran** a obsahoval jedinou Hamiltonovskou cestu.

::: viz bin-adleman "Klikáním sestav Hamiltonovskou cestu; vpravo vidíš, jak se vrcholy kódují jako DNA oligonukleotidy a hrany jako komplementární „splint" řetězce, které cestu spárují a sligují."
:::

## Kódování grafu do DNA

Každému **vrcholu** je přiřazen unikátní krátký oligonukleotid (Adleman použil náhodné **20-merní** sekvence). Každé orientované **hraně** `u → v` odpovídá další oligonukleotid, který je **komplementární** k druhé polovině sekvence vrcholu `u` a k první polovině sekvence vrcholu `v`. Díky komplementaritě bází (A–T, G–C) tato hranová vlákna fungují jako „lepidlo": přiloží se přes šev mezi dva vrcholy, drží je u sebe, a enzym **ligáza** kovalentně spojí cukrofosfátovou kostru — tím vznikne souvislé dvouvláknové vlákno reprezentující cestu.

::: math
\underbrace{\text{vrchol } u}_{20\,\text{bp}}\;\frac{}{}\;\underbrace{\text{vrchol } v}_{20\,\text{bp}}
\qquad\text{hrana } (u\to v) = \overline{\text{2.\,pol.\,}u \,\cdot\, \text{1.\,pol.\,}v}
:::

Protože ve zkumavce je obrovské množství kopií všech oligonukleotidů, párování a ligace proběhnou **paralelně** a vzniknou **náhodné cesty všech délek** současně — krátké, dlouhé i neplatné kombinace. To je podstata **masivního paralelismu**: chemie „vygeneruje" prostor kandidátních řešení v jednom kroku, místo aby je počítač procházel po jednom.

## Filtrování (extrakce) řešení

Z té směsi je třeba vytáhnout právě Hamiltonovskou cestu. Adleman to udělal posloupností standardních laboratorních filtrů:

1. **PCR** s primery odpovídajícími **počátečnímu a koncovému** vrcholu — namnoží jen cesty se správným začátkem a koncem.
2. **Gelová elektroforéza** — ponechá jen molekuly **správné délky** (pro `n` vrcholů má cesta `n·20` bází).
3. **Afinitní separace** (magnetické kuličky se sondou pro každý vrchol) — postupně ověří, že cesta **obsahuje každý vrchol** alespoň jednou.

Pokud po všech filtrech zůstane **alespoň jedna molekula**, Hamiltonovská cesta existuje (a lze ji přečíst sekvenováním). Celý experiment trval **přibližně týden** laboratorní práce — pro graf, který člověk vyřeší tužkou za chvíli. Hodnota experimentu nebyla v rychlosti, ale v **principiálním důkazu**, že biochemie umí provádět výpočet hrubou silou nad obrovským prostorem kandidátů najednou.

::: quiz "Proč Adleman ke kódování hran použil sekvence komplementární k polovinám sousedních vrcholů?"
- [x] Aby se hranové vlákno spárovalo přes šev dvou vrcholů a spojilo je v jedno vlákno
> Komplementarita bází zajistí, že hrana `u→v` „přemostí" konec `u` a začátek `v`; ligáza pak spoj zafixuje.
- [ ] Aby každá hrana měla stejnou délku jako vrchol
> Délka tu není podstatná; rozhodující je komplementarita přes přechod mezi dvěma vrcholy.
- [ ] Aby se zabránilo replikaci pomocí PCR
> Naopak — PCR je jeden z filtračních kroků a komplementarita ji nijak neblokuje.
- [ ] Protože jen komplementární vlákna lze sekvenovat
> Sekvenovat lze libovolné vlákno; komplementarita slouží k samosestavení cest.
:::

::: link "Adleman (1994): Molecular computation of solutions to combinatorial problems (Science)" "https://www.science.org/doi/10.1126/science.7973651"
:::

*Zdroj: BIN státnicové okruhy NBIO, VUT FIT. Externí reference: L. Adleman, „Molecular computation of solutions to combinatorial problems", Science 266 (1994); přehled DNA computingu Hamiltonovské cesty (PubMed 10597033).*
