---
title: LoRaWAN — architektura a zranitelnosti
---

# LoRaWAN — architektura a zranitelnosti

**LoRaWAN** (Long Range Wide Area Network) je nejpopulárnější LPWAN protokol pro IoT — telemetrie chytrých měst, smart agriculture, asset tracking, environmentální monitoring. Standardizovaný [LoRa Alliance](https://lora-alliance.org/) (~500 členů, ~150 zemí). Veřejně dostupná specifikace, **AES-128 end-to-end šifrování**. Při bližším pohledu má ale řadu konstrukčních rozhodnutí, která útoky usnadňují.

## Architektura

::: svg "LoRaWAN architektura: end-device → gateway (LoRa radio) → Network Server (IP) → Application Server. End-to-end AES od ED do AS."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aLW1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="50" width="90" height="50" rx="6"/>
    <rect x="160" y="50" width="90" height="50" rx="6"/>
    <rect x="300" y="50" width="90" height="50" rx="6"/>
    <rect x="430" y="50" width="90" height="50" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="65" y="75" font-size="11">End-Device</text>
    <text x="65" y="92" font-size="10" fill="var(--text-muted)">senzor</text>
    <text x="205" y="75" font-size="11">Gateway</text>
    <text x="205" y="92" font-size="10" fill="var(--text-muted)">RF→IP</text>
    <text x="345" y="75" font-size="11">Network Server</text>
    <text x="345" y="92" font-size="10" fill="var(--text-muted)">cloud / on-prem</text>
    <text x="475" y="75" font-size="11">App Server</text>
    <text x="475" y="92" font-size="10" fill="var(--text-muted)">app data</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aLW1)">
    <path d="M110,75 L158,75"/>
    <path d="M250,75 L298,75"/>
    <path d="M390,75 L428,75"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="135" y="120">LoRa (868/915 MHz)</text>
    <text x="275" y="120">UDP packet forwarder</text>
    <text x="410" y="120">HTTP / MQTT</text>
  </g>
  <g stroke="var(--danger, #d33)" stroke-width="1.5" stroke-dasharray="3 3" fill="none">
    <path d="M65,110 C200,160 350,160 475,110"/>
  </g>
  <text x="270" y="158" font-size="10.5" text-anchor="middle" fill="var(--danger, #d33)">AppSKey end-to-end (ED ↔ AS)</text>
</svg>
:::

* **End-Device (ED)** — IoT senzor / aktuátor. Battery powered, ultra-low duty cycle (% času ve sleep).
* **Gateway** — relé z LoRa fyzické vrstvy do IP. Nevidí obsah zpráv (jen forwardes encrypted payloads).
* **Network Server (NS)** — orchestruje síť, deduplikuje pakety od více gatewayů, autentizuje ED.
* **Application Server (AS)** — koncový příjemce dat. Často oddělený od NS.

Důležitá vlastnost: **gateway je untrusted** — vidí packets, ale ne plaintext. Reálné nasazení často zahrnuje *third-party gateway providers* (TTN — The Things Network) bez nutnosti vlastnit gateway.

## Modulace a fyzika

* **868 MHz** v EU, **915 MHz** v US, **923 MHz** v JP/AU.
* **Chirp Spread Spectrum (CSS)** — patentovaná modulace Semtech. Robustní vůči rušení, dlouhý dosah (~5–15 km venku).
* **Spreading Factor (SF)** 7–12 — vyšší SF = pomalejší (méně bps), ale dál.
* **Data rates:** 0,3 kb/s (SF12) – 50 kb/s (SF7).
* **Duty cycle** — EU regulace omezuje uplink ED na 1 % času (ETSI EN 300 220). Limit ~144 zpráv/den.

## Adresování a klíče

Každé zařízení má:

* **DevEUI** — IEEE EUI-64, globálně unikátní (jako MAC).
* **DevAddr** — 32-bit dynamic adresa pro packet routing.
* **AppEUI** / **JoinEUI** — identifikace aplikace.

Klíče:

* **NwkSKey** (Network Specific Key, 128-bit) — *integrita* síťových rámců, secure síťové příkazy. NS ho zná.
* **AppSKey** (Application Specific Key, 128-bit) — *end-to-end* šifrování aplikačních dat. AS ho zná, NS *nezná*.
* **AppKey** (root key, 128-bit) — používá se pro odvození session keys při OTAA. Ne přenáší po síti.

## Aktivace zařízení

### ABP — Activation By Personalization

* **DevAddr, NwkSKey, AppSKey** nahrány do ED během výroby — *statické*.
* Klíč nikdy nezmění.
* Uzamčené pro konkrétní síť.
* **Jednoduché**, ale **nebezpečné** (vyplývá z toho útoky níže).

### OTAA — Over-the-Air Activation

* **DevEUI, AppEUI, AppKey** nahrány během výroby.
* Při prvním připojení (`Join Request`) NS dynamicky vygeneruje:
  * **DevAddr** — nová pro session.
  * **NwkSKey** a **AppSKey** — derived z AppKey + nonces.
* Identifikátory se mohou *během života zařízení měnit* (re-join procedura).

OTAA je *preferred*; ABP je *legacy* a doporučeno se mu vyhnout.

## Šifrování

* **AES-128 v CTR módu** (counter-mode) — *streamová* šifra.
* **Counter** je odvozen z `(DevAddr, FCnt, Direction)`. Klíčové: počitadlo (`FCnt`) v každém packetu.
* Pro každý packet:
  * Encrypt payload pomocí AppSKey + CTR.
  * MIC (Message Integrity Code) přes celý packet pomocí NwkSKey (CMAC).

Nominálně **end-to-end** mezi ED a AS, *bezpečné* pokud klíče zůstanou tajné.

## Zranitelnosti

::: viz lorawan-counter "Posli uplinky, zachyt paket, replay. Vyzkousej ABP reset (vyjmout baterii) — ED zacne od 0 ale NS ma stary last_accepted → DoS nebo replay po rejoinu."
:::

### Útok na čítač

LoRaWAN používá **frame counter** (FCnt) pro deduplikaci a anti-replay:

* ED inkrementuje FCnt s každým packet.
* NS udržuje *last accepted* FCnt; nový packet musí mít vyšší FCnt než last.

**Útoky:**

#### 1. Reset počitadla (ABP-only)

* Při **resetu/vypnutí** ABP zařízení (např. vyjmutí baterie) **dojde k vynulování čítače**.
* NS *zahazuje* zprávy s nižším čítačem (anti-replay) → **DoS** (zařízení nemůže komunikovat).
* Alternativa: při *koordinovaném* resetu (i NS resetuje counter) dojde k *replay vulnerability* — útočník může zaznamenat staré packety a *přehrát* je s novým FCnt.

#### 2. Přetečení počitadla

* FCnt má dle specifikace **16 bitů** nebo **32 bitů** (volitelné, novější verze).
* Při přetečení 16-bit FCnt (po 65 536 packetech) začne od 0.
* **Replay** zachycených zpráv s vysokým FCnt obejde anti-replay check.
* U OTAA: jako obrana **rejoin procedure** aktualizuje klíče po přetečení.

#### 3. Reuse keystream

* AES-CTR generuje keystream z `(key, counter)`. Pokud se counter opakuje, dojde k **reuse keystream** → XOR dvou ciphertexts dá XOR plaintextů.
* Při restart ABP s reset countru → reuse → dešifrování všech replayed messages.

### Útok č. 2 — Silent DoS (ACK replay)

* ACK zprávy potvrzují přijetí poslední zprávy serverem.
* **ACK zprávy neobsahují `id` potvrzované zprávy** — jenom příznak "ACK".
* Útok:
  1. Rušení odchozích zpráv zařízení (jamming jejich uplink).
  2. *Replay* ACK zpráv ze serveru (zachycené z dřívějška).
* Zařízení dostane ACK → *myslí*, že zpráva byla doručena, *ale ve skutečnosti ne*.
* **Tichý DoS** — uživatel a NS nemůže detekovat problém. ED ztrácí všechny zprávy, ale myslí si, že je vše OK.

Mitigace: v LoRaWAN 1.1+ ACK obsahuje *MIC* nad konkrétním reference packet — replay nemožný.

### Útok č. 3 — Join Procedure útok (OTAA)

* Join Request obsahuje **DevNonce** (random 16-bit nebo monotonic counter v 1.1).
* NS dle specifikace **zamítá určitý počet naposledy použitých DevNonce** (anti-replay).

**Útok:**

1. Útočník zachytí Join Request z legitimního ED.
2. **Replay** Join Request — NS *zamítne* (DevNonce už použit).
3. NS *přidá* zařízení na **blacklist** (po určitém počtu zamítnutí).
4. Legitimní zařízení *nemůže* re-joinovat → permanentní DoS.

Alternativně: **self-DoS** — pokud ED generuje DevNonces *randomly*, kolize s předchozí hodnotou → join failuje.

Mitigace v 1.1: monotonic DevNonce + JoinNonce; revoke procedura.

### Útok č. 4 — Třetí strana = network operator

V *veřejných* LoRaWAN sítích (TTN, Helium, KPN, Orange) **NS je třetí strana**:

* NS vidí všechny pakety, *zná NwkSKey* — může číst metadata, MAC commands, network statistics.
* NS *nezná* AppSKey — application payload je end-to-end šifrovaný.
* **Privacy concern:** NS vidí kdy a kolik dat zařízení vysílá, z které lokace (gateway IDs).
* **Trust issue:** kompromitace NS nedovolí dešifrovat plaintext, ale dovolí *DoS* (NS zahazuje packety) nebo *MITM* (NS inject packety s podpisem NwkSKey).

V *privátní* nasazení (vlastní NS + AS) tento problém odpadá.

### Útok č. 5 — Bit Flipping na malformed packets

* MIC chrání integrity, ale neuvádí *autentičnost source* (kdokoli s NwkSKey může vyrobit packet).
* Pokud útočník zná NwkSKey (např. od ABP zařízení získané fyzicky), může injektovat *libovolné* packety jeho jménem.

Mitigace: per-device unique keys, OTAA, fyzická ochrana ED.

### Útok č. 6 — Channel selection (cherry-pick channel attack)

* LoRaWAN má 16 channels v EU.
* Útočník vysílá jamming pulse jen na **specifický channel**, kdy je legitimní packet očekáván.
* ED a NS vidí *frame errors*, ale neumí rozlišit jamming od přirozeného rušení.

Mitigace: frequency hopping, retransmission.

## Praktické pen-testing nástroje {tier=practice}

* **LoRaWanAuditor** — open source pen-test framework pro LoRaWAN.
* **ChirpStack** — open source NS pro test sítě.
* **OpenLoRaSDK** — pro implementaci custom ED.
* **HackRF + GR-LoRa** — software-defined LoRa.

## Doporučení

* **OTAA, nikdy ne ABP** v produkci.
* **LoRaWAN 1.1+** (poslední verze) — opravy útoků z 1.0.x.
* **Per-device unique keys** — *žádné* sdílené klíče mezi zařízeními.
* **Pravidelná rotace AppKey** — re-personalize zařízení.
* **Custom App-layer enkrypce** — pokud aplikace má vysoké požadavky, doplnit *vlastní* TLS-like vrstvu nad LoRaWAN payload.
* **Privátní NS** pro citlivá data.

---

*Zdroj: BZA přednášky 2025/26, BZA 08 — Bezpečnost IoT (Hujňák). Externí reference: LoRa Alliance: *LoRaWAN 1.0.3 Specification* (2018), *LoRaWAN 1.1 Specification* (2017) — [lora-alliance.org](https://lora-alliance.org/resource_hub/lorawan-specification-v1-1/); Yang, X. et al.: *Security Vulnerabilities in LoRaWAN* (IoTDI 2018) — [PDF](https://ieeexplore.ieee.org/document/8366983); van Es, E., Vranken, H., Hommersom, A.: *Denial-of-Service Attacks on LoRaWAN* (ARES 2018) — [PDF](https://dl.acm.org/doi/10.1145/3230833.3232795); ETSI EN 300 220-2 *Short Range Devices* (operational regulations).*
