# ARQ a klouzavé okno

Pokud je paket ztracen ([[chyby-paketu]]), detekujeme to přes sekvenční čísla ([[sekvencni-cisla-detekce]]) a timeout ([[timeouty-rtt]]). **Korekce** = poslat paket znovu = **retransmise** = **ARQ** (*Automatic Repeat Request*). Tato sekce probere tři klasické ARQ strategie (**Stop-and-Wait**, **Go-Back-N**, **Selective Repeat**) a uvádí **klouzavé okno** jako základní strukturu.

## Klouzavé okno (sliding window)

**Klouzavé okno** je *nejmenší podmnožina* z prostoru sekvenčních čísel odeslaných paketů, *které ještě nebyly potvrzeny*.

Velikost okna $w$ = počet *unacknowledged* paketů v letu.

Pravidlo:

- Když odesílatel *přijme ACK* → okno se *smrskne zleva* (potvrzené pakety vypadnou).
- Když odesílatel *odešle paket* → okno se *rozšíří zprava* (nový paket se zařadí mezi unacked).

Okno *klouže* po prostoru sekvenčních čísel s tím, jak data tečou.

### Volba velikosti okna

Tradeoff:

- *Příliš malé* → vysoká režie protokolu, špatné využití linky (small bandwidth-delay product).
- *Příliš velké* → riziko zahlcení mezilehlých uzlů, paměťová náročnost.

**Optimum:** $w \approx $ bandwidth × RTT (*bandwidth-delay product*). Pro 100 Mbps linku a 100 ms RTT je BDP = 1,25 MB — okno by mělo být alespoň takové.

V TCP se okno *adaptuje* podle congestion control (viz [[rizeni-toku-zahlceni]]).

## Stop-and-Wait

**Velikost okna = 1.** Odesílatel pošle paket, čeká na ACK, pak pošle další.

```
A → seq:1 → B
A ← ack:1 ← B
A → seq:2 → B
A ← ack:2 ← B
```

- **Výhody:** maximálně jednoduchý.
- **Nevýhody:** *katastrofálně špatné využití pásma*. Pokud RTT je 100 ms a paket 1500 B, max throughput = 15 kB/s = 120 kbps. Na 100 Gbps lince tedy 0,00012 % využití.

Stop-and-Wait se v TCP nepoužívá, ale je *koncepční* základ — vidíme okno o velikosti 1, pak ho zobecníme.

## Go-Back-N

**Velikost okna $w > 1$.** Odesílatel pošle *celé okno* pakety. Pokud nějaký paket selže (timeout), *retransmise od chybného* — všechny pakety od pozice $N$ se pošlou znovu.

Příjemce:

- Přijímá pakety *v pořadí*.
- Out-of-order pakety *zahodí*.
- Posílá *kumulativní ACK* posledního korektně přijatého paketu.

### Výhody

- *Jednoduchá* — bez bufferu na příjemci (vše out-of-order se zahodí).
- *Konzervativní* při burst chybách (jednoduchá implementace).

### Nevýhody

- **Plýtvá pásmem** — retransmise i už úspěšně doručených paketů.
- **Při chybách *nikdy* nedosáhne plné šířky** pásma.

### Efektivita

Pravděpodobnost ztráty $p$, okno $w$:

$$\text{efektivita} = \frac{1 - p}{1 - p + p \cdot w}$$

Příklad: okno $w = 250$ paketů.

- $p = 1\%$: $\text{eff} = \frac{0{,}99}{0{,}99 + 2{,}5} = 28{,}4\%$ — velmi špatná.
- $p = 0{,}01\%$: $\text{eff} = \frac{0{,}9999}{0{,}9999 + 0{,}025} = 97{,}6\%$ — dobrá.

Závěr: **Go-Back-N je tím *nevýhodnější*, čím je rychlejší linka nebo vyšší PER**. Pro moderní vysokorychlostní sítě je *nepoužitelný* sám o sobě.

## Selective Repeat (Selektivní znovuzasílání)

**Velikost okna $w > 1$.** Odesílatel pošle *celé okno*, ale retransmise se týká *jen ztracených* paketů. Příjemce *bufferuje* out-of-order pakety a po doplnění mezery předá aplikaci v pořadí.

Výhody:

- *Chytrejší* než Go-Back-N.
- *Neplýtvá pásmem* — zasílají se *jen* ztracené pakety.

Nevýhody:

- *Složitější* implementace — buffery na řazení paketů, paměť toho, co dorazilo a co ne.

### Varianty selektivního znovuzasílání

#### Fast Retransmit

*Varianta používaná v TCP.* Příjemce zasílá *duplicate ACK* na chybějící paket. Po **3 dup ACK** odesílatel retransmise *bez čekání na timeout*.

Vhodné jen pro *relativně spolehlivé linky*, kde nedochází k více než jedné paketové chybě v rámci okna.

#### Bitová maska (SACK — Selective Acknowledgment)

Příjemce v ACK *připojí bitovou mapu*, která říká, *které pakety v okně dorazily*. Zvětšuje hlavičku ACK, ale dává odesílateli **precizní informaci**.

V TCP se používá jako rozšíření **TCP SACK** (RFC 2018) — *standard* v moderním Linuxu/Windows.

#### NACK

Příjemce posílá *negativní potvrzení* na chybějící pakety. Oproti Fast Retransmit:

- Nezvětšuje hlavičku ACK.
- *Zvládá víc než jednu chybu* v okně.
- *Nezbavuje bufferů* na příjemci.

#### SMART

Hybridní strategie — kombinuje selektivní ACK s "smart" retransmise rozhodnutími (např. retransmise jen pokud byl paket viděn jednou). Použití v některých prostředích s vysokou ztrátou (satelitní spoje).

## Forward Error Correction (FEC)

Vedle ARQ existuje **FEC** — *přidat redundanci* do streamu, aby šly chyby opravit *bez retransmise*.

Princip:

- Každých $k$ paketů zdroje se doplní o $m$ *paritních* paketů.
- Na příjemci stačí přijmout *alespoň $k$ libovolných* z $k + m$ — chybějících až $m$ dopočítá.

```
k zdrojových paketů → encoding → n = k + m paketů → vyšle se po síti
                                                ↓ (některé ztraceny)
≥ k přijatých paketů → decoding → k rekonstruovaných paketů
```

Příklad: každý osmý paket je paritou předchozích sedmi — toleruje *jednu ztrátu* na 8 paketů.

### Výhody FEC

- *Žádná retransmise* — vhodné pro **streaming v reálném čase** (RTP, video conf, satelitní).
- *Nezávisle na latenci* — neexistuje ARQ cyklus.

### Nevýhody FEC

- *Vysoká režie* — paritní pakety zabírají pásmo (typicky 10–20 %).
- *Zvětšuje zpoždění* — příjemce musí přijmout celý FEC blok, než ho může dekódovat.

FEC se používá v *real-time aplikacích* (Zoom, FaceTime, RTP), v hybridních systémech (FEC + ARQ — adaptivně podle ztráty).

## Co dále

ARQ a FEC řeší **error recovery**. Vedle toho potřebujeme regulovat **rychlost** vysílání — buď kvůli příjemci (flow control) nebo kvůli síti (congestion control). Viz [[rizeni-toku-zahlceni]].

---

*Zdroj: PDS přednáška 2 (Transportní protokoly), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: [RFC 2018 — TCP SACK](https://www.rfc-editor.org/rfc/rfc2018); Stevens, W.R.: *TCP/IP Illustrated, Volume 1* (2. vyd., Addison-Wesley 2011), kap. 12–14.*
