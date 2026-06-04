---
title: Dot plot a skórovací matice
---

# Dot plot a skórovací matice

**Zarovnání sekvencí** je jedna ze základních úloh bioinformatiky. Porovnáním dvou řetězců (DNA, RNA, proteinů) odhalíme jejich příbuznost a pomůžeme určit funkci genů či proteinů. Evoluce zanechává tři druhy stop: **substituci** (záměna znaku, nejčastější), **inzerci** a **deleci** (vložení/odstranění znaku — modelujeme je jako *mezery*, gaps).

## Dot plot — grafické porovnání

Nejjednodušší metoda je **dot plot**: matice, kde sloupce odpovídají znakům jedné sekvence a řádky druhé. Do buňky `[i, j]` vložíme **bod jen při shodě** znaků. Souvislé diagonální úseky bodů odpovídají zarovnaným oblastem; přerušení diagonály značí mezeru, posun na jinou diagonálu inverzi nebo opakování.

Surový dot plot je ale plný **šumu** — náhodné shody (u DNA má každá pozice ~25 % shodu) tečkují celou matici. Proto se zavádí **posuvné okénko** (sliding window) o velikosti $W$: bod se vloží jen tehdy, pokud počet shod *na diagonále uvnitř okénka* dosáhne zadaného **prahu** (např. 8 z 10). Tím náhodné izolované shody vypadnou a zůstanou jen skutečné diagonály.

::: viz bif-dotplot "Dot plot dvou krátkých sekvencí. Posuvníky mění velikost okna W a práh shody — při W=1 vidíš surový (zašuměný) plot, širší okno a vyšší práh odfiltrují izolované náhodné shody a nechají jen pravou diagonálu."
:::

Dot plot je pouze **orientační** vizualizace — neposkytuje optimální zarovnání ani skóre a sestavení matice má časovou složitost $\mathcal{O}(nm)$.

## Mezery a dvojí penalizace

Z evolučního pohledu je pravděpodobnější vznik **mála delších mezer** než mnoha krátkých (jedna inzerce/delece často posune celý úsek). Lineární penalizace (cena $\propto$ délka) to nezohledňuje, proto se používá **afinní penalizace** se dvěma parametry: $\rho$ za *otevření* mezery a $\sigma$ za každé *rozšíření*. Celková cena mezery délky $x$ je:

::: math
\text{gap}(x) = -(\rho + \sigma \cdot x)
:::

Vysoké $\rho$ a malé $\sigma$ tedy preferuje jeden souvislý úsek mezer před roztříštěnými.

## Skórovací matice: PAM a BLOSUM

U proteinů nejsou všechny záměny stejně pravděpodobné — záměny mezi *chemicky podobnými* aminokyselinami (podobná hydrofobicita, náboj, velikost) jsou v přírodě běžnější a měly by být penalizovány méně. **Skórovací matice** přiřazuje skóre každé dvojici znaků; hodnoty jsou typicky **log-odds**: logaritmus poměru pozorované frekvence záměny k frekvenci očekávané náhodou. Kladné skóre = záměna častější, než by čekala náhoda.

- **PAM** (*Point Accepted Mutation*, Dayhoffová) — odvozena z pozorovaných substitucí u **blízce příbuzných** sekvencí; PAM-$k$ pro vyšší $k$ extrapoluje na větší evoluční vzdálenost. **Vyšší číslo = vzdálenější** sekvence (PAM-250 je běžný kompromis).
- **BLOSUM** (*BLOcks SUbstitution Matrix*, Henikoffovi) — odvozena **přímým počítáním** záměn v konzervovaných blocích zarovnaných proteinů. **Vyšší číslo = podobnější** sekvence (BLOSUM-62 = bloky s ~62 % identitou). BLOSUM-62 je výchozí matice v BLAST a dobře nachází i vzdálené homology.

Pozor na opačný směr číslování: pro **blízké** sekvence volíme **vysoký BLOSUM** (80) nebo **nízký PAM** (1); pro **vzdálené** **nízký BLOSUM** (45) nebo **vysoký PAM** (250).

::: quiz "BLOSUM-80 vs. BLOSUM-45 — kterou maticí zarovnáme dvě téměř totožné sekvence?"
- [x] BLOSUM-80 — vyšší číslo odpovídá vyšší podobnosti zarovnávaných bloků
  > U BLOSUM značí číslo % identity bloků, z nichž byla matice odvozena. Vyšší číslo = podobnější sekvence.
- [ ] BLOSUM-45 — vyšší číslo znamená větší evoluční vzdálenost
  > To platí pro PAM (vyšší číslo = vzdálenější), u BLOSUM je směr opačný.
- [ ] Je to jedno, matice se liší jen rozměrem
  > Obě jsou 20×20 (resp. s ambiguitními znaky); liší se hodnotami skóre.
:::

::: link "EMBL-EBI Training: Pairwise Sequence Alignment — dot plots & scoring" "https://www.ebi.ac.uk/training/online/courses/pairwise-sequence-alignment/"
:::

::: link "Substitution matrix (PAM, BLOSUM) — Wikipedia" "https://en.wikipedia.org/wiki/Substitution_matrix"
:::

*Zdroj: BIF státnicové okruhy NBIO, VUT FIT. Externí reference: EMBL-EBI Training — Pairwise Sequence Alignment; Wikipedia: Substitution matrix; Henikoff & Henikoff (1992) Amino acid substitution matrices from protein blocks, PNAS.*
