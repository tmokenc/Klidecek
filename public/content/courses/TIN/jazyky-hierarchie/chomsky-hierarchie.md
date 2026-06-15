---
title: Chomského hierarchie jazyků
---

# Chomského hierarchie

Gramatika ([[gramatiky]]) může mít pravidla *libovolného tvaru*. Noam Chomsky v roce 1956 navrhl tři postupné restrikce, které vytvářejí *přirozenou hierarchii* gramatik — a tedy i tříd jazyků, které lze generovat. Tato hierarchie organizuje celou teorii formálních jazyků a sestupně odpovídá *čtyřem výpočetním modelům* od Turingova stroje po konečný automat.

## Čtyři typy gramatik

Třídy se rozlišují *podle tvaru pravidel*. Předpokládejme $G = (N, \Sigma, P, S)$.

::: math
\begin{array}{|c|l|l|}
\hline
\textbf{Typ} & \textbf{Tvar pravidel} & \textbf{Název} \\\hline
0 & \alpha \to \beta,\ \alpha \in (N \cup \Sigma)^* N (N \cup \Sigma)^*,\ \beta \in (N \cup \Sigma)^* & \text{obecné (neomezené)} \\\hline
1 & \alpha A \beta \to \alpha \gamma \beta,\ A \in N,\ \alpha, \beta \in (N \cup \Sigma)^*,\ \gamma \in (N \cup \Sigma)^+ & \text{kontextové} \\
& \text{nebo } S \to \varepsilon, \text{ pokud } S \text{ není na pravé straně} & \\\hline
2 & A \to \alpha,\ A \in N,\ \alpha \in (N \cup \Sigma)^* & \text{bezkontextové} \\\hline
3 & A \to xB \text{ nebo } A \to x \mid \varepsilon,\ A, B \in N,\ x \in \Sigma & \text{(pravé) regulární} \\\hline
\end{array}
:::

Číselné označení je *opačně* než intuice: **typ 0 je nejsilnější** (libovolná pravidla), **typ 3 nejslabší** (pravidla velmi striktního tvaru). Čím přísnější tvar, tím méně jazyků lze gramatikou generovat, ale tím *jednodušší* je algoritmus, který kontroluje příslušnost slova k jazyku.

::: viz chomsky-hierarchy "Vyber jazyk; viz označí nejnižší třídu, do které patří, akceptační model a krátký důkaz 'proč ne nižší'. Zkus L_HP — leží v L₀ \\ R, mimo zbytek hierarchie."
:::

## Označení tříd jazyků

Pro každý typ definujeme třídu generovaných jazyků. Tradiční synonyma:

| Typ | Třída | Synonymum |
| :-: | :-: | :--- |
| 0 | $\mathcal{L}_0$ | **rekurzivně vyčíslitelný** jazyk (recursively enumerable, RE) |
| 1 | $\mathcal{L}_1$ | **kontextový** jazyk |
| 2 | $\mathcal{L}_2$ | **bezkontextový** jazyk (context-free) |
| 3 | $\mathcal{L}_3$ | **regulární** jazyk |

Synonymum "rekurzivně vyčíslitelný" pro typ 0 se ukáže, až zavedeme [[ts-definice]] a [[rekurzivni-jazyky]]. Mezitím postačí intuice: $\mathcal{L}_0$ = jazyky, jejichž členy lze *vypsat algoritmem*.

## Inkluze a striktní inkluze

Z definice tvarů pravidel okamžitě plyne **inkluze** typů:

::: math
\mathcal{L}_3 \subseteq \mathcal{L}_2 \subseteq \mathcal{L}_1 \subseteq \mathcal{L}_0.
:::

Tj. *každá* regulární gramatika je zároveň bezkontextová, *každá* bezkontextová je kontextová atd. Je tedy *dolní* hranice, kterou nelze přesáhnout: každý jazyk popsaný restriktivnějším formalismem lze popsat i tím obecnějším.

Mnohem netriviálnější je tvrzení, že inkluze jsou **ostré**:

::: math
\mathcal{L}_3 \subsetneq \mathcal{L}_2 \subsetneq \mathcal{L}_1 \subsetneq \mathcal{L}_0.
:::

Pro každou úroveň existuje *konkrétní jazyk*, který v ní leží, ale ne v úrovni nižší. Tyto separační jazyky jsou kanonickými příklady:

| Inkluze | Separační jazyk | Důkaz |
| :--- | :--- | :--- |
| $\mathcal{L}_3 \subsetneq \mathcal{L}_2$ | $\{a^n b^n \mid n \geq 0\}$ | bezkontextový (lze popsat $S \to aSb \mid \varepsilon$), ale ne regulární — pumping lemma ([[pumping-uzaver]]). |
| $\mathcal{L}_2 \subsetneq \mathcal{L}_1$ | $\{a^n b^n c^n \mid n \geq 0\}$ | kontextový, ale ne bezkontextový — pumping lemma pro CFG ([[vlastnosti-bkj]]). |
| $\mathcal{L}_1 \subsetneq \mathcal{L}_0$ | např. $L_{\mathrm{HP}}$ (jazyk problému zastavení) | rekurzivně vyčíslitelný, ale ne kontextový (kontextové jsou rekurzivní, kdežto $L_\mathrm{HP}$ není — [[problem-zastaveni]]). |

> Důkazy jednotlivých inkluzí jsou rozprostřeny napříč kapitolami a tvoří *kostru* celého kurzu. Kapitola [[pumping-uzaver]] ukáže, proč $a^n b^n \notin \mathcal{L}_3$; [[vlastnosti-bkj]] proč $a^n b^n c^n \notin \mathcal{L}_2$; a [[problem-zastaveni]] proč $L_\mathrm{HP} \notin \mathcal{L}_1$.

## Příklady pro každou úroveň

**Regulární** ($\mathcal{L}_3$). Slova s lichým počtem $0$:

$$
S \to 0A \mid 1S \mid 0,\quad A \to 1A \mid 0S \mid \varepsilon.
$$

**Bezkontextové** ($\mathcal{L}_2$). Palindromy nad $\{a, b\}$ liché délky:

$$
S \to aSa \mid bSb \mid a \mid b.
$$

**Kontextové** ($\mathcal{L}_1$). Slova $\{a^n b^n c^n \mid n \geq 1\}$ — gramatika s *kontextem*:

$$
\begin{aligned}
&S \to aSBC \mid aBC,\quad CB \to BC, \\
&aB \to ab,\quad bB \to bb,\quad bC \to bc,\quad cC \to cc.
\end{aligned}
$$

Pravidlo $CB \to BC$ "překlápí" symboly — to nelze bez kontextu.

**Obecné** ($\mathcal{L}_0$). Libovolná Turingova-stroj-ekvivalentní gramatika. Příklad: gramatika simulující jakýkoli TS na vstupu — generuje právě ta slova, na nichž TS zastaví v přijímacím stavu.

## Alternativní (ekvivalentní) tvary

Restriktivní definice typů 1–3 nejsou jediné možné. Tytéž třídy lze popsat *jinak* — pomocí *ekvivalentních* tvarů gramatik:

* **Typ 1**: ekvivalentní s nemazací podmínkou $\alpha \to \beta$ s $|\alpha| \leq |\beta|$ (plus výjimka $S \to \varepsilon$). Pravidlo "kontext" je *stylistická volba* — obecná nemazací pravidla typu *length-preserving* generují stejnou třídu jazyků.
* **Typ 3**: levé regulární gramatiky ($A \to Bx$ nebo $A \to x \mid \varepsilon$) generují tutéž třídu jako pravé. *Smíšené* gramatiky (s oběma typy pravidel v jedné) jsou už silnější — generují i jiné než regulární jazyky.
* **Typ 2**: $\varepsilon$-pravidla $A \to \varepsilon$ lze odstranit (vyjma případného $S \to \varepsilon$); jednoduchá pravidla $A \to B$ taktéž ([[normalni-formy]]).

## Ekvivalentní výpočetní modely

Centrální výsledek teorie automatů — *každý typ Chomského hierarchie odpovídá určitému výpočetnímu modelu*:

::: math
\begin{array}{|c|c|c|}
\hline
\textbf{Třída jazyků} & \textbf{Automat (rozpoznávací model)} & \textbf{Kapacita paměti} \\\hline
\mathcal{L}_3 & \text{konečný automat (FA)} & \text{konstantní (pouze stav)} \\\hline
\mathcal{L}_2 & \text{zásobníkový automat (PDA)} & \text{neomezený zásobník (LIFO)} \\\hline
\mathcal{L}_1 & \text{lineárně omezený automat (LBA)} & \text{lineární (}O(|w|)\text{ buněk)} \\\hline
\mathcal{L}_0 & \text{Turingův stroj (TS)} & \text{neomezená páska} \\\hline
\end{array}
:::

Tato paralelní hierarchie je rozvedena v [[jazyky-automaty]]. *Klíčový poznatek*: čím silnější paměťový model, tím širší třída jazyků. *Konečná* paměť stačí jen na regulární, *zásobníková* na bezkontextové, *lineární* na kontextové, *neomezená* na vše rozpoznatelné.

## Co to znamená pro praxi

Chomského hierarchie není jen taxonomické cvičení — určuje **algoritmické náklady** na práci s jazykem:

* **Regulární jazyky** ([[konecne-automaty]]): lexikální analýza v překladačích (`flex`, regulární výrazy v `grep`), vyhledávání vzorů, finite-state protokoly. Test příslušnosti: $O(n)$.
* **Bezkontextové** ([[zasobnikove-automaty]]): syntaxe programovacích jazyků (parsování), vyvážené závorky, JSON/XML struktura. Test příslušnosti: $O(n^3)$ obecně (CYK — [[cyk-parsing]]), $O(n)$ pro deterministické CFG.
* **Kontextové**: zřídka samostatně, ale popisují např. odsazování v Pythonu nebo type-checking. Test příslušnosti: PSPACE-úplný.
* **Rekurzivně vyčíslitelné**: vše, co lze v principu spočítat — ale problém členství je *nerozhodnutelný* ([[problem-zastaveni]]).

Hierarchie tedy přímo motivuje, **proč** programovací jazyky mají oddělené *lexery* (regulární) a *parsery* (bezkontextové): pro úsporu času.

## Důkazy ostrosti inkluzí jako "nit kurzu"

Důkazy $\mathcal{L}_3 \subsetneq \mathcal{L}_2$ a $\mathcal{L}_2 \subsetneq \mathcal{L}_1$ jsou zhruba *kombinatorické* (pumping lemma), zatímco $\mathcal{L}_1 \subsetneq \mathcal{L}_0$ vyžaduje **diagonalizaci** — neelementární argument zavedený Cantorem a později Turingem ([[problem-zastaveni]]). Toto kvalitativní rozštěpení je důležité: *uvnitř* hierarchie pracujeme s konečnými svědky, ale *na okraji* musíme používat techniky teorie množin.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=m-uP64Cq9Kc" "SZZ: Chomského hierarchie a vlastnosti jazyků" "Tomáš Kocourek"
:::

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Chomsky, N.: *Three Models for the Description of Language* (IRE Trans. Inf. Theory, 1956); Hopcroft, Motwani, Ullman: *Introduction to Automata Theory, Languages, and Computation* (2nd ed., Addison-Wesley 2001), kap. 9; Sipser, M.: *Introduction to the Theory of Computation* (3rd ed., Cengage 2013), kap. 3; [Stanford Encyclopedia of Philosophy — Chomsky Hierarchy](https://plato.stanford.edu/entries/chomsky/).*
