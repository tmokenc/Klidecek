# Konkrétní architektury — sběrnice, paměť, crossbar

Obecná architektura ([[prepinac-uvod]]) říká, *co* musí switch obsahovat. Existují však *zásadně odlišné* implementační varianty s vlastními tradeoffy. Tato sekce probere tři klasické: **sdílenou sběrnici**, **sdílenou paměť** a **křížový (crossbar) přepínač**.

## Sdílená sběrnice (Shared Bus)

**Princip:** všechny line karty jsou připojeny k *jedné sběrnici*. V daném okamžiku může komunikovat *jen jeden* port (časové sloty).

```
┌──── Line Card 1 ────┐    ┌─ Bus Controller ──┐
│                     │    │                   │
└─────────┬───────────┘    └─────────┬─────────┘
          │                          │
          ↕═══════════════════════════════════ Shared Data Bus
          │                          │
          ↕═══════════════════════════════════ Control Bus
          │
┌─────────┴───────────┐
│    Line Card N      │
└─────────────────────┘
```

Komponenty:

- *Sdílené médium* (data bus).
- *Řídicí sběrnice* (control bus).
- *Bus controller* — řadič, vyhrazuje sběrnici (token, arbitráž).

### Požadavky

Potřebná **propustnost sběrnice**: $R \times N$

kde $R$ = šířka pásma na portu, $N$ = počet portů. Sběrnice musí *zvládat* maximální agregát všech portů.

Potřebná **šířka sběrnice** (v bitech):

$$w = \frac{R \times N}{r}$$

kde $r$ = taktovací frekvence sběrnice. Pro pevnou frekvenci $r$ je šířka *přímo úměrná* $R \times N$.

### Příklad

Switch má 16 portů po 100 Mb/s, sběrnice taktována 40 MHz:

- Propustnost: $R \times N = 16 \times 100 \cdot 10^6 = 1{,}6 \text{ Gb/s}$.
- Šířka: $w = \frac{1{,}6 \cdot 10^9}{40 \cdot 10^6} = 40 \text{ bitů}$.

### Vlastnosti

- *Nativní implementace* pro **broadcast a multicast** — všichni vidí sběrnici, stačí "neignorovat".
- *Jediný port* může komunikovat v daný okamžik.
- *S počtem portů* roste šířka sběrnice — fyzikální limit.

### Cisco Catalyst 6000 (Classic Mode) {tier=example}

Reálný příklad s třemi typy sběrnic:

- **dBus** (data) — sdílená 32 Gb/s.
- **rBus** (result) — výsledky přepínání (forwarding).
- **cBus** (control) — řízení sběrnice.

Tok rámce:

1. RX karta uloží rámec ze sítě.
2. Karta požádá `cBus` modul (fabric arbitration) o právo zápisu.
3. Po obdržení oprávnění karta umístí rámec na `dBus`.
4. Všechny karty + Supervisor Engine (SE) skopírují rámec do své RX fronty.
5. SE vyhledá výstupní port a poslouchá unicast/multicast, výsledek na `rBus`.
6. Karty, pro které je rámec určen, ho přesunou do TX fronty.

## Sdílená paměť (Shared Memory)

**Princip:** všechny line karty *zapisují* příchozí pakety do *centrální sdílené paměti*; výstupní karta *čte* paket pro odeslání.

```
        write control                      read control
            ↓                                  ↓
┌─── Memory Controller ──────────────────────────────────┐
│                                                        │
│   Central Memory (N writes, N reads)                   │
│   FIFO front pro každý výstup                          │
└─────────┬──────────┬──────────┬──────────┬─────────────┘
          │          │          │          │
      Line Card 1   ...      Line Card N
```

### Rychlost přístupu

$$BW = 2 \times N \times R \quad [\text{b/s}]$$

kde:

- $R$ = rychlost síťového rozhraní.
- $N$ = počet karet.
- Faktor $2N$ = $N$ vstupů + $N$ výstupů (současně).

Doba přenosu buňky velikosti $C$:

$$t = \frac{C}{BW} \quad [s]$$

### Příklad

Switch má 32 portů po 1 Gb/s, buňky 40 B:

$$BW = 2 \times 32 \times 10^9 = 64 \text{ Gb/s}$$
$$t = \frac{40 \cdot 8}{64 \cdot 10^9} = 5 \text{ ns}$$

Pro **40 Gb/s portů**: $t = 0{,}125$ ns — což je *za hranicí* SRAM (5–10 ns) a *daleko* za DRAM (~50 ns).

Proto **sdílená paměť** dosahuje *vysokých propustností*, ale neškálovatelně pro super-rychlé porty.

### Vlastnosti

- *Nativní podpora* broadcast a multicast (jeden zápis, N čtení).
- *Flexibilní velikost* front (FIFO per output).
- Hlavní omezení: **rychlost paměti** $\geq 2 N R$.

### Cisco Catalyst 3550 (shared memory) {tier=example}

- 4 MB sdílené DRAM.
- 10 Gb/s propustnost.
- 200 Mb/s switch channel.
- Notify ring 800 Mb/s — *hlavička* paketu se posílá zvlášť.

Zpracování paketu:

1. *Hlavička* přijde přes notify ring na výstupní rozhraní.
2. *Obsah paketu* se uloží do sdílené paměti.
3. *Výstupní rozhraní* načte z paměti, přidá hlavičku, odešle.

## Křížový přepínač (Crossbar)

**Princip:** matice $N \times N$ křížících se vodičů s tranzistorem na každém *crosspointu*. Aktivace tranzistoru = propojení vstupu se výstupem.

```
         output ports
         1  2  3  4  5  6  7  8
       ┌──┬──┬──┬──┬──┬──┬──┬──┐
   1   │  │  │  │  │  │  │  │  │
       ├──┼──┼──┼──┼──┼──┼──┼──┤
   2 →━━━━━━━━●━━━━━━━━━━━━━━━┥  ← crosspoint ON
       ├──┼──┼──┼──┼──┼──┼──┼──┤
   3   │  │  │  │  │  │  │  │  │
       ├──┼──┼──┼──┼──┼──┼──┼──┤
   …
input ports
```

- $N^2$ propojení (crosspoints), každý implementuje *tranzistor*.
- Dvoustavové chování (ON/OFF).

### Vlastnosti

- **Interně neblokující** — pro disjunktní páry (vstup, výstup) lze přenášet *paralelně*.
- *Paralelní přenosy*.
- *Nativní podpora* multicastu (jeden vstup, několik výstupů ON).
- *Jednoduchá* implementace.
- *Centrální plánovač* — musí vybrat *párování* (matching).

### Nevýhody

- **Kvadratická složitost** $\mathcal{O}(N^2)$ — pro $N = 256$ portů potřebujeme $65{,}536$ crosspointů.
- *Možnost kolizí* — víc vstupů chce *jeden* výstup → soutěž o port.
- *Obtížná garance QoS* při souběžných požadavcích.
- *Chybí redundance* — jen jedna cesta mezi (vstup, výstup).

### Plánování v crossbaru

Plánovač pracuje ve **třech fázích**:

1. **Detekce buněk na vstupu** (request).
2. **Plánování přenosu** (grant) — vyřešit kolize.
3. **Přenos buněk** (transfer).

Algoritmy pro plánování:

- **Take-a-Ticket** — žádost dostane *číslo lístku*; vyřízeno podle pořadí (FIFO).
- **PIM** (Parallel Iterative Matching) — náhodný iterativní matching.
- **iSLIP** — rotující ukazatele, deterministický.

Toto je téma další sekce — [[hol-voq]] a [[planovani-pim]], [[planovani-islip]].

## Souhrn

| Architektura | Propustnost | Multicast | Škálovatelnost | Příklad |
| :--- | :--- | :--- | :--- | :--- |
| **Sdílená sběrnice** | $\propto N$ | nativně | špatná (sběrnice = bottleneck) | Cisco Catalyst 6000 (Classic) |
| **Sdílená paměť** | $\propto 2N$ | nativně | omezena rychlostí paměti | Cisco Catalyst 3550 |
| **Crossbar** | $\propto N^2$ | s plánováním | $\mathcal{O}(N^2)$ crosspointů | Cisco Catalyst 6500 (Sup720+) |

Crossbar je *dominantní* v moderních high-end switchích. Pro super-velké switchy (Cisco CRS-1, Juniper T-series) se používají **vícestupňové sítě Clos** ([[multistage-clos-benes]]) — kompromis mezi $N$ a $N^2$.

---

*Zdroj: PDS přednáška 4, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Aweya, J.: *Switch/Router Architectures: Shared-Bus and Shared-Memory Based Systems* (Wiley-IEEE 2018) a *Systems with Crossbar Switch Fabrics* (CRC Press 2019).*
