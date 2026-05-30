---
title: Simulace mezi variantami PRAM
---

# Simulace mezi PRAM variantami — překlad algoritmů

Předchozí kapitola ([[pram-varianty]]) zavedla hierarchii **EREW ⊆ CREW ⊆ COMMON ⊆ ARBITRARY ⊆ PRIORITY**. Algoritmus napsaný pro silnější model nelze *přímo* spustit na slabším — slabší model neumí to, co silnější dovoluje. Klíčové ale je: silnější model lze *simulovat* slabším, byť s **logaritmickým zpomalením**. Konstrukce simulace má dva užitky: praktický (umožňuje *kompilaci* algoritmů mezi modely) a teoretický (dokazuje, že separace mezi modely je *maximálně* logaritmická pro většinu úloh — viz dolní meze).

Tato kapitola probírá *klíčové simulace* a *dolní meze*, které vymezují, kdy se simulace dá zlepšit.

## Hlavní simulační věta

**Věta (Fortune & Wyllie 1978).** Jeden krok PRIORITY CRCW s $p$ procesory a $m$ buňkami sdílené paměti lze simulovat na EREW PRAM v $O(\log p)$ krocích s $p$ procesory a $m \cdot p$ buňkami.

Tato věta je zásadní: dovoluje *libovolný* PRAM algoritmus přeložit na EREW se zpomalením $O(\log p)$.

### Idea konstrukce — LEFTMOST PRISONER

Pro každou původní buňku $M_k$ má EREW *vlastní* skupinu $p$ buněk: jednu „skutečnou" + $p-1$ pomocných. Pomocné buňky se interpretují jako *vnitřní uzly* binárního stromu s $p$ listy.

::: svg "LEFTMOST PRISONER — strom pro nalezení nejlevějšího zájemce"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" fill="var(--bg-card)" stroke-width="1">
    <circle cx="270" cy="30" r="14"/>
    <circle cx="170" cy="80" r="13"/>
    <circle cx="370" cy="80" r="13"/>
    <circle cx="100" cy="130" r="12"/>
    <circle cx="220" cy="130" r="12"/>
    <circle cx="320" cy="130" r="12"/>
    <circle cx="440" cy="130" r="12"/>
    <rect x="40" y="180" width="32" height="22"/>
    <rect x="90" y="180" width="32" height="22"/>
    <rect x="140" y="180" width="32" height="22"/>
    <rect x="190" y="180" width="32" height="22"/>
    <rect x="280" y="180" width="32" height="22"/>
    <rect x="330" y="180" width="32" height="22"/>
    <rect x="390" y="180" width="32" height="22"/>
    <rect x="440" y="180" width="32" height="22"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="270" y="33">root</text>
    <text x="56" y="194">P₁</text>
    <text x="106" y="194">P₂</text>
    <text x="156" y="194">P₃</text>
    <text x="206" y="194">P₄</text>
    <text x="296" y="194">P₅</text>
    <text x="346" y="194">P₆</text>
    <text x="406" y="194">P₇</text>
    <text x="456" y="194">P₈</text>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.7">
    <line x1="270" y1="44" x2="170" y2="80"/>
    <line x1="270" y1="44" x2="370" y2="80"/>
    <line x1="170" y1="93" x2="100" y2="130"/>
    <line x1="170" y1="93" x2="220" y2="130"/>
    <line x1="370" y1="93" x2="320" y2="130"/>
    <line x1="370" y1="93" x2="440" y2="130"/>
    <line x1="100" y1="142" x2="56" y2="180"/>
    <line x1="100" y1="142" x2="106" y2="180"/>
    <line x1="220" y1="142" x2="156" y2="180"/>
    <line x1="220" y1="142" x2="206" y2="180"/>
    <line x1="320" y1="142" x2="296" y2="180"/>
    <line x1="320" y1="142" x2="346" y2="180"/>
    <line x1="440" y1="142" x2="406" y2="180"/>
    <line x1="440" y1="142" x2="456" y2="180"/>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-size="11" font-weight="600">
    <text x="56" y="174">1</text>
    <text x="206" y="174">1</text>
    <text x="406" y="174">1</text>
  </g>
  <text x="20" y="170" fill="var(--text-muted)" font-size="9">listy: 1 = chce zápis</text>
  <text x="270" y="65" fill="var(--accent)" text-anchor="middle" font-size="9">P₁ vyhrává</text>
</svg>
:::

Algoritmus pro jednu buňku $M_k$:

1. **Fáze nahoru po stromě** ($O(\log p)$ kroků). Začneme v listech: každý procesor $P_i$, který chce zapsat do $M_k$, nastaví do svého listu 1. Procházíme úrovněmi zdola nahoru od listů ke kořeni. V každé úrovni:
   - *Levé dítě* (zájemce) postoupí do rodiče a zapíše 1.
   - *Pravé dítě* (zájemce) přečte hodnotu uloženou *levým sourozencem*. Pokud je 0 (nikdo z levé strany), postoupí do rodiče a zapíše 1; pokud je 1, *nepostupuje* (levý vyhrál).

2. Procesor, který doputuje až do **kořene**, je *nejlevější zájemce* — jediný, který *skutečně provede zápis* do $M_k$.

3. **Fáze dolů** (čistění): po simulaci procesory pošlou nuly zpět dolů, aby uvedly buňky do původního stavu.

**Klíčové: žádné dva procesory nečtou tutéž buňku** — vždy jeden levý čte buňku, kterou *jen* on čte. Tedy *exclusive read* je dodržen. EREW vyžadováno.

**Korektnost pro read fázi**: stejnou strukturou se distribuuje hodnota *přečtená* z $M_k$ zpět ke všem procesorům, kteří ji potřebují (každý se podívá do své cesty ke kořeni).

**Čas**: $O(\log p)$ kroků pro každou ze čtyř fází (read up, read down, write up, write down). Celkem $O(\log p)$.

### Zmenšení paměťové režie

Verze výše vyžaduje $m \cdot p$ buněk paměti — pro každou původní jednu $p$ pomocných. *Vylepšení* (Theorem 21.7 v Akl/Reif): pro $m \in \Omega(p)$ stačí *stejný* počet $m$ buněk, sloučením simulačních stromů.

## Separace ARBITRARY vs PRIORITY

Mohou se modely uvnitř CRCW lišit *víc* než jen co do pohodlí?

**Věta (Fich, Ragde, Wigderson 1988).** PRIORITY s $p$ procesory lze simulovat ARBITRARY s $kp$ procesory v čase $O(\log_k p)$ pro libovolné $k \ge 2$.

Pro $k = 2$: simulace v $O(\log p)$. Pro $k = p$: simulace v $O(1)$.

Závěr: separace ARBITRARY ↔ PRIORITY je *malá* (logaritmická maximálně), a při dostatečném násobku procesorů se *vytrácí*.

## Separace CREW vs EREW

**Věta (Cook, Dwork, Reischuk 1986).** Existuje úloha (např. *element distinctness* pro binární vstup délky $n$), kterou CREW PRAM řeší v $O(\log n)$, ale EREW vyžaduje $\Omega(\log n / \log\log n)$. Tj. separace **CREW vs EREW** je *omezená* faktorem $\log\log n$.

Důsledek: nemůžeme očekávat výrazně rychlejší EREW algoritmus pro úlohu, jejíž CREW řešení je optimální v $O(\log n)$.

## Dolní meze pro CRCW

Některé úlohy *nelze* na CRCW řešit v $O(1)$, bez ohledu na to, kolik procesorů použijeme:

**Věta (Beame, Hastad 1987).** PARITY $n$ bitů na CRCW s polynomiálním počtem procesorů vyžaduje $\Omega(\log n / \log\log n)$ kroků.

**Věta (Ragde, Steiger, Szemerédi, Wigderson 1988).** *Element distinctness* na CRCW s $n$ procesory vyžaduje $\Omega(\sqrt{\log n})$.

Tyto výsledky ukazují, že *CRCW není „kouzelný"* — i ten nejsilnější model má dolní meze sub-logaritmického řádu.

## Tabulka simulací

| Originál | Simulační stroj | Procesory | Čas |
| :--- | :--- | :---: | :---: |
| PRIORITY CRCW | EREW PRAM | $p$ | $O(\log p)$ |
| PRIORITY CRCW | COMMON CRCW | $p$ | $O(\log p)$ |
| PRIORITY CRCW | ARBITRARY CRCW | $kp$ | $O(\log_k p)$ |
| ARBITRARY CRCW | COMMON CRCW | $kp$ | $O(\log_k p)$ |
| CREW PRAM | EREW PRAM | $p$ | $\Omega(\log p / \log\log p)$ |

Z toho vyplývá *standardní pravidlo*: **algoritmus navržený pro CRCW se na EREW spustí se zpomalením maximálně $O(\log p)$.**

## Praktický význam

Pro praktického programátora znamenají simulace toto:

1. **Návrh algoritmu** v silnějším modelu (CRCW) je často *jednodušší* — paralelní čtení a libovolný zápis dovoluje stručnější kód.
2. **Implementace** běží zpravidla na slabším modelu (cluster ≈ EREW, multi-core ≈ CREW). Cena překladu je *jen* logaritmický faktor — typicky akceptovatelný.
3. **Dolní mez na silnějším modelu** automaticky dává dolní mez na slabším (s konstantním nebo log-faktorovým zhoršením).
4. **Optimalita** algoritmu se zpravidla zkoumá *v jeho původním modelu*; simulace mění konstanty.

## Brentova teze a slow-down

Vedle simulace mezi modely je důležitá také **Brentova věta** (kap. [[pram-uvod]]): PRAM s $p$ procesory simulovaný s $p' < p$ procesory běží v čase $O(tp/p')$. *Logické* spojení obou:

::: math
\text{algoritmus PRIORITY CRCW v čase } t \text{ s } p \text{ procesory} \\[2pt]
\Rightarrow \text{algoritmus EREW v čase } O(t \log p) \text{ s } p \text{ procesory} \\[2pt]
\Rightarrow \text{algoritmus EREW v čase } O(t p \log p / p') \text{ s } p' \text{ procesory}.
:::

Dvě nezávislé „daně" — *log* za simulaci modelu, *p/p'* za simulaci počtu procesorů. Cost-optimal algoritmus nemusí zůstat cost-optimal po obou simulacích.

## Co dál

[[pram-algoritmy]] aplikuje předchozí kapitoly na *konkrétní úlohy*: paralelní redukci (suma, min, max) v binárním stromě, paralelní hledání ne-seřazeného a seřazeného pole, a porovná čas/cenu mezi variantami EREW, CREW a CRCW. Pokročilejší komunikační operace ([[prefix-sum-uvod]], [[broadcast-redukce]]) pak tvoří *stavební bloky* pro většinu paralelních algoritmů — viz topic Komunikační operace.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Akl, S.G.: *The Design and Analysis of Parallel Algorithms* (Prentice Hall 1989), kap. 21.2–21.4; Reif, J.: *Synthesis of Parallel Algorithms* (Morgan Kaufmann 1993), kap. 20.2; Fortune, S., Wyllie, J.: „Parallelism in random access machines" (STOC 1978, [DOI 10.1145/800133.804339](https://doi.org/10.1145/800133.804339)); Cook, S., Dwork, C., Reischuk, R.: „Upper and lower bounds for parallel random access machines without simultaneous writes" (SIAM J. Comput. 15(1), 1986); Beame, P., Hastad, J.: „Optimal bounds for decision problems on the CRCW PRAM" (STOC 1987); Fich, F.E., Ragde, P.L., Wigderson, A.: „Relations between concurrent-write models of parallel computation" (SIAM J. Comput. 17(3), 1988); Ragde, P., Steiger, W., Szemerédi, E., Wigderson, A.: „The parallel complexity of element distinctness is $\Omega(\sqrt{\log n})$" (SIAM J. Discrete Math. 1(3), 1988).*
