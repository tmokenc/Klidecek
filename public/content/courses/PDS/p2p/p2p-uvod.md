# Peer-to-peer sítě — definice a vlastnosti

Problém malého světa ([[maly-svet]]) ukázal, že je *teoreticky možné* postavit funkční síť bez centrálního prvku — uzly se domluví přes lokální znalost. Tato sekce formalizuje koncept **peer-to-peer (P2P) sítí** — definici, vlastnosti a srovnání s klasickou architekturou klient-server.

## Co je P2P síť

P2P se liší od klasických sítí typu klient-server (které jsme probrali v PIS):

- **Jiná koncepce architektury** — *odlišná role uzlů* (peers jsou si rovni; nemají role klient vs server).
- **Jiný způsob adresování** — *adresování obsahem* (resource ID, ne IP adresa).
- **Jiný způsob směrování** — *lokální rozhodování*, specifická struktura sítě (overlay).
- **Specifické vlastnosti** — *decentralizovanost*, *samo-organizovatelnost*.

### Co mají P2P a klient-server podobné

- *Vyžadují funkční IP infrastrukturu* (většinou pracují na *aplikační vrstvě*).
- *Musí řešit* adresování, směrování, autentizaci, zabezpečení a další.

P2P tedy *neruší* IP — *vrství se na ní*. Mluvíme o **logické síti (overlay network)** nad existující fyzickou.

## Příklady P2P sítí

| Kategorie | Příklady |
| :--- | :--- |
| Komunikace elektronických zařízení | Universal Plug-and-Play, Bluetooth, Bonjour |
| Sdílení objektů | Napster, Gnutella, KaZaA, eDonkey, BitTorrent |
| Komunikace mezi uživateli | Skype (do 2017), IM, IRC |
| Sdílení výpočetního prostředí | seti@home, Folding@home, PlanetLab |
| Kryptoměny a decentralizované úložiště | **Bitcoin**, Ethereum, IPFS |

Z těch nejzajímavějších: *Bitcoin* je *P2P síť* — bez centrální banky, bez centrálního serveru. Jen 10 000 *fully validating nodes* po celém světě udržuje *konsensus* o stavu blockchain.

## Overlay — logická síť

Základem každé P2P sítě je **logická síť (overlay)**:

::: viz p2p-overlay "Klikni na peer v horní vrstvě — jeho overlay sousedé se rozsvítí čárkovaně, a v dolní vrstvě (IP) se vykreslí fyzická cesta mezi hostiteli. Hover nad overlay linkem = zobrazí jen jeden."
:::

- **Logická síť** je *postavená nad existující* síťovou strukturou.
- *Definuje* způsob propojení uzlů, směrování, vyhledávání informací, ...
- Jeden *logický skok* (čárkovaně nahoře) reálně prochází několika IP hopy přes routery (zelená cesta dole).

## Definice P2P sítě

Formálně (Schollmeier, 2001):

> P2P síť = **dynamický soubor nezávislých uzlů (peers)**, které jsou propojeny a jejichž zdroje (objekty) jsou k dispozici ostatním uzlům v této síti.

- *Zdroje:* výpočetní výkon, přenosové pásmo, disková kapacita, zařízení (tiskárny).
- *Sdílené zdroje* jsou *přímo přístupné* všem uzlům, kteří je nabízejí *a zároveň využívají*.
- *Síť obsahuje prostředky* pro připojení uzlu k síti, hledání a využití zdrojů.

## Typy P2P sítí

### Pravé (pure) P2P

- *Odebrání libovolného uzlu sítě nemá vliv* na schopnost sítě poskytovat služby.
- Žádný uzel není *speciální*.
- Příklad: **Gnutella v0.4** (čistá broadcast topologie, dnes již minulost).

### Hybridní P2P

- *Využívají centrální uzel* pro poskytování *části* nabízených síťových služeb.
- Centrální bod slouží k *autentizaci, indexování, inicializaci uzlu*, apod.
- Při *nedostupnosti centrálního uzlu* dojde k *omezení či nedostupnosti služeb*.
- Příklad: **Napster** (centrální index souborů), **BitTorrent** (tracker = centrální bod pro vyhledávání peers).

V praxi jsou téměř všechny P2P sítě *hybridní* — čistý decentralizovaný design je *teoreticky elegantní*, ale prakticky obtížný (bootstrapping problem).

## Vlastnosti P2P sítí

### Samo-organizovatelnost

- **Decentralizovaná topologie** — uzly spolupracují na jejím vytvoření a udržování.
- Každý uzel je *zodpovědný za svůj lokální stav* a *část informací* (zdrojů).
- Uzly mají *částečný pohled* na topologii sítě → směrují jen na své *nejbližší sousedy*.
- *Podobné chování* jako sítě **MANET** (Mobile Ad-hoc Networks).

### Autonomní chování (samořiditelnost)

- Uzly se chovají *dle svého nejlepšího rozhodnutí* (sdílení zdrojů vs. *free-riders*).
- *Rozhodování je lokální a nepředvídatelné* → má vliv na topologii sítě, směrování, rozmístění objektů.
- *Uzly se mohou chovat zlomyslně* — Sybil attack, eclipse attack.
- *Problém s ověřením identity uzlů* a důvěryhodností (decentralizované řízení).
- Možnost *kolektivního zneužití* zdrojů (DDoS přes botnet).

### Jak se připojit k P2P síti

Problém *bootstrapping* — jak se *poprvé* dostat do sítě?

- **Broadcast** v lokální síti (Bluetooth, Bonjour).
- **Vyhrazená multicastová skupina**.
- **Registrační (bootstrap) server** — *seznam* známých uzlů, ke kterým se připojit.

Bitcoin: bootstrap je *seznam DNS jmen* (`seed.bitcoin.sipa.be`, atd.) hardcoded v klientovi.

### Spolehlivost

- *Roste s redundancí uzlů a informací*.
- *Kopie objektů* jsou umístěny ve **více uzlech**.
- Čím víc uzlů sdílí daný objekt, tím *odolnější* je síť proti odchodům.

### Životnost uzlu — churn rate

**Doba životnosti uzlu** je krátká a neodhadnutelná → *problém s garancí služby*.

- Závisí na *subjektivním lokálním rozhodnutí*.
- **Churn rate** = *rychlost odlivu zákazníků*.

Měření (Stutzbach, Rejaie, 2006) — typická CCDF (komplementární kumulativní distribuce) délky session:

- *Gnutella:* většina session trvá < 1 hod, dlouhý tail.
- *Kademlia (Kad):* dlouhodobější — typicky hodiny.
- *BitTorrent:* zase kratší — typicky < 1 hod.

Churn je *kritický* problém pro design P2P sítí — algoritmy musí být *odolné* vůči neustálému příchodu a odchodu uzlů.

## Srovnání s klient-server

| Aspekt | Klient–server | Peer-to-peer | Výhody/nevýhody |
| :--- | :--- | :--- | :--- |
| Směr provozu | Asymetrický | Symetrický | vs. xDSL, kabelový modem |
| Topologie sítě | Stabilní | Dynamická | Problém spolehlivosti |
| Robustnost | Centrální bod | Distribuce zdrojů | Kritický počet účastníků |
| Rozšiřitelnost | Náročné | Součást návrhu | **Neomezený růst sítě** |
| Bezpečnost | Velký důraz | Problematické | Chybí odpovědná autorita |
| Správa a řízení | Centralizovaný model | Každý uživatel spravuje vlastní uzel | Samo-organizovaná síť |
| Poskytované zdroje | Omezené možnosti | Dynamicky rostoucí počet zdrojů | Sdílení výpočetního prostoru, paměti |
| Kvalita služeb | Garantovaná | Nelze zajistit | Dynamicky se mění |

Hlavní výhody P2P: **rozšiřitelnost** (síť roste s počtem uzlů) a **resilience** (žádný centrální bod). Hlavní nevýhody: **bezpečnost** (žádná centrální autorita) a **kvalita služby** (žádné garance).

## Co dále

S definicí P2P sítě v ruce přejdeme k *formálnímu modelu* — **referenční model** popisuje jmenné prostory, mapování zdrojů a peers, geometrii overlay. Viz [[referencni-model]].

---

*Zdroj: PDS přednáška 7, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Schollmeier, R.: „A Definition of Peer-to-Peer Networking for the Classification of Peer-to-Peer Architectures and Applications" (P2P '01, [DOI 10.1109/P2P.2001.990434](https://doi.org/10.1109/P2P.2001.990434)); Buford, J., Yu, H., Lua, E.K.: *P2P Networking and Applications* (Morgan Kaufmann 2008); Stutzbach, D., Rejaie, R.: „Understanding Churn in Peer-to-peer Networks" (IMC 2006).*
