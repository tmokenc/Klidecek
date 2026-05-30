# Strukturované P2P sítě — Kademlia a BitTorrent DHT

Nestrukturované sítě ([[nestrukturovane-site]]) jsou *jednoduché*, ale *neefektivní* pro řídké objekty. **Strukturované P2P sítě** používají **distribuovanou hash tabulku (DHT)** — vyhledávání v $\mathcal{O}(\log N)$. Tato sekce probere **Kademlii** (kanonický DHT) a její *praktické* použití v **BitTorrent DHT**.

## Princip strukturovaných sítí

> Kombinuje grafové struktury a směrování.

Využívají **distribuované směrovací algoritmy**:

- *Metriky:* shoda prefixu, eukleidovská či lineární vzdálenost, **XOR**, atd.
- *Velikost směrovací tabulky* ovlivněna **stupněm uzlů**.

## Kademlia

**Kademlia** (Maymounkov, Mazières, IPTPS 2002) je *de facto* standard pro moderní P2P sítě (BitTorrent DHT, IPFS, Ethereum Discovery).

### Klíčové vlastnosti

- *Decentralizovaná, rozšiřitelná, samo-organizující se* síť.
- Každý uzel obsahuje informaci *o dalších uzlech a souborech*.
- *Identifikátory uzlů a souborů* jsou tvořeny **160-bitovým SHA-1 hashem**.
- **Metrika blízkosti** = *bitový XOR*: $d(a, b) = a \oplus b$.
- *Distribuovaná hašovací tabulka* (DHT) pro směrování.
- *Složitost vyhledání* je $\mathcal{O}(\log N)$ pro $N$ uzlů.
- *Složitost připojení / odpojení uzlů* je $\mathcal{O}(\log^2 N)$.
- *Použití:* sdílení souborů v síti BitTorrent.

### XOR metrika

$d(a, b) = a \oplus b$ má elegantní vlastnosti:

- *Symetrie:* $d(a, b) = d(b, a)$.
- *Trojúhelníková nerovnost:* $d(a, b) \leq d(a, c) + d(c, b)$.
- *Self-zero:* $d(a, a) = 0$.
- *Unidirectional:* pro daný $x$ a vzdálenost $\Delta$ existuje *právě jeden* $y = x \oplus \Delta$ — užitečné pro určení *„komu poslat odpověď"*.

Důležitější je *praktická* vlastnost: XOR vzdálenost se chová jako vzdálenost v *binárním stromu* — uzly se *stejným prefixem* mají malou XOR vzdálenost.

## Struktura Kademlie

### Jmenný prostor → binární strom

Binární strom *reprezentuje celý jmenný prostor* sítě Kademlia:

- Strom je *rozdělen na podstromy* obsahující uzly se *stejným prefixem*.
- *Každý uzel si vytváří svou směrovací tabulku* zahrnující *celý jmenný prostor*.
- Směrovací tabulku tvoří *zástupci uzlů* reprezentující jednotlivé podstromy.
- *1 až $k$ uzlů* z každého podstromu je uloženo v *seznamu k-bucket* v daném uzlu.

```
            Subtree for Node 0011...

  0  ←  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ →  1
                                  (other half)
   0 ──↘
        … (subtrees with shared prefix)
```

Z pohledu *uzlu*: každý bit od *kořene k uzlu* dělí prostor na "moje strana" a "druhá strana". Pro každou *druhou stranu* udržuje uzel **k-bucket** s několika reprezentanty.

### Příklad směrovací tabulky

Jmenný prostor velikosti $N = 32$, $k = 3$ (bucket), délka ID je 5 bitů.

Vzdálenost mezi uzly:

- $d(2, 3) = 2 \oplus 3 = 1$
- $d(10, 2) = 10 \oplus 2 = 8$
- $d(30, 2) = 30 \oplus 2 = 28$

V síti je *7 uzlů*: 2, 3, 6, 10, 18, 22, 30 (jako příklad).

Směrovací tabulka uzlu 2:

| $i$ | Interval | Peers |
| :---: | :---: | :--- |
| 0 | [1, 2) | 3 |
| 1 | [2, 4) | 1 |
| 2 | [4, 8) | 6 |
| 3 | [8, 16) | 10 |
| 4 | [16, 32) | 18, 22, 30 |

- Řádek $i$ obsahuje uzly ve vzdálenosti $[2^i, 2^{i+1})$ od daného uzlu.
- Pro $\log_2 N = 5$ má tabulka **5 řádků**.
- Pro velikost $N = 2^{160}$ má tabulka **160 řádků**.

### Vytváření směrovací tabulky

Směrovací tabulka se *dynamicky aktualizuje* při příchodu zprávy od jiného uzlu:

- *Pokud řádek $i$ obsahuje méně než $k$ položek*, přidá se nový uzel.
- *Pokud je řádek plný*, otestuje se dostupnost nejpozději přidaného uzlu:
  - *Pokud je naposledy přidaný uzel nedostupný*, nahradí se *novým příchozím*.
  - *Pokud je dostupný*, *nový uzel se nepřidává* → preferují se starší kontakty.

Tato strategie *odolnosti vůči odchodům* je důležitá — *staří, ověření* uzlové jsou *cennější* než nově příchozí (anti-Sybil obrana).

## Komunikace v Kademlii

### Čtyři primitivy

- `PING(nodeID)` — ověřuje, zda je daný uzel připojen.
- `STORE(fileID, nodeID)` — uloží do uzlu fileID hodnotu (typicky info_hash).
- `FIND_NODE(nodeID)` — daný uzel vrátí *$k$ nejbližších uzlů* k uzlu nodeID (IP, port).
- `FIND_VALUE(fileID)` — vrátí *adresu uzlu obsahující soubor* nebo seznam nejbližších uzlů.

### Příklad — vyhledání obsahu

Uzel 2 hledá obsah s `fileID = 26`, $k = 3$, $\alpha = 2$ (parallelism):

1. Uzel 2 vyhledá k-bucket pro $i = 4$ (interval [16, 32)) — $d(2, 26) = 24$.
2. Pošle dotaz na *dva nejbližší uzly* ($\alpha = 2$) z {18, 22, 30}.
3. Každý oslovený uzel *prohledá svou směrovací tabulku*.
4. Uzel 30 vrátí *odkaz na nejbližší uzel* k nodeID 26.
5. Uzel 2 si od něj vyžádá soubor s `fileID = 26`.

::: viz kademlia "5-bitový jmenný prostor (N=32, k=3). Krok-po-kroku FIND_VALUE — každý uzel zná pouze 3 nody na bucket, takže lookup musí postupně přeskákat."
:::

Stupeň paralelismu $\alpha = 2$ umožňuje *redundanci* — pokud jeden uzel neodpoví, druhý ano.

## BitTorrent

**BitTorrent** je nejpoužívanější P2P síť pro sdílení souborů.

### Vlastnosti

- *P2P síť* pro sdílení souborů.
- Komunikace v síti BitTorrent:
  - *Vyhledávání uzlů a zdrojů:* protokol **KRPC, BT-DHT nad UDP**.
  - *Přenášení souborů:* protokol **BitTorrent nad TCP**, *uTP*, porty 6881–6886.
- Pro identifikaci využívá **160-bitové identifikátory**:
  - `peer ID`: identifikace uzlů (náhodný 160-bitový řetězec, viz [BEP 20](https://www.bittorrent.org/beps/bep_0020.html)).
  - `info_hash`: identifikace sdílených souborů (SHA-1 hash souboru).
- Více implementací: **Mainline DHT (MLDHT)**, **KAD**, **VUZE**, a další.

### Vyhledávání zdrojů

Vyhledávání zdrojů v BitTorrent probíhá *dvěma způsoby*:

**A) Pomocí trackerů (klasický přístup)**

- *Torrent* = množina všech uzlů, které se podílejí na distribuci určitého souboru.
- Uzly *si vyměňují a ukládají části daného souboru* (chunks).
- *Soubor je identifikován hodnotou* `info_hash` v souboru metainfo (`.torrent`).
- Metainfo využívá speciální *kódování bencoding* ([BEP 003](https://www.bittorrent.org/beps/bep_0003.html)).

Příklad souboru metainfo (.torrent) pro distribuci OS Debian:

```
d8:announce41:http://bttracker.debian.org:6969/announce7:comment35:"Debian
CD from cdimage.debian.org"13:creation date1520682854...
...4:infod6:length41397379840e4:name28:debian-9.4.0-amd64-DVD-1.iso12:
piece length1048576e6:pieces75880...
```

- **Tracker** = uzel, který udržuje *seznam peers* (uzlů) zapojených v distribuci souboru.
- Uzel, který se stane součástí torrentu, se *zaregistruje u trackeru*.
- Tyto uzly pravidelně *informují tracker*, že jsou součástí torrentu.

**Příklad komunikace:**

1. Alice se připojí na *tracker* a získá seznam peers torrentu.
2. Kontaktuje každý peer protokolem BitTorrent a zjistí, *které části souboru obsahuje*.
3. Protokolem BitTorrent Peer si načte chybějící části souboru.

**B) Pomocí DHT (modernější přístup, BEP 5)**

- *Decentralizovaný systém komunikace* postavený na principu **Kademlie**.
- Využívá aplikační protokol **Mainline DHT (KRPC)** nad UDP pro hledání uzlů.
- Každý uzel (node) obsahuje *směrovací tabulku jmenného prostoru* $[0, 2^{160})$:
  - Tabulka rozdělena na *řádky po $k$ uzlech* (k-buckets), kde $k = 8$.
  - *Dostupnost uzlů* se testuje *každých 15 minut*.
- Síť DHT tvoří uzly (nodes), které obsahují *adresy peerů* pro distribuci souboru.
- *Příkazy DHT:* `ping`, `find_node`, `get_peers`, `announce_peer`.
- *Příkazy BitTorrent* pro přenos souborů: `handshake`, `have`, `request`, `piece`.

#### Příklad DHT

Uzel A (29) obsahuje soubor $x = 59$. Uzel C hledá tento soubor.

1. **A vyhledá pomocí `get_peers` nejbližší uzel ke jménu $x$.** Je to uzel B.
2. **A oznámí B pomocí `announce_peer`**, že vlastní soubor $x$. B si to uloží.
3. **C hledá uzly nejbližší ke jménu $x$.**
4. **B pošle C seznam uzlů (swarm) pro $x$.**
5. **C se připojí do swarm a stáhne soubor $x$ od A** pomocí protokolu BitTorrent.

```
get_peers Query = {"t": "aa", "y": "q", "q": "get_peers", "a":
  {"id": "abcdefghij0123456789", "info_hash": "mnopqrstuvwxyz123456"}}

announce_peers Query = {"t": "aa", "y": "q", "q": "announce_peer", "a":
  {"id": "abcde56789", "implied_port": 1, "info_hash": "mnopqrstuvwxyz123456", "port": 6881}}
```

Klíčový poznatek: *přidání struktury* (DHT s XOR metrikou) přináší *garantovaný* $\mathcal{O}(\log N)$ lookup za cenu *složitější* správy směrovacích tabulek a *bootstrap procesu*.

---

*Zdroj: PDS přednáška 7, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Maymounkov, P., Mazières, D.: „Kademlia: A Peer-to-Peer Information System Based on the XOR Metric" (IPTPS '01, 2002, [DOI 10.1007/3-540-45748-8_5](https://doi.org/10.1007/3-540-45748-8_5)); [BEP 5 — DHT Protocol](http://www.bittorrent.org/beps/bep_0005.html); [BEP 3 — BitTorrent Protocol](http://www.bittorrent.org/beps/bep_0003.html); Wang, L., Kangasharju, J.: „Measuring large-scale distributed systems: case of BitTorrent Mainline DHT" (IEEE P2P 2013).*
