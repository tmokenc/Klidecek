---
title: Úvod do postranních kanálů
---

# Úvod do postranních kanálů

**Postranní kanál** (side-channel) je libovolný *nezamýšlený* způsob výměny informací mezi kryptografickým modulem a okolím. Klasická kryptografie zohledňuje útočníka, který má jen *black-box* přístup — vidí vstupy a výstupy, útočí na algoritmus. Útok přes postranní kanál útočí na **implementaci**: algoritmus se musí provést v *reálném* zařízení s fyzikálními vlastnostmi (čas, spotřeba, EM záření, akustika), a tyto projevy nesou informaci o stavu.

## Definice

> Postranní kanál — fyzický nebo logický kanál, který vznikl jako *vedlejší produkt* implementace a poskytuje útočníkovi informaci o zpracovávaných tajemstvích (klíčích, hodnotách registrů, mezivýsledcích).

Útok přes postranní kanál:

1. **Naměří** fyzikální projev (time, power, EM, sound, fault response).
2. **Modeluje** závislost projevu na zpracovávaných datech / klíči.
3. **Zpracuje** dat statisticky / pomocí ML, aby extrahoval klíč.

## Klasický vs. side-channel scénář

::: svg "Klasický útok vs. side-channel útok. Vlevo: black-box, jen vstup/výstup. Vpravo: fyzikální měření spotřeby, času, EM atd."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aPK1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="40" width="220" height="160" rx="8"/>
    <rect x="300" y="40" width="220" height="160" rx="8"/>
    <rect x="80" y="100" width="100" height="50" rx="6"/>
    <rect x="360" y="100" width="100" height="50" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="130" y="62" font-size="12">Klasický (black-box)</text>
    <text x="130" y="130" font-size="11">krypto modul</text>
    <text x="50" y="125" font-size="10" fill="var(--text-muted)">M</text>
    <text x="210" y="125" font-size="10" fill="var(--text-muted)">C</text>
    <text x="410" y="62" font-size="12">Side-channel</text>
    <text x="410" y="130" font-size="11">krypto modul</text>
    <text x="330" y="125" font-size="10" fill="var(--text-muted)">M</text>
    <text x="490" y="125" font-size="10" fill="var(--text-muted)">C</text>
    <text x="410" y="175" font-size="10" fill="var(--danger, #d33)">↓ time, power, EM, error…</text>
    <text x="410" y="190" font-size="10" fill="var(--danger, #d33)">útočník sleduje</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aPK1)">
    <path d="M50,125 L78,125"/>
    <path d="M182,125 L210,125"/>
    <path d="M330,125 L358,125"/>
    <path d="M462,125 L490,125"/>
  </g>
  <g stroke="var(--danger, #d33)" stroke-width="1.2" fill="none" stroke-dasharray="3 3">
    <path d="M410,150 L410,165" marker-end="url(#aPK1)"/>
  </g>
</svg>
:::

* **Klasická kryptografie** předpokládá, že útočníci mají *black-box* přístup k systému — kontrolují vstup a vidí výstup (chosen-plaintext, chosen-ciphertext). Útok cílí na *algoritmus* (mathematical cryptanalysis).
* **Side-channel kryptografie** uznává, že *implementace* běží na fyzikálním zařízení. Útočník využívá *jakékoli* další pozorovatelné: dobu trvání operace, spotřebu energie, EM záření, akustické emise, chybové zprávy, časování přístupů do cache.

## Typy postranních kanálů

* **Časový** (timing) — různá doba zpracování pro různé vstupy/klíče. Viz [[casova-analyza]].
* **Odběrový / výkonový / proudový** (power) — okamžitá spotřeba zařízení během kritické fáze. Viz [[spa-dpa]].
* **Elektromagnetický** (EM emanation) — záření vodičů a tranzistorů během switch. Viz [[em-kanal]].
* **Chybový** (fault / error) — chybové zprávy implementace. Viz [[padding-oracle]].
* **Optický** — fotonová emise CMOS gates (semi-invasive).
* **Akustický** — zvuk kapacitoru, ventilátorů, *high-frequency coil whine* CPU.
* **Mechanický / tepelný** — termální profil čipu (FLIR camera), vibrace.
* **Cache-timing** — různé doby přístupu do CPU cache (Spectre, Meltdown jsou tohoto typu, jen *speculative execution* + cache timing).

## Postranní kanál vs. skrytý kanál

* **Postranní kanál** (side-channel) — *důsledek* fyzické implementace. *Útočník* využívá, *designér* musí mitigovat.
* **Skrytý kanál** (covert channel) — kanál *záměrně* využívaný pro komunikaci dvou kooperujících stran způsobem, který designér nepředpokládal:
  * Sdílený soubor s timestamp informací.
  * Zátěž procesoru (CPU usage pattern).
  * Registry (vysoký vs. nízký).
  * Třeba i fyzické projevy (např. *AirHopper* — exfiltrace dat z air-gapped počítače přes radio emanaci VGA kabelu).

Klasifikace: *side-channel je útok, covert-channel je úmyslné použití*. Ale techniky se překrývají.

## Dvě hlavní třídy útoků

### Jednoduchá analýza (Simple Analysis, SA)

* Útočník se snaží určit klíč **přímo** z jednoho nebo několika měření.
* Vyžaduje, aby *signál* (závislost projevu na klíči) byl *silnější* než *šum*.
* Aplikuje se na operace, které mají *přímou* závislost spotřeby/času na klíčových bitech (např. RSA square-and-multiply, viz [[casova-analyza]]).
* **Single-shot** — z jednoho měření.
* **Multi-shot** — průměrování několika měření pro snížení šumu.

### Diferenciální analýza (Differential Analysis, DA)

* Pracuje *statisticky* nad **tisíci** měření.
* Útočník zná vstup (plaintext) a tipuje *malou část* klíče (např. 8 bitů). Spočítá, jak by se měla projevit pro každý tip; porovná s naměřením.
* Funguje i s *velmi nízkým* signálem — průměrování + korelace odstraní šum.
* Nepotřebuje znalost přesné implementace, jen *modelu úniku* (Hamming weight, Hamming distance).
* Standardní technika: **DPA** (Differential Power Analysis, Kocher 1999) — viz [[spa-dpa]].

::: math
\rho(\text{guess}, \text{measurement}) = \frac{\text{Cov}(\text{model}(k_g), P)}{\sigma_{\text{model}} \cdot \sigma_P}
:::

Pearson korelace mezi modelem (předpokládaná spotřeba pro key guess $k_g$) a měřenou spotřebou $P$. Správný klíč má vysokou $\rho$, nesprávné tipy nízkou.

## Co útoky umí?

* **Recover klíč** — symetrický (AES, DES) i asymetrický (RSA, ECDSA) — z málo měření (typicky 100–10 000).
* **Recover PIN** — TA na verifikaci PIN, [[casova-analyza]].
* **Recover nonce** — pro EdDSA, DSA — i jediný leak může vést k recovery soukromého klíče přes [lattice attacks](https://link.springer.com/chapter/10.1007/3-540-46035-7_4) (např. ROCA, Minerva).
* **Recover firmware / kód** — instrukce mají charakteristické spotřeby.
* **Identify operations** — viz "PA – identifikace instrukce" v [[spa-dpa]].

## Co útoky **neumí** (jako jediný nástroj)

* **Recover plaintext bez znalosti klíče** — to vyžaduje *padding oracle* nebo jiný oracle, ne čistý power.
* **Útok přes Internet (s běžnou implementací)** — vyžaduje fyzický přístup nebo specializovanou pozici (CDN, cloud). *Avšak* timing přes Internet *je možný* (Brumley-Boneh 2003, OpenSSL remote timing attack).

## Limity útoků

* **Šum** — environmental noise (teplota, RF), measurement noise (osciloskop), algorithmic noise (paralelní operace).
* **Synchronizace** — útočník musí *přesně* vědět, kdy zařízení provádí cílovou operaci. Random clock jitter, dummy operations rozbijí synchronizaci.
* **Počet měření** — moderní DPA-resistant zařízení vyžaduje 10⁶ – 10⁹ měření. To je 10 minut – 10 hodin. Pokud útočník nemá tolik času, neuspěje.
* **Klíč hierarchie** — recover *session key* nepomůže, pokud nelze recover *master key*. Hierarchie klíčů ([[realizace-bh|HSM design]]) komplikuje útok.

## Historický přehled

* **1985** — Wim van Eck, *Electromagnetic Radiation from Video Display Units* — odposlech CRT monitoru přes EM emanaci ("Van Eck phreaking").
* **1996** — Paul Kocher, *Timing Attacks on Implementations of Diffie-Hellman, RSA, DSS, and Other Systems* — první formální TA.
* **1999** — Kocher, Jaffe, Jun, *Differential Power Analysis* — DPA, *zrod* power side-channel field.
* **2001** — Quisquater, Samyde, *ElectroMagnetic Analysis (EMA)* — first formal EMA.
* **2002** — Vaudenay, *Security Flaws Induced by CBC Padding* — padding oracle.
* **2003** — Brumley, Boneh, *Remote Timing Attacks Are Practical* — TA přes Internet.
* **2014** — Genkin, Shamir, Tromer, *RSA Key Extraction via Low-Bandwidth Acoustic Cryptanalysis* — akustika přes mikrofon mobilu.
* **2018** — Spectre, Meltdown — cache-timing přes speculative execution.
* **2019** — RAMBleed — Rowhammer + side-channel.

## Strategie obrany

Detailně v [[obrana-pk]]. Stručně dvě filosofie:

* **Hiding** — *skrýt* signál pod šumem. Náhodné delays, dummy operations, jitter, balanced logic. Cíl: snížit SNR (signal-to-noise ratio).
* **Masking** — *rozdělit* tajemství na nezávislé sdílené hodnoty, takže každé pozorování dává *náhodné* hodnoty. Klasické: $K = K_1 \oplus K_2$, operace probíhají nad $K_1, K_2$ odděleně. *Provably secure* proti d-th order DPA.

## Praktické důsledky {tier=practice}

Klíčová ponaučení:

1. *Algoritmus, který je matematicky bezpečný, může být nasaditelně nebezpečný*, pokud implementace nemá ochrany proti SCA.
2. *Side-channel resistance není free* — vyžaduje extra HW (random clock, dummy modules), extra SW (masked AES je 5–10× pomalejší), extra design effort.
3. *Certifikace* (CC EAL, FIPS) testuje resistance na SCA — viz [[fips-cc]]. Pro vysoké úrovně (EAL5+) je *DPA-resistant implementace povinná*.

---

*Zdroj: BZA přednášky 2025/26, BZA 05 — Postranní kanály (Malinka). Externí reference: Mangard, S., Oswald, E., Popp, T.: *Power Analysis Attacks: Revealing the Secrets of Smart Cards* (Springer 2007); Koç, Ç. K. (ed.): *Cryptographic Engineering* (Springer 2009), kap. *Side-Channel Attacks and Countermeasures*; Martinásek, Z.: *Kryptoanalýza postranními kanály* (VUT FEKT, habilitační práce 2014).*
