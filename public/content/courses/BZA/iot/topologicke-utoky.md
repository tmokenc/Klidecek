---
title: Útoky na topologii bezdrátových sítí
---

# Útoky na topologii bezdrátových sítí

Bezdrátové prostředí má jednu vlastnost, která klasické IT nepostihuje: **kdokoli na médiu může všechno**. Bezdrátové médium je *broadcast* — útočník nemůže být *vyloučen* z přístupu k éteru. Kombinace s *mesh* topologií (typická pro IoT) otvírá specifické útoky, které v drátových sítích nemají ekvivalent.

## Veřejný bezdrát — důsledky

* **Nelze zamezit přístupu k médiu.** Kdokoli může naslouchat dění na médiu. Kdokoli může vysílat libovolná data.
* **Spektrum je sdílené** — rušení (jamming) nelze odlišit od *legitimního* provozu na fyzické vrstvě.
* **Anonymita útočníka** — antenna na střeše, SDR ve vzdáleném autě, *žádný fyzický kontakt*.

### Typické útoky zneužívající veřejně přístupné médium

* **Replay** — libovolnou zprávu zachycenou z éteru lze znovu přehrát.
* **Rušení (jamming)** — záměrné působení interferencí:
  * **Širokopásmové** — neustálé vysílání white noise na celém pásmu.
  * **Pulzní** (náhodné, reaktivní) — krátké pulse v okamžiku, kdy někdo legitimně vysílá. Reactive jamming je *energy-efficient* (vysílá jen když má smysl) a *těžce detekovatelný*.
  * **Porušení rámců** (destruktivní, manipulační) — modifikace bitů během transmission, aby checksum failoval. Cíl: forced retransmissions → vyčerpání baterie.
* **Software-defined radio (SDR)** — umožňuje *softwarově* nastavit parametry vysílání. Rychlé prototypování v bezdrátovém prostředí, custom data injection. Nástroje: HackRF One ($300), RTL-SDR ($30), LimeSDR, USRP.

### Spoofing

* Vysílání jako *jiné* zařízení — falešná identifikace.
* Pokud síť neimplementuje per-device autentizaci, *libovolný* uzel může vystupovat jako *libovolný* legitimní uzel.

## Útok č. 1 — Energy Depletion

**Cíl:** vyčerpat omezené energetické zdroje IoT zařízení (typicky baterie CR2032 nebo AA, životnost 5–10 let).

**Postup:**

1. Vygenerování zpráv pro cílové zařízení.
2. Přinutit cílové zařízení zprávy *zpracovat* (parsing, krypto verify).
3. Opakovat dokud se baterie nevyčerpá.

**Varianty:**

* **Sleep deprivation torture attack** — zařízení nemůže přejít do sleep režimu (low-power state), protože je *neustále* aktivní zpracováváním útokových zpráv. Z plánovaných 10 let baterie vydrží *týdny*.
* **Bombardování invalid messages** — zařízení musí *ověřit* MAC každé zprávy; útočník vysílá ne-valid zprávy s těžkým MAC ověřením.
* **Authentic but malicious** — útočník s lehkým přístupem k klíči (např. získané z jiného uzlu v mesh) generuje *legitimní* zprávy nadměrně.

**Permanentní DoS** — vyčerpaná baterie obvykle není snadno vyměnitelná (vestavěná v zařízení). Útok je *jednou-použití*, ale **trvalý**.

**Mitigace:**

* **Rate limiting** — maximální počet zpráv za hodinu.
* **Early filtering** — odmítnout zprávy bez plné kryptografické verifikace (např. MAC nad jen IP header, ne celé payload).
* **Sleep guard** — zařízení po N invalid messages přejde do *deep sleep* na X hodin.

## Útok č. 2 — Sinkhole (díra)

**Cíl:** ovládnout veškerou komunikaci procházející okolní sítí.

**Podmínky:** útočník je **insider** (kompromitovaný uzel v mesh síti).

**Postup:**

::: svg "Sinkhole útok: kompromitovaný uzel ohlásí 'výborná cesta k cíli', sousedi nasměrují všechny zprávy přes něj. Útočník je MITM celé okolní sítě."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aSH1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--danger, #d33)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <circle cx="80" cy="60" r="20"/>
    <circle cx="80" cy="120" r="20"/>
    <circle cx="80" cy="180" r="20"/>
    <circle cx="200" cy="40" r="20"/>
    <circle cx="200" cy="100" r="20"/>
    <circle cx="200" cy="160" r="20"/>
  </g>
  <g fill="var(--danger, #d33)" stroke="var(--danger, #d33)" stroke-width="1.6">
    <circle cx="320" cy="110" r="28" fill="var(--bg-card)"/>
  </g>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <circle cx="450" cy="110" r="26"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10.5">
    <text x="80" y="64">u1</text>
    <text x="80" y="124">u2</text>
    <text x="80" y="184">u3</text>
    <text x="200" y="44">u4</text>
    <text x="200" y="104">u5</text>
    <text x="200" y="164">u6</text>
    <text x="320" y="114" fill="var(--danger, #d33)">malicious</text>
    <text x="320" y="125" fill="var(--danger, #d33)" font-size="9">"best route!"</text>
    <text x="450" y="114">gateway</text>
  </g>
  <g stroke="var(--danger, #d33)" stroke-width="1.2" fill="none" marker-end="url(#aSH1)" stroke-dasharray="4 2">
    <path d="M100,60 L292,108"/>
    <path d="M100,120 L292,108"/>
    <path d="M100,180 L292,112"/>
    <path d="M220,40 L292,100"/>
    <path d="M220,100 L292,108"/>
    <path d="M220,160 L292,116"/>
    <path d="M348,110 L424,110"/>
  </g>
</svg>
:::

1. Útočník v síti (kompromitované zařízení) vysílá routing announcements: *"mám výbornou cestu (high quality link) k gateway / koordinátoru"*.
2. Sousedi aktualizují své routing tabulky a všechny zprávy *směřujou* k útočníkovi.
3. Útočník je **MITM** veškeré komunikace v okolní oblasti — může číst, modifikovat, zahazovat zprávy.

**Možná obrana:** ověřování hlášených hodnot — pingování legitimní gateway, měření skutečného RTT. Obejít: útočník má *opravdu* dobrý link (silnější antenna), zprávy doopravdy doručí, jen *po cestě* je čte.

::: viz sinkhole-mesh "Kompromituj uzel E, zapni selective forwarding, posli alarm packet — uvidis, jak alarm spadne (gray hole), zatímco normal pakety projdou."
:::

**Mitigace:** kryptograficky autentizované routing protocols (např. ZigBee NWK s NWK key encryption, RPL with cryptographic mode).

## Útok č. 3 — Sybil útok

Pojmenovaný podle [knihy Sybil (1973)](https://en.wikipedia.org/wiki/Sybil_(Schreiber_book)) o mnohočetné poruše osobnosti.

**Princip:** napadený uzel se vydává za **množinu uzlů** současně. Jeden fyzický uzel generuje *N* identit.

**Použití:**

* **Zvýšení vlivu uzlu** — místo 1 hlasu má N hlasů v consensus protokolu.
* **Přetížení sítě** — N zařízení vyžadují resources (směrování, správa topologie, map&reduce).
* **Ovládnutí P2P sítí / Byzantine consensus** — pokud útočník ovládá > 1/3 uzlů (v PBFT) nebo > 1/2 uzlů (v Nakamoto consensus), může konsenzu manipulovat.
* **Ovládnutí reputačních systémů** — opakované hlasování o reputaci.

**V roce 2012** [prokázána použitelnost na P2P síť BitTorrent](http://homes.cerias.purdue.edu/~spaf/cerias-staff/spafford-publications.html) — Sybil útoky monitorovaly trackery.

**U IoT zařízení:** v sítích často **obtížné prokázání identity**. U ZigBee s defaultní konfigurací — uzel se *prohlásí* za router v sítí, ostatní akceptují → ovládnutí sítě.

::: viz sybil-quorum "Posun pocet honest a sybil uzlu, vyber obranu (PoW, PoS, central authority). Sleduj, kdy se prekroci 1/3 (PBFT) a 1/2 (Nakamoto) prah."
:::

**Mitigace:** *cryptographic identity proofs* (každý uzel má per-device private key), *resource testing* (proof-of-work, proof-of-space), *trusted central authority* (gateway přiděluje IDs).

## Útok č. 4 — Wormhole útok

::: svg "Wormhole útok: dva útočníky propojené vysokorychlostní sítí (např. fiber) předstírají, že jsou sousedi v IoT mesh. Změní topologii, vytváří race conditions."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aWH1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--danger, #d33)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <circle cx="60" cy="110" r="20"/>
    <circle cx="140" cy="60" r="20"/>
    <circle cx="140" cy="160" r="20"/>
    <circle cx="400" cy="60" r="20"/>
    <circle cx="400" cy="160" r="20"/>
    <circle cx="480" cy="110" r="20"/>
  </g>
  <g fill="var(--danger, #d33)" stroke="var(--danger, #d33)" stroke-width="1.6">
    <circle cx="220" cy="110" r="22" fill="var(--bg-card)"/>
    <circle cx="320" cy="110" r="22" fill="var(--bg-card)"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10.5">
    <text x="60" y="114">A</text>
    <text x="140" y="64">B</text>
    <text x="140" y="164">C</text>
    <text x="220" y="114" fill="var(--danger, #d33)">M1</text>
    <text x="320" y="114" fill="var(--danger, #d33)">M2</text>
    <text x="400" y="64">D</text>
    <text x="400" y="164">E</text>
    <text x="480" y="114">F</text>
  </g>
  <g stroke="var(--danger, #d33)" stroke-width="2" fill="none" marker-end="url(#aWH1)">
    <path d="M242,110 L298,110"/>
  </g>
  <g stroke="var(--text-muted)" stroke-width="1" fill="none" stroke-dasharray="3 3">
    <path d="M80,110 L198,110"/>
    <path d="M342,110 L460,110"/>
    <path d="M160,60 L382,60"/>
  </g>
  <text x="270" y="138" font-size="10" text-anchor="middle" fill="var(--danger, #d33)">vysokorychlostní tunel</text>
</svg>
:::

**Princip:** dva útočníky *přímo propojené* vysokorychlostní out-of-band sítí (fiber, dedicated radio link, internet).

**Postup:**

* Útočník $M_1$ je na jedné straně sítě, $M_2$ na druhé.
* $M_1$ zachytí packet z uzlu $A$, *tuneluje* ho přes svou backbone do $M_2$, který ho re-broadcastuje na své straně.
* Uzlu $D$ se zdá, že $A$ je *jeho soused* (paket dorazil "blízko").

**Důsledky:**

* **Ovlivnění topologie sítě** — routing protocol považuje vzdálené uzly za sousední.
* **Routing race condition** — zpráva může být *před* svou dalším pokračováním (paradoxní causality).
* **Změna pořadí přijímaných zpráv**.
* **Porušení kauzality** zpráv (reakce na zprávu před jejím doručením v normální cestě).

::: viz wormhole-tunnel "Zapni tunel mezi M1 a M2 a sleduj, jak vzdalene podsite (A, B, C) ↔ (D, E, F) prepojeny pres out-of-band link vidi vzdalene uzly jako sousedy."
:::

**Speciální případ — Relay útok:**

* MITM útok s využitím wormhole.
* Obchází kontroly vzdálenosti a tzv. air gap.
* Klasický příklad: relay útok na PKE auta (viz [[keeloq]]).

**Mitigace:**

* **Packet leashes** (Hu, Perrig, Johnson 2003) — geographic leash (GPS coordinates v packetu) nebo temporal leash (timestamp + max RTT).
* **Distance bounding** ([[bezkontaktni-nfc]]) — RTT-based proximity test.
* **Routing protocols s authentication** — alespoň částečně omezí, ale ne plně.

## Útok č. 5 — Eclipse attack

* Útočník izoluje **konkrétní uzel** tím, že obsadí *všechny* sousední pozice.
* Cíl zařízení vidí *jen* malicious sousedy, kteří filtrují/modifikují jeho komunikaci.
* Komplikovanější než sinkhole, ale účinnější pro cílený útok.

## Útok č. 6 — Selective forwarding (gray hole)

* Mírnější varianta sinkhole: útočník *neforwarduje* některé pakety (např. ty s alarmovým payload), ostatní propustí normálně.
* Detekce obtížná, protože většina komunikace funguje normálně.
* Cíl: skrýt alarm o útoku, zabránit prevention systému.

## Útok č. 7 — HELLO flood

V protokolech s *hello* zprávami (LEACH, AODV):

* Útočník vysílá *hello* zprávy s vysokým výkonem.
* Vzdálené uzly považují útočníka za souseda (kvůli silnému signálu) a směřují k němu pakety.
* Pakety nikam nedorazí (útočník není doopravdy v dosahu pro response).

Mitigace: bidirectional link verification — soused musí *odpovědět* před akceptací jako route.

## Útok č. 8 — Spoofed advertisement

* V RPL (Routing Protocol for Low-Power and Lossy Networks): útočník vysílá DIS/DIO/DAO control messages s spoofed rank.
* Side effect: routing tree degraduje (rank inconsistency, neoptimální cesty).

## Obecné mitigace pro topologic útoky

* **Cryptographic authentication of routing messages** — každá control message podepsaná per-device klíčem.
* **Reputation systems** — uzly sledují, zda sousedi *opravdu* forwardují pakety.
* **Anomaly detection** — neobvyklé chování (např. uzel hlásí desetkrát víc paketů než typicky) → alarm.
* **Centralized control** (Software-Defined IoT) — gateway plánuje routes, edge zařízení jen vykonávají.
* **Watchdog nodes** — speciální uzly monitorují provoz svých sousedů.

---

*Zdroj: BZA přednášky 2025/26, BZA 08 — Bezpečnost IoT (Hujňák). Externí reference: Karlof, C., Wagner, D.: *Secure Routing in Wireless Sensor Networks: Attacks and Countermeasures* (Ad Hoc Networks 2003) — [PDF](https://people.eecs.berkeley.edu/~daw/papers/secrouting.pdf); Hu, Y.-C., Perrig, A., Johnson, D. B.: *Packet Leashes: A Defense against Wormhole Attacks in Wireless Networks* (INFOCOM 2003) — [PDF](http://users.ece.cmu.edu/~adrian/projects/wormhole/wormhole.pdf); Douceur, J. R.: *The Sybil Attack* (IPTPS 2002) — [PDF](https://www.microsoft.com/en-us/research/wp-content/uploads/2002/01/IPTPS2002.pdf); Mosenia, A., Jha, N. K.: *A Comprehensive Study of Security of Internet-of-Things* (IEEE TETC 2017).*
