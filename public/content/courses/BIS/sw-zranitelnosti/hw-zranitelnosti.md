---
title: Hardwarové zranitelnosti — Spectre, Meltdown, Rowhammer
---

# Hardwarové zranitelnosti — Spectre, Meltdown, Rowhammer

Softwarové zranitelnosti ([[buffer-overflow]], [[injekce-utoky]]) řeší *implementační chyby* v programech. Hardwarové zranitelnosti (hardware vulnerabilities) jsou naproti tomu *zásadní vady v návrhu* (fundamental flaws) procesoru nebo paměti RAM — *nelze* je opravit v softwaru bez ztráty výkonu. Jinými slovy: chyba je „zadrátovaná" přímo v křemíku, takže obejít ji jde jen za cenu pomalejšího chodu.

## Spectre (2018)

Spectre zneužívá **spekulativní vykonávání** ([[spekulace-vyjimky]]) v moderních procesorech vykonávajících instrukce mimo pořadí (out-of-order, OoO).

### Princip

Procesor spekuluje, co bude *za* podmíněným skokem (branch), a začne to počítat dopředu. Pokud byla spekulace špatná, výsledky se *zruší* — jenže *vedlejší efekty v cache* (cache effects) zůstanou. A právě tyto zbylé stopy v cache jdou změřit.

```c
if (x < array1_size) {
    y = array2[array1[x] * 256];   // attacker forces x out of bounds
}
```

1. Útočník natrénuje prediktor: pro běžné hodnoty platí `x < array1_size` → pravda.
2. Útočník zavolá kód s hodnotou `x` mimo meze pole → `array1[x]` je tajná hodnota (například paměť jádra).
3. Procesor spekulativně načte `array2[secret * 256]` do cache úrovně L1.
4. Skok se vyhodnotí: ve skutečnosti `x >= array1_size` → výsledek se zahodí.
5. Cache si však *ponechá* řádek na adrese `array2 + secret * 256`.
6. Útočník postupně měří dobu čtení z různých indexů pole `array2` — najde ten *rychlý* (už nahraný v cache) → tím odhalí tajnou hodnotu.

### Spectre v1 (CVE-2017-5753)

Obejití kontroly mezí (bounds check bypass). Funguje přesně tak, jak je popsáno výše.

### Spectre v2 (CVE-2017-5715)

Vstříknutí cíle skoku (branch target injection). Útočník natrénuje *BTB* (branch target buffer, tedy vyrovnávací paměť cílů skoků) tak, aby spekulace přeskočila — i napříč procesy — na útočníkem řízený kousek kódu (gadget).

### Protiopatření

- **Retpoline** — překladač (compiler) nahradí nepřímé skoky bezpečnou alternativou.
- **IBRS / IBPB** — mikrokódové ovládací prvky Intelu (vyprázdní BTB).
- **STIBP** — Single Thread Indirect Branch Predictors (oddělení prediktorů skoků mezi vlákny).
- **LFENCE** — explicitní bariéra vložená do kritického místa kódu.
- **Zpevnění jádra** — záplaty linuxového jádra.

Cena za výkon (performance) je 5–30 % podle druhu zátěže. Nejhůře dopadají databáze a úlohy, které hodně volají jádro.

::: viz spectre-cache-timing "Krok za krokem: trénink prediktoru → spekulativní čtení mimo meze → zrušení → sonda FLUSH+RELOAD. Histogram časů odhalí uniklý bajt — stopa v cache přežije zrušení spekulace."
:::

## Meltdown (CVE-2017-5754)

Týká se konkrétně procesorů Intel (a některých ARM). Kontrola oprávnění proběhne *až po* spekulativním načtení:

```c
*(volatile char *)kernel_address;   // attacker, normally page fault
// But CPU speculatively loads byte
// Uses byte to index attacker's array → cache leaks via side channel
// Permission check raises exception, but cache already poisoned
```

Umožňovalo to číst *libovolnou* paměť jádra z uživatelského prostoru. Šlo o obrovskou zranitelnost.

### Zasažené procesory

- Procesory Intel od roku 1995 (většina).
- ARM Cortex-A75.
- AMD zasaženo *nebylo* (kontroluje oprávnění *před* spekulací).

### Protiopatření

- **KPTI** (Kernel Page Table Isolation, izolace tabulek stránek jádra) — Linux 4.15 a novější. Stránky jádra jsou namapované jen tehdy, když je procesor v režimu jádra. Propad výkonu asi 5–30 % u úloh s mnoha systémovými voláními.
- Záplaty **mikrokódu**.
- **Oprava v křemíku** — Intel Ice Lake (2019) a novější mají vadu opravenou přímo v hardwaru.

## L1TF / Foreshadow (CVE-2018-3615/3620/3646)

L1 Terminal Fault. Spekulativní čtení dokáže sáhnout do cache úrovně L1 *napříč* hyperthreadem nebo kontextem.

Únik z virtuálního stroje (VM escape) — hostovaný virtuální stroj mohl číst paměť hostitele.

### Protiopatření

- **Vyprázdnění L1D** při opuštění virtuálního stroje.
- **Vypnutí Hyper-Threadingu** — běžné protiopatření v cloudu.

Propad výkonu u cloudových virtuálních strojů je značný.

## MDS — Microarchitectural Data Sampling (2019)

Vzorkování dat z mikroarchitektury. Má několik variant: ZombieLoad, RIDL, Fallout, Store-to-Leak.

Unikají při něm data z vnitřních bufferů procesoru (load buffer, store buffer, fill buffer).

### Protiopatření

- Mikrokód **MDS_CLEAR** — vyprázdní buffery při přepnutí kontextu.
- Vypnutí Hyper-Threadingu.

## Hertzbleed (2022)

Dynamické škálování frekvence procesoru (DVFS) vytváří postranní kanál mezi spotřebou a frekvencí. Útočník dokáže vzdáleně získat klíče (key) jen z měření času.

### Protiopatření

- Kryptografie implementovaná v konstantním čase (constant-time).
- Vypnutí DVFS pro citlivý kód (za cenu nižšího výkonu).

## Rowhammer (2014)

Překlopení bitu v paměti DRAM opakovaným přístupem na řádek.

### Princip

Paměť DRAM je tvořena kondenzátory uspořádanými do dvourozměrného pole. Čtení řádku jej zároveň „osvěží" (obnoví náboj). Sousední řádky přitom postupně ztrácejí náboj.

Když útočník na jeden řádek „buší" (hammer) znovu a znovu, sousední řádky ztratí náboj natolik, že se v nich překlopí bity.

```c
char *p1 = aggressor_row;
char *p2 = victim_row;
while (1) {
    *p1;        // hammer aggressor
    clflush(p1);   // force cache miss for next access
}
```

Stovky tisíc přístupů za sekundu na jedno místo → bity se začnou překlápět.

### Dopad

- Poškození tabulky stránek — útočník získá oprávnění jádra (a to bez jediné softwarové chyby).
- Obejití ECC — překlopí-li se 2 a více bitů, kontrola ECC chybu nezachytí.
- Protiopatření *targeted row refresh (TRR)* v pamětech DDR4 — prolomeno v roce 2020 (TRRespass).

### Protiopatření

- **ECC RAM** — odhalí překlopení jednoho bitu. Vícebitová překlopení ale stále mohou projít.
- **TRR** (Targeted Row Refresh, cílené obnovení řádku) — paměť DRAM po podezřelém vzoru přístupů obnoví konkrétní řádky.
- **Hardwarová frekvence obnovování** — častější obnovování → méně času na to, aby se bity stihly překlopit.
- **DRAM s ECC přímo na čipu (on-die ECC)** — u DDR5 ve výchozím stavu.

Problém není zcela vyřešen. Jde o trvalé závody ve zbrojení mezi útoky a obranou.

::: viz rowhammer-flip "Vyber agresorské řádky; pumpuj přístupy; sleduj, kdy se v obětovaném řádku začnou překlápět bity. Přepínej TRR / ECC — uvidíš, která překlopení ještě projdou."
:::

## Postranní kanály — i mimo procesor

### Časové útoky (timing attacks)

Z odchylek v době vykonávání lze odvodit informace. Klasický příklad: porovnávání řetězců znak po znaku → doba se liší podle toho, jak dlouhý je shodný začátek.

```c
for (i = 0; i < strlen(secret); i++)
    if (input[i] != secret[i]) return false;
return true;
```

Doba roste s délkou shodného začátku. Útočník postupuje znak po znaku, měří čas → a tak se dozví tajný řetězec.

Obrana: porovnání v **konstantním čase** (constant-time) — vždy projdeme celou délku.

```c
int diff = 0;
for (i = 0; i < strlen(secret); i++)
    diff |= input[i] ^ secret[i];
return diff == 0;
```

### Analýza spotřeby (power analysis)

Z měření spotřeby procesoru lze usoudit, jaké operace probíhají. Diferenciální výkonová analýza (Differential Power Analysis, DPA) dokáže získat kryptografické klíče z čipových karet.

Podrobně viz [[spa-dpa|postranní kanály]].

### Elektromagnetické vyzařování (TEMPEST)

Elektronická zařízení vyzařují elektromagnetické záření, které nese datové signály. Program NSA TEMPEST chrání před tímto únikem vysoce zabezpečené systémy.

V civilním prostředí: elektromagnetické vyzařování klávesnice lze odečíst i na vzdálenost několika metrů.

Obrana: stínění (Faradayova klec), filtry.

### Časování cache (cache timing)

Sondováním stavu cache lze odvodit, ke kterým místům v paměti oběť přistupovala. Používají se metody PRIME+PROBE a FLUSH+RELOAD.

Tvoří základ pro zneužití Spectre a Meltdownu.

## Útoky na dodavatelský řetězec (supply chain attacks)

Nejde úplně o hardwarové zranitelnosti, ale souvisí s nimi:

### Hardwarové implantáty

Podezření: NSA a čínská vláda mají vkládat čipy do routerů a serverů (kauza Bloombergu „Supermicro" z roku 2018, dodnes zpochybňovaná).

Potvrzeno: Snowdenovy úniky odhalily katalog NSA ANT obsahující hardwarové implantáty.

### Škodlivý kód na úrovni firmwaru

Rootkity ve firmwaru UEFI (LoJax 2018), zranitelnosti Intel ME (Management Engine).

### Padělané čipy

Falešné čipy s odlišnými parametry nebo se zadními vrátky (backdoor). Kontrola dodavatelského řetězce na úrovni států proto zesílila.

## Proč na hardwarových zranitelnostech záleží

- **Obcházejí softwarové zabezpečení** — žádná softwarová záplata neopraví vadu v základech.
- **Cena za výkon** u protiopatření je značná.
- **Dlouhý cyklus obměny** — procesory bývají v provozu 10–20 let.
- **Více zranitelností v téže době** — Spectre, Meltdown, MDS a L1TF se objevily pohromadě.

⇒ Hardwarové zabezpečení je *zásadní*. Software na něm pouze staví.

## Budoucnost

- **CHERI** (Capability Hardware Enhanced RISC Instructions) — výzkum z Cambridge. Hardwarové řízení přístupu (access control) založené na schopnostech (capabilities).
- **Arm Morello** — první komerční procesor postavený na CHERI.
- **Bezpečnostní rozšíření RISC-V** — PMP (Physical Memory Protection, ochrana fyzické paměti), CHERI.

Doba po Spectre: výrobci procesorů spolu *soutěží* už nejen ve výkonu, ale i v bezpečnostních vlastnostech. Vzniká tím nová návrhářská disciplína.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=I5mRwzVvFGE" "Spectre & Meltdown - Computerphile" "Computerphile"
:::

*Zdroj: BIS přednášky 2025/26, Ing. Martin Očenáš, FIT VUT v Brně. Externí reference: Kocher, P. et al.: „Spectre Attacks: Exploiting Speculative Execution" (S&P 2019, [arXiv:1801.01203](https://arxiv.org/abs/1801.01203)); Lipp, M. et al.: „Meltdown: Reading Kernel Memory from User Space" (USENIX Security 2018); Kim, Y. et al.: „Flipping Bits in Memory Without Accessing Them" (ISCA 2014); Frigo, P. et al.: „TRRespass: Exploiting the Many Sides of Target Row Refresh" (S&P 2020); [Spectre & Meltdown info](https://meltdownattack.com/).*
