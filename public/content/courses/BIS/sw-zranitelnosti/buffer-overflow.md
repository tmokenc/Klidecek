---
title: Buffer overflow a poškození paměti
---

# Buffer overflow — klasická paměťová chyba

**Buffer overflow** (přetečení bufferu) je nejstarší a stále nejnebezpečnější třída softwarových chyb. Poprvé byl zdokumentován v roce **1972**. Navzdory desítkám let obranných opatření je *stále aktivní* — Heartbleed (2014), CVE-2024-3094 (backdoor v XZ z roku 2024) a další.

## Princip

Buffer (vyrovnávací paměť) je ohraničená paměťová oblast. Pokud zápis *přesáhne* její hranice, dojde k přepsání okolních dat.

```c
char buf[8];
strcpy(buf, "AAAAAAAAAAAAAAAA");   // 16 bytes into 8-byte buffer
// Past buf bytes overwritten — adjacent data corrupted
```

Tuto chybu C/C++ překladač (compiler) *neodhalí*. Zápis do paměti je z jeho pohledu *platná* operace; jen zasahuje za konec zamýšleného bufferu.

## Varianty buffer overflow

### Buffer overflow na zásobníku (stack-based)

Buffer je umístěn na *zásobníku* (stack), tedy jako lokální proměnná. Přepsáním *návratové adresy* (return address) funkce získá útočník kontrolu nad tokem vykonávání programu.

```c
void vulnerable(char *input) {
    char buffer[64];
    strcpy(buffer, input);          // unchecked size
    // If input > 64 bytes, overwrites stack
}
```

Rozložení zásobníku (roste směrem dolů):

```
                  | local buffer[64]    |
                  | (overflow target)   |
                  | saved ebp           |
                  | RETURN ADDRESS  ← exploit overwrites this
                  | function arguments  |
high address      | ...                 |
```

Klasické zneužití (exploit):

1. Najdi pozici (slot) s návratovou adresou.
2. Sestav payload (datovou nálož):
   - Výplň (padding), která zaplní buffer.
   - Novou návratovou adresu mířící na *shellcode*.
   - Shellcode (assemblerový kód spouštějící `/bin/sh`).
3. Při volání funkce návrat skočí na shellcode → útočník (attacker) získá shell.

### Buffer overflow na haldě (heap-based)

Buffer je umístěn na *haldě* (heap), tedy alokovaný přes malloc/new. Přetečení přepíše metadata haldy nebo sousední objekty.

```c
char *buf = malloc(64);
strcpy(buf, input);    // overflow corrupts heap chunks
```

Zneužití haldy:

- Přepsání *ukazatele na funkci* (function pointer) v sousedním objektu.
- Poškození metadat haldy → řízené zápisy přes operaci unlink (u starších verzí glibc).
- Přepsání ukazatele na vtable (tabulku virtuálních metod) v C++.

Moderní glibc přidává zpevnění haldy (hardening) — bezpečnostní kontroly při operaci unlink, maskování ukazatelů (PTR_MANGLE), detekci dvojího uvolnění v tcache (double-free) a kontroly smysluplnosti velikosti chunků.

### Přetečení celého čísla (integer overflow)

```c
size_t count = atoi(input);     // attacker controls count
char *buf = malloc(count * sizeof(int));
// count * 4 may overflow int, allocating tiny buffer
for (int i = 0; i < count; i++) buf[i] = data[i];   // huge buffer overflow
```

Celočíselná aritmetika se přetočí (wrap around). Výsledná velikost vyjde *malá*, ale smyčka zapisuje *mnohem více* dat.

### Chyba o jedničku (off-by-one)

```c
char buf[16];
for (int i = 0; i <= 16; i++) buf[i] = 'A';    // writes 17 bytes
```

Zápis přesahuje buffer jen o *jediný* bajt. Často přepíše *nejméně významný bajt* uloženého ukazatele na rámec (frame pointer) → *přetečení ukazatele na rámec* (frame pointer overflow).

### Zranitelnosti formátovacích řetězců (format string vulnerabilities)

```c
printf(user_input);          // BAD — user_input may contain %s
// Should be:
printf("%s", user_input);
```

Specifikátor `%n` zapíše hodnotu na adresu v paměti, `%s` z paměti čte. Útočník tak skrze formátovací specifikátor ovládá seznam argumentů funkce printf.

CVE-2000-0573 (FreeBSD wu-ftpd).

## Ukázka buffer overflow {tier=example}

Klasický příklad — funkce `gets()`.

```c
#include <stdio.h>
int main() {
    char buf[16];
    gets(buf);          // never use!
    printf("Hello %s\n", buf);
}
```

`gets()` načítá *neomezený* vstup → přetečení je triviální. Z jazyka C byla *oficiálně odstraněna* v normě C11 (2011). Ve starším kódu se ale stále vyskytuje.

`fgets(buf, sizeof(buf), stdin)` je bezpečná alternativa.

## Shellcode

Instrukce v assembleru, které *udělají něco užitečného*:

```assembly
xor eax, eax       ; clear eax
push eax           ; null terminator
push 0x68732f2f    ; "//sh"
push 0x6e69622f    ; "/bin"
mov ebx, esp       ; address of "/bin//sh"
push eax           ; null
push ebx           ; arg
mov ecx, esp       ; argv
mov al, 0xb        ; execve syscall
int 0x80           ; trigger
```

Výsledek: `execve("/bin/sh", ["/bin//sh", NULL], NULL)` → příkazová řádka shellu.

Databáze shellcodů: [shellstorm.org](http://shell-storm.org/shellcode/), framework Metasploit.

::: viz stack-bof-visualizer "Posouvej délku vstupu — sleduj, jak zápis přeteče buffer, EBP, RIP. Toggle canary / NX / ASLR — uvidíš, který mitigation co brání."
:::

## Obranná opatření (mitigations)

### Úroveň zdrojového kódu (nejlepší)

- **Používej bezpečnější funkce**: `strncpy`, `fgets`, `snprintf` (s kontrolovanou velikostí).
- **Používej bezpečnější jazyky**: Rust, Go, Java, Python — ty buffer overflow zcela eliminují.
- **Kontrola hranic** (bounds checking): kontrola délky polí.

### Zpevnění na úrovni překladače (compiler hardening)

- **Stack canaries** — náhodná hodnota umístěná před návratovou adresu. Při ukončení funkce se kontroluje. Pokud byla přepsána → program se ukončí.
- **DEP / NX bit** — Data Execution Prevention (zabránění vykonání dat). Zásobník i halda jsou *nespustitelné*. Shellcode na zásobníku se nespustí.
- **ASLR** — Address Space Layout Randomization (náhodné rozmístění adresního prostoru). Adresy zavádění jsou náhodné, takže útočník nedokáže předvídat, kam skočit.

### Zpevnění na úrovni operačního systému (OS hardening)

- **W^X** (Write XOR Execute) — stránka je buď zapisovatelná, nebo spustitelná, nikdy obojí zároveň.
- **CFI** (Control Flow Integrity, integrita toku řízení) — ověřuje, že skoky míří na *platné* vstupní body funkcí.
- **Shadow stack** (stínový zásobník) — Intel CET, ARM PAuth. Oddělený zásobník pouze pro návratové adresy.
- **Stack-strong** (Clang) — moderní zpevnění zásobníku.

### Obcházení obranných opatření

Moderní exploity tato opatření obcházejí:

- **ROP** (Return-Oriented Programming) — řetězí *existující* úseky kódu („gadgets"), aby obešel NX.
- **JOP** (Jump-Oriented Programming).
- **Únik informací + obejití ASLR** — využije jinou chybu k získání adres.
- **Heap spray** — zaplaví haldu shellcodem → uhodnutí adresy pak vyjde.

⇒ Vývoj exploitů je *hra na kočku a myš* s obránci.

## Slavné exploity zneužívající buffer overflow {tier=example}

| CVE | Software | Rok | Dopad |
| :--- | :--- | :---: | :--- |
| Morris Worm | fingerd | 1988 | první internetový červ |
| Code Red | IIS | 2001 | nakaženo 359 tisíc systémů |
| Slammer | SQL Server | 2003 | globální zpomalení internetu |
| Blaster | Windows RPC | 2003 | masová nákaza |
| Heartbleed | OpenSSL | 2014 | čtení 64 KB paměti serveru |
| Stagefright | Android | 2015 | zneužití přes MMS |
| EternalBlue | Windows SMB | 2017 | WannaCry, NotPetya |

## ROP — Return-Oriented Programming

Moderní exploit (Shacham 2007). Protože DEP brání spuštění shellcodu, *znovu se použije* existující kód:

1. Najdi *gadgety* — krátké sekvence končící instrukcí `ret`. Například `pop %rax; ret`.
2. Zřetěz gadgety přes zásobník — každé `ret` skočí na adresu dalšího gadgetu.
3. Nastav potřebné registry a poté zavolej legitimní funkci (mprotect, execve).

Nástroje: ROPgadget, pwntools.

ASLR ztěžuje ROP. Kombinace úniku informací a ROP = moderní exploit.

## Detekce

### Statická analýza

- **Coverity, Klocwork, Fortify** — komerční nástroje pro analýzu kódu.
- **Statický analyzátor Clangu**.
- **Coccinelle, Semmle/CodeQL** — založené na porovnávání vzorů (pattern matching).

Odhalí mnoho chyb, ale ne všechny. Časté jsou falešně pozitivní nálezy.

### Dynamická analýza

- **AddressSanitizer (ASAN)** — kontrolor za běhu (runtime) pro Clang/GCC. Vkládá kontroly kolem operací s pamětí.
- **Valgrind Memcheck** — odhalí čtení neinicializované paměti, dvojí uvolnění (double-free) a zápisy mimo meze.
- **Fuzzing** — krmí program náhodnými vstupy a zachytává pády (AFL, libFuzzer, syzkaller).

### Fuzzing

```bash
afl-fuzz -i input/ -o output/ ./program @@
```

AFL+ spouští `program` s náhodnými vstupy a detekuje pády. Moderní fuzzing operačních systémů (syzkaller pro jádro Linuxu) najde *stovky* chyb.

OSS-Fuzz (Google) průběžně fuzzuje open-source projekty.

## Proč je tato chyba i v roce 2024 stále přítomná?

- Zděděná kódová základna v C/C++ — *biliony* řádků, nelze je přepsat všechny.
- Nový kód se píše v C/C++ kvůli výkonu (performance) — jádra, prohlížeče, vestavěné systémy.
- Složité paměťové modely — je obtížné je zvládnout správně.
- Chyby vývojářů přetrvávají.

Řešení: postupný přechod na *paměťově bezpečné jazyky*:

- **Rust** — jádra, systémové nástroje (Rust v Linuxu, Project Verona).
- **Go** — backendové služby.
- **Java, C#, Python** — aplikace.

Mozilla přepsala části Firefoxu do Rustu → výrazně tím snížila počet chyb v bezpečnosti paměti.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=1S0aBV-Waeo" "Running a Buffer Overflow Attack - Computerphile" "Computerphile"
:::

*Zdroj: BIS přednášky 2025/26, Ing. Martin Očenáš, FIT VUT v Brně. Externí reference: One, A.: „Smashing The Stack For Fun And Profit" (Phrack 49, 1996, [phrack.org/issues/49/14.html](http://phrack.org/issues/49/14.html)); Shacham, H.: „The Geometry of Innocent Flesh on the Bone: Return-into-libc without Function Calls" (CCS 2007); Anderson, R.: „Security Engineering" (3rd ed., Wiley 2020), §6; [CWE-119](https://cwe.mitre.org/data/definitions/119.html); [CWE-787](https://cwe.mitre.org/data/definitions/787.html); [OWASP Buffer Overflow](https://owasp.org/www-community/vulnerabilities/Buffer_Overflow).*
