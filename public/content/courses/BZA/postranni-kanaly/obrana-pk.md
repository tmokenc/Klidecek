---
title: Obrana proti side-channel útokům
---

# Obrana proti side-channel útokům

Obrana proti SCA je *technicky náročnější* než samotný útok. Útok stačí *jednou* uspěch; obrana musí *vždy* držet. V praxi se dělí na **dva základní přístupy**: *skrývání* (hiding) a *maskování* (masking). Reálné implementace kombinují obě.

## Princip obran

Side-channel signál je funkce *zpracovávaných tajemství* a *fyzikální implementace*:

::: math
\text{signal} = f(\text{secret}, \text{implementation}) + \text{noise}
:::

Útočník extrahuje `secret` přes statistickou analýzu mnoha měření. Obrany útočí na *jeden z tří* faktorů:

1. **Zvýšit šum (hiding)** — sníží signal-to-noise ratio, útočník potřebuje víc traces.
2. **Rozdělit secret (masking)** — měření *jednoho* secret share neodhalí celé tajemství; útočník potřebuje současně měřit *všechny* shares.
3. **Zachovat algoritmus, ale operovat bez data-dependent behavior (constant-time)** — eliminuje leak na úrovni instructions.

## Hiding — skrývání

::: svg "Hiding strategies: random delays, dummy operations, balanced logic, frequency jitter. Cíl: rozbít synchronizaci útočníka."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="40" width="240" height="140" rx="8"/>
    <rect x="280" y="40" width="240" height="140" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="140" y="62" font-size="12">Time hiding</text>
    <text x="400" y="62" font-size="12">Amplitude hiding</text>
  </g>
  <g fill="var(--text)" text-anchor="start" font-size="10.5">
    <text x="32" y="90">• random delays (NOP)</text>
    <text x="32" y="108">• dummy operations</text>
    <text x="32" y="126">• shuffled S-boxes</text>
    <text x="32" y="144">• clock jitter</text>
    <text x="32" y="162">• random clock dividers</text>
    <text x="292" y="90">• balanced (dual-rail) logic</text>
    <text x="292" y="108">• SABL, WDDL</text>
    <text x="292" y="126">• noise generators</text>
    <text x="292" y="144">• voltage regulators</text>
    <text x="292" y="162">• EM shielding</text>
  </g>
</svg>
:::

### Time hiding — náhodné delays a dummy operations

* **Random NOPs** — vsunout 0–N náhodných NOP instrukcí před, mezi i za kritickou operaci. Útočník nemůže synchronizovat traces, průměrování ztrácí signál.
* **Shuffled S-box order** — místo zpracovat S-boxy v pořadí 0..15, zpracovat v náhodné permutaci. Útok DPA na specifický byte musí prohledat 16× větší prostor.
* **Dummy operations** — vsunutí *celých* operací (random AES rounds, fake mul/sq operace) v náhodných pozicích. Útočník neví, která trace odpovídá které operaci.

**Slabina:** sofistikovaný útočník použije *trace alignment* algoritmy (DTW — Dynamic Time Warping, [Mangard et al. 2007](https://www.dpabook.org/)) k překonání hiding. Random delays zvyšují počet traces o faktor $N$, ne lineárně se mění bezpečnost.

### Amplitude hiding — balanced logic

* **Dual-rail logic** — každý logický bit reprezentován jako pár signálů `(a, ¬a)`. Při switch `0→1` se *jedna* linka aktivuje, *druhá* deaktivuje — celkový proud konstantní.
* **SABL** (Sense-Amplifier Based Logic), **WDDL** (Wave Dynamic Differential Logic) — komerční implementace dual-rail s ~3× větší plochou čipu, ale dramaticky lepší DPA resistance.
* **Random masking on bus** — data na sběrnici jsou XOR s pseudo-random mask. Útočník bez mask vidí *náhodné* hodnoty.

### Clock-rate jitter

* **Random clock dividers** — frekvence se mění mezi 80–120 % nominální. Pre-Cortex smart cards používaly *vlastní* RC oscilátor s nestabilitou.
* Útočník nemůže provést deterministické sampling; signal smear přes mnoho samples.

### Voltage regulators a noise generators

* **On-die voltage regulators** — integrované LDO regulátory dodávají *konstantní* napětí jádru čipu bez ohledu na externí Vcc. Signál na externí napájecí lince je *odpojen* od skutečného switch activity.
* **Active noise generators** — paralelně běžící obvody s *náhodnou* aktivitou přidávají do power signálu šum. SNR snížený o 20–40 dB.

## Masking — maskování

### Boolean masking

Každý bit secret-data $s$ se rozdělí na $d+1$ **shares**:

::: math
s = s_0 \oplus s_1 \oplus \cdots \oplus s_d
:::

kde $s_1, \ldots, s_d$ jsou *čerstvé* random shares, $s_0 = s \oplus s_1 \oplus \cdots \oplus s_d$.

* Operace nad $s$ se realizují *odděleně nad každým share*.
* **Lineární operace** (XOR, AddRoundKey v AES) jsou triviální: $s \oplus k = (s_0 \oplus k_0) \oplus (s_1 \oplus k_1) \oplus \cdots$ — XOR shares po dvou.
* **Nelineární operace** (S-box) jsou *obtížné*: $S(s)$ nelze rozdělit triviálně. Vyžaduje **masked S-box** — předpočítané tabulky nebo bitsliced implementace.

::: viz boolean-masking "Tajny byte rozdeleny na d+1 sdilenych shares. Sleduj, ze kazdy share alone je uniform (utocnik s 1 probe nic neziska); rekonstrukce vyzaduje vsechny shares."
:::

### d-th order security

* **First-order masking** ($d=1$) — chrání proti *first-order* DPA, kde útočník měří *jedno* statistické moment (mean correlation).
* **Higher-order masking** ($d=2,3,\ldots$) — chrání proti $d$-th order DPA, kde útočník měří $d$ moments současně (variance, skewness, atd.).

Higher-order DPA je *exponenciálně dražší* — pro $d=2$ potřebuje $O(N^2)$ traces místo $O(N)$. Pro $d=3$ kvadraticky více. Provably secure proti omezenému počtu měření.

### Praktický cost

* **AES-128 first-order masked** v software: ~5× pomalejší než nemaskovaný AES.
* **Higher-order AES** (d=2): ~25× pomalejší.
* **Hardware AES S-box** masked: ~30 % větší area než unmasked.

To je důvod, proč masking se nasazuje *jen pro citlivé* operace (kryptografie); ne pro běžné processing.

## Constant-time programming

Pro **software** kryptografie je *constant-time code* nejdůležitější obrana proti TA ([[casova-analyza]]) a cache-timing.

Pravidla:

1. **Žádné branches na tajná data:**

```c
// NE
if (key[i] == 0) result = a;
else result = b;

// ANO
mask = -(key[i] == 0);  // 0xFF...FF or 0
result = (mask & a) | (~mask & b);
```

2. **Žádné indexy do polí závisející na tajemstvích:**

```c
// NE — cache timing leak
result = sbox[key[i]];

// ANO — bitsliced AES, nebo všechny entries načteny
for (j = 0; j < 256; j++) {
    mask = -(j == key[i]);
    result |= mask & sbox[j];
}
```

3. **Žádné `memcmp` na tajemstvích:**

```c
// NE
if (memcmp(received_mac, expected_mac, 16) == 0) ...

// ANO
diff = 0;
for (i = 0; i < 16; i++) diff |= received_mac[i] ^ expected_mac[i];
if (diff == 0) ...
```

4. **Žádné divisions** na tajemstvích — divize obecně není constant-time na ARM, x86.

5. **Použij existující constant-time knihovny:**
   * **libsodium** — všechny operace const-time.
   * **BoringSSL** — Google fork OpenSSL s důrazem na const-time.
   * **fiat-crypto** — formally verified const-time bignum implementace.
   * **HACL\*** — F\*-verified, používáno v Mozilla NSS.

## Compile-time / hardware features

* **AES-NI** (Intel) a **ARMv8 Crypto Extensions** — HW AES instructions; nejen rychlejší, ale i *constant-time* a *DPA-resistant* (na úrovni cache-timing).
* **Intel CET** (Control-flow Enforcement Technology) — chrání proti ROP/JOP útokům.
* **ARM PAC** (Pointer Authentication) — bonus pro memory safety.
* **Spectre mitigations** — `lfence`, `mfence` v compileru, *retpoline*, microcode updates.

## Kompozice obran

V praxi se obrany kombinují:

::: svg "Stack obran: constant-time kód → masking → hiding → physical protection. Každá vrstva komplikuje útok exponenciálně."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="50" y="30" width="440" height="30" rx="4"/>
    <rect x="50" y="70" width="440" height="30" rx="4"/>
    <rect x="50" y="110" width="440" height="30" rx="4"/>
    <rect x="50" y="150" width="440" height="30" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="50" font-size="11">1. Constant-time code (algoritmická úroveň)</text>
    <text x="270" y="90" font-size="11">2. Masking (kryptografická úroveň)</text>
    <text x="270" y="130" font-size="11">3. Hiding — random delays, dual-rail (implementační úroveň)</text>
    <text x="270" y="170" font-size="11">4. Physical protection — shielding, sensors (HW úroveň)</text>
  </g>
</svg>
:::

* **Vrstva 1 — Constant-time** — povinné pro *jakoukoli* implementaci s tajemstvím v softwaru. Free (jen design effort).
* **Vrstva 2 — Masking** — pro implementace, které musí běžet na *nezabezpečeném* HW. 5–25× cost.
* **Vrstva 3 — Hiding** — pro zařízení s vlastní HW (smart cards, HSM). Designové rozhodnutí.
* **Vrstva 4 — Physical protection** — pro zařízení v rukou útočníka. Klasický tamper-resistant HW ([[realizace-bh]]).

Pro **CC EAL5+** smart card se nasadí *všechny čtyři vrstvy*. Pro běžný IoT senzor často *jen vrstva 1* (constant-time, někdy ani to ne).

## Testování obran

* **Test Vector Leakage Assessment (TVLA)** — standard NIST/CRI, statistický test, zda implementace leakuje. Použití: Welch's t-test mezi dvěma populacemi traces (fixní vs. random data). |t| < 4.5 → no leak detected.
* **Profiled DPA** — útok se *známým klíčem*, simulace worst-case. Porovnání úspěšnosti s/bez obran.
* **ChipWhisperer benchmark suites** — open source testbench.
* **Formální verifikace** — *masked* implementations lze formálně dokázat $d$-th order secure (např. [tightPROVE](https://eprint.iacr.org/2018/375), [maskComp](https://eprint.iacr.org/2017/719)).

## Klíčové ponaučení

1. **Žádná obrana není absolutní.** Stačí jeden leak v jednom místě a útočník to najde.
2. **Defense in depth.** Více vrstev obran znásobuje, ne sčítá cost útoku.
3. **Hiding sám o sobě je slabý** proti dlouhému útoku. Masking je teoreticky pevnější, ale vyžaduje *pečlivou* implementaci (recombinations of shares mohou leaks zaznamenat).
4. **Constant-time je univerzální** — funguje na všech HW, free at runtime, jen pečlivost při návrhu.
5. **Certifikace ≠ bezpečnost** — Minerva ukázala, že EAL5+ certifikované karty mohou stále leaky. Certifikace garantuje *splnění checkboxů*, ne odolnost vůči zítřejším útokům.

---

*Zdroj: BZA přednášky 2025/26, BZA 05 — Postranní kanály (Malinka). Externí reference: Mangard, S., Oswald, E., Popp, T.: *Power Analysis Attacks: Revealing the Secrets of Smart Cards* (Springer 2007), kap. *Countermeasures*; Ishai, Y., Sahai, A., Wagner, D.: *Private Circuits: Securing Hardware against Probing Attacks* (CRYPTO 2003) — masking foundations; NIST: *Test Vector Leakage Assessment (TVLA) methodology* — [PDF](https://csrc.nist.gov/CSRC/media/Events/Non-Invasive-Attack-Testing-Workshop/documents/08_Goodwill.pdf); Bernstein, D. J.: *cr.yp.to crypto papers on constant-time* — [link](https://cr.yp.to/papers.html).*
