---
title: Glitch útoky — fault injection
---

# Glitch útoky — fault injection

**Glitch** (zákmit, fault injection) je aktivní side-channel útok — útočník *záměrně* indukuje krátkou poruchu fyzikálních parametrů zařízení s cílem způsobit chybnou operaci. Na rozdíl od *měření* (DPA, TA), glitch útok *zasahuje* do běhu — vynechá instrukci, převrátí bit, přerušuje výpočet. Vyvolaná chyba pak nese informaci o klíči ([[dfa-princip|DFA]]) nebo umožní bypass kontroly (PIN, autentizace).

## Princip

CMOS obvody mají rezervu — nominální napájení 3 V, nominální clock 5 MHz. Mimo specifikovaný rozsah obvody pracují *nedeterministicky*. Glitch:

* Krátké odchylky CLK (zrychlení, zpomalení, vynechání).
* Krátký pokles Vcc.
* Krátký impuls na Vpp.
* Laser focus na specifický gate.
* EM pulse z cívky.

Cílem je *jediná* chybná instrukce — typicky **vynechání** instrukce (`nop` místo `branch`), nebo **chybný výsledek** aritmetické operace.

## Vpp útok

Starší smart cards měly Vpp kontakt (~21 V) pro programování EEPROM:

* **Aktivní útok** — odstranění Vpp během zápisu zabrání zápisu. Útočník zachovává Vpp nízké (3 V), instrukce *write* selže, čítač nesníží.
* **Pasivní útok** — monitorování Vpp prozradí, kdy karta zapisuje a kolik dat.

Cíle:

* **Nezapsání čítače chybných pokusů PIN** — útočník zkouší PINy do nekonečna.
* **Neodečtení impulsu** z telefonní karty — předplatné nesnížuje.
* **Zabránění zablokování karty** ("Infinite Lives Hack") — karta označená OTA jako kompromitovaná se nezablokuje.

**Obrana:** novější karty Vpp *vůbec nepoužívají* — interní charge pump generuje 21 V z 3 V Vcc. Tím se útok z venku eliminuje.

## CLK glitch

::: svg "CLK glitch: krátké zrychlení/zpomalení hodin způsobí, že instrukce nedoběhne v jednom cyklu — výsledek je 'nop' nebo nedefinovaný."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="none" stroke="var(--accent)" stroke-width="1.5">
    <path d="M20,100 L60,100 L60,60 L80,60 L80,100 L120,100 L120,60 L140,60 L140,100 L180,100 L180,60 L200,60 L200,100 L220,100 L220,60 L230,60 L230,100 L240,100 L240,60 L260,60 L260,100 L300,100 L300,60 L320,60 L320,100 L360,100 L360,60 L380,60 L380,100 L420,100 L420,60 L440,60 L440,100"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="100" y="135" font-size="11" fill="var(--text-muted)">CLK nominální 5 MHz</text>
    <text x="240" y="135" font-size="11" fill="var(--danger, #d33)">glitch (50 MHz)</text>
    <text x="380" y="135" font-size="11" fill="var(--text-muted)">zpět nominální</text>
  </g>
  <g stroke="var(--danger, #d33)" stroke-width="1" stroke-dasharray="3 3" fill="none">
    <path d="M222,50 L222,160"/>
    <path d="M260,50 L260,160"/>
  </g>
</svg>
:::

* **Princip:** krátká odchylka frekvence hodin (typicky 1–10 cyklů přidaných v jediné mikrosekundě) způsobí, že některé propagation delays nestihne dorazit do *flip-flopů*.
* **Hardware:** programovatelný FPGA generuje upravený CLK signál, vstup do CLK pinu karty místo nominálního.
* **Efekty:**
  * **Vynechaná instrukce** — fetch unit *neuvolnil* nové opcode včas; CPU vykoná `nop` nebo opakuje předchozí instrukci.
  * **Chybný register** — write-back nedoběhne, register má staré data.
  * **Branch error** — branch instruction se vyhodnotí chybně.

## VCC glitch

* **Princip:** krátký pokles napájení (např. z 3.0 V na 1.5 V po dobu 100 ns) způsobí, že CMOS gates pracují nedeterministicky.
* **Hardware:** rychlý MOSFET v sérii s Vcc, řízený signal generator.
* **Efekty:** podobné CLK glitch, ale méně specifické (postiženy *všechny* gates v daný okamžik).

Vcc + CLK kombinované glitche jsou v praxi nejčastější — flexibility umožní cílit chyby do specifické *fáze* CPU.

## Praktický příklad — výstupní cyklus {tier=example}

Klasický program pro výstup dat z karty:

```asm
b = answer_address
a = answer_length
loop:
    if (a == 0) goto end       ; (1) podmíněný skok
    transmit(*b)               ; (2) odešli byte
    b = b + 1                  ; (3)
    a = a - 1                  ; (4) decrement counter
    goto loop                  ; (5)
end:
    ...
```

**Útok:** glitch na instrukci (1) — `if (a==0)` — způsobí, že program *pokračuje* místo skoku na `end`. Smyčka pokračuje za hranicí `answer_length`, čte další paměť, posílá ji na výstup.

**Důsledek:** útočník dostane **plný dump** memory za hranicí cílového bufferu — typicky kompletní RAM, EEPROM, klíče.

Alternativně: glitch na instrukci (4) — `a = a - 1` přeskočena. Smyčka *nekonečná*, vysílá data z paměti dokud něco nezpůsobí externí přerušení.

::: viz glitch-pin "Vyber scenar (vystupni cyklus / PIN check), klikni na instrukci, kterou glitchnes. Sleduj, jak se zmeni vystup — od dumpu pameti az po PIN bypass."
:::

## Cíle glitch útoku

1. **Výstupní cyklus** — viz výše, dump paměti.
2. **Kontrola PIN** — vynechání `if (entered != stored) return WRONG` → akceptace libovolného PINu.
3. **Kontrola přístupových práv** — change result of access check.
4. **Změna kladné odpovědi na zápornou a naopak** — útočník ovlivní *poslední* mov instrukci, která určuje SW1/SW2.
5. **Kryptografický algoritmus** — chybný výsledek RSA / AES vede k DFA, viz [[dfa-princip]] a [[bellcore-rsa]].
6. **Bypass authentication v EMV** — místo `90 00` po VERIFY PIN se vrátí `90 00` i pro špatný PIN.

## Obrana proti glitch útokům

### Sensors

* **Frequency sensor** — monitor CLK frekvence; při překročení mimo dovolené rozmezí (typicky ±10 %) reset karty.
* **Voltage sensor** — monitor Vcc; při poklesu pod práh reset.
* **Light sensor** (back-side photo detector) — detekce decap.

Praktický stav (2025):

* **RST glitch** — *většina* karet má klopný obvod RST → nelze obejít externím signálem. Dobrá ochrana.
* **VCC glitch** — *kontrola tolerance* napájecího napětí; ale použití závisí na programátorovi. *V mnoha aplikacích* (možnost kolísání napájení) *se nepoužívá*. Nedostatečná ochrana u low-cost.
* **CLK glitch — low freq** (single-stepping) — *většina* karet má ochranu (refuse to operate below 1 MHz). Dobrá.
* **CLK glitch — high freq** (skip instruction) — *má poměrně málo karet*. Slabá ochrana, hlavní vektor útoku.

### Software / firmware obrany

* **Redundant computation** — kritické instrukce provést **2× nebo 3×** a porovnat výsledek. Pokud se liší → glitch detected.
* **Double-check pattern** — výsledek `auth_ok = (entered == stored)`; followup `if (entered == stored && auth_ok)` ověří v jiném cyklu.
* **Constant-time conditional branches** — místo `if-else` použít aritmetické operace, které se vždy vykonají.
* **Spread sensitive operations in time** — nedovolit cluster v jednom místě paměti / času. Útočník nemůže přesně cílit glitch.
* **Cryptographic verification of output** — výstup obsahuje MAC; pokud glitch změnil data, MAC failuje a host detekuje.

### Programátorský pohled

Pravidlo: *vyhýbat se algoritmům, jejichž výsledek závisí na jedné instrukci.*

Špatně:

```c
if (verify_pin()) {
    auth_ok = 1;     // glitch zde -> bypass auth
}
```

Lépe:

```c
auth_ok = verify_pin();
if (!auth_ok) return ERROR;
// second check before sensitive operation
if (auth_ok != 1) return ERROR;  // also tests for 0xFF, 0x42 etc.
```

Pravidlo: pro **acceptance** vyžadovat **silnější** podmínku (např. konkrétní hodnota `0x5A`), nikoli *cokoli kromě 0*.

### Lasers a EM fault injection

**Laser fault injection (LFI)**:

* Decap čip (semi-invasive).
* Fokusovaný laser (532 nm zelený nebo 1064 nm IR) na specifický gate způsobí single-event-upset (SEU) — flip bitu.
* Použití: precision faults, např. cílový S-box AES round.
* Vybavení: laser station (~$50 000 – $200 000), 3-axis pozicovací stůl.

**EM fault injection**:

* Cívka 1 mm nad čipem, krátký pulsní proud.
* Indukuje SEU bez fyzického kontaktu (non-invasive).
* Vybavení: ChipShouter ($3 500), Riscure EM-FI Transient Probe.
* Demonstrovaný útok: [Ordas et al. 2014](https://eprint.iacr.org/2014/123.pdf) — EM-FI na DPA-protected smart card.

## Real-world útoky

* **Hitachi H8/3101 (Mondex, 1996)** — glitch + microprobing kombinace; viz [[logicke-utoky]].
* **PIC 16C84** (~1996) — over-voltage útok (Vcc zvednuto k Vpp) → smazání "lock bitu" bez smazání programu → dump firmware; viz [[environmentalni]].
* **STM32 Trusted Execution Environment** ([Goodspeed 2018](https://www.youtube.com/watch?v=UMr-iSRJBfg)) — voltage glitch obchází RDP (Readout Protection).
* **NXP MIFARE DESFire EV1** (~2010) — fault inj. v AES key loading → recovery klíče.

## ChipWhisperer demo {tier=practice}

[ChipWhisperer](https://chipwhisperer.io/) má vestavěné fault injection tutorials:

* **Tutorial B5** — voltage glitch attack na AES password check. ~10 minut na 16-byte password.
* **Tutorial B6** — CLK glitch attack. Skip jediné instrukce po 100 attempts.

Open-source vybavení (CW-Lite $250) umožňuje plnohodnotnou laboratoř za $1000.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=6Pf3pY3GxBM" "Hardware Power Glitch Attack (Fault Injection) - rhme2 Fiesta (FI 100)" "LiveOverflow"
:::

*Zdroj: BZA přednášky 2025/26, BZA 06 — Chybová analýza. Externí reference: Anderson, R. J., Kuhn, M.: *Tamper Resistance — a Cautionary Note* (USENIX 1996) — [PDF](https://www.cl.cam.ac.uk/~mgk25/tamper.pdf); Bar-El, H., Choukri, H., Naccache, D., Tunstall, M., Whelan, C.: *The Sorcerer's Apprentice Guide to Fault Attacks* (Proc. IEEE 2006) — [PDF](https://eprint.iacr.org/2004/100.pdf); Joye, M., Tunstall, M. (eds.): *Fault Analysis in Cryptography* (Springer 2012); Skorobogatov, S.: *Optical Fault Induction Attacks* (CHES 2002).*
