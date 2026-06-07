---
title: RBAC a ABAC — podnikové řízení přístupu
---

# RBAC a ABAC — moderní podnikové řízení přístupu (access control)

DAC ([[dac-mac]]) je *příliš jemnozrnné* — spravovat tisíce uživatelů × tisíce objektů je neudržitelné. MAC je zase *příliš rigidní* pro firemní prostředí. **RBAC** (Role-Based Access Control, NIST 1992) řeší spravovatelnost. **ABAC** (Attribute-Based Access Control) jde ještě dál — umožňuje rozhodování podle kontextu (context-aware decisions).

## RBAC — řízení přístupu podle rolí (Role-Based Access Control)

Uživatelé → role → oprávnění.

Princip: *role* je vrstva abstrakce mezi uživateli a oprávněními (permissions). Oprávnění se přiřazují roli, nikoli přímo uživateli. Uživatel se pak přiřadí k roli.

::: svg "RBAC — uživatelé → role → oprávnění"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="10">
  <text x="80" y="25" text-anchor="middle" fill="var(--text)" font-weight="600">Users</text>
  <text x="270" y="25" text-anchor="middle" fill="var(--text)" font-weight="600">Roles</text>
  <text x="460" y="25" text-anchor="middle" fill="var(--text)" font-weight="600">Permissions</text>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="30" y="40" width="100" height="22" rx="2"/>
    <rect x="30" y="70" width="100" height="22" rx="2"/>
    <rect x="30" y="100" width="100" height="22" rx="2"/>
    <rect x="30" y="130" width="100" height="22" rx="2"/>
    <rect x="220" y="55" width="100" height="22" rx="2"/>
    <rect x="220" y="85" width="100" height="22" rx="2"/>
    <rect x="220" y="115" width="100" height="22" rx="2"/>
    <rect x="410" y="40" width="100" height="22" rx="2"/>
    <rect x="410" y="70" width="100" height="22" rx="2"/>
    <rect x="410" y="100" width="100" height="22" rx="2"/>
    <rect x="410" y="130" width="100" height="22" rx="2"/>
    <rect x="410" y="160" width="100" height="22" rx="2"/>
  </g>
  <g fill="var(--text)" font-size="10">
    <text x="80" y="55" text-anchor="middle">alice</text>
    <text x="80" y="85" text-anchor="middle">bob</text>
    <text x="80" y="115" text-anchor="middle">carol</text>
    <text x="80" y="145" text-anchor="middle">dave</text>
    <text x="270" y="70" text-anchor="middle">manager</text>
    <text x="270" y="100" text-anchor="middle">developer</text>
    <text x="270" y="130" text-anchor="middle">auditor</text>
    <text x="460" y="55" text-anchor="middle">read_code</text>
    <text x="460" y="85" text-anchor="middle">deploy</text>
    <text x="460" y="115" text-anchor="middle">approve_PR</text>
    <text x="460" y="145" text-anchor="middle">read_logs</text>
    <text x="460" y="175" text-anchor="middle">delete_log</text>
  </g>
  <g stroke="var(--accent)" stroke-width="0.8" fill="none">
    <line x1="130" y1="51" x2="220" y2="65"/>
    <line x1="130" y1="51" x2="220" y2="95"/>
    <line x1="130" y1="81" x2="220" y2="95"/>
    <line x1="130" y1="111" x2="220" y2="125"/>
    <line x1="130" y1="141" x2="220" y2="95"/>
    <line x1="320" y1="65" x2="410" y2="51"/>
    <line x1="320" y1="65" x2="410" y2="111"/>
    <line x1="320" y1="95" x2="410" y2="51"/>
    <line x1="320" y1="95" x2="410" y2="81"/>
    <line x1="320" y1="125" x2="410" y2="141"/>
  </g>
</svg>
:::

### Model NIST RBAC (1992, 2000)

Skládá se ze 4 úrovní:

1. **RBAC-0 / Core** — uživatelé, role, oprávnění a relace (sessions).
2. **RBAC-1 / Hierarchical** — dědičnost rolí (manager dědí oprávnění role developer).
3. **RBAC-2 / Constrained** — omezení (vzájemné vyloučení, kardinalita, oddělení povinností).
4. **RBAC-3 / Combined** — kombinace RBAC-1 a RBAC-2.

### Hierarchie rolí

```
        Admin
       /     \
   Manager   Auditor
       \     /
       Developer
            |
        Reader
```

Manager dědí oprávnění role Developer plus svá vlastní. Admin dědí úplně všechno.

Hierarchická varianta RBAC omezuje takzvanou *explozi rolí* (role explosion) — tedy stav, kdy rolí přibývá tolik, že se ztrácí přehled.

### Omezení (constraints)

- **Vzájemně se vylučující role** — uživatel nemůže mít současně roli `cashier` i `auditor`.
- **Kardinalita** — roli `senior_admin` mohou mít nejvýše 2 uživatelé.
- **Oddělení povinností (separation of duties)** — uživatel, který spustí platbu (`initiate_payment`), nesmí být týž, kdo ji schvaluje (`approve_payment`).

### RBAC v praxi

- **Active Directory** — skupiny fungují jako role.
- **Linux** — `groups`, `sudoers`.
- **AWS IAM** — role a politiky (policies).
- **Kubernetes** — RBAC pro prostředky clusteru.
- **Databáze** — role, příkazy GRANT/REVOKE.

### Omezení RBAC

- **Exploze rolí** — příliš mnoho rolí (podle oddělení × podle projektu × podle regionu).
- **Statičnost** — model se nepřizpůsobuje kontextu (denní době, poloze, míře rizika).
- **Dědičnost oprávnění** — bývá těžké zjistit, „kdo vlastně smí udělat X".

⇒ Tyto nedostatky odstraňuje ABAC.

## ABAC — řízení přístupu podle atributů (Attribute-Based Access Control)

Rozhodování se opírá o **atributy** těchto entit:

- **Subjekt** — role, oddělení, prověření (clearance), poloha, zařízení.
- **Objekt** — citlivost, vlastník, typ.
- **Prostředí (environment)** — čas, síťová zóna, úroveň hrozby (threat level).
- **Akce** — čtení, zápis, smazání.

### Vyjádření politiky

```
Allow if:
   subject.role == "doctor" AND
   subject.department == object.department AND
   subject.location == "hospital_network" AND
   environment.time IN business_hours AND
   action IN {read, write_notes}
```

oproti RBAC:

```
Role "doctor" has permissions: read_patient, write_notes
```

Podmínka v ABAC je pružnější. Statická role v RBAC nedokáže zachytit čas, polohu a podobné okolnosti.

### XACML — eXtensible Access Control Markup Language

Standard organizace OASIS pro vyjadřování a vynucování politik ABAC. Je založen na XML.

Skládá se z těchto komponent:

- **PEP** (Policy Enforcement Point) — střeží přístup ke zdroji.
- **PDP** (Policy Decision Point) — vyhodnocuje politiku.
- **PIP** (Policy Information Point) — dodává atributy.
- **PAP** (Policy Administration Point) — spravuje politiky.

Průběh rozhodování:

1. Subjekt si vyžádá přístup u PEP.
2. PEP se dotáže PDP s údaji o subjektu, objektu a akci.
3. PDP si vyžádá atributy od PIP.
4. PDP vyhodnotí politiku.
5. Vrátí výsledek: Permit / Deny / Not Applicable / Indeterminate (povolit / zamítnout / nepoužitelné / neurčité).

Nasazení je složité. *Koncepční* model se používá široce, samotná XML podoba XACML *populární není*.

### Moderní nástroje pro ABAC

- **AWS IAM s podmínkami** — částečná podpora ABAC.
- **Azure RBAC s podmínkami** — ABAC v prostředí Azure.
- **Open Policy Agent (OPA)** — moderní rozhodovací stroj pro politiky, jazyk Rego.
- **Cedar** (AWS, 2023) — jazyk pro politiky navržený přímo k tomuto účelu.
- **Casbin** — knihovna politik pro více programovacích jazyků.

### Příklad OPA Rego

```rego
package authz

default allow = false

allow {
    input.subject.role == "doctor"
    input.subject.department == input.resource.patient.department
    input.environment.location == "hospital_network"
    input.action in ["read", "write_notes"]
    business_hours(input.environment.time)
}

business_hours(t) {
    t >= "08:00"
    t <= "18:00"
}
```

OPA vyhodnotí kód v jazyce Rego a vrátí povolení, nebo zamítnutí.

## RBAC vs. ABAC

| | RBAC | ABAC |
| :--- | :--- | :--- |
| Rozhodovací faktor | role | atributy |
| Zohlednění kontextu | ne | ano |
| Granularita | hrubá | jemná |
| Implementace | jednoduchá | složitá |
| Ladění | snadné | obtížné |
| Rozšíření | vysoké | rostoucí |

Mnoho organizací *začíná* s RBAC a postupně *přechází* k hybridu RBAC + ABAC.

## Hybridní přístup — politikami řízené (Policy-Based)

Moderní systémy obě varianty kombinují:

- **RBAC** pro *hrubá* rozhodnutí (jakou má uživatel roli).
- **ABAC** pro *jemnozrnná* rozhodnutí a kontext (kdy, kde, co).

Příklad AWS IAM:

```json
{
  "Effect": "Allow",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::mybucket/*",
  "Condition": {
    "StringEquals": {"aws:PrincipalTag/Department": "Engineering"},
    "IpAddress": {"aws:SourceIp": "192.0.2.0/24"},
    "DateGreaterThan": {"aws:CurrentTime": "2024-01-01T00:00:00Z"}
  }
}
```

Akce řízená rolí v kombinaci s podmínkami ABAC.

::: viz rbac-abac-evaluator "Změň roli uživatele, oddělení, denní dobu, příznak přítomnosti na místě (on-site) a akci → uvidíš verdikt RBAC (jen podle role) vs. ABAC (role + kontext). ABAC dovolí výjimky a omezení, která RBAC nezvládá."
:::

## Identity-Aware Proxy

Google IAP, Cloudflare Access — požadavky *vedou* přes ověření identity.

```
client → IAP → app
        ↓
       Verify identity, check policy, allow/deny
```

Moderní vzor nulové důvěry (zero-trust). Nad ním pak běží politiky ABAC.

## ReBAC — řízení přístupu podle vztahů (Relationship-Based Access Control)

Nejnovější přístup. Oprávnění se odvozují ze *vztahů* (modelovaných jako graf).

- „Alice smí upravit dokument, POKUD ho Alice vlastní NEBO ho vlastní Alicin tým."
- „Uživatel smí zobrazit fotku, POKUD je na ní zachycen NEBO sleduje jejího vlastníka."

Využívají to: Google Zanzibar (publikace 2019), sociální sítě a moderní SaaS.

Nástroje: **OpenFGA**, **SpiceDB**, Google Zanzibar (interní).

---

*Zdroj: BIS přednášky 2025/26, Ing. Kamil Malinka, Ph.D., FIT VUT v Brně. Externí reference: Sandhu, R.S. et al.: „Role-Based Access Control Models" (IEEE Computer 29(2), 1996, [DOI 10.1109/2.485845](https://doi.org/10.1109/2.485845)); NIST SP 800-162 — Guide to ABAC ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-162.pdf)); Pang, R. et al.: „Zanzibar: Google's Consistent, Global Authorization System" (USENIX ATC 2019); [Open Policy Agent](https://www.openpolicyagent.org/); [OpenFGA](https://openfga.dev/).*
