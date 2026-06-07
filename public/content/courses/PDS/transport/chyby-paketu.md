# Paketové chyby — taxonomie

L4 musí umět detekovat a opravit **chyby na úrovni paketů** (na rozdíl od L2, která řeší *bitové chyby* — viz [[komunikace]]). Tato sekce vyjmenuje **pět kanonických typů paketových chyb** a uvede metriky pro jejich měření (PER, BER).

## Bitové vs paketové chyby

Síť řeší chyby na dvou úrovních:

| Úroveň | Co se může pokazit | Kde se řeší | Jak |
| :--- | :--- | :--- | :--- |
| **Bitová** | jednotlivé bity se převrátí | L2 (Ethernet FCS, WiFi) | *redundance* — CRC, Hamming, konvoluční kódy |
| **Paketová** | pakety se ztratí, duplikují, přehodí | L4 (TCP) | *retransmise* nebo *FEC* |

Bitové chyby jsou *fyzické* (rušení, šum, slabý signál). Paketové chyby jsou *systémové* — vznikají kombinací bitových chyb, přetížení sítě, chybných směrovacích tabulek, vadného HW.

## Pět typů paketových chyb

### 1. Ztráta paketu

**Nejčastější** typ chyby v reálných sítích. Příčiny:

- *Neopravitelná bitová chyba* — FCS na L2 chybu detekuje, paket je *zahozen*.
- *Zahlcení linky* — router přetočil frontu, drop policy.
- *Špatné směrovací tabulky* — paket se ztratí v cyklu nebo dojde do "black hole".
- *Vadný HW nebo špatné ovladače* — méně časté.

Ztráta se v provozu projeví jako *mezera* v sekvenčních číslech (viz [[sekvencni-cisla-detekce]]).

### 2. Ztráta fragmentovaných dat

**Speciální případ** ztráty pro fragmentované IPv4 pakety:

- Pokud se ztratí *jeden* fragment, *celý* původní paket je ztracen (reassembly selže).
- Pravděpodobnost: pokud má každý fragment ztrátu $p$, pro $n$ fragmentů je pravděpodobnost úspěšného doručení celku $(1 - p)^n$ — *exponenciálně* menší.

Proto se moderní design vyhýbá L3 fragmentaci — IPv6 ji nepovoluje na routerech, jen na end-pointech, a vyžaduje **Path MTU Discovery** (PMTUD).

### 3. Duplikace paketu

**Příčina:** Ztratí se *odeslaný paket* **nebo** *jeho potvrzení*. Odesílatel si myslí, že došlo k chybě a *znovuzasílá* — pak ale dorazí *obě* kopie (původní opožděná + retransmise).

V TCP se duplikace projeví jako sekvenční číslo, které už příjemce viděl. TCP příjemce v tom případě pošle **duplicate ACK** — což je *signál* pro Fast Retransmit (viz [[arq-okno]]).

### 4. Vložení paketu (insertion)

Paket se *zničehonic* objeví. Tři příčiny:

- *Zpožděný paket* z předchozího datového toku (po skončení jednoho a začátku jiného).
- **Podvržení útočníkem** — spoofing, injekce. Síťová útok vector.
- *Chyba L2 FCS* — bit se převrátí v adresovém poli, paket dorazí *jiný*.

Vložení je nejtěžší detekovat — sekvenční čísla nemusí pomoci (útočník je může uhodnout).

### 5. Změna pořadí (reordering)

**Příčina:** Pakety od odesílatele jdou *různými cestami* v packet-switched síti (dynamické směrování, ECMP, load balancing). Dorazí v *jiném* pořadí, než byly poslány.

Wireshark to zobrazuje jako `TCP Out-of-Order`. Pro TCP příjemce to znamená:

- Buffer out-of-order pakety.
- Po doplnění *mezery* je možné předat aplikaci v pořadí.

Pro UDP / RTP — záleží na aplikaci. RTP umí stream reorderovat podle sekvenčních čísel.

## Měření chybovosti

Klíčové metriky:

- **BER** (*Bit Error Rate*) — pravděpodobnost bitové chyby:

$$BER = \frac{\text{počet chybných bitů}}{\text{celkový počet přenesených bitů}}$$

- **PER** (*Packet Error Rate*) — pravděpodobnost paketové chyby:

$$PER = \frac{\text{počet chybných paketů}}{\text{celkový počet přenesených paketů}}$$

### Vztah BER → PER

Pro paket délky $N$ bitů a bitovou chybovost $p_e$ platí:

$$p_p = 1 - (1 - p_e)^N$$

(Předpoklad: bitové chyby jsou *nezávislé*. V reálu chyby často přicházejí v burstu — pak je vztah těsnější.)

### Příklad

Spočítej $p_p$ pro paket 1400 B (= 11200 bitů) při dvou hodnotách BER:

- $p_{e1} = 1\%$: $p_{p1} = 1 - (1 - 0{,}01)^{11200} \doteq 99{,}999\%$ — *prakticky vše ztraceno*.
- $p_{e2} = 0{,}01\%$: $p_{p2} = 1 - (1 - 0{,}0001)^{11200} \doteq 67{,}374\%$ — *stále hodně*.

Závěr: **i drobná BER má dramatický dopad na PER**. Pro 1500 B pakety je BER pod $10^{-7}$ nutnost. Moderní optika $10^{-12}$ a lépe.

## Datový tok — definice

Pro pochopení dalších sekcí potřebujeme definici:

> **Datový tok** (*dataflow* / *stream*) $\stackrel{\text{def}}{=}$ posloupnost segmentů procházející *stejnými uzly sítě* a mající *stejné vlastnosti* (IP adresy, porty, ToS, protokol, …).

Klasická definice z RFC: *5-tuple* = $\{$ src IP, dst IP, src port, dst port, protokol $\}$. V SDN se používá *flow* v širším smyslu (libovolná kombinace polí).

## Co dále

Známe *jaké* chyby nastávají. Další sekce ([[sekvencni-cisla-detekce]]) ukáže, **jak je detekovat** — pomocí sekvenčních čísel a alternativně NACK.

---

*Zdroj: PDS přednáška 2 (Transportní protokoly), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: Tanenbaum, A.S.: *Computer Networks*, kap. 3.2 (Error Detection and Correction); [RFC 793 — TCP](https://www.rfc-editor.org/rfc/rfc793).*
