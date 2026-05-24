---
title: Linux RNG — design a vývoj
---

# Linux RNG — design a vývoj

Linuxové jádro poskytuje aplikacím náhodná čísla skrz `/dev/random`, `/dev/urandom`, syscall `getrandom(2)` a interní funkci `get_random_bytes()`. Implementace prošla několika *radikálními* redesigny — od původního "yarrow-like" pool v 90. letech přes Mathew Mackallovo blokující `/dev/random` po dnešní ChaCha20-DRBG. Linuxový RNG je dobrým případovým studiem jak požadavek "rychle, bezpečně, na všech zařízeních" vede k tvrdým inženýrským kompromisům.

## Vrstvy architektury

Aktuální Linux RNG (verze ~5.18+) má tři vrstvy:

::: svg "Linux RNG architektura: noise sources → entropy pool → ChaCha20-DRNG → /dev/urandom / getrandom output."
<svg viewBox="0 0 540 280" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aLRNG" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20"  y="20" width="100" height="40" rx="4"/>
    <rect x="20"  y="70" width="100" height="40" rx="4"/>
    <rect x="20"  y="120" width="100" height="40" rx="4"/>
    <rect x="20"  y="170" width="100" height="40" rx="4"/>
    <rect x="20"  y="220" width="100" height="40" rx="4"/>
    <rect x="180" y="100" width="160" height="80" rx="6"/>
    <rect x="400" y="100" width="120" height="80" rx="6"/>
    <rect x="400" y="220" width="120" height="40" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="70"  y="42" font-size="10.5">HID events</text>
    <text x="70"  y="56" font-size="9" fill="var(--text-muted)">kbd, mouse</text>
    <text x="70"  y="92" font-size="10.5">disk IRQ</text>
    <text x="70"  y="106" font-size="9" fill="var(--text-muted)">read, write</text>
    <text x="70"  y="142" font-size="10.5">general IRQ</text>
    <text x="70"  y="156" font-size="9" fill="var(--text-muted)">network, timers</text>
    <text x="70"  y="192" font-size="10.5">hw RNG</text>
    <text x="70"  y="206" font-size="9" fill="var(--text-muted)">RDRAND, TRNG</text>
    <text x="70"  y="242" font-size="10.5">device drivers</text>
    <text x="70"  y="256" font-size="9" fill="var(--text-muted)">add_device_rand.</text>
    <text x="260" y="125" font-size="11.5">input_pool</text>
    <text x="260" y="142" font-size="10" fill="var(--text-muted)">BLAKE2s hash</text>
    <text x="260" y="158" font-size="10" fill="var(--text-muted)">128-byte buffer</text>
    <text x="460" y="125" font-size="11.5">ChaCha20-DRNG</text>
    <text x="460" y="142" font-size="10" fill="var(--text-muted)">CRNG</text>
    <text x="460" y="158" font-size="10" fill="var(--text-muted)">per-CPU</text>
    <text x="460" y="240" font-size="11" fill="var(--accent)">getrandom(),</text>
    <text x="460" y="254" font-size="11" fill="var(--accent)">/dev/urandom</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aLRNG)">
    <path d="M120,40 C140,40 160,100 178,130"/>
    <path d="M120,90 C140,90 160,120 178,135"/>
    <path d="M120,140 L178,142"/>
    <path d="M120,190 C140,190 160,160 178,150"/>
    <path d="M120,240 C150,240 160,180 178,160"/>
    <path d="M340,140 L398,140"/>
    <path d="M460,180 L460,218"/>
  </g>
</svg>
:::

### 1. Noise sources (zdroje entropie)

Linux sbírá entropii z několika kategorií událostí, každá s vlastní API:

* **`add_input_randomness()`** — HID události (klávesa, kliknutí myši). Kombinuje typ události, kód, hodnotu a timestamp. Pro typickou klávesnici ~10 bitů entropie na úhoz.
* **`add_disk_randomness()`** — disk IRQ (read/write events). Časování přerušení od mechanických disků dává entropii; u SSD je velmi nízká (deterministický řadič) — proto je u serverů s pouze SSD entropie chudá.
* **`add_interrupt_randomness()`** — *jakékoli* hardware přerušení. Pro každou IRQ se vezme TSC timestamp + některé registry; mícháno do per-CPU `fast_pool` z důvodu performance, pak periodicky předáno do hlavního poolu.
* **`add_hwgenerator_randomness()`** — *čistá* TRNG od hardware RNG zařízení (Intel RDRAND/RDSEED, ARM TRNG, dedicated PCI TRNG). Jaderný hwrng framework spravuje fronty výstupů.
* **`add_device_randomness()`** — *jednorázová* entropie, kterou driver autora pokládá za náhodnou (MAC adresa, sériové číslo).
* **`add_bootloader_randomness()`** — od 5.4: bootloader může předat entropii v EFI proměnné `LinuxLoaderRandomSeed`. Klíčové pro brzký boot.

### 2. Entropy pool

Centrální *input_pool* je typu **BLAKE2s hash state** o velikosti 128 bajtů (před 5.18 to byl 128-bajtový LFSR; změna z důvodu kryptografické robustnosti).

* Příchozí entropie se **mixuje** do poolu hashováním (`BLAKE2s(state || new_data)`).
* Mixing je rychlý a kryptograficky bezpečný — útočník nemůže obrátit hash a získat předchozí stav.
* Pool je *kontinuálně* aktualizován; každá nová entropie ho mírně modifikuje.

### 3. CRNG (Cryptographic RNG)

Z poolu se *extract* operací (znovu BLAKE2s) vytváří **256-bit klíč** pro ChaCha20. ChaCha20-DRNG je per-CPU instance, která:

* Generuje libovolně dlouhý keystream.
* Po vygenerování ~16 KB se *rekeyuje* nově extrahovaným klíčem z poolu (anti-backtracking — pokud útočník později zkompromituje stav, *nedovolí* mu rekonstruovat předchozí výstupy).
* Per-CPU oddělení snižuje contention na multi-core systémech.

## Konfrontace `/dev/random` vs. `/dev/urandom`

Klasický bod sporu v Linuxu po dvě desetiletí:

* **`/dev/random`** (původně) — *blokující*. Při čtení odhadoval, kolik bitů entropie pool obsahuje, a *blokoval*, dokud nebylo dost entropie. Pro 256-bit klíč čekal na 256 bitů entropie z poolu. **V praxi byl problém** — entropy estimation je nespolehlivá, často chybí entropie, programy zamrzávají.
* **`/dev/urandom`** — *neblokující*. Vrací výstup z DRNG bez ohledu na "množství" entropie v poolu. Předpoklad: jakmile DRNG jednou dostal dost entropie ke startu (typicky 256 bitů), je *navždy* dobrý — DRNG s kryptografickou bezpečností nepotřebuje permanentní reseed.

Bug-or-feature spor vyřešen [LWN 2014](https://lwn.net/Articles/606141/) a (definitivně) v Linux 5.6 / 2020 — `/dev/random` byl převeden na *stejné chování* jako `/dev/urandom` po počátečním seedingu. Rozdíl: `/dev/random` *blokuje pouze před prvním seedem*, pak nikdy.

> **Pravidlo pro aplikace:** vždy používej `getrandom(2)` nebo `/dev/urandom`. `/dev/random` je relikt; v moderním kernel se chová prakticky stejně.

## getrandom(2) — moderní API

Syscall `getrandom(2)` (přidaný v 3.17, 2014) je doporučené API:

```c
ssize_t getrandom(void *buf, size_t buflen, unsigned int flags);
```

* `flags = 0` — *blokuje* dokud CRNG není seedovaný; pak vrací plnou délku.
* `flags = GRND_NONBLOCK` — vrátí `EAGAIN`, pokud není seedován.
* `flags = GRND_RANDOM` — používá `/dev/random` semantiku (irrelevant na nových kernelech).

Výhody oproti `read("/dev/urandom")`:

* Nepotřebuje file descriptor → není napadnutelný `fd_exhaustion` útokem.
* Chroot/sandbox safe (žádný `/dev/urandom` v chroot není problém).
* Kernel implicitně zajistí seeding *před* prvním voláním.

::: viz linux-rng-boot "Vyber scenar (desktop / headless server / IoT VM) a sleduj akumulaci entropie behem boot. Sleduj, zda sshd / dropbear keygen probehne pred dosazenim seeding threshold."
:::

## Boot-time entropy starvation

Klíčový problém: *během prvních sekund po bootu* je entropie chudá:

* Klávesnice/myš nedělají (server bez headless interakcí).
* Disk IRQ — málo, navíc deterministické u SSD.
* Network IRQ — síťová karta se ještě nepřipojila.
* TSC timestamps — předvídatelné krátce po POST.

**Důsledek:** programy generující klíče během boot (`sshd`, `dropbear`, `OpenSSL`) mohou dostat *slabé* klíče. To se stalo v r. 2012, kdy byla analyzována RSA klíče embedded zařízení (routerů, IoT) a zjištěno, že mnohá zařízení sdílela klíče kvůli předvídatelné entropii při bootu. ([Heninger et al. 2012, "Mining Your Ps and Qs"](https://factorable.net/paper.html)).

Mitigace:

* `random.trust_cpu=on` — kernel důvěřuje RDRAND jako seed (Intel, AMD). Sporné — kontroverze "Intel backdoor".
* `random.trust_bootloader=on` — bootloader dodá entropii.
* `crng_init_wait` — sysctl, který blokuje user-space dokud CRNG není seedován.
* Persistent seed v `/var/lib/random-seed` — při shutdownu se uloží 512 bitů z poolu, při bootu se přečtou a primixují.

## Útoky a kontroverze

* **CVE-2013-4345** — bias v `random_bytes()` při nestandardní velikosti.
* **2019: `random` race condition** během boot v Android — Android Pixel zařízení negenerovala dost entropie před `Android KeyStore` inicializací (oprava 2019).
* **Kontroverze Intel RDRAND** — od r. 2013 (Snowden) byly obavy, zda Intel implementoval backdoor. Linus Torvalds *odmítl* používat RDRAND jako *jediný* zdroj entropie. Compromise: RDRAND je *jedním z* mnoha zdrojů; pool se sám hashuje, takže i backdoor v RDRAND nezničí celkový výstup.

## Vztah k AIS-31 a FIPS

Linux RNG **nesplňuje** AIS-31 PTG.3 ([[ais31-tridy]]) — to vyžaduje dedicated fyzikální zdroj s formálním stochastickým modelem. Spadá blíže k **AIS-31 NTG.1** (non-physical TRNG s entropy estimation).

Pro **FIPS 140-3** certifikované Linux distribuce (RHEL FIPS mode, Ubuntu FIPS, SUSE FIPS):

* Používají **OpenSSL FIPS module** s vlastním AES-CTR DRBG (SP 800-90A).
* Seedován z `/dev/urandom`, ale s explicitními health testy SP 800-90B.
* Kernel CRNG samostatně FIPS-certifikovaný *není*.

---

*Zdroj: BZA přednášky 2025/26, BZA 02 — Generátory náhodných čísel. Externí reference: Müller, S.: *Documentation and Analysis of the Linux Random Number Generator*, BSI 2022 — [PDF](https://www.bsi.bund.de/SharedDocs/Downloads/EN/BSI/Publications/Studies/LinuxRNG/LinuxRNG_EN.pdf); Heninger, N., Durumeric, Z., Wustrow, E., Halderman, J. A.: *Mining Your Ps and Qs: Detection of Widespread Weak Keys in Network Devices* (USENIX Security 2012) — [PDF](https://factorable.net/weakkeys12.extended.pdf); Linux kernel: [`drivers/char/random.c`](https://elixir.bootlin.com/linux/latest/source/drivers/char/random.c).*
