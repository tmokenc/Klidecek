# Nestrukturované P2P sítě

Referenční model ([[referencni-model]]) zavádí *mapování* $F_R, F_P$ a *strukturu* sítě. Nestrukturované P2P sítě dělají *minimum* — *žádné* speciální mapování, *žádná* striktní topologie. Místo toho **využívají poznatky ze sociálních sítí** a *Milgramova small world*. Tato sekce probere klasickou Gnutellu, flooding, expanding ring, random walk a LMS (Local Minima Search).

## Princip

> Vyhledávání zdrojů probíhá tak, že **kontaktujeme svou sociální síť** — sousedy, kteří *vědí* nebo *znají někoho, kdo to ví*.

Watts a Strogatz zkoumali Milgramovu myšlenku „malého světa" na modelu *náhodného grafu s malým průměrem*:

- **Využití sociálních vztahů** pro sdílení informací: bližší přátelé, zájmové skupiny.
- *Každý uzel má své sousedy* → využití tranzitivity vztahu *kdo zná koho*.

### Vlastnosti

- *Neexistuje struktura uložení informace* — objekt je uložen v *náhodně* vybraném uzlu.
- *Každý uzel si udržuje seznam uzlů, které zná* (sousedů).
  - Inicializace seznamu: kopie od souseda, ke kterému se na začátku připojí.
  - *Velikost stupně uzlu* (počet sousedů) určuje *nejlepší cestu mezi sousedy*.
  - Se sousedy si vyměňuje zprávy: hledání objektu (zdroje), ukládání dat.
- **Nebezpečí zacyklení:**
  - Uzel obsahuje *seznam identifikátorů zpráv*, které zpracoval.
  - Využívá se *hodnoty TTL* u zprávy (jako u IP).

## Čtyři vyhledávací algoritmy

### 1. Záplava (flooding)

Uzel pošle dotaz **všem svým sousedům**:

- *Pokud soused* objekt obsahuje, *pošle zpět odpověď*.
- *Pokud neobsahuje*, pošle dotaz svým sousedům (*tranzitivita*).

```
        Query →
           ○ ─────→ ○
          /│         \
         / │          ↘
        ○──○          ○
         \ │          /
          \↓         /
           ○ ←──── ○
```

- *Záplavu lze omezit pomocí TTL* ve zprávě.
- **Gnutella** posílá max. 7 sousedům s TTL max. 10.

### Vlastnosti

- *Jednoduchá implementace*.
- **Minimální paměťové i výpočetní nároky** na uzlu.
- *Neefektivní, špatně rozšiřitelná* — počet zpráv roste *exponenciálně* s TTL.

### 2. Rozšiřující se kruh (expanding ring)

Podobné jako záplava, ale *postupně zvyšuje TTL*:

- *Síť pošle dotaz* na vyhledání objektu s *malým TTL*.
- Pokud objekt najdu → hledání končí.
- *Pokud nenajdu, zvýším TTL* a pošlu dotaz znovu.

```
TTL=1:  ○ → 3 sousedi
TTL=2:  ○ → 9 souse... (pokud TTL=1 neuspělo)
TTL=3:  ○ → 27 souse...
```

- *Rozšiřující kruh redukuje počet zpráv* — typicky najde objekt s minimálním TTL.

### 3. Náhodný průchod (random walk)

Zpráva se *neposílá záplavou*, ale jen **náhodně vybranému sousedovi**:

- *Snižuje režii* všesměrového šíření zprávy.
- *Pokud objekt není nalezen*, pošle se nová zpráva s náhodným průchodem.
- *Dotazy je možno posílat paralelně více sousedům najednou*.
- *Potřeba pamatovat si vybraného souseda* (neposílat dotaz zpět).

Náhodný průchod má *nižší* overhead, ale *delší* dobu vyhledání. Pro hustě zastoupené objekty funguje dobře; pro řídké je *neefektivní*.

### 4. Hledání lokálního minima (Local Minima Search, LMS)

**LMS** kombinuje *jednoduchost* nestrukturovaných sítí s *určitou strukturou ID prostoru* — *„semi-strukturovaný"* přístup (Morselli et al., 2005).

Princip:

- *Množina uzlů* identifikovaných hodnotou $x$.
- *Množina objektů* s identifikátorem $w$ (např. hash veřejného klíče, base jména objektu).
- **Lokální minimum** = uzel, jehož ID je *nejbližší* k ID objektu *v okolí uzlu*.
- *LMS se snaží umístit objekt* do *uzlu $x$*, aby identifikátor *byl sémanticky nejbližší identifikátoru*.
- *Při hledání kombinuje LMS náhodný průchod se směrováním podle klíče* (deterministický průchod).

#### Algoritmus uložení objektu s identifikátorem $w$

1. Uzel $x$ vytvoří zprávu `probe(u, w, walk-length, path)` a pošle ji do sítě.
2. Síť procházíme náhodným průchodem, dokud `walk-length > 0`.
3. *Aktuální uzel $v$* vypočítá *vzdálenost* $d(w, v')$ pro všechny své sousedy $v'$.
4. *Zprávu předá sousedovi s nejmenší vzdáleností $d$*.
5. *Pokud má uzel $v$ menší hodnotu $d$* než sousedé (lokální minimum), **uloží si objekt**.

#### Algoritmus vyhledání objektu $w$

Probíhá *podobně* jako uložení, ale s `search()` zprávou:

1. Procházíme síť *nejprve náhodným průchodem*.
2. Pak vybíráme cestu k uzlu s nejbližší vzdáleností $d(v, x)$.
3. Aktuální uzel vyhledá souseda $v$ s nejmenší vzdáleností $d(v, x)$.
4. Uzel s nejmenší vzdáleností (*lokální minimum*) vrátí objekt nebo zprávu o chybě.
5. *Není-li objekt nalezen*, pošle se nová zpráva `search()`.

#### Možnost nečekaného přesměrování dotazu

Pokud uzel zná lepší cíl, *přesměruje* dotaz:

- Uzel 5 vidí uzel 3 jako svého souseda (h=2) a směruje mu zprávu.
- Uzel 21 zná lepší cíl (uzel 53) a *přepošle* zprávu uzlu 53.

To dynamicky využívá *2-hop neighborhoods* — sousedy sousedů.

## Porovnání směrovacích algoritmů

| Metoda | Charakter | Výhody | Nevýhody |
| :--- | :--- | :--- | :--- |
| **Flooding / Expanding ring** | Síťová záplava | Jednoduchá, malé paměťové nároky | Neefektivní, špatně rozšiřitelná |
| **Random walk** | Náhodný průchod | Nižší overhead | Hledání bez znalosti, dlouhé |
| **Local Minima Search** | Polo-strukturovaný | Lepší navigace přes metriku | Vyžaduje režii lokálních minim |

## Zhodnocení nestrukturovaných sítí

- *Není potřeba znát topologii sítě* — jednodušší vyhledávání a správa sítě.
- *Směrování dle obsahu* (názvu objektu), ne podle identifikátoru (klíče).
- *Směrování není efektivní*, *špatná lokalizace* u *řídce* se vyskytujících objektů.
- **Příklady sítí:** Napster, **Gnutella**, FastTrack, FreeNet, Gia, Tribler, INGA.

Hlavní problém: *čím vzácnější objekt, tím déle se hledá*. Pro skutečně decentralizovanou síť s *miliony objektů* to není praktické. Proto vznikly **strukturované P2P sítě** s *DHT* — ty hledají *v $\mathcal{O}(\log N)$* nezávisle na rozšířenosti objektu.

## Co dále

Strukturované sítě používají **distribuovanou hash tabulku (DHT)**. Klasické příklady jsou *Chord*, *Pastry*, *CAN*, **Kademlia** (nejrozšířenější — používá ji BitTorrent DHT, IPFS, Ethereum). Viz [[strukturovane-site]].

---

*Zdroj: PDS přednáška 7, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Morselli, R., Bhattacharjee, B., Srinivasan, A., Marsh, M.A.: „Efficient lookup on unstructured topologies" (PODC '05, [DOI 10.1145/1073814.1073827](https://doi.org/10.1145/1073814.1073827)); [Gnutella v0.6 protocol](https://gnutella2.sourceforge.net/Specifications); Watts, D.J., Strogatz, S.H.: „Collective dynamics of 'small-world' networks" (Nature 393:440-442, 1998).*
