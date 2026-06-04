---
title: Race conditions, TOCTOU a temporal vulnerabilities
---

# Race conditions a TOCTOU

**Race condition** = systém má *neočekávané chování* závisející na *pořadí* nebo *načasování* paralelních operací. **TOCTOU** (Time-Of-Check Time-Of-Use) je speciální případ — kontrola a použití se *liší*.

Spojené s [[false-sharing-races]] (AVS, performance angle), ale BIS pohled je *bezpečnostní*.

## Race condition basics

```c
// Two threads:
if (balance >= 100) {        // T1 checks
    // T2 also passes check here
    balance -= 100;          // T1 deducts
    // T2 also deducts → balance now -100 (overdraft)
}
```

Bez locks: oba thready přečtou starou balance, oba pass check, oba deduct → result negative.

Defense: locks, atomic ops ([[locks-openmp]]).

## TOCTOU — Time-Of-Check Time-Of-Use

Most common security race. Verify a property, *then* act on it. Between *check* and *use* attacker changes state.

### Classic example: file race

```c
if (access(filename, R_OK) == 0) {     // CHECK: do I have read permission?
    // ... attacker swaps file via symlink ...
    fd = open(filename, O_RDONLY);     // USE: open it
    read(fd, buf, size);               // read whatever it points to NOW
}
```

Attacker uses `inotify` to detect access call. Between `access()` and `open()`, replaces `filename` with symlink to `/etc/shadow`.

`access()` checks effective UID (suid program → no), then attacker swaps symlink. `open()` opens `/etc/shadow` with effective UID (yes, suid).

Result: privilege escalation. Suid program reads `/etc/shadow` and prints to attacker.

### Defense

#### Use atomic operations

```c
fd = open(filename, O_RDONLY);          // open first
fstat(fd, &st);                          // then check via fd
if (st.st_uid == getuid()) ...
```

`fstat(fd, ...)` operates on *file descriptor*, which is bound at open time. Even if attacker swaps file, *we already have fd to original*.

#### Drop privileges

```c
setuid(getuid());           // drop to real UID
open(filename, ...);        // open with real privileges
```

Suid programs should *drop* privileges early. Even if race exploited, attacker gets only real user's privileges.

#### O_NOFOLLOW

```c
fd = open(filename, O_RDONLY | O_NOFOLLOW);    // fail if symlink
```

Don't follow symlinks. Mitigates symlink-based TOCTOU.

::: viz toctou-timeline "Step skrz access() → swap symlink (attacker) → open() → read(). Zapni O_NOFOLLOW / drop priv / open+fstat — uvidíš, který defense útok zruší."
:::

## Symlink races

Specific TOCTOU:

```c
unlink("/tmp/myfile");          // attacker creates symlink to victim file
mknod("/tmp/myfile", ...);      // creates node, may follow symlink → file written elsewhere
```

Common in privileged programs writing /tmp.

### Defense

- Use `O_NOFOLLOW`, `O_CREAT | O_EXCL`.
- Use `mkstemp()` for temp files (creates with random name + exclusive flag).
- Avoid `/tmp` for sensitive ops; use private temp dir.

## File descriptor races

Linux file descriptors are *small integers*. Race between close and reopen:

```c
fd = open(...);
// later:
close(fd);
// attacker may grab same fd number via separate operation
write(fd, secret, ...);    // writes to attacker's file
```

Defense: don't use stale FDs; close + nullify.

## Resource exhaustion

```c
while (1) {
    fd = open("file");
    if (fd < 0) break;     // out of fds
    // ... use ...
}
```

Attacker spawns processes consuming FDs / memory / pipe count → legit programs fail.

Defense: rate limiting, resource quotas (rlimit, cgroups).

## Process-level races

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

Race in setuid drop. Classic example.

### Signal handler races

```c
volatile int flag = 0;
void handler(int sig) {
    flag = 1;
}
signal(SIGINT, handler);
while (!flag) ...
```

Signal handlers run *asynchronously*. Many functions *not* async-signal-safe (`malloc`, `printf`). Race in handler → undefined behavior.

Defense: only async-signal-safe functions in handler. Use `sig_atomic_t` for flags.

## Deadlock

Two threads, two locks, opposite order:

```
T1: lock(A); lock(B);
T2: lock(B); lock(A);
```

T1 holds A, waits B. T2 holds B, waits A. Forever stuck.

Defense: global lock ordering, try-lock + backoff, deadlock detection.

Not strictly *security* issue, but DoS — attacker triggers deadlock to halt service.

## Real-world race vulnerabilities {tier=example}

| CVE | Description |
| :--- | :--- |
| CVE-2016-5195 | Dirty COW — Linux kernel memory race → privilege escalation |
| CVE-2018-1000805 | Paramiko SSH client race |
| CVE-2019-1162 | Windows DNS server race |
| CVE-2022-2588 | Linux nft_object race |
| CVE-2023-2640 | Ubuntu OverlayFS race |

Linux kernel has ongoing race CVEs — *millions* of LOC, concurrent, hard to verify.

## Concurrent data structures

Lock-free programming hazardous. Misuse → race conditions.

### Lock-free counter (correct)

```c
__atomic_add_fetch(&counter, 1, __ATOMIC_SEQ_CST);
```

### Wrong way

```c
counter++;     // not atomic
```

### CAS loop (correct)

```c
int old, new;
do {
    old = counter;
    new = old + 1;
} while (!__atomic_compare_exchange_n(&counter, &old, new, ...));
```

Lock-free queues, hash tables — even harder. Use proven libraries (Folly, Boost.Lockfree) or stick with locks.

## Detection

### Static analysis

- **ThreadSanitizer (TSAN)** — Clang/GCC. Runtime detection of races. Slow (5-15× slowdown).
- **Helgrind** (Valgrind) — race detection.
- **Coverity, CodeQL** — pattern-based static.

```bash
clang -fsanitize=thread -g app.c -o app
./app
# Output: warnings on detected races
```

### Fuzzing concurrency

- **syzkaller** — Linux kernel fuzzer, finds race CVEs.
- **TXIT** — concurrent test generator.

Race conditions hard to fuzz because timing-dependent. Specialized tools.

### Code review

Focus on:

- Shared state between threads.
- Lock acquire order.
- Signal handlers.
- File operations on shared paths.

## Defense patterns

### Confine state

Single-threaded modules. Communicate via message queues. Erlang, Actor model.

### Immutable data

Functional approach. Data *cannot* change → no race possible.

### Optimistic concurrency control

Read snapshot, modify, *check* if unchanged. If yes, commit; if no, retry.

Used in: databases (MVCC), Git (commits), Wikipedia (edit conflicts).

### Pessimistic concurrency control

Lock before access. Slower, but safer.

---

*Zdroj: BIS přednášky 2025/26, Ing. Martin Očenáš, FIT VUT v Brně. Externí reference: Bishop, M., Dilger, M.: „Checking for Race Conditions in File Accesses" (Comp. Systems 9(2), 1996); Wei, J., Pu, C.: „Modeling and Preventing TOCTTOU Vulnerabilities in Unix-Style File Systems" (DSN 2008); Anderson, R.: „Security Engineering" (3rd ed., Wiley 2020), §6; [CWE-362](https://cwe.mitre.org/data/definitions/362.html) Race Condition; [CWE-367](https://cwe.mitre.org/data/definitions/367.html) TOCTOU; Lu, S. et al.: „Learning from Mistakes — A Comprehensive Study on Real World Concurrency Bug Characteristics" (ASPLOS 2008).*
