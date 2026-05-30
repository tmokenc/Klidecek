---
title: Fyzický čas — Berkley, NTP, Marzullo
---

# Synchronizace fyzického času

V distribuovaných systémech každý uzel má *vlastní* hodiny. Hodiny *driftují* (postupně se odchylují) a *není* žádný „centrální" zdroj času. Pro mnoho aplikací (logování, certifikáty, koordinované akce) potřebujeme, aby uzly měly *přibližně shodný* čas. Tato kapitola probírá tři klasické algoritmy: **Berkleyho algoritmus** (centralizovaný master přibližuje hodiny), **NTP — Network Time Protocol** (hierarchická distribuce z atomových hodin), a **Marzullův algoritmus** pro výběr nejpřesnějšího intervalu času.

## Berkleyho algoritmus

**Berkley algoritmus** (1989) je jednoduchý *master-based* algoritmus pro synchronizaci skupiny uzlů.

### Princip

1. **Hlavní uzel** (master) si vyžádá od *všech* uzlů jejich aktuální čas (resp. *offset* vůči svému).
2. Vypočítá **průměrný offset** (často s vyřazením extrémních hodnot).
3. Pošle každému uzlu *kompenzační* offset — uzel posune své hodiny tak, aby se *přiblížil* průměru.

::: svg "Berkleyho algoritmus — master počítá průměrný offset a opraví uzly"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <rect x="220" y="20" width="100" height="40" rx="3"/>
    <rect x="60" y="120" width="80" height="40" rx="3"/>
    <rect x="180" y="120" width="80" height="40" rx="3"/>
    <rect x="300" y="120" width="80" height="40" rx="3"/>
    <rect x="420" y="120" width="80" height="40" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="38">Master</text>
    <text x="270" y="54" font-size="10">03:06</text>
    <text x="100" y="138">Uzel A</text>
    <text x="100" y="154" font-size="10">03:01 (-5)</text>
    <text x="220" y="138">Uzel B</text>
    <text x="220" y="154" font-size="10">02:58 (-8)</text>
    <text x="340" y="138">Uzel C</text>
    <text x="340" y="154" font-size="10">03:19 (+13)</text>
    <text x="460" y="138">Uzel D</text>
    <text x="460" y="154" font-size="10">03:06 (0)</text>
  </g>
  <g stroke="var(--accent)" stroke-width="0.9" fill="none" marker-end="url(#bka)">
    <line x1="240" y1="65" x2="115" y2="115"/>
    <line x1="255" y1="65" x2="225" y2="115"/>
    <line x1="285" y1="65" x2="335" y2="115"/>
    <line x1="300" y1="65" x2="445" y2="115"/>
  </g>
  <defs>
    <marker id="bka" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="100" y="180" fill="var(--accent)" text-anchor="middle" font-size="9">+5 → 03:06</text>
  <text x="220" y="180" fill="var(--accent)" text-anchor="middle" font-size="9">+8 → 03:06</text>
  <text x="340" y="180" fill="var(--accent)" text-anchor="middle" font-size="9">-13 → 03:06</text>
  <text x="460" y="180" fill="var(--accent)" text-anchor="middle" font-size="9">0 → 03:06</text>
</svg>
:::

### Vlastnosti

- **Jednoduchý**, ale závisí na *spolehlivosti* mastera.
- **Předpoklad**: round-trip čas dotaz-odpověď je *krátký* (např. <100 ms na LAN).
- **Není absolutně přesný** — synchronizuje uzly *mezi sebou*, ne s reálným časem.
- Vhodný pro *uzavřené* clustery, nikoli pro internet.

## Network Time Protocol (NTP)

**NTP** (Mills 1985, RFC 5905) je *standardní* protokol pro synchronizaci času na internetu. Používá *hierarchickou* strukturu **strat** (úrovní).

### Strata

- **Stratum 0**: referenční atomové hodiny (cesium, GPS).
- **Stratum 1**: time servery přímo připojené k Stratum 0.
- **Stratum 2**: synchronizují se s Stratum 1.
- ...
- **Stratum 15**: nejnižší úroveň.
- **Stratum 16**: nesynchronizováno.

::: svg "NTP hierarchie strat — od atomových hodin k běžným klientům"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <rect x="220" y="20" width="100" height="30" rx="3"/>
    <rect x="100" y="80" width="80" height="30"/>
    <rect x="230" y="80" width="80" height="30"/>
    <rect x="360" y="80" width="80" height="30"/>
    <rect x="40" y="140" width="60" height="30"/>
    <rect x="110" y="140" width="60" height="30"/>
    <rect x="220" y="140" width="60" height="30"/>
    <rect x="290" y="140" width="60" height="30"/>
    <rect x="370" y="140" width="60" height="30"/>
    <rect x="440" y="140" width="60" height="30"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="270" y="40">UTC (atomové)</text>
    <text x="140" y="100">Stratum 1</text>
    <text x="270" y="100">Stratum 1</text>
    <text x="400" y="100">Stratum 1</text>
    <text x="70" y="160">Stratum 2</text>
    <text x="140" y="160">Stratum 2</text>
    <text x="250" y="160">Stratum 2</text>
    <text x="320" y="160">Stratum 2</text>
    <text x="400" y="160">Stratum 2</text>
    <text x="470" y="160">Stratum 2</text>
  </g>
  <g stroke="var(--text-faint)" stroke-width="0.6">
    <line x1="250" y1="50" x2="140" y2="80"/>
    <line x1="270" y1="50" x2="270" y2="80"/>
    <line x1="290" y1="50" x2="400" y2="80"/>
    <line x1="140" y1="110" x2="70" y2="140"/>
    <line x1="140" y1="110" x2="140" y2="140"/>
    <line x1="270" y1="110" x2="250" y2="140"/>
    <line x1="270" y1="110" x2="320" y2="140"/>
    <line x1="400" y1="110" x2="400" y2="140"/>
    <line x1="400" y1="110" x2="470" y2="140"/>
  </g>
  <text x="270" y="195" fill="var(--text-muted)" text-anchor="middle" font-size="10">Klienti čerpají z vyšších úrovní, hierarchie zlepšuje škálovatelnost</text>
</svg>
:::

### Komunikační režimy

- **Multicast**: opakované vysílání aktuálního času skupině. Vhodné pro *malé* sítě s rychlým přenosem.
- **Klientský přístup** (client-server): klient volá *proceduru* na serveru. Použitelné v případech, kdy multicast není možný.
- **Párový přístup** (peer): synchronizace se *spárovaným* uzlem. Velká přesnost, ale složitější.

NTP používá **UDP** (port 123) pro nízkou latenci. **Universal Coordinated Time (UTC)** je referenční.

### Výpočet zpoždění a posunutí

Klient odeslal žádost v čase $T_{i-3}$, server ji přijal v $T_{i-2}$, server odpověděl v $T_{i-1}$, klient přijal v $T_i$.

::: svg "NTP — čtyři časová razítka pro výpočet offsetu a delay"
<svg viewBox="0 0 540 160" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line)" stroke-width="0.8" fill="var(--bg-card)">
    <line x1="50" y1="40" x2="50" y2="130"/>
    <line x1="50" y1="40" x2="490" y2="40"/>
    <line x1="490" y1="40" x2="490" y2="130"/>
    <line x1="50" y1="130" x2="490" y2="130"/>
  </g>
  <text x="30" y="40" fill="var(--text-muted)" text-anchor="middle">Klient</text>
  <text x="510" y="40" fill="var(--text-muted)" text-anchor="end">Server</text>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#ntparr)">
    <line x1="50" y1="50" x2="490" y2="80"/>
    <line x1="490" y1="100" x2="50" y2="130"/>
  </g>
  <defs>
    <marker id="ntparr" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="40" y="55" fill="var(--accent)" text-anchor="end">T_{i-3}</text>
  <text x="500" y="83" fill="var(--accent)">T_{i-2}</text>
  <text x="500" y="103" fill="var(--accent)">T_{i-1}</text>
  <text x="40" y="135" fill="var(--accent)" text-anchor="end">T_i</text>
</svg>
:::

**Zpoždění (round-trip delay)**:

::: math
d_i = (T_{i-2} - T_{i-3}) + (T_i - T_{i-1})
:::

(Součet času „jízdy" tam a zpět.)

**Posunutí (offset)** server vůči klientovi:

::: math
o_i = \frac{1}{2}\left[(T_{i-2} - T_{i-3}) - (T_i - T_{i-1})\right]
:::

(Předpokládá se *symetrická* latence; offset je rozdíl mezi *střednou cestou tam* a *střednou cestou zpět*.)

### Příklad

```
T_{i-3} = 124 (klient odeslal)
T_{i-2} = 152 (server přijal)
T_{i-1} = 161 (server odpověděl)
T_i     = 204 (klient přijal)

T_{i-2} - T_{i-3} = 28 (tam)
T_i - T_{i-1} = 43 (zpět)
d_i = 28 + 43 = 71
o_i = (28 - 43) / 2 = -7.5
```

(Znaménko offsetu závisí na konvenci — zda měříme posun serveru vůči klientovi, nebo naopak. Pointa je *vzorec*.)

NTP kontaktuje *více* serverů (typicky 4–8) a získá z každého $(d_i, o_i)$. Filtrování přes **Marzullův algoritmus**.

## Marzullův algoritmus

**Problém**: dostali jsme od $n$ serverů odhady času ve tvaru *intervalů* (kvůli nejistotě). Jaký *interval* nejlépe reprezentuje skutečný čas?

**Marzullův algoritmus** najde *nejmenší interval*, který spadá do **největšího možného počtu** intervalů z množiny.

### Algoritmus

Každý interval $[a, b]$ reprezentujeme jako dvě dvojice: $(a, +1)$ (začátek intervalu) a $(b, -1)$ (konec).

```
procedure MARZULLO(intervals)
  events ← sort all (a, +1) and (b, -1) pairs by offset
  best ← 0
  count ← 0
  best_c ← undefined
  for each (offset, c) in events:
    count ← count + c
    if count > best:
      best ← count
      best_c ← offset
  return interval starting at best_c
```

### Příklad

3 intervaly: $[1, 1]$, $[3, 3]$, $[4, 6]$.

```
Události po seřazení: (1, +1), (1, -1), (3, +1), (3, -1), (4, +1), (6, -1)
                count: 1     0     1     0     1     0
```

Hodnota *count* nikdy nepřesáhne 1 → nejvíc se překrývá *jeden* interval. *Nejmenší* z nich (např. $[1, 1]$ má délku 0) → vyber tento.

Pro 4 intervaly $[1, 4]$, $[2, 5]$, $[3, 6]$, $[2, 4]$:

```
(1,+1), (2,+1), (2,+1), (3,+1), (4,-1), (4,-1), (5,-1), (6,-1)
   1      2      3       4       3       2       1       0
```

Maximum *count = 4* dosáhnuto v offsetu 3 → výsledný interval `[3, 4]`. Tj. čas je *mezi* 3 a 4.

### Use case

NTP používá Marzullův algoritmus pro **konsensus** mezi více servery — filtruje *odlehlé* (chybné) odpovědi.

## Limity synchronizace fyzického času

I s NTP a Marzullou nedosahujeme *absolutně* synchronní hodiny:

- **Drift hodin**: bez korekce uzel ztrácí ~1 sekundu za den.
- **Round-trip latence**: na internetu typicky 10–100 ms; uvnitř datacentra <1 ms.
- **Asymetrie latence**: cesta tam ≠ cesta zpět → systematická chyba v offsetu.
- **Network jitter**: variabilita zpoždění zpráv → nemusí filtrovat.

**Praktická přesnost**:

- **NTP**: 1–50 ms na internetu, <1 ms v LAN.
- **PTP** (Precision Time Protocol, IEEE 1588): <1 μs s hardware podporou.
- **GPS-disciplined oscillator**: <100 ns.

Pro mnoho úloh (logging, time-stamping) **nestačí fyzický čas** — potřebujeme *logické* hodiny ([[logicky-cas]]).

## Co dál

[[logicky-cas]] probere **Lamportovy logické hodiny** a **vektorové hodiny** — *kauzálně konzistentní* abstrakci času, *bez* závislosti na synchronizovaných fyzických hodinách. Tyto algoritmy jsou základem mnoha distribuovaných protokolů (causal consistency, version vectors v distribuovaných databázích). [[volba-master]] probere algoritmy pro výběr *vedoucího* uzlu — kritický stavební blok pro distribuovaný konsensus.

---

*Zdroj: PRL přednášky 2025/26, Ing. František Zbořil ml., Ph.D., a doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Mills, D.L.: „Network Time Protocol (NTP), Version 4" (RFC 5905, 2010, [oficiální RFC](https://tools.ietf.org/html/rfc5905)); Mills, D.L.: *Computer Network Time Synchronization: The Network Time Protocol on Earth and in Space* (2. vyd., CRC Press 2011); Gusella, R., Zatti, S.: „The Accuracy of the Clock Synchronization Achieved by TEMPO in Berkeley UNIX 4.3BSD" (IEEE Trans. Softw. Eng. 15(7), 1989, [DOI 10.1109/32.29484](https://doi.org/10.1109/32.29484)); Marzullo, K., Owicki, S.: „Maintaining the time in a distributed system" (PODC 1983, [DOI 10.1145/800221.806730](https://doi.org/10.1145/800221.806730)); IEEE 1588-2008 (PTP) standard; Coulouris et al.: *Distributed Systems* (5. vyd., 2011), kap. 14.*
