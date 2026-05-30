---
title: DAC vs MAC — access control models
---

# DAC vs MAC — discretionary vs mandatory access control

Access control rozhoduje, *kdo* může *co* s *jakým objektem*. Dvě klasické paradigma: **DAC** (Discretionary) — owner decides, **MAC** (Mandatory) — system enforces labels.

## DAC — Discretionary Access Control

Vlastník objektu *rozhoduje* o přístupových právech. Vlastník může:

- Udělit přístup jiným uživatelům.
- Změnit oprávnění.
- Předat ownership.

Typický model pro **Unix file permissions**, **Windows NTFS ACL**, **databáze GRANT/REVOKE**.

### Unix DAC

```
$ ls -l file.txt
-rw-r----- 1 alice marketing 1024 file.txt
```

- Owner = alice (rw-).
- Group = marketing (r--).
- Other = (---).

Alice (owner) může:

```
$ chmod g+w file.txt        # add write for group
$ chown bob file.txt        # change ownership
```

### NTFS ACL (Windows)

```
File: report.docx
  Owner: alice
  ACE 1: alice (read, write, full control)
  ACE 2: bob (read)
  ACE 3: managers group (read, write)
  ACE 4: everyone (none)
```

ACE = Access Control Entry. Více granular than Unix.

### Database GRANT

```sql
GRANT SELECT, INSERT ON customers TO bob;
GRANT ALL ON orders TO managers WITH GRANT OPTION;
```

`WITH GRANT OPTION` = bob can further grant. Owner cascading.

### Problémy DAC

- **Trojan horse** — user runs malicious program; program inherits user's permissions; can access user's files.
- **No central control** — admin can't *globally* enforce policy. Users delegate freely.
- **Hard to revoke** — once shared, hard to undo.
- **No information flow control** — alice reads file, copies content, gives to bob (no longer covered by original permission).

DAC vhodný pro *cooperative* environments (corporate, academic). *Nevhodný* pro *high-security* (military, intelligence).

## MAC — Mandatory Access Control

*System* enforces access decisions based on **labels** (clearance levels, categories). Users *can't* override.

### Sensitivity labels

Typical military classification:

| Level | Label |
| :--- | :--- |
| Top Secret | TS |
| Secret | S |
| Confidential | C |
| Unclassified | U |

Plus *categories* (compartments): NUCLEAR, CRYPTO, EUROPEAN, ASIAN.

User clearance = level + categories. Object label = level + categories.

### Access decision

Access granted *only if*:

- User's level >= object's level (no read up).
- User's categories ⊇ object's categories.

Plus *additional rules* depending on model (Bell-LaPadula, Biba, ...).

### Bell-LaPadula (BLP) — confidentiality

Detail v [[bell-lapadula]]. Rules:

- **No read up** — Secret user can't read Top Secret.
- **No write down** — Top Secret user can't write to Secret (prevent leakage).

### Biba — integrity

Detail v [[biba-clark-wilson]]. Dual to BLP:

- **No read down** — high-integrity user shouldn't read low-integrity (prevents contamination).
- **No write up** — low-integrity shouldn't modify high-integrity.

### SELinux

**Security-Enhanced Linux** — MAC implementation v Linux kernel (NSA, since 2003).

Each process + file labeled with *security context*: `user:role:type:level`.

```
$ ls -Z file.txt
-rw-r--r-- 1 alice marketing system_u:object_r:user_home_t:s0 file.txt
```

Type Enforcement (TE) is *primary* SELinux mechanism. Policy defines which types can access which.

```
allow httpd_t  user_content_t : file { read getattr };
```

Process running httpd_t can read user_content_t files.

Plus optional **MLS** (Multi-Level Security) for true MAC.

### AppArmor

Alternative MAC for Linux. *Path-based* (vs SELinux *label-based*). Simpler but less flexible.

```
/usr/sbin/nginx {
    /etc/nginx/** r,
    /var/log/nginx/** w,
}
```

Used in Ubuntu, openSUSE.

## DAC vs MAC srovnání

| | DAC | MAC |
| :--- | :--- | :--- |
| Decision maker | object owner | system / policy |
| Flexibility | high | low |
| Central control | weak | strong |
| User override | yes | no |
| Implementation | ACL | labels + rules |
| Use case | corporate, academic | military, intelligence |
| Examples | Unix, NTFS, DB GRANT | SELinux MLS, Trusted Solaris |

## Hybrid

Modern OS use *both*:

- **DAC** as primary (user-friendly).
- **MAC** as additional layer (SELinux, AppArmor).

Linux: file owner sets perm (DAC). SELinux policy *further* restricts. Both must allow → access granted.

Pokud either denies → access denied.

⇒ Defense in depth at OS level.

## RBAC + ABAC

Detail v [[rbac-abac]]. Quick preview:

- **RBAC** — Role-Based. Users → Roles → Permissions. Standard enterprise.
- **ABAC** — Attribute-Based. Access based on subject + object + environment attributes (context-aware).

Not really DAC or MAC — orthogonal axis. *Implementace* může být DAC- or MAC-style.

## Capability vs ACL

Two ways to implement access control:

### ACL (Access Control List)

Each *object* lists *who* can access.

```
file.txt:
   alice: rw
   bob: r
```

Most OS, databases. Easy to revoke (modify ACL).

### Capability

Each *subject* has *tokens* (capabilities) granting access.

```
alice's capabilities:
   - file.txt: rw
   - report.pdf: r
```

Used in KeyKOS, EROS/CapROS, seL4, Plan 9.

Capability advantage: explicit transfer; finer control over what subject has.

Capability disadvantage: revocation harder.

Most systems use *ACL*. Capability systems esoteric but secure.

## Reference monitor

Both DAC and MAC require *reference monitor* — component that *intermediates* all access:

- **Tamper-proof** — cannot be bypassed.
- **Always invoked** — for every access.
- **Verifiable** — small enough to audit.

In Linux: LSM (Linux Security Modules) hooks. SELinux, AppArmor implement on top.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Sandhu, R.S., Samarati, P.: „Access Control: Principles and Practice" (IEEE Communications 32(9), 1994); Bishop, M.: „Computer Security: Art and Science" (2nd ed., Addison-Wesley 2018), §4; Anderson, R.: „Security Engineering" (3rd ed., Wiley 2020), §4; [SELinux Wiki](https://selinuxproject.org/page/Main_Page).*
