---
title: Gene Ontology a nástroje
---

# Gene Ontology a nástroje

Když anotace zjistí, *kde* gen leží, zůstává druhá otázka: *co dělá jeho produkt*. K tomu slouží **Gene Ontology (GO)** — řízený, druhově nezávislý slovník pojmů (*controlled vocabulary*) pro popis funkce genových produktů (proteinů i funkčních RNA). GO řeší problém, že stejnou funkci popisuje každá laboratoř jinými slovy: termíny mají **stabilní identifikátor** (např. `GO:0006412`), jednoznačnou definici a formální vztahy, takže anotace z různých organismů a databází jsou navzájem porovnatelné.

## Tři domény (aspekty)

GO není jediná hierarchie, ale **tři oddělené ontologie**, které popisují tři nezávislé osy funkce:

- **Molekulární funkce** (*molecular function*) — elementární aktivita produktu *na molekulární úrovni*: vazba, katalýza (např. *vazba ATP*). Odpovídá na otázku „co molekula dělá".
- **Biologický proces** (*biological process*) — větší sled molekulárních dějů s definovaným začátkem a koncem (např. *translace*, *buněčný cyklus*). „V jakém procesu se uplatňuje."
- **Buněčná komponenta** (*cellular component*) — místo v buňce nebo extracelulárním prostoru, kde produkt působí (např. *ribozom*, *jaderná membrána*). „Kde se nachází."

GO **záměrně nepopisuje** patologické procesy, experimentální metody, evoluční vztahy ani sekvence — to patří jiným databázím.

## Struktura: orientovaný acyklický graf

Každá doména je **orientovaný acyklický graf (DAG)**, ne strom: uzly jsou pojmy, hrany jsou vztahy a jeden potomek může mít **více rodičů**. Hlavní vztahy jsou **is-a** (*je podtypem* — *translace* is-a *biosyntéza*) a **part-of** (*je částí* — *translace* part-of *buněčný proces*); doplňkově **regulates** (a jeho `positively`/`negatively` varianty), který popisuje, že jeden proces ovlivňuje jiný.

::: viz bif-go-dag "Gene Ontology jako DAG tří domén. Klikni na libovolný termín — zvýrazní se všechny jeho rodiče (is-a plnou, part-of čárkovanou hranou) až ke kořeni domény. Termín 'translace' má dva rodiče, takže DAG není strom."
:::

## True path rule a dědičnost anotace

Klíčové pravidlo zní **„true path rule"**: cesta od potomka ke kořeni musí být *vždy* pravdivá. Pokud je produkt anotován termínem, platí pro něj **i všichni jeho předkové** přes is-a a part-of. Anotace se proto **propaguje (dědí) nahoru** po grafu — z přímé anotace *translace* automaticky plyne *biosyntéza* i *biologický proces*. Tyto **nepřímé (propagované) anotace** jsou stejně platné jako přímé a používají se ve většině analýz.

Pozor: propagace nahoru je bezpečná jen pro **is-a** a **part-of** (jsou tranzitivní v tomto směru). Přes **regulates** ani **has-part** anotaci nahoru propagovat nelze — že se produkt účastní *regulujícího* procesu neznamená, že se účastní procesu *regulovaného*.

## Typy anotací a důkazní kódy

Každá anotace nese **evidence code** — formální značku zdroje tvrzení. Rozlišují se **manuální** kódy podpořené důkazem (např. `EXP` experiment, `IDA` přímý průkaz, `IMP` z mutantního fenotypu) a **elektronické** (`IEA`, *inferred from electronic annotation*) přiřazené automaticky bez ručního ověření. Většina anotací v databázích je typu `IEA`, jsou ale méně spolehlivé než ručně kurované.

## Související nástroje

- **GSEA / over-representation analýza** — *Gene Set Enrichment Analysis*: pro seznam zajímavých genů (např. z RNA-seq) zjišťuje, které GO termíny jsou **statisticky obohacené** oproti pozadí. Úskalí: testy nejsou nezávislé (hierarchie GO — *buněčný cyklus* je potomek *buněčného procesu*), gen má více anotací, hrozí falešné pozitivy → nutná korekce na mnohonásobné testování.
- **QuickGO** (EMBL-EBI) a **AmiGO** (GO Consortium) — webové prohlížeče termínů a anotací; **InterPro2GO / Pfam2GO** — mapování proteinových domén na GO termíny pro automatickou anotaci.

::: quiz "Produkt je přímo anotován termínem 'translace' (is-a 'biosyntéza', part-of 'buněčný proces'). Které tvrzení platí podle true path rule?"
- [x] Produkt je automaticky anotován i termínem 'biosyntéza'
  > is-a je tranzitivní a propaguje nahoru — předek přímé anotace platí také.
- [x] Produkt je automaticky anotován i termínem 'buněčný proces'
  > part-of rovněž propaguje anotaci nahoru ke všem rodičům.
- [ ] Všechny ostatní geny v 'translaci' jsou také anotovány tímto produktem
  > Propagace jde po hranách *nahoru* k rodičům, ne mezi sourozenci ani dolů k potomkům.
:::

::: link "Gene Ontology Consortium — Ontology relations (is_a, part_of, regulates; propagace)" "https://geneontology.org/docs/ontology-relations/"
:::

::: link "EMBL-EBI Training — What is GO? (GOA & QuickGO quick tour)" "https://www.ebi.ac.uk/training/online/courses/goa-and-quickgo-quick-tour/what-is-go/"
:::

*Zdroj: BIF státnicové okruhy NBIO, VUT FIT. Externí reference: Gene Ontology Consortium — Ontology relations & overview (geneontology.org); EMBL-EBI Training — GOA & QuickGO; The Gene Ontology knowledgebase (NAR / PMC).*
