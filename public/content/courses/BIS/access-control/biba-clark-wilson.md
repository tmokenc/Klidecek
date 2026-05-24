---
title: Biba a Clark-Wilson — integrity models
---

# Biba a Clark-Wilson — modely integrity

BLP ([[bell-lapadula]]) chrání *confidentiality*. **Biba** (1977) je *dual* pro **integrity** — žádné modifikace high-integrity dat low-integrity zdroji. **Clark-Wilson** (1987) je *commercial* integrity model.

## Biba — integrity formal model

Kenneth Biba (1977, MITRE). Idea: jako BLP, ale "lattice obrácená".

### Integrity levels (totally ordered)

| Level | Symbol |
| :--- | :---: |
| Crucial | C |
| Very Important | VI |
| Important | I |
| (lower) | ... |

High integrity = *more trusted* data/process.

### Biba Rules

#### Simple Integrity Property — "no read down"

Subject `s` can *read* object `o` iff `integrity(o) >= integrity(s)`.

Why: pokud read low-integrity data, *contaminate* subject. Subject's outputs would be less trusted.

Příklad: production server (high integrity) reading from internet (low integrity) — Biba *denies*. Production should only read from trusted sources.

#### *-Integrity Property — "no write up"

Subject `s` can *write* object `o` iff `integrity(s) >= integrity(o)`.

Why: low-integrity subject *can't* modify high-integrity data.

Příklad: user-space process (low integrity) cannot write to /etc/passwd (high integrity).

### Mapování na Linux

Linux *informal* Biba-like:

- /etc/passwd, /etc/shadow — high integrity. Only root.
- User home dirs — medium.
- /tmp — low.

```
# user (low int) cannot write /etc/passwd (high int)
$ echo "evil" >> /etc/passwd
permission denied
```

Implicit Biba via Unix DAC.

### Strict vs Low-Water-Mark

- **Strict Biba** — fail if rule violated.
- **Low-Water-Mark** — subject's integrity *demoted* to data's integrity. Continue work.

Strict more secure. LWM more practical.

### Biba problémy

- **Trade-off mezi BLP a Biba** — opposite directions. Hard to satisfy both.
- **Awkward** — many tasks need read-down (audit, monitoring).
- **Doesn't model real workflows** — banks need approval workflows, not just labels.

⇒ Biba *theoretical*, rarely deployed pure. **Clark-Wilson** fills gap pro commercial.

## Clark-Wilson — commercial integrity

David Clark + David Wilson (1987). Designed for **commercial** systems (banks, accounting).

Key insight: real-world integrity ≠ labels. It's about *correct transactions* + *separation of duties*.

### Components

- **CDIs** (Constrained Data Items) — high-integrity data (account balance).
- **UDIs** (Unconstrained Data Items) — untrusted input (user request).
- **TPs** (Transformation Procedures) — programs that modify CDIs.
- **IVPs** (Integrity Verification Procedures) — verify CDI integrity.

### Rules

1. **IVP** runs *at start*, verifies all CDIs valid.
2. **TPs** are only way to modify CDIs.
3. UDI → CDI must pass *through* TP (validation).
4. **Triples** (User, TP, CDI) — define what users can run what TPs on what CDIs.
5. **Separation of duties** — different users for different TPs in same operation.
6. **Authentication** — users identified before any TP execution.
7. **Audit log** — TP execution recorded.

### Příklad — banking

- CDIs: account balances.
- UDIs: customer deposit requests.
- TPs:
  - `deposit(account, amount)` — validates amount, modifies balance.
  - `withdraw(account, amount)` — checks balance, debits.
  - `transfer(from, to, amount)` — atomic two-account op.

- **Triple**: (teller_role, deposit_TP, customer_accounts).

User Alice (teller) can run `deposit_TP` on customer accounts.

Separation of duties: large transfer needs *both* teller AND manager approval (different users, different TPs).

### Well-formed transactions

CDI changes *only* via TP. TP designed to maintain invariants (balance never negative, double-entry accounting).

Manual edits forbidden:

```sql
-- BAD: directly modifying CDI
UPDATE accounts SET balance = balance - 100 WHERE id = 1;

-- GOOD: through TP
CALL withdraw_TP(account=1, amount=100);
```

Database stored procedures = TPs. Direct table updates restricted.

### Audit + IVP

After each batch TP run: IVP checks invariants:

- Sum of credits == sum of debits.
- No negative balances.
- All TPs logged.

Pokud IVP fails → alert, investigate.

## Clark-Wilson v praxi

- **Banking core systems** — IBM, Oracle Financial Services.
- **ERP systems** — SAP, Oracle ERP.
- **Hospital systems** — drug administration audit.

Modern implementations:

- **Stored procedures** for TPs.
- **Row-level security** for triples.
- **Audit triggers** for log.
- **Reconciliation jobs** for IVPs.

## Vztah BLP, Biba, Clark-Wilson

| Model | Focus | Approach |
| :--- | :--- | :--- |
| BLP | Confidentiality | Labels, no read up |
| Biba | Integrity | Labels, no read down |
| Clark-Wilson | Integrity (commercial) | TPs, IVPs, triples |

Real systems combine:

- **BLP** (or DAC + RBAC) — confidentiality.
- **Clark-Wilson** — workflow integrity.
- **Audit logs** — accountability.
- **Backup** — availability.

## Chinese Wall (Brewer-Nash)

Pre-1989 problém: consulting firm has multiple clients. Consultant *shouldn't* see *both* clients' info (conflict of interest).

**Brewer-Nash Chinese Wall** model:

- Objects in **conflict-of-interest classes**.
- Subject can access *one* object from each class.
- After accessing X, subject *cannot* access Y in same class.

Implementace: dynamic ACLs, change as users access objects.

Use case: legal firms, accounting firms, consulting.

## Modern integrity

Modern systems use:

- **Code signing** — software integrity (Authenticode, Apple, Linux distros).
- **Database constraints** — foreign keys, check constraints (CDI-like enforcement).
- **Transaction integrity** — ACID database properties.
- **Audit logs** — append-only, signed (Clark-Wilson-inspired).
- **Workflow engines** (Camunda, Airflow) — TP execution.
- **MAC** (SELinux) — for *system* integrity.

Less formal than original Biba/Clark-Wilson, but *spirit* preserved.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Biba, K.J.: „Integrity Considerations for Secure Computer Systems" (MITRE MTR-3153, 1977); Clark, D.D., Wilson, D.R.: „A Comparison of Commercial and Military Computer Security Policies" (IEEE S&P 1987, [DOI 10.1109/SP.1987.10001](https://doi.org/10.1109/SP.1987.10001)); Brewer, D.F.C., Nash, M.J.: „The Chinese Wall Security Policy" (IEEE S&P 1989); Bishop, M.: „Computer Security: Art and Science" (2nd ed., Addison-Wesley 2018), §6.*
