# Referenční model P2P

Definice ([[p2p-uvod]]) zavedla *koncept* P2P sítí — overlay, peers, zdroje. Pro formální popis a porovnání různých P2P systémů (Gnutella, Chord, Kademlia, Pastry, CAN) potřebujeme **referenční model** (Aberer et al., 2005). Tato sekce ho probere.

## Pět složek referenčního modelu

P2P systém je formálně popsán pěti složkami:

1. **Jmenný prostor** $\mathcal{I}$ — *identifikátory* uzlů a zdrojů.
2. **Množina zdrojů** $R$ — *resources* (soubory, výpočet, data).
3. **Množina uzlů** $P$ — *peers*.
4. **Mapování zdrojů na identifikátory** $F_R : R \to \mathcal{I}$.
5. **Mapování uzlů na identifikátory** $F_P : P \to \mathcal{I}$.

Plus **struktura logické sítě** (geometrie) — určuje, *kdo s kým sousedí*.

```
Resources                Identifier Space      Universe of Overlays
                                              
   ○ ○                       ┌────────┐         ┌──────┐
   ○                         │ ○  ○  ○ │         │ ○────○│
                             │   ○  ○ │         │ ┃    ┃│
       ↘ F_R                 │ ○  ○ ○ │         │ ○────○│
         ─────→              │  ○  ○  │         └──────┘
       ↗ F_P                 └────────┘
                                              
Peers                                         
   ○ ○                                        
   ○ ○                                        
```

Množina uzlů $P$ zpřístupňuje zdroje $R$ v rámci jmenného prostoru $\mathcal{I}$ pomocí mapování $F_R$ a $F_P$. Mapovací funkce vytváří *vazbu* mezi zdroji a uzly pomocí **metriky blízkosti**.

## Jmenný prostor $\mathcal{I}$

Prostor obsahuje **metriku blízkosti** $d : \mathcal{I} \times \mathcal{I} \to \mathbb{R}$.

### Vlastnosti metriky

Pro $\forall x, y, z \in \mathcal{I}$:

1. $d(x, y) \geq 0$ — nezáporná
2. $d(x, x) = 0$ — *zero distance to self*
3. $d(x, y) = 0 \Rightarrow x = y$ — *only zero distance to self*
4. $d(x, y) = d(y, x)$ — symetrická
5. $d(x, z) \leq d(x, y) + d(y, z)$ — trojúhelníková nerovnost

Pokud splňuje *všech 5* podmínek → **metrický prostor**. Pokud splňuje *(1), (2), (4) a (5)*, ale relaxuje *(3)* (různé body mohou mít vzdálenost 0) → **pseudo-metrický**.

### Význam metriky

- **Adresování:** každý uzel i zdroj obdrží *identifikátor z $\mathcal{I}$*.
- **Lokalizace a směrování:** metrika slouží pro směrování požadavků (komu poslat dotaz).
- **Sdružování:** metrika vede ke *shlukování* zdrojů a uzlů do *klastrů* podle vzdálenosti.

### Příklady metrik

| Síť | Identifier space | Metrika |
| :--- | :--- | :--- |
| **Chord** | $\{0, 1, \ldots, 2^{160}-1\}$ | $(x - y) \mod 2^{160}$ (kruh) |
| **Kademlia** | $\{0, 1\}^{160}$ | XOR: $d(a, b) = a \oplus b$ |
| **Pastry** | $\{0, 1, \ldots, 2^{128}-1\}$ | numerická |
| **CAN** | $[0, 1)^d$ (d-dim torus) | Euklidovská |

XOR metrika v Kademlii je *zvlášť* zajímavá — splňuje vlastnosti metriky (symetrie, trojúhelníková nerovnost) *bez složitějšího výpočtu*. Detail viz [[strukturovane-site]].

## Mapování uzlů $F_P : P \to \mathcal{I}$

Funkce **přiděluje uzlům identifikátory** z $\mathcal{I}$.

- *Každý uzel má jedinečný identifikátor* z $\mathcal{I}$.
- *Každý uzel je zodpovědný za část jmenného prostoru* (decentralizované řízení).
- *Pokud jsou sousední uzly* $I_1, I_2, I_3$, pak $I_2$ je *zodpovědný za prostor* $I_1 < I_2 \leq I_3$.
- *Identifikátor* může být **odvozený z IP adresy** (např. SHA-1 hash IP+port).

### Příklad

V Kademlii: ID uzlu = `SHA1(IP_address || port)` → 160-bit hash. Tím je každý uzel *pseudonáhodně* umístěn v identifier space; uzly jsou rovnoměrně rozloženy *bez central planning*.

## Mapování zdrojů $F_R : R \to \mathcal{I}$

Funkce **přiděluje zdrojům identifikátory** ze stejného jmenného prostoru $\mathcal{I}$.

- *Stejný prostor* jako uzly — důležité pro lokalizaci (*uzel zodpovědný za daný ID prostor* spravuje zdroj se stejným ID).
- *Způsob mapování* je kritický pro úspěšné vyhledávání zdrojů:
  - **Sémantická blízkost zdrojů** — *podobné zdroje by měly mít blízké identifikátory*. To umožňuje *range queries* (Pastry, Chord plug-ins).
  - **Rozložení identifikátorů má vliv na vytížení zdrojů** — pokud jsou *koncentrované*, daný uzel je *přetížen*.
- *$F_R$ se obvykle implementuje jako **hašovací funkce*** → generuje *uniformní rozložení* identifikátorů.

### Příklad

V BitTorrent DHT (Kademlia):

- $F_R(\text{soubor}) = \text{SHA1(soubor)}$ — info_hash.
- $F_P(\text{uzel}) = \text{SHA1(IP:port)}$ — peer ID.

Oba ze stejného 160-bit prostoru → uzly i soubory mají kompatibilní ID.

## Decentralizovaná správa funkcí $\mathcal{M}$

**Management function** $\mathcal{M} : \mathcal{I} \to 2^P$:

- *Definuje odpovědné uzly* z $P$ pro konkrétní *identifikátor*.
- Pro identifikátor $i = F_R(r) \in \mathcal{I}$ je $\mathcal{M}(i)$ množina uzlů spravujících zdroj $r$.
- *Každý uzel $p$ je zodpovědný za identifikátory* $\mathcal{M}^{-1}(p)$.
- *Lokalizace zdroje* $r$ = *vyhledání uzlu*, který jej spravuje, tj. $\mathcal{M}(F_R(r))$.
- *Vyhledání zdroje* implementuje $\mathcal{M}$ na základě **výběru cesty** (tj. *směrování*).

### Vlastnosti funkce $\mathcal{M}$

- $\mathcal{M}$ může být **úplná** či **parciální**:
  - *Parciální:* identifikátory nemusí být vždy spojeny s nějakým uzlem.
  - *Úplná* (obvykle): za každý identifikátor je zodpovědný *nějaký* uzel.
- **Stupeň replikace zdrojů (kardinalita)**: $\mathcal{M}$ typicky obsahuje *více než jeden prvek*. Více uzlů je zodpovědných za *jeden identifikátor*. To dává **redundanci**.
- *Identifikátory* jsou spojeny s **nejbližšími** uzly podle metriky:

$$p \in \mathcal{M}(i) \Rightarrow d(F_P(p), i) = \min_{q \in P} d(F_P(q), i)$$

(Tj. $p$ je nejbližší ze všech uzlů.)

- **Dynamické chování:** $\mathcal{M}$ se *dynamicky mění* podle příchodu a odchodu uzlů.

## Struktura logické sítě (geometrie)

Šestou složkou modelu je **geometrie** sítě — orientovaný graf $G = (V, E)$, který *definuje sousedy*.

### Dynamické chování

Reprezentováno jako posloupnost grafů $G_i, G_{i+1}, G_{i+2}, \ldots$:

- **Připojení uzlu $p'$ (join):**
  - $V_{i+1} = V_i \cup \{p'\}$
  - $E_{i+1} = E_i \cup \{(p', m)\} \cup \{(n, p')\}$ — přidání hran k sousedům.

- **Odpojení uzlu $p'$ (leave):**
  - $V_{i+1} = V_i \setminus \{p'\}$
  - $E_{i+1} = \forall m, n : E_i \setminus \{(p', m)\} \setminus \{(n, p')\}$ — odstranění hran.

### Směrovací tabulka

U *strukturovaných* P2P sítí každý uzel $P$ obsahuje **lokální směrovací tabulku** $R_P(V_P, E_P) \subseteq G$:

- Pro množinu sousedních uzlů $V_P$ platí: jsou to ty *peers připojené hranou* z $P$:
  $$V_P \subseteq V, \quad V_P = \forall (p, q) \in E \Rightarrow (q \in V_P) \wedge (\nexists q \in V_P : (p, q) \notin E)$$
- Pro množinu hran $E_P \subseteq E$: $E_P = \forall (p, q) \in E \Rightarrow (p, q) \in E_P$.

### Směrování do uzlu $u$

- *Pokud existuje hrana* $(p, u) \in E_P$, pak pošli zprávu *přímo* do $u$.
- *Jinak* vyber nejlepší hranu $e = (p, q)$ podle metriky a pošli zprávu do $q$.

## Topologie P2P sítí

Různé sítě se liší **stupněm uzlu** (počtem sousedů) a **průměrem grafu** (max vzdálenost mezi libovolnými uzly):

| Topologie | Stupeň uzlu | Průměr |
| :--- | :--- | :--- |
| de Bruijn | $k$ | $\log_k N$ |
| Trie | $k+1$ | $2\log_k N$ |
| Chord | $\log_2 N$ | $\log_2 N$ |
| CAN ($d$-dim) | $2d$ | $\frac{1}{2} d \cdot N^{1/d}$ |
| Pastry | $(b-1) \log_b N$ | $\log_b N$ |
| Classic butterfly | $k$ | $2 \log_k N(1 - o(1))$ |

Pro $10^6$ uzlů (typická P2P síť):

| | de Bruijn (k=2) | Trie (k=3) | Chord (k=20) | CAN (d=20) | Pastry | Butterfly |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Stupeň 2 | průměr 20 | — | — | — | — | 31 |
| Stupeň 10 | 6 | 13 | — | 40 | — | 10 |
| Stupeň 20 | 5 | 10 | 20 | 20 | 20 | 8 |

→ *Logaritmický* růst průměru je *typický* pro dobré strukturované P2P sítě.

## Co dále

Po formálním modelu je čas na *konkrétní algoritmy*. Dělíme P2P sítě na **nestrukturované** (Gnutella — žádná struktura ID prostoru, vyhledávání flooding) a **strukturované** (Kademlia, Chord — DHT, $\mathcal{O}(\log N)$ lookup). Začneme nestrukturovanými ([[nestrukturovane-site]]).

---

*Zdroj: PDS přednáška 7, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Aberer, K., Alima, L.O., Ghodsi, A., Girdzijauskas, S., Haridi, S., Hauswirth, M.: „The essence of P2P: a reference architecture for overlay networks" (P2P 2005, [DOI 10.1109/P2P.2005.38](https://doi.org/10.1109/P2P.2005.38)); Loguinov, D. et al.: „Graph-theoretic analysis of structured peer-to-peer systems" (SIGCOMM 2003).*
