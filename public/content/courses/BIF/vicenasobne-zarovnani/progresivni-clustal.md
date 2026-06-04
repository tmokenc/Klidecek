---
title: Progresivní zarovnání a CLUSTAL
---

# Progresivní zarovnání a CLUSTAL

Exaktní vícerozměrné DP ([[msa-problem]]) je pro reálná data neřešitelné, proto se používá **progresivní (heuristické) zarovnání**. Hlavní myšlenka: z $k$ sekvencí vyber dvě, zarovnej je a nahraď je jedinou „pseudosekvencí" (profilem) — tím klesne počet objektů na $k-1$. Postup se opakuje, dokud není zarovnáno vše. Pořadí slučování není libovolné: řídí ho **naváděcí strom (guide tree)**, který spojuje nejdřív nejpodobnější sekvence.

## Algoritmus CLUSTAL ve třech krocích

::: math
\text{1) párové vzdálenosti} \;\to\; \text{2) naváděcí strom} \;\to\; \text{3) progresivní slučování}
:::

1. **Porovnání všech dvojic** sekvencí mezi sebou a sestavení tabulky podobnosti (vzdáleností) — to je výpočetně nejnáročnější krok, řádově $\binom{k}{2}$ párových zarovnání.
2. **Sestavení naváděcího stromu** ze vzdálenostní matice (např. shlukováním **UPGMA**, které opakovaně spojuje dvojici nejbližších shluků; novější ClustalW používá metodu **spojování sousedů, neighbor-joining**).
3. **Progresivní zarovnávání** po větvích stromu: nejprve nejpodobnější pár, pak se přidávají další sekvence / profily v pořadí daném stromem.

## Profil místo všech znaků

Zapisovat při slučování všechny jednotlivé znaky by bylo nepřehledné, proto se zarovnaný blok reprezentuje jako **profil**: sloupcový vektor (matice), který v každé pozici udává **frekvenční (procentuální) zastoupení** jednotlivých znaků abecedy a mezer. Při výpočtu buňky DP matice mezi dvěma profily se skóre shody spočítá jako **vážený průměr** skóre všech kombinací znaků podle jejich frekvencí a hodnot ze substituční matice $M(x,y)$:

::: math
cmp(p, q) = \sum_{x}\sum_{y} f_p(x)\, f_q(y)\, M(x, y)
:::

kde $f_p(x)$ je frekvence znaku $x$ ve sloupci profilu $p$. Z profilu se odvozuje i **konsenzus** — nejčastější znak v každém sloupci.

## "Once a gap, always a gap"

Klíčové (a zároveň nejslabší) pravidlo progresivního přístupu: jakmile je mezera (gap) vložena při některém raném slučování, **už se neodstraní ani neposune** — jen se propaguje do dalších, větších profilů. Předpoklad zní, že nejlepší informace o umístění mezer je mezi nejpodobnějšími sekvencemi (které slučujeme první). Krokuj si to na příkladu:

::: viz bif-progressive-msa "Krokuj progresivní MSA: naváděcí strom ((A,B),(C,D)) určuje pořadí slučování. Nejprve nejpodobnější pár A,B, pak C,D (vznikne zamrzlá mezera, zvýrazněná), nakonec slučování dvou profilů. Sleduj, jak se raná mezera jen propaguje — \"once a gap, always a gap\" — a jak roste konsenzuální řádek."
:::

## Nevýhody a ClustalW

- **Pomalost**: nejnáročnější je porovnání všech dvojic a stavba vzdálenostní matice.
- **Neopravitelnost**: hotové zarovnání už nelze změnit (greedy postup). Ani nejlepší pořadí slučování nemusí vést ke globálně optimálnímu výsledku — chyba z raného kroku se „zamrzne" a táhne dál.

Vylepšená verze **ClustalW** tyto slabiny zmírňuje: používá dynamické programování místo rychlého heuristického párování, jiný algoritmus pro stavbu stromu (neighbor-joining) a hlavně **váhování sekvencí podle jejich významnosti** — odtud písmeno **W** (*weighted*). Váhy potlačují vliv skupin velmi podobných sekvencí, aby nedominovaly skóre.

::: quiz "Co znamená pravidlo \"once a gap, always a gap\" v progresivním zarovnání?"
- [x] Mezera vložená v dřívějším kroku se v pozdějších krocích už neodstraní ani neposune, jen propaguje.
  > Přesně tak — proto je progresivní přístup greedy a chyba z raného slučování se nedá napravit.
- [ ] Každá sekvence musí obsahovat alespoň jednu mezeru.
  > Ne, mnoho sekvencí žádnou mezeru mít nemusí; pravidlo se týká neměnnosti už vložených mezer.
- [ ] Mezery se smí vkládat pouze na konec sekvence.
  > Ne, mezery mohou vzniknout kdekoliv; pravidlo říká jen, že se po vložení nemění.
- [ ] Naváděcí strom se po každém kroku přepočítává.
  > Ne, strom se spočítá jednou na začátku a určuje pevné pořadí slučování.
:::

::: link "EMBL-EBI — Clustal Omega / ClustalW (progresivní zarovnání, guide tree)" "https://www.ebi.ac.uk/jdispatcher/msa/clustalo"
:::

::: link "Thompson, Higgins, Gibson: CLUSTAL W (původní článek, Nucleic Acids Res. 1994)" "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC308517/"
:::

*Zdroj: BIF státnicové okruhy NBIO, VUT FIT. Externí reference: Thompson, J.D., Higgins, D.G., Gibson, T.J.: „CLUSTAL W" (Nucleic Acids Research 1994); EMBL-EBI Training — Multiple Sequence Alignment / Clustal Omega; Wikipedia „Multiple sequence alignment" (progressive alignment).*
