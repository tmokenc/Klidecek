---
title: Skryté Markovovy modely pro geny
---

# Skryté Markovovy modely pro geny

**Skrytý Markovův model** (*Hidden Markov Model*, HMM) sjednocuje signální i obsahové senzory do jednoho pravděpodobnostního rámce a nabízí pro rozpoznávání genů poměrně vysokou úspěšnost. Myšlenka: genom čteme jako řetězec **emisí** (nukleotidů `A`,`C`,`G`,`T`), které generuje stroj přepínající mezi **skrytými stavy** odpovídajícími biologickým úsekům — *mezigenová oblast*, *exon*, *intron* (a v jemnějších modelech i start kodon, donor, akceptor, stop). Stavy nevidíme; vidíme jen sekvenci. Úkolem je z viditelné sekvence **rekonstruovat skrytou cestu stavů** = anotaci genu.

## Definice modelu

HMM je dán pěticí: množina stavů, **počáteční** pravděpodobnosti $\pi$, **přechodové** pravděpodobnosti $a_{jk}$ (přechod ze stavu $j$ do $k$) a **emisní** pravděpodobnosti $b_k(x)$ (stav $k$ vydá symbol $x$). Markovovský předpoklad: další stav závisí jen na aktuálním stavu, ne na celé historii.

::: math
\sum_{k} a_{jk} = 1 \qquad \sum_{x} b_k(x) = 1
:::

Topologie přechodů kóduje **biologii**: z exonu lze přejít do intronu jen přes **donorové** místo (`GT`), z intronu zpět do exonu jen přes **akceptorové** (`AG`) — nebiologické přechody dostanou nulovou pravděpodobnost. Emise zachytí obsahové senzory: exonové stavy preferují kodonovou statistiku kódujících oblastí (typicky GC-bohatší), intronové stavy spíše AT-bohaté pozadí.

## Tři úlohy a Viterbiho algoritmus

Nad HMM se řeší tři klasické úlohy: **vyhodnocení** $P(x)$ (dopředný algoritmus), **dekódování** nejpravděpodobnější cesty stavů (Viterbi) a **trénink** parametrů. Pro anotaci genu nás zajímá dekódování — najít cestu stavů $\pi^\*$, která maximalizuje pravděpodobnost společně s pozorovanou sekvencí $x_1\dots x_T$:

::: math
\pi^\* = \arg\max_{\pi}\; P(x, \pi)
:::

**Viterbiho algoritmus** to řeší dynamickým programováním. Buňka $V_t(k)$ drží log-pravděpodobnost nejlepší cesty, která pozici $t$ končí ve stavu $k$. Z předchozího sloupce se vybere nejvýhodnější předchůdce a přičte se emise (log se používá kvůli numerické stabilitě — místo násobení mnoha malých čísel sčítáme logaritmy):

::: math
V_t(k) = \max_{j}\Big[\, V_{t-1}(j) + \log a_{jk} \,\Big] + \log b_k(x_t)
:::

Současně se ukládá **zpětný ukazatel** na argmax předchůdce. Po vyplnění poslední pozice se vezme stav s nejvyšším $V_T$ a **zpětným průchodem** (traceback) se po ukazatelích zrekonstruuje celá cesta — výsledná posloupnost stavů je hledaná anotace na exony, introny a mezigenovou oblast.

::: viz bif-hmm-gene "Viterbi nad HMM se třemi stavy (intergenová / exon / intron) emitujícími nukleotidy. Krokuj zleva doprava: každý sloupec spočítá V[t][k] z předchozího sloupce, pak zpětný průchod vyznačí nejpravděpodobnější cestu stavů (modře) = anotace genu. GC-bohatý úsek se anotuje jako exon, AT-bohatý jako intron."
:::

Časová složitost je $\mathcal{O}(T \cdot K^2)$ ($T$ délka sekvence, $K$ počet stavů — pro každou z $T$ pozic se nad každým z $K$ stavů hledá nejlepší z $K$ předchůdců), paměť $\mathcal{O}(T \cdot K)$ na uložení tabulky a ukazatelů. Při řídké topologii (mnoho zakázaných přechodů) klesá na $\mathcal{O}(T \cdot (K+E))$, kde $E$ je počet povolených přechodů.

## Aplikace HMM na rozpoznání genů

1. **Sestavení modelu** — z biologické znalosti struktury genu se navrhnou stavy a povolené přechody (exon → donor → intron → akceptor → exon, …).
2. **Trénování modelu** — emisní a přechodové pravděpodobnosti se odhadnou ze sekvencí se *známými* geny. Při **jednoznačném** přiřazení stavů znakům stačí prosté **počítání četností**; při **nejednoznačném** (anotaci stavů neznáme) se použije **Viterbiho trénování** nebo **Baumův–Welchův algoritmus** (EM iterující přes dopředné/zpětné pravděpodobnosti).
3. **Analýza neznámé sekvence** — pro novou sekvenci $S$ se Viterbiho algoritmem najde nejpravděpodobnější rozdělení na exony, introny a mezigenovou oblast.

::: quiz "Co vrací Viterbiho algoritmus aplikovaný na HMM rozpoznávající geny?"
- [x] Jednu nejpravděpodobnější posloupnost skrytých stavů (anotaci na exon/intron/mezigen.)
  > Viterbi je dekódování — maximalizuje P(x, π) přes všechny cesty a zpětným průchodem vydá jedinou nejlepší cestu stavů, kterou interpretujeme jako anotaci genu.
- [ ] Celkovou pravděpodobnost sekvence P(x) přes všechny cesty
  > To počítá dopředný (forward) algoritmus — sčítá příspěvky všech cest; Viterbi naopak maximalizuje a vrací jednu cestu.
- [ ] Emisní a přechodové pravděpodobnosti modelu
  > Ty jsou vstupem (parametry modelu); odhadují se trénováním (počítání četností / Baum-Welch), ne Viterbim.
:::

::: link "Eddy (2004) What is a hidden Markov model? Nature Biotechnology" "https://doi.org/10.1038/nbt1004-1315"
:::

::: link "Viterbi algorithm — Wikipedia (rekurence a složitost O(T·K²))" "https://en.wikipedia.org/wiki/Viterbi_algorithm"
:::

*Zdroj: BIF státnicové okruhy NBIO, VUT FIT. Externí reference: Eddy (2004) What is a hidden Markov model?, Nat. Biotechnol.; Wikipedia: Viterbi algorithm; Burge & Karlin (1997) GENSCAN, J. Mol. Biol.; Durbin et al., Biological Sequence Analysis (HMM, Baum-Welch).*
