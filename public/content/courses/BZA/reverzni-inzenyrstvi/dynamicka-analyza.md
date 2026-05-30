---
title: Dynamická analýza
---

# Dynamická analýza

**Dynamická analýza** zkoumá binární soubor *během jeho běhu* — sledováním instrukcí, system calls, network traffic, paměťových přístupů, registrových hodnot. Doplňuje [[staticka-analyza|statickou analýzu]]: statika dává *kompletní obraz kódu*, dynamika *konkrétní hodnoty* a *runtime chování*.

## Hlavní techniky

* **Debugging** — krok-po-kroku spouštění, breakpoints, watch variables.
* **Tracing** — záznam všech volaných API, system calls, registrů.
* **Instrumentace** — modifikace kódu za běhu (hooks, callbacks).
* **Sandbox execution** — spuštění v izolovaném prostředí (malware analysis).
* **Fuzzing** — random/structured inputs pro objevování crashes.
* **Memory forensics** — analýza dumpu paměti.

## Debugging

### Tools

* **GDB** (GNU Debugger) — Linux, BSD, macOS. CLI, *de facto* standard pro Linux RE.
* **LLDB** — modern alternative GDB, výchozí na macOS.
* **WinDbg** — Microsoft Windows debugger; kernel-mode debugging.
* **x64dbg** — open-source Windows debugger pro RE. Dobrá GUI, plugin ecosystem.
* **OllyDbg** — historicky popular 32-bit Windows debugger; již nevyvíjen.
* **IDA Pro debugger** — integrace s IDA static analysis; klíčová funkce.

### Klíčové operace

* **Breakpoint** — pozastavení vykonávání na konkrétní instrukci/adrese.
* **Watchpoint** — pozastavení při změně paměťové hodnoty.
* **Step into / over** — instrukce po instrukci.
* **Register / memory inspection** — *konkrétní* hodnoty v daný okamžik.
* **Backtrace** — call stack.

### Příklad — sledování crypto operace

1. Open binary v IDA + debugger.
2. **Symbol search** pro `AES_encrypt` nebo *signature pattern* AES function.
3. **Set breakpoint** at function entry.
4. Run program s test inputem.
5. Breakpoint fires; **inspect RCX/RDI** (1st parameter on x64) — *plaintext pointer*.
6. **Inspect parameter 2** (RDX/RSI) — *key pointer*.
7. **Dump memory** at key pointer → *plaintext klíč*.

Pro RSA / ECC podobně, ale s *bignum* representations (8 × 32-bit limbs nebo similar).

## Anti-debug techniky

Software se brání debugging:

### Detection mechanisms

* **`IsDebuggerPresent()`** (Windows) — čte user-mode flag `PEB->BeingDebugged` v Process Environment Block samotného procesu (bez kernel call), proto je triviálně obejitelný vynulováním tohoto bytu.
* **`CheckRemoteDebuggerPresent()`** — pro debugger v jiném procesu.
* **`NtQueryInformationProcess(ProcessDebugPort)`** — undocumented call.
* **Timing checks** — měří dobu mezi dvěma instrukcemi; debugger zpomaluje. `RDTSC` instructions reading TSC.
* **Hardware breakpoints check** — DR0–DR3 registry by měly být 0 pro normální běh.
* **Single-step exceptions** — některé techniky vyvolávají SEH a sledují, zda debugger je nezachytí.
* **Trap flag** v EFLAGS register.
* **Self-modifying code** detection.

### Mitigace (pro reverz inženýra)

* **ScyllaHide** plugin pro x64dbg — comprehensive anti-anti-debug.
* **TitanHide** kernel driver.
* **GDB scripts** for Linux anti-debug bypass.
* **Manual patching** — NOP-out detection calls.

## Tracing

### Pin (Intel) / DynamoRIO

* Dynamic binary instrumentation frameworks.
* Inject custom callbacks při každé instrukci, basic block, function call.
* Použití: code coverage, instruction profiling, taint analysis.

### Frida — modern dynamic instrumentation

[Frida](https://frida.re/) — JavaScript-based instrumentation framework:

* Inject JavaScript runtime do target process.
* JavaScript code definuje hooks na native functions.
* Cross-platform (Win/Linux/macOS/Android/iOS).
* **Killer feature:** instrumentace *bez modifikace binárky*.

Příklad:

```javascript
Interceptor.attach(Module.findExportByName(null, 'AES_encrypt'), {
    onEnter: function(args) {
        console.log("AES key:", args[2].readByteArray(16));
        console.log("plaintext:", args[0].readByteArray(16));
        this.out = args[1];  // output buffer (RSI on x64 System V)
    },
    onLeave: function(retval) {
        console.log("ciphertext:", this.out.readByteArray(16));
    }
});
```

**Použití:**
* Mobile app reverz (Android/iOS).
* IoT firmware analysis.
* Anti-cheat bypass v hrách.
* Crypto key extraction.

### strace / ltrace / DTrace

* **strace** (Linux) — sleduje *system calls*. Pro reverz: which files, network connections, IPC.
* **ltrace** (Linux) — sleduje *library calls*. Lepší pro user-space libs.
* **DTrace** (Solaris, FreeBSD, macOS) — kernel-level dynamic tracing.
* **eBPF / bpftrace** — modern Linux, very efficient.

Příklad: `strace -e openat,connect,write firmware-binary`.

### Wireshark — network protocol analysis

Pro **network-related RE**:

* Capture packets a inspect protocol behavior.
* **Dissectors** pro stovky protokolů (TCP, TLS, HTTP, MQTT, CoAP, Modbus, ...).
* Custom Lua dissectors pro proprietary protocols.

V IoT pen-testing: capture provoz mezi zařízením a cloud → identifikuj autentizační flow, klíče, commands.

## Sandbox execution

Pro **malware analysis** se používá sandbox — izolované prostředí, kde binary lze bezpečně spustit:

### Tools

* **Cuckoo Sandbox** (open source) — full malware analysis pipeline. Captures behavior: file operations, registry changes, network, screenshots.
* **Hybrid Analysis** (Falcon Sandbox) — komerční SaaS od CrowdStrike. Free tier pro researchers.
* **VirusTotal** — community-driven, multiple AV engines + behavior reports.
* **ANY.RUN** — interactive sandbox; analyst může *click* during execution.
* **Joe Sandbox**, **Triage** — commercial alternatives.

### Anti-VM techniky

Malware detekuje VM environment a *odmítá* spustit malicious code v sandboxech:

* **Hardware fingerprints** — MAC OUI prefixes specific to VMware/VirtualBox.
* **Registry keys** — `HKLM\HARDWARE\Description\System\SystemBiosVersion = VBOX`.
* **Files / processes** — `vmtoolsd.exe`, `VBoxService.exe`.
* **CPU instructions** — `cpuid` reveals hypervisor.
* **Timing** — clock granularity v VM.

Pro by-pass: customized VMs s anti-anti-VM techniques (modifikované BIOS, hidden hypervisor).

## Fuzzing

**Fuzzing** je technika hledání bugs *random/structured inputs*. Klíčová pro security research.

### Tools

* **AFL (American Fuzzy Lop)** — coverage-guided fuzzer. *Klasika* pro file format parsers, libraries.
* **AFL++** — modern fork, lepší performance.
* **libFuzzer** (LLVM) — in-process fuzzer.
* **honggfuzz** — Google's fuzzer.
* **boofuzz** — protocol fuzzer.
* **syzkaller** (Google) — Linux kernel fuzzer.

### Coverage-guided fuzzing

1. **Seed corpus** — set initial test inputs.
2. **Instrument target binary** s coverage tracking (typically via compiler -fsanitize=fuzzer).
3. **Run input** — track *which code paths* executed.
4. **Mutate** input (bit flips, byte injection, structure changes).
5. Keep mutation if *new coverage* discovered.
6. **Save crashes** — inputs that cause crash → potential vulnerabilities.

Slavné výsledky: **OSS-Fuzz** (Google) found **>20 000 bugs** v open-source projects (curl, OpenSSL, Linux kernel, PostgreSQL, ...) v r. 2016–2024.

## Memory forensics

### Tools

* **Volatility** (free) — Python framework pro memory dump analysis. Plugins pro Windows / Linux / macOS.
* **Rekall** (Google) — Volatility alternative.
* **WinDbg** — kernel memory analysis.

### Použití

* **Recovery encrypted disk keys** z RAM (Cold Boot Attack analog — viz [[environmentalni]]).
* **Identify malware presence** — injected DLLs, hidden processes.
* **Recovery cleartext credentials** — passwords v paměti běžícího procesu.
* **Forensic timeline** — *when* malware infikoval system.

## Dynamická analýza pro bezpečný HW

Typické scénáře:

* **Smart card simulation** — *softHSM* + Frida hooks pro inspect crypto operations.
* **HSM API testing** — emulátor (Utimaco) + dynamic instrumentation k identifikaci API bugů.
* **IoT firmware** — emulation (QEMU s ARM/MIPS support) + GDB.
* **Mobile app crypto** — Frida pro extrakci klíčů z native libraries.

## Statická + dynamická = hybridní

Reálná RE workflow kombinuje:

1. **Statická analýza** — initial overview, find interesting functions.
2. **Dynamická analýza** — confirm behavior, extract runtime values.
3. **Iterace** — back to static for deeper understanding, then dynamic for validation.

Komerční tools (IDA Pro, Binary Ninja) podporují *integrated workflow* — debugger embedded v disassembler view.

---

*Zdroj: BZA přednášky 2025/26, BZA 11 — Reverzní inženýrství (Mazura). Externí reference: Eilam, E.: *Reversing: Secrets of Reverse Engineering* (Wiley 2005), kap. 5; Sikorski, M., Honig, A.: *Practical Malware Analysis* (No Starch Press 2012), kap. 6–12; Frida documentation — [frida.re](https://frida.re/docs/home/); Cuckoo Sandbox — [cuckoosandbox.org](https://cuckoosandbox.org/); AFL++ — [aflplus.plus](https://aflplus.plus/).*
