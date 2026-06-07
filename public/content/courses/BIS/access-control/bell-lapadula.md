---
title: Model Bell-LaPadula — důvěrnost
---

# Bell-LaPadula (BLP) — formální model důvěrnosti

**Bell-LaPadula** (David Elliott Bell, Leonard LaPadula, 1973) je *první formální* bezpečnostní model (security model) — navržený pro vojenské systémy klasifikace dat. Jeho cílem je **zabránit toku vysoce utajovaných informací k subjektům s nízkým oprávněním**.

## Klasifikace a oprávnění (clearance)

### Úrovně utajení (úplně uspořádané)

| Úroveň | Symbol | Pořadí |
| :--- | :---: | :---: |
| Neutajované (Unclassified) | U | 0 |
| Důvěrné (Confidential) | C | 1 |
| Tajné (Secret) | S | 2 |
| Přísně tajné (Top Secret) | TS | 3 |

Úrovně jsou hierarchické: TS > S > C > U.

### Kategorie (compartments)

Kategorie tvoří *svaz* (lattice, částečně uspořádanou množinu). To znamená, že na rozdíl od úrovní spolu nemusí být porovnatelné každá s každou. Příklady kategorií:

```
{NUCLEAR, CRYPTO, EUROPEAN, ASIAN}
```

Oprávnění uživatele (clearance) i štítek (label) objektu mají tvar `(Úroveň, Kategorie)`.

### Relace dominance

Platí `L1 dom L2` (čteme „L1 dominuje L2") právě tehdy, když:

- `Úroveň(L1) >= Úroveň(L2)`, A ZÁROVEŇ
- `Kategorie(L1) ⊇ Kategorie(L2)` (kategorie L1 jsou nadmnožinou kategorií L2).

Formálně: `L1 dom L2 ↔ L1 ≽ L2` ve svazu.

::: svg "Svaz BLP — úrovně × kategorie"
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

## Pravidla BLP

### Simple Security Property — „no read up" (nečíst nahoru)

Subjekt `s` smí *číst* objekt `o` právě tehdy, když `clearance(s) dom label(o)`.

Subjekt s oprávněním TS smí číst TS, S, C i U. Subjekt Secret ale NESMÍ číst TS.

⇒ Toto pravidlo brání *čtení informací s vyšším utajením*.

### *-Property (hvězdičkové pravidlo) — „no write down" (nezapisovat dolů)

Subjekt `s` smí *zapisovat* do objektu `o` právě tehdy, když `label(o) dom clearance(s)`.

Subjekt TS smí zapisovat do objektů TS, ale *nikoli* do S, C, U.

⇒ Toto pravidlo brání *úniku informací* — subjekt TS nemůže zkopírovat informaci utajenou jako TS do souboru klasifikovaného jako S.

::: svg "Pravidla BLP — no read up, no write down"
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
  <text x="250" y="80" text-anchor="middle" fill="var(--text)" font-weight="600">subjekt Secret</text>
  <text x="250" y="95" text-anchor="middle" fill="var(--text-muted)" font-size="9">čtení + zápis</text>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none">
    <path d="M250,60 L130,40" marker-end="url(#bx-ar)"/>
  </g>
  <text x="148" y="30" fill="var(--accent-line)" font-size="9.5" font-weight="600">✗ čtení nahoru (zápis nahoru ✓)</text>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none">
    <path d="M250,80 L130,80" marker-end="url(#bx-ar)"/>
  </g>
  <text x="152" y="78" fill="var(--text)" font-size="10">Č+Z ✓</text>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none">
    <path d="M250,100 L130,120" marker-end="url(#bx-ar)"/>
  </g>
  <text x="148" y="120" fill="var(--text)" font-size="9.5">čtení dolů ✓ (zápis dolů ✗)</text>
  <g stroke="var(--accent-line)" stroke-width="1.5" fill="none">
    <path d="M250,110 L130,160" marker-end="url(#bx-ar)"/>
  </g>
  <text x="150" y="155" fill="var(--accent-line)" font-size="9.5" font-weight="600">✗ zápis dolů (čtení dolů ✓)</text>
  <text x="380" y="100" text-anchor="middle" fill="var(--text-faint)" font-size="9">subjekt Secret:</text>
  <text x="380" y="115" text-anchor="middle" fill="var(--text-faint)" font-size="9">• čte Secret + Confidential + Unclassified ✓</text>
  <text x="380" y="130" text-anchor="middle" fill="var(--text-faint)" font-size="9">• zapisuje Secret + Top Secret ✓</text>
  <defs>
    <marker id="bx-ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L5,3 L0,6 z" fill="var(--accent)"/>
    </marker>
  </defs>
</svg>
:::

### Discretionary Security Property

Toto je složka volitelného řízení přístupu (DAC) — potřebujeme tedy také svolení vlastníka. BLP pouze *přidává* vrstvu povinného řízení přístupu (MAC layer) nad DAC.

## Důvěryhodné subjekty (trusted subjects)

Některé subjekty *jsou důvěryhodné* a smějí kontrolovaným způsobem *porušit* pravidla BLP:

- **Auditor TS** smí zapisovat protokoly (logy) do souboru U (řízený zápis dolů, controlled write-down).
- **Kryptografický důstojník** smí po formálním přezkoumání odtajnit data (declassify).

Důvěryhodné subjekty mají *zvláštní* oprávnění (příznak „trusted").

## Silná vs. slabá nehybnost (tranquility)

- **Silná nehybnost (strong tranquility)** — štítky se po přiřazení *nikdy* nemění.
- **Slabá nehybnost (weak tranquility)** — štítky se mohou změnit, *pokud* to politika dovoluje.

Většina systémů používá slabou nehybnost — je totiž nezbytná pro přeřazení (re-classification) a odtajnění (declassification).

## Příklad — špion TS {tier=example}

Špion je klasifikován jako TS. Chce vynést dokument TS do neutajovaného e-mailu.

1. Přečte dokument TS (BLP to dovolí, relace dominance je v pořádku).
2. Pokusí se zapsat do e-mailu U — BLP to odmítne podle pravidla „no write down".

I když je špion *zákeřný*, BLP úniku *zabrání* už svou architekturou.

Ovšem: skryté kanály (covert channels) — například časování nebo objem výstupu — mohou informaci přesto vynést, a ty BLP nepokrývá.

::: viz blp-access-checker "Nastav clearance subjektu a label objektu; sleduj read/write verdict. 'No read up' brání čtení vyšších; 'no write down' brání leakage do nižších."
:::

## Omezení BLP

- **Pouze důvěrnost** — žádná integrita (subjekt s nízkým oprávněním může upravovat svá vlastní data, i když na nich závisí vysoce utajovaný subjekt).
- **Žádná dostupnost (availability)**.
- **Hromadění vysokých štítků** — subjekt postupně čte mnoho dat a hromadí klasifikace.
- **Nešikovné v praxi** — mnoho reálných pracovních postupů potřebuje *občasné* odtajnění.
- **Skryté kanály (covert channels)** — časové i úložné skryté kanály obcházejí MAC.

## Bell-LaPadula v praxi {tier=practice}

- **Trusted Solaris (1993)** — víceúrovňový (MLS) Solaris.
- **HP-UX BLS** (B-Level Security).
- **SELinux MLS** — volitelná politika víceúrovňového zabezpečení (Multi-Level Security).
- **Trusted Extensions** (Oracle Solaris) — současné MLS pro operační systém.

Komerční operační systémy pro *běžné použití* BLP *neimplementují*. Vojenské a zpravodajské sítě (SIPRNet, JWICS) ano.

## BLP vs. realita {tier=practice}

Většina podnikových dat *není* označena štítky citlivosti.

Ve skutečnosti moderní zabezpečení používá:

- **RBAC** ([[rbac-abac]]) — řízení založené na rolích.
- **ABAC** — řízení založené na atributech.
- **Data Loss Prevention** (DLP) — kontroly s ohledem na obsah.

BLP zůstává *teoretickým základem* — mnoho reálných systémů je BLP *inspirováno*, aniž by jej striktně implementovaly.

## Vztah k modelu Biba

Biba ([[biba-clark-wilson]]) je *duální* model — pro integritu. Jeho pravidla jsou *opačná*:

- **No read down** (nečíst dolů — neznečistit se daty s nízkou integritou).
- **No write up** (nezapisovat nahoru — nepovýšit špatná data).

Reálný systém potřebuje *obojí* — důvěrnost i integritu:

- **Dvojitý štítek (dual-label)** — každý objekt má štítek BLP i štítek Biba.
- **Součin svazů (lattice product)** — kombinovaný model.

Implementace je složitá a nasazuje se jen zřídka.

---

*Zdroj: BIS přednášky 2025/26, doc. Ing. Petr Hanáček, Ph.D., FIT VUT v Brně. Externí reference: Bell, D.E., LaPadula, L.J.: „Secure Computer Systems: Mathematical Foundations" (MITRE M74-244, 1973, [PDF](https://apps.dtic.mil/sti/pdfs/AD0770768.pdf)); Bishop, M.: „Computer Security: Art and Science" (2nd ed., Addison-Wesley 2018), §5; Anderson, R.: „Security Engineering" (3rd ed., Wiley 2020), §9.*
