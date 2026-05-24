---
title: Anti-RE techniky a obfuscation
---

# Anti-RE techniky a obfuscation

Útočník reverz inženýruje. Designér se brání. **Anti-reverse engineering** techniky jsou *defensive* opatření zaměřená na *zpomalení a zdražení* analýzy. Bruce Schneierovo motto *"if your computer can see the instructions, you can see them too"* platí — anti-RE *nezabrání* RE, jen ho *prodraží*. Cílem je posunout cost útoku za hranici ekonomické únosnosti.

## Defenzivní strategie

::: svg "Anti-RE vrstvy: source obfuscation → compiler obfuscation → packing/encryption → anti-debug → environmental checks. Každá vrstva zvyšuje cost útoku."
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

## Vrstva 1 — Source-level obfuscation

### Renaming

* **Strip symbol names** — z funkce `verify_license` udělej `func_0x1A4B0`.
* **Identifier scrambling** — random char sequences (Tigress tool, [O-LLVM](https://github.com/heroims/obfuscator)).

### Dead code insertion

Vsunutí *unused* kódu:

```c
int verify(char *input) {
    int x = 42;
    if (x > 100) {  // never true
        return malicious_branch();
    }
    return real_verify(input);
}
```

Reverz inženýr ztrácí čas analýzou *fake* paths.

### Control flow flattening

Transformuje strukturovaný kód na *switch-based dispatcher*:

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

Disassembler ukazuje *spaghetti* — control flow graph je *plochý* a *zamotán*.

::: viz cfg-flatten "Klikni na blok v originalu — odpovidajici case ve flatten verzi se zvyrazni. Vsechny prechody jdou pres switch dispatcher, struktura originalu je 'spaghetti'."
:::

### Opaque predicates

Predikáty, které jsou *vždy true* (nebo false), ale obtížně to dokázat:

```c
if ((x * x * (x + 1)) % 2 == 0) {  // always true: x²(x+1) je vždy even
    do_real_work();
} else {
    do_fake_work();  // dead code
}
```

Reverz inženýr nemůže staticky určit, že fake_work je dead.

## Vrstva 2 — Compiler-level obfuscation

* **`-fno-stack-protector`** — odstraní stack canaries (které jinak nesou information).
* **`-fno-pie -no-pie`** — fixed addresses; ale na druhou stranu method-obfuscation friendly.
* **`-fomit-frame-pointer`** — bez EBP/RBP; debugger má problém s backtrace.
* **`-fvisibility=hidden`** — internal symbols *not* in dynamic symbol table.
* **`strip --strip-all`** — odstraní *všechny* symbols z ELF.

### LLVM obfuscation (O-LLVM)

Klasické extensions:

* **Instructions Substitution** — `a + b` → `a - (-b)`, `x ^ y` → `(x | y) & ~(x & y)`.
* **Bogus Control Flow** — vsunutí random branches s opaque predicates.
* **Control Flow Flattening** — viz výše.

### MOVfuscator

[Christopher Domas 2015](https://github.com/xoreaxeaxeax/movfuscator) — *extrémní* obfuscation, compile C code do **pouze `mov` instrukcí**:

* Vše: arithmetic, branches, function calls — implementováno *jen* přes data movements.
* Disassembly je *prakticky* nečitelný; každý normální algoritmus zhubne na *miliony* mov.
* Klasická joke / proof-of-concept: kompletní *Brainfuck interpreter* v movs.

## Vrstva 3 — Packing a runtime encryption

**Packer** je nástroj, který:

1. Vezme original binárku.
2. **Zašifruje / komprimuje** original code.
3. Vloží *unpacker stub* — code, který za běhu *rozbalí* a *spustí* original.
4. Output: nová binárka, která je *malá* + *unreadable*.

Při spuštění unpacker decode-uje original do paměti a předá control.

### Common packers

* **UPX** (Ultimate Packer for eXecutables) — open source, free. Komprese, ne *šifrování*. Velmi snadno *unpackable* (UPX má `-d` decompress option!) — *nezpomalí* serious RE.
* **Themida** (Oreans) — commercial, $200+. Anti-debug, anti-VM, virtualization, code mutation. Hodně používaný v gaming anti-cheat (Easy Anti-Cheat, BattlEye).
* **VMProtect** — virtualizes code do *custom virtual machine* (každý protected binary má vlastní VM ISA). Reverz inženýr musí *nejprve* zreverz VM, *pak* program. Velmi efektivní.
* **Enigma Protector**, **Obsidium**, **Code Virtualizer** — alternatives.

### Crypter

* **Crypter** = packer + (typically) anti-AV evasion.
* Často používán v malware k obcházení signatures.

### Counters pro reverz inženýra

* **Identify packer** pomocí PEiD, Detect It Easy (DIE), CFF Explorer.
* **Auto-unpack** s tools: x64dbg + Scylla, IDA Pro + Universal Extractor.
* **Manual unpack** přes tracing až *Original Entry Point* (OEP) of unpacked code.
* **Memory dump** — once unpacked v paměti, dump RAM image.

## Vrstva 4 — Anti-debug

Viz [[dynamicka-analyza]]. Common techniques:

* `IsDebuggerPresent()`, `CheckRemoteDebuggerPresent()`.
* `NtQueryInformationProcess(ProcessDebugPort)`.
* **RDTSC timing** — měří dobu, debugger zpomalí.
* **INT 3 detection** — Software breakpoint je `0xCC`; binary scans paměť pro neočekávané 0xCC.
* **Hardware breakpoint check** — DR0–DR3 registry.
* **Self-modifying code** — kód, který modifikuje sám sebe; debugger v některých implementacích panicuje.

### Příklad — Stuxnet anti-debug

Stuxnet ([[iot-realne-utoky]]) měl rozsáhlé anti-debug:

* Detection of `OllyDbg.exe`, `IDA.exe`, `Wireshark.exe`, `SysInternals` tools.
* Kvalifikované VM detection (CPU instructions, registry).
* Custom encryption layers — *5 vrstev*.
* Spustí malicious code *jen* v target environment (Siemens WinCC, specific PLC frequencies).

## Vrstva 5 — Anti-VM / Anti-sandbox

* **CPU manufacturer string** — `cpuid` instrukce v VM často vrátí *VMware* nebo *VirtualBox* string.
* **Hardware vendors** — MAC addresses, registry keys.
* **Process list** — `vmtoolsd.exe`, `VBoxService.exe`, `vboxservice.exe`.
* **Disk size** — VM často má *malý* disk (~50 GB); production server *velký*.
* **Mouse movement** — sandboxes nemají uživatele = no mouse activity for hours.
* **Process count** — sandbox má jen *target binary*; real system má 100+ processes.
* **Time bomb** — malware spustí malicious code až *po dlouhé době* (např. 24h sleep), aby sandbox time-out vypršel.

## Whitebox cryptography

Specializovaná obrana proti RE — pro situations, kde *attacker has full debugger access*:

* **Tradiční crypto** předpokládá *black-box* attacker — implementace OK, *key* secret.
* **Whitebox crypto** — *implementation* je secret. AES klíč je *embedded* do velkých lookup tables (lambda tables), které jsou *neoddělitelné* od algoritmu.
* Used in: DRM (Netflix Widevine, FairPlay, PlayReady), mobile payment (HCE), banking apps na nezabezpečených mobilech.

**Akademická situace:** Většina publikovaných WB AES implementací byla *prolomena* během 1–5 let. State-of-the-art (proprietary) trvá obvykle 2–6 měsíců profesionálnímu reverz týmu.

## Code virtualization (deep dive)

Klasický high-end anti-RE — *virtualizace* hot funkcí:

1. Kritické funkce (license check, crypto operations) jsou *přeloženy* do **custom bytecode**.
2. Compiler generuje **interpretátor** tohoto bytecode jako součást binárky.
3. Při run-time interpretátor dispatchne instrukce.
4. Reverz inženýr musí: (a) identifikovat interpreter, (b) zreverz instrukční sadu, (c) zreverz bytecode protected functions.

Příklady:

* **VMProtect** — komerční, very popular.
* **Themida VM**.
* **Custom VMs** vyvíjené malware authors (Stuxnet, Equation Group tools).

Klíčová metrika: **size factor** — protected code 10–100× větší než original. Slowdown 10–1000×.

## Tamper detection (software)

Software-side tamper detection:

* **Self-checksum** — code computes its own CRC and aborts if changed.
* **Code introspection** — *kontrolní funkce* iterates over `.text` section a verifikuje integrity.
* **Self-modifying code** — code modifies itself, ale s precomputed hashes.

Limit: hardware-level patching obtížně detekovatelný (např. patch v RAM after load).

## Honey tokens

* Embed *false* sensitive data (fake API keys, fake passwords).
* Pokud útočník extrahuje a *použije*, detekuje se = honey alarm.
* Útočník nemůže odlišit fake od real bez additional intel.

## Limity anti-RE

* **Determined attacker s dostatkem času** *vždy* uspěje. Schneier's law platí.
* **Anti-RE** = *zpomalení*, ne *prevence*.
* **Compromise mezi performance a security** — heavy obfuscation makes code 10–100× slower.
* **Compatibility issues** — anti-debug často triggers AV false-positives.

### Economic model

Cílem je *překročit threshold* economic viability:

* Pokud cracking software trvá 1 týden + $1000 vybavení + $50/hod čas → $4 000.
* A *crack* prodá za $50 → break-even nedosáhnut → most attackers se odradí.

Pro **state-level adversary** (NSA, FSB) je threshold *velmi vysoký* — anti-RE *neprotektuje*. Pro **commercial cracking** ano.

## Praktická volba

Pro většinu commercial products:

* **Strip symbols** + **standard optimization** (already significant defense).
* **Minor obfuscation** (encrypt strings, anti-debug basics).
* **Online activation** — license check běhěm spojení s server (server nemusí být lock-stepped s binárkou).
* **Server-side validation** of critical operations.

Pro **high-value** applications (DRM, banking):

* **VMProtect / Themida / custom code virtualization**.
* **Whitebox crypto** kde possible.
* **Periodic update cycle** — útok je expirován za hodiny / dny rotation.

Pro **safety-critical** systems (medical, automotive):

* Reverz inženýrství je *legitimní bezpečnostní research* — anti-RE může ztížit *security research* a *vulnerability discovery*.
* Mnoho výrobců dnes *odebírá* heavy anti-RE z bezpečnostní compliance důvodů.

---

*Zdroj: BZA přednášky 2025/26, BZA 11 — Reverzní inženýrství (Mazura). Externí reference: Collberg, C., Nagra, J.: *Surreptitious Software: Obfuscation, Watermarking, and Tamperproofing for Software Protection* (Addison-Wesley 2009); Cesare, S., Xiang, Y.: *Software Similarity and Classification* (Springer 2012); O-LLVM Obfuscator — [github.com/obfuscator-llvm](https://github.com/obfuscator-llvm/obfuscator); VMProtect documentation — [vmpsoft.com](https://vmpsoft.com/); Chow, S. et al.: *White-Box Cryptography and an AES Implementation* (SAC 2002).*
