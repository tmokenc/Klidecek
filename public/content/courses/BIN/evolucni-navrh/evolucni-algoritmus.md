---
title: Evoluční algoritmus a kódování
---

# Evoluční algoritmus a kódování

**Evoluční algoritmus (EA)** je populační, stochastická prohledávací metoda inspirovaná darwinovskou evolucí. Pracuje s **populací** kandidátních řešení a generuje nová řešení pomocí biologií inspirovaných operátorů (**selekce**, **křížení**, **mutace**) s cílem maximalizovat (nebo minimalizovat) hodnotu **fitness funkce**. V kontextu návrhu obvodů je EA použit *ve fázi návrhu* — výsledkem je hotový obvod, samotný algoritmus není součástí výsledného produktu.

Aby EA fungoval, musí být splněny dva předpoklady:

- Řešení problému (**fenotyp** — zde konkrétní obvod) musíme umět zakódovat jako řetězec, kterému říkáme **chromozom** nebo **genotyp**.
- Musíme umět **ohodnotit kvalitu** každého kandidáta — k tomu slouží fitness funkce.

## Cyklus evolučního algoritmu

EA běží v generacích. Z náhodně inicializované populace se v každé generaci ohodnotí jedinci, vyberou se rodiče, z nich operátory vytvoří potomky a vznikne nová populace. Cyklus se opakuje, dokud není splněna **ukončovací podmínka** (dosažená fitness, počet generací, časový limit).

::: viz bin-ea-cycle "Krokuj cyklus EA: inicializace populace → ohodnocení fitness → selekce rodičů → křížení a mutace → nová populace. Tlačítko Krok posune zvýraznění na další fázi."
:::

## Typické algoritmy

Pojem EA zastřešuje několik historicky odlišných rodin algoritmů. Liší se hlavně reprezentací chromozomu a tím, které operátory používají:

| Algoritmus | Reprezentace | Operátory |
| :--- | :--- | :--- |
| **Genetický algoritmus (GA)** | binární / celočíselný řetězec pevné délky | křížení + mutace |
| **Genetické programování (GP)** | spustitelné struktury (stromy, grafy) | křížení + mutace |
| **Evoluční strategie (ES)** | reálná čísla + adaptivní strategické parametry | převážně mutace |
| **Evoluční programování (EP)** | původně konečné automaty (grafy) | pouze mutace |

U evolučních strategií je zajímavé, že se *míra mutace* (strategický parametr) **adaptuje společně s řešením** — to dává ES nejpropracovanější teoretický základ.

## Kódování obvodu: přímé vs nepřímé

Způsob, jakým fenotyp (obvod) zapíšeme do genotypu, zásadně ovlivňuje, jak velký a jak prohledatelný je stavový prostor.

**Přímé kódování** — každá komponenta má v chromozomu pevně vyhrazené geny, které přímo popisují její vlastnosti. U analogových obvodů geny určují typ součástky (rezistor, kondenzátor, tranzistor), její hodnotu a uzly připojení. U číslicových obvodů je kanonickým příkladem **Kartézské genetické programování (CGP)**.

**Nepřímé (vývojové) kódování** — chromozom neobsahuje přímo strukturu obvodu, ale **předpis (program, pravidla) pro jeho konstrukci**. Vývoj (development) začíná z jednoduchého obvodu (*embrya*) a postupným vykonáváním operátorů ze stromu vzniká finální komplexní schéma.

## Kartézské genetické programování (CGP)

CGP reprezentuje obvod jako **acyklický orientovaný graf** zakódovaný řetězcem celých čísel pevné délky. Uzly jsou uspořádány do 2D mřížky o $n_r$ řádcích a $n_c$ sloupcích; každý uzel představuje jednoduchou funkci (hradlo) a má geny pro **typ funkce** a **indexy vstupů**. Tato struktura zhruba odpovídá architektuře FPGA.

::: math
\text{chromozom} = \underbrace{(f_0, i_0, j_0)}_{\text{uzel } 0}\;\underbrace{(f_1, i_1, j_1)}_{\text{uzel } 1}\;\dots\;\underbrace{(o_0, o_1, \dots)}_{\text{výstupy}}
:::

Parametr **levels-back** ($l$) určuje, z kolika předcházejících sloupců může uzel ve sloupci $j$ brát vstupy (primární vstupy chápeme jako výstupy „nultého" sloupce). Klíčová vlastnost: v genotypu mohou existovat **neaktivní uzly**, které nepřispívají k výstupu. Mutací se z aktivních uzlů stávají neaktivní a naopak — to umožňuje *neutrální drift* a má v CGP velký vliv na fenotyp. Většina uživatelů proto používá **pouze mutaci**; křížení sice bylo navrženo, ale jeho přínos se statisticky neprokázal.

::: quiz "Proč se v CGP nejčastěji používá pouze mutace bez křížení?"
- [ ] Křížení je v grafové reprezentaci výpočetně nemožné.
- [x] Přínos křížení se statisticky neprokázal; mutace s neutrálním driftem (aktivní/neaktivní uzly) funguje lépe.
> Křížení v CGP navrženo bylo, ale neukázalo se jako významně užitečné. Mutace navíc těží z neaktivních uzlů a neutrálního driftu.
- [ ] CGP nepoužívá populaci, takže křížení nedává smysl.
> CGP populaci používá (typicky strategie 1+λ), to není důvod.
:::

::: link "Cartesian Genetic Programming (Wikipedia)" "https://en.wikipedia.org/wiki/Cartesian_genetic_programming"
:::

::: link "Miller, J.F. (ed.): Cartesian Genetic Programming (Springer, 2011)" "https://link.springer.com/chapter/10.1007/978-3-642-17310-3_2"
:::

---

*Zdroj: BIN státnicové okruhy NBIO, VUT FIT. Externí reference: Miller, J.F.: Cartesian Genetic Programming (Springer, 2011); Cartesian Genetic Programming (Wikipedia).*
