---
title: Bell-LaPadula model — confidentiality
---

# Bell-LaPadula (BLP) — formal model důvěrnosti

**Bell-LaPadula** (David Elliott Bell, Leonard LaPadula, 1973) je *první formální* security model — určen pro vojenské systémy klasifikace dat. Cíl: **prevent flow of high-classified information to low-clearance subjects**.

## Klasifikace a clearance

### Levels (totally ordered)

| Level | Symbol | Order |
| :--- | :---: | :---: |
| Unclassified | U | 0 |
| Confidential | C | 1 |
| Secret | S | 2 |
| Top Secret | TS | 3 |

Hierarchical: TS > S > C > U.

### Categories (compartments)

*Lattice* (partially ordered). Examples:

```
{NUCLEAR, CRYPTO, EUROPEAN, ASIAN}
```

User clearance / Object label = `(Level, Categories)`.

### Dominance relation

`L1 dom L2` iff:

- `Level(L1) >= Level(L2)`, AND
- `Categories(L1) ⊇ Categories(L2)`.

Formally: `L1 dom L2 ↔ L1 ≽ L2` in lattice.

::: svg "BLP lattice — levels × categories"
<svg viewBox="0 0 540 246" font-family="ui-sans-serif, system-ui" font-size="10">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5">
    <circle cx="270" cy="40" r="22"/>
    <circle cx="170" cy="100" r="22"/>
    <circle cx="370" cy="100" r="22"/>
    <circle cx="70" cy="130" r="22"/>
    <circle cx="270" cy="160" r="22"/>
    <circle cx="470" cy="130" r="22"/>
    <circle cx="270" cy="220" r="22"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="9">
    <text x="270" y="44">TS,{N,C}</text>
    <text x="170" y="104">TS,{N}</text>
    <text x="370" y="104">TS,{C}</text>
    <text x="70" y="134">S,{N}</text>
    <text x="270" y="164">S,{}</text>
    <text x="470" y="134">S,{C}</text>
    <text x="270" y="224">U,{}</text>
  </g>
  <g stroke="var(--text)" fill="none" stroke-width="0.8">
    <line x1="270" y1="62" x2="170" y2="100"/>
    <line x1="270" y1="62" x2="370" y2="100"/>
    <line x1="170" y1="122" x2="70" y2="130"/>
    <line x1="370" y1="122" x2="470" y2="130"/>
    <line x1="70" y1="152" x2="270" y2="160"/>
    <line x1="470" y1="152" x2="270" y2="160"/>
    <line x1="270" y1="182" x2="270" y2="220"/>
  </g>
  <text x="270" y="15" text-anchor="middle" fill="var(--text-faint)" font-size="9">TS = Top Secret, S = Secret, U = Unclassified; N = NUCLEAR, C = CRYPTO</text>
</svg>
:::

## BLP Rules

### Simple Security Property — "no read up"

Subject `s` can *read* object `o` iff `clearance(s) dom label(o)`.

Subject TS can read TS, S, C, U. But Secret can NOT read TS.

⇒ Prevents *reading higher-classified*.

### *-Property (star property) — "no write down"

Subject `s` can *write* object `o` iff `label(o) dom clearance(s)`.

TS subject can write TS, *not* S, C, U.

⇒ Prevents *leakage* — TS subject cannot copy TS info to S file.

::: svg "BLP rules — no read up, no write down"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="20" y="20" width="100" height="30" rx="3"/>
    <rect x="20" y="60" width="100" height="30" rx="3"/>
    <rect x="20" y="100" width="100" height="30" rx="3"/>
    <rect x="20" y="140" width="100" height="30" rx="3"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-weight="600">
    <text x="70" y="40">Top Secret</text>
    <text x="70" y="80">Secret</text>
    <text x="70" y="120">Confidential</text>
    <text x="70" y="160">Unclassified</text>
  </g>
  <g fill="var(--accent)" opacity="0.2">
    <rect x="200" y="60" width="100" height="50" rx="3" stroke="var(--accent)" stroke-width="1" fill-opacity="0.2"/>
  </g>
  <text x="250" y="80" text-anchor="middle" fill="var(--text)" font-weight="600">Secret subject</text>
  <text x="250" y="95" text-anchor="middle" fill="var(--text-muted)" font-size="9">read + write</text>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none">
    <path d="M250,60 L130,40" marker-end="url(#bx-ar)"/>
  </g>
  <text x="148" y="30" fill="var(--accent-line)" font-size="9.5" font-weight="600">✗ read up (write up ✓)</text>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none">
    <path d="M250,80 L130,80" marker-end="url(#bx-ar)"/>
  </g>
  <text x="152" y="78" fill="var(--text)" font-size="10">R+W ✓</text>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none">
    <path d="M250,100 L130,120" marker-end="url(#bx-ar)"/>
  </g>
  <text x="148" y="120" fill="var(--text)" font-size="9.5">read down ✓ (write down ✗)</text>
  <g stroke="var(--accent-line)" stroke-width="1.5" fill="none">
    <path d="M250,110 L130,160" marker-end="url(#bx-ar)"/>
  </g>
  <text x="150" y="155" fill="var(--accent-line)" font-size="9.5" font-weight="600">✗ write down (read down ✓)</text>
  <text x="380" y="100" text-anchor="middle" fill="var(--text-faint)" font-size="9">Secret subject:</text>
  <text x="380" y="115" text-anchor="middle" fill="var(--text-faint)" font-size="9">• read Secret + Confidential + Unclassified ✓</text>
  <text x="380" y="130" text-anchor="middle" fill="var(--text-faint)" font-size="9">• write Secret + Top Secret ✓</text>
  <defs>
    <marker id="bx-ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

### Discretionary Security Property

DAC component — also need owner's permission. BLP just *adds* MAC layer on top of DAC.

## Trusted subjects

Některé subjekty *jsou důvěryhodné* a mohou *break* BLP rules controlled way:

- **TS auditor** může write logs to U file (controlled write-down).
- **Crypto officer** může declassify under formal review.

Trusted subjects mají *zvláštní* clearance ("trusted" bit).

## Strong vs Weak Tranquility

- **Strong tranquility** — labels *never* change after assignment.
- **Weak tranquility** — labels can change *if* policy allows.

Most systems weak — necessary for re-classification, declassification.

## Příklad — TS spy {tier=example}

Spy klasifikován jako TS. Wants to leak TS document to unclassified email.

1. Read TS document (BLP allows, dom relationship OK).
2. Try write to U email — BLP denies "no write down".

Even if spy *malicious*, BLP *prevents* the leak architecturally.

But: covert channels (timing, output magnitude) can leak — BLP doesn't cover.

::: viz blp-access-checker "Nastav clearance subjektu a label objektu; sleduj read/write verdict. 'No read up' brání čtení vyšších; 'no write down' brání leakage do nižších."
:::

## Limity BLP

- **Confidentiality only** — žádné integrity (low-clearance subject can modify their own data, even if high-classified relies on it).
- **No availability**.
- **High labels accumulate** — subject reads lots of data, accumulates classifications.
- **Awkward in practice** — many real workflows need *occasional* declassification.
- **Covert channels** — timing, storage covert channels bypass MAC.

## Bell-LaPadula v praxi {tier=practice}

- **Trusted Solaris (1993)** — MLS Solaris.
- **HP-UX BLS** (B-Level Security).
- **SELinux MLS** — optional Multi-Level Security policy.
- **Trusted Extensions** (Oracle Solaris) — current MLS for OS.

Commercial *general-purpose* OS *don't* implement BLP. Vojenské + intelligence sítě (SIPRNet, JWICS) do.

## BLP vs reality {tier=practice}

Most enterprise data is *not* tagged with sensitivity labels.

V skutečnosti modern security uses:

- **RBAC** ([[rbac-abac]]) — role-based.
- **ABAC** — attribute-based.
- **Data Loss Prevention** (DLP) — content-aware controls.

BLP zůstává *theoretical foundation* — mnohem real systems *inspired by* BLP without strict implementation.

## Vztah k Biba

Biba ([[biba-clark-wilson]]) je *dual* — pro integrity. Rules *opposite*:

- **No read down** (don't contaminate from low-integrity).
- **No write up** (don't promote bad data).

Real system needs *both* — confidentiality + integrity:

- **Dual-label** — every object has BLP label + Biba label.
- **Lattice product** — combined model.

Implementace komplexní, rarely deployed.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Bell, D.E., LaPadula, L.J.: „Secure Computer Systems: Mathematical Foundations" (MITRE M74-244, 1973, [PDF](https://apps.dtic.mil/sti/pdfs/AD0770768.pdf)); Bishop, M.: „Computer Security: Art and Science" (2nd ed., Addison-Wesley 2018), §5; Anderson, R.: „Security Engineering" (3rd ed., Wiley 2020), §9.*
