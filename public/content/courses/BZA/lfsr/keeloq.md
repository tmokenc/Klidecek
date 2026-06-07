---
title: KeeLoq — autoklíče a rolling code
---

# KeeLoq — autoklíče a rolling code

**KeeLoq** je bloková šifra s 32-bit blokem a 64-bit klíčem od firmy Microchip (původně Nanoteq, JIH 1985). Dlouhá léta byla utajovaná a používá se v *miliardách* zařízení — *rolling-code* dálkové ovládače pro auta (Chrysler, Daewoo, Fiat, GM, Honda, Toyota, Volkswagen v letech ~1995–2010), garážová vrata, brány. Po úniku specifikace v r. 2006 a sérii útoků 2007–2008 je dnes **prolomena**.

## Princip rolling code

::: svg "Rolling code: ovládač má čítač + tajemství. S každým stiskem inkrementuje čítač a vysílá KeeLoq(counter || serial, key). Přijímač akceptuje hodnoty z okna budoucnosti."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aKL1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="40" width="170" height="140" rx="8"/>
    <rect x="350" y="40" width="170" height="140" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="105" y="62" font-size="12.5">Ovládač (transmitter)</text>
    <text x="435" y="62" font-size="12.5">Přijímač (receiver)</text>
    <text x="105" y="92" font-size="10.5" fill="var(--text-muted)">counter C (16b)</text>
    <text x="105" y="110" font-size="10.5" fill="var(--text-muted)">serial S (28b)</text>
    <text x="105" y="128" font-size="10.5" fill="var(--text-muted)">device key K (64b)</text>
    <text x="105" y="150" font-size="10.5" fill="var(--accent)">M = KeeLoq_K(C ∥ disc ∥ F)</text>
    <text x="105" y="165" font-size="10.5" fill="var(--accent)">S v plaintextu</text>
    <text x="435" y="92" font-size="10.5" fill="var(--text-muted)">manufacturer key</text>
    <text x="435" y="110" font-size="10.5" fill="var(--text-muted)">K = derive(MK, S)</text>
    <text x="435" y="128" font-size="10.5" fill="var(--text-muted)">last_C, window [C+1, C+w]</text>
    <text x="435" y="155" font-size="11" fill="var(--accent)">accept if C∈window</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aKL1)">
    <path d="M190,110 L350,110"/>
  </g>
  <text x="270" y="105" font-size="10.5" text-anchor="middle" fill="var(--text-muted)">RF 433 MHz</text>
</svg>
:::

Rolling code řeší klasický problém *replay attack* u dálkového ovládače:

1. **Ovládač** ukládá tajný **device key** $K$ (64 bitů, individuální), čítač $C$ (16 bitů), sériové číslo $S$ (28 bitů).
2. Při stisku tlačítka inkrementuje $C \leftarrow C + 1$ a vysílá 32-bit šifrovaný blok $M = \text{KeeLoq}_K(C \mathbin\Vert \text{disc} \mathbin\Vert F)$, kde $F$ jsou kontrolní bity (funkce tlačítka) a $\text{disc}$ diskriminační bity; sériové číslo $S$ se vysílá v *plaintextu* vedle $M$ (přijímač jej potřebuje k odvození $K$).
3. **Přijímač** zná **master key** $MK$ a *odvodí* device key $K = f_{MK}(S)$. Dešifruje $M$, ověří $S$, porovná $C$ s naposledy přijatým.
4. **Akceptační okno** — pokud $C$ je mezi `last_C + 1` a `last_C + 16` (krátké okno) nebo `last_C + 1` a `last_C + 32 768` (široké okno, pro případ ztracených stisknutí mimo dosah), přijímač akceptuje, aktualizuje `last_C ← C`.

**Bezpečnostní vlastnost:** každý vyslaný kód je *jiný*. Odposlech kódu nepomůže, protože další stisk vyžaduje *vyšší* čítač.

::: viz keeloq-window "Stiskni tlacitko, zachyt paket, zkus replay. Vyzkousej obe varianty okna (short vs. wide) a co se stane pri stisku mimo dosah."
:::

## Šifra KeeLoq — struktura

KeeLoq je 64bitová bloková šifra (block cipher) postavená na nelineárním posuvném registru se zpětnou vazbou (nonlinear feedback shift register, NLFSR):

* **Stav:** 32 bitů.
* **Klíč:** 64 bitů.
* **Počet kol:** 528 (!).
* **Booleova funkce (Boolean function)** $f$ z 5 bitů — daná tabulkou (specifická konstanta).

Každé kolo:

1. Nový bit stavu: $f(y_{31}, y_{26}, y_{20}, y_{9}, y_{1}) \oplus y_{16} \oplus y_0 \oplus k_i$
2. Stav se posune o 1 bit; nový bit jde na MSB.
3. Klíč $k_i$ je $i$-tý bit klíče modulo 64 (klíč je *cyklicky používán*).

Po 528 kolech je výstupní 32-bit šifrový text aktuální stav. Plaintext byl 32-bit (jen `counter || function_bits`, padding sériovým číslem).

Veřejně byla specifikace KeeLoq utajována; Microchip prodával licence výrobcům auta. V r. 2006 byla extrahována z reverzní analýzy mikrokontrolérů a publikována.

## Útoky

### Slide attack (Bogdanov 2007)

[A. Bogdanov, *Attacks on the KeeLoq Block Cipher*](https://eprint.iacr.org/2007/055.pdf):

* **Slide attack** je technika pro šifry s *velmi malou* rozmanitostí rozvrhu klíče (key schedule). KeeLoq odvozuje kolové klíče pouhou cyklickou rotací klíče — to je extrémně slabé.
* Útok potřebuje **2³² známých dvojic otevřený/šifrový text** (cca 4 miliardy) — *teoreticky* je šifra prolomitelná, prakticky je ale nemožné získat takové množství dvojic od jediné jednotky.

### Eisenbarth-Kasper-Moradi-Paar-Sasdrich-Schimmler 2008

[*On the Power of Power Analysis in the Real World*](https://www.iacr.org/archive/crypto2008/51570203/51570203.pdf):

* **Diferenciální výkonová analýza (Differential Power Analysis)** ([[spa-dpa]]) zaměřená na výrobní klíč (manufacturer key).
* Útočník zachytí ~30 záznamů spotřeby (power traces) z přijímače během dešifrování — tím odhalí $MK$ za méně než hodinu.
* **Důsledek:** *jediná* kompromitace přijímače dovolí klonovat **všechny** ovládače *daného výrobce*. To je apokalyptický scénář — Microchip používal *jeden* $MK$ pro celou produkci výrobce (např. všechny Hondy 1995–2010 sdílely $MK$).

### Indirect-key attack (Indesteege-Keller-Dunkelman-Biham-Preneel 2008)

[*A Practical Attack on KeeLoq*](https://link.springer.com/chapter/10.1007/978-3-540-78967-3_1):

* **Slide-meet-in-the-middle attack** s $2^{16}$ známými otevřenými texty a $2^{44.5}$ šifrovacími operacemi.
* Získání device key trvá ~hodinu na běžném PC.
* **Navíc:** se znalostí výrobního klíče a po zachycení ~30 vyslaných paketů odvodíte celý device key $K$ daného ovládače → vznikne naklonovaný ovládač.

### Praktický útok 2008 — IDA Bochum/Leuven {tier=example}

[Tým z Bochum a Leuven](https://www.sciencedaily.com/releases/2008/04/080403132351.htm) demonstroval:

1. *Přiblížit se k autu*: ~50 m s dobrou anténou.
2. Zachytit ~2 kódové pakety z ovládače (uživatel stiskne 2× tlačítko).
3. Z paketů + známého $MK$ (extrahovaného z předchozí výrobní DPA) odvodit $K$ daného ovládače.
4. **Naklonovat ovládač** a později odemknout auto.

Útok byl prakticky úspěšný v laboratoři a způsobil *globální* změnu strategie:

* **Microchip vydal KeeLoq AES** (2008+) — nahrazení KeeLoq šifry algoritmem AES-128. Nové ovládače jsou bezpečné.
* **Hyundai/Kia, BMW** přešly na *rolling-code + challenge-response* protokoly (immobilizer + RKE).
* **Tesla, Volvo** používají ultra-wideband (UWB) ranging proti relay útokům.

## Relay útok — separátní vektor

Bez prolomení šifry KeeLoq lze útokem **relay** dosáhnout otevření auta:

* Auto s **Passive Keyless Entry** (PKE, *keyless go*) periodicky vysílá nízkofrekvenční (LF) puls (~125 kHz, dosah ~1 m).
* Pokud klíč je v dosahu, odpoví UHF kódem (~433/868 MHz, dosah ~30 m).
* **Útočník 1** stojí u auta, zachytí LF signál, zesílí jej a přes GSM přepošle útočníkovi 2.
* **Útočník 2** je u dveří domu, kde leží klíč; přehraje LF; klíč odpoví UHF.
* **Útočník 2** zaznamenává UHF, pošle zpět útočníkovi 1, který přehraje k autu.
* Auto si myslí, že klíč je blízko → odemkne.

Tento útok je *systemický* (nezávisí na šifře), je *aktivně využíván* v r. 2025 (zejména v Evropě — BMW, Mercedes, Audi, Toyota). Mitigace: **UWB ranging** (Tesla Model S Plaid+, BMW iX), *PIN to drive* (Tesla), zapnutí *motion-sensor sleep* v klíči po 30 s nehybnosti.

## Lekce {tier=extra}

KeeLoq ukázal:

1. **Master key v každé jednotce** je smrtelná chyba. Pokud útočník extrahuje $MK$ z jednoho přijímače, padá *celá rodina produktů*. Současné systémy mají *per-vehicle* keys s minimálním sdílením.
2. **DPA je v praxi proveditelná** ([[spa-dpa]]). I po formálně bezpečném algoritmu může implementace na nezabezpečeném mikrokontroléru ležet pod prahem útoku.
3. **Otevřená analýza je nezbytná.** KeeLoq byl utajován od roku 1985 do roku 2006. Když specifikace unikla, šifra padla během 2 let. Otevřená kryptografie (AES, ECC) tento osud nemá.
4. **Odolnost proti opakování ≠ autentizace (replay-resistance ≠ authentication).** Rolling code chrání proti opakování stejného kódu, ne proti aktivním útokům (relay, rušení + replay). Pro skutečnou autentizaci je třeba challenge-response s *čerstvým* nonce.

---

*Zdroj: BZA přednášky 2025/26, BZA 03 — LFSR. Externí reference: Eisenbarth, T. et al.: *On the Power of Power Analysis in the Real World: A Complete Break of the KeeLoq Code Hopping Scheme* (CRYPTO 2008) — [PDF](https://www.iacr.org/archive/crypto2008/51570203/51570203.pdf); Indesteege, S. et al.: *A Practical Attack on KeeLoq* (EUROCRYPT 2008) — [PDF](https://www.cosic.esat.kuleuven.be/publications/article-1124.pdf); Bogdanov, A.: *Attacks on the KeeLoq Block Cipher and Authentication Systems* (RFIDSec 2007) — [PDF](https://eprint.iacr.org/2007/055.pdf); KU Leuven COSIC, KeeLoq slides — [link](https://www.cosic.esat.kuleuven.be/keeloq/keeloq-slides.pdf).*
