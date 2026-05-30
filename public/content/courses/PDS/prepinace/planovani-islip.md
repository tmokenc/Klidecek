# Plánování — iSLIP a multicast (ESLIP)

PIM ([[planovani-pim]]) řeší matching paralelně, ale závisí na *random number generation*. Pro hardware je *deterministické* řešení atraktivnější — implementace levnější, predikovatelná, snadno verifikovatelná. **iSLIP** (McKeown, 1999) toho dosáhne **rotujícími ukazateli** místo náhody. Je to algoritmus *standardně používaný* v moderních high-end switchích (Cisco Catalyst 6500 Sup720+, Juniper M-series).

## Princip iSLIP

iSLIP je *iterativní* algoritmus podobný PIM, ale místo random volby používá **rotující ukazatele**:

- **Accept pointer $I_i$** — na vstupním portu $i$: ukazuje na *další* (preferovaný) výstupní port.
- **Grant pointer $O_j$** — na výstupním portu $j$: ukazuje na *další* (preferovaný) vstupní port.

Při soutěži o port se vybere požadavek/oprávnění *podle ukazatele*. Po přidělení se ukazatele *inkrementují* (mod $N$).

### Tři fáze (totéž schéma jako PIM, jen jiná pravidla výběru)

1. **Request** — každý vstupní port pošle žádost na výstupy, pro které má data.
2. **Grant** — výstupní port $Q$ vybere žádost s číslem vstupního portu *větším nebo rovným ukazateli $O_Q$* (s nejmenší hodnotou v této množině).
3. **Accept** — vstupní port $X$ vybere oprávnění od portu s hodnotou *větší nebo rovnou $I_X$* (s nejmenší hodnotou).

::: viz islip "Klikni „REQUEST/GRANT/ACCEPT" pro postup po fázích. Přepni algoritmus (Take-a-Ticket / PIM / iSLIP) a sleduj, jak se mění výsledné párování."
:::

### Inkrementace ukazatelů (jen v *první* iteraci)

Po úspěšném přidělení v *první iteraci* daného časového slotu:

$$I'_i = (\text{právě přijatý výstup} + 1) \mod N \quad (\text{preferuje další výstup})$$
$$O'_j = (\text{právě udělený vstup} + 1) \mod N \quad (\text{preferuje další vstup})$$

Ukazatel se tedy nastaví na pozici hned *za* právě obslouženým portem (ne stará hodnota + 1).

V *dalších iteracích* (téhož slotu) se ukazatele *neinkrementují* — jen řeší zbytek.

### Synchronizace ukazatelů

Klíčová vlastnost: pokud se ukazatele *rozsynchronizují*, jedna iterace iSLIP stačí. To je *normální stav* — po krátké startup fázi se ukazatele rovnoměrně rozdělí, takže paralelní žádosti nesoutěží.

## Příklad iSLIP

Pro 4×4 switch s požadavky $\{(A,1), (A,2), (A,3), (B,1), (B,3), (B,4), (C,1), (C,3), (C,4), (D,2), (D,3), (D,4)\}$ a inicializovanými ukazateli $I_i = O_j = 1$:

**Round 1, Iteration 1:**

- Grant: výstup 1 dostane žádosti od A, B, C → vybere A ($\geq O_1 = 1$, nejmenší). Atd.
- Accept: A dostane oprávnění z výstupů 1, 2, 3 → vybere 1 ($\geq I_A = 1$, nejmenší).

Po iteraci se zbylé požadavky řeší v *Iteration 2*.

| | Time slot 1 | Time slot 2 | Time slot 3 | Time slot 4 |
| :--- | :---: | :---: | :---: | :---: |
| Input A | 1 | 2 | 3 | — |
| Input B | 4 | 1 | — | 3 |
| Input C | 3 | 4 | 1 | — |
| Input D | 2 | 3 | 4 | — |

12 přenosů z 16 možností → **propustnost 75 %**.

## Zhodnocení iSLIP

- **Výhody:**
  - **Deterministické** — žádné RNG, snadná HW implementace.
  - **Spravedlivé** — rotující ukazatele garantují, že žádný port nehladoví.
  - **Konvergence** — typicky 1–2 iterace pro stabilní traffic.
  - **Většina komerčních switchí** používá iSLIP s 1 iterací.
- **Nevýhody:**
  - V momentech, kdy se ukazatele *náhodou* sesynchronizují, je potřeba víc iterací než PIM.
  - *Krátkodobá* nespravedlivost — některé porty čekají déle, dokud ukazatel nepřejde.

## Multicast v crossbaru

Crossbar **nativně** podporuje multicast — jedno vstup, několik tranzistorů ON současně. Plánování ale potřebuje speciální logiku.

### Naivní řešení

Pro každý multicast paket: replikovat na *všechny* výstupní porty (vyřešit jako N unicastů). To je *pomalé* — multicast zabere $N$ slotů místo jednoho.

### Plánování multicastu — dva přístupy

- **No fanout splitting** — přenos na *všechny* výstupy v *jednom* časovém slotu. Vyžaduje, aby *všechny* výstupy byly *současně volné* — vzácné.
- **Fanout splitting** — přenos na *část* výstupů během *několika* slotů. Mnohem realističtější.

```
Bez fanout splittingu:
   Slot 1: A → {1, 2, 3} (vše nebo nic)
   …

S fanout splittingem:
   Slot 1: A → {1, 3}
   Slot 2: A → {2}
```

## ESLIP — iSLIP s podporou multicastu

**ESLIP** (Cisco, ~2000) přidává podporu multicastu do iSLIP:

- *Sdílená multicastová VOQ* (jedna na vstupní port) — všechny multicast pakety v ní jsou v pořadí.
- Žádost o přenos multicastu *na všechny zájemce* (fanout).
- Současně se zpracovává **unicast** (běžné VOQ) i **multicast** (sdílená VOQ).
- Speciální ukazatel multicast vstupu $I_M$ a multicast výstupu $O_M$.

### Priorita

ESLIP **prioritizuje** přenosy:

- *V lichých* časových slotech: unicast má přednost.
- *V sudých*: multicast má přednost.

Tím se vyhne *vyhladovění* multicastu při velkém unicast trafficu (a naopak).

## Co dále

iSLIP a ESLIP zvládají *crossbar* až do ~256 portů. Pro **datacentrum** s tisíci portů potřebujeme **vícestupňové sítě** — Clos a Beneš ([[multistage-clos-benes]]).

---

*Zdroj: PDS přednáška 4, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: McKeown, N.: „The iSLIP Scheduling Algorithm for Input-Queued Switches" (IEEE/ACM Trans. Netw., 7(2):188–201, April 1999, [DOI 10.1109/90.769767](https://doi.org/10.1109/90.769767)).*
