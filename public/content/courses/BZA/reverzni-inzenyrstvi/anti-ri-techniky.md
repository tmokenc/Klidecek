---
title: Techniky proti reverznímu inženýrství a obfuskace
---

# Techniky proti reverznímu inženýrství a obfuskace

Útočník provádí reverzní inženýrství (reverse engineering, RE). Návrhář se brání. **Techniky proti reverznímu inženýrství (anti-reverse engineering)** jsou obranná (defensive) opatření zaměřená na to, aby analýzu zpomalila a prodražila. Platí motto Bruce Schneiera *„if your computer can see the instructions, you can see them too“* (pokud instrukce vidí váš počítač, uvidíte je i vy) — anti-RE reverznímu inženýrství *nezabrání*, jen ho *prodraží*. Cílem je posunout cenu útoku za hranici ekonomické únosnosti.

## Defenzivní strategie

::: svg "Vrstvy anti-RE: obfuskace zdrojového kódu → obfuskace překladačem → balení/šifrování → anti-debug → kontroly prostředí. Každá vrstva zvyšuje cenu útoku."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="40" y="30" width="460" height="30" rx="4"/>
    <rect x="40" y="68" width="460" height="30" rx="4"/>
    <rect x="40" y="106" width="460" height="30" rx="4"/>
    <rect x="40" y="144" width="460" height="30" rx="4"/>
    <rect x="40" y="182" width="460" height="30" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="50" font-size="11">1. Source-level obfuscation — variable renaming, dead code, control flow flattening</text>
    <text x="270" y="88" font-size="11">2. Compiler obfuscation — strip symbols, inline aggressive, no debug info</text>
    <text x="270" y="126" font-size="11">3. Packing / runtime encryption — UPX, Themida, VMProtect</text>
    <text x="270" y="164" font-size="11">4. Anti-debug — IsDebuggerPresent, timing checks, RDTSC tricks</text>
    <text x="270" y="202" font-size="11">5. Environmental checks — anti-VM, anti-sandbox, hardware fingerprint</text>
  </g>
</svg>
:::

## Vrstva 1 — obfuskace na úrovni zdrojového kódu

### Přejmenování (renaming)

* **Odstranění názvů symbolů (strip symbol names)** — z funkce `verify_license` se stane `func_0x1A4B0`.
* **Zamíchání identifikátorů (identifier scrambling)** — náhodné sekvence znaků (nástroj Tigress, [O-LLVM](https://github.com/heroims/obfuscator)).

### Vkládání mrtvého kódu (dead code insertion)

Vsunutí *nepoužitého* kódu:

```c
int verify(char *input) {
    int x = 42;
    if (x > 100) {  // never true
        return malicious_branch();
    }
    return real_verify(input);
}
```

Reverzní inženýr ztrácí čas analýzou *falešných* cest.

### Zploštění toku řízení (control flow flattening)

Převede strukturovaný kód na *dispečer řízený přepínačem (switch-based dispatcher)*:

```c
// Original
if (x > 0) { a = 1; } else { a = 2; }
b = a + 1;

// Flattened
state = 0;
while (true) {
    switch (state) {
        case 0: if (x > 0) state = 1; else state = 2; break;
        case 1: a = 1; state = 3; break;
        case 2: a = 2; state = 3; break;
        case 3: b = a + 1; state = 4; break;
        case 4: return;
    }
}
```

Disassembler ukáže *špagety* — graf toku řízení (control flow graph) je *plochý* a *zamotaný*.

::: viz cfg-flatten "Klikni na blok v originálu — odpovídající case ve zploštěné verzi se zvýrazní. Všechny přechody jdou přes switch dispatcher, struktura originálu je 'špagety'."
:::

### Neprůhledné predikáty (opaque predicates)

Predikáty, které jsou *vždy pravdivé* (nebo vždy nepravdivé), ale je obtížné to dokázat:

```c
if ((x * x * (x + 1)) % 2 == 0) {  // always true: x²(x+1) je vždy even
    do_real_work();
} else {
    do_fake_work();  // dead code
}
```

Reverzní inženýr nedokáže staticky určit, že `fake_work` je mrtvý kód.

## Vrstva 2 — obfuskace na úrovni překladače (compiler)

* **`-fno-stack-protector`** — odstraní ochranné hodnoty na zásobníku (stack canaries), které by jinak nesly informaci.
* **`-fno-pie -no-pie`** — pevné adresy; na druhou stranu to ale usnadňuje obfuskaci metod.
* **`-fomit-frame-pointer`** — bez registrů EBP/RBP; debugger má problém s výpisem zásobníku volání (backtrace).
* **`-fvisibility=hidden`** — interní symboly se *nedostanou* do tabulky dynamických symbolů.
* **`strip --strip-all`** — odstraní *všechny* symboly z ELF souboru.

### Obfuskace v LLVM (O-LLVM)

Klasická rozšíření:

* **Substituce instrukcí (instruction substitution)** — `a + b` → `a - (-b)`, `x ^ y` → `(x | y) & ~(x & y)`.
* **Falešný tok řízení (bogus control flow)** — vsunutí náhodných skoků (branches) s neprůhlednými predikáty.
* **Zploštění toku řízení (control flow flattening)** — viz výše.

### MOVfuscator

[Christopher Domas 2015](https://github.com/xoreaxeaxeax/movfuscator) — *extrémní* obfuskace, která přeloží kód v jazyce C do **pouze instrukcí `mov`**:

* Vše — aritmetika, skoky, volání funkcí — je implementováno *jen* pomocí přesunů dat.
* Disassembly je *prakticky* nečitelný; každý běžný algoritmus se rozroste na *miliony* instrukcí `mov`.
* Klasický žert / důkaz konceptu (proof-of-concept): kompletní *interpret jazyka Brainfuck* napsaný v instrukcích `mov`.

## Vrstva 3 — balení (packing) a šifrování za běhu (runtime encryption)

**Packer** je nástroj, který:

1. Vezme původní binárku.
2. **Zašifruje / zkomprimuje** původní kód.
3. Vloží *rozbalovací stub (unpacker stub)* — kód, který za běhu *rozbalí* a *spustí* originál.
4. Výstupem je nová binárka, která je *malá* a *nečitelná*.

Při spuštění unpacker dekóduje originál do paměti a předá mu řízení.

### Běžné packery

* **UPX** (Ultimate Packer for eXecutables) — open source, zdarma. Provádí kompresi, ne *šifrování*. Velmi snadno se rozbaluje (UPX má volbu `-d` pro dekompresi!) — vážnější reverzní inženýrství *nezpomalí*.
* **Themida** (Oreans) — komerční, od 200 USD. Anti-debug, anti-VM, virtualizace, mutace kódu. Hojně používaná v herních systémech proti podvádění (anti-cheat: Easy Anti-Cheat, BattlEye).
* **VMProtect** — virtualizuje kód do *vlastního virtuálního stroje (custom virtual machine)*; každá chráněná binárka má vlastní instrukční sadu (ISA) virtuálního stroje. Reverzní inženýr musí *nejprve* zreverzovat virtuální stroj a *teprve pak* samotný program. Velmi účinné.
* **Enigma Protector**, **Obsidium**, **Code Virtualizer** — alternativy.

### Crypter

* **Crypter** = packer + (typicky) obcházení antivirů (anti-AV evasion).
* Často se používá ve škodlivém kódu (malware) k obcházení signatur.

### Protiopatření pro reverzního inženýra

* **Identifikace packeru** pomocí nástrojů PEiD, Detect It Easy (DIE), CFF Explorer.
* **Automatické rozbalení** nástroji: x64dbg + Scylla, IDA Pro + Universal Extractor.
* **Ruční rozbalení** trasováním (tracing) až po *původní vstupní bod (Original Entry Point, OEP)* rozbaleného kódu.
* **Výpis paměti (memory dump)** — jakmile je kód rozbalený v paměti, pořídí se obraz RAM.

## Vrstva 4 — anti-debug

Viz [[dynamicka-analyza]]. Běžné techniky:

* `IsDebuggerPresent()`, `CheckRemoteDebuggerPresent()`.
* `NtQueryInformationProcess(ProcessDebugPort)`.
* **Časování RDTSC (RDTSC timing)** — měří dobu běhu, debugger ji zpomalí.
* **Detekce INT 3** — softwarový breakpoint je `0xCC`; binárka prohledává paměť, jestli v ní nejsou neočekávané hodnoty `0xCC`.
* **Kontrola hardwarových breakpointů** — registry DR0–DR3.
* **Samomodifikující se kód (self-modifying code)** — kód, který upravuje sám sebe; debugger v některých implementacích zhavaruje.

### Příklad — anti-debug ve Stuxnetu

Stuxnet ([[iot-realne-utoky]]) měl rozsáhlou anti-debug ochranu:

* Detekce nástrojů `OllyDbg.exe`, `IDA.exe`, `Wireshark.exe` a `SysInternals`.
* Sofistikovanou detekci virtuálních strojů (CPU instrukce, registry).
* Vlastní vrstvy šifrování — *5 vrstev*.
* Spustil škodlivý kód *jen* v cílovém prostředí (Siemens WinCC, konkrétní frekvence PLC).

## Vrstva 5 — anti-VM / anti-sandbox

* **Řetězec výrobce CPU** — instrukce `cpuid` ve virtuálním stroji často vrátí řetězec *VMware* nebo *VirtualBox*.
* **Hardwaroví výrobci** — MAC adresy, klíče v registru.
* **Seznam procesů** — `vmtoolsd.exe`, `VBoxService.exe`, `vboxservice.exe`.
* **Velikost disku** — virtuální stroj má často *malý* disk (~50 GB); produkční server *velký*.
* **Pohyb myši** — sandboxy nemají uživatele = žádná aktivita myši po celé hodiny.
* **Počet procesů** — sandbox má jen *cílovou binárku*; reálný systém má 100+ procesů.
* **Časovaná nálož (time bomb)** — malware spustí škodlivý kód až *po dlouhé době* (např. 24h spánku), aby mezitím vypršel časový limit sandboxu.

## Whitebox kryptografie (whitebox cryptography)

Specializovaná obrana proti reverznímu inženýrství — pro situace, kdy *útočník má plný přístup přes debugger*:

* **Tradiční kryptografie** předpokládá útočníka v režimu *černé skříňky (black-box)* — implementace je veřejná, tajný je jen *klíč (key)*.
* **Whitebox kryptografie** — tajná je *samotná implementace*. AES klíč je *zapečen (embedded)* do velkých vyhledávacích tabulek (lookup tables, tzv. lambda tables), které jsou *neoddělitelné* od algoritmu.
* Používá se v: DRM (Netflix Widevine, FairPlay, PlayReady), mobilních platbách (HCE), bankovních aplikacích na nezabezpečených mobilech.

**Akademická situace:** Většina publikovaných whitebox implementací AES byla *prolomena* během 1–5 let. Stav techniky (proprietární řešení) vydrží profesionálnímu reverznímu týmu obvykle 2–6 měsíců.

## Virtualizace kódu (code virtualization) — do hloubky

Klasická špičková (high-end) ochrana proti reverznímu inženýrství — *virtualizace* nejvytíženějších (hot) funkcí:

1. Kritické funkce (kontrola licence, kryptografické operace) se *přeloží* do **vlastního bytecode**.
2. Překladač vygeneruje **interpret** tohoto bytecode jako součást binárky.
3. Za běhu interpret jednotlivé instrukce dispatchuje (předává ke zpracování).
4. Reverzní inženýr musí: (a) identifikovat interpret, (b) zreverzovat instrukční sadu, (c) zreverzovat bytecode chráněných funkcí.

Příklady:

* **VMProtect** — komerční, velmi populární.
* **Themida VM**.
* **Vlastní virtuální stroje** vyvíjené autory malwaru (Stuxnet, nástroje Equation Group).

Klíčová metrika: **faktor zvětšení (size factor)** — chráněný kód je 10–100× větší než originál. Zpomalení je 10–1000×.

## Detekce manipulace (tamper detection) — softwarová

Detekce manipulace na softwarové straně:

* **Vlastní kontrolní součet (self-checksum)** — kód si spočítá vlastní CRC a při změně se ukončí.
* **Introspekce kódu (code introspection)** — *kontrolní funkce* prochází sekci `.text` a ověřuje její integritu.
* **Samomodifikující se kód (self-modifying code)** — kód upravuje sám sebe, ale s předpočítanými hashi.

Omezení: úpravu na úrovni hardwaru lze obtížně detekovat (např. záplata v RAM po načtení).

## Honey tokeny (honey tokens)

* Vloží se *falešná* citlivá data (falešné API klíče, falešná hesla).
* Pokud je útočník extrahuje a *použije*, dojde k detekci = spustí se „medový“ poplach (honey alarm).
* Útočník nedokáže odlišit falešné údaje od pravých bez dodatečných informací.

## Limity anti-RE

* **Odhodlaný útočník s dostatkem času** *vždy* uspěje. Platí Schneierův zákon.
* **Anti-RE** = *zpomalení*, ne *prevence*.
* **Kompromis mezi výkonem (performance) a bezpečností** — důkladná obfuskace zpomalí kód 10–100×.
* **Problémy s kompatibilitou** — anti-debug často spouští falešné poplachy antivirů (AV false-positives).

### Ekonomický model

Cílem je *překročit práh* ekonomické únosnosti:

* Pokud prolomení softwaru trvá 1 týden + 1000 USD na vybavení + 50 USD/hod za čas → 4 000 USD.
* A *crack* se prodá za 50 USD → bod zvratu (break-even) se nedosáhne → většina útočníků se odradí.

Pro **státního protivníka (state-level adversary)** (NSA, FSB) je tento práh *velmi vysoký* — anti-RE ho *neochrání*. Pro **komerční prolamování (cracking)** ano.

## Praktická volba {tier=practice}

Pro většinu komerčních produktů:

* **Odstranění symbolů (strip symbols)** + **standardní optimalizace** (už samo o sobě představuje výraznou obranu).
* **Drobná obfuskace (minor obfuscation)** (šifrování řetězců, základní anti-debug).
* **Online aktivace** — kontrola licence během spojení se serverem (server nemusí být svázán krok za krokem s binárkou).
* **Validace na straně serveru** u kritických operací.

Pro **vysoce hodnotné (high-value)** aplikace (DRM, bankovnictví):

* **VMProtect / Themida / vlastní virtualizace kódu**.
* **Whitebox kryptografie** tam, kde je to možné.
* **Pravidelný cyklus aktualizací** — útok pozbude platnosti během hodin / dní díky rotaci.

Pro **bezpečnostně kritické (safety-critical)** systémy (zdravotnictví, automotive):

* Reverzní inženýrství je zde *legitimní bezpečnostní výzkum* — anti-RE může ztížit *bezpečnostní výzkum* a *odhalování zranitelností*.
* Mnoho výrobců dnes z důvodů bezpečnostní compliance silnou anti-RE ochranu *odstraňuje*.

---

*Zdroj: BZA přednášky 2025/26, BZA 11 — Reverzní inženýrství (Mazura). Externí reference: Collberg, C., Nagra, J.: *Surreptitious Software: Obfuscation, Watermarking, and Tamperproofing for Software Protection* (Addison-Wesley 2009); Cesare, S., Xiang, Y.: *Software Similarity and Classification* (Springer 2012); O-LLVM Obfuscator — [github.com/obfuscator-llvm](https://github.com/obfuscator-llvm/obfuscator); VMProtect documentation — [vmpsoft.com](https://vmpsoft.com/); Chow, S. et al.: *White-Box Cryptography and an AES Implementation* (SAC 2002).*
