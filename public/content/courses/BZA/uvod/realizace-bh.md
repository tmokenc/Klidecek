---
title: Realizace bezpečného hardware
---

# Realizace bezpečného hardware

Pojmem *tamper-resistant hardware* (BH, bezpečný hardware) se rozumí zařízení s pěti vlastnostmi:

1. **Vlastní ochrana** — chrání samo sebe před vnějšími vlivy a fyzickým útokem.
2. **Nemožnost obejít** — veškerý přístup k chráněným objektům musí jít přes definované funkce BH; nesmí být "zadní vrátka" v podobě testovacího pinu nebo debug rozhraní.
3. **Uzavřená kryptografie** — algoritmus je veřejný, ale v zařízení neměnitelný (ROM). Klíče jsou tajné a nevydávají se ven.
4. **Operace pomocí klíče, ne export klíče** — zařízení šifruje, dešifruje, podepisuje pomocí svého klíče. Ven jde jen výsledek.
5. **Detekce a reakce na útok** — senzory, alarms, zeroization při invazivním pokusu.

Konstrukčně se BH realizuje ve třech fyzických formách, lišících se rozsahem ochrany a cenou.

## Tři fyzické formy realizace

::: svg "Tři formy bezpečného hardware: single-chip (čip karty, MCU), multi-chip embedded (PCI HSM, security karty), multi-chip standalone (síťový HSM, payment terminal)."
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="40" width="150" height="160" rx="8"/>
    <rect x="195" y="40" width="150" height="160" rx="8"/>
    <rect x="370" y="40" width="150" height="160" rx="8"/>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--line)" stroke-width="1">
    <rect x="60" y="100" width="70" height="40" rx="3"/>
    <rect x="230" y="80" width="80" height="20" rx="2"/>
    <rect x="230" y="110" width="80" height="20" rx="2"/>
    <rect x="230" y="140" width="80" height="20" rx="2"/>
    <rect x="400" y="70" width="90" height="20" rx="2"/>
    <rect x="400" y="100" width="90" height="20" rx="2"/>
    <rect x="400" y="130" width="90" height="20" rx="2"/>
    <rect x="400" y="160" width="90" height="20" rx="2"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="95" y="32" font-size="11.5">Single-chip</text>
    <text x="95" y="124" font-size="10" fill="var(--accent)">1 IC</text>
    <text x="95" y="180" font-size="10" fill="var(--text-muted)">čipová karta</text>
    <text x="95" y="194" font-size="10" fill="var(--text-muted)">MCU, secure element</text>
    <text x="270" y="32" font-size="11.5">Multi-chip embedded</text>
    <text x="270" y="180" font-size="10" fill="var(--text-muted)">PCI HSM karta</text>
    <text x="270" y="194" font-size="10" fill="var(--text-muted)">crypto-procesor</text>
    <text x="445" y="32" font-size="11.5">Multi-chip standalone</text>
    <text x="445" y="194" font-size="10" fill="var(--text-muted)">síťové HSM, payment HSM</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9.5">
    <text x="270" y="93">CPU</text>
    <text x="270" y="123">crypto-IC</text>
    <text x="270" y="153">RAM/Flash</text>
    <text x="445" y="83">CPU</text>
    <text x="445" y="113">HSM core</text>
    <text x="445" y="143">network</text>
    <text x="445" y="173">PSU</text>
  </g>
</svg>
:::

### Single-chip moduly

* **Forma:** jeden integrovaný obvod, vše uvnitř — CPU, ROM, RAM, EEPROM/Flash, krypto-koprocesor, RNG, oscilátor, komunikace.
* **Příklady:** čipové karty (ISO 7816 a bezkontaktní), bezpečné mikrokontroléry (Infineon SLE 78, NXP SmartMX, STM32 + STSAFE), Trusted Platform Module (TPM), SIM/eSIM.
* **Výhoda:** malé, levné, masově vyráběné; rozhraní jednoduché. Útočník musí napadnout *jediný* čip — to ale znamená, že útok je *koncentrovaný*.
* **Nevýhoda:** malá energetická a tepelná kapacita = omezené reaktivní obrany (zeroization potřebuje baterii); útoky typu microprobing, FIB, fault injection — viz [[fyzicke-utoky]].

### Multi-chip embedded moduly

* **Forma:** několik samostatných čipů na desce s plošnými spoji (PCB), zalitých společnou epoxidovou pryskyřicí v jednom plombovaném kontejneru. Často jako rozšiřující karta do PCI/PCIe slotu serveru.
* **Příklady:** krypto-akcelerátorové karty (Thales nShield Solo, Utimaco SecurityServer Se), zásuvné bezpečnostní karty pro starší servery.
* **Výhoda:** víc místa pro paměť, koprocesory, baterie, *mesh tamper sensors* (drátěná síť okolo modulu, která detekuje vrtání). Lépe zvládá zeroization.
* **Nevýhoda:** závisí na hostitelském počítači — komunikace přes PCI je potenciální útočný vektor; útočník s root právy na hostu může útočit přes API.

### Multi-chip standalone moduly

* **Forma:** samostatné zařízení s vlastním napájením, kovovým krytem, ventilátory, síťovým rozhraním (Ethernet, console). Velikost serveru 1U–4U.
* **Příklady:** síťové HSM (Thales Luna Network, AWS CloudHSM appliances, Utimaco CryptoServer), payment HSM (Atalla, Thales payShield), kryptografické šifrátory pro vládní použití.
* **Výhoda:** maximální fyzická ochrana — *mesh* okolo celého kovového krytu, senzory (teplota, otřesy, napětí, světlo), aktivní zeroization, baterie pro detekci útoku i po vypnutí. **FIPS 140-3 Level 4** úroveň ([[fips-cc]]).
* **Nevýhoda:** drahé (5 000 – 50 000 USD), komplexní instalace, vysoká spotřeba; vyžaduje servisní procedury (re-keying, audit).

## Pasivní vs. aktivní ochrana

Ochrany BH lze rozdělit na *pasivní* (znesnadňují útok, ale o útoku nevědí) a *aktivní* (detekují útok a reagují):

| Typ | Pasivní | Aktivní |
| :--- | :--- | :--- |
| **Mechanická** | Plomby (tamper evidence), epoxidová zálivka, otrlý kov | Tamper-detect mesh, vibrace, otevření krytu → zeroization |
| **Tepelná** | Materiály odolné do širokého rozsahu | Senzory teploty, mimo $-25\ldots+85$ °C → smaz |
| **Napěťová** | Napěťové regulátory, filtry | Senzor napájení, mimo $\pm 10\%$ → reset/smaz |
| **Hodinová** | Vlastní RC oscilátor (ne externí CLK) | Detektor frekvence — příliš nízká/vysoká → reset |
| **Optická** | Pasivační vrstva, opacní zálivka | Light sensors — světlo uvnitř → smaz |
| **Záření** | Stínění (Cu vrstva, kompoundy) | EM senzor → vyhodnocení |

Klíčový rozdíl: *pasivní ochrana zpomaluje útočníka, aktivní ochrana ho zastavuje*. FIPS 140-3 explicitně vyžaduje aktivní ochranu pro Level 3 (tamper response) a Level 4 (tamper response s detekcí všech identifikovaných útoků, [[fips-cc]]).

::: viz tamper-response "Spust alarm pres ktery senzor: teplota / napeti / mesh / svetlo. Sleduj prechod NORMAL → ALARM → ZEROIZATION → LOCKED a co se smaze. Toggle FIPS Level 3/4."
:::

## Zeroization

*Zeroization* je řízené mazání tajných dat (klíčů) při detekci útoku. Implementace má dva aspekty:

* **Co smazat:** nejen klíče v ROM/Flash, ale i v RAM (zejména SRAM má *retention* — data přežívají několik sekund po vypnutí napájení, při nízkých teplotách i déle, viz [Halderman et al., "Lest We Remember: Cold Boot Attacks on Encryption Keys", USENIX Security 2008](https://citp.princeton.edu/our-work/memory/)). Proto se SRAM aktivně přepíše nulami, ne jen odpojuje napájení.
* **Čím napájet:** zeroization musí proběhnout i bez externího napájení (útočník odpojí). Vyžaduje záložní baterii nebo kondenzátor. FIPS 140-3 Level 4 požaduje, aby zeroization fungovala i pod kapku tekutého dusíku (potenciální cold-boot scénář).

> Návrhový princip: *secret data should leave the device only as the result of an explicit cryptographic operation, never as raw memory content* — z toho plyne, že tajemství v RAM jsou krátkodobá a smazatelná.

## Architektura uvnitř BH

Typický bezpečný mikrokontrolér (např. STM32H5 + secure enclave, Infineon SLE 78) má tyto bloky:

* **CPU jádro** — obvykle ARM Cortex-M nebo proprietární (např. Infineon Integrity Guard) s ochranou proti glitch a DPA.
* **RNG** — buď čistě hardwarový TRNG (šumové diody, ring oscillator jitter, viz [[drng-trng-hybrid]]) nebo certifikovaný DRBG dle AIS-31 ([[ais31-tridy]]).
* **Krypto-koprocesory** — AES, DES/3DES, RSA, ECC (Curve25519, P-256), SHA-2/3. Vlastní HW implementace pro odolnost proti SPA/DPA ([[obrana-pk]]).
* **Bezpečná paměť** — Flash s šifrováním + integritou (MAC nad bloky), SRAM se zeroize, OTP fuses pro neměnitelné parametry.
* **Senzory** — teplota, napětí, světlo, frekvence; výstup vede do *security logic*, která při alarmu spustí zeroization.
* **Bus s integritou** — interní sběrnice s ECC a šifrováním, aby útok mikrojehlou nepřečetl plaintext klíče.

---

*Zdroj: BZA přednášky 2025/26, BZA 01 — Úvod a motivace. Externí reference: NIST FIPS 140-3 — *Security Requirements for Cryptographic Modules* (2019); Anderson, R. J., Kuhn, M.: *Tamper Resistance — a Cautionary Note* (USENIX 1996) — [PDF](https://www.cl.cam.ac.uk/~mgk25/tamper.pdf); Skorobogatov, S.: *Semi-invasive attacks — a new approach to hardware security analysis* (Cambridge UCAM-CL-TR-630, 2005) — [PDF](https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-630.pdf).*
