# Stromové vyhledávání — binary trie a multibit trie

Pro 1D vyhledávání (LPM nad IP adresou) je *nejrychlejší a paměťově nejúspornější* datovou strukturou **trie** (z anglického *retrieval*, čte se „try"). Tato sekce probere binární trie, multibitové trie a Lulea compression — vše techniky používané v CEF ([[prepinani-paketu]]).

## Lineární vyhledávání

**Nejjednodušší způsob klasifikace** — projdi celý seznam pravidel.

```
Pro každé pravidlo R_j z R:
   Porovnej H_i s R_j ve všech dimenzích.
```

Časová složitost: $\mathcal{O}(N \cdot K)$.

- *Pro malý počet pravidel* OK (SOHO router s 20 ACL pravidly).
- *Pro N = 10 000 a port speed 100 Gbps*: lookup max ~12 ns/paket → linear search pro 10k pravidel je *řád pomalejší*.

Lineární vyhledávání slouží jako *baseline* — všechny ostatní algoritmy jsou jeho zrychlení.

## Binární trie

**Trie** = stromová struktura, kde *cesta z kořene k uzlu kóduje prefix*. Levý syn = bit 0, pravý syn = bit 1.

### Příklad

Devět prefixů P1–P9:

```
P1: 0*       P2: 00001*   P3: 001*     P4: 1*       P5: 1000*
P6: 1001*    P7: 1010*    P8: 1011*    P9: 111*
```

Binární trie:

```
                root
              0/    \1
             P1      P4
            0/  \1    \1
                P3   ... (further branches)
             0/
             P2
            ...
```

Cesta `0` → `P1` (jeden bit) → splňuje paket začínající 0.
Cesta `0 → 0 → 1` → `P3` (tři bity) → splňuje pakety začínající 001.

### Lookup

Pro IP adresu projdeme strom *bit po bitu*; označíme *nejhlubší prefix* na cestě.

Příklad: lookup `0010_0000` (8 bitů).

- Bit 0: jdi vlevo → P1 (najdeš P1).
- Bit 1: jdi vpravo → najdeš... (nebo end).
- Pokračuj.

Návratová hodnota: *nejhlubší* nalezený prefix.

### Časová složitost

- *Worst case:* $\mathcal{O}(W)$ kroků pro IP adresu o $W$ bitech (W=32 pro IPv4, 128 pro IPv6).
- *Paměťová složitost:* $\mathcal{O}(N \cdot W)$ uzlů worst case, typicky méně díky sdíleným cestám.

### Implementace

- Vkládání prefixu: traverz, na konec vlož označení prefixu.
- Mazání: trochu složitější (kompakce stromu).
- LPM: jednoduchý — *poslední označený uzel* na cestě.

Binární trie je *intuitivní*, ale *pomalý* — pro IPv4 vyžaduje 32 cyklů paměti. Moderní routery mají na lookup typicky ~100 ns → musíme zrychlit.

## Multibit trie

**Multibit trie** (multibit stride) = trie s $n = 2^k$ potomky na uzel, kde *$k$ je tzv. krok (stride)*. Místo 1 bitu se *najednou* porovnává $k$ bitů.

Pro $k = 4$: každý uzel má 16 potomků; lookup IPv4 → 32/4 = 8 kroků (místo 32).

CEF používá $k = 8$ (256-ární trie) → IPv4 lookup za 4 kroky.

### Problém: prefixy nemají vždy délku násobku k

Pravidla v reálné síti mají *libovolné* délky prefixu. Multibit trie ale "kráčí" po krocích $k$ — co s prefixem délky 3 v 8-bitovém trie?

**Řešení: prefix expansion** — *rozšířit* prefix na násobek $k$ a vytvořit *víc* kratších záznamů.

### Příklad prefix expansion

Krok $k = 3$ (8 potomků):

| Pravidlo | Původní prefix | Rozšířené prefixy |
| :--- | :--- | :--- |
| P1 | 0* | 000*, 010*, 011* |
| P2 | 00001* | 00001* (nutné jít hloubky 2) |
| P3 | 001* | 001* |
| P4 | 1* | 100*, 101*, 110* |
| P5 | 1000* | 10000*, 10001* |
| P6 | 1001* | 10010*, 10011* |
| P7 | 1010* | 10100*, 10101* |
| P8 | 1011* | 10110*, 10111* |
| P9 | 111* | 111* |

`P1 = 0*` se rozšíří na *všechny* 3-bitové prefixy začínající 0: 000, 010, 011 (ale ne 001, protože ten patří P3).

### Implementace v poli

Multibit trie se obvykle reprezentuje jako *pole* o velikosti $2^k$ na uzel:

```
Root pole velikosti 8:
[000] → P1
[001] → P3
[010] → P1
[011] → P1
[100] → ukazatel na subtree X
[101] → ukazatel na subtree Y
[110] → P4
[111] → P9
```

Lookup: vezmi prvních $k$ bitů adresy, *zaindexuj* do pole → buď prefix (list) nebo ukazatel na podstrom (interní uzel). Rekurze.

## Lulea (bitová komprese trie)

**Lulea** (Degermark et al., SIGCOMM 1997) je *kompresí* multibit trie — místo pevného pole $2^k$ použijte *bitovou mapu*, která říká, *které pozice mají hodnotu*.

### Fáze 1 — Úprava hodnot

V uzlu: každá pozice obsahuje buď *pravidlo* (next-hop) nebo *ukazatel* na podstrom. Smíšené pole.

### Fáze 2 — Komprese pomocí bitové mapy

Pro každý uzel: **bitarr** (bitová mapa) říká, *které pozice* mají *nový* prefix (1) nebo jsou *opakování* předchozí (0).

```
Pole hodnot:    P3 P3 P1 P1 P1 [→X] [→Y] P9
Bitarr:          1  0  1  0  0   1    1   1
valarr:         (P3,P1,P3-rep,…)  ← komprese, jen unikátní
```

Komprese:

- *Bez ztráty* — full information preserved.
- *Faktor* — typicky 5×–10× méně paměti.
- *Rychlost lookupu* zachována — bitarr lookup je $\mathcal{O}(1)$.

### Použití

Bitově komprimovaná trie (Lulea) se používá v:

- **DPDK** (Data Plane Development Kit).
- Některé open-source softwarové routery.

## LC-trie (level-compressed trie)

**LC-trie** (level-compressed trie, Nilsson & Karlsson) je *odlišná* technika — kombinuje *path compression* (vynechání uzlů s jediným potomkem) a *level compression* (nahrazení horních úplných podstromů jedním multibit uzlem). Nezaměňovat s Lulea schématem výše.

- **Linux kernel FIB** (`fib_trie.c`, od kernelu 2.6.13) implementuje LC-trie.

## Co dále

Pro 2D klasifikaci (např. DstIP + SrcIP v ACL) se trie kombinují — viz [[2d-klasifikace]] — *hierarchické trie*, *grid-of-tries* s *switch pointers*.

---

*Zdroj: PDS přednáška 6, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Srinivasan, V., Varghese, G.: „Fast Address Lookups Using Controlled Prefix Expansion" (ACM Trans. Comput. Syst., 17(1):1–40, 1999, [DOI 10.1145/296502.296503](https://doi.org/10.1145/296502.296503)); Degermark, M., Brodnik, A., Carlsson, S., Pink, S.: „Small Forwarding Tables for Fast Routing Lookups" (ACM SIGCOMM 1997, [DOI 10.1145/263105.263133](https://doi.org/10.1145/263105.263133)).*
