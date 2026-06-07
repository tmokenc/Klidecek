---
title: Souběhy (race conditions), TOCTOU a časové zranitelnosti
---

# Souběhy (race conditions) a TOCTOU

**Souběh (race condition)** = systém se chová *neočekávaně* v závislosti na *pořadí* nebo *načasování* paralelních operací. **TOCTOU** (Time-Of-Check Time-Of-Use, tedy „čas kontroly – čas použití") je speciální případ — okamžik kontroly a okamžik použití se *liší*, a mezi nimi se může stav změnit.

Toto téma souvisí s [[false-sharing-races]] (předmět AVS, pohled z hlediska výkonu), ale v BIS na ně nahlížíme z *bezpečnostního* hlediska.

## Základy souběhů

```c
// Two threads:
if (balance >= 100) {        // T1 checks
    // T2 also passes check here
    balance -= 100;          // T1 deducts
    // T2 also deducts → balance now -100 (overdraft)
}
```

Bez zámků (locks): obě vlákna (threads) přečtou starý zůstatek, obě projdou kontrolou a obě provedou odečet → výsledek je záporný.

Obrana: zámky (locks) a atomické operace ([[locks-openmp]]).

## TOCTOU — Time-Of-Check Time-Of-Use

Nejčastější bezpečnostní souběh. Nejprve ověříme nějakou vlastnost a *poté* na základě toho jednáme. Mezi *kontrolou* a *použitím* útočník (attacker) změní stav.

### Klasický příklad: souběh nad souborem

```c
if (access(filename, R_OK) == 0) {     // CHECK: do I have read permission?
    // ... attacker swaps file via symlink ...
    fd = open(filename, O_RDONLY);     // USE: open it
    read(fd, buf, size);               // read whatever it points to NOW
}
```

Útočník pomocí `inotify` zachytí volání `access`. Mezi `access()` a `open()` nahradí soubor `filename` symbolickým odkazem (symlink) na `/etc/shadow`.

Volání `access()` kontroluje efektivní UID (u suid programu → nemá přístup), poté útočník vymění symlink. Volání `open()` pak otevře `/etc/shadow` s efektivním UID (ten už přístup má, protože jde o suid program).

Výsledkem je eskalace privilegií (privilege escalation). Suid program přečte `/etc/shadow` a vypíše jej útočníkovi.

### Obrana

#### Použít atomické operace

```c
fd = open(filename, O_RDONLY);          // open first
fstat(fd, &st);                          // then check via fd
if (st.st_uid == getuid()) ...
```

Volání `fstat(fd, ...)` pracuje nad *deskriptorem souboru (file descriptor)*, který je svázán s konkrétním souborem už v okamžiku otevření. I když útočník soubor vymění, *my už máme deskriptor na původní soubor*.

#### Zahodit privilegia

```c
setuid(getuid());           // drop to real UID
open(filename, ...);        // open with real privileges
```

Suid programy by měly privilegia zahodit co nejdříve. I kdyby pak došlo ke zneužití souběhu, útočník získá pouze privilegia běžného uživatele.

#### O_NOFOLLOW

```c
fd = open(filename, O_RDONLY | O_NOFOLLOW);    // fail if symlink
```

Nenásledovat symbolické odkazy. Tím se zmírní TOCTOU založené na symlincích.

::: viz toctou-timeline "Krokuj přes access() → výměna symlinku (útočník) → open() → read(). Zapni O_NOFOLLOW / zahození privilegií / open+fstat — uvidíš, která obrana útok zruší."
:::

## Souběhy nad symbolickými odkazy (symlink races)

Specifický případ TOCTOU:

```c
unlink("/tmp/myfile");          // attacker creates symlink to victim file
mknod("/tmp/myfile", ...);      // creates node, may follow symlink → file written elsewhere
```

Časté u privilegovaných programů, které zapisují do `/tmp`.

### Obrana

- Použít `O_NOFOLLOW`, `O_CREAT | O_EXCL`.
- Pro dočasné soubory použít `mkstemp()` (vytvoří soubor s náhodným jménem a s příznakem výlučného vytvoření).
- Vyhnout se `/tmp` u citlivých operací; použít vlastní soukromý dočasný adresář.

## Souběhy nad deskriptory souborů (file descriptor races)

Deskriptory souborů jsou v Linuxu *malá celá čísla*. Souběh může vzniknout mezi zavřením a opětovným otevřením:

```c
fd = open(...);
// later:
close(fd);
// attacker may grab same fd number via separate operation
write(fd, secret, ...);    // writes to attacker's file
```

Obrana: nepoužívat neaktuální (zastaralé) deskriptory; po zavření je vynulovat.

## Vyčerpání zdrojů (resource exhaustion)

```c
while (1) {
    fd = open("file");
    if (fd < 0) break;     // out of fds
    // ... use ...
}
```

Útočník spustí procesy, které spotřebují deskriptory souborů, paměť nebo počet rour (pipe) → legitimní programy pak selžou.

Obrana: omezování rychlosti (rate limiting), kvóty na zdroje (rlimit, cgroups).

## Souběhy na úrovni procesů

### Setuid + fork

```c
setuid(0);                  // now root
pid = fork();
if (pid == 0) {
    setuid(getuid());       // drop to user
    execve("/some/binary", ...);
} else {
    // attacker may signal child before setuid completes?
}
```

Souběh při zahazování privilegií pomocí setuid. Klasický příklad.

### Souběhy v obsluze signálů (signal handler races)

```c
volatile int flag = 0;
void handler(int sig) {
    flag = 1;
}
signal(SIGINT, handler);
while (!flag) ...
```

Obsluhy signálů běží *asynchronně*. Mnoho funkcí *není* bezpečných pro volání ze signálu (async-signal-safe), například `malloc` nebo `printf`. Souběh v obsluze signálu pak vede k nedefinovanému chování.

Obrana: v obsluze signálu používat pouze funkce bezpečné pro volání ze signálu (async-signal-safe). Pro příznaky používat typ `sig_atomic_t`.

## Uváznutí (deadlock)

Dvě vlákna, dva zámky, opačné pořadí:

```
T1: lock(A); lock(B);
T2: lock(B); lock(A);
```

Vlákno T1 drží A a čeká na B. Vlákno T2 drží B a čeká na A. Navždy zaseknuto.

Obrana: globální pořadí zamykání, neblokující pokus o zámek (try-lock) s opakováním, detekce uváznutí.

Nejde sice striktně o *bezpečnostní* problém, ale jde o odepření služby (DoS) — útočník může uváznutí vyvolat schválně, aby zastavil službu.

## Souběhové zranitelnosti z praxe {tier=example}

| CVE | Popis |
| :--- | :--- |
| CVE-2016-5195 | Dirty COW — souběh v paměti linuxového jádra → eskalace privilegií |
| CVE-2018-1000805 | Souběh v SSH klientu Paramiko |
| CVE-2019-1162 | Souběh ve Windows DNS serveru |
| CVE-2022-2588 | Souběh v linuxovém nft_object |
| CVE-2023-2640 | Souběh v Ubuntu OverlayFS |

V linuxovém jádře se souběhové CVE objevují neustále — *miliony* řádků kódu, vše souběžné a obtížně ověřitelné.

## Souběžné datové struktury

Programování bez zámků (lock-free) je nebezpečné. Při chybném použití → souběhy.

### Bezzámkový čítač (správně)

```c
__atomic_add_fetch(&counter, 1, __ATOMIC_SEQ_CST);
```

### Špatný způsob

```c
counter++;     // not atomic
```

### Smyčka s CAS (správně)

```c
int old, new;
do {
    old = counter;
    new = old + 1;
} while (!__atomic_compare_exchange_n(&counter, &old, new, ...));
```

Bezzámkové fronty a hashovací tabulky jsou ještě obtížnější. Použijte osvědčené knihovny (Folly, Boost.Lockfree), nebo zůstaňte u zámků.

## Detekce

### Statická analýza

- **ThreadSanitizer (TSAN)** — pro Clang/GCC. Detekce souběhů za běhu (runtime). Pomalé (zpomalení 5–15×).
- **Helgrind** (Valgrind) — detekce souběhů.
- **Coverity, CodeQL** — statická analýza založená na vzorech.

```bash
clang -fsanitize=thread -g app.c -o app
./app
# Output: warnings on detected races
```

### Fuzzing souběžnosti

- **syzkaller** — fuzzer linuxového jádra, nachází souběhové CVE.
- **TXIT** — generátor souběžných testů.

Souběhy se obtížně fuzzují, protože závisejí na načasování. Jsou na ně potřeba specializované nástroje.

### Revize kódu (code review)

Zaměřte se na:

- Sdílený stav mezi vlákny.
- Pořadí získávání zámků.
- Obsluhy signálů.
- Operace nad soubory na sdílených cestách.

## Obranné vzory

### Uzavřít stav (confine state)

Jednovláknové moduly, které spolu komunikují přes fronty zpráv. Příkladem je Erlang nebo model aktorů (Actor model).

### Neměnná data (immutable data)

Funkcionální přístup. Data se *nemohou* změnit → žádný souběh není možný.

### Optimistické řízení souběžnosti (optimistic concurrency control)

Přečteme snímek (snapshot) dat, upravíme jej a *zkontrolujeme*, zda se mezitím nezměnil. Pokud ne, změnu potvrdíme; pokud ano, zopakujeme.

Používá se v: databázích (MVCC), Gitu (commity), Wikipedii (konflikty úprav).

### Pesimistické řízení souběžnosti (pessimistic concurrency control)

Zamknout před přístupem. Pomalejší, ale bezpečnější.

---

*Zdroj: BIS přednášky 2025/26, Ing. Martin Očenáš, FIT VUT v Brně. Externí reference: Bishop, M., Dilger, M.: „Checking for Race Conditions in File Accesses" (Comp. Systems 9(2), 1996); Wei, J., Pu, C.: „Modeling and Preventing TOCTTOU Vulnerabilities in Unix-Style File Systems" (DSN 2008); Anderson, R.: „Security Engineering" (3rd ed., Wiley 2020), §6; [CWE-362](https://cwe.mitre.org/data/definitions/362.html) Race Condition; [CWE-367](https://cwe.mitre.org/data/definitions/367.html) TOCTOU; Lu, S. et al.: „Learning from Mistakes — A Comprehensive Study on Real World Concurrency Bug Characteristics" (ASPLOS 2008).*
