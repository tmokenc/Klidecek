---
title: 'Dynamické programování: NW a SW'
---

# Dynamické programování: NW a SW

Počet všech možných zarovnání dvou sekvencí roste exponenciálně, takže hrubá síla je nepoužitelná. **Dynamické programování** (DP) rozkládá úlohu na podproblémy: optimální zarovnání prefixů se skládá z optimálních zarovnání kratších prefixů. Vyplníme 2D tabulku $S$, kde řádky odpovídají jedné sekvenci a sloupce druhé, a každou vnitřní buňku spočítáme jako **maximum ze tří směrů**:

::: math
S(i,j) = \max \begin{cases}
S(i-1,\,j-1) + s(a_i,\,b_j) & \text{(diagonála: shoda / záměna)} \\
S(i-1,\,j) + g & \text{(shora: mezera v horní sekvenci)} \\
S(i,\,j-1) + g & \text{(zleva: mezera v levé sekvenci)}
\end{cases}
:::

Diagonální posun bere skóre záměny $s(a_i, b_j)$ ze skórovací matice (např. BLOSUM), posun shora/zleva přičítá penalizaci za mezeru $g$. U každé buňky si pamatujeme, *odkud* maximum přišlo — to později určí cestu zpětného průchodu.

## Globální zarovnání: Needleman-Wunsch

**Needleman-Wunsch** (1970) zarovnává sekvence **jako celek** a penalizuje každou mezeru včetně koncových. První řádek a sloupec se inicializují **kumulativní penalizací** ($S(0,j) = j \cdot g$, $S(i,0) = i \cdot g$). Skóre podél cesty může klesnout i do záporu. Zpětný průchod (**traceback**) začíná vždy v **pravém dolním rohu** $S(m,n)$ a sleduje uložené šipky až do levého horního rohu; tím vznikne jedno zarovnání celé délky.

::: viz bif-nw-align "DP matice pro dvě krátké sekvence. Tlačítkem 'krok' vyplňuješ buňky (každá = max ze tří směrů, šipka ukazuje vybraný směr), po naplnění matice kroky pokračují zpětným průchodem a zvýrazní optimální cestu i výsledné zarovnání. Přepínač 'lokální (SW)' přepne na Smith-Waterman s nulami."
:::

## Lokální zarovnání: Smith-Waterman

**Smith-Waterman** (1981) hledá **nejlepší shodný úsek**, ne zarovnání celých sekvencí — vhodné, když sdílejí jen doménu nebo motiv. Liší se ve dvou bodech:

- V rekurenci se přidá čtvrtá možnost **0** — pokud by skóre kleslo pod nulu, buňka se nastaví na **0**. Tím se "zapomene" špatně začínající zarovnání a místní úsek může začít kdekoliv.
- Traceback **nezačíná v rohu**, ale v buňce s **globálním maximem**, a končí v první buňce se skóre **0**.

::: math
S(i,j) = \max \{\, 0,\; S(i-1,j-1) + s(a_i,b_j),\; S(i-1,j) + g,\; S(i,j-1) + g \,\}
:::

Existuje i **semiglobální** varianta (hledání krátké sekvence v dlouhé): koncové mezery se nepenalizují — inicializace nulami a maximum se hledá v posledním řádku/sloupci.

## Složitost a optimalita

Vyplnění tabulky i traceback běží v čase i paměti $\mathcal{O}(nm)$ (Hirschbergův trik sníží paměť na $\mathcal{O}(n)$). DP je **exaktní** — garantuje *optimální* zarovnání pro dané skóre. To je rozdíl oproti heuristickému dot plotu i oproti BLAST: kvadratická složitost ale znamená, že proti velké databázi je DP příliš pomalé.

::: quiz "V čem se Smith-Waterman liší od Needleman-Wunsch v rekurenci?"
- [x] Přidává možnost 0 — záporná skóre se ořežou na nulu
  > Nula umožní lokálnímu zarovnání začít kdekoliv a "zapomenout" špatný začátek.
- [x] Traceback začíná v buňce s maximem, ne v pravém dolním rohu
  > Lokální zarovnání nemusí sahat ke konci sekvencí, proto se startuje od maxima.
- [ ] Používá jinou skórovací matici než NW
  > Skórovací matici (PAM/BLOSUM) i gap penalizaci lze použít stejné; liší se jen rekurence a start tracebacku.
:::

::: link "Needleman & Wunsch (1970), J. Mol. Biol. — originální článek" "https://doi.org/10.1016/0022-2836(70)90057-4"
:::

::: link "Smith & Waterman (1981), J. Mol. Biol. — Identification of Common Molecular Subsequences" "https://doi.org/10.1016/0022-2836(81)90087-5"
:::

*Zdroj: BIF státnicové okruhy NBIO, VUT FIT. Externí reference: Needleman & Wunsch (1970) J. Mol. Biol. 48:443; Smith & Waterman (1981) J. Mol. Biol. 147:195; EMBL-EBI Training — Pairwise Sequence Alignment.*
