---
title: Vlastnosti logických systémů — korektnost, úplnost, kompaktnost
---

# Vlastnosti dokazovacích systémů

Logické systémy ([[vyrokova-logika]], [[prvoradova-logika]]) mají dvě stránky: *syntaktickou* (dokazatelnost) a *sémantickou* (platnost). Tato kapitola formalizuje, jak tyto stránky **souvisejí**. Tři klíčové vlastnosti: **korektnost**, **úplnost**, **kompaktnost**.

## Korektnost a úplnost

**Definice.** Logický systém je:

* **Korektní** (*sound*): pokud $\vdash \varphi$, pak $\models \varphi$.
* **Úplný** (*complete*): pokud $\models \varphi$, pak $\vdash \varphi$.

Tedy:
* **Korektnost** = "vše, co dokážeme, je pravdivé".
* **Úplnost** = "vše, co je pravdivé, dokážeme".

Ideální systém je *oba*: $\vdash \varphi \iff \models \varphi$.

> **Korektnost** je *snadnější* — stačí ukázat, že každý axiom je platný a každé odvozovací pravidlo zachovává platnost. **Úplnost** je *podstatně těžší* — vyžaduje konstrukci důkazu z předpokladu sémantické platnosti.

## Korektnost VL a PL

**Věta (korektnost VL).** Pokud $\vdash \varphi$ ve výrokovém Hilbertově kalkulu, pak $\models \varphi$.

**Důkaz** indukcí podle délky důkazu:
1. **Báze**: axiomy (A1, A2, A3) jsou *tautologie* — ověřit pravdivostní tabulkou.
2. **Indukční krok**: MP zachovává platnost. Pokud $\models A$ a $\models A \to B$, pak $\models B$ (z definice $\to$).

Analogicky se dokazuje **korektnost PL** — všechny axiomy jsou *platné* v PL (univerzálně), MP zachovává platnost. Pravidlo zobecnění zachovává platnost.

## Úplnost VL

**Věta (Postova věta o úplnosti, 1921).** Pokud $\models \varphi$ ve VL, pak $\vdash \varphi$.

Důkaz je technický — buduje *kanonický model* z konzistentní teorie přes Lindenbaumovo lemma (každá konzistentní teorie má *maximální* konzistentní rozšíření).

**Důsledek.** Pro VL platí $\vdash \varphi \iff \models \varphi$. Tedy *dokazatelnost = platnost*.

> **Praktická interpretace**: pravdivostní tabulka (sémantika) je *ekvivalentní* s Hilbertovým kalkulem (syntax). Můžeme si volit, který nástroj použít.

## Úplnost PL (Gödel 1929)

**Věta (Gödelova věta o úplnosti, 1929).** Predikátová logika prvního řádu je úplná: $\models \varphi \iff \vdash \varphi$.

> *Pozor — neplést* s **Gödelovou větou o neúplnosti** ([[godel-neuplnost]]) — to je úplně jiný výsledek! Tady mluvíme o úplnosti *logického systému* (= dokazování platí pro každou platnou formuli), tam o úplnosti *teorie* (= dokazování *konkrétních pravdivostí* o $\mathbb{N}$).

**Důkaz** (Henkin 1949, alternativní k Gödelovu) má tři kroky:
1. *Lindenbaumovo lemma*: každá konzistentní teorie má maximální konzistentní rozšíření.
2. *Henkinova konstrukce*: z maximální konzistentní teorie sestrojíme model.
3. Tedy: bezesporná teorie *má* model. Naopak teorie bez modelu je sporná (dokáže $0$) — proto sémantický důsledek $T \models \varphi$ implikuje dokazatelnost $T \vdash \varphi$.

**Důsledek.** $\vdash \varphi \iff \models \varphi$. Pro PL je *dokazatelnost = platnost*.

> **Pozor**: úplnost PL *neznamená* rozhodnutelnost. Hledat důkaz může trvat *libovolně dlouho* — algoritmus *parciálního rozhodování* existuje (semi-decision), ale ne *úplný* ([[prvoradova-logika]]).

## Kompaktnost

**Věta (kompaktnost PL).** Teorie $T$ má model ⟺ *každá konečná podmnožina* $T$ má model.

Tj. *splnitelnost* je *kompaktní* — záleží jen na *konečně mnoha* axiomech v daném okamžiku.

**Důkaz** (z věty o úplnosti):
* (⇒) Pokud $T$ má model, evidentně i každá podmnožina ho má.
* (⇐) Předpokládejme, že každá konečná podmnožina $T$ má model, ale $T$ nemá. Pak $T \models 0$ (nesplnitelná). Z věty o úplnosti $T \vdash 0$ — existuje *konečný* důkaz, který používá jen *konečně mnoho* formulí z $T$. Ale tato konečná podmnožina by pak také nebyla splnitelná — spor.

## Aplikace kompaktnosti

Kompaktnost má *překvapivé* důsledky:

### Existence nestandardních modelů aritmetiky

Vezměme teorii $T_\mathbb{N}$ = všechny pravdivé formule o $(\mathbb{N}, +, \cdot)$. Přidejme novou konstantu $c$ a sadu axiomů $\{c > n \mid n \in \mathbb{N}\}$ (jeden pro každé přirozené číslo).

**Pozorování**: každá *konečná* podmnožina nového systému je splnitelná — stačí interpretovat $c$ jako dostatečně velké přirozené číslo. Z kompaktnosti: *celý systém* má model. Tento model obsahuje $c$ — "číslo větší než každé standardní přirozené číslo". To je **nestandardní model**.

> *Nestandardní analýza* (Robinson 1966) využívá nestandardní modely k *rigoróznímu* zacházení s "nekonečně malými" a "nekonečně velkými" čísly.

### Konečná axiomatika nemůže oddělit struktury

Pokud teorie $T$ má model libovolné velikosti, pak má *nekonečný* model. Analogicky se dokazuje, že některé pojmy *nelze* v PL definovat (např. "konečnost").

## Korektnost a úplnost — interpretace

* **Korektnost** je *bezpečnost* — všechno, co dokážeme, je pravdivé. Bez korektnosti by dokazování bylo *bezcenné*.
* **Úplnost** je *adekvátnost* — dokazovací systém je *dostatečně silný*. Bez úplnosti bychom *nemohli dokázat všechno, co bychom chtěli*.

Pro VL a PL máme oba — dokazovací systém je *přesně* tak silný jako sémantika.

## Hranice úplnosti — neúplnost aritmetiky

**Klíčový negativní výsledek**: úplnost neplatí pro *teorie nad logikou*, např. *Peanovu aritmetiku* (PA).

**Gödelova 1. věta o neúplnosti** ([[godel-neuplnost]]): pokud PA je *konzistentní*, pak existuje formule $\varphi$ taková, že $\models_\mathbb{N} \varphi$, ale $\nvdash_{\text{PA}} \varphi$.

> **Klíčový rozdíl**: úplnost *logického systému* (PL je úplná) říká "pro každou *logickou* platnost máme důkaz". Neúplnost *teorie* říká "existuje sémantická pravdivost *v $\mathbb{N}$*, kterou *teorie* nedokáže".

PL je úplná *jako logický systém*, ale *teorie* nad PL (PA, ZFC, …) je *neúplná* — vždy existují tvrzení, která teorie nedokáže.

## Rozhodnutelnost a polorozhodnutelnost

**Věta.** Pro PL:
* Platnost formule (a tedy dokazatelnost) je **rekurzivně vyčíslitelný** problém.
* Není **rozhodnutelný**.

**Důkaz.**
* *RE*: systematické generování důkazů. Pro libovolnou platnou formuli existuje konečný důkaz, který dříve nebo později vygenerujeme.
* *Není R*: redukce z [[problem-zastaveni]] (viz [[pa-nerozhodnutelnost]]).

> **Důsledek**: *teoremovací algoritmy* (theorem provers) jsou *poloalgoritmy* — pro pravdivou formuli najdou důkaz v konečném čase, pro nepravdivou *mohou cyklit*.

## Vlastnosti modálních a vyšších logik

Mimo PL existují *silnější* logické systémy:

* **Modální logiky** (necessary $\Box$, possible $\Diamond$). Většinou rozhodnutelné, ale omezené v expresivitě.
* **Temporální logiky** (LTL, CTL, CTL*). Klíčové pro *verifikaci softwaru* — model checking.
* **Logiky druhého řádu** (kvantifikace přes množiny, predikáty). *Silnější* než PL, ale **neúplné** — nemají konečnou axiomatizaci pokrývající všechny platnosti.
* **Vyšší typové logiky** (HOL — Higher-Order Logic). Mocné, používané v *interactive theorem provers* (Coq, Isabelle/HOL, Lean).

> Z hlediska *dokazatelnosti*, PL je *zlatá střední cesta* — dostatečně silná pro většinu matematiky, dostatečně slabá, aby zachovala úplnost.

## Souvislost s teorií složitosti

* **VL SAT**: NP-úplný ([[cook-levin]]).
* **VL TAUT** (tautologie): co-NP-úplný.
* **PL platnost**: *nerozhodnutelná*, ale rekurzivně vyčíslitelná.
* **Formule v Bernays-Schönfinkel** (PL bez funkcí, bez rovnosti): NEXPTIME-úplná.
* **Presburgerova aritmetika** (PL nad $(\mathbb{N}, +)$): rozhodnutelná, ale 2-EXPTIME-úplná.

Hraniční otázky složitosti uvnitř logiky vedou k *deskriptivní složitosti* — vyjadřitelnost ve fixní logice odpovídá konkrétní třídě (např. Fagin: NP = existential $\Sigma^1_1$ formule druhého řádu).

---

*Zdroj: TIN přednášky 2025/26, doc. RNDr. Milan Češka, Ph.D., FIT VUT v Brně. Externí reference: Gödel, K.: *Die Vollständigkeit der Axiome des logischen Funktionenkalküls* (Monatshefte für Mathematik und Physik, 1930) — věta o úplnosti PL; Henkin, L.: *The Completeness of the First-Order Functional Calculus* (J. Symbolic Logic, 1949); Mendelson, E.: *Introduction to Mathematical Logic* (6th ed., CRC 2015), kap. 2.5–2.8; Enderton, H.B.: *A Mathematical Introduction to Logic* (2nd ed., Academic Press 2001), kap. II.5.*
