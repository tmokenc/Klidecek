---
title: DAC vs MAC — modely řízení přístupu
---

# DAC vs MAC — volné vs povinné řízení přístupu

Řízení přístupu (access control) rozhoduje, *kdo* může *co* dělat s *jakým objektem*. Existují dvě klasická paradigmata: **DAC** (Discretionary Access Control, volné řízení přístupu) — o přístupu rozhoduje vlastník objektu, a **MAC** (Mandatory Access Control, povinné řízení přístupu) — pravidla vynucuje systém na základě bezpečnostních štítků (labels).

## DAC — volné řízení přístupu (Discretionary Access Control)

Vlastník objektu *rozhoduje* o přístupových právech. Vlastník může:

- Udělit přístup jiným uživatelům.
- Změnit oprávnění.
- Předat vlastnictví (ownership) objektu.

Tento model je typický pro **přístupová práva souborů v Unixu (Unix file permissions)**, **seznamy řízení přístupu NTFS ve Windows (Windows NTFS ACL)** a **databázové příkazy GRANT/REVOKE**.

### DAC v Unixu

```
$ ls -l file.txt
-rw-r----- 1 alice marketing 1024 file.txt
```

- Vlastník (owner) = alice (rw-).
- Skupina (group) = marketing (r--).
- Ostatní (other) = (---).

Alice jako vlastník může:

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

ACE = Access Control Entry (položka seznamu řízení přístupu). Tento přístup nabízí jemnější rozlišení oprávnění než Unix.

### Databázový příkaz GRANT

```sql
GRANT SELECT, INSERT ON customers TO bob;
GRANT ALL ON orders TO managers WITH GRANT OPTION;
```

`WITH GRANT OPTION` znamená, že bob může práva dál udělovat jiným. Oprávnění se tak kaskádovitě šíří od vlastníka.

### Problémy DAC

- **Trojský kůň (Trojan horse)** — uživatel spustí škodlivý program; program zdědí oprávnění uživatele a může přistupovat k jeho souborům.
- **Chybí centrální kontrola** — administrátor nedokáže *globálně* vynutit politiku. Uživatelé volně předávají práva dalším.
- **Obtížné odebrání práv** — jakmile je něco jednou sdílené, je těžké to vzít zpět.
- **Chybí řízení toku informací (information flow control)** — alice přečte soubor, zkopíruje jeho obsah a předá ho bobovi (kopie už nespadá pod původní oprávnění).

DAC je vhodný pro *spolupracující* prostředí (firemní, akademická). *Nevhodný* je pro prostředí s *vysokými nároky na bezpečnost* (armáda, zpravodajské služby).

## MAC — povinné řízení přístupu (Mandatory Access Control)

*Systém* vynucuje rozhodnutí o přístupu na základě **štítků (labels)** — úrovní prověření (clearance levels) a kategorií. Uživatelé tato rozhodnutí *nemohou* obejít.

### Štítky citlivosti (sensitivity labels)

Typická vojenská klasifikace:

| Úroveň | Štítek |
| :--- | :--- |
| Top Secret (přísně tajné) | TS |
| Secret (tajné) | S |
| Confidential (důvěrné) | C |
| Unclassified (neutajované) | U |

K tomu se přidávají *kategorie* (compartments, oddělené oblasti): NUCLEAR, CRYPTO, EUROPEAN, ASIAN.

Prověření uživatele = úroveň + kategorie. Štítek objektu = úroveň + kategorie.

### Rozhodnutí o přístupu

Přístup je udělen *pouze tehdy*, když:

- Úroveň uživatele >= úroveň objektu (žádné čtení směrem nahoru, no read up).
- Kategorie uživatele ⊇ kategorie objektu.

Podle konkrétního modelu (Bell-LaPadula, Biba, …) platí navíc *další pravidla*.

### Bell-LaPadula (BLP) — důvěrnost

Detail v [[bell-lapadula]]. Pravidla:

- **Žádné čtení nahoru (no read up)** — uživatel s úrovní Secret nesmí číst dokument Top Secret.
- **Žádný zápis dolů (no write down)** — uživatel s úrovní Top Secret nesmí zapisovat do dokumentu Secret (zabraňuje úniku utajené informace).

### Biba — integrita

Detail v [[biba-clark-wilson]]. Duální (zrcadlový) protějšek BLP:

- **Žádné čtení dolů (no read down)** — uživatel s vysokou integritou by neměl číst data s nízkou integritou (zabraňuje to kontaminaci důvěryhodných dat).
- **Žádný zápis nahoru (no write up)** — data s nízkou integritou nesmějí měnit data s vysokou integritou.

### SELinux

**Security-Enhanced Linux** — implementace MAC v jádře (kernel) Linuxu (od NSA, od roku 2003).

Každý proces i soubor dostane *bezpečnostní kontext (security context)*: `user:role:type:level`.

```
$ ls -Z file.txt
-rw-r--r-- 1 alice marketing system_u:object_r:user_home_t:s0 file.txt
```

Vynucování podle typu, Type Enforcement (TE), je *hlavní* mechanismus SELinuxu. Politika definuje, které typy smějí přistupovat ke kterým.

```
allow httpd_t  user_content_t : file { read getattr };
```

Proces běžící s typem httpd_t smí číst soubory typu user_content_t.

K tomu volitelně přistupuje **MLS (Multi-Level Security, víceúrovňová bezpečnost)** pro skutečný MAC.

### AppArmor

Alternativní MAC pro Linux. Je založený na *cestách k souborům* (path-based), na rozdíl od SELinuxu, který je založený na *štítcích* (label-based). Je jednodušší, ale méně flexibilní.

```
/usr/sbin/nginx {
    /etc/nginx/** r,
    /var/log/nginx/** w,
}
```

Používá se v Ubuntu a openSUSE.

## Srovnání DAC vs MAC

| | DAC | MAC |
| :--- | :--- | :--- |
| Kdo rozhoduje | vlastník objektu | systém / politika |
| Flexibilita | vysoká | nízká |
| Centrální kontrola | slabá | silná |
| Obejití uživatelem | ano | ne |
| Implementace | ACL | štítky + pravidla |
| Typické nasazení | firmy, akademie | armáda, zpravodajství |
| Příklady | Unix, NTFS, DB GRANT | SELinux MLS, Trusted Solaris |

## Hybridní přístup

Moderní operační systémy používají *oba* modely:

- **DAC** jako hlavní (uživatelsky přívětivý).
- **MAC** jako další vrstvu (layer) ochrany navíc (SELinux, AppArmor).

V Linuxu: vlastník souboru nastaví oprávnění (DAC). Politika SELinuxu přístup *ještě dál* omezí. Přístup je udělen, jen když ho povolí *oba* mechanismy.

Pokud kterýkoli z nich přístup zamítne, je přístup zamítnut.

⇒ Tím vzniká obrana do hloubky (defense in depth) na úrovni operačního systému.

## RBAC + ABAC

Detail v [[rbac-abac]]. Stručný náhled:

- **RBAC** — řízení podle rolí (Role-Based). Uživatelé → role → oprávnění. Standard v podnikovém prostředí.
- **ABAC** — řízení podle atributů (Attribute-Based). Přístup se rozhoduje podle atributů subjektu, objektu a prostředí (zohledňuje kontext).

Nejde tak úplně o DAC ani MAC — jsou to nezávislé osy. *Implementace* může být ve stylu DAC, nebo MAC.

## Capability vs ACL {tier=extra}

Řízení přístupu lze implementovat dvěma způsoby:

### ACL (Access Control List, seznam řízení přístupu)

Každý *objekt* obsahuje seznam toho, *kdo* k němu smí přistupovat.

```
file.txt:
   alice: rw
   bob: r
```

Používá většina operačních systémů a databází. Práva se snadno odebírají (stačí upravit ACL).

### Capability (oprávnění jako přenosný token)

Každý *subjekt* drží *tokeny* (capabilities), které mu udělují přístup.

```
alice's capabilities:
   - file.txt: rw
   - report.pdf: r
```

Tento přístup používají KeyKOS, EROS/CapROS, seL4 a Plan 9.

Výhoda capabilities: oprávnění lze explicitně předávat a lépe se řídí, co přesně subjekt drží.

Nevýhoda capabilities: hůře se odebírají (revokace je složitější).

Většina systémů používá *ACL*. Systémy postavené na capabilities jsou spíše okrajové, zato bezpečné.

## Referenční monitor (reference monitor)

DAC i MAC vyžadují *referenční monitor* — komponentu, která *zprostředkovává* každý přístup:

- **Odolný proti manipulaci (tamper-proof)** — nelze ho obejít.
- **Vždy vyvolaný (always invoked)** — pro každý přístup.
- **Ověřitelný (verifiable)** — dostatečně malý na to, aby šel prověřit (audit).

V Linuxu jde o háky LSM (Linux Security Modules). SELinux i AppArmor jsou postaveny nad nimi.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Sandhu, R.S., Samarati, P.: „Access Control: Principles and Practice" (IEEE Communications 32(9), 1994); Bishop, M.: „Computer Security: Art and Science" (2nd ed., Addison-Wesley 2018), §4; Anderson, R.: „Security Engineering" (3rd ed., Wiley 2020), §4; [SELinux Wiki](https://selinuxproject.org/page/Main_Page).*
