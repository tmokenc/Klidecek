# Klasifikace paketů — úvod a formalizace

Architektura směrovačů ([[router-architektura]]) ukázala, že **Forwarding Engine** dělá *vyhledávání* — z hlavičky paketu odvodí výstupní rozhraní. V CEF ([[prepinani-paketu]]) jsme viděli 256-ární trie pro IPv4 LPM. Tato přednáška téma rozšiřuje na obecnou **klasifikaci paketů** — algoritmy, které pro paket vyberou *aplikovatelné pravidlo* z velké množiny *ACL pravidel* nebo *prefixů*.

## Co je klasifikace

**Klasifikace** = *zařazení paketu* do *třídy* na základě jeho hlaviček. Typické otázky:

- *Kterou cestou poslat tento paket?* (Routing — LPM)
- *Mám tento paket povolit, nebo zahodit?* (Filtering — ACL)
- *Jakou QoS prioritu mu dát?* (QoS — DSCP marking)
- *Jakou cestu volit pro tento flow?* (Load balancing — ECMP)

Všechno jsou *klasifikační úlohy*. Algoritmy jsou v zásadě *stejné* — liší se jen *atributy* hlavičky a *akce* po výběru pravidla.

## Dvě klasické varianty

### Vyhledávání adres (IP Address Lookup)

- Klasifikace **podle IP adresy** (jedna dimenze, IP prefix).
- Hledáme **longest prefix match (LPM)**.
- *Nezáleží na pořadí* pravidel — LPM je deterministicky definováno.

```
Router# sh ip route
D    192.168.32.0/26  [90/25789217] via 10.1.1.1
R    192.168.32.0/24  [120/4]       via 10.1.1.2
O    192.168.32.0/19  [110/22980]   via 10.1.1.3
```

Tři pravidla shodují se s adresou 192.168.32.1. *Vybere se /26* (nejdelší prefix).

### Filtrování paketů (Packet Filtering)

- Klasifikace **podle více polí** (multi-dimensional).
- ACL pravidlo: `<n> <action> <protocol> from <src IP> to <dst IP> [<src-port>] [<dst-port>] [<flags>]`.
- *Záleží na pořadí* — vybírá se **první vyhovující** pravidlo (first match).

```
10  permit  TCP  from 147.229.0.0  to any         dst-port 80
20  permit  UDP  from 147.229.0.0  to any         dst-port 53
30  permit  UDP  from any          to 147.229.0.0 src-port 53
40  permit  ICMP from 147.229.0.0  to any
50  deny    ICMP from 147.229.1.15 to any         ← chyba! je za #40
60  deny    IP   from any          to any
```

Pravidlo 50 *nikdy nevykoná* — pravidlo 40 ho *shadowuje*. To je *typická chyba* při ručním psaní ACL — auditovací nástroje pro analýzu ACL/firewall politik (např. AlgoSec, Tufin) ji detekují.

## Kdy se vyhodnocují filtrovací pravidla

Klasická pozice ACL ve směrovači:

```
Inbound                                        Outbound
Interface →  Input Filtering  → IP Routing Table Lookup → Output Filtering → Interface
                ↓                          ↓                          ↓
                deny → Discard      No Route → Discard         deny → Discard
                                              ↓
                                          Route Found → Choose Outbound Interface
```

- *Input filtering* — vyhodnotí *před* lookupem (ušetří routing tabulku, pokud paket nebudeme posílat).
- *Output filtering* — vyhodnotí *po* lookupu (omezí, co odchází z konkrétního rozhraní).

NAT se vyhodnocuje *mezi* input filtering a routing lookup (outside-inside) nebo *mezi* routing lookup a output filtering (inside-outside).

## Pokročilé filtrování — DPI

**DPI** (*Deep Packet Inspection*) klasifikuje *podle obsahu* (payload), ne jen hlaviček:

- *Kontrola toků známých protokolů* — SMTP, HTTP, FTP, IMAP, POP3 (i přes nestandardní porty).
- *Filtrování podle URL* — blokovat sociální sítě, malware domény.
- *Detekce P2P sítí podle bytových sekvencí* — BitTorrent, KaZaA, Gnutella, eDonkey.
- *Detekce malware* — vyhledávání podezřelých sekvencí.

Příklad pravidla **Snort IDS**:

```
alert tcp $HOME_NET 2589 -> $EXTERNAL_NET any
  (msg:"MALWARE-BACKDOOR-Dagger1.4";
   flow:to_client,established;
   content:"|2|0|0 0|0 0|0 6|0 0|0 0|0 0|"|Drives|24 00|";
   depth:16; metadata:ruleset community; classtype:misc-activity)
```

DPI je *řádově* dražší než klasifikace hlaviček — vyžaduje matchování *celého payloadu* proti tisícům vzorů. Implementuje se v *specializovaných firewallech* (Cisco ASA, Palo Alto Networks, Snort, Suricata).

## Formální definice klasifikace

### Vstupní paket H

Hlavička obsahuje **K hodnot** (dimenzí):

$$H = (H_1, H_2, \ldots, H_K)$$

Příklad hlaviček L3+L4: $(\text{DstIP}, \text{SrcIP}, \text{DstPort}, \text{SrcPort}, \text{Proto})$ → K = 5.

### Klasifikátor R

Množina **N pravidel** $\mathcal{R} = \{R_1, R_2, \ldots, R_N\}$.

Pravidlo $R_j$ je K-tice obsahující K položek (počet dimenzí):

$$R_1 = (147.229.\ast.\ast,\ \ast,\ 25,\ \ast,\ \ast)$$

(Tj. $\text{DstIP} = 147.229.*.*$, libovolný SrcIP, DstPort=25, libovolný SrcPort, libovolný protokol.)

### Způsob porovnávání

V klasifikátoru:

- **Přesné porovnání** (*exact match*) — úplná shoda $H_i$ s pravidlem (např. DstPort=25).
- **Prefixové porovnání** (*prefix match*) — $H_i$ je *prefixem* hodnoty pravidla (např. DstIP=147.229.5.1 odpovídá pravidlu 147.229.\*.\*).
- **Intervalové porovnání** (*interval match*) — $H_i$ je *v intervalu* specifikovaném pravidlem (např. DstPort ∈ [80, 100]).

## Klasifikační proces

```
Filtering rules         R1, R2, …
[10 permit any …]   ─→  Pre-processor  ─→  Optimized data
[20 permit UDP …]                           structure
[30 permit …]                               (Trie, BitVec, DT)
                                                     ↑
[paket] ─→ Header Extractor → H = (H₁,…) ─→ Classifier ─→ Yes/No
                                                     ↓
                                          ↓ Yes → Packet Processing → Output
                                          ↓ No  → Drop packet
```

Klíčová fáze: **Pre-processor** převede *naivní seznam pravidel* na **optimalizovanou datovou strukturu** — trie, bit vector, decision tree. Klasifikace na pakety pak je *velmi rychlá*.

## Algoritmy pro vyhledávání

Rozdělení podle **počtu dimenzí**:

- **1D** — vyhledávání v jedné dimenzi (LPM nad IP adresou).
- **2D** — vyhledávání ve dvou dimenzích (např. DstIP + SrcIP).
- **nD** — vyhledávání ve více dimenzích (full ACL match).

Rozdělení podle **techniky**:

| Technika | Komplexita | Použití |
| :--- | :--- | :--- |
| Lineární vyhledávání | $\mathcal{O}(N)$ | malé ACL |
| Trie (1D, binary) | $\mathcal{O}(W)$ kde W = délka prefixu | LPM |
| Multibit trie | $\mathcal{O}(W/k)$ | CEF (k=8) |
| Bitový vektor (Lucent) | $\mathcal{O}(N^2)$ paměť | malé–střední ACL |
| Kartézský součin | $\mathcal{O}(N^K)$ memory | typicky 2–3 dimenze |
| HiCuts decision tree | $\mathcal{O}(\log N)$ | full ACL |
| TCAM | $\mathcal{O}(1)$ — jeden cyklus! | high-end ASIC |

---

*Zdroj: PDS přednáška 6 (Klasifikace paketů), doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Gupta, P.: *Algorithms for Routing Lookups and Packet Classification* (PhD thesis, Stanford 2000, AAI3000037); Taylor, D.E.: „Survey and Taxonomy of Packet Classification Techniques" (ACM Comput. Surv., 37(3):238–275, 2005, [DOI 10.1145/1108956.1108958](https://doi.org/10.1145/1108956.1108958)).*
