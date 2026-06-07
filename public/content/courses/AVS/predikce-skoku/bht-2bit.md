---
title: BHT, 2-bitový saturující čítač a BTB
---

# BHT, 2-bitový saturující čítač a BTB — dynamická predikce skoků

Statická predikce ([[staticka-predikce]]) dosáhne přesnosti zhruba 70 %. Pro hluboké pipeline a široké procesory s přeskupením instrukcí (wide OoO) je ovšem potřeba kolem 95 %. **Dynamický prediktor** sleduje *historii* chování skoků a předpovídá podle ní. Klasickou základní stavební jednotkou je **2-bitový saturující čítač (2-bit saturated counter)** uložený v **tabulce historie skoků (Branch History Table, BHT)**.

## 1-bitový prediktor

Nejjednodušší varianta: jeden bit na každý skok říká, jestli byl skok „naposledy proveden (taken) / neproveden (not-taken)". Při skoku se postupuje takto:

1. Vyhledej bit a predikuj podle něj.
2. Po vyhodnocení skoku aktualizuj bit.

Problém: **smyčka s výstupem (exit)** mění bit dvakrát:

```c
for (i = 0; i < 1000; i++) {
    // ...
}
```

Skok `i < 1000`:
- 999× proveden (predikce T → správně, T → správně, ...)
- Naposledy: **neproveden** (predikce T → špatně, nastav N)
- Při dalším vstupu do smyčky (například ve vnější smyčce, outer loop): skok je **proveden**, ale prediktor má N → **špatně**.

⇒ **2 chybné predikce (mispredict) na každý výstup** ze smyčky. Pro malou smyčku uvnitř vnější smyčky to bolí.

## 2-bitový saturující čítač (Smith 1981)

Princip: vyžadovat **2 chyby za sebou**, než se predikce změní. Stavový automat (state machine) vypadá takto:

::: svg "2-bit saturated counter — state machine"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5">
    <circle cx="80" cy="100" r="35"/>
    <circle cx="220" cy="100" r="35"/>
    <circle cx="360" cy="100" r="35"/>
    <circle cx="500" cy="100" r="35"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="80" y="98">11</text>
    <text x="220" y="98">10</text>
    <text x="360" y="98">01</text>
    <text x="500" y="98">00</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="80" y="112">Strong T</text>
    <text x="220" y="112">Weak T</text>
    <text x="360" y="112">Weak N</text>
    <text x="500" y="112">Strong N</text>
  </g>
  <g stroke="var(--text)" fill="none" stroke-width="1.2">
    <path d="M110,90 Q170,60 195,80" marker-end="url(#tbt-ar1)"/>
    <path d="M250,80 Q310,60 335,90" marker-end="url(#tbt-ar1)"/>
    <path d="M390,90 Q450,60 475,80" marker-end="url(#tbt-ar1)"/>
    <path d="M195,120 Q170,140 110,110" marker-end="url(#tbt-ar1)"/>
    <path d="M335,110 Q310,140 250,120" marker-end="url(#tbt-ar1)"/>
    <path d="M475,120 Q450,140 390,110" marker-end="url(#tbt-ar1)"/>
  </g>
  <g fill="var(--text)" font-size="9" text-anchor="middle">
    <text x="155" y="60">N</text>
    <text x="295" y="60">N</text>
    <text x="435" y="60">N</text>
    <text x="155" y="148">T</text>
    <text x="295" y="148">T</text>
    <text x="435" y="148">T</text>
  </g>
  <g fill="var(--text-faint)" font-size="9">
    <text x="50" y="160">predict T</text>
    <text x="190" y="160">predict T</text>
    <text x="330" y="160">predict N</text>
    <text x="470" y="160">predict N</text>
  </g>
  <g stroke="var(--text)" fill="none" stroke-width="1.2">
    <path d="M62,135 A20 15 0 0 0 62,75" marker-end="url(#tbt-ar1)"/>
    <path d="M518,75 A20 15 0 0 0 518,135" marker-end="url(#tbt-ar1)"/>
  </g>
  <text x="35" y="105" fill="var(--text)" font-size="9">T</text>
  <text x="533" y="105" fill="var(--text)" font-size="9">N</text>
  <defs>
    <marker id="tbt-ar1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--text)"/>
    </marker>
  </defs>
</svg>
:::

Pravidla aktualizace:

- Skok **PROVEDEN (TAKEN)** → čítač += 1 (saturuje na 11).
- Skok **NEPROVEDEN (NOT TAKEN)** → čítač -= 1 (saturuje na 00).

Predikce:

- 11, 10 (nejvyšší bit MSB = 1) → predikuj PROVEDEN (TAKEN).
- 01, 00 (nejvyšší bit MSB = 0) → predikuj NEPROVEDEN (NOT TAKEN).

Pro smyčku for:

- 999× proveden: čítač se rychle dostane na „11" → stabilní predikce T.
- Výstup (1× neproveden): „11" → „10". Predikce zůstává T → 1 chybná predikce.
- Při dalším vstupu (vnější smyčka): proveden → „10" → „11" → predikce T → správně.

⇒ **1 chybná predikce** na každý výstup ze smyčky (ne 2). Pro těsnou vnější smyčku je to velký rozdíl.

Smith v roce 1981 ukázal, že přesnost 2-bitového čítače je zhruba 85–90 % na typickém kódu, oproti přibližně 75 % u 1-bitového.

::: viz branch-2bit-counter "Klikni 'TAKEN' / 'NOT' nebo spusť vzor (smyčka, střídání, ZZ). Stavový automat se pohne; přesnost 2bitového vs. 1bitového prediktoru se aktualizuje živě."
:::

## Tabulka historie skoků (Branch History Table, BHT)

BHT je *tabulka 2-bitových čítačů*. Index tvoří některé bity adresy instrukce PC (typicky 10–14 nejnižších bitů, LSB).

```
PC = 0xDEADBEEF
index = (PC >> 2) & 0x3FF  ; 10 bity → 1024 entries
counter = BHT[index]
predict = counter[MSB]
```

| Velikost BHT | Konfliktů |
| :---: | :--- |
| 1024 (2 kB) | hodně, aliasing kolem 10 % |
| 4096 (8 kB) | kolem 3 % |
| 16384 (32 kB) | méně než 1 % |

**Aliasing** (sdílení záznamu): dvě různé adresy PC se stejným hashem sdílejí jeden čítač. Pokud se skoky chovají nezávisle (disjoint behavior), nemá to vliv (čítače se k sobě nepletou). Pokud jsou ale skoky *korelované* (correlated), mohou se navzájem rušit.

Moderní procesory mají BHT o velikosti desítek kB s velmi nízkým aliasingem.

## Vyrovnávací paměť cílů skoků (Branch Target Buffer, BTB)

BHT řeší jen *směr* skoku. Cílovou adresu pro skok relativní k PC lze spočítat přímo z operačního kódu (opcode). Ale u **nepřímých skoků (indirect jumps)** (`jr r1`, `ret`, volání virtuálních metod) cíl v opcode není.

**BTB** je cache (mapování PC → cíl) — *malá množinově asociativní tabulka (set-associative)*, která uchovává:

- PC (klíč/tag).
- Naposledy viděnou cílovou adresu.
- Predikci směru (někdy je uložena přímo v BTB, jindy je BHT oddělená).

Vyhledání probíhá paralelně s načítáním instrukce (fetch):

```
fetch_pc = current PC
btb_entry = BTB[fetch_pc % BTB_size]
if (btb_entry.tag == fetch_pc) {
    predicted_target = btb_entry.target
    predicted_direction = btb_entry.direction
}
```

Velikost: typicky 256–4096 záznamů. Apple M1 jich má 4096.

::: svg "BHT + BTB v B1 stupni fetch"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="80" width="60" height="40" rx="3"/>
  </g>
  <text x="50" y="105" text-anchor="middle" fill="var(--text)" font-weight="600">PC</text>
  <g fill="var(--accent)" opacity="0.15" stroke="var(--accent)">
    <rect x="120" y="40" width="140" height="50" rx="3"/>
    <rect x="120" y="105" width="140" height="50" rx="3"/>
  </g>
  <text x="190" y="60" text-anchor="middle" fill="var(--text)" font-weight="600">BHT</text>
  <text x="190" y="76" text-anchor="middle" fill="var(--text-muted)" font-size="9">2-bit counter table</text>
  <text x="190" y="125" text-anchor="middle" fill="var(--text)" font-weight="600">BTB</text>
  <text x="190" y="141" text-anchor="middle" fill="var(--text-muted)" font-size="9">PC → target cache</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="320" y="80" width="120" height="40" rx="3"/>
  </g>
  <text x="380" y="100" text-anchor="middle" fill="var(--text)" font-weight="600">Next PC mux</text>
  <text x="380" y="113" text-anchor="middle" fill="var(--text-muted)" font-size="9">PC+4 / target</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="465" y="80" width="60" height="40" rx="3"/>
  </g>
  <text x="495" y="105" text-anchor="middle" fill="var(--text)" font-weight="600">I-cache</text>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none">
    <path d="M80,100 L120,65" marker-end="url(#br-ar1)"/>
    <path d="M80,100 L120,130" marker-end="url(#br-ar1)"/>
    <path d="M260,65 L320,90" marker-end="url(#br-ar1)"/>
    <path d="M260,130 L320,110" marker-end="url(#br-ar1)"/>
    <path d="M440,100 L465,100" marker-end="url(#br-ar1)"/>
  </g>
  <text x="270" y="178" text-anchor="middle" fill="var(--text-faint)" font-size="9">Paralelně: BHT predict direction, BTB lookup target. Pak mux → next PC → fetch.</text>
  <defs>
    <marker id="br-ar1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

## Zásobník návratových adres (Return Address Stack, RAS)

Dvojice `call / ret` mají strukturovaný vzor (pattern). **RAS** je malý zásobník typu LIFO:

- Instrukce `call` → vlož (push) následující PC.
- Instrukce `ret` → vyzvedni (pop) vrchol zásobníku a predikuj cíl.

Velikost je 16–32 záznamů (odpovídá maximální hloubce volání, kterou lze současně podržet bez zastarání záznamů).

Přesnost: zhruba 99 % pro běžný kód. Selhává v těchto případech:

- **Rekurze hlubší než RAS** — zásobník přeteče.
- **Koncové volání (tail call)** (`jmp` místo `call`) — RAS by zde potřeboval *nevkládat* záznam. Moderní překladače se proto někdy *vyhýbají* optimalizaci koncových volání (tail call optimization), aby nezhoršily chování RAS.
- **setjmp/longjmp** — nelokální skoky RAS překvapí.

::: viz btb-ras-traversal "Vyber scénář (normální call/ret, hluboká rekurze přes RAS=8, koncové volání, longjmp) a krokuj. Sleduj vkládání a vyzvedávání ze zásobníku a počet chybných predikcí."
:::

## Úspěšnost predikce u moderních procesorů

| Zátěž | Přesnost predikce směru skoku |
| :--- | :---: |
| SPECCPU integer | 92–96 % |
| Kryptografie, DSP | přes 99 % (předvídatelné) |
| Smyčka interpretu, JIT překládaný JavaScript | 80–90 % |
| Směrování síťových paketů | 70–85 % |
| Procházení B-stromu v databázi | 75–85 % |

Pro nejhorší zátěže (dispatcher interpretu) je přesnost *kritická* — Python, V8 i JVM mají sofistikované techniky (computed goto, threaded code) *právě proto*, aby predikci skoků zlepšily.

## Trénink: studený start (cold-start)

Při startu programu jsou BHT i BTB *prázdné* → prvních 1000+ skoků řídí statická záloha (static fallback). CPI při studeném startu je vyšší než v ustáleném stavu.

Operační systém při přepnutí kontextu (context switch): některé procesory BTB *vyprázdní (flush)* (kvůli zmírnění zranitelnosti Spectre v2), což znamená studený start *po každém plánovacím tiku (scheduling tick)*. Pokuta v cloudových zátěžích bývá často 10–20 %.

## Co dál

2-bitový čítač je *základ*. Stránka [[pokrocile-prediktory]] popisuje korelační prediktory (gshare), prediktory založené na neuronových sítích (perceptron) a TAGE — *špičku oboru (state-of-the-art)* s přesností 97–99 %. Stránka [[prefetching]] rozšíří dynamiku na *data*.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=nczJ58WvtYo" "How Branch Prediction Works in CPUs - Computerphile" "Computerphile"
:::

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Smith, J.E.: „A Study of Branch Prediction Strategies" (ISCA 1981); Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §3.3; Yeh, T.-Y., Patt, Y.N.: „Two-Level Adaptive Training Branch Prediction" (MICRO 1991, [DOI 10.1145/123465.123475](https://doi.org/10.1145/123465.123475)).*
