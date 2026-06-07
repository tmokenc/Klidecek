---
title: Psaní bezpečnostní politiky
---

# Psaní bezpečnostní politiky — struktura a osvědčené postupy

Bezpečnostní politika (security policy) je *formální dokument*, který definuje, *jak* organizace přistupuje k bezpečnosti. Nejde o seznam technických opatření — je to *manažerský* dokument, který zároveň *deleguje odpovědnost*.

## Hierarchie dokumentů

::: svg "Hierarchie bezpečnostní dokumentace"
<svg viewBox="0 0 580 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="200" y="40" width="140" height="30" rx="3"/>
    <rect x="170" y="80" width="200" height="30" rx="3"/>
    <rect x="140" y="120" width="260" height="30" rx="3"/>
    <rect x="110" y="160" width="320" height="30" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="270" y="60">Policy</text>
    <text x="270" y="100">Standards</text>
    <text x="270" y="140">Procedures</text>
    <text x="270" y="180">Guidelines</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="start" font-size="9">
    <text x="450" y="60">co dělat (mandatory)</text>
    <text x="450" y="100">jak konkrétně (mandatory)</text>
    <text x="450" y="140">kroky (mandatory)</text>
    <text x="450" y="180">doporučení (advisory)</text>
  </g>
</svg>
:::

### Politika (policy)

*Vysoká úroveň* — říká, co se má dělat a proč.

- „All sensitive data must be encrypted in transit and at rest." (Všechna citlivá data musí být šifrována při přenosu i v úložišti.)
- Schvaluje ji vrcholové vedení (top management).
- Je krátká (1–10 stran).
- Vyžaduje podpis (sign-off) od CEO/CISO.

### Standard

*Konkrétní* technické požadavky (specific technical requirements).

- „All HTTPS communications must use TLS 1.2 or higher with approved cipher suites." (Veškerá komunikace přes HTTPS musí používat TLS 1.2 nebo vyšší se schválenými sadami šifer.)
- Schvaluje ho CISO / ředitel bezpečnosti (Security Director).
- Je středně dlouhý (5–20 stran na téma).
- Je závazný (mandatory).

### Procedura (procedure)

Návod krok za krokem (step-by-step instructions).

- „To rotate the database encryption key: 1. ... 2. ... 3. ..." (Postup rotace šifrovacího klíče databáze: 1. ... 2. ... 3. ...)
- Vlastní ji provozní tým (operations team).
- Je podrobná (5–50 stran na proceduru).
- Je závazná pro provoz.

### Směrnice (guideline)

Osvědčené postupy a doporučení (best practices, recommendations).

- „We recommend monitoring DNS traffic for sinkhole detection." (Doporučujeme monitorovat DNS provoz kvůli detekci sinkhole.)
- Má doporučující charakter (advisory) — není závazná.
- Bývá vázaná na konkrétního dodavatele (vendor-specific) nebo na daný kontext.

## Typy politik

### Podniková politika (enterprise policy)

Nejvyšší úroveň, platí pro celou organizaci.

- „Information Security Policy" — celkový postoj organizace k bezpečnosti.
- „Acceptable Use Policy (AUP)" — co uživatelé smějí a nesmějí dělat.
- „Privacy Policy" — nakládání s daty.

### Politika k danému tématu (issue-specific)

Pokrývá *konkrétní* technologii nebo problém.

- „Email Policy" — používání, retence, monitorování.
- „BYOD Policy" — používání vlastních zařízení (bring-your-own-device).
- „Remote Work Policy" — práce na dálku.
- „Password Policy" — hesla.

### Politika k danému systému (system-specific)

Vztahuje se k *jednomu konkrétnímu* systému.

- „ERP Security Policy".
- „Payment Processing Security Policy".

## Komponenty bezpečnostní politiky

Standardní struktura:

### 1. Účel (purpose)

*Proč* politika existuje a jakou byznysovou potřebu (business need) řeší.

```
The purpose of this policy is to establish requirements for protecting 
organizational information and information systems from threats, both 
internal and external...
```

### 2. Rozsah platnosti (scope)

*Kde* a *na koho* se politika vztahuje.

```
This policy applies to all employees, contractors, vendors, and any 
party with access to organizational information systems.
```

### 3. Vlastní ustanovení politiky (policy statements)

*Co* je vyžadováno a co je zakázáno.

```
1. All systems handling sensitive data MUST encrypt data in transit 
   using TLS 1.2 or higher.
2. Authentication credentials MUST NOT be shared between individuals.
3. All security incidents MUST be reported to the Security Operations 
   Center within 4 hours of discovery.
```

Pozn.: výslovně používejte klíčová slova podle RFC 2119 (MUST, MUST NOT, SHOULD, MAY).

### 4. Role a odpovědnosti (roles & responsibilities)

*Kdo* za co odpovídá.

```
CISO is responsible for:
   - Approving security policies
   - Reviewing risk assessments
   - Approving exceptions

System Administrators are responsible for:
   - Implementing technical controls
   - Patch management
   - Monitoring system logs
```

### 5. Soulad a vymáhání (compliance & enforcement)

*Co se stane*, pokud někdo politiku nedodrží.

```
Violations may result in disciplinary action up to and including 
termination of employment.
```

### 6. Výjimky (exceptions)

*Proces* pro udělování výjimek (exemptions).

```
Any exception to this policy must be:
   - Documented with business justification
   - Reviewed by CISO
   - Approved by CISO/CEO
   - Time-limited (review annually)
```

### 7. Definice (definitions)

Slovníček technických pojmů.

### 8. Reference (references)

Související politiky, standardy a předpisy.

### 9. Historie revizí (revision history)

Datum, autor a shrnutí změn.

### 10. Schvalovací podpisy (approval signatures)

CEO / CISO / právní oddělení a podobně.

## Psaní — osvědčené postupy

### Buďte konkrétní

❌ „All systems should be secure." (Všechny systémy by měly být bezpečné.)

✓ „Systems handling Confidential data must be patched within 30 days of security update release." (Systémy zpracovávající důvěrná data musí být aktualizovány do 30 dnů od vydání bezpečnostní aktualizace.)

### Používejte klíčová slova podle RFC 2119

- **MUST** / **MUST NOT** — absolutní požadavek.
- **SHOULD** / **SHOULD NOT** — silné doporučení.
- **MAY** — volitelné.

Vyhněte se nejednoznačným výrazům jako „important", „as soon as possible" nebo „best efforts".

### Navažte politiku na byznys

Politika musí být *navázána* na byznysové cíle (business goals). „Proč" by mělo být jasné.

❌ „Use strong passwords." (Používejte silná hesla.)

✓ „To protect customer data and meet PCI DSS Requirement 8, all user accounts must use passwords meeting [Password Policy] requirements." (Kvůli ochraně dat zákazníků a splnění požadavku PCI DSS Requirement 8 musí všechny uživatelské účty používat hesla splňující požadavky [Password Policy].)

### Vyhněte se implementačním detailům

Politika říká *co*, nikoli *jak* (to je úkol procedury).

❌ „Use ssh -i ~/.ssh/keyfile.pem user@server."

✓ „Remote access to production systems must use cryptographically secure protocols (SSH, VPN) with strong authentication." (Vzdálený přístup k produkčním systémům musí používat kryptograficky bezpečné protokoly (SSH, VPN) se silnou autentizací (authentication).)

### Pište čitelně

- Srozumitelný jazyk. Pokud to jde, vyhněte se žargonu.
- Krátké věty.
- Nadpisy a odrážky.
- Příklady.

Pokud uživatelé politiku *nedokážou přečíst*, nemohou se jí ani *řídit*.

### Udržujte ji životaschopnou

- Revidujte ji každý rok.
- Aktualizujte ji, když se mění technologie.
- Archivujte staré verze.

Zastaralá politika je horší než žádná — vytváří totiž falešný pocit bezpečí.

## Příklady standardů

### Standard pro hesla (Password Standard)

```
Section 4: Requirements

4.1 Length
    Passwords MUST be at least 12 characters long.

4.2 Complexity
    Passwords MUST contain at least 3 of:
        - Lowercase letter
        - Uppercase letter
        - Number
        - Special character

4.3 Rotation
    Passwords MUST be changed if compromise is suspected.
    Periodic rotation (every X days) is NOT REQUIRED unless 
    risk assessment indicates need.

4.4 History
    The last 5 passwords MUST NOT be reused.

4.5 Multi-Factor Authentication
    All accounts with privileged access MUST use MFA.
```

Pozn.: NIST SP 800-63B (2017 a novější) výslovně *nedoporučuje* povinnou periodickou rotaci hesel — lidé si pak volí slabší hesla nebo si je zapisují.

### Standard pro šifrování (Encryption Standard)

```
Section 5: Approved Algorithms

5.1 Symmetric encryption
    - MUST use AES with 128-bit key minimum
    - PREFERRED: AES-256-GCM
    - MUST NOT use DES, 3DES, RC4

5.2 Asymmetric encryption
    - MUST use RSA-2048 minimum, RSA-3072 preferred
    - PREFERRED: ECC P-256, P-384
    - MUST NOT use ECDH with insecure curves

5.3 Hash functions
    - MUST use SHA-256, SHA-384, SHA-512, or SHA-3
    - MUST NOT use MD5, SHA-1 (except for non-security purposes)

5.4 Key Management
    - Keys MUST be stored in HSM, KMS, or hardware secure module
    - Keys MUST be rotated annually OR when compromise suspected
```

## Osvěta a školení

Politika bez *školení* je ignorovaná.

- Školení nových zaměstnanců (new hire orientation) zahrnuje i bezpečnostní politiku.
- Každoroční opakovací školení.
- Simulované phishingové kampaně.
- Školení k jednotlivým tématům (nácvik reakce na incident, sociální inženýrství).

KnowBe4, SANS a Proofpoint jsou poskytovatelé obsahu pro bezpečnostní školení.

## Časté chyby

- **Příliš dlouhá** — stostránkovou politiku nikdo nečte.
- **Příliš vágní** — „dělejte správnou věc".
- **Zastaralá** — naposledy revidovaná v roce 2010.
- **Konflikty** — jednotlivé politiky si navzájem odporují.
- **Bez vlastníka** — nikdo neví, kdo ji spravuje.
- **Bez vymáhání** — je sepsaná, ale nikdo ji nedodržuje.

Politika je *žijící dokument*. Udržujte ji.

## Šablony z praxe

Mnoho organizací své politiky *zveřejňuje* (skvělý zdroj k učení):

- **State of Indiana** — Information Security Framework.
- **NIST** — ukázkové politiky ve svých Special Publications.
- **SANS** — šablony politik ([sans.org/information-security-policy](https://www.sans.org/information-security-policy/)).
- **ISO 27001** — opatření z přílohy Annex A se mapují na konkrétní politiky.

---

*Zdroj: BIS přednášky 2025/26, Ing. Kamil Malinka, Ph.D., FIT VUT v Brně. Externí reference: NIST SP 800-12 Rev 1 — Introduction to Information Security; NIST SP 800-63B — Digital Identity Guidelines (password recommendations) ([pages.nist.gov/800-63-3](https://pages.nist.gov/800-63-3/sp800-63b.html)); SANS Information Security Policy Templates ([sans.org](https://www.sans.org/information-security-policy/)); RFC 2119 — Key words for use in RFCs to Indicate Requirement Levels; Whitman, M.E., Mattord, H.J.: „Management of Information Security" (5th ed., Cengage 2017), §6.*
