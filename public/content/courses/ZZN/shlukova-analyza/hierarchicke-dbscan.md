---
title: Hierarchické metody a DBSCAN
---

# Hierarchické metody a metody založené na hustotě

Rozdělující metody (k-means, k-medoids) potřebují předem zadané $k$ a hledají kulovité shluky. **Hierarchické** a **hustotní** metody tato omezení uvolňují — první vytvoří celou hierarchii rozkladů, druhé najdou shluky libovolného tvaru a samy oddělí šum.

## Hierarchické metody

Hierarchické metody vytvoří **stromový rozklad** dat (hierarchii vnořených shluků). **Není nutné zadat počet tříd $k$** předem — místo toho se „odřízne" hierarchie na požadované úrovni. Rozhodovacím kritériem je **matice vzdáleností** mezi shluky. Dvě varianty:

- **Aglomerativní** (zdola nahoru, *AGNES*): start — každý objekt je vlastní shluk; opakovaně se slučují dva *nejpodobnější* shluky; konec — jeden shluk nebo dosažení požadované úrovně.
- **Divizivní** (shora dolů, *DIANA*): start — vše v jednom shluku, který se postupně dělí.

Vzdálenost *mezi shluky* (linkage) lze definovat různě — **single** (minimum párových vzdáleností), **complete** (maximum), **average** (průměr) nebo **Wardova** metoda (minimální nárůst rozptylu). Volba zásadně mění tvar výsledných shluků.

Výsledek se zobrazuje jako **dendrogram** — výška spoje udává vzdálenost, při které ke sloučení došlo. Vodorovný řez dendrogramem v dané výšce určuje výsledné shluky.

::: svg "Dendrogram aglomerativního shlukování: listy = objekty, výška spoje = vzdálenost slučování; vodorovný řez (čárkovaně) určí počet shluků."
<svg viewBox="0 0 360 190" font-family="ui-sans-serif, system-ui" font-size="11">
  <rect width="360" height="190" fill="var(--bg-inset)"/>
  <!-- vertical axis = distance -->
  <line x1="34" y1="20" x2="34" y2="160" stroke="var(--line-strong)" stroke-width="0.7"/>
  <text x="8" y="24" fill="var(--text-faint)" font-size="9">vzdál.</text>
  <!-- leaves at y=160 -->
  <g fill="var(--text-muted)" text-anchor="middle" font-size="10">
    <text x="70" y="175">A</text>
    <text x="110" y="175">B</text>
    <text x="160" y="175">C</text>
    <text x="220" y="175">D</text>
    <text x="280" y="175">E</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none">
    <!-- merge A,B at y=130 -->
    <path d="M70,160 V130 H110 V160"/>
    <!-- merge (AB),C at y=100 -->
    <path d="M90,130 V100 H160 V160"/>
    <!-- merge D,E at y=115 -->
    <path d="M220,160 V115 H280 V160"/>
    <!-- top merge at y=55 -->
    <path d="M125,100 V55 H250 V115"/>
  </g>
  <!-- cut line -->
  <line x1="34" y1="80" x2="330" y2="80" stroke="oklch(0.6 0.18 22)" stroke-width="1.2" stroke-dasharray="5 4"/>
  <text x="300" y="76" fill="oklch(0.6 0.18 22)" font-size="9">řez → 2 shluky</text>
</svg>
:::

**Vlastnosti:** menší výpočetní náročnost u malých dat a žádné zadání $k$. Zásadní **nevýhoda**: rozhodnutí je *nevratné* — jednou sloučené shluky už nelze rozdělit (a naopak u divizivních). Příklady metod: AGNES, DIANA, CHAMELEON.

## Metody založené na hustotě — DBSCAN

Hustotní metody chápou shluk jako **oblast s vysokou hustotou bodů** oddělenou oblastmi s nízkou hustotou. Shluk se „rozrůstá", dokud hustota v okolí neklesne pod práh. Tím umějí najít shluky **libovolného (i nekonvexního) tvaru** a zároveň **odfiltrovat šum**. Cenou je nutnost zadat **parametry hustoty**.

**DBSCAN** (Density-Based Spatial Clustering of Applications with Noise) má dva parametry: poloměr okolí **eps** ($\varepsilon$) a minimální počet bodů **minPts**. Body se podle hustoty klasifikují do tří kategorií:

- **Jádrový (core) bod** — v jeho $\varepsilon$-okolí leží alespoň **minPts** bodů (včetně jeho samého).
- **Hraniční (border) bod** — sám není jádrový, ale leží v $\varepsilon$-okolí nějakého jádrového bodu.
- **Šumový (noise) bod** — není jádrový ani hraniční; nepatří do žádného shluku.

Shluk se tvoří přes vztah **hustotní dosažitelnosti**: bod $p$ je *přímo hustotně dosažitelný* z jádrového bodu $q$, leží-li v jeho $\varepsilon$-okolí. Řetězením těchto kroků vznikne shluk jako množina hustotně propojených bodů.

::: math
N_\varepsilon(p) = \{\, q \in D \mid d(p, q) \le \varepsilon \,\}, \qquad
p \text{ je core} \iff |N_\varepsilon(p)| \ge \text{minPts}
:::

::: viz zzn-dbscan "Posuvníky eps a minPts mění klasifikaci: jádrové (core), hraniční (border) a šumové (noise) body se obarví; klikni na bod a uvidíš jeho eps-okolí jako kružnici. Sleduj, jak DBSCAN oddělí prohnutý pás od šumu — což k-means neumí."
:::

**Výhody:** najde shluky libovolného tvaru, automaticky určí jejich počet a označí šum/odlehlé hodnoty. **Nevýhody:** citlivost na volbu eps a minPts a problémy s daty s *proměnlivou hustotou* (jediné globální eps nestačí). Příbuzné metody: DENCLUE, OPTICS.

::: quiz "Hraniční (border) bod v DBSCANu je ten, který..."
- [ ] má ve svém eps-okolí alespoň minPts bodů
- [x] sám nemá dost sousedů na to být jádrový, ale leží v eps-okolí nějakého jádrového bodu
- [ ] nepatří do žádného shluku a je označen jako šum
- [ ] je geometrickým středem shluku
> Border bod nesplňuje práh minPts (není core), ale je hustotně dosažitelný z jádrového bodu, takže se připojí k jeho shluku. Bod, který není core ani v okolí žádného core bodu, je šum.
:::

::: link "Ester, Kriegel, Sander, Xu: A Density-Based Algorithm... (KDD 1996) — originální DBSCAN" "https://file.biolab.si/papers/1996-DBSCAN-KDD.pdf"
:::

::: link "Wikipedia: DBSCAN (core/border/noise, density-reachability)" "https://en.wikipedia.org/wiki/DBSCAN"
:::

*Zdroj: ZZN státnicové okruhy NBIO, VUT FIT. Externí reference: Ester, M., Kriegel, H.-P., Sander, J., Xu, X.: „A Density-Based Algorithm for Discovering Clusters" ([KDD 1996](https://file.biolab.si/papers/1996-DBSCAN-KDD.pdf)); Wikipedia [DBSCAN](https://en.wikipedia.org/wiki/DBSCAN); Han, J., Kamber, M., Pei, J.: *Data Mining — Concepts and Techniques* (3. vyd., Morgan Kaufmann 2011), kap. 10 (hierarchické a hustotní metody).*
