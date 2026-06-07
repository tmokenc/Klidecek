---
title: Statická analýza
---

# Statická analýza

**Statická analýza** zkoumá binární soubor *bez spuštění*. Disassembler překládá strojový kód (machine code) na assembly; dekompilátor (decompiler) zpětně vytváří přibližný zdrojový kód v C/C++; křížové reference (cross-references) a náhledy na pseudokód pomáhají reverznímu inženýrovi porozumět struktuře programu. Klíčové výhody jsou: žádné riziko spuštění škodlivého kódu (malware), plná kontrola nad analýzou a deterministické výsledky.

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

**Disassembler** převádí strojový kód (sekvenci bajtů) zpět na **assembly** instrukce. Nejde o dokonalé mapování — vznikají nejednoznačnosti (kde končí kód a začínají data, dekódování zarovnané na bajt versus posunuté).

### Nástroje

* **IDA Pro** (Interactive DisAssembler, Hex-Rays):
  * **Zlatý standard.** Komerční, $500–10 000.
  * Podporuje cca 50+ procesorových architektur (x86, x86-64, ARM, AArch64, MIPS, PowerPC, RISC-V, SH, Motorola, ...).
  * Automatická analýza: identifikuje funkce, křížové reference (cross-references), řetězce a příkazy switch.
  * **Hex-Rays Decompiler** (samostatná licence, $1000+) — zpětný převod do pseudokódu podobného jazyku C.
  * Ekosystém pluginů (FLIRT signatury, BinDiff, ...).
* **Ghidra** (NSA, open-source od roku 2019):
  * Bezplatná alternativa k IDA s podobnou funkcionalitou.
  * Postavená na Javě, skriptovatelná v Pythonu (přes Jython) i v Javě.
  * Vlastní dekompilátor (mezireprezentace P-code).
  * Multiplatformní (Win/Linux/macOS).
* **Radare2 / Cutter:**
  * Bezplatné, open-source. r2 je nástroj příkazové řádky (CLI), Cutter je grafické rozhraní v Qt.
  * Velmi výkonné, ale s prudkou křivkou učení.
  * Existuje i fork *rizin* s lepším uživatelským rozhraním.
* **Binary Ninja:**
  * Moderní, $300+. Více architektur, lepší workflow s mezijazykem IL (Intermediate Language).
* **objdump** (binutils):
  * Příkazová řádka v Linuxu. Bezplatný, základní.
  * `objdump -d -M intel binary` — rychlá kontrola.

### Příklad — workflow v IDA

1. **Otevři binárku** → automatická analýza IDA (u velkého .exe může trvat několik minut).
2. **Seznam funkcí** (F4) — výpis identifikovaných funkcí.
3. **Náhled na řetězce** (Shift+F12) — všechny tisknutelné řetězce v binárce.
4. **Náhled na importy** — importy z DLL/SO — odhalí použité API.
5. **Křížové reference** (X) — pro danou funkci ukáže, kdo ji volá.
6. **Náhled na graf** — graf toku řízení (control flow graph).
7. **Dekompilátor** (F5) — pseudo-C aktuální funkce.

## Dekompilace

**Dekompilátor (decompiler)** posune analýzu z assembly na vyšší úroveň — na pseudo-C, který se snáze čte.

### Limity dekompilace

* **Zpětný převod není dokonalý** — optimalizace překladače (compiler), inlining a alokace registrů způsobí, že vygenerovaný zdrojový kód neodpovídá originálu.
* **Typy proměnných** jsou často odhadnuty heuristicky (sizeof = 4? jde o int, nebo float?).
* **Struktury** vyžadují ruční identifikaci a definici.
* **Hierarchie tříd** v C++ jsou obtížné (vtables, RTTI).
* **Optimalizace překladače** (rozbalení smyček, inlining funkcí) komplikují obnovu kódu.

### Příklad IDA Hex-Rays

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

Dekompilace v Hex-Rays:

```c
int __cdecl sum(int a, int b)
{
    int result; // [ebp-4]
    result = a + b;
    return result;
}
```

U typického komerčního softwaru dá dekompilátor 60–80 % čitelného kódu; zbytek vyžaduje ruční analýzu (zejména SIMD instrukce, vlastní konvence volání a triky proti reverznímu inženýrství).

## Pattern matching

* **FLIRT signatury** (IDA) — identifikují *standardní knihovny* (libc, MSVCRT, OpenSSL) v binárce → tisíce funkcí se automaticky pojmenují.
* **YARA pravidla** — vzory řetězců a bajtů pro klasifikaci malware. Klíčový nástroj v oblasti threat intelligence.
* **BinDiff** (Google) — porovnání dvou binárek; identifikuje, *které funkce se změnily* mezi verzemi. Klíčové pro **patch diffing** (vývoj 1-day exploitů).
* **Diaphora** (bezplatná alternativa k BinDiff) pro IDA.

## Statické analyzátory pro bezpečnost

* **Cppcheck** — pro zdrojový kód.
* **Coverity, Klocwork, Fortify** — komerční SAST (Static Application Security Testing, statické testování bezpečnosti aplikací).
* **GCC -fanalyzer** / **clang static analyzer** — open source.
* **CodeQL** (GitHub) — sémantická analýza kódu.

Tyto nástroje cílí na *zdrojový kód*; pro analýzu *binárky* se používají pluginy do IDA nebo skripty pro Ghidru.

## Obnova symbolů

* **Stripped binárky** — bez ladicích informací, symbolů a názvů funkcí. Standard pro komerční vydání.
* **Debug buildy** — se symboly (PDB na Windows, DWARF na Linuxu/macOS).
* **Techniky obnovy symbolů:**
  * **FLIRT signatury knihoven** — identifikují známé funkce.
  * **Obnova typů** přes propagaci (sizeof, vzory použití).
  * **Reference na řetězce** → odhad názvů funkcí ("decryption_key", "auth_failed").
  * **Sledování přes známá volání API** — Windows API, systémová volání POSIX.

## Formát souboru

Reverzní inženýr musí porozumět **binárním formátům souborů**:

* **PE** (Portable Executable) — Windows EXE/DLL.
* **ELF** (Executable and Linkable Format) — Linux/Unix.
* **Mach-O** — macOS/iOS.
* **APK** / **DEX** — Android.
* **IPA** — iOS.
* **HEX / SREC** — obrazy firmwaru mikrokontrolérů.

Klíčové sekce:
* **`.text`** — segment kódu.
* **`.data`** — inicializovaná data.
* **`.bss`** — neinicializovaná (nulová) data.
* **`.rodata`** — data jen pro čtení (řetězce, konstanty).
* **`.plt` / `.got`** — Procedure Linkage Table, Global Offset Table (dynamické linkování).
* **`.dynsym` / `.dynstr`** — dynamické symboly (linkované knihovny).

Nástroje:
* **objdump -h** — hlavičky sekcí.
* **readelf -a** — analyzátor ELF.
* **PE-Explorer** / **CFF Explorer** — formát PE.
* **otool** — Mach-O.

## Příklad — extrakce natvrdo zakódovaných klíčů {tier=example}

Klasická úloha: najít AES klíč v IoT firmwaru.

1. **objdump -d firmware.bin > disasm.txt** — disassembluj.
2. **strings firmware.bin | grep -iE "key|aes|secret"** — nápověda z řetězců.
3. V IDA: **křížové reference** na *AES funkci* (např. operace SubBytes s konstantou S-box).
4. **Vystopuj** parametr s klíčem zpět:
   * Identifikuj volání `AES_KeySchedule(key)`.
   * Parametr **R0/RDI** je ukazatel (pointer) na klíč.
   * Křížová reference: kdo tuto funkci volá.
5. **Aliasing řetězců** — v sekci `.rodata` najdi sekvenci bajtů, která odpovídá klíči (typicky zarovnání na 16/32 bajtů).

V open-source IoT firmwaru (router) lze AES klíče běžně najít ve **flash dumpu**.

## Příklad — reverz algoritmu {tier=example}

Klasická úloha: rekonstrukce **algoritmu** licenční validace.

1. Najdi funkci *kontroly registrace* (X-ref na řetězec "Invalid license").
2. Vstupním parametrem je řetězec klíče zadaný uživatelem.
3. **Sledování instrukcí:**
   * `strlen(input)` — vrací délku.
   * Porovnání s konstantou (např. 16) → licenční klíče mají 16 znaků.
   * `for (i=0; i<16; i++) { sum += input[i] * (i+1); }` → algoritmus výpočtu kontrolního součtu (checksum).
   * `if (sum % 26 == expected)` → finální kontrola.
4. **Reverz algoritmu kontrolního součtu** → generování platných licencí (keygen).

V reálném softwaru se používají složité algoritmy (RSA podpisy, validace certifikátů), které jsou *odolnější*.

## Statická vs. dynamická analýza

Statická analýza:

| Pro | Proti |
| :--- | :--- |
| Žádné spuštění (žádné riziko z malware) | Techniky proti reverznímu inženýrství (packing, obfuskace) ji ztěžují |
| Plná kontrola, opakovatelnost | Dekompilátor není dokonalý |
| Pokrytí celého kódu (vč. nedosažitelného) | Exploze cest (path explosion) |
| Detekce mrtvého kódu (dead code) | Žádné informace za běhu (skutečné hodnoty proměnných) |

Pro úplné porozumění je nutné kombinovat ji s [[dynamicka-analyza]].

---

### Videa

::: youtube "https://www.youtube.com/watch?v=CgGha_zLqlo" "Reversing Statically-Linked Binaries with Function Signatures - bin 0x2D" "LiveOverflow"
:::

*Zdroj: BZA přednášky 2025/26, BZA 11 — Reverzní inženýrství (Mazura). Externí reference: Eilam, E.: *Reversing: Secrets of Reverse Engineering* (Wiley 2005), kap. 4–6; Eagle, C.: *The IDA Pro Book* (2nd ed., No Starch Press 2011); Ghidra documentation — [ghidra-sre.org](https://ghidra-sre.org/); Radare2 documentation — [radare.org](https://www.radare.org/r/).*
