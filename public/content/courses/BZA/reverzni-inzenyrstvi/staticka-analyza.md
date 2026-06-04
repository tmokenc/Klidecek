---
title: Statická analýza
---

# Statická analýza

**Statická analýza** zkoumá binární soubor *bez spuštění*. Disassembler překládá machine code na assembly; dekompilátor zpětně vytváří přiblížený zdrojový kód v C/C++; cross-references and pseudo-code views pomáhají reverz engineerovi porozumět struktuře. Klíčové výhody: žádné riziko spuštění malware, plná kontrola nad analýzou, deterministické výsledky.

## Workflow

::: svg "Statická analýza workflow: binárka → disassembler → assembly → decompiler → pseudo-C."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aSA1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="80" width="80" height="40" rx="4"/>
    <rect x="130" y="80" width="80" height="40" rx="4"/>
    <rect x="240" y="80" width="80" height="40" rx="4"/>
    <rect x="350" y="80" width="80" height="40" rx="4"/>
    <rect x="460" y="80" width="60" height="40" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="60" y="105" font-size="11">binárka</text>
    <text x="170" y="105" font-size="11">disassem.</text>
    <text x="280" y="105" font-size="11">assembly</text>
    <text x="390" y="105" font-size="11">decompiler</text>
    <text x="490" y="105" font-size="11">C-like</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9.5">
    <text x="60" y="135">.exe, .so</text>
    <text x="170" y="135">IDA, Ghidra</text>
    <text x="280" y="135">x86, ARM</text>
    <text x="390" y="135">Hex-Rays</text>
    <text x="490" y="135">pseudo-code</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aSA1)">
    <path d="M100,100 L128,100"/>
    <path d="M210,100 L238,100"/>
    <path d="M320,100 L348,100"/>
    <path d="M430,100 L458,100"/>
  </g>
</svg>
:::

## Disassembly

**Disassembler** převádí strojový kód (sekvence bytes) zpět na **assembly** instrukce. Není to perfektní mapování — existují *ambiguity* (where does code end and data begin, byte-aligned vs. shifted decoding).

### Tools

* **IDA Pro** (Interactive DisAssembler, Hex-Rays):
  * **Gold standard.** Komerční, $500–10 000.
  * Podporuje cca 50+ procesorových architektur (x86, x86-64, ARM, AArch64, MIPS, PowerPC, RISC-V, SH, Motorola, ...).
  * Auto-analysis: identifikuje funkce, cross-references, strings, switch statements.
  * **Hex-Rays Decompiler** (oddělená licence, $1000+) — zpětně do C-like pseudo-code.
  * Plugin ecosystem (FLIRT signatures, BinDiff, ...).
* **Ghidra** (NSA, open-source od 2019):
  * Free alternativa IDA s podobnou funkcionalitou.
  * Java-based, scriptable Python (via Jython) a Java.
  * Vlastní decompiler (P-code intermediate representation).
  * Cross-platform (Win/Linux/macOS).
* **Radare2 / Cutter:**
  * Free, open-source. r2 je CLI, Cutter je Qt GUI.
  * Velmi powerful, ale steep learning curve.
  * Také *rizin* fork s lepší UX.
* **Binary Ninja:**
  * Modern, $300+. Více architektur, lepší IL (Intermediate Language) workflow.
* **objdump** (binutils):
  * Linux command line. Free, basic.
  * `objdump -d -M intel binary` — quick check.

### Příklad — IDA workflow

1. **Open binary** → IDA auto-analysis (může trvat minuty pro velký exe).
2. **Function list** (F4) — seznam identifikovaných funkcí.
3. **Strings view** (Shift+F12) — všechny printable strings v binárce.
4. **Imports view** — DLL/SO imports — odhalí API closely.
5. **Cross-references** (X) — pro funkci ukáže, kdo ji volá.
6. **Graph view** — control flow graph.
7. **Decompiler** (F5) — pseudo-C of current function.

## Dekompilace

**Decompiler** posune analýzu z assembly na vyšší úroveň — pseudo-C, který je snazší číst.

### Limity dekompilace

* **Inversion není perfect** — compiler optimization, inlining, register allocation způsobí, že generated source neodpovídá originálu.
* **Typy proměnných** často heuristicky odhadnuté (sizeof = 4? int nebo float?).
* **Struktury** vyžadují manuální identification a definitions.
* **Class hierarchies** v C++ obtížné (vtables, RTTI).
* **Compiler optimizations** (loop unrolling, function inlining) komplikují recovery.

### IDA Hex-Rays příklad

Strojový kód:

```asm
push    ebp
mov     ebp, esp
sub     esp, 18h
mov     eax, [ebp+8]
add     eax, [ebp+0Ch]
mov     [ebp-4], eax
mov     eax, [ebp-4]
leave
retn
```

Hex-Rays decompilation:

```c
int __cdecl sum(int a, int b)
{
    int result; // [ebp-4]
    result = a + b;
    return result;
}
```

Pro typický commercial software dekompilator dá 60–80 % readable kódu; zbytek vyžaduje manuální analýzu (zejména SIMD instructions, custom calling conventions, anti-RE tricks).

## Pattern matching

* **FLIRT signatures** (IDA) — identifikuje *standardní knihovny* (libc, MSVCRT, OpenSSL) v binárce → tisíce funkcí auto-pojmenovaných.
* **YARA rules** — string patterns + bytes pro malware classification. Klíčový nástroj v threat intelligence.
* **BinDiff** (Google) — porovnání dvou binárek; identifikuje *which functions changed* mezi verzemi. Klíčové pro **patch diffing** (1-day exploit dev).
* **Diaphora** (free alternativa k BinDiff) pro IDA.

## Static analyzátory pro security

* **Cppcheck** — pro source code.
* **Coverity, Klocwork, Fortify** — komerční SAST (Static Application Security Testing).
* **GCC -fanalyzer** / **clang static analyzer** — open source.
* **CodeQL** (GitHub) — semantic code analysis.

Tyto cílí na *source code*; pro *binary* analýzu se používají IDA pluginy nebo Ghidra scripts.

## Symbol resolution

* **Stripped binaries** — bez debug informací, symbols, function names. Standard pro commercial release.
* **Debug builds** — s symbols (PDB on Windows, DWARF on Linux/macOS).
* **Symbol recovery techniques:**
  * **Library FLIRT signatures** — identifikuje známé funkce.
  * **Type recovery** přes propagation (sizeof, usage patterns).
  * **String references** → guess function names ("decryption_key", "auth_failed").
  * **Trace through known API calls** — Windows API, POSIX system calls.

## File format

Reverz inženýr musí porozumět **binary file formats**:

* **PE** (Portable Executable) — Windows EXE/DLL.
* **ELF** (Executable and Linkable Format) — Linux/Unix.
* **Mach-O** — macOS/iOS.
* **APK** / **DEX** — Android.
* **IPA** — iOS.
* **HEX / SREC** — Microcontroller firmware images.

Klíčové sekce:
* **`.text`** — code segment.
* **`.data`** — initialized data.
* **`.bss`** — uninitialized (zero) data.
* **`.rodata`** — read-only data (strings, constants).
* **`.plt` / `.got`** — Procedure Linkage Table, Global Offset Table (dynamic linking).
* **`.dynsym` / `.dynstr`** — dynamic symbols (linked libraries).

Tools:
* **objdump -h** — section headers.
* **readelf -a** — ELF analyzer.
* **PE-Explorer** / **CFF Explorer** — PE format.
* **otool** — Mach-O.

## Příklad — extrakce hardcoded klíčů {tier=example}

Klasická úloha: najít AES klíč v IoT firmware.

1. **objdump -d firmware.bin > disasm.txt** — disassemble.
2. **strings firmware.bin | grep -iE "key|aes|secret"** — strings hint.
3. V IDA: **Cross-references** k *AES function* (např. SubBytes operace s S-box konstanta).
4. **Trace** key parameter zpět:
   * Identifikuj `AES_KeySchedule(key)` call.
   * **R0/RDI** parameter je pointer na klíč.
   * Cross-reference: kdo volá tuto funkci.
5. **String aliasing** — v `.rodata` sekci najdi byte sequence, která odpovídá key (typicky 16/32 bytes alignment).

V open-source IoT firmware (router) lze najít AES klíče ve **flash dump** běžně.

## Příklad — algoritmus reverz {tier=example}

Klasická úloha: rekonstrukce **algoritmu** licenční validace.

1. Najdi *registration check* funkci (X-ref na string "Invalid license").
2. Vstupní parametr je user-entered key string.
3. **Sledování instrukcí:**
   * `strlen(input)` — vrací delku.
   * Compare s konstantou (např. 16) → license keys jsou 16 chars.
   * `for (i=0; i<16; i++) { sum += input[i] * (i+1); }` → checksum algorithm.
   * `if (sum % 26 == expected)` → finální check.
4. **Reverz checksum algorithm** → generate valid licenses (keygen).

V real-world software se používají complex algorithms (RSA signatures, certificate validation), které jsou *lépe* odolné.

## Statická vs. dynamická analýza

Statická analýza:

| Pro | Proti |
| :--- | :--- |
| Žádné spuštění (no risk z malware) | Anti-RE techniky (packing, obfuscation) ztěžují |
| Plná kontrola, opakovatelnost | Decompiler není perfect |
| Coverage celého kódu (incl. unreachable) | Path explosion |
| Detekce dead code | Žádná runtime info (skutečné hodnoty proměnných) |

Pro full understanding je nutné kombinovat s [[dynamicka-analyza]].

---

### Videa

::: youtube "https://www.youtube.com/watch?v=CgGha_zLqlo" "Reversing Statically-Linked Binaries with Function Signatures - bin 0x2D" "LiveOverflow"
:::

*Zdroj: BZA přednášky 2025/26, BZA 11 — Reverzní inženýrství (Mazura). Externí reference: Eilam, E.: *Reversing: Secrets of Reverse Engineering* (Wiley 2005), kap. 4–6; Eagle, C.: *The IDA Pro Book* (2nd ed., No Starch Press 2011); Ghidra documentation — [ghidra-sre.org](https://ghidra-sre.org/); Radare2 documentation — [radare.org](https://www.radare.org/r/).*
