---
title: TF-IDF a vyhledávání informací
---

# TF-IDF a vyhledávání informací

Když je kolekce převedena na vektory ([[predzpracovani]]), zbývá **ohodnotit důležitost** každého termu a podle ní **vyhledat relevantní dokumenty**. Klíčové pozorování: ne každý term je stejně užitečný. Term častý uvnitř dokumentu jej dobře vystihuje, ale term, který je častý ve *všech* dokumentech kolekce, nerozlišuje skoro nic. Z tohoto napětí vychází váha **TF-IDF**.

## TF, IDF a TF-IDF váha

**Term frequency** $\text{tf}_{t,d}$ je počet výskytů termu $t$ v dokumentu $d$ — čím častější uvnitř dokumentu, tím relevantnější pro jeho popis.

**Inverse document frequency** $\text{idf}_t$ snižuje váhu termů rozšířených napříč kolekcí. Je-li $N$ počet dokumentů a $\text{df}_t$ počet dokumentů obsahujících term $t$:

::: math
$$ \text{idf}_t = \log \frac{N}{\text{df}_t} $$
:::

Vzácný term (malé $\text{df}_t$) má vysoké idf, term v každém dokumentu ($\text{df}_t = N$) má $\log 1 = 0$. Výsledná **TF-IDF váha** je součin obou složek:

::: math
$$ w_{t,d} = \text{tf}_{t,d} \cdot \text{idf}_t = \text{tf}_{t,d} \cdot \log \frac{N}{\text{df}_t} $$
:::

Váha je vysoká, jen když je term v daném dokumentu častý *a zároveň* vzácný v kolekci jako celku.

## Vektorový model a kosinová podobnost

Ve **vektorovém modelu** je dotaz $q$ i každý dokument $d$ vektorem TF-IDF vah nad slovníkem. Relevance se měří jako **kosinová podobnost** — kosinus úhlu mezi vektory, tedy jejich normalizovaný skalární součin:

::: math
$$ \text{sim}(q, d) = \cos\theta = \frac{\vec{q} \cdot \vec{d}}{\lVert \vec{q} \rVert \, \lVert \vec{d} \rVert} = \frac{\sum_t w_{t,q}\, w_{t,d}}{\sqrt{\sum_t w_{t,q}^2}\,\sqrt{\sum_t w_{t,d}^2}} $$
:::

Normalizace délkou vektoru odstraňuje vliv **délky dokumentu**, takže dlouhý a krátký dokument se stejným tematickým profilem dostanou srovnatelné skóre. Hodnota leží v $[0, 1]$ (váhy jsou nezáporné): 1 znamená stejný směr (maximální podobnost), 0 žádné společné termy. Výsledky se uživateli vrátí **seřazené** podle podobnosti — proto se vektorovému modelu říká *ranked retrieval*, na rozdíl od booleovského modelu, který dokument jen označí za relevantní/irelevantní bez pořadí.

::: viz zzn-tfidf "Klikni na termín ve slovníku — živě se přepočte df, idf = ln(N/df) a tf·idf váha v každém dokumentu. Dole je kosinová podobnost dotazu {data, mining} s každým dokumentem; všimni si, že vzácnější termy zvyšují skóre víc."
:::

## Modely vyhledávání a indexování

| Model | Reprezentace | Výstup |
| :--- | :--- | :--- |
| **Booleovský** | binární přítomnost termů, dotaz s AND/OR/NOT | množina relevantních dok. (bez pořadí) |
| **Vektorový** | TF-IDF váhy, kosinová podobnost | seřazený seznam podle relevance |
| **Pravděpodobnostní** | odhad P(relevance \| dotaz), zpřesňovaný zpětnou vazbou | seřazený seznam |

Aby vyhledávání nemuselo procházet všechny dokumenty, používá se **inverzní index**: pro každý term je uložen seznam dokumentů (postings list), které jej obsahují. Dotaz se zodpoví průnikem/sjednocením těchto seznamů. Nevýhodou je, že sám o sobě neřeší **synonyma** ani **polysémii** (víceznačnost) — ty adresuje až **latentní sémantické indexování (LSI)**, které matici termů a dokumentů nahradí menší reprezentací odhalující skryté vztahy mezi termy.

## Vyhodnocení: precision a recall

Kvalitu vyhledávání měříme proti množině skutečně relevantních dokumentů:

::: math
$$ \text{precision} = \frac{|\text{relevantní} \cap \text{vrácené}|}{|\text{vrácené}|}, \qquad \text{recall} = \frac{|\text{relevantní} \cap \text{vrácené}|}{|\text{relevantní}|} $$
:::

**Precision** říká, jakou část vrácených výsledků uživatel skutečně chtěl; **recall**, jakou část všech relevantních dokumentů systém našel. Obě hodnoty se zpravidla pohybují proti sobě (vrátím-li víc dokumentů, recall roste, precision klesá) a slučují se do **F-míry** (harmonický průměr).

::: quiz "Term se vyskytuje ve všech N dokumentech kolekce. Jaká je jeho TF-IDF váha?"
- [ ] Vysoká — je velmi frekventovaný
- [x] Nulová — idf = log(N/N) = log 1 = 0
  > df = N, takže idf = log(N/N) = 0; ať je tf jakékoli, váha tf·idf je nulová — všudypřítomný term nerozlišuje dokumenty.
- [ ] Záporná — penalizuje se
- [ ] Rovna term frequency
:::

::: link "Manning, Raghavan, Schütze — Inverse document frequency (Stanford IR Book)" "https://nlp.stanford.edu/IR-book/html/htmledition/inverse-document-frequency-1.html"
:::

::: link "Stanford IR Book — Dot products & cosine similarity (vector space model)" "https://nlp.stanford.edu/IR-book/html/htmledition/dot-products-1.html"
:::

---

*Zdroj: ZZN státnicové okruhy NBIO, VUT FIT. Externí reference: Manning, Raghavan, Schütze — Introduction to Information Retrieval (Cambridge University Press 2008); Salton, Wong, Yang — A Vector Space Model for Automatic Indexing (Communications of the ACM, 1975); Han, Kamber, Pei — Data Mining: Concepts and Techniques (3. vyd., Morgan Kaufmann 2011).*
