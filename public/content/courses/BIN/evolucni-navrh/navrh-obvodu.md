---
title: Evoluční návrh číslicových obvodů
---

# Evoluční návrh číslicových obvodů

U číslicových (kombinačních) obvodů evoluce hledá takové propojení hradel, aby obvod realizoval požadovanou logickou funkci. Reprezentace bývá **přímá** — typicky **CGP**: mřížka hradel (AND, OR, XOR, NOT, …), jejichž typ a propojení jsou zapsány v celočíselném chromozomu. Cílem je „porazit" konvenční návrh nebo ho zautomatizovat; doba běhu EA může být dlouhá, pokud přinese inovativní výsledek.

## Fitness funkce: shoda s pravdivostní tabulkou

Pro kombinační obvod je přirozenou specifikací **pravdivostní tabulka**. Fitness se obvykle definuje jako **počet správných výstupních bitů** přes všechny vstupní kombinace. Pro obvod s $K$ vstupy a $m$ výstupy je v tabulce $2^K$ řádků a maximální fitness je $2^K \cdot m$.

::: math
\text{fitness} = \sum_{r=1}^{2^K} \sum_{b=1}^{m} \big[\, y_{r,b}^{\text{obvod}} = y_{r,b}^{\text{cíl}} \,\big]
:::

Plně funkční obvod má fitness rovnu počtu všech bitů; jakmile evoluce dosáhne tohoto maxima, lze přejít na sekundární kritérium (minimalizace počtu hradel, zpoždění, plochy).

## Evoluce obvodu krok za krokem

V následující demonstraci se mřížka dvou hradel se vstupy A, B evolvuje směrem k cílové funkci **XOR**. Každý krok provede **bodovou mutaci** (změní typ hradla nebo jeden vstupní index) a potomka přijme, jen pokud není horší — jde o jednoduchou strategii **1+λ**, typickou pro CGP. Fitness = počet shodných řádků pravdivostní tabulky (ze 4).

::: viz bin-circuit-evolution "Mřížka hradel (AND/OR/XOR/NOT) s evolvovatelným propojením. Tlačítko Mutuj/Evolvuj přibližuje výstup Y k cílové pravdivostní tabulce XOR; vpravo vidíš shodu řádků a fitness 0–4."
:::

## Způsoby vyhodnocení fitness

Vyhodnocení kandidáta lze provést dvěma způsoby — a volba má dopad na rychlost i spolehlivost evoluce:

- **Simulované (extrinsic) vyhodnocení** — obvod se vyhodnotí softwarově (logická simulace hradel). Je *bezpečné a flexibilní*, ale pomalejší. Pro analogové obvody je analogií SPICE simulace, jejíž běh je extrémně časově náročný.
- **Hardwarové (intrinsic) vyhodnocení** — konfigurace se nahraje přímo do fyzického rekonfigurovatelného čipu (FPGA pro číslicové obvody) a změří se reálná odezva. Je *velmi rychlé*, ale hrozí poškození HW (zkraty), závisí na fyzických podmínkách (teplota, výrobní tolerance) a řešení nemusí být přenositelné.

## Thompsonův experiment {tier=example}

Klasickou ukázkou intrinsic evoluce je návrh **tónového diskriminátoru** přímo na konfiguračním bitstreamu rekonfigurovatelného hradlového pole (FPGA Xilinx XC6216). Obvod měl rozlišovat tón 1 kHz od 10 kHz a vystupovat 0/1. Evoluce našla funkční řešení s méně než 40 buňkami a **bez hodinového signálu**. Výsledek fungoval, ale byl „divný": využíval analogové parazitní jevy konkrétního čipu a fungoval jen na tomto kusu křemíku při dané teplotě — některé buňky nebyly logicky propojené, a přesto byly pro funkci nezbytné. Experiment ukázal, že EA dokáže najít řešení mimo prostor lidského návrháře.

::: quiz "Co je hlavní výhodou intrinsic (hardwarového) vyhodnocení oproti simulaci?"
- [x] Rychlost — odezva se měří přímo na fyzickém čipu, bez nákladné simulace.
> Hlavní motivací intrinsic evoluce je odstranit pomalou simulaci a měřit reálnou odezvu HW.
- [ ] Zaručuje přenositelnost řešení mezi různými čipy.
> Naopak — řešení často závisí na konkrétním kusu křemíku a podmínkách (viz Thompson).
- [ ] Nehrozí žádné poškození hardwaru.
> Riziko zkratů a poškození je jednou z nevýhod hardwarového vyhodnocení.
:::

::: link "Evolvable hardware (Wikipedia)" "https://en.wikipedia.org/wiki/Evolvable_hardware"
:::

::: link "Thompson, A.: An Evolved Circuit, Intrinsic in Silicon, Entwined with Physics (ICES 1996)" "https://link.springer.com/chapter/10.1007/3-540-63173-9_61"
:::

---

*Zdroj: BIN státnicové okruhy NBIO, VUT FIT. Externí reference: Thompson, A.: An Evolved Circuit, Intrinsic in Silicon, Entwined with Physics (1996); Evolvable hardware (Wikipedia); Miller, J.F.: Cartesian Genetic Programming (Springer, 2011).*
