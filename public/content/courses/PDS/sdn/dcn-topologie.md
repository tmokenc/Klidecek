# Datacenter network topologies

Klasická enterprise síť má *tisíce* uzlů. Moderní **hyperscale datacentrum** (Google, Facebook, Amazon) má *miliony*. To klade radikální nároky na *topologii* — klasická 3-úrovňová hierarchie (Core/Aggregation/Access) selhává. Tato sekce probere moderní topologie **datacentrových sítí (DCN)** — fat-tree, leaf-spine, Clos a rail-optimized design pro AI clustery.

## Klasická topologie — basic tree

**Základní stromová topologie:** dva nebo tři úrovně switchů/routerů, *servery jako listy*.

```
                          Core
                       ┌─────┐
                       │  X  │
                       └─┬───┘
                ┌────────┼────────┐
              Aggregation        Aggregation
              ┌───┐  ┌───┐     ┌───┐  ┌───┐
              │ X │  │ X │ ... │ X │  │ X │
              └─┬─┘  └─┬─┘     └─┬─┘  └─┬─┘
              ┌─┴─┐  ┌─┴─┐     ┌─┴─┐  ┌─┴─┐
              Edge   Edge  ...  Edge   Edge
              [PC] [PC] [PC]    [PC] [PC] [PC]
```

Charakteristika:

- *Dvou nebo třístupňová* hierarchie.
- *Servery jako listy* (na úrovni Access/Edge).
- **Problém s core oversubscription** — celá agregace tlačí do *jednoho* core uzlu → bottleneck.
- *Vysoce drahé core routery* — musí mít agregovanou propustnost všech edge.

Pro 1000 serverů na 10 Gbps to znamená core 10 Tbps — *strašně drahé*. Pro 10 000 serverů ne ke koupi.

## Fat tree

**Fat tree** (Charles E. Leiserson, *Fat-Trees: Universal Networks for Hardware-Efficient Supercomputing*, 1985) řeší core oversubscription **přidáním vícero linek blíže k root**.

Princip: *vyšší úroveň má širší linky*.

```
                    "root" (více linek)
                   ════════════════════
                  /     |     |     \
                ═══   ═══   ═══   ═══
               /  \  /  \  /  \  /  \
              ○   ○ ○   ○ ○   ○ ○   ○
```

- *Více cest* z source k root (*upstream*), ale **jen jedna cesta** od root k destination (*downstream*).
- *Bandwidth narůstá* směrem k root, ne zužuje.

Fat-tree je *teoretická idea*. Praktická implementace je **Folded 3-Stage Clos** — to už viděnou ve [[multistage-clos-benes]].

## Leaf-and-spine

**Leaf-and-spine** je *plochá* dvouúrovňová topologie, dnes *de facto standard* v datacentrech.

```
              Spine    Spine    Spine    Spine
              ───┬────────┬────────┬────────┬───
                  ╳        ╳        ╳        ╳
              ───┴────────┴────────┴────────┴───
              Leaf  Leaf  Leaf  Leaf  Leaf  Leaf
              ↓     ↓     ↓     ↓     ↓     ↓
              servery servery
```

Charakteristika:

- *Každý leaf je připojen ke každému spine* (full bipartite graph).
- **ECMP** (Equal Cost Multi-Path) na každém hopu je *nutnost*.
- Mezi *libovolnými dvěma servery* je *konstantní počet hopů* (max 3: server → leaf → spine → leaf → server).
- *L3 fabric* (typicky BGP unnumbered) nebo *large-scale L2 bridging* (TRILL, SPB).

### Variance — Folded Clos

Leaf-spine je variantou **CLOS network**:

```
            Input Switch 1  ╲    ╱  Output Switch 1
                              ╳
            Input Switch 2  ╲ ╳ ╱  Output Switch 2
                              ╳
            Input Switch 3  ╱ ╳ ╲  Output Switch 3
                              ╳
            Input Switch 4  ╱    ╲  Output Switch 4
                  ↕ Middle Switch ↕
                  └ Switch Fabric ┘
```

Equivalentně:

- *Input switches* + *output switches* (na stejné rovině!) = **Leaves**.
- *Middle switches* = **Spines**.

To je *prostá* nová terminologie pro starou architekturu — vlastnost rearrangeable nonblocking se zachovává.

## Sample Folded 3-Stage Clos Network

Pro **velký datacentrum** se používá **POD architektura**:

```
                          Core
                ┌─────────────────────────┐
                │     ┌──┐  ┌──┐  ┌──┐ ...│
                │     └──┘  └──┘  └──┘    │
                └───────────────────────────┘
                          
              Aggregation Pod 0    Pod 1    Pod 2    Pod 3
              ┌───┐ ┌───┐      ┌───┐  ┌───┐  ┌───┐  ┌───┐
              │ A │ │ A │      │ A │  │ A │  │ A │  │ A │
              └───┘ └───┘      └───┘  └───┘  └───┘  └───┘
                       
                  Edge
              ┌───┐ ┌───┐      ┌───┐  ┌───┐
              │ E │ │ E │      │ E │  │ E │  …
              └───┘ └───┘      └───┘  └───┘
              [servery]
```

- Každý *n-port switch* na edge tier je propojen s *n/2 servery*. Zbývajících *n/2 portů* je připojeno k *n/2 aggregation switchům* → vytváří **pod**.
- *Lze postavit z levných zařízení* uniformní kapacity.
- *Cisco, Arista, Juniper* — referenční datacentrové designy.

### Sample architecture — Force10 vs Arista

**Force10 (Dell):**

- 4 × Z9000 (32 × 40 GbE)
- 32 × S4810 (48 × 10 GbE, 4 × 40 GbE)
- 4-way ECMP, 40 GbE uplinks
- **1 536 × 10 GbE portů @ 3:1 oversubscription**

**Arista:**

- 16 × 7508 (384 × 10 GbE)
- 384 × 7050S-64 (48 × 10 GbE, 4 × 40 GbE)
- 16-way ECMP, 40 GbE → 4 × 10 GbE uplinks
- **18 432 portů @ 3:1 oversubscription**

To je *typický* enterprise/HPC scale. Hyperscale (Google, Facebook) jdou ještě dál — 100 GbE leaf, 400 GbE spine, 100k+ ports.

## Rail-optimized design pro AI clustery

Změna v posledních letech *driven by* **AI clustery**.

**Problém:** AI/ML *workloads* mají *odlišný traffic pattern*:

- *East-west* traffic dominuje (GPU ↔ GPU komunikace pro all-reduce, gradient sync).
- *Bursty* — fáze synchronizace produkuje velkokapacitní burst.
- *Citlivost na latenci* — i 1 µs zpoždění snižuje výkon trénování.

**Rail design:** *GPU je no more than ONE HOP* away from any other in the network.

```
Rail-optimized design:                 Classic fabric design:
                                                
   ┌─────┐                              ┌─────┐ ┌─────┐
   │ TOR │ ─── rails                    │ TOR │ │ TOR │
   └──┬──┘                              └──┬──┘ └──┬──┘
      ↓                                     ↓       ↓
   ┌──┴──┐                              ┌──┴──┐ ┌──┴──┐
   │ GPU │ × N                          │ GPU │ │ GPU │
   └─────┘                              └─────┘ └─────┘
                                                
   (každý GPU vlastní rail               (klasická topologie,
    do TOR — 1 hop k libovolnému        některé GPU jsou
    GPU v networku)                     2 hops daleko)
```

Příklady: **NVIDIA DGX SuperPOD**, **Google TPU pods**, **Meta Grand Teton** clusters.

## Merchant silicon

Klasické switchi měly *vlastní ASIC* od každého výrobce. Posledních ~15 let *standard*:

- *High-speed packet forwarding* se stal **komodita** (commodity).
- *Limitovaná diferenciace* v hardware → custom ASIC dává *málo smysl*.
- **Téměř všichni vendoři používají ASIC od Broadcom**.

Broadcom timeline:

| Generace | Rok | Propustnost | Porty |
| :--- | :---: | :--- | :--- |
| Trident | 2010 | 640 Gbps (40 nm) | 64 × 10 GbE |
| Trident2 | 2012 | 1,28 Tbps (40 nm) | 32 × 40 GbE |
| Tomahawk | 2014 | 3,2 Tbps (28 nm) | 32 × 100 GbE |
| Tomahawk2 | 2016 | 6,4 Tbps (16 nm) | 64 × 100 GbE |
| Tomahawk3 | 2017 | 12,8 Tbps (16 nm) | 32 × 400 GbE |
| Tomahawk4 | 2019 | 25,6 Tbps (7 nm) | 64 × 400 GbE |
| Tomahawk5 | 2022 | 51,2 Tbps (5 nm) | 64 × 800 GbE |

40× zvýšení propustnosti za dekádu — *outpacing Moore's Law*.

## Whitebox a Britebox switching

Když je *silicon* commodity, dává smysl *oddělit HW od SW*:

- **Whitebox switching:** generic hardware (typicky Broadcom Tomahawk) + *third-party* network OS.
- **Britebox switching:** brand-name hardware (Dell, HP) + *third-party* OS.

### Network OS

- **Vendor-supplied:** Big Switch Networks, Cumulus Networks (od NVIDIA), SONiC (Microsoft).
- **Open-source:** Open Network Linux, Open Switch (HP).
- **Home-grown:** *Google, Facebook, Amazon, Microsoft* mají vlastní network OS pro své datacentry.

Hyperscalers (Google atd.) *nikdy nekupují* Cisco/Juniper switchi — používají *whitebox + vlastní OS*.

## Network config management

S tisíci switchi je *ruční konfigurace* nemyslitelná. Vznikly nástroje:

- **Ansible** — Python-based, agentless, YAML playbooks.
- **Puppet** — declarative, agent-based.
- **NAPALM** — Network Automation and Programmability Abstraction Layer with Multivendor support.
- **SALTSTACK** — event-driven automation.

Vše jsou *Python-based*. Mainstream přístup: **Ansible playbooks** pro konfiguraci, **NAPALM** pro vendor-neutrální abstrakci.

Komplexní cesta:

- Ansible → generuje konfigurační soubory.
- NAPALM → posílá konfiguraci do zařízení (vendor-neutrally).
- Validace přes *unit tests* + *integration tests*.

## Co dále

Tématu config managementu věnujeme málo prostoru — je to *operační aspekt*. Důležitější je *koncepční přístup* k *programovatelné síti*. Viz **SDN** ([[sdn-uvod]]).

---

*Zdroj: PDS přednáška 10, Ing. Matěj Grégr, Ph.D., FIT VUT v Brně. Externí reference: Al-Fares, M., Loukissas, A., Vahdat, A.: „A Scalable, Commodity Data Center Network Architecture" (SIGCOMM 2008); Hedlund, B.: „Leaf and spine architecture" (Dell Force10 blog); [Packet Pushers — Demystifying DCN Topologies](https://packetpushers.net/demystifying-dcn-topologies-clos-fat-trees-part1/).*
