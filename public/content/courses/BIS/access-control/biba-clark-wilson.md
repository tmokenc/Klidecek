---
title: Biba a Clark-Wilson — modely integrity
---

# Biba a Clark-Wilson — modely integrity

BLP ([[bell-lapadula]]) chrání důvěrnost (confidentiality). Model **Biba** (1977) je jeho protějškem (dual) pro integritu (integrity) — nedovoluje, aby data s vysokou integritou upravoval zdroj s nízkou integritou. **Clark-Wilson** (1987) je komerční model integrity.

## Biba — formální model integrity

Kenneth Biba (1977, MITRE). Základní myšlenka: stejný princip jako u BLP, ale „svaz (lattice) je obrácený".

### Úrovně integrity (úplně uspořádané)

| Úroveň | Symbol |
| :--- | :---: |
| Zásadní (Crucial) | C |
| Velmi důležitá (Very Important) | VI |
| Důležitá (Important) | I |
| (nižší) | ... |

Vysoká integrita znamená důvěryhodnější (more trusted) data nebo proces.

### Pravidla modelu Biba

#### Vlastnost prosté integrity (Simple Integrity Property) — „no read down"

Subjekt `s` smí číst (read) objekt `o` právě tehdy, když `integrity(o) >= integrity(s)`.

Proč: kdyby subjekt četl data s nízkou integritou, kontaminoval (contaminate) by se. Jeho výstupy by pak byly méně důvěryhodné.

Příklad: produkční server (vysoká integrita), který čte z internetu (nízká integrita) — Biba to zakazuje. Produkční server by měl číst jen z důvěryhodných zdrojů.

#### Vlastnost integrity s hvězdičkou (*-Integrity Property) — „no write up"

Subjekt `s` smí zapisovat (write) do objektu `o` právě tehdy, když `integrity(s) >= integrity(o)`.

Proč: subjekt s nízkou integritou nesmí měnit data s vysokou integritou.

Příklad: uživatelský proces (nízká integrita) nemůže zapisovat do /etc/passwd (vysoká integrita).

### Mapování na Linux

Linux se neformálně chová podobně jako Biba:

- /etc/passwd, /etc/shadow — vysoká integrita. Pouze root.
- Domovské adresáře uživatelů — střední integrita.
- /tmp — nízká integrita.

```
# user (low int) cannot write /etc/passwd (high int)
$ echo "evil" >> /etc/passwd
permission denied
```

Jde o implicitní obdobu modelu Biba realizovanou přes unixové DAC (volitelné řízení přístupu).

### Striktní varianta vs. low-water-mark

- **Striktní Biba** — operace selže, pokud je porušeno pravidlo.
- **Low-water-mark** — integrita subjektu se sníží (demoted) na integritu dat a práce pokračuje.

Striktní varianta je bezpečnější, low-water-mark je praktičtější.

### Problémy modelu Biba

- **Kompromis mezi BLP a Biba** — působí v opačných směrech. Splnit obě pravidla zároveň je obtížné.
- **Nepohodlné použití** — řada úloh potřebuje číst směrem dolů (audit, monitorování).
- **Nemodeluje reálné pracovní postupy** — banky potřebují schvalovací postupy (workflow), nejen označení (labely).

⇒ Biba je spíše teoretický a v čisté podobě se nasazuje jen zřídka. **Clark-Wilson** tuto mezeru zaplňuje pro komerční prostředí.

## Clark-Wilson — komerční integrita

David Clark a David Wilson (1987). Navrženo pro **komerční** systémy (banky, účetnictví).

Klíčový poznatek: integrita v reálném světě se nerovná označením (labelům). Jde o správné transakce a o oddělení pravomocí (separation of duties).

### Komponenty

- **CDI** (Constrained Data Items, omezená datová položka) — data s vysokou integritou (zůstatek účtu).
- **UDI** (Unconstrained Data Items, neomezená datová položka) — nedůvěryhodný vstup (požadavek (request) uživatele).
- **TP** (Transformation Procedures, transformační procedura) — programy, které mění CDI.
- **IVP** (Integrity Verification Procedures, procedura ověření integrity) — ověřují integritu CDI.

### Pravidla

1. **IVP** se spustí na začátku a ověří, že jsou všechny CDI platné.
2. **TP** jsou jediný způsob, jak měnit CDI.
3. Převod UDI → CDI musí projít přes TP (validace).
4. **Trojice** (uživatel, TP, CDI) — definují, kteří uživatelé smějí spouštět které TP nad kterými CDI.
5. **Oddělení pravomocí (separation of duties)** — různí uživatelé pro různé TP v rámci jedné operace.
6. **Autentizace (authentication)** — uživatelé jsou identifikováni před spuštěním jakékoli TP.
7. **Auditní záznam (audit log)** — spuštění TP se zaznamenává.

### Příklad — bankovnictví {tier=example}

- CDI: zůstatky účtů.
- UDI: požadavky zákazníků na vklad.
- TP:
  - `deposit(account, amount)` — ověří částku, upraví zůstatek.
  - `withdraw(account, amount)` — zkontroluje zůstatek, odepíše částku.
  - `transfer(from, to, amount)` — atomická operace nad dvěma účty.

- **Trojice**: (teller_role, deposit_TP, customer_accounts).

Uživatelka Alice (přepážková pracovnice) smí spustit `deposit_TP` nad zákaznickými účty.

Oddělení pravomocí: velký převod vyžaduje schválení od přepážkové pracovnice i od manažera (různí uživatelé, různé TP).

### Korektně utvořené transakce (well-formed transactions)

CDI se mění pouze přes TP. TP je navržena tak, aby udržovala invarianty (zůstatek nikdy nebude záporný, podvojné účetnictví).

Ruční úpravy jsou zakázané:

```sql
-- BAD: directly modifying CDI
UPDATE accounts SET balance = balance - 100 WHERE id = 1;

-- GOOD: through TP
CALL withdraw_TP(account=1, amount=100);
```

Uložené procedury (stored procedures) v databázi plní roli TP. Přímé úpravy tabulek jsou omezené.

### Audit a IVP

Po každém dávkovém běhu TP IVP kontroluje invarianty:

- Součet kreditů == součet debetů.
- Žádné záporné zůstatky.
- Všechny TP zalogovány.

Pokud IVP selže → upozornění a vyšetření.

## Clark-Wilson v praxi {tier=practice}

- **Bankovní jádrové systémy (core systems)** — IBM, Oracle Financial Services.
- **ERP systémy** — SAP, Oracle ERP.
- **Nemocniční systémy** — audit podávání léků.

Moderní implementace:

- **Uložené procedury** pro TP.
- **Zabezpečení na úrovni řádků (row-level security)** pro trojice.
- **Auditní triggery** pro logování.
- **Rekonciliační úlohy (reconciliation jobs)** pro IVP.

## Vztah BLP, Biba a Clark-Wilson

| Model | Zaměření | Přístup |
| :--- | :--- | :--- |
| BLP | Důvěrnost | Labely, no read up |
| Biba | Integrita | Labely, no read down |
| Clark-Wilson | Integrita (komerční) | TP, IVP, trojice |

Reálné systémy je kombinují:

- **BLP** (nebo DAC + RBAC) — důvěrnost.
- **Clark-Wilson** — integrita pracovních postupů (workflow).
- **Auditní záznamy** — odpovědnost (accountability).
- **Zálohování** — dostupnost (availability).

## Čínská zeď (Chinese Wall, Brewer-Nash) {tier=extra}

Problém před rokem 1989: poradenská firma má více klientů. Konzultant by neměl vidět informace dvou klientů zároveň (střet zájmů).

Model **Čínské zdi (Brewer-Nash)**:

- Objekty jsou v třídách se střetem zájmů (conflict-of-interest classes).
- Subjekt smí přistupovat k jednomu objektu z každé třídy.
- Po přístupu k objektu X už subjekt nesmí přistoupit k objektu Y ve stejné třídě.

Implementace: dynamické ACL, které se mění podle toho, k jakým objektům uživatel přistupuje.

Případy užití: advokátní kanceláře, účetní firmy, poradenství.

## Moderní integrita

Moderní systémy používají:

- **Podepisování kódu (code signing)** — integrita softwaru (Authenticode, Apple, linuxové distribuce).
- **Databázová omezení** — cizí klíče, kontrolní podmínky (check constraints) (vynucování v duchu CDI).
- **Integrita transakcí** — vlastnosti ACID databáze.
- **Auditní záznamy** — pouze pro přidávání (append-only), podepsané (inspirováno Clark-Wilsonem).
- **Workflow enginy** (Camunda, Airflow) — spouštění TP.
- **MAC (povinné řízení přístupu)** (SELinux) — pro integritu systému.

Tyto přístupy jsou méně formální než původní Biba či Clark-Wilson, ale jejich duch zůstává zachován.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Biba, K.J.: „Integrity Considerations for Secure Computer Systems" (MITRE MTR-3153, 1977); Clark, D.D., Wilson, D.R.: „A Comparison of Commercial and Military Computer Security Policies" (IEEE S&P 1987, [DOI 10.1109/SP.1987.10001](https://doi.org/10.1109/SP.1987.10001)); Brewer, D.F.C., Nash, M.J.: „The Chinese Wall Security Policy" (IEEE S&P 1989); Bishop, M.: „Computer Security: Art and Science" (2nd ed., Addison-Wesley 2018), §6.*
