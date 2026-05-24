---
title: Datová sada — objekty, atributy, typy
---

# Datová sada — objekty, atributy, typy

**Datová sada** (dataset) je kolekce dat vybraných k dolování. V tradičním data miningu má tabulkovou podobu: řádky = *datové objekty* (entity), sloupce = *atributy* (vlastnosti). Pochopení struktury datové sady a *typů atributů* je klíčové, protože různé typy vyžadují různé analytické metody (klasifikační algoritmy, statistické testy, vizualizace). Tato znalost je předpokladem pro fázi *přípravy dat* a *modelování* v CRISP-DM ([[crisp-dm]]).

## Datová sada — formy

### Tradiční flat file

Tabulka s pevným počtem sloupců, hodnoty v každém řádku. Reprezentace: CSV, Excel, relační tabulka.

```
id,jmeno,vek,plat,oblast
1,Anna,31,50000,IT
2,Bob,42,60000,HR
3,Carol,28,45000,IT
```

Klasické formáty: CSV, TSV, Parquet (sloupcový), JSON Lines (semi-strukturovaný), HDF5 (vědecký).

### Multi-dimenzionální data (datový sklad)

Datová kostka — pre-agregované údaje pro analytické dotazy ([[sql-objekt-features]]).

### Transakční data

Kolekce transakcí, každá obsahuje *množinu položek*:

```
T100  10, 12, 15
T200  10, 18
T300  10, 12, 18, 22
```

Pro asociační analýzu (market basket analysis).

### Nestrukturovaná data

Texty, obrázky, audio, video. Vyžadují *předzpracování* (extrakce příznaků/embeddings) před modelováním.

## Datový objekt

**Datový objekt** je *jednotka* datové sady. Reprezentuje entitu reálného světa nebo abstraktní vzorec.

Synonyma: *vzorek* (sample), *příklad* (example), *instance*, *datový bod*, *n-tice*, *řádek*.

Příklady:
* V katalogu zákazníků — zákazník (id, jméno, věk, adresa).
* V textových datech — dokument (slova, frekvence).
* V obrazových datech — obrázek (pixely, embedding vektor).
* V senzorových datech — měření (čas, hodnota, lokace).

Pro klasické dolovací algoritmy je objekt reprezentován **vektorem atributů**.

## Atribut

**Atribut** (synonyma: *dimenze*, *rys* / *feature*, *proměnná*, *prediktor*) je *součást struktury datového objektu* reprezentující jeho vlastnost.

```
Objekt:    {id=1, jmeno="Anna", vek=31, plat=50000, oblast="IT"}
              ↓      ↓           ↓        ↓             ↓
Atributy:    PK     string      int      decimal       categorical
```

Atributy mohou být:
* **Doménové** — sémanticky pochopené (jméno, věk, adresa).
* **Odvozené** — vypočítané z primárních (index BMI z výšky a váhy).
* **Embedding** — naučené ML modelem (word2vec vektor slova).

## Typy atributů

Statistická klasifikace atributů určuje, jaké operace nad nimi mají smysl.

### Kvalitativní (kategorické)

Hodnoty z konečné množiny *kategorií*.

* **Binární** — dvě hodnoty.
  * *Symetrické* — obě stejně důležité (pohlaví ∈ {muž, žena}).
  * *Asymetrické* — jeden stav je *zvláštní* (test ∈ {pozitivní, negativní} — pozitivní je významný).
* **Nominální** — kategorie bez uspořádání (barva ∈ {černá, modrá, bílá}, krevní skupina ∈ {A, B, AB, 0}, jazyk ∈ {cs, en, de}).
* **Ordinální** — kategorie *s uspořádáním*, ale rozdíl sousedních hodnot není definovaný (vzdělání ∈ {základní, středoškolské, vysokoškolské}; hodnocení ∈ {★, ★★, ★★★, ★★★★, ★★★★★}).

Operace: porovnání rovnosti (`==`, `!=`). Pro ordinální i porovnání pořadí (`<`, `>`). Rozdíl, součet nemají smysl.

### Kvantitativní (numerické)

Číselné hodnoty.

* **Intervalové** — hodnoty uspořádatelné, *aditivní rozdíly*, ale *nemá smysluplnou nulu*. Příklad: teplota °C (0 °C ≠ "žádná teplota"), kalendářní datum, IQ.
* **Poměrové (ratio)** — má *implicitní nulový bod*, smysluplné jsou i poměry. Příklad: teplota K, délka, váha, počet dětí, čas trvání, peníze, počet zákazníků.

Operace: porovnání, rozdíl, *průměr*. Poměrový umí i podíl ("2× větší"); intervalový ne (40 °C *není* "2× tepleji než 20 °C").

::: svg "Typy atributů — od nominálních (jen rovnost) po poměrové (všechny aritmetické operace)."
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g>
    <rect x="20" y="40" width="100" height="100" fill="var(--bg-inset)" stroke="var(--line)" rx="6"/>
    <text x="70" y="60" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="10">Nominální</text>
    <text x="70" y="78" text-anchor="middle" fill="var(--text-muted)" font-size="9">{=, ≠}</text>
    <text x="70" y="100" text-anchor="middle" fill="var(--text)" font-size="10">barva</text>
    <text x="70" y="115" text-anchor="middle" fill="var(--text)" font-size="10">krev. skupina</text>
    <text x="70" y="130" text-anchor="middle" fill="var(--text)" font-size="10">jazyk</text>
  </g>
  <g>
    <rect x="135" y="40" width="100" height="100" fill="var(--bg-inset)" stroke="var(--line)" rx="6"/>
    <text x="185" y="60" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="10">Ordinální</text>
    <text x="185" y="78" text-anchor="middle" fill="var(--text-muted)" font-size="9">{=, ≠, &lt;, &gt;}</text>
    <text x="185" y="100" text-anchor="middle" fill="var(--text)" font-size="10">vzdělání</text>
    <text x="185" y="115" text-anchor="middle" fill="var(--text)" font-size="10">hodnocení ★</text>
    <text x="185" y="130" text-anchor="middle" fill="var(--text)" font-size="10">rank</text>
  </g>
  <g>
    <rect x="250" y="40" width="100" height="100" fill="var(--bg-inset)" stroke="var(--line)" rx="6"/>
    <text x="300" y="60" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="10">Intervalové</text>
    <text x="300" y="78" text-anchor="middle" fill="var(--text-muted)" font-size="9">{+, −}, ne podíl</text>
    <text x="300" y="100" text-anchor="middle" fill="var(--text)" font-size="10">teplota °C</text>
    <text x="300" y="115" text-anchor="middle" fill="var(--text)" font-size="10">datum</text>
    <text x="300" y="130" text-anchor="middle" fill="var(--text)" font-size="10">IQ</text>
  </g>
  <g>
    <rect x="365" y="40" width="100" height="100" fill="var(--bg-inset)" stroke="var(--accent)" rx="6" stroke-width="2"/>
    <text x="415" y="60" text-anchor="middle" fill="var(--text)" font-weight="600" font-size="10">Poměrové</text>
    <text x="415" y="78" text-anchor="middle" fill="var(--text-muted)" font-size="9">vše + podíl</text>
    <text x="415" y="100" text-anchor="middle" fill="var(--text)" font-size="10">délka, hmotnost</text>
    <text x="415" y="115" text-anchor="middle" fill="var(--text)" font-size="10">peníze</text>
    <text x="415" y="130" text-anchor="middle" fill="var(--text)" font-size="10">teplota K</text>
  </g>
  <line x1="120" y1="90" x2="135" y2="90" stroke="var(--accent-line)" marker-end="url(#typ-arr)"/>
  <line x1="235" y1="90" x2="250" y2="90" stroke="var(--accent-line)" marker-end="url(#typ-arr)"/>
  <line x1="350" y1="90" x2="365" y2="90" stroke="var(--accent-line)" marker-end="url(#typ-arr)"/>
  <text x="270" y="170" text-anchor="middle" fill="var(--text-muted)" font-size="10">narůstá množina povolených operací →</text>
  <defs>
    <marker id="typ-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0L10 5L0 10z" fill="var(--accent-line)"/>
    </marker>
  </defs>
</svg>
:::

## Strukturální klasifikace dat

Z hlediska *struktury* dělíme data:

* **(Plně) strukturovaná** — relační DB, kostky, CSV. Mají *schéma*, lze parsovat.
* **Semi-strukturovaná** — XML, HTML, JSON, BibTeX, log soubory. Mají rozpoznatelný syntaktický vzor (parseable), ale schéma je *volné* (různé záznamy mohou mít různá pole).
* **Kvazi-strukturovaná** — clickstream, kompletní HTTP logy. Pravidelný formát, ale s *nepravidelnostmi* a *vychýleními*.
* **Nestrukturovaná** — prostý text, PDF, obrázky, audio, video. Žádná snadno parsovatelná struktura.

Pro klasické algoritmy potřebujeme *strukturovaná* nebo aspoň *semi-strukturovaná* data. Nestrukturovaná data se *předzpracují* (extrakce příznaků, embedding) do strukturované formy. Viz [[webscraping-motivace]] pro extrakci z webu, [[cisteni-dat]] pro transformaci.

## Typické zdroje dat

### Úložiště "statických" dat

* **Tradiční** — relační DB (tabulky), transakční DB (`(transakce_id, položky)`), datové sklady (kostky), strukturované soubory.
* **Pokročilé** — nerelační NoSQL DB ([[typy-nosql]]), soubory nestrukturovaných dat.

### Streamy a Big Data

* **Web a sociální sítě** — Twitter feed, FB API, web crawls.
* **Proudy dat** (streams) — *potenciálně nekonečné* posloupnosti. Dostupné jen *dočasně*. Příklady: senzory, dohledové systémy, bankovní transakce.
* **Velmi rozsáhlá data (Big Data)** — charakterizovaná **4V**:
  * **V**olume — TB až PB.
  * **V**elocity — rychlý vznik a aktualizace.
  * **V**ariety — různé zdroje, typy, formáty.
  * **V**eracity — nejistota, nekonzistence, neúplnost.

Big Data vyžaduje *specializované systémy* (Hadoop, Spark, Kafka) — viz [[mapreduce]].

## Příprava datové sady — flow

```
zdroj 1 ─┐
zdroj 2 ─┤  výběr      tradiční        připravená
   …     ├─→ kolekce ──→ data?  ─Ano→  data
zdroj n ─┘    dat         │
                          ↓ Ne
                       specifické       speciální
                       předzpracování → dolovací algoritmy
                                       (text mining, image)
```

Pro různé typy dat se používají různá pipeliny:
* **Tabular data** — sklearn, XGBoost, LightGBM.
* **Text** — NLP pipeline (tokenizer, vectorizer, classifier) → BERT, GPT.
* **Image** — CNN (ResNet, EfficientNet) → CLIP embeddings.
* **Time series** — Prophet, LSTM, Transformer (TimesFM).
* **Graph** — Graph Neural Networks (GCN, GAT).

## Doménová znalost

Datový vědec **musí spolupracovat s doménovým expertem** — bez něj nelze správně interpretovat data:

* **Sémantika atributů** — co znamená `status_code = 7`? Co je *outlier*?
* **Business rules** — jaké kombinace jsou platné? Co je v doméně podezřelé?
* **Cíl dolování** — co stakeholdera *zajímá*? Co je úspěch?

Doménový expert je *prostředník* mezi byznysem a technologií. V CRISP-DM ([[crisp-dm]]) je klíčový v fázi 1 a 5.

## Praktické tipy

* **Začněte malou ukázkou** — než budete tahat 100 GB dat, prozkoumejte 10 MB sample. Vyhnete se 99 % problémů.
* **Datový slovník** — dokumentujte každý atribut: typ, povolené hodnoty, sémantika, zdroj.
* **Versioning** — DVC, MLflow Datasets — sledujte verze dat stejně jako kódu.
* **Privacy** — anonymizujte před distribucí, vyhněte se PII (Personal Identifiable Information).

Více o popisných charakteristikách viz [[popisne-charakteristiky]] a vizualizaci [[vizualizace-korelace]].

::: link "Han, J., Kamber, M., Pei, J.: Data Mining — Concepts and Techniques (kniha)" "https://hanj.cs.illinois.edu/bk3/"
:::

::: link "Provost, F., Fawcett, T.: Data Science for Business (kniha)" "https://data-science-for-business.com/"
:::

---

*Zdroj: UPA přednáška *Získávání znalostí z dat — úvodní informace* a *Porozumění datům* (Burgetová). Externí reference: Han, J., Kamber, M., Pei, J.: *Data Mining — Concepts and Techniques*, 3rd ed., Morgan Kaufmann 2012; Provost, F., Fawcett, T.: *Data Science for Business*, O'Reilly 2013; Stevens, S. S.: *On the Theory of Scales of Measurement*, Science 103(2684), 1946.*
