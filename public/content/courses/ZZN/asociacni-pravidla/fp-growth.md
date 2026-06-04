---
title: FP-growth
---

**FP-growth** (Han, Pei & Yin, 2000) dolování frekventovaných množin **bez generování kandidátů**. Místo opakovaného procházení databáze a testování kandidátů zhustí celou DB do jediné stromové struktury — **FP-stromu** (Frequent-Pattern tree) — a frekventované množiny z ní získá rekurzivně.

Stavba FP-stromu má **dva průchody databází**. První spočítá podporu jednotlivých položek a zahodí nefrekventované. Druhý vkládá transakce do stromu: položky každé transakce se seřadí **sestupně podle frekvence** a vkládají z kořene dolů; **sdílený prefix** sdílí cestu a jen zvyšuje čítače uzlů. Stejně časté položky tak vytvoří společné větve, což strom silně komprimuje. Pomocná **hlavičková tabulka** (header table) drží pro každou položku ukazatel na řetěz všech jejích výskytů ve stromě.

::: svg "FP-strom z 5 transakcí (pořadí položek dle frekvence A≥B≥C≥D, min-support 2). Sdílené prefixy spojují cesty; čísla jsou čítače výskytů. Hlavičková tabulka vlevo řetězí všechny výskyty každé položky."
<svg viewBox="0 0 520 250" style="width:100%;display:block">
  <rect width="520" height="250" fill="var(--bg-inset)"/>
  <!-- header table -->
  <rect x="10" y="20" width="78" height="120" rx="6" fill="var(--bg-card)" stroke="var(--line)" stroke-width="1"/>
  <text x="49" y="36" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--text-muted)">header</text>
  <text x="20" y="58" font-size="12" font-family="var(--font-mono)" fill="var(--text)">A : 4</text>
  <text x="20" y="80" font-size="12" font-family="var(--font-mono)" fill="var(--text)">B : 4</text>
  <text x="20" y="102" font-size="12" font-family="var(--font-mono)" fill="var(--text)">C : 4</text>
  <text x="20" y="124" font-size="12" font-family="var(--font-mono)" fill="var(--text)">D : 3</text>
  <!-- edges -->
  <line x1="300" y1="38" x2="220" y2="78" stroke="var(--line-strong)" stroke-width="1"/>
  <line x1="300" y1="38" x2="430" y2="78" stroke="var(--line-strong)" stroke-width="1"/>
  <line x1="220" y1="92" x2="180" y2="132" stroke="var(--line-strong)" stroke-width="1"/>
  <line x1="220" y1="92" x2="290" y2="132" stroke="var(--line-strong)" stroke-width="1"/>
  <line x1="180" y1="146" x2="180" y2="186" stroke="var(--line-strong)" stroke-width="1"/>
  <line x1="290" y1="146" x2="290" y2="186" stroke="var(--line-strong)" stroke-width="1"/>
  <line x1="430" y1="92" x2="430" y2="132" stroke="var(--line-strong)" stroke-width="1"/>
  <line x1="430" y1="146" x2="430" y2="186" stroke="var(--line-strong)" stroke-width="1"/>
  <!-- root -->
  <circle cx="300" cy="30" r="13" fill="var(--bg-card)" stroke="var(--line-strong)" stroke-width="1"/>
  <text x="300" y="34" text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--text-muted)">null</text>
  <!-- left branch: A:4 -->
  <circle cx="220" cy="85" r="14" fill="color-mix(in oklch, var(--accent) 28%, var(--bg-card))" stroke="var(--accent)" stroke-width="1.5"/>
  <text x="220" y="89" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--text)">A:4</text>
  <!-- right branch: B:1 -->
  <circle cx="430" cy="85" r="14" fill="color-mix(in oklch, var(--accent) 28%, var(--bg-card))" stroke="var(--accent)" stroke-width="1.5"/>
  <text x="430" y="89" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--text)">B:1</text>
  <!-- under A: B:3 and C:1 -->
  <circle cx="180" cy="139" r="14" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5"/>
  <text x="180" y="143" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--text)">B:3</text>
  <circle cx="290" cy="139" r="14" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5"/>
  <text x="290" y="143" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--text)">C:1</text>
  <!-- under A-B: C:2 ; under A-C: D:1 -->
  <circle cx="180" cy="193" r="14" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5"/>
  <text x="180" y="197" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--text)">C:2</text>
  <circle cx="290" cy="193" r="14" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5"/>
  <text x="290" y="197" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--text)">D:1</text>
  <!-- under A-B-C: D:1 -->
  <line x1="180" y1="207" x2="180" y2="232" stroke="var(--line-strong)" stroke-width="1"/>
  <circle cx="180" cy="234" r="13" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5"/>
  <text x="180" y="238" text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--text)">D:1</text>
  <!-- right: B-C:1 -->
  <circle cx="430" cy="139" r="14" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5"/>
  <text x="430" y="143" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--text)">C:1</text>
  <circle cx="430" cy="193" r="14" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.5"/>
  <text x="430" y="197" text-anchor="middle" font-size="11" font-family="var(--font-mono)" fill="var(--text)">D:1</text>
</svg>
:::

Dolování běží rekurzivně po položkách hlavičkové tabulky **odspodu** (od nejméně časté). Pro položku se po řetězu výskytů sestaví **podmíněný základ vzorů** (conditional pattern base) — kolekce prefixových cest vedoucích k uzlům té položky, každá s čítačem rovným čítači uzlu. Z těchto cest se postaví **podmíněný FP-strom** a postup se opakuje rekurzivně, čímž se frekventované množiny postupně rozšiřují o další položky.

Pro položku `D` (z výše zobrazeného stromu) jsou výskyty na třech cestách: `⟨A,B,C⟩:1`, `⟨A,C⟩:1` a `⟨B,C⟩:1`. To je podmíněný základ vzorů `D`. V něm má jediná položka podporu ≥ 2 — položka `C` (1+1+1 = 3) — takže podmíněný FP-strom `D` dá frekventovanou množinu `{C,D}` s podporou 3. Pokud podmíněný FP-strom obsahuje **jedinou cestu**, lze rovnou vypsat všechny kombinace jejích uzlů jako frekventované množiny, bez další rekurze.

FP-growth tak **nikdy negeneruje ani netestuje kandidáty** (na rozdíl od Apriori), používá kompaktní datovou strukturu a eliminuje opakované čtení databáze — stačí dva průchody na stavbu stromu. Nejlepší případ je jediná cesta (všechny transakce stejné, maximální komprese); nejhorší případ jsou zcela odlišné transakce (žádné sdílení, žádná komprese).

::: quiz "Proč FP-growth nemusí generovat kandidátní množiny jako Apriori?"
- [x] Frekventovaná uspořádání jsou už zakódovaná ve sdílených cestách FP-stromu; dolují se rekurzivně z podmíněných stromů
  > FP-strom uchová úplnou informaci o spoluvýskytech v komprimované podobě, takže vzory rostou rekurzivně z podmíněných FP-stromů místo generování a testování kandidátů C_k.
- [ ] Protože pracuje jen s 1-množinami a víceprvkové ignoruje
  > FP-growth dolování i dlouhé množiny — právě jejich rekurzivním rozšiřováním z podmíněných stromů.
- [ ] Protože nepotřebuje práh min-support
  > Práh stále potřebuje: už v prvním průchodu jím odřízne nefrekventované položky před stavbou stromu.
:::

::: link "Han, Pei & Yin (2000): Mining Frequent Patterns without Candidate Generation (FP-growth, originální článek)" "https://www.cs.sfu.ca/~jpei/publications/sigmod00.pdf"
:::

*Zdroj: ZZN státnicové okruhy NBIO, VUT FIT. Externí reference: Han, Pei & Yin 2000 (FP-growth, SIGMOD), Wikipedia — Association rule learning.*
