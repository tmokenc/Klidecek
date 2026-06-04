---
title: Distanční metody (UPGMA, NJ)
---

**Fylogenetický strom** zobrazuje hierarchii vývoje skupiny organismů nebo genů. **Listové uzly** jsou dnes existující sekvence (taxony), **vnitřní uzly** hypotetické společné předky a **délky hran** vyjadřují množství evolučních změn (počet substitucí) nebo dobu vývoje na dané větvi.

**Distanční (vzdálenostní) metody** redukují vstup na jediný objekt — symetrickou **matici vzdáleností** mezi všemi dvojicemi taxonů. Cílem je sestrojit strom, jehož vzdálenosti mezi listy co nejlépe odpovídají hodnotám v matici. Surová počet rozdílných pozic ale **podhodnocuje** skutečný počet substitucí (na jedné pozici mohlo dojít k vícenásobné nebo zpětné mutaci), proto se vzdálenosti opravují **substitučním modelem** — např. Jukes-Cantorovým (JC69).

::: math
d_{JC} = -\tfrac{3}{4}\,\ln\!\left(1 - \tfrac{4}{3}\,p\right)
:::

kde *p* je pozorovaný podíl rozdílných pozic. Logaritmická korekce „dopočítává" skryté vícenásobné záměny; Kimurův model **K80** jde dál a odlišuje pravděpodobnost **tranzic** (purin↔purin, pyrimidin↔pyrimidin) od **transverzí**.

## UPGMA

**UPGMA** (Unweighted Pair Group Method with Arithmetic mean) je jednoduchá aglomerační (shluková) metoda. V každém kroku najde v matici **nejbližší dvojici** shluků, sloučí je do nového vnitřního uzlu a přepočítá vzdálenosti nového shluku k ostatním jako aritmetický průměr **vážený velikostí** slučovaných shluků.

::: math
d_{(A\cup B),\,X} = \frac{|A|\cdot d_{A,X} + |B|\cdot d_{B,X}}{|A| + |B|}
:::

Nový uzel se umístí do výšky *d(A,B)/2*. Sledujte krokování: matice se opakovaně zmenšuje a dendrogram roste, dokud nezbude jediný kořen.

::: viz bif-upgma "UPGMA krok za krokem: slučování nejbližší dvojice, přepočet vzdáleností váženým průměrem a růst ultrametrického dendrogramu"
:::

UPGMA předpokládá **konstantní molekulární hodiny** — že mutace probíhají ve všech větvích stejně rychle. Produkuje proto **ultrametrický** strom, kde jsou všechny listy ve stejné vzdálenosti od kořene. Tento předpoklad je biologicky často nereálný a může vést ke špatné topologii, pokud se rychlost evoluce mezi liniemi liší.

## Neighbor-Joining

**Neighbor-Joining (NJ)** tuto slabinu odstraňuje — **nepředpokládá molekulární hodiny** a hrany různých větví mohou mít různou délku. NJ nesluje prostě dvojici s nejmenší absolutní vzdáleností, ale tu, která je si **blízká a zároveň vzdálená od všech ostatních**. K výběru používá tzv. *Q-matici*:

::: math
Q(i,j) = (n-2)\,d(i,j) - \sum_{k} d(i,k) - \sum_{k} d(j,k)
:::

V každém kroku se sloučí dvojice s **nejmenším** *Q(i,j)*, vytvoří se nový vnitřní uzel a vzdálenosti k němu se přepočítají jako *d(u,k) = ½·[d(i,k) + d(j,k) − d(i,j)]*. Metoda startuje z hvězdicového stromu a postupně „odštěpuje" sousedy. Výsledkem je **nekořenový** strom s minimalizovanou celkovou délkou větví; pro **aditivní** matici NJ zaručeně najde správný strom.

::: quiz "Proč UPGMA produkuje ultrametrický strom, zatímco NJ ne?"
- [x] UPGMA předpokládá konstantní molekulární hodiny, takže všechny listy leží ve stejné vzdálenosti od kořene
- [ ] UPGMA pracuje přímo s vícenásobným zarovnáním, NJ jen s maticí
> UPGMA i NJ jsou obě distanční metody pracující s maticí vzdáleností; rozdíl je v předpokladu o rychlosti evoluce.
- [ ] NJ nedokáže přepočítat vzdálenosti po sloučení
> NJ vzdálenosti přepočítává také, jen jiným vzorcem a bez požadavku na ultrametrii.
- [x] NJ nepředpokládá stejnou rychlost evoluce ve všech větvích, proto dává nekořenový strom s různými délkami hran
:::

::: link "Wikipedia — UPGMA (algoritmus a vzorec přepočtu)" "https://en.wikipedia.org/wiki/UPGMA"
:::

::: link "Wikipedia — Neighbor joining (Q-matice, délky hran, aditivita)" "https://en.wikipedia.org/wiki/Neighbor_joining"
:::

*Zdroj: BIF státnicové okruhy NBIO, VUT FIT. Externí reference: Wikipedia (UPGMA, Neighbor joining, Models of DNA evolution / JC69, K80).*
