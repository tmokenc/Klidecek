---
title: Informační systém — schéma a úrovně řízení
---

Informační systém (IS) je obvyklé chápat jako specializovanou variantu obecného **systému**: prvky systému zpracovávají *vstupy* na *výstupy* a přitom udržují *vnitřní stav*. U informačního systému je tento stav reprezentován **hodnotami dat** a vnitřní zpracování má často formu *transakcí*.

::: svg "Schéma informačního systému: stav je čten i zapisován procesy během transformace vstupů na výstupy"
<svg viewBox="0 0 360 150" xmlns="http://www.w3.org/2000/svg">
  <rect x="40" y="90" width="70" height="40" rx="6" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
  <text x="75" y="115" text-anchor="middle" font-size="13" font-weight="600" fill="var(--text)">vstup</text>
  <rect x="140" y="20" width="80" height="34" rx="6" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
  <text x="180" y="42" text-anchor="middle" font-size="13" font-weight="600" fill="var(--text)">stav</text>
  <ellipse cx="180" cy="110" rx="48" ry="28" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.5"/>
  <text x="180" y="115" text-anchor="middle" font-size="13" font-weight="600" fill="var(--accent)">procesy</text>
  <rect x="250" y="90" width="70" height="40" rx="6" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
  <text x="285" y="115" text-anchor="middle" font-size="13" font-weight="600" fill="var(--text)">výstup</text>
  <path d="M110,110 L132,110" stroke="var(--text-muted)" stroke-width="1.5" marker-end="url(#arr1)"/>
  <path d="M228,110 L248,110" stroke="var(--text-muted)" stroke-width="1.5" marker-end="url(#arr1)"/>
  <path d="M180,54 L180,82" stroke="var(--text-muted)" stroke-width="1.5" marker-end="url(#arr1)" stroke-dasharray="2 3"/>
  <path d="M210,90 C 230,70 230,55 220,40" stroke="var(--text-muted)" stroke-width="1.5" fill="none" marker-end="url(#arr1)"/>
  <defs>
    <marker id="arr1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="var(--text-muted)"/>
    </marker>
  </defs>
</svg>
:::

**Stav** IS jsou hodnoty dat reprezentované pomocí nějakého *modelu* (relační schéma, objektový model, dokumentové úložiště…). Stav musí být **perzistentní** (přetrvává mezi spuštěními aplikace) a **konzistentní** (splňuje integritní omezení — např. že součet pohybů na účtě odpovídá zůstatku). Procesy stav buď čtou (dotazy, reporty), nebo modifikují (vložení objednávky, převod platby).

**Správa informací** v IS prochází čtyřmi fázemi: *sběr* (vstup), *uspořádání a příprava* (transformace), *užití* (výstup) a *rušení/náhrada* (archivace, mazání). Každá z nich má svou roli v životním cyklu dat a klade jiné nároky na technologii.

## Klasifikace IS podle úrovně řízení

V organizaci se IS obvykle hierarchicky člení podle toho, kterou úroveň rozhodování podporují. Klasický pohled je tzv. **pyramidové schéma**:

::: svg "Pyramidové schéma — úrovně řízení a typy IS"
<svg viewBox="0 0 450 220" xmlns="http://www.w3.org/2000/svg">
  <polygon points="200,15 360,200 40,200" fill="oklch(0.55 0.18 264 / 0.05)" stroke="var(--line-strong)" stroke-width="0.5"/>
  <line x1="80" y1="155" x2="320" y2="155" stroke="var(--line-strong)" stroke-width="0.5"/>
  <line x1="115" y1="115" x2="285" y2="115" stroke="var(--line-strong)" stroke-width="0.5"/>
  <line x1="150" y1="75" x2="250" y2="75" stroke="var(--line-strong)" stroke-width="0.5"/>
  <text x="200" y="50" text-anchor="middle" font-size="11" font-weight="600" fill="var(--accent)">EIS</text>
  <text x="200" y="62" text-anchor="middle" font-size="9" fill="var(--text-muted)">ředitelská úroveň</text>
  <text x="200" y="92" text-anchor="middle" font-size="11" font-weight="600" fill="var(--accent)">DSS</text>
  <text x="200" y="104" text-anchor="middle" font-size="9" fill="var(--text-muted)">vyšší management</text>
  <text x="200" y="135" text-anchor="middle" font-size="11" font-weight="600" fill="var(--accent)">MIS / OLAP</text>
  <text x="200" y="147" text-anchor="middle" font-size="9" fill="var(--text-muted)">střední management</text>
  <text x="200" y="180" text-anchor="middle" font-size="11" font-weight="600" fill="var(--accent)">OLTP</text>
  <text x="200" y="192" text-anchor="middle" font-size="9" fill="var(--text-muted)">operativa, pracovníci</text>
  <text x="370" y="78" font-size="9" font-family="var(--font-mono)" fill="oklch(0.55 0.18 264)">analytika ▲</text>
  <text x="370" y="92" font-size="9" font-family="var(--font-mono)" fill="oklch(0.55 0.18 264)">pevný stav</text>
  <text x="370" y="105" font-size="9" font-family="var(--font-mono)" fill="oklch(0.55 0.18 264)">ad-hoc dotazy</text>
  <text x="370" y="172" font-size="9" font-family="var(--font-mono)" fill="oklch(0.62 0.15 30)">transakce ▼</text>
  <text x="370" y="185" font-size="9" font-family="var(--font-mono)" fill="oklch(0.62 0.15 30)">měnící se stav</text>
</svg>
:::

* **OLTP** (*On-Line Transaction Processing*) — systémy pro každodenní operativu. Reagují na požadavky uživatelů *okamžitou změnou stavu*. Termín „transakční" má dva významy, které se často překrývají: databázová transakce (atomická operace nad daty) a komerční transakce (například nákup zboží, převod peněz).
* **MIS** (*Management Information Systems*) — systémy pro podporu řízení. Poskytují agregované informace pro střední management; nemusí pracovat nad zcela aktuálními daty (povolené zpoždění hodiny i dny). Sem patří **OLAP** (On-Line Analytical Processing), reporting a další analytické nástroje.
* **DSS** (*Decision Support Systems*) — explicitně modelují alternativy rozhodnutí pro vyšší management (např. „co se stane, když zvedneme cenu o 5 %?").
* **EIS** (*Executive Information Systems*) — strategická úroveň, dashboardy a klíčové ukazatele výkonu pro ředitelskou úroveň.

Pyramida ilustruje dvě paralelní gradace: směrem nahoru ubývá uživatelů, ale rostou nároky na *analytické* technologie a na *historický pohled* na data; směrem dolů přibývá uživatelů a transakcí, data se mění okamžitě a izomorfně sledují fyzický systém.

::: link "Management information system — Wikipedia" "https://en.wikipedia.org/wiki/Management_information_system"
:::

::: link "Anthony, R. N. — hierarchie strategic/management/operational control" "https://en.wikipedia.org/wiki/Robert_N._Anthony"
:::

::: quiz "Účetní systém, který během dne přijímá faktury a okamžitě aktualizuje stav účtu, je typicky:"
- [x] OLTP — transakční zpracování operativních dat.
  > Ano. OLTP reaguje okamžitě na vstupy změnou stavu — přesně případ účetního systému.
- [ ] OLAP — analytické zpracování pro management.
  > OLAP pracuje s agregovanými historickými daty; nepoužije se pro evidenci jednotlivých faktur v reálném čase.
- [ ] EIS — strategický pohled.
  > EIS dodává shrnuté indikátory ředitelské úrovni, ne každodenní transakce.
:::

---

*Zdroj: přednášky PIS — prof. T. Hruška a doc. R. Burget, VUT FIT, část „Informační systém"; viz též kniha Laudon & Laudon, „Management Information Systems".*
