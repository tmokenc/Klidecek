---
title: Byzantine Generals Problem a OM algoritmus
---

# Byzantine Generals Problem — konsensus se zrádci

**Byzantine generals problem** (Lamport, Shostak, Pease 1982) je *zobecnění* problému konsensu pro situaci, kdy procesy mohou *libovolně lhát* — **Byzantine failures**. Klasický výsledek: pro tolerování $m$ Byzantine procesů je nutných **aspoň $3m + 1$** procesů. Tato kapitola probírá *problém*, jeho *dolní mez*, a *OM algoritmus* (Oral Messages), který dosahuje konsensu.

## Příběh Byzantského císařství

**Imaginární scénář** (Lamport et al. 1982):

> Byzantské vojsko je rozděleno do několika armád, každá s vlastním generálem. Generálové komunikují *zprávami* (přes seržanty). Některé generály mohou být *zrádci* — infiltrátoři, kteří chtějí zhatit útok. Útok na město musí proběhnout *koordinovaně* — všechny věrné armády musí *zaútočit ve stejný čas*. Jak věrní generálové dosáhnout shody navzdory zrádcům?

### Formalizace

- **n procesů** (generálové + seržanti).
- **m zrádných** (Byzantine).
- **$n - m$ věrných** (korektních).

**Požadavky**:

- **IC1 (Interactive Consistency 1)**: všichni *věrní* seržanti vykonají *stejný* příkaz.
- **IC2 (Interactive Consistency 2)**: pokud generál (commander) je *věrný*, *všichni* věrní seržanti vykonají *jeho* příkaz.

## Dolní mez — $n \ge 3m + 1$

### Pro tři procesy s jedním zrádcem konsensus *nelze* dosáhnout

Mějme 3 procesy: generál $G$ + dva seržanti $S_1, S_2$.

**Scénář 1**: $G$ je zrádce, oba seržanti věrní.

```
G pošle:  S_1 ← "útok"
G pošle:  S_2 ← "ústup"
S_1 a S_2 si vymění informace:
  S_1 → S_2: "G řekl útok"
  S_2 → S_1: "G řekl ústup"
S_1 vidí: vlastní "útok" + S_2 řekl "ústup" → nejisté
S_2 vidí: vlastní "ústup" + S_1 řekl "útok" → nejisté
```

Žádný věrný seržant nemůže rozhodnout — IC1 selže.

**Scénář 2**: $S_2$ je zrádce, $G$ a $S_1$ věrní.

```
G pošle všem "útok"
S_2 (zrádce) lže S_1: "G mi řekl ústup"
S_1 vidí: G řekl "útok" + S_2 řekl "G řekl ústup"
S_1 nemůže poznat, který je zrádce
```

**Z pohledu $S_1$ jsou scénáře 1 a 2 *nerozlišitelné*** — vidí stejné zprávy. Tedy $S_1$ se musí chovat stejně v obou. Ale v Scénáři 2 musí jít „útok" (IC2 = G věrný), zatímco v Scénáři 1 je výsledek nejistý.

**Spor**. Pro 3 procesy s 1 zrádcem konsensus *nelze*.

### Obecná dolní mez

**Věta**: pro $n \le 3m$ procesů s $m$ zrádci konsensus *nelze* dosáhnout. Tedy **nutné je $n \ge 3m + 1$**.

**Důkaz redukcí**: kdyby existoval algoritmus pro $n = 3m$, šel by *redukovat* na případ 3 procesů (skupinováním po $m$). Ale 3-procesní případ *nemá* řešení → spor.

::: svg "Byzantine generals — proč 3 procesy s 1 zrádcem nestačí"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <circle cx="270" cy="40" r="16"/>
    <circle cx="170" cy="140" r="16"/>
    <circle cx="370" cy="140" r="16"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="44">G</text>
    <text x="170" y="144">S_1</text>
    <text x="370" y="144">S_2</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#bga)">
    <line x1="258" y1="50" x2="180" y2="125"/>
    <line x1="282" y1="50" x2="360" y2="125"/>
  </g>
  <defs>
    <marker id="bga" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="190" y="85" fill="var(--accent)" font-size="9">útok</text>
  <text x="350" y="85" fill="var(--accent)" font-size="9">ústup</text>
  <g stroke="var(--accent-line)" stroke-width="0.9" fill="none" marker-end="url(#bga2)">
    <line x1="185" y1="140" x2="355" y2="140"/>
    <line x1="355" y1="148" x2="185" y2="148"/>
  </g>
  <defs>
    <marker id="bga2" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent-line)"/>
    </marker>
  </defs>
  <text x="270" y="135" fill="var(--accent-line)" text-anchor="middle" font-size="9">řekl ústup ↔ řekl útok</text>
  <text x="270" y="190" fill="var(--text-muted)" text-anchor="middle" font-size="10">S_1 a S_2 si nemůžou určit, kdo je zrádce</text>
</svg>
:::

## OM algoritmus (Oral Messages)

**OM($m$)** je rekurzivní algoritmus pro řešení Byzantine generals s $m$ zrádci.

### OM(0) — žádní zrádci

```
1. Generál pošle hodnotu všem seržantům.
2. Každý seržant použije obdrženou hodnotu (nebo default, např. RETREAT, pokud nepřišla).
```

Triviální. Funguje, pokud nikdo nelže.

### OM(m) — m zrádců

```
1. Generál pošle hodnotu všem (n - 1) seržantům.
2. Každý seržant si poznačí přijatou hodnotu jako v_i (nebo default).
   Pak působí jako "generál" v sub-instanci OM(m - 1):
   pošle v_i ostatním (n - 2) seržantům.
3. Po dokončení OM(m - 1):
   Každý seržant má vektor (v_1, v_2, ..., v_{n-1}) — hodnoty obdržené od ostatních seržantů
   skrz rekurzivní podproblém.
   Použije MAJORITY(v_1, ..., v_{n-1}) jako svou finální hodnotu.
```

### Příklad OM(1) — 4 procesy, 1 zrádce ($n = 4$, $m = 1$, $3m + 1 = 4$ ✓)

Generál $G$ věrný, posílá `útok` všem 3 seržantům.

**Krok 1**: 3 seržanti dostanou „útok".

**Krok 2**: každý seržant si nominuje za generála své skupiny *bez* $G$ a posílá *svou* `útok` ostatním 2 seržantům.

- $S_1$ (věrný) říká: „G mi řekl útok"
- $S_2$ (věrný) říká: „G mi řekl útok"
- $S_3$ (zrádce) říká: ... cokoli (např. „G mi řekl ústup")

**Krok 3**: $S_1$ aplikuje majority na své $(\text{útok}, \text{útok}, \text{ústup})$ → *útok*. Stejně $S_2$. $S_3$ je zrádce, na rozhodnutí nezáleží.

**Výsledek**: $S_1, S_2$ (věrní) se *shodli* na útok. IC2 splněno (G věrný → výsledek = jeho hodnota). IC1 splněno (oba věrní → stejná hodnota).

### Příklad OM(1) — zrádný generál

$G$ zrádce, posílá $S_1$ "útok", $S_2$ "ústup", $S_3$ ne posílá nic (default).

**Krok 2**: každý seržant posílá svou přijatou hodnotu ostatním:
- $S_1$: „G mi řekl útok"
- $S_2$: „G mi řekl ústup"  
- $S_3$: „G mi nic neřekl, default = RETREAT"

**Krok 3**: $S_1$ aplikuje majority na $(\text{útok}, \text{ústup}, \text{RETREAT})$ → *RETREAT*. $S_2$ aplikuje majority na $(\text{útok}, \text{ústup}, \text{RETREAT})$ → *RETREAT*. $S_3$ aplikuje majority na $(\text{útok}, \text{ústup}, \text{RETREAT})$ → *RETREAT*.

**Výsledek**: všichni se shodli na RETREAT, i když G byl zrádce. IC1 splněno.

### OM(2) — 7 procesů, 2 zrádci ($3m + 1 = 7$ ✓)

Rekurzivní hloubka 2. V každém kroku má každý korektní generál *vlastní* podproblém OM(1).

### Analýza OM($m$)

- **Hloubka rekurze**: $m + 1$.
- **Počet zpráv**: $O(n^m)$ — *exponenciální* v $m$.
- **Komplexita času**: $O(m)$ kol komunikace.

OM je *teoretický* algoritmus. V praxi je *neefektivní* pro $m > 2$.

## Modernější Byzantine algoritmy

### PBFT (Practical Byzantine Fault Tolerance, Castro-Liskov 1999)

První *praktický* Byzantine konsensus protokol:

- $n \ge 3m + 1$ replik.
- Tří-fázový (pre-prepare, prepare, commit).
- $O(n^2)$ zpráv na konsensus.
- Použitý v *blockchain* (Hyperledger Fabric).

### HotStuff (Yin et al. 2019)

- $n \ge 3m + 1$ replik.
- **Lineární** komunikační složitost (O(n)) díky kryptografickým podpisům (signatures).
- Použité v Diem (původně Facebook Libra) blockchainu.

### Algorand, Tendermint

- Permissionless Byzantine konsensus.
- Velmi velký $n$ (tisíce uzlů).
- Random selection committee.

## Byzantine vs Crash-Stop — kompromis

| Aspekt | Crash-Stop (Paxos) | Byzantine (PBFT) |
| :--- | :--- | :--- |
| Tolerated failures | $m < n/2$ | $m < n/3$ |
| Počet replik | $2m + 1$ | $3m + 1$ |
| Komunikace | $O(n)$ | $O(n^2)$ nebo $O(n)$ s sig. |
| Předpoklad | crash-stop | adversarial |
| Použití | databáze, koordinace | blockchain, sec.-kritické |

## Praktické aplikace {tier=practice}

- **Bitcoin** — Proof of Work je *implicitně* Byzantine-tolerant (51 % útoku).
- **Ethereum 2.0** — Casper FFG = PBFT-like + chain-based.
- **Hyperledger Fabric** — PBFT pro privátní blockchain.
- **Bezpečnost-kritické systémy** — letectví (Boeing FBW), kosmický průmysl (NASA), redundance.

## Co dál

[[raft-praxe]] probere **Raft** — modernější, *srozumitelnější* alternativu k Paxosu (pro crash-stop systémy). Pak diskuse o *praktických* aplikacích konsensu v reálných systémech: cloud storage, distribuovaný DBMS, blockchain.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Lamport, L., Shostak, R., Pease, M.: „The Byzantine Generals Problem" (ACM TOPLAS 4(3), 1982, [DOI 10.1145/357172.357176](https://doi.org/10.1145/357172.357176)) — originální problém; Pease, M., Shostak, R., Lamport, L.: „Reaching agreement in the presence of faults" (J. ACM 27(2), 1980); Castro, M., Liskov, B.: „Practical Byzantine fault tolerance" (OSDI 1999, [DOI 10.5555/296806.296824](https://doi.org/10.5555/296806.296824)) — PBFT; Yin, M., Malkhi, D., Reiter, M.K., Gueta, G.G., Abraham, I.: „HotStuff: BFT consensus with linearity and responsiveness" (PODC 2019, [DOI 10.1145/3293611.3331591](https://doi.org/10.1145/3293611.3331591)); Lynch, N.A.: *Distributed Algorithms* (Morgan Kaufmann 1996), kap. 6.*
