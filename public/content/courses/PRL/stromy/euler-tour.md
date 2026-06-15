---
title: Euler tour — paralelní průchod stromem
---

# Euler tour — paralelní průchod stromem

Stromy jsou *rekurzivně* definované struktury — sekvenční algoritmy (DFS, BFS) je *přirozeně* procházejí v $O(n)$. Paralelně je situace mnohem zajímavější: triviální procházení by *vyžadovalo*, aby každý uzel věděl, kdy je „na řadě" — což je *sekvenční úzké hrdlo*. **Euler tour** (Eulerovská cesta) je *elegantní trik*: strom převedeme na *Eulerovský graf*, jehož orientovaná kružnice projde každou hranou *právě jednou*. Tato kružnice se reprezentuje *seznamem následníků*, a pak lze pomocí *paralelního list rankingu* (sumy prefixů) získat v $O(\log n)$ libovolnou *globální* informaci o stromě — pořadí preorder/postorder/inorder, hloubku, počet potomků, pozici listu.

## Idea — strom jako orientovaný cyklus

Pro neuspořádaný strom $T = (V, E)$ definujeme **orientovaný graf** $T' = (V, E')$ tak, že každou *neorientovanou* hranu $\{u, v\}$ nahradíme dvěma *orientovanými* hranami $\langle u, v \rangle$ a $\langle v, u \rangle$.

**$T'$ je Eulerovský graf**: každý uzel má *degree-in = degree-out* (každá neorientovaná hrana přispěje +1 do degree-in i +1 do degree-out, takže i *celkový stupeň* je sudý). Existuje tedy Eulerovská kružnice — orientovaná uzavřená cesta, která projde každou hranu *právě jednou*.

::: svg "Strom T a jeho Eulerovský graf T' s 2(n-1) hranami"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="100" cy="40" r="14"/>
    <circle cx="60" cy="120" r="13"/>
    <circle cx="120" cy="120" r="13"/>
    <circle cx="160" cy="120" r="13"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="100" y="44">1</text>
    <text x="60" y="124">2</text>
    <text x="120" y="124">3</text>
    <text x="160" y="124">4</text>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.8">
    <line x1="95" y1="52" x2="65" y2="108"/>
    <line x1="100" y1="54" x2="120" y2="108"/>
    <line x1="105" y1="52" x2="155" y2="108"/>
  </g>
  <text x="110" y="170" fill="var(--text-muted)" text-anchor="middle" font-size="10">Strom T — 3 hrany</text>
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="400" cy="40" r="14"/>
    <circle cx="350" cy="120" r="13"/>
    <circle cx="420" cy="120" r="13"/>
    <circle cx="480" cy="120" r="13"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="400" y="44">1</text>
    <text x="350" y="124">2</text>
    <text x="420" y="124">3</text>
    <text x="480" y="124">4</text>
  </g>
  <g stroke="var(--accent)" stroke-width="0.9" fill="none" marker-end="url(#etarrow)">
    <path d="M 390,52 Q 370,75 357,108"/>
    <path d="M 362,108 Q 380,75 396,52"/>
    <path d="M 400,55 Q 410,75 418,108"/>
    <path d="M 422,108 Q 410,75 404,55"/>
    <path d="M 412,52 Q 445,75 470,108"/>
    <path d="M 477,108 Q 445,75 410,52"/>
  </g>
  <defs>
    <marker id="etarrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="415" y="170" fill="var(--text-muted)" text-anchor="middle" font-size="10">Eulerovský graf T' — 6 orientovaných hran</text>
  <text x="270" y="195" fill="var(--accent)" text-anchor="middle" font-size="10">Eulerovský graf má 2(n-1) hran</text>
</svg>
:::

## Reprezentace Etour funkcí následníka

Eulerovská kružnice se reprezentuje **funkcí následníka** `Etour: E' → E'`, která každé hraně přiřazuje *hranu následující za ní* na kružnici.

**Vstup**: seznam sousednosti (adjacency list) — pro každý uzel $v$ uložená cyklická posloupnost hran vycházejících z $v$.

**Výstup**: pole `Etour[1..2n-2]` s následníkem každé hrany.

### Konstrukce Etour — algoritmus

Pro orientovanou hranu $e = \langle u, v \rangle$ s *reverzní* hranou $e^R = \langle v, u \rangle$:

- Pokud `next(eR)` v seznamu sousednosti uzlu $v$ existuje → `Etour(e) = next(eR)`.
- Jinak (eR je *poslední* v seznamu) → `Etour(e) = AdjList(v).first` (cyklicky zpět na první).

```
procedure CONSTRUCT_ETOUR
  Input: adjacency list of T
  Output: array Etour with 2n - 2 entries
  
  for i = 1 to 2n - 2 do in parallel
    let e = (u, v)
    if next(eR) ≠ nil then
      Etour(e) = next(eR)
    else
      Etour(e) = AdjList(v).first
```

**Čas**: $O(1)$ paralelně — každá hrana se zpracuje *nezávisle*.

### Příklad

Pro strom v obrázku (uzly 1, 2, 3, 4 spojené přes 1):

Seznam sousednosti:

```
1: e1 e3        // e1 = (1,2), e3 = (1,4)
2: e2           // e2 = (2,1)
3: e6           // e6 = (3,1), atd.
4: e4           // ...
```

Etour výsledek:

```
e1 → e2 (zpět do 1) → e3 (do 4) → e4 → ... → cyklus
```

## Zavedení kořene

Eulerovská cesta je *kružnice*. Pro stromy s *kořenem* (rooted tree) chceme *průchod* (ne kružnici) — *přeřízneme* kružnici v jednom místě.

```
zvolíme kořen r
zvolíme hranu e_root vedoucí "do" kořene
Etour(e_root) = e_root  // self-loop = konec
```

Tím Eulerovská cesta začne ve specifickém uzlu a *skončí* návratem do kořene (kde nemá pokračování).

## List ranking — pozice každé hrany

**Úloha**: pro každou hranu $e$ v Etour spočítat **rank** = pozici v sekvenci ($0$ pro první, $2n - 3$ pro poslední).

Klasický **list ranking** problém: dán propojený seznam, najít vzdálenost každého prvku od konce. Sekvenčně $O(n)$. Paralelně **$O(\log n)$** technikou *pointer jumping*:

```
procedure LIST_RANKING(list)
  for each element e in parallel: rank[e] ← 1
  for k = 1 to log n do
    for each element e in parallel:
      if next[e] ≠ nil:
        rank[e] ← rank[e] + rank[next[e]]
        next[e] ← next[next[e]]              // jump
```

V iteraci $k$ se ukazatele „zdvojí" — po $\log n$ iteracích každý element ukazuje na konec a obsahuje *vzdálenost*.

::: viz list-ranking "Vyber lineární / obrácený / zamíchaný seznam a krokuj iterace. Sleduj, jak se arcs zdvojnásobují (v iteraci k pointer skáče přes 2^k uzlů). Modré rank zatím není finální, zelené je už shodné s cílem."
:::

### Analýza

- Iterací: $\log n$.
- Každá iterace: $O(1)$ paralelně.
- **Čas**: $O(\log n)$.
- **Procesory**: $n$.
- **Cena**: $O(n \log n)$ — *není cost-optimal*, ale standardní implementace.

**Optimální list ranking** v $O(n)$ ceně existuje (Cole & Vishkin 1986) — *deterministic coin tossing* pro 3-barvení seznamu. Zjednodušení: pro praktické účely je $O(n \log n)$ dostatečné.

::: viz euler-tour "Fáze 1: krokuj konstrukci Euler tour (2(n−1) orientovaných hran). Fáze 2: pointer-jumping list ranking — distance se v každé iteraci zdvojnásobuje."
:::

### Pozice v Etour

Po list rankingu Etour seznamu:

```
posn(e) = 2n - 2 - rank(e)        // 0-indexovaná pozice od začátku
```

Tj. první hrana má pozici 0, poslední $2n - 3$.

## Nalezení rodičů

**Vstup**: Etour a kořen $r$.

**Výstup**: pro každý uzel $v \neq r$ jeho rodič `parent(v)`.

**Trick**: hranu $(u, v)$ klasifikujeme jako:

- **Dopředná** (forward): `posn(u, v) < posn(v, u)` — od rodiče k synovi.
- **Zpětná** (backward): `posn(u, v) > posn(v, u)` — od syna k rodiči.

Pak: pokud $(u, v)$ je dopředná, pak $u$ je rodičem $v$.

```
for each edge e = (u, v) do in parallel
  if posn(e) < posn(eR) then
    parent(v) ← u
parent(root) ← nil
```

**Čas**: $O(1)$ po výpočtu posn (který trvá $O(\log n)$).

**List**: uzel $v$ je *list*, pokud z něj nevychází *dopředná* hrana — žádný uzel ho neoznačuje jako rodiče.

## Celková analýza

| Krok | Čas |
| :--- | :---: |
| Konstrukce Etour | $O(1)$ |
| List ranking | $O(\log n)$ |
| Posn z rank | $O(1)$ |
| Identifikace rodičů | $O(1)$ |

**Celkem**: $O(\log n)$ na hyperkrychli/PRAM s $n$ procesory. Tj. **vše**, co se sekvenčně dělá v $O(n)$ průchodem stromu, lze paralelně v $O(\log n)$.

## Proč je Etour užitečný

Bez Etouru by paralelní procházení stromu vyžadovalo *koordinaci* (kdo má jít dál, jak se synchronizovat). Etour převádí *rekurzivní strukturu* na *lineární sekvenci*, nad kterou *suma prefixů (scan)* dává globální informace v $O(\log n)$.

Klíčové: **list ranking $\equiv$ prefix sum nad propojeným seznamem**. Algoritmy z [[prefix-sum-uvod]] a [[prefix-sum-algoritmus]] se *přímo* aplikují.

## Co dál

[[euler-aplikace]] aplikuje Etour na konkrétní úlohy: spočítání **preorder/postorder/inorder čísel**, **úrovně (depth)** každého uzlu, **počtu potomků** podstromu, **pořadí listů**. Všechny tyto úlohy se redukují na *jeden* suffix-sum nad Etour vektorem příznaků.

[[kontrakce-uvod]] potom probere *jinou* techniku — **tree contraction** (Rake + Compress) — pro úlohy, které *nelze* vyřešit jen Euler tourem. Příklad: paralelní vyhodnocení aritmetického výrazu uloženého v binárním stromě.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=4mSQXGi0zSk" "SZZ: Paralelní algoritmy nad seznamy a stromy" "Tomáš Kocourek"
:::

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Tarjan, R.E., Vishkin, U.: „An efficient parallel biconnectivity algorithm" (SIAM J. Comput. 14(4), 1985, [DOI 10.1137/0214061](https://doi.org/10.1137/0214061)) — zavedení Euler tour techniky; JáJá, J.: *An Introduction to Parallel Algorithms* (Addison-Wesley 1992), kap. 3.6–3.7 (Euler tour + list ranking); Reif, J.: *Synthesis of Parallel Algorithms* (Morgan Kaufmann 1993), kap. 8; Cole, R., Vishkin, U.: „Deterministic coin tossing with applications to optimal parallel list ranking" (Inform. Control 70(1), 1986, [DOI 10.1016/S0019-9958(86)80023-7](https://doi.org/10.1016/S0019-9958(86)80023-7)).*
