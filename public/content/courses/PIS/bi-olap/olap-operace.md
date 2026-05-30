# OLAP operace — roll-up, drill-down, pivoting, slicing & dicing

Datový sklad ([[datovy-sklad]]), kostka ([[multidimenzionalni-kostka]]), schéma ([[schemata-skladu]]) — vše je připraveno, zbývá ukázat **jak s tím uživatel interaktivně pracuje**. Tato sekce probere čtyři kanonické OLAP operace, jejichž skladbou analytik *prozkoumává* multidimenzionální data.

## Filozofie: interaktivní průzkum

OLAP není jednorázový dotaz — je to *sekvence dotazů*, kde každý další zpřesňuje pohled na základě výsledku předchozího. Klasický příklad sekvence (podle Hrušky):

> Manažer vidí *propad zisku podniku*. Rozpadne data dotazem:
>
> 1. **Celosvětové měsíční prodeje za posledních 5 měsíců** (drill-down v čase).
> 2. **Přehled měsíčních prodejů po regionech** → vidí *velký propad v Evropě* (drill-down v geografii).
> 3. **Přehled prodejů v Evropě po zemích** → propad ve *třech zemích* (další drill-down).
> 4. **Přehled prodejů po zemích a produktech** (přidání další dimenze).
> 5. **Přehled přímých a nepřímých nákladů** → *nepřímé náklady se zvýšily*.
> 6. **Závěr:** vyšší daň v EU na některé produkty.

Bez OLAP by tato sekvence znamenala 6 ručně napsaných SQL dotazů. S OLAP klientem (Tableau, Power BI, Excel Pivot) klikání = sekundy.

::: viz olap-cube "Klikni na operace nahoře a sleduj, jak se mění data. Hierarchie: dny → týdny, produkty → kategorie, města → země."
:::

Čtyři základní operace, které pohyby ve svazu kuboidů popisují:

## 1. Roll-up — vzrůst agregace

**Roll-up** = *posun o jednu úroveň výš* ve svazu kuboidů. *Agregace narůstá* — méně dimenzí, větší shluky.

Formálně:

- **Vstup:** $m$ aktivních dimenzí $\{A_1, A_2, \ldots, A_i, \ldots, A_m\}$.
- **Výstup:** $m - 1$ aktivních dimenzí ($A_i$ bylo *deaktivováno*).
- Nejčastěji se deaktivuje **nejmenší** dimenze $A_m$ (poslední ve výběru), ale lze libovolnou.

Příklad: $(čas \times item \times location) \xrightarrow{\text{roll-up přes location}} (čas \times item)$.

Hierarchicky: $měsíc \to kvartál \to rok$. Roll-up po hierarchii: detailnější časová granularita se *agreguje* nahoru.

V SQL: přidání `GROUP BY` přes hrubší úroveň.

## 2. Drill-down — zvýšení detailu

**Drill-down** = *opak roll-upu* — posun o jednu úroveň níž. *Agregace klesá* — víc dimenzí, jemnější detail.

Formálně:

- **Vstup:** $m$ aktivních dimenzí, $m < n$ (musí zbývat alespoň jedna neaktivní dimenze).
- **Výstup:** $m + 1$ aktivních dimenzí (přidána dosud neaktivní dimenze $A_{m+1}$).
- Opakovaný drill-down končí při $m = n$ — to je **detail všech hodnot** (základní kuboid), z nějž už dál dolů nelze.

Příklad: $(rok) \xrightarrow{\text{drill-down}} (rok \times kvartál) \xrightarrow{\text{drill-down}} (rok \times kvartál \times měsíc)$.

V Excel Pivot: kliknutí na *+* u řádku rozbalí detail. V SQL: `GROUP BY` jemnější.

## 3. Pivoting — otočení kostky

**Pivoting** = *změna uspořádání dimenzí* (změna relace $R$) **nad stejnou množinou dimenzí**.

Formálně:

- **Vstup:** uspořádání $\{D_1, D_2, \ldots, D_n\}$.
- **Výstup:** jiné uspořádání $\{D_{x_1}, D_{x_2}, \ldots, D_{x_n}\}$ — jedna z $n!$ permutací.
- Geometricky: *otočení jedné ze stěn kostky k sobě*.

Příklad: $(čas \times item \times supplier) \xrightarrow{\text{pivoting}} (supplier \times item \times čas)$.

V Excel Pivot: drag-and-drop dimenze z řádků do sloupců nebo naopak. Klasická interaktivní operace „pivot table".

Pozn.: pivoting **nemění data** — pouze *zobrazení*. Stejná kostka, jen otočená.

## 4. Slicing & Dicing — řezání

**Slicing & Dicing** = *omezení skutečné kardinality* jedné nebo více dimenzí.

Formálně:

- **Vstup:** dimenze $\{D_1, \ldots, D_n\}$ s kardinalitami $k_1, \ldots, k_n$.
- **Výstup:** stejné dimenze, ale *změněná kardinalita* $k_i \to l_i$ (kde $l_i \leq k_i$) vybrané dimenze.
- Provádí se nastavením **filtru ve tvaru predikátu**.

Rozdíl mezi *slice* a *dice*:

- **Slice** — fixuje *jednu hodnotu* jedné dimenze. Příklad: `region = Praha` → kostka „zploští" o tuto dimenzi.
- **Dice** — *filtr přes více dimenzí*. Příklad: `region = Praha AND čas ∈ Q1 2024 AND produkt = elektro`.

Výsledek slice/dice ovlivňují *i filtry neaktivních dimenzí* — pokud se agregát počítal přes všechny regiony, slice na `region = Praha` změní *všechny* nadřazené agregáty.

V SQL: `WHERE` klauzule.

## Souhrnná tabulka

| Operace | Efekt | Příklad |
| :--- | :--- | :--- |
| **Roll-up** | Méně dimenzí, vyšší agregace | měsíc → kvartál → rok |
| **Drill-down** | Více dimenzí, větší detail | rok → kvartál → měsíc |
| **Pivoting** | Jiné pořadí dimenzí | čas×produkt → produkt×čas |
| **Slice** | Fixuje hodnotu jedné dimenze | region = Praha |
| **Dice** | Filtr přes více dimenzí | Praha + Q1 + elektro |

## Požadavky na OLAP systémy

Aby OLAP server umožňoval výše uvedené operace efektivně, musí splňovat několik nefunkčních požadavků (Codd, 1993, *Twelve Rules for OLAP*):

- **Agregační funkce** podle hierarchií dimenzí (SUM, AVG, COUNT, … po měsících → kvartálech → rocích).
- **Detailní pohled** (drill-down) na data — vždy musí být cesta dolů, k řádku faktu.
- **Jednoduché kalkulace** — typické výpočty jako *zisk = prodeje – náklady* by měl uživatel definovat bez programátora.
- **Sdílení kalkulací** pro procentuální vyjádření vůči celku — *„kolik procent celkového zisku přinesla Praha?"*.
- **Algebraické rovnice** pro klíčové indikátory výkonnosti (KPI) — *ROI, margin, churn rate*.
- **Analýza trendů** statistickými metodami — klouzavý průměr, sezonalita, predikce.
- **Interaktivní odezva** — typický dotaz pod 5 sekund (Codd: „on-line").
- **Multidimenzionální koncepční model** — pro uživatele kostka, ne tabulka.

Splnění těchto požadavků odlišuje skutečný OLAP od „relace s pár indexy". Standardní jazyk pro OLAP dotazy je **MDX** (*MultiDimensional eXpressions*, Microsoft, 1998), kterým se programují multidimenzionální dotazy. Alternativou je *SQL/OLAP* — rozšíření ANSI SQL o `CUBE`, `ROLLUP`, `GROUPING SETS`, `PARTITION BY`.

---

*Zdroj: PIS přednáška 8, prof. Ing. Tomáš Hruška, CSc. a doc. Ing. Radek Burget, Ph.D., FIT VUT v Brně. Externí reference: Codd, E.F.: *Providing OLAP to User-Analysts* (Hyperion 1993); [Microsoft MDX reference](https://learn.microsoft.com/en-us/sql/mdx/multidimensional-expressions-mdx-reference); Kimball, R., Ross, M.: *The Data Warehouse Toolkit* (3. vyd., Wiley 2013).*
