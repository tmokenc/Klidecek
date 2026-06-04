---
title: Vzdálenostní funkce
---

# Princip shlukové analýzy a vzdálenostní funkce

**Shluková analýza** (clustering) je metoda **učení bez učitele** — automaticky hledá v datech skupiny (shluky) podobných objektů, aniž by znala správné rozdělení dopředu. **Shluk** je množina objektů, které jsou si navzájem *podobné* a zároveň *odlišné* od objektů v jiných shlucích. Dobré shlukování proto maximalizuje **podobnost uvnitř shluku** (high intra-class similarity) a minimalizuje **podobnost mezi shluky** (low inter-class similarity).

Klíčové je, čím se „podobnost" měří. To určuje **vzdálenostní funkce** (metrika nepodobnosti): malá vzdálenost = velká podobnost. Volba funkce zásadně ovlivní výsledné shluky, proto je vždy nutné ji přizpůsobit *typu dat*.

## Spojité atributy — Minkowského metrika

Pro číselné (spojité) atributy se používá **Minkowského vzdálenost** s parametrem $p$, která zobecňuje dva nejběžnější případy:

::: math
d_p(\mathbf{x}, \mathbf{y}) = \left( \sum_{i=1}^{n} |x_i - y_i|^{\,p} \right)^{1/p}
:::

- $p = 2$ → **euklidovská** vzdálenost (přímá vzdušná čára). Citlivá na velké odchylky v jediném atributu.
- $p = 1$ → **manhattanská** (městská, *city-block*) vzdálenost — součet absolutních rozdílů. Robustnější vůči extrémům.
- $p \to \infty$ → **Čebyševova** (maximová) vzdálenost.

Tyto funkce jsou pravé **metriky**: splňují nezápornost, symetrii, identitu nerozlišitelných ($d(x,y)=0 \iff x=y$) a **trojúhelníkovou nerovnost**.

::: svg "Euklidovská (přímka) vs. manhattanská (po osách) vzdálenost mezi dvěma body; kosinová podobnost měří úhel, ne délku."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <rect width="540" height="200" fill="var(--bg-inset)"/>
  <!-- panel 1: euclid vs manhattan -->
  <text x="10" y="18" fill="var(--text-muted)" font-size="10">euklidovská vs. manhattanská</text>
  <circle cx="50" cy="150" r="4" fill="var(--accent)"/>
  <text x="34" y="170" fill="var(--text-muted)" font-size="9">A</text>
  <circle cx="180" cy="60" r="4" fill="var(--accent)"/>
  <text x="186" y="58" fill="var(--text-muted)" font-size="9">B</text>
  <line x1="50" y1="150" x2="180" y2="60" stroke="var(--accent)" stroke-width="1.6"/>
  <text x="100" y="98" fill="var(--accent)" font-size="9">euklid (p=2)</text>
  <polyline points="50,150 180,150 180,60" fill="none" stroke="oklch(0.65 0.16 264)" stroke-width="1.4" stroke-dasharray="4 3"/>
  <text x="92" y="165" fill="oklch(0.65 0.16 264)" font-size="9">manhattan (p=1)</text>
  <!-- panel 2: cosine -->
  <line x1="320" y1="170" x2="320" y2="30" stroke="var(--line-strong)" stroke-width="0.7"/>
  <line x1="320" y1="170" x2="470" y2="170" stroke="var(--line-strong)" stroke-width="0.7"/>
  <text x="300" y="18" fill="var(--text-muted)" font-size="10">kosinová podobnost = úhel θ</text>
  <line x1="320" y1="170" x2="440" y2="70" stroke="var(--accent)" stroke-width="1.6"/>
  <text x="444" y="68" fill="var(--accent)" font-size="9">u</text>
  <line x1="320" y1="170" x2="410" y2="110" stroke="oklch(0.6 0.18 22)" stroke-width="1.6"/>
  <text x="414" y="112" fill="oklch(0.6 0.18 22)" font-size="9">v</text>
  <path d="M 360 142 A 45 45 0 0 1 372 124" fill="none" stroke="var(--text)" stroke-width="1"/>
  <text x="372" y="146" fill="var(--text)" font-size="10">θ</text>
  <text x="330" y="190" fill="var(--text-faint)" font-size="9">délka vektorů nehraje roli</text>
</svg>
:::

## Kosinová podobnost — orientace místo délky

Pro **vysokodimenzionální** data (typicky text reprezentovaný jako vektor četností slov) je délka vektorů zavádějící — dlouhý dokument má velké hodnoty u všech slov. **Kosinová podobnost** měří *úhel* mezi vektory, takže ignoruje měřítko:

::: math
\cos(\mathbf{u}, \mathbf{v}) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\|\,\|\mathbf{v}\|}
\quad\Rightarrow\quad d_{\cos} = 1 - \cos(\mathbf{u}, \mathbf{v})
:::

Hodnota 1 znamená stejný směr (maximální podobnost), 0 kolmost. Proto je kosinová míra standardem pro shlukování dokumentů.

## Binární a ordinální data

Vzdálenost musí odpovídat *typu* atributu, jinak nemá smysl:

- **Binární atributy** (přítomnost/nepřítomnost): pro *řídká* asymetrická data (shody na 0 nejsou informativní) se používá **Jaccardův koeficient** — poměr společných prvků k jejich sjednocení. Jeho doplněk $1 - J$ je vzdálenost.

::: math
J(A, B) = \frac{|A \cap B|}{|A \cup B|}
:::

- **Ordinální atributy** (uspořádané kategorie, např. „malý < střední < velký"): hodnoty se převedou na *pořadí* $r \in \{1,\dots,M\}$ a normalizují na interval $[0,1]$ jako $(r-1)/(M-1)$, poté se s nimi zachází jako se spojitými.
- **Nominální/smíšené atributy**: kombinuje se např. **Gowerova** míra, která pro každý typ atributu počítá vlastní dílčí nepodobnost.

## Normalizace — proč je nutná

Vzdálenostní funkce sčítá rozdíly napříč atributy. Atribut s velkým rozsahem (např. plat v desetitisících) by jinak **přebil** atribut s malým rozsahem (např. věk). Proto se data před shlukováním **normalizují**, aby každý atribut přispíval rovnoměrně. Typicky **z-skóre standardizací**:

::: math
z_i = \frac{x_i - \mu_i}{\sigma_i}
:::

(odečtení průměru $\mu_i$ a dělení směrodatnou odchylkou $\sigma_i$), případně **min-max** škálováním do intervalu $[0,1]$.

::: quiz "Proč se pro shlukování dokumentů (vektory četností slov) typicky volí kosinová podobnost místo euklidovské vzdálenosti?"
- [x] Ignoruje délku vektorů, takže dva tematicky shodné dokumenty různé délky vyjdou jako podobné
- [ ] Je to pravá metrika splňující trojúhelníkovou nerovnost
- [ ] Vždy dává menší hodnoty než euklidovská vzdálenost
- [ ] Funguje jen pro binární data
> Kosinová míra závisí jen na úhlu (orientaci) vektorů, ne na jejich velikosti — dlouhý a krátký dokument o stejném tématu mají téměř shodný směr, a tedy vysokou podobnost.
:::

::: link "Wikipedia: Minkowski distance (Euclidean, Manhattan, Chebyshev)" "https://en.wikipedia.org/wiki/Minkowski_distance"
:::

::: link "GeeksforGeeks: Clustering Distance Measures (cosine, Jaccard, ordinal)" "https://www.geeksforgeeks.org/machine-learning/clustering-distance-measures/"
:::

*Zdroj: ZZN státnicové okruhy NBIO, VUT FIT. Externí reference: Wikipedia [Minkowski distance](https://en.wikipedia.org/wiki/Minkowski_distance); GeeksforGeeks [Clustering Distance Measures](https://www.geeksforgeeks.org/machine-learning/clustering-distance-measures/); Han, J., Kamber, M., Pei, J.: *Data Mining — Concepts and Techniques* (3. vyd., Morgan Kaufmann 2011), kap. 2 (míry podobnosti a normalizace).*
