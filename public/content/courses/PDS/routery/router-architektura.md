# Architektura směrovače — funkční a fyzické části

Router je vnitřně **modulární**. Tato sekce probere jeho *funkční moduly* (Network Interface, Forwarding Engine, Queue Manager, ...) a *fyzické části* (Line Card, Switch Fabric Card, Router Processor Card, ...). Také zavádí pojem **kontext paketu** — datová struktura, která doprovází paket během jeho cesty zařízením.

## Funkční a fyzické dělení

| Funkční modul (logika) | Fyzická karta (HW) |
| :--- | :--- |
| Network Interface (NI) | Port Card |
| Forwarding Engine (FE) | Line Card |
| Queue Manager (QM) | Line Card |
| Traffic Manager (TM) | Line Card |
| Backplane | Switch Fabric Card |
| Router Control Processor (RCP) | Router Processor Card |

Funkční moduly jsou *abstraktní* — popisují *co se dělá*. Fyzické karty jsou *konkrétní* — popisují *kde to běží* v zařízení. Mapování je *flexibilní* — na různých routerech může být stejná funkce implementována odlišně.

## Funkční části

### Network Interface (NI)

- Odstraní *zapouzdření L2*, předá hlavičku přepínacímu modulu L3.
- Uloží paket do paměti, *zapouzdřuje* odchozí pakety.

### Forwarding Engine (FE)

- *Zpracuje hlavičku L3*, určí výstupní rozhraní podle informace ve FIB.
- Provádí *klasifikaci paketů* pro zajištění QoS na výstupu (DSCP marking).

### Queue Manager (QM)

- *Ukládá pakety* do vyrovnávací paměti, pokud je výstupní port obsazen.
- *Spravuje výstupní frontu*, vybírá a zahazuje pakety podle definované politiky (FIFO, WFQ, RED).

### Traffic Manager (TM)

- *Prioritizuje a reguluje* výstupní provoz podle požadavků QoS (DSCP, ToS).
- *Omezuje či ořezává* výstupní provoz — *shaping*, *policing*.

### Backplane

- Implementuje **sdílené** (shared) či **přepínané** (switched) propojení.
- *Rychlost přepínání* musí *odpovídat* přenosovému pásmu *všech rozhraní*.

### Router Control Processor (RCP)

- Implementuje **směrování** (OSPF, BGP, RIP), aktualizuje *směrovací tabulku*.
- *Udržuje sousedství*, posílá hello/keep-alive zprávy.
- *Přenáší data* ze směrovací tabulky do *přepínací tabulky FIB*.
- *Zpracovává pakety*, které *nelze přepínat* pomocí FIB — výjimky (např. první paket po startu, generování ICMP).

## Kontext paketu

**Kontext paketu** je *datová struktura*, která obsahuje informace o aktuálně zpracovávaném paketu. Provází paket od vstupu k výstupu zařízení.

### Co obsahuje

- **Vstupní informace:**
  - Ingress interface number.
  - Ingress interface type.
- **L2 informace:**
  - Destination MAC address.
  - Source MAC address.
- **L3 informace:**
  - Destination IP address.
  - Source IP address.
  - Protocol type.
  - DSCP (QoS marking).
- **L4 informace:**
  - Destination port (TCP/UDP).
  - Source port (TCP/UDP).

Plus odkaz do *paměti*, kde leží *samotný paket* (payload). Kontext je *malý* — obsahuje jen *hlavičky* potřebné pro rozhodování.

### Životní cyklus kontextu

- *Vytvoří se* při vstupu paketu do zařízení (Network Interface).
- Během zpracování *přibývají* další položky (next-hop, output interface, QoS rozhodnutí).
- *Předává se* mezi moduly *přes propojovací desku*.
- Po dokončení zpracování *zaniká* (paket odejde, kontext se uvolní).

Tato separace **kontextu** od **paketu** je důležitá:

- *Kontext* je *malý* (~100 B), snadno se přenáší mezi moduly.
- *Paket* je *velký* (až 9 kB jumbo), zůstává v *centrální paměti*.

Tím se minimalizuje *kopírování dat* — typický performance optimization pattern v hardware.

## Fáze zpracování paketu

```
Control Plane                    Data Plane
                                              
Routing      Route Control       
Table   ←→   Processor (RCP)     
                                              
─────────────────────────────────  control / data plane separation
                                              
                  Buffer Memory      Forwarding
                     ┌─────┐        Table
                     │ pkt │
                     │     │
                     └─────┘            ↑
                       ↑                │
                       │  context       │
[paket] → 1. Input → 2. Forwarding → 3. Backplane → 4. Queue → 5. Traffic → 6. Output
   ↓     Interface     Engine          (přepínání)   Manager    Manager     Interface
   L3/L2  (L3/L2)                                   (priority)  (shaping)    (L3/L2)
```

### Fáze 1 — Příjem na síťové rozhraní

- Síťová karta zpracuje L2 rámec, *zkontroluje FCS*.
- *Vytvoří* kontext paketu: vloží *zdrojovou a cílovou L2 adresu*.
- *Zpracuje hlavičku L3*: typ protokolu, kontrolní součet, *TTL*.
- *Doplní kontext* o informace L3: IP adresy, typ protokolu, *DSCP*, *porty*.

### Fáze 2 — Forwarding Engine (FE)

- FE *vyhledá cestu* v přepínací tabulce (FIB): *next-hop + výstupní rozhraní*.
- *Doplní další informace* do kontextu paketu.
- *Uloží paket* do *vyrovnávací paměti* → adresa vložena do kontextu.

### Fáze 3 — Přepínací deska (Backplane)

- Kontext doplněn o *výstupní informace* → **plný kontext**.
- Propojovací deska *přenese paket* i kontext na výstupní rozhraní.
- Kontext obsahuje *adresu uloženého paketu* v paměti.
- Zpracování paketu *předáno správci front*.

### Fáze 4 — Queue Manager (na výstupní kartě)

- *Podle priority* v kontextu paketu je paket vložen do *příslušné výstupní fronty*.
- Obsluha fronty *podle plánovacího algoritmu* — FIFO, Strict Priority, WFQ, CBWFQ.

### Fáze 5 — Traffic Manager (TM)

- *Zkontroluje omezení rychlosti* (*shaping*) podle kontextu.
- Při překročení rychlosti *dojde k zahození či zpomalení*.

### Fáze 6 — Výstupní síťové rozhraní

- L3: *přepočet kontrolního součtu* (TTL se změnil).
- L2: *přidá se hlavička L2* a *výpočet CRC*.
- Dochází k *odeslání paketu* na výstupní médium.

### Co když fáze selže?

Možné příčiny neúspěšného zpracování:

- *Hlavička L3 nevalidní* (špatný checksum / verze / délka) — paket se tiše zahodí (silent discard), bez ICMP. ICMP `Parameter Problem` se posílá jen u specifické chybné položky hlavičky (např. vadné IP volby).
- *TTL = 0* — drop, ICMP `Time Exceeded`.
- *No route to destination* — drop, ICMP `Destination Unreachable`.
- *Output queue full* — drop (tail drop, RED).
- *Rate limit exceeded* (shaping/policing) — drop nebo zpomalení.
- *MTU překročeno + DF flag* — drop, ICMP `Fragmentation Needed`.

## Co dále

Architektura zavádí *kde* moduly leží. Otázka *jak rychle dělají co* vede k třem strategiím zpracování paketu — **Process Switching**, **Fast Switching**, **CEF**. Viz [[prepinani-paketu]].

---

*Zdroj: PDS přednáška 5, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Bollapragada, V., Murphy, C., White, R.: *Inside Cisco IOS Software Architecture* (Cisco Press 2000); Varghese, G.: *Network Algorithmics* (Elsevier 2005); Aweya, J.: *Designing Switch/Routers* (CRC Press 2023).*
