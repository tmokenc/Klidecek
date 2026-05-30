# Agregace — výpočet měr v podkostkách

Svaz kuboidů ([[podkostky-svaz]]) zavádí *strukturu* — které podkostky existují a jak se vztahují. Tato sekce řeší *výpočet* — jak se z detailních hodnot na základní úrovni dostat k agregovaným hodnotám na hrubších úrovních. Klíčový pojem je **agregační funkce**.

## Detail vs. agregát

Na **základním kuboidu** (plně detailní úroveň) leží *detailní hodnoty* — typicky jeden řádek = jedna transakce, nebo jedna hodnota na průsečíku všech dimenzí. Pro pekárnu s dimenzemi {čas, produkt, region}:

| location | time | item | fakt |
| :--- | :--- | :--- | :---: |
| Brno | 22.6. | rohlík | 19 |
| Brno | 22.6. | párek | 13 |
| Brno | 23.6. | rohlík | 5 |
| Praha | 22.6. | rohlík | 22 |
| Praha | 22.6. | párek | 21 |
| Praha | 23.6. | rohlík | 14 |

Celkový součet (vrcholový kuboid): $19 + 13 + 5 + 22 + 21 + 14 = 94$.

## Agregační funkce

Při přechodu na hrubší podkostku je třeba *zkombinovat* více detailních hodnot do jedné. Tomu slouží **agregační funkce**. Standardní katalog (SQL i OLAP):

| Funkce | Co dělá | Příklad |
| :--- | :--- | :--- |
| **COUNT** | Počet záznamů. | Kolik transakcí proběhlo? |
| **SUM** | Součet. | Celková tržba. |
| **AVG** | Aritmetický průměr. | Průměrná cena objednávky. |
| **MAX** | Maximum. | Nejvyšší jednorázový prodej. |
| **MIN** | Minimum. | Nejnižší cena za den. |
| **MEDIAN** | Medián. | Typická hodnota. |
| **MODE** | Modus. | Nejčastější hodnota. |

Volba funkce závisí na *povaze otázky*. Pro tržby je SUM; pro průměrnou hodnotu objednávky AVG; pro detekci outlierů MAX a MIN.

## Algebraické, distributivní a holistické agregace

Z hlediska *materializace* (předpočítávání) je důležitá další klasifikace (Gray et al., 1997):

- **Distributivní** — výsledek lze počítat *po částech* a pak zkombinovat. Příklady: SUM, COUNT, MAX, MIN. Pro pekárnu: $\sum(Brno) + \sum(Praha) = \sum(celé)$.
- **Algebraické** — lze odvodit z konečně mnoha distributivních agregátů. AVG = SUM / COUNT.
- **Holistické** — *nelze* spočítat po částech. Příklady: MEDIAN, MODE, percentily. Pro výpočet mediánu potřebujeme *všechny* hodnoty seřazené.

Distributivní a algebraické agregace jsou *přátelské k OLAP* — jejich předpočítané podkostky lze efektivně využít při dotazu o stupeň výš. Holistické agregace OLAP servery typicky **neumí předpočítávat**, počítají je on-the-fly z detailu.

## Krokový výpočet — od detailu k vrcholu

Klíčová vlastnost svazu kuboidů: **agregát na vyšší úrovni lze počítat z agregátu na nižší úrovni** (pro distributivní funkce). Formálně, pokud $g_n$ je detail a $g_m$ je agregát s $m < n$ dimenzemi:

$$\text{součet}_m(d_1, \ldots, d_m) = \sum_{d_i \in D_i, i > m} g_n(d_1, \ldots, d_m, d_{m+1}, \ldots, d_n)$$

Krokově:

$$\text{součet}_m(d_1, \ldots, d_m) = \sum_{d_{m+1} \in D_{m+1}} \text{součet}_{m+1}(d_1, \ldots, d_m, d_{m+1})$$

— čteno: *agregát na $m$-úrovni je součet agregátů na $(m+1)$-úrovni přes vyřazenou dimenzi*.

To má praktický důsledek: pokud máme materializovaný kuboid $\{čas, region\}$, můžeme z něj **levně** spočítat $\{čas\}$ jako $\sum_{region} \text{součet}_2(čas, region)$. Není potřeba sahat až do základního kuboidu.

## Příklad: cesta k vrcholovému kuboidu

Pro detailní data z úvodu:

**Krok 1 — agregace přes dimenzi `item`** (podkostka $\{location, time\}$):

| location | time | fakt |
| :--- | :--- | :---: |
| Brno | 22.6. | 32 (= 19 + 13) |
| Brno | 23.6. | 5 |
| Praha | 22.6. | 43 (= 22 + 21) |
| Praha | 23.6. | 14 |

Součet: 94.

**Krok 2 — další agregace přes dimenzi `location`** (podkostka $\{time\}$):

| time | fakt |
| :--- | :---: |
| 22.6. | 75 (= 32 + 43) |
| 23.6. | 19 (= 5 + 14) |

Součet: 94.

**Krok 3 — agregace přes poslední dimenzi `time`** (vrcholový kuboid, 0-D):

| fakt |
| :---: |
| 94 |

Klíčové pozorování: **součet je invariantní k pořadí agregace**. Můžeme začít přes `region`, pak přes `produkt`, pak přes `čas` — pořadí nezáleží, protože SUM je *komutativní a asociativní*. Pro takto pěkné funkce existuje **flexibilita ve volbě agregační cesty** v lattice, kterou OLAP server může využít.

## Aditivnost měr

Při návrhu schématu skladu je klíčové uvažovat **aditivnost měr** — zda je dovoleno měru sčítat přes danou dimenzi:

- **Plně aditivní** — lze sčítat přes *všechny* dimenze. Příklad: `prodaný_počet_kusů` — má smysl sčítat přes čas, region, produkt.
- **Semi-aditivní** — lze sčítat přes *některé* dimenze. Příklad: `stav_skladu` — má smysl sčítat přes regiony, **ale ne přes čas** (nedává smysl sečíst stav skladu z pondělí a úterý — to není „dva-dny stav").
- **Neaditivní** — nelze sčítat **přes žádnou** dimenzi. Příklad: `prům_cena_kusu`, `procento z celku` — průměry a poměry nelze prostě sčítat.

Při návrhu kostky je doporučení: **držet ve faktové tabulce plně aditivní míry** (SUM, COUNT). Semi-aditivní a neaditivní míry odvozujte při dotazu (AVG = SUM/COUNT). Vyhnete se chybným analýzám.

## Co dále

Algoritmus agregace je teď jasný. Otázkou zůstává **fyzická realizace** — jak server vnitřně data ukládá, jak rychle spočítá podkostky. To řeší architektury OLAP serverů (viz [[olap-architektury]]).

---

*Zdroj: PIS přednáška 8, prof. Ing. Tomáš Hruška, CSc., FIT VUT v Brně. Externí reference: Gray, J., Bosworth, A., Layman, A., Pirahesh, H.: „Data Cube: A Relational Aggregation Operator" (ICDE 1996, [DOI 10.1109/ICDE.1996.492099](https://doi.org/10.1109/ICDE.1996.492099)); Kimball, R.: *The Data Warehouse Toolkit*, kap. 6 (aditivnost měr).*
