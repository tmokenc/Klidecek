---
title: Hardware vulnerabilities — Spectre, Meltdown, Rowhammer
---

# Hardware-level zranitelnosti — Spectre, Meltdown, Rowhammer

Software-level zranitelnosti ([[buffer-overflow]], [[injekce-utoky]]) řeší *implementační chyby*. **Hardware vulnerabilities** jsou *fundamental flaws* v CPU/RAM designu — *nelze* fix v softwaru beze ztráty výkonu.

## Spectre (2018)

Spectre využívá **spekulativní vykonávání** ([[spekulace-vyjimky]]) v moderních OoO CPU.

### Princip

CPU spekuluje *za* podmíněný skok. Pokud spekulace špatná, výsledky se *zruší* — ale *cache effects* zůstávají.

```c
if (x < array1_size) {
    y = array2[array1[x] * 256];   // attacker forces x out of bounds
}
```

1. Attacker trains predictor: typical `x < array1_size` → true.
2. Attacker calls with `x` out of bounds → `array1[x]` = secret (e.g., kernel memory).
3. CPU speculatively loads `array2[secret * 256]` into L1 cache.
4. Branch resolves: actually `x >= array1_size` → discard.
5. Cache *retains* line at `array2 + secret * 256`.
6. Attacker times reads from various indices into array2 — finds *fast* one → reveals secret.

### Spectre v1 (CVE-2017-5753)

Bounds check bypass. As above.

### Spectre v2 (CVE-2017-5715)

Branch target injection. Attacker trains *BTB* (branch target buffer) → cross-process speculation jumps to attacker-controlled gadget.

### Mitigations

- **Retpoline** — compiler replaces indirect branches with safe alternatives.
- **IBRS / IBPB** — Intel microcode controls (flush BTB).
- **STIBP** — Single Thread Indirect Branch Predictors.
- **LFENCE** — explicit barrier in critical code.
- **Kernel hardening** — Linux kernel patches.

Performance cost: 5-30 % depending on workload. Database, kernel-heavy workloads worst.

::: viz spectre-cache-timing "Step skrz training → speculative OOB load → squash → FLUSH+RELOAD probe. Histogram timing odhalí leaked byte — cache stopa přežije rollback."
:::

## Meltdown (CVE-2017-5754)

Specific to Intel CPUs (and some ARM). Permission check *after* speculative load:

```c
*(volatile char *)kernel_address;   // attacker, normally page fault
// But CPU speculatively loads byte
// Uses byte to index attacker's array → cache leaks via side channel
// Permission check raises exception, but cache already poisoned
```

Allowed reading *any* kernel memory from userspace. Massive vulnerability.

### Affected

- Intel CPUs since 1995 (most).
- ARM Cortex-A75.
- AMD *not* affected (permission check *before* speculation).

### Mitigations

- **KPTI** (Kernel Page Table Isolation) — Linux 4.15+. Kernel pages mapped only when in kernel mode. ~5-30 % perf hit on syscall-heavy workloads.
- **Microcode** patches.
- **Silicon fix** — Intel Ice Lake (2019) and later fixed in HW.

## L1TF / Foreshadow (CVE-2018-3615/3620/3646)

L1 Terminal Fault. Speculative reads can access L1 cache *across* hyperthread or context.

VM escape — guest VM could read host memory.

### Mitigations

- **L1D flush** at VM exit.
- **Disable Hyper-Threading** — common cloud mitigation.

Performance hit on cloud VMs significant.

## MDS — Microarchitectural Data Sampling (2019)

Several variants: ZombieLoad, RIDL, Fallout, Store-to-Leak.

Leak data from internal CPU buffers (load buffer, store buffer, fill buffer).

### Mitigations

- **MDS_CLEAR** microcode — flush buffers on context switch.
- Disable Hyper-Threading.

## Hertzbleed (2022)

CPU frequency scaling (DVFS) creates power-frequency side channel. Attacker can extract keys remotely by timing.

### Mitigations

- Constant-time crypto implementations.
- DVFS disable for sensitive code (lower perf).

## Rowhammer (2014)

DRAM bit flip via repeated row access.

### Princip

DRAM = capacitors in 2D array. Reading row "refreshes" it. Adjacent rows leak charge.

Hammer ("hammer") row repeatedly → adjacent rows lose charge → bits flip.

```c
char *p1 = aggressor_row;
char *p2 = victim_row;
while (1) {
    *p1;        // hammer aggressor
    clflush(p1);   // force cache miss for next access
}
```

Hundreds of thousands of accesses per second per location → bits flip.

### Impact

- Page table corruption — attacker gains kernel privilege (no software bug needed).
- ECC bypass — flip 2+ bits, ECC misses.
- DDR4 *targeted row refresh (TRR)* mitigation — broken in 2020 (TRRespass).

### Mitigations

- **ECC RAM** — detects single bit flip. Multi-bit flips can still get through.
- **TRR** (Targeted Row Refresh) — DRAM refreshes specific rows after suspicious access patterns.
- **Hardware refresh frequency** — refresh more often → less time for bits to flip.
- **DRAM with on-die ECC** — DDR5 default.

Not fully solved. Ongoing arms race.

::: viz rowhammer-flip "Vyber aggressor rows; pumpuj accesses; sleduj, kdy victim row začne bipartitě bity. Toggle TRR / ECC — uvidíš, který flips ještě projdou."
:::

## Side channels — beyond CPU

### Timing attacks

Variations in execution time leak info. Classic: compare strings character by character → time differs based on prefix match.

```c
for (i = 0; i < strlen(secret); i++)
    if (input[i] != secret[i]) return false;
return true;
```

Time grows with matching prefix length. Attacker iterates char by char, measures time → learns secret.

Defense: **constant-time** comparison — always iterate full length.

```c
int diff = 0;
for (i = 0; i < strlen(secret); i++)
    diff |= input[i] ^ secret[i];
return diff == 0;
```

### Power analysis

Measure CPU power consumption → infer operations. Differential Power Analysis (DPA) extracts crypto keys from smart cards.

Detail v [[spa-dpa|postranní kanály]].

### EM emanations (TEMPEST)

Electronic devices emit EM radiation containing data signals. NSA TEMPEST program protects high-security systems.

Civilian: keyboard EM emissions readable at meters away.

Defense: shielding (Faraday cage), filters.

### Cache timing

Probe cache state to infer victim's memory access pattern. PRIME+PROBE, FLUSH+RELOAD methods.

Foundation of Spectre/Meltdown exploitation.

## Supply chain attacks

Not exactly hw vulnerabilities, but related:

### Hardware implants

Suspected: NSA, Chinese gov implant chips in routers, servers (Bloomberg "Supermicro" 2018, contested).

Confirmed: Snowden leaks revealed NSA ANT catalog with HW implants.

### Firmware-level malware

UEFI rootkits (LoJax 2018), Intel ME (Management Engine) vulnerabilities.

### Counterfeit chips

Fake chips with different specs or backdoors. Government supply chain scrutiny grew.

## Why hardware vulnerabilities matter

- **Bypass software security** — no software patch fixes underlying flaw.
- **Performance cost** of mitigations is significant.
- **Long replacement cycle** — CPUs in service 10-20 years.
- **Multiple vulnerabilities** in same era — Spectre/Meltdown/MDS/L1TF together.

⇒ Hardware security *fundamental*. Software just builds on top.

## Future

- **CHERI** (Capability Hardware Enhanced RISC Instructions) — Cambridge research. Hardware capability-based access control.
- **Arm Morello** — first CHERI-based commercial.
- **RISC-V security extensions** — PMP (Physical Memory Protection), CHERI.

Post-Spectre era: CPU vendors *compete* on security characteristics, not just performance. New design discipline.

---

*Zdroj: BIS přednášky 2025/26, Ing. Martin Očenáš, FIT VUT v Brně. Externí reference: Kocher, P. et al.: „Spectre Attacks: Exploiting Speculative Execution" (S&P 2019, [arXiv:1801.01203](https://arxiv.org/abs/1801.01203)); Lipp, M. et al.: „Meltdown: Reading Kernel Memory from User Space" (USENIX Security 2018); Kim, Y. et al.: „Flipping Bits in Memory Without Accessing Them" (ISCA 2014); Frigo, P. et al.: „TRRespass: Exploiting the Many Sides of Target Row Refresh" (S&P 2020); [Spectre & Meltdown info](https://meltdownattack.com/).*
