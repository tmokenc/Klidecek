# Vícestupňové sítě — Clos a Beneš

Crossbar ([[architektury]]) má $\mathcal{O}(N^2)$ crosspointů. Pro $N = 256$ portů to je 65 536 — zvládnutelné. Pro $N = 4096$ (typický datacentrum) by to bylo 16 milionů — neúnosné. Řešením jsou **vícestupňové (multi-stage) sítě**, které propojí *menší* crossbary do hierarchie. Klasické konstrukce jsou **Closova síť** (1953) a **Benešova síť** (rekurzivní rozšíření).

## Proč vícestupňové

Vlastnosti jednostupňového crossbaru:

- Převážně používán pro malé až střední switchi.
- *Problémy s kvadratickým nárůstem* $\mathcal{O}(N^2)$.
- *HOL blokování*.
- Plánování = matching.

Otázka: *Lze rozšířit počet portů, aniž by se dramaticky rozšířilo pole?*

Odpověď: **Ano** — s použitím vícestupňového přepínání. Inspirace přišla z *telefonní spojovací techniky* (Charles Clos, Bell Labs, 1953).

## Síť Clos($m$, $n$, $r$)

**Třístupňová** přepínací síť parametrizovaná třemi čísly:

- $r$ vstupních křížových přepínačů velikosti $n \times m$.
- $m$ vnitřních křížových přepínačů velikosti $r \times r$.
- $r$ výstupních křížových přepínačů velikosti $m \times n$.

Switch má **$N = n \times r$ portů**.

::: viz clos "Posuvníky n, m, r — značky ukazují, kdy je síť strictly / rearrangeably non-blocking a kolik crosspointů to stojí."
:::

Mezi každým vstupním a výstupním portem existuje **$m$ různých cest** — redundance.

### Closův teorém (1953)

> Pokud $m \geq 2n - 1$, pak lze přidat nové propojení vstupu a výstupu *bez přeskládání* existujících propojení.

Toto je **strictly non-blocking** síť — pro libovolnou konfiguraci disjunktních párů (vstup, výstup) lze přidat nový pár, aniž by se musely změnit existující.

Cena: $m \geq 2n - 1$ → potřebujeme *víc vnitřních bloků*.

### Příklad: 8-portový Clos(7, 4, 2)

- $n = 4$, $r = 2$ → $N = 4 \times 2 = 8$ portů.
- $m = 7 \geq 2 \times 4 - 1$ → splňuje Closův teorém → strictly non-blocking.

Vstupní stage: 2 přepínače 4×7 (8 vstupů → 14 vnitřních linek).
Středová stage: 7 přepínačů 2×2.
Výstupní stage: 2 přepínače 7×4.

Celkem 11 přepínacích bloků (2 vstupní + 7 středových + 2 výstupní) s $2 \cdot (4 \cdot 7) + 7 \cdot (2 \cdot 2) + 2 \cdot (7 \cdot 4) = 140$ crosspointy, což je pro tak malé $N$ *více* než $8^2 = 64$ crosspointů jednostupňového crossbaru — úspora Clos sítě se projeví až pro velká $N$.

### Vlastnosti sítě Clos($m$, $n$, $r$)

Pro switch s $N$ vstupními porty potřebujeme síť Clos($m$, $n$, $\lceil N/n \rceil$).

Celkový počet propojení: $r \cdot (n \cdot m) + m \cdot (r \cdot r) + r \cdot (m \cdot n)$.

Pro $n = \sqrt{N/2}$: počet crosspointů $\approx 2 \cdot m \cdot N + (N/n)^2$, což pro velké $N$ je *mnohem lepší* než $N^2$. Asymptoticky $\mathcal{O}(N \sqrt{N})$.

Konkrétně po přibližení (Liu/Chao 2007): $5{,}76 \cdot N \cdot \sqrt{N}$.

### Příklad pro 256 portů

Pro $N = 256$ a $n = 16$: Clos(31, 16, 16) — *cena* strictly non-blocking.

Switch o 256 portech vyžaduje Clos(31, 16, 16):
- Vstupní stage: 16 přepínačů 16×31 = $16 \cdot 16 \cdot 31 = 7\,936$ crosspointů.
- Středová stage: 31 přepínačů 16×16 = $31 \cdot 256 = 7\,936$.
- Výstupní stage: 16 přepínačů 31×16 = 7 936.
- Celkem ~24 000 crosspointů vs $256^2 = 65\,536$.

## Modifikovaná Clos síť — rearrangeable nonblocking

**Levnější varianta**: pokud $m \geq n$ (místo $2n - 1$), síť je *rearrangeably nonblocking*:

- Pro nový požadavek může být *potřeba přeskládat* stávající zapojení.
- *Méně* středových bloků → *levnější*.
- Výpočet přeskládání musí být *rychlejší* než přenos dat.

### Příklad: Clos(4, 4, 2) — 8-port switch

- $n = 4$, $r = 2$, $m = 4 \geq n$.
- Vstupní: 2 přepínače 4×4.
- Středová: 4 přepínače 2×2.
- Výstupní: 2 přepínače 4×4.

Síť je *neblokující po přeskládání*. Výpočetní složitost přeskládání: $\mathcal{O}(N \log D)$, kde $D$ = počet "barev" (paralelních cest).

### Velká nasazení: Juniper, Cisco

- **Juniper T-series** — Clos(16, 16, 16) — 256 portů, 48 přepínacích bloků v 3 stupních.
- **Cisco ASR 9000** — podobná architektura, různé velikosti pro různé modely.

Pro **mega-switchy** (16k+ portů) se používají **5-stupňové Clos sítě** — *Clos of Clos*.

## Benešova síť $BN_n$

**Benešova síť** je *rekurzivní* generalizace Clos sítí, postavená výhradně z **2×2 přepínačů**.

### Konstrukce

- $BN_1$ (N=2): jediný 2×2 přepínač se stavy `0` (přímý) a `1` (křížený).
- $BN_2$ (N=4): vstupní stage 2×2 přepínače, středová stage 2× $BN_1$, výstupní stage 2×2 přepínače.
- $BN_n$ (N=$2^n$): vstupní stage $N/2$ přepínačů 2×2, středová stage 2× $BN_{n-1}$, výstupní stage $N/2$ přepínačů 2×2.

Počet stupňů: $2 \cdot \log_2(N) - 1$.

::: viz benes "Posuň slider n. Barevné rámečky ukazují rekurzivní rozklad BN_n = vstup + 2×BN_{n−1} + výstup."
:::

### Vlastnosti

- Počet vstupů (portů): $N = 2^n$.
- Bloků: $N/2$-vstupních a $N/2$-výstupních přepínačů 2×2.
- Středová část: rekurzivně 2× $BN_{n-1}$.
- Počet stupňů: $2 \log_2(N) - 1$.

### Smyčkový algoritmus (looping)

Algoritmus pro nalezení propojení v $BN_n$ — **smyčkový (looping) algoritmus**:

- Horní podsíť $BN_i$ slouží pro *dopředné* směrování, dolní pro *zpětné*.
- Postupuje se od vstupů k výstupům a zpět, vždy pro *sousední porty*.
- Nejprve se propojí vstupní a výstupní bloky, poté rekurzivně síť $BN_{i-1}$.

Časová složitost: $\mathcal{O}(N)$.

### Použití v praxi

- **Cisco CRS-1** — $BN_3$ (N = 8) pro vnitřní propojení v rámci čipu.
- **HP/Mellanox InfiniBand** switchi — používají Beneš topologii pro nízkou cenu.
- **Optické přepínače (MEMS)** — Beneš je oblíbená topologie kvůli minimu prvků.

## Srovnání

| Topologie | Crosspointy | Blokování | Použití |
| :--- | :---: | :--- | :--- |
| **Crossbar** | $N^2$ | interně neblok. | < 256 portů |
| **Clos $(2n-1, n, r)$** | $\sim 6N\sqrt{N}$ | strictly non-blocking | 256–4096 portů |
| **Clos $(n, n, r)$** | $\sim 3N\sqrt{N}$ | rearrangeably non-blocking | levnější varianta |
| **Beneš $BN_n$** | $\mathcal{O}(N \log N)$ | rearrangeably non-blocking | optické, InfiniBand |

Klíčové trade-offy:

- *Crossbar* — jednoduchý, ale draho pro velké $N$.
- *Clos strictly* — nejdražší, ale neblokující bez přeskládání.
- *Clos rearrangeable* — kompromis, dnes mainstream.
- *Beneš* — nejmenší crosspointů, ale složité plánování.

---

*Zdroj: PDS přednáška 4, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Clos, C.: „A Study of Non-Blocking Switching Networks" (Bell System Technical Journal, 32:406–424, 1953, [DOI 10.1002/j.1538-7305.1953.tb01433.x](https://doi.org/10.1002/j.1538-7305.1953.tb01433.x)); Liu, B., Chao, H.J.: *High Performance Switches and Routers* (Wiley-IEEE Press 2007).*
