---
title: Řídicí konflikty — skoky a flush pipeline
---

# Řídicí konflikty: skoky a jejich pokuta

V průměru je **každá 6.-9. instrukce skoková**. Pipeline nemá v okamžiku IF ani tušení, *kam* skok povede — proto musí buď stagnovat, nebo *spekulovat*. Tato sekce popisuje *proč* skoky bolí a *jak* hardware minimalizuje pokutu.

## Typy skokových instrukcí

| Typ | Příklad MIPS | Co potřebuje |
| :--- | :--- | :--- |
| Nepodmíněný | `j target` | op-kód `j`, PC, rel. adresa (Imm 26 b) |
| Nepodmíněný registr | `jr r1` | op-kód, hodnota registru |
| Volání podprogramu | `jal target` | op-kód `jal`, PC, rel. adresa |
| Podmíněný (1 reg) | `bnez r1, target` | op-kód, PC, Imm 16 b, test 1 registru v ID |
| Podmíněný (2 reg) | `bne r1, r2, target` | op-kód, PC, Imm 16 b, test 2 reg v EX |

Výpočet **cílové adresy** + vyhodnocení **podmínky** chceme co nejdřív.

## Pokuta nepodmíněného skoku

```
takt:           1   2   3   4   5   6   7
j target:      IF  ID  EX  MA  WB
i+1:               IF  --  --  --   (KILL)
i+2:                   IF  --  --   (KILL)
i+3:                       IF  --   (KILL)
target:                        IF  ID  EX  MA  WB
```

Adresa cíle se spočítá v **EX** (PC + sign-ext Imm). Pak v MA se přepíše do PC. Mezitím už pipeline načetla **3 špatné instrukce** za skokem → musí je **kill** (vložit NOP do IR).

⇒ Pokuta `j` v 5-stupňové pipeline = **3 takty**.

## Optimalizace: výpočet cíle dříve

Cíl nepodmíněného skoku závisí jen na *opcode* a *PC + imm*. Lze ho spočítat *už v ID*:

```
takt:           1   2   3   4
j target:      IF  ID  EX  MA  WB
i+1:               IF  --   (KILL)
target:                IF  ID  EX  MA  WB
```

Pokuta = **1 takt**. Tomu odpovídá *dodatkový sčítač* v ID stage. U podmíněného skoku to jde *jen* pro `bnez/beqz` (test jednoho registru v ID); `bne` (dvou registrů) musí stále do EX.

## Delay slot — historický trik

MIPS originál měl **1 delay slot**: instrukce *za* skokem se *vždy* vykoná, ať skok vede kamkoli. Kompilátor se snažil tento slot naplnit *užitečnou* nezávislou instrukcí, jinak vložil NOP.

```
        addi r1, r1, 4
        bne r1, r2, loop
        nop              ; delay slot — vždy se vykoná
```

Délka delay slotu = pokuta skoku. Pro dnešní pipeline 14+ stupňů je delay slot nepoužitelný (delay slot 13 NOPů je horší než spekulace). Moderní RISC-V a x86 delay slot **nemají**.

## Řídicí konflikt v hlubších pipeline

Hluboká pipeline (Pentium 4: 31 stupňů, Intel Skylake: 14-19) má pokutu mnohem vyšší. Cíl skoku se vyřeší v *pozdním* stupni (B2 / EX2 / atd.), do té doby je v IF už mnoho instrukcí.

::: svg "Pokuta skoku v 5- vs 15-stupňové pipeline"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--text)" font-weight="600">
    <text x="20" y="40">5-stupňová pipeline:</text>
    <text x="20" y="120">15-stupňová pipeline:</text>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="55" width="80" height="22" rx="2"/>
    <rect x="105" y="55" width="80" height="22" rx="2"/>
    <rect x="190" y="55" width="80" height="22" rx="2"/>
    <rect x="275" y="55" width="80" height="22" rx="2"/>
    <rect x="360" y="55" width="80" height="22" rx="2"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="60" y="69">IF</text>
    <text x="145" y="69">ID</text>
    <text x="230" y="69">EX</text>
    <text x="315" y="69">MA</text>
    <text x="400" y="69">WB</text>
  </g>
  <rect x="190" y="82" width="80" height="14" fill="var(--accent)" opacity="0.6"/>
  <text x="230" y="93" text-anchor="middle" fill="white" font-size="9" font-weight="600">cíl skoku</text>
  <text x="200" y="105" fill="var(--accent)" font-size="9" font-weight="600">pokuta = 3 takty (kill IF, ID, EX-slot)</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="135" width="32" height="22" rx="2"/>
    <rect x="55" y="135" width="32" height="22" rx="2"/>
    <rect x="90" y="135" width="32" height="22" rx="2"/>
    <rect x="125" y="135" width="32" height="22" rx="2"/>
    <rect x="160" y="135" width="32" height="22" rx="2"/>
    <rect x="195" y="135" width="32" height="22" rx="2"/>
    <rect x="230" y="135" width="32" height="22" rx="2"/>
    <rect x="265" y="135" width="32" height="22" rx="2"/>
    <rect x="300" y="135" width="32" height="22" rx="2"/>
    <rect x="335" y="135" width="32" height="22" rx="2"/>
    <rect x="370" y="135" width="32" height="22" rx="2"/>
    <rect x="405" y="135" width="32" height="22" rx="2"/>
  </g>
  <g fill="var(--text-faint)" text-anchor="middle" font-size="9">
    <text x="36" y="149">IF</text>
    <text x="71" y="149">IF</text>
    <text x="106" y="149">ID</text>
    <text x="141" y="149">ID</text>
    <text x="176" y="149">ren</text>
    <text x="211" y="149">disp</text>
    <text x="246" y="149">RS</text>
    <text x="281" y="149">EX</text>
    <text x="316" y="149">EX</text>
    <text x="351" y="149">MA</text>
    <text x="386" y="149">ROB</text>
    <text x="421" y="149">WB</text>
  </g>
  <rect x="265" y="162" width="32" height="14" fill="var(--accent)" opacity="0.6"/>
  <text x="281" y="173" text-anchor="middle" fill="white" font-size="9">cíl</text>
  <text x="200" y="190" fill="var(--accent)" font-size="9" font-weight="600">pokuta až 12-19 taktů → nutná spekulace</text>
</svg>
:::

V 15-stupňové pipeline by *bez* predikce byla pokuta ~12 taktů. CPI by snadno stouplo nad 3 — pipelining by ztratil smysl.

## Řešení: predikce skoku

Pipeline *spekulativně* fetchne instrukce **podle predikce** (taken / not-taken + target). Pokud uhodne, žádná pokuta. Pokud se splete, **flush** spekulativně načtených instrukcí a začni znovu na správné adrese.

Statistika reálných benchmarků: dobrý prediktor uhodne **95-98 %** skoků. Pak průměrná pokuta ~0,2-0,5 taktu místo plné.

Detailům predikce se věnuje samostatná sekce ([[staticka-predikce]], [[bht-2bit]], [[pokrocile-prediktory]]).

## Predikce taken vs not-taken

Jednoduché statické pravidlo:

- **Backward branches** (taken k *nižší* adrese — typické pro smyčky) — predikuj **taken** (~80-90 % skutečně taken).
- **Forward branches** (taken k *vyšší* adrese — typické pro `if/else`) — predikuj **not-taken** (~50/50 reálně).

Tato heuristika je v některých ISA *kódovaná* (PowerPC „branch hint" bit) nebo *vyvozená* z opcode (RISC-V `BTB`).

::: viz control-hazard-recovery "Přepínej strategii (predict-not-taken / predict-taken / delay slot / stall do EX) a zaškrtni 'branch TAKEN'. Sleduj, kolik bublin se flushne a celkový počet cyklů."
:::

## Kdy je pokuta nezbytná

Některé skoky predikovat *nelze*:

- **Indirect jumps** (`jr r1`) — target závisí na obsahu registru spočtené v EX. *Některé* prediktory (BTB s indirect jump cache) zkouší.
- **Return address** — cíl `jr ra` se predikuje ze **return-address stacku** (RAS, ~16-32 položek). Hit-rate ~99 % pro normální program.
- **Computed goto** (switch s jump table) — někdy mají dedikovanou tabulku.

V nejhorším případě skok prostě stagnuje a dochází k pokutě plné hloubky pipeline.

## Pokuta v reálném programu

Bez optimalizací: jedna z 6-9 instrukcí je skok, pokuta 2-3 takty → CPI příspěvek skoků = $\frac{1}{7} \cdot 2{,}5 \approx 0{,}36$. **CPI by stouplo z 1,0 na 1,36** — 36% degradace.

S predikcí 95 % a pokutou 15 taktů (hluboká pipeline): $\frac{1}{7} \cdot 0{,}05 \cdot 15 \approx 0{,}11$. **Pokuta klesne na 11 %**.

⇒ Bez branch prediction by moderní hluboká pipeline byla totálně nepoužitelná.

## Co dál

[[superpipelining-vykon]] kvantifikuje pokuty *všech* zdrojů (data, control, structural) a počítá výsledné zrychlení. Kvalitnější predikce ([[bht-2bit]], [[pokrocile-prediktory]]) potlačí control hazardy efektivně.

---

*Zdroj: AVS přednášky 2025/26, doc. Ing. Jiří Jaroš, Ph.D., FIT VUT v Brně. Externí reference: Hennessy, J.L., Patterson, D.A.: „Computer Architecture: A Quantitative Approach" (6th ed., Morgan Kaufmann 2017), §3.1-3.3; Patterson, D.A., Hennessy, J.L.: „Computer Organization and Design: RISC-V Edition" (Morgan Kaufmann 2017), §4.8; Smith, J.E.: „A Study of Branch Prediction Strategies" (ISCA 1981).*
