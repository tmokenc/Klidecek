# 2D klasifikace — hierarchické trie a grid-of-tries

1D trie ([[stromy-trie]]) řeší LPM nad *jednou* IP adresou. ACL pravidla ale typicky obsahují *víc* dimenzí — DstIP + SrcIP, plus porty a protokol. Tato sekce ukazuje **rozšíření trie do 2D** — hierarchické trie, grid-of-tries s switch pointers.

## Problém 2D klasifikace

V 1D měříme jen *jednu* hodnotu (typicky DstIP). V 2D řešíme např. pravidlo:

| Rule | Dst | Src | Action |
| :--- | :--- | :--- | :--- |
| R1 | 0* | 10* | permit |
| R2 | 0* | 01* | permit |
| R3 | 0* | 1* | permit |
| R4 | 00* | 1* | permit |
| R5 | 00* | 11* | permit |
| R6 | 10* | 1* | permit |
| R7 | * | 00* | deny |

Pro paket (Dst, Src) = (001, 001) hledáme *pravidla, která se shodují v obou dimenzích*. Můžou jich být víc — typicky se vybírá *nejdelší shoda v Dst*, pak nejdelší v Src (lexikografické pořadí). To je **2D LPM**.

## Hierarchické trie (Hierarchical tries)

**Naivní rozšíření:** pro každou dimenzi vytvoříme *vlastní trie*. Druhý trie je *zanořen* do listů prvního.

### Konstrukce

1. Postav **Destination Trie** podle DstIP prefixů.
2. Pro každý uzel v Destination Trie, ke kterému patří nějaké pravidlo, postav **Source Trie** obsahující SrcIP prefixy *těchto pravidel*.

```
Destination Trie:
                  root
                 /    \1
               0       1
              /  \    /  \
             D6   D5  …   D7
             |    |
             ↓    ↓
        Source    Source
        Trie 1    Trie 2
        (R1,R2)   (R3,R4)
```

### Lookup

1. *Klasifikuj DstIP* v Destination Trie — najdi *nejdelší* prefix shody.
2. *Skoč* do připojeného Source Trie.
3. *Klasifikuj SrcIP* tam.
4. Pokud Source Trie nemá shodu → **backtrack** (jdi zpět v Destination Trie a zkus *kratší* prefix).

### Nevýhody

- *Duplicita stromů* → **exponenciální nárůst** prostorové složitosti $\mathcal{O}(N^K)$.
- *Backtracking* je *drahý* — pro worst case lookupu se prochází *exponenciálně* mnoho cest.

### Alternativa: bez duplicit, ale s backtrackem

Můžeme **odstranit duplicity** stromů (pokud stejný Source Trie patří víc Dst prefixů, ukládáme jen jeden). To šetří *paměť*, ale *backtracking je stále drahý*.

Příklad: vyhledání (001, 001) — najít prefix matchující v obou stromech.

- Start v root Destination Trie, jdi do uzlu 001.
- Source Trie pro 001: vyhledat 001 → vrátí R4, R5.
- Pokud žádný nematch → backtrack: zkus prefix kratší (00 → R4 by mělo platit).
- Pokračuj backtrackem až na root.

Worst case: $\mathcal{O}(W^K)$ pro K dimenzí a W bitů → *velmi pomalé* pro hluboké hierarchie.

## Grid-of-tries s switch pointers

**Grid-of-tries** (Srinivasan et al., SIGCOMM 1998) eliminuje backtracking pomocí **switch pointers**.

### Princip

Pro každý uzel v SrcTrie *předpočítáme* ukazatel `next_trie` — *kam pokračovat při neúspěchu*, místo backtracku.

```
Destination Trie:
       root → D7   D1,D2,D3   D6   D4,D5
        |        ↘          ↘    ↘
       Source     ↘           ↘    ↘
       Trie's     ↓           ↓    ↓
        ┌──Source Trie (přivlastněna více Dst uzlům)─┐
        │  R3 → R6 → R7 …                             │
        └────────────────────────────────────────────┘
        ⤺ switch pointer (next trie pokud neúspěch)
```

### Lookup s switch pointer

1. Začni v root Destination Trie.
2. Lookup DstIP → vstup do připojeného Source Trie.
3. Lookup SrcIP v Source Trie.
4. *Pokud nematch v aktuálním uzlu (y)*: použij **switch pointer** k přechodu na *jiný Source Trie* (asociovaný s kratším Dst prefixem) — místo backtrackingu.
5. *Snížení časové složitosti* na $\mathcal{O}(W \log N)$ (vs. $\mathcal{O}(W^K)$).

### Vlastnosti

- *Lineární prostor* $\mathcal{O}(N \cdot W)$ (vs. exponenciální u naivního přístupu).
- *Lineární čas* lookupu v poměru k W (vs. exponenciální).
- *Náročnější předpočet* — switch pointers musí být *konzistentně* nastaveny při změně pravidel.

Grid-of-tries je **standardní** algoritmus pro 2D klasifikaci v moderních softwarových routerech. Pro vyšší dimenze (5-tuple ACL) se ale používají jiné metody — Lucent Bit Vector, Cross Producting, HiCuts.

## Příklad — krok za krokem

Pro pravidla:

| Rule | Dst | Src |
| :--- | :--- | :--- |
| R1 | 0* | 10* |
| R2 | 0* | 01* |
| R3 | 0* | 1* |
| R4 | 00* | 1* |
| R5 | 00* | 11* |
| R6 | 10* | 1* |
| R7 | * | 00* |

Lookup (Dst=001, Src=001):

1. Začni v root Destination Trie. Jdi po 0 (bit 0).
2. Uzel 0 obsahuje R1, R2, R3 → vstup do Source Trie 1.
3. Lookup 001 v Source Trie 1:
   - R2 (Src=01*): paket Src=001 začíná 00, ne 01 → R2 *nematchuje*.
   - Backtrack nebo switch pointer.
4. Switch pointer vede k Source Trie 4 (kratší Dst prefix nebo *).
5. Lookup 001 v Source Trie 4 → match R7 (00*).
6. Vrátit pravidlo s *nejdelším Dst prefixem mezi nalezenými* → R7.

S switch pointers se backtracking *vyhneme*; přechod na jiný Source Trie je *konstantní čas*.

## Limity 2D pro full ACL

Pro 5-tuple ACL (DstIP + SrcIP + DstPort + SrcPort + Proto) by 2D řešení vyžadovalo $5! = 120$ kombinací směru hierarchie. Místo toho se používají:

- **Lucent Bit Vector** — bit vectors pro každou dimenzi.
- **Cross Producting** — kartézský součin předpočtený.
- **HiCuts / HyperCuts** — geometrické řezání ND prostoru.
- **TCAM** — hardwarové paralelní matchování.

Viz [[bit-vector-cartesian]] a [[hicuts-tcam]].

---

*Zdroj: PDS přednáška 6, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Srinivasan, V., Varghese, G., Suri, S., Waldvogel, M.: „Fast Scalable Level-Four Switching" (ACM SIGCOMM 1998, [DOI 10.1145/285243.285282](https://doi.org/10.1145/285243.285282)).*
