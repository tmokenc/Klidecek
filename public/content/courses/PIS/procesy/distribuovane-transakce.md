# Distribuované transakce — 2PC, XA, SAGA

Dosud jsme uvažovali model **jeden TPS, jedna databáze**. Reálné systémy ovšem mají často **více nezávislých TPS** — různé databáze, JMS brokery, externí služby — a všechny musí v rámci jedné podnikové transakce **jednat atomicky**. Tento problém je natolik zásadní, že má dvě úplně odlišná řešení: klasický **dvoufázový commit (2PC)** s XA protokolem a **SAGA pattern** pro mikroslužby.

## Problém distribuovaných transakcí

> *Příklad 1:* Převod peněz mezi dvěma bankami — každá má vlastní TPS. Banka A odečte peníze (commit) → Banka B havaruje → **peníze jsou v prázdnu**.
>
> *Příklad 2:* Objednávka v e-shopu spouští **sklad**, **platbu** a **dopravu** jako samostatné mikroslužby. Pokud sklad rezervuje zboží a platba selže, je třeba rezervaci zrušit — ale jak konzistentně?

Klasický rollback **nefunguje přes hranice TPS** — každý TPS si commituje samostatně a po commitu už zpět nemůže. Nutný je proto **protokol pro distribuovaný commit**, který koordinuje *všechny účastníky* tak, aby buď všichni commitovali, nebo všichni rollbackli.

## Dvoufázový commit (2PC)

**2PC** je nejznámější protokol pro atomický distribuovaný commit. Účastníci se dělí na **koordinátora** (často aplikační server) a **účastníky** (jednotlivé TPS).

### Fáze 1 — Prepare (hlasování)

1. Koordinátor pošle všem účastníkům `PREPARE`.
2. Každý účastník provede svou část až po bod commitu (ne včetně), zapíše do žurnálu stav `READY` (trvanlivě), ale ještě **necommituje**.
3. Účastník hlasuje `VOTE YES` (mohu commitovat) nebo `VOTE NO` (musím rollbacknout).

### Fáze 2 — Commit (rozhodnutí)

4. Pokud **všichni** hlasovali YES → koordinátor pošle `COMMIT`. Účastníci dokončí commit a pošlou `ACK`.
5. Pokud *kterýkoli* hlasoval NO → koordinátor pošle `ROLLBACK`. Všichni vrátí změny.

:::svg
<svg viewBox="0 0 540 280" xmlns="http://www.w3.org/2000/svg" style="max-width: 580px;">
  <rect x="0" y="0" width="540" height="280" fill="#f8fafc" rx="8"/>
  <defs>
    <marker id="arrD" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--ink)"/>
    </marker>
    <marker id="arrDG" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#16a34a"/>
    </marker>
  </defs>
  <rect x="40"  y="20" width="100" height="30" rx="4" fill="#86efac" stroke="#16a34a"/>
  <rect x="220" y="20" width="100" height="30" rx="4" fill="#bfdbfe" stroke="#2563eb"/>
  <rect x="400" y="20" width="100" height="30" rx="4" fill="#86efac" stroke="#16a34a"/>
  <text x="90"  y="40" text-anchor="middle" font-family="ui-sans-serif" font-size="12" font-weight="bold" fill="#0f172a">Účastník 1</text>
  <text x="270" y="40" text-anchor="middle" font-family="ui-sans-serif" font-size="12" font-weight="bold" fill="#0f172a">Koordinátor</text>
  <text x="450" y="40" text-anchor="middle" font-family="ui-sans-serif" font-size="12" font-weight="bold" fill="#0f172a">Účastník 2</text>
  <line x1="90"  y1="50" x2="90"  y2="260" stroke="var(--muted)" stroke-dasharray="3,3"/>
  <line x1="270" y1="50" x2="270" y2="260" stroke="var(--muted)" stroke-dasharray="3,3"/>
  <line x1="450" y1="50" x2="450" y2="260" stroke="var(--muted)" stroke-dasharray="3,3"/>
  <rect x="40"  y="55"  width="460" height="22" fill="#dbeafe" opacity="0.6"/>
  <text x="270" y="71"  text-anchor="middle" font-family="ui-sans-serif" font-size="11" font-weight="bold" fill="#1e40af">FÁZE 1 — Prepare</text>
  <line x1="265" y1="90"  x2="95"  y2="90"  stroke="var(--ink)" marker-end="url(#arrD)"/>
  <text x="180" y="85" text-anchor="middle" font-family="ui-monospace" font-size="10" fill="var(--text)">PREPARE</text>
  <line x1="275" y1="90"  x2="445" y2="90"  stroke="var(--ink)" marker-end="url(#arrD)"/>
  <text x="360" y="85" text-anchor="middle" font-family="ui-monospace" font-size="10" fill="var(--text)">PREPARE</text>
  <line x1="95"  y1="115" x2="265" y2="115" stroke="#16a34a" stroke-width="2" marker-end="url(#arrDG)"/>
  <text x="180" y="110" text-anchor="middle" font-family="ui-monospace" font-size="10" fill="#16a34a">VOTE YES</text>
  <line x1="445" y1="115" x2="275" y2="115" stroke="#16a34a" stroke-width="2" marker-end="url(#arrDG)"/>
  <text x="360" y="110" text-anchor="middle" font-family="ui-monospace" font-size="10" fill="#16a34a">VOTE YES</text>
  <rect x="40"  y="135" width="460" height="22" fill="#dcfce7" opacity="0.6"/>
  <text x="270" y="151" text-anchor="middle" font-family="ui-sans-serif" font-size="11" font-weight="bold" fill="#166534">FÁZE 2 — Commit</text>
  <line x1="265" y1="172" x2="95"  y2="172" stroke="#16a34a" stroke-width="2" marker-end="url(#arrDG)"/>
  <text x="180" y="167" text-anchor="middle" font-family="ui-monospace" font-size="10" fill="#16a34a">COMMIT</text>
  <line x1="275" y1="172" x2="445" y2="172" stroke="#16a34a" stroke-width="2" marker-end="url(#arrDG)"/>
  <text x="360" y="167" text-anchor="middle" font-family="ui-monospace" font-size="10" fill="#16a34a">COMMIT</text>
  <line x1="95"  y1="197" x2="265" y2="197" stroke="var(--ink)" marker-end="url(#arrD)"/>
  <text x="180" y="192" text-anchor="middle" font-family="ui-monospace" font-size="10" fill="var(--text)">ACK</text>
  <line x1="445" y1="197" x2="275" y2="197" stroke="var(--ink)" marker-end="url(#arrD)"/>
  <text x="360" y="192" text-anchor="middle" font-family="ui-monospace" font-size="10" fill="var(--text)">ACK</text>
  <rect x="40"  y="220" width="460" height="40" fill="#fee2e2" stroke="#b91c1c" rx="4"/>
  <text x="270" y="237" text-anchor="middle" font-family="ui-sans-serif" font-size="11" font-weight="bold" fill="#7f1d1d">Selhání koordinátoru po PREPARE, před COMMIT</text>
  <text x="270" y="252" text-anchor="middle" font-family="ui-sans-serif" font-size="10" fill="#7f1d1d">→ účastníci čekají na rozhodnutí (blokující protokol)</text>
</svg>
:::

::: viz two-phase-commit "Zkus změnit hlasy P1 a P2, nebo zaškrtni „koordinátor padne po PREPARE\" a sleduj, jak se účastníci zablokují s drženými zámky."
:::

### Vlastnosti 2PC

- **Zaručuje atomičnost** přes více nezávislých TPS.
- **Standard: XA protokol** od The Open Group — implementuje Java JTA i většina enterprise databází.
- **Omezení — blokující protokol:**
  - Pokud koordinátor zhavaruje *po* Prepare, ale *před* Commit, účastníci uzamknou záznamy a **nemohou pokračovat** — čekají neomezeně.
  - **3PC (three-phase commit)** částečně řeší blokování přidáním fáze pre-commit, ale v praxi se nepoužívá (přidává složitost, neřeší network partitioning).
- **Problém škálovatelnosti:** drží *distribuované zámky* po dobu prepare → commit, což je nevhodné pro **mikroslužby** a vysokou propustnost.

## XA protokol

**XA** je standardní API pro koordinaci distribuované transakce, formálně specifikované The Open Group. Definuje rozhraní mezi **transakčním manažerem** (koordinátor — v Javě JTA) a **resource managery** (databáze, JMS broker, …).

Každý resource manager musí implementovat tři operace:

| Operace | Fáze 2PC | Význam |
| :--- | :--- | :--- |
| `xa_prepare()` | Prepare | Připrav se, zapiš do logu, vrať YES/NO |
| `xa_commit()` | Commit | Potvrď transakci |
| `xa_rollback()` | Rollback | Odvolej transakci |

**Koordinátor (Java JTA)** volá tyto operace na všech účastnících. Praktickým důsledkem je, že **databáze i JMS broker mohou být v jedné transakci** → atomická operace „ulož do DB + vlož do fronty” — viz [[jakarta-messaging]].

## SAGA pattern — alternativa pro mikroslužby

V mikroservisové architektuře je 2PC nepraktický:

- Drží distribuované zámky → škálovatelnost trpí.
- Vyžaduje, aby všechny služby podporovaly XA — externí služby často nepodporují.
- Při výpadku sítě „blokuje” celý systém.

**SAGA pattern** (García-Molina & Salem, 1987) tento problém obchází tím, že **úplně rezignuje na distribuované zámky** výměnou za **eventual consistency**.

::: viz saga "Vyber, ve kterém kroku má saga selhat, a procházej krok po kroku. Sleduj, jak se kompenzace pouští v opačném pořadí."
:::

### Princip SAGA

**SAGA** = sekvence lokálních transakcí $T_1, T_2, \ldots, T_n$, kde:

- Každá $T_i$ commituje *lokálně*, nezávisle.
- Každá $T_i$ má **kompenzační transakci** $C_i$ — logickou obnovu efektu (viz [[zretezene-transakce]]).
- Selhání $T_k$ spustí kompenzace $C_{k-1}, C_{k-2}, \ldots, C_1$ v **opačném pořadí**.

:::svg
<svg viewBox="0 0 540 220" xmlns="http://www.w3.org/2000/svg" style="max-width: 580px;">
  <rect x="0" y="0" width="540" height="220" fill="#f8fafc" rx="8"/>
  <defs>
    <marker id="arrE" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#16a34a"/>
    </marker>
    <marker id="arrERed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#b91c1c"/>
    </marker>
  </defs>
  <text x="160" y="20" text-anchor="middle" font-family="ui-sans-serif" font-size="12" font-weight="bold" fill="#166534">A) Úspěšné provedení</text>
  <rect x="30"  y="35" width="80" height="40" rx="6" fill="#bbf7d0" stroke="#16a34a"/>
  <text x="70"  y="55" text-anchor="middle" font-family="ui-sans-serif" font-size="13" font-weight="bold" fill="#0f172a">T₁</text>
  <text x="70"  y="70" text-anchor="middle" font-family="ui-sans-serif" font-size="10" fill="#0f172a">commit</text>
  <rect x="140" y="35" width="80" height="40" rx="6" fill="#bbf7d0" stroke="#16a34a"/>
  <text x="180" y="55" text-anchor="middle" font-family="ui-sans-serif" font-size="13" font-weight="bold" fill="#0f172a">T₂</text>
  <text x="180" y="70" text-anchor="middle" font-family="ui-sans-serif" font-size="10" fill="#0f172a">commit</text>
  <rect x="250" y="35" width="80" height="40" rx="6" fill="#bbf7d0" stroke="#16a34a"/>
  <text x="290" y="55" text-anchor="middle" font-family="ui-sans-serif" font-size="13" font-weight="bold" fill="#0f172a">T₃</text>
  <text x="290" y="70" text-anchor="middle" font-family="ui-sans-serif" font-size="10" fill="#0f172a">commit</text>
  <line x1="110" y1="55" x2="138" y2="55" stroke="#16a34a" stroke-width="2" marker-end="url(#arrE)"/>
  <line x1="220" y1="55" x2="248" y2="55" stroke="#16a34a" stroke-width="2" marker-end="url(#arrE)"/>
  <circle cx="355" cy="55" r="10" fill="none" stroke="#16a34a" stroke-width="2"/>
  <text x="355" y="60" text-anchor="middle" font-family="ui-sans-serif" font-size="12" fill="#16a34a">✓</text>
  <line x1="330" y1="55" x2="343" y2="55" stroke="#16a34a" stroke-width="2" marker-end="url(#arrE)"/>
  <text x="160" y="115" text-anchor="middle" font-family="ui-sans-serif" font-size="12" font-weight="bold" fill="#b91c1c">B) Selhání T₃ → kompenzace</text>
  <rect x="30"  y="130" width="80" height="40" rx="6" fill="#bbf7d0" stroke="#16a34a"/>
  <text x="70"  y="155" text-anchor="middle" font-family="ui-sans-serif" font-size="13" font-weight="bold" fill="#0f172a">T₁</text>
  <rect x="140" y="130" width="80" height="40" rx="6" fill="#bbf7d0" stroke="#16a34a"/>
  <text x="180" y="155" text-anchor="middle" font-family="ui-sans-serif" font-size="13" font-weight="bold" fill="#0f172a">T₂</text>
  <rect x="250" y="130" width="80" height="40" rx="6" fill="#fecaca" stroke="#b91c1c"/>
  <text x="290" y="155" text-anchor="middle" font-family="ui-sans-serif" font-size="13" font-weight="bold" fill="#0f172a">T₃ ✗</text>
  <line x1="110" y1="150" x2="138" y2="150" stroke="#16a34a" stroke-width="2"/>
  <line x1="220" y1="150" x2="248" y2="150" stroke="#16a34a" stroke-width="2"/>
  <rect x="140" y="185" width="80" height="30" rx="6" fill="#fef3c7" stroke="#ca8a04" stroke-dasharray="4,2"/>
  <text x="180" y="204" text-anchor="middle" font-family="ui-sans-serif" font-size="12" font-weight="bold" fill="#0f172a">C₂</text>
  <rect x="30"  y="185" width="80" height="30" rx="6" fill="#fef3c7" stroke="#ca8a04" stroke-dasharray="4,2"/>
  <text x="70"  y="204" text-anchor="middle" font-family="ui-sans-serif" font-size="12" font-weight="bold" fill="#0f172a">C₁</text>
  <line x1="250" y1="170" x2="220" y2="190" stroke="#b91c1c" stroke-width="2" marker-end="url(#arrERed)"/>
  <line x1="140" y1="200" x2="113" y2="200" stroke="#b91c1c" stroke-width="2" marker-end="url(#arrERed)"/>
  <rect x="390" y="35" width="135" height="180" rx="8" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="457" y="55" text-anchor="middle" font-family="ui-sans-serif" font-size="11" font-weight="bold" fill="var(--text)">Typy orchestrace</text>
  <text x="400" y="75" font-family="ui-sans-serif" font-size="10" font-weight="bold" fill="var(--text)">Choreografie</text>
  <text x="400" y="88" font-family="ui-sans-serif" font-size="9" fill="var(--text-muted)">služby naslouchají</text>
  <text x="400" y="100" font-family="ui-sans-serif" font-size="9" fill="var(--text-muted)">událostem, žádný</text>
  <text x="400" y="112" font-family="ui-sans-serif" font-size="9" fill="var(--text-muted)">centrální koordinátor</text>
  <text x="400" y="140" font-family="ui-sans-serif" font-size="10" font-weight="bold" fill="var(--text)">Orchestrátor</text>
  <text x="400" y="155" font-family="ui-sans-serif" font-size="9" fill="var(--text-muted)">centrální koordinátor</text>
  <text x="400" y="167" font-family="ui-sans-serif" font-size="9" fill="var(--text-muted)">vydává příkazy</text>
  <text x="400" y="179" font-family="ui-sans-serif" font-size="9" fill="var(--text-muted)">a sleduje výsledky</text>
</svg>
:::

SAGA má dva varianty implementace:

- **Choreografie (událostmi řízená)** — každá služba naslouchá událostem od ostatních a samostatně rozhoduje o své akci. Žádný centrální koordinátor. Levná infrastruktura, ale tok je obtížně sledovatelný.
- **Orchestrátor** — centrální *Saga orchestrator* (Camunda, Temporal, Netflix Conductor) vydává příkazy a sleduje výsledky. Snadnější ladění, ale orchestrátor je SPOF.

### Vlastnosti SAGA

- **Žádné distribuované zámky** → škálovatelnost.
- **Pouze eventual consistency** — systém je *dočasně nekonzistentní* mezi $T_i$ a $T_{i+1}$.
- **Kompenzace musí být pečlivě navrženy** — ne vždy jde o prostý rollback (vrácení peněz po platbě ≠ smazání platebního záznamu, je třeba i daňové korekce).
- SAGA je **formalizace kompenzujících transakcí** ([[zretezene-transakce]]) pro distribuované systémy.

## 2PC vs. SAGA — srovnání

| Vlastnost | 2PC / XA | SAGA |
| :--- | :--- | :--- |
| Konzistence | Silná (atomická) | Eventual |
| Zámky | Distribuované | Pouze lokální |
| Škálovatelnost | Horší | Lepší |
| Vhodné pro | Monolit, klasické EE | Mikroslužby |
| Rollback | Automatický | Manuální kompenzace |
| Komplexita kódu | Nízká (transparentní) | Vysoká (kompenzace) |

Pravidlo praxe: **2PC pro klasické Jakarta EE aplikace** (např. DB + JMS broker v jedné JTA transakci → viz [[jakarta-messaging]]); **SAGA pro mikroslužby** přes hranice nezávislých služeb a databází (viz [[mikrosluzby]]).

---

*Zdroj: PIS přednáška 6, doc. Ing. Radek Burget, Ph.D., FIT VUT v Brně. Externí reference: The Open Group [XA Specification](https://pubs.opengroup.org/onlinepubs/009680699/toc.pdf); García-Molina, H., Salem, K.: „Sagas” ([ACM SIGMOD 1987](https://dl.acm.org/doi/10.1145/38713.38742)); Richardson, C.: *Microservices Patterns* (Manning 2018), kap. 4 (Managing transactions with sagas).*
