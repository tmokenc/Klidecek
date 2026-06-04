---
title: AIS-31 funkční třídy generátorů
---

# AIS-31 funkční třídy generátorů

Německý úřad pro informační bezpečnost (BSI) vydal **AIS-31** — *Application Notes and Interpretations* — jako rámec pro hodnocení RNG v rámci certifikace [Common Criteria]([[fips-cc]]). Dokument *A Proposal for: Functionality Classes for Random Number Generators* (Killmann & Schindler, 2011) je dnes *de facto* mezinárodní standard pro RNG v bezpečném HW. V Evropě je AIS-31 povinný pro Smartcard CC certifikace; v USA paralelně existuje **NIST SP 800-90A/B/C**.

## Proč klasifikace?

Před AIS-31 každý výrobce volil vlastní strategii. AIS-31 standardizuje, *co znamená dobrý RNG* — definuje **funkční třídy** s rostoucí úrovní kontroly nad entropií a jejím zpracováním. Certifikační laboratoř (BSI, NIAP, AIVD) ověřuje, že RNG splňuje konkrétní třídu.

Klasifikace odděluje **deterministické** (DRG) a **fyzikální/nefyzikální** (PTG, NTG) generátory; každá rodina má vlastní postupně přísnější třídy.

## DRG — Deterministic Random Generators

::: svg "AIS-31 třídy DRG: DRG.1 forward secrecy, DRG.2 + backward secrecy, DRG.3 enhanced backward, DRG.4 enhanced forward (hybridní)."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20"  y="40" width="115" height="110" rx="6"/>
    <rect x="150" y="40" width="115" height="110" rx="6"/>
    <rect x="280" y="40" width="115" height="110" rx="6"/>
    <rect x="410" y="40" width="115" height="110" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="77.5" y="62" font-size="13">DRG.1</text>
    <text x="207.5" y="62" font-size="13">DRG.2</text>
    <text x="337.5" y="62" font-size="13">DRG.3</text>
    <text x="467.5" y="62" font-size="13">DRG.4</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="77.5" y="86">forward</text>
    <text x="77.5" y="100">secrecy</text>
    <text x="207.5" y="86">+ backward</text>
    <text x="207.5" y="100">secrecy</text>
    <text x="337.5" y="86">+ enhanced</text>
    <text x="337.5" y="100">backward</text>
    <text x="467.5" y="86">+ enhanced</text>
    <text x="467.5" y="100">forward</text>
    <text x="467.5" y="114">(hybridní)</text>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-size="9.5">
    <text x="77.5" y="140">prev → next ?</text>
    <text x="207.5" y="140">stav → prev ?</text>
    <text x="337.5" y="140">+ best effort</text>
    <text x="467.5" y="140">reseed z PTRNG</text>
  </g>
</svg>
:::

* **DRG.1** — *DRNG with forward secrecy podle ISO 18031.* Znalost minulých výstupů nedovolí spočítat budoucí. Nejlevnější třída — splňuje jakýkoli "rozumný" AES-CTR/HMAC DRBG.
* **DRG.2** — DRG.1 + **backward secrecy**. Znalost *(pozdějších) výstupů* nedovolí spočítat dřívější výstupy. Vyžaduje *one-way* funkci na update (např. iterace hashe na stavu).
* **DRG.3** — DRG.2 + **enhanced backward secrecy**. Po každém volání se stav modifikuje tak, že případná kompromitace pozdějšího stavu *nedovolí* rekonstruovat minulé výstupy *ani* za pomoci znalosti vnitřních konstant.
* **DRG.4** — DRG.3 + **enhanced forward secrecy** (*hybrid DRNG*). Pravidelně se přiseedovává z fyzikálního zdroje (PTRNG nebo NPTRNG), takže kompromitace stavu se v omezené době "zahojí". Toto je třída, kterou aspiruje *většina* moderních kryptografických modulů.

## PTG — Physical True RNG

::: svg "AIS-31 třídy PTG: PTG.1 self-tests, PTG.2 + stochastic model, PTG.3 + krypto post-processing (hybridní)."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="40"  y="40" width="140" height="110" rx="6"/>
    <rect x="200" y="40" width="140" height="110" rx="6"/>
    <rect x="360" y="40" width="140" height="110" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="110" y="64" font-size="13">PTG.1</text>
    <text x="270" y="64" font-size="13">PTG.2</text>
    <text x="430" y="64" font-size="13">PTG.3</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="110" y="90">self-tests pro</text>
    <text x="110" y="104">total failure +</text>
    <text x="110" y="118">stat. vady</text>
    <text x="270" y="90">+ stochastický</text>
    <text x="270" y="104">model + raw</text>
    <text x="270" y="118">data testy</text>
    <text x="430" y="90">+ krypto</text>
    <text x="430" y="104">post-processing</text>
    <text x="430" y="118">(hybrid PTRNG)</text>
  </g>
  <g fill="var(--accent)" text-anchor="middle" font-size="9.5">
    <text x="110" y="140">minimální</text>
    <text x="270" y="140">analyzovatelný zdroj</text>
    <text x="430" y="140">de facto standard</text>
  </g>
</svg>
:::

* **PTG.1** — RNG s vnitřními testy, které detekují **totální selhání** zdroje entropie (např. zaseknutí ring oscilátoru) a **netolerovatelné statistické vady** vnitřních náhodných čísel. Minimální požadavek.
* **PTG.2** — PTG.1 + **stochastický model** zdroje entropie. Výrobce musí formálně popsat, *jak entropie vzniká* (např. termální šum diody, mean-time-between zero-crossings ring osc.), s odhadem entropie na bit. Statistické testy se provádějí nad **raw** daty (před post-processingem), aby se detekovala degradace.
* **PTG.3** — PTG.2 + **kryptografické post-processing** (*hybrid PTRNG*). Surové bity z fyzického zdroje jdou do hash funkce nebo extraktoru, který je *zkondenzuje* na výstupní bity s plnou entropií. Typický design: 1024 bitů raw → SHA-256 → 256 bitů výstupu. Toto je *minimální* třída pro EU eIDAS a EMV certifikace.

## NTG — Non-Physical True RNG

* **NTG.1** — *Non-physical true RNG with entropy estimation.* Sbírá entropii z *nedeterministických softwarových událostí* (přerušení, časování klávesnice, síťové timing) a provádí běhový odhad entropie. Příkladem je Linux NPTRNG ([[linux-rng]]). Vyžaduje, aby zdroje událostí byly výrobcem deklarovány a aby odhad entropie byl konzervativní.

## Vzájemné mapování AIS-31 ↔ NIST

| AIS-31 | NIST SP 800-90 |
| :--- | :--- |
| DRG.1 | DRBG (AES-CTR, HMAC, Hash) |
| DRG.2/3 | DRBG + state separation |
| DRG.4 | DRBG with prediction resistance |
| PTG.1 | non-IID entropy source with health tests |
| PTG.2 | IID/non-IID entropy source with stochastic model (SP 800-90B) |
| PTG.3 | Full entropy source + extraction (SP 800-90C) |
| NTG.1 | (žádný přímý ekvivalent — SP 800-90B platí pro fyzické i nefyzické) |

Klíčový rozdíl filozofie:

* **AIS-31** klade větší důraz na **modelování zdroje entropie** (PTG.2 vyžaduje stochastický model — formální popis fyzikálního procesu).
* **NIST SP 800-90** klade větší důraz na **statistické testy** (SP 800-90B definuje rozsáhlou test battery, ale nepožaduje stochastický model).

## Hodnocení v praxi

Certifikační laboratoř při hodnocení RNG kontroluje:

1. **Specifikaci RNG** — schéma zapojení, popis fyzikálního zdroje, stochastický model.
2. **Stat. testy raw dat** — empirické míry odchylky od uniform distribution (frequency, runs, autocorrelation).
3. **Online health testy** — během provozu zařízení provádí *průběžné* testy a při selhání blokuje výstup.
4. **Startup tests** — při zapnutí se ověří, že zdroj funguje a entropie je dostatečná před prvním použitím.
5. **Kryptografické post-processing** — schopnost extrakce plné entropie (Markovský proces, von Neumann extractor, hashovací funkce).
6. **Resistance vůči vnějším atakům** — tepelný, EM, napěťový — vliv na výstup.

Smartkartové certifikace (BSI-PP-0084, Common Criteria EAL5+) **vyžadují** alespoň PTG.2, pro CA-grade tokeny PTG.3.

## Příklad — komerční implementace {tier=example}

**Infineon SLE 78** (smartcard chip, dnes základ pro mnoho eID karet) má:

* PTG.3 fyzikální RNG na bázi *2 šumových diod* + Schmittův trigger + post-processing přes SHA-1.
* DRG.4 deterministický RNG (AES-CTR DRBG, AIS-31 DRG.4) seedovaný z fyzikálního RNG.
* Online health testy (Markovův proces 0-1 přechodů, run length test).

**Intel SGX/RDRAND** používá Bull Mountain ([Intel DRNG specification](https://www.intel.com/content/dam/www/public/us/en/documents/white-papers/digital-random-number-generator-dasher-whitepaper.pdf)):

* PTRNG na bázi paired inverters (metastable circuit) — produkuje ~3 Gbps raw bits.
* AES-CBC-MAC conditioning → 256-bit entropy.
* AES-CTR DRBG seedovaný každých 1.000.000 výstupů z PTRNG.

Obě implementace efektivně realizují *hybrid DRBG* — kombinaci PTRNG/DRBG, která je dnes standardem.

---

*Zdroj: BZA přednášky 2025/26, BZA 02 — Generátory náhodných čísel. Externí reference: Killmann, W., Schindler, W.: *A Proposal for: Functionality Classes for Random Number Generators*, BSI AIS-31 v2.0 (2011) — [PDF](https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/Zertifizierung/Interpretationen/AIS_31_Functionality_classes_for_random_number_generators_e.pdf); NIST SP 800-90A Rev. 1, SP 800-90B (2018), SP 800-90C (2023 draft); Intel: *Digital Random Number Generator (DRNG) Software Implementation Guide* (2018).*
