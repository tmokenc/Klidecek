---
title: RBAC a ABAC — enterprise access control
---

# RBAC a ABAC — moderní enterprise access control

DAC ([[dac-mac]]) je *too granular* — managing thousands of users × thousands of objects = unmanageable. MAC je *too rigid* pro business. **RBAC** (Role-Based Access Control, NIST 1992) řeší managability. **ABAC** (Attribute-Based Access Control) jde dál — context-aware decisions.

## RBAC — Role-Based Access Control

Users → Roles → Permissions.

Princip: *role* je *abstraction* mezi user + permissions. Permissions připisuje roli, ne user. User assignuje k roli.

::: svg "RBAC — Users → Roles → Permissions"
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

### NIST RBAC model (1992, 2000)

4 levels:

1. **RBAC-0 / Core** — Users, Roles, Permissions, Sessions.
2. **RBAC-1 / Hierarchical** — Role inheritance (manager inherits developer's perms).
3. **RBAC-2 / Constrained** — Constraints (mutual exclusion, cardinality, separation of duties).
4. **RBAC-3 / Combined** — RBAC-1 + RBAC-2.

### Role hierarchy

```
        Admin
       /     \
   Manager   Auditor
       \     /
       Developer
            |
        Reader
```

Manager inherits Developer permissions + own. Admin inherits everything.

Hierarchical RBAC reduces *role explosion*.

### Constraints

- **Mutually exclusive roles** — user can't have both `cashier` and `auditor`.
- **Cardinality** — only 2 users can have `senior_admin` role.
- **Separation of duties** — `initiate_payment` user ≠ `approve_payment` user.

### Practical RBAC

- **Active Directory** — groups = roles.
- **Linux** — `groups`, `sudoers`.
- **AWS IAM** — roles + policies.
- **Kubernetes** — RBAC for cluster resources.
- **Databases** — roles, GRANT/REVOKE.

### RBAC limitations

- **Role explosion** — too many roles (per department × per project × per region).
- **Static** — doesn't adapt to context (time of day, location, risk).
- **Permission inheritance** — hard to debug "who can do X".

⇒ ABAC fixes these.

## ABAC — Attribute-Based Access Control

Decisions based on **attributes** of:

- **Subject** — role, department, clearance, location, device.
- **Object** — sensitivity, owner, type.
- **Environment** — time, network zone, threat level.
- **Action** — read, write, delete.

### Policy expression

```
Allow if:
   subject.role == "doctor" AND
   subject.department == object.department AND
   subject.location == "hospital_network" AND
   environment.time IN business_hours AND
   action IN {read, write_notes}
```

vs RBAC:

```
Role "doctor" has permissions: read_patient, write_notes
```

ABAC *condition* more flexible. RBAC *static role* doesn't capture time, location, etc.

### XACML — eXtensible Access Control Markup Language

OASIS standard for ABAC policy expression + enforcement. XML-based.

Components:

- **PEP** (Policy Enforcement Point) — guards resource.
- **PDP** (Policy Decision Point) — evaluates policy.
- **PIP** (Policy Information Point) — provides attributes.
- **PAP** (Policy Administration Point) — manages policies.

Flow:

1. Subject requests access at PEP.
2. PEP queries PDP with subject + object + action.
3. PDP retrieves attributes from PIPs.
4. PDP evaluates policy.
5. Returns: Permit / Deny / Not Applicable / Indeterminate.

Complex to deploy. *Conceptual* model widely used; XACML XML *not popular*.

### Modern ABAC tools

- **AWS IAM with conditions** — partial ABAC.
- **Azure RBAC + conditions** — ABAC on Azure.
- **Open Policy Agent (OPA)** — modern policy engine, Rego language.
- **Cedar** (AWS, 2023) — purpose-built policy language.
- **Casbin** — multi-language policy library.

### OPA Rego example

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

OPA evaluates Rego, returns allow/deny.

## RBAC vs ABAC

| | RBAC | ABAC |
| :--- | :--- | :--- |
| Decision factor | Role | Attributes |
| Context-aware | No | Yes |
| Granularity | Coarse | Fine |
| Implementation | Simple | Complex |
| Debug | Easy | Hard |
| Adoption | High | Growing |

Many organizations *start* RBAC, *evolve* to RBAC+ABAC hybrid.

## Hybrid — Policy-Based

Modern systems combine:

- **RBAC** for *coarse* decisions (which role).
- **ABAC** for *fine-grained* + context (when, where, what).

Example AWS IAM:

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

Role-based action + ABAC conditions.

::: viz rbac-abac-evaluator "Změň user role, dept, čas dne, on-site flag, akci → uvidíš RBAC verdict (jen role) vs ABAC (role + kontext). ABAC dovolí výjimky / restrictions, které RBAC nezvládá."
:::

## Identity-Aware Proxy

Google IAP, Cloudflare Access — *route* requests through identity check.

```
client → IAP → app
        ↓
       Verify identity, check policy, allow/deny
```

Modern zero-trust pattern. ABAC policies on top.

## ReBAC — Relationship-Based Access Control

Newest paradigm. Permissions based on *relationships* (graph).

- "Alice can edit document IF Alice owns document OR Alice's team owns document."
- "User can view photo IF user is in photo OR follows photo's owner."

Used by: Google Zanzibar (paper 2019), social networks, modern SaaS.

Tools: **OpenFGA**, **SpiceDB**, Google Zanzibar (internal).

---

*Zdroj: BIS přednášky 2025/26, Ing. Kamil Malinka, Ph.D., FIT VUT v Brně. Externí reference: Sandhu, R.S. et al.: „Role-Based Access Control Models" (IEEE Computer 29(2), 1996, [DOI 10.1109/2.485845](https://doi.org/10.1109/2.485845)); NIST SP 800-162 — Guide to ABAC ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-162.pdf)); Pang, R. et al.: „Zanzibar: Google's Consistent, Global Authorization System" (USENIX ATC 2019); [Open Policy Agent](https://www.openpolicyagent.org/); [OpenFGA](https://openfga.dev/).*
