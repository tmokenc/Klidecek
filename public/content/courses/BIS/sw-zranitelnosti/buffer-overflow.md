---
title: Buffer overflow a memory corruption
---

# Buffer overflow — klasická paměťová chyba

**Buffer overflow** je nejstarší a stále nejnebezpečnější třída softwarových chyb. Poprvé dokumentován v roce **1972**. Despite decades of mitigations, *stále aktivní* — Heartbleed (2014), CVE-2024-3094 (XZ backdoor 2024), atd.

## Princip

Buffer = ohraničená paměťová oblast. Pokud zápis *přesahuje* hranice → overwrite okolních dat.

```c
char buf[8];
strcpy(buf, "AAAAAAAAAAAAAAAA");   // 16 bytes into 8-byte buffer
// Past buf bytes overwritten — adjacent data corrupted
```

Tato chyba *není* detekována C/C++ kompilátorem. Memory write is *valid* operation; just goes past end of intended buffer.

## Buffer overflow varianty

### Stack-based buffer overflow

Buffer na *stacku* (lokální proměnná). Overwrite *return address* funkce → kontrola execution flow.

```c
void vulnerable(char *input) {
    char buffer[64];
    strcpy(buffer, input);          // unchecked size
    // If input > 64 bytes, overwrites stack
}
```

Stack layout (downward growing):

```
                  | local buffer[64]    |
                  | (overflow target)   |
                  | saved ebp           |
                  | RETURN ADDRESS  ← exploit overwrites this
                  | function arguments  |
high address      | ...                 |
```

Klasický exploit:

1. Find return address slot.
2. Construct payload:
   - Padding to fill buffer.
   - New return address pointing to *shellcode*.
   - Shellcode (assembly executing `/bin/sh`).
3. Call function → return jumps to shellcode → attacker has shell.

### Heap-based buffer overflow

Buffer na *heap* (malloc/new). Overwrites heap metadata or adjacent objects.

```c
char *buf = malloc(64);
strcpy(buf, input);    // overflow corrupts heap chunks
```

Heap exploitation:

- Overwrite *function pointer* in adjacent object.
- Corrupt heap metadata → controlled writes via unlink (older glibc).
- Overwrite vtable pointer (C++).

Modern glibc adds heap hardening — safe unlinking checks, pointer mangling (PTR_MANGLE), tcache double-free detection, and chunk-size sanity checks.

### Integer overflow

```c
size_t count = atoi(input);     // attacker controls count
char *buf = malloc(count * sizeof(int));
// count * 4 may overflow int, allocating tiny buffer
for (int i = 0; i < count; i++) buf[i] = data[i];   // huge buffer overflow
```

Integer arithmetic wraps around. Resulting size *small*, but loop writes *much*.

### Off-by-one

```c
char buf[16];
for (int i = 0; i <= 16; i++) buf[i] = 'A';    // writes 17 bytes
```

Just *one* byte past buffer. Often overwrites *least significant byte* of saved frame pointer → *frame pointer overflow*.

### Format string vulnerabilities

```c
printf(user_input);          // BAD — user_input may contain %s
// Should be:
printf("%s", user_input);
```

`%n` writes value to memory address. `%s` reads from memory. Attacker controls printf arg list via format specifier.

CVE-2000-0573 (FreeBSD wu-ftpd).

## Buffer overflow demo {tier=example}

Classic example — `gets()` function.

```c
#include <stdio.h>
int main() {
    char buf[16];
    gets(buf);          // never use!
    printf("Hello %s\n", buf);
}
```

`gets()` reads *unlimited* input → overflow trivial. *Officially removed* from C11 (2011). Still in older code.

`fgets(buf, sizeof(buf), stdin)` — safe alternative.

## Shellcode

Assembly instructions that *do something useful*:

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

Result: `execve("/bin/sh", ["/bin//sh", NULL], NULL)` → shell prompt.

Shellcode databases: [shellstorm.org](http://shell-storm.org/shellcode/), Metasploit framework.

::: viz stack-bof-visualizer "Posouvej délku vstupu — sleduj, jak zápis přeteče buffer, EBP, RIP. Toggle canary / NX / ASLR — uvidíš, který mitigation co brání."
:::

## Mitigations

### Source code (best)

- **Use safer functions**: `strncpy`, `fgets`, `snprintf` (with checked sizes).
- **Use safer languages**: Rust, Go, Java, Python — eliminate buffer overflows entirely.
- **Bounds checking**: array length checks.

### Compiler hardening

- **Stack canaries** — random value before return address. Check at function exit. If overwritten → abort.
- **DEP / NX bit** — Data Execution Prevention. Stack/heap *not* executable. Shellcode on stack won't run.
- **ASLR** — Address Space Layout Randomization. Random load addresses. Attacker can't predict where to jump.

### OS hardening

- **W^X** (Write XOR Execute) — page either writable or executable, never both.
- **CFI** (Control Flow Integrity) — verify jumps go to *valid* function entries.
- **Shadow stack** — Intel CET, ARM PAuth. Separate stack for return addresses.
- **Stack-strong** (Clang) — modern stack hardening.

### Bypassing mitigations

Modern exploits bypass these:

- **ROP** (Return-Oriented Programming) — chain *existing* code "gadgets" to bypass NX.
- **JOP** (Jump-Oriented Programming).
- **Info leak + ASLR bypass** — exploit other bug to leak addresses.
- **Heap spray** — fill heap with shellcode → guess address works.

⇒ Exploit development is *cat-and-mouse* with defenders.

## Famous buffer overflow exploits {tier=example}

| CVE | Software | Year | Impact |
| :--- | :--- | :---: | :--- |
| Morris Worm | fingerd | 1988 | first internet worm |
| Code Red | IIS | 2001 | 359k systems infected |
| Slammer | SQL Server | 2003 | global internet slowdown |
| Blaster | Windows RPC | 2003 | mass infection |
| Heartbleed | OpenSSL | 2014 | read 64KB server memory |
| Stagefright | Android | 2015 | MMS-based exploit |
| EternalBlue | Windows SMB | 2017 | WannaCry, NotPetya |

## ROP — Return-Oriented Programming

Modern exploit (Shacham 2007). Since DEP prevents shellcode execution, *reuse* existing code:

1. Find *gadgets* — short sequences ending with `ret`. E.g., `pop %rax; ret`.
2. Chain gadgets via stack — each `ret` jumps to next gadget's address.
3. Setup needed registers, then call legitimate function (mprotect, execve).

Tools: ROPgadget, pwntools.

ASLR mitigates ROP. Combined info leak + ROP = modern exploit.

## Detection

### Static analysis

- **Coverity, Klocwork, Fortify** — commercial code scanners.
- **Clang static analyzer**.
- **Coccinelle, Semmle/CodeQL** — pattern-based.

Detects many but not all. False positives common.

### Dynamic analysis

- **AddressSanitizer (ASAN)** — Clang/GCC runtime checker. Inserts checks around memory ops.
- **Valgrind Memcheck** — detect uninitialized reads, double-free, out-of-bounds.
- **Fuzzing** — feed random input, catch crashes (AFL, libFuzzer, syzkaller).

### Fuzzing

```bash
afl-fuzz -i input/ -o output/ ./program @@
```

AFL+ runs `program` with random inputs, detects crashes. Modern OS fuzzing (syzkaller for Linux kernel) finds *hundreds* of bugs.

OSS-Fuzz (Google) continuously fuzzes open-source projects.

## Why still present in 2024?

- Legacy C/C++ code base — *trillions* of lines, can't rewrite all.
- New code in C/C++ for performance (kernels, browsers, embedded).
- Complex memory models — hard to get right.
- Developer errors persist.

Solution: gradual migration to *memory-safe languages*:

- **Rust** — kernel, system tools (RustLinux, Project Verona).
- **Go** — backend services.
- **Java, C#, Python** — applications.

Mozilla rewrote parts of Firefox in Rust → reduced memory safety bugs significantly.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=1S0aBV-Waeo" "Running a Buffer Overflow Attack - Computerphile" "Computerphile"
:::

*Zdroj: BIS přednášky 2025/26, Ing. Martin Očenáš, FIT VUT v Brně. Externí reference: One, A.: „Smashing The Stack For Fun And Profit" (Phrack 49, 1996, [phrack.org/issues/49/14.html](http://phrack.org/issues/49/14.html)); Shacham, H.: „The Geometry of Innocent Flesh on the Bone: Return-into-libc without Function Calls" (CCS 2007); Anderson, R.: „Security Engineering" (3rd ed., Wiley 2020), §6; [CWE-119](https://cwe.mitre.org/data/definitions/119.html); [CWE-787](https://cwe.mitre.org/data/definitions/787.html); [OWASP Buffer Overflow](https://owasp.org/www-community/vulnerabilities/Buffer_Overflow).*
