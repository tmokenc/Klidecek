---
title: Předzpracování a reprezentace textu
---

# Dolování textu — charakteristika a předzpracování

**Dolování textu (text mining)** hledá netriviální, dosud neznámé vzory v *nestrukturovaném* nebo *semistrukturovaném* textu — na rozdíl od klasického dolování dat, které pracuje nad strukturovanými tabulkami. Text se proto musí nejprve převést na **strukturovanou reprezentaci**, se kterou už pracují běžné algoritmy klasifikace, shlukování a vyhledávání.

Textová data mají dvě charakteristické vlastnosti, kvůli kterým je nelze zpracovat naivně:

- **Vysoká dimenzionalita** — slovník (množina různých termů) v reálné kolekci má desítky až stovky tisíc položek, takže vektor jednoho dokumentu je obrovský.
- **Řídkost (sparsity)** — naprostá většina termů se v jednom konkrétním dokumentu *nevyskytuje*, takže vektor je z velké části nulový (malá podpora vzorů).

Dokument lze popsat na různých úrovních rysů: **znaky** (úplná, ale nepoužitelně jemná reprezentace), **slova**, **termy** (slovo nebo víceslovné spojení dle slovníku) a **koncepty** (téma, které se v textu nemusí doslova vyskytnout).

## Cíl předzpracování

Předzpracování přidává k nestrukturovanému textu **strukturu** a redukuje dimenzionalitu. Dokument je nakonec reprezentován množinou **index termů** — reprezentativních klíčových slov, z nichž každý nese vůči dokumentu jinou **důležitost** vyjádřenou číselnou **vahou** (frekvence, TF-IDF). Sousední úkoly jako *kategorizace/tagging* (přiřazení klíčových slov), *extrakce informací* (převod textu na tabulku) a *NLP techniky* (odstranění víceznačnosti, hledání synonym pomocí slovníku typu WordNet) staví na téže předzpracované reprezentaci.

## Pipeline předzpracování

Standardní řetězec zpracování převede surový text postupně na vektor vah:

::: svg "Pipeline předzpracování textu: tokenizace → odstranění stop slov → stemming/lemmatizace → bag-of-words / vektorový model. Z výsledné kolekce vektorů se buduje inverzní index pro rychlé vyhledávání."
<svg viewBox="0 0 540 210" font-family="ui-sans-serif, system-ui" font-size="11">
  <rect width="540" height="210" fill="var(--bg-inset)"/>
  <!-- vstupní text -->
  <rect x="14" y="22" width="120" height="44" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="74" y="40" text-anchor="middle" fill="var(--text)" font-weight="600">surový text</text>
  <text x="74" y="56" text-anchor="middle" fill="var(--text-muted)" font-size="9">"Texty se dolují…"</text>
  <!-- krok 1 -->
  <rect x="158" y="22" width="120" height="44" rx="5" fill="var(--bg-card)" stroke="var(--accent)"/>
  <text x="218" y="40" text-anchor="middle" fill="var(--text)" font-weight="600">tokenizace</text>
  <text x="218" y="56" text-anchor="middle" fill="var(--text-muted)" font-size="9">[texty, se, dolují]</text>
  <!-- krok 2 -->
  <rect x="302" y="22" width="120" height="44" rx="5" fill="var(--bg-card)" stroke="var(--accent)"/>
  <text x="362" y="37" text-anchor="middle" fill="var(--text)" font-weight="600">odstranění</text>
  <text x="362" y="51" text-anchor="middle" fill="var(--text)" font-weight="600">stop slov</text>
  <text x="362" y="63" text-anchor="middle" fill="var(--text-muted)" font-size="9">[texty, dolují]</text>
  <!-- krok 3 -->
  <rect x="302" y="108" width="120" height="46" rx="5" fill="var(--bg-card)" stroke="var(--accent)"/>
  <text x="362" y="124" text-anchor="middle" fill="var(--text)" font-weight="600">stemming /</text>
  <text x="362" y="138" text-anchor="middle" fill="var(--text)" font-weight="600">lemmatizace</text>
  <text x="362" y="150" text-anchor="middle" fill="var(--text-muted)" font-size="9">[text, dol]</text>
  <!-- krok 4: bag-of-words / vektor -->
  <rect x="158" y="108" width="120" height="46" rx="5" fill="var(--bg-card)" stroke="var(--accent)"/>
  <text x="218" y="124" text-anchor="middle" fill="var(--text)" font-weight="600">bag-of-words</text>
  <text x="218" y="138" text-anchor="middle" fill="var(--text)" font-weight="600">vektorový model</text>
  <text x="218" y="150" text-anchor="middle" fill="var(--text-muted)" font-size="9">{text:1, dol:1}</text>
  <!-- inverzní index -->
  <rect x="14" y="108" width="120" height="46" rx="5" fill="var(--bg-card)" stroke="var(--accent-line)" stroke-dasharray="4 3"/>
  <text x="74" y="124" text-anchor="middle" fill="var(--text)" font-weight="600">inverzní index</text>
  <text x="74" y="138" text-anchor="middle" fill="var(--text-muted)" font-size="9">term → [doky]</text>
  <text x="74" y="150" text-anchor="middle" fill="var(--text-muted)" font-size="9">text → d1,d3</text>
  <!-- šipky -->
  <g stroke="var(--accent)" stroke-width="1.4" fill="none" marker-end="url(#ah)">
    <line x1="134" y1="44" x2="156" y2="44"/>
    <line x1="278" y1="44" x2="300" y2="44"/>
    <line x1="362" y1="66" x2="362" y2="106"/>
    <line x1="300" y1="131" x2="280" y2="131"/>
    <line x1="156" y1="131" x2="136" y2="131"/>
  </g>
  <defs>
    <marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="270" y="200" text-anchor="middle" fill="var(--text-faint)" font-size="9">kolekce vektorů → inverzní index pro vyhledávání</text>
</svg>
:::

**Tokenizace** rozdělí text na jednotky (tokeny), typicky slova; sjednotí velikost písmen a oddělí interpunkci.

**Odstranění stop slov** vyřadí pomocí **stoplistu** velmi frekventovaná, ale obsahově prázdná slova (spojky, předložky, členy — *a*, *the*, *of*, *to*). Stoplist je jazykově i doménově závislý.

**Stemming** ořezává slova na společný **kořen** podle pravidel — *mining*, *miner*, *mined* → *min*. Klasický **Porterův algoritmus** odstraňuje přípony v několika sekvenčních krocích bez slovníku, takže výstup nemusí být skutečné slovo. **Krovetzův algoritmus** kombinuje slovník s pravidly: slovo nejdřív hledá ve slovníku, a teprve když selže, ořezává přípony. **Lemmatizace** je důslednější: pomocí slovníku a morfologie převede slovo na základní tvar (lemma) — *byl* → *být* — a je důležitá pro flektivní jazyky jako čeština.

## Reprezentace: bag-of-words a vektorový model

Po předzpracování se dokument reprezentuje jako **bag-of-words** — multimnožina termů, kde se *ztrácí pořadí slov*, ale uchovávají se jejich četnosti. Celá kolekce tvoří **frekvenční matici termů a dokumentů** (řádky = termy, sloupce = dokumenty), v níž je každý dokument jedním sloupcem — vektorem ve **vektorovém modelu**. Buňky obsahují četnost nebo (častěji) TF-IDF váhu místo absolutních počtů.

::: link "Stanford IR Book — Tokenization & Dropping common terms (stop words)" "https://nlp.stanford.edu/IR-book/html/htmledition/dropping-common-terms-stop-words-1.html"
:::

::: link "Porter, M. F. (1980): An algorithm for suffix stripping" "https://tartarus.org/martin/PorterStemmer/def.txt"
:::

---

*Zdroj: ZZN státnicové okruhy NBIO, VUT FIT. Externí reference: Manning, Raghavan, Schütze — Introduction to Information Retrieval (Cambridge University Press 2008); Porter, M. F. — An algorithm for suffix stripping (Program, 1980); Han, Kamber, Pei — Data Mining: Concepts and Techniques (3. vyd., Morgan Kaufmann 2011).*
