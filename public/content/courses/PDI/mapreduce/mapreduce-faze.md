---
title: Průběh: Map, Shuffle, Reduce
---

Kanonickým příkladem MapReduce je **Word Count** — spočítat, kolikrát se každé slovo vyskytuje v obrovské kolekci textu. Na něm je nejlépe vidět, jak se data v průběhu výpočtu *transformují* a přesouvají mezi uzly. Celý výpočet prochází pěti fázemi: rozdělení vstupu, Map, Shuffle, Reduce a zápis výsledku.

## Input & Splitting — logické rozdělení vstupu

Vstupní data (např. text `"Deer Bear River Car Car River Deer Car Bear"`) se rozdělí na menší logické části — **splits**. Každý split se přidělí jednomu nezávislému map tasku a zpracuje se na samostatném uzlu. Split je *logická* jednotka (rozsah bajtů v souboru), nikoli nutně fyzický blok; framework jej volí tak, aby respektoval datovou lokalitu (viz [[mapreduce-model]]).

## Mapping — emit `(slovo, 1)`

Každý map task aplikuje funkci **Map** na svůj split. Pro Word Count mapper rozdělí text na slova a pro každé z nich vyprodukuje (emituje) pár `(slovo, 1)`:

```python
def map(key, line):           # key = offset, value = řádek textu
    for word in line.split():
        emit(word, 1)         # mezilehlý pár: (slovo, 1)
```

Vznikne tak proud mezilehlých párů jako `(Deer, 1) (Bear, 1) (River, 1) …`. Tyto výstupy se zatím nikam neagregují — zůstávají uloženy na **lokálním disku** uzlu, kde mapper běžel. Mapper přitom mezilehlé páry rozdělí (partition) podle `hash(klíč) mod R` do `R` oddílů, kde `R` je počet reducerů.

## Shuffling — seskupení a seřazení stejných klíčů přes síť

**Shuffle & sort** je kritická synchronizační fáze. Framework musí zajistit, aby *všechny* hodnoty se stejným klíčem doputovaly k témuž reduceru, bez ohledu na to, který mapper je vyprodukoval. Reducer si proto „stáhne" (fetch) svůj oddíl z lokálních disků *všech* mapperů, čímž data cestují **křížem přes síť** — všechny jedničky pro `Car` skončí na jednom uzlu, všechny pro `Bear` na jiném. Stažené páry se na straně reduceru **seřadí podle klíče**, aby vznikly souvislé skupiny.

Shuffle je jediná fáze typu *all-to-all* (každý mapper potenciálně mluví s každým reducerem) a je tak hlavním síťovým úzkým hrdlem celého výpočtu.

::: viz mapreduce-shuffle "Word Count animovaně: dokumenty → map tasky emitují (slovo, 1) → shuffle podle hash(klíč) mod R → reducer agreguje. Posuň počet reducerů R a krokuj fáze."
:::

## Reducing — agregace

Funkce **Reduce** dostane jeden klíč a seznam všech jeho hodnot, např. `(Car, [1, 1, 1])`. Provede agregaci — pro Word Count prostý součet — a vyprodukuje výsledný pár:

```python
def reduce(word, counts):     # counts = [1, 1, 1, …]
    emit(word, sum(counts))   # výstup: (slovo, celkový počet)
```

Pro náš příklad tak vznikne `(Car, 3)`, `(Bear, 2)`, `(Deer, 2)`, `(River, 2)`.

## Final result — zápis výsledku

Každý reducer zapíše svůj výstup do *vlastního souboru* v distribuovaném souborovém systému (typicky `part-r-00000`, `part-r-00001`, …). Výstup tedy není jeden soubor, ale tolik souborů, kolik bylo reducerů — to umožňuje paralelní zápis bez vzájemné synchronizace.

::: svg "Tok dat Word Countem: vstup se rozdělí na splits, Map emituje (slovo,1), Shuffle seskupí stejné klíče přes síť, Reduce sečte."
<svg viewBox="0 0 540 220" font-family="var(--font-mono)" font-size="10">
  <text x="40" y="14" text-anchor="middle" font-size="10" font-weight="600" fill="var(--text)">Splitting</text>
  <text x="160" y="14" text-anchor="middle" font-size="10" font-weight="600" fill="var(--accent)">Mapping</text>
  <text x="300" y="14" text-anchor="middle" font-size="10" font-weight="600" fill="var(--text)">Shuffling</text>
  <text x="430" y="14" text-anchor="middle" font-size="10" font-weight="600" fill="var(--accent)">Reducing</text>
  <text x="510" y="14" text-anchor="middle" font-size="10" font-weight="600" fill="var(--text)">Result</text>

  <!-- splits -->
  <rect x="10" y="28" width="62" height="26" rx="3" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="41" y="44" text-anchor="middle" fill="var(--text-muted)">Deer Bear</text>
  <rect x="10" y="92" width="62" height="26" rx="3" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="41" y="108" text-anchor="middle" fill="var(--text-muted)">River Car</text>
  <rect x="10" y="156" width="62" height="26" rx="3" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="41" y="172" text-anchor="middle" fill="var(--text-muted)">Car Bear</text>

  <!-- map outputs -->
  <rect x="120" y="28" width="80" height="26" rx="3" fill="oklch(0.62 0.14 264 / 0.12)" stroke="oklch(0.62 0.14 264)"/>
  <text x="160" y="44" text-anchor="middle" fill="var(--text)">Deer,1 Bear,1</text>
  <rect x="120" y="92" width="80" height="26" rx="3" fill="oklch(0.62 0.14 264 / 0.12)" stroke="oklch(0.62 0.14 264)"/>
  <text x="160" y="108" text-anchor="middle" fill="var(--text)">River,1 Car,1</text>
  <rect x="120" y="156" width="80" height="26" rx="3" fill="oklch(0.62 0.14 264 / 0.12)" stroke="oklch(0.62 0.14 264)"/>
  <text x="160" y="172" text-anchor="middle" fill="var(--text)">Car,1 Bear,1</text>

  <!-- shuffle groups -->
  <rect x="262" y="26" width="78" height="20" rx="3" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="301" y="40" text-anchor="middle" fill="var(--text)">Bear:[1,1]</text>
  <rect x="262" y="72" width="78" height="20" rx="3" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="301" y="86" text-anchor="middle" fill="var(--text)">Car:[1,1,1]</text>
  <rect x="262" y="118" width="78" height="20" rx="3" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="301" y="132" text-anchor="middle" fill="var(--text)">Deer:[1,1]</text>
  <rect x="262" y="164" width="78" height="20" rx="3" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="301" y="178" text-anchor="middle" fill="var(--text)">River:[1,1]</text>

  <!-- reduce -->
  <rect x="392" y="72" width="62" height="68" rx="3" fill="oklch(0.62 0.14 142 / 0.14)" stroke="oklch(0.6 0.14 142)"/>
  <text x="423" y="100" text-anchor="middle" fill="var(--text)">Reduce</text>
  <text x="423" y="116" text-anchor="middle" fill="var(--text-muted)">sum()</text>

  <!-- result -->
  <rect x="474" y="40" width="58" height="132" rx="3" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="503" y="62" text-anchor="middle" fill="var(--text)">Bear,2</text>
  <text x="503" y="86" text-anchor="middle" fill="var(--text)">Car,3</text>
  <text x="503" y="110" text-anchor="middle" fill="var(--text)">Deer,2</text>
  <text x="503" y="134" text-anchor="middle" fill="var(--text)">River,2</text>

  <!-- arrows split->map -->
  <line x1="72" y1="41" x2="118" y2="41" stroke="var(--text-muted)" stroke-width="0.8" marker-end="url(#wc-a)"/>
  <line x1="72" y1="105" x2="118" y2="105" stroke="var(--text-muted)" stroke-width="0.8" marker-end="url(#wc-a)"/>
  <line x1="72" y1="169" x2="118" y2="169" stroke="var(--text-muted)" stroke-width="0.8" marker-end="url(#wc-a)"/>
  <!-- crossing shuffle arrows map->groups -->
  <line x1="200" y1="41" x2="260" y2="36" stroke="oklch(0.7 0.15 22)" stroke-width="0.7" opacity="0.7"/>
  <line x1="200" y1="41" x2="260" y2="128" stroke="oklch(0.7 0.15 22)" stroke-width="0.7" opacity="0.7"/>
  <line x1="200" y1="105" x2="260" y2="82" stroke="oklch(0.7 0.15 22)" stroke-width="0.7" opacity="0.7"/>
  <line x1="200" y1="105" x2="260" y2="174" stroke="oklch(0.7 0.15 22)" stroke-width="0.7" opacity="0.7"/>
  <line x1="200" y1="169" x2="260" y2="82" stroke="oklch(0.7 0.15 22)" stroke-width="0.7" opacity="0.7"/>
  <line x1="200" y1="169" x2="260" y2="36" stroke="oklch(0.7 0.15 22)" stroke-width="0.7" opacity="0.7"/>
  <!-- groups->reduce -->
  <line x1="340" y1="36" x2="390" y2="90" stroke="var(--text-muted)" stroke-width="0.7" marker-end="url(#wc-a)"/>
  <line x1="340" y1="82" x2="390" y2="100" stroke="var(--text-muted)" stroke-width="0.7" marker-end="url(#wc-a)"/>
  <line x1="340" y1="128" x2="390" y2="110" stroke="var(--text-muted)" stroke-width="0.7" marker-end="url(#wc-a)"/>
  <line x1="340" y1="174" x2="390" y2="120" stroke="var(--text-muted)" stroke-width="0.7" marker-end="url(#wc-a)"/>
  <!-- reduce->result -->
  <line x1="454" y1="106" x2="472" y2="106" stroke="oklch(0.6 0.14 142)" stroke-width="0.9" marker-end="url(#wc-a)"/>
  <defs>
    <marker id="wc-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0 0L10 5L0 10z" fill="var(--text-muted)"/>
    </marker>
  </defs>
</svg>
:::

## Combiner — lokální reducer pro úsporu sítě {tier=practice}

Shuffle posílá po síti všechny mezilehlé páry. U Word Countu to znamená i tisíce samostatných `(the, 1)` z jediného mapperu. **Combiner** je *volitelná* mini-Reduce funkce, kterou framework spustí **lokálně na uzlu mapperu** ještě před shuffle — předsečte hodnoty stejného klíče v rámci jednoho mapperu, takže místo `(the, 1)` × 1000 se po síti pošle jediný `(the, 1000)`.

```python
# combiner má stejnou signaturu jako reducer
def combine(word, counts):
    emit(word, sum(counts))   # lokální mezisoučet na uzlu mapperu
```

Combiner šetří síťový provoz, **ale framework jej nemusí spustit vůbec, jednou, či vícekrát** — proto musí být *bezpečný k vynechání*. To je možné jen tehdy, je-li operace **komutativní a asociativní** (součet ano). Pro výpočet průměru by naivní combiner byl chybný: `avg(avg(a,b), c) ≠ avg(a,b,c)`. Word Count je proto učebnicový případ, kde combiner = reducer.

::: quiz "Proč nelze pro výpočet průměru použít tentýž kód jako combiner i reducer (jako u Word Countu)?"
- [x] Průměr není asociativní — předprůměrování na mapperu by zkreslilo celkový výsledek.
  > Správně. Combiner se může spustit 0×, 1× i vícekrát, takže musí být bezpečně vynechatelný; to platí jen pro asociativní a komutativní operace. Průměr je třeba combinovat jako dvojici (součet, počet), ne jako hotový průměr.
- [ ] Combiner nesmí mít stejnou signaturu jako reducer.
  > Naopak — combiner má záměrně stejnou signaturu jako reducer; to není problém.
- [ ] Průměr nelze v MapReduce počítat vůbec.
  > Lze — stačí emitovat (součet, počet) a finální dělení provést až v reduceru.
:::

::: link "Apache Hadoop — MapReduce Tutorial (Word Count, Combiner)" "https://hadoop.apache.org/docs/stable/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html"
:::

::: link "Dean, J., Ghemawat, S.: MapReduce — Simplified Data Processing on Large Clusters (OSDI 2004)" "https://research.google/pubs/pub62/"
:::

---

*Zdroj: SZZ NADE — předmět Prostředí distribuovaných aplikací, VUT FIT. Externí reference: Dean, J., Ghemawat, S.: MapReduce — Simplified Data Processing on Large Clusters, OSDI 2004; Apache Hadoop dokumentace.*
