---
title: Typy strojového učení
---

# Typy strojového učení

Strojové učení (ML) je oblast, kde se program **učí z dat** místo toho, aby byl explicitně naprogramován. Klasická definice (Tom M. Mitchell, 1997): *„Program se učí ze zkušenosti E vzhledem k třídě úloh T a metrice výkonu P, pokud jeho výkon na úlohách v T, měřený podle P, roste s rostoucí zkušeností E."*

Cíl: dostat z konečného trénovacího souboru *generalizující* mapování vstup → výstup, které funguje i na **nových, nikdy neviděných** datech.

## Vstupy a výstupy

Vstupní pozorování (input observation, *features*) může mít různou strukturu:

* **Skalár nebo vektor pevné dimenze** — např. `x ∈ R^D` (váha + výška + průměr objektu).
* **Matice / tenzor** — obrázek `100×100×3` jako 3D pole RGB hodnot.
* **Sekvence proměnné délky** — řečový signál, věta, video.
* **Diskrétní symbol** — slovo z slovníku, jeden z N typů akce.

Nejčastěji pracujeme s **D-rozměrnými vektory**:

::: math
\mathbf{x} = (x_1, x_2, \dots, x_D)^\top \in \mathbb{R}^D
:::

Sada `N` trénovacích pozorování pak tvoří matici `X` o rozměrech `N × D`. Pro vizualizaci pracujeme často s `D=2` — body v rovině, kde každá osa je jeden feature.

## Hlavní paradigmata učení

::: svg "Čtyři hlavní typy strojového učení podle dostupných dat a interakce s prostředím."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="14" y="22" width="120" height="180" rx="8"/>
    <rect x="148" y="22" width="120" height="180" rx="8"/>
    <rect x="282" y="22" width="120" height="180" rx="8"/>
    <rect x="416" y="22" width="120" height="180" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="12">
    <text x="74" y="42" font-weight="600">Supervised</text>
    <text x="208" y="42" font-weight="600">Unsupervised</text>
    <text x="342" y="42" font-weight="600">Semi-supervised</text>
    <text x="476" y="42" font-weight="600">Reinforcement</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9">
    <text x="74" y="58">(x, y) páry</text>
    <text x="208" y="58">jen x</text>
    <text x="342" y="58">málo (x,y) + hodně x</text>
    <text x="476" y="58">prostředí + odměna</text>
  </g>
  <g fill="var(--text)" text-anchor="start" font-size="10">
    <text x="22" y="86">• Klasifikace</text>
    <text x="22" y="104">• Regrese</text>
    <text x="22" y="122">• Detekce</text>
    <text x="22" y="140">• Strukturní</text>
    <text x="22" y="158">  predikce</text>
    <text x="22" y="180">př: OCR,</text>
    <text x="22" y="194">rozpozn. tváří</text>
    <text x="156" y="86">• Clustering</text>
    <text x="156" y="104">• Anomaly</text>
    <text x="156" y="122">  detection</text>
    <text x="156" y="140">• Density est.</text>
    <text x="156" y="158">• Reprezentace</text>
    <text x="156" y="180">př: diarizace,</text>
    <text x="156" y="194">generování</text>
    <text x="290" y="86">• Label propag.</text>
    <text x="290" y="104">• Self-training</text>
    <text x="290" y="122">• Pretraining +</text>
    <text x="290" y="140">  fine-tuning</text>
    <text x="290" y="158"> </text>
    <text x="290" y="180">př: BERT, GPT</text>
    <text x="290" y="194">předtrénování</text>
    <text x="424" y="86">• Q-learning</text>
    <text x="424" y="104">• Policy</text>
    <text x="424" y="122">  gradient</text>
    <text x="424" y="140">• Actor-critic</text>
    <text x="424" y="158"> </text>
    <text x="424" y="180">př: hry, robotika,</text>
    <text x="424" y="194">autonomní řízení</text>
  </g>
</svg>
:::

### Supervised learning (s učitelem)

Trénovací data jsou **páry** `(x, y)`: vstup `x` a *desired output* `y`. Cílem je naučit se funkci `f: X → Y`, která pro nová `x` predikuje `y`.

Dvě hlavní podúlohy:

* **Klasifikace** — `y` je diskrétní třída. Např. `y ∈ {jablko, granát}`, `y ∈ {0..9}` (rozpoznání číslice). Detail v [[gaussovsky-klasifikator]].
* **Regrese** — `y` je spojitá hodnota. Např. `y ∈ R` (cena akcie, teplota). Detail v [[linearni-regrese]].

Generalizace klasifikace na složitější výstupy: **structured prediction** — sekvence slov (rozpoznání řeči), bounding boxy (detekce objektů), strom (parser), překlad textu.

### Unsupervised learning (bez učitele)

Trénovací data jsou **jen vstupy** `x` — bez labelů. Učíme se strukturu dat.

* **Clustering** — najít shluky podobných vzorků. Např. v nahrávce konverzace seskupit segmenty stejného mluvčího (*speaker diarization*).
* **Anomaly detection** — najít odlehlé vzorky (výjimky), které se liší od typického rozložení. Použití: detekce podvodů, monitoring sítí.
* **Density estimation** — naučit se pravděpodobnostní rozdělení `p(x)` dat. Z odhadnutého `p(x)` lze pak generovat nové podobné vzorky — *generativní modely* (VAE, GAN, normalizing flows, diffusion).
* **Reprezentační učení** — naučit se užitečné nízkodimenzionální *embeddingy* (PCA, autoencoder).

### Semi-supervised learning

Kombinace: **málo labelovaných** a **hodně nelabelovaných** vzorků. Nelabelovaná data pomáhají najít lepší decision boundary (např. díky předpokladu, že hranice prochází nízkohustotními oblastmi).

Praktický význam je obrovský — labely jsou drahé, surový text/obraz na internetu prakticky zdarma. Současné LLM (BERT, GPT) se nejprve **self-supervised** předtrénují na obrovských korpusech (predikce maskovaných slov), pak se *fine-tunují* na konkrétní úlohu s málo labely.

### Reinforcement learning (posilované učení)

Agent jedná v **prostředí**: vykonává *akce*, dostává *odměny*, učí se z následků. Žádný učitel nedává „správnou odpověď" — pouze skalární odměna po (často dlouhé) sekvenci akcí.

Příklady: učení hry Go ([AlphaGo](https://deepmind.com/research/case-studies/alphago-the-story-so-far)), autonomní řízení, robotika. Detail v [[rl-framework]].

## Trénování, validace, test

Klíčový princip: **netestujeme model na datech, na kterých se učil**. Naopak. Standardní rozdělení:

* **Trénovací množina** — model se na ní *učí* parametry (`fit`).
* **Validační množina** — hodnotíme různé hyperparametry (architektura, learning rate, regularizace) a vybíráme nejlepší. Model se na ní *neučí parametry*.
* **Testovací množina** — *jednou* na ni model pustíme, odhadneme reálnou výkonnost. Po test setu už by se nemělo *nic ladit* — jinak na ni model „přenastavíme".

Typický **overfitting** poznáme tak, že trénovací chyba je nízká, ale validační/testovací chyba je výrazně vyšší — model si zapamatoval šum trénovací sady místo obecných pravidel. Detail v [[nn-generalizace]].

## Diskriminativní vs. generativní modely

Dva přístupy ke klasifikaci `c | x` (třída při daném pozorování):

* **Generativní** — modelujeme `p(x | c)` pro každou třídu zvlášť a `p(c)` (apriorní pravděpodobnost). Třídu pak určíme z Bayesova pravidla: `p(c | x) ∝ p(x | c) p(c)`. Příklad: gaussovský klasifikátor v [[gaussovsky-klasifikator]].
* **Diskriminativní** — modelujeme přímo `p(c | x)` (nebo deterministickou funkci `f(x) → c`). Příklad: logistická regrese ([[logisticka-regrese]]), neuronové sítě.

Generativní modely umí navíc **generovat** nové vzorky (sampling z `p(x | c)`) a fungují i s chybějícími featury. Diskriminativní jsou obvykle *přesnější* pro samotnou klasifikaci, ale neumějí to navíc (negenerují vzorky, hůře zvládají chybějící featury).

## Klíčové výzvy

* **Generalizace** — model funguje na nových datech, ne jen na trénovacích.
* **Curse of dimensionality** — počet potřebných vzorků roste exponenciálně s dimenzí.
* **Bias-variance trade-off** — moc jednoduchý model nedokáže zachytit pravidla (high bias, underfitting); moc složitý si zapamatuje šum (high variance, overfitting).
* **Data quality** — nesprávně labelovaná, nereprezentativní data → nesprávný model („garbage in, garbage out").
* **Etika a fairness** — modely mohou *replikovat* a *zesilovat* zkreslení z trénovacích dat.

::: link "Tom M. Mitchell: Machine Learning (1997) — klasická učebnice s definicí oboru" "https://www.cs.cmu.edu/~tom/mlbook.html"
:::

::: link "Christopher Bishop: Pattern Recognition and Machine Learning (Springer 2006) — komplexní úvod" "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/"
:::

::: link "Stanford CS229 (Andrew Ng): Machine Learning — kurz" "https://cs229.stanford.edu/"
:::

---

*Zdroj: SUI přednášky 2025/26, *Basics in Machine Learning* (Burget). Externí reference: Mitchell, T.: *Machine Learning* (McGraw-Hill 1997); Bishop, C.: *Pattern Recognition and Machine Learning* (Springer 2006); Russell & Norvig: *Artificial Intelligence — A Modern Approach* (4. vyd., Pearson 2020).*
