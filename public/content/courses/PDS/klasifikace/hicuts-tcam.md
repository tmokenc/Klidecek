# HiCuts a TCAM — moderní klasifikace

Bitové vektory a kartézský součin ([[bit-vector-cartesian]]) fungují pro malé až střední množiny pravidel. Pro **enterprise/core** klasifikaci (10k–100k pravidel, 5-tuple, 100 Gbps linky) se používají dvě další techniky: **HiCuts** (rozhodovací stromy) a **TCAM** (specializovaná paměť).

## Geometrický pohled na klasifikaci

Klíčová myšlenka: pravidlo o $n$ dimenzích lze chápat jako **region v $n$-rozměrném prostoru**. Paket je *bod* v tomto prostoru. Klasifikace zjišťuje, *do kterého regionu paket patří*.

::: viz hicuts "Táhni paket P po prostoru — panel ukáže, která pravidla matchují a vítěze podle priority. Přepni „HiCuts řezy" pro náhled rekurzivního dělení prostoru."
:::

Pravidla mohou *překrývat* — proto má každé pravidlo prioritu (R1 nejvyšší). Vítězí nejvyšší priorita mezi shodami, jinak *implicit deny*.

## HiCuts — Hierarchical Intelligent Cuttings

**HiCuts** (Gupta, McKeown, 1999) rozděluje $n$-rozměrný prostor do regionů stejné velikosti pomocí **řezů**.

### Princip

1. *Začni* s prázdným stromem; kořenový uzel pokrývá celý $n$-rozměrný prostor.
2. *Pokud podprostor obsahuje příliš mnoho pravidel* (víc než *prahová hodnota* — typicky 4 nebo 16), *rekurzivně rozděl*:
   - Vyber **dimenzi** a **počet řezů** podle heuristiky.
   - Rozděl podprostor na 2, 4, 8, … podprostorů.
   - Vytvoř *podstromy*.
3. *Listový uzel* obsahuje *malý počet pravidel*; klasifikace listu = lineární vyhledávání.

### Heuristiky řezání

Otázka: *kterou dimenzi řezat a kolika řezy?*

- **Half-cut** — vždy půlí dimenzi.
- **Binary search** — pro každou dimenzi rozsah hodnot, půlí podle mediánu.
- **Equi-density** — vybírá řez tak, aby každý podprostor *obsahoval podobný počet pravidel*.

### Konstrukce stromu — příklad

Pro pravidla z předchozí sekce:

```
                       Root (000–111 ×  000–111)
                            │
              F1 řez tří bodů: A, B, C, D
                            │
        ┌──────┬──────┬──────┐
        ↓      ↓      ↓      ↓
        A      B      C      D
       …      …       (vnitřní uzel, F2 řez)
                       │
              ┌────────┼────────┐
              E         F        G
              (listy s pravidly)
```

### Lookup

Pro paket $(000, 010)$:

1. *Klasifikace začíná v kořenovém uzlu.* Řez je v F1 → porovnává podle 000.
2. *Další uzel* je vnitřní; řez v F2 → porovnává 010.
3. *Totéž opakuj* v dalších krocích, *podle dimenze* a *hodnoty*.
4. *Dojdeš na listový uzel*, který obsahuje *dvě pravidla* (např. R2 a R3).
5. **Provedeš sekvenční vyhledávání**: vyber pravidlo s *delším společným prefixem*.

### Vlastnosti

- *Pokud uzel obsahuje víc pravidel*, dochází k *lineárnímu prohlížení*.
- *Počet řezů* určuje hloubku stromu a rychlost prohledávání.
- *Více strategií pro vytvoření řezu* — hledáme uniformní rozdělení → vyvážený strom.
- *V případě identických listů* lze vytvořit odkazy a ušetřit místo.

### Rozšíření: HyperCuts

**HyperCuts** (Singh, Baboescu et al., 2003) řeže *vícero dimenzí současně* — uzel může mít víc faktorů řezání. Výsledkem je *plynčí strom*, ale složitější datová struktura.

HiCuts/HyperCuts se používají v *softwarových routerech* (Open vSwitch, DPDK) a v některých *FPGA-based* network appliances.

## TCAM — Ternary Content Addressable Memory

Pro *nejvyšší* propustnost se používá **TCAM** — specializovaná HW paměť.

### CAM vs TCAM

**CAM** (*Content Addressable Memory*) je *asociativní paměť*:

- Vyhledává data podle **přesné shody** (exact match).
- Vyhledá data během *jednoho hodinového cyklu* — *rychlé* (vs. RAM, která je adresovaná lineárně).
- Typické použití: **MAC table** v switchích → vstoupí MAC, vrátí port.

**TCAM** je *rozšířená verze CAM*:

- Paměťové buňky mají **tři stavy** (ternary): 0, 1, **X** (don't care).
- Ke shodě s hodnotou `0111xx10` v TCAM dojde pro klíče: `01110010`, `01110110`, `01111010`, `01111110`.
- Hodnota X se implementuje *bitovou maskou*.
- Výsledkem lookupu může být např. *odkaz na sousední uzel* (next-hop) v RAM.

### Použití TCAM pro IP lookup

Záznamy v TCAM: dvojice *prefix + maska*:

```
IP address: 10.0.1.1   (1. oktet = 00001010)
TCAM:
value         bitmask
00001000      11111110      → P1
00001010      11111100      → P2 ← match!
00001000      11110000      → P3
…
```

Vyhledávání:

- *Prefixy seřazeny podle délky* — od nejdelšího po nejkratší.
- *Paralelní match* všech řádků TCAM.
- **Encoder priority** vybere *nejdelší* prefix.
- Adresa vybrané buňky je *ukazatel* do tabulky sousedů v RAM (next-hop, output interface).

### Použití TCAM pro filtrování paketů

Do TCAM se ukládá *binární sekvence* vybraných hlaviček L2, L3 a L4:

- **Ethernet ACL**: src MAC, dst MAC, EtherType.
- **Extended IP ACL**: src/dst IP, protokol, ToS, src/dst port, port operator.
- **Other IP ACL**: src/dst IP, protokol.
- **ICMP ACL**: src/dst IP, protokol, ICMP code/type, ToS.

Záznam v TCAM obsahuje **tři části — VMR**:

- **V (Value)**: 134-bitový vektor obsahující hodnoty hlaviček L2-L4.
- **M (Mask)**: bitová maska pro výběr hodnot k porovnání (1 = porovnej, 0 = ignoruj).
- **R (Result)**: numerický výsledek označující akci, např. *permit/deny/next-hop*.

Každá dvojice mask-value je *vyhodnocena paralelně*. Lookup *jeden cyklus*.

### Nevýhody TCAM

- **Cena:** paměťová buňka vyžaduje cca 16 tranzistorů (vs. RAM cca 6) → *~10× dražší* per bit.
- **Energetická náročnost:** paralelní vyhledávání = simultánní matching všech řádků → *vysoký power draw*.
- **Velikost omezena:** typicky TCAM v cca 4 tisících záznamů; high-end až ~32k.
- **Porovnání v jednom cyklu omezuje velikost TCAM**.

Pro velké tabulky se používá **kombinace TCAM + RAM** — TCAM pro nejaktivnější/nejdůležitější záznamy, RAM (s trie nebo hash) pro zbytek.

### Přepínače Catalyst — příklad

```
ACL rules:
   permit tcp 10.128.0.0/24 10.128.0.0/24  eq 8080
   permit tcp 192.168.0.0/24 10.128.0.0/24 eq 80
   permit tcp 192.168.0.0/24 10.128.0.0/24 eq 443
   deny ip 10.128.0.0/24 192.168.0.0/24
   deny udp 172.16.0.0/24 10.0.0.0/24 eq 5060

         ↓ compile into TCAM

TCAM:
Mask                            Value (134 bits)              Result
1111... xxx... 1111... xxx...   TCP IP1 IP2 8080              permit
...                                                            permit
...                                                            deny
...                                                            deny
```

Implementováno v přepínačích Cisco Catalyst 2960, 3750, 3850, 4500, 6500.

- Přepínač *obvykle obsahuje dvě TCAM* — *pro ACL a QoS*.
- TCAM může obsahovat až **4 096 masek** a **32 768 hodnot** (8 hodnot na 1 masku).
- Velikost TCAM lze nastavit podle využití přepínače (default, access, VLAN, routing).

## Srovnání algoritmů klasifikace

| Algoritmus | Čas lookupu | Paměť | Když |
| :--- | :--- | :--- | :--- |
| Linear search | $\mathcal{O}(N)$ | $\mathcal{O}(N)$ | malé ACL (~20) |
| Trie 1D | $\mathcal{O}(W)$ | $\mathcal{O}(NW)$ | LPM, FIB |
| Multibit trie | $\mathcal{O}(W/k)$ | větší | CEF |
| Grid-of-tries | $\mathcal{O}(W \log N)$ | $\mathcal{O}(NW)$ | 2D |
| Lucent BV | $\mathcal{O}(dW + N/w)$ | $\mathcal{O}(N^2)$ | středně velké ACL |
| Cross Producting | $\mathcal{O}(dW + 1)$ | $\mathcal{O}(N^K)$ | málo dimenzí |
| HiCuts | $\mathcal{O}(\log N)$ | $\mathcal{O}(N)$ | velké ACL |
| TCAM | $\mathcal{O}(1)$ | drahé HW | core/edge wire-speed |

---

*Zdroj: PDS přednáška 6, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Gupta, P., McKeown, N.: „Packet Classification using Hierarchical Intelligent Cuttings" (Hot Interconnects 7, 1999); Singh, S., Baboescu, F., Varghese, G., Wang, J.: „Packet Classification using Multidimensional Cutting" (ACM SIGCOMM 2003); Cisco Press: *CCNP Routing and Switching SWITCH 300-115: Official Cert Guide* (2015).*
