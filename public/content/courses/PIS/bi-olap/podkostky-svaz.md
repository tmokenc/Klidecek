# Podkostky a svaz kuboidů

Kostka $g_m: A_1 \times \ldots \times A_m \to F$ ([[multidimenzionalni-kostka]]) je *plně detailní* — drží fakt pro každou kombinaci hodnot napříč všemi aktivními dimenzemi. Praktická analytika ale často potřebuje *hrubší pohledy* — agregaci přes některé dimenze. Této operaci říkáme **vytvoření podkostky** (anglicky *cuboid*). Tato sekce ukazuje, jak podkostky tvoří hierarchii — matematicky **svaz (lattice)**.

## Co je podkostka

**Podkostka** vznikne z původní kostky tak, že se *agreguje (např. sečte) přes některou dimenzi*. Pro pekárnu z předchozí sekce $\{čas, produkt, region\}$ můžeme:

- *Agregovat přes region* → podkostka $\{čas, produkt\}$ — kolik se prodalo daný den celkem (Brno + Praha)?
- *Agregovat přes produkt* → podkostka $\{čas, region\}$ — kolik se prodalo daného dne v daném městě (rohlíky + párky)?
- *Agregovat přes čas a produkt* → podkostka $\{region\}$ — celkový součet pro každé město.
- *Agregovat přes všechny dimenze* → **vrcholový kuboid** (0-D), jediná hodnota = celkový součet 94.

Pro kostku s $n$ dimenzemi tedy existuje $2^n$ podkostek (= počet podmnožin množiny dimenzí). Pro 3 dimenze: $2^3 = 8$ podkostek.

## Svaz kuboidů (lattice)

Podkostky lze uspořádat podle *míry agregace*. Označme $L \subseteq \{D_1, \ldots, D_n\}$ množinu aktivních dimenzí dané podkostky. Pak platí:

> Podkostka $L_1$ je *jemnější* než $L_2$, pokud $L_2 \subseteq L_1$.

(Jemnější = drží více detailu = má více aktivních dimenzí.) Toto uspořádání je **částečné** (poset) — některé podkostky jsou nesrovnatelné, např. $\{čas, region\}$ a $\{čas, produkt\}$ — jedna není „jemnější" než druhá, jen *jinak řezaná*.

Strukturně tvoří podkostky **svaz** (*lattice*) — částečně uspořádanou množinu, kde:

- *Vrchol* (top, 0-D) — **vrcholový kuboid** = agregace přes všechny dimenze = jeden celkový součet.
- *Dno* (bottom, $n$-D) — **základní kuboid** = původní kostka, detail.
- Pro každé dva prvky existuje *supremum* a *infimum*.

:::svg
<svg viewBox="0 0 540 220" xmlns="http://www.w3.org/2000/svg" style="max-width:580px;width:100%;height:auto;font-family:system-ui,sans-serif;">
  <defs>
    <style>
      .node{fill:var(--bg-inset, #e8f0f7);stroke:var(--accent, #1e5a8e);stroke-width:1.5;rx:6}
      .edge{stroke:var(--line-strong, #555);stroke-width:1;fill:none}
      .lbl{font-size:11px;text-anchor:middle;fill:var(--text, #333);font-family:monospace}
      .level{font-size:10px;fill:var(--text-muted, #888);text-anchor:end}
    </style>
  </defs>
  <!-- level labels -->
  <text class="level" x="50" y="30">0-D (top)</text>
  <text class="level" x="50" y="75">1-D</text>
  <text class="level" x="50" y="130">2-D</text>
  <text class="level" x="50" y="190">3-D (base)</text>
  <!-- edges -->
  <line class="edge" x1="280" y1="35" x2="180" y2="65"/>
  <line class="edge" x1="280" y1="35" x2="280" y2="65"/>
  <line class="edge" x1="280" y1="35" x2="380" y2="65"/>
  <line class="edge" x1="180" y1="85" x2="170" y2="115"/>
  <line class="edge" x1="180" y1="85" x2="280" y2="115"/>
  <line class="edge" x1="280" y1="85" x2="170" y2="115"/>
  <line class="edge" x1="280" y1="85" x2="390" y2="115"/>
  <line class="edge" x1="380" y1="85" x2="280" y2="115"/>
  <line class="edge" x1="380" y1="85" x2="390" y2="115"/>
  <line class="edge" x1="170" y1="135" x2="280" y2="175"/>
  <line class="edge" x1="280" y1="135" x2="280" y2="175"/>
  <line class="edge" x1="390" y1="135" x2="280" y2="175"/>
  <!-- 0-D -->
  <rect class="node" x="245" y="15" width="70" height="20"/>
  <text class="lbl" x="280" y="29">{ } (all)</text>
  <!-- 1-D -->
  <rect class="node" x="135" y="65" width="70" height="20"/>
  <text class="lbl" x="170" y="79">{čas}</text>
  <rect class="node" x="240" y="65" width="80" height="20"/>
  <text class="lbl" x="280" y="79">{produkt}</text>
  <rect class="node" x="355" y="65" width="70" height="20"/>
  <text class="lbl" x="390" y="79">{region}</text>
  <!-- 2-D -->
  <rect class="node" x="115" y="115" width="115" height="20"/>
  <text class="lbl" x="172" y="129">{čas, produkt}</text>
  <rect class="node" x="240" y="115" width="80" height="20"/>
  <text class="lbl" x="280" y="129">{čas, reg.}</text>
  <rect class="node" x="335" y="115" width="115" height="20"/>
  <text class="lbl" x="392" y="129">{produkt, reg.}</text>
  <!-- 3-D -->
  <rect class="node" x="200" y="175" width="160" height="20"/>
  <text class="lbl" x="280" y="189">{čas, produkt, region}</text>
</svg>
:::

Pro $n = 3$ dimenze obsahuje svaz $2^3 = 8$ uzlů uspořádaných do 4 úrovní (0-D až 3-D). Šipky představují *roll-up* — agregaci přes jednu dimenzi.

## Vrcholový kuboid (top, 0-D)

**Vrcholový kuboid** je podkostka s *nulou aktivních dimenzí* — všechny dimenze byly agregovány pryč. Výsledkem je *jediná hodnota* — celkový součet (nebo jiný agregát) přes všechna data.

Pro pekárnu: $\sum_{i,j,k} g_3(\text{čas}_i, \text{produkt}_j, \text{region}_k) = 94$.

V SQL: `SELECT SUM(prodano) FROM fakty;` — bez `GROUP BY`.

## Základní kuboid (bottom, n-D)

**Základní kuboid** je sama původní kostka — s plně aktivními všemi $n$ dimenzemi. Drží *detail* — žádná agregace.

V SQL: `SELECT cas, produkt, region, prodano FROM fakty;` — bez agregační funkce, přímý detail.

## Kostka jako řídká matice

V praxi je kostka **řídká** (*sparse*) — drtivá většina možných buněk je *prázdná*. Důvody:

- *Sezónnost* — Vánoční ozdoby se prodávají hlavně v listopadu–prosinci, zbytek roku nula.
- *Geografická specializace* — některé produkty se prodávají jen v určitých regionech.
- *Historický rozsah* — produkt zavedený v roce 2024 nemá data za rok 2020.

Pro kostku $1000 \times 1000 \times 1000$ je možných $10^9$ buněk, ale reálných záznamů typicky $10^6$–$10^7$ — *řídkost > 99 %*. Tomu musí odpovídat **fyzická reprezentace**:

- **MOLAP** — vlastní *řídké pole* (sparse array), bitmapy.
- **ROLAP** — *řádky tabulky*, kde každá nenulová buňka je jeden řádek; prázdné se nereprezentují vůbec.

Toto rozhodnutí má dopady na výkon a paměť, které rozebereme v sekci [[olap-architektury]].

## Materializace vs. on-the-fly výpočet

Klíčové designové rozhodnutí: **které podkostky předpočítat (materializovat) a které počítat až při dotazu**.

- *Žádná materializace* — každý dotaz se počítá ze základního kuboidu. Minimum paměti, maximum CPU za dotaz.
- *Plná materializace* — všech $2^n$ podkostek se předpočítá. Maximum paměti, minimum CPU za dotaz.
- *Částečná materializace* (běžné v praxi) — předpočítají se jen ty *užitečné* podkostky (často dotazované nebo z nichž lze rychle dopočítat ostatní).

Algoritmy pro optimální výběr podmnožiny podkostek k materializaci jsou samostatným tématem (Harinarayan, Rajaraman, Ullman, 1996 — *Implementing Data Cubes Efficiently*).

## Co dále

Víme, *jakou strukturu mají podkostky*. V další sekci ([[agregace]]) podrobně rozebereme, *jak se hodnoty v podkostkách počítají* — agregační funkce a krokový postup od detailu k vrcholu.

---

*Zdroj: PIS přednáška 8, prof. Ing. Tomáš Hruška, CSc., FIT VUT v Brně. Externí reference: Gray, J. et al.: „Data Cube: A Relational Aggregation Operator Generalizing Group-By, Cross-Tab, and Sub-Totals" (1997); Harinarayan, V., Rajaraman, A., Ullman, J.: „Implementing Data Cubes Efficiently" (ACM SIGMOD 1996, [DOI 10.1145/233269.233333](https://doi.org/10.1145/233269.233333)).*
