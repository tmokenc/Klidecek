---
title: 'Sestavování fragmentů (OLC, de Bruijn)'
---

# Sestavování fragmentů

Sekvenátor dodá množinu krátkých čtení; **sestavování** (*assembly*) z nich rekonstruuje původní, mnohem delší sekvenci. *De novo* sestavení skládá neznámou sekvenci jen z překryvů samotných čtení (výpočetně náročné), zatímco **mapování** zarovnává čtení na již známý referenční genom (levnější). Teoretickým jádrem *de novo* úlohy je **problém nejkratšího nadřetězce** (*shortest superstring*): najít nejkratší řetězec, který obsahuje všechna čtení jako podřetězce. Obecně je NP-těžký a opakující se úseky jej dále komplikují, proto se v praxi řeší dvěma grafovými přístupy.

## Overlap-Layout-Consensus (OLC)

**OLC** byl přístup éry Sangerových čtení a probíhá ve třech fázích:

1. **Overlap** — pro každou dvojici čtení se hledá **největší překryv** (suffix jednoho = prefix druhého). Sestaví se *overlapový graf*: vrcholy = čtení, hrany = překryvy. Pro urychlení se generují všechny *k*-tice čtení a třídí, takže silně se překrývající čtení skončí v seřazeném seznamu vedle sebe ($\mathcal{O}(n \log n)$).
2. **Layout** — z grafu se sestaví uspořádání čtení do souvislých úseků (**contigů**) a ty dále do **supercontigů** (scaffoldů). Opakování se nejdřív skryjí a skládají se jen unikátní úseky; mezery a opakující se oblasti se doplňují později pomocí heuristik.
3. **Consensus** — vícenásobným zarovnáním překrývajících se čtení se v každém sloupci určí majoritní báze, čímž se **opraví náhodné chyby čtení**.

OLC je přirozený pro **delší a méně početná** čtení (Sanger, 3. generace), ale hledání všech párových překryvů je u milionů krátkých čtení příliš drahé.

## De Bruijnův graf

**De Bruijnův přístup** se vyhne párovým překryvům. Každé čtení rozloží na **k-mery** (všechny podřetězce délky *k*) a z nich postaví graf jinak než OLC:

- **vrcholy** = všechny **(k-1)-mery** (prefixy a suffixy k-merů),
- **hrany** = jednotlivé **k-mery**: hrana vede z (k-1)-meru tvořícího prefix k-meru do (k-1)-meru tvořícího jeho suffix.

Sestavená sekvence pak odpovídá **Eulerovské cestě** — průchodu, který použije **každou hranu právě jednou**. Eulerovskou cestu lze najít v **lineárním** čase vůči počtu hran (Hierholzerův algoritmus), což je proti hledání Hamiltonovské cesty v overlapovém grafu (NP-těžké) zásadní výhoda. Proto de Bruijnův graf dominuje sestavování **krátkých NGS čtení**.

::: viz bif-debruijn "Vyber krátké čtení a nastav k. Sekvence se rozloží na k-mery (hrany), z (k-1)-merů vznikají vrcholy, hrana spojí prefix→suffix každého k-meru. Přepínač zvýrazní Eulerovskou cestu, která projde každou hranu právě jednou a po složení dá sestavený contig."
:::

## Problémy a porovnání

Hlavním nepřítelem obou metod jsou **opakující se úseky** delší než čtení (resp. než *k*): graf v nich větví a vznikají nejednoznačné cesty, takže sestavení se rozpadne na více contigů. Pomáhají **párová čtení** (*mate pairs* — dvojice čtení z konců fragmentu se známou přibližnou vzdáleností), která přemostí opakování a uspořádají contigy do scaffoldů. Volba *k* je kompromis: malé *k* dává hustší graf (více překryvů, ale i více větvení od opakování), velké *k* graf zjednoduší, ale vyžaduje hlubší pokrytí, aby všechny k-mery vůbec vznikly.

::: math
\text{OLC: vrchol} = \text{čtení}, \quad \text{de Bruijn: vrchol} = (k\!-\!1)\text{-mer}, \ \text{hrana} = k\text{-mer}
:::

::: quiz "Co reprezentují hrany a co vrcholy v de Bruijnově grafu pro sestavování genomu?"
- [x] Hrany jsou k-mery, vrcholy jsou (k-1)-mery (prefixy/suffixy)
  > Každý k-mer = hrana z jeho prefixu do jeho suffixu; sestavení = Eulerovská cesta přes hrany.
- [ ] Vrcholy jsou celá čtení, hrany jsou jejich překryvy
  > To je overlapový graf v OLC, ne de Bruijnův graf.
- [ ] Hrany jsou (k-1)-mery a hledá se Hamiltonovská cesta
  > Hledá se Eulerovská cesta (každá hrana jednou), což je lineární; Hamiltonovská cesta je NP-těžká.
:::

::: link "Compeau, Pevzner & Tesler (2011), Nature Biotechnology — How to apply de Bruijn graphs to genome assembly" "https://www.nature.com/articles/nbt.2023"
:::

::: link "Carl Kingsford (CMU) — Genome Sequencing: OLC vs. de Bruijn (course notes)" "https://www.cs.cmu.edu/~ckingsf/bioinfo-lectures/sequencing.pdf"
:::

*Zdroj: BIF státnicové okruhy NBIO, VUT FIT. Externí reference: Compeau, Pevzner & Tesler (2011) Nature Biotechnology 29:987; Pevzner, Tang & Waterman (2001) PNAS — Eulerian path approach; CMU bioinformatika (Kingsford) — Genome Sequencing course notes.*
